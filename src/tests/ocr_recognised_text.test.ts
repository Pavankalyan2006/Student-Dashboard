import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { AddressInfo } from 'net';
import type { Server } from 'http';

process.env.DATA_PERSISTENCE = 'off';

import { joinPages, isImageFile, isPdfFile } from '../lib/ocr';

// A 1x1 PNG: an image has no text of its own, like a scan.
const PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
const PAGES = [
  { page_number: 1, text: 'UNIT I\n1. Explain the process state diagram. (10 marks)', confidence: 93 },
  { page_number: 2, text: "UNIT II\n4. Describe the banker's algorithm for deadlock avoidance.", confidence: 89 },
];

describe('OCR helpers', () => {
  it('recognises file types and joins pages', () => {
    expect(isPdfFile({ name: 'scan.PDF' })).toBe(true);
    expect(isImageFile({ name: 'photo.jpg' })).toBe(true);
    expect(isImageFile({ name: 'x', type: 'image/webp' })).toBe(true);
    expect(isImageFile({ name: 'notes.txt', type: 'text/plain' })).toBe(false);
    expect(joinPages([{ page_number: 1, text: 'a', confidence: 1 }, { page_number: 2, text: '', confidence: 0 }, { page_number: 3, text: 'b', confidence: 1 }])).toBe('a\n\nb');
  });
});

describe('Documents: saving text recognised in the browser', () => {
  let server: Server;
  let base = '';
  const tokens: Record<'a' | 'b', string> = { a: '', b: '' };
  const call = async (who: 'a' | 'b', method: string, path: string, body?: unknown) => {
    const res = await fetch(`${base}/api/v1${path}`, {
      method,
      headers: { 'content-type': 'application/json', authorization: `Bearer ${tokens[who]}` },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const json: any = await res.json().catch(() => ({}));
    return { status: res.status, data: json.data, json };
  };
  const waitReady = async (id: string) => {
    for (let i = 0; i < 60; i++) {
      const s = await call('a', 'GET', `/documents/${id}/status`);
      if (['READY', 'FAILED'].includes(s.data?.status)) return s.data.status;
      await new Promise((r) => setTimeout(r, 100));
    }
    return 'TIMEOUT';
  };
  // Identical files are de-duplicated on upload, so each upload gets a few distinct trailing bytes.
  let n = 0;
  const upload = async (name: string, mimeType: string, b64: string) => {
    if (mimeType.startsWith('image/')) b64 = Buffer.concat([Buffer.from(b64, 'base64'), Buffer.from(`#${++n}`)]).toString('base64');
    const r = await call('a', 'POST', '/documents', { title: name, originalName: name, mimeType, sizeBytes: Buffer.from(b64, 'base64').length, contentBase64: `data:${mimeType};base64,${b64}` });
    expect(r.status).toBeLessThan(300);
    expect(await waitReady(r.data.id)).toBe('READY');
    return r.data.id as string;
  };
  let subjectId = '';

  beforeAll(async () => {
    const { createApp } = await import('../../server/app');
    server = (await createApp()).listen(0);
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    const stamp = Date.now().toString(36);
    for (const who of ['a', 'b'] as const) {
      const r: any = await fetch(`${base}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ full_name: `OCR ${who}`, email: `ocr-${who}-${stamp}@example.com`, password: 'Str0ng!Passw0rd#2026' }),
      }).then((x) => x.json());
      tokens[who] = r.data.token;
    }
    const s = await call('a', 'POST', '/semester/subjects', { name: 'Operating Systems', code: 'OS', credits: 4, units: [{ id: 'u1', name: 'Unit 1', topics: [{ id: 'os-t1', name: 'Deadlock Avoidance', completed: false }] }] });
    subjectId = s.data.id;
  }, 30_000);
  afterAll(() => new Promise<void>((done) => (server ? server.close(() => done()) : done())));

  it('serves the stored file as its own bytes', async () => {
    const id = await upload('photo.png', 'image/png', PNG);
    const res = await fetch(`${base}/api/v1/documents/${id}/file`, { headers: { authorization: `Bearer ${tokens.a}` } });
    const bytes = Buffer.from(await res.arrayBuffer());
    expect(res.headers.get('content-type')).toContain('image/png');
    expect(bytes.subarray(1, 4).toString('latin1')).toBe('PNG');
  });

  it('indexes recognised pages of a scan, keeps the confidence, and makes them searchable', async () => {
    const id = await upload('scan-page.png', 'image/png', PNG);
    const before = await call('a', 'GET', `/documents/${id}`);
    expect(before.data.content_indexed).toBe(false);

    const saved = await call('a', 'POST', `/documents/${id}/recognised-text`, { pages: PAGES, page_count: 2 });
    expect(saved.status).toBe(200);
    expect(saved.data.content_indexed).toBe(true);
    expect(saved.data.metadata).toMatchObject({ text_source: 'ocr', ocr_confidence: 91, ocr_pages: 2 });

    const pages = await call('a', 'GET', `/documents/${id}/pages`);
    expect(pages.data.map((p: any) => [p.page_number, p.metadata.text_source, p.metadata.ocr_confidence])).toEqual([
      [1, 'ocr', 93],
      [2, 'ocr', 89],
    ]);
    const hits = await call('a', 'GET', `/documents/${id}/search?q=${encodeURIComponent("banker's algorithm")}`);
    expect(JSON.stringify(hits.data)).toContain('deadlock avoidance');

    // Processing the file again does not throw the recognised text away.
    await call('a', 'POST', `/documents/${id}/retry-processing`);
    expect(await waitReady(id)).toBe('READY');
    const again = await call('a', 'GET', `/documents/${id}/pages`);
    expect(again.data.filter((p: any) => p.text).length).toBe(2);
    expect((await call('a', 'GET', `/documents/${id}`)).data.content_indexed).toBe(true);

    // Recognising again (for example after a better scan) replaces the earlier text.
    const redo = await call('a', 'POST', `/documents/${id}/recognised-text`, { pages: [{ page_number: 1, text: 'Explain paging.', confidence: 80 }] });
    expect(redo.status).toBe(200);
    expect((await call('a', 'GET', `/documents/${id}/pages`)).data).toHaveLength(1);
  });

  it('refuses bad input, documents with their own text, and other students', async () => {
    const id = await upload('another.png', 'image/png', PNG);
    expect((await call('a', 'POST', `/documents/${id}/recognised-text`, {})).status).toBe(400);
    expect((await call('a', 'POST', `/documents/${id}/recognised-text`, { pages: [{ page_number: 1, text: '   ', confidence: 50 }] })).status).toBe(400);
    expect((await call('a', 'POST', `/documents/${id}/recognised-text`, { pages: [PAGES[0], PAGES[0]] })).status).toBe(400);
    expect((await call('a', 'POST', `/documents/${id}/recognised-text`, { pages: [{ ...PAGES[0], page_number: 0 }] })).status).toBe(400);

    const other = await call('b', 'POST', `/documents/${id}/recognised-text`, { pages: PAGES });
    expect(other.status).toBeGreaterThanOrEqual(403);
    expect((await call('a', 'GET', `/documents/${id}`)).data.content_indexed).toBe(false);

    const txt = await upload('notes.txt', 'text/plain', Buffer.from('Deadlock avoidance notes.').toString('base64'));
    const refused = await call('a', 'POST', `/documents/${txt}/recognised-text`, { pages: PAGES });
    expect(refused.status).toBe(400);
    expect(refused.json.message || refused.json.error?.message).toMatch(/scanned PDFs and images/);
  });

  it('marks a previous paper whose text was recognised from a scan', async () => {
    const r = await call('a', 'POST', '/previous-papers/me', { subject_id: subjectId, text: PAGES.map((p) => p.text).join('\n'), text_source: 'ocr' });
    expect(r.status).toBe(200);
    expect(r.data.source).toBe('ocr');
    expect(r.data.questions.length).toBe(2);
  });
});
