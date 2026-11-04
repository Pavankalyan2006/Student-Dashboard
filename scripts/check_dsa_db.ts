import { seedDSATopics } from '../server/db/seedDsa';

console.log('Seed topics:');
for (const t of seedDSATopics) {
  console.log(`- id: ${t.id}, name: "${t.name}", slug: "${t.slug}"`);
}
