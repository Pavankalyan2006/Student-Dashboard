import json
import re

# Load existing 150 problems
with open('scripts/existing_150.json', 'r', encoding='utf-8') as f:
    existing_problems = json.load(f)

existing_by_title = {p['title'].strip().lower(): p for p in existing_problems}
existing_by_id = {p['id']: p for p in existing_problems}

print(f"Loaded {len(existing_problems)} existing problems.")
