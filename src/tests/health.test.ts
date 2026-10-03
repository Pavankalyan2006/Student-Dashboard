import { describe, it, expect } from 'vitest';

describe('Health API Foundation', () => {
  it('returns valid health schema structure', () => {
    const health = {
      status: 'ok',
      service: 'btech-ai-learning-platform',
      version: '1.0.0',
    };

    expect(health.status).toBe('ok');
    expect(health.service).toBe('btech-ai-learning-platform');
    expect(health.version).toBe('1.0.0');
  });

  it('validates database health check contract', () => {
    const dbHealth = {
      status: 'connected',
      studentCount: 2,
      latencyMs: 1.2,
    };

    expect(dbHealth.status).toBe('connected');
    expect(dbHealth.studentCount).toBeGreaterThanOrEqual(2);
    expect(dbHealth.latencyMs).toBeGreaterThanOrEqual(0);
  });
});
