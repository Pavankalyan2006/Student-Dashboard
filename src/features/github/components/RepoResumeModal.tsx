import React, { useState } from 'react';
import { useGitHubResumeBullets, useExportToResume } from '../hooks/useGitHub';
import { Sparkles, CheckCircle2, FileText, X, Plus, Trash2, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface RepoResumeModalProps {
  repoId: string;
  repoName: string;
  defaultTechStack?: string[];
  isOpen: boolean;
  onClose: () => void;
}

export const RepoResumeModal: React.FC<RepoResumeModalProps> = ({
  repoId,
  repoName,
  defaultTechStack = [],
  isOpen,
  onClose,
}) => {
  const [roleContext, setRoleContext] = useState('');
  const [projectTitle, setProjectTitle] = useState(repoName);
  const [techStackInput, setTechStackInput] = useState(defaultTechStack.join(', '));
  const [bullets, setBullets] = useState<string[]>([]);
  const [newBullet, setNewBullet] = useState('');

  const generateBulletsMutation = useGitHubResumeBullets(repoId);
  const exportMutation = useExportToResume(repoId);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    try {
      const res = await generateBulletsMutation.mutateAsync(roleContext);
      if (res.bullets && res.bullets.length > 0) {
        setBullets(res.bullets.map((b: any) => (typeof b === 'string' ? b : b.bullet || b.text)));
      }
    } catch (err: any) {
      toast.error('Failed to generate resume bullets');
    }
  };

  const handleAddCustomBullet = () => {
    if (!newBullet.trim()) return;
    setBullets([...bullets, newBullet.trim()]);
    setNewBullet('');
  };

  const handleRemoveBullet = (index: number) => {
    setBullets(bullets.filter((_, i) => i !== index));
  };

  const handleUpdateBullet = (index: number, val: string) => {
    const updated = [...bullets];
    updated[index] = val;
    setBullets(updated);
  };

  const handleExport = async () => {
    if (bullets.length === 0) {
      toast.error('Add or select at least one bullet point to export');
      return;
    }
    const techArray = techStackInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      await exportMutation.mutateAsync({
        title: projectTitle,
        bullets,
        tech_stack: techArray,
      });
      onClose();
    } catch (err: any) {
      toast.error('Export failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 hero-brand text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Resume Project Integrator</h3>
              <p className="text-xs text-slate-300">
                Ground verified GitHub evidence into high-impact resume bullets
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice */}
        <div className="px-6 py-2.5 bg-emerald-50 border-b border-emerald-100 flex items-center gap-2 text-xs text-emerald-800">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>Authenticity Guard:</strong> Bullets are strictly grounded in detected repository architecture, APIs, and real commits.
          </span>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                Project Title in Resume
              </label>
              <input
                type="text"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                Tech Stack (comma separated)
              </label>
              <input
                type="text"
                value={techStackInput}
                onChange={(e) => setTechStackInput(e.target.value)}
                placeholder="TypeScript, React, Node.js, PostgreSQL"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
              Your Specific Contribution Context (Optional)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={roleContext}
                onChange={(e) => setRoleContext(e.target.value)}
                placeholder="e.g. Built the authentication service, designed the REST API schema, optimized caching..."
                className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={handleGenerate}
                disabled={generateBulletsMutation.isPending}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                {generateBulletsMutation.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                {bullets.length > 0 ? 'Regenerate' : 'Generate with AI'}
              </button>
            </div>
          </div>

          {/* Bullets List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                Resume Bullet Points ({bullets.length})
              </label>
              <span className="text-[11px] text-slate-500">Edit or refine before exporting</span>
            </div>

            {bullets.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                <FileText className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-slate-600 font-medium">No bullets generated yet.</p>
                <p className="text-slate-400 text-[11px]">
                  Click "Generate with AI" above to formulate grounded STAR-format bullets.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {bullets.map((b, i) => (
                  <div key={i} className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="font-mono text-indigo-600 font-bold mt-1 text-xs">{i + 1}.</span>
                    <textarea
                      rows={2}
                      value={b}
                      onChange={(e) => handleUpdateBullet(i, e.target.value)}
                      className="flex-1 bg-transparent border-0 p-0 text-xs text-slate-800 focus:ring-0 leading-relaxed resize-none"
                    />
                    <button
                      onClick={() => handleRemoveBullet(i)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Remove bullet"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add manual bullet */}
            <div className="flex items-center gap-2 pt-2">
              <input
                type="text"
                value={newBullet}
                onChange={(e) => setNewBullet(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCustomBullet()}
                placeholder="Add custom bullet point..."
                className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={handleAddCustomBullet}
                className="inline-flex items-center gap-1 px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-semibold text-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleExport}
            disabled={exportMutation.isPending || bullets.length === 0}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md transition-all disabled:opacity-50 cursor-pointer"
          >
            {exportMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            Export to Active Resume
          </button>
        </div>
      </div>
    </div>
  );
};
