import * as React from 'react';
import { Sparkles, Lock, Mail, ShieldAlert, ArrowRight, UserCheck } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { toast } from 'sonner';

export function LoginPage({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  const { login } = useAuth();
  const [activeTab, setActiveTab] = React.useState<'student' | 'admin'>('student');
  const [email, setEmail] = React.useState('student@btech.edu');
  const [password, setPassword] = React.useState('Password123!');
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const student = await login(email, password);
      toast.success(`Welcome back, ${student.name}!`);
      onLoginSuccess();
    } catch (err: any) {
      const msg = err.message || 'Authentication failed. Please check credentials.';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = (type: 'student' | 'admin') => {
    if (type === 'student') {
      setActiveTab('student');
      setEmail('student@btech.edu');
      setPassword('Password123!');
    } else {
      setActiveTab('admin');
      setEmail('admin@btech.edu');
      setPassword('AdminPassword123!');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#F7F9FC] px-4 py-12">
      {/* Brand Badge */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#2563EB] to-[#4F46E5] text-white shadow-md">
          <Sparkles className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#101828]">B.Tech AI Learning Platform</h1>
          <p className="text-xs text-[#667085]">Engineering Academic Workspace</p>
        </div>
      </div>

      {/* Login Card */}
      <Card className="w-full max-w-md shadow-lg border border-[#E4E7EC] bg-white">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-lg">Sign in to your account</CardTitle>
          <CardDescription>
            Enter your credentials to access your courses, AI agent, and lab environments.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Role selector tabs */}
          <div className="grid grid-cols-2 p-1 mb-5 rounded-lg bg-slate-100 text-xs font-medium">
            <button
              type="button"
              onClick={() => handleQuickDemo('student')}
              className={`py-1.5 rounded-md transition-all cursor-pointer ${
                activeTab === 'student' ? 'bg-white text-[#101828] shadow-2xs font-semibold' : 'text-[#667085]'
              }`}
            >
              B.Tech Student
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              className={`py-1.5 rounded-md transition-all cursor-pointer ${
                activeTab === 'admin' ? 'bg-white text-[#101828] shadow-2xs font-semibold' : 'text-[#667085]'
              }`}
            >
              Super Admin
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-lg border border-rose-200 bg-rose-50 text-xs text-rose-800">
                {errorMessage}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#344054]">Academic Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                icon={<Mail className="h-4 w-4" />}
                placeholder="student@btech.edu"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-[#344054]">Password</label>
                <span className="text-[11px] text-[#667085]">Demo: Password123!</span>
              </div>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                icon={<Lock className="h-4 w-4" />}
                placeholder="••••••••••••"
              />
            </div>

            <Button
              type="submit"
              variant={activeTab === 'admin' ? 'secondary' : 'ai'}
              className="w-full mt-2"
              isLoading={isLoading}
            >
              <span>{activeTab === 'admin' ? 'Sign in as Super Admin' : 'Sign in to Workspace'}</span>
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </form>

          {/* Quick Demo Pre-fill helpers */}
          <div className="mt-6 pt-5 border-t border-[#E4E7EC]">
            <div className="text-[11px] font-semibold text-[#667085] uppercase tracking-wider mb-2.5">
              One-Click Demo Credentials
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('student')}
                className="flex items-center justify-center gap-1.5 p-2 rounded-lg border border-[#E4E7EC] bg-slate-50 text-xs text-[#344054] hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <UserCheck className="h-3.5 w-3.5 text-[#2563EB]" />
                <span>Demo Student</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('admin')}
                className="flex items-center justify-center gap-1.5 p-2 rounded-lg border border-[#E4E7EC] bg-slate-50 text-xs text-[#344054] hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
                <span>Super Admin</span>
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      <p className="mt-6 text-xs text-[#667085] text-center">
        B.Tech AI Learning Platform · Phase 1 Technical Foundation
      </p>
    </div>
  );
}
