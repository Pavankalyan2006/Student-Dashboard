// server/services/mlLabService.ts
// Production-grade AI/ML Lab Service with Real Machine Learning Algorithms:
// - Multi-file code upload and editor
// - CSV/JSON dataset profiler with stream/batch parsing
// - Real Decision Trees, Random Forests, Logistic/Linear Regression, K-Means
// - No fake metrics: calculates true accuracy, precision, recall, F1, confusion matrix, MSE, R2, and loss curves
// - Dynamic live prediction engine for trained models

import { ValidationError, NotFoundError } from '../core/exceptions';
import { seededRng, fitPreprocess, rowHasMissing, transformRow, collapseImportance, fitTree, treeLeaf, treeDepth, fitForest, forestPredict, fitLogistic, logisticProbs, PreprocessSpec, TreeNode, LogisticModel } from './mlAlgorithms';
import {
  MLWorkspace,
  MLWorkspaceFile,
  MLDataset,
  MLDatasetColumnInfo,
  MLTrainingConfig,
  MLExperimentEntity,
  MLExperimentMetric,
  MLExperimentLog,
  MLPredictionResult,
} from '../models/learningModulesTypes';

interface FittedModelArtifact {
  model_type: string;
  task_type: 'CLASSIFICATION' | 'REGRESSION' | 'CLUSTERING';
  feature_names: string[];
  target_column?: string;
  class_labels?: string[];
  means?: Record<string, number>;
  stds?: Record<string, number>;
  mins?: Record<string, number>;
  maxs?: Record<string, number>;
  categorical_maps?: Record<string, Record<string, number>>;
  tree?: TreeNode;
  forest?: TreeNode[];
  algo?: string;
  preprocess?: PreprocessSpec;
  knn?: { k: number; vectors: number[][]; labels: string[] };
  logistic?: LogisticModel;
  weights?: number[];
  bias?: number;
  centroids?: number[][];
}

export class MlLabService {
  private static workspaces: Map<string, MLWorkspace[]> = new Map(); // studentId -> workspaces
  private static customDatasets: Map<string, MLDataset[]> = new Map(); // studentId -> datasets
  private static experiments: Map<string, MLExperimentEntity> = new Map(); // expId -> experiment
  private static fittedModels: Map<string, FittedModelArtifact> = new Map(); // expId -> artifact

  // -------------------------------------------------------------
  // Built-in Benchmark Datasets with Rich Rows
  // -------------------------------------------------------------
  private static builtInDatasets: MLDataset[] = [
    {
      id: 'ds_iris',
      name: 'Iris Flower Classification',
      description: 'Synthetic Iris-style 3-class dataset (150 rows generated from per-species measurement ranges) for classification practice',
      source: 'BUILT_IN',
      features: ['sepal_length', 'sepal_width', 'petal_length', 'petal_width'],
      target_column: 'species',
      total_samples: 150,
      task_type: 'CLASSIFICATION',
      created_at: new Date().toISOString(),
      columns_metadata: [
        { name: 'sepal_length', data_type: 'NUMERICAL', missing_count: 0, unique_count: 35, min: 4.3, max: 7.9, mean: 5.84, std: 0.83, sample_values: [5.1, 4.9, 4.7] },
        { name: 'sepal_width', data_type: 'NUMERICAL', missing_count: 0, unique_count: 23, min: 2.0, max: 4.4, mean: 3.05, std: 0.43, sample_values: [3.5, 3.0, 3.2] },
        { name: 'petal_length', data_type: 'NUMERICAL', missing_count: 0, unique_count: 43, min: 1.0, max: 6.9, mean: 3.76, std: 1.76, sample_values: [1.4, 1.4, 1.3] },
        { name: 'petal_width', data_type: 'NUMERICAL', missing_count: 0, unique_count: 22, min: 0.1, max: 2.5, mean: 1.20, std: 0.76, sample_values: [0.2, 0.2, 0.2] },
        { name: 'species', data_type: 'CATEGORICAL', missing_count: 0, unique_count: 3, sample_values: ['setosa', 'versicolor', 'virginica'] },
      ],
      preview: [
        { sepal_length: 5.1, sepal_width: 3.5, petal_length: 1.4, petal_width: 0.2, species: 'setosa' },
        { sepal_length: 4.9, sepal_width: 3.0, petal_length: 1.4, petal_width: 0.2, species: 'setosa' },
        { sepal_length: 7.0, sepal_width: 3.2, petal_length: 4.7, petal_width: 1.4, species: 'versicolor' },
        { sepal_length: 6.4, sepal_width: 3.2, petal_length: 4.5, petal_width: 1.5, species: 'versicolor' },
        { sepal_length: 6.3, sepal_width: 3.3, petal_length: 6.0, petal_width: 2.5, species: 'virginica' },
        { sepal_length: 5.8, sepal_width: 2.7, petal_length: 5.1, petal_width: 1.9, species: 'virginica' },
      ],
      raw_data: MlLabService.generateIrisDataset(),
    },
    {
      id: 'ds_housing',
      name: 'California Housing Price Estimation',
      description: 'Synthetic tabular regression dataset (generated) predicting median house values',
      source: 'BUILT_IN',
      features: ['median_income', 'housing_median_age', 'total_rooms', 'population', 'median_house_age'],
      target_column: 'median_house_value',
      total_samples: 200,
      task_type: 'REGRESSION',
      created_at: new Date().toISOString(),
      columns_metadata: [
        { name: 'median_income', data_type: 'NUMERICAL', missing_count: 0, unique_count: 85, min: 1.5, max: 15.0, mean: 4.85, std: 2.1, sample_values: [8.32, 3.87, 2.45] },
        { name: 'housing_median_age', data_type: 'NUMERICAL', missing_count: 0, unique_count: 45, min: 2.0, max: 52.0, mean: 28.6, std: 12.5, sample_values: [41, 21, 52] },
        { name: 'total_rooms', data_type: 'NUMERICAL', missing_count: 0, unique_count: 120, min: 450, max: 9800, mean: 2635, std: 1400, sample_values: [880, 7099, 1467] },
        { name: 'population', data_type: 'NUMERICAL', missing_count: 0, unique_count: 110, min: 200, max: 5000, mean: 1425, std: 850, sample_values: [322, 2401, 496] },
        { name: 'median_house_value', data_type: 'NUMERICAL', missing_count: 0, unique_count: 150, min: 85000, max: 500000, mean: 245000, std: 95000, sample_values: [452600, 358500, 162500] },
      ],
      preview: [
        { median_income: 8.32, housing_median_age: 41, total_rooms: 880, population: 322, median_house_value: 452600 },
        { median_income: 3.87, housing_median_age: 21, total_rooms: 7099, population: 2401, median_house_value: 358500 },
        { median_income: 2.45, housing_median_age: 52, total_rooms: 1467, population: 496, median_house_value: 162500 },
      ],
      raw_data: MlLabService.generateHousingDataset(),
    },
    {
      id: 'ds_customer_churn',
      name: 'Customer Churn & Segmentation',
      description: 'Synthetic telecom customer usage dataset (generated) for churn and clustering practice',
      source: 'BUILT_IN',
      features: ['monthly_charges', 'total_usage_gb', 'tenure_months', 'support_calls'],
      target_column: 'churned',
      total_samples: 180,
      task_type: 'CLASSIFICATION',
      created_at: new Date().toISOString(),
      columns_metadata: [
        { name: 'monthly_charges', data_type: 'NUMERICAL', missing_count: 0, unique_count: 90, min: 19.5, max: 118.5, mean: 64.7, std: 30.1, sample_values: [29.85, 56.95, 89.10] },
        { name: 'total_usage_gb', data_type: 'NUMERICAL', missing_count: 0, unique_count: 105, min: 10, max: 850, mean: 245, std: 140, sample_values: [120, 340, 560] },
        { name: 'tenure_months', data_type: 'NUMERICAL', missing_count: 0, unique_count: 65, min: 1, max: 72, mean: 32.4, std: 24.5, sample_values: [1, 34, 45] },
        { name: 'support_calls', data_type: 'NUMERICAL', missing_count: 0, unique_count: 9, min: 0, max: 8, mean: 2.1, std: 1.4, sample_values: [1, 0, 4] },
        { name: 'churned', data_type: 'CATEGORICAL', missing_count: 0, unique_count: 2, sample_values: ['No', 'Yes'] },
      ],
      preview: [
        { monthly_charges: 29.85, total_usage_gb: 120, tenure_months: 1, support_calls: 4, churned: 'Yes' },
        { monthly_charges: 56.95, total_usage_gb: 340, tenure_months: 34, support_calls: 1, churned: 'No' },
        { monthly_charges: 89.10, total_usage_gb: 560, tenure_months: 45, support_calls: 0, churned: 'No' },
      ],
      raw_data: MlLabService.generateChurnDataset(),
    },
  ];

  /** Seeded generator so the built-in synthetic datasets are identical on every server start. */
  private static seededRandom(seed: number): () => number {
    let state = seed >>> 0;
    return () => {
      state = (state + 0x6d2b79f5) >>> 0;
      let t = state;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  private static generateIrisDataset(): Record<string, any>[] {
    const random = MlLabService.seededRandom(1001);
    const data: Record<string, any>[] = [];
    const classes = [
      { name: 'setosa', sl: [4.8, 5.4], sw: [3.1, 3.8], pl: [1.2, 1.8], pw: [0.1, 0.4] },
      { name: 'versicolor', sl: [5.5, 6.3], sw: [2.5, 3.1], pl: [3.8, 4.8], pw: [1.1, 1.6] },
      { name: 'virginica', sl: [6.3, 7.5], sw: [2.8, 3.4], pl: [5.1, 6.4], pw: [1.8, 2.4] },
    ];
    for (const c of classes) {
      for (let i = 0; i < 50; i++) {
        data.push({
          sepal_length: parseFloat((c.sl[0] + random() * (c.sl[1] - c.sl[0])).toFixed(2)),
          sepal_width: parseFloat((c.sw[0] + random() * (c.sw[1] - c.sw[0])).toFixed(2)),
          petal_length: parseFloat((c.pl[0] + random() * (c.pl[1] - c.pl[0])).toFixed(2)),
          petal_width: parseFloat((c.pw[0] + random() * (c.pw[1] - c.pw[0])).toFixed(2)),
          species: c.name,
        });
      }
    }
    return data;
  }

  private static generateHousingDataset(): Record<string, any>[] {
    const random = MlLabService.seededRandom(1002);
    const data: Record<string, any>[] = [];
    for (let i = 0; i < 200; i++) {
      const income = parseFloat((2.0 + random() * 8.0).toFixed(2));
      const age = Math.floor(10 + random() * 40);
      const rooms = Math.floor(800 + random() * 5000);
      const pop = Math.floor(300 + random() * 2500);
      // Real linear relation with noise: value ~ 80000 + 35000 * income - 500 * age + 15 * rooms
      const val = Math.round(75000 + income * 38000 - age * 350 + rooms * 12 + (random() - 0.5) * 20000);
      data.push({
        median_income: income,
        housing_median_age: age,
        total_rooms: rooms,
        population: pop,
        median_house_value: Math.max(70000, val),
      });
    }
    return data;
  }

  private static generateChurnDataset(): Record<string, any>[] {
    const random = MlLabService.seededRandom(1003);
    const data: Record<string, any>[] = [];
    for (let i = 0; i < 180; i++) {
      const monthly = parseFloat((25 + random() * 80).toFixed(2));
      const usage = Math.floor(50 + random() * 600);
      const tenure = Math.floor(1 + random() * 60);
      const calls = Math.floor(random() * 6);
      // Higher calls + higher monthly + lower tenure increases churn probability
      const churnProb = (calls * 0.18 + monthly * 0.005 - tenure * 0.015);
      const churned = churnProb > 0.4 ? 'Yes' : 'No';
      data.push({
        monthly_charges: monthly,
        total_usage_gb: usage,
        tenure_months: tenure,
        support_calls: calls,
        churned,
      });
    }
    return data;
  }

  /** Column profile (type, missing values, unique values, min/max/mean/std) computed from the actual rows. */
  public static profileColumns(headers: string[], rows: Record<string, any>[]): MLDatasetColumnInfo[] {
    return headers.map((colName) => {
      let missing = 0;
      const values: any[] = [];
      let numericCount = 0;

      for (const r of rows) {
        const v = r[colName];
        if (v === null || v === undefined) {
          missing++;
        } else {
          values.push(v);
          if (typeof v === 'number') numericCount++;
        }
      }

      const isNumerical = numericCount > values.length * 0.8;
      const uniqueVals = Array.from(new Set(values));

      if (isNumerical) {
        const numVals = values.filter((v) => typeof v === 'number');
        const min = numVals.length > 0 ? Math.min(...numVals) : 0;
        const max = numVals.length > 0 ? Math.max(...numVals) : 0;
        const mean = numVals.length > 0 ? parseFloat((numVals.reduce((a, b) => a + b, 0) / numVals.length).toFixed(2)) : 0;
        const variance = numVals.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / (numVals.length || 1);
        const std = parseFloat(Math.sqrt(variance).toFixed(2));

        return {
          name: colName,
          data_type: 'NUMERICAL',
          missing_count: missing,
          unique_count: uniqueVals.length,
          min,
          max,
          mean,
          std,
          sample_values: uniqueVals.slice(0, 3),
        };
      } else {
        return {
          name: colName,
          data_type: 'CATEGORICAL',
          missing_count: missing,
          unique_count: uniqueVals.length,
          sample_values: uniqueVals.slice(0, 3),
        };
      }
    });

  }

  private static profiledBuiltIns = new Set<string>();
  /** Built-in sample statistics are computed from the generated rows once, not typed in by hand. */
  private static withRealProfile(d: MLDataset): MLDataset {
    if (!this.profiledBuiltIns.has(d.id) && Array.isArray(d.raw_data) && d.raw_data.length) {
      const headers = Object.keys(d.raw_data[0]);
      d.columns_metadata = this.profileColumns(headers, d.raw_data);
      d.total_samples = d.raw_data.length;
      this.profiledBuiltIns.add(d.id);
    }
    return d;
  }

  // -------------------------------------------------------------
  // Workspace Management
  // -------------------------------------------------------------
  public static ensureStudentWorkspaces(studentId: string): MLWorkspace[] {
    if (!this.workspaces.has(studentId)) {
      const initialWorkspace: MLWorkspace = {
        id: `ws_default_${studentId}`,
        student_id: studentId,
        name: 'Iris Classification & Benchmarks',
        description: 'Undergraduate machine learning practice project with exploratory datasets and custom Python scripts',
        task_type: 'CLASSIFICATION',
        files: [
          {
            id: 'file_train_py',
            workspace_id: `ws_default_${studentId}`,
            name: 'train_model.py',
            extension: '.py',
            size_bytes: 1420,
            content: `# train_model.py
# Machine Learning Training Pipeline for Tabular Datasets

def build_model(config):
    """Initializes model hyper-parameters"""
    return {
        "n_estimators": config.get("n_estimators", 100),
        "max_depth": config.get("max_depth", 4),
        "learning_rate": config.get("learning_rate", 0.05),
    }

def train_model(model, train_data, config):
    """Fits decision trees or linear weights to training partition"""
    print(f"Fitting model with {len(train_data)} records...")
    return model

def evaluate_model(model, test_data, config):
    """Calculates accuracy and a confusion matrix on held-out test data.
    TODO: compare predictions with the true labels. No numbers are filled in here."""
    raise NotImplementedError("Write your evaluation code. To train and evaluate in this app, use Run experiment.")

def predict_model(model, input_features):
    """Infers the output class for a new sample.
    TODO: implement after training."""
    raise NotImplementedError("Write your prediction code.")

# Note: this file is your own notes and code. The app does not run Python files; experiments
# are trained by the ML Lab engine when you press Run experiment, and its metrics come from that run.
`,
            updated_at: new Date().toISOString(),
          },
          {
            id: 'file_config_yaml',
            workspace_id: `ws_default_${studentId}`,
            name: 'model_config.yaml',
            extension: '.yaml',
            size_bytes: 280,
            content: `project:
  name: iris_experiment_v1
  task: classification
model:
  type: random_forest
  n_estimators: 100
  max_depth: 4
split:
  train: 0.8
  test: 0.2
seed: 42
`,
            updated_at: new Date().toISOString(),
          },
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      this.workspaces.set(studentId, [initialWorkspace]);
    }
    return this.workspaces.get(studentId)!;
  }

  public static getWorkspaces(studentId: string): MLWorkspace[] {
    return this.ensureStudentWorkspaces(studentId);
  }

  public static createWorkspace(
    studentId: string,
    data: { name: string; description?: string; task_type?: 'CLASSIFICATION' | 'REGRESSION' | 'CLUSTERING' }
  ): MLWorkspace {
    const list = this.ensureStudentWorkspaces(studentId);
    const newWs: MLWorkspace = {
      id: `ws_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      student_id: studentId,
      name: data.name.trim() || 'New ML Workspace',
      description: data.description || 'Student machine learning workspace',
      task_type: data.task_type || 'CLASSIFICATION',
      files: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    list.unshift(newWs);
    return newWs;
  }

  public static getWorkspace(studentId: string, workspaceId: string): MLWorkspace {
    const list = this.ensureStudentWorkspaces(studentId);
    const ws = list.find((w) => w.id === workspaceId);
    if (!ws) throw new Error(`Workspace '${workspaceId}' not found`);
    return ws;
  }

  public static deleteWorkspace(studentId: string, workspaceId: string): { success: boolean } {
    const list = this.ensureStudentWorkspaces(studentId);
    const idx = list.findIndex((w) => w.id === workspaceId);
    if (idx === -1) throw new Error('Workspace not found');
    list.splice(idx, 1);
    return { success: true };
  }

  // -------------------------------------------------------------
  // File Management (Code Upload & Editor)
  // -------------------------------------------------------------
  public static addFile(
    studentId: string,
    workspaceId: string,
    fileData: { name: string; content: string }
  ): MLWorkspaceFile {
    const ws = this.getWorkspace(studentId, workspaceId);
    const cleanName = fileData.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const ext = cleanName.includes('.') ? cleanName.substring(cleanName.lastIndexOf('.')) : '.txt';
    const allowedExtensions = ['.py', '.ipynb', '.txt', '.json', '.yaml', '.yml', '.md', '.csv'];
    if (!allowedExtensions.includes(ext.toLowerCase())) {
      throw new Error(`File extension '${ext}' is not permitted. Supported: ${allowedExtensions.join(', ')}`);
    }

    const newFile: MLWorkspaceFile = {
      id: `file_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      workspace_id: workspaceId,
      name: cleanName,
      extension: ext,
      size_bytes: Buffer.byteLength(fileData.content, 'utf8'),
      content: fileData.content,
      updated_at: new Date().toISOString(),
    };

    // Replace if same name exists
    const existingIdx = ws.files.findIndex((f) => f.name.toLowerCase() === cleanName.toLowerCase());
    if (existingIdx !== -1) {
      ws.files[existingIdx] = newFile;
    } else {
      ws.files.push(newFile);
    }
    ws.updated_at = new Date().toISOString();
    return newFile;
  }

  public static updateFile(
    studentId: string,
    workspaceId: string,
    fileId: string,
    content: string
  ): MLWorkspaceFile {
    const ws = this.getWorkspace(studentId, workspaceId);
    const file = ws.files.find((f) => f.id === fileId);
    if (!file) throw new Error('File not found in workspace');
    file.content = content;
    file.size_bytes = Buffer.byteLength(content, 'utf8');
    file.updated_at = new Date().toISOString();
    ws.updated_at = new Date().toISOString();
    return file;
  }

  public static deleteFile(studentId: string, workspaceId: string, fileId: string): { success: boolean } {
    const ws = this.getWorkspace(studentId, workspaceId);
    const idx = ws.files.findIndex((f) => f.id === fileId);
    if (idx === -1) throw new Error('File not found');
    ws.files.splice(idx, 1);
    ws.updated_at = new Date().toISOString();
    return { success: true };
  }

  // -------------------------------------------------------------
  // Dataset Management (Upload, Profiling, Schema Extraction)
  // -------------------------------------------------------------
  static MAX_CSV_BYTES = 5 * 1024 * 1024;
  static MAX_ROWS = 20000;

  /** RFC 4180 CSV parsing: quoted fields, escaped quotes, commas and newlines inside quotes. */
  static parseCsv(text: string): string[][] {
    const rows: string[][] = [];
    let row: string[] = [];
    let field = '';
    let inQuotes = false;
    const src = text.replace(/^\uFEFF/, '');
    for (let i = 0; i < src.length; i++) {
      const c = src[i];
      if (inQuotes) {
        if (c === '"') {
          if (src[i + 1] === '"') { field += '"'; i++; } else inQuotes = false;
        } else field += c;
      } else if (c === '"') inQuotes = true;
      else if (c === ',') { row.push(field); field = ''; }
      else if (c === '\n' || c === '\r') {
        if (c === '\r' && src[i + 1] === '\n') i++;
        row.push(field); rows.push(row); row = []; field = '';
      } else field += c;
    }
    if (inQuotes) throw new ValidationError('The CSV has an unclosed quoted field.');
    if (field !== '' || row.length) { row.push(field); rows.push(row); }
    while (rows.length && rows[rows.length - 1].every((f) => f.trim() === '')) rows.pop();
    return rows;
  }

  public static deleteDataset(studentId: string, datasetId: string): { success: boolean } {
    const list = this.customDatasets.get(studentId) || [];
    if (!list.some((d) => d.id === datasetId)) {
      if (this.builtInDatasets.some((d) => d.id === datasetId)) throw new ValidationError('Built-in sample datasets cannot be removed.');
      throw new NotFoundError('Dataset not found');
    }
    this.customDatasets.set(studentId, list.filter((d) => d.id !== datasetId));
    return { success: true };
  }

  public static getDatasets(studentId: string): MLDataset[] {
    const custom = this.customDatasets.get(studentId) || [];
    return [...this.builtInDatasets.map((d) => this.withRealProfile(d)), ...custom];
  }

  public static getDatasetById(studentId: string, datasetId: string): MLDataset {
    const all = this.getDatasets(studentId);
    const found = all.find((d) => d.id === datasetId || d.name === datasetId);
    if (!found) throw new NotFoundError(`Dataset '${datasetId}' not found`);
    return found;
  }

  public static uploadCustomDataset(
    studentId: string,
    data: { name: string; csvContent: string; description?: string; target_column?: string }
  ): MLDataset {
    const csv = String(data?.csvContent ?? '');
    if (!csv.trim()) throw new ValidationError('The CSV is empty.');
    if (Buffer.byteLength(csv, 'utf8') > MlLabService.MAX_CSV_BYTES) {
      throw new ValidationError(`The CSV is larger than ${MlLabService.MAX_CSV_BYTES / (1024 * 1024)} MB.`);
    }
    if (/\u0000/.test(csv)) throw new ValidationError('This does not look like a text CSV file.');
    const table = MlLabService.parseCsv(csv);
    if (table.length < 2) throw new ValidationError('CSV must contain a header line and at least one data row');
    const headers = table[0].map((h) => h.trim());
    if (headers.some((h) => !h)) throw new ValidationError('Every column needs a header name.');
    const dupHeader = headers.find((h, i) => headers.indexOf(h) !== i);
    if (dupHeader) throw new ValidationError(`Duplicate column header '${dupHeader}'.`);
    if (headers.length > 100) throw new ValidationError('At most 100 columns are supported.');
    if (table.length - 1 > MlLabService.MAX_ROWS) throw new ValidationError(`At most ${MlLabService.MAX_ROWS} data rows are supported.`);
    const rows: Record<string, any>[] = [];
    const badLines: number[] = [];
    for (let i = 1; i < table.length; i++) {
      const parts = table[i];
      if (parts.length === 1 && parts[0].trim() === '') continue; // blank line
      if (parts.length !== headers.length) {
        badLines.push(i + 1);
        continue;
      }
      const row: Record<string, any> = {};
      headers.forEach((h, idx) => {
        const val = parts[idx].trim();
        if (val === '' || /^(na|n\/a|null|nan)$/i.test(val)) row[h] = null;
        else if (/^[-+]?(\d+\.?\d*|\.\d+)([eE][-+]?\d+)?$/.test(val)) row[h] = Number(val);
        else row[h] = val;
      });
      rows.push(row);
    }
    if (badLines.length) {
      throw new ValidationError(`Rows with the wrong number of columns (expected ${headers.length}): line ${badLines.slice(0, 5).join(', ')}${badLines.length > 5 ? ` and ${badLines.length - 5} more` : ''}.`);
    }
    if (rows.length === 0) throw new ValidationError('The CSV has a header but no data rows.');
    if (data.target_column && !headers.includes(data.target_column)) {
      throw new ValidationError(`Target column '${data.target_column}' is not in the CSV header.`);
    }
    const seen = new Set<string>();
    let duplicateRows = 0;
    for (const r of rows) {
      const key = JSON.stringify(headers.map((h) => r[h]));
      if (seen.has(key)) duplicateRows++;
      else seen.add(key);
    }

    // Profiling columns
    const columns_metadata = MlLabService.profileColumns(headers, rows);

    const targetCol = data.target_column || headers[headers.length - 1];
    const targetMeta = columns_metadata.find((c) => c.name === targetCol);
    const taskType: 'CLASSIFICATION' | 'REGRESSION' =
      targetMeta && targetMeta.data_type === 'NUMERICAL' && targetMeta.unique_count > 10
        ? 'REGRESSION'
        : 'CLASSIFICATION';

    const newDs: MLDataset = {
      id: `ds_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: data.name.trim() || 'Uploaded Dataset',
      description: data.description || 'Uploaded custom tabular dataset',
      source: 'UPLOADED',
      file_size_bytes: Buffer.byteLength(data.csvContent, 'utf8'),
      features: headers.filter((h) => h !== targetCol),
      target_column: targetCol,
      total_samples: rows.length,
      columns_metadata,
      preview: rows.slice(0, 10),
      raw_data: rows,
      task_type: taskType,
      duplicate_rows: duplicateRows,
      created_at: new Date().toISOString(),
    } as MLDataset;

    if (!this.customDatasets.has(studentId)) {
      this.customDatasets.set(studentId, []);
    }
    this.customDatasets.get(studentId)!.push(newDs);
    return newDs;
  }

  // -------------------------------------------------------------
  // Real ML Training Engine (Classification, Regression, Clustering)
  // -------------------------------------------------------------
  public static async runExperiment(
    studentId: string,
    config: MLTrainingConfig
  ): Promise<MLExperimentEntity> {
    const startTime = Date.now();
    const expId = `exp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const logs: MLExperimentLog[] = [];

    const log = (stage: string, message: string, level: 'INFO' | 'WARN' | 'ERROR' = 'INFO') => {
      logs.push({ timestamp: new Date().toISOString(), stage, message, level });
    };

    log('QUEUED', `Experiment '${config.name}' queued. Training runs in the app's built-in engine with row and column limits; no student code is executed.`);

    // 1. Fetch dataset
    const dataset = this.getDatasetById(studentId, config.dataset_id || config.dataset_name);
    log('PREPARING_DATA', `Loaded dataset '${dataset.name}' with ${dataset.total_samples} samples.`);

    const rawRows = dataset.raw_data && dataset.raw_data.length > 0
      ? dataset.raw_data
      : dataset.preview;

    if (!rawRows || rawRows.length < 5) {
      throw new Error('Dataset does not have sufficient records for model training (minimum 5 required)');
    }

    const featureNames = config.feature_columns && config.feature_columns.length > 0
      ? config.feature_columns
      : dataset.features;

    const targetCol = config.target_column || dataset.target_column;
    const isClustering = config.task_type === 'CLUSTERING' || config.model_type.includes('KMEANS') || config.model_type.includes('K-Means');

    log('PREPARING_DATA', `Features selected: [${featureNames.join(', ')}]. Target: '${isClustering ? 'None (Unsupervised)' : targetCol}'.`);

    // 2. Train / test split over rows that have a target (seeded, so a run is reproducible).
    const isMissingVal = (v: any) => v === null || v === undefined || v === '';
    const usable = isClustering ? [...rawRows] : rawRows.filter((r) => !isMissingVal(r[targetCol]));
    if (!isClustering && usable.length < rawRows.length) {
      log('PREPARING_DATA', `Dropped ${rawRows.length - usable.length} row(s) with no value in target '${targetCol}'.`, 'WARN');
    }
    for (const f of featureNames) {
      if (!dataset.columns_metadata?.some((c) => c.name === f) && !(rawRows[0] && f in rawRows[0])) {
        throw new ValidationError(`Feature column '${f}' does not exist in dataset '${dataset.name}'.`);
      }
    }
    if (!isClustering && featureNames.includes(targetCol)) throw new ValidationError('The target column cannot also be a feature.');
    if (featureNames.length === 0) throw new ValidationError('Select at least one feature column.');

    const splitRatio = Math.max(0.5, Math.min(0.9, Number(config.train_split) || 0.8));
    const rand = seededRng(Number(config.random_seed ?? 42));
    const shuffled = [...usable];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const trainCount = isClustering ? shuffled.length : Math.floor(shuffled.length * splitRatio);
    let trainRows = shuffled.slice(0, trainCount);
    let testRows = isClustering ? [] : shuffled.slice(trainCount);

    // 3. Preprocessing, fitted on the training rows only (no test-set leakage).
    const pre = config.preprocessing || ({} as any);
    const kinds: Record<string, 'numeric' | 'categorical'> = {};
    for (const c of dataset.columns_metadata || []) kinds[c.name] = c.data_type === 'CATEGORICAL' ? 'categorical' : 'numeric';
    let spec = fitPreprocess(trainRows, featureNames, { missing: pre.missing_value_strategy, scaling: pre.scaling, kinds });
    if (spec.missing === 'DROP') {
      const before = trainRows.length + testRows.length;
      trainRows = trainRows.filter((r) => !rowHasMissing(spec, r));
      testRows = testRows.filter((r) => !rowHasMissing(spec, r));
      log('PREPARING_DATA', `Dropped ${before - trainRows.length - testRows.length} row(s) with missing feature values.`);
      spec = fitPreprocess(trainRows, featureNames, { missing: 'DROP', scaling: pre.scaling, kinds });
    }
    if (trainRows.length < 4 || (!isClustering && testRows.length < 1)) {
      throw new ValidationError(`Not enough usable rows after preprocessing (${trainRows.length} train, ${testRows.length} test). Upload more data or change the split.`);
    }
    const catFeatures = spec.features.filter((f) => f.kind === 'categorical');
    log('PREPARING_DATA', `Imputation: ${spec.missing}. Scaling: ${spec.scaling}. ` +
      (catFeatures.length ? `One-hot encoded: ${catFeatures.map((f) => `${f.name} (${f.categories?.length} values)`).join(', ')}.` : 'All features numeric.'));
    log('PREPARING_DATA', isClustering
      ? `Clustering uses all ${trainRows.length} rows.`
      : `Train/Test partition: ${trainRows.length} train, ${testRows.length} test (${Math.round(splitRatio * 100)}/${Math.round((1 - splitRatio) * 100)} split, seed ${Number(config.random_seed ?? 42)}).`);

    const trainVecs = trainRows.map((r) => transformRow(spec, r));
    const testVecs = testRows.map((r) => transformRow(spec, r));
    const dims = spec.expanded.length;
    const dist2 = (x: number[], y: number[]) => x.reduce((acc, v, d) => acc + (v - y[d]) * (v - y[d]), 0);

    // 4. Pick the algorithm. Only models implemented below are accepted; nothing is substituted.
    const mt = String(config.model_type || '').toLowerCase();
    const algo: string | null = isClustering
      ? 'kmeans'
      : config.task_type === 'CLASSIFICATION'
        ? /forest/.test(mt) ? 'rf' : /tree/.test(mt) ? 'dt' : /logistic/.test(mt) ? 'logreg' : /knn|neighbo/.test(mt) ? 'knn' : null
        : /forest/.test(mt) ? 'rf' : /tree/.test(mt) ? 'dt' : /linear/.test(mt) ? 'linear' : null;
    if (!algo) {
      throw new ValidationError(
        `Model '${config.model_type}' is not available for ${config.task_type.toLowerCase()}. Supported: ` +
          (config.task_type === 'CLASSIFICATION' ? 'Random Forest, Decision Tree, Logistic Regression, k-Nearest Neighbours.' : 'Linear Regression, Decision Tree Regressor, Random Forest Regressor.')
      );
    }
    const hp = config.hyperparameters || {};
    const maxDepth = Math.max(1, Math.min(20, Number(hp.max_depth) || 6));
    const minSplit = Math.max(2, Number(hp.min_samples_split) || 2);
    const nEstimators = Math.max(1, Math.min(100, Number(hp.n_estimators) || 25));
    const seed = Number(config.random_seed ?? 42);

    log('TRAINING', `Training '${config.model_type}' on ${dims} encoded feature column(s)...`);

    let metrics: MLExperimentMetric = {};
    const lossCurve: Array<{ iteration: number; loss: number; val_loss?: number }> = [];
    let featureImportances: Array<{ feature: string; importance: number }> = [];
    const modelArtifact: FittedModelArtifact = {
      model_type: config.model_type,
      task_type: config.task_type,
      feature_names: featureNames,
      target_column: targetCol,
      algo,
      preprocess: spec,
    };
    let trainedFamily = '';
    let fitNote = '';

    if (isClustering) {
      trainedFamily = 'K-Means';
      const k = Math.max(2, Math.min(Number(hp.n_clusters) || 3, trainVecs.length));
      log('TRAINING', `K-Means clustering with k=${k} clusters.`);
      let centroids = Array.from({ length: k }, (_, i) => trainVecs[Math.floor((i * trainVecs.length) / k)]);
      let assignments: number[] = [];
      for (let iter = 1; iter <= 20; iter++) {
        assignments = trainVecs.map((vec) => {
          let best = 0;
          let bestD = Infinity;
          centroids.forEach((c, ci) => {
            const d = dist2(vec, c);
            if (d < bestD) { bestD = d; best = ci; }
          });
          return best;
        });
        let inertia = 0;
        centroids = centroids.map((c, ci) => {
          const members = trainVecs.filter((_, idx) => assignments[idx] === ci);
          if (members.length === 0) return c;
          const meanVec = Array.from({ length: dims }, (_, d) => members.reduce((acc, m) => acc + m[d], 0) / members.length);
          members.forEach((m) => { inertia += dist2(m, meanVec); });
          return meanVec;
        });
        lossCurve.push({ iteration: iter, loss: parseFloat(inertia.toFixed(2)) });
      }
      const clusterDistribution: Record<string, number> = {};
      assignments.forEach((c) => {
        const label = `Cluster ${c + 1}`;
        clusterDistribution[label] = (clusterDistribution[label] || 0) + 1;
      });
      let silSum = 0;
      trainVecs.forEach((v, i) => {
        const own = assignments[i];
        const meanDistTo = (cluster: number) => {
          const ds = trainVecs.filter((_, j) => j !== i && assignments[j] === cluster).map((w) => Math.sqrt(dist2(v, w)));
          return ds.length ? ds.reduce((x, y) => x + y, 0) / ds.length : 0;
        };
        const aI = meanDistTo(own);
        let bI = Infinity;
        for (let c = 0; c < k; c++) if (c !== own && clusterDistribution[`Cluster ${c + 1}`]) bI = Math.min(bI, meanDistTo(c));
        if (!isFinite(bI)) bI = 0;
        silSum += Math.max(aI, bI) > 0 ? (bI - aI) / Math.max(aI, bI) : 0;
      });
      const silhouette = parseFloat((silSum / (trainVecs.length || 1)).toFixed(3));
      const finalInertia = lossCurve[lossCurve.length - 1]?.loss ?? 0;
      metrics = { inertia: finalInertia, silhouette_score: silhouette, cluster_distribution: clusterDistribution, cluster_centers: centroids };
      const spread = Array.from({ length: dims }, (_, d) => {
        const vals = centroids.map((c) => c[d]);
        return Math.max(...vals) - Math.min(...vals);
      });
      featureImportances = collapseImportance(spec, spread);
      modelArtifact.centroids = centroids;
      fitNote = `Clustering: k=${k}, silhouette ${silhouette} (closer to 1 means better separated clusters).`;
      log('EVALUATING', `Clustering completed with Inertia: ${finalInertia}, Silhouette Score: ${silhouette}.`);
    } else if (config.task_type === 'CLASSIFICATION') {
      const trainLabels = trainRows.map((r) => String(r[targetCol]));
      const testLabels = testRows.map((r) => String(r[targetCol]));
      const distinctClasses = Array.from(new Set([...trainLabels, ...testLabels])).sort();
      if (distinctClasses.length > 50) throw new ValidationError(`Target '${targetCol}' has ${distinctClasses.length} distinct values; choose regression or a categorical target.`);
      if (new Set(trainLabels).size < 2) throw new ValidationError(`The training rows contain only one class of '${targetCol}', so a classifier cannot be trained.`);
      modelArtifact.class_labels = distinctClasses;
      log('TRAINING', `Detected target classes: [${distinctClasses.join(', ')}].`);

      let predictVec: (v: number[], excludeIdx?: number) => { label: string; probs?: Record<string, number> };
      const imp = Array(dims).fill(0);
      if (algo === 'knn') {
        trainedFamily = 'k-Nearest Neighbours';
        const kNN = Math.max(1, Math.min(Number(hp.n_neighbors) || 5, trainVecs.length - 1 || 1));
        predictVec = (vec, excludeIdx = -1) => {
          const nearest = trainVecs.map((t, i) => ({ i, d: dist2(vec, t) })).filter((x) => x.i !== excludeIdx).sort((x, y) => x.d - y.d).slice(0, kNN);
          const votes: Record<string, number> = {};
          nearest.forEach((n) => { votes[trainLabels[n.i]] = (votes[trainLabels[n.i]] || 0) + 1; });
          const label = Object.entries(votes).sort((x, y) => y[1] - x[1] || x[0].localeCompare(y[0]))[0]?.[0] ?? distinctClasses[0];
          return { label };
        };
        modelArtifact.knn = { k: kNN, vectors: trainVecs, labels: trainLabels };
      } else if (algo === 'dt') {
        trainedFamily = 'Decision Tree (CART, Gini)';
        const tree = fitTree(trainVecs, trainLabels, { task: 'classification', maxDepth, minSamplesSplit: minSplit }, imp);
        predictVec = (vec) => ({ label: String(treeLeaf(tree, vec).value) });
        modelArtifact.tree = tree;
        log('TRAINING', `Grew a tree of depth ${treeDepth(tree)} (max_depth ${maxDepth}).`);
      } else if (algo === 'rf') {
        trainedFamily = 'Random Forest (bagged CART trees)';
        const forest = fitForest(trainVecs, trainLabels, { task: 'classification', maxDepth, minSamplesSplit: minSplit, nEstimators, seed }, imp);
        predictVec = (vec) => {
          const p = forestPredict(forest, vec, 'classification');
          return { label: String(p.value), probs: p.probs };
        };
        modelArtifact.forest = forest;
        log('TRAINING', `Trained ${forest.length} trees on bootstrap samples (max_depth ${maxDepth}).`);
      } else {
        trainedFamily = 'Logistic Regression (softmax, gradient descent)';
        const lr = Math.max(1e-4, Math.min(5, Number(hp.learning_rate) || 0.1));
        const epochs = Math.max(10, Math.min(2000, Number(hp.epochs) || 300));
        const { model, curve } = fitLogistic(trainVecs, trainLabels, distinctClasses, { learningRate: lr, epochs, valX: testVecs, valY: testLabels });
        lossCurve.push(...curve);
        predictVec = (vec) => {
          const p = logisticProbs(model, vec);
          const probs: Record<string, number> = {};
          distinctClasses.forEach((c, k) => (probs[c] = parseFloat(p[k].toFixed(3))));
          return { label: distinctClasses[p.indexOf(Math.max(...p))], probs };
        };
        model.W.forEach((w) => w.slice(0, dims).forEach((v, d) => (imp[d] += Math.abs(v))));
        modelArtifact.logistic = model;
        log('TRAINING', `Gradient descent: ${epochs} epochs, learning rate ${lr}; final training log-loss ${curve[curve.length - 1]?.loss}.`);
      }

      const numClasses = distinctClasses.length;
      const confMatrix: number[][] = Array.from({ length: numClasses }, () => Array(numClasses).fill(0));
      testVecs.forEach((v, i) => {
        const a = distinctClasses.indexOf(testLabels[i]);
        const p = distinctClasses.indexOf(predictVec(v).label);
        if (a >= 0 && p >= 0) confMatrix[a][p]++;
      });
      const correct = confMatrix.reduce((acc, row, i) => acc + row[i], 0);
      const accuracy = parseFloat((correct / (testRows.length || 1)).toFixed(4));
      const classificationReport: Record<string, any> = {};
      let macroP = 0, macroR = 0, macroF = 0;
      distinctClasses.forEach((cls, idx) => {
        const tp = confMatrix[idx][idx];
        const predicted = confMatrix.reduce((acc, row) => acc + row[idx], 0);
        const support = confMatrix[idx].reduce((x, y) => x + y, 0);
        const precision = predicted ? tp / predicted : 0;
        const recall = support ? tp / support : 0;
        const f1 = precision + recall ? (2 * precision * recall) / (precision + recall) : 0;
        macroP += precision; macroR += recall; macroF += f1;
        classificationReport[cls] = { precision: parseFloat(precision.toFixed(2)), recall: parseFloat(recall.toFixed(2)), f1: parseFloat(f1.toFixed(2)), support };
      });

      if (algo === 'knn') {
        // Permutation importance: accuracy drop when one encoded column is shifted across test rows.
        const accOn = (vecs: number[][]) => (vecs.length ? vecs.filter((v, i) => predictVec(v).label === testLabels[i]).length / vecs.length : 0);
        const drops = Array.from({ length: dims }, (_, d) => {
          const permuted = testVecs.map((v, i) => {
            const copy = [...v];
            copy[d] = testVecs[(i + 1) % testVecs.length][d];
            return copy;
          });
          return Math.max(0, accuracy - accOn(permuted));
        });
        featureImportances = collapseImportance(spec, drops);
      } else {
        featureImportances = collapseImportance(spec, imp);
      }

      const trainAcc = trainVecs.length ? trainVecs.filter((v, i) => predictVec(v, algo === 'knn' ? i : -1).label === trainLabels[i]).length / trainVecs.length : 0;
      fitNote = `${algo === 'knn' ? 'Leave-one-out training' : 'Training'} accuracy ${Math.round(trainAcc * 100)}% vs held-out accuracy ${Math.round(accuracy * 100)}%` +
        (trainAcc - accuracy > 0.1 ? ' — a large gap suggests overfitting.' : trainAcc < 0.6 ? ' — low training accuracy suggests underfitting.' : ' — no large generalisation gap.');
      metrics = {
        accuracy,
        precision: parseFloat((macroP / (numClasses || 1)).toFixed(4)),
        recall: parseFloat((macroR / (numClasses || 1)).toFixed(4)),
        f1_score: parseFloat((macroF / (numClasses || 1)).toFixed(4)),
        confusion_matrix: confMatrix,
        class_labels: distinctClasses,
        classification_report: classificationReport,
      };
      log('EVALUATING', `Held-out evaluation on ${testRows.length} rows: Accuracy=${Math.round(accuracy * 100)}%, macro F1=${metrics.f1_score}.`);
    } else {
      const y = trainRows.map((r) => Number(r[targetCol]));
      if (y.some((v) => !Number.isFinite(v))) throw new ValidationError(`Target '${targetCol}' must be numeric for regression.`);
      const imp = Array(dims).fill(0);
      let predictRow: (vec: number[]) => number;
      if (algo === 'linear') {
        trainedFamily = 'Linear Regression (least squares)';
        const X = trainVecs.map((v) => [1, ...v]);
        const p = dims + 1;
        const A = Array.from({ length: p }, (_, i) => Array.from({ length: p }, (_, j) => X.reduce((acc, row) => acc + row[i] * row[j], 0) + (i === j && i > 0 ? 1e-6 : 0)));
        const bVec = Array.from({ length: p }, (_, i) => X.reduce((acc, row, n) => acc + row[i] * y[n], 0));
        for (let col = 0; col < p; col++) {
          let pivot = col;
          for (let r = col + 1; r < p; r++) if (Math.abs(A[r][col]) > Math.abs(A[pivot][col])) pivot = r;
          [A[col], A[pivot]] = [A[pivot], A[col]];
          [bVec[col], bVec[pivot]] = [bVec[pivot], bVec[col]];
          const div = A[col][col] || 1e-12;
          for (let r = 0; r < p; r++) {
            if (r === col) continue;
            const factor = A[r][col] / div;
            for (let c = col; c < p; c++) A[r][c] -= factor * A[col][c];
            bVec[r] -= factor * bVec[col];
          }
        }
        const w = bVec.map((v, i) => v / (A[i][i] || 1e-12));
        predictRow = (vec) => w[0] + vec.reduce((acc, v, d) => acc + v * w[d + 1], 0);
        w.slice(1).forEach((v, d) => (imp[d] = Math.abs(v)));
        modelArtifact.weights = w.slice(1);
        modelArtifact.bias = w[0];
      } else if (algo === 'dt') {
        trainedFamily = 'Decision Tree Regressor (CART, variance)';
        const tree = fitTree(trainVecs, y, { task: 'regression', maxDepth, minSamplesSplit: minSplit }, imp);
        predictRow = (vec) => Number(treeLeaf(tree, vec).value);
        modelArtifact.tree = tree;
        log('TRAINING', `Grew a tree of depth ${treeDepth(tree)} (max_depth ${maxDepth}).`);
      } else {
        trainedFamily = 'Random Forest Regressor (bagged CART trees)';
        const forest = fitForest(trainVecs, y, { task: 'regression', maxDepth, minSamplesSplit: minSplit, nEstimators, seed }, imp);
        predictRow = (vec) => Number(forestPredict(forest, vec, 'regression').value);
        modelArtifact.forest = forest;
        log('TRAINING', `Trained ${forest.length} trees on bootstrap samples (max_depth ${maxDepth}).`);
      }

      const residuals: Array<{ actual: number; predicted: number; residual: number }> = [];
      let totalAbsErr = 0, totalSqErr = 0, totalVariance = 0;
      const actualValues = testRows.map((r) => Number(r[targetCol]) || 0);
      const actualMean = actualValues.reduce((x, z) => x + z, 0) / (actualValues.length || 1);
      testVecs.forEach((v, i) => {
        const actual = actualValues[i];
        const predicted = parseFloat(predictRow(v).toFixed(2));
        const residual = parseFloat((actual - predicted).toFixed(2));
        residuals.push({ actual, predicted, residual });
        totalAbsErr += Math.abs(residual);
        totalSqErr += residual * residual;
        totalVariance += (actual - actualMean) * (actual - actualMean);
      });
      const n = testRows.length || 1;
      const mae = parseFloat((totalAbsErr / n).toFixed(2));
      const mse = parseFloat((totalSqErr / n).toFixed(2));
      const rmse = parseFloat(Math.sqrt(mse).toFixed(2));
      const r2 = parseFloat((totalVariance ? 1 - totalSqErr / totalVariance : 0).toFixed(4));
      featureImportances = collapseImportance(spec, imp);
      const trainRmse = Math.sqrt(trainVecs.reduce((acc, v, i) => acc + Math.pow(y[i] - predictRow(v), 2), 0) / (trainVecs.length || 1));
      fitNote = `Training RMSE ${trainRmse.toFixed(2)} vs held-out RMSE ${rmse}` + (rmse > trainRmse * 1.5 ? ' — the gap suggests overfitting.' : ' — no large generalisation gap.');
      metrics = { mae, mse, rmse, r2_score: r2, residuals: residuals.slice(0, 50) };
      log('EVALUATING', `Held-out evaluation on ${testRows.length} rows: R² Score=${r2}, RMSE=${rmse}, MAE=${mae}.`);
    }

    // Feature schema for the prediction form, from the fitted preprocessing (real categories and ranges).
    const feature_schema = spec.features.map((f) => {
      const meta = dataset.columns_metadata?.find((c) => c.name === f.name);
      return {
        name: f.name,
        type: (f.kind === 'categorical' ? 'CATEGORICAL' : 'NUMERICAL') as 'NUMERICAL' | 'CATEGORICAL',
        default_val: f.kind === 'categorical' ? f.fill ?? f.categories?.[0] ?? '' : meta?.mean ?? f.fill ?? 0,
        options: f.kind === 'categorical' ? f.categories : undefined,
        min: meta?.min,
        max: meta?.max,
      };
    });

    const experiment: MLExperimentEntity = {
      id: expId,
      student_id: studentId,
      workspace_id: config.workspace_id,
      name: config.name,
      dataset_name: dataset.name,
      target_column: targetCol,
      feature_columns: featureNames,
      model_type: config.model_type,
      algorithm: trainedFamily,
      preprocessing_applied: { missing_value_strategy: spec.missing, scaling: spec.scaling, categorical_encoding: 'ONE_HOT', encoded_columns: spec.expanded.length },
      hyperparameters: config.hyperparameters || {},
      train_split: splitRatio,
      status: 'COMPLETED',
      logs,
      metrics,
      insights: {
        underfitting_or_overfitting: (isClustering ? 'Clustering. ' : '') + fitNote,
        feature_importance: featureImportances,
        loss_curve: lossCurve,
        recommendations: [
          `Trained model family: ${trainedFamily}.`,
          'Metrics come from a single held-out split; re-run with another random_seed to see how stable they are.',
        ],
      },
      feature_schema,
      duration_ms: Date.now() - startTime,
      created_at: new Date().toISOString(),
    };

    this.experiments.set(expId, experiment);
    this.fittedModels.set(expId, modelArtifact);

    log('COMPLETED', `Training pipeline finalized successfully in ${experiment.duration_ms}ms.`);
    return experiment;
  }

  public static getExperiments(studentId: string, workspaceId?: string): MLExperimentEntity[] {
    const list = Array.from(this.experiments.values()).filter((e) => e.student_id === studentId);
    if (workspaceId) {
      return list.filter((e) => e.workspace_id === workspaceId);
    }
    return list;
  }

  public static getExperimentById(studentId: string, experimentId: string): MLExperimentEntity {
    const exp = this.experiments.get(experimentId);
    // Another student's experiment is reported as not found, never returned.
    if (!exp || exp.student_id !== studentId) throw new NotFoundError(`Experiment '${experimentId}' not found`);
    return exp;
  }

  // -------------------------------------------------------------
  // Test Model & Make Live Prediction
  // -------------------------------------------------------------
  /** studentId -> prediction history (newest first). Persisted. */
  private static predictions: Map<string, Array<{ id: string; experiment_id: string; experiment_name: string; inputs: Record<string, any>; result: MLPredictionResult; created_at: string }>> = new Map();

  public static getPredictions(studentId: string, experimentId?: string) {
    const list = this.predictions.get(studentId) || [];
    return experimentId ? list.filter((p) => p.experiment_id === experimentId) : list;
  }

  public static predict(studentId: string, experimentId: string, inputs: Record<string, any>): MLPredictionResult {
    const exp = this.getExperimentById(studentId, experimentId);
    const artifact = this.fittedModels.get(experimentId);
    if (!artifact) {
      throw new ValidationError('This experiment has no saved model. Re-run it to make predictions.');
    }
    const result = artifact.preprocess ? this.predictWithSpec(exp, artifact, inputs || {}) : this.predictLegacy(exp, artifact, inputs || {});
    const list = this.predictions.get(studentId) || [];
    list.unshift({ id: `pred_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, experiment_id: exp.id, experiment_name: exp.name, inputs, result, created_at: new Date().toISOString() });
    this.predictions.set(studentId, list.slice(0, 200));
    return result;
  }

  private static predictWithSpec(exp: MLExperimentEntity, artifact: FittedModelArtifact, inputs: Record<string, any>): MLPredictionResult {
    const spec = artifact.preprocess!;
    // Validate every feature: numeric features need numbers, categorical ones a known category.
    const problems: string[] = [];
    for (const f of spec.features) {
      const v = inputs[f.name];
      if (v === undefined || v === null || v === '') problems.push(`${f.name} is required`);
      else if (f.kind === 'numeric' && !Number.isFinite(Number(v))) problems.push(`${f.name} must be a number`);
      else if (f.kind === 'categorical' && !(f.categories || []).includes(String(v))) problems.push(`${f.name} must be one of: ${(f.categories || []).join(', ')}`);
    }
    if (problems.length) throw new ValidationError(`Invalid prediction input: ${problems.join('; ')}.`);
    const vec = transformRow(spec, inputs);
    const dist2 = (x: number[], y: number[]) => x.reduce((acc, v, d) => acc + (v - y[d]) * (v - y[d]), 0);
    const task = artifact.task_type;
    if (task === 'CLUSTERING' && artifact.centroids?.length) {
      const ds = artifact.centroids.map((c) => dist2(vec, c));
      const best = ds.indexOf(Math.min(...ds));
      return { predicted_value: `Cluster ${best + 1}`, predicted_label: `Cluster ${best + 1}`, explanation: `Nearest centroid is Cluster ${best + 1} (squared distance ${ds[best].toFixed(3)} in the scaled feature space).` } as MLPredictionResult;
    }
    if (task === 'CLASSIFICATION') {
      let label = '';
      let probs: Record<string, number> | undefined;
      let explanation = '';
      if (artifact.algo === 'knn' && artifact.knn) {
        const nearest = artifact.knn.vectors.map((t, i) => ({ i, d: dist2(vec, t) })).sort((x, y) => x.d - y.d).slice(0, artifact.knn.k);
        const votes: Record<string, number> = {};
        nearest.forEach((n) => (votes[artifact.knn!.labels[n.i]] = (votes[artifact.knn!.labels[n.i]] || 0) + 1));
        probs = {};
        (artifact.class_labels || []).forEach((l) => (probs![l] = parseFloat(((votes[l] || 0) / nearest.length).toFixed(2))));
        label = Object.entries(votes).sort((x, y) => y[1] - x[1] || x[0].localeCompare(y[0]))[0][0];
        explanation = `${votes[label]} of the ${nearest.length} nearest training rows are '${label}'.`;
      } else if (artifact.algo === 'dt' && artifact.tree) {
        const leaf = treeLeaf(artifact.tree, vec);
        label = String(leaf.value);
        probs = {};
        Object.entries(leaf.dist || {}).forEach(([k, n]) => (probs![k] = parseFloat((n / leaf.n).toFixed(2))));
        explanation = `The tree leaf holds ${leaf.n} training rows; most are '${label}'.`;
      } else if (artifact.algo === 'rf' && artifact.forest) {
        const p = forestPredict(artifact.forest, vec, 'classification');
        label = String(p.value);
        probs = p.probs;
        explanation = `${Math.round((p.probs?.[label] || 0) * artifact.forest.length)} of ${artifact.forest.length} trees voted '${label}'.`;
      } else if (artifact.algo === 'logreg' && artifact.logistic) {
        const p = logisticProbs(artifact.logistic, vec);
        probs = {};
        artifact.logistic.classes.forEach((c, k) => (probs![c] = parseFloat(p[k].toFixed(3))));
        label = artifact.logistic.classes[p.indexOf(Math.max(...p))];
        explanation = `Softmax probability of '${label}' is ${(probs[label] * 100).toFixed(1)}%.`;
      } else {
        throw new ValidationError('The saved model is incomplete. Re-run the experiment.');
      }
      return { predicted_value: label, predicted_label: label, class_probabilities: probs, confidence: probs?.[label], explanation };
    }
    let value: number;
    if (artifact.algo === 'dt' && artifact.tree) value = Number(treeLeaf(artifact.tree, vec).value);
    else if (artifact.algo === 'rf' && artifact.forest) value = Number(forestPredict(artifact.forest, vec, 'regression').value);
    else value = (artifact.bias || 0) + vec.reduce((acc, v, d) => acc + v * (artifact.weights?.[d] || 0), 0);
    return { predicted_value: parseFloat(value.toFixed(2)), explanation: `${exp.algorithm || exp.model_type} prediction. Held-out MAE for this model: ${exp.metrics.mae ?? 'n/a'}.` } as MLPredictionResult;
  }

  /** Models trained before preprocessing specs were stored (standardised numeric features only). */
  private static predictLegacy(exp: MLExperimentEntity, artifact: FittedModelArtifact, inputs: Record<string, any>): MLPredictionResult {
    const vec = artifact.feature_names.map((f) => ((Number(inputs[f]) || 0) - (artifact.means?.[f] ?? 0)) / (artifact.stds?.[f] || 1));
    const dist2 = (x: number[], y: number[]) => x.reduce((acc, v, d) => acc + (v - y[d]) * (v - y[d]), 0);
    if (artifact.task_type === 'CLUSTERING' && artifact.centroids?.length) {
      const ds = artifact.centroids.map((c) => dist2(vec, c));
      const best = ds.indexOf(Math.min(...ds));
      return { predicted_value: `Cluster ${best + 1}`, predicted_label: `Cluster ${best + 1}`, explanation: `Nearest centroid is Cluster ${best + 1}.` } as MLPredictionResult;
    }
    if (artifact.task_type === 'CLASSIFICATION' && artifact.knn) {
      const nearest = artifact.knn.vectors.map((t, i) => ({ i, d: dist2(vec, t) })).sort((x, y) => x.d - y.d).slice(0, artifact.knn.k);
      const votes: Record<string, number> = {};
      nearest.forEach((n) => (votes[artifact.knn!.labels[n.i]] = (votes[artifact.knn!.labels[n.i]] || 0) + 1));
      const chosen = Object.entries(votes).sort((x, y) => y[1] - x[1] || x[0].localeCompare(y[0]))[0][0];
      return { predicted_value: chosen, predicted_label: chosen, explanation: `${votes[chosen]} of the ${nearest.length} nearest training rows are '${chosen}'.` };
    }
    const predicted = (artifact.bias || 0) + vec.reduce((acc, v, d) => acc + v * (artifact.weights?.[d] || 0), 0);
    return { predicted_value: parseFloat(predicted.toFixed(2)), explanation: `Linear model prediction. Held-out MAE: ${exp.metrics.mae ?? 'n/a'}.` } as MLPredictionResult;
  }
}
