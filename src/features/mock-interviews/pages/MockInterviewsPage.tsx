// src/features/mock-interviews/pages/MockInterviewsPage.tsx
// Master page coordinating AI Mock Interviews Dashboard, Setup, Live Workspace, and Debrief Reports

import React, { useState } from 'react';
import { MockInterviewDashboard } from '../components/MockInterviewDashboard';
import { MockInterviewSetupModal } from '../components/MockInterviewSetupModal';
import { MockInterviewWorkspace } from '../components/MockInterviewWorkspace';
import { MockInterviewReportView } from '../components/MockInterviewReportView';
import { ScheduleInterviewModal } from '../components/ScheduleInterviewModal';
import { MockInterviewCategory } from '../types/mockInterviewTypes';

interface Props {
  sessionId?: string;
  isReportView?: boolean;
  onNavigate?: (path: string) => void;
}

export const MockInterviewsPage: React.FC<Props> = ({
  sessionId: propSessionId,
  isReportView = false,
  onNavigate: propOnNavigate,
}) => {
  const [activeSessionId, setActiveSessionId] = useState<string | null>(propSessionId || null);
  const [viewingReport, setViewingReport] = useState<boolean>(isReportView);
  const [setupModalOpen, setSetupModalOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [preselectedCategory, setPreselectedCategory] = useState<MockInterviewCategory | undefined>();

  const navigate = (path: string) => {
    if (propOnNavigate) {
      propOnNavigate(path);
    } else {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const handleStartNew = (cat?: MockInterviewCategory) => {
    setPreselectedCategory(cat);
    setSetupModalOpen(true);
  };

  const handleStartSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
    setViewingReport(false);
    navigate(`/mock-interviews/${sessionId}`);
  };

  const handleFinishSession = () => {
    setViewingReport(true);
    if (activeSessionId) {
      navigate(`/mock-interviews/${activeSessionId}/report`);
    }
  };

  const handleOpenSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
    setViewingReport(false);
    navigate(`/mock-interviews/${sessionId}`);
  };

  const handleViewReport = (sessionId: string) => {
    setActiveSessionId(sessionId);
    setViewingReport(true);
    navigate(`/mock-interviews/${sessionId}/report`);
  };

  const handleExitToDashboard = () => {
    setActiveSessionId(null);
    setViewingReport(false);
    navigate('/mock-interviews');
  };

  // 1. Report View
  if (viewingReport && activeSessionId) {
    return (
      <div className="min-h-screen bg-slate-50">
        <MockInterviewReportView
          sessionId={activeSessionId}
          onNavigate={(p) => {
            if (p === '/mock-interviews') {
              handleExitToDashboard();
            } else {
              navigate(p);
            }
          }}
          onRetake={() => {
            setActiveSessionId(null);
            setViewingReport(false);
            setSetupModalOpen(true);
          }}
        />
      </div>
    );
  }

  // 2. Active Live Workspace
  if (activeSessionId) {
    return (
      <MockInterviewWorkspace
        sessionId={activeSessionId}
        onFinish={handleFinishSession}
        onExit={handleExitToDashboard}
      />
    );
  }

  // 3. Master Dashboard
  return (
    <div className="min-h-screen bg-slate-50">
      <MockInterviewDashboard
        onStartNew={handleStartNew}
        onOpenSession={handleOpenSession}
        onViewReport={handleViewReport}
        onOpenSchedule={() => setScheduleModalOpen(true)}
      />

      <MockInterviewSetupModal
        isOpen={setupModalOpen}
        onClose={() => setSetupModalOpen(false)}
        onStartSession={handleStartSession}
        preselectedCategory={preselectedCategory}
      />

      <ScheduleInterviewModal
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        onScheduled={() => {
          // Trigger refresh if needed
        }}
      />
    </div>
  );
};
