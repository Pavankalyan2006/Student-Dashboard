// server/services/sqlLabSandboxService.ts
// SQL Lab sandbox backed by real SQLite (sql.js, WebAssembly) running in a worker thread.
//
// Each student owns separate SQLite databases ("schemas"). Nothing is shared between students and
// nothing touches the platform's own data: the databases are in-memory images that only this
// service reads and writes, persisted through the JSON snapshot as base64.
//
// Limits: 3 s per execution (the worker is restarted if exceeded), 500 returned rows,
// 10 MB per database, 10 databases per student, 20 000 characters per query, 50 statements per run.
// ATTACH, DETACH, VACUUM, REINDEX and PRAGMA (except read-only introspection pragmas) are blocked.

import {
  SQLTableDefinition,
  SQLTableColumn,
  SQLForeignKeyConstraint,
  SQLExecutionResult,
  SQLQueryHistoryItem,
  TableDataFilter,
  TableDataResponse,
} from '../models/learningModulesTypes';
import { sqlEngine, WorkerReply } from '../execution/sqlEngine';

export const SQL_LAB_LIMITS = {
  maxRows: 500,
  maxDatabases: 10,
  maxQueryChars: 20000,
};

const SEED_SQL: Record<string, string> = {
  university_db: `
CREATE TABLE _lab_meta (table_name TEXT PRIMARY KEY, description TEXT, created_at TEXT);
CREATE TABLE departments (
  dept_id VARCHAR(10) PRIMARY KEY,
  dept_name VARCHAR(100) NOT NULL UNIQUE,
  building VARCHAR(50) DEFAULT 'Main Block',
  budget DECIMAL(12,2) NOT NULL DEFAULT 5000000.00
);
CREATE TABLE students (
  student_id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  branch VARCHAR(50) NOT NULL,
  dept_id VARCHAR(10) REFERENCES departments(dept_id) ON UPDATE CASCADE ON DELETE RESTRICT,
  semester INTEGER NOT NULL DEFAULT 5,
  cgpa DECIMAL(3,2) NOT NULL DEFAULT 7.50
);
CREATE TABLE courses (
  course_id VARCHAR(20) PRIMARY KEY,
  course_name VARCHAR(150) NOT NULL,
  dept_id VARCHAR(10) REFERENCES departments(dept_id) ON UPDATE CASCADE ON DELETE CASCADE,
  credits INTEGER NOT NULL DEFAULT 3
);
CREATE TABLE enrollments (
  enrollment_id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER REFERENCES students(student_id) ON UPDATE CASCADE ON DELETE CASCADE,
  course_id VARCHAR(20) REFERENCES courses(course_id) ON UPDATE CASCADE ON DELETE CASCADE,
  grade VARCHAR(5) DEFAULT 'A',
  score INTEGER DEFAULT 85
);
INSERT INTO departments VALUES
  ('CSE','Computer Science and Engineering','Turing Block',8500000.00),
  ('ECE','Electronics and Communication','Maxwell Block',7200000.00),
  ('IT','Information Technology','Shannon Block',6000000.00),
  ('MECH','Mechanical Engineering','Newton Block',5500000.00);
INSERT INTO students (student_id,name,email,branch,dept_id,semester,cgpa) VALUES
  (1,'Aarav Sharma','aarav.sharma@btech.edu','Computer Science','CSE',6,9.45),
  (2,'Diya Patel','diya.patel@btech.edu','Computer Science','CSE',6,9.12),
  (3,'Rohan Verma','rohan.verma@btech.edu','Electronics','ECE',4,8.40),
  (4,'Ananya Iyer','ananya.iyer@btech.edu','Information Tech','IT',6,8.85),
  (5,'Vikram Singh','vikram.singh@btech.edu','Mechanical','MECH',8,7.92);
INSERT INTO courses VALUES
  ('CS301','Database Management Systems','CSE',4),
  ('CS302','Design and Analysis of Algorithms','CSE',4),
  ('EC204','Signals and Systems','ECE',3),
  ('IT305','Cloud Computing Technologies','IT',3);
INSERT INTO enrollments (enrollment_id,student_id,course_id,grade,score) VALUES
  (1,1,'CS301','A+',96),(2,2,'CS301','A',88),(3,3,'EC204','B+',79),(4,4,'IT305','A',91);
INSERT INTO _lab_meta VALUES
  ('departments','Academic departments and faculties',NULL),
  ('students','Undergraduate engineering students (synthetic sample data)',NULL),
  ('courses','Semester core and elective courses',NULL),
  ('enrollments','Student course registrations and grades',NULL);`,
  ecommerce_db: `
CREATE TABLE _lab_meta (table_name TEXT PRIMARY KEY, description TEXT, created_at TEXT);
CREATE TABLE products (
  product_id INTEGER PRIMARY KEY AUTOINCREMENT,
  title VARCHAR(150) NOT NULL,
  category VARCHAR(50) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  stock_quantity INTEGER NOT NULL DEFAULT 100
);
INSERT INTO products (product_id,title,category,price,stock_quantity) VALUES
  (1,'Mechanical Keyboard RGB','Peripherals',4500.00,45),
  (2,'Ultra-wide 27-inch Monitor','Monitors',18999.00,20),
  (3,'Wireless Ergonomic Mouse','Peripherals',1850.00,80);
INSERT INTO _lab_meta VALUES ('products','Inventory items and catalogs',NULL);`,
};

const META_SQL = 'CREATE TABLE IF NOT EXISTS _lab_meta (table_name TEXT PRIMARY KEY, description TEXT, created_at TEXT);';

const qi = (name: string) => '"' + String(name).replace(/"/g, '""') + '"';
const IDENT = /^[a-z_][a-z0-9_]*$/i;

class SqlLabError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

export class SqlLabSandboxService {
  /** studentId -> dbName -> base64 SQLite image ('' = new empty database). Persisted. */
  private static studentDbImages: Map<string, Map<string, string>> = new Map();
  /** studentId -> query history (newest first, 50 max). Persisted. */
  private static queryHistories: Map<string, SQLQueryHistoryItem[]> = new Map();
  /** studentId -> saved queries. Persisted. */
  private static savedQueries: Map<string, Array<{ id: string; name: string; query: string; schema_name: string; created_at: string }>> = new Map();
  private static seeding = new Map<string, Promise<void>>();

  public static getSavedQueries(studentId: string) {
    return this.savedQueries.get(studentId) || [];
  }

  public static saveQuery(studentId: string, input: { name?: string; query?: string; schema_name?: string }) {
    const name = String(input?.name || '').trim();
    const query = String(input?.query || '').trim();
    if (!name) throw new SqlLabError('Give the query a name');
    if (name.length > 100) throw new SqlLabError('Name must be at most 100 characters');
    if (!query) throw new SqlLabError('Query cannot be empty');
    if (query.length > SQL_LAB_LIMITS.maxQueryChars) throw new SqlLabError('Query is too long');
    const list = this.savedQueries.get(studentId) || [];
    if (list.length >= 100) throw new SqlLabError('You can save at most 100 queries');
    const item = {
      id: `sq_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name,
      query,
      schema_name: String(input?.schema_name || 'university_db'),
      created_at: new Date().toISOString(),
    };
    this.savedQueries.set(studentId, [item, ...list]);
    return item;
  }

  public static deleteSavedQuery(studentId: string, id: string) {
    const list = this.savedQueries.get(studentId) || [];
    if (!list.some((q) => q.id === id)) throw new SqlLabError('Saved query not found', 404);
    this.savedQueries.set(studentId, list.filter((q) => q.id !== id));
    return { success: true };
  }

  private static key(studentId: string, dbName: string) {
    return `${studentId}::${dbName}`;
  }

  private static images(studentId: string): Map<string, string> {
    let m = this.studentDbImages.get(studentId);
    if (!m) {
      m = new Map();
      this.studentDbImages.set(studentId, m);
    }
    return m;
  }

  /** Creates the two sample databases the first time a student opens the lab. */
  public static async ensureStudentSandbox(studentId: string): Promise<Map<string, string>> {
    if (this.studentDbImages.has(studentId)) return this.studentDbImages.get(studentId)!;
    let pending = this.seeding.get(studentId);
    if (!pending) {
      pending = (async () => {
        const imgs = new Map<string, string>();
        for (const [name, sql] of Object.entries(SEED_SQL)) {
          const reply = await sqlEngine.request(this.key(studentId, name), '', { op: 'run', sql, persist: true }, 10000);
          if (!reply.ok) throw new SqlLabError(`Could not create sample database '${name}': ${reply.error}`, 500);
          imgs.set(name, reply.image);
        }
        this.studentDbImages.set(studentId, imgs);
      })().finally(() => this.seeding.delete(studentId));
      this.seeding.set(studentId, pending);
    }
    await pending;
    return this.studentDbImages.get(studentId)!;
  }

  private static async requireDb(studentId: string, dbName: string): Promise<string> {
    const dbs = await this.ensureStudentSandbox(studentId);
    if (!dbs.has(dbName)) throw new SqlLabError(`Database '${dbName}' does not exist in your sandbox`, 404);
    return dbs.get(dbName)!;
  }

  /** Runs SQL against one student database and stores the new image when asked. */
  private static async exec(
    studentId: string,
    dbName: string,
    sql: string,
    opts: { params?: any[]; student?: boolean; persist?: boolean; maxRows?: number } = {}
  ): Promise<WorkerReply> {
    const image = await this.requireDb(studentId, dbName);
    const reply = await sqlEngine.request(this.key(studentId, dbName), image, {
      op: 'run',
      sql,
      params: opts.params,
      student: !!opts.student,
      persist: opts.persist !== false,
      maxRows: opts.maxRows || SQL_LAB_LIMITS.maxRows,
    });
    if (typeof reply.image === 'string') this.images(studentId).set(dbName, reply.image);
    return reply;
  }

  private static async must(studentId: string, dbName: string, sql: string, params?: any[], persist = true): Promise<WorkerReply> {
    const r = await this.exec(studentId, dbName, sql, { params, persist });
    if (!r.ok) throw new SqlLabError(this.explainError(r.error || 'SQL error'));
    return r;
  }

  // -------------------------------------------------------------
  // Workspaces / schemas
  // -------------------------------------------------------------
  public static async getWorkspaces(studentId: string): Promise<Array<{ name: string; table_count: number }>> {
    const schemas = await this.getSchemas(studentId);
    return Object.entries(schemas).map(([name, tables]) => ({ name, table_count: tables.length }));
  }

  public static async createSchema(studentId: string, schemaName: string): Promise<{ success: boolean; message: string }> {
    const trimmed = (schemaName || '').trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
    if (!trimmed || !/[a-z0-9]/.test(trimmed)) throw new SqlLabError('Schema name must contain letters or digits');
    if (trimmed.length > 40) throw new SqlLabError('Schema name must be at most 40 characters');
    const dbs = await this.ensureStudentSandbox(studentId);
    if (dbs.has(trimmed)) throw new SqlLabError(`Schema '${trimmed}' already exists in your sandbox`, 409);
    if (dbs.size >= SQL_LAB_LIMITS.maxDatabases) throw new SqlLabError(`You can have at most ${SQL_LAB_LIMITS.maxDatabases} databases.`);
    dbs.set(trimmed, '');
    await this.must(studentId, trimmed, META_SQL);
    return { success: true, message: `Schema '${trimmed}' created successfully.` };
  }

  public static async deleteSchema(studentId: string, schemaName: string): Promise<{ success: boolean; message: string }> {
    const dbs = await this.ensureStudentSandbox(studentId);
    if (!dbs.has(schemaName)) throw new SqlLabError(`Database '${schemaName}' does not exist in your sandbox`, 404);
    dbs.delete(schemaName);
    sqlEngine.forget(this.key(studentId, schemaName));
    return { success: true, message: `Database '${schemaName}' deleted.` };
  }

  public static async getSchemas(studentId: string): Promise<Record<string, SQLTableDefinition[]>> {
    const dbs = await this.ensureStudentSandbox(studentId);
    const result: Record<string, SQLTableDefinition[]> = {};
    for (const name of dbs.keys()) result[name] = await this.getSchemaTables(studentId, name);
    return result;
  }

  public static async getSchemaTables(studentId: string, dbName: string): Promise<SQLTableDefinition[]> {
    const dbs = await this.ensureStudentSandbox(studentId);
    if (!dbs.has(dbName)) return [];
    const reply = await sqlEngine.request(this.key(studentId, dbName), dbs.get(dbName), { op: 'introspect' });
    if (!reply.ok) throw new SqlLabError(reply.error || 'Could not read the schema', 500);
    return (reply.tables as any[]).map((t) => this.toDefinition(dbName, t));
  }

  /** Converts SQLite catalog information into the shape the SQL Lab UI uses. */
  private static toDefinition(dbName: string, t: any): SQLTableDefinition {
    const fks: SQLForeignKeyConstraint[] = (t.fks || []).map((f: any) => ({
      source_column: f.from,
      referenced_table: f.table,
      referenced_column: f.to || '',
      on_update: f.on_update,
      on_delete: f.on_delete,
    }));
    const uniqueSingle = new Set<string>(
      (t.indexes || []).filter((i: any) => i.is_unique && i.origin === 'u' && i.columns.length === 1).map((i: any) => i.columns[0])
    );
    const pkCols = (t.info || []).filter((c: any) => c.pk > 0);
    const autoinc = /AUTOINCREMENT/i.test(t.sql || '');
    const columns: SQLTableColumn[] = (t.info || []).map((c: any) => {
      const m = String(c.type || '').match(/^([A-Za-z ]+?)\s*(?:\(([^)]*)\))?$/);
      const fk = fks.find((f) => f.source_column === c.name);
      let dflt = c.dflt_value;
      if (typeof dflt === 'string' && /^'.*'$/.test(dflt)) dflt = dflt.slice(1, -1).replace(/''/g, "'");
      return {
        name: c.name,
        type: (m ? m[1] : c.type || 'TEXT').toUpperCase().trim() || 'TEXT',
        length_precision: m && m[2] ? m[2].replace(/\s+/g, '') : undefined,
        is_nullable: !c.notnull && !(c.pk > 0),
        is_primary_key: c.pk > 0,
        is_unique: uniqueSingle.has(c.name),
        // An INTEGER PRIMARY KEY is SQLite's rowid alias and is assigned automatically.
        is_auto_increment: c.pk > 0 && pkCols.length === 1 && /^INTEGER$/i.test(c.type || '') ? true : autoinc && c.pk > 0,
        default_value: dflt === null || dflt === undefined ? undefined : String(dflt),
        is_foreign_key: !!fk,
        references: fk ? `${fk.referenced_table}(${fk.referenced_column})` : undefined,
        foreign_key: fk,
      };
    });
    return {
      name: t.name,
      schema_name: dbName,
      description: t.meta?.description || undefined,
      columns,
      foreign_keys: fks,
      indexes: (t.indexes || [])
        .filter((i: any) => i.origin === 'c')
        .map((i: any) => ({ name: i.name, columns: i.columns, is_unique: i.is_unique })),
      sample_rows: t.sample || [],
      row_count: t.count,
      create_sql: t.sql,
      created_at: t.meta?.created_at || undefined,
    } as SQLTableDefinition;
  }

  // -------------------------------------------------------------
  // Visual table designer
  // -------------------------------------------------------------
  /** SQLite DDL for a designer definition. Types are kept as written (SQLite accepts them). */
  public static generateCreateTableSql(tableDef: SQLTableDefinition): string {
    const tableName = String(tableDef?.name || '').trim().toLowerCase();
    const cols = tableDef?.columns || [];
    const pkCount = cols.filter((c) => c.is_primary_key).length;
    const lines = cols.map((col) => {
      const type = String(col.type || 'TEXT').toUpperCase().replace(/[^A-Z ]/g, '');
      const lp = col.length_precision ? String(col.length_precision).replace(/[^0-9,]/g, '') : '';
      const auto = col.is_auto_increment && col.is_primary_key && pkCount === 1;
      // SQLite only auto-increments an "INTEGER PRIMARY KEY" column.
      let line = `  ${qi(col.name.trim().toLowerCase())} ${auto ? 'INTEGER' : type}${!auto && lp ? `(${lp})` : ''}`;
      if (col.is_primary_key && pkCount === 1) line += auto ? ' PRIMARY KEY AUTOINCREMENT' : ' PRIMARY KEY';
      if (!col.is_nullable && !col.is_primary_key) line += ' NOT NULL';
      if (col.is_unique && !col.is_primary_key) line += ' UNIQUE';
      if (col.default_value !== undefined && col.default_value !== null && col.default_value !== '') {
        const v = String(col.default_value);
        line += ` DEFAULT ${/^-?\d+(\.\d+)?$/.test(v) ? v : `'${v.replace(/'/g, "''")}'`}`;
      }
      if (col.check_constraint) line += ` CHECK (${col.check_constraint})`;
      return line;
    });
    if (pkCount > 1) {
      lines.push(`  PRIMARY KEY (${cols.filter((c) => c.is_primary_key).map((c) => qi(c.name.trim().toLowerCase())).join(', ')})`);
    }
    const fks = [
      ...(tableDef?.foreign_keys || []),
      ...cols.filter((c) => c.foreign_key && !(tableDef?.foreign_keys || []).some((f) => f.source_column === c.name)).map((c) => ({ ...c.foreign_key!, source_column: c.name })),
    ];
    for (const fk of fks) {
      let l = `  FOREIGN KEY (${qi(fk.source_column.toLowerCase())}) REFERENCES ${qi(fk.referenced_table.toLowerCase())} (${qi(fk.referenced_column.toLowerCase())})`;
      if (fk.on_delete) l += ` ON DELETE ${fk.on_delete}`;
      if (fk.on_update) l += ` ON UPDATE ${fk.on_update}`;
      lines.push(l);
    }
    return `CREATE TABLE ${qi(tableName)} (\n${lines.join(',\n')}\n);`;
  }

  public static async createTable(
    studentId: string,
    dbName: string,
    tableDef: SQLTableDefinition
  ): Promise<{ success: boolean; generated_sql: string; table: SQLTableDefinition }> {
    const dbs = await this.ensureStudentSandbox(studentId);
    if (!dbs.has(dbName)) await this.createSchema(studentId, dbName);
    const tableName = String(tableDef?.name || '').trim().toLowerCase();
    if (!tableName || !/^[a-z0-9_]+$/.test(tableName) || tableName.startsWith('sqlite_') || tableName === '_lab_meta') {
      throw new SqlLabError('Table name must contain only lowercase letters, digits and underscores');
    }
    if (!tableDef.columns || tableDef.columns.length === 0) throw new SqlLabError('Table must have at least one column');
    const names = new Set<string>();
    for (const c of tableDef.columns) {
      const n = String(c.name || '').trim().toLowerCase();
      if (!n) throw new SqlLabError('Column name cannot be empty');
      if (!IDENT.test(n)) throw new SqlLabError(`Column name '${c.name}' must start with a letter and use only letters, digits and underscores`);
      if (names.has(n)) throw new SqlLabError(`Duplicate column name '${n}' in table definition`);
      names.add(n);
    }
    for (const fk of tableDef.foreign_keys || []) {
      if (!names.has(String(fk.source_column).toLowerCase())) {
        throw new SqlLabError(`Foreign key source column '${fk.source_column}' does not exist in table definition`);
      }
    }
    const existing = await this.getSchemaTables(studentId, dbName);
    if (existing.some((t) => t.name === tableName)) throw new SqlLabError(`Table '${tableName}' already exists in database '${dbName}'`, 409);
    for (const fk of tableDef.foreign_keys || []) {
      const ref = existing.find((t) => t.name === fk.referenced_table.toLowerCase());
      if (!ref) throw new SqlLabError(`Referenced table '${fk.referenced_table}' does not exist in schema '${dbName}'`);
      if (!ref.columns.some((c) => c.name === fk.referenced_column.toLowerCase())) {
        throw new SqlLabError(`Referenced column '${fk.referenced_column}' does not exist in table '${fk.referenced_table}'`);
      }
    }
    const generatedSql = this.generateCreateTableSql(tableDef);
    const t0 = Date.now();
    await this.must(
      studentId,
      dbName,
      `${META_SQL}\n${generatedSql}\nINSERT OR REPLACE INTO _lab_meta VALUES (${this.lit(tableName)}, ${this.lit(tableDef.description || '')}, ${this.lit(new Date().toISOString())});`
    );
    this.recordQueryHistory(studentId, dbName, generatedSql, true, Date.now() - t0, 0);
    const table = (await this.getSchemaTables(studentId, dbName)).find((t) => t.name === tableName)!;
    return { success: true, generated_sql: generatedSql, table };
  }

  private static lit(v: string): string {
    return `'${String(v).replace(/'/g, "''")}'`;
  }

  public static async dropTable(studentId: string, dbName: string, tableName: string): Promise<{ success: boolean; message: string }> {
    const tables = await this.getSchemaTables(studentId, dbName);
    if (!tables.some((t) => t.name === tableName)) throw new SqlLabError(`Table '${tableName}' does not exist in database '${dbName}'`, 404);
    const sql = `DROP TABLE ${qi(tableName)};`;
    const t0 = Date.now();
    const r = await this.exec(studentId, dbName, `${sql} DELETE FROM _lab_meta WHERE table_name = ${this.lit(tableName)};`);
    if (!r.ok) {
      this.recordQueryHistory(studentId, dbName, sql, false, Date.now() - t0, 0, r.error);
      throw new SqlLabError(`Cannot drop table '${tableName}': ${this.explainError(r.error || '')}`);
    }
    this.recordQueryHistory(studentId, dbName, sql, true, Date.now() - t0, 0);
    return { success: true, message: `Table '${tableName}' dropped successfully.` };
  }

  // -------------------------------------------------------------
  // Table data (pagination, search, sorting, row CRUD, sample data)
  // -------------------------------------------------------------
  private static async tableDef(studentId: string, dbName: string, tableName: string): Promise<SQLTableDefinition> {
    const t = (await this.getSchemaTables(studentId, dbName)).find((x) => x.name === tableName);
    if (!t) throw new SqlLabError(`Table '${tableName}' not found in database '${dbName}'`, 404);
    return t;
  }

  public static async getTableData(studentId: string, dbName: string, tableName: string, filter: TableDataFilter = {}): Promise<TableDataResponse> {
    const def = await this.tableDef(studentId, dbName, tableName);
    const limit = Math.max(1, Math.min(100, Number(filter.limit) || 20));
    const page = Math.max(1, Number(filter.page) || 1);
    const params: any[] = [];
    let where = '';
    if (filter.search && filter.search.trim()) {
      const q = `%${filter.search.trim().toLowerCase()}%`;
      where = ' WHERE ' + def.columns.map((c) => `LOWER(CAST(${qi(c.name)} AS TEXT)) LIKE ?`).join(' OR ');
      def.columns.forEach(() => params.push(q));
    }
    const sortCol = filter.sort_by && def.columns.some((c) => c.name === filter.sort_by) ? filter.sort_by : null;
    const order = sortCol ? ` ORDER BY ${qi(sortCol)} ${filter.sort_dir === 'DESC' ? 'DESC' : 'ASC'}` : ' ORDER BY rowid';
    const countR = await this.must(studentId, dbName, `SELECT COUNT(*) AS n FROM ${qi(tableName)}${where}`, params, false);
    const total = Number(countR.results[0]?.rows[0]?.n || 0);
    const rowsR = await this.must(
      studentId,
      dbName,
      `SELECT * FROM ${qi(tableName)}${where}${order} LIMIT ${limit} OFFSET ${(page - 1) * limit}`,
      params,
      false
    );
    return {
      table_name: tableName,
      columns: def.columns,
      rows: rowsR.results[0]?.rows || [],
      total_rows: total,
      page,
      limit,
      total_pages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  private static coerce(col: SQLTableColumn, val: any): any {
    if (val === undefined || val === '') return undefined;
    if (val === null) return null;
    const t = col.type.toUpperCase();
    if (/INT/.test(t)) {
      const n = Number(val);
      if (!Number.isInteger(n)) throw new SqlLabError(`Invalid integer value '${val}' for column '${col.name}'`);
      return n;
    }
    if (/DEC|NUM|REAL|FLOA|DOUB/.test(t)) {
      const n = Number(val);
      if (!Number.isFinite(n)) throw new SqlLabError(`Invalid numeric value '${val}' for column '${col.name}'`);
      return n;
    }
    if (/BOOL/.test(t)) return val === true || val === 'true' || val === 1 || val === '1' ? 1 : 0;
    return String(val);
  }

  public static async insertRow(
    studentId: string,
    dbName: string,
    tableName: string,
    rowData: Record<string, any>
  ): Promise<{ success: boolean; inserted_row: Record<string, any> }> {
    const def = await this.tableDef(studentId, dbName, tableName);
    const cols: string[] = [];
    const vals: any[] = [];
    for (const c of def.columns) {
      const v = this.coerce(c, rowData?.[c.name]);
      if (v === undefined) continue; // let SQLite apply DEFAULT / AUTOINCREMENT / NOT NULL
      cols.push(c.name);
      vals.push(v);
    }
    const sql = cols.length
      ? `INSERT INTO ${qi(tableName)} (${cols.map(qi).join(', ')}) VALUES (${cols.map(() => '?').join(', ')}) RETURNING *`
      : `INSERT INTO ${qi(tableName)} DEFAULT VALUES RETURNING *`;
    const t0 = Date.now();
    const r = await this.exec(studentId, dbName, sql, { params: vals });
    const shown = `INSERT INTO ${qi(tableName)} (${cols.join(', ')}) VALUES (${vals.map((v) => (typeof v === 'string' ? this.lit(v) : v === null ? 'NULL' : v)).join(', ')});`;
    if (!r.ok) {
      this.recordQueryHistory(studentId, dbName, shown, false, Date.now() - t0, 0, r.error);
      throw new SqlLabError(this.explainError(r.error || ''));
    }
    this.recordQueryHistory(studentId, dbName, shown, true, Date.now() - t0, 1);
    return { success: true, inserted_row: r.results[0]?.rows[0] || {} };
  }

  public static async updateRow(
    studentId: string,
    dbName: string,
    tableName: string,
    primaryKeyVal: any,
    updatedFields: Record<string, any>
  ): Promise<{ success: boolean; updated_row: Record<string, any> }> {
    const def = await this.tableDef(studentId, dbName, tableName);
    const pk = def.columns.find((c) => c.is_primary_key);
    if (!pk) throw new SqlLabError(`Table '${tableName}' does not have a primary key column`);
    const sets: string[] = [];
    const vals: any[] = [];
    for (const c of def.columns) {
      if (!updatedFields || !(c.name in updatedFields)) continue;
      const raw = updatedFields[c.name];
      const v = raw === '' ? null : this.coerce(c, raw);
      sets.push(`${qi(c.name)} = ?`);
      vals.push(v === undefined ? null : v);
    }
    if (!sets.length) throw new SqlLabError('No columns to update');
    const t0 = Date.now();
    const r = await this.exec(studentId, dbName, `UPDATE ${qi(tableName)} SET ${sets.join(', ')} WHERE ${qi(pk.name)} = ? RETURNING *`, {
      params: [...vals, this.coerce(pk, primaryKeyVal) ?? primaryKeyVal],
    });
    const shown = `UPDATE ${qi(tableName)} SET ${sets.length} column(s) WHERE ${pk.name} = ${this.lit(String(primaryKeyVal))};`;
    if (!r.ok) {
      this.recordQueryHistory(studentId, dbName, shown, false, Date.now() - t0, 0, r.error);
      throw new SqlLabError(this.explainError(r.error || ''));
    }
    const row = r.results[0]?.rows[0];
    if (!row) throw new SqlLabError(`Row with ${pk.name}='${primaryKeyVal}' not found`, 404);
    this.recordQueryHistory(studentId, dbName, shown, true, Date.now() - t0, 1);
    return { success: true, updated_row: row };
  }

  public static async deleteRow(studentId: string, dbName: string, tableName: string, primaryKeyVal: any): Promise<{ success: boolean; message: string }> {
    const def = await this.tableDef(studentId, dbName, tableName);
    const pk = def.columns.find((c) => c.is_primary_key);
    if (!pk) throw new SqlLabError(`Table '${tableName}' does not have a primary key column`);
    const t0 = Date.now();
    const shown = `DELETE FROM ${qi(tableName)} WHERE ${pk.name} = ${this.lit(String(primaryKeyVal))};`;
    const r = await this.exec(studentId, dbName, `DELETE FROM ${qi(tableName)} WHERE ${qi(pk.name)} = ?`, {
      params: [this.coerce(pk, primaryKeyVal) ?? primaryKeyVal],
    });
    if (!r.ok) {
      this.recordQueryHistory(studentId, dbName, shown, false, Date.now() - t0, 0, r.error);
      throw new SqlLabError(this.explainError(r.error || ''));
    }
    if (!r.changes) throw new SqlLabError(`Row with ${pk.name}='${primaryKeyVal}' not found`, 404);
    this.recordQueryHistory(studentId, dbName, shown, true, Date.now() - t0, r.changes);
    return { success: true, message: 'Row deleted successfully.' };
  }

  /** Inserts synthetic rows (clearly sample data) that satisfy the table's types and foreign keys. */
  public static async generateSampleRows(studentId: string, dbName: string, tableName: string, count = 3): Promise<{ success: boolean; generated_count: number }> {
    const def = await this.tableDef(studentId, dbName, tableName);
    const n = Math.max(1, Math.min(50, Number(count) || 3));
    const names = ['Siddharth Rao', 'Pooja Hegde', 'Kiran Kumar', 'Riya Sen', 'Arjun Das', 'Meera Nair'];
    let added = 0;
    const errors: string[] = [];
    for (let i = 0; i < n; i++) {
      const row: Record<string, any> = {};
      for (const col of def.columns) {
        const t = col.type.toUpperCase();
        if (col.is_auto_increment) continue;
        if (col.foreign_key) {
          const ref = await this.exec(studentId, dbName, `SELECT ${qi(col.foreign_key.referenced_column)} AS v FROM ${qi(col.foreign_key.referenced_table)} ORDER BY RANDOM() LIMIT 1`, { params: [], persist: false });
          row[col.name] = ref.ok ? ref.results[0]?.rows[0]?.v ?? null : null;
        } else if (/INT/.test(t)) row[col.name] = col.is_primary_key || col.is_unique ? Date.now() % 1e6 + i * 7 + Math.floor(Math.random() * 1000) : Math.floor(Math.random() * 50) + 1;
        else if (/DEC|NUM|REAL|FLOA|DOUB/.test(t)) row[col.name] = Number((Math.random() * 5 + 5).toFixed(2));
        else if (/BOOL/.test(t)) row[col.name] = Math.random() > 0.5 ? 1 : 0;
        else if (/DATE|TIME/.test(t)) row[col.name] = new Date(Date.now() - i * 864e5).toISOString().slice(0, 10);
        else if (/email/i.test(col.name)) row[col.name] = `sample_${Date.now()}_${i}@example.test`;
        else if (/name/i.test(col.name)) row[col.name] = names[(i + Math.floor(Math.random() * names.length)) % names.length];
        else row[col.name] = `Sample ${col.name} ${Date.now() % 100000}-${i}`;
        if (col.length_precision && typeof row[col.name] === 'string') {
          const len = Number(String(col.length_precision).split(',')[0]);
          if (len > 0) row[col.name] = row[col.name].slice(0, len);
        }
      }
      try {
        await this.insertRow(studentId, dbName, tableName, row);
        added++;
      } catch (e: any) {
        errors.push(e.message);
      }
    }
    if (!added) throw new SqlLabError(`No sample rows could be inserted: ${errors[0] || 'unknown error'}`);
    return { success: true, generated_count: added };
  }

  // -------------------------------------------------------------
  // Student SQL execution
  // -------------------------------------------------------------
  public static async executeSandboxedSql(studentId: string, dbName: string, query: string): Promise<SQLExecutionResult> {
    const startTime = Date.now();
    const trimmed = (query || '').trim();
    const fail = (error: string): SQLExecutionResult => {
      const duration = Date.now() - startTime;
      this.recordQueryHistory(studentId, dbName, trimmed || '(empty)', false, duration, 0, error);
      return { success: false, columns: [], rows: [], row_count: 0, execution_time_ms: duration, error };
    };
    if (!trimmed) return fail('SQL query cannot be empty');
    if (trimmed.length > SQL_LAB_LIMITS.maxQueryChars) return fail(`Query is longer than ${SQL_LAB_LIMITS.maxQueryChars} characters.`);
    if (/^\s*(CREATE|DROP)\s+DATABASE\b/i.test(trimmed)) {
      return fail('Use the "New database" button to create databases; CREATE/DROP DATABASE is not SQLite syntax.');
    }

    const dbs = await this.ensureStudentSandbox(studentId);
    if (!dbs.has(dbName)) return fail(`Database '${dbName}' does not exist in your sandbox`);

    const r = await this.exec(studentId, dbName, trimmed, { student: true });
    const duration = Date.now() - startTime;
    if (!r.ok) {
      const msg = this.explainError(r.error || 'SQL error');
      const where = r.failedAt && r.statements > 1 ? ` (statement ${r.failedAt}; earlier statements were applied)` : '';
      this.recordQueryHistory(studentId, dbName, trimmed, false, duration, 0, msg);
      return { success: false, columns: [], rows: [], row_count: 0, execution_time_ms: duration, error: msg + where };
    }
    const last = r.results[r.results.length - 1];
    const rows = last?.rows || [];
    const notes: string[] = [];
    if (r.truncated) notes.push(`Only the first ${SQL_LAB_LIMITS.maxRows} rows are shown.`);
    if (r.transactionRolledBack) notes.push('A transaction was left open at the end of the run and was rolled back; finish transactions with COMMIT in the same run.');
    const explanation = last
      ? `${rows.length} row(s) returned${r.statements > 1 ? ` by the last of ${r.statements} statements` : ''}.`
      : `${r.statements} statement(s) executed; ${r.changes} row(s) changed.`;
    this.recordQueryHistory(studentId, dbName, trimmed, true, duration, last ? rows.length : r.changes);
    return {
      success: true,
      columns: last?.columns || [],
      rows,
      row_count: rows.length,
      affected_rows: r.changes,
      execution_time_ms: duration,
      explanation: [explanation, ...notes].join(' '),
      truncated: !!r.truncated,
      engine: 'SQLite (sql.js)',
    } as SQLExecutionResult;
  }

  /** Adds a plain-language hint to common SQLite error messages. */
  public static explainError(err: string): string {
    const e = err || 'SQL error';
    if (/no such table: (\S+)/i.test(e)) return `${e}. Check the table name in the schema browser.`;
    if (/no such column: (\S+)/i.test(e)) return `${e}. Check the column name and the table alias.`;
    if (/FOREIGN KEY constraint failed/i.test(e)) return `${e}: the value must exist in the referenced table, and a referenced row cannot be removed while rows still point to it.`;
    if (/UNIQUE constraint failed: (\S+)/i.test(e)) return `${e}: another row already has this value.`;
    if (/NOT NULL constraint failed: (\S+)/i.test(e)) return `${e}: this column needs a value.`;
    if (/syntax error/i.test(e)) return `${e}. Check commas, quotes and keyword order near the reported token.`;
    if (/database or disk is full/i.test(e)) return 'This database reached its 10 MB size limit.';
    return e;
  }

  // -------------------------------------------------------------
  // Query history
  // -------------------------------------------------------------
  public static recordQueryHistory(studentId: string, schemaName: string, query: string, success: boolean, durationMs: number, rowCount?: number, error?: string) {
    if (!this.queryHistories.has(studentId)) this.queryHistories.set(studentId, []);
    const history = this.queryHistories.get(studentId)!;
    history.unshift({
      id: `qh_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      student_id: studentId,
      schema_name: schemaName,
      query: query.slice(0, 5000),
      success,
      duration_ms: durationMs,
      row_count: rowCount,
      error,
      executed_at: new Date().toISOString(),
    });
    if (history.length > 50) history.pop();
  }

  public static getQueryHistory(studentId: string, schemaName?: string): SQLQueryHistoryItem[] {
    const history = this.queryHistories.get(studentId) || [];
    return schemaName ? history.filter((h) => h.schema_name === schemaName) : history;
  }
}
