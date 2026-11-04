import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { placementsApi } from '../api/placementsApi';
import { PlacementHeader } from '../components/PlacementHeader';
import { PlacementOverviewCards } from '../components/PlacementOverviewCards';
import { PlacementCategoryProgress } from '../components/PlacementCategoryProgress';
import { PlacementReadinessCard } from '../components/PlacementReadinessCard';
import { PlacementTopicCard } from '../components/PlacementTopicCard';
import { WeakAreaCard } from '../components/WeakAreaCard';
import { PlacementAssessmentModal } from '../components/PlacementAssessmentModal';
import { GroupDiscussionHubModal } from '../components/GroupDiscussionHubModal';
import { ResumeProjectDefenseModal } from '../components/ResumeProjectDefenseModal';
import { AICoachDrawer } from '../components/AICoachDrawer';
import {
  Briefcase,
  PlayCircle,
  Binary,
  BookOpen,
  Calendar,
  History,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  ExternalLink,
  Search,
} from 'lucide-react';

interface Props {
  onNavigate: (path: string) => void;
}

export const PlacementDashboardPage: React.FC<Props> = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [isAssessmentOpen, setIsAssessmentOpen] = useState<boolean>(false);
  const [assessmentCategory, setAssessmentCategory] = useState<string>('APTITUDE');
  const [isGDModalOpen, setIsGDModalOpen] = useState<boolean>(false);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState<boolean>(false);
  const [isAICoachOpen, setIsAICoachOpen] = useState<boolean>(false);

  // Queries
  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ['placement-dashboard-stats'],
    queryFn: () => placementsApi.getDashboardStats(),
  });

  const { data: readiness, isLoading: isReadinessLoading } = useQuery({
    queryKey: ['placement-readiness'],
    queryFn: () => placementsApi.getReadiness(),
  });

  const { data: topics = [] } = useQuery({
    queryKey: ['placement-topics'],
    queryFn: () => placementsApi.getTopics(),
  });

  const { data: companies = [] } = useQuery({
    queryKey: ['placement-companies'],
    queryFn: () => placementsApi.getCompanies(),
  });

  const { data: interviews = [] } = useQuery({
    queryKey: ['placement-interviews'],
    queryFn: () => placementsApi.getInterviews(),
  });

  const { data: plans = [] } = useQuery({
    queryKey: ['placement-plans'],
    queryFn: () => placementsApi.getPlans(),
  });

  const activePlan = plans[0];

  // Search filtering across topics & companies
  const filteredTopics = topics.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCompanies = companies.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-7 pb-12">
      {/* 1. Header with Student Academic Context & Actions */}
      <PlacementHeader
        onNavigate={onNavigate}
        onOpenAICoach={() => setIsAICoachOpen(true)}
        onOpenAssessment={() => {
          setAssessmentCategory('APTITUDE');
          setIsAssessmentOpen(true);
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* 2. Overview Metrics & Onboarding Guide */}
      <PlacementOverviewCards
        stats={stats}
        isLoading={isStatsLoading}
        onNavigate={onNavigate}
        onOpenAssessment={() => {
          setAssessmentCategory('APTITUDE');
          setIsAssessmentOpen(true);
        }}
      />

      {/* 3. 15 Preparation Categories with Authoritative Status */}
      {stats && (
        <PlacementCategoryProgress
          categories={stats.categories_progress}
          onNavigate={onNavigate}
          onOpenGDModal={() => setIsGDModalOpen(true)}
          onOpenResumeAudit={() => setIsResumeModalOpen(true)}
          onOpenAssessmentWithCategory={(cat) => {
            setAssessmentCategory(cat);
            setIsAssessmentOpen(true);
          }}
        />
      )}

      {/* 4. Placement Readiness & Active Sprint Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2 cols): Placement Readiness Diagnostics */}
        <div className="lg:col-span-2 space-y-6">
          {readiness ? (
            <PlacementReadinessCard readiness={readiness} onNavigate={onNavigate} />
          ) : (
            <div className="bg-white rounded-3xl p-8 border border-slate-200 animate-pulse h-64" />
          )}

          {/* Identified Weak Areas */}
          {readiness && readiness.weak_areas.length > 0 && (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Identified Priority Review Topics</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Grounded in recent quiz scores, unmastered DSA topics, and mock interview concept coverage.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {readiness.weak_areas.map((w: any, idx: number) => (
                  <WeakAreaCard key={idx} weakArea={w} onNavigate={onNavigate} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right (1 col): Active Sprint & Recent Interviews */}
        <div className="space-y-6">
          {/* Active Placement Sprint Card */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">Active Placement Sprint</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                ACTIVE
              </span>
            </div>

            {activePlan ? (
              <div className="space-y-3">
                <h4 className="font-bold text-slate-800 text-sm">{activePlan.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Target Duration: <span className="font-semibold text-slate-700">{activePlan.duration_weeks} Weeks</span>
                </p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => onNavigate('/placements/plans')}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    Manage Weekly Tasks <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 space-y-3">
                <p className="text-xs text-slate-500">No active placement study plan created yet.</p>
                <button
                  onClick={() => onNavigate('/placements/plans')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  Generate AI Study Plan
                </button>
              </div>
            )}
          </div>

          {/* Recent Mock Interviews Card */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-purple-600" />
                <h3 className="font-bold text-slate-900 text-sm">Recent Mock Interviews</h3>
              </div>
              <button
                onClick={() => onNavigate('/placements/history')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                View All
              </button>
            </div>

            {interviews.length > 0 ? (
              <div className="space-y-2.5">
                {interviews.slice(0, 3).map((sess) => (
                  <div
                    key={sess.id}
                    onClick={() => onNavigate(
                      sess.status === 'COMPLETED'
                        ? `/placements/mock-interview/${sess.id}/result`
                        : `/placements/mock-interview/${sess.id}`
                    )}
                    className="p-3 rounded-xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50/50 cursor-pointer transition-all"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-800">
                        {sess.interview_type} Interview
                      </span>
                      {sess.overall_score !== undefined && (
                        <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                          {sess.overall_score}%
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Status: {sess.status}</span>
                      <span>{new Date(sess.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 space-y-2">
                <p className="text-xs text-slate-500">No mock interviews taken yet.</p>
                <button
                  onClick={() => onNavigate('/placements/mock-interview/setup')}
                  className="px-3.5 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold"
                >
                  Start Your First Interview
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. Company-Specific Preparation Tracks */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-lg">Company Hiring Profiles & Assessment Tracks</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified hiring rounds, coding question formats, and official assessment documentation.
            </p>
          </div>

          <button
            onClick={() => onNavigate('/placements/company')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Explore All Companies</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredCompanies.slice(0, 4).map((comp) => (
            <div
              key={comp.id}
              onClick={() => onNavigate(`/placements/company/${comp.id}`)}
              className="p-5 border border-slate-200 hover:border-blue-400 rounded-2xl cursor-pointer hover:shadow-md transition-all flex flex-col justify-between space-y-4 group bg-white hover:bg-slate-50/40"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 p-1.5 rounded-xl bg-slate-100 flex items-center justify-center">
                    <img src={comp.logo_url} alt={comp.name} className="h-7 w-7 object-contain" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md">
                    VERIFIED
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                    {comp.name}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                    {comp.description}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-blue-600 font-semibold">
                <span>View Hiring Rounds</span>
                <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Featured Practice Topics */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Placement Question Banks</h3>
            <p className="text-xs text-slate-500">
              Concept breakdowns, mathematical formulas, and multiple-choice question sets.
            </p>
          </div>
          <button
            onClick={() => onNavigate('/placements/topics')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            All Topics ({topics.length}) <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredTopics.slice(0, 4).map((t) => (
            <PlacementTopicCard
              key={t.id}
              topic={t}
              onSelect={(id) => onNavigate(`/placements/topic/${id}`)}
            />
          ))}
        </div>
      </div>

      {/* Modal Components */}
      <PlacementAssessmentModal
        isOpen={isAssessmentOpen}
        onClose={() => setIsAssessmentOpen(false)}
        defaultCategory={assessmentCategory}
      />

      <GroupDiscussionHubModal
        isOpen={isGDModalOpen}
        onClose={() => setIsGDModalOpen(false)}
      />

      <ResumeProjectDefenseModal
        isOpen={isResumeModalOpen}
        onClose={() => setIsResumeModalOpen(false)}
        onNavigate={onNavigate}
      />

      <AICoachDrawer
        isOpen={isAICoachOpen}
        onClose={() => setIsAICoachOpen(false)}
      />
    </div>
  );
};
