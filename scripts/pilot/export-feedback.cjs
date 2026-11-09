// Phase 6: owner-only, anonymised export of pilot feedback. There is no admin page; this script
// reads the server's data snapshot on the machine that runs the pilot.
//
//   PILOT_EXPORT_SALT=<long random secret kept by the owner> \
//   node scripts/pilot/export-feedback.cjs /path/to/db-snapshot.json > feedback-export.json
//
// - Student ids are replaced by "P-xxxxxxxx" codes (HMAC-SHA256 with the owner's salt), so the
//   same participant keeps one code across exports but cannot be identified from the export.
// - No name, email, college or other profile field is read or written.
// - Per-question results report n (answers), the 1-5 distribution and the median. Questions a
//   participant skipped are not counted. No averages are invented for empty questions.
// - Privacy/security concerns are listed first.
const fs = require('fs');
const crypto = require('crypto');

const file = process.argv[2] || process.env.DATA_SNAPSHOT_PATH || './data/runtime/db-snapshot.json';
const salt = process.env.PILOT_EXPORT_SALT;
if (!salt || salt.length < 16) {
  console.error('Set PILOT_EXPORT_SALT (16+ characters, kept private by the owner) to pseudonymise participants.');
  process.exit(2);
}
const raw = JSON.parse(fs.readFileSync(file, 'utf-8'));
const store = raw?.sources?.pilotFeedback?.entries;
const pairs = store && store.__type === 'Map' ? store.entries : [];
const code = (id) => 'P-' + crypto.createHmac('sha256', salt).update(String(id)).digest('hex').slice(0, 8);

const entries = [];
for (const [studentId, list] of pairs) for (const e of list) entries.push({ ...e, participant: code(studentId), student_id: undefined });

const participants = new Set(entries.map((e) => e.participant));
const surveys = entries.filter((e) => e.kind === 'SURVEY');
const questions = {};
for (const e of surveys) for (const [q, v] of Object.entries(e.ratings || {})) (questions[q] ||= []).push(v);
const per_question = Object.fromEntries(
  Object.entries(questions).map(([q, vs]) => {
    const s = [...vs].sort((a, b) => a - b);
    const mid = Math.floor(s.length / 2);
    return [q, { n: s.length, distribution: [1, 2, 3, 4, 5].map((r) => s.filter((x) => x === r).length), median: s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2 }];
  })
);
const tasks = {};
for (const e of entries) for (const t of e.tasks_attempted || []) tasks[t] = (tasks[t] || 0) + 1;
const strip = ({ student_id, ...rest }) => rest;

console.log(
  JSON.stringify(
    {
      exported_at: new Date().toISOString(),
      source: 'in-app pilot feedback (self-reported, voluntary)',
      sample: { participants_with_feedback: participants.size, entries: entries.length, surveys: surveys.length },
      limitations: 'Self-reported answers from volunteers. Small samples: report n with every figure. Ratings are opinions, not proof of correctness.',
      privacy_concerns: entries.filter((e) => e.kind === 'PRIVACY_CONCERN').map(strip),
      problem_reports: entries.filter((e) => e.kind === 'PROBLEM').map(strip),
      per_question,
      tasks_attempted: tasks,
      errors_encountered: { yes: surveys.filter((e) => e.answers?.ux_errors_encountered === true).length, no: surveys.filter((e) => e.answers?.ux_errors_encountered === false).length },
      written: surveys.filter((e) => e.comments || e.answers?.reg_confusing_fields).map((e) => ({ participant: e.participant, confusing_fields: e.answers?.reg_confusing_fields || '', comments: e.comments, created_at: e.created_at })),
    },
    null,
    2
  )
);
