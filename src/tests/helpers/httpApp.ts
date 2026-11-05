// Minimal HTTP harness for API tests: the real /api/v1 router with the same auth and error
// middleware as server.ts, on an ephemeral port. Synthetic students only.
import express from 'express';
import cookieParser from 'cookie-parser';
import type { AddressInfo } from 'net';
import { authenticate } from '../../../server/middleware/auth';
import { requestIdMiddleware } from '../../../server/middleware/requestId';
import { errorHandler } from '../../../server/middleware/errorHandler';
import { apiV1Router } from '../../../server/api/router';
import { db } from '../../../server/db/database';

export interface TestApi {
  base: string;
  close: () => Promise<void>;
  call: (method: string, path: string, token?: string, body?: any) => Promise<{ status: number; body: any }>;
  register: (label: string) => Promise<{ token: string; id: string; email: string }>;
}

export async function startTestApi(): Promise<TestApi> {
  await db.initialize();
  const app = express();
  app.use(express.json({ limit: '25mb' }));
  app.use(cookieParser());
  app.use(requestIdMiddleware);
  app.use(authenticate);
  app.use('/api/v1', apiV1Router);
  app.use('/api', errorHandler);
  const server = await new Promise<import('http').Server>((resolve) => {
    const s = app.listen(0, () => resolve(s));
  });
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api/v1`;
  const call = async (method: string, path: string, token?: string, body?: any) => {
    const r = await fetch(base + path, {
      method,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    let json: any = null;
    try {
      json = await r.json();
    } catch {}
    return { status: r.status, body: json };
  };
  const register = async (label: string) => {
    const email = `p2.${label}.${Date.now()}.${Math.random().toString(36).slice(2, 7)}@example.test`;
    const r = await call('POST', '/auth/register', undefined, { email, password: 'TestPass123', name: `Phase2 ${label}` });
    const token = r.body?.data?.token;
    const id = r.body?.data?.user?.id || r.body?.data?.student?.id || r.body?.data?.user_id;
    await call('POST', '/students/me/onboarding/complete', token, {});
    return { token, id, email };
  };
  return { base, call, register, close: () => new Promise((res) => server.close(() => res())) };
}
