import * as React from 'react';
import {
  User,
  UserCheck,
  GraduationCap,
  BookOpen,
  Code2,
  Compass,
  Briefcase,
  Sliders,
  Calendar,
  Layers,
  Send,
  CheckCircle2,
  Save,
  Sparkles,
  AlertCircle,
  Plus,
  Trash2,
  Check,
  Clock,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Eye,
  EyeOff,
  ShieldCheck,
  Upload,
  Globe,
  Bell,
  Cpu,
  FileCode,
  Target,
  FileText,
  Award,
  Brain,
  DollarSign,
  School,
  RefreshCw,
  Heart,
  Zap,
} from 'lucide-react';
import { onboardingApi } from '../../../api/onboardingApi';
import { authApi } from '../../../api/auth';
import { useAuthStore } from '../../../store/authStore';
import { communityProfileApi } from '../../../api/communityProfileApi';
import { useAuth } from '../../../hooks/useAuth';
import { useStudentContext } from '../../../hooks/useStudentContext';
import { toast } from 'sonner';
import {
  DegreeType,
  SubjectType,
  AcademicSubject,
  PortfolioProject,
  SkillSelfAssessment,
  StudentAIPersona,
} from '../../../../server/models/onboardingTypes';

// Standardized list of technical skills categorized
const STANDARD_SKILLS: { name: string; category: string }[] = [
  // Programming Languages
  { name: 'Python', category: 'Languages' },
  { name: 'Java', category: 'Languages' },
  { name: 'C / C++', category: 'Languages' },
  { name: 'JavaScript & TypeScript', category: 'Languages' },
  { name: 'SQL', category: 'Languages' },
  { name: 'Go (Golang)', category: 'Languages' },
  { name: 'Rust', category: 'Languages' },

  // Frontend
  { name: 'HTML & CSS', category: 'Frontend' },
  { name: 'React.js', category: 'Frontend' },
  { name: 'Next.js', category: 'Frontend' },
  { name: 'Tailwind CSS', category: 'Frontend' },

  // Backend
  { name: 'Node.js & Express', category: 'Backend' },
  { name: 'FastAPI / Python', category: 'Backend' },
  { name: 'Spring Boot', category: 'Backend' },
  { name: 'REST & GraphQL APIs', category: 'Backend' },

  // Databases
  { name: 'PostgreSQL / MySQL', category: 'Databases' },
  { name: 'MongoDB', category: 'Databases' },
  { name: 'Redis Caching', category: 'Databases' },

  // CS Fundamentals
  { name: 'Data Structures & Algorithms', category: 'CS Fundamentals' },
  { name: 'Operating Systems', category: 'CS Fundamentals' },
  { name: 'Database Management (DBMS)', category: 'CS Fundamentals' },
  { name: 'Computer Networks', category: 'CS Fundamentals' },
  { name: 'System Design Fundamentals', category: 'CS Fundamentals' },

  // AI & ML
  { name: 'Machine Learning Fundamentals', category: 'AI & ML' },
  { name: 'Deep Learning & Neural Networks', category: 'AI & ML' },
  { name: 'Natural Language Processing (NLP)', category: 'AI & ML' },
  { name: 'Generative AI & LLM Prompting', category: 'AI & ML' },

  // Tools & DevOps
  { name: 'Git & GitHub', category: 'Tools & DevOps' },
  { name: 'Linux Command Line', category: 'Tools & DevOps' },
  { name: 'Docker & Containers', category: 'Tools & DevOps' },
  { name: 'Cloud Computing (AWS / GCP / Azure)', category: 'Tools & DevOps' },
];

export const ONBOARDING_5_STEPS = [
  {
    id: 'ACCOUNT_IDENTITY',
    number: 1,
    label: '1. Account Registration and Identity',
    shortTitle: 'Account & Identity',
    icon: User,
    isOptional: false,
    description: 'Verify your credentials, display preferences, and student authentication.',
  },
  {
    id: 'ACADEMIC_SEMESTER',
    number: 2,
    label: '2. Academic Profile and Semester Information',
    shortTitle: 'Academic & Semester',
    icon: GraduationCap,
    isOptional: false,
    description: 'Degree, branch, university, semester context, and enrolled subjects with syllabus.',
  },
  {
    id: 'SKILLS_CAREER',
    number: 3,
    label: '3. Skills, Interests, Projects, and Career Goals',
    shortTitle: 'Skills & Career',
    icon: Code2,
    isOptional: true,
    description: 'Technical skills, practical projects, target roles, and external profiles.',
  },
  {
    id: 'PREFERENCES_SCHEDULE',
    number: 4,
    label: '4. Learning Preferences and Study Schedule',
    shortTitle: 'Preferences & Schedule',
    icon: Sliders,
    isOptional: false,
    description: 'AI tutor explanation depth, daily study time, study days, and learning priorities.',
  },
  {
    id: 'REVIEW_COMPLETE',
    number: 5,
    label: '5. Review, Privacy, and Complete Setup',
    shortTitle: 'Review & Complete',
    icon: CheckCircle2,
    isOptional: false,
    description: 'Review saved profile, configure notification alerts, consent, and launch workspace.',
  },
];

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250',
];

export function OnboardingPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { student } = useAuth();
  const { refreshStudentContext } = useStudentContext();
  const [currentStepIndex, setCurrentStepIndex] = React.useState<number>(0);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [saving, setSaving] = React.useState<boolean>(false);
  const [completedSteps, setCompletedSteps] = React.useState<Set<number>>(new Set());
  const [skippedSteps, setSkippedSteps] = React.useState<Set<number>>(new Set());

  // --- STEP 1: Account Registration and Identity ---
  const [fullName, setFullName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [displayName, setDisplayName] = React.useState('');
  const [namePronunciation, setNamePronunciation] = React.useState('');
  const [avatarUrl, setAvatarUrl] = React.useState(PRESET_AVATARS[0]);
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [country, setCountry] = React.useState('India');
  const [stateName, setStateName] = React.useState('Karnataka');
  const [cityName, setCityName] = React.useState('Bengaluru');
  const [timezone, setTimezone] = React.useState('Asia/Kolkata (IST, UTC+5:30)');
  const [preferredLanguage, setPreferredLanguage] = React.useState('English');
  const [bio, setBio] = React.useState('');

  // --- Step 1: Pre-B.Tech Heritage & Socio-Economic context ---
  const [tenthBoard, setTenthBoard] = React.useState('State Board (SSC)');
  const [tenthPercentage, setTenthPercentage] = React.useState('88.5');
  const [twelfthOrDiploma, setTwelfthOrDiploma] = React.useState('12th Intermediate / Jr College');
  const [twelfthStream, setTwelfthStream] = React.useState('MPC (Maths, Physics, Chemistry)');
  const [twelfthPercentage, setTwelfthPercentage] = React.useState('91.2');
  const [entranceExamName, setEntranceExamName] = React.useState('TS EAMCET');
  const [entranceExamRank, setEntranceExamRank] = React.useState('14250');
  const [firstGenerationEngineer, setFirstGenerationEngineer] = React.useState(false);
  const [familyContextNote, setFamilyContextNote] = React.useState('');
  const [financialUrgency, setFinancialUrgency] = React.useState<
    'IMMEDIATE_JOB_CRITICAL' | 'PREFER_JOB_SOON' | 'BALANCED_EXPLORATION' | 'INVESTING_IN_HIGHER_STUDIES'
  >('PREFER_JOB_SOON');
  const [educationLoanActive, setEducationLoanActive] = React.useState(false);

  // --- Step 2: Subject Strengths & AI Interventions ---
  const [favoriteSubjects, setFavoriteSubjects] = React.useState<string[]>([
    'Database Management Systems',
    'Data Structures & Algorithms',
  ]);
  const [challengingSubjects, setChallengingSubjects] = React.useState<string[]>([
    'Operating Systems & Kernels',
    'Compiler Design',
  ]);
  const [newFavSub, setNewFavSub] = React.useState('');
  const [newChalSub, setNewChalSub] = React.useState('');

  // --- Step 3: Career Track & Achievements ---
  const [primaryCareerTrack, setPrimaryCareerTrack] = React.useState<
    'CAMPUS_PLACEMENT' | 'HIGHER_STUDIES_GATE' | 'HIGHER_STUDIES_ABROAD' | 'GOVERNMENT_EXAMS' | 'STARTUP_FOUNDER'
  >('CAMPUS_PLACEMENT');
  const [targetExamGoals, setTargetExamGoals] = React.useState('Targeting campus placement with 12+ LPA package');
  const [achievementsList, setAchievementsList] = React.useState<string[]>([
    'Smart India Hackathon College Round Winner',
    'NPTEL Elite Certificate in Data Structures',
  ]);
  const [newAchievement, setNewAchievement] = React.useState('');

  // --- Step 4: Learning Pace ---
  const [learningPace, setLearningPace] = React.useState<
    'FAST_PACED' | 'STEADY_BALANCED' | 'FOUNDATIONAL_STEP_BY_STEP'
  >('STEADY_BALANCED');

  // --- Step 5: Dedicated AI Companion Persona ---
  const [aiPersona, setAiPersona] = React.useState<StudentAIPersona | null>(null);
  const [personaCompanionName, setPersonaCompanionName] = React.useState('Arya');
  const [personaTone, setPersonaTone] = React.useState<StudentAIPersona['pedagogical_tone']>(
    'PRACTICAL_INDUSTRY_FIRST'
  );
  const [synthesizingPersona, setSynthesizingPersona] = React.useState(false);

  // --- STEP 2: Academic Profile and Semester Information ---
  const [institution, setInstitution] = React.useState('National Institute of Technology (NIT)');
  const [degree, setDegree] = React.useState<DegreeType>('B.Tech');
  const [branch, setBranch] = React.useState('Computer Science & Engineering (CSE)');
  const [specialization, setSpecialization] = React.useState('');
  const [currentYear, setCurrentYear] = React.useState(3);
  const [currentSemester, setCurrentSemester] = React.useState(6);
  const [admissionYear, setAdmissionYear] = React.useState(2023);
  const [graduationYear, setGraduationYear] = React.useState(2027);
  const [cgpa, setCgpa] = React.useState('8.50');
  const [cgpaScale, setCgpaScale] = React.useState('10.0');
  const [academicRegulation, setAcademicRegulation] = React.useState('AICTE Model Curriculum / Autonomous Scheme');
  const [academicLanguage, setAcademicLanguage] = React.useState('English');
  const [semesterStartDate, setSemesterStartDate] = React.useState('2026-01-15');
  const [semesterEndDate, setSemesterEndDate] = React.useState('2026-05-30');
  const [syllabusReference, setSyllabusReference] = React.useState('AICTE National Model Curriculum / University R22 Scheme');
  const [syllabusUploadedName, setSyllabusUploadedName] = React.useState<string | null>(null);

  // Subject Manager
  const [subjectsList, setSubjectsList] = React.useState<AcademicSubject[]>([
    { id: 'sub_1', name: 'Database Management Systems', code: 'CS301', credits: 4, subject_type: 'THEORY', syllabus_units: [] },
    { id: 'sub_2', name: 'Operating Systems & Kernels', code: 'CS302', credits: 4, subject_type: 'THEORY', syllabus_units: [] },
    { id: 'sub_3', name: 'Computer Networks & Protocols', code: 'CS303', credits: 4, subject_type: 'THEORY', syllabus_units: [] },
    { id: 'sub_4', name: 'Compiler Design', code: 'CS304', credits: 3, subject_type: 'THEORY', syllabus_units: [] },
    { id: 'sub_5', name: 'Distributed Systems & Cloud Computing', code: 'CS305', credits: 4, subject_type: 'THEORY', syllabus_units: [] },
    { id: 'sub_6', name: 'Database Systems Lab', code: 'CS301L', credits: 2, subject_type: 'LAB', syllabus_units: [] },
  ]);
  const [newSubName, setNewSubName] = React.useState('');
  const [newSubCode, setNewSubCode] = React.useState('');
  const [newSubCredits, setNewSubCredits] = React.useState(4);
  const [newSubType, setNewSubType] = React.useState<SubjectType>('THEORY');

  // --- STEP 3: Skills, Interests, Projects, and Career Goals ---
  const [skillsList, setSkillsList] = React.useState<SkillSelfAssessment[]>(
    STANDARD_SKILLS.map((s) => ({
      skill_name: s.name,
      skill_category: s.category,
      self_reported_level: s.name === 'Python' || s.name === 'Data Structures & Algorithms' ? 'INTERMEDIATE' : 'BEGINNER',
      is_custom: false,
    }))
  );
  const [skillCategoryFilter, setSkillCategoryFilter] = React.useState<string>('All');
  const [customSkillName, setCustomSkillName] = React.useState('');
  const [customSkillCategory, setCustomSkillCategory] = React.useState('Languages');

  const [technicalInterests, setTechnicalInterests] = React.useState<string[]>([
    'Web Development', 'AI & Machine Learning', 'Cloud Computing', 'System Design', 'Competitive Programming'
  ]);
  const [targetJobRole, setTargetJobRole] = React.useState('Software Development Engineer (SDE)');
  const [targetCompanies, setTargetCompanies] = React.useState('Google, Microsoft, Amazon, Atlassian, Adobe');
  const [careerTimeline, setCareerTimeline] = React.useState('Targeting Campus Placements & Internships in Next 6 Months');
  const [shortTermGoal, setShortTermGoal] = React.useState('Solve 150+ DSA Problems and complete a production Full-Stack project');
  const [longTermGoal, setLongTermGoal] = React.useState('Join a top-tier engineering product company as an SDE / Systems Engineer');

  // Projects
  const [projectsList, setProjectsList] = React.useState<PortfolioProject[]>([
    {
      id: 'proj_1',
      title: 'B.Tech AI Learning Platform',
      description: 'Unified full-stack student learning workspace with AI tutor and automated grading.',
      technologies: ['React', 'TypeScript', 'Node.js', 'Express', 'SQLite'],
      status: 'IN_PROGRESS',
      repository_url: 'https://github.com/student/btech-ai-platform',
    },
  ]);
  const [newProjTitle, setNewProjTitle] = React.useState('');
  const [newProjDesc, setNewProjDesc] = React.useState('');
  const [newProjTech, setNewProjTech] = React.useState('');
  const [newProjRepo, setNewProjRepo] = React.useState('');

  // External Profiles
  const [githubUrl, setGithubUrl] = React.useState('https://github.com/student');
  const [linkedinUrl, setLinkedinUrl] = React.useState('https://linkedin.com/in/student');
  const [leetcodeUrl, setLeetcodeUrl] = React.useState('https://leetcode.com/u/student');
  const [codechefUrl, setCodechefUrl] = React.useState('');
  const [portfolioUrl, setPortfolioUrl] = React.useState('');

  // --- STEP 4: Learning Preferences and Study Schedule ---
  const [explanationStyle, setExplanationStyle] = React.useState('Practical examples with code walkthroughs');
  const [explanationDepth, setExplanationDepth] = React.useState<'CONCISE' | 'BALANCED' | 'DETAILED'>('BALANCED');
  const [preferredLearningFormats, setPreferredLearningFormats] = React.useState<string[]>([
    'Interactive Code Sandboxes', 'Step-by-step Walkthroughs', 'Practice Questions'
  ]);
  const [preferredDifficulty, setPreferredDifficulty] = React.useState('INTERMEDIATE');
  const [preferredExplanationLanguage, setPreferredExplanationLanguage] = React.useState('English');

  const [availableDays, setAvailableDays] = React.useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
  const [dailyHours, setDailyHours] = React.useState(3.5);
  const [weekendHours, setWeekendHours] = React.useState(5.0);
  const [sessionDuration, setSessionDuration] = React.useState(45);
  const [breakPreference, setBreakPreference] = React.useState('Pomodoro (25m study / 5m rest)');

  const [learningObjectives, setLearningObjectives] = React.useState<string[]>([
    'Understand semester subjects with high SGPA',
    'Prepare for competitive tech placements',
    'Build production-ready software projects',
    'Practice Data Structures & Algorithms'
  ]);

  // Personalization Toggles
  const [enableAiRecommendations, setEnableAiRecommendations] = React.useState(true);
  const [enableStudyReminders, setEnableStudyReminders] = React.useState(true);
  const [allowScheduleAdjustments, setAllowScheduleAdjustments] = React.useState(true);
  const [prioritizeDeadlines, setPrioritizeDeadlines] = React.useState(true);

  // --- STEP 5: Review, Privacy, and Complete Setup ---
  const [consentTerms, setConsentTerms] = React.useState(true);
  const [consentPersonalization, setConsentPersonalization] = React.useState(true);
  const [consentReminders, setConsentReminders] = React.useState(true);
  const [consentExternalSync, setConsentExternalSync] = React.useState(true);

  // Load existing profile if available
  React.useEffect(() => {
    loadSavedData();
  }, [student?.id]);

  const loadSavedData = async () => {
    try {
      setLoading(true);
      if (!student) {
        // Visitor is not logged in yet — fresh registration starting at Step 1
        setLoading(false);
        return;
      }
      setFullName(student.name || '');
      setEmail(student.email || '');
      setDisplayName(student.display_name || student.name?.split(' ')[0] || '');
      if (student.avatar_url) setAvatarUrl(student.avatar_url);
      if (student.branch) setBranch(student.branch);
      if (student.semester) setCurrentSemester(student.semester);

      const [statusRes, eduRes, semRes, prefRes, skRes, carRes, conRes, projRes] = await Promise.allSettled([
        onboardingApi.getStatus(),
        onboardingApi.getEducation(),
        onboardingApi.getSemesterSyllabus(),
        onboardingApi.getPreferences(),
        onboardingApi.getSkills(),
        onboardingApi.getCareerGoals(),
        onboardingApi.getStudyConstraints(),
        onboardingApi.getProjects(),
      ]);

      if (statusRes.status === 'fulfilled' && statusRes.value) {
        const s = statusRes.value;
        const comp = new Set<number>();
        const skip = new Set<number>();
        s.steps.forEach((st, idx) => {
          if (st.completed) comp.add(idx % 5);
          if (st.skipped) skip.add(idx % 5);
        });
        setCompletedSteps(comp);
        setSkippedSteps(skip);
      }

      if (eduRes.status === 'fulfilled' && eduRes.value) {
        const e = eduRes.value;
        if (e.degree) setDegree(e.degree);
        if (e.branch) setBranch(e.branch);
        if (e.specialization) setSpecialization(e.specialization);
        if (e.institution) setInstitution(e.institution);
        if (e.current_year) setCurrentYear(e.current_year);
        if (e.current_semester) setCurrentSemester(e.current_semester);
        if (e.admission_year) setAdmissionYear(e.admission_year);
        if (e.expected_graduation_year) setGraduationYear(e.expected_graduation_year);
        if (e.current_cgpa) setCgpa(String(e.current_cgpa));
        if (e.cgpa_scale) setCgpaScale(String(e.cgpa_scale));
        // Module A Heritage & Socio-Economic fields
        if (e.tenth_board) setTenthBoard(e.tenth_board);
        if (e.tenth_percentage) setTenthPercentage(String(e.tenth_percentage));
        if (e.twelfth_or_diploma) setTwelfthOrDiploma(e.twelfth_or_diploma);
        if (e.twelfth_stream) setTwelfthStream(e.twelfth_stream);
        if (e.twelfth_percentage) setTwelfthPercentage(String(e.twelfth_percentage));
        if (e.entrance_exam_name) setEntranceExamName(e.entrance_exam_name);
        if (e.entrance_exam_rank) setEntranceExamRank(e.entrance_exam_rank);
        if (e.first_generation_engineer !== undefined) setFirstGenerationEngineer(Boolean(e.first_generation_engineer));
        if (e.family_context_note) setFamilyContextNote(e.family_context_note);
        if (e.financial_urgency) setFinancialUrgency(e.financial_urgency);
        if (e.education_loan_active !== undefined) setEducationLoanActive(Boolean(e.education_loan_active));
        if (e.current_challenges?.length) setChallengingSubjects(e.current_challenges);
      }

      if (semRes.status === 'fulfilled' && semRes.value) {
        const sm = semRes.value;
        if (sm.subjects?.length) setSubjectsList(sm.subjects);
        if (sm.semester_start_date) setSemesterStartDate(sm.semester_start_date);
        if (sm.semester_end_date) setSemesterEndDate(sm.semester_end_date);
        if (sm.syllabus_reference) setSyllabusReference(sm.syllabus_reference);
      }

      if (prefRes.status === 'fulfilled' && prefRes.value) {
        const p = prefRes.value;
        if (p.learning_style) setExplanationStyle(p.learning_style);
        if (p.explanation_depth) setExplanationDepth(p.explanation_depth);
        if (p.preferred_explanation_language) setPreferredExplanationLanguage(p.preferred_explanation_language);
        if (p.weekday_study_hours) setDailyHours(p.weekday_study_hours);
        if (p.weekend_study_hours) setWeekendHours(p.weekend_study_hours);
        if (p.learning_pace) setLearningPace(p.learning_pace);
      }

      if (skRes.status === 'fulfilled' && skRes.value && skRes.value.skills?.length) {
        setSkillsList(skRes.value.skills);
      }

      if (carRes.status === 'fulfilled' && carRes.value) {
        const c = carRes.value;
        if (c.target_job_role) setTargetJobRole(c.target_job_role);
        if (c.target_companies?.length) setTargetCompanies(c.target_companies.join(', '));
        if (c.github_url) setGithubUrl(c.github_url);
        if (c.linkedin_url) setLinkedinUrl(c.linkedin_url);
        if (c.primary_career_track) setPrimaryCareerTrack(c.primary_career_track);
        if (c.target_exam_goals) setTargetExamGoals(c.target_exam_goals);
        if (c.favorite_subjects?.length) setFavoriteSubjects(c.favorite_subjects);
        if (c.challenging_subjects?.length) setChallengingSubjects(c.challenging_subjects);
        if (c.achievements_and_rewards?.length) setAchievementsList(c.achievements_and_rewards);
      }

      if (conRes.status === 'fulfilled' && conRes.value) {
        const cn = conRes.value;
        if (cn.daily_study_hours) setDailyHours(cn.daily_study_hours);
        if (cn.preferred_session_duration) setSessionDuration(cn.preferred_session_duration);
        if (cn.available_days?.length) setAvailableDays(cn.available_days);
      }

      if (projRes.status === 'fulfilled' && projRes.value?.length) {
        setProjectsList(projRes.value);
      }

      // Fetch AI Persona
      try {
        const persona = await onboardingApi.getAIPersona();
        if (persona) {
          setAiPersona(persona);
          setPersonaCompanionName(persona.agent_companion_name || 'Arya');
          setPersonaTone(persona.pedagogical_tone || 'PRACTICAL_INDUSTRY_FIRST');
        }
      } catch {}
    } catch {
      // Graceful fallback
    } finally {
      setLoading(false);
    }
  };

  // Persist step data to backend
  const persistStep = async (stepIndex: number, isSkipping: boolean = false): Promise<boolean> => {
    try {
      setSaving(true);
      const step = ONBOARDING_5_STEPS[stepIndex];

      if (isSkipping) {
        await onboardingApi.updateStep(step.id as any, false, true);
        setSkippedSteps((prev) => new Set(prev).add(stepIndex));
        return true;
      }

      switch (stepIndex) {
        case 0: // STEP 1: Account, Identity & Heritage
          if (!student) {
            // Register brand new student account
            const res = await authApi.register({
              name: fullName.trim(),
              email: email.trim().toLowerCase(),
              password: password,
              display_name: displayName.trim() || fullName.trim().split(' ')[0],
              avatar_url: avatarUrl,
            });
            useAuthStore.getState().setAuth(res.student, res.token);
            await refreshStudentContext().catch(() => {});
            toast.success(`🎉 Account created! Welcome, ${res.student.name}!`);
          } else {
            // Existing student updating account identity
            await communityProfileApi.updateProfile({
              name: fullName.trim(),
              avatar_url: avatarUrl,
              bio: bio,
            }).catch(() => {});
          }

          // Persist Academic Heritage & Socio-Economic Context immediately
          await onboardingApi.saveEducation({
            degree,
            branch,
            institution,
            tenth_board: tenthBoard,
            tenth_percentage: tenthPercentage ? parseFloat(tenthPercentage) : undefined,
            twelfth_or_diploma: twelfthOrDiploma,
            twelfth_stream: twelfthStream,
            twelfth_percentage: twelfthPercentage ? parseFloat(twelfthPercentage) : undefined,
            entrance_exam_name: entranceExamName,
            entrance_exam_rank: entranceExamRank,
            first_generation_engineer: firstGenerationEngineer,
            family_context_note: familyContextNote,
            financial_urgency: financialUrgency,
            education_loan_active: educationLoanActive,
          });

          await onboardingApi.updateStep('ACCOUNT_IDENTITY', true, false);
          break;

        case 1: // STEP 2: Academic Profile, Semester & Subject Interventions
          await onboardingApi.saveEducation({
            degree,
            branch,
            specialization: specialization || undefined,
            institution,
            current_year: currentYear,
            current_semester: currentSemester,
            admission_year: admissionYear,
            expected_graduation_year: graduationYear,
            study_mode: 'FULL_TIME',
            current_cgpa: cgpa ? parseFloat(cgpa) : undefined,
            cgpa_scale: parseFloat(cgpaScale) || 10,
            current_subjects: subjectsList.map((s) => s.name),
            current_challenges: challengingSubjects,
            tenth_board: tenthBoard,
            tenth_percentage: tenthPercentage ? parseFloat(tenthPercentage) : undefined,
            twelfth_or_diploma: twelfthOrDiploma,
            twelfth_stream: twelfthStream,
            twelfth_percentage: twelfthPercentage ? parseFloat(twelfthPercentage) : undefined,
            entrance_exam_name: entranceExamName,
            entrance_exam_rank: entranceExamRank,
            first_generation_engineer: firstGenerationEngineer,
            family_context_note: familyContextNote,
            financial_urgency: financialUrgency,
            education_loan_active: educationLoanActive,
          });

          await onboardingApi.saveSemesterSyllabus({
            academic_year: `${admissionYear + currentYear - 1}-${admissionYear + currentYear}`,
            semester_number: currentSemester,
            semester_start_date: semesterStartDate,
            semester_end_date: semesterEndDate,
            syllabus_reference: syllabusReference,
            subjects: subjectsList,
          });

          await onboardingApi.saveCareerGoals({
            favorite_subjects: favoriteSubjects,
            challenging_subjects: challengingSubjects,
          });

          await onboardingApi.updateStep('EDUCATION_BACKGROUND', true, false);
          await onboardingApi.updateStep('SEMESTER_SYLLABUS', true, false);
          break;

        case 2: // STEP 3: Skills, Interests, Career Tracks & Achievements
          await onboardingApi.saveSkills({
            skills: skillsList,
          });

          await onboardingApi.saveCareerGoals({
            target_job_role: targetJobRole,
            target_companies: targetCompanies.split(',').map((c) => c.trim()).filter(Boolean),
            placement_timeline: careerTimeline,
            long_term_goal: longTermGoal,
            github_url: githubUrl,
            linkedin_url: linkedinUrl,
            primary_career_track: primaryCareerTrack,
            target_exam_goals: targetExamGoals,
            favorite_subjects: favoriteSubjects,
            challenging_subjects: challengingSubjects,
            achievements_and_rewards: achievementsList,
          });

          await onboardingApi.updateStep('TECHNICAL_SKILLS', true, false);
          await onboardingApi.updateStep('CAREER_GOALS', true, false);
          break;

        case 3: // STEP 4: Learning Preferences, Pace & Study Schedule
          await onboardingApi.savePreferences({
            learning_style: explanationStyle,
            explanation_depth: explanationDepth,
            preferred_explanation_language: preferredExplanationLanguage,
            weekday_study_hours: dailyHours,
            weekend_study_hours: weekendHours,
            difficulty_level: preferredDifficulty,
            learning_pace: learningPace,
          });

          await onboardingApi.saveStudyConstraints({
            daily_study_hours: dailyHours,
            available_days: availableDays,
            preferred_session_duration: sessionDuration,
            break_preference: breakPreference,
            study_reminders_enabled: enableStudyReminders,
          });

          // Pre-generate tailored AI companion persona so it is ready for Step 5
          try {
            const persona = await onboardingApi.regenerateAIPersona({
              agent_companion_name: personaCompanionName,
              pedagogical_tone: personaTone,
            });
            setAiPersona(persona);
          } catch {}

          await onboardingApi.updateStep('AI_PREFERENCES', true, false);
          await onboardingApi.updateStep('STUDY_SCHEDULE', true, false);
          break;

        case 4: // STEP 5: Final Review, AI Persona Training & Privacy
          await onboardingApi.saveCareerGoals({
            notification_preferences: {
              study_reminders: enableStudyReminders,
              revision_reminders: true,
              deadline_reminders: prioritizeDeadlines,
              goal_reminders: true,
            },
          });

          await onboardingApi.saveAIPersona({
            agent_companion_name: personaCompanionName,
            pedagogical_tone: personaTone,
          });

          await onboardingApi.updateStep('FINAL_REVIEW', true, false);
          break;
      }

      setCompletedSteps((prev) => new Set(prev).add(stepIndex));
      return true;
    } catch (err: any) {
      toast.error(`Save error: ${err.message || 'Could not persist step data'}`);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleNext = async () => {
    // Validation
    if (currentStepIndex === 0) {
      if (!fullName.trim() || fullName.trim().length < 2) {
        toast.error('Please enter your full legal name (minimum 2 characters)');
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        toast.error('Please enter a valid academic email address');
        return;
      }
      if (!student) {
        if (!password || password.length < 8) {
          toast.error('Password must be at least 8 characters long');
          return;
        }
        if (password !== confirmPassword) {
          toast.error('Passwords do not match');
          return;
        }
      }
    }

    if (currentStepIndex === 1) {
      if (!institution.trim() || !branch.trim()) {
        toast.error('Please specify your institution name and engineering branch');
        return;
      }
      if (subjectsList.length === 0) {
        toast.error('Please add at least one subject for the current semester');
        return;
      }
    }

    const ok = await persistStep(currentStepIndex, false);
    if (ok) {
      if (currentStepIndex < ONBOARDING_5_STEPS.length - 1) {
        setCurrentStepIndex((prev) => prev + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSkip = async () => {
    const ok = await persistStep(currentStepIndex, true);
    if (ok) {
      toast.info(`Skipped ${ONBOARDING_5_STEPS[currentStepIndex].shortTitle} (can be configured anytime from Settings)`);
      if (currentStepIndex < ONBOARDING_5_STEPS.length - 1) {
        setCurrentStepIndex((prev) => prev + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleFinishOnboarding = async () => {
    if (!consentTerms) {
      toast.error('Please accept the Terms of Service & Privacy Policy to complete onboarding');
      return;
    }

    try {
      setSaving(true);
      await persistStep(4, false); // Persist Step 5
      await onboardingApi.completeOnboarding();
      await refreshStudentContext();
      toast.success('🎉 Registration & Onboarding Completed! Welcome to your AI Learning Platform!');
      onNavigate('/dashboard');
    } catch (err: any) {
      toast.error(`Completion failed: ${err.message || 'Please check input'}`);
    } finally {
      setSaving(false);
    }
  };

  // Subject Helpers
  const handleAddSubject = () => {
    if (!newSubName.trim()) {
      toast.error('Subject name is required');
      return;
    }
    const newSub: AcademicSubject = {
      id: `sub_${Date.now()}`,
      name: newSubName.trim(),
      code: newSubCode.trim() || `CS${currentSemester}0${subjectsList.length + 1}`,
      credits: newSubCredits,
      subject_type: newSubType,
      syllabus_units: [],
    };
    setSubjectsList([...subjectsList, newSub]);
    setNewSubName('');
    setNewSubCode('');
    toast.success(`Added ${newSub.name}`);
  };

  const handleRemoveSubject = (id: string) => {
    setSubjectsList(subjectsList.filter((s) => s.id !== id));
  };

  // Project Helpers
  const handleAddProject = () => {
    if (!newProjTitle.trim()) {
      toast.error('Project title is required');
      return;
    }
    const newProj: PortfolioProject = {
      id: `proj_${Date.now()}`,
      title: newProjTitle.trim(),
      description: newProjDesc.trim() || 'Practical software implementation.',
      technologies: newProjTech.split(',').map((t) => t.trim()).filter(Boolean),
      status: 'IN_PROGRESS',
      repository_url: newProjRepo.trim() || undefined,
    };
    setProjectsList([...projectsList, newProj]);
    setNewProjTitle('');
    setNewProjDesc('');
    setNewProjTech('');
    setNewProjRepo('');
    toast.success('Project added to portfolio');
  };

  const handleRemoveProject = (id: string) => {
    setProjectsList(projectsList.filter((p) => p.id !== id));
  };

  const currentStep = ONBOARDING_5_STEPS[currentStepIndex];
  const progressPercent = Math.round(((currentStepIndex + 1) / ONBOARDING_5_STEPS.length) * 100);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="h-12 w-12 rounded-2xl border-4 border-blue-600 border-t-transparent animate-spin mb-4" />
        <h3 className="text-base font-bold text-slate-800">Loading Student Onboarding Workspace...</h3>
        <p className="text-xs text-slate-500 mt-1">Retrieving verified academic curriculum & profile data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100/70 pb-16">
      {/* Top Header & Sticky Stepper Navigation */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                  Step {currentStep.number} of 5
                </span>
                <span className="text-xs font-semibold text-slate-400">•</span>
                <span className="text-xs font-semibold text-slate-600">{progressPercent}% Completed</span>
              </div>
              <h1 className="text-sm font-bold text-slate-900 truncate max-w-xs sm:max-w-md">
                {currentStep.label}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => persistStep(currentStepIndex, false).then((ok) => ok && toast.success('Draft saved!'))}
              disabled={saving}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
            >
              <Save className="h-3.5 w-3.5 text-slate-500" />
              Save Draft
            </button>

            <button
              type="button"
              onClick={() => onNavigate('/dashboard')}
              className="text-xs font-semibold text-slate-600 hover:text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-all cursor-pointer"
              title="Finish onboarding later from Profile Settings"
            >
              Save & Continue Later
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1 bg-slate-100">
          <div
            className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Step Pills Bar */}
        <div className="max-w-6xl mx-auto px-4 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar text-xs">
          {ONBOARDING_5_STEPS.map((s, idx) => {
            const isCurrent = idx === currentStepIndex;
            const isDone = completedSteps.has(idx);
            const isSkip = skippedSteps.has(idx);

            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setCurrentStepIndex(idx)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full whitespace-nowrap font-medium transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-blue-600 text-white shadow-xs font-bold'
                    : isDone
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                    : isSkip
                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                }`}
              >
                {isDone ? (
                  <Check className="h-3 w-3 text-emerald-600" />
                ) : (
                  <span className={`text-[10px] font-bold ${isCurrent ? 'text-blue-100' : 'text-slate-500'}`}>
                    {s.number}
                  </span>
                )}
                <span>{s.shortTitle}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 pt-8">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          {/* Header of Active Step */}
          <div className="flex items-start justify-between pb-6 mb-6 border-b border-slate-100">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <currentStep.icon className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">{currentStep.label}</h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 pl-11">{currentStep.description}</p>
            </div>

            {currentStep.isOptional && (
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                Optional
              </span>
            )}
          </div>

          {/* =============================================================== */}
          {/* STEP 1: ACCOUNT REGISTRATION AND IDENTITY */}
          {/* =============================================================== */}
          {currentStepIndex === 0 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Full Legal Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Aarav Sharma"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Academic Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@btech.edu"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-24"
                      required
                    />
                    <div className="absolute right-2.5 top-2.5 flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Verified
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Preferred Display Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Aarav"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Name Pronunciation (Optional)
                  </label>
                  <input
                    type="text"
                    value={namePronunciation}
                    onChange={(e) => setNamePronunciation(e.target.value)}
                    placeholder="e.g. AH-rahv SHAR-mah"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Avatar Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2">
                  Profile Photograph / Avatar
                </label>
                <div className="flex items-center gap-4">
                  <img
                    src={avatarUrl}
                    alt="Current Avatar"
                    className="h-16 w-16 rounded-2xl object-cover ring-4 ring-blue-500 shadow-md shrink-0"
                    onError={(e) => {
                      (e.target as any).src = PRESET_AVATARS[0];
                    }}
                  />
                  <div className="space-y-1.5 flex-1">
                    <p className="text-xs text-slate-600 font-medium">Select from curated avatars:</p>
                    <div className="flex items-center gap-2">
                      {PRESET_AVATARS.map((av, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setAvatarUrl(av)}
                          className={`h-9 w-9 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                            avatarUrl === av ? 'border-blue-600 scale-105 shadow-xs' : 'border-slate-200 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img src={av} alt={`Avatar ${idx + 1}`} className="h-full w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Password & Authentication Section */}
              {!student ? (
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <span>Create Account Password</span>
                      <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] text-slate-500 font-medium">Minimum 8 characters</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-slate-800">
                          Password <span className="text-rose-500">*</span>
                        </label>
                        {password.length > 0 && (
                          <span
                            className={`text-[10px] font-bold ${
                              password.length < 8 ? 'text-amber-600' : 'text-emerald-600'
                            }`}
                          >
                            {password.length < 8 ? 'Too short' : 'Strong'}
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-slate-800">
                          Confirm Password <span className="text-rose-500">*</span>
                        </label>
                        {confirmPassword.length > 0 && (
                          <span
                            className={`text-[10px] font-bold flex items-center gap-0.5 ${
                              password === confirmPassword ? 'text-emerald-600' : 'text-rose-600'
                            }`}
                          >
                            {password === confirmPassword ? '✓ Match' : 'Mismatch'}
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 pr-10"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Logged in as <strong>{student.name}</strong> ({student.email})</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Account Verified
                  </span>
                </div>
              )}

              {/* Location & Timezone Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Country</label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">City / Region</label>
                  <input
                    type="text"
                    value={cityName}
                    onChange={(e) => setCityName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Timezone</label>
                  <input
                    type="text"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Short Bio */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Short Student Biography (Optional)
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="e.g. 3rd-year B.Tech CSE student passionate about Operating Systems, distributed databases, and high-performance algorithms."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Pre-B.Tech Academic Heritage */}
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700">
                    <School className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Pre-B.Tech Academic Heritage</h3>
                    <p className="text-xs text-slate-500">
                      Your high school, board marks, and entrance exam credentials help Arya tailor foundational depth.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* 10th Board & Marks */}
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <GraduationCap className="h-3.5 w-3.5 text-blue-600" />
                      Class 10th (Secondary School)
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600">Board / Council</label>
                        <select
                          value={tenthBoard}
                          onChange={(e) => setTenthBoard(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                        >
                          <option value="State Board (SSC)">State Board (SSC)</option>
                          <option value="CBSE">CBSE Board</option>
                          <option value="ICSE">ICSE Board</option>
                          <option value="IGCSE / International">IGCSE / International</option>
                          <option value="Other">Other Board</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600">Marks / CGPA (%)</label>
                        <input
                          type="text"
                          value={tenthPercentage}
                          onChange={(e) => setTenthPercentage(e.target.value)}
                          placeholder="e.g. 88.5"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 12th / Intermediate / Diploma */}
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Award className="h-3.5 w-3.5 text-purple-600" />
                      Class 12th / Intermediate / Diploma
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600">Qualification</label>
                        <select
                          value={twelfthOrDiploma}
                          onChange={(e) => setTwelfthOrDiploma(e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs bg-white truncate"
                        >
                          <option value="12th Intermediate / Jr College">12th Intermediate</option>
                          <option value="CBSE 12th Senior Secondary">CBSE 12th</option>
                          <option value="ISC 12th">ISC 12th</option>
                          <option value="Polytechnic Diploma (Lateral Entry)">Polytechnic Diploma</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600">Percentage (%)</label>
                        <input
                          type="text"
                          value={twelfthPercentage}
                          onChange={(e) => setTwelfthPercentage(e.target.value)}
                          placeholder="e.g. 91.2"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600">Stream / Major</label>
                      <input
                        type="text"
                        value={twelfthStream}
                        onChange={(e) => setTwelfthStream(e.target.value)}
                        placeholder="e.g. MPC (Maths, Physics, Chemistry) or Diploma CSE"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Entrance Exam Credentials */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Target className="h-3.5 w-3.5 text-rose-600" />
                      Engineering Entrance Examination Performance
                    </span>
                    <span className="text-[11px] text-slate-500">Helps calibrate mathematical rigour</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600">Examination Name</label>
                      <select
                        value={entranceExamName}
                        onChange={(e) => setEntranceExamName(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                      >
                        <option value="TS EAMCET">TS EAMCET (Telangana State)</option>
                        <option value="AP EAMCET">AP EAPCET (Andhra Pradesh)</option>
                        <option value="JEE Main">JEE Main</option>
                        <option value="JEE Advanced">JEE Advanced</option>
                        <option value="KCET">KCET (Karnataka)</option>
                        <option value="COMEDK">COMEDK UGET</option>
                        <option value="MHT-CET">MHT-CET (Maharashtra)</option>
                        <option value="WBJEE">WBJEE (West Bengal)</option>
                        <option value="Direct / Merit / Management">Direct / Merit Admission</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600">State / All-India Rank or Score</label>
                      <input
                        type="text"
                        value={entranceExamRank}
                        onChange={(e) => setEntranceExamRank(e.target.value)}
                        placeholder="e.g. 14250 or 94.5 Percentile"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Socio-Economic, Family Context & Financial Urgency */}
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
                    <Heart className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Socio-Economic & Family Financial Context</h3>
                    <p className="text-xs text-slate-500">
                      We personalize your learning journey to your lived reality and urgent family milestones.
                    </p>
                  </div>
                </div>

                {/* First-Gen Engineer and Education Loan Toggles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setFirstGenerationEngineer(!firstGenerationEngineer)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                      firstGenerationEngineer ? 'border-emerald-500 bg-emerald-50/60 shadow-xs' : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className={`mt-0.5 h-4 w-4 rounded border flex items-center justify-center shrink-0 ${
                      firstGenerationEngineer ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'
                    }`}>
                      {firstGenerationEngineer && <Check className="h-3 w-3 stroke-[3]" />}
                    </div>
                    <div className="text-xs">
                      <p className="font-bold text-slate-900">First-Generation Engineer in Family</p>
                      <p className="text-slate-500 text-[11px] mt-0.5 leading-relaxed">
                        Enables extra gentle, analogy-driven explanations and demystifies industry jargon.
                      </p>
                    </div>
                  </div>

                  <div
                    onClick={() => setEducationLoanActive(!educationLoanActive)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                      educationLoanActive ? 'border-amber-500 bg-amber-50/60 shadow-xs' : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className={`mt-0.5 h-4 w-4 rounded border flex items-center justify-center shrink-0 ${
                      educationLoanActive ? 'bg-amber-600 border-amber-600 text-white' : 'border-slate-300 bg-white'
                    }`}>
                      {educationLoanActive && <Check className="h-3 w-3 stroke-[3]" />}
                    </div>
                    <div className="text-xs">
                      <p className="font-bold text-slate-900">Active Education Loan to Repay</p>
                      <p className="text-slate-500 text-[11px] mt-0.5 leading-relaxed">
                        Prioritizes paid internship prep and placement packages to accelerate financial relief.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Financial Urgency Cards */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-800">
                    Career Urgency & Placement Financial Priority <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {[
                      {
                        id: 'IMMEDIATE_JOB_CRITICAL',
                        title: 'Immediate Job Critical',
                        desc: 'Must secure an offer immediately upon or before graduation to support family/pay loan.',
                        badge: 'High Placement Intensity',
                      },
                      {
                        id: 'PREFER_JOB_SOON',
                        title: 'Prefer Job Soon',
                        desc: 'Targeting a strong tech campus placement offer in final year with high package.',
                        badge: 'Balanced SDE Track',
                      },
                      {
                        id: 'BALANCED_EXPLORATION',
                        title: 'Balanced Exploration',
                        desc: 'Comfortable exploring open source, internships, and startup opportunities.',
                        badge: 'Exploratory Track',
                      },
                      {
                        id: 'INVESTING_IN_HIGHER_STUDIES',
                        title: 'Investing in Higher Studies',
                        desc: 'Planning GATE for IIT/PSU or MS abroad; focus is deep concepts & academic score.',
                        badge: 'Research & Exam Track',
                      },
                    ].map((item) => {
                      const isSelected = financialUrgency === item.id;
                      return (
                        <div
                          key={item.id}
                          onClick={() => setFinancialUrgency(item.id as any)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50/70 shadow-xs ring-1 ring-blue-500'
                              : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-bold text-slate-900">{item.title}</span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                              }`}>
                                {item.badge}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 leading-relaxed">{item.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Family Context Note */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Family & Personal Context (Optional)
                  </label>
                  <input
                    type="text"
                    value={familyContextNote}
                    onChange={(e) => setFamilyContextNote(e.target.value)}
                    placeholder="e.g. Rural background in Warangal; parents are farmers; aiming to join an IT company."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* STEP 2: ACADEMIC PROFILE AND SEMESTER INFORMATION */}
          {/* =============================================================== */}
          {currentStepIndex === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Institution / University Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="e.g. National Institute of Technology (NIT)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Engineering Branch / Department <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    placeholder="e.g. Computer Science & Engineering (CSE)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Degree / Qualification</label>
                  <select
                    value={degree}
                    onChange={(e) => setDegree(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="B.Tech">B.Tech (Bachelor of Technology)</option>
                    <option value="B.E.">B.E. (Bachelor of Engineering)</option>
                    <option value="M.Tech">M.Tech (Master of Technology)</option>
                    <option value="B.Sc">B.Sc Computer Science</option>
                    <option value="BCA">BCA (Computer Applications)</option>
                    <option value="Other">Other Engineering Program</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">Current Year</label>
                    <select
                      value={currentYear}
                      onChange={(e) => setCurrentYear(Number(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm bg-white"
                    >
                      <option value={1}>1st Year</option>
                      <option value={2}>2nd Year</option>
                      <option value={3}>3rd Year</option>
                      <option value={4}>4th Year</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">Current Semester</label>
                    <select
                      value={currentSemester}
                      onChange={(e) => setCurrentSemester(Number(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm bg-white font-bold text-blue-600"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                        <option key={s} value={s}>Semester {s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Current CGPA (Optional)</label>
                  <input
                    type="text"
                    value={cgpa}
                    onChange={(e) => setCgpa(e.target.value)}
                    placeholder="8.50"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Expected Graduation Year</label>
                  <input
                    type="number"
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
              </div>

              {/* Semester Subjects Section */}
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <BookOpen className="h-4 w-4 text-blue-600" />
                      <span>Semester {currentSemester} Subjects & Syllabus</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Add the courses you are currently attending to synchronize study materials and exam trackers.
                    </p>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                    {subjectsList.length} Subjects
                  </span>
                </div>

                {/* Add subject form */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={newSubName}
                    onChange={(e) => setNewSubName(e.target.value)}
                    placeholder="Subject Name (e.g. Distributed Systems)"
                    className="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                  />
                  <input
                    type="text"
                    value={newSubCode}
                    onChange={(e) => setNewSubCode(e.target.value)}
                    placeholder="Code (e.g. CS601)"
                    className="w-28 px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                  />
                  <select
                    value={newSubType}
                    onChange={(e) => setNewSubType(e.target.value as any)}
                    className="w-28 px-2 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                  >
                    <option value="THEORY">Theory</option>
                    <option value="LAB">Lab</option>
                    <option value="PROJECT">Project</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleAddSubject}
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-1 cursor-pointer shrink-0"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add</span>
                  </button>
                </div>

                {/* Subjects List */}
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {subjectsList.map((sub) => (
                    <div
                      key={sub.id}
                      className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-3 shadow-2xs hover:border-blue-200 transition-all"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`p-1.5 rounded-lg ${sub.subject_type === 'LAB' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'}`}>
                          <BookOpen className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">{sub.name}</p>
                          <p className="text-[11px] text-slate-500">{sub.code || 'No Code'} • {sub.credits || 4} Credits • {sub.subject_type}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveSubject(sub.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition-colors cursor-pointer"
                        title="Remove Subject"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Subject Strengths & AI Remedial Interventions */}
                <div className="pt-4 border-t border-slate-100 space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-teal-50 text-teal-700">
                      <Brain className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Subject Strengths & Remedial AI Interventions</h3>
                      <p className="text-xs text-slate-500">
                        Tag subjects you love vs subjects where you struggle, so Arya can proactively scaffold conceptual guidance.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Favorite / Strong Subjects */}
                    <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          Favorite / Strong Subjects
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          {favoriteSubjects.length} Added
                        </span>
                      </div>
                      <p className="text-[11px] text-emerald-800">
                        Subjects where you grasp concepts quickly and want advanced problem challenges.
                      </p>

                      {/* Chips */}
                      <div className="flex flex-wrap gap-1.5 min-h-[32px]">
                        {favoriteSubjects.map((sub) => (
                          <span
                            key={sub}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-emerald-300 text-xs font-semibold text-emerald-900 shadow-2xs"
                          >
                            <span>{sub}</span>
                            <button
                              type="button"
                              onClick={() => setFavoriteSubjects(favoriteSubjects.filter((s) => s !== sub))}
                              className="text-emerald-500 hover:text-rose-600 cursor-pointer"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>

                      {/* Add input */}
                      <div className="flex gap-1.5 pt-1">
                        <input
                          type="text"
                          value={newFavSub}
                          onChange={(e) => setNewFavSub(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (newFavSub.trim() && !favoriteSubjects.includes(newFavSub.trim())) {
                                setFavoriteSubjects([...favoriteSubjects, newFavSub.trim()]);
                                setNewFavSub('');
                              }
                            }
                          }}
                          placeholder="Add favorite subject..."
                          className="flex-1 px-2.5 py-1.5 rounded-lg border border-emerald-300 text-xs bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (newFavSub.trim() && !favoriteSubjects.includes(newFavSub.trim())) {
                              setFavoriteSubjects([...favoriteSubjects, newFavSub.trim()]);
                              setNewFavSub('');
                            }
                          }}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 cursor-pointer"
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    {/* Challenging Subjects */}
                    <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/40 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                          <AlertCircle className="h-4 w-4 text-rose-600" />
                          Challenging Subjects (AI Tutor Needed)
                        </span>
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                          {challengingSubjects.length} Flagged
                        </span>
                      </div>
                      <p className="text-[11px] text-rose-800">
                        Arya will schedule visual concept breakdowns, remedial flashcards, and slip test drills for these.
                      </p>

                      {/* Chips */}
                      <div className="flex flex-wrap gap-1.5 min-h-[32px]">
                        {challengingSubjects.map((sub) => (
                          <span
                            key={sub}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-rose-300 text-xs font-semibold text-rose-900 shadow-2xs"
                          >
                            <span>{sub}</span>
                            <button
                              type="button"
                              onClick={() => setChallengingSubjects(challengingSubjects.filter((s) => s !== sub))}
                              className="text-rose-500 hover:text-rose-700 cursor-pointer"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>

                      {/* Add input */}
                      <div className="flex gap-1.5 pt-1">
                        <input
                          type="text"
                          value={newChalSub}
                          onChange={(e) => setNewChalSub(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (newChalSub.trim() && !challengingSubjects.includes(newChalSub.trim())) {
                                setChallengingSubjects([...challengingSubjects, newChalSub.trim()]);
                                setNewChalSub('');
                              }
                            }
                          }}
                          placeholder="Add challenging subject..."
                          className="flex-1 px-2.5 py-1.5 rounded-lg border border-rose-300 text-xs bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (newChalSub.trim() && !challengingSubjects.includes(newChalSub.trim())) {
                              setChallengingSubjects([...challengingSubjects, newChalSub.trim()]);
                              setNewChalSub('');
                            }
                          }}
                          className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 cursor-pointer"
                        >
                          Flag
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* STEP 3: SKILLS, INTERESTS, PROJECTS, AND CAREER GOALS */}
          {/* =============================================================== */}
          {currentStepIndex === 2 && (
            <div className="space-y-6">
              {/* Primary Career Track Selection */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-purple-50 text-purple-700">
                    <Compass className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Primary Career Ambition & Engineering Track</h3>
                    <p className="text-xs text-slate-500">
                      Select your primary ambition so Arya configures your coding sandboxes, mock interviews, and study paths.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      id: 'CAMPUS_PLACEMENT',
                      title: 'Campus Placements',
                      subtitle: 'SDE, Product, Core IT',
                      icon: Briefcase,
                      badge: 'High Demand',
                    },
                    {
                      id: 'HIGHER_STUDIES_GATE',
                      title: 'GATE (M.Tech / PSUs)',
                      subtitle: 'IITs, IISc, NITs, IOCL/ISRO',
                      icon: GraduationCap,
                      badge: 'Academic Rigor',
                    },
                    {
                      id: 'HIGHER_STUDIES_ABROAD',
                      title: 'MS Abroad',
                      subtitle: 'US, Germany, Europe (GRE/IELTS)',
                      icon: Globe,
                      badge: 'Global Research',
                    },
                    {
                      id: 'GOVERNMENT_EXAMS',
                      title: 'Govt & Engineering Services',
                      subtitle: 'ESE, ISRO, DRDO, State PSC',
                      icon: ShieldCheck,
                      badge: 'Govt & Defense',
                    },
                    {
                      id: 'STARTUP_FOUNDER',
                      title: 'Startup & Venture Founder',
                      subtitle: 'Building MVP, Tech Entrepreneur',
                      icon: Zap,
                      badge: 'Innovation',
                    },
                  ].map((track) => {
                    const isSelected = primaryCareerTrack === track.id;
                    const Icon = track.icon;
                    return (
                      <div
                        key={track.id}
                        onClick={() => setPrimaryCareerTrack(track.id as any)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'border-purple-600 bg-purple-50/70 shadow-xs ring-1 ring-purple-500'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className={`p-2 rounded-lg ${isSelected ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isSelected ? 'bg-purple-200 text-purple-900 font-extrabold' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {track.badge}
                          </span>
                        </div>
                        <div className="mt-2.5">
                          <p className="text-xs font-bold text-slate-900">{track.title}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">{track.subtitle}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Target Exam / Milestone Goals */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Specific Milestone or Exam Target (Optional)
                  </label>
                  <input
                    type="text"
                    value={targetExamGoals}
                    onChange={(e) => setTargetExamGoals(e.target.value)}
                    placeholder="e.g. Target campus offer with 14+ LPA or GATE CS AIR < 300"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Target Job Role & Career Direction */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Primary Target Job Role <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={targetJobRole}
                    onChange={(e) => setTargetJobRole(e.target.value)}
                    placeholder="e.g. Software Development Engineer (SDE)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Target Companies (Comma-separated)</label>
                  <input
                    type="text"
                    value={targetCompanies}
                    onChange={(e) => setTargetCompanies(e.target.value)}
                    placeholder="Google, Microsoft, Amazon, Atlassian"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Technical Skills & Self-Reported Proficiency */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800">
                    Technical Skills & Self-Reported Proficiency
                  </label>
                  <span className="text-[11px] text-slate-500">Tap to toggle Beginner / Intermediate / Advanced</span>
                </div>

                {/* Skill Filter Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
                  {['All', 'Languages', 'Frontend', 'Backend', 'Databases', 'CS Fundamentals', 'AI & ML'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSkillCategoryFilter(cat)}
                      className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer ${
                        skillCategoryFilter === cat ? 'bg-blue-600 text-white font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Skills Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto p-1">
                  {skillsList
                    .filter((s) => skillCategoryFilter === 'All' || s.skill_category === skillCategoryFilter)
                    .map((s, idx) => {
                      const nextLevel =
                        s.self_reported_level === 'BEGINNER'
                          ? 'INTERMEDIATE'
                          : s.self_reported_level === 'INTERMEDIATE'
                          ? 'ADVANCED'
                          : 'BEGINNER';

                      return (
                        <div
                          key={s.skill_name}
                          onClick={() => {
                            const updated = [...skillsList];
                            const found = updated.find((item) => item.skill_name === s.skill_name);
                            if (found) found.self_reported_level = nextLevel;
                            setSkillsList(updated);
                          }}
                          className={`p-2.5 rounded-xl border transition-all cursor-pointer select-none flex flex-col justify-between ${
                            s.self_reported_level === 'ADVANCED'
                              ? 'border-purple-300 bg-purple-50/60'
                              : s.self_reported_level === 'INTERMEDIATE'
                              ? 'border-blue-300 bg-blue-50/60'
                              : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                        >
                          <span className="text-xs font-bold text-slate-900 truncate">{s.skill_name}</span>
                          <span className={`text-[10px] font-bold mt-1 px-1.5 py-0.5 rounded-md inline-block w-fit ${
                            s.self_reported_level === 'ADVANCED'
                              ? 'bg-purple-200/70 text-purple-800'
                              : s.self_reported_level === 'INTERMEDIATE'
                              ? 'bg-blue-200/70 text-blue-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {s.self_reported_level}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Projects & Practical Builds */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Layers className="h-4 w-4 text-blue-600" />
                    <span>Portfolio Projects & Builds (Optional)</span>
                  </h3>
                  <span className="text-xs font-bold text-slate-500">{projectsList.length} Saved</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={newProjTitle}
                      onChange={(e) => setNewProjTitle(e.target.value)}
                      placeholder="Project Title (e.g. Distributed Task Queue)"
                      className="px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                    />
                    <input
                      type="text"
                      value={newProjTech}
                      onChange={(e) => setNewProjTech(e.target.value)}
                      placeholder="Technologies (e.g. Go, Redis, Docker)"
                      className="px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                    />
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={newProjRepo}
                      onChange={(e) => setNewProjRepo(e.target.value)}
                      placeholder="Repository URL (e.g. https://github.com/...)"
                      className="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddProject}
                      className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add Project</span>
                    </button>
                  </div>
                </div>

                {/* Saved Projects list */}
                {projectsList.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900">{p.title}</p>
                      <p className="text-[11px] text-slate-500">
                        {p.technologies?.join(', ')} {p.repository_url && `• ${p.repository_url}`}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveProject(p.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Prior Achievements & Hackathon Wins */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-amber-50 text-amber-700">
                      <Award className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Achievements, Hackathons & Honors (Optional)</h3>
                      <p className="text-xs text-slate-500">
                        Record hackathon wins, competitive programming ranks, paper presentations, and certifications.
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-500">{achievementsList.length} Saved</span>
                </div>

                {/* Chips */}
                <div className="flex flex-wrap gap-2">
                  {achievementsList.map((ach, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50/80 border border-amber-300 text-xs font-semibold text-amber-950 shadow-2xs"
                    >
                      <Award className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                      <span>{ach}</span>
                      <button
                        type="button"
                        onClick={() => setAchievementsList(achievementsList.filter((_, i) => i !== idx))}
                        className="text-amber-600 hover:text-rose-600 cursor-pointer ml-1 text-sm font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                {/* Add input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newAchievement}
                    onChange={(e) => setNewAchievement(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (newAchievement.trim() && !achievementsList.includes(newAchievement.trim())) {
                          setAchievementsList([...achievementsList, newAchievement.trim()]);
                          setNewAchievement('');
                        }
                      }
                    }}
                    placeholder="e.g. SIH 2024 College Winner, LeetCode Knight, NPTEL Elite Python"
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newAchievement.trim() && !achievementsList.includes(newAchievement.trim())) {
                        setAchievementsList([...achievementsList, newAchievement.trim()]);
                        setNewAchievement('');
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 cursor-pointer shrink-0"
                  >
                    Add Honor
                  </button>
                </div>
              </div>

              {/* External Profile Links */}
              <div className="pt-4 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-800 mb-2">
                  External Coding & Career Profile Links (Optional)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600">GitHub Profile URL</label>
                    <input
                      type="url"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder="https://github.com/username"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600">LinkedIn Profile URL</label>
                    <input
                      type="url"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      placeholder="https://linkedin.com/in/username"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600">LeetCode Profile URL</label>
                    <input
                      type="url"
                      value={leetcodeUrl}
                      onChange={(e) => setLeetcodeUrl(e.target.value)}
                      placeholder="https://leetcode.com/u/username"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600">Portfolio Website URL</label>
                    <input
                      type="url"
                      value={portfolioUrl}
                      onChange={(e) => setPortfolioUrl(e.target.value)}
                      placeholder="https://myportfolio.dev"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* STEP 4: LEARNING PREFERENCES AND STUDY SCHEDULE */}
          {/* =============================================================== */}
          {currentStepIndex === 3 && (
            <div className="space-y-6">
              {/* Learning Pace & Concept Velocity */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-blue-50 text-blue-700">
                    <Zap className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Learning Pace & Concept Velocity</h3>
                    <p className="text-xs text-slate-500">
                      Controls how quickly Arya delivers conceptual milestones and hints.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      id: 'FAST_PACED',
                      title: 'Fast-Paced (Speed Runner)',
                      desc: 'Concise bullet points, rapid code drills, minimal conceptual preamble.',
                      badge: 'High Velocity',
                    },
                    {
                      id: 'STEADY_BALANCED',
                      title: 'Steady & Balanced',
                      desc: 'Standard degree curriculum progression, balanced theory + labs, weekly active revisions.',
                      badge: 'Curriculum Standard',
                    },
                    {
                      id: 'FOUNDATIONAL_STEP_BY_STEP',
                      title: 'Foundational Step-by-Step',
                      desc: 'Deep ELI5 intuitions, prerequisite scaffolding, relatable analogies, patient guidance.',
                      badge: 'Deep Mastery',
                    },
                  ].map((p) => {
                    const isSelected = learningPace === p.id;
                    return (
                      <div
                        key={p.id}
                        onClick={() => setLearningPace(p.id as any)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/70 shadow-xs ring-1 ring-blue-500'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-slate-900">{p.title}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {p.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 leading-relaxed">{p.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Explanation Style & Depth */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    AI Tutor Explanation Style
                  </label>
                  <select
                    value={explanationStyle}
                    onChange={(e) => setExplanationStyle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white"
                  >
                    <option value="Practical examples with code walkthroughs">Practical examples with code walkthroughs</option>
                    <option value="Step-by-step mathematical & conceptual proofs">Step-by-step mathematical & conceptual proofs</option>
                    <option value="Simplified conceptual analogies (Feynman style)">Simplified conceptual analogies (Feynman style)</option>
                    <option value="Interview-focused optimal complexity breakdowns">Interview-focused optimal complexity breakdowns</option>
                    <option value="Exam-oriented 10-mark structured answers">Exam-oriented 10-mark structured answers</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Explanation Depth & Response Detail
                  </label>
                  <div className="grid grid-cols-3 gap-2 pt-0.5">
                    {(['CONCISE', 'BALANCED', 'DETAILED'] as const).map((dp) => (
                      <button
                        key={dp}
                        type="button"
                        onClick={() => setExplanationDepth(dp)}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                          explanationDepth === dp
                            ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-2xs'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        {dp}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Study Availability & Hours */}
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span>Study Schedule & Availability Target</span>
                </h3>

                {/* Available Days Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Available Days for Structured Learning
                  </label>
                  <div className="flex items-center gap-2">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
                      const selected = availableDays.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => {
                            if (selected) {
                              setAvailableDays(availableDays.filter((d) => d !== day));
                            } else {
                              setAvailableDays([...availableDays, day]);
                            }
                          }}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                            selected
                              ? 'bg-blue-600 text-white shadow-2xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sliders Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                    <div className="flex justify-between text-xs font-bold text-slate-800 mb-1">
                      <span>Daily Weekday Study Target:</span>
                      <span className="text-blue-600 font-extrabold">{dailyHours} Hours/Day</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={8}
                      step={0.5}
                      value={dailyHours}
                      onChange={(e) => setDailyHours(parseFloat(e.target.value))}
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                    <div className="flex justify-between text-xs font-bold text-slate-800 mb-1">
                      <span>Weekend Study Target:</span>
                      <span className="text-indigo-600 font-extrabold">{weekendHours} Hours/Day</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      step={0.5}
                      value={weekendHours}
                      onChange={(e) => setWeekendHours(parseFloat(e.target.value))}
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Personalization & Reminder Toggles */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <h3 className="text-sm font-bold text-slate-900">Personalization & Automated Reminders</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableAiRecommendations}
                      onChange={(e) => setEnableAiRecommendations(e.target.checked)}
                      className="h-4 w-4 rounded-md accent-blue-600"
                    />
                    <div className="text-xs">
                      <p className="font-bold text-slate-800">Adaptive AI Recommendations</p>
                      <p className="text-slate-500">Allow tutor to suggest next lessons based on activity.</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableStudyReminders}
                      onChange={(e) => setEnableStudyReminders(e.target.checked)}
                      className="h-4 w-4 rounded-md accent-blue-600"
                    />
                    <div className="text-xs">
                      <p className="font-bold text-slate-800">Daily Study Reminders</p>
                      <p className="text-slate-500">Receive in-app alerts for scheduled study sessions.</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* STEP 5: REVIEW, PRIVACY, AND COMPLETE SETUP */}
          {/* =============================================================== */}
          {currentStepIndex === 4 && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 text-blue-900 flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold text-sm text-blue-950">Almost ready to launch your workspace!</p>
                  <p className="mt-0.5 text-blue-800">
                    Review your trained AI companion, academic heritage, and career roadmap below before finalizing.
                  </p>
                </div>
              </div>

              {/* Dedicated Trained AI Companion Showcase Card */}
              <div className="p-5 rounded-2xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50/80 via-white to-blue-50/60 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-indigo-100">
                  <div className="flex items-center gap-3">
                    <img
                      src={avatarUrl}
                      alt={personaCompanionName}
                      className="h-12 w-12 rounded-2xl object-cover ring-2 ring-indigo-500 shadow-xs"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold text-indigo-950">
                          {personaCompanionName}
                        </span>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-600 text-white uppercase tracking-wider">
                          Dedicated AI Companion
                        </span>
                      </div>
                      <p className="text-xs text-indigo-800 mt-0.5">
                        Trained on your B.Tech {branch} syllabus, entrance rank, and {primaryCareerTrack.replace(/_/g, ' ')} vector.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={synthesizingPersona}
                    onClick={async () => {
                      try {
                        setSynthesizingPersona(true);
                        const p = await onboardingApi.regenerateAIPersona({
                          agent_companion_name: personaCompanionName,
                          pedagogical_tone: personaTone,
                        });
                        setAiPersona(p);
                        toast.success('✨ AI Companion model blueprint refreshed with latest profile!');
                      } catch {
                        toast.error('Could not refresh companion persona');
                      } finally {
                        setSynthesizingPersona(false);
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-300 bg-white text-xs font-bold text-indigo-700 hover:bg-indigo-50 transition-all cursor-pointer shadow-2xs self-start sm:self-center"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${synthesizingPersona ? 'animate-spin' : ''}`} />
                    <span>{synthesizingPersona ? 'Training...' : 'Re-synthesize Persona'}</span>
                  </button>
                </div>

                {/* Companion Name and Tone controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-indigo-950 mb-1">
                      Companion Name
                    </label>
                    <input
                      type="text"
                      value={personaCompanionName}
                      onChange={(e) => setPersonaCompanionName(e.target.value)}
                      placeholder="Arya"
                      className="w-full px-3 py-2 rounded-xl border border-indigo-200 text-xs bg-white font-bold text-indigo-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-indigo-950 mb-1">
                      Pedagogical Tone
                    </label>
                    <select
                      value={personaTone}
                      onChange={(e) => setPersonaTone(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-indigo-200 text-xs bg-white font-semibold text-indigo-900"
                    >
                      <option value="PATIENT_FOUNDATIONAL">Patient & Foundational (Analogies, ELI5)</option>
                      <option value="PRACTICAL_INDUSTRY_FIRST">Practical & Industry-First (Clean Code, System Design)</option>
                      <option value="EXAM_ORIENTED_RIGOROUS">Exam-Oriented Rigorous (Scoring, GATE/Internal Accuracy)</option>
                      <option value="SOCRATIC_ENCOURAGING">Socratic & Encouraging (Inquiry & Challenge Driven)</option>
                    </select>
                  </div>
                </div>

                {/* Directives Preview */}
                <div className="p-3 rounded-xl bg-white/90 border border-indigo-100 space-y-1.5">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                    Synthesized Prompt Directives:
                  </span>
                  <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">
                    <li>Deliver explanations tuned to <strong>{branch}</strong> at a <strong>{learningPace.replace(/_/g, ' ')}</strong> pace.</li>
                    {firstGenerationEngineer && (
                      <li><strong className="text-emerald-700">First-gen engineer:</strong> Use compassionate real-world analogies; demystify corporate tech jargon.</li>
                    )}
                    {financialUrgency === 'IMMEDIATE_JOB_CRITICAL' && (
                      <li><strong className="text-rose-700">High financial urgency:</strong> Prioritize placement-grade problem solving and high-frequency interview patterns.</li>
                    )}
                    {challengingSubjects.length > 0 && (
                      <li><strong className="text-amber-700">AI Remedial Focus:</strong> Reinforce foundational concepts for {challengingSubjects.join(', ')}.</li>
                    )}
                    <li>Support multi-modal guidance in <strong>{preferredExplanationLanguage}</strong> with interactive code sandboxes.</li>
                  </ul>
                </div>

                {/* Knowledge Graph summary capsule */}
                <div className="flex items-center gap-2 text-[11px] text-indigo-900 font-mono bg-indigo-100/60 p-2 rounded-lg border border-indigo-200 truncate">
                  <Brain className="h-3.5 w-3.5 shrink-0 text-indigo-700" />
                  <span className="truncate">
                    Knowledge Graph: {degree} {branch} · 10th: {tenthPercentage}% · 12th: {twelfthPercentage}% · Entrance: {entranceExamName} #{entranceExamRank} · Track: {primaryCareerTrack}
                  </span>
                </div>
              </div>

              {/* 4 Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Summary Card 1: Account & Heritage */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 relative shadow-2xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <User className="h-4 w-4 text-blue-600" />
                      1. Account & Academic Heritage
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentStepIndex(0)}
                      className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                    >
                      Edit Step 1
                    </button>
                  </div>
                  <div className="text-xs space-y-1 text-slate-600">
                    <p><strong className="text-slate-900">Name:</strong> {fullName} ({displayName || 'Student'})</p>
                    <p><strong className="text-slate-900">Email:</strong> {email}</p>
                    <p><strong className="text-slate-900">10th:</strong> {tenthPercentage}% ({tenthBoard})</p>
                    <p><strong className="text-slate-900">12th/Diploma:</strong> {twelfthPercentage}% ({twelfthStream})</p>
                    <p><strong className="text-slate-900">Entrance:</strong> {entranceExamName} #{entranceExamRank}</p>
                    <p>
                      <strong className="text-slate-900">Context:</strong>{' '}
                      {firstGenerationEngineer ? 'First-Gen Engineer · ' : ''}
                      {financialUrgency.replace(/_/g, ' ')}
                    </p>
                  </div>
                </div>

                {/* Summary Card 2: Academic & Subjects */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 relative shadow-2xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <GraduationCap className="h-4 w-4 text-indigo-600" />
                      2. Academic Profile & Focus
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentStepIndex(1)}
                      className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                    >
                      Edit Step 2
                    </button>
                  </div>
                  <div className="text-xs space-y-1 text-slate-600">
                    <p><strong className="text-slate-900">Program:</strong> {degree} · {branch}</p>
                    <p><strong className="text-slate-900">Institution:</strong> {institution}</p>
                    <p><strong className="text-slate-900">Current Semester:</strong> Sem {currentSemester} (Year {currentYear})</p>
                    <p><strong className="text-slate-900">Enrolled Courses:</strong> {subjectsList.length} subjects</p>
                    <p><strong className="text-slate-900">Strengths:</strong> {favoriteSubjects.join(', ') || 'None specified'}</p>
                    <p><strong className="text-slate-900 text-rose-700">AI Remedial:</strong> {challengingSubjects.join(', ') || 'None specified'}</p>
                  </div>
                </div>

                {/* Summary Card 3: Skills & Career Goals */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 relative shadow-2xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Code2 className="h-4 w-4 text-purple-600" />
                      3. Career Track & Skills
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentStepIndex(2)}
                      className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                    >
                      Edit Step 3
                    </button>
                  </div>
                  <div className="text-xs space-y-1 text-slate-600">
                    <p><strong className="text-slate-900">Career Track:</strong> {primaryCareerTrack.replace(/_/g, ' ')}</p>
                    <p><strong className="text-slate-900">Target Role:</strong> {targetJobRole}</p>
                    <p><strong className="text-slate-900">Companies:</strong> {targetCompanies || 'Open to Tech'}</p>
                    <p><strong className="text-slate-900">Milestone:</strong> {targetExamGoals || 'High SGPA & Placement'}</p>
                    <p><strong className="text-slate-900">Portfolio & Honors:</strong> {projectsList.length} builds · {achievementsList.length} honors</p>
                  </div>
                </div>

                {/* Summary Card 4: Learning Preferences & Pace */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 relative shadow-2xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Sliders className="h-4 w-4 text-teal-600" />
                      4. Learning Preferences & Pace
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentStepIndex(3)}
                      className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                    >
                      Edit Step 4
                    </button>
                  </div>
                  <div className="text-xs space-y-1 text-slate-600">
                    <p><strong className="text-slate-900">Learning Pace:</strong> {learningPace.replace(/_/g, ' ')}</p>
                    <p><strong className="text-slate-900">Companion Tone:</strong> {personaTone.replace(/_/g, ' ')}</p>
                    <p><strong className="text-slate-900">Daily Target:</strong> {dailyHours} Hours/Day</p>
                    <p><strong className="text-slate-900">Study Days:</strong> {availableDays.join(', ')}</p>
                    <p><strong className="text-slate-900">Language:</strong> {preferredExplanationLanguage}</p>
                  </div>
                </div>
              </div>

              {/* Privacy, Consent & Agreements */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <h3 className="text-xs font-bold text-slate-900">Privacy, Terms & Learning Consent</h3>
                <div className="space-y-2 text-xs">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consentTerms}
                      onChange={(e) => setConsentTerms(e.target.checked)}
                      className="h-4 w-4 mt-0.5 rounded-md accent-blue-600"
                    />
                    <span className="text-slate-700">
                      I accept the <strong className="text-slate-900">Terms of Service</strong> and <strong className="text-slate-900">Privacy Policy</strong>. (Required)
                    </span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consentPersonalization}
                      onChange={(e) => setConsentPersonalization(e.target.checked)}
                      className="h-4 w-4 mt-0.5 rounded-md accent-blue-600"
                    />
                    <span className="text-slate-700">
                      Allow AI tutors to adapt explanations to my branch, semester, and target career goals.
                    </span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consentReminders}
                      onChange={(e) => setConsentReminders(e.target.checked)}
                      className="h-4 w-4 mt-0.5 rounded-md accent-blue-600"
                    />
                    <span className="text-slate-700">
                      Enable in-app study task deadlines and exam schedule alerts.
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Stepper Navigation Footer Buttons */}
          <div className="pt-8 mt-8 border-t border-slate-100 flex items-center justify-between gap-4">
            <div>
              {currentStepIndex > 0 ? (
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={saving}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Previous</span>
                </button>
              ) : (
                <div className="text-xs text-slate-600">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => onNavigate('/login')}
                    className="font-bold text-blue-600 hover:underline cursor-pointer"
                  >
                    Sign In
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {currentStep.isOptional && currentStepIndex < 4 && (
                <button
                  type="button"
                  onClick={handleSkip}
                  disabled={saving}
                  className="px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  Skip Step
                </button>
              )}

              {currentStepIndex < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>
                    {currentStepIndex === 0
                      ? !student
                        ? 'Create Account & Continue to Academic Profile (Step 2)'
                        : 'Continue to Academic Profile (Step 2)'
                      : currentStepIndex === 1
                      ? 'Save & Continue to Skills & Career (Step 3)'
                      : currentStepIndex === 2
                      ? 'Save & Continue to Learning Preferences (Step 4)'
                      : 'Save & Continue to Final Review (Step 5)'}
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleFinishOnboarding}
                  disabled={saving}
                  className="px-7 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white text-xs font-extrabold shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Complete Registration & Launch Workspace</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
