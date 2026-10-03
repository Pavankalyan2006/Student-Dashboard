import React, { useState, useEffect } from 'react';
import { ResumeTemplate } from '../types/resumeTypes';
import { resumeApi } from '../api/resumeApi';
import { CheckCircle2, ChevronLeft, Sparkles, Layers, ShieldCheck, Upload, FileText, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { ResumeTemplateUploadModal } from '../components/ResumeTemplateUploadModal';

interface ResumeTemplatesPageProps {
  onNavigate: (path: string) => void;
}

export const ResumeTemplatesPage: React.FC<ResumeTemplatesPageProps> = ({ onNavigate }) => {
  const [activeResumeId, setActiveResumeId] = useState<string | null>(null);
  const [activeResumeTemplate, setActiveResumeTemplate] = useState<string | null>(null);
  const [customTemplateConfig, setCustomTemplateConfig] = useState<any>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  useEffect(() => {
    const fetchActiveResume = async () => {
      try {
        const list = await resumeApi.listResumes();
        if (list.length > 0) {
          setActiveResumeId(list[0].id);
          setActiveResumeTemplate(list[0].template);
          if (list[0].custom_template_config) {
            setCustomTemplateConfig(list[0].custom_template_config);
          }
        }
      } catch (err) {
        console.error('Failed to fetch resumes:', err);
      }
    };
    fetchActiveResume();
  }, []);
  const templates: {
    id: ResumeTemplate;
    name: string;
    description: string;
    layout: string;
    highlights: string[];
  }[] = [
    {
      id: 'TECHNICAL',
      name: 'Technical (Engineering Default)',
      description: 'Engineered specifically for software development, systems engineering, and data science recruitment.',
      layout: 'Single column, high-density, mono-spaced technology tags, highlighted architecture bullet points.',
      highlights: ['ATS Optimized', 'Dense Layout', 'Code-stack Emphasis', 'No decorative graphics'],
    },
    {
      id: 'MODERN',
      name: 'Modern Sans',
      description: 'Clean contemporary aesthetic featuring navy structural dividers and subtle typography hierarchy.',
      layout: 'Left-aligned header, crisp sans-serif headings, balanced whitespace for general engineering and product roles.',
      highlights: ['ATS Safe', 'Contemporary Look', 'High Readability', 'Collegiate standard'],
    },
    {
      id: 'CLASSIC',
      name: 'Classic Serif',
      description: 'Traditional academic and corporate standard with elegant serif headings and centered contact metadata.',
      layout: 'Centered header, solid divider rules, serif typography, ideal for enterprise technology and consultancy.',
      highlights: ['Traditional Corporate Standard', 'ATS 100% Parsable', 'Conservative Style'],
    },
    {
      id: 'MINIMAL',
      name: 'Minimal Clean',
      description: 'Ultra-light Scandinavian styling emphasizing whitespace, content clarity, and concise bulleting.',
      layout: 'Muted borders, lowercase subheaders, ample margins, ideal for senior or focused collegiate developers.',
      highlights: ['Zero Fluff', 'Clean Visual Rhythm', 'Fast Recruiter Scanning'],
    },
    {
      id: 'ACADEMIC',
      name: 'Academic & Research',
      description: 'Tailored for higher degree admissions, research labs, publications, and competitive university internships.',
      layout: 'Structured coursework blocks, publication dates, academic project breakdowns, and faculty references.',
      highlights: ['Research & Honors Focus', 'Extensive Coursework', 'Formal Tone'],
    },
  ];

  const handleSelectTemplate = async (template: ResumeTemplate) => {
    try {
      const list = await resumeApi.listResumes();
      if (list.length > 0) {
        await resumeApi.updateResume(list[0].id, { template });
        toast.success(`Active resume updated to ${template} template`);
        onNavigate(`/resume/${list[0].id}/preview`);
      } else {
        const created = await resumeApi.createResume({ template });
        toast.success(`Created new resume with ${template} template`);
        onNavigate(`/resume/${created.resume.id}/edit`);
      }
    } catch (err: any) {
      toast.error('Failed to select template');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('/resume')}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-2xs transition"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Resume Templates
            </h1>
            <p className="text-xs text-slate-500">
              Professional ATS-tested templates adhering to strict parsing standards without unreadable columns or graphics.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition self-start sm:self-auto"
        >
          <Upload className="h-3.5 w-3.5" />
          Upload PDF Template
        </button>
      </div>

      {/* Hero Banner: Custom PDF Template Upload */}
      <div className="relative overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50/80 via-indigo-50/40 to-white p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-100 border border-blue-200 text-blue-700 text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5 text-blue-600" />
              AI Custom Template Importer
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Have a favorite resume design? Upload your PDF template
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Upload any PDF resume template. Our AI engine automatically extracts structural sections (Summary, Technical Skills, Experience, Projects, Education, Certifications), matches typography and accent colors, binds your verified academic profile data, and generates a print-ready resume for instant download.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white text-[11px] font-medium text-slate-700 border border-slate-200 shadow-2xs">
                <CheckCircle2 className="h-3 w-3 text-emerald-500" /> Auto-Extracts Sections
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white text-[11px] font-medium text-slate-700 border border-slate-200 shadow-2xs">
                <CheckCircle2 className="h-3 w-3 text-emerald-500" /> Preserves All Verified Data
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white text-[11px] font-medium text-slate-700 border border-slate-200 shadow-2xs">
                <CheckCircle2 className="h-3 w-3 text-emerald-500" /> Instant PDF Download Button
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/25 transition shrink-0"
            >
              <Upload className="h-4 w-4" />
              Upload & Apply Template
            </button>
            {activeResumeTemplate === 'CUSTOM_UPLOADED' && activeResumeId && (
              <button
                onClick={() => onNavigate(`/resume/${activeResumeId}/preview`)}
                className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition shrink-0 shadow-2xs"
              >
                View Uploaded Resume
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Show active custom template card if applied */}
        {activeResumeTemplate === 'CUSTOM_UPLOADED' && customTemplateConfig && (
          <div className="mt-4 pt-4 border-t border-blue-200/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-slate-900">Active Template:</span>
              <span className="text-blue-600 font-medium">
                {customTemplateConfig.template_name || customTemplateConfig.filename || 'Custom Uploaded PDF Template'}
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-500">
                {customTemplateConfig.detected_sections?.length || 0} sections extracted
              </span>
            </div>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="text-blue-600 hover:text-blue-700 font-medium text-xs hover:underline"
            >
              Upload Different Template
            </button>
          </div>
        )}
      </div>

      {/* Standard Templates Grid */}
      <div>
        <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
          <Layers className="h-4 w-4 text-slate-500" />
          Standard Built-in Templates
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((t) => (
          <div
            key={t.id}
            className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                  {t.id}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 flex items-center gap-1 border border-emerald-200/80">
                  <ShieldCheck className="h-3 w-3" /> ATS Parsable
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900">{t.name}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t.description}
              </p>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-[11px] text-slate-500">
                <span className="font-semibold text-slate-700 block mb-0.5">Layout:</span>
                {t.layout}
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {t.highlights.map((h, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-medium text-slate-600 border border-slate-200/50"
                  >
                    ✓ {h}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={() => handleSelectTemplate(t.id)}
              className="mt-5 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
            >
              Use This Template
            </button>
          </div>
        ))}
        </div>
      </div>

      {/* Template Upload Modal */}
      <ResumeTemplateUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        resumeId={activeResumeId}
        onNavigate={onNavigate}
        onSuccess={(fullResume) => {
          setActiveResumeTemplate(fullResume.resume.template);
          if (fullResume.resume.custom_template_config) {
            setCustomTemplateConfig(fullResume.resume.custom_template_config);
          }
          if (fullResume.resume.id) {
            onNavigate(`/resume/${fullResume.resume.id}/preview`);
          }
        }}
      />
    </div>
  );
};

