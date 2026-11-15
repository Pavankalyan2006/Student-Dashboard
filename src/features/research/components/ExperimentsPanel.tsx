import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { FlaskConical, Link2, Unlink, ExternalLink } from 'lucide-react';
import { researchApi } from '../api/researchApi';
import { LinkedExperiment } from '../types';

const pct = (v?: number) => (typeof v === 'number' ? `${Math.round(v * 100)}%` : null);
const num = (v?: number) => (typeof v === 'number' ? v.toFixed(3) : null);

function metricLine(e: LinkedExperiment): string {
  const m = e.metrics;
  const parts = [
    pct(m.accuracy) && `accuracy ${pct(m.accuracy)}`,
    num(m.f1_score) && `macro F1 ${num(m.f1_score)}`,
    num(m.r2_score) && `R² ${num(m.r2_score)}`,
    num(m.mae) && `MAE ${num(m.mae)}`,
    num(m.rmse) && `RMSE ${num(m.rmse)}`,
  ].filter(Boolean);
  return parts.length ? `${parts.join(' · ')} (held-out ${Math.round((1 - e.train_split) * 100)}% test split)` : 'No metrics recorded for this run.';
}

/**
 * Phase 6: ML Lab experiments linked to a research project. Only the student's own runs can be linked,
 * and the numbers shown are the ones that run recorded.
 */
export const ExperimentsPanel: React.FC<{ projectId: string }> = ({ projectId }) => {
  const qc = useQueryClient();
  const key = ['research-experiments', projectId];
  const { data, isLoading, error } = useQuery({ queryKey: key, queryFn: () => researchApi.listExperiments(projectId) });
  const [pick, setPick] = useState('');
  const link = useMutation({
    mutationFn: (id: string) => researchApi.linkExperiment(projectId, id),
    onSuccess: (d) => { qc.setQueryData(key, d); setPick(''); toast.success('Experiment linked'); },
    onError: (e: any) => toast.error(e.message || 'Could not link the experiment'),
  });
  const unlink = useMutation({
    mutationFn: (id: string) => researchApi.unlinkExperiment(projectId, id),
    onSuccess: (d) => qc.setQueryData(key, d),
    onError: (e: any) => toast.error(e.message || 'Could not unlink the experiment'),
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">ML experiments</h2>
        <p className="text-xs text-slate-500">
          Link runs from the ML Lab to this project, so your results sit next to the papers and ideas they support.
        </p>
      </div>

      {isLoading ? (
        <div className="py-10 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">Loading experiments…</div>
      ) : error ? (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">{(error as any).message || 'Could not load experiments'}</div>
      ) : (
        <>
          <div className="bg-white rounded-2xl p-5 border border-slate-200 space-y-3">
            {data!.available.length === 0 ? (
              <p className="text-xs text-slate-500">
                {data!.linked.length ? 'All your ML Lab runs are linked.' : 'You have no ML Lab runs yet.'}{' '}
                <a href="/ml-lab" className="text-indigo-700 font-semibold hover:underline inline-flex items-center gap-1">Open ML Lab <ExternalLink className="w-3 h-3" /></a>
              </p>
            ) : (
              <form className="flex flex-wrap gap-2" onSubmit={(e) => { e.preventDefault(); if (pick) link.mutate(pick); }}>
                <label htmlFor="link-experiment" className="sr-only">ML Lab run</label>
                <select id="link-experiment" value={pick} onChange={(e) => setPick(e.target.value)} className="flex-1 min-w-[220px] text-xs border border-slate-200 rounded-lg px-2 py-2">
                  <option value="">Choose an ML Lab run</option>
                  {data!.available.map((x) => (
                    <option key={x.id} value={x.id}>{x.name} · {x.dataset_name} · {x.status.toLowerCase()} · {new Date(x.created_at).toLocaleDateString()}</option>
                  ))}
                </select>
                <button type="submit" disabled={!pick || link.isPending} className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold disabled:opacity-50">
                  <Link2 className="w-3.5 h-3.5" /> Link to project
                </button>
              </form>
            )}
          </div>

          {data!.linked.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
              <FlaskConical className="w-8 h-8 text-slate-400 mx-auto" />
              <h4 className="text-base font-bold text-slate-900">No experiments linked</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">Train a model in the ML Lab, then link the run here.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {data!.linked.map((e) => (
                <li key={e.id} className="bg-white rounded-2xl p-4 border border-slate-200 text-xs space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{e.name}</div>
                      <div className="text-slate-500">{e.algorithm} on {e.dataset_name} · {e.status.toLowerCase()} · {new Date(e.created_at).toLocaleString()}</div>
                    </div>
                    <button onClick={() => unlink.mutate(e.id)} aria-label={`Unlink ${e.name}`} className="inline-flex items-center gap-1 text-slate-500 hover:text-rose-600 font-semibold">
                      <Unlink className="w-3.5 h-3.5" /> Unlink
                    </button>
                  </div>
                  <p className="text-slate-700">{metricLine(e)}</p>
                  {e.fit_note && <p className="text-slate-500">{e.fit_note}</p>}
                </li>
              ))}
            </ul>
          )}
          <p className="text-[11px] text-slate-400">
            ML Lab trains classic models (k-NN, decision tree, random forest, logistic and linear regression) inside the app with row limits. Deep learning and GPU training are not connected.
          </p>
        </>
      )}
    </div>
  );
};
