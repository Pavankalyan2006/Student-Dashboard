// Phase 5: one cached copy of the student's profile for the whole app.
//
// Pages read the profile through this hook instead of each fetching it. After a confirmed save the
// cache is replaced with the server's response and every dependent module's queries are
// invalidated; pages that do not use React Query listen for the "profile:updated" event.
import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient } from '../../../api/queryClient';
import { useAuthStore } from '../../../store/authStore';
import { profileMeApi, ProfileResponse, ProfileSectionKey } from '../api/profileMeApi';

export const PROFILE_QUERY_KEY = ['profile', 'me'] as const;

/** Query-key prefixes whose data is derived from the profile. */
const DEPENDENT_KEYS = ['profile', 'dashboard', 'courses', 'semester', 'progress', 'goals', 'placement-readiness', 'notifications', 'profile-recommendations', 'profile-context'];

export function applyProfileUpdate(res: ProfileResponse) {
  queryClient.setQueryData(PROFILE_QUERY_KEY, res);
  for (const key of DEPENDENT_KEYS) {
    if (key === 'profile') continue;
    void queryClient.invalidateQueries({ queryKey: [key] });
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('profile:updated', { detail: { version: res.profile.account.profile_version } }));
  }
  // Name, branch, semester and onboarding status shown in the shell come from the auth record.
  void useAuthStore.getState().refreshStudent();
}

export function useStudentProfile() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: profileMeApi.get,
    enabled: isAuthenticated,
    staleTime: 60_000,
  });
}

export function useUpdateProfileSection() {
  return useMutation({
    mutationFn: (v: { section: ProfileSectionKey; data: Record<string, unknown>; version?: number }) =>
      profileMeApi.updateSection(v.section, v.data, v.version),
    // Success is shown only after the server confirmed the write.
    onSuccess: applyProfileUpdate,
  });
}

export function useProfileRecommendations(module: string) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: ['profile-recommendations', module],
    queryFn: () => profileMeApi.recommendations(module),
    enabled: isAuthenticated,
    staleTime: 60_000,
  });
}
