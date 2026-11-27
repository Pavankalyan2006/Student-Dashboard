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
import { motion } from 'motion/react';
import { EASE_OUT } from '../../../components/motion';
import { HeroPreview } from '../components/HeroPreview';

/** Each section below the hero rises in once as it scrolls into view. */
const REVEAL = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.65, ease: EASE_OUT },
} as const;

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
      accent: 'from-blue-500/10 to-indigo-500/10 text-blue-600',
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
      color: 'border-blue-200 bg-blue-50/50 text-blue-600',
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
      <section className="relative overflow-hidden border-b border-slate-200 pt-14 pb-20 sm:pt-20 sm:pb-28">
        {/* Aurora + fine grid backdrop */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-blue-500/25 via-violet-500/20 to-sky-400/20 blur-3xl animate-aurora" />
          <div className="absolute -left-24 top-40 h-72 w-72 rounded-full bg-violet-500/15 blur-3xl animate-float" />
          <div className="absolute -right-16 top-24 h-64 w-64 rounded-full bg-sky-400/15 blur-3xl animate-float [animation-delay:1.2s]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--grid-dot)_1px,transparent_1px),linear-gradient(to_bottom,var(--grid-dot)_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_30%,black,transparent)]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: EASE_OUT }}
            className="mb-7 inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-white/70 px-3.5 py-1.5 text-xs font-semibold text-blue-700 shadow-sm backdrop-blur"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
            </span>
            The Academic &amp; Career Operating System for B.Tech Students
          </motion.div>

          <h1 className="mx-auto max-w-5xl font-display text-[2.4rem] font-extrabold leading-[1.05] tracking-tight text-slate-900 sm:text-6xl lg:text-7xl">
            {['Master', 'Your', 'Engineering', 'Curriculum.'].map((w, i) => (
              <motion.span
                key={w}
                className="mr-[0.25em] inline-block"
                initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.08 * i }}
              >
                {w}
              </motion.span>
            ))}
            <br />
            <motion.span
              className="text-gradient inline-block bg-[length:200%_auto] animate-gradient-pan"
              initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.7, ease: EASE_OUT, delay: 0.4 }}
            >
              Code Real Labs. Build Career Mastery.
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6, ease: EASE_OUT }}
            className="mx-auto mt-7 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg"
          >
            Tailored directly to your degree, branch, semester, and university syllabus. Unified with intelligent
            multi-agent AI tutoring, isolated coding and SQL execution sandboxes, automated study planning, and placement preparation.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.72, ease: EASE_OUT }}
            className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4"
          >
            <button
              type="button"
              onClick={() => onNavigate('/register')}
              className="btn-shine group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-600/30 active:translate-y-0 sm:w-auto"
            >
              <span>Get Started Free</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
            <Button
              variant="outline"
              onClick={() => onNavigate('/how-it-works')}
              className="h-auto w-full rounded-xl px-6 py-3.5 text-sm font-semibold sm:w-auto"
            >
              See How It Works (12 Steps)
            </Button>
            <Button
              variant="ghost"
              onClick={() => onNavigate('/login')}
              className="h-auto w-full rounded-xl px-4 py-3.5 text-sm font-semibold text-blue-600 hover:bg-blue-50 hover:text-blue-700 sm:w-auto"
            >
              Already Registered? Sign In
            </Button>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.9 } } }}
            className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs font-medium text-slate-600"
          >
            {['Supports 8+ Engineering Branches', 'Safe In-Browser Execution Sandboxes', 'Contextualized AI Multi-Agent System', 'Zero Fabrication & 100% Student-Only'].map((t) => (
              <motion.div key={t} variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>{t}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* What the workspace looks like (an illustration, no real student data) */}
          <HeroPreview />
        </div>
      </section>

      {/* 2. Engineering Problems & Solutions Grid */}
      <motion.section {...REVEAL} className="py-16 sm:py-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Built for Engineering Students
            </h2>
            <p className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Solving the 4 Critical Challenges in Engineering Education
            </p>
            <p className="mt-3 text-sm text-slate-600">
              Undergraduate engineering is rigorous and demanding. Here is how our purpose-built platform empowers your success.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {coreProblems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="group space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:bg-white hover:shadow-xl sm:p-8"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-red-50 text-red-600 border border-red-200">
                      Problem: {item.problem}
                    </span>
                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${item.accent}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                    <span>{item.solution}</span>
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </motion.section>

      {/* 3. Multi-Agent Orchestration Architecture Showcase */}
      <motion.section {...REVEAL} className="py-16 sm:py-24 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Intelligent Multi-Agent System
            </h2>
            <p className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Coordinated Specialized AI Agents for Every Academic Need
            </p>
            <p className="mt-3 text-sm text-slate-600">
              Instead of disconnected generic chatbots, our platform coordinates specialized autonomous agents orchestrated through a centralized Tool Registry and Student Context Engine.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {agentGroups.map((group, idx) => {
              const Icon = group.icon;
              return (
                <div
                  key={idx}
                  className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-violet-200 hover:shadow-xl"
                >
                  <div>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 border ${group.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-base text-slate-900">{group.title}</h3>
                    <p className="text-xs font-medium text-slate-500 mb-4">{group.subtitle}</p>
                    <ul className="space-y-2 text-xs text-slate-600">
                      {group.agents.map((agent, aIdx) => (
                        <li key={aIdx} className="flex items-start gap-1.5 leading-snug">
                          <span className="text-blue-600 font-bold mt-0.5">•</span>
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
      </motion.section>

      {/* 4. Practical Laboratories Grid */}
      <motion.section {...REVEAL} className="py-16 sm:py-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Hands-on Engineering
            </h2>
            <p className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Comprehensive Practical Laboratories
            </p>
            <p className="mt-3 text-sm text-slate-600">
              From algorithms to distributed systems, experience active learning directly inside the browser with secure execution sandboxes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {labs.map((lab, idx) => {
              const Icon = lab.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-200 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                      {lab.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-1.5">{lab.name}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{lab.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </motion.section>

      {/* 5. 12-Step Student Workflow Banner */}
      <motion.section {...REVEAL} className="py-16 sm:py-24 bg-gradient-to-br from-navy-900 via-slate-900 to-slate-800 text-white">
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
              className="bg-white hover:bg-slate-100 text-navy-900 font-bold text-xs px-6 py-3 rounded-xl shadow-md cursor-pointer"
            >
              Read the Full 12-Step Implementation Guide
            </Button>
          </div>
        </div>
      </motion.section>

      {/* 6. Frequently Asked Questions (FAQ) */}
      <motion.section {...REVEAL} className="py-16 sm:py-24 bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Questions & Answers
            </h2>
            <p className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Frequently Asked Questions
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className="border border-slate-200 rounded-2xl overflow-hidden transition-all bg-slate-50"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between font-bold text-sm text-slate-900 hover:bg-slate-100/60 cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`h-4 w-4 text-slate-500 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-blue-600' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-white">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </motion.section>

      {/* 7. Final Call to Action */}
      <motion.section {...REVEAL} className="py-16 sm:py-20 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="hero-brand rounded-3xl p-8 sm:p-12 text-white">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Ready to Transform Your B.Tech Journey?
            </h2>
            <p className="mt-3 text-sm sm:text-base text-blue-100 max-w-xl mx-auto">
              Join students mastering university examinations, building real engineering projects, and securing tier-1 tech placements.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                onClick={() => onNavigate('/register')}
                className="w-full sm:w-auto bg-white hover:bg-slate-100 text-blue-600 font-bold text-sm px-8 py-3.5 rounded-xl shadow-md cursor-pointer"
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
      </motion.section>
    </PublicLayout>
  );
}
