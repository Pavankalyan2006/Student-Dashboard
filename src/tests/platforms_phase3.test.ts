import { describe, it, expect, beforeAll, vi } from 'vitest';
import { db } from '../../server/db/database';
import { ExternalProfilesService } from '../../server/services/externalProfilesService';
import { ExternalProfileAdapterRegistry } from '../../server/services/externalProfileAdapters';
import { ExternalIntegrationService } from '../../server/services/externalIntegrationService';
import { safeFetchText } from '../../server/services/platformVerification';
import { SUPPORTED_EXTERNAL_PLATFORMS } from '../../server/services/externalProfilesCatalog';

// Phase 3: "Connected" only after verification; no invented statistics; no fake OAuth.
describe('Phase 3 connected platforms', () => {
  const sid = 'std_p3_plat_a';
  beforeAll(async () => {
    await db.initialize();
  });

  it('a client cannot claim OAuth: the profile is saved as a link, not connected', async () => {
    const p = await ExternalProfilesService.addProfile(sid, { platform_id: 'linkedin', profile_url: 'https://www.linkedin.com/in/p3-student', connection_method: 'OAUTH2' } as any);
    expect(p.connection_method).toBe('PUBLIC_PROFILE_URL');
    expect(p.verification_status).toBe('MANUALLY_ADDED');
    expect(p.connection_status).toBe('LINKED');
  });

  it('LeetCode and Kaggle import nothing and verify nothing (no invented statistics)', async () => {
    for (const id of ['leetcode', 'kaggle'] as const) {
      const a = ExternalProfileAdapterRegistry.get(id);
      const prof: any = { platform_id: id, username: 'anyone', normalized_profile_url: `https://example.com/${id}`, student_id: sid };
      const r = await a.sync(sid, prof);
      expect(r.status).toBe('SKIPPED');
      expect(JSON.stringify(r.data)).not.toMatch(/184|1685|Expert/);
      expect((await a.verifyChallenge(prof, 'btech-verify-1234abcd')).verified).toBe(false);
    }
  });

  it('catalogue flags match what is implemented', () => {
    const flags = Object.fromEntries(SUPPORTED_EXTERNAL_PLATFORMS.map((p) => [p.id, p]));
    expect(flags.leetcode.sync_supported).toBe(false);
    expect(flags.linkedin.oauth_supported).toBe(false);
    expect(flags.codeforces.sync_supported).toBe(true);
    expect(flags.github.oauth_supported).toBe(true);
  });

  it('Codeforces sync reads the official API and reports failure honestly', async () => {
    const a = ExternalProfileAdapterRegistry.get('codeforces');
    const prof: any = { platform_id: 'codeforces', username: 'tourist', student_id: sid };
    const f = vi.spyOn(globalThis, 'fetch').mockImplementation(async (url: any) => {
      if (String(url).includes('user.info')) return new Response(JSON.stringify({ status: 'OK', result: [{ handle: 'tourist', rating: 3500, maxRating: 3800, rank: 'legendary grandmaster', maxRank: 'legendary grandmaster', firstName: 'x btech-verify-aaaa1111' }] }));
      return new Response(JSON.stringify({ status: 'OK', result: [{}, {}] }));
    });
    try {
      const r = await a.sync(sid, prof);
      expect(r.status).toBe('SUCCESS');
      expect(r.data.rating).toBe(3500);
      expect(r.data.contests_participated).toBe(2);
      expect(String(f.mock.calls[0][0])).toContain('https://codeforces.com/api/user.info?handles=tourist');
      expect((await a.verifyChallenge(prof, 'btech-verify-aaaa1111')).verified).toBe(true);
      expect((await a.verifyChallenge(prof, 'btech-verify-other')).verified).toBe(false);
    } finally {
      f.mockRestore();
    }
    const down = vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('blocked'));
    try {
      const r = await a.sync(sid, prof);
      expect(r.status).toBe('FAILED');
      expect(r.error).toContain('Nothing was imported');
    } finally {
      down.mockRestore();
    }
  });

  it('the page check refuses private addresses and non-https URLs', async () => {
    await expect(safeFetchText('https://127.0.0.1/')).rejects.toThrow(/private/);
    await expect(safeFetchText('https://169.254.169.254/latest')).rejects.toThrow(/private/);
    await expect(safeFetchText('https://[::1]/')).rejects.toThrow(/private/);
    await expect(safeFetchText('http://example.com/')).rejects.toThrow(/https/);
  });

  it('links are LINKED with no scopes; usernames and URLs are validated', async () => {
    const c = await ExternalIntegrationService.connectPlatform(sid, 'leetcode' as any, { username: 'p3_coder', profile_url: 'https://leetcode.com/u/p3_coder' });
    expect(c.status).toBe('LINKED');
    expect(c.scopes).toEqual([]);
    await expect(ExternalIntegrationService.connectPlatform(sid, 'leetcode' as any, { username: '' })).rejects.toMatchObject({ statusCode: 400 });
    const synced = await ExternalIntegrationService.syncConnection(sid, c.id);
    expect(synced.sync_status).toBe('ERROR');
    expect(synced.status).toBe('LINKED');
  });

  it('imported jobs are private to the student and analysed against real profile skills', async () => {
    const job = await ExternalIntegrationService.importJob(sid, { title: 'Intern', company: 'Example', description: 'We use Python and Docker.' } as any);
    expect(job.location).toBe('');
    expect(job.required_skills).toEqual(expect.arrayContaining(['Python', 'Docker']));
    expect((await ExternalIntegrationService.searchJobs('std_p3_plat_b')).some((j) => j.id === job.id)).toBe(false);
    await expect(ExternalIntegrationService.analyzeJob('std_p3_plat_b', job.id)).rejects.toMatchObject({ statusCode: 404 });
    const a = await ExternalIntegrationService.analyzeJob(sid, job.id);
    expect(a.matched_skills).toEqual([]);
    expect(a.fit_score).toBe(0);
    await expect(ExternalIntegrationService.importJob(sid, { title: 'x', company: 'y', description: 'z', job_url: 'javascript:alert(1)' } as any)).rejects.toMatchObject({ statusCode: 400 });
  });
});

describe('Phase 3: no demo connections or sample provider data', () => {
  it('the demo account has no seeded CONNECTED platforms, activity, evidence or sample jobs', async () => {
    const { ExternalIntegrationService } = await import('../../server/services/externalIntegrationService');
    expect(await ExternalIntegrationService.listConnections('std_demo_1')).toEqual([]);
    expect(await ExternalIntegrationService.listActivities('std_demo_1')).toEqual([]);
    expect(await ExternalIntegrationService.getAggregatedSkillEvidence('std_demo_1')).toEqual([]);
    expect(await ExternalIntegrationService.searchJobs('std_demo_1')).toEqual([]);
    expect((await ExternalIntegrationService.checkProfileConsistency('std_demo_1')).overall_consistency_score).toBeNull();
  });

  it('registry providers no longer produce sample sync data or fake OAuth URLs', async () => {
    const { ExternalIntegrationRegistry } = await import('../../server/services/externalIntegrationRegistry');
    for (const info of ExternalIntegrationRegistry.getAllProviders()) {
      const p = ExternalIntegrationRegistry.get(info.id)!;
      await expect(p.syncData('std_x', {} as any)).rejects.toThrow(/not available/);
      await expect(p.initiateAuth('std_x')).rejects.toThrow();
      await expect(p.connectAccount('std_x', {})).rejects.toThrow();
    }
  });
});

describe('Phase 3: the seeded demo login has no invented connections or scores', () => {
  it('no external profiles, GitHub connection, repositories or scored mock interview for std_01j8k9x2p4', async () => {
    const { db } = await import('../../server/db/database');
    await db.initialize();
    expect(await db.getExternalProfiles('std_01j8k9x2p4')).toEqual([]);
    expect(await db.getGitHubConnection('std_01j8k9x2p4')).toBeNull();
    expect(await db.getGitHubRepositories('std_01j8k9x2p4')).toEqual([]);
    expect(await db.getMockInterviewSessions('std_01j8k9x2p4')).toEqual([]);
  });

  it('retireFabricatedDemoData removes such records left in an old snapshot', async () => {
    const { db } = await import('../../server/db/database');
    (db as any).mockInterviewSessions.set('mock_sess_seed_01', { id: 'mock_sess_seed_01', student_id: 'std_01j8k9x2p4', created_at: '' });
    (db as any).githubConnections.set('std_01j8k9x2p4', { id: 'gh_conn_01', student_id: 'std_01j8k9x2p4', is_connected: true });
    (db as any).studentExternalProfiles.set('std_01j8k9x2p4', [{ id: 'prof_li_std_01j8k9x2p4' }, { id: 'prof_kept' }]);
    expect(db.retireFabricatedDemoData()).toBe(3);
    expect((await db.getExternalProfiles('std_01j8k9x2p4')).map((p: any) => p.id)).toEqual(['prof_kept']);
    (db as any).studentExternalProfiles.delete('std_01j8k9x2p4');
  });
});
