#!/usr/bin/env python3
import json
import os
import sys

# Script to generate server/db/systemDesignCatalog.ts
# Contains:
# 1. 5 Curriculum Levels with 69 Comprehensive Lessons
# 2. 25 Canonical System Design Challenges with complete deliverables, rubrics, and reference solutions

print("Building complete System Design Catalog...")

# Helper to create lesson
def make_lesson(id, level, level_name, order_index, slug, title, summary, estimated_minutes,
                content_markdown, key_decisions, advantages, disadvantages, common_mistakes,
                practical_examples, related_topics, knowledge_check, sample_diagram=None):
    return {
        "id": id,
        "level": level,
        "level_name": level_name,
        "order_index": order_index,
        "slug": slug,
        "title": title,
        "summary": summary,
        "estimated_minutes": estimated_minutes,
        "content_markdown": content_markdown,
        "key_decisions": key_decisions,
        "advantages": advantages,
        "disadvantages": disadvantages,
        "common_mistakes": common_mistakes,
        "practical_examples": practical_examples,
        "related_topics": related_topics,
        "sample_diagram": sample_diagram or {
            "components": [
                {"name": "Client", "type": "WEB_CLIENT", "role": "Initiates request"},
                {"name": "API Gateway", "type": "API_GATEWAY", "role": "Routes and authenticates"},
                {"name": "Application Service", "type": "APP_SERVER", "role": "Executes domain logic"},
                {"name": "Primary Database", "type": "SQL_DATABASE", "role": "Persists state"}
            ],
            "data_flow": [
                "1. User initiates an HTTP HTTPS request via Client.",
                "2. API Gateway validates JWT credentials, enforces rate limits, and forwards request.",
                "3. Application Service processes domain business invariants.",
                "4. Storage tier commits transaction with ACID guarantees."
            ]
        },
        "knowledge_check": knowledge_check
    }

# Helper to create challenge
def make_challenge(id, number, title, slug, category, difficulty, target_users, description,
                   functional_requirements, non_functional_requirements, constraints_and_assumptions,
                   expected_deliverables, scale_estimation, rubric_weights, hints,
                   starter_components, reference_solution):
    return {
        "id": id,
        "number": number,
        "title": title,
        "slug": slug,
        "category": category,
        "difficulty": difficulty,
        "target_users": target_users,
        "description": description,
        "functional_requirements": functional_requirements,
        "non_functional_requirements": non_functional_requirements,
        "constraints_and_assumptions": constraints_and_assumptions,
        "expected_deliverables": expected_deliverables,
        "scale_estimation_benchmarks": scale_estimation,
        "evaluation_rubric": rubric_weights,
        "hints": hints,
        "starter_components": starter_components,
        "reference_solution": reference_solution
    }

print("Helper functions ready.")
