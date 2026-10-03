import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { placementsApi } from '../api/placementsApi';
import { projectsApi } from '../../projects/api/projectsApi';
import { MockInterviewType, PlacementDifficulty, MockInterviewMode } from '../types/placement';
import {
  PlayCircle,
  Briefcase,
  Building2,
  FolderGit2,
  Sliders,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  AlertCircle,
  History,
} from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  onNavigate: (path: string) => void;
}

export const MockInterviewSetupPage: React.FC<Props> = ({ onNavigate }) => {
  const [interviewType, setInterviewType] = useState<MockInterviewType>('TECHNICAL');
  const [roleId, setRoleId] = useState('role_sde');
  const [companyId, setCompanyId] = useState<string>('');
  const [projectId, setProjectId] = useState<string>('');
  const [difficulty, setDifficulty] = useState<PlacementDifficulty>('MEDIUM');
  const [mode, setMode] = useState<MockInterviewMode>('SIMULATION');
  const [maxQuestions, setMaxQuestions] = useState(4);
  const [isStarting, setIsStarting] = useState(false);

  // Fetch Roles, Companies, and Student Projects
  const { data: roles = [] } = useQuery({
    queryKey: ['placement-roles'],
    queryFn: () => placementsApi.getRoles(),
  });

  const { data: companies = [] } = useQuery({
    queryKey: ['placement-companies'],
    queryFn: () => placementsApi.getCompanies(),
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['student-projects'],
    queryFn: () => projectsApi.getProjects(),
  });

  const handleLaunch = async () => {
    setIsStarting(true);
    try {
      const res = await placementsApi.createInterview({
        interview_type: interviewType,
        role_id: roleId,
        company_id: companyId || undefined,
        project_id: projectId || undefined,
        difficulty,
        mode,
        max_questions: maxQuestions,
      });

      // Start the session
      await placementsApi.startInterview(res.session.id);
      toast.success('Mock interview session launched!');
      onNavigate(`/placements/mock-interview/${res.session.id}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to initialize mock interview');
      setIsStarting(false);
    }
  };

  const types: { id: MockInterviewType; title: string; desc: string }[] = [
    { id: 'TECHNICAL', title: 'Technical CS Fundamentals', desc: 'Core subjects: DBMS, OS, Computer Networks, OOP, and System Design.' },
    { id: 'CODING', title: 'Coding & Algorithmic Round', desc: 'Data structure problem solving linked directly to the Coding Sandbox.' },
    { id: 'PROJECT', title: 'Capstone Project Defense', desc: 'In-depth architecture, data flow, and trade-off questioning from your actual built project.' },
    { id: 'HR', title: 'HR & Cultural Fit', desc: 'Self-introduction, conflict resolution, strengths/weaknesses, and career alignment.' },
    { id: 'BEHAVIORAL', title: 'Behavioral STAR Method', desc: 'Formulating structured Situation-Task-Action-Result stories.' },
    { id: 'MIXED', title: 'Comprehensive Simulation', desc: 'Combined technical + project + behavioral recruitment round.' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('/placements')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Placement Preparation
        </button>
        <button
          onClick={() => onNavigate('/placements/history')}
          className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
        >
          <History className="h-4 w-4" />
          Past Interview History
        </button>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="p-1.5 bg-blue-50 text-blue-700 rounded-lg">
            <Sparkles className="h-5 w-5" />
          </span>
          <h1 className="text-2xl font-bold text-slate-900">AI Mock Interview Configuration</h1>
        </div>
        <p className="text-xs text-slate-500">
          Configure interview focus, target role, and simulation mode. The AI interviewer adapts dynamically based on your responses.
        </p>
      </div>

      {/* 1. Interview Type */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">1</span>
          Select Interview Type
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {types.map((t) => (
            <div
              key={t.id}
              onClick={() => setInterviewType(t.id)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                interviewType === t.id
                  ? 'bg-blue-50/70 border-blue-500 ring-2 ring-blue-500/20 shadow-sm'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-semibold text-slate-900 text-xs">{t.title}</span>
                {interviewType === t.id && <CheckCircle2 className="h-4 w-4 text-blue-600" />}
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">{t.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Role & Target Company */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">2</span>
          Target Role & Company Customization
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5 text-slate-400" />
              Target Engineering Role
            </label>
            <select
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-slate-400" />
              Target Company (Optional)
            </label>
            <select
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="">General Campus Recruitment</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Project Selector (Especially relevant for PROJECT or MIXED) */}
        {(interviewType === 'PROJECT' || interviewType === 'MIXED') && (
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <FolderGit2 className="h-3.5 w-3.5 text-slate-400" />
              Select Student Project (Grounded Defense)
            </label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="">Choose one of your saved projects...</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.domain})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500 mt-1">
              The AI interviewer will directly probe your actual database schema, modules, and architecture diagrams without inventing features.
            </p>
          </div>
        )}
      </div>

      {/* 3. Difficulty & Simulation Mode */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">3</span>
          Pacing & Difficulty Settings
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Difficulty Level</label>
            <div className="flex rounded-xl border border-slate-200 p-1 bg-slate-50">
              {(['EASY', 'MEDIUM', 'HARD'] as PlacementDifficulty[]).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(d)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    difficulty === d ? 'bg-white shadow text-blue-600' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Interview Mode</label>
            <div className="flex rounded-xl border border-slate-200 p-1 bg-slate-50">
              {(['SIMULATION', 'PRACTICE'] as MockInterviewMode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    mode === m ? 'bg-white shadow text-blue-600' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {m === 'SIMULATION' ? 'Simulation' : 'Practice (Hints)'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Questions: {maxQuestions} ({maxQuestions * 6} mins approx)
            </label>
            <input
              type="range"
              min="2"
              max="8"
              value={maxQuestions}
              onChange={(e) => setMaxQuestions(Number(e.target.value))}
              className="w-full mt-2"
            />
          </div>
        </div>
      </div>

      {/* Start Button */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          onClick={() => onNavigate('/placements')}
          className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800"
        >
          Cancel
        </button>
        <button
          onClick={handleLaunch}
          disabled={isStarting}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-md transition-all"
        >
          {isStarting ? (
            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <PlayCircle className="h-4 w-4" />
          )}
          <span>Launch AI Mock Interview</span>
        </button>
      </div>
    </div>
  );
};
