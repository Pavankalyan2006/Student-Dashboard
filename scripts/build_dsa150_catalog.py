#!/usr/bin/env python3
import json
import os
import re

print("Initializing DSA 150 Master Question Catalog Generator...")

# 16 Canonical Topics
CANONICAL_TOPICS = [
    {
        "id": "topic_arrays_hashing",
        "name": "Arrays and Hashing",
        "slug": "arrays",
        "category": "DATA_STRUCTURE",
        "description": "Contiguous memory manipulation, hash tables, frequency tracking, prefix sums, and in-place transformations.",
        "difficulty": "EASY",
        "order_index": 1,
        "prerequisites": ["Variables and Loops", "Basic Indexing"],
        "icon": "Layers",
        "concepts": ["Contiguous Allocation", "Hash Maps & Sets", "Prefix Sums", "Frequency Counting"],
        "target": 16
    },
    {
        "id": "topic_strings",
        "name": "Strings",
        "slug": "strings",
        "category": "DATA_STRUCTURE",
        "description": "Character encoding, palindromes, anagram grouping, substring matching, and string compression.",
        "difficulty": "EASY",
        "order_index": 2,
        "prerequisites": ["Arrays and Hashing"],
        "icon": "FileText",
        "concepts": ["Character Traversal", "String Immutability", "Two Pointers on Strings", "Sliding Window on Substrings"],
        "target": 11
    },
    {
        "id": "topic_two_pointers",
        "name": "Two Pointers",
        "slug": "two-pointers",
        "category": "TECHNIQUE",
        "description": "Converging and parallel pointers for sorted collections, container partitioning, and in-place deduplication.",
        "difficulty": "EASY",
        "order_index": 3,
        "prerequisites": ["Arrays and Hashing"],
        "icon": "GitCommit",
        "concepts": ["Left & Right Pointers", "Slow & Fast Pointers", "Sorted Invariant", "Area Maximization"],
        "target": 8
    },
    {
        "id": "topic_sliding_window",
        "name": "Sliding Window",
        "slug": "sliding-window",
        "category": "TECHNIQUE",
        "description": "Fixed and dynamic window mechanics for optimal subarray and substring problem solving.",
        "difficulty": "MEDIUM",
        "order_index": 4,
        "prerequisites": ["Two Pointers", "Arrays and Hashing"],
        "icon": "Maximize2",
        "concepts": ["Fixed Window", "Dynamic Expanding Window", "Shrinking Invariant", "Frequency Counting"],
        "target": 8
    },
    {
        "id": "topic_binary_search",
        "name": "Binary Search",
        "slug": "binary-search",
        "category": "ALGORITHM",
        "description": "Logarithmic search algorithms on sorted arrays, rotated arrays, and monotonic decision spaces.",
        "difficulty": "EASY",
        "order_index": 5,
        "prerequisites": ["Arrays and Hashing"],
        "icon": "Search",
        "concepts": ["Logarithmic Halving", "Boundary Conditions", "Search On Answer", "Rotated Invariants"],
        "target": 8
    },
    {
        "id": "topic_sorting_searching",
        "name": "Sorting and Searching",
        "slug": "sorting-and-searching",
        "category": "ALGORITHM",
        "description": "Comparison and non-comparison sorting paradigms, quickselect, custom comparators, and intervals.",
        "difficulty": "MEDIUM",
        "order_index": 6,
        "prerequisites": ["Arrays and Hashing"],
        "icon": "ArrowUpDown",
        "concepts": ["Merge Sort", "Quick Sort", "Stability", "Inversion Count"],
        "target": 7
    },
    {
        "id": "topic_linked_lists",
        "name": "Linked Lists",
        "slug": "linked-lists",
        "category": "DATA_STRUCTURE",
        "description": "Singly and doubly linked lists, pointer manipulation, dummy head nodes, cycles, and reversals.",
        "difficulty": "MEDIUM",
        "order_index": 7,
        "prerequisites": ["Pointers", "Memory Allocation"],
        "icon": "Link2",
        "concepts": ["Node References", "Dummy Sentinel Nodes", "Fast & Slow Pointers", "In-place Reversal"],
        "target": 10
    },
    {
        "id": "topic_stacks_queues",
        "name": "Stacks and Queues",
        "slug": "stacks-and-queues",
        "category": "DATA_STRUCTURE",
        "description": "LIFO stack semantics, FIFO queue buffering, monotonic stacks, and expression evaluation.",
        "difficulty": "EASY",
        "order_index": 8,
        "prerequisites": ["Arrays", "Linked Lists"],
        "icon": "Inbox",
        "concepts": ["LIFO Discipline", "FIFO Buffering", "Monotonic Stack", "Expression Parsing"],
        "target": 8
    },
    {
        "id": "topic_recursion_backtracking",
        "name": "Recursion and Backtracking",
        "slug": "recursion-and-backtracking",
        "category": "ALGORITHM",
        "description": "State-space tree exploration, combinatorial generation, pruning, permutations, and puzzle solvers.",
        "difficulty": "MEDIUM",
        "order_index": 9,
        "prerequisites": ["Call Stack", "Decision Trees"],
        "icon": "CornerDownRight",
        "concepts": ["Base Cases", "State Space Tree", "Backtracking Pruning", "Combinatorics"],
        "target": 10
    },
    {
        "id": "topic_trees_bst",
        "name": "Trees and Binary Search Trees",
        "slug": "trees-and-binary-search-trees",
        "category": "DATA_STRUCTURE",
        "description": "Hierarchical structures, tree traversals (pre/in/post/level), BST ordering invariants, and recursion.",
        "difficulty": "MEDIUM",
        "order_index": 10,
        "prerequisites": ["Recursion and Backtracking", "Pointers"],
        "icon": "GitFork",
        "concepts": ["Root & Leaves", "BST Invariant", "DFS & BFS", "Tree Height & Diameter"],
        "target": 14
    },
    {
        "id": "topic_heaps",
        "name": "Heaps and Priority Queues",
        "slug": "heaps-and-priority-queues",
        "category": "DATA_STRUCTURE",
        "description": "Binary heap mechanics, min/max priority queues, top-K element extraction, and streaming medians.",
        "difficulty": "MEDIUM",
        "order_index": 11,
        "prerequisites": ["Binary Trees", "Array Representation"],
        "icon": "BarChart2",
        "concepts": ["Heap Property", "O(1) Peek", "O(log N) Push/Pop", "Top-K Selection"],
        "target": 6
    },
    {
        "id": "topic_graphs",
        "name": "Graphs",
        "slug": "graphs",
        "category": "DATA_STRUCTURE",
        "description": "Adjacency lists, BFS/DFS traversals, topological sorting, connected components, and shortest paths.",
        "difficulty": "MEDIUM",
        "order_index": 12,
        "prerequisites": ["Trees", "Stacks and Queues", "Recursion"],
        "icon": "Share2",
        "concepts": ["Adjacency Representation", "Visited Sets", "Cycle Detection", "Topological Sort"],
        "target": 13
    },
    {
        "id": "topic_greedy",
        "name": "Greedy Algorithms",
        "slug": "greedy-algorithms",
        "category": "ALGORITHM",
        "description": "Locally optimal choices that yield global optima, interval scheduling, jump game, and gas station.",
        "difficulty": "MEDIUM",
        "order_index": 13,
        "prerequisites": ["Sorting and Searching", "Arrays"],
        "icon": "Award",
        "concepts": ["Greedy Choice Property", "Optimal Substructure", "Interval Sorting", "Prefix Gas Tracking"],
        "target": 7
    },
    {
        "id": "topic_dynamic_programming",
        "name": "Dynamic Programming",
        "slug": "dynamic-programming",
        "category": "TECHNIQUE",
        "description": "Overlapping subproblems, memoization, bottom-up tabulation, 1D/2D state design, and knapsack variants.",
        "difficulty": "MEDIUM",
        "order_index": 14,
        "prerequisites": ["Recursion and Backtracking", "Arrays"],
        "icon": "Cpu",
        "concepts": ["Memoization", "Tabulation", "State Transitions", "Space Optimization"],
        "target": 16
    },
    {
        "id": "topic_tries_advanced",
        "name": "Tries and Advanced Data Structures",
        "slug": "tries-and-advanced-data-structures",
        "category": "DATA_STRUCTURE",
        "description": "Prefix trees for efficient string searches, autocomplete, wildcard matching, and Disjoint Set Union (DSU).",
        "difficulty": "MEDIUM",
        "order_index": 15,
        "prerequisites": ["Trees and Binary Search Trees", "Hash Maps"],
        "icon": "FolderTree",
        "concepts": ["Prefix Sharing", "End-of-word Flags", "Union by Rank", "Path Compression"],
        "target": 4
    },
    {
        "id": "topic_bit_manipulation",
        "name": "Bit Manipulation",
        "slug": "bit-manipulation",
        "category": "TECHNIQUE",
        "description": "Bitwise AND, OR, XOR, NOT, left/right shifts, Hamming weight, counting bits, and bit masks.",
        "difficulty": "EASY",
        "order_index": 16,
        "prerequisites": ["Binary Number System"],
        "icon": "Binary",
        "concepts": ["XOR Cancellation", "Bit Masking", "Power of Two Tests", "Bit Shifting"],
        "target": 4
    }
]

print("Loaded canonical topics:", len(CANONICAL_TOPICS))
