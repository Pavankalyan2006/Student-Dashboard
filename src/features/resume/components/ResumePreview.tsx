import React from 'react';
import { FullResumeData, ResumeTemplate } from '../types/resumeTypes';
import { Globe, Mail, Phone, MapPin, Linkedin, Github, Award, CheckCircle2, ExternalLink, Sparkles } from 'lucide-react';

interface ResumePreviewProps {
  data: FullResumeData;
  templateOverride?: ResumeTemplate;
  isPrintMode?: boolean;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({
  data,
  templateOverride,
  isPrintMode = false,
}) => {
  const { resume, profile, education, skills, projects, experience, certifications, achievements } = data;
  const template = templateOverride || resume.template || 'TECHNICAL';
  const customConfig = resume.custom_template_config;
  const isCustom = template === 'CUSTOM_UPLOADED' && Boolean(customConfig);
  const accentColor = isCustom ? (customConfig?.styling.accent_color || '#2F389E') : undefined;

  // Section order
  const order = resume.section_order || [
    'profile',
    'summary',
    'education',
    'skills',
    'projects',
    'experience',
    'certifications',
    'achievements',
  ];

  // Helper styles based on template
  const getHeaderClasses = () => {
    switch (template) {
      case 'CUSTOM_UPLOADED': {
        const align = customConfig?.styling.header_alignment === 'center' ? 'text-center' : 'text-left';
        const font = customConfig?.styling.font_family === 'serif' ? 'font-serif' : customConfig?.styling.font_family === 'mono' ? 'font-mono' : 'font-sans';
        return `${align} border-b-2 pb-4 mb-5 ${font}`;
      }
      case 'CLASSIC':
        return 'text-center border-b-2 border-gray-800 pb-4 mb-5 font-serif';
      case 'MODERN':
        return 'border-b-2 border-blue-600 pb-4 mb-5';
      case 'MINIMAL':
        return 'border-b border-gray-200 pb-3 mb-4';
      case 'ACADEMIC':
        return 'text-center border-b-2 border-neutral-700 pb-4 mb-6 font-serif';
      case 'TECHNICAL':
      default:
        return 'border-b border-slate-300 pb-4 mb-5';
    }
  };

  const getSectionTitleClasses = () => {
    switch (template) {
      case 'CUSTOM_UPLOADED': {
        const font = customConfig?.styling.font_family === 'serif' ? 'font-serif' : customConfig?.styling.font_family === 'mono' ? 'font-mono' : 'font-sans';
        return `text-xs font-bold uppercase tracking-wider border-b pb-1 mb-2 ${font}`;
      }
      case 'CLASSIC':
        return 'text-sm font-bold uppercase tracking-wider text-gray-900 border-b border-gray-400 pb-1 mb-2 font-serif';
      case 'MODERN':
        return 'text-sm font-bold uppercase tracking-wider text-blue-800 border-b border-blue-200 pb-1 mb-2.5 flex items-center justify-between';
      case 'MINIMAL':
        return 'text-xs font-semibold uppercase tracking-widest text-gray-500 border-b border-gray-200 pb-1 mb-2';
      case 'ACADEMIC':
        return 'text-sm font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-400 pb-1 mb-3 font-serif';
      case 'TECHNICAL':
      default:
        return 'text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 mb-2 font-mono';
    }
  };

  const getSectionTitle = (key: string, defaultTitle: string) => {
    if (isCustom && customConfig?.detected_headings?.[key]) {
      return customConfig.detected_headings[key];
    }
    return defaultTitle;
  };

  const renderSummary = () => {
    if (!resume.summary) return null;
    return (
      <section className="mb-4">
        <h2 className={getSectionTitleClasses()} style={accentColor ? { borderColor: accentColor, color: accentColor } : undefined}>
          {getSectionTitle('summary', 'Professional Summary')}
        </h2>
        <p className="text-xs leading-relaxed text-gray-800">{resume.summary}</p>
      </section>
    );
  };

  const renderEducation = () => {
    if (!education || education.length === 0) return null;
    return (
      <section className="mb-4">
        <h2 className={getSectionTitleClasses()} style={accentColor ? { borderColor: accentColor, color: accentColor } : undefined}>
          {getSectionTitle('education', 'Education')}
        </h2>
        <div className="space-y-2.5">
          {education.map((edu) => (
            <div key={edu.id} className="text-xs">
              <div className="flex justify-between items-baseline">
                <span className="font-bold text-gray-900">{edu.institution}</span>
                <span className="text-gray-600 font-mono text-[11px]">
                  {edu.start_date} – {edu.end_date}
                </span>
              </div>
              <div className="flex justify-between items-baseline text-gray-700">
                <span className="italic">{edu.degree} in {edu.field_of_study}</span>
                {edu.grade && <span className="font-semibold text-gray-800">{edu.grade}</span>}
              </div>
              {edu.description && <p className="text-gray-600 mt-0.5 text-[11px]">{edu.description}</p>}
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderSkills = () => {
    if (!skills || skills.length === 0) return null;

    // Group skills by category
    const grouped: Record<string, string[]> = {};
    for (const sk of skills) {
      const cat = sk.category || 'OTHER';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(sk.skill);
    }

    return (
      <section className="mb-4">
        <h2 className={getSectionTitleClasses()} style={accentColor ? { borderColor: accentColor, color: accentColor } : undefined}>
          {getSectionTitle('skills', 'Technical Skills')}
        </h2>
        <div className="space-y-1 text-xs">
          {Object.entries(grouped).map(([category, list]) => (
            <div key={category} className="flex flex-wrap items-baseline gap-1.5">
              <span className="font-semibold text-gray-800 text-[11px] capitalize w-28 shrink-0">
                {category.toLowerCase().replace('_', ' ')}:
              </span>
              <span className="text-gray-700 text-xs">
                {list.join(' • ')}
              </span>
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderProjects = () => {
    if (!projects || projects.length === 0) return null;
    return (
      <section className="mb-4">
        <h2 className={getSectionTitleClasses()} style={accentColor ? { borderColor: accentColor, color: accentColor } : undefined}>
          {getSectionTitle('projects', 'Featured Technical Projects')}
        </h2>
        <div className="space-y-3">
          {projects.map((p) => (
            <div key={p.id} className="text-xs">
              <div className="flex justify-between items-baseline mb-0.5">
                <span className="font-bold text-gray-900">{p.title}</span>
                {p.technologies && p.technologies.length > 0 && (
                  <span className="text-gray-600 font-mono text-[10px]">
                    [{p.technologies.slice(0, 5).join(', ')}]
                  </span>
                )}
              </div>
              {p.description_override && (
                <p className="text-gray-700 mb-1 text-[11px] leading-relaxed">
                  {p.description_override}
                </p>
              )}
              {p.highlighted_features && p.highlighted_features.length > 0 && (
                <ul className="list-disc list-inside space-y-0.5 text-gray-700 text-[11px]">
                  {p.highlighted_features.map((feat, fidx) => (
                    <li key={fidx} className="leading-snug">{feat}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderExperience = () => {
    if (!experience || experience.length === 0) return null;
    return (
      <section className="mb-4">
        <h2 className={getSectionTitleClasses()} style={accentColor ? { borderColor: accentColor, color: accentColor } : undefined}>
          {getSectionTitle('experience', 'Experience')}
        </h2>
        <div className="space-y-2.5">
          {experience.map((exp) => (
            <div key={exp.id} className="text-xs">
              <div className="flex justify-between items-baseline">
                <span className="font-bold text-gray-900">{exp.role}</span>
                <span className="text-gray-600 font-mono text-[11px]">
                  {exp.start_date} – {exp.end_date}
                </span>
              </div>
              <div className="flex justify-between items-baseline text-gray-700 mb-0.5">
                <span className="italic">{exp.organization}</span>
                {exp.location && <span className="text-gray-500 text-[11px]">{exp.location}</span>}
              </div>
              {exp.description && <p className="text-gray-700 text-[11px] mb-1">{exp.description}</p>}
              {exp.achievements && exp.achievements.length > 0 && (
                <ul className="list-disc list-inside space-y-0.5 text-gray-700 text-[11px]">
                  {exp.achievements.map((ach, aidx) => (
                    <li key={aidx} className="leading-snug">{ach}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderCertifications = () => {
    if (!certifications || certifications.length === 0) return null;
    return (
      <section className="mb-4">
        <h2 className={getSectionTitleClasses()} style={accentColor ? { borderColor: accentColor, color: accentColor } : undefined}>
          {getSectionTitle('certifications', 'Certifications')}
        </h2>
        <div className="space-y-1 text-xs">
          {certifications.map((c) => (
            <div key={c.id} className="flex justify-between items-baseline">
              <span className="font-medium text-gray-800">
                {c.name} <span className="text-gray-500 font-normal">— {c.issuer}</span>
              </span>
              <span className="text-gray-500 font-mono text-[11px]">{c.issue_date}</span>
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderAchievements = () => {
    if (!achievements || achievements.length === 0) return null;
    return (
      <section className="mb-4">
        <h2 className={getSectionTitleClasses()} style={accentColor ? { borderColor: accentColor, color: accentColor } : undefined}>
          {getSectionTitle('achievements', 'Honors & Achievements')}
        </h2>
        <div className="space-y-1.5 text-xs">
          {achievements.map((a) => (
            <div key={a.id}>
              <div className="flex justify-between items-baseline">
                <span className="font-semibold text-gray-800">{a.title}</span>
                {a.date && <span className="text-gray-500 font-mono text-[11px]">{a.date}</span>}
              </div>
              {a.description && <p className="text-gray-600 text-[11px]">{a.description}</p>}
            </div>
          ))}
        </div>
      </section>
    );
  };

  const sectionMap: Record<string, () => React.ReactNode> = {
    summary: renderSummary,
    education: renderEducation,
    skills: renderSkills,
    projects: renderProjects,
    experience: renderExperience,
    certifications: renderCertifications,
    achievements: renderAchievements,
  };

  return (
    <div
      className={`bg-white text-gray-900 rounded-md shadow-sm border border-gray-200 transition-all ${
        isPrintMode ? 'p-0 shadow-none border-none' : 'p-8 sm:p-10 max-w-4xl mx-auto'
      }`}
      style={{ minHeight: '1050px' }}
      id="resume-printable-area"
    >
      {/* Custom Template Indicator */}
      {isCustom && customConfig && !isPrintMode && (
        <div className="mb-5 p-3.5 rounded-xl bg-gradient-to-r from-blue-50/90 to-indigo-50/90 border border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-blue-600 text-white shadow-xs">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <span>Custom Uploaded Template: {customConfig.template_name}</span>
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block"
                  style={{ backgroundColor: customConfig.styling.accent_color }}
                  title={`Detected Accent Color: ${customConfig.styling.accent_color}`}
                />
              </div>
              <div className="text-[11px] text-slate-500">
                Extracted sections, {customConfig.styling.font_family} typography, {customConfig.styling.layout.replace('_', ' ').toLowerCase()}
              </div>
            </div>
          </div>
          <span className="self-start sm:self-center px-2.5 py-1 rounded-md text-[10px] font-bold bg-white text-blue-700 border border-blue-200 uppercase tracking-wider font-mono">
            {customConfig.filename}
          </span>
        </div>
      )}

      {/* Header Profile */}
      <header className={getHeaderClasses()} style={accentColor ? { borderColor: accentColor } : undefined}>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-1">
          {profile?.full_name || 'Student Name'}
        </h1>
        {profile?.headline && (
          <p className="text-xs font-medium text-gray-600 mb-2">{profile.headline}</p>
        )}

        {/* Contact Links */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-gray-600">
          {profile?.email && (
            <span className="flex items-center gap-1">
              <Mail className="h-3 w-3 text-gray-400" />
              {profile.email}
            </span>
          )}
          {profile?.phone && (
            <span className="flex items-center gap-1">
              <Phone className="h-3 w-3 text-gray-400" />
              {profile.phone}
            </span>
          )}
          {profile?.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3 text-gray-400" />
              {profile.location}
            </span>
          )}
          {profile?.github_url && (
            <a
              href={profile.github_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-blue-600 hover:underline"
            >
              <Github className="h-3 w-3" />
              GitHub
            </a>
          )}
          {profile?.linkedin_url && (
            <a
              href={profile.linkedin_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-blue-600 hover:underline"
            >
              <Linkedin className="h-3 w-3" />
              LinkedIn
            </a>
          )}
          {profile?.portfolio_url && (
            <a
              href={profile.portfolio_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-blue-600 hover:underline"
            >
              <Globe className="h-3 w-3" />
              Portfolio
            </a>
          )}
        </div>
      </header>

      {/* Render sections in persisted order */}
      <main>
        {order.map((secName) => {
          const renderer = sectionMap[secName];
          return renderer ? <React.Fragment key={secName}>{renderer()}</React.Fragment> : null;
        })}
      </main>
    </div>
  );
};
