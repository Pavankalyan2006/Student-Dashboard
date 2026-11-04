// src/features/labs/pages/LabAssistantPage.tsx
// Master Coordinator for the Lab Assistant Module with Dashboard, Manual Authoring, Document Upload, Experiment Workspace, and Report Generator

import React, { useState, useEffect, useCallback } from 'react';
import { PageContainer, PageHeader, LoadingState } from '../../../components/layout/PageComponents';
import { FlaskConical } from 'lucide-react';
import { LabCourse, StudentLabAnalytics, LabReportData, LabManual, LabExperimentDetail } from '../types/labAssistantTypes';
import { labAssistantApi } from '../api/labAssistantApi';
import { LabDashboard } from '../components/LabDashboard';
import { CreateLabModal } from '../components/CreateLabModal';
import { ManualEntryModal } from '../components/ManualEntryModal';
import { ManualUploadModal } from '../components/ManualUploadModal';
import { ExperimentWorkspace } from '../components/ExperimentWorkspace';
import { ExperimentReportView } from '../components/ExperimentReportView';
import { toast } from 'sonner';

interface LabAssistantPageProps {
  onNavigate?: (path: string) => void;
}

export function LabAssistantPage({ onNavigate }: LabAssistantPageProps) {
  const [labs, setLabs] = useState<LabCourse[]>([]);
  const [analytics, setAnalytics] = useState<StudentLabAnalytics>({
    total_labs: 0,
    total_experiments: 0,
    completed_experiments: 0,
    in_progress_experiments: 0,
    not_started_experiments: 0,
    total_manuals_uploaded: 0,
    total_code_runs: 0,
    total_viva_attempted: 0,
    average_viva_score: 0,
    reports_generated: 0,
    is_onboarding: true,
  });
  const [loading, setLoading] = useState(true);

  // Active View State
  const [view, setView] = useState<'dashboard' | 'workspace' | 'report'>('dashboard');
  const [activeLab, setActiveLab] = useState<LabCourse | null>(null);
  const [activeExpId, setActiveExpId] = useState<string | null>(null);
  const [activeReport, setActiveReport] = useState<LabReportData | null>(null);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingLab, setEditingLab] = useState<LabCourse | null>(null);
  const [isManualEntryOpen, setIsManualEntryOpen] = useState(false);
  const [manualEntryLab, setManualEntryLab] = useState<LabCourse | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadLab, setUploadLab] = useState<LabCourse | null>(null);

  // Fetch labs and analytics from backend
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [labsData, analyticsData] = await Promise.all([
        labAssistantApi.getLabs(),
        labAssistantApi.getAnalytics(),
      ]);
      setLabs(labsData);
      setAnalytics(analyticsData);
    } catch (err: any) {
      toast.error('Failed to load laboratory data: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Modal Triggers
  const handleOpenCreateLab = () => {
    setEditingLab(null);
    setIsCreateModalOpen(true);
  };

  const handleEditLab = (lab: LabCourse) => {
    setEditingLab(lab);
    setIsCreateModalOpen(true);
  };

  const handleOpenManualEntry = (lab: LabCourse) => {
    setManualEntryLab(lab);
    setIsManualEntryOpen(true);
  };

  const handleOpenUploadManual = (lab: LabCourse) => {
    setUploadLab(lab);
    setIsUploadModalOpen(true);
  };

  const handleDeleteLab = async (labId: string) => {
    try {
      await labAssistantApi.deleteLab(labId);
      toast.success('Laboratory deleted successfully');
      fetchData();
      if (activeLab?.id === labId) {
        setView('dashboard');
        setActiveLab(null);
      }
    } catch (err: any) {
      toast.error('Error deleting lab: ' + err.message);
    }
  };

  // Open Experiment Workspace
  const handleSelectExperiment = (lab: LabCourse, expId: string) => {
    setActiveLab(lab);
    setActiveExpId(expId);
    setView('workspace');
  };

  // Open Experiment Report View
  const handleOpenReport = async (expId: string) => {
    if (!activeLab) return;
    try {
      const rep = await labAssistantApi.getReport(activeLab.id, expId);
      setActiveReport(rep);
      setView('report');
    } catch (err: any) {
      toast.error('Failed to generate report: ' + err.message);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <PageHeader title="Lab Assistant" description="Loading laboratory syllabus..." />
        <LoadingState message="LabAssistantAgent initializing practical curriculum & sandboxes..." />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* View: Dashboard */}
      {view === 'dashboard' && (
        <LabDashboard
          labs={labs}
          analytics={analytics}
          onOpenCreateLab={handleOpenCreateLab}
          onOpenManualEntry={handleOpenManualEntry}
          onOpenUploadManual={handleOpenUploadManual}
          onSelectExperiment={handleSelectExperiment}
          onOpenReport={(lab, expId) => {
            setActiveLab(lab);
            handleOpenReport(expId);
          }}
          onDeleteLab={handleDeleteLab}
          onEditLab={handleEditLab}
        />
      )}

      {/* View: Experiment Workspace */}
      {view === 'workspace' && activeLab && activeExpId && (
        <ExperimentWorkspace
          lab={activeLab}
          experimentId={activeExpId}
          onBackToLab={() => setView('dashboard')}
          onSelectExperiment={(newExpId) => setActiveExpId(newExpId)}
          onOpenReport={handleOpenReport}
        />
      )}

      {/* View: Experiment Report */}
      {view === 'report' && activeReport && (
        <ExperimentReportView
          report={activeReport}
          onBack={() => setView(activeExpId ? 'workspace' : 'dashboard')}
        />
      )}

      {/* Modals */}
      {isCreateModalOpen && (
        <CreateLabModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          editLab={editingLab}
          onCreated={(lab) => {
            fetchData();
            setActiveLab(lab);
          }}
        />
      )}

      {isManualEntryOpen && manualEntryLab && (
        <ManualEntryModal
          isOpen={isManualEntryOpen}
          onClose={() => setIsManualEntryOpen(false)}
          lab={manualEntryLab}
          onSaved={(manual, experiments) => {
            fetchData();
            if (experiments.length > 0) {
              setActiveLab(manualEntryLab);
              setActiveExpId(experiments[0].id);
              setView('workspace');
            }
          }}
        />
      )}

      {isUploadModalOpen && uploadLab && (
        <ManualUploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          lab={uploadLab}
          onManualImported={(manual, experiments) => {
            fetchData();
            if (experiments.length > 0) {
              setActiveLab(uploadLab);
              setActiveExpId(experiments[0].id);
              setView('workspace');
            }
          }}
          onSwitchToManualEntry={() => {
            handleOpenManualEntry(uploadLab);
          }}
        />
      )}
    </PageContainer>
  );
}
