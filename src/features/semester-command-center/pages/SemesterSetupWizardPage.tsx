// src/features/semester-command-center/pages/SemesterSetupWizardPage.tsx
// Guided 4-Step Academic Semester Setup Wizard (Section 4, 5, 7)

import * as React from 'react';
import {
  GraduationCap,
  BookOpen,
  Calendar,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Plus,
  Trash2,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { PageContainer } from '../../../components/layout/PageComponents';
import { Button } from '../../../components/ui/button';
import { SemesterCommandCenterLayout } from '../components/SemesterCommandCenterLayout';
import { semesterCommandCenterApi } from '../../../api/semesterCommandCenterApi';
import {
  AcademicSemesterConfig,
  BranchCode,
  SubjectType,
  DifficultyLevel,
  PriorityLevel,
} from '../../../types/semesterCommandCenter';
import { toast } from 'sonner';

interface SemesterSetupWizardPageProps {
  onNavigate?: (path: string) => void;
}

export function SemesterSetupWizardPage({ onNavigate }: SemesterSetupWizardPageProps) {
  const [currentStep, setCurrentStep] = React.useState<number>(1);
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);

  // Step 1: Academic Information
  const [academicInfo, setAcademicInfo] = React.useState({
    semester_number: 1,
    academic_year: '',
    branch: 'CSE' as BranchCode,
    section: '',
    start_date: '',
    end_date: '',
    target_gpa: undefined as number | undefined,
    daily_study_hours_budget: 0,
  });

  // Start from the student's saved semester settings, not sample values.
  React.useEffect(() => {
    semesterCommandCenterApi
      .getConfig()
      .then((cfg) =>
        setAcademicInfo((prev) => ({
          ...prev,
          semester_number: cfg.semester_number || prev.semester_number,
          academic_year: cfg.academic_year || '',
          branch: (cfg.branch as BranchCode) || prev.branch,
          section: cfg.section || '',
          start_date: cfg.start_date || '',
          end_date: cfg.end_date || '',
          target_gpa: cfg.target_gpa,
          daily_study_hours_budget: cfg.daily_study_hours_budget || 0,
        }))
      )
      .catch((err: any) => toast.error('Could not load your semester settings: ' + err.message));
  }, []);

  // Step 2: Subjects
  const [subjectsList, setSubjectsList] = React.useState<
    {
      name: string;
      code: string;
      credits: number;
      subject_type: SubjectType;
      difficulty: DifficultyLevel;
      priority: PriorityLevel;
    }[]
  >([]);

  const [newSub, setNewSub] = React.useState({
    name: '',
    code: '',
    credits: 3,
    subject_type: 'CORE' as SubjectType,
    difficulty: 'MEDIUM' as DifficultyLevel,
    priority: 'HIGH' as PriorityLevel,
  });

  // Step 3: Calendar Milestones
  const [calendarMilestones, setCalendarMilestones] = React.useState({
    slip_test_1: '',
    minor_1_date: '',
    minor_2_date: '',
    lab_exam_date: '',
    end_sem_date: '',
  });

  const handleAddSubjectToWizard = () => {
    if (!newSub.name || !newSub.code) {
      toast.error('Please enter subject name and code.');
      return;
    }
    setSubjectsList([...subjectsList, newSub]);
    setNewSub({
      name: '',
      code: '',
      credits: 3,
      subject_type: 'CORE',
      difficulty: 'MEDIUM',
      priority: 'HIGH',
    });
    toast.success('Subject added to the list. It is saved when you finish setup.');
  };

  const handleRemoveSubject = (index: number) => {
    setSubjectsList(subjectsList.filter((_, i) => i !== index));
  };

  const handleGenerateStrategy = async () => {
    try {
      setIsSubmitting(true);
      await semesterCommandCenterApi.updateConfig({
        ...academicInfo,
        total_teaching_weeks: 16,
      });
      // Subjects entered in the wizard were previously kept only in page state; save them.
      for (const sub of subjectsList) {
        await semesterCommandCenterApi.addSubject(sub as any);
      }
      setSubjectsList([]);
      const milestones: { date: string; title: string; event_type: any }[] = [
        { date: calendarMilestones.slip_test_1, title: 'Slip Test 1', event_type: 'SLIP_TEST' },
        { date: calendarMilestones.minor_1_date, title: 'Minor 1', event_type: 'MINOR_1' },
        { date: calendarMilestones.minor_2_date, title: 'Minor 2', event_type: 'MINOR_2' },
        { date: calendarMilestones.lab_exam_date, title: 'Lab Exam', event_type: 'LAB_EXAM' },
        { date: calendarMilestones.end_sem_date, title: 'End-Semester Exams', event_type: 'END_SEMESTER' },
      ];
      for (const m of milestones.filter((x) => x.date)) {
        await semesterCommandCenterApi.addEvent({ ...m, priority: 'HIGH', status: 'UPCOMING' } as any);
      }
      toast.success('Semester settings saved. Opening the overview...');
      if (onNavigate) {
        setTimeout(() => onNavigate('/semester-command-center'), 800);
      }
    } catch (err: any) {
      toast.error('Failed to configure semester: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <SemesterCommandCenterLayout currentTab="setup" onNavigate={onNavigate}>
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Wizard Progress Stepper */}
          <div className="p-5 bg-white border border-slate-200 rounded-xl">
            <div className="flex items-center justify-between">
              {[
                { step: 1, title: 'Academic Info' },
                { step: 2, title: 'Subjects & Credits' },
                { step: 3, title: 'Calendar & Exams' },
                { step: 4, title: 'Generate Strategy' },
              ].map((s) => (
                <div key={s.step} className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-mono transition-colors ${
                      currentStep === s.step
                        ? 'bg-indigo-600 text-white ring-4 ring-indigo-500/20'
                        : currentStep > s.step
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-50 text-slate-500'
                    }`}
                  >
                    {currentStep > s.step ? <Check className="w-3.5 h-3.5" /> : s.step}
                  </div>
                  <span
                    className={`text-xs hidden sm:inline font-medium ${
                      currentStep === s.step ? 'text-slate-900 font-semibold' : 'text-slate-500'
                    }`}
                  >
                    {s.title}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* STEP 1: Academic Info */}
          {currentStep === 1 && (
            <div className="p-6 bg-white border border-slate-200 rounded-xl space-y-5">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-indigo-600" />
                  Step 1: Academic Semester Configuration
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Enter your university academic session, semester number, and engineering department.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Semester Number *</label>
                  <select
                    value={academicInfo.semester_number}
                    onChange={(e) => setAcademicInfo({ ...academicInfo, semester_number: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-mono"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                      <option key={num} value={num}>
                        Semester {num}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Academic Year *</label>
                  <input
                    type="text"
                    value={academicInfo.academic_year}
                    onChange={(e) => setAcademicInfo({ ...academicInfo, academic_year: e.target.value })}
                    placeholder="2025-2026"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Engineering Branch *</label>
                  <select
                    value={academicInfo.branch}
                    onChange={(e) => setAcademicInfo({ ...academicInfo, branch: e.target.value as any })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="CSE">Computer Science & Engineering (CSE)</option>
                    <option value="AIML">Artificial Intelligence & Machine Learning (AIML)</option>
                    <option value="ECE">Electronics & Communication (ECE)</option>
                    <option value="EEE">Electrical & Electronics (EEE)</option>
                    <option value="MECHANICAL">Mechanical Engineering</option>
                    <option value="CIVIL">Civil Engineering</option>
                    <option value="IT">Information Technology (IT)</option>
                    <option value="OTHER">Other Engineering Specialization</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Section (Optional)</label>
                  <input
                    type="text"
                    value={academicInfo.section}
                    onChange={(e) => setAcademicInfo({ ...academicInfo, section: e.target.value })}
                    placeholder="A / B / C"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Semester Start Date</label>
                  <input
                    type="date"
                    value={academicInfo.start_date}
                    onChange={(e) => setAcademicInfo({ ...academicInfo, start_date: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Semester End Date</label>
                  <input
                    type="date"
                    value={academicInfo.end_date}
                    onChange={(e) => setAcademicInfo({ ...academicInfo, end_date: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end">
                <Button
                  onClick={() => setCurrentStep(2)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs"
                >
                  Next: Enter Subjects <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: Subjects & Credits */}
          {currentStep === 2 && (
            <div className="p-6 bg-white border border-slate-200 rounded-xl space-y-5">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  Step 2: Enrolled Subjects & Credits
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Register all theory subjects, electives, and practical labs with credits and priority.
                </p>
              </div>

              {/* Current Subjects List */}
              <div className="space-y-2">
                {subjectsList.map((sub, i) => (
                  <div
                    key={i}
                    className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{sub.name}</span>
                        <span className="font-mono text-slate-500">{sub.code}</span>
                      </div>
                      <span className="text-[11px] text-slate-500">
                        {sub.credits} Credits • {sub.subject_type} • Difficulty: {sub.difficulty} • Priority:{' '}
                        {sub.priority}
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemoveSubject(i)}
                      className="text-slate-500 hover:text-red-600 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Subject Inline Form */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  + Add Subject to Semester
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={newSub.name}
                    onChange={(e) => setNewSub({ ...newSub, name: e.target.value })}
                    placeholder="Subject Name (e.g. Software Eng)"
                    className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                  <input
                    type="text"
                    value={newSub.code}
                    onChange={(e) => setNewSub({ ...newSub, code: e.target.value })}
                    placeholder="Subject Code (e.g. CS605PC)"
                    className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={6}
                      value={newSub.credits}
                      onChange={(e) => setNewSub({ ...newSub, credits: Number(e.target.value) })}
                      placeholder="Credits"
                      className="w-20 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-mono"
                    />
                    <Button
                      size="sm"
                      onClick={handleAddSubjectToWizard}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs flex-1"
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                  className="text-xs border-slate-200 text-slate-700"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back
                </Button>
                <Button
                  onClick={() => setCurrentStep(3)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs"
                >
                  Next: Calendar Milestones <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: Calendar Milestones */}
          {currentStep === 3 && (
            <div className="p-6 bg-white border border-slate-200 rounded-xl space-y-5">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  Step 3: Examination & Test Milestones
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Set approximate or announced dates for slip tests, mid-term minors, and end-semesters.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    First Upcoming Slip Test Date
                  </label>
                  <input
                    type="date"
                    value={calendarMilestones.slip_test_1}
                    onChange={(e) =>
                      setCalendarMilestones({ ...calendarMilestones, slip_test_1: e.target.value })
                    }
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Internal Lab Practical Exam Date
                  </label>
                  <input
                    type="date"
                    value={calendarMilestones.lab_exam_date}
                    onChange={(e) =>
                      setCalendarMilestones({ ...calendarMilestones, lab_exam_date: e.target.value })
                    }
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Minor Examination 2 Start Date
                  </label>
                  <input
                    type="date"
                    value={calendarMilestones.minor_2_date}
                    onChange={(e) =>
                      setCalendarMilestones({ ...calendarMilestones, minor_2_date: e.target.value })
                    }
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Final University End-Semester Date
                  </label>
                  <input
                    type="date"
                    value={calendarMilestones.end_sem_date}
                    onChange={(e) =>
                      setCalendarMilestones({ ...calendarMilestones, end_sem_date: e.target.value })
                    }
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(2)}
                  className="text-xs border-slate-200 text-slate-700"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back
                </Button>
                <Button
                  onClick={() => setCurrentStep(4)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs"
                >
                  Review & Generate Strategy <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: Review & Generate Strategy */}
          {currentStep === 4 && (
            <div className="p-6 bg-white border border-slate-200 rounded-xl space-y-5">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  Step 4: Academic Strategy Generation
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Confirm your semester blueprint to generate the adaptive study stream and priority engines.
                </p>
              </div>

              <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Academic Target:</span>
                  <span className="text-slate-900 font-bold font-mono">
                    Semester {academicInfo.semester_number} ({academicInfo.branch}) - GPA {academicInfo.target_gpa ?? 'not set'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Total Enrolled Subjects:</span>
                  <span className="text-indigo-600 font-bold font-mono">{subjectsList.length} Subjects</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Daily Study Allocation:</span>
                  <span className="text-emerald-600 font-bold font-mono">
                    {academicInfo.daily_study_hours_budget} hours / day
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(3)}
                  className="text-xs border-slate-200 text-slate-700"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back
                </Button>
                <Button
                  disabled={isSubmitting}
                  onClick={handleGenerateStrategy}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1" />
                  {isSubmitting ? 'Generating Strategy...' : 'Generate Full Semester Strategy'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </SemesterCommandCenterLayout>
    </PageContainer>
  );
}
