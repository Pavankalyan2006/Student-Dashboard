// server/execution/sqlWorker.cjs
// Worker thread that owns every student's SQL Lab database (real SQLite via sql.js / WebAssembly).
// Running student SQL here, not on the main thread, means a runaway query (for example an
// unbounded recursive CTE) can be stopped by terminating this worker without freezing the API.
// Plain CommonJS so it loads the same way under tsx, vitest and production.
'use strict';
const { parentPort } = require('worker_threads');
const initSqlJs = require('sql.js');

const MAX_PAGES = Number(process.env.SQL_LAB_MAX_PAGES) || 2560; // 2560 x 4 KB pages = 10 MB per database
const HEAP_LIMIT = Number(process.env.SQL_LAB_HEAP_BYTES) || 64 * 1024 * 1024;

let SQL = null;
const dbs = new Map(); // key -> Database

// Statements a student may not run. Everything else (DDL, DML, transactions, CTEs, window
// functions, EXPLAIN) is real SQLite behaviour.
const BLOCKED = /^(ATTACH|DETACH|VACUUM|PRAGMA|REINDEX)\b/i;
const ALLOWED_PRAGMA = /^PRAGMA\s+(table_info|table_xinfo|foreign_key_list|index_list|index_info|foreign_key_check)\s*\(/i;

function stripLeadingComments(sql) {
  let s = sql;
  for (;;) {
    s = s.replace(/^\s+/, '');
    if (s.startsWith('--')) {
      const nl = s.indexOf('\n');
      s = nl === -1 ? '' : s.slice(nl + 1);
    } else if (s.startsWith('/*')) {
      const end = s.indexOf('*/');
      s = end === -1 ? '' : s.slice(end + 2);
    } else return s;
  }
}

function configure(db) {
  db.exec(`PRAGMA foreign_keys = ON; PRAGMA max_page_count = ${MAX_PAGES}; PRAGMA hard_heap_limit = ${HEAP_LIMIT}; PRAGMA temp_store = MEMORY;`);
  return db;
}

function open(key, image) {
  if (image !== undefined && image !== null) {
    const old = dbs.get(key);
    if (old) old.close();
    dbs.set(key, configure(new SQL.Database(image ? Buffer.from(image, 'base64') : undefined)));
  }
  const db = dbs.get(key);
  if (!db) {
    const err = new Error('NOT_LOADED');
    err.code = 'NOT_LOADED';
    throw err;
  }
  return db;
}

function rollbackOpenTransaction(db) {
  try {
    db.exec('ROLLBACK');
    return true;
  } catch {
    return false; // no transaction was open
  }
}

function exportImage(db) {
  const bytes = db.export();
  // export() resets connection state, including pragmas, so apply them again.
  configure(db);
  return Buffer.from(bytes).toString('base64');
}

function totalChanges(db) {
  try {
    return db.exec('SELECT total_changes()')[0].values[0][0];
  } catch {
    return 0;
  }
}

function run(msg) {
  const db = open(msg.key, msg.image);
  const before = totalChanges(db);
  const maxRows = msg.maxRows || 500;
  const results = [];
  let changes = 0;
  let statements = 0;
  let truncated = false;
  let failedAt = null;
  try {
    if (msg.params) {
      // Internal, parameterised single statement built by the server.
      const stmt = db.prepare(msg.sql);
      try {
        stmt.bind(msg.params);
        const columns = stmt.getColumnNames();
        const rows = [];
        while (stmt.step()) {
          if (rows.length >= maxRows) { truncated = true; break; }
          rows.push(stmt.getAsObject());
        }
        results.push({ columns, rows });
      } finally {
        stmt.free();
      }
      statements = 1;
    } else {
      for (const stmt of db.iterateStatements(msg.sql)) {
        const text = stripLeadingComments(stmt.getSQL());
        statements++;
        try {
          if (msg.student && BLOCKED.test(text) && !ALLOWED_PRAGMA.test(text)) {
            const word = text.split(/\s+/)[0].toUpperCase();
            throw new Error(`${word} statements are disabled in the SQL Lab sandbox.`);
          }
          const columns = stmt.getColumnNames();
          const rows = [];
          while (stmt.step()) {
            if (rows.length >= maxRows) { truncated = true; break; }
            rows.push(stmt.getAsObject());
          }
          if (columns.length > 0) results.push({ columns, rows });
        } catch (e) {
          failedAt = statements;
          throw e;
        } finally {
          stmt.free();
        }
        if (statements > 50) throw new Error('At most 50 statements can run in one execution.');
      }
    }
  } catch (e) {
    const rolledBack = rollbackOpenTransaction(db);
    return { ok: false, error: e.message || String(e), failedAt, statements, rolledBack, image: msg.persist ? exportImage(db) : undefined };
  }
  changes = totalChanges(db) - before;
  const leftOpen = rollbackOpenTransaction(db);
  let lastId = null;
  try {
    lastId = db.exec('SELECT last_insert_rowid() AS id')[0].values[0][0];
  } catch {}
  return {
    ok: true,
    results,
    changes,
    statements,
    truncated,
    lastId,
    transactionRolledBack: leftOpen,
    image: msg.persist ? exportImage(db) : undefined,
  };
}

function introspect(msg) {
  const db = open(msg.key, msg.image);
  const q = (sql) => {
    const r = db.exec(sql);
    if (!r.length) return [];
    return r[0].values.map((v) => Object.fromEntries(r[0].columns.map((c, i) => [c, v[i]])));
  };
  const tables = q("SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name <> '_lab_meta' ORDER BY name");
  let meta = {};
  try {
    for (const m of q('SELECT table_name, description, created_at FROM _lab_meta')) meta[m.table_name] = m;
  } catch {}
  const quoted = (n) => '"' + String(n).replace(/"/g, '""') + '"';
  const out = tables.map((t) => {
    const info = q(`PRAGMA table_info(${quoted(t.name)})`);
    const fks = q(`PRAGMA foreign_key_list(${quoted(t.name)})`);
    const idx = q(`PRAGMA index_list(${quoted(t.name)})`);
    const indexes = idx.map((i) => ({
      name: i.name,
      is_unique: !!i.unique,
      origin: i.origin,
      columns: q(`PRAGMA index_info(${quoted(i.name)})`).map((c) => c.name),
    }));
    const count = q(`SELECT COUNT(*) AS n FROM ${quoted(t.name)}`)[0].n;
    const sample = q(`SELECT * FROM ${quoted(t.name)} LIMIT 10`);
    return { name: t.name, sql: t.sql, info, fks, indexes, count, sample, meta: meta[t.name] || null };
  });
  return { ok: true, tables: out };
}

parentPort.on('message', async (msg) => {
  try {
    if (!SQL) SQL = await initSqlJs();
    let result;
    if (msg.op === 'run') result = run(msg);
    else if (msg.op === 'introspect') result = introspect(msg);
    else if (msg.op === 'drop') {
      const db = dbs.get(msg.key);
      if (db) db.close();
      dbs.delete(msg.key);
      result = { ok: true };
    } else if (msg.op === 'ping') result = { ok: true };
    else result = { ok: false, error: 'unknown op' };
    parentPort.postMessage({ id: msg.id, ...result });
  } catch (e) {
    parentPort.postMessage({ id: msg.id, ok: false, error: e.message || String(e), code: e.code });
  }
});
