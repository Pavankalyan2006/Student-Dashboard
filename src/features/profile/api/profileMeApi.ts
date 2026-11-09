// Phase 5: client for the central profile API (/api/v1/profile/me...).
import { apiClient } from '../../../api/client';
import type {
  CanonicalProfile,
  ProfileSectionKey,
} from '../../../../server/services/studentProfile/types';
import type { ProfileCompletionReport } from '../../../../server/services/studentProfile/completion';
import type { ModuleRecommendations } from '../../../../server/services/studentProfile/recommendations';

export type { CanonicalProfile, ProfileSectionKey, ProfileCompletionReport, ModuleRecommendations };

export interface ProfileResponse {
  profile: CanonicalProfile;
  completion: ProfileCompletionReport;
}

export const profileMeApi = {
  get: () => apiClient.get<ProfileResponse>('/profile/me'),
  completion: () => apiClient.get<ProfileCompletionReport>('/profile/me/completion'),
  updateSection: (section: ProfileSectionKey, data: Record<string, unknown>, version?: number) => {
    const headers = version !== undefined ? { 'If-Match': String(version) } : undefined;
    return section === 'skills'
      ? apiClient.put<ProfileResponse>(`/profile/me/skills`, data, headers)
      : apiClient.patch<ProfileResponse>(`/profile/me/${section}`, data, headers);
  },
  saveStep: (step: number, data: Record<string, unknown>, skip = false) =>
    apiClient.put<ProfileResponse>(`/profile/me/onboarding/steps/${step}`, { data, skip }),
  complete: () => apiClient.post<ProfileResponse>('/profile/me/onboarding/complete'),
  context: (module: string) => apiClient.get<Record<string, any>>(`/profile/me/context/${module}`),
  recommendations: (module: string) => apiClient.get<ModuleRecommendations>(`/profile/me/recommendations/${module}`),
};
