import * as React from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Target,
  GraduationCap,
  Layers,
  Cpu,
  BookOpen,
  Terminal,
  CheckCircle2,
  Code2,
  BrainCircuit,
  Lock,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { PublicLayout } from '../components/PublicLayout';

interface AboutPageProps {
  onNavigate: (path: string) => void;
}

export function AboutPage({ onNavigate }: AboutPageProps) {
  const designPrinciples = [
    {
      title: '1. Grounded in Real University Syllabi',
      desc: 'Engineering curricula differ across universities and regulations. Our platform anchors all notes, flashcards, exams, and tutor responses to your exact semester syllabus units, not generic internet summaries.',
      icon: BookOpen,
    },
    {
      title: '2. Learning by Doing, Not Rote Memorization',
      desc: 'True engineering capability comes from active coding, algorithm step-debugging, relational SQL queries, and architecture diagrams. We embed execution sandboxes directly into learning workflows.',
      icon: Code2,
    },
    {
      title: '3. Factual Rigor & Zero Hallucination',
      desc: 'We never fabricate mock scores, academic achievements, research citations, or job listings. Data is either verified against genuine records or labeled as diagnostic practice material.',
      icon: ShieldCheck,
    },
    {
      title: '4. Strict Student Isolation & Data Privacy',
      desc: 'Each student operates inside a completely private context. Uploaded lecture notes, question queries, and coding attempts remain strictly isolated with robust server-side ownership checks.',
      icon: Lock,
    },
    {
      title: '5. Accessible & High-Performance Design',
      desc: 'Built with modern design tokens, accessible components, clean typography, responsive layouts, and zero bloat so students can focus seamlessly on deep academic work.',
      icon: Sparkles,
    },
  ];

  const pillars = [
    {
      title: 'Academic Operating System',
      desc: 'Semester Command Center, syllabus parsing, automated study planners, dynamic today plan, AI flashcards with spaced repetition, and slip test / midterm preparation.',
    },
    {
      title: 'Practical Laboratories',
      desc: 'Secure sandboxed Coding Lab, interactive DSA visualizers for 20+ topics, isolated SQL database workbench, and browser-based AI/ML dataset experimentation.',
    },
    {
      title: 'Knowledge & Doubt Resolution',
      desc: 'Centralized AI Tutor with Socratic pedagogy, dedicated Doubt Solver, LaTeX / KaTeX mathematical rendering, and Document Vault with semantic vector retrieval (RAG).',
    },
    {
      title: 'Career & Placement Hub',
      desc: 'Role-based skill gap analysis, quantitative and verbal aptitude preparation, simulated AI voice/chat mock interviews, ATS resume builder, and internship tracking.',
    },
    {
      title: 'Student Community & Projects',
      desc: 'Engineering project portfolios, authorized GitHub integration, peer Q&A forum, shared study resources, and verifiable academic progress metrics.',
    },
  ];

  return (
    <PublicLayout currentPath="/about" onNavigate={onNavigate}>
      {/* Hero Header */}
      <section className="bg-white border-b border-slate-200 py-14 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-blue-600 text-xs font-semibold mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Mission & Philosophy</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
            Built Exclusively for B.Tech Engineering Students
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            The comprehensive academic and career platform engineered to transform undergraduate engineering education from passive lecture attendance into verified mastery and career readiness.
          </p>
        </div>
      </section>

      {/* Target Users & Purpose */}
      <section className="py-14 sm:py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600">Our Purpose</h2>
              <p className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Bridging University Academics with Real Engineering Excellence
              </p>
              <p className="text-sm text-slate-600 leading-relaxed">
                Undergraduate engineering students face a challenging duality: maintaining a competitive SGPA / CGPA in university semester exams while independently mastering modern software engineering, coding problems, and system architecture for competitive placements.
              </p>
              <p className="text-sm text-slate-600 leading-relaxed">
                The NEXORA AI resolves this fragmentation. By integrating your active semester curriculum with personalized AI agents, isolated coding sandboxes, and structured placement modules, students build both top academic grades and tier-1 industry capabilities under one unified system.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-base text-slate-900">Who the Platform is Designed For:</h3>
              <ul className="space-y-3 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span><strong>Computer Science & Engineering (CSE)</strong>: Data Structures, Operating Systems, DBMS, Compilers, Computer Networks, and Full Stack development.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span><strong>AI & Machine Learning (AI/ML)</strong>: Mathematical Foundations, Neural Networks, Deep Learning, NLP, Computer Vision, and Model Training.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span><strong>Data Science & Analytics</strong>: Statistical Learning, Big Data, SQL Warehousing, Feature Engineering, and Business Analytics.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span><strong>Electronics & Communication (ECE / EEE)</strong>: Digital Signal Processing, Microprocessors, Embedded C, VLSI, and IoT Systems.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span><strong>Core & Allied Branches</strong>: Mechanical, Civil, IT, and Cyber Security with branch-customizable syllabus management.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Core Design Principles */}
      <section className="py-14 sm:py-20 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600">Engineering Standards</h2>
            <p className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Our Five Core Architectural Principles
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {designPrinciples.map((principle, idx) => {
              const Icon = principle.icon;
              return (
                <div key={idx} className="p-6 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                  <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 w-fit">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900">{principle.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{principle.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Five Functional Pillars */}
      <section className="py-14 sm:py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600">Platform Scope</h2>
            <p className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Five Integrated Pillars of the Engineering Platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pillars.map((pillar, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <span className="text-xs font-black text-blue-600">PILLAR 0{idx + 1}</span>
                <h3 className="font-bold text-base text-slate-900">{pillar.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{pillar.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-white text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Experience a Truly Personalized Engineering Platform
          </h2>
          <p className="text-sm text-slate-600">
            Register in under 2 minutes, configure your current semester subjects, and unlock your custom AI learning OS.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button
              onClick={() => onNavigate('/register')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md cursor-pointer"
            >
              Get Started (Sign Up)
            </Button>
            <Button
              variant="outline"
              onClick={() => onNavigate('/how-it-works')}
              className="border-slate-300 text-slate-700 font-semibold text-xs px-6 py-3 rounded-xl cursor-pointer"
            >
              Learn the 12-Step Workflow
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
