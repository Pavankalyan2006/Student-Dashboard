import sys
import os
import json
import re

sys.path.append('scripts')
import courses_data_a_c as ac
import courses_data_d_f as df
import courses_data_g_j as gj

CATEGORIES = [
    ('A', ac.COURSES_A, "categoryA", "Programming Fundamentals"),
    ('B', ac.COURSES_B, "categoryB", "Web Development"),
    ('C', ac.COURSES_C, "categoryC", "Computer Science Core"),
    ('D', df.COURSES_D, "categoryD", "Artificial Intelligence and Machine Learning"),
    ('E', df.COURSES_E, "categoryE", "Data Science and Analytics"),
    ('F', df.COURSES_F, "categoryF", "Cloud, DevOps, and Software Tools"),
    ('G', gj.COURSES_G, "categoryG", "Electronics and Communication Engineering"),
    ('H', gj.COURSES_H, "categoryH", "Electrical Engineering"),
    ('I', gj.COURSES_I, "categoryI", "Mechanical and Civil Engineering"),
    ('J', gj.COURSES_J, "categoryJ", "Mathematics, Aptitude, and Career Skills"),
]

def slugify(text):
    text = text.lower()
    text = re.sub(r'[^a-z0-9]+', '-', text)
    return text.strip('-')

def generate_lesson_content(course, mod_idx, mod_title, mod_desc, lsn_idx, lsn_title, lsn_summary, lsn_type, lang_or_tag):
    c_title = course['title']
    cat_name = course['cat_name']
    code = course['code']
    branch = course['branch']
    
    # Generate domain-specific technical sample (Code, Equations, or Specifications)
    tech_block = ""
    lang = lang_or_tag.lower()
    
    if lsn_type == "CODE" or lang in ["c", "cpp", "java", "python", "javascript", "typescript", "html", "css", "sql", "bash", "go", "rust"]:
        if lang == "c":
            tech_block = f"""```c
#include <stdio.h>
#include <stdlib.h>

// Core implementation demonstration for {lsn_title}
int main(void) {{
    printf("Initializing module: {mod_title}\\n");
    printf("Executing runtime context for: {lsn_title}\\n");
    // Standard memory & invariant verification
    int status = 0;
    if (status == 0) {{
        printf("Verification successful: system invariants hold.\\n");
    }}
    return status;
}}
```"""
        elif lang == "cpp":
            tech_block = f"""```cpp
#include <iostream>
#include <vector>
#include <memory>

// Object model and modern C++ abstractions for {lsn_title}
class {re.sub(r'[^a-zA-Z0-9]', '', lsn_title[:24])} {{
public:
    void execute() const {{
        std::cout << "[Runtime] Processing invariant: {lsn_title}" << std::endl;
    }}
}};

int main() {{
    auto instance = std::make_unique<{re.sub(r'[^a-zA-Z0-9]', '', lsn_title[:24])}>();
    instance->execute();
    return 0;
}}
```"""
        elif lang == "python":
            tech_block = f"""```python
import sys
from typing import List, Dict, Any

def execute_{slugify(lsn_title[:20]).replace('-', '_')}() -> Dict[str, Any]:
    \"\"\"
    Structured implementation demonstrating {lsn_title}.
    Module context: {mod_title}
    \"\"\"
    pipeline_state = {{
        "lesson": "{lsn_title}",
        "status": "ACTIVE",
        "verified": True
    }}
    return pipeline_state

if __name__ == "__main__":
    result = execute_{slugify(lsn_title[:20]).replace('-', '_')}()
    print(f"Executed: {{result}}")
```"""
        elif lang == "java":
            class_name = re.sub(r'[^a-zA-Z0-9]', '', lsn_title[:20]) or "EngineeringDemo"
            tech_block = f"""```java
package edu.btech.learning;

import java.util.logging.Logger;

/**
 * Enterprise implementation model for {lsn_title}.
 */
public class {class_name} {{
    private static final Logger logger = Logger.getLogger({class_name}.class.getName());

    public static void main(String[] args) {{
        logger.info("Initializing runtime execution for: {lsn_title}");
        System.out.println("Processing curriculum module: {mod_title}");
    }}
}}
```"""
        elif lang in ["javascript", "typescript"]:
            tech_block = f"""```typescript
interface ComponentContext {{
  readonly topic: string;
  readonly status: 'PENDING' | 'VERIFIED';
  timestamp: number;
}}

export async function process{re.sub(r'[^a-zA-Z0-9]', '', lsn_title[:20])}(): Promise<ComponentContext> {{
  console.log('Mounting pipeline for: {lsn_title}');
  return {{
    topic: '{lsn_title}',
    status: 'VERIFIED',
    timestamp: Date.now()
  }};
}}
```"""
        elif lang == "sql":
            table_name = slugify(lsn_title[:18]).replace('-', '_')
            tech_block = f"""```sql
-- DDL & Query Specification for {lsn_title}
CREATE TABLE IF NOT EXISTS {table_name}_records (
    record_id BIGINT PRIMARY KEY,
    topic_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'ACTIVE'
);

-- Optimized query pattern with indexed lookup
SELECT record_id, topic_name, status
FROM {table_name}_records
WHERE status = 'ACTIVE'
ORDER BY created_at DESC;
```"""
        else:
            tech_block = f"""```bash
# Practical setup and execution commands for {lsn_title}
# Ensure required development tooling is installed
echo "Verifying environment for {lsn_title}..."
python3 -c "print('Environment verified: {lsn_title}')"
```"""
    elif cat_name in ["Electronics and Communication Engineering", "Electrical Engineering"]:
        tech_block = f"""```text
Circuit Schematic / Governing Differential Formulation:
-------------------------------------------------------
     +--[ R_in ]----+-----------+---[ V_out ]
     |              |           |
 [ V_in ]        [ C_filter ] [ L_choke ]
     |              |           |
    GND            GND         GND

Transfer Function Formulation:
H(s) = \\frac{{V_{{out}}(s)}}{{V_{{in}}(s)}} = \\frac{{\\omega_0^2}}{{s^2 + 2\\zeta\\omega_0 s + \\omega_0^2}}
Characteristic Impedance: Z_0 = \\sqrt{{\\frac{{L}}{{C}}}}
```"""
    elif cat_name in ["Mechanical and Civil Engineering"]:
        tech_block = f"""```text
Governing Equilibrium & Constitutive Equations:
----------------------------------------------
Static Equilibrium:
  \\sum F_x = 0, \\quad \\sum F_y = 0, \\quad \\sum M_z = 0

Stress-Strain Tensor Formulation:
  \\sigma = E \\cdot \\epsilon, \\quad \\tau = G \\cdot \\gamma
Moment-Curvature Relationship:
  \\frac{{M}}{{I}} = \\frac{{\\sigma}}{{y}} = \\frac{{E}}{{R}}
```"""
    else:
        tech_block = f"""```text
Analytical Formulation & Problem Breakdown:
------------------------------------------
Given Inputs: Let X be the candidate parameter space.
Objective Function: Optimize \\Phi(X) subject to constraints \\Omega_i(X) \\le 0.
Algorithmic Invariant: At step k, invariant I(k) holds monotonically.
Complexity / Metric: T(n) = \\mathcal{{O}}(n \\log n), \\quad Memory = \\mathcal{{O}}(1).
```"""

    md = f"""# {lsn_title}

> **Course:** {c_title} ({code})  
> **Module {mod_idx + 1}:** {mod_title}  
> **Topic Classification:** {cat_name} · {branch} · Semester {course['sem']}

---

## 1. Executive Summary & Foundational Concepts

{lsn_summary}

In modern engineering practice and computational systems, understanding **{lsn_title}** is paramount. Within the framework of **{mod_title}**, this topic establishes the theoretical invariants, algorithmic guarantees, and architectural mechanisms necessary to build robust, scalable solutions.

### Core Definitions

- **{lsn_title}:** The formal methodology, physical law, or algorithmic abstraction governing this operational boundary.
- **Operational Invariant:** The set of structural conditions and mathematical constraints that remain invariant throughout the lifecycle of the system.
- **Engineering Constraint:** Performance trade-offs regarding computational complexity, latency, bandwidth, power dissipation, or structural load.

---

## 2. Technical Architecture & Invariant Formulation

{mod_desc}

### Technical Demonstration & Invariant Modeling

{tech_block}

### Key Mathematical & Architectural Properties

1. **Deterministic Guarantees:** Rigorous bounds ensure stable behavior under extreme edge cases and asynchronous environments.
2. **Resource Efficiency:** Optimal resource utilization minimizes computational overhead, power budgets, or space footprint.
3. **Failure Isolation:** Architectural boundaries prevent cascading failures through clear separation of concerns and defensive validation.

---

## 3. Real-World Engineering Application & Case Study

### Applied Industrial Context
In enterprise production deployments and high-reliability engineering domains (e.g., aerospace avionics, distributed cloud backbones, automotive embedded ECUs, and high-frequency transaction engines), **{lsn_title}** is deployed to maintain reliability.

#### Step-by-Step Implementation Workflow:
1. **System Initialization:** Configure operational boundaries and allocate pre-flight resources with strict validation checks.
2. **State Transition Execution:** Process input vectors while enforcing safety invariants at every boundary step.
3. **Telemetry & Verification:** Monitor telemetry metrics, assertion checks, and audit trails to verify nominal convergence.

---

## 4. Key Takeaways & Exam Revision Points

- **Primary Axiom:** {lsn_summary}
- **Module Anchor:** Forms a foundational building block for {mod_title} within {c_title}.
- **Viva & Interview Focus:** Be prepared to derive the core equations, analyze asymptotic bottlenecks, and explain trade-offs between space, latency, and hardware constraints.

---

## 5. Knowledge-Check & Practice Assessment

1. **Conceptual Understanding:** Explain the fundamental trade-off introduced by {lsn_title}. How does it compare to alternative paradigms?
2. **Problem Solving:** Given a real-world constraint where resource capacity is reduced by 50%, describe how the invariants of {lsn_title} protect system availability.
3. **Synthesis Exercise:** Construct a practical implementation or circuit schematic incorporating the safety guidelines discussed in this lesson.
"""
    return md.strip()

def generate():
    os.makedirs('server/db/seedCourses', exist_ok=True)
    
    cat_files = []
    total_courses_count = 0
    total_chapters_count = 0
    total_lessons_count = 0
    
    for cat_letter, course_list, cat_key, cat_name in CATEGORIES:
        file_path = f"server/db/seedCourses/{cat_key}.ts"
        print(f"Generating {file_path} ({len(course_list)} courses)...")
        
        courses_ts = []
        chapters_ts = []
        lessons_ts = []
        
        for c in course_list:
            c_num = c['num']
            c_id = f"crs_cat_{c_num:03d}"
            c_slug = slugify(c['title'])
            
            course_obj = {
                "id": c_id,
                "title": c['title'],
                "slug": c_slug,
                "code": c['code'],
                "description": c['desc'],
                "short_description": c['short_desc'],
                "branch": c['branch'],
                "semester": c['sem'],
                "difficulty": c['diff'],
                "thumbnail": c['thumb'],
                "estimated_minutes": c['mins'],
                "is_published": True,
                "prerequisites": c['prereqs'],
                "skills": c['skills'],
                "academic_year": "2025-2026",
                "instructor": "Academic Faculty Team",
                "category": cat_name,
                "syllabus_overview": f"Comprehensive {cat_name} curriculum covering {len(c['modules'])} units and standard university exam topics.",
                "learning_objectives": c['objectives'],
                "is_custom": False,
                "created_at": "2026-01-15T09:00:00.000Z",
                "updated_at": "2026-03-20T10:00:00.000Z",
            }
            courses_ts.append(course_obj)
            total_courses_count += 1
            
            c_order_index = 1
            for m_idx, mod_tuple in enumerate(c['modules']):
                mod_title = mod_tuple[0]
                mod_desc = mod_tuple[1]
                lessons_in_mod = mod_tuple[2]
                
                ch_id = f"ch_cat_{c_num:03d}_{m_idx + 1}"
                chapter_obj = {
                    "id": ch_id,
                    "course_id": c_id,
                    "title": f"Unit {m_idx + 1}: {mod_title}",
                    "description": mod_desc,
                    "order_index": m_idx + 1,
                    "created_at": "2026-01-15T09:00:00.000Z",
                    "updated_at": "2026-01-15T09:00:00.000Z",
                }
                chapters_ts.append(chapter_obj)
                total_chapters_count += 1
                
                for l_idx, lsn_tuple in enumerate(lessons_in_mod):
                    lsn_title = lsn_tuple[0]
                    lsn_summary = lsn_tuple[1]
                    lsn_type = lsn_tuple[2]
                    lang_or_tag = lsn_tuple[3]
                    
                    lsn_id = f"lsn_cat_{c_num:03d}_{m_idx + 1}_{l_idx + 1}"
                    lsn_slug = slugify(lsn_title)
                    
                    content_md = generate_lesson_content(
                        c, m_idx, mod_title, mod_desc, l_idx, lsn_title, lsn_summary, lsn_type, lang_or_tag
                    )
                    
                    # Lesson type in schema is 'TEXT' | 'VIDEO' | 'READING' | 'CODE' | 'QUIZ'
                    valid_type = "CODE" if lsn_type == "CODE" else "TEXT"
                    
                    lesson_obj = {
                        "id": lsn_id,
                        "chapter_id": ch_id,
                        "course_id": c_id,
                        "title": lsn_title,
                        "slug": lsn_slug,
                        "description": lsn_summary,
                        "content": content_md,
                        "lesson_type": valid_type,
                        "order_index": c_order_index,
                        "estimated_minutes": 35,
                        "is_published": True,
                        "created_at": "2026-01-15T09:00:00.000Z",
                        "updated_at": "2026-01-15T09:00:00.000Z",
                    }
                    lessons_ts.append(lesson_obj)
                    c_order_index += 1
                    total_lessons_count += 1
        
        # Write TypeScript file
        ts_code = f"""import {{ Course, CourseChapter, CourseLesson }} from '../../models/types';

export const COURSES_{cat_letter}: Course[] = {json.dumps(courses_ts, indent=2)};

export const CHAPTERS_{cat_letter}: CourseChapter[] = {json.dumps(chapters_ts, indent=2)};

export const LESSONS_{cat_letter}: CourseLesson[] = {json.dumps(lessons_ts, indent=2)};
"""
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(ts_code)
        
        cat_files.append((cat_letter, cat_key))
        print(f"  -> Written {len(courses_ts)} courses, {len(chapters_ts)} chapters, {len(lessons_ts)} lessons.")

    # Write index.ts
    index_path = "server/db/seedCourses/index.ts"
    print(f"Generating {index_path}...")
    imports = []
    courses_spread = []
    chapters_spread = []
    lessons_spread = []
    
    for cat_letter, cat_key in cat_files:
        imports.append(f"import {{ COURSES_{cat_letter}, CHAPTERS_{cat_letter}, LESSONS_{cat_letter} }} from './{cat_key}';")
        courses_spread.append(f"  ...COURSES_{cat_letter},")
        chapters_spread.append(f"  ...CHAPTERS_{cat_letter},")
        lessons_spread.append(f"  ...LESSONS_{cat_letter},")
    
    index_content = f"""import {{ Course, CourseChapter, CourseLesson }} from '../../models/types';
{chr(10).join(imports)}

export const SEED_100_COURSES: Course[] = [
{chr(10).join(courses_spread)}
];

export const SEED_100_CHAPTERS: CourseChapter[] = [
{chr(10).join(chapters_spread)}
];

export const SEED_100_LESSONS: CourseLesson[] = [
{chr(10).join(lessons_spread)}
];

export const TOTAL_SEED_COURSES_COUNT = SEED_100_COURSES.length;
export const TOTAL_SEED_CHAPTERS_COUNT = SEED_100_CHAPTERS.length;
export const TOTAL_SEED_LESSONS_COUNT = SEED_100_LESSONS.length;
"""
    with open(index_path, 'w', encoding='utf-8') as f:
        f.write(index_content)
    
    print("\n--- GENERATION COMPLETE ---")
    print(f"Total Seed Courses: {total_courses_count}")
    print(f"Total Seed Chapters/Modules: {total_chapters_count}")
    print(f"Total Seed Lessons: {total_lessons_count}")

if __name__ == "__main__":
    generate()
