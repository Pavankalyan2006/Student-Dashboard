import * as React from 'react';
import { Play, Square, Info } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { runInBrowser, SANDBOX_NOTE, type SandboxResult } from '../../../lib/browserSandbox';

/** Two minutes: training a small scikit-learn model on the built-in datasets takes seconds. */
export const ML_TIME_LIMIT_MS = 120_000;

interface DatasetLike {
  id: string;
  name: string;
  raw_data?: Record<string, any>[];
  preview?: Record<string, any>[];
}
interface FileLike {
  name: string;
  content: string;
}

/** Turns dataset rows into CSV text (header from the first row; values quoted when needed). */
export function rowsToCsv(rows: Record<string, any>[]): string {
  if (!rows.length) return '';
  const cols = Object.keys(rows[0]);
  const cell = (v: any) => {
    const s = v === null || v === undefined ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [cols.join(','), ...rows.map((r) => cols.map((c) => cell(r[c])).join(','))].join('\n') + '\n';
}

/**
 * Runs the open Python file in the browser sandbox (Pyodide). The chosen dataset is written next to it as
 * dataset.csv, together with the workspace's other text files. numpy, pandas and scikit-learn are
 * downloaded from the Pyodide CDN on first use. Files the script writes (.json, .txt, .csv) are shown.
 */
export const PythonRunPanel: React.FC<{ source: string; fileName: string; files: FileLike[]; datasets: DatasetLike[] }> = ({ source, fileName, files, datasets }) => {
  const [datasetId, setDatasetId] = React.useState(datasets[0]?.id || '');
  const [running, setRunning] = React.useState(false);
  const [note, setNote] = React.useState('');
  const [result, setResult] = React.useState<SandboxResult | null>(null);

  React.useEffect(() => {
    if (!datasetId && datasets[0]) setDatasetId(datasets[0].id);
  }, [datasets, datasetId]);

  const run = async () => {
    const ds = datasets.find((d) => d.id === datasetId);
    const rows = ds?.raw_data?.length ? ds.raw_data : ds?.preview || [];
    const inputs = files
      .filter((f) => f.name !== fileName && /\.(py|ya?ml|json|csv|txt)$/i.test(f.name))
      .map((f) => ({ name: f.name, content: f.content || '' }));
    if (rows.length) inputs.push({ name: 'dataset.csv', content: rowsToCsv(rows) });
    setRunning(true);
    setResult(null);
    try {
      setResult(await runInBrowser({ language: 'python', source, files: inputs }, { timeLimitMs: ML_TIME_LIMIT_MS, onStatus: setNote }));
    } finally {
      setRunning(false);
      setNote('');
    }
  };

  const tone = result?.status === 'SUCCESS' ? 'text-emerald-400' : 'text-rose-400';
  return (
    <div className="border-t border-slate-800 bg-slate-900/60 flex flex-col max-h-[45%] min-h-[180px]" data-testid="ml-python-run">
      <div className="flex flex-wrap items-center gap-2 px-4 py-2 border-b border-slate-800">
        <label className="text-[11px] text-slate-400" htmlFor="ml-run-dataset">
          dataset.csv:
        </label>
        <select
          id="ml-run-dataset"
          value={datasetId}
          onChange={(e) => setDatasetId(e.target.value)}
          className="text-[11px] h-7 rounded bg-slate-800 border border-slate-700 text-slate-200 px-2"
        >
          {datasets.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name} ({(d.raw_data?.length || d.preview?.length || 0).toLocaleString()} rows)
            </option>
          ))}
        </select>
        <Button size="sm" onClick={run} disabled={running || !source.trim()} className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white">
          {running ? <Square className="w-3 h-3 mr-1" /> : <Play className="w-3 h-3 mr-1" />}
          {running ? 'Running…' : 'Run in browser'}
        </Button>
        <span className="text-[11px] text-slate-400 inline-flex items-center gap-1" title={SANDBOX_NOTE}>
          <Info className="w-3 h-3" /> Runs in your browser with Pyodide; limit {ML_TIME_LIMIT_MS / 1000} s. Unsaved edits are used.
        </span>
      </div>
      <div className="flex-1 overflow-auto px-4 py-2 font-mono text-[11px] leading-relaxed" aria-live="polite">
        {running && <p className="text-blue-300" role="status">{note || 'Starting…'}</p>}
        {!running && !result && <p className="text-slate-500">Output appears here. Your script can read dataset.csv and write files such as metrics.json.</p>}
        {result && (
          <>
            <p className={tone}>
              {result.status === 'SUCCESS' ? 'Finished' : result.status.replace(/_/g, ' ')} · {(result.execution_time_ms / 1000).toFixed(1)} s · ran in your browser
            </p>
            {result.stdout && <pre className="whitespace-pre-wrap text-slate-200">{result.stdout}</pre>}
            {result.stderr && <pre className="whitespace-pre-wrap text-rose-300">{result.stderr}</pre>}
            {result.outputs.map((f) => (
              <div key={f.name} className="mt-2">
                <p className="text-slate-400">Your script wrote {f.name}:</p>
                <pre className="whitespace-pre-wrap text-amber-200">{f.content.slice(0, 4000)}</pre>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};
