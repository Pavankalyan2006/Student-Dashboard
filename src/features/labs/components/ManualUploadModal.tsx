// src/features/labs/components/ManualUploadModal.tsx
// Upload existing lab manual document (PDF, DOCX, TXT), extract structure, preview, review, and save

import React, { useState, useRef } from 'react';
import {
  X,
  UploadCloud,
  FileText,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Sparkles,
  ArrowRight,
  Edit2,
  Trash2,
  Plus,
  BookOpen,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { LabCourse, LabManual, LabExperimentDetail } from '../types/labAssistantTypes';
import { labAssistantApi } from '../api/labAssistantApi';
import { toast } from 'sonner';

interface ManualUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  lab: LabCourse;
  onManualImported: (manual: LabManual, experiments: LabExperimentDetail[]) => void;
  onSwitchToManualEntry: () => void;
}

export function ManualUploadModal({
  isOpen,
  onClose,
  lab,
  onManualImported,
  onSwitchToManualEntry,
}: ManualUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Review step state after extraction
  const [isReviewStep, setIsReviewStep] = useState(false);
  const [extractedRawText, setExtractedRawText] = useState('');
  const [pageCount, setPageCount] = useState(1);
  const [manualTitle, setManualTitle] = useState(lab.manual_title || `${lab.name} Lab Manual`);
  const [candidateExperiments, setCandidateExperiments] = useState<Partial<LabExperimentDetail>[]>([]);
  const [isSavingManual, setIsSavingManual] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const validateAndSetFile = (selectedFile: File) => {
    setError(null);
    const validExtensions = ['pdf', 'docx', 'txt'];
    const ext = selectedFile.name.split('.').pop()?.toLowerCase() || '';

    if (!validExtensions.includes(ext)) {
      setError(`Unsupported file format (.${ext}). Supported formats: PDF, DOCX, TXT.`);
      return;
    }

    // 20MB limit
    if (selectedFile.size > 20 * 1024 * 1024) {
      setError('File size exceeds the 20MB limit. Please upload a smaller manual or use Manual Entry.');
      return;
    }

    setFile(selectedFile);
    setManualTitle(selectedFile.name.replace(/\.[^/.]+$/, '').replace(/[_\-]/g, ' '));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleProcessUpload = async () => {
    if (!file) {
      setError('Please select a laboratory manual document first.');
      return;
    }

    try {
      setIsUploading(true);
      setError(null);

      // Convert file to Base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (err) => reject(err);
      });
      reader.readAsDataURL(file);
      const base64Data = await base64Promise;

      const result = await labAssistantApi.uploadManual(
        lab.id,
        base64Data,
        file.name,
        file.type || 'application/pdf'
      );

      setExtractedRawText(result.raw_text);
      setPageCount(result.page_count);
      setCandidateExperiments(result.candidate_experiments || []);
      setIsReviewStep(true);
      toast.success(
        `Successfully extracted ${result.candidate_experiments?.length || 0} candidate experiments!`
      );
    } catch (err: any) {
      setError(
        err.message ||
          'Failed to extract text from this document. Scanned images or password-protected PDFs cannot be parsed directly. Please use Manual Entry.'
      );
      toast.error('Extraction error: ' + (err.message || 'Failed to parse'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirmAndSave = async () => {
    try {
      setIsSavingManual(true);
      setError(null);

      const manualPayload: Partial<LabManual> = {
        title: manualTitle.trim() || `${lab.name} Lab Manual`,
        subject: lab.subject,
        course_code: lab.course_code,
        semester: lab.semester,
        department: lab.department,
        lab_type: lab.lab_type,
        tools: lab.tools_or_languages,
        description: `Imported from source document: ${file?.name || 'Manual'}`,
        is_draft: false,
      };

      const res = await labAssistantApi.saveManualDetails(lab.id, manualPayload, candidateExperiments);
      toast.success(
        `Imported '${res.manual.title}' with ${res.experiments.length} experiments verified!`
      );
      onManualImported(res.manual, res.experiments);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save confirmed manual');
      toast.error(err.message || 'Error saving manual');
    } finally {
      setIsSavingManual(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-3xl my-6 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-50/70 to-indigo-50/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">
                {isReviewStep ? 'Review & Confirm Extracted Manual' : `Upload Lab Manual: ${lab.name}`}
              </h3>
              <p className="text-xs text-gray-500">
                {isReviewStep
                  ? 'Verify experiment titles, aims, and procedures before saving to your workspace'
                  : 'Upload PDF, DOCX, or TXT manual. Real extraction with student correction.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <div className="flex-1">
                <span>{error}</span>
                <div className="mt-1">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onSwitchToManualEntry();
                    }}
                    className="text-xs font-bold text-red-800 underline hover:no-underline"
                  >
                    Switch to Manual Entry instead →
                  </button>
                </div>
              </div>
            </div>
          )}

          {!isReviewStep ? (
            /* STEP 1: FILE DROP & SELECT */
            <div className="space-y-4">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-blue-500 bg-blue-50/60'
                    : file
                    ? 'border-emerald-400 bg-emerald-50/30'
                    : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50/60'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.txt"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      validateAndSetFile(e.target.files[0]);
                    }
                  }}
                />

                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
                  {file ? <FileText className="w-6 h-6 text-emerald-600" /> : <UploadCloud className="w-6 h-6" />}
                </div>

                {file ? (
                  <div>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100/70 px-2.5 py-0.5 rounded-full">
                      Selected Document
                    </span>
                    <h4 className="text-sm font-bold text-gray-900 mt-2">{file.name}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB • Ready to extract
                    </p>
                    <p className="text-[11px] text-blue-600 mt-2 font-medium">Click or drag another file to replace</p>
                  </div>
                ) : (
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">
                      Click to choose manual or drag and drop here
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      Supports PDF, DOCX, and TXT manuals up to 20MB
                    </p>
                    <div className="flex items-center justify-center gap-2 mt-3 text-[11px] text-gray-400 font-medium">
                      <span>• University Syllabus</span>
                      <span>• Laboratory Manual</span>
                      <span>• Assignment List</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Manual Entry Fallback Callout */}
              <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="text-xs text-gray-700">
                    Prefer to type or copy-paste manual details directly?
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSwitchToManualEntry();
                  }}
                  className="text-xs font-bold text-blue-700 hover:text-blue-800 underline shrink-0"
                >
                  Enter Manual Details
                </button>
              </div>
            </div>
          ) : (
            /* STEP 2: REVIEW & EDIT EXTRACTED EXPERIMENTS */
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <div>
                  <h4 className="text-xs font-bold text-gray-900">
                    Extracted Experiments ({candidateExperiments.length})
                  </h4>
                  <p className="text-[11px] text-gray-500">
                    Source: {file?.name} ({pageCount} page{pageCount > 1 ? 's' : ''})
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setCandidateExperiments([
                      ...candidateExperiments,
                      {
                        experiment_number: candidateExperiments.length + 1,
                        title: `Experiment ${candidateExperiments.length + 1}`,
                        aim: 'Objective stated here...',
                        procedure: ['Step 1: Execute algorithm'],
                        requirements: ['Lab Computer'],
                        status: 'NOT_STARTED',
                      },
                    ]);
                  }}
                  className="text-xs h-8 gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Experiment
                </Button>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Manual Title</label>
                <input
                  type="text"
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-3 max-h-[46vh] overflow-y-auto pr-1">
                {candidateExperiments.map((exp, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl border border-gray-200 bg-gray-50/50 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                        {exp.experiment_number || idx + 1}
                      </span>
                      <input
                        type="text"
                        value={exp.title || ''}
                        onChange={(e) => {
                          const copy = [...candidateExperiments];
                          copy[idx] = { ...copy[idx], title: e.target.value };
                          setCandidateExperiments(copy);
                        }}
                        className="flex-1 px-2.5 py-1 text-xs border border-gray-300 rounded-lg bg-white font-bold text-gray-900 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const copy = candidateExperiments.filter((_, i) => i !== idx);
                          setCandidateExperiments(copy);
                        }}
                        className="p-1 text-gray-400 hover:text-red-500 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-0.5">Aim</label>
                      <input
                        type="text"
                        value={exp.aim || exp.objective || ''}
                        onChange={(e) => {
                          const copy = [...candidateExperiments];
                          copy[idx] = { ...copy[idx], aim: e.target.value, objective: e.target.value };
                          setCandidateExperiments(copy);
                        }}
                        className="w-full px-2.5 py-1 text-xs border border-gray-200 rounded bg-white text-gray-700 focus:outline-none"
                        placeholder="State aim..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          {!isReviewStep ? (
            <>
              <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isUploading}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleProcessUpload}
                disabled={!file || isUploading}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs min-w-[130px]"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Extracting...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Extract Content
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsReviewStep(false)}
                disabled={isSavingManual}
              >
                Back to Upload
              </Button>
              <Button
                type="button"
                onClick={handleConfirmAndSave}
                disabled={isSavingManual || candidateExperiments.length === 0}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs min-w-[140px]"
              >
                {isSavingManual ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Confirm & Save Manual
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
