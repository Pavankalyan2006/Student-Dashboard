// src/features/system-design/pages/SystemDesignLabPage.tsx
// Complete Interactive System Design Lab with 12 Professional Sections

import * as React from 'react';
import {
  Network,
  Shapes,
  BookOpen,
  Layers,
  Sparkles,
  Trophy,
  Database,
  Code,
  Activity,
  ShieldCheck,
  UserCheck,
  FolderGit2,
  TrendingUp,
  Plus,
  Play,
  RotateCcw,
  HelpCircle,
  Cpu,
  Shuffle,
  ChevronRight,
  Lightbulb
} from 'lucide-react';
import { PageContainer, PageHeader, LoadingState } from '../../../components/layout/PageComponents';
import { Button } from '../../../components/ui/button';
import { systemDesignApi } from '../api/systemDesignApi';
import {
  SystemDesignProject,
  SystemDesignLesson,
  SystemDesignChallenge,
  ChallengeSubmission
} from '../types/systemDesign';

// Subcomponents
import { ArchitectureDesigner } from '../components/ArchitectureDesigner';
import { LearningRoadmapView } from '../components/LearningRoadmapView';
import { LessonDetailModal } from '../components/LessonDetailModal';
import { ChallengeCatalogView } from '../components/ChallengeCatalogView';
import { RequirementsWorkspace } from '../components/RequirementsWorkspace';
import { DatabaseDesignWorkspace } from '../components/DatabaseDesignWorkspace';
import { ApiDesignWorkspace } from '../components/ApiDesignWorkspace';
import { ScalabilitySimulator } from '../components/ScalabilitySimulator';
import { ArchitectureEvaluator } from '../components/ArchitectureEvaluator';
import { InterviewPracticeModal } from '../components/InterviewPracticeModal';
import { SavedProjectsView } from '../components/SavedProjectsView';
import { AnalyticsView } from '../components/AnalyticsView';
import { AITutorDrawer } from '../components/AITutorDrawer';
import { ArchitectureStudio } from '../components/ArchitectureStudio';
import { toast } from 'sonner';

const DRAFT_ID = 'sd_unsaved_draft';

export type LabTab =
  | 'roadmap'
  | 'concepts'
  | 'designer'
  | 'studio'
  | 'challenges'
  | 'requirements'
  | 'database'
  | 'api'
  | 'simulator'
  | 'evaluation'
  | 'interview'
  | 'saved'
  | 'analytics';

interface SystemDesignLabPageProps {
  onNavigate?: (path: string) => void;
}

export function SystemDesignLabPage({ onNavigate }: SystemDesignLabPageProps) {
  // Navigation & Tabs
  const [activeTab, setActiveTab] = React.useState<LabTab>('designer');

  // Core Data States
  const [projects, setProjects] = React.useState<SystemDesignProject[]>([]);
  const [currentProject, setCurrentProject] = React.useState<SystemDesignProject | null>(null);
  const [roadmap, setRoadmap] = React.useState<any>(null);
  const [lessons, setLessons] = React.useState<SystemDesignLesson[]>([]);
  const [challenges, setChallenges] = React.useState<SystemDesignChallenge[]>([]);
  const [analytics, setAnalytics] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  // Modals & Drawers
  const [selectedLesson, setSelectedLesson] = React.useState<SystemDesignLesson | null>(null);
  const [selectedChallengeForInterview, setSelectedChallengeForInterview] = React.useState<SystemDesignChallenge | null>(null);
  const [isInterviewModalOpen, setIsInterviewModalOpen] = React.useState(false);
  const [isAiTutorOpen, setIsAiTutorOpen] = React.useState(false);

  // A student with no saved design still gets a working canvas: edits go into a local draft, and the first
  // save creates the project. (Before, edits were dropped when no project existed.)
  const blankDraft = React.useCallback((): SystemDesignProject => ({
    id: DRAFT_ID,
    student_id: '',
    title: 'My first design',
    description: 'New architecture design',
    components: [],
    connections: [],
    requirements: { functional: [], non_functional: [], assumptions: [] },
    versions: [],
    tags: ['System Design'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }), []);
  const [draft, setDraft] = React.useState<SystemDesignProject>(() => blankDraft());
  const effectiveProject: SystemDesignProject = currentProject || draft;
  const isDraft = !currentProject;
  const applyProject = (p: SystemDesignProject) => (currentProject ? setCurrentProject(p) : setDraft(p));

  // Saves are queued so quick edits cannot create two projects or overwrite each other out of order.
  const projectIdRef = React.useRef<string | null>(null);
  React.useEffect(() => {
    projectIdRef.current = currentProject?.id || null;
  }, [currentProject?.id]);
  const saveQueue = React.useRef<Promise<unknown>>(Promise.resolve());
  const persistProject = (p: SystemDesignProject): Promise<SystemDesignProject> => {
    const fields = {
      components: p.components,
      connections: p.connections,
      requirements: p.requirements,
      capacity_estimate: p.capacity_estimate,
      database_design: p.database_design,
      api_specification: p.api_specification,
      diagrams: p.diagrams,
    };
    const run = async () => {
      if (!projectIdRef.current) {
        const created = await systemDesignApi.createProject({ title: p.title || 'My first design', description: p.description, ...fields });
        projectIdRef.current = created.id;
        setProjects((prev) => [created, ...prev.filter((x) => x.id !== created.id)]);
        setCurrentProject(created);
        setDraft(blankDraft());
        return created;
      }
      const saved = await systemDesignApi.updateProject(projectIdRef.current, fields);
      setCurrentProject(saved);
      setProjects((prev) => prev.map((x) => (x.id === saved.id ? saved : x)));
      return saved;
    };
    const next = saveQueue.current.then(run, run);
    saveQueue.current = next.catch(() => undefined);
    return next;
  };

  // Load All System Design Data (once; `silent` refreshes without the full-page loader)
  const loadInitialData = React.useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const [fetchedProjects, fetchedRoadmap, fetchedLessons, fetchedChallenges, fetchedAnalytics] = await Promise.all([
        systemDesignApi.getProjects().catch(() => []),
        systemDesignApi.getRoadmap().catch(() => null),
        systemDesignApi.getLessons().catch(() => []),
        systemDesignApi.getChallenges().catch(() => []),
        systemDesignApi.getAnalytics().catch(() => null)
      ]);

      const safeProjects = Array.isArray(fetchedProjects) ? fetchedProjects : [];
      setProjects(safeProjects);
      setRoadmap(fetchedRoadmap || null);
      setLessons(Array.isArray(fetchedLessons) ? fetchedLessons : []);
      setChallenges(Array.isArray(fetchedChallenges) ? fetchedChallenges : []);
      setAnalytics(fetchedAnalytics || null);
      setCurrentProject((prev) => (prev ? safeProjects.find((p) => p.id === prev.id) || prev : safeProjects[0] || null));
    } catch (err: any) {
      toast.error('Failed to load system design lab: ' + (err?.message || 'Unknown error'));
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Project Canvas Handlers
  const handleUpdateCanvas = (components: any[], connections: any[]) => {
    applyProject({ ...effectiveProject, components, connections });
  };

  const handleSaveCurrentProject = async (override?: SystemDesignProject) => {
    try {
      await persistProject(override || effectiveProject);
      toast.success(isDraft ? 'Design saved to your account' : 'Architecture saved successfully');
    } catch (err: any) {
      toast.error('Save failed: ' + err.message);
    }
  };

  const handleCreateNewProject = async () => {
    try {
      const newProj = await systemDesignApi.createProject({
        title: `System Architecture #${projects.length + 1}`,
        description: 'New interactive distributed architecture design'
      });
      setProjects(prev => [newProj, ...prev]);
      setCurrentProject(newProj);
      setActiveTab('designer');
      toast.success('Created new architecture project');
    } catch (err: any) {
      toast.error('Failed to create project: ' + err.message);
    }
  };

  const handleDuplicateProject = async (projectId: string) => {
    try {
      const cloned = await systemDesignApi.duplicateProject(projectId);
      setProjects(prev => [cloned, ...prev]);
      setCurrentProject(cloned);
      toast.success(`Duplicated project`);
    } catch (err: any) {
      toast.error('Duplicate failed: ' + err.message);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      await systemDesignApi.deleteProject(projectId);
      const remaining = projects.filter(p => p.id !== projectId);
      setProjects(remaining);
      if (currentProject?.id === projectId) {
        setCurrentProject(remaining[0] || null);
      }
      toast.success('Project deleted');
    } catch (err: any) {
      toast.error('Delete failed: ' + err.message);
    }
  };

  const handleCreateVersion = async (projectId: string, note: string) => {
    try {
      const v = await systemDesignApi.createVersion(projectId, note);
      if (currentProject?.id === projectId) {
        setCurrentProject(prev => prev ? { ...prev, versions: [...(prev.versions || []), v] } : null);
      }
    } catch (err: any) {
      toast.error('Failed to create version: ' + err.message);
    }
  };

  // Challenge Start Action
  const handleStartChallenge = async (challenge: SystemDesignChallenge) => {
    try {
      const proj = await systemDesignApi.startChallenge(challenge.id);
      setProjects(prev => [proj, ...prev]);
      setCurrentProject(proj);
      setActiveTab('designer');
      toast.success(`Started challenge: ${challenge.title}!`);
    } catch (err: any) {
      toast.error('Failed to start challenge: ' + err.message);
    }
  };

  // Lesson Complete Action
  const handleCompleteLesson = async (lessonId: string, quizScore: number) => {
    const updated = await systemDesignApi.completeLesson(lessonId, quizScore);
    const updatedRoadmap = await systemDesignApi.getRoadmap();
    const updatedAnalytics = await systemDesignApi.getAnalytics();
    setRoadmap(updatedRoadmap);
    setAnalytics(updatedAnalytics);
  };

  if (loading) {
    return (
      <PageContainer>
        <PageHeader
          title="System Design Lab"
          description="Loading distributed systems architectures and curriculum..."
        />
        <LoadingState message="SystemDesignAgent analyzing microservices scalability..." />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* ------------------------------------------------------------- */}
      {/* 1. TOP HEADER & PROJECT SELECTOR */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-md">
              <Network className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">System Design Lab</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  SystemDesignAgent Active
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Design, visualize, simulate, and evaluate production distributed architectures.
              </p>
            </div>
          </div>

          {/* Quick Actions & Project Selector */}
          <div className="flex flex-wrap items-center gap-2">
            {projects && projects.length > 0 && (
              <select
                value={currentProject?.id}
                onChange={(e) => {
                  const found = projects.find(p => p.id === e.target.value);
                  if (found) setCurrentProject(found);
                }}
                className="px-3 py-1.5 text-xs font-semibold bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 max-w-[200px] truncate"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            )}

            <Button
              onClick={handleCreateNewProject}
              size="sm"
              variant="outline"
              className="border-slate-700 bg-transparent text-slate-200 hover:bg-slate-800 hover:text-white text-xs h-8 px-2.5"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> New
            </Button>

            <Button
              onClick={() => {
                setSelectedChallengeForInterview(challenges[0] || null);
                setIsInterviewModalOpen(true);
              }}
              size="sm"
              variant="outline"
              className="border-indigo-500/40 bg-transparent text-indigo-300 hover:bg-indigo-950/40 text-xs h-8 px-2.5"
            >
              <UserCheck className="w-3.5 h-3.5 mr-1" /> Mock Interview
            </Button>

            <Button
              onClick={() => setIsAiTutorOpen(true)}
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8 px-3 flex items-center gap-1.5 shadow-md"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Tutor</span>
            </Button>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* 2. 12 NAVIGATION TABS STRIP */}
        {/* ------------------------------------------------------------- */}
        <div className="mt-5 pt-3 border-t border-slate-800 flex gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'designer', label: 'Architecture Designer', icon: Network },
            { id: 'studio', label: 'Architecture Studio', icon: Shapes },
            { id: 'roadmap', label: 'Learning Roadmap', icon: BookOpen },
            { id: 'concepts', label: 'Concepts (69)', icon: Lightbulb },
            { id: 'challenges', label: 'Challenges (25)', icon: Trophy },
            { id: 'requirements', label: 'Requirements & Scale', icon: Cpu },
            { id: 'database', label: 'Database Design', icon: Database },
            { id: 'api', label: 'API Design', icon: Code },
            { id: 'simulator', label: 'Scalability Simulator', icon: Activity },
            { id: 'evaluation', label: 'Evaluation Report', icon: ShieldCheck },
            { id: 'interview', label: 'Interview Mode', icon: UserCheck },
            { id: 'saved', label: 'Saved Designs', icon: FolderGit2 },
            { id: 'analytics', label: 'Progress & Analytics', icon: TrendingUp }
          ].map(tab => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as LabTab)}
                className={`px-3 py-2 rounded-xl font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-lg font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. ACTIVE TAB VIEW CONTENT */}
      {/* ------------------------------------------------------------- */}
      <div className="space-y-6">
        {/* Tab 1: Architecture Designer Canvas */}
        {activeTab === 'designer' && (
          <ArchitectureDesigner
            components={effectiveProject.components}
            connections={effectiveProject.connections}
            onChange={handleUpdateCanvas}
            onSave={() => handleSaveCurrentProject()}
          />
        )}

        {/* Architecture Studio: UML, flowchart and ER diagrams as editable text, and AI drafts */}
        {activeTab === 'studio' && (
          <ArchitectureStudio
            project={effectiveProject}
            hasProject
            onCreateProject={handleCreateNewProject}
            onSaveDiagrams={async (diagrams) => {
              await persistProject({ ...effectiveProject, diagrams });
            }}
            onApplyArchitecture={(components, connections) => {
              applyProject({ ...effectiveProject, components, connections });
              setActiveTab('designer');
              toast.info('The AI draft is on the canvas. Review it and press Save to keep it.');
            }}
          />
        )}

        {/* Tab 2: Learning Roadmap */}
        {activeTab === 'roadmap' && (
          <LearningRoadmapView
            roadmap={roadmap}
            onSelectLesson={(lesson) => setSelectedLesson(lesson)}
          />
        )}

        {/* Tab 3: System Design Concepts (Deep Dive) */}
        {activeTab === 'concepts' && (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-indigo-400" />
                System Design Concepts Explorer (69 Topics)
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Explore individual distributed system concepts with key architectural decisions, advantages, disadvantages, common traps, and knowledge checks.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {lessons.map(lesson => (
                <div
                  key={lesson.id}
                  onClick={() => setSelectedLesson(lesson)}
                  className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/60 transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2 text-[10px] font-mono text-slate-400">
                      <span>Level {lesson.level}: {lesson.level_name}</span>
                      <span>#{lesson.order_index}</span>
                    </div>
                    <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                      {lesson.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {lesson.summary}
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-semibold text-indigo-400">
                    <span>Study Concept</span>
                    <ChevronRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Design Challenges (25 Exercises) */}
        {activeTab === 'challenges' && (
          <ChallengeCatalogView
            challenges={challenges}
            onStartChallenge={handleStartChallenge}
            onViewChallengeDetail={(c) => {
              setSelectedChallengeForInterview(c);
              setIsInterviewModalOpen(true);
            }}
          />
        )}

        {/* Tab 5: Requirements & Capacity Estimator */}
        {activeTab === 'requirements' && (
          <RequirementsWorkspace
            requirements={effectiveProject.requirements || { functional: [], non_functional: [], assumptions: [] }}
            capacityEstimate={effectiveProject.capacity_estimate}
            onChangeRequirements={(reqs) => {
              applyProject({ ...effectiveProject, requirements: reqs });
            }}
            onSaveCapacityEstimate={(estimate) => {
              const updated = { ...effectiveProject, capacity_estimate: estimate };
              applyProject(updated);
              handleSaveCurrentProject(updated);
            }}
          />
        )}

        {/* Tab 6: Database Design */}
        {activeTab === 'database' && (
          <DatabaseDesignWorkspace
            databaseDesign={effectiveProject.database_design}
            onChangeDatabaseDesign={(dbDesign) => {
              const updated = { ...effectiveProject, database_design: dbDesign };
              applyProject(updated);
              handleSaveCurrentProject(updated);
            }}
            onNavigateToSqlLab={onNavigate ? () => onNavigate('/sql-lab') : undefined}
          />
        )}

        {/* Tab 7: API Design */}
        {activeTab === 'api' && (
          <ApiDesignWorkspace
            apiSpecification={effectiveProject.api_specification}
            onChangeApiSpecification={(apiSpec) => {
              const updated = { ...effectiveProject, api_specification: apiSpec };
              applyProject(updated);
              handleSaveCurrentProject(updated);
            }}
          />
        )}

        {/* Tab 8: Scalability Simulator */}
        {activeTab === 'simulator' && <ScalabilitySimulator />}

        {/* Tab 9: Architecture Evaluation */}
        {activeTab === 'evaluation' && (
          <ArchitectureEvaluator
            project={effectiveProject}
            challengeId={effectiveProject.challenge_id}
            unsaved={isDraft}
            onSubmissionComplete={() => {
              loadInitialData(true);
            }}
          />
        )}

        {/* Tab 10: Interview Practice Mode */}
        {activeTab === 'interview' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 text-center py-10">
            <UserCheck className="w-12 h-12 text-indigo-400 mx-auto" />
            <h2 className="text-2xl font-bold text-white tracking-tight">System Design Mock Interview</h2>
            <p className="text-xs text-slate-400 max-w-lg mx-auto">
              Simulate an end-to-end 10-step technical interview with Socratic AI questions, step timers, and candidate feedback.
            </p>
            <div className="pt-2">
              <Button
                onClick={() => {
                  setSelectedChallengeForInterview(challenges[0] || null);
                  setIsInterviewModalOpen(true);
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-5 h-9"
              >
                Launch Mock Interview Session
              </Button>
            </div>
          </div>
        )}

        {/* Tab 11: Saved Designs & Projects */}
        {activeTab === 'saved' && (
          <SavedProjectsView
            projects={projects}
            currentProjectId={currentProject?.id}
            onSelectProject={(proj) => {
              setCurrentProject(proj);
              setActiveTab('designer');
            }}
            onCreateNewProject={handleCreateNewProject}
            onDuplicateProject={handleDuplicateProject}
            onDeleteProject={handleDeleteProject}
            onCreateVersion={handleCreateVersion}
          />
        )}

        {/* Tab 12: Progress & Analytics */}
        {activeTab === 'analytics' && (
          <AnalyticsView
            analyticsData={analytics}
            onNavigateTab={(tabId) => setActiveTab(tabId as LabTab)}
          />
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. MODALS & DRAWERS */}
      {/* ------------------------------------------------------------- */}

      {/* Lesson Detail Reader Modal */}
      {selectedLesson && (
        <LessonDetailModal
          lesson={selectedLesson}
          isOpen={Boolean(selectedLesson)}
          onClose={() => setSelectedLesson(null)}
          onComplete={handleCompleteLesson}
          isCompleted={roadmap?.levels?.flatMap((l: any) => l.lessons)?.find((l: any) => l.id === selectedLesson.id)?.is_completed}
        />
      )}

      {/* System Design Interview Practice Modal */}
      <InterviewPracticeModal
        isOpen={isInterviewModalOpen}
        onClose={() => setIsInterviewModalOpen(false)}
        challengeId={selectedChallengeForInterview?.id || challenges[0]?.id || 'sd_url_shortener'}
        challengeTitle={selectedChallengeForInterview?.title || challenges[0]?.title || 'URL Shortener'}
      />

      {/* AI System Design Tutor Drawer */}
      <AITutorDrawer
        isOpen={isAiTutorOpen}
        onClose={() => setIsAiTutorOpen(false)}
        currentContext={{
          projectId: currentProject?.id,
          components: currentProject?.components || [],
          connections: currentProject?.connections || []
        }}
      />
    </PageContainer>
  );
}
export default SystemDesignLabPage;
