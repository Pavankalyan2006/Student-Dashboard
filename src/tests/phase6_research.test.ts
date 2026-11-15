import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { AddressInfo } from 'net';
import type { Server } from 'http';

process.env.DATA_PERSISTENCE = 'off';
process.env.RESEARCH_LIVE_SEARCH = 'off'; // no network in tests: the DOI is never looked up

import { extractPaperMetadata } from '../../server/services/paperMetadataExtractor';
import { keyTerms, overlap, overlapLevel, verbatimOnly, NOVELTY_DISCLAIMER } from '../../server/services/researchIntelligenceService';
import { ResearchCitationService } from '../../server/services/researchCitationService';
import { titlesAgree } from '../../server/services/researchService';
import { DocumentAIService } from '../../server/services/documentAi';
import { MlLabService } from '../../server/services/mlLabService';

const PAGE1 = `Proceedings of the 2021 Conference on Learning Systems
Graph Neural Networks for Traffic Forecasting
in Dense Urban Road Networks
Asha Raman, Vikram Singh and Li Wei
Department of Computer Science, Example Institute of Technology
asha@example.edu
Abstract
We study short-term traffic forecasting with graph neural networks over road sensor graphs. Our model combines spatial graph
convolutions with temporal attention and is evaluated on two public sensor datasets, where it reduces mean absolute error compared
with recurrent baselines while using fewer parameters.
Keywords: graph neural networks; traffic forecasting; spatio-temporal models
1. Introduction
Traffic forecasting matters for city planning. DOI: 10.1234/lsys.2021.0042.`;

const PAGE3 = `Results discussion continues here.
References
[1] A. Author, "A survey of traffic prediction," Transport Journal, 2019.
[2] B. Author and C. Author, "Graph convolution for roads," in Proc. GraphConf, 2020.
[3] D. Author, "Attention is useful," arXiv preprint, 2017.`;

describe('PDF metadata extraction', () => {
  const meta = extractPaperMetadata([
    { page_number: 1, text: PAGE1 },
    { page_number: 2, text: 'Method section text.' },
    { page_number: 3, text: PAGE3 },
  ]);

  it('reads title, authors, abstract, year, DOI, keywords and references from the text, with pages', () => {
    expect(meta.title).toBe('Graph Neural Networks for Traffic Forecasting in Dense Urban Road Networks');
    expect(meta.authors).toEqual(['Asha Raman', 'Vikram Singh', 'Li Wei']);
    expect(meta.abstract).toMatch(/^We study short-term traffic forecasting/);
    expect(meta.abstract).not.toMatch(/Keywords/);
    expect(meta.publication_year).toBe(2021);
    expect(meta.doi).toBe('10.1234/lsys.2021.0042');
    expect(meta.keywords).toEqual(['graph neural networks', 'traffic forecasting', 'spatio-temporal models']);
    expect(meta.references).toHaveLength(3);
    expect(meta.provenance.references?.page).toBe(3);
    expect(meta.provenance.authors?.needs_check).toBe(true);
    expect(meta.missing).toEqual([]);
  });

  it('leaves fields empty when they are not in the text, and never uses the current year', () => {
    const bare = extractPaperMetadata([{ page_number: 1, text: 'lecture notes\nsome text without structure' }]);
    expect(bare.authors).toEqual([]);
    expect(bare.publication_year).toBe(0);
    expect(bare.abstract).toBe('');
    expect(bare.doi).toBeUndefined();
    expect(bare.missing).toEqual(expect.arrayContaining(['authors', 'abstract', 'publication_year', 'doi', 'keywords', 'references']));
  });
});

describe('Citations never invent details', () => {
  const paper: any = { title: 'A Study', authors: [], publication_year: 0, venue: '', doi: undefined };
  it('leaves out a missing author, year and venue', () => {
    expect(ResearchCitationService.formatCitation(paper, 'APA')).toBe('A Study. (n.d.).');
    expect(ResearchCitationService.formatCitation(paper, 'IEEE')).toBe('"A Study."');
    const bib = ResearchCitationService.toBibTeX(paper);
    expect(bib).not.toMatch(/author=|year=|journal=|2024|Academic/);
    for (const style of ['APA', 'IEEE', 'MLA'] as const) {
      expect(ResearchCitationService.formatCitation(paper, style)).not.toMatch(/Academic Contributor|Academic Proceedings|\b20\d\d\b/);
    }
  });
  it('formats a complete record', () => {
    const full: any = { title: 'GNN Traffic', authors: ['Asha Raman', 'Li Wei'], publication_year: 2021, venue: 'LSys', doi: '10.1/x' };
    expect(ResearchCitationService.formatCitation(full, 'APA')).toBe('Asha Raman & Li Wei (2021). GNN Traffic. LSys. https://doi.org/10.1/x');
    expect(ResearchCitationService.formatCitation(full, 'IEEE')).toBe('Asha Raman, Li Wei, "GNN Traffic," in LSys, 2021. doi: 10.1/x.');
  });
  it('trusts a DOI match only when the titles agree', () => {
    expect(titlesAgree('Graph Neural Networks for Traffic Forecasting', 'Graph neural networks for traffic forecasting in cities')).toBe(true);
    expect(titlesAgree('Graph Neural Networks for Traffic Forecasting', 'Protein folding with transformers')).toBe(false);
  });
});

describe('Novelty (overlap) helpers', () => {
  it('scores word overlap, not novelty', () => {
    const terms = keyTerms('Traffic forecasting with graph neural networks on road sensor graphs', 10);
    expect(terms).toEqual(expect.arrayContaining(['traffic', 'forecasting', 'graph', 'neural', 'network', 'road', 'sensor']));
    const hi = overlap(terms, 'Graph neural network traffic forecasting from road sensors');
    expect(hi.score).toBeGreaterThanOrEqual(50);
    expect(overlapLevel(hi.score)).toBe('HIGH');
    expect(overlap(terms, 'Protein folding with diffusion').score).toBe(0);
    expect(NOVELTY_DISCLAIMER).toMatch(/not a novelty or patentability assessment/);
  });
  it('keeps only quotes that really appear in the source', () => {
    const src = 'We propose a model. It reduces error by a margin on two datasets.';
    expect(verbatimOnly(['It reduces error by a margin', 'It doubles accuracy on ImageNet'], src)).toEqual(['It reduces error by a margin']);
  });
});

describe('Document AI citations', () => {
  it('replaces a quote that is not on the cited page with the page text', () => {
    const chunks = [{ page_number: 2, chunk_id: 'c1', content: 'Paging maps virtual addresses to frames.' }];
    const out = DocumentAIService.validateCitations([{ page_number: 2, quoted_text: 'Paging was invented in 1990' }, { page_number: 9, quoted_text: 'x' }], 'd1', chunks);
    expect(out).toHaveLength(1);
    expect(out[0].quoted_text).toBe('Paging maps virtual addresses to frames.');
  });
});

describe('ML Lab sample data', () => {
  it('reports column statistics computed from the generated rows', () => {
    const iris = MlLabService.getDatasets('nobody').find((d) => d.id === 'ds_iris')!;
    const rows = (iris as any).raw_data as Record<string, number>[];
    const col = iris.columns_metadata!.find((c) => c.name === 'sepal_length')!;
    expect(col.min).toBe(Math.min(...rows.map((r) => r.sepal_length)));
    expect(col.max).toBe(Math.max(...rows.map((r) => r.sepal_length)));
    expect(iris.total_samples).toBe(rows.length);
  });
  it('starter code contains no made-up results', () => {
    const ws = MlLabService.ensureStudentWorkspaces(`fresh_${Date.now()}`)[0];
    const code = ws.files.find((f) => f.name === 'train_model.py')!.content;
    expect(code).not.toMatch(/0\.96|0\.94|"setosa"/);
  });
});

describe('Research and Innovation API', () => {
  let server: Server;
  let base = '';
  const tokens: Record<'a' | 'b', string> = { a: '', b: '' };
  const ids: Record<'a' | 'b', string> = { a: '', b: '' };
  const call = async (who: 'a' | 'b' | null, method: string, path: string, body?: unknown) => {
    const res = await fetch(`${base}/api/v1${path}`, { method, headers: { 'content-type': 'application/json', ...(who ? { authorization: `Bearer ${tokens[who]}` } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) });
    const json: any = await res.json().catch(() => ({}));
    return { status: res.status, data: json.data, json };
  };
  let projectId = '';

  beforeAll(async () => {
    const { createApp } = await import('../../server/app');
    const app = await createApp();
    server = app.listen(0);
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    const stamp = Date.now().toString(36);
    for (const who of ['a', 'b'] as const) {
      const r = await call(null, 'POST', '/auth/register', { full_name: `P6 ${who}`, email: `p6-${who}-${stamp}@example.com`, password: 'Str0ng!Passw0rd#2026' });
      tokens[who] = r.data.token;
      ids[who] = r.data.student?.id;
    }
    const p = await call('a', 'POST', '/research', { title: 'Traffic GNN', topic: 'Traffic forecasting', domain: 'AI', branch: 'CSE', research_type: 'EXPERIMENTAL', objective: 'Forecast traffic' });
    projectId = p.data.id;
  }, 30_000);
  afterAll(() => new Promise<void>((done) => (server ? server.close(() => done()) : done())));

  it('imports an uploaded paper with metadata from its text and never lists the uploader as author', async () => {
    const { db } = await import('../../server/db/database');
    const doc = await db.createDocument({ student_id: ids.a, title: 'gnn.pdf', original_filename: 'gnn.pdf', mime_type: 'application/pdf', file_extension: 'pdf', file_size: 1000, storage_key: 'k', status: 'READY' } as any);
    await db.createDocumentPages(doc.id, ids.a, [{ page_number: 1, text: PAGE1 }, { page_number: 3, text: PAGE3 }]);
    // Another student cannot import it.
    expect((await call('b', 'POST', `/research/${projectId}/papers/import`, { document_id: doc.id })).status).toBeGreaterThanOrEqual(403);
    const r = await call('a', 'POST', `/research/${projectId}/papers/import`, { document_id: doc.id });
    expect(r.status).toBe(201);
    expect(r.data.authors).toEqual(['Asha Raman', 'Vikram Singh', 'Li Wei']);
    expect(r.data.authors).not.toContain(ids.a);
    expect(r.data.venue).toBe('');
    expect(r.data.publication_year).toBe(2021);
    expect(r.data.metadata.field_provenance.abstract.page).toBe(1);
    expect(r.data.metadata.doi_check.status).toBe('NOT_CHECKED');
    expect(r.data.metadata.reference_count).toBe(3);

    // The student corrects the venue; the field is marked as theirs.
    const e = await call('a', 'PATCH', `/research/papers/${r.data.id}`, { venue: 'LSys 2021' });
    expect(e.data.venue).toBe('LSys 2021');
    expect(e.data.metadata.field_provenance.venue.source).toBe('STUDENT_EDITED');
    expect((await call('a', 'PATCH', `/research/papers/${r.data.id}`, { doi: 'not-a-doi' })).status).toBe(400);
    expect((await call('b', 'PATCH', `/research/papers/${r.data.id}`, { venue: 'x' })).status).toBeGreaterThanOrEqual(403);
  });

  it('refuses to answer a paper with no text, and keeps questions owner-only', async () => {
    const saved = await call('a', 'POST', `/research/${projectId}/papers/import`, { paper: { title: 'No abstract paper', abstract: '' } });
    const r = await call('a', 'POST', `/research/papers/${saved.data.id}/ask`, { question: 'What dataset?' });
    expect(r.status).toBe(422);
    expect((await call('a', 'POST', `/research/papers/${saved.data.id}/ask`, { question: '' })).status).toBe(400);
    expect((await call('b', 'POST', `/research/papers/${saved.data.id}/ask`, { question: 'x' })).status).toBeGreaterThanOrEqual(403);
  });

  it('starts ideas empty, saves the workspace, and keeps it owner-only', async () => {
    const created = await call('a', 'POST', `/research/${projectId}/ideas`, { title: 'GNN for bus arrival times', problem: 'Bus arrival estimates are poor' });
    expect(created.status).toBe(201);
    expect(created.data.technologies).toEqual([]);
    expect(created.data.dataset_possibilities).toBe('');
    expect(created.data.expected_contribution).toBe('');
    expect((await call('a', 'POST', `/research/${projectId}/ideas`, { problem: 'no title' })).status).toBe(400);

    const id = created.data.id;
    const u = await call('a', 'PATCH', `/research/ideas/${id}`, {
      hypothesis: 'Graph models beat ARIMA', research_questions: ['Does topology help?'], evaluation_metrics: ['MAE'],
      timeline: [{ title: 'Collect data', target_date: '2027-01-15', done: false }], outline: '1. Intro', workspace_status: 'DEVELOPING',
    });
    expect(u.status).toBe(200);
    expect(u.data.timeline[0].title).toBe('Collect data');
    expect(u.data.workspace_status).toBe('DEVELOPING');
    expect((await call('a', 'PATCH', `/research/ideas/${id}`, { timeline: [{ title: 'x', target_date: '15/01/2027' }] })).status).toBe(400);
    expect((await call('a', 'PATCH', `/research/ideas/${id}`, { workspace_status: 'PATENTED' })).status).toBe(400);
    expect((await call('a', 'PATCH', `/research/ideas/${id}`, { related_paper_ids: ['paper_not_here'] })).status).toBe(400);
    expect((await call('b', 'PATCH', `/research/ideas/${id}`, { title: 'stolen' })).status).toBe(404);
    expect((await call('b', 'POST', `/research/ideas/${id}/novelty-check`)).status).toBe(404);
    expect((await call('b', 'DELETE', `/research/ideas/${id}`)).status).toBe(404);
    expect((await call('a', 'DELETE', `/research/ideas/${id}`)).data.deleted).toBe(true);
  });

  it('links only the student’s own ML experiments, with the metrics that run recorded', async () => {
    const exp = await MlLabService.runExperiment(ids.a, {
      name: 'iris rf', dataset_id: 'ds_iris', dataset_name: 'Iris', target_column: 'species',
      feature_columns: ['sepal_length', 'sepal_width', 'petal_length', 'petal_width'], task_type: 'CLASSIFICATION', model_type: 'random_forest', train_split: 0.8,
    } as any);
    const other = await MlLabService.runExperiment(ids.b, {
      name: 'b run', dataset_id: 'ds_iris', dataset_name: 'Iris', target_column: 'species',
      feature_columns: ['petal_length', 'petal_width'], task_type: 'CLASSIFICATION', model_type: 'decision_tree', train_split: 0.8,
    } as any);
    expect((await call('a', 'POST', `/research/${projectId}/experiments`, { experiment_id: other.id })).status).toBe(404);
    // Setting the ids through the project update is ignored.
    await call('a', 'PATCH', `/research/${projectId}`, { linked_experiment_ids: [other.id] });
    expect((await call('a', 'GET', `/research/${projectId}/experiments`)).data.linked).toEqual([]);

    const l = await call('a', 'POST', `/research/${projectId}/experiments`, { experiment_id: exp.id });
    expect(l.status).toBe(200);
    expect(l.data.linked).toHaveLength(1);
    expect(l.data.linked[0].metrics.accuracy).toBe(exp.metrics.accuracy);
    expect(l.data.available.map((x: any) => x.id)).not.toContain(other.id);
    expect((await call('b', 'GET', `/research/${projectId}/experiments`)).status).toBeGreaterThanOrEqual(403);
    const u = await call('a', 'DELETE', `/research/${projectId}/experiments/${exp.id}`);
    expect(u.data.linked).toEqual([]);
  });
});
