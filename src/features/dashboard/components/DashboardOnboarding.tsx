import * as React from 'react';
import { Sparkles, BookOpen, User, HelpCircle, Bot, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';

export function DashboardOnboarding({
  studentName = 'Student',
  onNavigate,
}: {
  studentName?: string;
  onNavigate: (path: string) => void;
}) {
  const steps = [
    {
      num: 1,
      title: 'Explore & Enroll in Courses',
      desc: 'Select your semester syllabus subjects (DAA, Operating Systems, AI, DBMS).',
      action: 'Explore Courses',
      path: '/courses',
      icon: BookOpen,
      completed: false,
    },
    {
      num: 2,
      title: 'Complete Onboarding Setup',
      desc: 'Configure syllabus, internal exams, learning style, and career targets.',
      action: 'Start Wizard',
      path: '/onboarding',
      icon: User,
      completed: false,
    },
    {
      num: 3,
      title: 'Take Diagnostic Assessment',
      desc: 'Identify your immediate strengths and target remedial study areas.',
      action: 'Take Assessment',
      path: '/quiz',
      icon: HelpCircle,
      completed: false,
    },
    {
      num: 4,
      title: 'Consult the AI Learning Agent',
      desc: 'Ask your first engineering question or request a personalized study roadmap.',
      action: 'Launch AI Agent',
      path: '/ai-agent',
      icon: Bot,
      completed: false,
    },
  ];

  return (
    <Card className="border border-slate-200 bg-white p-6 sm:p-8 space-y-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold border border-blue-200">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Welcome Onboarding</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Welcome to your NEXORA AI, {studentName}!
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            Your personal learning command center is ready. Follow these initial steps to calibrate your curriculum roadmap and AI tutor.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button variant="primary" size="sm" onClick={() => onNavigate('/courses')} className="gap-1.5">
            <BookOpen className="h-3.5 w-3.5" />
            <span>Explore Courses</span>
          </Button>
          <Button variant="ai" size="sm" onClick={() => onNavigate('/ai-agent')} className="gap-1.5">
            <Bot className="h-3.5 w-3.5" />
            <span>Ask AI</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {steps.map((st) => {
          const Icon = st.icon;
          return (
            <div
              key={st.num}
              onClick={() => onNavigate(st.path)}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-600 transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 font-bold text-xs shrink-0">
                  {st.num}
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {st.title}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{st.desc}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs font-semibold text-blue-600">
                <span>{st.action}</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
