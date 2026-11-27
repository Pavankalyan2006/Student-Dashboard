// src/features/knowledge-base/components/KnowledgeCollectionModal.tsx
// Modal wizard to create or edit a Knowledge Collection folder

import React, { useState, useEffect } from 'react';
import { X, Folder, BookOpen, Bookmark, FileText, Code, Check, Tag } from 'lucide-react';
import {
  KnowledgeCollection,
  KnowledgeCategory,
  CreateCollectionInput,
  UpdateCollectionInput,
} from '../types/knowledgeBaseTypes';

interface KnowledgeCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateCollectionInput | UpdateCollectionInput) => Promise<void>;
  editingCollection?: KnowledgeCollection | null;
}

const CATEGORIES: Array<{ id: KnowledgeCategory; label: string; desc: string }> = [
  { id: 'COURSEWORK', label: 'Coursework & Syllabi', desc: 'Semester syllabus and class schedules' },
  { id: 'LECTURE_NOTES', label: 'Lecture Notes', desc: 'Classroom notes, teacher presentations, slides' },
  { id: 'TEXTBOOK', label: 'Textbooks', desc: 'Standard engineering reference books & chapters' },
  { id: 'RESEARCH_PAPER', label: 'Research Papers', desc: 'ArXiv, IEEE, ACM papers and research notes' },
  { id: 'LAB_MANUAL', label: 'Lab Manuals', desc: 'Practical lab manuals, code snippets, viva guides' },
  { id: 'EXAM_PAPER', label: 'Previous Year Papers', desc: 'Mid-term and end-term university question papers' },
  { id: 'GATE_EXAM', label: 'GATE & Competitive', desc: 'Standard formula sheets and GATE study material' },
  { id: 'INTERVIEW_PREP', label: 'Interview Prep', desc: 'System design, DSA cheatsheets, behavioral prep' },
  { id: 'PROJECT_DOCS', label: 'Project Documentation', desc: 'SRS, architecture specs, final year project docs' },
  { id: 'GENERAL_STUDY', label: 'General Knowledge', desc: 'Articles, essays, and multi-disciplinary topics' },
];

const COLORS = [
  '#7B69F0', // Blue
  '#6B66EC', // Indigo
  '#8B72F5', // Purple
  '#8D6BEA', // Pink
  '#1CB67F', // Emerald
  '#37C9E8', // Teal
  '#E99A1E', // Amber
  '#E54C43', // Red
  '#647089', // Slate
];

export const KnowledgeCollectionModal: React.FC<KnowledgeCollectionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingCollection,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<KnowledgeCategory>('COURSEWORK');
  const [subject, setSubject] = useState('');
  const [semester, setSemester] = useState<number | undefined>(undefined);
  const [color, setColor] = useState('#7B69F0');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [visibility, setVisibility] = useState<'PRIVATE' | 'SHARED' | 'PUBLIC'>('PRIVATE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingCollection) {
      setName(editingCollection.name);
      setDescription(editingCollection.description || '');
      setCategory(editingCollection.category);
      setSubject(editingCollection.subject || '');
      setSemester(editingCollection.semester);
      setColor(editingCollection.color || '#7B69F0');
      setTags(editingCollection.tags || []);
      setVisibility(editingCollection.visibility || 'PRIVATE');
    } else {
      setName('');
      setDescription('');
      setCategory('COURSEWORK');
      setSubject('');
      setSemester(undefined);
      setColor('#7B69F0');
      setTags([]);
      setVisibility('PRIVATE');
    }
    setError(null);
  }, [editingCollection, isOpen]);

  if (!isOpen) return null;

  const handleAddTag = () => {
    const trimmed = tagInput.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Collection name is required');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onSave({
        name: name.trim(),
        description: description.trim(),
        category,
        subject: subject.trim() || undefined,
        semester: semester || undefined,
        tags,
        color,
        visibility,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save collection');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-900"
              style={{ backgroundColor: color }}
            >
              <Folder className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              {editingCollection ? 'Edit Collection' : 'Create New Collection'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Collection Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Collection Name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Operating Systems & Architecture"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-indigo-500 transition"
              required
            />
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as KnowledgeCategory)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-indigo-500 transition"
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Subject & Semester */}
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Subject / Course Code
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. CS401 or Operating Systems"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                B.Tech Semester
              </label>
              <select
                value={semester || ''}
                onChange={(e) => setSemester(e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-indigo-500 transition"
              >
                <option value="">Any / General</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of what this collection contains..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-indigo-500 transition resize-none"
            />
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Color Accent
            </label>
            <div className="flex items-center gap-2.5 flex-wrap">
              {COLORS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className="w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                  style={{ backgroundColor: c }}
                >
                  {color === c && <Check className="w-4 h-4 text-slate-900 stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Tags
            </label>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Add tag and press Enter"
                className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-indigo-500 transition"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium rounded-xl border border-slate-200 transition"
              >
                Add
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700"
                  >
                    <Tag className="w-3 h-3 text-indigo-600" />
                    <span>{t}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="ml-1 text-slate-500 hover:text-slate-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-white">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-500 hover:text-slate-900 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition shadow-lg shadow-indigo-600/25"
          >
            {loading ? 'Saving...' : editingCollection ? 'Update Collection' : 'Create Collection'}
          </button>
        </div>
      </div>
    </div>
  );
};
