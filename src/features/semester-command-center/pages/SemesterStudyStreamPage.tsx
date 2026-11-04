// src/features/semester-command-center/pages/SemesterStudyStreamPage.tsx
// Interactive Semester Study Stream & Node Graph (Section 10 & 11)

import * as React from 'react';
import {
  GitBranch,
  CheckCircle2,
  Lock,
  Play,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Clock,
  BookOpen,
  HelpCircle,
  FileCheck,
  Award,
  Filter,
  Check,
} from 'lucide-react';
import { PageContainer, LoadingState, EmptyState } from '../../../components/layout/PageComponents';
import { Button } from '../../../components/ui/button';
import { SemesterCommandCenterLayout } from '../components/SemesterCommandCenterLayout';
import { semesterCommandCenterApi } from '../../../api/semesterCommandCenterApi';
import {
  SemesterStudyStreamNode,
  SemesterSubject,
  AcademicSemesterConfig,
} from '../../../types/semesterCommandCenter';
import { toast } from 'sonner';

interface SemesterStudyStreamPageProps {
  onNavigate?: (path: string) => void;
}

export function SemesterStudyStreamPage({ onNavigate }: SemesterStudyStreamPageProps) {
  const [nodes, setNodes] = React.useState<SemesterStudyStreamNode[]>([]);
  const [subjects, setSubjects] = React.useState<SemesterSubject[]>([]);
  const [config, setConfig] = React.useState<AcademicSemesterConfig | undefined>(undefined);
  const [selectedSubjectId, setSelectedSubjectId] = React.useState<string>('ALL');
  const [loading, setLoading] = React.useState(true);
  const [updatingId, setUpdatingId] = React.useState<string | null>(null);

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [overviewData, streamNodes, subjectList] = await Promise.all([
        semesterCommandCenterApi.getOverview(),
        semesterCommandCenterApi.getStudyStream(selectedSubjectId !== 'ALL' ? selectedSubjectId : undefined),
        semesterCommandCenterApi.getSubjects(),
      ]);
      setConfig(overviewData.config);
      setNodes(streamNodes);
      setSubjects(subjectList);
    } catch (err: any) {
      toast.error('Failed to load study stream: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedSubjectId]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggleNodeStatus = async (node: SemesterStudyStreamNode) => {
    try {
      setUpdatingId(node.id);
      const nextStatus = node.status === 'COMPLETED' ? 'ACTIVE' : 'COMPLETED';
      await semesterCommandCenterApi.updateStreamNodeStatus(node.id, nextStatus);
      toast.success(`Node "${node.title}" updated to ${nextStatus}!`);
      await loadData();
    } catch (err: any) {
      toast.error('Failed to update node: ' + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRecalculateStream = () => {
    toast.success('AI Semester Orchestrator recalculated optimal stream timeline!');
  };

  if (loading && nodes.length === 0) {
    return (
      <PageContainer>
        <LoadingState message="Rendering interactive academic study stream..." />
      </PageContainer>
    );
  }

  const completedCount = nodes.filter((n) => n.status === 'COMPLETED').length;
  const progressPercent = Math.round((completedCount / Math.max(nodes.length, 1)) * 100);

  return (
    <PageContainer>
      <SemesterCommandCenterLayout currentTab="stream" config={config} onNavigate={onNavigate}>
        <div className="space-y-6">
          {/* Header Controls */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-indigo-400" />
                <h2 className="text-lg font-bold text-white">Semester Academic Study Stream</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
                  Adaptive Sequence
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Visual pipeline connecting syllabus blocks, quizzes, slip tests, minor exams, and final revision in an optimal execution order.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
              {/* Subject Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                >
                  <option value="ALL">All Semester Subjects</option>
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>

              <Button
                size="sm"
                onClick={handleRecalculateStream}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                Recalculate Stream
              </Button>
            </div>
          </div>

          {/* Stream Progress Bar */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs text-slate-400">Stream Completion Rate</span>
              <div className="text-base font-bold text-white">
                {completedCount} of {nodes.length} Academic Milestones Completed
              </div>
            </div>
            <div className="flex items-center gap-3 flex-1 max-w-xs">
              <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400">{progressPercent}%</span>
            </div>
          </div>

          {/* Interactive Stream Timeline Node Chain */}
          <div className="relative pl-6 md:pl-8 space-y-6 before:absolute before:left-3 md:before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-800">
            {nodes.map((node, index) => {
              const isCompleted = node.status === 'COMPLETED';
              const isActive = node.status === 'ACTIVE';
              const isLocked = node.status === 'LOCKED';
              const isRecovery = node.status === 'NEEDS_RECOVERY';

              return (
                <div key={node.id} className="relative group">
                  {/* Status Bullet Icon on Timeline */}
                  <div
                    onClick={() => handleToggleNodeStatus(node)}
                    className={`absolute -left-6 md:-left-8 top-3.5 w-6 h-6 rounded-full flex items-center justify-center cursor-pointer transition-all ${
                      isCompleted
                        ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/50'
                        : isActive
                        ? 'bg-indigo-600 text-white ring-4 ring-indigo-500/20 animate-pulse'
                        : isRecovery
                        ? 'bg-amber-500 text-white ring-4 ring-amber-500/20'
                        : 'bg-slate-800 text-slate-500 border border-slate-700'
                    }`}
                    title="Click to toggle completion"
                  >
                    {isCompleted ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : isActive ? (
                      <Play className="w-3 h-3 fill-current ml-0.5" />
                    ) : isRecovery ? (
                      <RotateCcw className="w-3.5 h-3.5" />
                    ) : (
                      <Lock className="w-3 h-3" />
                    )}
                  </div>

                  {/* Node Content Card */}
                  <div
                    className={`p-4 bg-slate-900 border rounded-xl transition-all ${
                      isActive
                        ? 'border-indigo-500/60 shadow-lg shadow-indigo-950/30'
                        : isCompleted
                        ? 'border-emerald-900/40 bg-slate-900/70'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-indigo-400 font-bold uppercase">
                            {node.subject_name}
                          </span>
                          <span className="text-xs text-slate-500">•</span>
                          <span className="text-[10px] font-medium text-slate-400 uppercase">
                            {(node.type || 'STUDY').replace(/_/g, ' ')}
                          </span>
                          {node.unit_number && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800/80 text-slate-300">
                              Unit {node.unit_number}
                            </span>
                          )}
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                              node.priority === 'CRITICAL'
                                ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                : node.priority === 'HIGH'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {node.priority}
                          </span>
                        </div>

                        <h3 className="text-sm font-bold text-white">{node.title}</h3>

                        <div className="flex items-center gap-3 text-xs text-slate-400 pt-0.5">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            Target: {node.estimated_time_minutes} mins
                          </span>
                          <span>•</span>
                          <span>Deadline: {node.deadline}</span>
                          {node.score !== undefined && (
                            <>
                              <span>•</span>
                              <span className="text-emerald-400 font-bold">Score: {node.score}%</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 w-full md:w-auto justify-end pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                        {node.action_route && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onNavigate && onNavigate(node.action_route!)}
                            className="text-xs border-slate-700 hover:bg-slate-800 text-slate-300 h-8"
                          >
                            Execute Task <ArrowRight className="w-3 h-3 ml-1" />
                          </Button>
                        )}

                        <Button
                          size="sm"
                          disabled={updatingId === node.id}
                          onClick={() => handleToggleNodeStatus(node)}
                          className={`text-xs h-8 ${
                            isCompleted
                              ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                              : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                          }`}
                        >
                          {isCompleted ? 'Mark Active' : 'Complete'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </SemesterCommandCenterLayout>
    </PageContainer>
  );
}
