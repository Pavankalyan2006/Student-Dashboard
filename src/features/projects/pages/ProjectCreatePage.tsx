import React, { useState, useEffect } from 'react';
import { ProjectType, TechnologyCategory } from '../types/project';
import { projectsApi } from '../api/projectsApi';
import { ProjectIdeasModal } from '../components/ProjectIdeasModal';
import {
  FolderKanban,
  Check,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Plus,
  Trash2,
  Cpu,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { toast } from 'sonner';

interface ProjectCreatePageProps {
  search?: string;
  onNavigate: (path: string) => void;
}

export const ProjectCreatePage: React.FC<ProjectCreatePageProps> = ({ search, onNavigate }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isIdeasModalOpen, setIsIdeasModalOpen] = useState(false);

  // Form State
  const [projectType, setProjectType] = useState<ProjectType>('MAJOR_PROJECT');
  const [domain, setDomain] = useState<string>('AI/ML');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [problemStatement, setProblemStatement] = useState('');
  const [targetUsers, setTargetUsers] = useState('ICU Clinicians, Nurses, and Researchers');
  const [objectives, setObjectives] = useState<string[]>([
    'Implement real-time data ingestion pipeline',
    'Develop predictive machine learning models',
  ]);
  const [expectedOutcome, setExpectedOutcome] = useState('');
  const [technologies, setTechnologies] = useState<
    { category: TechnologyCategory; technology: string; reason?: string }[]
  >([
    { category: 'FRONTEND', technology: 'React 19 + TypeScript', reason: 'Modern UI' },
    { category: 'BACKEND', technology: 'FastAPI / Python', reason: 'High throughput' },
    { category: 'DATABASE', technology: 'PostgreSQL', reason: 'ACID compliance' },
  ]);

  // Pre-fill from query params if available
  useEffect(() => {
    if (search) {
      const params = new URLSearchParams(search);
      const ideaTitle = params.get('idea');
      const domainParam = params.get('domain');
      if (ideaTitle) setTitle(decodeURIComponent(ideaTitle));
      if (domainParam) setDomain(decodeURIComponent(domainParam));
    }
  }, [search]);

  const handleAddObjective = () => {
    setObjectives([...objectives, '']);
  };

  const handleUpdateObjective = (index: number, val: string) => {
    const updated = [...objectives];
    updated[index] = val;
    setObjectives(updated);
  };

  const handleRemoveObjective = (index: number) => {
    setObjectives(objectives.filter((_, i) => i !== index));
  };

  const handleAddTech = () => {
    setTechnologies([
      ...technologies,
      { category: 'OTHER', technology: '', reason: 'Required dependency' },
    ]);
  };

  const handleSuggestTechWithAI = () => {
    // Standard recommended presets based on domain
    if (domain === 'AI/ML') {
      setTechnologies([
        { category: 'FRONTEND', technology: 'React 19 + TypeScript', reason: 'High-performance chart telemetry' },
        { category: 'BACKEND', technology: 'FastAPI (Python)', reason: 'Native PyTorch and asyncio inference' },
        { category: 'DATABASE', technology: 'PostgreSQL + pgvector', reason: 'Embedding similarity joins' },
        { category: 'AI', technology: 'PyTorch + HuggingFace', reason: 'Pretrained neural networks' },
        { category: 'DEPLOYMENT', technology: 'Docker Compose', reason: 'Isolated reproducibility' },
      ]);
    } else if (domain === 'Web Development') {
      setTechnologies([
        { category: 'FRONTEND', technology: 'Next.js 15 / React 19', reason: 'Server components & SEO' },
        { category: 'BACKEND', technology: 'Node.js Express / NestJS', reason: 'Event-driven API throughput' },
        { category: 'DATABASE', technology: 'PostgreSQL + Prisma', reason: 'Type-safe relational modeling' },
        { category: 'AUTH', technology: 'JWT + OAuth2', reason: 'Role-based access security' },
      ]);
    } else {
      setTechnologies([
        { category: 'FRONTEND', technology: 'React + Vite', reason: 'Component reusability' },
        { category: 'BACKEND', technology: 'FastAPI / Python', reason: 'Clean REST endpoints' },
        { category: 'DATABASE', technology: 'PostgreSQL', reason: 'Relational data stability' },
      ]);
    }
    toast.success('Applied AI-curated technology stack recommendations');
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error('Project title is required');
      setStep(3);
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await projectsApi.createProject({
        title,
        project_type: projectType,
        domain,
        description,
        problem_statement: problemStatement,
        objectives: objectives.filter((o) => o.trim().length > 0),
        target_users: targetUsers,
        expected_outcome: expectedOutcome,
        technologies: technologies.filter((t) => t.technology.trim().length > 0),
      });

      toast.success('Project created successfully!');
      onNavigate(`/projects/${created.id}/overview`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => onNavigate('/projects')}
            className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 flex items-center gap-1 mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Projects</span>
          </button>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
            Create New Project
          </h1>
          <p className="text-xs text-slate-500">
            Configure your B.Tech project architecture, domain, and development blueprint.
          </p>
        </div>

        <button
          onClick={() => setIsIdeasModalOpen(true)}
          className="px-3.5 py-2 bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
        >
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span>Ask AI for Ideas</span>
        </button>
      </div>

      {/* Wizard Step Progress Tracker */}
      <div className="grid grid-cols-5 gap-2 bg-slate-100 dark:bg-slate-800/60 p-1.5 rounded-2xl">
        {[
          { stepNum: 1, title: 'Project Type' },
          { stepNum: 2, title: 'Domain' },
          { stepNum: 3, title: 'Concept' },
          { stepNum: 4, title: 'Requirements' },
          { stepNum: 5, title: 'Tech Stack' },
        ].map((s) => (
          <button
            key={s.stepNum}
            onClick={() => setStep(s.stepNum)}
            className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              step === s.stepNum
                ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs'
                : step > s.stepNum
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-slate-400'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                step === s.stepNum
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                  : step > s.stepNum
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
              }`}
            >
              {step > s.stepNum ? '✓' : s.stepNum}
            </span>
            <span className="hidden sm:inline">{s.title}</span>
          </button>
        ))}
      </div>

      {/* Step Content Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
        {/* STEP 1: Project Type */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                Step 1: Select Project Type
              </h3>
              <p className="text-xs text-slate-500">
                Choose the academic classification that matches your syllabus requirements.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {[
                { type: 'MINI_PROJECT', label: 'Mini Project', desc: 'Semester 4-6 prototype (4-8 weeks scope)' },
                { type: 'MAJOR_PROJECT', label: 'Major Project', desc: 'Comprehensive capstone semester project (12-16 weeks)' },
                { type: 'FINAL_YEAR_PROJECT', label: 'Final Year Project', desc: 'Flagship engineering defense & IEEE thesis project' },
                { type: 'RESEARCH_PROJECT', label: 'Research Project', desc: 'Novel experimental paper and algorithmic discovery' },
                { type: 'PERSONAL_PROJECT', label: 'Personal Project', desc: 'Portfolio demonstration and resume showcase' },
                { type: 'OPEN_SOURCE_PROJECT', label: 'Open Source Project', desc: 'Public contribution for global developers' },
              ].map((item) => (
                <div
                  key={item.type}
                  onClick={() => setProjectType(item.type as ProjectType)}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    projectType === item.type
                      ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-950/20 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      {item.label}
                    </h4>
                    {projectType === item.type && (
                      <Check className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: Domain */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                Step 2: Select Technical Domain
              </h3>
              <p className="text-xs text-slate-500">
                Select your engineering specialisation for tailored AI architecture suggestions.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              {[
                'AI/ML',
                'Data Science',
                'Web Development',
                'Mobile Development',
                'Cyber Security',
                'Cloud Computing',
                'IoT',
                'Blockchain',
                'Computer Vision',
                'NLP',
                'Generative AI',
                'HealthTech',
                'EdTech',
                'FinTech',
                'Smart City',
                'Other',
              ].map((d) => (
                <button
                  key={d}
                  onClick={() => setDomain(d)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    domain === d
                      ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 font-bold'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300 text-xs font-medium'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: Project Idea */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  Step 3: Define Project Idea
                </h3>
                <p className="text-xs text-slate-500">
                  Enter your project title and concept, or choose from AI-recommended ideas.
                </p>
              </div>
              <button
                onClick={() => setIsIdeasModalOpen(true)}
                className="text-xs text-purple-600 hover:text-purple-700 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Browse AI Ideas</span>
              </button>
            </div>

            <div className="space-y-3 pt-1">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Project Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Smart Health Prognosis & Clinical Decision Support System"
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  High-Level Summary / Abstract
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide an overview of the technical solution and impact..."
                  rows={3}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-hidden focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Requirements */}
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                Step 4: Formal Requirements & Objectives
              </h3>
              <p className="text-xs text-slate-500">
                Define the problem statement and tangible deliverables for your final evaluation.
              </p>
            </div>

            <div className="space-y-3 pt-1">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Problem Statement
                </label>
                <textarea
                  value={problemStatement}
                  onChange={(e) => setProblemStatement(e.target.value)}
                  placeholder="What critical engineering bottleneck or real-world problem does this address?"
                  rows={2}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Target Users
                  </label>
                  <input
                    type="text"
                    value={targetUsers}
                    onChange={(e) => setTargetUsers(e.target.value)}
                    placeholder="e.g. ICU clinicians, triage nurses"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Expected Outcome
                  </label>
                  <input
                    type="text"
                    value={expectedOutcome}
                    onChange={(e) => setExpectedOutcome(e.target.value)}
                    placeholder="e.g. Sub-second model inference with 88% AUROC"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Objectives List */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Main Objectives ({objectives.length})
                  </label>
                  <button
                    onClick={handleAddObjective}
                    className="text-xs text-blue-600 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Objective</span>
                  </button>
                </div>
                <div className="space-y-2">
                  {objectives.map((obj, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-400 w-4">{i + 1}.</span>
                      <input
                        type="text"
                        value={obj}
                        onChange={(e) => handleUpdateObjective(i, e.target.value)}
                        placeholder={`Objective ${i + 1}`}
                        className="flex-1 text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-hidden"
                      />
                      {objectives.length > 1 && (
                        <button
                          onClick={() => handleRemoveObjective(i)}
                          className="text-slate-400 hover:text-rose-500 p-1 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Technology Preferences */}
        {step === 5 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  Step 5: Technology Stack Preferences
                </h3>
                <p className="text-xs text-slate-500">
                  Select your languages, databases, and frameworks or let AI suggest the optimal stack.
                </p>
              </div>
              <button
                onClick={handleSuggestTechWithAI}
                className="px-3 py-1.5 bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Suggest Stack</span>
              </button>
            </div>

            <div className="space-y-2 pt-1">
              {technologies.map((t, i) => (
                <div key={i} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                  <select
                    value={t.category}
                    onChange={(e) => {
                      const updated = [...technologies];
                      updated[i].category = e.target.value as TechnologyCategory;
                      setTechnologies(updated);
                    }}
                    className="text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 w-32"
                  >
                    <option value="FRONTEND">Frontend</option>
                    <option value="BACKEND">Backend</option>
                    <option value="DATABASE">Database</option>
                    <option value="AI">AI / ML</option>
                    <option value="API">API</option>
                    <option value="STORAGE">Storage</option>
                    <option value="DEPLOYMENT">Deployment</option>
                    <option value="TESTING">Testing</option>
                    <option value="OTHER">Other</option>
                  </select>

                  <input
                    type="text"
                    value={t.technology}
                    onChange={(e) => {
                      const updated = [...technologies];
                      updated[i].technology = e.target.value;
                      setTechnologies(updated);
                    }}
                    placeholder="e.g. React 19 / FastAPI / PostgreSQL"
                    className="flex-1 text-xs p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden"
                  />

                  <button
                    onClick={() => setTechnologies(technologies.filter((_, idx) => idx !== i))}
                    className="text-slate-400 hover:text-rose-500 p-1.5 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              <button
                onClick={handleAddTech}
                className="text-xs text-blue-600 font-semibold flex items-center gap-1 cursor-pointer pt-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Technology</span>
              </button>
            </div>
          </div>
        )}

        {/* Footer Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-40 cursor-pointer"
          >
            Previous
          </button>

          {step < 5 ? (
            <button
              onClick={() => setStep((s) => Math.min(5, s + 1))}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <span>Next</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              <span>Create Project Workspace</span>
            </button>
          )}
        </div>
      </div>

      {/* Ideas Modal */}
      <ProjectIdeasModal
        isOpen={isIdeasModalOpen}
        onClose={() => setIsIdeasModalOpen(false)}
        defaultDomain={domain}
        onSelectIdea={(idea) => {
          setTitle(idea.title);
          setDescription(idea.solution);
          setProblemStatement(idea.problem);
          if (idea.features) setObjectives(idea.features);
          if (idea.technologies) {
            setTechnologies(
              idea.technologies.map((t) => ({
                category: t.category,
                technology: t.name,
                reason: 'Suggested by AI Idea Generator',
              }))
            );
          }
          setStep(3);
        }}
      />
    </div>
  );
};
