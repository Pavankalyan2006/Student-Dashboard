import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import type { AddressInfo } from 'net';
import type { Server } from 'http';

process.env.DATA_PERSISTENCE = 'off';

import { renderDiagram, DIAGRAM_TEMPLATES, DIAGRAM_KINDS, erFromDatabaseDesign, parseEr, renderClass, renderSequence } from '../../server/services/diagramDsl';
import { sanitiseArchitecture } from '../../server/services/architectureStudioService';
import { AIService } from '../../server/ai/service';
import { isAIGenerationRequest } from '../../server/middleware/rateLimiter';

describe('Architecture Studio: diagram language', () => {
  it('draws every template without errors', () => {
    const counts = DIAGRAM_KINDS.map((k) => {
      const r = renderDiagram(k, DIAGRAM_TEMPLATES[k]);
      expect(r.errors).toEqual([]);
      expect(r.svg.startsWith('<svg')).toBe(true);
      return [k, r.nodes, r.edges];
    });
    expect(counts).toEqual([
      ['class', 3, 2],
      ['sequence', 4, 6],
      ['flowchart', 8, 9],
      ['er', 3, 2],
    ]);
  });

  it('escapes all text, so a diagram cannot carry markup or script', () => {
    const r = renderDiagram('flowchart', 'a[<script>alert(1)</script>] --> b{x" onload="y}');
    expect(r.svg).not.toMatch(/<script|onload="y/);
    expect(r.svg).toContain('&lt;script&gt;');
    const c = renderDiagram('class', 'class A { +x: <img src=x onerror=alert(1)> }');
    expect(c.svg).not.toContain('<img');
  });

  it('reports the line of each mistake', () => {
    const r = renderDiagram('sequence', 'participant A\nA -> B: hi\nthis is not valid');
    expect(r.errors).toEqual([{ line: 3, message: expect.stringMatching(/A -> B: message/) }]);
    expect(renderDiagram('class', 'class A {\n  x: int').errors[0].message).toMatch(/closing/);
    expect(renderDiagram('flowchart', 'a --> ').errors.length).toBe(1);
  });

  it('parses UML relations, multiplicities and stereotypes', () => {
    const r = renderClass('interface Shape\nclass Circle { -r: double; +area(): double }\nCircle ..|> Shape\nOrder "1" *-- "1..*" Line : contains');
    expect([r.nodes, r.edges, r.errors]).toEqual([4, 2, []]);
    expect(r.svg).toContain('«interface»');
    expect(r.svg).toContain('url(#diamondFilled)');
    expect(r.svg).toContain('>1..*<');
    const s = renderSequence('A ->> B: event\nB -> B: self call\nnote over A, B: both');
    expect([s.nodes, s.edges, s.errors]).toEqual([2, 2, []]);
  });

  it('reads ER cardinalities and keys, and converts the Database Design workspace', () => {
    const { entities, rels } = parseEr('entity S { *id int; dept_id int FK }\nS }o--|| D : belongs to');
    expect(entities.get('S')!.attrs).toEqual([{ name: 'id', type: 'int', key: 'PK' }, { name: 'dept_id', type: 'int', key: 'FK' }]);
    expect(rels).toEqual([{ a: 'S', b: 'D', ca: '0..*', cb: '1', label: 'belongs to' }]);
    const src = erFromDatabaseDesign({
      entities: [
        { id: 'e1', name: 'users', attributes: [{ name: 'id', data_type: 'UUID', is_primary_key: true, is_nullable: false }] },
        { id: 'e2', name: 'posts', attributes: [{ name: 'user_id', data_type: 'UUID', is_primary_key: false, is_foreign_key: true, is_nullable: false }] },
      ],
      relationships: [{ id: 'r1', source_entity: 'e1', target_entity: 'e2', type: 'ONE_TO_MANY' }],
    });
    expect(src).toBe('entity users {\n  *id UUID\n}\nentity posts {\n  user_id UUID FK\n}\nusers ||--o{ posts');
    expect(renderDiagram('er', src).errors).toEqual([]);
    expect(erFromDatabaseDesign(undefined)).toBe('');
  });
});

describe('Architecture Studio: AI architecture drafts are checked', () => {
  it('keeps known component types and real connections, and lays them out', () => {
    const r = sanitiseArchitecture({
      components: [
        { name: 'Web', type: 'web_client' },
        { name: 'API', type: 'BACKEND_SERVICE', tech_choice: 'Express' },
        { name: 'DB', type: 'SQL_DATABASE' },
        { name: 'Magic', type: 'QUANTUM_ENGINE' },
        { name: 'api', type: 'CACHE' }, // duplicate name
      ],
      connections: [
        { from: 'Web', to: 'API', protocol: 'https' },
        { from: 'API', to: 'DB', protocol: 'carrier pigeon' },
        { from: 'API', to: 'Nowhere' },
        { from: 'API', to: 'API' },
      ],
    });
    expect(r.components.map((c) => [c.name, c.type, c.category])).toEqual([
      ['Web', 'WEB_CLIENT', 'APPLICATION'],
      ['API', 'BACKEND_SERVICE', 'APPLICATION'],
      ['DB', 'SQL_DATABASE', 'STORAGE'],
    ]);
    expect(r.connections.map((c) => [c.from, c.to, c.protocol])).toEqual([
      ['ai_1', 'ai_2', 'HTTPS'],
      ['ai_2', 'ai_3', 'HTTPS'], // unknown protocol falls back
    ]);
    expect(r.dropped).toBe(4);
    const ys = r.components.map((c) => c.position.y);
    expect(ys[0]).toBeLessThan(ys[1]);
    expect(ys[1]).toBeLessThan(ys[2]);
  });
});

describe('Architecture Studio over HTTP', () => {
  let server: Server;
  let base = '';
  const tokens: Record<'a' | 'b', string> = { a: '', b: '' };
  const call = async (who: 'a' | 'b' | null, method: string, path: string, body?: unknown) => {
    const res = await fetch(`${base}/api/v1${path}`, { method, headers: { 'content-type': 'application/json', ...(who ? { authorization: `Bearer ${tokens[who]}` } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) });
    const json: any = await res.json().catch(() => ({}));
    return { status: res.status, data: json.data, json };
  };
  beforeAll(async () => {
    const { createApp } = await import('../../server/app');
    const app = await createApp();
    server = app.listen(0);
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    const stamp = Date.now().toString(36);
    for (const who of ['a', 'b'] as const) {
      const r = await call(null, 'POST', '/auth/register', { full_name: `AS ${who}`, email: `as-${who}-${stamp}@example.com`, password: 'Str0ng!Passw0rd#2026' });
      tokens[who] = r.data.token;
    }
  }, 30_000);
  afterAll(() => new Promise<void>((done) => (server ? server.close(() => done()) : done())));
  afterEach(() => vi.restoreAllMocks());

  const DESC = 'A canteen app where students pre-order food and get notified when it is ready.';

  it('needs a session, validates input and counts as an AI request', async () => {
    expect((await call(null, 'POST', '/system-design/architecture/propose', { description: DESC })).status).toBe(401);
    expect((await call('a', 'POST', '/system-design/architecture/propose', { description: 'too short' })).status).toBe(400);
    expect((await call('a', 'POST', '/system-design/diagrams/propose', { kind: 'gantt', description: DESC })).status).toBe(400);
    expect(isAIGenerationRequest('POST', '/api/v1/system-design/architecture/propose')).toBe(true);
    expect(isAIGenerationRequest('POST', '/api/v1/system-design/diagrams/propose')).toBe(true);
  });

  it('returns a checked architecture draft and says plainly when the AI is unavailable', async () => {
    vi.spyOn(AIService, 'generate').mockResolvedValueOnce({
      text: JSON.stringify({
        components: [{ name: 'App', type: 'MOBILE_CLIENT' }, { name: 'API', type: 'BACKEND_SERVICE' }, { name: 'Orders DB', type: 'SQL_DATABASE' }],
        connections: [{ from: 'App', to: 'API', protocol: 'HTTPS' }, { from: 'API', to: 'Orders DB', protocol: 'SQL' }],
        rationale: 'Simple three-tier design.',
        bottlenecks: ['The database at lunch time.'],
      }),
      provider: 'test',
    } as any);
    const r = await call('a', 'POST', '/system-design/architecture/propose', { description: DESC });
    expect(r.status).toBe(200);
    expect(r.data.components).toHaveLength(3);
    expect(r.data.connections.map((c: any) => c.protocol)).toEqual(['HTTPS', 'SQL']);
    expect(r.data.bottlenecks).toEqual(['The database at lunch time.']);
    expect(r.data.note).toMatch(/AI draft/);

    vi.spyOn(AIService, 'generate').mockResolvedValueOnce({ text: '', unavailable: true } as any);
    vi.spyOn(AIService, 'isUnavailableResult').mockReturnValue(true);
    const down = await call('a', 'POST', '/system-design/architecture/propose', { description: DESC });
    expect(down.status).toBe(503);
    expect(down.json.message).toMatch(/not available/);
  });

  it('refuses a diagram draft that cannot be drawn, and returns one that can', async () => {
    vi.spyOn(AIService, 'generate').mockResolvedValueOnce({ text: JSON.stringify({ source: 'graph TD; A-->B; this is mermaid-ish nonsense???' }), provider: 'test' } as any);
    expect((await call('a', 'POST', '/system-design/diagrams/propose', { kind: 'sequence', description: DESC })).status).toBe(502);
    vi.spyOn(AIService, 'generate').mockResolvedValueOnce({ text: JSON.stringify({ source: 'Student -> App: Order\nApp --> Student: Ready', explanation: 'Two steps.' }), provider: 'test' } as any);
    const ok = await call('a', 'POST', '/system-design/diagrams/propose', { kind: 'sequence', description: DESC });
    expect(ok.status).toBe(200);
    expect(ok.data).toMatchObject({ kind: 'sequence', errors: [], explanation: 'Two steps.' });
  });

  it('respects the Coding agent switch', async () => {
    const spy = vi.spyOn(AIService, 'generate');
    await call('a', 'PATCH', '/agents/me/coding', { enabled: false });
    const r = await call('a', 'POST', '/system-design/architecture/propose', { description: DESC });
    expect(r.status).toBe(409);
    expect(spy).not.toHaveBeenCalled();
    await call('a', 'PATCH', '/agents/me/coding', { enabled: true });
  });

  it('saves diagrams with the student’s own project, validated', async () => {
    const p = await call('a', 'POST', '/system-design/projects', { title: 'Canteen', description: 'x' });
    const id = p.data.id;
    const saved = await call('a', 'PATCH', `/system-design/projects/${id}`, { diagrams: [{ kind: 'er', title: 'Schema', source: DIAGRAM_TEMPLATES.er }] });
    expect(saved.status).toBe(200);
    expect(saved.data.diagrams).toEqual([expect.objectContaining({ kind: 'er', title: 'Schema', source: DIAGRAM_TEMPLATES.er })]);
    expect((await call('a', 'PATCH', `/system-design/projects/${id}`, { diagrams: [{ kind: 'gantt', source: '' }] })).status).toBe(400);
    expect((await call('a', 'PATCH', `/system-design/projects/${id}`, { diagrams: [{ kind: 'er', source: 'x'.repeat(10_001) }] })).status).toBe(400);
    expect((await call('b', 'PATCH', `/system-design/projects/${id}`, { diagrams: [] })).status).toBeGreaterThanOrEqual(400);
    const again = await call('a', 'GET', `/system-design/projects/${id}`);
    expect(again.data.diagrams).toHaveLength(1);
  });
});
