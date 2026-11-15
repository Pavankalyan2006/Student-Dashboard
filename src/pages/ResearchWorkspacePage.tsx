import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from '../lib/router';
import {
  useResearchProject,
  useResearchPapers,
  useResearchQuestions,
  useResearchGaps,
  useResearchIdeas,
  useResearchCitations,
} from '../features/research/hooks/useResearch';
import { OverviewPanel } from '../features/research/components/OverviewPanel';
import { PapersPanel } from '../features/research/components/PapersPanel';
import { LiteratureReviewPanel } from '../features/research/components/LiteratureReviewPanel';
import { QuestionsPanel } from '../features/research/components/QuestionsPanel';
import { GapsPanel } from '../features/research/components/GapsPanel';
import { IdeasPanel } from '../features/research/components/IdeasPanel';
import { MethodologyPanel } from '../features/research/components/MethodologyPanel';
import { CitationsPanel } from '../features/research/components/CitationsPanel';
import { EvidenceMatrixPanel } from '../features/research/components/EvidenceMatrixPanel';
import { ExportPanel } from '../features/research/components/ExportPanel';
import { ExperimentsPanel } from '../features/research/components/ExperimentsPanel';
import { ResearchAIContextPanel } from '../features/research/components/ResearchAIContextPanel';
import { ContextSelectorModal } from '../features/context/components/ContextSelectorModal';
import {
  BookOpen,
  FileText,
  HelpCircle,
  AlertCircle,
  Lightbulb,
  Layers,
  BookmarkCheck,
  Table,
  Download,
  LayoutDashboard,
  PanelRightClose,
  PanelRightOpen,
  ArrowLeft,
  Sparkles,
  FlaskConical,
} from 'lucide-react';

export const ResearchWorkspacePage: React.FC = () => {
  const { researchId } = useParams<{ researchId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active tab from URL path or default to 'overview'
  const pathParts = location.pathname.split('/');
  const subroute = pathParts[3] || 'overview';
  const [activeTab, setActiveTab] = useState<string>(subroute);
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(true);

  useEffect(() => {
    if (pathParts[3]) {
      setActiveTab(pathParts[3]);
    } else {
      setActiveTab('overview');
    }
  }, [location.pathname]);

  const { data: project, isLoading: isProjectLoading } = useResearchProject(researchId);
  const { data: papers = [] } = useResearchPapers(researchId);
  const { data: questions = [] } = useResearchQuestions(researchId);
  const { data: gaps = [] } = useResearchGaps(researchId);
  const { data: ideas = [] } = useResearchIdeas(researchId);
  const { data: citations = [] } = useResearchCitations(researchId);

  const navItems = [
    { key: 'overview', label: 'Overview', icon: LayoutDashboard },
    { key: 'papers', label: 'Papers', count: papers.length, icon: BookOpen },
    { key: 'literature-review', label: 'Literature Review', icon: FileText },
    { key: 'questions', label: 'Questions', count: questions.length, icon: HelpCircle },
    { key: 'gaps', label: 'Research Gaps', count: gaps.length, icon: AlertCircle },
    { key: 'ideas', label: 'Ideas', count: ideas.length, icon: Lightbulb },
    { key: 'methodology', label: 'Methodology', icon: Layers },
    { key: 'experiments', label: 'ML Experiments', icon: FlaskConical },
    { key: 'citations', label: 'Citations', count: citations.length, icon: BookmarkCheck },
    { key: 'evidence-matrix', label: 'Evidence Matrix', icon: Table },
    { key: 'export', label: 'Export', icon: Download },
  ];

  const handleSelectTab = (tabKey: string) => {
    setActiveTab(tabKey);
    navigate(`/research/${researchId}/${tabKey}`);
  };

  if (isProjectLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-sm text-slate-500">
        Loading research workspace...
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Research Project Not Found</h2>
        <button
          onClick={() => navigate('/research')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold"
        >
          Return to Research Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-slate-100">
      {/* LEFT: Navigation Panel */}
      <div className="w-56 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-100">
          <button
            onClick={() => navigate('/research')}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800 mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> All Projects
          </button>
          <h2 className="text-sm font-bold text-slate-900 truncate" title={project.title}>
            {project.title}
          </h2>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">{project.domain}</div>
        </div>

        <nav className="p-2 space-y-0.5 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => handleSelectTab(item.key)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-bold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.count !== undefined && item.count > 0 && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* CENTER: Workspace Panel */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-slate-50 p-6 md:p-8">
        <div className="max-w-5xl w-full mx-auto space-y-6">
          {/* Active Tab View */}
          {activeTab === 'overview' && (
            <OverviewPanel
              project={project}
              papers={papers}
              questions={questions}
              gaps={gaps}
              ideas={ideas}
              citations={citations}
              onNavigateTab={handleSelectTab}
            />
          )}

          {activeTab === 'papers' && <PapersPanel projectId={project.id} papers={papers} />}

          {activeTab === 'literature-review' && <LiteratureReviewPanel projectId={project.id} />}

          {activeTab === 'questions' && <QuestionsPanel projectId={project.id} />}

          {activeTab === 'gaps' && <GapsPanel projectId={project.id} />}

          {activeTab === 'ideas' && <IdeasPanel projectId={project.id} />}

          {activeTab === 'methodology' && <MethodologyPanel projectId={project.id} />}

          {activeTab === 'experiments' && <ExperimentsPanel projectId={project.id} />}

          {activeTab === 'citations' && <CitationsPanel projectId={project.id} />}

          {activeTab === 'evidence-matrix' && <EvidenceMatrixPanel projectId={project.id} />}

          {activeTab === 'export' && <ExportPanel projectId={project.id} />}
        </div>
      </div>

      {/* Toggle button for AI panel if closed */}
      {!isAIPanelOpen && (
        <button
          onClick={() => setIsAIPanelOpen(true)}
          className="fixed bottom-6 right-6 z-40 p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-xl transition-all hover:scale-105 cursor-pointer"
          title="Open AI Research Agent"
        >
          <Sparkles className="w-5 h-5" />
        </button>
      )}

      {/* RIGHT: AI Assistant / Multi-Source Context Panel */}
      {isAIPanelOpen && (
        <div className="w-80 md:w-96 shrink-0 relative flex flex-col">
          <button
            onClick={() => setIsAIPanelOpen(false)}
            className="absolute top-3 right-3 z-10 p-1 text-slate-400 hover:text-slate-600 rounded-lg"
            title="Collapse AI panel"
          >
            <PanelRightClose className="w-4 h-4" />
          </button>
          <ResearchAIContextPanel projectId={project.id} projectTitle={project.title} />
        </div>
      )}

      {/* Context Selector Modal */}
      <ContextSelectorModal />
    </div>
  );
};
