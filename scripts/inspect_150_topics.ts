import { topInterview150Part1 } from '../server/db/seedDsaTop150Part1';
import { topInterview150Part2 } from '../server/db/seedDsaTop150Part2';
import { topInterview150Part3 } from '../server/db/seedDsaTop150Part3';

const all150 = [...topInterview150Part1, ...topInterview150Part2, ...topInterview150Part3];

const topicMap: Record<string, number> = {};
const diffMap: Record<string, number> = {};
const titles: string[] = [];

for (const p of all150) {
  topicMap[p.topic_id] = (topicMap[p.topic_id] || 0) + 1;
  diffMap[p.difficulty] = (diffMap[p.difficulty] || 0) + 1;
  titles.push(p.title);
}

console.log('Total count:', all150.length);
console.log('Difficulties:', diffMap);
console.log('Topics:', topicMap);
