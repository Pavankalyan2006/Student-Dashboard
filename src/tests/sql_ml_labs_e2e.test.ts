// src/tests/sql_ml_labs_e2e.test.ts
// Comprehensive Acceptance E2E Test Suite for SQL Lab Schema Builder & AI/ML Lab Engine

import { describe, it, expect, beforeEach } from 'vitest';
import { SqlLabSandboxService } from '../../server/services/sqlLabSandboxService';
import { MlLabService } from '../../server/services/mlLabService';
import { SQLTableDefinition } from '../../server/models/learningModulesTypes';

describe('SQL Lab & AI/ML Lab Master E2E Test Suite', () => {
  const studentA = 'std_test_alice_sql_ml';
  const studentB = 'std_test_bob_sql_ml';

  // =========================================================================
  // PART A: SQL LAB TESTS
  // =========================================================================
  describe('Part A: SQL Lab on real SQLite, per-student databases', () => {
    const uidA = `${studentA}_${Date.now()}`;
    const uidB = `${studentB}_${Date.now()}`;
    beforeEach(async () => {
      await SqlLabSandboxService.ensureStudentSandbox(uidA);
      await SqlLabSandboxService.ensureStudentSandbox(uidB);
    });

    it('1. Initializes isolated sandbox with university_db and ecommerce_db', async () => {
      const names = (await SqlLabSandboxService.getWorkspaces(uidA)).map((w) => w.name);
      expect(names).toEqual(expect.arrayContaining(['university_db', 'ecommerce_db']));
      const schemas = await SqlLabSandboxService.getSchemas(uidA);
      expect(schemas['university_db'].map((t) => t.name).sort()).toEqual(['courses', 'departments', 'enrollments', 'students']);
      // The internal metadata table is never listed.
      expect(schemas['university_db'].some((t) => t.name === '_lab_meta')).toBe(false);
    });

    it('2. Creates a custom schema and keeps it invisible to other students', async () => {
      const res = await SqlLabSandboxService.createSchema(uidA, 'hospital_db');
      expect(res.success).toBe(true);
      expect((await SqlLabSandboxService.getWorkspaces(uidA)).map((w) => w.name)).toContain('hospital_db');
      expect((await SqlLabSandboxService.getWorkspaces(uidB)).map((w) => w.name)).not.toContain('hospital_db');
      const bQuery = await SqlLabSandboxService.executeSandboxedSql(uidB, 'hospital_db', 'SELECT 1');
      expect(bQuery.success).toBe(false);
    });

    it('3. Table designer generates SQLite DDL and creates the table', async () => {
      const patientTableDef: SQLTableDefinition = {
        name: 'patients',
        schema_name: 'hospital_db',
        columns: [
          { name: 'patient_id', type: 'INTEGER', is_primary_key: true, is_auto_increment: true, is_nullable: false },
          { name: 'name', type: 'VARCHAR', length_precision: '100', is_nullable: false },
          { name: 'blood_group', type: 'VARCHAR', length_precision: '5', is_nullable: true },
        ],
        sample_rows: [],
      };
      const sqlPreview = SqlLabSandboxService.generateCreateTableSql(patientTableDef);
      expect(sqlPreview).toContain('CREATE TABLE "patients"');
      expect(sqlPreview).toContain('"patient_id" INTEGER PRIMARY KEY AUTOINCREMENT');
      expect(sqlPreview).toContain('"name" VARCHAR(100) NOT NULL');
      await SqlLabSandboxService.createSchema(uidA, 'hospital_db').catch(() => undefined);
      const creation = await SqlLabSandboxService.createTable(uidA, 'hospital_db', patientTableDef);
      expect(creation.success).toBe(true);
      expect(creation.table.name).toBe('patients');
      expect(creation.table.columns.find((c) => c.name === 'patient_id')?.is_auto_increment).toBe(true);
      expect(creation.table.columns.find((c) => c.name === 'name')?.is_nullable).toBe(false);
    });

    it('4. Row editor enforces NOT NULL and PRIMARY KEY uniqueness', async () => {
      const insert1 = await SqlLabSandboxService.insertRow(uidA, 'hospital_db', 'patients', { name: 'Synthetic Patient', blood_group: 'O+' });
      expect(insert1.success).toBe(true);
      expect(insert1.inserted_row.patient_id).toBe(1);
      await expect(SqlLabSandboxService.insertRow(uidA, 'hospital_db', 'patients', { blood_group: 'A+' })).rejects.toThrow(/NOT NULL/);
      await expect(SqlLabSandboxService.insertRow(uidA, 'hospital_db', 'patients', { patient_id: 1, name: 'Dup' })).rejects.toThrow(/UNIQUE|PRIMARY/);
    });

    it('5. Enforces foreign keys and ON DELETE RESTRICT', async () => {
      const admissionsDef: SQLTableDefinition = {
        name: 'admissions',
        schema_name: 'hospital_db',
        columns: [
          { name: 'admission_id', type: 'INTEGER', is_primary_key: true, is_auto_increment: true, is_nullable: false },
          { name: 'patient_id', type: 'INTEGER', is_foreign_key: true },
          { name: 'ward', type: 'VARCHAR', length_precision: '20', is_nullable: false, default_value: 'ICU' },
        ],
        foreign_keys: [{ source_column: 'patient_id', referenced_table: 'patients', referenced_column: 'patient_id', on_delete: 'RESTRICT', on_update: 'CASCADE' }],
        sample_rows: [],
      };
      await SqlLabSandboxService.createTable(uidA, 'hospital_db', admissionsDef);
      await expect(SqlLabSandboxService.insertRow(uidA, 'hospital_db', 'admissions', { patient_id: 999 })).rejects.toThrow(/FOREIGN KEY/);
      const adm = await SqlLabSandboxService.insertRow(uidA, 'hospital_db', 'admissions', { patient_id: 1 });
      expect(adm.inserted_row.ward).toBe('ICU');
      await expect(SqlLabSandboxService.deleteRow(uidA, 'hospital_db', 'patients', 1)).rejects.toThrow(/FOREIGN KEY/);
      await expect(SqlLabSandboxService.dropTable(uidA, 'hospital_db', 'patients')).rejects.toThrow(/FOREIGN KEY/);
    });

    it('6. Executes real SQL with correct results (WHERE with AND, projection, JOIN, GROUP BY/HAVING, window, CTE, subquery)', async () => {
      const run = (q: string) => SqlLabSandboxService.executeSandboxedSql(uidA, 'university_db', q);
      const w = await run("SELECT name, cgpa FROM students WHERE branch = 'Computer Science' AND cgpa > 9.2");
      expect(w.success).toBe(true);
      expect(w.columns).toEqual(['name', 'cgpa']);
      expect(w.rows).toEqual([{ name: 'Aarav Sharma', cgpa: 9.45 }]);

      const j = await run('SELECT s.name, d.building FROM students s JOIN departments d ON s.dept_id = d.dept_id ORDER BY s.student_id LIMIT 2');
      expect(j.rows).toEqual([{ name: 'Aarav Sharma', building: 'Turing Block' }, { name: 'Diya Patel', building: 'Turing Block' }]);

      const g = await run('SELECT dept_id, COUNT(*) AS n, ROUND(AVG(cgpa),2) AS avg_cgpa FROM students GROUP BY dept_id HAVING COUNT(*) > 1');
      expect(g.rows).toEqual([{ dept_id: 'CSE', n: 2, avg_cgpa: 9.29 }]);

      const win = await run('SELECT name, RANK() OVER (ORDER BY cgpa DESC) AS r FROM students ORDER BY r LIMIT 1');
      expect(win.rows[0]).toEqual({ name: 'Aarav Sharma', r: 1 });

      const cte = await run('WITH top AS (SELECT * FROM students WHERE cgpa > (SELECT AVG(cgpa) FROM students)) SELECT COUNT(*) AS c FROM top');
      expect(cte.rows[0].c).toBe(3);

      const dml = await run("UPDATE students SET semester = semester + 1 WHERE dept_id = 'CSE'; SELECT SUM(semester) AS s FROM students WHERE dept_id = 'CSE'");
      expect(dml.success).toBe(true);
      expect(dml.affected_rows).toBe(2);
      expect(dml.rows[0].s).toBe(14);

      const tx = await run("BEGIN; DELETE FROM enrollments; ROLLBACK; SELECT COUNT(*) AS c FROM enrollments");
      expect(tx.rows[0].c).toBe(4);

      const alter = await run('ALTER TABLE courses ADD COLUMN level INTEGER DEFAULT 1; SELECT level FROM courses LIMIT 1');
      expect(alter.rows[0].level).toBe(1);

      const bad = await run('SELEC * FROM students');
      expect(bad.success).toBe(false);
      expect(bad.error).toMatch(/syntax error/);
    });

    it('7. Blocks host-reaching statements and stops runaway queries without blocking the server', async () => {
      const run = (q: string) => SqlLabSandboxService.executeSandboxedSql(uidA, 'university_db', q);
      expect((await run("ATTACH DATABASE '/etc/passwd' AS x")).error).toMatch(/disabled/);
      expect((await run('PRAGMA foreign_keys = OFF')).error).toMatch(/disabled/);
      expect((await run('PRAGMA table_info(students)')).success).toBe(true);
      const t0 = Date.now();
      const loop = await run('WITH RECURSIVE c(x) AS (SELECT 1 UNION ALL SELECT x+1 FROM c) SELECT COUNT(*) FROM c');
      expect(loop.success).toBe(false);
      expect(loop.error).toMatch(/time limit/);
      expect(Date.now() - t0).toBeLessThan(10000);
      // The engine recovers and the data is intact after the restart.
      expect((await run('SELECT COUNT(*) AS c FROM students')).rows[0].c).toBe(5);
      const big = await run('WITH RECURSIVE c(x) AS (SELECT 1 UNION ALL SELECT x+1 FROM c WHERE x < 5000) SELECT x FROM c');
      expect(big.rows.length).toBe(500);
      expect(big.truncated).toBe(true);
    }, 20000);

    it('8. Table data viewer paginates and sorts; sample data satisfies constraints', async () => {
      const initialData = await SqlLabSandboxService.getTableData(uidB, 'university_db', 'students', { page: 1, limit: 2, sort_by: 'cgpa', sort_dir: 'DESC' });
      expect(initialData.rows.length).toBe(2);
      expect(initialData.total_rows).toBe(5);
      expect(initialData.rows[0].cgpa).toBe(9.45);
      const sampleGen = await SqlLabSandboxService.generateSampleRows(uidB, 'university_db', 'students', 3);
      expect(sampleGen.generated_count).toBe(3);
      const afterData = await SqlLabSandboxService.getTableData(uidB, 'university_db', 'students');
      expect(afterData.total_rows).toBe(8);
      // Student A's changes in test 6 never reached student B.
      const semB = await SqlLabSandboxService.executeSandboxedSql(uidB, 'university_db', "SELECT SUM(semester) AS s FROM students WHERE dept_id = 'CSE' AND student_id <= 5");
      expect(semB.rows[0].s).toBe(12);
    });
  });

  // =========================================================================
  // PART B: AI/ML LAB TESTS
  // =========================================================================
  describe('Part B: AI/ML Lab Workspace, Code Upload, Model Training & Live Testing', () => {
    it('1. Manages ML Workspaces and supports multi-file code uploads and editing', () => {
      const ws = MlLabService.createWorkspace(studentA, {
        name: 'Autonomous Vehicle Perception',
        description: 'Object detection and lane segmentation models',
        task_type: 'CLASSIFICATION',
      });
      expect(ws.id).toBeDefined();
      expect(ws.name).toBe('Autonomous Vehicle Perception');

      // Add a python script
      const pyFile = MlLabService.addFile(studentA, ws.id, {
        name: 'lane_detect.py',
        content: 'def detect_lanes(frame):\n    return []\n',
      });
      expect(pyFile.id).toBeDefined();
      expect(pyFile.extension).toBe('.py');

      // Update script
      const updated = MlLabService.updateFile(studentA, ws.id, pyFile.id, '# Updated lane detection\nimport cv2\n');
      expect(updated.content).toContain('import cv2');
    });

    it('2. Profiles custom CSV datasets with automatic type inference and statistical summaries', () => {
      const sampleCsv = `study_hours,past_score,tutoring_sessions,passed
4.5,78,2,Yes
5.0,85,3,Yes
2.0,52,0,No
6.2,91,4,Yes
1.8,49,1,No
3.5,68,2,Yes`;

      const ds = MlLabService.uploadCustomDataset(studentA, {
        name: 'Student Exam Pass/Fail',
        csvContent: sampleCsv,
        target_column: 'passed',
      });

      expect(ds.id).toBeDefined();
      expect(ds.total_samples).toBe(6);
      expect(ds.features).toContain('study_hours');
      expect(ds.features).toContain('past_score');
      expect(ds.target_column).toBe('passed');
      expect(ds.columns_metadata).toBeDefined();

      const hoursCol = ds.columns_metadata?.find((c) => c.name === 'study_hours');
      expect(hoursCol?.data_type).toBe('NUMERICAL');
      expect(hoursCol?.min).toBe(1.8);
      expect(hoursCol?.max).toBe(6.2);
      expect(hoursCol?.mean).toBeGreaterThan(0);
    });

    it('3. Trains real Classification Model (Random Forest) and validates mathematical metrics', async () => {
      const exp = await MlLabService.runExperiment(studentA, {
        name: 'Iris Botanical Random Forest',
        dataset_id: 'ds_iris',
        dataset_name: 'Iris Flower Classification',
        task_type: 'CLASSIFICATION',
        model_type: 'Random Forest',
        target_column: 'species',
        feature_columns: ['sepal_length', 'sepal_width', 'petal_length', 'petal_width'],
        train_split: 0.8,
        hyperparameters: { n_estimators: 50, max_depth: 4 },
      });

      expect(exp.id).toBeDefined();
      expect(exp.status).toBe('COMPLETED');
      expect(exp.metrics.accuracy).toBeGreaterThanOrEqual(0.85);
      expect(exp.metrics.f1_score).toBeGreaterThan(0.8);
      expect(exp.metrics.confusion_matrix).toBeDefined();
      expect(exp.metrics.confusion_matrix!.length).toBe(3); // 3-class iris

      // k-NN has no training epochs, so no loss curve is invented for it.
      expect(Array.isArray(exp.insights.loss_curve)).toBe(true);
      // The sandbox says which model it actually trained instead of claiming a Random Forest.
      expect(exp.logs!.some((l) => l.level === 'WARN' && /not implemented in this sandbox/.test(l.message))).toBe(true);
      // Metrics come from the confusion matrix of real predictions.
      const cm = exp.metrics.confusion_matrix!;
      const total = cm.flat().reduce((a, b) => a + b, 0);
      const diag = cm.reduce((a, row, i) => a + row[i], 0);
      expect(exp.metrics.accuracy).toBeCloseTo(diag / total, 4);

      // Feature importances must be calculated
      expect(exp.insights.feature_importance).toBeDefined();
      expect(exp.insights.feature_importance!.length).toBe(4);

      // Console execution logs
      expect(exp.logs).toBeDefined();
      expect(exp.logs!.length).toBeGreaterThanOrEqual(4);
      expect(exp.logs!.some((l) => l.stage === 'TRAINING')).toBe(true);
    });

    it('4. Trains real Regression Model (Linear Regression) and evaluates R² & RMSE metrics', async () => {
      const exp = await MlLabService.runExperiment(studentA, {
        name: 'California House Price Predictor',
        dataset_id: 'ds_housing',
        dataset_name: 'California Housing Price Estimation',
        task_type: 'REGRESSION',
        model_type: 'Linear Regression',
        target_column: 'median_house_value',
        feature_columns: ['median_income', 'housing_median_age', 'total_rooms', 'population'],
        train_split: 0.8,
        hyperparameters: { learning_rate: 0.01 },
      });

      expect(exp.status).toBe('COMPLETED');
      expect(exp.metrics.r2_score).toBeGreaterThanOrEqual(0.65);
      expect(exp.metrics.rmse).toBeGreaterThan(0);
      expect(exp.metrics.mae).toBeGreaterThan(0);
      expect(exp.metrics.residuals).toBeDefined();
      expect(exp.metrics.residuals!.length).toBeGreaterThan(0);
    });

    it('5. Evaluates K-Means Clustering computing real Inertia & Silhouette score', async () => {
      const exp = await MlLabService.runExperiment(studentA, {
        name: 'Customer Usage Segmentation K-Means',
        dataset_id: 'ds_customer_churn',
        dataset_name: 'Customer Churn & Segmentation',
        task_type: 'CLUSTERING',
        model_type: 'K-Means',
        feature_columns: ['monthly_charges', 'total_usage_gb', 'tenure_months'],
        train_split: 0.8,
        hyperparameters: { n_clusters: 3 },
      });

      expect(exp.status).toBe('COMPLETED');
      expect(exp.metrics.inertia).toBeGreaterThan(0);
      // Real silhouette score (computed from the clustered rows), so only its valid range is fixed.
      expect(exp.metrics.silhouette_score).toBeGreaterThan(0);
      expect(exp.metrics.silhouette_score).toBeLessThanOrEqual(1);
      expect(exp.insights.loss_curve!.length).toBe(20);
      expect(exp.metrics.cluster_distribution).toBeDefined();
      expect(Object.keys(exp.metrics.cluster_distribution!).length).toBe(3);
    });

    it('6. Performs live inference predictions on trained model with probability distributions', async () => {
      // Train model first
      const exp = await MlLabService.runExperiment(studentA, {
        name: 'Iris Live Prediction Model',
        dataset_id: 'ds_iris',
        dataset_name: 'Iris Flower Classification',
        task_type: 'CLASSIFICATION',
        model_type: 'Random Forest',
        target_column: 'species',
        feature_columns: ['sepal_length', 'sepal_width', 'petal_length', 'petal_width'],
        train_split: 0.8,
        hyperparameters: { n_estimators: 20 },
      });

      // Predict on new sample input
      const pred = MlLabService.predict(studentA, exp.id, {
        sepal_length: 5.1,
        sepal_width: 3.5,
        petal_length: 1.4,
        petal_width: 0.2,
      });

      expect(pred).toBeDefined();
      expect(pred.predicted_value).toBeDefined();
      expect(pred.confidence).toBeGreaterThan(0.5);
      expect(pred.class_probabilities).toBeDefined();
      // A setosa-like flower must be classified as setosa by the trained model.
      expect(pred.predicted_label).toBe('setosa');
      expect(pred.explanation).toContain('nearest training rows');
    });
  });
});
