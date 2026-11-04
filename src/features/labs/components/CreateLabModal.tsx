// src/features/labs/components/CreateLabModal.tsx
// Modal for creating or editing a laboratory course with validation

import React, { useState } from 'react';
import { X, FlaskConical, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { LabCourse, LabType } from '../types/labAssistantTypes';
import { labAssistantApi } from '../api/labAssistantApi';
import { toast } from 'sonner';

interface CreateLabModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (lab: LabCourse) => void;
  editLab?: LabCourse | null;
}

export function CreateLabModal({ isOpen, onClose, onCreated, editLab }: CreateLabModalProps) {
  const [name, setName] = useState(editLab?.name || '');
  const [subject, setSubject] = useState(editLab?.subject || '');
  const [semester, setSemester] = useState<number>(editLab?.semester || 6);
  const [courseCode, setCourseCode] = useState(editLab?.course_code || '');
  const [department, setDepartment] = useState(editLab?.department || editLab?.branch || 'Computer Science & Engineering');
  const [college, setCollege] = useState(editLab?.university_or_college || '');
  const [academicYear, setAcademicYear] = useState(editLab?.academic_year || '2026-2027');
  const [facultyName, setFacultyName] = useState(editLab?.faculty_name || '');
  const [labType, setLabType] = useState<LabType>(editLab?.lab_type || 'PROGRAMMING');
  const [tools, setTools] = useState(editLab?.tools_or_languages || '');
  const [description, setDescription] = useState(editLab?.description || '');
  const [manualTitle, setManualTitle] = useState(editLab?.manual_title || '');
  const [instructions, setInstructions] = useState(editLab?.additional_instructions || '');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    const trimmedSubject = subject.trim();

    if (!trimmedName) {
      setError('Laboratory name is required');
      return;
    }
    if (!trimmedSubject) {
      setError('Subject name is required');
      return;
    }
    if (!semester || semester < 1 || semester > 10) {
      setError('Valid semester between 1 and 10 is required');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload: Partial<LabCourse> = {
        name: trimmedName,
        subject: trimmedSubject,
        semester: Number(semester),
        course_code: courseCode.trim() || undefined,
        department: department.trim() || undefined,
        branch: department.trim() || undefined,
        university_or_college: college.trim() || undefined,
        academic_year: academicYear.trim() || undefined,
        faculty_name: facultyName.trim() || undefined,
        lab_type: labType,
        tools_or_languages: tools.trim() || undefined,
        description: description.trim() || undefined,
        manual_title: manualTitle.trim() || undefined,
        additional_instructions: instructions.trim() || undefined,
      };

      let result: LabCourse;
      if (editLab) {
        result = await labAssistantApi.updateLab(editLab.id, payload);
        toast.success(`Laboratory '${result.name}' updated successfully!`);
      } else {
        result = await labAssistantApi.createLab(payload);
        toast.success(`Laboratory '${result.name}' created!`);
      }
      onCreated(result);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save laboratory course');
      toast.error(err.message || 'Error saving laboratory');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-2xl my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                {editLab ? 'Edit Laboratory Course' : 'Create New Laboratory Course'}
              </h3>
              <p className="text-xs text-gray-500">
                Configure curriculum, academic semester, and practical subject details
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Core Required Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Laboratory Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Data Structures & Algorithms Lab"
                className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Subject Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Data Structures (CS301)"
                className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Semester <span className="text-red-500">*</span>
              </label>
              <select
                value={semester}
                onChange={(e) => setSemester(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Course Code</label>
              <input
                type="text"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                placeholder="e.g. CS301L"
                className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Laboratory Type</label>
              <select
                value={labType}
                onChange={(e) => setLabType(e.target.value as LabType)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
              >
                <option value="PROGRAMMING">Programming Lab (C/C++, Python, Java)</option>
                <option value="DBMS">Database / SQL Lab</option>
                <option value="AI_ML">AI & Machine Learning Lab</option>
                <option value="NETWORKS">Computer Networks Lab</option>
                <option value="OPERATING_SYSTEMS">Operating Systems Lab</option>
                <option value="HARDWARE">Electronics / Hardware Lab</option>
                <option value="WEB_DEVELOPMENT">Web Development Lab</option>
                <option value="GENERAL">General Practical Lab</option>
              </select>
            </div>
          </div>

          {/* Academic & University Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Department / Branch</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Computer Science & Engineering"
                className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">University / College</label>
              <input
                type="text"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                placeholder="e.g. National Institute of Technology"
                className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Faculty / Lab Instructor</label>
              <input
                type="text"
                value={facultyName}
                onChange={(e) => setFacultyName(e.target.value)}
                placeholder="e.g. Dr. K. Ramesh"
                className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Tools / Languages</label>
              <input
                type="text"
                value={tools}
                onChange={(e) => setTools(e.target.value)}
                placeholder="e.g. GCC, GDB, Python 3.11, VS Code"
                className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Laboratory Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of laboratory objectives and curriculum goals..."
              className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Lab Manual Title (Optional)
            </label>
            <input
              type="text"
              value={manualTitle}
              onChange={(e) => setManualTitle(e.target.value)}
              placeholder="e.g. Department of CSE Data Structures Laboratory Manual 2026"
              className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : editLab ? (
                'Save Changes'
              ) : (
                'Create Laboratory'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
