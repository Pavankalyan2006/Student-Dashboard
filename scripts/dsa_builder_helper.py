import json

def make_problem(
    id,
    number,
    title,
    topic_id,
    subtopic,
    difficulty,
    roadmap_stage,
    companies,
    description,
    input_format,
    output_format,
    constraints,
    examples,
    public_test_cases,
    hidden_test_cases,
    hints,
    time_complexity,
    space_complexity,
    py_fn_name,
    py_fn_params,
    py_fn_ret_type,
    py_sample_body,
    solution_explanation,
    tags=None
):
    slug = title.lower().replace(" - ", "-").replace(" & ", "-").replace(" ", "-")
    slug = "".join(c for c in slug if c.isalnum() or c == "-").strip("-")

    # Generate Starter Codes
    python_starter = f"""# {number}. {title}
# Difficulty: {difficulty} | Topic: {subtopic}
# Time Complexity Target: {time_complexity} | Space Complexity Target: {space_complexity}

import sys
import json

def {py_fn_name}({py_fn_params}) -> {py_fn_ret_type}:
    \"\"\"
    {description.split('.')[0]}.
    \"\"\"
    # TODO: Implement your solution here
    {py_sample_body}

if __name__ == '__main__':
    # Standard I/O test harness
    input_data = sys.stdin.read().strip()
    if input_data:
        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]
        # Invoke solution
        # print({py_fn_name}(...))
"""

    js_starter = f"""/**
 * {number}. {title}
 * Difficulty: {difficulty} | Topic: {subtopic}
 * Optimal: {time_complexity} time, {space_complexity} space
 */

const fs = require('fs');

function {py_fn_name}({py_fn_params}) {{
    // TODO: Implement your solution here
    return null;
}}

if (require.main === module) {{
    const input = fs.readFileSync(0, 'utf-8').trim();
    if (input) {{
        // Parse input and print result
    }}
}}
"""

    java_starter = f"""// {number}. {title}
// Difficulty: {difficulty} | Topic: {subtopic}
import java.util.*;

public class Main {{
    public static void main(String[] args) {{
        Scanner sc = new Scanner(System.in);
        // Read input
        // System.out.println(solution(...));
    }}
}}
"""

    cpp_starter = f"""// {number}. {title}
// Difficulty: {difficulty} | Topic: {subtopic}
#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <unordered_map>

using namespace std;

int main() {{
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    // Write solution logic here
    return 0;
}}
"""

    return {
        "id": id,
        "number": number,
        "title": title,
        "slug": slug,
        "topic_id": topic_id,
        "subtopic": subtopic,
        "difficulty": difficulty,
        "roadmap_stage": roadmap_stage,
        "companies": companies,
        "tags": tags or [topic_id.replace("topic_", "").replace("_", " ")],
        "description": description,
        "input_format": input_format,
        "output_format": output_format,
        "constraints": constraints,
        "examples": examples,
        "public_test_cases": public_test_cases,
        "hidden_test_cases": hidden_test_cases,
        "hints": hints,
        "optimal_complexity": {
            "time": time_complexity,
            "space": space_complexity
        },
        "solution_explanation": solution_explanation,
        "starter_code": {
            "python": python_starter,
            "javascript": js_starter,
            "java": java_starter,
            "cpp": cpp_starter
        },
        "supported_languages": ["python", "javascript", "java", "cpp"],
        "created_at": "2026-01-01T00:00:00Z",
        "updated_at": "2026-03-01T00:00:00Z"
    }
