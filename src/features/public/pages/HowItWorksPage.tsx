import * as React from 'react';
import {
  Sparkles,
  ArrowRight,
  UserCheck,
  GraduationCap,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  Sliders,
  LayoutDashboard,
  BrainCircuit,
  Terminal,
  TrendingUp,
  Clock,
  Briefcase,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { PublicLayout } from '../components/PublicLayout';

interface HowItWorksPageProps {
  onNavigate: (path: string) => void;
}

export function HowItWorksPage({ onNavigate }: HowItWorksPageProps) {
  const steps = [
    {
      num: '01',
      title: 'Create an Account',
      desc: 'Register using your academic email and a secure password. The system immediately sets up your secure, isolated student workspace with zero administrative surveillance.',
      icon: UserCheck,
      badge: 'Account Setup',
    },
    {
      num: '02',
      title: 'Complete the Student Profile',
      desc: 'Add your degree (B.Tech), college or university name, department, roll number / registration ID, and admission year. This establishes your academic identity.',
      icon: GraduationCap,
      badge: 'Academic Identity',
    },
    {
      num: '03',
      title: 'Add Educational Information',
      desc: 'Specify your engineering branch (AI/ML, CSE, Data Science, ECE, EEE, Mechanical, Civil, IT) and current academic year. Historical CGPA and credits can be optionally tracked.',
      icon: BookOpen,
      badge: 'Branch & Year',
    },
    {
      num: '04',
      title: 'Configure Current Semester and Subjects',
      desc: 'Select your current semester (Semester 1 through 8). Enroll in your theoretical subjects, elective modules, and mandatory practical laboratory courses.',
      icon: CalendarCheck,
      badge: 'Semester Mapping',
    },
    {
      num: '05',
      title: 'Add or Confirm the Syllabus',
      desc: 'Upload your official university syllabus PDF or let the system auto-generate the standard regulation curriculum. Units, subtopics, and credit distributions are indexed into your knowledge base.',
      icon: CheckCircle2,
      badge: 'Syllabus Deconstruction',
    },
    {
      num: '06',
      title: 'Set Learning Preferences and Goals',
      desc: 'Define your preferred explanation depth (Socratic, deep-dive, or quick overview), daily study hours, exam target (9.0+ SGPA), and target career role (e.g., SDE, AI Engineer).',
      icon: Sliders,
      badge: 'Personalization Engine',
    },
    {
      num: '07',
      title: 'Use the Personalized Dashboard',
      desc: 'Your dashboard automatically derives Today’s Plan, active course progress, upcoming slip test dates, and personalized recommendations uniquely matching your branch and semester.',
      icon: LayoutDashboard,
      badge: 'Central Command',
    },
    {
      num: '08',
      title: 'Study with the AI Tutor',
      desc: 'Ask questions, clarify complex mathematical formulas with KaTeX, and debug code snippets. The AI Tutor leverages your active semester syllabus context for laser-targeted explanations.',
      icon: BrainCircuit,
      badge: '24/7 Academic Tutor',
    },
    {
      num: '09',
      title: 'Practise Using Quizzes and Laboratories',
      desc: 'Complete topic-based quizzes, solve coding challenges in the multi-language execution sandbox, visualize DSA algorithms step-by-step, and test relational queries in the SQL Lab.',
      icon: Terminal,
      badge: 'Hands-on Execution',
    },
    {
      num: '10',
      title: 'Review Progress',
      desc: 'Access the Unified Progress dashboard to observe verified mastery across courses, DSA topics, coding problems, and quiz attempts without fabricated scores or misleading metrics.',
      icon: TrendingUp,
      badge: 'Unified Mastery',
    },
    {
      num: '11',
      title: 'Adjust the Study Plan',
      desc: 'Life as an engineering student is dynamic. Reschedule incomplete tasks, pause goals during college fests or internal exams, and let the Study Planner rebalance your weekly timeline.',
      icon: Clock,
      badge: 'Dynamic Scheduling',
    },
    {
      num: '12',
      title: 'Explore Projects and Career Preparation',
      desc: 'Connect your GitHub repository to showcase engineering projects, generate ATS-friendly resumes tailored to specific roles, and practice AI-powered simulated mock technical and HR interviews.',
      icon: Briefcase,
      badge: 'Placement & Career',
    },
  ];

  return (
    <PublicLayout currentPath="/how-it-works" onNavigate={onNavigate}>
      {/* Header */}
      <section className="bg-white border-b border-slate-200 py-14 sm:py-20 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-blue-600 text-xs font-semibold mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            <span>The Complete 12-Step Architecture</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
            How the Platform Works
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Follow the exact workflow from initial onboarding through semester mastery, practical laboratories, and tier-1 career placement.
          </p>
        </div>
      </section>

      {/* 12 Steps List */}
      <section className="py-16 sm:py-24 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs hover:border-blue-300 transition-all flex flex-col sm:flex-row gap-6 items-start"
                >
                  {/* Step Badge */}
                  <div className="flex sm:flex-col items-center gap-3 shrink-0">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-md">
                      {step.num}
                    </div>
                    <div className="p-2 rounded-xl bg-blue-50 text-blue-600 hidden sm:flex">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>

                  {/* Step Content */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-900">
                        Step {idx + 1}: {step.title}
                      </h3>
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                        {step.badge}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Action */}
          <div className="mt-16 text-center bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
              Begin Your Personalized Learning Journey Today
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
              No generic courses, no mock data, no administrative surveillance. Just pure engineering excellence tailored to your syllabus.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                onClick={() => onNavigate('/register')}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-8 py-3.5 rounded-xl shadow-md cursor-pointer"
              >
                Create Account & Start Step 1
              </Button>
              <Button
                variant="outline"
                onClick={() => onNavigate('/login')}
                className="w-full sm:w-auto border-slate-300 text-slate-700 font-semibold text-xs px-6 py-3.5 rounded-xl cursor-pointer"
              >
                Sign In to Existing Account
              </Button>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
