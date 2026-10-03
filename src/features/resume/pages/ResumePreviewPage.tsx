import React, { useEffect, useState } from 'react';
import { resumeApi } from '../api/resumeApi';
import { FullResumeData, ResumeTemplate } from '../types/resumeTypes';
import { ResumePreview } from '../components/ResumePreview';
import { ChevronLeft, Printer, Download, Sparkles, Edit3 } from 'lucide-react';
import { toast } from 'sonner';

interface ResumePreviewPageProps {
  resumeId: string;
  onNavigate: (path: string) => void;
}

export const ResumePreviewPage: React.FC<ResumePreviewPageProps> = ({ resumeId, onNavigate }) => {
  const [data, setData] = useState<FullResumeData | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplate>('TECHNICAL');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        setIsLoading(true);
        const full = await resumeApi.getFullResume(resumeId);
        setData(full);
        setSelectedTemplate(full.resume.template || 'TECHNICAL');
      } catch (err: any) {
        toast.error(err.message || 'Failed to load preview');
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [resumeId]);

  if (isLoading || !data) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Sparkles className="h-8 w-8 animate-spin text-blue-600 mb-3" />
        <p className="text-xs text-slate-500 font-medium">Preparing document preview...</p>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const templates: { id: ResumeTemplate; label: string }[] = [
    { id: 'TECHNICAL', label: 'Technical' },
    { id: 'MODERN', label: 'Modern' },
    { id: 'CLASSIC', label: 'Classic' },
    { id: 'MINIMAL', label: 'Minimal' },
    { id: 'ACADEMIC', label: 'Academic' },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Top Controls (Hidden during browser printing) */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate(`/resume/${resumeId}/edit`)}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-2xs transition"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-base font-bold text-slate-900">
              {data.resume.title}
            </h1>
            <p className="text-xs text-slate-500">
              Target: {data.resume.target_role}
            </p>
          </div>
        </div>

        {/* Template Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {templates.map((t) => (
            <button
              key={t.id}
              onClick={async () => {
                setSelectedTemplate(t.id);
                await resumeApi.updateResume(resumeId, { template: t.id });
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedTemplate === t.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Print / Edit Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate(`/resume/${resumeId}/edit`)}
            className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-2xs transition"
          >
            <Edit3 className="h-3.5 w-3.5" />
            Edit
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
          >
            <Printer className="h-3.5 w-3.5" />
            Print / Save PDF
          </button>
        </div>
      </div>

      {/* Printable Resume Container */}
      <div className="bg-slate-100 p-4 sm:p-8 rounded-2xl border border-slate-200 print:p-0 print:border-none print:bg-white print:m-0">
        <ResumePreview data={data} templateOverride={selectedTemplate} />
      </div>
    </div>
  );
};
