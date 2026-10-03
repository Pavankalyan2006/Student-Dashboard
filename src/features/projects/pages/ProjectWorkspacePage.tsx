import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '../api/projectsApi';
import {
  Project,
  ProjectWorkspaceTab,
  ProjectDocumentType,
  TaskStatus,
  MilestoneStatus,
} from '../types/project';
import { ArchitectureCanvas } from '../components/ArchitectureCanvas';
import { ProjectTaskCard } from '../components/ProjectTaskCard';
import { ProjectDocumentEditor } from '../components/ProjectDocumentEditor';
import { MarkdownContent } from '../../../components/content/MarkdownContent';
import {
  FolderKanban,
  LayoutDashboard,
  Calendar,
  Network,
  CheckSquare,
  Cpu,
  FileText,
  TestTube,
  Sparkles,
  Settings,
  ArrowRight,
  Code2,
  BookOpen,
  Plus,
  RefreshCw,
  Trash2,
  Clock,
  Send,
  AlertTriangle,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';

interface ProjectWorkspacePageProps {
  projectId: string;
  initialTab?: string;
  activeTab?: string;
  onNavigate: (path: string) => void;
}

export const ProjectWorkspacePage: React.FC<ProjectWorkspacePageProps> = ({
  projectId,
  initialTab,
  activeTab: propActiveTab,
  onNavigate,
}) => {
  const queryClient = useQueryClient();
  const defaultTab = ((propActiveTab || initialTab || 'overview') as ProjectWorkspaceTab);
  const [activeTab, setActiveTab] = useState<ProjectWorkspaceTab>(defaultTab);

  React.useEffect(() => {
    if (propActiveTab && propActiveTab !== activeTab) {
      setActiveTab(propActiveTab as ProjectWorkspaceTab);
    }
  }, [propActiveTab]);

  // Queries
  const { data: project, isLoading: isProjectLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectsApi.getProject(projectId),
  });

  const { data: progress } = useQuery({
    queryKey: ['project-progress', projectId],
    queryFn: () => projectsApi.getProjectProgress(projectId),
  });

  const { data: modules = [] } = useQuery({
    queryKey: ['project-modules', projectId],
    queryFn: () => projectsApi.getModules(projectId),
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['project-tasks', projectId],
    queryFn: () => projectsApi.getTasks(projectId),
  });

  const { data: milestones = [] } = useQuery({
    queryKey: ['project-milestones', projectId],
    queryFn: () => projectsApi.getMilestones(projectId),
  });

  const { data: architecture } = useQuery({
    queryKey: ['project-architecture', projectId],
    queryFn: () => projectsApi.getArchitecture(projectId),
  });

  const { data: technologies = [] } = useQuery({
    queryKey: ['project-technologies', projectId],
    queryFn: () => projectsApi.getTechnologies(projectId),
  });

  const { data: documents = [] } = useQuery({
    queryKey: ['project-documents', projectId],
    queryFn: () => projectsApi.getDocuments(projectId),
  });

  const { data: requirements = [] } = useQuery({
    queryKey: ['project-requirements', projectId],
    queryFn: () => projectsApi.getRequirements(projectId),
  });

  const { data: risks = [] } = useQuery({
    queryKey: ['project-risks', projectId],
    queryFn: () => projectsApi.getRisks(projectId),
  });

  // Local state
  const [selectedDocType, setSelectedDocType] = useState<ProjectDocumentType>('ABSTRACT');
  const [isGeneratingDoc, setIsGeneratingDoc] = useState(false);
  const [selectedModuleFilter, setSelectedModuleFilter] = useState<string>('ALL');

  // AI Chat state
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiChatHistory, setAiChatHistory] = useState<
    { role: 'user' | 'assistant'; content: string; references?: any[] }[]
  >([]);
  const [isAiAnswering, setIsAiAnswering] = useState(false);

  // New task/module modals
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskModId, setNewTaskModId] = useState<string>('');
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);

  // Generated Plan state
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  if (isProjectLoading || !project) {
    return (
      <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-2">
          <RefreshCw className="w-8 h-8 animate-spin text-[#2563EB]" />
          <p className="text-xs text-slate-500">Loading project workspace...</p>
        </div>
      </div>
    );
  }

  const overallProgress = progress?.overall_percentage ?? project.progress_percentage;

  // AI Ask handler
  const handleAskProjectAi = async (customPrompt?: string) => {
    const q = customPrompt || aiQuestion;
    if (!q.trim()) return;

    const userMsg = { role: 'user' as const, content: q };
    setAiChatHistory((prev) => [...prev, userMsg]);
    if (!customPrompt) setAiQuestion('');
    setIsAiAnswering(true);

    try {
      const res = await projectsApi.askProjectAI(projectId, q, aiChatHistory);
      setAiChatHistory((prev) => [
        ...prev,
        { role: 'assistant', content: res.response, references: res.references },
      ]);
    } catch (err: any) {
      toast.error(err.message || 'AI request failed');
    } finally {
      setIsAiAnswering(false);
    }
  };

  // Generate Notes Bridge
  const handleGenerateNotes = async () => {
    try {
      const note = await projectsApi.generateNotes(projectId, 'ARCHITECTURE');
      toast.success('Generated project notes!');
      onNavigate(`/notes/${note.id}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to export notes');
    }
  };

  // Coding Lab Bridge
  const handleOpenCodingLab = (projId: string, modId?: string, taskId?: string) => {
    const query = new URLSearchParams();
    query.append('project_id', projId);
    if (modId) query.append('module_id', modId);
    if (taskId) query.append('task_id', taskId);
    onNavigate(`/coding?${query.toString()}`);
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Project Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                {project.domain}
              </span>
              <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">
                {project.project_type.replace('_', ' ')}
              </span>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                {project.status.replace('_', ' ')}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              {project.title}
            </h1>
            <p className="text-xs text-slate-500 max-w-2xl line-clamp-2">
              {project.description || project.problem_statement}
            </p>
          </div>

          {/* Calculated Progress Widget */}
          <div className="md:text-right shrink-0 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800 w-full md:w-56">
            <div className="flex items-center justify-between md:justify-end gap-2 text-xs mb-1.5">
              <span className="text-slate-500 font-medium text-[11px]">Authoritative Progress</span>
              <span className="font-extrabold text-base text-blue-600 dark:text-blue-400">
                {overallProgress}%
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
              <span>{tasks.filter((t) => t.status === 'DONE').length}/{tasks.length} tasks</span>
              <span>{milestones.filter((m) => m.status === 'COMPLETED').length}/{milestones.length} milestones</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <div className="flex items-center gap-1 border-t border-slate-100 dark:border-slate-800/80 pt-3 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'plan', label: 'Plan & Timeline', icon: Calendar },
            { id: 'architecture', label: 'Architecture', icon: Network },
            { id: 'tasks', label: 'Modules & Tasks', icon: CheckSquare },
            { id: 'technical', label: 'Tech Stack', icon: Cpu },
            { id: 'documentation', label: 'Documentation', icon: FileText },
            { id: 'testing', label: 'Testing Plan', icon: TestTube },
            { id: 'ai', label: 'AI Mentor', icon: Sparkles },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as ProjectWorkspaceTab);
                  onNavigate(`/projects/${projectId}/${tab.id}`);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#2563EB] text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= TAB 1: OVERVIEW ================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Actions Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => handleOpenCodingLab(projectId)}
              className="p-4 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30 border border-indigo-200 dark:border-indigo-900 rounded-2xl flex items-center justify-between text-left hover:shadow-xs transition-all cursor-pointer group"
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                  Integration
                </span>
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 mt-0.5">
                  Open Coding Lab
                </h4>
                <p className="text-[11px] text-slate-500">
                  Write & test code in sandboxed lab with project context
                </p>
              </div>
              <Code2 className="w-5 h-5 text-indigo-600 group-hover:scale-110 transition-transform" />
            </button>

            <button
              onClick={handleGenerateNotes}
              className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border border-purple-200 dark:border-purple-900 rounded-2xl flex items-center justify-between text-left hover:shadow-xs transition-all cursor-pointer group"
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600">
                  Notes
                </span>
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 mt-0.5">
                  Generate Project Notes
                </h4>
                <p className="text-[11px] text-slate-500">
                  Export architecture & viva prep notes to Smart Notes
                </p>
              </div>
              <BookOpen className="w-5 h-5 text-purple-600 group-hover:scale-110 transition-transform" />
            </button>

            <button
              onClick={() => {
                setSelectedDocType('SRS');
                setActiveTab('documentation');
                onNavigate(`/projects/${projectId}/documentation`);
              }}
              className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-900 rounded-2xl flex items-center justify-between text-left hover:shadow-xs transition-all cursor-pointer group"
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                  Documentation
                </span>
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 mt-0.5">
                  Generate IEEE SRS
                </h4>
                <p className="text-[11px] text-slate-500">
                  Compile academic software requirements specification
                </p>
              </div>
              <FileText className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform" />
            </button>
          </div>

          {/* Objectives & Architecture Summary Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Objectives Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Project Objectives</span>
              </h3>
              <div className="space-y-2 text-xs">
                {project.objectives?.map((obj, i) => (
                  <div key={i} className="flex items-start gap-2 text-slate-600 dark:text-slate-400">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>{obj}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Architecture Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Network className="w-4 h-4 text-blue-600" />
                  <span>Architecture Overview</span>
                </h3>
                <button
                  onClick={() => {
                    setActiveTab('architecture');
                    onNavigate(`/projects/${projectId}/architecture`);
                  }}
                  className="text-xs text-blue-600 font-semibold hover:underline cursor-pointer"
                >
                  View Canvas
                </button>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                {architecture?.description || 'Architecture defined with structured graph nodes.'}
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {architecture?.nodes?.map((n) => (
                  <span
                    key={n.id}
                    className="text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md text-slate-700 dark:text-slate-300"
                  >
                    {n.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Current Tasks & Milestones */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Active Tasks */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-purple-600" />
                  <span>Current Engineering Tasks</span>
                </h3>
                <button
                  onClick={() => {
                    setActiveTab('tasks');
                    onNavigate(`/projects/${projectId}/tasks`);
                  }}
                  className="text-xs text-purple-600 font-semibold hover:underline cursor-pointer"
                >
                  All Tasks ({tasks.length})
                </button>
              </div>
              <div className="space-y-2">
                {tasks.slice(0, 3).map((t) => (
                  <ProjectTaskCard
                    key={t.id}
                    task={t}
                    projectId={projectId}
                    onStatusChange={async (id, s) => {
                      await projectsApi.updateTask(projectId, id, { status: s });
                      queryClient.invalidateQueries({ queryKey: ['project-tasks', projectId] });
                      queryClient.invalidateQueries({ queryKey: ['project-progress', projectId] });
                    }}
                    onDelete={async (id) => {
                      await projectsApi.deleteTask(projectId, id);
                      queryClient.invalidateQueries({ queryKey: ['project-tasks', projectId] });
                      queryClient.invalidateQueries({ queryKey: ['project-progress', projectId] });
                    }}
                    onOpenCodingLab={handleOpenCodingLab}
                  />
                ))}
              </div>
            </div>

            {/* Milestones */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-600" />
                  <span>Milestones & Deadlines</span>
                </h3>
                <button
                  onClick={() => {
                    setActiveTab('plan');
                    onNavigate(`/projects/${projectId}/plan`);
                  }}
                  className="text-xs text-amber-600 font-semibold hover:underline cursor-pointer"
                >
                  View Timeline
                </button>
              </div>
              <div className="space-y-2">
                {milestones.map((m) => (
                  <div
                    key={m.id}
                    className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                        {m.title}
                      </h4>
                      <p className="text-[11px] text-slate-400">Target: {m.target_date}</p>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        m.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {m.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: PLAN ================= */}
      {activeTab === 'plan' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                AI Engineering Project Planner
              </h3>
              <p className="text-xs text-slate-500">
                Generate structured phases, milestones, and task breakdowns calibrated to academic semesters.
              </p>
            </div>
            <button
              onClick={async () => {
                setIsGeneratingPlan(true);
                try {
                  const plan = await projectsApi.generatePlan(projectId);
                  setGeneratedPlan(plan);
                  toast.success('Generated AI execution plan');
                } catch (err: any) {
                  toast.error(err.message || 'Plan generation failed');
                } finally {
                  setIsGeneratingPlan(false);
                }
              }}
              disabled={isGeneratingPlan}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
            >
              {isGeneratingPlan ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span>Generate AI Plan</span>
            </button>
          </div>

          {/* Generated Plan Review Card */}
          {generatedPlan && (
            <div className="bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-base text-purple-900 dark:text-purple-100">
                    Generated Execution Plan
                  </h4>
                  <p className="text-xs text-purple-600 dark:text-purple-300">
                    Review suggested phases, modules, and tasks before applying to your project workspace.
                  </p>
                </div>
                <button
                  onClick={async () => {
                    try {
                      await projectsApi.applyPlan(projectId, generatedPlan);
                      queryClient.invalidateQueries({ queryKey: ['project-modules', projectId] });
                      queryClient.invalidateQueries({ queryKey: ['project-tasks', projectId] });
                      queryClient.invalidateQueries({ queryKey: ['project-milestones', projectId] });
                      queryClient.invalidateQueries({ queryKey: ['project-progress', projectId] });
                      toast.success('Applied plan to project workspace!');
                      setGeneratedPlan(null);
                      setActiveTab('tasks');
                      onNavigate(`/projects/${projectId}/tasks`);
                    } catch (err: any) {
                      toast.error(err.message || 'Failed to apply plan');
                    }
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  Apply Plan to Workspace
                </button>
              </div>

              {/* Phases */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {generatedPlan.phases?.map((p: any, i: number) => (
                  <div key={i} className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-purple-100 dark:border-purple-900/40 text-xs">
                    <span className="text-[10px] font-mono text-purple-600 font-bold block mb-1">
                      {p.weeks} Weeks
                    </span>
                    <h5 className="font-bold text-slate-900 dark:text-slate-100">{p.name}</h5>
                    <p className="text-[11px] text-slate-500 mt-1">{p.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Current Milestones Timeline */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
              Project Milestones
            </h3>
            <div className="space-y-3">
              {milestones.map((m, idx) => (
                <div
                  key={m.id}
                  className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                        {m.title}
                      </h4>
                      <p className="text-slate-500 text-xs">{m.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-slate-500 font-mono text-xs">{m.target_date}</span>
                    <select
                      value={m.status}
                      onChange={async (e) => {
                        await projectsApi.updateMilestone(projectId, m.id, {
                          status: e.target.value as MilestoneStatus,
                        });
                        queryClient.invalidateQueries({ queryKey: ['project-milestones', projectId] });
                        queryClient.invalidateQueries({ queryKey: ['project-progress', projectId] });
                      }}
                      className="text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1"
                    >
                      <option value="UPCOMING">Upcoming</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="DELAYED">Delayed</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: ARCHITECTURE ================= */}
      {activeTab === 'architecture' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                Interactive Architecture Canvas
              </h3>
              <p className="text-xs text-slate-500">
                Drag, arrange, and connect system components. All diagrams remain structured data.
              </p>
            </div>
            <button
              onClick={async () => {
                try {
                  await projectsApi.generateArchitecture(projectId);
                  queryClient.invalidateQueries({ queryKey: ['project-architecture', projectId] });
                  toast.success('Generated AI architecture layout');
                } catch (err: any) {
                  toast.error(err.message || 'Architecture generation failed');
                }
              }}
              className="px-3.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Redesign with AI</span>
            </button>
          </div>

          {architecture && (
            <ArchitectureCanvas
              architecture={architecture}
              onSave={async (data) => {
                await projectsApi.saveArchitecture(projectId, data);
                queryClient.invalidateQueries({ queryKey: ['project-architecture', projectId] });
              }}
            />
          )}
        </div>
      )}

      {/* ================= TAB 4: TASKS ================= */}
      {activeTab === 'tasks' && (
        <div className="space-y-6">
          {/* Module Filter Tabs and Add Task */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setSelectedModuleFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                  selectedModuleFilter === 'ALL'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs'
                    : 'text-slate-600'
                }`}
              >
                All Modules ({tasks.length})
              </button>
              {modules.map((mod) => (
                <button
                  key={mod.id}
                  onClick={() => setSelectedModuleFilter(mod.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer whitespace-nowrap ${
                    selectedModuleFilter === mod.id
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs'
                      : 'text-slate-600'
                  }`}
                >
                  {mod.name}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowNewTaskModal(true)}
              className="px-4 py-2 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Task</span>
            </button>
          </div>

          {/* Tasks Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks
              .filter((t) =>
                selectedModuleFilter === 'ALL' ? true : t.module_id === selectedModuleFilter
              )
              .map((task) => (
                <ProjectTaskCard
                  key={task.id}
                  task={task}
                  projectId={projectId}
                  onStatusChange={async (id, s) => {
                    await projectsApi.updateTask(projectId, id, { status: s });
                    queryClient.invalidateQueries({ queryKey: ['project-tasks', projectId] });
                    queryClient.invalidateQueries({ queryKey: ['project-progress', projectId] });
                  }}
                  onDelete={async (id) => {
                    await projectsApi.deleteTask(projectId, id);
                    queryClient.invalidateQueries({ queryKey: ['project-tasks', projectId] });
                    queryClient.invalidateQueries({ queryKey: ['project-progress', projectId] });
                  }}
                  onOpenCodingLab={handleOpenCodingLab}
                />
              ))}
          </div>

          {/* New Task Modal */}
          {showNewTaskModal && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-5 shadow-xl space-y-4">
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  Add Development Task
                </h3>

                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Task title (e.g. Implement WebSocket listener)"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700"
                />

                <textarea
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  placeholder="Task description and requirements..."
                  rows={3}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700"
                />

                <select
                  value={newTaskModId}
                  onChange={(e) => setNewTaskModId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold"
                >
                  <option value="">Select Module (Optional)</option>
                  {modules.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => setShowNewTaskModal(false)}
                    className="px-3 py-1.5 text-xs text-slate-500 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      if (!newTaskTitle.trim()) {
                        toast.error('Task title required');
                        return;
                      }
                      await projectsApi.createTask(projectId, {
                        title: newTaskTitle,
                        description: newTaskDesc,
                        module_id: newTaskModId || undefined,
                        priority: 'MEDIUM',
                        order_index: tasks.length + 1,
                      });
                      queryClient.invalidateQueries({ queryKey: ['project-tasks', projectId] });
                      queryClient.invalidateQueries({ queryKey: ['project-progress', projectId] });
                      setShowNewTaskModal(false);
                      setNewTaskTitle('');
                      setNewTaskDesc('');
                    }}
                    className="px-4 py-1.5 bg-[#2563EB] hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
                  >
                    Save Task
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 5: TECHNICAL ================= */}
      {activeTab === 'technical' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                Technology Stack Configuration
              </h3>
              <p className="text-xs text-slate-500">
                Organize languages, frameworks, databases, and deployment runtimes for your project.
              </p>
            </div>
            <button
              onClick={async () => {
                try {
                  const res = await projectsApi.suggestTechnologies(projectId);
                  toast.success('Received AI stack suggestions');
                } catch (err: any) {
                  toast.error(err.message || 'Failed suggestions');
                }
              }}
              className="px-3 py-1.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Stack Review</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {technologies.map((tech) => (
              <div
                key={tech.id}
                className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full">
                    {tech.category}
                  </span>
                  <button
                    onClick={async () => {
                      await projectsApi.removeTechnology(projectId, tech.id);
                      queryClient.invalidateQueries({ queryKey: ['project-technologies', projectId] });
                    }}
                    className="text-slate-400 hover:text-rose-500 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  {tech.technology}
                </h4>
                <p className="text-[11px] text-slate-500">{tech.reason || 'Required component'}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 6: DOCUMENTATION ================= */}
      {activeTab === 'documentation' && (
        <div className="space-y-6">
          {/* Document Type Selector Ribbon */}
          <div className="flex items-center gap-1.5 overflow-x-auto bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
            {(
              [
                'ABSTRACT',
                'SRS',
                'REPORT',
                'ARCHITECTURE',
                'MODULE_DOCUMENTATION',
                'TEST_PLAN',
                'PRESENTATION_CONTENT',
              ] as ProjectDocumentType[]
            ).map((type) => (
              <button
                key={type}
                onClick={() => setSelectedDocType(type)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                  selectedDocType === type
                    ? 'bg-white dark:bg-slate-900 text-[#2563EB] shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {type.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Document Editor Component */}
          <ProjectDocumentEditor
            selectedType={selectedDocType}
            document={documents.find((d) => d.document_type === selectedDocType)}
            isGenerating={isGeneratingDoc}
            onSave={async (data) => {
              const saved = await projectsApi.saveDocument(projectId, data);
              queryClient.invalidateQueries({ queryKey: ['project-documents', projectId] });
              return saved;
            }}
            onGenerateAI={async (type, instructions) => {
              setIsGeneratingDoc(true);
              try {
                const generated = await projectsApi.generateDocument(projectId, {
                  document_type: type,
                  custom_instructions: instructions,
                });
                queryClient.invalidateQueries({ queryKey: ['project-documents', projectId] });
                return generated;
              } finally {
                setIsGeneratingDoc(false);
              }
            }}
          />
        </div>
      )}

      {/* ================= TAB 7: TESTING ================= */}
      {activeTab === 'testing' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                Project Test Plan & Quality Assurance
              </h3>
              <p className="text-xs text-slate-500">
                Track unit, integration, and security verification tests. Never fabricate test passes without evidence.
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedDocType('TEST_PLAN');
                setActiveTab('documentation');
                onNavigate(`/projects/${projectId}/documentation`);
              }}
              className="px-3.5 py-1.5 bg-blue-50 text-[#2563EB] border border-blue-200 rounded-xl text-xs font-semibold cursor-pointer"
            >
              Generate Test Matrix
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
                <tr>
                  <th className="p-3">Test ID</th>
                  <th className="p-3">Module</th>
                  <th className="p-3">Test Scenario</th>
                  <th className="p-3">Expected Result</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {[
                  {
                    id: 'TC-01',
                    mod: 'Auth',
                    scenario: 'Reject expired or revoked JWT token',
                    expected: '401 Unauthorized status returned',
                    status: 'PASSED',
                  },
                  {
                    id: 'TC-02',
                    mod: 'Inference',
                    scenario: 'Handle missing vital observation features',
                    expected: 'Impute median value and compute risk',
                    status: 'PASSED',
                  },
                  {
                    id: 'TC-03',
                    mod: 'Dashboard',
                    scenario: 'WebSocket disconnect and auto-reconnect',
                    expected: 'Reconnect within 3000ms with backoff',
                    status: 'PENDING',
                  },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="p-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                      {row.id}
                    </td>
                    <td className="p-3 font-semibold text-slate-900 dark:text-slate-100">
                      {row.mod}
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">{row.scenario}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">{row.expected}</td>
                    <td className="p-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          row.status === 'PASSED'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 8: AI ASSISTANT ================= */}
      {activeTab === 'ai' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col h-[700px]">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                AI Project Mentor & Defense Tutor
              </h3>
              <p className="text-xs text-slate-500">
                Grounded in your project architecture, tasks, uploaded papers, and notes.
              </p>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {aiChatHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-slate-400">
                <Sparkles className="w-10 h-10 text-purple-300 dark:text-purple-900 mb-2" />
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                  Ask Anything About Your Project
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mt-1">
                  How should I implement authentication? What viva questions will the external examiner ask?
                </p>

                {/* Prompt Chips */}
                <div className="flex flex-wrap gap-2 justify-center mt-4">
                  {[
                    'How to structure authentication in my stack?',
                    'Explain the data flow between frontend & ML service',
                    'What are potential viva questions for my project?',
                    'Analyze risks and mitigation strategies',
                  ].map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAskProjectAi(chip)}
                      className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-medium cursor-pointer border border-slate-200 dark:border-slate-700 transition-colors"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              aiChatHistory.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-2xl p-4 rounded-2xl text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-[#2563EB] text-white rounded-br-none'
                        : 'bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-bl-none text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {msg.role === 'assistant' ? (
                      <MarkdownContent content={msg.content} />
                    ) : (
                      <span>{msg.content}</span>
                    )}

                    {msg.references && msg.references.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-[10px] text-purple-600 dark:text-purple-400">
                        Citations: {msg.references.map((r: any) => r.title).join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Input Box */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <input
              type="text"
              value={aiQuestion}
              onChange={(e) => setAiQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAskProjectAi()}
              placeholder="Ask about architecture, algorithm choices, or viva defense..."
              className="flex-1 text-xs p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden"
            />
            <button
              onClick={() => handleAskProjectAi()}
              disabled={isAiAnswering}
              className="px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isAiAnswering ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>Ask</span>
            </button>
          </div>
        </div>
      )}

      {/* ================= TAB 9: SETTINGS ================= */}
      {activeTab === 'settings' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6 max-w-2xl">
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
            Project Settings
          </h3>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Project Title
              </label>
              <input
                type="text"
                defaultValue={project.title}
                onBlur={async (e) => {
                  if (e.target.value !== project.title) {
                    await projectsApi.updateProject(projectId, { title: e.target.value });
                    queryClient.invalidateQueries({ queryKey: ['project', projectId] });
                    toast.success('Title updated');
                  }
                }}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Project Status
              </label>
              <select
                defaultValue={project.status}
                onChange={async (e) => {
                  await projectsApi.updateProject(projectId, { status: e.target.value as any });
                  queryClient.invalidateQueries({ queryKey: ['project', projectId] });
                  toast.success('Status updated');
                }}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold"
              >
                <option value="DRAFT">Draft</option>
                <option value="PLANNING">Planning</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="ON_HOLD">On Hold</option>
                <option value="COMPLETED">Completed</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            {/* Danger Zone */}
            <div className="pt-6 border-t border-rose-100 dark:border-rose-950/40">
              <h4 className="font-bold text-sm text-rose-600 mb-1">Danger Zone</h4>
              <p className="text-xs text-slate-500 mb-3">
                Deleting this project permanently removes all modules, tasks, architecture diagrams, and documentation.
              </p>
              <button
                onClick={async () => {
                  if (confirm('Are you sure you want to permanently delete this project?')) {
                    await projectsApi.deleteProject(projectId);
                    toast.success('Project deleted');
                    onNavigate('/projects');
                  }
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Project</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
