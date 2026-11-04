import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from data_part1 import part1_problems
from data_part2 import part2_problems
from data_part3 import part3_problems
from data_part4 import part4_problems

parts = [
    ("part1", part1_problems),
    ("part2", part2_problems),
    ("part3", part3_problems),
    ("part4", part4_problems),
]

for name, probs in parts:
    e = sum(1 for p in probs if p['difficulty'] == 'EASY')
    m = sum(1 for p in probs if p['difficulty'] == 'MEDIUM')
    h = sum(1 for p in probs if p['difficulty'] == 'HARD')
    print(f"=== {name} total={len(probs)}: E={e}, M={m}, H={h} ===")

print("\nListing MEDIUM problems in each topic:")
for name, probs in parts:
    for p in probs:
        if p['difficulty'] == 'MEDIUM':
            print(f"{p['id']}: {p['title']} ({p['topic_id']})")

