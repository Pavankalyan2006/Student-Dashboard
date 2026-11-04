import * as React from 'react';
import {
  Sparkles,
  Lock,
  Mail,
  User,
  GraduationCap,
  Layers,
  Building,
  Calendar,
  ArrowRight,
  UserCheck,
  CheckCircle2,
  BookOpen,
  Eye,
  EyeOff,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { toast } from 'sonner';

const BRANCH_OPTIONS = [
  'Computer Science & Engineering (CSE)',
  'Artificial Intelligence & Machine Learning (AI/ML)',
  'Data Science & Analytics',
  'Information Technology (IT)',
  'Electronics & Communication Engineering (ECE)',
  'Electrical & Electronics Engineering (EEE)',
  'Mechanical Engineering',
  'Civil Engineering',
  'Chemical Engineering',
  'Other Engineering Branch',
];

const TARGET_ROLE_OPTIONS = [
  'Software Development Engineer (SDE)',
  'AI & Machine Learning Engineer',
  'Full Stack Web Developer',
  'Data Scientist / Analytics Engineer',
  'Cloud & DevOps Engineer',
  'Cybersecurity & Network Engineer',
  'Embedded Systems & IoT Engineer',
  'Core Engineering Specialist',
  'Research & Higher Academics',
];

const LEARNING_GOAL_OPTIONS = [
  'Semester Exam Excellence & High SGPA (9.0+)',
  'Tier-1 Product Company Placement (FAANG / Top Tech)',
  'Hands-on Real-world Full-Stack & AI Projects',
  'GATE / Higher Studies (MS / M.Tech / MBA)',
  'Competitive Programming & DSA Mastery',
];

export function LoginPage({
  onLoginSuccess,
  initialMode = 'signin',
  onNavigate,
}: {
  onLoginSuccess: (role?: string) => void;
  initialMode?: 'signin' | 'signup';
  onNavigate?: (path: string) => void;
}) {
  const { login, register } = useAuth();
  const [authMode, setAuthMode] = React.useState<'signin' | 'signup'>(initialMode);

  React.useEffect(() => {
    setAuthMode(initialMode);
  }, [initialMode]);

  // Sign In Form State
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showSignInPassword, setShowSignInPassword] = React.useState(false);

  // Sign Up Form State
  const [signupName, setSignupName] = React.useState('');
  const [signupDisplayName, setSignupDisplayName] = React.useState('');
  const [signupEmail, setSignupEmail] = React.useState('');
  const [signupPassword, setSignupPassword] = React.useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = React.useState('');
  const [showSignUpPassword, setShowSignUpPassword] = React.useState(false);
  const [showSignUpConfirmPassword, setShowSignUpConfirmPassword] = React.useState(false);
  const [signupAvatarUrl, setSignupAvatarUrl] = React.useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250');
  const [signupDegree, setSignupDegree] = React.useState('B.Tech');
  const [signupBranch, setSignupBranch] = React.useState(BRANCH_OPTIONS[0]);
  const [signupSemester, setSignupSemester] = React.useState('6');
  const [signupInstitution, setSignupInstitution] = React.useState('');
  const [signupRollNumber, setSignupRollNumber] = React.useState('');
  const [signupAdmissionYear, setSignupAdmissionYear] = React.useState(new Date().getFullYear() - 2);
  const [signupTargetRole, setSignupTargetRole] = React.useState(TARGET_ROLE_OPTIONS[0]);
  const [signupLearningGoal, setSignupLearningGoal] = React.useState(LEARNING_GOAL_OPTIONS[0]);

  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const PRESET_AVATARS = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250',
  ];

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const student = await login(email, password);
      toast.success(`Welcome back, ${student.name}!`);
      onLoginSuccess(student.role);
    } catch (err: any) {
      const msg = err.message || 'Authentication failed. Please check your credentials.';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const trimmedName = signupName.trim();
    if (!trimmedName || trimmedName.length < 2) {
      setErrorMessage('Please enter your full legal name');
      setIsLoading(false);
      return;
    }

    const trimmedEmail = signupEmail.trim().toLowerCase();
    if (!trimmedEmail || !trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      setErrorMessage('Please enter a valid academic email address');
      setIsLoading(false);
      return;
    }

    if (signupPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      setErrorMessage('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const student = await register({
        name: trimmedName,
        display_name: signupDisplayName.trim() || trimmedName.split(' ')[0],
        avatar_url: signupAvatarUrl,
        email: trimmedEmail,
        password: signupPassword,
      });

      toast.success(`🎉 Account created! Welcome, ${student.name}!`);
      // Direct new students straight to onboarding so they can customize academic profile, subjects & goals
      onLoginSuccess('STUDENT_NEW');
    } catch (err: any) {
      const msg = err.message || 'Registration failed. Please check your details.';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = () => {
    setAuthMode('signin');
    setEmail('student@btech.edu');
    setPassword('Password123!');
  };

  const handleQuickDemoSignIn = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const student = await login('student@btech.edu', 'Password123!');
      toast.success(`Welcome back, ${student.name}!`);
      onLoginSuccess(student.role);
    } catch (err: any) {
      const msg = err.message || 'Demo authentication failed';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#F7F9FC] px-4 py-12">
      {/* Return to Public Website */}
      {onNavigate && (
        <button
          onClick={() => onNavigate('/')}
          className="mb-4 text-xs font-semibold text-[#475467] hover:text-[#2563EB] flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <span>← Back to Public Website</span>
        </button>
      )}

      {/* Brand Header */}
      <div
        onClick={() => onNavigate && onNavigate('/')}
        className="flex items-center gap-3 mb-6 cursor-pointer"
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#4F46E5] text-white shadow-lg">
          <Sparkles className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#101828]">B.Tech AI Learning Platform</h1>
          <p className="text-xs text-[#667085]">Personalized Academic Operating System for Engineering Students</p>
        </div>
      </div>

      {/* Main Auth Card */}
      <Card className="w-full max-w-lg shadow-xl border border-[#E4E7EC] bg-white rounded-2xl">
        <CardHeader className="space-y-2 pb-4 pt-6 px-6 sm:px-8 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-[#101828]">
              {authMode === 'signin' ? 'Sign in to your Workspace' : 'Create your Student Workspace'}
            </CardTitle>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60">
              B.Tech Student
            </span>
          </div>
          <CardDescription className="text-xs text-[#667085]">
            {authMode === 'signin'
              ? 'Access your semester syllabus, AI Tutor, coding lab, and personalized study roadmaps.'
              : 'Enter your academic details to generate tailored courses, exam guides, and AI learning contexts.'}
          </CardDescription>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 mt-3 rounded-xl bg-slate-100/80 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setAuthMode('signin');
                setErrorMessage(null);
              }}
              className={`py-2 rounded-lg transition-all cursor-pointer text-center ${
                authMode === 'signin'
                  ? 'bg-white text-[#101828] shadow-sm font-bold'
                  : 'text-[#667085] hover:text-[#101828]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('signup');
                setErrorMessage(null);
              }}
              className={`py-2 rounded-lg transition-all cursor-pointer text-center ${
                authMode === 'signup'
                  ? 'bg-white text-[#101828] shadow-sm font-bold'
                  : 'text-[#667085] hover:text-[#101828]'
              }`}
            >
              Create Account (Sign Up)
            </button>
          </div>
        </CardHeader>

        <CardContent className="pt-6 px-6 sm:px-8 pb-6">
          {errorMessage && (
            <div className="p-3 mb-5 rounded-xl border border-rose-200 bg-rose-50 text-xs font-medium text-rose-800 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* ===================== SIGN IN MODE ===================== */}
          {authMode === 'signin' ? (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#344054]">Academic Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  icon={<Mail className="h-4 w-4 text-slate-400" />}
                  placeholder="student@btech.edu"
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#344054]">Password</label>
                  <span className="text-[11px] text-blue-600 hover:underline cursor-pointer">
                    Forgot password?
                  </span>
                </div>
                <div className="relative">
                  <Input
                    type={showSignInPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    icon={<Lock className="h-4 w-4 text-slate-400" />}
                    placeholder="••••••••••••"
                    className="rounded-xl pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignInPassword(!showSignInPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    aria-label={showSignInPassword ? 'Hide password' : 'Show password'}
                  >
                    {showSignInPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                variant="ai"
                className="w-full mt-3 py-2.5 rounded-xl font-bold text-xs"
                isLoading={isLoading}
              >
                <span>Enter Workspace</span>
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>

              {/* Quick Switch to Sign Up */}
              <div className="text-center pt-2">
                <span className="text-xs text-[#667085]">New student? </span>
                <button
                  type="button"
                  onClick={() => setAuthMode('signup')}
                  className="text-xs font-bold text-[#2563EB] hover:underline cursor-pointer"
                >
                  Create an account
                </button>
              </div>

              {/* Quick Demo Fill & 1-Click Access */}
              <div className="mt-5 pt-4 border-t border-[#E4E7EC] flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#667085]">Instant workspace exploration:</span>
                  <button
                    type="button"
                    onClick={handleQuickFill}
                    className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                  >
                    Auto-fill inputs
                  </button>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleQuickDemoSignIn}
                  disabled={isLoading}
                  className="w-full py-2 border-blue-200 bg-blue-50/60 hover:bg-blue-100 text-[#2563EB] text-xs font-bold rounded-xl gap-1.5 transition-colors cursor-pointer"
                >
                  <UserCheck className="h-4 w-4 text-[#2563EB]" />
                  <span>Explore Demo Student Workspace (1-Click)</span>
                </Button>
              </div>
            </form>
          ) : (
            /* ===================== SIGN UP MODE ===================== */
            <form onSubmit={handleSignUp} className="space-y-4">
              {/* Full Name & Display Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#344054]">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    required
                    icon={<User className="h-4 w-4 text-slate-400" />}
                    placeholder="e.g. Alex Chen"
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#344054]">
                    Preferred Display Name <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <Input
                    type="text"
                    value={signupDisplayName}
                    onChange={(e) => setSignupDisplayName(e.target.value)}
                    icon={<User className="h-4 w-4 text-slate-400" />}
                    placeholder="e.g. Alex"
                    className="rounded-xl"
                  />
                </div>
              </div>

              {/* Avatar Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#344054] flex items-center justify-between">
                  <span>Student Avatar / Photograph</span>
                  <span className="text-[11px] text-slate-400 font-normal">Select preset or paste URL</span>
                </label>
                <div className="flex items-center gap-3">
                  <img
                    src={signupAvatarUrl}
                    alt="Selected Avatar"
                    className="h-10 w-10 rounded-full object-cover ring-2 ring-blue-500 shadow-xs shrink-0"
                    onError={(e) => {
                      (e.target as any).src = PRESET_AVATARS[0];
                    }}
                  />
                  <div className="flex items-center gap-2">
                    {PRESET_AVATARS.map((av, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSignupAvatarUrl(av)}
                        className={`h-8 w-8 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                          signupAvatarUrl === av ? 'border-blue-600 scale-110 shadow-xs' : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={av} alt={`Preset ${idx + 1}`} className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Academic Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#344054]">
                  Academic Email <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  required
                  icon={<Mail className="h-4 w-4 text-slate-400" />}
                  placeholder="student@btech.edu"
                  className="rounded-xl"
                />
              </div>

              {/* Password & Confirm Password Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#344054]">
                      Password <span className="text-rose-500">*</span>
                    </label>
                    {signupPassword.length > 0 && (
                      <span className={`text-[10px] font-bold ${
                        signupPassword.length < 6 ? 'text-amber-600' : signupPassword.length >= 8 ? 'text-emerald-600' : 'text-blue-600'
                      }`}>
                        {signupPassword.length < 6 ? 'Too short' : signupPassword.length >= 8 ? 'Strong' : 'Fair'}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      type={showSignUpPassword ? 'text' : 'password'}
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      required
                      icon={<Lock className="h-4 w-4 text-slate-400" />}
                      placeholder="••••••••••••"
                      className="rounded-xl pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      aria-label={showSignUpPassword ? 'Hide password' : 'Show password'}
                    >
                      {showSignUpPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#344054]">
                      Confirm Password <span className="text-rose-500">*</span>
                    </label>
                    {signupConfirmPassword.length > 0 && (
                      <span className={`text-[10px] font-bold flex items-center gap-0.5 ${
                        signupPassword === signupConfirmPassword ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {signupPassword === signupConfirmPassword ? (
                          <>
                            <Check className="h-3 w-3" /> Match
                          </>
                        ) : (
                          'Mismatch'
                        )}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      type={showSignUpConfirmPassword ? 'text' : 'password'}
                      value={signupConfirmPassword}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                      required
                      icon={<Lock className="h-4 w-4 text-slate-400" />}
                      placeholder="••••••••••••"
                      className="rounded-xl pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignUpConfirmPassword(!showSignUpConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      aria-label={showSignUpConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showSignUpConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-blue-50/80 border border-blue-100 rounded-xl flex items-start gap-2.5 text-xs text-blue-900">
                <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  <strong>Step 1 of 5: Account Registration & Identity.</strong> Next, you'll configure your degree, semester subjects, self-assessed skills, and study schedule.
                </p>
              </div>

              <Button
                type="submit"
                variant="ai"
                className="w-full py-2.5 rounded-xl font-bold text-xs"
                isLoading={isLoading}
              >
                <span>Continue to Academic Profile (Step 2)</span>
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>

              <div className="text-center pt-1">
                <span className="text-xs text-[#667085]">Already registered? </span>
                <button
                  type="button"
                  onClick={() => setAuthMode('signin')}
                  className="text-xs font-bold text-[#2563EB] hover:underline cursor-pointer"
                >
                  Sign in to workspace
                </button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="mt-8 text-center text-xs text-[#667085] space-y-1">
        <p className="font-medium">B.Tech Student AI Learning Platform</p>
        <p className="text-[11px] text-slate-400">
          Personalized syllabus tracking, AI Tutor, DSA & Coding labs, Viva prep, and Career guidance.
        </p>
      </div>
    </div>
  );
}
