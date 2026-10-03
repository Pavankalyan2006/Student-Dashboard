import React, { useEffect, useState } from 'react';
import { resumeApi } from '../../resume/api/resumeApi';
import { careerApi, CareerRoadmap } from '../../career/api/careerApi';
import { skillsApi, StudentSkill } from '../../skills/api/skillsApi';
import { FullResumeData } from '../../resume/types/resumeTypes';
import {
  FileUser,
  Compass,
  Award,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  ArrowRight,
  Target,
} from 'lucide-react';

interface CareerResumeWidgetProps {
  onNavigate: (path: string) => void;
}

export const CareerResumeWidget: React.FC<CareerResumeWidgetProps> = ({ onNavigate }) => {
  const [resumeData, setResumeData] = useState<FullResumeData | null>(null);
  const [activeRoadmap, setActiveRoadmap] = useState<CareerRoadmap | null>(null);
  const [skills, setSkills] = useState<StudentSkill[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [resList, rdmList, skillList] = await Promise.all([
          resumeApi.listResumes(),
          careerApi.listRoadmaps(),
          skillsApi.getProfile(),
        ]);

        if (resList.length > 0) {
          const fullRes = await resumeApi.getFullResume(resList[0].id);
          setResumeData(fullRes);
        }
        if (rdmList.length > 0) {
          setActiveRoadmap(rdmList[0]);
        }
        setSkills(skillList);
      } catch {
        // Fallback silently if offline or initial boot
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) return null;

  // Recommended next skill to develop
  const nextSkillCandidate = skills.find((s) => s.confidence === 'LIMITED_EVIDENCE' || s.confidence === 'DEVELOPING_EVIDENCE');
  const nextSkillName = nextSkillCandidate ? nextSkillCandidate.skill_name : 'System Design & APIs';

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600">
            <FileUser className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Career & Resume Readiness
            </h3>
            <p className="text-[11px] text-slate-500">
              Verified skills, live resume & career roadmap
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigate('/resume')}
          className="text-xs text-blue-600 hover:underline font-semibold flex items-center gap-1"
        >
          My Resume <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* 1. Resume Status Block */}
      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              {resumeData ? resumeData.resume.title : 'Software Engineer Resume'}
            </span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
              {resumeData?.resume.status || 'DRAFT'}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 block mt-0.5">
            Completeness: <strong>{resumeData?.completeness_score || 85}%</strong> • Template: {resumeData?.resume.template || 'TECHNICAL'}
          </span>
        </div>
        <button
          onClick={() => onNavigate(resumeData ? `/resume/${resumeData.resume.id}/edit` : '/resume')}
          className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50"
        >
          Edit
        </button>
      </div>

      {/* 2. Career Roadmap Block */}
      {activeRoadmap && (
        <div className="p-3.5 rounded-xl bg-purple-50/40 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30 flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900 dark:text-purple-200">
              <Compass className="h-3.5 w-3.5 text-purple-600" />
              {activeRoadmap.title}
            </div>
            <span className="text-[11px] text-purple-700 dark:text-purple-300 block">
              {activeRoadmap.steps.filter((s) => s.status === 'COMPLETED').length} of {activeRoadmap.steps.length} stages completed
            </span>
          </div>
          <button
            onClick={() => onNavigate('/career/roadmap')}
            className="px-2.5 py-1 rounded-md bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700"
          >
            Continue
          </button>
        </div>
      )}

      {/* 3. Skill Development & Recommended Next Skill */}
      <div className="pt-1 flex items-center justify-between text-xs">
        <div>
          <span className="text-[11px] text-slate-500 block">Recommended Next Skill:</span>
          <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Target className="h-3.5 w-3.5 text-emerald-600" />
            {nextSkillName}
          </span>
        </div>
        <button
          onClick={() => onNavigate('/skills/assessment')}
          className="text-xs text-purple-600 hover:underline font-semibold flex items-center gap-0.5"
        >
          Assess Skill <ArrowRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
};
