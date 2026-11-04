import * as React from 'react';
import { ArrowLeft, Save, Sparkles, CheckCircle2 } from 'lucide-react';
import { communityProfileApi } from '../../../api/communityProfileApi';
import { StudentProfileData } from '../../../../server/models/communityProfileProgressTypes';
import { toast } from 'sonner';
import { useStudentContext } from '../../../hooks/useStudentContext';

export function ProfileEditPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { refreshStudentContext } = useStudentContext();
  const [profile, setProfile] = React.useState<StudentProfileData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  // Form fields
  const [name, setName] = React.useState('');
  const [avatarUrl, setAvatarUrl] = React.useState('');
  const [bio, setBio] = React.useState('');
  const [branch, setBranch] = React.useState('CSE');
  const [semester, setSemester] = React.useState(6);
  const [graduationYear, setGraduationYear] = React.useState(2027);
  const [interestsText, setInterestsText] = React.useState('');
  const [goalsText, setGoalsText] = React.useState('');
  const [skillsText, setSkillsText] = React.useState('');
  const [githubLink, setGithubLink] = React.useState('');
  const [linkedinLink, setLinkedinLink] = React.useState('');
  const [websiteLink, setWebsiteLink] = React.useState('');

  React.useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await communityProfileApi.getProfile();
      setProfile(data);
      setName(data.name || '');
      setAvatarUrl(data.avatar_url || '');
      setBio(data.bio || '');
      setBranch(data.branch || 'CSE');
      setSemester(data.semester || 6);
      setGraduationYear(data.graduation_year || 2027);
      setInterestsText((data.interests || []).join(', '));
      setGoalsText((data.learning_goals || []).join('\n'));
      setSkillsText((data.skills || []).join(', '));
      setGithubLink(data.links?.github || '');
      setLinkedinLink(data.links?.linkedin || '');
      setWebsiteLink(data.links?.website || '');
    } catch {
      toast.error('Failed to load profile for editing');
    } finally {
      setLoading(false);
    }
  };

  // Live profile completion estimate
  const completionPercentage = React.useMemo(() => {
    let score = 0;
    if (name.trim()) score += 15;
    if (avatarUrl.trim()) score += 10;
    if (bio.trim()) score += 15;
    if (branch && semester && graduationYear) score += 20;
    if (skillsText.trim()) score += 15;
    if (interestsText.trim()) score += 10;
    if (goalsText.trim()) score += 5;
    if (githubLink.trim() || linkedinLink.trim() || websiteLink.trim()) score += 10;
    return Math.min(100, score);
  }, [name, avatarUrl, bio, branch, semester, graduationYear, skillsText, interestsText, goalsText, githubLink, linkedinLink, websiteLink]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || name.trim().length < 2) {
      toast.error('Name must be at least 2 characters long');
      return;
    }

    if (bio.length > 500) {
      toast.error('Bio must not exceed 500 characters');
      return;
    }

    if (graduationYear < 2020 || graduationYear > 2035) {
      toast.error('Please enter a realistic graduation year');
      return;
    }

    try {
      setSaving(true);
      const skills = skillsText.split(',').map((s) => s.trim()).filter(Boolean);
      const interests = interestsText.split(',').map((i) => i.trim()).filter(Boolean);
      const learning_goals = goalsText.split('\n').map((g) => g.trim()).filter(Boolean);

      await communityProfileApi.updateProfile({
        name: name.trim(),
        avatar_url: avatarUrl.trim(),
        bio: bio.trim(),
        branch,
        semester: Number(semester),
        graduation_year: Number(graduationYear),
        skills,
        interests,
        learning_goals,
        links: {
          github: githubLink.trim() || undefined,
          linkedin: linkedinLink.trim() || undefined,
          website: websiteLink.trim() || undefined,
        },
      });

      await refreshStudentContext().catch(() => {});
      toast.success('Profile updated successfully!');
      onNavigate('/profile');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-4 animate-pulse">
        <div className="h-8 w-40 bg-slate-200 rounded" />
        <div className="h-96 bg-slate-200 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E4E7EC] pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('/profile')}
            className="p-2 text-[#475467] hover:text-[#101828] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-[#101828]">Edit Student Profile</h1>
            <p className="text-xs text-[#667085]">
              Update your academic details, technical skills, and public portfolio links.
            </p>
          </div>
        </div>

        {/* Live Completion Badge */}
        <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200">
          <Sparkles className="h-4 w-4 text-[#2563EB]" />
          <span className="text-xs font-semibold text-[#2563EB]">
            {completionPercentage}% Complete
          </span>
        </div>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-[#E4E7EC] p-6 space-y-6 shadow-2xs">
        {/* Basic Details */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#475467] border-b border-slate-100 pb-1">
            1. Basic Profile (Required)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#344054] mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#D0D5DD] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                placeholder="e.g. Alex Kumar"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#344054] mb-1">Profile Photo URL</label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#D0D5DD] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                placeholder="https://images.unsplash.com/..."
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-[#344054]">Short Bio</label>
              <span className="text-[10px] text-[#667085]">{bio.length}/500</span>
            </div>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={500}
              className="w-full px-3 py-2 text-xs rounded-lg border border-[#D0D5DD] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              placeholder="Tell others about your technical interests, B.Tech focus, or research aspirations..."
            />
          </div>
        </div>

        {/* Academic Details */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#475467] border-b border-slate-100 pb-1">
            2. Academic Information (Required)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#344054] mb-1">Branch / Major</label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#D0D5DD] focus:outline-none focus:ring-2 focus:ring-[#2563EB] bg-white"
              >
                <option value="CSE">Computer Science & Engineering (CSE)</option>
                <option value="IT">Information Technology (IT)</option>
                <option value="ECE">Electronics & Communication (ECE)</option>
                <option value="EE">Electrical Engineering (EE)</option>
                <option value="ME">Mechanical Engineering (ME)</option>
                <option value="CE">Civil Engineering (CE)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#344054] mb-1">Current Semester</label>
              <select
                value={semester}
                onChange={(e) => setSemester(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#D0D5DD] focus:outline-none focus:ring-2 focus:ring-[#2563EB] bg-white"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                  <option key={sem} value={sem}>
                    Semester {sem}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#344054] mb-1">Graduation Year</label>
              <input
                type="number"
                value={graduationYear}
                onChange={(e) => setGraduationYear(Number(e.target.value))}
                min={2020}
                max={2035}
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#D0D5DD] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
            </div>
          </div>
        </div>

        {/* Skills & Goals */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#475467] border-b border-slate-100 pb-1">
            3. Skills & Learning Goals (Recommended)
          </h3>

          <div>
            <label className="block text-xs font-semibold text-[#344054] mb-1">
              Skills (comma separated)
            </label>
            <input
              type="text"
              value={skillsText}
              onChange={(e) => setSkillsText(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-[#D0D5DD] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              placeholder="e.g. Python, Data Structures, PyTorch, React, Distributed Systems"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#344054] mb-1">
              Academic & Technical Interests (comma separated)
            </label>
            <input
              type="text"
              value={interestsText}
              onChange={(e) => setInterestsText(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-[#D0D5DD] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              placeholder="e.g. Deep Learning, Cloud Native, Competitive Programming"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#344054] mb-1">
              Active Learning Goals (one per line)
            </label>
            <textarea
              rows={3}
              value={goalsText}
              onChange={(e) => setGoalsText(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-[#D0D5DD] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              placeholder="e.g. Master Tree Invariants in DSA Lab&#10;Complete Distributed KV Store Project"
            />
          </div>
        </div>

        {/* Portfolio & Links */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#475467] border-b border-slate-100 pb-1">
            4. External Portfolio Links (Optional)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#344054] mb-1">GitHub URL</label>
              <input
                type="url"
                value={githubLink}
                onChange={(e) => setGithubLink(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#D0D5DD] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                placeholder="https://github.com/username"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#344054] mb-1">LinkedIn URL</label>
              <input
                type="url"
                value={linkedinLink}
                onChange={(e) => setLinkedinLink(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#D0D5DD] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                placeholder="https://linkedin.com/in/username"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#344054] mb-1">Personal Website</label>
              <input
                type="url"
                value={websiteLink}
                onChange={(e) => setWebsiteLink(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#D0D5DD] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                placeholder="https://yourportfolio.dev"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => onNavigate('/profile')}
            className="px-4 py-2 text-xs font-semibold text-[#475467] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-lg transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" />
            <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
