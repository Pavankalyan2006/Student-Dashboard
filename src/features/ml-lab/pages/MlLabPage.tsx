// src/features/ml-lab/pages/MlLabPage.tsx
// Complete AI/ML Experiment Lab with Dataset Previews, Model Training Runs, and Real Calculated Metrics

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
} from 'lucide-react';
import { PageContainer, PageHeader, LoadingState, EmptyState } from '../../../components/layout/PageComponents';
import { Button } from '../../../components/ui/button';
import { learningModulesApi } from '../../../api/learningModulesApi';
import { MLDataset, MLExperimentEntity } from '../../../types/learningModules';
import { toast } from 'sonner';

interface MlLabPageProps {
  onNavigate?: (path: string) => void;
}

export function MlLabPage({ onNavigate }: MlLabPageProps) {
  const [datasets, setDatasets] = React.useState<MLDataset[]>([]);
  const [experiments, setExperiments] = React.useState<MLExperimentEntity[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<'experiments' | 'new' | 'datasets'>('experiments');
  const [selectedExperiment, setSelectedExperiment] = React.useState<MLExperimentEntity | null>(null);

  // New Experiment Form State
  const [expName, setExpName] = React.useState('');
  const [datasetName, setDatasetName] = React.useState('Iris Flower Classification');
  const [modelType, setModelType] = React.useState('Random Forest');
  const [trainSplit, setTrainSplit] = React.useState(0.8);
  const [nEstimators, setNEstimators] = React.useState(100);
  const [maxDepth, setMaxDepth] = React.useState(4);
  const [isTraining, setIsTraining] = React.useState(false);

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [ds, exps] = await Promise.all([
        learningModulesApi.mlLab.getDatasets(),
        learningModulesApi.mlLab.getExperiments(),
      ]);
      setDatasets(ds);
      setExperiments(exps);
      if (exps.length > 0 && !selectedExperiment) {
        setSelectedExperiment(exps[0]);
      }
    } catch (err: any) {
      toast.error('Failed to load ML experiments: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedExperiment]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRunExperiment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expName.trim()) {
      toast.error('Please enter an experiment name');
      return;
    }
    try {
      setIsTraining(true);
      const newExp = await learningModulesApi.mlLab.runExperiment({
        name: expName,
        dataset_name: datasetName,
        model_type: modelType,
        train_split: Number(trainSplit),
        hyperparameters: {
          n_estimators: Number(nEstimators),
          max_depth: Number(maxDepth),
        },
      });
      toast.success('ML model trained and validated successfully!');
      setExpName('');
      setSelectedExperiment(newExp);
      setActiveTab('experiments');
      loadData();
    } catch (err: any) {
      toast.error('Experiment failed: ' + err.message);
    } finally {
      setIsTraining(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <PageHeader title="AI/ML Experiment Lab" description="Loading machine learning sandbox and benchmark datasets..." />
        <LoadingState message="MLExperimentAgent verifying model hyperparameters and evaluation splits..." />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="AI/ML Experiment Lab"
        description="Train, tune, and evaluate machine learning models in a secure sandbox with verified confusion matrices and feature importance."
        badge={
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Cpu className="w-3.5 h-3.5 text-emerald-600" />
            MLExperimentAgent Active
          </span>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant={activeTab === 'experiments' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('experiments')}
              className={activeTab === 'experiments' ? 'bg-[#2563EB] text-white' : ''}
            >
              Experiments ({experiments.length})
            </Button>
            <Button
              variant={activeTab === 'datasets' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('datasets')}
              className={activeTab === 'datasets' ? 'bg-[#2563EB] text-white' : ''}
            >
              Datasets ({datasets.length})
            </Button>
            <Button
              size="sm"
              onClick={() => setActiveTab('new')}
              className="gap-1 bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
            >
              + Train New Model
            </Button>
          </div>
        }
      />

      {/* Main Content */}
      {activeTab === 'experiments' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Experiments List (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-sm font-bold text-[#101828]">Experiment History</h3>
            <div className="space-y-2">
              {experiments.map((exp) => (
                <div
                  key={exp.id}
                  onClick={() => setSelectedExperiment(exp)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    selectedExperiment?.id === exp.id
                      ? 'border-emerald-500 bg-emerald-50/30 shadow-sm ring-1 ring-emerald-400'
                      : 'border-[#E4E7EC] bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      {exp.model_type}
                    </span>
                    <span className="text-xs font-semibold text-emerald-600">
                      {exp.metrics.accuracy ? `${(exp.metrics.accuracy * 100).toFixed(1)}% Acc` : 'Done'}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-[#101828] mt-1.5">{exp.name}</h4>
                  <p className="text-xs text-[#475467] mt-0.5">{exp.dataset_name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Experiment Metrics & Evaluation Details (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {selectedExperiment ? (
              <div className="p-6 rounded-xl border border-[#E4E7EC] bg-white shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4">
                  <div>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                      {selectedExperiment.model_type} • {selectedExperiment.dataset_name}
                    </span>
                    <h2 className="text-xl font-bold text-[#101828] mt-1.5">{selectedExperiment.name}</h2>
                  </div>
                  <span className="text-xs text-[#475467]">
                    Executed: {new Date(selectedExperiment.created_at).toLocaleDateString()}
                  </span>
                </div>

                {/* Metrics Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <span className="text-[11px] font-semibold text-[#475467]">Test Accuracy</span>
                    <p className="text-xl font-bold text-emerald-600 mt-0.5">
                      {selectedExperiment.metrics.accuracy
                        ? `${(selectedExperiment.metrics.accuracy * 100).toFixed(1)}%`
                        : 'N/A'}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <span className="text-[11px] font-semibold text-[#475467]">Precision</span>
                    <p className="text-xl font-bold text-blue-600 mt-0.5">
                      {selectedExperiment.metrics.precision
                        ? `${(selectedExperiment.metrics.precision * 100).toFixed(1)}%`
                        : 'N/A'}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <span className="text-[11px] font-semibold text-[#475467]">Recall</span>
                    <p className="text-xl font-bold text-purple-600 mt-0.5">
                      {selectedExperiment.metrics.recall
                        ? `${(selectedExperiment.metrics.recall * 100).toFixed(1)}%`
                        : 'N/A'}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <span className="text-[11px] font-semibold text-[#475467]">F1-Score</span>
                    <p className="text-xl font-bold text-indigo-600 mt-0.5">
                      {selectedExperiment.metrics.f1_score
                        ? `${(selectedExperiment.metrics.f1_score * 100).toFixed(1)}%`
                        : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Confusion Matrix if available */}
                {selectedExperiment.metrics.confusion_matrix && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#344054]">
                      Confusion Matrix (Test Split)
                    </h4>
                    <div className="inline-block p-3 bg-gray-900 rounded-xl text-xs font-mono text-emerald-400">
                      {selectedExperiment.metrics.confusion_matrix.map((row, rIdx) => (
                        <div key={rIdx} className="tracking-widest">
                          [ {row.map((val) => String(val).padStart(3, ' ')).join(', ')} ]
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Feature Importance & Overfitting Insights */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedExperiment.insights.feature_importance && (
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                      <h4 className="text-xs font-bold text-[#101828]">Feature Importance</h4>
                      <div className="space-y-1.5">
                        {selectedExperiment.insights.feature_importance.map((f, idx) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between text-xs text-[#344054]">
                              <span className="font-mono">{f.feature}</span>
                              <span className="font-semibold">{(f.importance * 100).toFixed(0)}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-emerald-500 rounded-full"
                                style={{ width: `${f.importance * 100}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200 space-y-2">
                    <h4 className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      Fit Diagnostics & Hyperparameter Recommendations
                    </h4>
                    <p className="text-xs text-blue-950 leading-relaxed">
                      {selectedExperiment.insights.underfitting_or_overfitting}
                    </p>
                    <ul className="list-disc pl-4 text-xs text-blue-800 space-y-1 pt-1">
                      {selectedExperiment.insights.recommendations?.map((rec, rIdx) => (
                        <li key={rIdx}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <EmptyState title="Select an Experiment" description="Click an experiment from the left history panel." />
            )}
          </div>
        </div>
      )}

      {/* New Experiment View */}
      {activeTab === 'new' && (
        <div className="p-6 rounded-xl border border-[#E4E7EC] bg-white shadow-sm space-y-4 max-w-2xl">
          <h2 className="text-lg font-bold text-[#101828] flex items-center gap-2">
            <Cpu className="w-5 h-5 text-emerald-600" />
            Configure & Train ML Pipeline
          </h2>
          <form onSubmit={handleRunExperiment} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#344054] mb-1">Experiment Name</label>
              <input
                type="text"
                placeholder="e.g. Random Forest Classifier on Iris Dataset"
                value={expName}
                onChange={(e) => setExpName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[#D0D5DD] rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#344054] mb-1">Dataset</label>
                <select
                  value={datasetName}
                  onChange={(e) => setDatasetName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[#D0D5DD] rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Iris Flower Classification">Iris Flower Classification</option>
                  <option value="Boston Housing Prices">Boston Housing Prices</option>
                  <option value="Customer Churn Prediction">Customer Churn Prediction</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#344054] mb-1">Model Architecture</label>
                <select
                  value={modelType}
                  onChange={(e) => setModelType(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[#D0D5DD] rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Random Forest">Random Forest Classifier</option>
                  <option value="Decision Tree">Decision Tree</option>
                  <option value="Logistic Regression">Logistic Regression</option>
                  <option value="Support Vector Machine">SVM (Linear/RBF)</option>
                  <option value="K-Nearest Neighbors">K-Nearest Neighbors (KNN)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#344054] mb-1">Train/Test Split</label>
                <input
                  type="number"
                  step="0.05"
                  min="0.5"
                  max="0.9"
                  value={trainSplit}
                  onChange={(e) => setTrainSplit(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-[#D0D5DD] rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#344054] mb-1">n_estimators</label>
                <input
                  type="number"
                  min="10"
                  max="500"
                  value={nEstimators}
                  onChange={(e) => setNEstimators(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-[#D0D5DD] rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#344054] mb-1">max_depth</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={maxDepth}
                  onChange={(e) => setMaxDepth(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-[#D0D5DD] rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setActiveTab('experiments')}>
                Cancel
              </Button>
              <Button type="submit" disabled={isTraining} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                <Play className="w-4 h-4" />
                {isTraining ? 'Training Model & Calculating Metrics...' : 'Train Model'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Datasets View */}
      {activeTab === 'datasets' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {datasets.map((ds) => (
            <div key={ds.id} className="p-5 rounded-xl border border-[#E4E7EC] bg-white shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-bold text-[#101828]">{ds.name}</h3>
                </div>
                <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full font-semibold">
                  {ds.task_type}
                </span>
              </div>
              <p className="text-xs text-[#475467]">{ds.total_samples} samples • Target: '{ds.target_column}'</p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {ds.features.map((f, idx) => (
                  <span key={idx} className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-700">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
