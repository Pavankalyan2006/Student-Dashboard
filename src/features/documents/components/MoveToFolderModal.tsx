import * as React from 'react';
import { useFolders } from '../hooks/useFolders';
import { useDocuments } from '../hooks/useDocuments';
import { FolderSymlink, Folder, X, Check } from 'lucide-react';
import { Button } from '../../../components/ui/button';

export interface MoveToFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  documentTitle?: string;
  currentFolderId?: string;
  onSuccess?: () => void;
}

export function MoveToFolderModal({
  isOpen,
  onClose,
  documentId,
  documentTitle,
  currentFolderId,
  onSuccess,
}: MoveToFolderModalProps) {
  const { folders, isLoading } = useFolders();
  const { moveDocument, isMoving } = useDocuments();
  const [selectedFolderId, setSelectedFolderId] = React.useState<string | null>(currentFolderId || null);

  React.useEffect(() => {
    setSelectedFolderId(currentFolderId || null);
  }, [currentFolderId, isOpen]);

  if (!isOpen) return null;

  const handleMove = async () => {
    try {
      await moveDocument({ documentId, folderId: selectedFolderId });
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
            <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FolderSymlink className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Move Document</h3>
              <p className="text-[11px] text-slate-500 truncate max-w-[240px]">
                {documentTitle || 'Select target destination'}
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

        <div className="mt-4 space-y-2 max-h-64 overflow-y-auto pr-1">
          {/* Root / Unfiled Option */}
          <div
            onClick={() => setSelectedFolderId(null)}
            className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
              selectedFolderId === null
                ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                : 'border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Folder className="h-4 w-4 text-slate-400" />
              <div>
                <p className="text-xs font-semibold text-slate-900">Unfiled Documents (Root)</p>
                <p className="text-[10px] text-slate-500">Keep document outside any folder</p>
              </div>
            </div>
            {selectedFolderId === null && <Check className="h-4 w-4 text-blue-600" />}
          </div>

          {/* Student Folders */}
          {isLoading ? (
            <p className="text-xs text-slate-400 p-4 text-center">Loading folders...</p>
          ) : folders.length === 0 ? (
            <p className="text-xs text-slate-500 p-4 text-center">No folders created yet.</p>
          ) : (
            folders.map((f) => (
              <div
                key={f.id}
                onClick={() => setSelectedFolderId(f.id)}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                  selectedFolderId === f.id
                    ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="h-7 w-7 rounded-lg flex items-center justify-center text-white"
                    style={{ backgroundColor: f.color || '#4654E0' }}
                  >
                    <Folder className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900">{f.name}</p>
                    <p className="text-[10px] text-slate-500">{f.document_count || 0} document(s)</p>
                  </div>
                </div>
                {selectedFolderId === f.id && <Check className="h-4 w-4 text-blue-600" />}
              </div>
            ))
          )}
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 mt-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isMoving}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleMove}
            disabled={isMoving}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5"
          >
            <FolderSymlink className="h-3.5 w-3.5" />
            <span>{isMoving ? 'Moving...' : 'Move to Destination'}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
