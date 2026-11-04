import * as React from 'react';
import {
  Sparkles,
  ArrowRight,
  BookOpen,
  Code2,
  Database,
  Cpu,
  Layers,
  GraduationCap,
  Briefcase,
  CheckCircle2,
  BrainCircuit,
  Terminal,
  CalendarCheck,
  FolderGit2,
  Users2,
  HelpCircle,
  ChevronDown,
  ShieldAlert,
  Target,
  Zap,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { PublicLayout } from '../components/PublicLayout';

interface HomePageProps {
  onNavigate: (path: string) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const [activeFaq, setActiveFaq] = React.useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const coreProblems = [
    {
      problem: 'Information Overload & Outdated Syllabi',
      solution: 'Automated Syllabus Parsing & Structured Unit Mastery',
      description:
        'Instead of drowning in fragmented textbook PDFs and obsolete question papers, our engine parses your exact university syllabus into actionable units, topics, and verified learning milestones.',
      icon: BookOpen,
      accent: 'from-blue-500/10 to-indigo-500/10 text-[#2563EB]',
    },
    {
      problem: 'Theory Without Practical Application',
      solution: 'In-Browser Execution Sandboxes & Visualizers',
      description:
        'Bridge the gap between theoretical rote memorization and genuine engineering ability with our isolated Coding Lab, 20+ DSA Algorithm Visualizers, safe SQL Workbenches, and AI/ML model trainers.',
      icon: Terminal,
      accent: 'from-emerald-500/10 to-teal-500/10 text-emerald-600',
    },
    {
      problem: 'Exam Panic & Rushed Last-Minute Cramming',
      solution: 'Semester Command Center & Spaced Revision',
      description:
        'Track internal assessments, slip tests, and end-semester examinations with automated daily study tasks, algorithm-backed spaced repetition flashcards, and syllabus-targeted practice quizzes.',
      icon: CalendarCheck,
      accent: 'from-amber-500/10 to-orange-500/10 text-amber-600',
    },
    {
      problem: 'Generic Career Roadmaps & Placement Disconnect',
      solution: 'Branch-Specific Career Tracks & Mock Interviews',
      description:
        'Receive concrete placement roadmaps aligned with your branch (AI/ML, CSE, ECE, Data Science), practice AI mock technical interviews, build verified engineering projects, and generate tailored ATS resumes.',
      icon: Briefcase,
      accent: 'from-purple-500/10 to-pink-500/10 text-purple-600',
    },
  ];

  const agentGroups = [
    {
      title: 'Academic Intelligence Agents',
      subtitle: 'Curriculum & Semester Mastery',
      agents: [
        'Semester Agent: Manages university regulation schemes, credits, and subject catalogs.',
        'Syllabus Agent: Deconstructs uploaded syllabus PDFs into structured units & topics.',
        'Study Planner Agent: Generates dynamic daily & weekly study agendas based on student availability.',
        'Exam Prep Agent: Formulates slip test, midterm, and end-sem revision priorities.',
      ],
      icon: GraduationCap,
      color: 'border-blue-200 bg-blue-50/50 text-[#2563EB]',
    },
    {
      title: 'Practical Laboratory Agents',
      subtitle: 'Code, DSA, SQL & AI Experimentation',
      agents: [
        'Coding Agent: Provides intelligent code walkthroughs and debugging suggestions.',
        'DSA Agent: Guides step-by-step through algorithmic complexity and edge cases.',
        'SQL Agent: Explains relational query execution plans and database normalization.',
        'ML Agent: Inspects datasets, assists feature engineering, and interprets loss curves.',
      ],
      icon: Code2,
      color: 'border-emerald-200 bg-emerald-50/50 text-emerald-700',
    },
    {
      title: 'Knowledge & Doubt Agents',
      subtitle: '24/7 Context-Aware AI Tutoring',
      agents: [
        'Tutor Agent: Contextualized Socratic explanations aligned with your current semester.',
        'Doubt Solver Agent: Instant resolution of complex mathematical and engineering queries.',
        'Document RAG Agent: Semantic vector search over lecture notes, textbooks, and lab manuals.',
      ],
      icon: BrainCircuit,
      color: 'border-indigo-200 bg-indigo-50/50 text-indigo-700',
    },
    {
      title: 'Career & Placement Agents',
      subtitle: 'Industry Readiness & Portfolio Building',
      agents: [
        'Resume Agent: Analyzes engineering projects and crafts high-scoring ATS resumes.',
        'Placement Agent: Curates company-specific quantitative, verbal, and technical problem sets.',
        'Interview Agent: Conducts live simulated voice/chat technical and HR mock interviews.',
      ],
      icon: Target,
      color: 'border-purple-200 bg-purple-50/50 text-purple-700',
    },
  ];

  const labs = [
    {
      name: 'Coding Lab',
      desc: 'Isolated, secure multi-language execution sandbox supporting Python, JavaScript, TypeScript, C++, and Java with real test-case runners.',
      icon: Terminal,
      badge: 'Multi-Language Sandbox',
    },
    {
      name: 'DSA Lab',
      desc: 'Interactive step-by-step visualizers for Binary Trees, Graphs, Sorting, Dynamic Programming, and 200+ curated engineering problems.',
      icon: Layers,
      badge: 'Visualizers & Practice',
    },
    {
      name: 'SQL Lab',
      desc: 'In-browser relational database workbench with schema inspection, sample university schemas, and analytical query execution.',
      icon: Database,
      badge: 'Safe Database Sandbox',
    },
    {
      name: 'AI / ML Lab',
      desc: 'Practical machine learning workbench to load datasets, inspect distributions, preprocess data, train models, and evaluate metrics.',
      icon: Cpu,
      badge: 'Data Science & Training',
    },
    {
      name: 'System Design Lab',
      desc: 'Interactive architecture canvas to model microservices, caches, message queues, database sharding, and latency trade-offs.',
      icon: Zap,
      badge: 'Architecture & Scalability',
    },
    {
      name: 'Lab Assistant & Viva',
      desc: 'Step-by-step experiment theory, circuit and code guides, sample observations, and interactive AI viva examination simulator.',
      icon: HelpCircle,
      badge: 'Curriculum Lab Prep',
    },
  ];

  const faqs = [
    {
      q: 'Which B.Tech engineering branches are supported?',
      a: 'The platform uniquely supports Computer Science & Engineering (CSE), Artificial Intelligence & Machine Learning (AI/ML), Data Science & Analytics, Information Technology (IT), Electronics & Communication Engineering (ECE), Electrical & Electronics Engineering (EEE), Mechanical Engineering, Civil Engineering, and specialized interdisciplinary engineering tracks.',
    },
    {
      q: 'How does the platform personalize content for my semester?',
      a: 'Upon sign-up or profile setup, you provide your degree, branch, current semester (1 to 8), and institution. The system automatically initializes your branch curriculum with relevant subject units, topics, and assessment dates. Every module—from the Dashboard to the AI Tutor and Study Planner—tailors its recommendations strictly to your active academic profile.',
    },
    {
      q: 'Is code execution safe and isolated?',
      a: 'Yes. All student code and SQL queries run inside isolated execution environments with strict resource constraints (CPU limits, memory quotas, execution timeouts, and zero access to the production platform database). Your code runs safely without putting your workspace or server at risk.',
    },
    {
      q: 'How does the AI Tutor differ from generic ChatGPT?',
      a: 'Unlike generic chatbots that lack context, our AI Tutor is driven by the Centralized Student Context Engine. It knows your branch, current semester subjects, weak topics from recent quizzes, and target career role. It provides syllabus-grounded explanations, mathematical notation with KaTeX, and source references from your uploaded documents.',
    },
    {
      q: 'Can I upload my college syllabus and lecture notes?',
      a: 'Yes. The Documents Vault allows you to upload syllabus documents (PDF, DOCX, TXT) and lecture slides. The platform parses the document, extracts key units and topics, and allows you to chat with your documents using semantic vector retrieval (RAG), generate structured notes, or create flashcards.',
    },
    {
      q: 'Is there an administrator or faculty portal?',
      a: 'No. In strict accordance with our architectural philosophy, this platform is 100% student-centric. There are zero administrative platforms, faculty roles, or supervisory portals. Every capability exists exclusively to empower undergraduate engineering students to achieve academic and career excellence.',
    },
  ];

  return (
    <PublicLayout currentPath="/" onNavigate={onNavigate}>
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-blue-50/30 to-[#F7F9FC] pt-12 pb-20 sm:pt-16 sm:pb-28 border-b border-[#E4E7EC]">
        {/* Background glow effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-blue-400/10 via-indigo-400/10 to-transparent blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-[#2563EB] text-xs font-semibold mb-6 shadow-xs animate-fade-in">
            <Sparkles className="h-3.5 w-3.5" />
            <span>The Academic & Career Operating System for B.Tech Students</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#101828] max-w-4xl mx-auto leading-tight sm:leading-none">
            Master Your Engineering Curriculum. <br />
            <span className="bg-gradient-to-r from-[#2563EB] via-[#4F46E5] to-[#7C3AED] bg-clip-text text-transparent">
              Code Real Labs. Build Career Mastery.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-lg text-[#475467] max-w-2xl mx-auto leading-relaxed">
            Tailored directly to your degree, branch, semester, and university syllabus. Unified with intelligent
            multi-agent AI tutoring, isolated coding and SQL execution sandboxes, automated study planning, and placement preparation.
          </p>

          {/* Primary Call to Action */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={() => onNavigate('/register')}
              className="w-full sm:w-auto bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-sm px-8 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Get Started Free</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => onNavigate('/how-it-works')}
              className="w-full sm:w-auto border-slate-300 hover:bg-slate-100 text-[#344054] font-semibold text-sm px-6 py-3.5 rounded-xl cursor-pointer"
            >
              See How It Works (12 Steps)
            </Button>
            <Button
              variant="ghost"
              onClick={() => onNavigate('/login')}
              className="w-full sm:w-auto text-[#2563EB] hover:text-[#1D4ED8] hover:bg-blue-50 font-semibold text-sm px-4 py-3.5 rounded-xl cursor-pointer"
            >
              Already Registered? Sign In
            </Button>
          </div>

          {/* Key Trust Signals */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs font-medium text-[#475467]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Supports 8+ Engineering Branches</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Safe In-Browser Execution Sandboxes</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Contextualized AI Multi-Agent System</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Zero Fabrication & 100% Student-Only</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Engineering Problems & Solutions Grid */}
      <section className="py-16 sm:py-24 bg-white border-b border-[#E4E7EC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">
              Built for Engineering Students
            </h2>
            <p className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-[#101828]">
              Solving the 4 Critical Challenges in Engineering Education
            </p>
            <p className="mt-3 text-sm text-[#475467]">
              Undergraduate engineering is rigorous and demanding. Here is how our purpose-built platform empowers your success.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {coreProblems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="p-6 sm:p-8 rounded-2xl border border-[#E4E7EC] bg-[#F7F9FC] hover:bg-white hover:shadow-md transition-all space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-red-50 text-red-600 border border-red-200">
                      Problem: {item.problem}
                    </span>
                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${item.accent}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-[#101828] flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                    <span>{item.solution}</span>
                  </h3>
                  <p className="text-sm text-[#475467] leading-relaxed">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Multi-Agent Orchestration Architecture Showcase */}
      <section className="py-16 sm:py-24 bg-[#F7F9FC] border-b border-[#E4E7EC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#4F46E5]">
              Intelligent Multi-Agent System
            </h2>
            <p className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-[#101828]">
              Coordinated Specialized AI Agents for Every Academic Need
            </p>
            <p className="mt-3 text-sm text-[#475467]">
              Instead of disconnected generic chatbots, our platform coordinates specialized autonomous agents orchestrated through a centralized Tool Registry and Student Context Engine.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {agentGroups.map((group, idx) => {
              const Icon = group.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-6 border border-[#E4E7EC] shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 border ${group.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-base text-[#101828]">{group.title}</h3>
                    <p className="text-xs font-medium text-[#667085] mb-4">{group.subtitle}</p>
                    <ul className="space-y-2 text-xs text-[#475467]">
                      {group.agents.map((agent, aIdx) => (
                        <li key={aIdx} className="flex items-start gap-1.5 leading-snug">
                          <span className="text-[#2563EB] font-bold mt-0.5">•</span>
                          <span>{agent}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Practical Laboratories Grid */}
      <section className="py-16 sm:py-24 bg-white border-b border-[#E4E7EC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Hands-on Engineering
            </h2>
            <p className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-[#101828]">
              Comprehensive Practical Laboratories
            </p>
            <p className="mt-3 text-sm text-[#475467]">
              From algorithms to distributed systems, experience active learning directly inside the browser with secure execution sandboxes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {labs.map((lab, idx) => {
              const Icon = lab.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl border border-[#E4E7EC] bg-slate-50/50 hover:bg-white hover:border-blue-200 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 rounded-xl bg-blue-50 text-[#2563EB]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-[#475467] border border-slate-200">
                      {lab.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#101828] mb-1.5">{lab.name}</h3>
                  <p className="text-xs text-[#475467] leading-relaxed">{lab.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. 12-Step Student Workflow Banner */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-[#0B1530] via-[#101828] to-[#1E293B] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xs font-bold uppercase tracking-wider text-blue-400">
            Structured Academic Success
          </h2>
          <p className="mt-2 text-2xl sm:text-4xl font-extrabold tracking-tight">
            The Complete 12-Step Student Journey
          </p>
          <p className="mt-3 text-sm text-slate-300 max-w-2xl mx-auto">
            From onboarding and syllabus configuration to interactive labs, exam excellence, and placement readiness.
          </p>

          <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-left">
            {[
              { step: '01', title: 'Register Account', desc: 'Secure student sign up' },
              { step: '02', title: 'Profile Setup', desc: 'Degree, branch, & roll no.' },
              { step: '03', title: 'Semester Config', desc: 'Active semester & year' },
              { step: '04', title: 'Subject Enrollment', desc: 'Core & elective courses' },
              { step: '05', title: 'Syllabus Parsing', desc: 'Units, topics, & dates' },
              { step: '06', title: 'Study Preferences', desc: 'Style, depth, & availability' },
              { step: '07', title: 'Dynamic Dashboard', desc: "Personalized today's plan" },
              { step: '08', title: 'AI Tutor Guidance', desc: 'Syllabus-grounded doubts' },
              { step: '09', title: 'Practice & Labs', desc: 'Coding, DSA, SQL & Quiz' },
              { step: '10', title: 'Unified Progress', desc: 'Verified mastery metrics' },
              { step: '11', title: 'Study Planner', desc: 'Dynamic schedule tuning' },
              { step: '12', title: 'Career & Placement', desc: 'Projects, resume & mocks' },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 hover:border-blue-400 transition-colors"
              >
                <span className="text-xs font-black text-blue-400 tracking-wider">
                  STEP {item.step}
                </span>
                <h4 className="font-bold text-xs text-white mt-1.5">{item.title}</h4>
                <p className="text-[11px] text-slate-400 mt-1">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-10">
            <Button
              onClick={() => onNavigate('/how-it-works')}
              className="bg-white hover:bg-slate-100 text-[#0B1530] font-bold text-xs px-6 py-3 rounded-xl shadow-md cursor-pointer"
            >
              Read the Full 12-Step Implementation Guide
            </Button>
          </div>
        </div>
      </section>

      {/* 6. Frequently Asked Questions (FAQ) */}
      <section className="py-16 sm:py-24 bg-white border-b border-[#E4E7EC]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">
              Questions & Answers
            </h2>
            <p className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-[#101828]">
              Frequently Asked Questions
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className="border border-[#E4E7EC] rounded-2xl overflow-hidden transition-all bg-[#F7F9FC]"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between font-bold text-sm text-[#101828] hover:bg-slate-100/60 cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`h-4 w-4 text-[#667085] transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-[#2563EB]' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-4 pt-1 text-xs text-[#475467] leading-relaxed border-t border-slate-100 bg-white">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. Final Call to Action */}
      <section className="py-16 sm:py-20 bg-[#F7F9FC]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-3xl p-8 sm:p-12 text-white shadow-xl">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Ready to Transform Your B.Tech Journey?
            </h2>
            <p className="mt-3 text-sm sm:text-base text-blue-100 max-w-xl mx-auto">
              Join students mastering university examinations, building real engineering projects, and securing tier-1 tech placements.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                onClick={() => onNavigate('/register')}
                className="w-full sm:w-auto bg-white hover:bg-slate-100 text-[#2563EB] font-bold text-sm px-8 py-3.5 rounded-xl shadow-md cursor-pointer"
              >
                Create Your Free Student Account
              </Button>
              <Button
                variant="outline"
                onClick={() => onNavigate('/login')}
                className="w-full sm:w-auto border-white/40 text-white hover:bg-white/10 font-semibold text-sm px-6 py-3.5 rounded-xl cursor-pointer"
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
