import { seedDSAProblems, seedDSATopics } from '../server/db/seedDsa';

console.log('Total seedDSAProblems count:', seedDSAProblems.length);

const diffCounts: Record<string, number> = {};
const topicCounts: Record<string, number> = {};
const ids = new Set<string>();
const duplicateIds: string[] = [];

for (const p of seedDSAProblems) {
  if (ids.has(p.id)) {
    duplicateIds.push(p.id);
  }
  ids.add(p.id);

  diffCounts[p.difficulty] = (diffCounts[p.difficulty] || 0) + 1;
  topicCounts[p.topic_id] = (topicCounts[p.topic_id] || 0) + 1;
}

console.log('Difficulties:', JSON.stringify(diffCounts, null, 2));
console.log('Topics:', JSON.stringify(topicCounts, null, 2));
console.log('Duplicate IDs count:', duplicateIds.length, duplicateIds);
