// src/features/labs/components/ManualEntryModal.tsx
// Comprehensive dedicated Manual Entry modal supporting full dynamic experiment authoring

import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  BookOpen,
  Code2,
  ListOrdered,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Save,
  Eye,
  Loader2,
  FlaskConical,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { LabCourse, LabManual, LabExperimentDetail, LabType } from '../types/labAssistantTypes';
import { labAssistantApi } from '../api/labAssistantApi';
import { toast } from 'sonner';

interface ManualEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  lab: LabCourse;
  onSaved: (manual: LabManual, experiments: LabExperimentDetail[]) => void;
}

interface EditableExperimentForm extends Partial<LabExperimentDetail> {
  tempId: string;
  isExpanded?: boolean;
}

export function ManualEntryModal({ isOpen, onClose, lab, onSaved }: ManualEntryModalProps) {
  // Manual Info State
  const [manualTitle, setManualTitle] = useState(lab.manual_title || `${lab.name} Manual`);
  const [subject, setSubject] = useState(lab.subject);
  const [courseCode, setCourseCode] = useState(lab.course_code);
  const [semester, setSemester] = useState<number>(lab.semester);
  const [department, setDepartment] = useState(lab.department || lab.branch || 'Computer Science');
  const [labType, setLabType] = useState<LabType>(lab.lab_type || 'PROGRAMMING');
  const [tools, setTools] = useState(lab.tools_or_languages || '');
  const [description, setDescription] = useState(lab.description || '');
  const [instructions, setInstructions] = useState(lab.additional_instructions || '');

  // Experiments List State
  const [experiments, setExperiments] = useState<EditableExperimentForm[]>([
    {
      tempId: 'temp_exp_1',
      experiment_number: 1,
      title: 'Implementation of Linear Search and Binary Search Algorithms',
      aim: 'To write, execute and analyze the time complexity of Linear and Binary Search in an array.',
      problem_statement: 'Given an array of N sorted integers and a target key K, find the index of K or report not found.',
      theory: 'Linear Search scans elements sequentially with O(N) complexity. Binary Search uses divide-and-conquer on sorted inputs achieving O(log N) time.',
      prerequisites: ['Basic Arrays', 'Conditionals and Loops'],
      requirements: ['GCC / Clang or Python 3.10+', 'Code Editor'],
      procedure: [
        'Initialize array with sorted numerical test elements.',
        'Accept search target key from standard input.',
        'Compare key against midpoint element.',
        'Narrow search space to left or right subarray depending on comparison.',
        'Output index position if matched, or return -1.',
      ],
      algorithm: '1. Set low=0, high=N-1\n2. While low <= high:\n   mid = (low + high) / 2\n   if arr[mid] == key: return mid\n   else if arr[mid] < key: low = mid + 1\n   else: high = mid - 1\n3. Return -1',
      implementation_code: `def binary_search(arr, key):\n    low, high = 0, len(arr) - 1\n    while low <= high:\n        mid = (low + high) // 2\n        if arr[mid] == key:\n            return mid\n        elif arr[mid] < key:\n            low = mid + 1\n        else:\n            high = mid - 1\n    return -1\n\n# Driver Execution\ndata = [12, 24, 32, 45, 56, 67, 78, 89, 90]\nkey = 45\nidx = binary_search(data, key)\nprint(f"Element {key} found at index: {idx}")`,
      code_language: 'python',
      sample_input: 'key: 45, array: [12, 24, 32, 45, 56, 67, 78, 89, 90]',
      sample_output: 'Element 45 found at index: 3',
      expected_output: 'Element 45 found at index: 3',
      result_conclusion: 'Binary search was executed successfully with O(log N) operations verified.',
      viva_questions: [
        {
          id: 'vq_1_1',
          question: 'What is the precondition for executing Binary Search on an array?',
          expected_concept: 'The array must be sorted in ascending or descending order beforehand.',
          difficulty: 'BASIC',
        },
        {
          id: 'vq_1_2',
          question: 'Why does integer overflow happen in `(low + high) / 2` and how do you avoid it?',
          expected_concept: 'If low and high sum exceeds maximum 32-bit signed integer (2^31 - 1). Mitigated using `low + (high - low) / 2`.',
          difficulty: 'INTERMEDIATE',
        },
      ],
      references: ['Introduction to Algorithms (CLRS)', 'B.Tech University Practical Syllabus'],
      isExpanded: true,
    },
  ]);

  const [activeTab, setActiveTab] = useState<'manual_info' | 'experiments' | 'preview'>('experiments');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Experiment item handlers
  const handleAddExperiment = () => {
    const nextNum = experiments.length + 1;
    const newExp: EditableExperimentForm = {
      tempId: `temp_exp_${Date.now()}`,
      experiment_number: nextNum,
      title: `Experiment ${nextNum}: `,
      aim: '',
      theory: '',
      requirements: ['Standard Laboratory Environment'],
      procedure: [
        'Review experiment prerequisites and inputs.',
        'Implement the algorithm logic.',
        'Execute program and record actual outputs.',
        'Formulate conclusion and review viva concepts.',
      ],
      algorithm: '',
      implementation_code: '',
      code_language: labType === 'DBMS' ? 'sql' : 'python',
      expected_output: '',
      result_conclusion: 'Experiment executed and verified successfully.',
      viva_questions: [
        {
          id: `vq_${Date.now()}_1`,
          question: 'Explain the core operational principle of this experiment.',
          expected_concept: 'Key conceptual invariant demonstrated in practice.',
          difficulty: 'BASIC',
        },
      ],
      isExpanded: true,
    };
    setExperiments([...experiments, newExp]);
  };

  const handleRemoveExperiment = (index: number) => {
    if (experiments.length <= 1) {
      toast.error('At least one experiment must be present in the manual.');
      return;
    }
    const updated = experiments.filter((_, i) => i !== index).map((e, idx) => ({
      ...e,
      experiment_number: idx + 1,
    }));
    setExperiments(updated);
    toast.info('Experiment removed');
  };

  const handleDuplicateExperiment = (index: number) => {
    const source = experiments[index];
    const nextNum = experiments.length + 1;
    const clone: EditableExperimentForm = {
      ...source,
      tempId: `temp_exp_${Date.now()}`,
      experiment_number: nextNum,
      title: `${source.title} (Copy)`,
      isExpanded: true,
    };
    setExperiments([...experiments, clone]);
    toast.success('Experiment duplicated');
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const items = [...experiments];
    const temp = items[index];
    items[index] = items[index - 1];
    items[index - 1] = temp;
    setExperiments(items.map((e, idx) => ({ ...e, experiment_number: idx + 1 })));
  };

  const handleMoveDown = (index: number) => {
    if (index === experiments.length - 1) return;
    const items = [...experiments];
    const temp = items[index];
    items[index] = items[index + 1];
    items[index + 1] = temp;
    setExperiments(items.map((e, idx) => ({ ...e, experiment_number: idx + 1 })));
  };

  const handleUpdateExpField = (index: number, field: keyof EditableExperimentForm, val: any) => {
    setExperiments((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const handleSave = async (isDraft: boolean = false) => {
    setError(null);
    if (!manualTitle.trim()) {
      setError('Manual title is required');
      setActiveTab('manual_info');
      return;
    }

    if (experiments.length === 0) {
      setError('Please add at least one experiment');
      setActiveTab('experiments');
      return;
    }

    for (let i = 0; i < experiments.length; i++) {
      if (!experiments[i].title?.trim()) {
        setError(`Experiment #${i + 1} requires a valid title`);
        setActiveTab('experiments');
        return;
      }
    }

    try {
      setIsSaving(true);
      const manualPayload: Partial<LabManual> = {
        title: manualTitle.trim(),
        subject: subject.trim(),
        course_code: courseCode.trim(),
        semester: Number(semester),
        department: department.trim(),
        lab_type: labType,
        tools: tools.trim(),
        description: description.trim(),
        instructions: instructions.trim(),
        is_draft: isDraft,
      };

      const res = await labAssistantApi.saveManualDetails(lab.id, manualPayload, experiments);
      toast.success(
        isDraft
          ? 'Manual draft saved successfully!'
          : `Manual '${res.manual.title}' with ${res.experiments.length} experiments saved!`
      );
      onSaved(res.manual, res.experiments);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save manual details');
      toast.error(err.message || 'Error saving manual');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-5xl my-6 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded">
                  Manual Authoring Suite
                </span>
                <span className="text-xs text-gray-500 font-medium">Independent of AI</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mt-0.5">
                Enter Manual Details: {lab.name}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-6 border-b border-gray-200 bg-gray-50/80 gap-3 pt-2">
          <button
            onClick={() => setActiveTab('experiments')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'experiments'
                ? 'border-blue-600 text-blue-600 bg-white rounded-t-lg shadow-xs'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <ListOrdered className="w-4 h-4" />
            Experiments ({experiments.length})
          </button>
          <button
            onClick={() => setActiveTab('manual_info')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'manual_info'
                ? 'border-blue-600 text-blue-600 bg-white rounded-t-lg shadow-xs'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <FlaskConical className="w-4 h-4" />
            Manual & Subject Metadata
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'preview'
                ? 'border-blue-600 text-blue-600 bg-white rounded-t-lg shadow-xs'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Eye className="w-4 h-4" />
            Full Manual Preview
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: EXPERIMENTS BUILDER */}
          {activeTab === 'experiments' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2">
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Laboratory Experiments List</h4>
                  <p className="text-xs text-gray-500">
                    Add, edit, reorder, and configure the syllabus experiments for this manual
                  </p>
                </div>
                <Button
                  onClick={handleAddExperiment}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Add Experiment
                </Button>
              </div>

              {experiments.map((exp, idx) => (
                <div
                  key={exp.tempId}
                  className="rounded-xl border border-gray-200 bg-white shadow-xs overflow-hidden transition-all hover:border-gray-300"
                >
                  {/* Collapsible Header */}
                  <div className="px-4 py-3 bg-gray-50 flex items-center justify-between gap-3 border-b border-gray-100">
                    <div
                      className="flex items-center gap-2.5 flex-1 cursor-pointer select-none"
                      onClick={() => handleUpdateExpField(idx, 'isExpanded', !exp.isExpanded)}
                    >
                      <span className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                        {exp.experiment_number}
                      </span>
                      <span className="font-bold text-xs sm:text-sm text-gray-900 line-clamp-1">
                        {exp.title || `Experiment ${exp.experiment_number}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleMoveUp(idx)}
                        disabled={idx === 0}
                        title="Move Up"
                        className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 rounded"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveDown(idx)}
                        disabled={idx === experiments.length - 1}
                        title="Move Down"
                        className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 rounded"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDuplicateExperiment(idx)}
                        title="Duplicate"
                        className="p-1 text-gray-400 hover:text-blue-600 rounded"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveExperiment(idx)}
                        title="Delete"
                        className="p-1 text-gray-400 hover:text-red-600 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Body Fields */}
                  {exp.isExpanded && (
                    <div className="p-4 space-y-4 text-xs">
                      {/* Title & Aim */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block font-bold text-gray-700 mb-1">
                            Experiment Title <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={exp.title || ''}
                            onChange={(e) => handleUpdateExpField(idx, 'title', e.target.value)}
                            placeholder="e.g. Implementation of Linear and Binary Search"
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-gray-700 mb-1">Code Language / Tool</label>
                          <select
                            value={exp.code_language || 'python'}
                            onChange={(e) => handleUpdateExpField(idx, 'code_language', e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white"
                          >
                            <option value="python">Python 3</option>
                            <option value="c">C (GCC)</option>
                            <option value="cpp">C++ (G++)</option>
                            <option value="java">Java (OpenJDK)</option>
                            <option value="sql">SQL (SQLite / PostgreSQL)</option>
                            <option value="javascript">JavaScript (Node.js)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-gray-700 mb-1">Aim / Objective</label>
                        <textarea
                          rows={2}
                          value={exp.aim || ''}
                          onChange={(e) => handleUpdateExpField(idx, 'aim', e.target.value)}
                          placeholder="State the objective of this laboratory exercise..."
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>

                      {/* Theory & Problem Statement */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-gray-700 mb-1">Theory / Background</label>
                          <textarea
                            rows={3}
                            value={exp.theory || ''}
                            onChange={(e) => handleUpdateExpField(idx, 'theory', e.target.value)}
                            placeholder="Theoretical principles and invariant rules..."
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-gray-700 mb-1">Algorithm</label>
                          <textarea
                            rows={3}
                            value={exp.algorithm || ''}
                            onChange={(e) => handleUpdateExpField(idx, 'algorithm', e.target.value)}
                            placeholder="1. Start\n2. Initialize pointers\n3. Check invariant\n4. Stop"
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Procedure Checklist Steps */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block font-bold text-gray-700">
                            Procedure Steps (Checked by students in workspace)
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              const steps = exp.procedure ? [...exp.procedure] : [];
                              steps.push(`Step ${steps.length + 1}: `);
                              handleUpdateExpField(idx, 'procedure', steps);
                            }}
                            className="text-[11px] font-bold text-blue-600 hover:text-blue-700"
                          >
                            + Add Step
                          </button>
                        </div>
                        <div className="space-y-1.5">
                          {(exp.procedure || []).map((stepText, sIdx) => (
                            <div key={sIdx} className="flex items-center gap-2">
                              <span className="text-[11px] font-bold text-gray-400 w-4 text-right">
                                {sIdx + 1}.
                              </span>
                              <input
                                type="text"
                                value={stepText}
                                onChange={(e) => {
                                  const steps = [...(exp.procedure || [])];
                                  steps[sIdx] = e.target.value;
                                  handleUpdateExpField(idx, 'procedure', steps);
                                }}
                                className="flex-1 px-3 py-1 border border-gray-200 rounded-md text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const steps = (exp.procedure || []).filter((_, i) => i !== sIdx);
                                  handleUpdateExpField(idx, 'procedure', steps);
                                }}
                                className="p-1 text-gray-300 hover:text-red-500"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Source Code */}
                      <div>
                        <label className="block font-bold text-gray-700 mb-1">
                          Source Code / Script Template
                        </label>
                        <textarea
                          rows={6}
                          value={exp.implementation_code || exp.source_code || ''}
                          onChange={(e) => {
                            handleUpdateExpField(idx, 'implementation_code', e.target.value);
                            handleUpdateExpField(idx, 'source_code', e.target.value);
                          }}
                          placeholder="// Paste verified practical source code here..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-mono bg-gray-900 text-emerald-400 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>

                      {/* Expected Output & Sample Input */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-gray-700 mb-1">Sample Input</label>
                          <textarea
                            rows={2}
                            value={exp.sample_input || ''}
                            onChange={(e) => handleUpdateExpField(idx, 'sample_input', e.target.value)}
                            placeholder="Test input values..."
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-gray-700 mb-1">Expected Output</label>
                          <textarea
                            rows={2}
                            value={exp.expected_output || ''}
                            onChange={(e) => handleUpdateExpField(idx, 'expected_output', e.target.value)}
                            placeholder="Expected terminal output..."
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Viva Voce Questions */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block font-bold text-gray-700">
                            Viva Voce Questions (with Expected Concept)
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              const vq = exp.viva_questions ? [...exp.viva_questions] : [];
                              vq.push({
                                id: `vq_${Date.now()}_${vq.length + 1}`,
                                question: '',
                                expected_concept: '',
                                difficulty: 'INTERMEDIATE',
                              });
                              handleUpdateExpField(idx, 'viva_questions', vq);
                            }}
                            className="text-[11px] font-bold text-blue-600 hover:text-blue-700"
                          >
                            + Add Viva Question
                          </button>
                        </div>
                        <div className="space-y-2">
                          {(exp.viva_questions || []).map((vq, vIdx) => (
                            <div
                              key={vq.id || vIdx}
                              className="p-2.5 rounded-lg border border-gray-200 bg-gray-50/50 space-y-1.5"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-bold text-blue-700">Q{vIdx + 1}:</span>
                                <input
                                  type="text"
                                  value={vq.question}
                                  onChange={(e) => {
                                    const list = [...(exp.viva_questions || [])];
                                    list[vIdx] = { ...list[vIdx], question: e.target.value };
                                    handleUpdateExpField(idx, 'viva_questions', list);
                                  }}
                                  placeholder="Enter viva question..."
                                  className="flex-1 px-2.5 py-1 text-xs border border-gray-200 rounded bg-white focus:outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const list = (exp.viva_questions || []).filter((_, i) => i !== vIdx);
                                    handleUpdateExpField(idx, 'viva_questions', list);
                                  }}
                                  className="p-1 text-gray-400 hover:text-red-500"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <div className="pl-6">
                                <input
                                  type="text"
                                  value={vq.expected_concept}
                                  onChange={(e) => {
                                    const list = [...(exp.viva_questions || [])];
                                    list[vIdx] = { ...list[vIdx], expected_concept: e.target.value };
                                    handleUpdateExpField(idx, 'viva_questions', list);
                                  }}
                                  placeholder="Expected technical concept for AI evaluation..."
                                  className="w-full px-2.5 py-1 text-[11px] border border-gray-200 rounded bg-white focus:outline-none text-gray-600"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Result / Conclusion */}
                      <div>
                        <label className="block font-bold text-gray-700 mb-1">Result / Conclusion</label>
                        <input
                          type="text"
                          value={exp.result_conclusion || exp.conclusion || ''}
                          onChange={(e) => {
                            handleUpdateExpField(idx, 'result_conclusion', e.target.value);
                            handleUpdateExpField(idx, 'conclusion', e.target.value);
                          }}
                          placeholder="e.g. Hence, the algorithm was implemented and verified with O(N) complexity."
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: MANUAL METADATA */}
          {activeTab === 'manual_info' && (
            <div className="space-y-4 max-w-3xl">
              <div>
                <h4 className="text-sm font-bold text-gray-900">Manual General Information</h4>
                <p className="text-xs text-gray-500">
                  Curriculum header and official academic parameters for this practical manual
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Manual Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={manualTitle}
                    onChange={(e) => setManualTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Subject Name</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Course Code</label>
                  <input
                    type="text"
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Semester</label>
                  <input
                    type="number"
                    value={semester}
                    onChange={(e) => setSemester(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Laboratory Type</label>
                  <select
                    value={labType}
                    onChange={(e) => setLabType(e.target.value as LabType)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  >
                    <option value="PROGRAMMING">Programming Lab</option>
                    <option value="DBMS">Database / SQL Lab</option>
                    <option value="AI_ML">AI & ML Lab</option>
                    <option value="NETWORKS">Computer Networks Lab</option>
                    <option value="OPERATING_SYSTEMS">Operating Systems Lab</option>
                    <option value="HARDWARE">Hardware / Electronics Lab</option>
                    <option value="GENERAL">General Practical Lab</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Department / Branch</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Tools / Languages</label>
                <input
                  type="text"
                  value={tools}
                  onChange={(e) => setTools(e.target.value)}
                  placeholder="e.g. Python, GCC, SQLite, VS Code"
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Manual Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Additional Faculty Instructions
                </label>
                <textarea
                  rows={2}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="e.g. Submit lab record weekly; viva voce conducted after every experiment."
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* TAB 3: FULL MANUAL PREVIEW */}
          {activeTab === 'preview' && (
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 space-y-4 max-w-4xl mx-auto">
              <div className="text-center pb-4 border-b border-gray-200">
                <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">
                  Academic Laboratory Manual Preview
                </span>
                <h2 className="text-base font-bold text-gray-900 mt-1">{manualTitle}</h2>
                <p className="text-xs text-gray-600">
                  {subject} ({courseCode}) • Semester {semester} • {department}
                </p>
              </div>

              <div className="space-y-4">
                {experiments.map((exp) => (
                  <div key={exp.tempId} className="p-4 rounded-xl bg-white border border-gray-200 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-700">
                        Exp {exp.experiment_number}
                      </span>
                      <h4 className="text-sm font-bold text-gray-900">{exp.title}</h4>
                    </div>
                    {exp.aim && (
                      <p className="text-xs text-gray-700">
                        <strong className="text-gray-900">Aim:</strong> {exp.aim}
                      </p>
                    )}
                    {exp.theory && (
                      <p className="text-xs text-gray-600">
                        <strong className="text-gray-900">Theory:</strong> {exp.theory}
                      </p>
                    )}
                    {exp.procedure && exp.procedure.length > 0 && (
                      <div>
                        <strong className="text-xs text-gray-900">Procedure:</strong>
                        <ol className="list-decimal list-inside text-xs text-gray-600 pl-2 mt-1 space-y-0.5">
                          {exp.procedure.map((s, i) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ol>
                      </div>
                    )}
                    {exp.implementation_code && (
                      <div className="mt-2">
                        <strong className="text-xs text-gray-900">Code ({exp.code_language}):</strong>
                        <pre className="p-2.5 rounded-lg bg-gray-900 text-emerald-400 text-[11px] font-mono overflow-x-auto mt-1 max-h-36">
                          {exp.implementation_code}
                        </pre>
                      </div>
                    )}
                    {exp.viva_questions && exp.viva_questions.length > 0 && (
                      <div className="mt-2 text-xs">
                        <strong className="text-gray-900">Sample Viva Questions:</strong>
                        <ul className="list-disc list-inside text-gray-600 pl-2 mt-1 space-y-0.5">
                          {exp.viva_questions.map((vq, vIdx) => (
                            <li key={vIdx}>{vq.question}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Actions Bar */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleSave(true)}
              disabled={isSaving}
              className="text-xs"
            >
              <Save className="w-3.5 h-3.5 mr-1 text-gray-500" /> Save as Draft
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => handleSave(false)}
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs min-w-[130px]"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <FileCheck className="w-3.5 h-3.5 mr-1.5" /> Save Manual
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
