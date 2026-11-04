import { topInterview150Part1 } from '../server/db/seedDsaTop150Part1';
import { topInterview150Part2 } from '../server/db/seedDsaTop150Part2';
import { topInterview150Part3 } from '../server/db/seedDsaTop150Part3';

const all150 = [...topInterview150Part1, ...topInterview150Part2, ...topInterview150Part3];

all150.forEach((p, idx) => {
  console.log(`${idx + 1}. [${p.difficulty}] ${p.title} (${p.topic_id})`);
});
