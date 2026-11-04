#!/usr/bin/env python3
import json
import os
import sys

from data_part1 import part1_problems
from data_part2 import part2_problems
from data_part3 import part3_problems
from data_part4 import part4_problems
from build_dsa150_catalog import CANONICAL_TOPICS

all_problems = part1_problems + part2_problems + part3_problems + part4_problems

print(f"Total problems assembled: {len(all_problems)}")

# 1. Total check
if len(all_problems) != 150:
    print(f"ERROR: Expected 150 problems, got {len(all_problems)}")
    sys.exit(1)

# 2. Duplicate check
ids = set()
slugs = set()
for p in all_problems:
    if p['id'] in ids:
        print(f"ERROR: Duplicate ID found: {p['id']}")
        sys.exit(1)
    ids.add(p['id'])
    if p['slug'] in slugs:
        print(f"ERROR: Duplicate slug found: {p['slug']}")
        sys.exit(1)
    slugs.add(p['slug'])

# 3. Topic check
topic_counts = {}
for p in all_problems:
    topic_counts[p['topic_id']] = topic_counts.get(p['topic_id'], 0) + 1

print("\n--- Topic Distribution ---")
for t in CANONICAL_TOPICS:
    actual = topic_counts.get(t['id'], 0)
    print(f"- {t['name']} ({t['id']}): {actual} (target: {t['target']})")
    if actual != t['target']:
        print(f"ERROR: Topic {t['id']} count mismatch! Expected {t['target']}, got {actual}")
        sys.exit(1)

# 4. Difficulty check
diff_counts = {"EASY": 0, "MEDIUM": 0, "HARD": 0}
for p in all_problems:
    diff_counts[p['difficulty']] += 1

print("\n--- Difficulty Distribution ---")
print(f"EASY: {diff_counts['EASY']} (target: 45)")
print(f"MEDIUM: {diff_counts['MEDIUM']} (target: 75)")
print(f"HARD: {diff_counts['HARD']} (target: 30)")

if diff_counts['EASY'] != 45 or diff_counts['MEDIUM'] != 75 or diff_counts['HARD'] != 30:
    print("ERROR: Difficulty distribution mismatch!")
    sys.exit(1)

# 5. Field completeness check
has_errors = False
for idx, p in enumerate(all_problems, 1):
    if not p['title']: print(f"Problem {idx} ({p['id']}) missing title"); has_errors = True
    if not p['description']: print(f"Problem {idx} ({p['id']}) missing description"); has_errors = True
    if len(p['examples']) < 1: print(f"Problem {idx} ({p['id']}) missing examples"); has_errors = True
    if len(p['constraints']) < 1: print(f"Problem {idx} ({p['id']}) missing constraints"); has_errors = True
    if len(p['hints']) != 3: print(f"Problem {idx} ({p['id']}) has {len(p['hints'])} hints instead of 3"); has_errors = True
    if len(p['public_test_cases']) < 1: print(f"Problem {idx} ({p['id']}) missing public_test_cases"); has_errors = True
    if not p['starter_code']['python']: print(f"Problem {idx} ({p['id']}) missing python starter"); has_errors = True
    if not p['starter_code']['javascript']: print(f"Problem {idx} ({p['id']}) missing javascript starter"); has_errors = True
    if not p['starter_code']['java']: print(f"Problem {idx} ({p['id']}) missing java starter"); has_errors = True
    if not p['starter_code']['cpp']: print(f"Problem {idx} ({p['id']}) missing cpp starter"); has_errors = True

if has_errors:
    print("ERROR: Validation failed!")
    sys.exit(1)

print("\nAll 150 problems successfully validated!")

# 6. Generate server/db/dsa150Catalog.ts
out_path = "server/db/dsa150Catalog.ts"

ts_content = """// Auto-generated 150 DSA Practice Questions Master Catalog
// Conforming to 16 canonical DSA topics and exact difficulty distribution:
// 45 Easy, 75 Medium, 30 Hard = 150 Unique Problems.

import { DSAProblem, DSATopic } from '../models/dsaTypes';

export const TOP150_TOPICS: DSATopic[] = """ + json.dumps(CANONICAL_TOPICS, indent=2) + """;

export const TOP150_PROBLEMS: DSAProblem[] = """ + json.dumps(all_problems, indent=2) + """;
"""

with open(out_path, "w", encoding="utf-8") as f:
    f.write(ts_content)

print(f"Successfully generated {out_path} ({os.path.getsize(out_path)} bytes).")
