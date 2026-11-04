import fs from 'fs';
import { topInterview150Part1 } from '../server/db/seedDsaTop150Part1';
import { topInterview150Part2 } from '../server/db/seedDsaTop150Part2';
import { topInterview150Part3 } from '../server/db/seedDsaTop150Part3';

const all150 = [...topInterview150Part1, ...topInterview150Part2, ...topInterview150Part3];
fs.writeFileSync('scripts/existing_150.json', JSON.stringify(all150, null, 2), 'utf-8');
console.log('Successfully dumped', all150.length, 'problems to scripts/existing_150.json');
