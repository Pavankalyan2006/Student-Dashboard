import React, { useState } from 'react';
import { useResearchMethodology } from '../hooks/useResearch';
import { researchApi } from '../api/researchApi';
import { ResearchMethodology } from '../types';
import { Layers, CheckCircle2, ShieldCheck, Save, Edit3, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface MethodologyPanelProps {
  projectId: string;
}

export const MethodologyPanel: React.FC<MethodologyPanelProps> = ({ projectId }) => {
  const { data: methodology, isLoading } = useResearchMethodology(projectId);
  const [isEditing, setIsEditing] = useState(false);
  const [systemArchitecture, setSystemArchitecture] = useState('');
  const [experimentalDesign, setExperimentalDesign] = useState('');
  const [datasetPlan, setDatasetPlan] = useState('');

  const handleSave = async () => {
    if (!methodology) return;
    try {
      await researchApi.saveMethodology(projectId, {
        system_architecture: systemArchitecture || methodology.system_architecture,
        experimental_design: experimentalDesign || methodology.experimental_design,
        dataset_plan: datasetPlan || methodology.dataset_plan || (methodology as any).datasetPlan,
      });
      setIsEditing(false);
      toast.success('Methodology plan updated');
    } catch (err: any) {
      toast.error('Failed to update methodology');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Research Methodology & Architecture</h2>
          <p className="text-xs text-slate-500">
            Formulate formal system architecture, evaluation protocol, and reproducibility standards.
          </p>
        </div>

        <button
          onClick={() => {
            if (isEditing) handleSave();
            else {
              if (methodology) {
                setSystemArchitecture(methodology.system_architecture);
                setExperimentalDesign(methodology.experimental_design);
                setDatasetPlan(methodology.dataset_plan);
              }
              setIsEditing(true);
            }
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
        >
          {isEditing ? (
            <>
              <Save className="w-3.5 h-3.5" /> Save Methodology
            </>
          ) : (
            <>
              <Edit3 className="w-3.5 h-3.5" /> Edit Plan
            </>
          )}
        </button>
      </div>

      {/* Critical Factuality Distinction */}
      <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 flex items-start gap-2.5 text-xs text-blue-900">
        <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Proposed Methodology vs Completed Experiment:</span>{' '}
          All protocols below are designated as <span className="font-semibold underline">Proposed Methodology</span>. The platform never claims experiments were executed unless verified test runs or bench records exist in the execution sandbox.
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
          Loading methodology...
        </div>
      ) : !methodology ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
          <Layers className="w-8 h-8 text-slate-400 mx-auto" />
          <h4 className="text-base font-bold text-slate-900">No Methodology Drafted</h4>
          <p className="text-xs text-slate-500">Click "Edit Plan" above to define experimental design and system boundaries.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {/* System Architecture */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">1. System Architecture</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-bold">
                PROPOSED
              </span>
            </div>
            {isEditing ? (
              <textarea
                rows={3}
                value={systemArchitecture}
                onChange={(e) => setSystemArchitecture(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            ) : (
              <p className="text-xs text-slate-700 leading-relaxed">{methodology.system_architecture}</p>
            )}
          </div>

          {/* Experimental Design & Baseline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-2 shadow-2xs">
              <h3 className="text-sm font-bold text-slate-900">2. Experimental Design</h3>
              {isEditing ? (
                <textarea
                  rows={3}
                  value={experimentalDesign}
                  onChange={(e) => setExperimentalDesign(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              ) : (
                <p className="text-xs text-slate-700 leading-relaxed">{methodology.experimental_design}</p>
              )}
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-2 shadow-2xs">
              <h3 className="text-sm font-bold text-slate-900">3. Baseline Comparison</h3>
              <p className="text-xs text-slate-700 leading-relaxed">{methodology.baseline_comparison}</p>
            </div>
          </div>

          {/* Dataset & Preprocessing */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-3 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-900">4. Dataset Protocol & Preprocessing</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="font-bold text-slate-600 uppercase text-[10px]">Dataset Plan</div>
                <p className="text-slate-800">{methodology.dataset_plan}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="font-bold text-slate-600 uppercase text-[10px]">Collection Strategy</div>
                <p className="text-slate-800">{methodology.data_collection}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="font-bold text-slate-600 uppercase text-[10px]">Preprocessing Steps</div>
                <p className="text-slate-800">{methodology.preprocessing}</p>
              </div>
            </div>
          </div>

          {/* Evaluation Metrics */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-3 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-900">5. Target Evaluation Metrics</h3>
            <div className="flex flex-wrap gap-2">
              {methodology.evaluation_metrics.map((metric, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold"
                >
                  {metric}
                </span>
              ))}
            </div>
          </div>

          {/* Reproducibility Checklist */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-3 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-900">6. Reproducibility Checklist</h3>
            <div className="space-y-2 text-xs">
              {methodology.reproducibility_checklist.map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
