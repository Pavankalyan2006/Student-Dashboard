import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { AlertTriangle, Trash2 } from 'lucide-react';

export interface DocumentDeleteDialogProps {
  isOpen: boolean;
  documentTitle: string;
  isDeleting?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DocumentDeleteDialog({
  isOpen,
  documentTitle,
  isDeleting,
  onClose,
  onConfirm,
}: DocumentDeleteDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <DialogTitle className="text-base text-slate-900">Delete Document?</DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-0.5">
                This action cannot be undone.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-2 text-xs text-slate-600 leading-relaxed">
          Are you sure you want to permanently delete{' '}
          <strong className="text-slate-900 font-semibold">"{documentTitle}"</strong>? All
          extracted pages, vector embeddings, and cached AI summaries for this document will be
          removed from your account.
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={onConfirm}
            disabled={isDeleting}
            className="gap-1.5"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>{isDeleting ? 'Deleting...' : 'Delete Permanently'}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
