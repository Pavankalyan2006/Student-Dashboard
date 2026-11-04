import * as React from 'react';
import { useDocuments } from '../hooks/useDocuments';
import { DocumentCardData } from '../types/document';
import { FlaskConical, X, Check, ArrowRight } from 'lucide-react';
import { Button } from '../../../components/ui/button';

export interface LinkToLabModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentCardData | null;
  onSuccess?: () => void;
}

const AVAILABLE_LABS = [
  { id: 'lab_os_sched', title: 'OS Lab: CPU Scheduling Algorithms', subject: 'Operating Systems' },
  { id: 'lab_db_norm', title: 'DBMS Lab: Schema Normalization & SQL', subject: 'Database Management' },
  { id: 'lab_dsa_trees', title: 'DSA Lab: Binary Search Trees & Heaps', subject: 'Data Structures' },
  { id: 'lab_net_sock', title: 'Networks Lab: Socket Programming in C', subject: 'Computer Networks' },
  { id: 'lab_ai_search', title: 'AI Lab: A* & Heuristic Search', subject: 'Artificial Intelligence' },
];

export function LinkToLabModal({
  isOpen,
  onClose,
  document,
  onSuccess,
}: LinkToLabModalProps) {
  const { linkToLab, isLinkingLab } = useDocuments();
  const [selectedLabId, setSelectedLabId] = React.useState(AVAILABLE_LABS[0].id);

  if (!isOpen || !document) return null;

  const handleLink = async () => {
    const lab = AVAILABLE_LABS.find((l) => l.id === selectedLabId);
    if (!lab) return;

    try {
      await linkToLab({
        documentId: document.id,
        labId: lab.id,
        labTitle: lab.title,
      });
      onSuccess?.();
      onClose();
    } catch {
      // Handled by hook toast
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <FlaskConical className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Link to Lab Assistant</h3>
              <p className="text-[11px] text-slate-500 truncate max-w-[240px]">
                {document.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="text-xs text-slate-600 mt-4 mb-3">
          Select an active B.Tech laboratory experiment to associate this document as a primary lab manual or reference:
        </p>

        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {AVAILABLE_LABS.map((lab) => (
            <div
              key={lab.id}
              onClick={() => setSelectedLabId(lab.id)}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                selectedLabId === lab.id
                  ? 'border-purple-600 bg-purple-50/50 shadow-xs'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div>
                <p className="text-xs font-semibold text-slate-900">{lab.title}</p>
                <p className="text-[10px] text-slate-500">{lab.subject}</p>
              </div>
              {selectedLabId === lab.id && <Check className="h-4 w-4 text-purple-600" />}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 mt-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isLinkingLab}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleLink}
            disabled={isLinkingLab}
            className="bg-purple-600 hover:bg-purple-700 text-white text-xs gap-1.5"
          >
            <FlaskConical className="h-3.5 w-3.5" />
            <span>{isLinkingLab ? 'Linking...' : 'Attach as Lab Manual'}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
