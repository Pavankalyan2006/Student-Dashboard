import * as React from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';
import { communityProfileApi } from '../../../api/communityProfileApi';
import { ProfileManager } from '../components/ProfileManager';

/**
 * Phase 5: profile editing goes through the central student profile (validated, versioned,
 * propagated to every module). The only field kept here from the older form is the public
 * community bio, which is not part of the central profile.
 */
export function ProfileEditPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [bio, setBio] = React.useState('');
  const [loaded, setLoaded] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    communityProfileApi
      .getProfile()
      .then((p) => setBio(p.bio || ''))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const saveBio = async () => {
    if (bio.length > 500) {
      toast.error('Bio must not exceed 500 characters');
      return;
    }
    try {
      setSaving(true);
      await communityProfileApi.updateProfile({ bio: bio.trim() });
      toast.success('Bio saved');
    } catch (err: any) {
      toast.error(err?.message || 'Could not save the bio');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
        <button
          onClick={() => onNavigate('/profile')}
          aria-label="Back to profile"
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Edit profile</h1>
          <p className="text-sm text-slate-600">Changes here update your dashboard, tutor, recommendations and planner.</p>
        </div>
      </div>

      <ProfileManager />

      <section className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
        <h2 className="text-sm font-semibold text-slate-900">Community bio</h2>
        <p className="text-xs text-slate-600">Shown on your public community profile when your privacy settings allow it.</p>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          disabled={!loaded}
          rows={4}
          maxLength={500}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          placeholder="A short introduction for other students"
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">{bio.length}/500</span>
          <button
            onClick={saveBio}
            disabled={saving || !loaded}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            <Save className="h-4 w-4" /> {saving ? 'Saving…' : 'Save bio'}
          </button>
        </div>
      </section>
    </div>
  );
}
