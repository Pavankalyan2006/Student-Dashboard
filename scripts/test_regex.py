import json
import re

# Let's inspect the files seedDsaTop150Part1.ts, Part2.ts, Part3.ts
for p_num in [1, 2, 3]:
    filepath = f"server/db/seedDsaTop150Part{p_num}.ts"
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    # Find all createProblem calls
    matches = re.findall(r"id:\s*['\"]([^'\"]+)['\"],\s*title:\s*['\"]([^'\"]+)['\"]", content)
    print(f"Part {p_num}: {len(matches)} problems found.")
