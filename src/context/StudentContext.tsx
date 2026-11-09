import * as React from 'react';
import { useAuth } from '../hooks/useAuth';
import { apiClient } from '../api/client';
import { onboardingApi } from '../api/onboardingApi';
import { queryClient } from '../api/queryClient';
import { toast } from 'sonner';
import {
  EducationProfile,
  SemesterSyllabusData,
  LearningPreferences,
  StudentSkillsAssessment,
  CareerGoals,
  PortfolioProject,
  StudyConstraints,
  OnboardingStatus,
} from '../../server/models/onboardingTypes';

export interface StudentContextData {
  student: any | null;
  profile: any | null;
  education: EducationProfile | null;
  semester: SemesterSyllabusData | null;
  skills: StudentSkillsAssessment | null;
  preferences: LearningPreferences | null;
  studySchedule: StudyConstraints | null;
  career: CareerGoals | null;
  projects: PortfolioProject[];
  goals: any[];
  notificationsCount: number;
  progressSummary: any | null;
  onboarding: OnboardingStatus | null;
  isLoading: boolean;
  isSaving: boolean;

  // Actions
  updateProfile: (data: any) => Promise<boolean>;
  updateAcademics: (educationData: Partial<EducationProfile>, semesterData?: Partial<SemesterSyllabusData>) => Promise<boolean>;
  updateSkills: (skillsData: Partial<StudentSkillsAssessment>) => Promise<boolean>;
  updatePreferences: (prefData: Partial<LearningPreferences>) => Promise<boolean>;
  updateStudySchedule: (scheduleData: Partial<StudyConstraints>) => Promise<boolean>;
  updateCareerGoals: (careerData: Partial<CareerGoals>) => Promise<boolean>;
  completeOnboarding: () => Promise<boolean>;
  refreshStudentContext: () => Promise<void>;
}

const StudentContext = React.createContext<StudentContextData | null>(null);

export function StudentContextProvider({ children }: { children: React.ReactNode }) {
  const { student, isAuthenticated, refreshStudent } = useAuth();
  const [profile, setProfile] = React.useState<any | null>(null);
  const [education, setEducation] = React.useState<EducationProfile | null>(null);
  const [semester, setSemester] = React.useState<SemesterSyllabusData | null>(null);
  const [skills, setSkills] = React.useState<StudentSkillsAssessment | null>(null);
  const [preferences, setPreferences] = React.useState<LearningPreferences | null>(null);
  const [studySchedule, setStudySchedule] = React.useState<StudyConstraints | null>(null);
  const [career, setCareer] = React.useState<CareerGoals | null>(null);
  const [projects, setProjects] = React.useState<PortfolioProject[]>([]);
  const [goals, setGoals] = React.useState<any[]>([]);
  const [notificationsCount, setNotificationsCount] = React.useState<number>(0);
  const [progressSummary, setProgressSummary] = React.useState<any | null>(null);
  const [onboarding, setOnboarding] = React.useState<OnboardingStatus | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isSaving, setIsSaving] = React.useState<boolean>(false);

  const loadAllContext = React.useCallback(async () => {
    if (!isAuthenticated || !student?.id) return;
    setIsLoading(true);

    try {
      const [
        onboardingRes,
        educationRes,
        semesterRes,
        skillsRes,
        prefRes,
        scheduleRes,
        careerRes,
        projectsRes,
        profileRes,
        goalsRes,
        notifRes,
        progressRes,
      ] = await Promise.allSettled([
        onboardingApi.getStatus(),
        onboardingApi.getEducation(),
        onboardingApi.getSemesterSyllabus(),
        onboardingApi.getSkills(),
        onboardingApi.getPreferences(),
        onboardingApi.getStudyConstraints(),
        onboardingApi.getCareerGoals(),
        onboardingApi.getProjects(),
        apiClient.get<any>('/student/profile'),
        apiClient.get<any[]>('/goals'),
        apiClient.get<{ items: any[]; unreadCount: number }>('/notifications?unreadOnly=true'),
        apiClient.get<any>('/progress'),
      ]);

      if (onboardingRes.status === 'fulfilled' && onboardingRes.value) {
        setOnboarding(onboardingRes.value);
      }
      if (educationRes.status === 'fulfilled' && educationRes.value) {
        setEducation(educationRes.value);
      }
      if (semesterRes.status === 'fulfilled' && semesterRes.value) {
        setSemester(semesterRes.value);
      }
      if (skillsRes.status === 'fulfilled' && skillsRes.value) {
        setSkills(skillsRes.value);
      }
      if (prefRes.status === 'fulfilled' && prefRes.value) {
        setPreferences(prefRes.value);
      }
      if (scheduleRes.status === 'fulfilled' && scheduleRes.value) {
        setStudySchedule(scheduleRes.value);
      }
      if (careerRes.status === 'fulfilled' && careerRes.value) {
        setCareer(careerRes.value);
      }
      if (projectsRes.status === 'fulfilled' && projectsRes.value) {
        setProjects(projectsRes.value);
      }
      // apiClient.request() already unwraps `{ success, data }` envelopes, so each
      // settled value is the payload itself (not an object with a `.data` field).
      if (profileRes.status === 'fulfilled' && profileRes.value) {
        setProfile(profileRes.value as any);
      }
      if (goalsRes.status === 'fulfilled' && Array.isArray(goalsRes.value)) {
        setGoals(goalsRes.value as any[]);
      }
      if (notifRes.status === 'fulfilled' && notifRes.value) {
        const notifData = notifRes.value as any;
        setNotificationsCount(
          typeof notifData.unreadCount === 'number'
            ? notifData.unreadCount
            : Array.isArray(notifData.items)
              ? notifData.items.length
              : 0
        );
      }
      if (progressRes.status === 'fulfilled' && progressRes.value) {
        setProgressSummary(progressRes.value as any);
      }
    } catch {
      // Graceful fallback to partial data
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, student?.id]);

  React.useEffect(() => {
    loadAllContext();
  }, [loadAllContext]);

  // Phase 5: reload when the central profile changes anywhere in the app.
  React.useEffect(() => {
    const onUpdate = () => {
      void loadAllContext();
    };
    window.addEventListener('profile:updated', onUpdate);
    return () => window.removeEventListener('profile:updated', onUpdate);
  }, [loadAllContext]);

  // Synchronized update methods
  const updateProfile = async (data: any): Promise<boolean> => {
    setIsSaving(true);
    try {
      // apiClient throws on non-2xx and returns the unwrapped payload on success.
      const updated = await apiClient.patch<any>('/student/profile', data);
      if (updated) {
        setProfile(updated);
        await refreshStudent();
        await queryClient.invalidateQueries({ queryKey: ['profile'] });
        await queryClient.invalidateQueries({ queryKey: ['student'] });
        toast.success('Profile updated');
        return true;
      }
      return false;
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const updateAcademics = async (
    educationData: Partial<EducationProfile>,
    semesterData?: Partial<SemesterSyllabusData>
  ): Promise<boolean> => {
    setIsSaving(true);
    try {
      const [edu, sem] = await Promise.all([
        onboardingApi.saveEducation(educationData),
        semesterData ? onboardingApi.saveSemesterSyllabus(semesterData) : Promise.resolve(null),
      ]);
      setEducation(edu);
      if (sem) setSemester(sem);

      await refreshStudent();
      await queryClient.invalidateQueries({ queryKey: ['education'] });
      await queryClient.invalidateQueries({ queryKey: ['semester'] });
      await queryClient.invalidateQueries({ queryKey: ['progress'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Academic profile updated');
      return true;
    } catch (err: any) {
      toast.error(err.message || 'Failed to update academics');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const updateSkills = async (skillsData: Partial<StudentSkillsAssessment>): Promise<boolean> => {
    setIsSaving(true);
    try {
      const updated = await onboardingApi.saveSkills(skillsData);
      setSkills(updated);
      await queryClient.invalidateQueries({ queryKey: ['skills'] });
      await queryClient.invalidateQueries({ queryKey: ['progress'] });
      toast.success('Technical skills updated');
      return true;
    } catch (err: any) {
      toast.error(err.message || 'Failed to update skills');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const updatePreferences = async (prefData: Partial<LearningPreferences>): Promise<boolean> => {
    setIsSaving(true);
    try {
      const updated = await onboardingApi.savePreferences(prefData);
      setPreferences(updated);
      await queryClient.invalidateQueries({ queryKey: ['preferences'] });
      await queryClient.invalidateQueries({ queryKey: ['ai-preferences'] });
      toast.success('Learning preferences updated');
      return true;
    } catch (err: any) {
      toast.error(err.message || 'Failed to update preferences');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const updateStudySchedule = async (scheduleData: Partial<StudyConstraints>): Promise<boolean> => {
    setIsSaving(true);
    try {
      const updated = await onboardingApi.saveStudyConstraints(scheduleData);
      setStudySchedule(updated);
      await queryClient.invalidateQueries({ queryKey: ['study-constraints'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Study availability schedule updated');
      return true;
    } catch (err: any) {
      toast.error(err.message || 'Failed to update study schedule');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const updateCareerGoals = async (careerData: Partial<CareerGoals>): Promise<boolean> => {
    setIsSaving(true);
    try {
      const updated = await onboardingApi.saveCareerGoals(careerData);
      setCareer(updated);
      await queryClient.invalidateQueries({ queryKey: ['career-goals'] });
      await queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success('Career goals updated');
      return true;
    } catch (err: any) {
      toast.error(err.message || 'Failed to update career goals');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const completeOnboarding = async (): Promise<boolean> => {
    setIsSaving(true);
    try {
      const status = await onboardingApi.completeOnboarding();
      setOnboarding(status);
      await refreshStudent();
      await loadAllContext();
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      await queryClient.invalidateQueries({ queryKey: ['progress'] });
      await queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success('🎉 Registration & Onboarding completed!');
      return true;
    } catch (err: any) {
      toast.error(err.message || 'Failed to complete onboarding');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const value: StudentContextData = {
    student,
    profile,
    education,
    semester,
    skills,
    preferences,
    studySchedule,
    career,
    projects,
    goals,
    notificationsCount,
    progressSummary,
    onboarding,
    isLoading,
    isSaving,
    updateProfile,
    updateAcademics,
    updateSkills,
    updatePreferences,
    updateStudySchedule,
    updateCareerGoals,
    completeOnboarding,
    refreshStudentContext: loadAllContext,
  };

  return <StudentContext.Provider value={value}>{children}</StudentContext.Provider>;
}

export function useStudentContext(): StudentContextData {
  const context = React.useContext(StudentContext);
  if (!context) {
    throw new Error('useStudentContext must be used within a StudentContextProvider');
  }
  return context;
}
