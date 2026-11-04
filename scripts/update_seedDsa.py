with open('server/db/seedDsa.ts', 'r', encoding='utf-8') as f:
    content = f.read()

algo_start = content.find('export const seedAlgorithms')
algo_end = content.find('export const seedDSAProblems')

if algo_start == -1 or algo_end == -1:
    print("Could not find boundaries")
    exit(1)

algorithms_part = content[algo_start:algo_end].rstrip()

new_content = f"""import {{ DSATopic, Algorithm, DSAProblem }} from '../models/dsaTypes';
import {{ TOP150_TOPICS, TOP150_PROBLEMS }} from './dsa150Catalog';

export const seedDSATopics: DSATopic[] = TOP150_TOPICS;

{algorithms_part}

export const seedDSAProblems: DSAProblem[] = TOP150_PROBLEMS;
"""

with open('server/db/seedDsa.ts', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Successfully updated server/db/seedDsa.ts")
