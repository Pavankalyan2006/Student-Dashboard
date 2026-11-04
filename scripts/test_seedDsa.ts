import { seedDSATopics, seedDSAProblems, seedAlgorithms } from '../server/db/seedDsa';

console.log(`Loaded Topics: ${seedDSATopics.length}`);
console.log(`Loaded Problems: ${seedDSAProblems.length}`);
console.log(`Loaded Algorithms: ${seedAlgorithms.length}`);

const diffCounts: Record<string, number> = { EASY: 0, MEDIUM: 0, HARD: 0 };
seedDSAProblems.forEach(p => diffCounts[p.difficulty] = (diffCounts[p.difficulty] || 0) + 1);
console.log('Difficulty counts:', diffCounts);
