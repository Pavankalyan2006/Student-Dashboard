import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { placementsApi } from '../api/placementsApi';
import {
  Briefcase,
  PlayCircle,
  Calendar,
  Layers,
  CheckCircle2,
  Code2,
  FolderGit2,
  Sparkles,
  ArrowLeft,
  ChevronRight,
  BookOpen,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';
import type { PlacementRole } from '../types/placement';

interface Props {
  roleId?: string;
  onNavigate: (path: string) => void;
}

export const RolePreparationPage: React.FC<Props> = ({ roleId, onNavigate }) => {
  const [selectedRoleId, setSelectedRoleId] = useState<string>(roleId || 'role_sde');

  const { data: roles = [], isLoading: isRolesLoading } = useQuery({
    queryKey: ['placement-roles'],
    queryFn: () => placementsApi.getRoles(),
  });

  const activeRole: PlacementRole | undefined =
    roles.find((r) => r.id === selectedRoleId || r.slug === selectedRoleId) ||
    roles[0];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Back button */}
      <button
        onClick={() => onNavigate('/placements')}
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Placement Preparation
      </button>

      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 rounded-2xl p-6 sm:p-8 text-white shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs font-semibold tracking-wide text-blue-200 mb-3">
            <Sparkles className="h-3.5 w-3.5 text-blue-300" />
            Engineering Role Preparation Profiles
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
            {activeRole?.name || 'Role Preparation'}
          </h1>
          <p className="text-sm text-blue-100/90 leading-relaxed mb-6">
            {activeRole?.description || 'Prepare specifically for this engineering specialization with required competencies, interview topics, and recommended project defenses.'}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate(`/placements/mock-interview/setup`)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xs font-semibold shadow-md transition cursor-pointer"
            >
              <PlayCircle className="h-4 w-4" />
              Start Role Mock Interview
            </button>
            <button
              onClick={() => onNavigate('/placements/plans')}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-semibold transition backdrop-blur cursor-pointer"
            >
              <Calendar className="h-4 w-4" />
              Build Placement Roadmap
            </button>
            <button
              onClick={() => onNavigate('/projects')}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-semibold transition backdrop-blur cursor-pointer"
            >
              <FolderGit2 className="h-4 w-4" />
              Browse Recommended Projects
            </button>
          </div>
        </div>
      </div>

      {/* Role Selector Pill Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {roles.map((r) => {
            const isSelected = activeRole?.id === r.id;
            return (
              <button
                key={r.id}
                onClick={() => setSelectedRoleId(r.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60'
                }`}
              >
                <Briefcase className={`h-3.5 w-3.5 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                <span>{r.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {activeRole && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2 Cols): Core Skills, Technical Topics & Capstone Projects */}
          <div className="lg:col-span-2 space-y-6">
            {/* 1. Skill Requirements */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">1</span>
                Core Competencies & Technology Stack
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {activeRole.skill_requirements.map((skill, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-2.5 text-xs">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span className="font-medium text-slate-800">{skill}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Technical Topics */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">2</span>
                High-Yield Technical Interview Topics
              </h3>
              <div className="space-y-2">
                {activeRole.technical_topics.map((topic, idx) => (
                  <div key={idx} className="p-3.5 bg-blue-50/50 border border-blue-100 rounded-xl flex items-center justify-between text-xs">
                    <span className="font-semibold text-blue-950">{topic}</span>
                    <button
                      onClick={() => onNavigate(`/placements/technical`)}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Study & Practice</span>
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Recommended Projects to Discuss */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold flex items-center justify-center">3</span>
                Recommended Projects for Technical Defense
              </h3>
              <p className="text-xs text-slate-500">
                Interviewers prioritize architectural reasoning and trade-offs. Build or document one of these capstone projects using the Project Builder.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeRole.recommended_projects.map((proj, idx) => (
                  <div key={idx} className="p-4 bg-purple-50/40 border border-purple-100 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <FolderGit2 className="h-4 w-4 text-purple-600" />
                      <span className="font-bold text-purple-950">{proj}</span>
                    </div>
                    <button
                      onClick={() => onNavigate('/projects/create')}
                      className="text-[11px] font-semibold text-purple-700 hover:text-purple-800 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Build with Project AI</span>
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column (1 Col): Action Roadmap & Quick Links */}
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
              <h3 className="font-bold text-sm text-slate-900">Placement Preparation Plan</h3>
              <p className="text-xs text-slate-500">
                Generate an individualized study roadmap targeting {activeRole.name} requirements over 2 to 12 weeks.
              </p>
              <button
                onClick={() => onNavigate('/placements/plans')}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Calendar className="h-4 w-4" />
                <span>Create Study Plan</span>
              </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
              <h3 className="font-bold text-sm text-slate-900">Practice Modules</h3>
              <div className="space-y-2 text-xs">
                <button
                  onClick={() => onNavigate('/placements/topics?cat=APTITUDE')}
                  className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 flex items-center justify-between text-left cursor-pointer"
                >
                  <span className="font-medium">Quantitative Aptitude</span>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                </button>
                <button
                  onClick={() => onNavigate('/coding')}
                  className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 flex items-center justify-between text-left cursor-pointer"
                >
                  <span className="font-medium">Coding Lab & Sandbox</span>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                </button>
                <button
                  onClick={() => onNavigate('/dsa')}
                  className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 flex items-center justify-between text-left cursor-pointer"
                >
                  <span className="font-medium">DSA Visualizations & Practice</span>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                </button>
                <button
                  onClick={() => onNavigate('/placements/topics?cat=HR')}
                  className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 flex items-center justify-between text-left cursor-pointer"
                >
                  <span className="font-medium">HR & STAR Behavioral Stories</span>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default RolePreparationPage;
