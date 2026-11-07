// Phase 3 RAG evaluation: runs the real ingestion pipeline (upload -> extract -> chunk -> embed -> index) on a small
// synthetic corpus, then measures retrieval with real queries. Usage: DATA_PERSISTENCE=off npx tsx scripts/audit/phase3-rag-eval.ts
// No AI provider is configured, so answer generation is not evaluated here (answers are extractive); see the report.
import { db } from '../../server/db/database';
import { DocumentService } from '../../server/services/documents';
import { DocumentProcessingService } from '../../server/processing/processor';
import { KnowledgeBaseService } from '../../server/services/knowledgeBaseService';
import { DocumentRetrievalService } from '../../server/rag/retriever';

const A = 'std_rag_eval_a';
const B = 'std_rag_eval_b';

const CORPUS: { key: string; title: string; text: string }[] = [
  { key: 'deadlock', title: 'OS Unit 3 - Deadlocks', text: 'A deadlock occurs when processes wait forever for resources held by each other. The four Coffman conditions are mutual exclusion, hold and wait, no preemption and circular wait. The Banker algorithm avoids deadlock by granting a request only if the system remains in a safe state.' },
  { key: 'paging', title: 'OS Unit 4 - Paging', text: 'Paging divides memory into fixed-size frames and processes into pages. A page table maps page numbers to frame numbers. When a page is missing the MMU raises a page fault and the handler loads the page from disk. The TLB caches recent translations to speed up address translation.' },
  { key: 'scheduling', title: 'OS Unit 2 - CPU Scheduling', text: 'Round robin scheduling gives each process a fixed time quantum. Shortest job first minimises average waiting time but can starve long jobs. Priority scheduling uses aging to prevent starvation.' },
  { key: 'normalization', title: 'DBMS - Normalization', text: 'Normalization removes redundancy. A relation is in third normal form when no non-key attribute depends transitively on the key. BCNF requires every determinant to be a candidate key. Functional dependencies drive decomposition.' },
  { key: 'transactions', title: 'DBMS - Transactions', text: 'ACID stands for atomicity, consistency, isolation and durability. Two-phase locking guarantees conflict serializability. Write-ahead logging supports recovery after a crash.' },
  { key: 'tcp', title: 'Computer Networks - TCP', text: 'TCP provides reliable, ordered delivery using sequence numbers and acknowledgements. The three-way handshake uses SYN, SYN-ACK and ACK. Congestion control uses slow start and congestion avoidance with a congestion window.' },
  { key: 'routing', title: 'Computer Networks - Routing', text: 'Distance vector routing exchanges tables with neighbours and can suffer from count to infinity. Link state routing floods link state advertisements and runs Dijkstra shortest path on each router. OSPF is a link state protocol; RIP is distance vector.' },
  { key: 'dp', title: 'DSA - Dynamic Programming', text: 'Dynamic programming solves problems with overlapping subproblems and optimal substructure. Memoization caches results top-down; tabulation fills a table bottom-up. The 0/1 knapsack and longest common subsequence are classic examples.' },
];

// Expected document for each query. "lexical" queries share words with the text; "paraphrase" queries do not.
const QUERIES: { q: string; expect: string; kind: 'lexical' | 'paraphrase' }[] = [
  { q: 'What are the four Coffman conditions for deadlock?', expect: 'deadlock', kind: 'lexical' },
  { q: 'How does the Banker algorithm keep the system in a safe state?', expect: 'deadlock', kind: 'lexical' },
  { q: 'What happens on a page fault?', expect: 'paging', kind: 'lexical' },
  { q: 'What does the TLB cache?', expect: 'paging', kind: 'lexical' },
  { q: 'Explain round robin time quantum', expect: 'scheduling', kind: 'lexical' },
  { q: 'How does aging prevent starvation in priority scheduling?', expect: 'scheduling', kind: 'lexical' },
  { q: 'When is a relation in third normal form?', expect: 'normalization', kind: 'lexical' },
  { q: 'What does BCNF require of determinants?', expect: 'normalization', kind: 'lexical' },
  { q: 'What does ACID stand for?', expect: 'transactions', kind: 'lexical' },
  { q: 'How does two-phase locking ensure serializability?', expect: 'transactions', kind: 'lexical' },
  { q: 'Describe the TCP three-way handshake', expect: 'tcp', kind: 'lexical' },
  { q: 'What is slow start in congestion control?', expect: 'tcp', kind: 'lexical' },
  { q: 'Why does distance vector routing have count to infinity?', expect: 'routing', kind: 'lexical' },
  { q: 'Which routing protocol uses Dijkstra?', expect: 'routing', kind: 'lexical' },
  { q: 'Difference between memoization and tabulation', expect: 'dp', kind: 'lexical' },
  { q: 'Explain the 0/1 knapsack problem', expect: 'dp', kind: 'lexical' },
  { q: 'How can two programs end up stuck waiting on each other forever?', expect: 'deadlock', kind: 'paraphrase' },
  { q: 'How is a virtual address turned into a physical one quickly?', expect: 'paging', kind: 'paraphrase' },
  { q: 'How do I avoid storing the same data twice in tables?', expect: 'normalization', kind: 'paraphrase' },
  { q: 'How does the sender know data arrived?', expect: 'tcp', kind: 'paraphrase' },
];
const OUT_OF_SCOPE = ['What is photosynthesis in plants?', 'Explain quantum chromodynamics', 'Who won the 2011 cricket world cup?', 'How do I bake sourdough bread?', 'What is the capital of Australia?'];

async function main() {
  await db.initialize();
  const ids: Record<string, string> = {};
  for (const d of CORPUS) {
    const doc = await DocumentService.uploadDocument(A, { originalName: `${d.key}.txt`, mimeType: 'text/plain', sizeBytes: d.text.length, contentBase64: Buffer.from(d.text).toString('base64'), title: d.title } as any);
    await DocumentProcessingService.runProcessingPipeline(doc.id, A);
    const after = await db.getDocumentById(doc.id, A);
    if (after?.status !== 'READY' || !(after as any).content_indexed) throw new Error(`ingestion failed for ${d.key}: ${after?.status}`);
    ids[d.key] = doc.id;
  }
  const keyOf = (id: string) => Object.entries(ids).find(([, v]) => v === id)?.[0] || id;

  const rows: any[] = [];
  for (const kind of ['lexical', 'paraphrase'] as const) {
    for (const { q, expect } of QUERIES.filter((x) => x.kind === kind)) {
      const res = await DocumentRetrievalService.retrieve({ studentId: A, query: q, topK: 5 });
      const docs = [...new Set(res.map((r) => keyOf(r.document_id)))];
      const rank = docs.indexOf(expect) + 1;
      const ask = await KnowledgeBaseService.askQuestion(A, { question: q });
      const askHit = ask.citations.some((c) => keyOf(c.document_id) === expect);
      rows.push({ kind, q, expect, top: docs.slice(0, 3), rank, ask_mode: ask.answer_mode, ask_cites_expected: askHit });
    }
  }
  const oos = [];
  for (const q of OUT_OF_SCOPE) {
    const ask = await KnowledgeBaseService.askQuestion(A, { question: q });
    oos.push({ q, mode: ask.answer_mode, citations: ask.citations.length });
  }
  const iso = [];
  for (const { q } of QUERIES.slice(0, 5)) {
    const r = await DocumentRetrievalService.retrieve({ studentId: B, query: q, topK: 5 });
    const ask = await KnowledgeBaseService.askQuestion(B, { question: q });
    iso.push({ q, retrieved: r.length, cited: ask.citations.length });
  }

  const summarise = (kind: string) => {
    const r = rows.filter((x) => x.kind === kind);
    const hit1 = r.filter((x) => x.rank === 1).length;
    const hit3 = r.filter((x) => x.rank >= 1 && x.rank <= 3).length;
    const mrr = r.reduce((s, x) => s + (x.rank ? 1 / x.rank : 0), 0) / r.length;
    const ask = r.filter((x) => x.ask_cites_expected).length;
    return { kind, queries: r.length, hit_at_1: hit1, hit_at_3: hit3, mrr: Math.round(mrr * 100) / 100, answer_cites_expected_doc: ask };
  };
  const out = {
    corpus_documents: CORPUS.length,
    summary: [summarise('lexical'), summarise('paraphrase')],
    out_of_scope: { queries: oos.length, refused_no_sources: oos.filter((x) => x.mode === 'NO_SOURCES').length, details: oos },
    isolation: { queries: iso.length, leaks: iso.filter((x) => x.retrieved || x.cited).length },
    rows,
  };
  console.log(JSON.stringify(out, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
