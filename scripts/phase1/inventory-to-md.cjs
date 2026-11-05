// Renders the component inventory JSON as markdown tables (one per page).
const inv = JSON.parse(require('fs').readFileSync(process.argv[2], 'utf8'));
const cls = (c) => {
  const k = [];
  if (c.apiCalls.length) k.push('DATA-DRIVEN');
  if (c.onClick + c.onSubmit + c.onChange > 0) k.push('INTERACTIVE');
  if (!k.length) k.push('STATIC');
  return k.join(', ');
};
let out = '';
let total = 0, inter = 0;
for (const [page, v] of Object.entries(inv)) {
  const comps = v.components.sort((a, b) => a.file.localeCompare(b.file));
  total += comps.length; inter += comps.filter((c) => c.onClick + c.onSubmit + c.onChange > 0).length;
  out += `\n## ${page}\n\nEntry: ${v.entries.map((e) => '`' + e + '`').join(', ')}\n\n`;
  out += '| ID | Component file | Shared | Class | Buttons | Inputs | onClick | onChange | onSubmit | State | Effects | API calls |\n|---|---|---|---|---:|---:|---:|---:|---:|---:|---:|---|\n';
  comps.forEach((c, i) => {
    const id = page.replace(/[^A-Z]/g, '').slice(0, 3) + '-' + String(i + 1).padStart(2, '0');
    out += `| ${id} | \`${c.file}\` | ${c.shared ? 'yes' : ''} | ${cls(c)} | ${c.buttons} | ${c.inputs} | ${c.onClick} | ${c.onChange} | ${c.onSubmit} | ${c.useState} | ${c.useEffect} | ${c.apiCalls.slice(0, 6).join(', ')}${c.apiCalls.length > 6 ? ' …' : ''} |\n`;
  });
}
console.log(`Totals: ${total} component files across the 12 pages (shared files counted once per page), ${inter} with event handlers.\n` + out);
