import { topInterview150Part1 } from '../server/db/seedDsaTop150Part1';
import { topInterview150Part2 } from '../server/db/seedDsaTop150Part2';
import { topInterview150Part3 } from '../server/db/seedDsaTop150Part3';

console.log('Part 1 count:', topInterview150Part1.length);
console.log('Part 2 count:', topInterview150Part2.length);
console.log('Part 3 count:', topInterview150Part3.length);
const total = topInterview150Part1.length + topInterview150Part2.length + topInterview150Part3.length;
console.log('Total in parts 1-3:', total);

// Inspect first 3 in Part 1
console.log('Part 1 sample keys:', Object.keys(topInterview150Part1[0]));
console.log('Part 1 sample title:', topInterview150Part1[0].title);
