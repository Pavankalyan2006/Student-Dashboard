import * as React from 'react';
import { PageContainer, PageHeader, ModulePlaceholderCard } from '../components/layout/PageComponents';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Bot, ArrowRight, Layers, Database } from 'lucide-react';

export interface ModuleConfig {
  title: string;
  description: string;
  phaseNumber: number;
  badgeText?: string;
  features: string[];
  stats?: { label: string; value: string }[];
}

export const MODULE_REGISTRY: Record<string, ModuleConfig> = {
  '/courses': {
    title: 'B.Tech Course Syllabus & Academic Tracks',
    description: 'Autonomous multi-semester curriculum engine with lecture outlines, readings, and progress tracking.',
    phaseNumber: 4,
    features: [
      'Semester 1 through 8 engineering curriculums',
      'AI lecture explainers and key concept extraction',
      'Interactive progress tracking per lesson and subject',
      'Integrated resource repository and reference textbooks',
    ],
    stats: [
      { label: 'Curriculum Depth', value: '8 Semesters' },
      { label: 'Syllabus Engine', value: 'Interactive' },
    ],
  },
  '/notes': {
    title: 'Smart Engineering Notes',
    description: 'AI-assisted note taking, markdown export, and automated lecture summary generator.',
    phaseNumber: 5,
    features: [
      'Rich Markdown editor with KaTeX math formula rendering',
      'AI auto-summarization from syllabus topics',
      'Hierarchical tagging by subject and semester',
      'Offline caching and export to PDF',
    ],
    stats: [
      { label: 'Note Indexing', value: 'Real-time' },
      { label: 'Export Format', value: 'PDF / Markdown' },
    ],
  },
  '/quiz': {
    title: 'Adaptive AI Quiz System',
    description: 'Dynamic question generation calibrated to student knowledge level and university exam patterns.',
    phaseNumber: 9,
    features: [
      'GATE & Semester-pattern multiple-choice questions',
      'Step-by-step diagnostic solution explanations',
      'Automated weak area detection and remedial prompts',
      'Timed mock examination environments',
    ],
    stats: [
      { label: 'Question Bank', value: 'Adaptive Gen' },
      { label: 'Scoring Engine', value: 'Sub-second' },
    ],
  },
  '/dsa': {
    title: 'Data Structures & Algorithms Lab',
    description: 'Curated technical interview and university lab problem solving with step-by-step visual hints.',
    phaseNumber: 8,
    features: [
      'Topic tracks: Arrays, Trees, Graphs, DP, Backtracking',
      'Complexity analysis engine (Time & Space)',
      'Editorial solutions in C++, Java, and Python',
      'Spaced repetition review queues',
    ],
    stats: [
      { label: 'Curated Tracks', value: '18 Topics' },
      { label: 'Verification Engine', value: 'Sandboxed' },
    ],
  },
  '/projects': {
    title: 'Capstone Project Builder',
    description: 'Step-by-step architecture planner, tech stack recommendations, and milestone tracking.',
    phaseNumber: 10,
    features: [
      'System design diagram templates & wireframing',
      'Database schema generator & API contract builder',
      'Sprint backlog and Jira-compatible progress cards',
      'Automated project viva presentation slide generator',
    ],
    stats: [
      { label: 'Project Scaffolds', value: '12 Stacks' },
      { label: 'Viva Readiness', value: 'AI Assessed' },
    ],
  },
  '/projects/docs': {
    title: 'Project Documentation Generator',
    description: 'IEEE-format academic documentation, synopsis generation, and technical SRS compilation.',
    phaseNumber: 10,
    features: [
      'IEEE capstone format compliance checks',
      'Automated UML diagram descriptions',
      'Software Requirements Specification (SRS) builder',
      'Bibliography and citation management',
    ],
    stats: [
      { label: 'Format Template', value: 'IEEE Standard' },
      { label: 'Export', value: 'DOCX / PDF' },
    ],
  },
  '/github': {
    title: 'GitHub & Portfolio Integration',
    description: 'Automated repository analysis, commit quality scoring, and open-source contribution tracking.',
    phaseNumber: 13,
    features: [
      'Repository code quality and documentation audit',
      'README enhancement recommendations',
      'Open-source issue recommendation for students',
      'Developer portfolio generation from public commits',
    ],
    stats: [
      { label: 'OAuth Sync', value: 'Client-side' },
      { label: 'Metrics', value: 'Commit Audit' },
    ],
  },
  '/placement': {
    title: 'Campus Placement Preparation',
    description: 'Company-specific interview tracks, aptitude practice, and recruitment drive preparation.',
    phaseNumber: 11,
    features: [
      'Top tier tech firm interview tracks (Tier 1 & Tier 2)',
      'Quantitative aptitude and logical reasoning modules',
      'HR round questions and behavioral framework responses',
      'Placement drive alerts and deadline notifications',
    ],
    stats: [
      { label: 'Company Guides', value: '60+ Firms' },
      { label: 'Mock Rounds', value: 'Interactive' },
    ],
  },
  '/interviews': {
    title: 'AI Mock Interviews',
    description: 'Simulated technical screening interviews with real-time feedback on answers and communication.',
    phaseNumber: 11,
    features: [
      'Interactive voice and text interview simulation',
      'Live code questioning and edge-case probing',
      'Comprehensive scoring report across fundamentals and logic',
      'Targeted follow-up recommendations',
    ],
    stats: [
      { label: 'Voice / Text', value: 'Supported' },
      { label: 'Feedback', value: 'Real-time' },
    ],
  },
  '/resume': {
    title: 'ATS-Optimized Resume Builder',
    description: 'Tailored resume builder highlighting B.Tech coursework, lab projects, and GitHub metrics.',
    phaseNumber: 12,
    features: [
      'ATS score scanner against real engineering job descriptions',
      'Action-verb bullet point optimizer',
      'LaTeX / Single-page professional engineering templates',
      'Direct PDF export with clean typographical hierarchy',
    ],
    stats: [
      { label: 'ATS Score Scanner', value: 'Active' },
      { label: 'Format', value: 'Single Page' },
    ],
  },
  '/career': {
    title: 'Career & Higher Studies Assistant',
    description: 'Guidance on GATE exams, Masters abroad, campus placements, and specialized engineering paths.',
    phaseNumber: 12,
    features: [
      'GATE syllabus tracker and test series timetable',
      'GRE / TOEFL / IELTS study planning pathways',
      'Specialized career tracks (ML Engineer, Backend Architect, DevOps)',
      'Alumni mentor matching foundation',
    ],
    stats: [
      { label: 'Pathways', value: 'Tech & Masters' },
      { label: 'Guidance', value: 'AI Personalized' },
    ],
  },
  '/research': {
    title: 'Research & Literature Assistant',
    description: 'ArXiv paper exploration, citation analysis, and academic writing assistance.',
    phaseNumber: 13,
    features: [
      'ArXiv / Semantic Scholar search abstraction',
      'Paper summary with mathematical formula translation',
      'Literature review matrix builder',
      'Latex paper drafting templates',
    ],
    stats: [
      { label: 'Paper Corpus', value: 'Open Access' },
      { label: 'Latex Export', value: 'Supported' },
    ],
  },
  '/community': {
    title: 'Engineering Student Community',
    description: 'Peer study groups, doubt clearance forums, and collaborative engineering hackathons.',
    phaseNumber: 14,
    features: [
      'Subject-wise student discussion threads',
      'Verified answer badges from top performers',
      'Campus hackathon team formation boards',
      'Moderation filters and code snippet sharing',
    ],
    stats: [
      { label: 'Active Channels', value: 'By Subject' },
      { label: 'Collaboration', value: 'Peer-to-Peer' },
    ],
  },
  '/progress': {
    title: 'Comprehensive Academic Progress',
    description: 'Analytics dashboard tracking credit completion, GPA trends, and skillset mastery.',
    phaseNumber: 14,
    features: [
      'Semester-by-semester credit audit breakdown',
      'Skill radar across computer science domains',
      'Lab assignments and submission milestone tracking',
      'Official academic report generator',
    ],
    stats: [
      { label: 'Degree Progress', value: '61% Complete' },
      { label: 'CGPA', value: '8.84' },
    ],
  },
  '/bookmarks': {
    title: 'Saved Learning Resources',
    description: 'Personalized bookmarks across lectures, textbook chapters, DSA problems, and project blueprints.',
    phaseNumber: 14,
    features: [
      'One-click resource bookmarking with notes',
      'Categorized folders by subject and urgency',
      'Full-text search across saved snippets',
      'Cross-device sync via database store',
    ],
    stats: [
      { label: 'Saved Items', value: '14 Resources' },
      { label: 'Folders', value: 'Organized' },
    ],
  },
  '/certificates': {
    title: 'Certificates & Micro-Credentials',
    description: 'Verified digital credentials for completed coursework, lab tracks, and quiz masteries.',
    phaseNumber: 14,
    features: [
      'Cryptographically verifiable certificate issuance',
      'LinkedIn shareable credential links',
      'Skill badge endorsements',
      'Downloadable high-resolution PDF certificates',
    ],
    stats: [
      { label: 'Verified Badges', value: '3 Credentials' },
      { label: 'Verification', value: 'Hash Signed' },
    ],
  },
  '/profile': {
    title: 'Student Academic Profile',
    description: 'Official student registration records, academic branch, semester, and credentials.',
    phaseNumber: 14,
    features: [
      'Personal & academic profile data management',
      'Branch and semester enrollment verification',
      'Profile avatar and display preferences',
      'Account security and password update management',
    ],
    stats: [
      { label: 'Verification', value: 'Active Student' },
      { label: 'Auth Method', value: 'Secure JWT' },
    ],
  },
  '/settings': {
    title: 'Platform & Workspace Settings',
    description: 'Configure workspace preferences, notification alerts, and developer AI parameters.',
    phaseNumber: 15,
    features: [
      'Workspace theme and layout preferences',
      'Email & notification channel configuration',
      'AI temperature and response verbosity controls',
      'Session security and active device logs',
    ],
    stats: [
      { label: 'API Version', value: 'v1.0.0' },
      { label: 'Environment', value: 'Production Ready' },
    ],
  },
};

export function ModulePlaceholderPage({ path, onNavigate }: { path: string; onNavigate: (url: string) => void }) {
  const config = MODULE_REGISTRY[path] || {
    title: 'Platform Module',
    description: 'B.Tech learning platform component.',
    phaseNumber: 2,
    features: ['API route ready', 'State management prepared', 'Responsive shell integrated'],
  };

  return (
    <PageContainer>
      <PageHeader
        title={config.title}
        description={config.description}
        badge={
          <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
            Phase {config.phaseNumber} Roadmap
          </span>
        }
        actions={
          <Button variant="ai" size="sm" onClick={() => onNavigate('/ai-agent')} className="gap-1.5">
            <Bot className="h-3.5 w-3.5" />
            <span>Consult AI Agent</span>
          </Button>
        }
      />

      <ModulePlaceholderCard
        moduleName={config.title}
        phaseNumber={config.phaseNumber}
        description={config.description}
        features={config.features}
        actionLabel="Launch AI Learning Agent"
        onAction={() => onNavigate('/ai-agent')}
      />

      {config.stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {config.stats.map((s, idx) => (
            <Card key={idx} className="p-4">
              <div className="text-xs font-medium text-slate-500">{s.label}</div>
              <div className="text-xl font-bold text-slate-900 mt-1 tabular-nums">{s.value}</div>
              <div className="text-[11px] text-emerald-600 mt-0.5 font-medium">Schema verified</div>
            </Card>
          ))}
          <Card className="p-4">
            <div className="text-xs font-medium text-slate-500">API Endpoint</div>
            <div className="text-sm font-mono font-semibold text-[#2563EB] mt-1">/api/v1{path}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Route mapped</div>
          </Card>
          <Card className="p-4">
            <div className="text-xs font-medium text-slate-500">Security Model</div>
            <div className="text-sm font-semibold text-slate-900 mt-1">Student Isolated</div>
            <div className="text-[11px] text-slate-500 mt-0.5">RBAC Verified</div>
          </Card>
        </div>
      )}
    </PageContainer>
  );
}
