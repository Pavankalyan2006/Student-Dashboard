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
  describe('Part A: SQL Lab Schema Builder, Table Designer & Relational Sandbox', () => {
    beforeEach(() => {
      SqlLabSandboxService.ensureStudentSandbox(studentA);
      SqlLabSandboxService.ensureStudentSandbox(studentB);
    });

    it('1. Initializes isolated sandbox with university_db and ecommerce_db', () => {
      const workspaces = SqlLabSandboxService.getWorkspaces(studentA);
      expect(workspaces.length).toBeGreaterThanOrEqual(2);
      const names = workspaces.map((w) => w.name);
      expect(names).toContain('university_db');
      expect(names).toContain('ecommerce_db');

      const schemas = SqlLabSandboxService.getSchemas(studentA);
      expect(schemas['university_db']).toBeDefined();
      expect(schemas['university_db'].length).toBeGreaterThanOrEqual(3);
    });

    it('2. Creates a custom schema workspace and verifies isolation from other students', () => {
      const res = SqlLabSandboxService.createSchema(studentA, 'hospital_db');
      expect(res.success).toBe(true);

      const aliceWorkspaces = SqlLabSandboxService.getWorkspaces(studentA);
      expect(aliceWorkspaces.map((w) => w.name)).toContain('hospital_db');

      // Student B should NOT have hospital_db
      const bobWorkspaces = SqlLabSandboxService.getWorkspaces(studentB);
      expect(bobWorkspaces.map((w) => w.name)).not.toContain('hospital_db');
    });

    it('3. Generates correct SQL DDL and creates table manually through Table Designer', () => {
      const patientTableDef: SQLTableDefinition = {
        name: 'patients',
        schema_name: 'hospital_db',
        description: 'Hospital patient admissions',
        columns: [
          { name: 'patient_id', type: 'INTEGER', is_primary_key: true, is_auto_increment: true, is_nullable: false },
          { name: 'name', type: 'VARCHAR', length_precision: '100', is_nullable: false },
          { name: 'age', type: 'INTEGER', is_nullable: false, default_value: '30' },
          { name: 'blood_group', type: 'VARCHAR', length_precision: '5', is_nullable: true, default_value: 'O+' },
        ],
        sample_rows: [],
      };

      const sqlPreview = SqlLabSandboxService.generateCreateTableSql(patientTableDef);
      expect(sqlPreview).toContain('CREATE TABLE "patients"');
      expect(sqlPreview).toContain('"patient_id" INTEGER PRIMARY KEY AUTO_INCREMENT');
      expect(sqlPreview).toContain('"name" VARCHAR(100) NOT NULL');

      const creation = SqlLabSandboxService.createTable(studentA, 'hospital_db', patientTableDef);
      expect(creation.success).toBe(true);
      expect(creation.table.name).toBe('patients');

      // Verify table exists in schema tables
      const tables = SqlLabSandboxService.getSchemaTables(studentA, 'hospital_db');
      expect(tables.map((t) => t.name)).toContain('patients');
    });

    it('4. Inserts row and validates NOT NULL & PRIMARY KEY uniqueness constraints', () => {
      // Valid insert
      const insert1 = SqlLabSandboxService.insertRow(studentA, 'hospital_db', 'patients', {
        name: 'Rajesh Kumar',
        age: 42,
        blood_group: 'B+',
      });
      expect(insert1.success).toBe(true);
      expect(insert1.inserted_row.patient_id).toBe(1);

      // Rejects missing NOT NULL column
      expect(() => {
        SqlLabSandboxService.insertRow(studentA, 'hospital_db', 'patients', {
          age: 25,
        });
      }).toThrow(/cannot be null/i);

      // Rejects duplicate explicit primary key
      expect(() => {
        SqlLabSandboxService.insertRow(studentA, 'hospital_db', 'patients', {
          patient_id: 1,
          name: 'Duplicate Patient',
          age: 33,
        });
      }).toThrow(/Duplicate entry '1' for PRIMARY KEY/i);
    });

    it('5. Enforces Foreign Key relationships and ON DELETE RESTRICT rules', () => {
      // Create admissions table referencing patients(patient_id)
      const admissionsDef: SQLTableDefinition = {
        name: 'admissions',
        schema_name: 'hospital_db',
        columns: [
          { name: 'admission_id', type: 'INTEGER', is_primary_key: true, is_auto_increment: true, is_nullable: false },
          {
            name: 'patient_id',
            type: 'INTEGER',
            is_foreign_key: true,
            references: 'patients(patient_id)',
            foreign_key: {
              source_column: 'patient_id',
              referenced_table: 'patients',
              referenced_column: 'patient_id',
              on_delete: 'RESTRICT',
              on_update: 'CASCADE',
            },
          },
          { name: 'ward', type: 'VARCHAR', length_precision: '20', is_nullable: false, default_value: 'ICU' },
        ],
        foreign_keys: [
          {
            source_column: 'patient_id',
            referenced_table: 'patients',
            referenced_column: 'patient_id',
            on_delete: 'RESTRICT',
            on_update: 'CASCADE',
          },
        ],
        sample_rows: [],
      };

      SqlLabSandboxService.createTable(studentA, 'hospital_db', admissionsDef);

      // Foreign key rejection: patient_id 999 does not exist
      expect(() => {
        SqlLabSandboxService.insertRow(studentA, 'hospital_db', 'admissions', {
          patient_id: 999,
          ward: 'General',
        });
      }).toThrow(/Foreign key constraint failed/i);

      // Successful insert referencing existing patient_id 1
      const admInsert = SqlLabSandboxService.insertRow(studentA, 'hospital_db', 'admissions', {
        patient_id: 1,
        ward: 'General',
      });
      expect(admInsert.success).toBe(true);

      // RESTRICT check: Deleting patient 1 should be blocked because child admission exists
      expect(() => {
        SqlLabSandboxService.deleteRow(studentA, 'hospital_db', 'patients', 1);
      }).toThrow(/foreign key constraint fails/i);

      // RESTRICT check: Dropping patients table should be blocked because admissions references it
      expect(() => {
        SqlLabSandboxService.dropTable(studentA, 'hospital_db', 'patients');
      }).toThrow(/referenced by foreign key/i);
    });

    it('6. Executes real SQL queries (SELECT, WHERE, JOIN, GROUP BY, DDL)', async () => {
      // 1. Basic SELECT from students in university_db
      const resSelect = await SqlLabSandboxService.executeSandboxedSql(
        studentA,
        'university_db',
        'SELECT student_id, name, branch FROM students WHERE branch = "Computer Science";'
      );
      expect(resSelect.success).toBe(true);
      expect(resSelect.rows.length).toBeGreaterThanOrEqual(1);
      expect(resSelect.rows.every((r) => r.branch === 'Computer Science')).toBe(true);

      // 2. Hash Join between students and departments
      const resJoin = await SqlLabSandboxService.executeSandboxedSql(
        studentA,
        'university_db',
        'SELECT s.name, s.branch, d.building FROM students s JOIN departments d ON s.dept_id = d.dept_id;'
      );
      expect(resJoin.success).toBe(true);
      expect(resJoin.columns).toContain('building');
      expect(resJoin.explanation).toContain('Hash Join');

      // 3. GROUP BY aggregate
      const resGroup = await SqlLabSandboxService.executeSandboxedSql(
        studentA,
        'university_db',
        'SELECT branch, COUNT(*) AS count, AVG(cgpa) AS avg_cgpa FROM students GROUP BY branch;'
      );
      expect(resGroup.success).toBe(true);
      expect(resGroup.columns).toContain('branch');
      expect(resGroup.columns).toContain('avg_cgpa');

      // 4. SQL Execution blocks malicious administration attempts
      const resMalicious = await SqlLabSandboxService.executeSandboxedSql(
        studentA,
        'university_db',
        'SHUTDOWN IMMEDIATE;'
      );
      expect(resMalicious.success).toBe(false);
      expect(resMalicious.error).toContain('Destructive database administration commands are prohibited');
    });

    it('7. Tests Table Data Viewer pagination, sorting, and sample data generation', () => {
      const initialData = SqlLabSandboxService.getTableData(studentA, 'university_db', 'students', {
        page: 1,
        limit: 2,
        sort_by: 'cgpa',
        sort_dir: 'DESC',
      });
      expect(initialData.rows.length).toBe(2);
      expect(initialData.total_rows).toBeGreaterThanOrEqual(5);
      expect(Number(initialData.rows[0].cgpa)).toBeGreaterThanOrEqual(Number(initialData.rows[1].cgpa));

      // Generate 3 sample rows
      const sampleGen = SqlLabSandboxService.generateSampleRows(studentA, 'university_db', 'students', 3);
      expect(sampleGen.success).toBe(true);
      expect(sampleGen.generated_count).toBe(3);

      const afterData = SqlLabSandboxService.getTableData(studentA, 'university_db', 'students');
      expect(afterData.total_rows).toBe(initialData.total_rows + 3);
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
