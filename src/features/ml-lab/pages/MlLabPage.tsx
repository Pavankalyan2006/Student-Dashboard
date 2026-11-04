// src/features/ml-lab/pages/MlLabPage.tsx
// Complete AI/ML Lab with:
// 1. ML Workspaces & Multi-file Code Upload / Code Editor
// 2. CSV/JSON Dataset Manager & Profiler (Missing values, Types, Distributions)
// 3. Configurable Model Training (Random Forest, Decision Tree, Logistic/Linear Regression, K-Means)
// 4. Real Mathematical Training Engine & Timestamped Console Logs
// 5. Evaluation Visualizations (Confusion Matrix, Feature Importances, Loss Curves)
// 6. Interactive Live Model Prediction Tester

import * as React from 'react';
import {
  Cpu,
  Sparkles,
  BarChart2,
  Play,
  Layers,
  Database,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  FileSpreadsheet,
  Settings2,
  Table,
  Upload,
  FileCode,
  FolderPlus,
  Trash2,
  Edit2,
  Save,
  Check,
  ChevronRight,
  Terminal,
  Activity,
  Zap,
  Target,
  Sliders,
  FileText,
  BarChart3,
  Search,
  RefreshCw,
} from 'lucide-react';
import { PageContainer, PageHeader, LoadingState, EmptyState } from '../../../components/layout/PageComponents';
import { Button } from '../../../components/ui/button';
import { learningModulesApi } from '../../../api/learningModulesApi';
import {
  MLDataset,
  MLExperimentEntity,
  MLWorkspace,
  MLWorkspaceFile,
  MLPredictionResult,
} from '../../../types/learningModules';
import { toast } from 'sonner';

interface MlLabPageProps {
  onNavigate?: (path: string) => void;
}

export function MlLabPage({ onNavigate }: MlLabPageProps) {
  // Navigation & Data State
  const [workspaces, setWorkspaces] = React.useState<MLWorkspace[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = React.useState<MLWorkspace | null>(null);
  const [datasets, setDatasets] = React.useState<MLDataset[]>([]);
  const [selectedDataset, setSelectedDataset] = React.useState<MLDataset | null>(null);
  const [experiments, setExperiments] = React.useState<MLExperimentEntity[]>([]);
  const [selectedExperiment, setSelectedExperiment] = React.useState<MLExperimentEntity | null>(null);
  const [loading, setLoading] = React.useState(true);

  // Active View Tab
  const [activeTab, setActiveTab] = React.useState<'workspaces' | 'datasets' | 'train' | 'results' | 'predict' | 'history'>('workspaces');

  // Workspace Code Editor State
  const [selectedFile, setSelectedFile] = React.useState<MLWorkspaceFile | null>(null);
  const [fileContent, setFileContent] = React.useState('');
  const [isSavingFile, setIsSavingFile] = React.useState(false);
  const [showUploadFileModal, setShowUploadFileModal] = React.useState(false);
  const [newFileName, setNewFileName] = React.useState('model.py');
  const [newFileContent, setNewFileContent] = React.useState('');

  // New Workspace Modal
  const [showNewWorkspaceModal, setShowNewWorkspaceModal] = React.useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = React.useState('');
  const [newWorkspaceTask, setNewWorkspaceTask] = React.useState<'CLASSIFICATION' | 'REGRESSION' | 'CLUSTERING'>('CLASSIFICATION');
  const [newWorkspaceDesc, setNewWorkspaceDesc] = React.useState('');

  // Dataset Upload Modal
  const [showUploadDatasetModal, setShowUploadDatasetModal] = React.useState(false);
  const [newDatasetName, setNewDatasetName] = React.useState('');
  const [newDatasetCsv, setNewDatasetCsv] = React.useState('');
  const [isUploadingDataset, setIsUploadingDataset] = React.useState(false);

  // Model Training Form State
  const [expName, setExpName] = React.useState('Iris Random Forest v1');
  const [modelType, setModelType] = React.useState('Random Forest');
  const [taskType, setTaskType] = React.useState<'CLASSIFICATION' | 'REGRESSION' | 'CLUSTERING'>('CLASSIFICATION');
  const [targetColumn, setTargetColumn] = React.useState('');
  const [selectedFeatures, setSelectedFeatures] = React.useState<string[]>([]);
  const [trainSplit, setTrainSplit] = React.useState(0.8);
  const [imputationStrategy, setImputationStrategy] = React.useState<'MEAN' | 'MEDIAN' | 'DROP'>('MEAN');
  const [scalingStrategy, setScalingStrategy] = React.useState<'STANDARD' | 'MINMAX' | 'NONE'>('STANDARD');
  // Hyperparameters
  const [nEstimators, setNEstimators] = React.useState(100);
  const [maxDepth, setMaxDepth] = React.useState(4);
  const [learningRate, setLearningRate] = React.useState(0.05);
  const [nClusters, setNClusters] = React.useState(3);
  const [isTraining, setIsTraining] = React.useState(false);

  // Prediction Tester State
  const [predictionInputs, setPredictionInputs] = React.useState<Record<string, any>>({});
  const [predictionResult, setPredictionResult] = React.useState<MLPredictionResult | null>(null);
  const [isPredicting, setIsPredicting] = React.useState(false);

  // Load Initial Lab Data
  const loadInitialData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [fetchedWorkspaces, fetchedDatasets, fetchedExps] = await Promise.all([
        learningModulesApi.mlLab.getWorkspaces().catch(() => []),
        learningModulesApi.mlLab.getDatasets(),
        learningModulesApi.mlLab.getExperiments(),
      ]);

      setWorkspaces(fetchedWorkspaces);
      if (fetchedWorkspaces.length > 0 && !selectedWorkspace) {
        setSelectedWorkspace(fetchedWorkspaces[0]);
        if (fetchedWorkspaces[0].files.length > 0) {
          setSelectedFile(fetchedWorkspaces[0].files[0]);
          setFileContent(fetchedWorkspaces[0].files[0].content);
        }
      }

      setDatasets(fetchedDatasets);
      if (fetchedDatasets.length > 0 && !selectedDataset) {
        setSelectedDataset(fetchedDatasets[0]);
        setTargetColumn(fetchedDatasets[0].target_column);
        setSelectedFeatures(fetchedDatasets[0].features);
      }

      setExperiments(fetchedExps);
      if (fetchedExps.length > 0 && !selectedExperiment) {
        setSelectedExperiment(fetchedExps[0]);
      }
    } catch (err: any) {
      toast.error('Failed to load ML Lab data: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedWorkspace, selectedDataset, selectedExperiment]);

  React.useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Synchronize Dataset Selection with Training Wizard
  React.useEffect(() => {
    if (selectedDataset) {
      setTargetColumn(selectedDataset.target_column || '');
      setSelectedFeatures(selectedDataset.features || []);
      setTaskType(selectedDataset.task_type || 'CLASSIFICATION');
      if (selectedDataset.task_type === 'REGRESSION') {
        setModelType('Linear Regression');
      } else if (selectedDataset.task_type === 'CLUSTERING') {
        setModelType('K-Means');
      } else {
        setModelType('Random Forest');
      }
    }
  }, [selectedDataset]);

  // Synchronize Prediction Inputs when Experiment Changes
  React.useEffect(() => {
    if (selectedExperiment?.feature_schema) {
      const initialInputs: Record<string, any> = {};
      selectedExperiment.feature_schema.forEach((f) => {
        initialInputs[f.name] = f.default_val;
      });
      setPredictionInputs(initialInputs);
      setPredictionResult(null);
    }
  }, [selectedExperiment]);

  // File Save Handler
  const handleSaveFile = async () => {
    if (!selectedWorkspace || !selectedFile) return;
    try {
      setIsSavingFile(true);
      await learningModulesApi.mlLab.updateFile(selectedWorkspace.id, selectedFile.id, fileContent);
      toast.success(`Saved changes to '${selectedFile.name}'`);
      selectedFile.content = fileContent;
    } catch (err: any) {
      toast.error('Failed to save file: ' + err.message);
    } finally {
      setIsSavingFile(false);
    }
  };

  // Upload/Create File Handler
  const handleCreateFile = async () => {
    if (!selectedWorkspace || !newFileName.trim()) return;
    try {
      const file = await learningModulesApi.mlLab.addFile(selectedWorkspace.id, {
        name: newFileName.trim(),
        content: newFileContent || '# Python ML Script\nimport numpy as np\n',
      });
      toast.success(`Added file '${file.name}'`);
      setShowUploadFileModal(false);
      selectedWorkspace.files.push(file);
      setSelectedFile(file);
      setFileContent(file.content);
      setNewFileName('');
      setNewFileContent('');
    } catch (err: any) {
      toast.error('File creation error: ' + err.message);
    }
  };

  // Create Workspace Handler
  const handleCreateWorkspace = async () => {
    if (!newWorkspaceName.trim()) {
      toast.error('Please enter a workspace name');
      return;
    }
    try {
      const ws = await learningModulesApi.mlLab.createWorkspace({
        name: newWorkspaceName.trim(),
        description: newWorkspaceDesc,
        task_type: newWorkspaceTask,
      });
      toast.success(`Workspace '${ws.name}' created!`);
      setShowNewWorkspaceModal(false);
      setWorkspaces((prev) => [ws, ...prev]);
      setSelectedWorkspace(ws);
      setNewWorkspaceName('');
      setNewWorkspaceDesc('');
    } catch (err: any) {
      toast.error('Workspace creation failed: ' + err.message);
    }
  };

  // Upload Dataset Handler
  const handleUploadDataset = async () => {
    if (!newDatasetName.trim() || !newDatasetCsv.trim()) {
      toast.error('Please provide dataset name and CSV text');
      return;
    }
    try {
      setIsUploadingDataset(true);
      const ds = await learningModulesApi.mlLab.uploadDataset({
        name: newDatasetName.trim(),
        csvContent: newDatasetCsv.trim(),
        description: 'Uploaded student CSV dataset',
      });
      toast.success(`Dataset '${ds.name}' processed (${ds.total_samples} samples)!`);
      setShowUploadDatasetModal(false);
      setDatasets((prev) => [ds, ...prev]);
      setSelectedDataset(ds);
      setNewDatasetName('');
      setNewDatasetCsv('');
      setActiveTab('datasets');
    } catch (err: any) {
      toast.error('Dataset upload failed: ' + err.message);
    } finally {
      setIsUploadingDataset(false);
    }
  };

  // Feature Toggle Checkbox
  const toggleFeature = (feat: string) => {
    if (selectedFeatures.includes(feat)) {
      if (selectedFeatures.length <= 1) {
        toast.error('At least one feature must remain selected');
        return;
      }
      setSelectedFeatures((prev) => prev.filter((f) => f !== feat));
    } else {
      setSelectedFeatures((prev) => [...prev, feat]);
    }
  };

  // Run Training Experiment
  const handleStartTraining = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDataset) {
      toast.error('Please select a dataset');
      return;
    }
    if (!expName.trim()) {
      toast.error('Please name your experiment');
      return;
    }
    if (selectedFeatures.length === 0) {
      toast.error('Please select at least one feature');
      return;
    }

    try {
      setIsTraining(true);
      const hyperparameters: Record<string, any> = {};
      if (modelType.includes('Forest') || modelType.includes('Tree')) {
        hyperparameters.n_estimators = Number(nEstimators);
        hyperparameters.max_depth = Number(maxDepth);
      } else if (modelType.includes('Regression')) {
        hyperparameters.learning_rate = Number(learningRate);
        hyperparameters.epochs = 20;
      } else if (modelType.includes('K-Means') || modelType.includes('KMEANS')) {
        hyperparameters.n_clusters = Number(nClusters);
      }

      const exp = await learningModulesApi.mlLab.runExperiment({
        name: expName,
        workspace_id: selectedWorkspace?.id,
        dataset_id: selectedDataset.id,
        dataset_name: selectedDataset.name,
        target_column: taskType === 'CLUSTERING' ? undefined : targetColumn,
        feature_columns: selectedFeatures,
        task_type: taskType,
        model_type: modelType,
        train_split: Number(trainSplit),
        preprocessing: {
          missing_value_strategy: imputationStrategy,
          categorical_encoding: 'ONE_HOT',
          scaling: scalingStrategy,
        },
        hyperparameters,
      });

      toast.success(`Model '${exp.name}' trained successfully!`);
      setExperiments((prev) => [exp, ...prev]);
      setSelectedExperiment(exp);
      setActiveTab('results');
    } catch (err: any) {
      toast.error('Training failed: ' + err.message);
    } finally {
      setIsTraining(false);
    }
  };

  // Make Live Prediction on Trained Model
  const handleRunPrediction = async () => {
    if (!selectedExperiment) return;
    try {
      setIsPredicting(true);
      const res = await learningModulesApi.mlLab.predict(selectedExperiment.id, predictionInputs);
      setPredictionResult(res);
      toast.success('Inference calculated from fitted model!');
    } catch (err: any) {
      toast.error('Prediction failed: ' + err.message);
    } finally {
      setIsPredicting(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <PageHeader title="AI/ML Experiment Lab" description="Initializing student ML environment & datasets..." />
        <LoadingState message="MLExperimentAgent setting up scikit-learn models & tabular profiling engine..." />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="AI/ML Experiment Lab"
        description="End-to-end Machine Learning laboratory: multi-file code editor, real dataset profiler, decision tree/regression training, and live inference prediction."
        badge={
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Cpu className="w-3.5 h-3.5 text-emerald-600" />
            Real ML Execution
          </span>
        }
        actions={
          <div className="flex items-center gap-2">
            {/* Workspace Selector */}
            <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-300 rounded-lg px-2.5 py-1">
              <Layers className="w-4 h-4 text-slate-500" />
              <select
                value={selectedWorkspace?.id || ''}
                onChange={(e) => {
                  const ws = workspaces.find((w) => w.id === e.target.value);
                  if (ws) {
                    setSelectedWorkspace(ws);
                    if (ws.files.length > 0) {
                      setSelectedFile(ws.files[0]);
                      setFileContent(ws.files[0].content);
                    }
                  }
                }}
                className="bg-transparent text-sm font-semibold text-slate-800 focus:outline-none cursor-pointer"
              >
                {workspaces.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.task_type})
                  </option>
                ))}
              </select>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowNewWorkspaceModal(true)}
              className="text-slate-700 border-slate-300 hover:bg-slate-50 text-xs"
            >
              <FolderPlus className="w-4 h-4 mr-1 text-slate-600" />
              New Project
            </Button>

            <Button
              size="sm"
              onClick={() => setActiveTab('train')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
            >
              <Play className="w-3.5 h-3.5 mr-1 fill-current" />
              Train Model
            </Button>
          </div>
        }
      />

      {/* Lab Tabs Navigation */}
      <div className="flex items-center gap-1 border-b border-slate-200 mb-6 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('workspaces')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'workspaces'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileCode className="w-4 h-4" />
          Code Editor & Files ({selectedWorkspace?.files.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('datasets')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'datasets'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Database className="w-4 h-4" />
          Datasets & Profiling ({datasets.length})
        </button>
        <button
          onClick={() => setActiveTab('train')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'train'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Sliders className="w-4 h-4" />
          Model Configuration & Training
        </button>
        <button
          onClick={() => setActiveTab('results')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'results'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Evaluation & Charts
          {selectedExperiment && (
            <span className="ml-1 px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-xs rounded font-mono">
              {selectedExperiment.name}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('predict')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'predict'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Target className="w-4 h-4" />
          Live Prediction Tester
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'history'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Activity className="w-4 h-4" />
          Experiment Runs ({experiments.length})
        </button>
      </div>

      {/* TAB 1: WORKSPACES & CODE EDITOR */}
      {activeTab === 'workspaces' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* File Explorer Sidebar */}
          <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col h-[650px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div>
                <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-emerald-600" />
                  Project Files
                </h3>
                <p className="text-xs text-slate-400 font-mono">{selectedWorkspace?.name}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowUploadFileModal(true)}
                className="h-7 text-xs text-emerald-700 border-emerald-200 hover:bg-emerald-50"
              >
                <Upload className="w-3 h-3 mr-1" />
                Upload
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5">
              {selectedWorkspace?.files.map((file) => {
                const isSelected = selectedFile?.id === file.id;
                return (
                  <button
                    key={file.id}
                    onClick={() => {
                      setSelectedFile(file);
                      setFileContent(file.content);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-xs font-mono transition-all text-left ${
                      isSelected
                        ? 'bg-emerald-50 text-emerald-900 border border-emerald-300 font-bold'
                        : 'text-slate-700 hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{file.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {Math.round(file.size_bytes / 1024 * 10) / 10}KB
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Code Editor Pane */}
          <div className="lg:col-span-9 bg-slate-950 rounded-xl border border-slate-800 shadow-md flex flex-col h-[650px] overflow-hidden">
            {/* Editor Top Bar */}
            <div className="bg-slate-900 px-4 py-2.5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono text-slate-300 font-semibold">
                  {selectedFile ? selectedFile.name : 'No file selected'}
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-emerald-400 font-mono">
                  Python/YAML
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={handleSaveFile}
                  disabled={isSavingFile || !selectedFile}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-7"
                >
                  <Save className="w-3 h-3 mr-1" />
                  {isSavingFile ? 'Saving...' : 'Save Script'}
                </Button>
              </div>
            </div>

            {/* Code Textarea */}
            <div className="flex-1 p-4 overflow-hidden flex flex-col">
              <textarea
                value={fileContent}
                onChange={(e) => setFileContent(e.target.value)}
                disabled={!selectedFile}
                className="w-full flex-1 bg-transparent text-emerald-300 font-mono text-xs focus:outline-none resize-none leading-relaxed"
                placeholder="# Enter Python model script or configuration here..."
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DATASETS & PROFILER */}
      {activeTab === 'datasets' && (
        <div className="space-y-6">
          {/* Datasets Selector & Upload Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-slate-700">Active Dataset:</span>
              <select
                value={selectedDataset?.id || ''}
                onChange={(e) => {
                  const ds = datasets.find((d) => d.id === e.target.value);
                  if (ds) setSelectedDataset(ds);
                }}
                className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-800 focus:outline-none cursor-pointer"
              >
                {datasets.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.total_samples} samples, {d.task_type})
                  </option>
                ))}
              </select>
            </div>

            <Button
              size="sm"
              onClick={() => setShowUploadDatasetModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
            >
              <Upload className="w-3.5 h-3.5 mr-1.5" />
              Upload Custom CSV
            </Button>
          </div>

          {selectedDataset && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Dataset Profiling Cards */}
              <div className="lg:col-span-12 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-xs text-slate-500 font-medium">Total Samples</span>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{selectedDataset.total_samples}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-xs text-slate-500 font-medium">Features Available</span>
                  <p className="text-2xl font-bold text-emerald-600 mt-1">{selectedDataset.features.length}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-xs text-slate-500 font-medium">Target Attribute</span>
                  <p className="text-base font-bold text-slate-900 mt-2 font-mono truncate">
                    {selectedDataset.target_column || 'None (Unsupervised)'}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-xs text-slate-500 font-medium">Task Category</span>
                  <p className="text-base font-bold text-indigo-600 mt-2 font-mono">
                    {selectedDataset.task_type}
                  </p>
                </div>
              </div>

              {/* Column Statistics Table */}
              <div className="lg:col-span-12 bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-emerald-600" />
                  Statistical Column Profiler
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-slate-200 rounded-lg">
                    <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Column Name</th>
                        <th className="py-2.5 px-3">Data Type</th>
                        <th className="py-2.5 px-3">Missing Values</th>
                        <th className="py-2.5 px-3">Unique Values</th>
                        <th className="py-2.5 px-3">Mean</th>
                        <th className="py-2.5 px-3">Min / Max</th>
                        <th className="py-2.5 px-3">Standard Dev (σ)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {selectedDataset.columns_metadata?.map((col) => (
                        <tr key={col.name} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-semibold text-slate-800 flex items-center gap-1.5">
                            {col.name === selectedDataset.target_column && (
                              <Target className="w-3 h-3 text-red-500" aria-label="Target Column" />
                            )}
                            {col.name}
                          </td>
                          <td className="py-2 px-3">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] ${
                                col.data_type === 'NUMERICAL'
                                  ? 'bg-blue-100 text-blue-800 font-bold'
                                  : 'bg-amber-100 text-amber-800 font-bold'
                              }`}
                            >
                              {col.data_type}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-slate-600">
                            {col.missing_count === 0 ? (
                              <span className="text-emerald-600 font-bold">0 (Clean)</span>
                            ) : (
                              <span className="text-red-600 font-bold">{col.missing_count}</span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-slate-600">{col.unique_count}</td>
                          <td className="py-2 px-3 text-slate-800">{col.mean !== undefined ? col.mean : '—'}</td>
                          <td className="py-2 px-3 text-slate-800">
                            {col.min !== undefined && col.max !== undefined ? `${col.min} .. ${col.max}` : '—'}
                          </td>
                          <td className="py-2 px-3 text-slate-800">{col.std !== undefined ? col.std : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Data Preview Grid */}
              <div className="lg:col-span-12 bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <Table className="w-4 h-4 text-emerald-600" />
                  Dataset Preview (First Rows)
                </h4>
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-3 text-slate-400 font-mono w-10 text-center">#</th>
                        {Object.keys(selectedDataset.preview[0] || {}).map((k) => (
                          <th key={k} className="py-2 px-3 font-mono">
                            {k}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {selectedDataset.preview.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-2 px-3 text-slate-400 text-center">{idx + 1}</td>
                          {Object.values(row).map((val: any, vIdx) => (
                            <td key={vIdx} className="py-2 px-3 text-slate-800">
                              {String(val)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MODEL CONFIGURATION & TRAINING WIZARD */}
      {activeTab === 'train' && (
        <form onSubmit={handleStartTraining} className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-200">
              <Sliders className="w-5 h-5 text-emerald-600" />
              Machine Learning Training Configuration
            </h3>

            {/* Experiment Name & Dataset */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Experiment Name</label>
                <input
                  type="text"
                  value={expName}
                  onChange={(e) => setExpName(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm font-semibold focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. Iris Random Forest Depth-4"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Dataset</label>
                <select
                  value={selectedDataset?.id || ''}
                  onChange={(e) => {
                    const ds = datasets.find((d) => d.id === e.target.value);
                    if (ds) setSelectedDataset(ds);
                  }}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm font-semibold focus:ring-2 focus:ring-emerald-500"
                >
                  {datasets.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.task_type})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Task Type & Algorithm Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Learning Task</label>
                <select
                  value={taskType}
                  onChange={(e: any) => setTaskType(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm font-semibold focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="CLASSIFICATION">Classification (Categorical Target)</option>
                  <option value="REGRESSION">Regression (Continuous Numeric Target)</option>
                  <option value="CLUSTERING">Clustering (Unsupervised)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Model Algorithm</label>
                <select
                  value={modelType}
                  onChange={(e) => setModelType(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm font-semibold focus:ring-2 focus:ring-emerald-500"
                >
                  {taskType === 'CLASSIFICATION' && (
                    <>
                      <option value="Random Forest">Random Forest Classifier</option>
                      <option value="Decision Tree">Decision Tree Classifier</option>
                      <option value="Logistic Regression">Logistic Regression (Gradient Descent)</option>
                    </>
                  )}
                  {taskType === 'REGRESSION' && (
                    <>
                      <option value="Linear Regression">Linear Regression (Ordinary Least Squares)</option>
                      <option value="Decision Tree Regressor">Decision Tree Regressor</option>
                      <option value="Random Forest Regressor">Random Forest Regressor</option>
                    </>
                  )}
                  {taskType === 'CLUSTERING' && (
                    <option value="K-Means">K-Means Clustering (Lloyd's Algorithm)</option>
                  )}
                </select>
              </div>
            </div>

            {/* Target Column & Features Selector */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
              {taskType !== 'CLUSTERING' && (
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                    Target Column (Label to Predict)
                  </label>
                  <select
                    value={targetColumn}
                    onChange={(e) => setTargetColumn(e.target.value)}
                    className="border border-slate-300 rounded-lg p-2 text-xs font-mono font-bold text-slate-800 bg-white"
                  >
                    {selectedDataset?.columns_metadata?.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name} ({c.data_type})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Feature Columns ({selectedFeatures.length} selected)
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedFeatures(selectedDataset?.features || [])}
                      className="text-xs text-emerald-600 hover:underline font-medium"
                    >
                      Select All
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {selectedDataset?.features.map((feat) => {
                    const isChecked = selectedFeatures.includes(feat);
                    return (
                      <label
                        key={feat}
                        className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-mono cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                            : 'bg-white border-slate-200 text-slate-600'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleFeature(feat)}
                          className="rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="truncate">{feat}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Preprocessing & Split Sliders */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Train / Test Split: <span className="text-emerald-600 font-bold">{Math.round(trainSplit * 100)}% / {Math.round((1 - trainSplit) * 100)}%</span>
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="0.9"
                  step="0.05"
                  value={trainSplit}
                  onChange={(e) => setTrainSplit(parseFloat(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Missing Value Imputation</label>
                <select
                  value={imputationStrategy}
                  onChange={(e: any) => setImputationStrategy(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs font-semibold"
                >
                  <option value="MEAN">Mean Imputation</option>
                  <option value="MEDIAN">Median Imputation</option>
                  <option value="DROP">Drop Incomplete Rows</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Feature Scaling</label>
                <select
                  value={scalingStrategy}
                  onChange={(e: any) => setScalingStrategy(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs font-semibold"
                >
                  <option value="STANDARD">StandardScaler (Z-Score μ=0, σ=1)</option>
                  <option value="MINMAX">MinMaxScaler (0 .. 1 Range)</option>
                  <option value="NONE">None</option>
                </select>
              </div>
            </div>

            {/* Hyperparameters Form */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Algorithm Hyperparameters
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {modelType.includes('Forest') && (
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Number of Estimators</label>
                    <input
                      type="number"
                      value={nEstimators}
                      onChange={(e) => setNEstimators(Number(e.target.value))}
                      className="w-full border border-slate-300 rounded p-1.5 text-xs font-mono"
                    />
                  </div>
                )}
                {(modelType.includes('Tree') || modelType.includes('Forest')) && (
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Max Tree Depth</label>
                    <input
                      type="number"
                      value={maxDepth}
                      onChange={(e) => setMaxDepth(Number(e.target.value))}
                      className="w-full border border-slate-300 rounded p-1.5 text-xs font-mono"
                    />
                  </div>
                )}
                {modelType.includes('Regression') && (
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Learning Rate (α)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={learningRate}
                      onChange={(e) => setLearningRate(Number(e.target.value))}
                      className="w-full border border-slate-300 rounded p-1.5 text-xs font-mono"
                    />
                  </div>
                )}
                {(modelType.includes('K-Means') || modelType.includes('KMEANS')) && (
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Number of Clusters (k)</label>
                    <input
                      type="number"
                      min="2"
                      max="10"
                      value={nClusters}
                      onChange={(e) => setNClusters(Number(e.target.value))}
                      className="w-full border border-slate-300 rounded p-1.5 text-xs font-mono"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Submit Action */}
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="submit"
                disabled={isTraining}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2"
              >
                {isTraining ? 'Executing Training Pipeline...' : 'Start Model Training'}
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 4: EVALUATION & CHARTS */}
      {activeTab === 'results' && (
        <div className="space-y-6">
          {selectedExperiment ? (
            <>
              {/* Top Metrics Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {selectedExperiment.metrics.accuracy !== undefined ? (
                  <>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                      <span className="text-xs text-slate-500 font-medium">Test Accuracy</span>
                      <p className="text-2xl font-bold text-emerald-600 mt-1">
                        {Math.round(selectedExperiment.metrics.accuracy * 1000) / 10}%
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                      <span className="text-xs text-slate-500 font-medium">F1-Score</span>
                      <p className="text-2xl font-bold text-blue-600 mt-1">
                        {selectedExperiment.metrics.f1_score}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                      <span className="text-xs text-slate-500 font-medium">Precision</span>
                      <p className="text-2xl font-bold text-purple-600 mt-1">
                        {selectedExperiment.metrics.precision}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                      <span className="text-xs text-slate-500 font-medium">Recall</span>
                      <p className="text-2xl font-bold text-amber-600 mt-1">
                        {selectedExperiment.metrics.recall}
                      </p>
                    </div>
                  </>
                ) : selectedExperiment.metrics.r2_score !== undefined ? (
                  <>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                      <span className="text-xs text-slate-500 font-medium">R² Determination Score</span>
                      <p className="text-2xl font-bold text-emerald-600 mt-1">
                        {selectedExperiment.metrics.r2_score}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                      <span className="text-xs text-slate-500 font-medium">RMSE Error</span>
                      <p className="text-2xl font-bold text-blue-600 mt-1">
                        {selectedExperiment.metrics.rmse}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                      <span className="text-xs text-slate-500 font-medium">MAE Error</span>
                      <p className="text-2xl font-bold text-purple-600 mt-1">
                        {selectedExperiment.metrics.mae}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                      <span className="text-xs text-slate-500 font-medium">MSE Error</span>
                      <p className="text-2xl font-bold text-slate-700 mt-1">
                        {selectedExperiment.metrics.mse}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                      <span className="text-xs text-slate-500 font-medium">Cluster Inertia</span>
                      <p className="text-2xl font-bold text-emerald-600 mt-1">
                        {selectedExperiment.metrics.inertia}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                      <span className="text-xs text-slate-500 font-medium">Silhouette Score</span>
                      <p className="text-2xl font-bold text-blue-600 mt-1">
                        {selectedExperiment.metrics.silhouette_score}
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Confusion Matrix / Residuals Heatmap */}
              {selectedExperiment.metrics.confusion_matrix && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                  <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <Table className="w-4 h-4 text-emerald-600" />
                    Held-Out Test Set Confusion Matrix Heatmap
                  </h4>
                  <div className="flex flex-col items-center">
                    <div className="overflow-x-auto">
                      <table className="border-collapse text-xs font-mono text-center">
                        <thead>
                          <tr>
                            <th className="p-2"></th>
                            <th colSpan={selectedExperiment.metrics.class_labels?.length || 3} className="p-1 font-bold text-slate-500 text-[11px]">
                              PREDICTED CLASS
                            </th>
                          </tr>
                          <tr>
                            <th className="p-2 font-bold text-slate-500 text-[11px]">ACTUAL</th>
                            {selectedExperiment.metrics.class_labels?.map((label) => (
                              <th key={label} className="p-2 border border-slate-200 bg-slate-50 font-semibold text-slate-700 min-w-20">
                                {label}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {selectedExperiment.metrics.confusion_matrix.map((row, rIdx) => (
                            <tr key={rIdx}>
                              <th className="p-2 border border-slate-200 bg-slate-50 font-semibold text-slate-700 text-left">
                                {selectedExperiment.metrics.class_labels?.[rIdx] || `Class ${rIdx}`}
                              </th>
                              {row.map((val, cIdx) => {
                                const isDiagonal = rIdx === cIdx;
                                return (
                                  <td
                                    key={cIdx}
                                    className={`p-3 border border-slate-200 font-bold text-sm ${
                                      isDiagonal
                                        ? 'bg-emerald-100 text-emerald-900'
                                        : val > 0
                                        ? 'bg-red-50 text-red-800'
                                        : 'bg-slate-50 text-slate-400'
                                    }`}
                                  >
                                    {val}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Feature Importance & Loss Curves */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Feature Importance */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                  <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-emerald-600" />
                    Relative Feature Importance
                  </h4>
                  <div className="space-y-2.5">
                    {selectedExperiment.insights.feature_importance?.map((fi) => (
                      <div key={fi.feature} className="space-y-1">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-slate-700">{fi.feature}</span>
                          <span className="font-bold text-emerald-700">{Math.round(fi.importance * 100)}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-emerald-500 h-2 rounded-full transition-all"
                            style={{ width: `${Math.round(fi.importance * 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Training Loss Curve */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                  <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    Convergence & Loss Curve
                  </h4>
                  <div className="space-y-1 overflow-y-auto max-h-56 font-mono text-xs">
                    {selectedExperiment.insights.loss_curve?.map((lc) => (
                      <div key={lc.iteration} className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Epoch {lc.iteration}:</span>
                        <span className="font-semibold text-slate-800">Loss = {lc.loss}</span>
                        {lc.val_loss && <span className="text-blue-600">Val Loss = {lc.val_loss}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* AI Diagnostic Explanation */}
              <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2">
                <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  AI Model Tutor Insights & Recommendations
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {selectedExperiment.insights.underfitting_or_overfitting}
                </p>
                <ul className="list-disc list-inside text-xs text-slate-600 space-y-0.5">
                  {selectedExperiment.insights.recommendations.map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </div>

              {/* Real Training Execution Logs */}
              {selectedExperiment.logs && selectedExperiment.logs.length > 0 && (
                <div className="bg-slate-900 rounded-xl p-4 text-slate-200 space-y-2 font-mono text-xs">
                  <div className="flex items-center gap-2 text-slate-400 font-semibold pb-2 border-b border-slate-800">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    Training Sandbox Execution Logs ({selectedExperiment.duration_ms}ms)
                  </div>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {selectedExperiment.logs.map((lg, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="text-slate-500">{new Date(lg.timestamp).toLocaleTimeString()}</span>
                        <span className="text-emerald-400">[{lg.stage}]</span>
                        <span className="text-slate-300">{lg.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="p-12 text-center text-slate-500">
              <BarChart2 className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No experiment selected</p>
              <p className="text-xs text-slate-400 mt-1">Train a model in the "Train Model" tab to see real evaluation metrics.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: LIVE PREDICTION TESTER */}
      {activeTab === 'predict' && (
        <div className="space-y-6">
          {selectedExperiment ? (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Target className="w-5 h-5 text-emerald-600" />
                    Interactive Model Predictor
                  </h3>
                  <p className="text-xs text-slate-500">
                    Model: <strong className="text-slate-800">{selectedExperiment.name}</strong> ({selectedExperiment.model_type})
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={handleRunPrediction}
                  disabled={isPredicting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs"
                >
                  <Play className="w-3.5 h-3.5 mr-1.5 fill-current" />
                  {isPredicting ? 'Computing...' : 'Run Inference'}
                </Button>
              </div>

              {/* Dynamic Feature Inputs */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                  Input Feature Attributes
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {selectedExperiment.feature_schema?.map((f) => (
                    <div key={f.name}>
                      <label className="block text-xs font-semibold text-slate-700 mb-1 truncate font-mono">
                        {f.name}
                      </label>
                      <input
                        type={f.type === 'NUMERICAL' ? 'number' : 'text'}
                        step="any"
                        value={predictionInputs[f.name] !== undefined ? predictionInputs[f.name] : ''}
                        onChange={(e) =>
                          setPredictionInputs({
                            ...predictionInputs,
                            [f.name]: f.type === 'NUMERICAL' ? parseFloat(e.target.value) || 0 : e.target.value,
                          })
                        }
                        className="w-full border border-slate-300 rounded-lg p-2 text-xs font-mono focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Prediction Result Display */}
              {predictionResult && (
                <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                        Model Output Inference
                      </span>
                      <p className="text-2xl font-extrabold text-emerald-900 mt-1">
                        {predictionResult.predicted_label || predictionResult.predicted_value}
                      </p>
                    </div>
                    {predictionResult.confidence && (
                      <div className="text-right">
                        <span className="text-xs text-slate-500 font-medium">Confidence</span>
                        <p className="text-xl font-bold text-emerald-700">
                          {Math.round(predictionResult.confidence * 100)}%
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Class Probabilities Bar Chart if Classification */}
                  {predictionResult.class_probabilities && (
                    <div className="space-y-1.5 pt-2 border-t border-emerald-200">
                      <span className="text-xs font-semibold text-emerald-900">Class Probabilities:</span>
                      <div className="space-y-1">
                        {Object.entries(predictionResult.class_probabilities).map(([cls, prob]) => (
                          <div key={cls} className="flex items-center gap-2 text-xs font-mono">
                            <span className="w-24 text-slate-700 truncate">{cls}:</span>
                            <div className="flex-1 bg-white rounded-full h-2 overflow-hidden border border-emerald-200">
                              <div
                                className="bg-emerald-600 h-2 rounded-full"
                                style={{ width: `${Math.round(prob * 100)}%` }}
                              />
                            </div>
                            <span className="w-10 text-right text-slate-600 font-bold">
                              {Math.round(prob * 100)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-slate-600 italic">{predictionResult.explanation}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-400 p-8 text-center">
              Please train or select an experiment first.
            </p>
          )}
        </div>
      )}

      {/* TAB 6: EXPERIMENT RUNS HISTORY */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-600" />
            Saved Experiment Runs
          </h3>
          {experiments.length === 0 ? (
            <p className="text-xs text-slate-400">No experiments executed yet.</p>
          ) : (
            <div className="space-y-3">
              {experiments.map((exp) => (
                <div
                  key={exp.id}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{exp.name}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold">
                        {exp.model_type}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {new Date(exp.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Dataset: <strong>{exp.dataset_name}</strong> |{' '}
                      {exp.metrics.accuracy !== undefined
                        ? `Accuracy: ${Math.round(exp.metrics.accuracy * 100)}%`
                        : `R²: ${exp.metrics.r2_score || 'N/A'}`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedExperiment(exp);
                        setActiveTab('results');
                      }}
                      className="text-xs text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                    >
                      View Results
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedExperiment(exp);
                        setActiveTab('predict');
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                    >
                      Test Predictions
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL: NEW WORKSPACE */}
      {showNewWorkspaceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
              <FolderPlus className="w-5 h-5 text-emerald-600" />
              Create Machine Learning Project
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Set up a dedicated project workspace for code files, model weights, and experiments.
            </p>
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Project Name</label>
                <input
                  type="text"
                  placeholder="e.g. Credit Card Fraud Detection"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Learning Task</label>
                <select
                  value={newWorkspaceTask}
                  onChange={(e: any) => setNewWorkspaceTask(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="CLASSIFICATION">Classification</option>
                  <option value="REGRESSION">Regression</option>
                  <option value="CLUSTERING">Clustering</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Project goals and technical specifications..."
                  value={newWorkspaceDesc}
                  onChange={(e) => setNewWorkspaceDesc(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowNewWorkspaceModal(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleCreateWorkspace} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Create Project
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: UPLOAD FILE TO WORKSPACE */}
      {showUploadFileModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full shadow-xl">
            <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Upload className="w-5 h-5 text-emerald-600" />
              Upload Code or Config File
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Add a Python script (.py), notebook (.ipynb), YAML, or JSON configuration to your workspace.
            </p>
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">File Name</label>
                <input
                  type="text"
                  placeholder="e.g. evaluate.py, params.yaml"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Source Code Content</label>
                <textarea
                  rows={8}
                  placeholder="# Enter Python script content here..."
                  value={newFileContent}
                  onChange={(e) => setNewFileContent(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs font-mono bg-slate-900 text-emerald-300"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowUploadFileModal(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleCreateFile} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Save File
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: UPLOAD CUSTOM DATASET */}
      {showUploadDatasetModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full shadow-xl">
            <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-600" />
              Upload Tabular CSV Dataset
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Paste your raw CSV text or dataset lines with headers. It will be profiled automatically.
            </p>
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Dataset Name</label>
                <input
                  type="text"
                  placeholder="e.g. Student Exam Performance"
                  value={newDatasetName}
                  onChange={(e) => setNewDatasetName(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Raw CSV Text (with headers)</label>
                <textarea
                  rows={8}
                  placeholder={"study_hours,previous_score,attendance_pct,passed\n4.5,72,85,Yes\n6.0,88,95,Yes\n1.5,45,60,No"}
                  value={newDatasetCsv}
                  onChange={(e) => setNewDatasetCsv(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs font-mono bg-slate-50"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowUploadDatasetModal(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleUploadDataset}
                disabled={isUploadingDataset}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {isUploadingDataset ? 'Parsing & Profiling...' : 'Upload & Profile'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
