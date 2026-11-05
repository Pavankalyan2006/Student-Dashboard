// Builds the Phase 1 component inventory by following relative imports from each page entry.
// Usage: node scripts/phase1/component-inventory.cjs > out.json
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '../..');
const PAGES = {
  'Dashboard': ['src/pages/DashboardPage.tsx'],
  'Semester Command Center': fs.readdirSync(path.join(ROOT,'src/features/semester-command-center/pages')).map(f=>'src/features/semester-command-center/pages/'+f),
  'AI Tutor / AI Agent': ['src/pages/AiAgentPage.tsx'],
  'Courses': fs.readdirSync(path.join(ROOT,'src/features/courses/pages')).map(f=>'src/features/courses/pages/'+f),
  'Notes': ['src/features/notes/pages/NotesPage.tsx','src/features/notes/pages/NoteDetailPage.tsx'],
  'Documents': fs.readdirSync(path.join(ROOT,'src/features/documents/pages')).map(f=>'src/features/documents/pages/'+f),
  'Doubt Solver': ['src/features/doubts/pages/DoubtSolverPage.tsx'],
  'AI Flashcards / Spaced Revision': ['src/features/flashcards/pages/FlashcardsPage.tsx'],
  'Study Planner': ['src/features/study-planner/pages/StudyPlannerPage.tsx'],
  'Language Learning': ['src/features/languages/pages/LanguageLearningPage.tsx'],
};
const SHARED = /src\/(components|context|lib|hooks|store|api|types|utils)\//;
function resolve(from, spec) {
  if (!spec.startsWith('.')) return null;
  const base = path.resolve(path.dirname(from), spec);
  for (const c of [base, base+'.tsx', base+'.ts', base+'/index.tsx', base+'/index.ts']) if (fs.existsSync(c) && fs.statSync(c).isFile()) return c;
  return null;
}
function scan(file) {
  const s = fs.readFileSync(file, 'utf8');
  const count = re => (s.match(re) || []).length;
  return {
    file: path.relative(ROOT, file),
    onClick: count(/onClick=/g), onSubmit: count(/onSubmit=/g), onChange: count(/onChange=/g),
    inputs: count(/<(input|textarea|select|Input|Textarea|Select)\b/g),
    buttons: count(/<(button|Button)\b/g),
    useState: count(/useState\(/g), useEffect: count(/useEffect\(/g),
    apiCalls: [...new Set((s.match(/\b\w+Api\.\w+|apiClient\.\w+|api\.(get|post|put|patch|delete)|fetch\(/g) || []))],
    emptyHandlers: count(/=\{\(\)\s*=>\s*\{\s*\}\}/g),
    toastOnly: count(/onClick=\{\(\)\s*=>\s*(toast|alert)\(/g),
    imports: [...s.matchAll(/from\s+['"]([^'"]+)['"]/g)].map(m=>m[1]),
  };
}
const out = {};
for (const [page, entries] of Object.entries(PAGES)) {
  const seen = new Map(); const stack = entries.map(e=>path.join(ROOT,e)).filter(f=>f.endsWith('.tsx'));
  while (stack.length) {
    const f = stack.pop(); if (seen.has(f)) continue;
    const info = scan(f); seen.set(f, info);
    for (const imp of info.imports) { const r = resolve(f, imp); if (r && r.endsWith('.tsx')) stack.push(r); }
  }
  const comps = [...seen.values()].map(({imports, ...rest}) => ({...rest, shared: SHARED.test(rest.file)}));
  out[page] = { entries, components: comps };
}
console.log(JSON.stringify(out, null, 2));
