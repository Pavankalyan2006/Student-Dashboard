import * as React from 'react';
import { DocumentUploader } from '../components/DocumentUploader';
import { PageContainer, PageHeader } from '../../../components/layout/PageComponents';
import { Button } from '../../../components/ui/button';
import { ArrowLeft, BookOpen, ShieldCheck, Zap } from 'lucide-react';
import { Document } from '../types/document';

export interface DocumentUploadPageProps {
  onNavigate: (path: string) => void;
}

export function DocumentUploadPage({ onNavigate }: DocumentUploadPageProps) {
  const handleUploadSuccess = (doc: Document) => {
    // Navigate straight to the document AI workspace
    onNavigate(`/documents/${doc.id}`);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Upload Study Material"
        description="Add curriculum textbooks, laboratory manuals, and lecture slides to your AI workspace."
        badge={
          <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
            Secure Student Upload
          </span>
        }
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('/documents')}
            className="gap-1.5"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Documents</span>
          </Button>
        }
      />

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Reusable Uploader */}
        <DocumentUploader onSuccess={handleUploadSuccess} />

        {/* Feature Cards / Information */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
            <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
              <Zap className="h-4 w-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-900">Text indexing</h4>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              The text of every page is indexed so answers can cite the exact page. For a scan or a photo, open it and choose Recognise text to read its text in your browser.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
            <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-2">
              <BookOpen className="h-4 w-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-900">Grounded Citations</h4>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              Answers never fabricate sources and link directly to relevant text snippets.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
            <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-900">Student Privacy</h4>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              Uploaded materials belong strictly to your authenticated session and are never shared.
            </p>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
