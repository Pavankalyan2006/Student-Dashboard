// Auto-generated 150 DSA Practice Questions Master Catalog
// Conforming to 16 canonical DSA topics and exact difficulty distribution:
// 45 Easy, 75 Medium, 30 Hard = 150 Unique Problems.

import { DSAProblem, DSATopic } from '../models/dsaTypes';

export const TOP150_TOPICS: DSATopic[] = [
  {
    "id": "topic_arrays_hashing",
    "name": "Arrays and Hashing",
    "slug": "arrays",
    "category": "DATA_STRUCTURE",
    "description": "Contiguous memory manipulation, hash tables, frequency tracking, prefix sums, and in-place transformations.",
    "difficulty": "EASY",
    "order_index": 1,
    "prerequisites": [
      "Variables and Loops",
      "Basic Indexing"
    ],
    "icon": "Layers",
    "concepts": [
      "Contiguous Allocation",
      "Hash Maps & Sets",
      "Prefix Sums",
      "Frequency Counting"
    ],
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
    "prerequisites": [
      "Arrays and Hashing"
    ],
    "icon": "FileText",
    "concepts": [
      "Character Traversal",
      "String Immutability",
      "Two Pointers on Strings",
      "Sliding Window on Substrings"
    ],
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
    "prerequisites": [
      "Arrays and Hashing"
    ],
    "icon": "GitCommit",
    "concepts": [
      "Left & Right Pointers",
      "Slow & Fast Pointers",
      "Sorted Invariant",
      "Area Maximization"
    ],
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
    "prerequisites": [
      "Two Pointers",
      "Arrays and Hashing"
    ],
    "icon": "Maximize2",
    "concepts": [
      "Fixed Window",
      "Dynamic Expanding Window",
      "Shrinking Invariant",
      "Frequency Counting"
    ],
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
    "prerequisites": [
      "Arrays and Hashing"
    ],
    "icon": "Search",
    "concepts": [
      "Logarithmic Halving",
      "Boundary Conditions",
      "Search On Answer",
      "Rotated Invariants"
    ],
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
    "prerequisites": [
      "Arrays and Hashing"
    ],
    "icon": "ArrowUpDown",
    "concepts": [
      "Merge Sort",
      "Quick Sort",
      "Stability",
      "Inversion Count"
    ],
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
    "prerequisites": [
      "Pointers",
      "Memory Allocation"
    ],
    "icon": "Link2",
    "concepts": [
      "Node References",
      "Dummy Sentinel Nodes",
      "Fast & Slow Pointers",
      "In-place Reversal"
    ],
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
    "prerequisites": [
      "Arrays",
      "Linked Lists"
    ],
    "icon": "Inbox",
    "concepts": [
      "LIFO Discipline",
      "FIFO Buffering",
      "Monotonic Stack",
      "Expression Parsing"
    ],
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
    "prerequisites": [
      "Call Stack",
      "Decision Trees"
    ],
    "icon": "CornerDownRight",
    "concepts": [
      "Base Cases",
      "State Space Tree",
      "Backtracking Pruning",
      "Combinatorics"
    ],
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
    "prerequisites": [
      "Recursion and Backtracking",
      "Pointers"
    ],
    "icon": "GitFork",
    "concepts": [
      "Root & Leaves",
      "BST Invariant",
      "DFS & BFS",
      "Tree Height & Diameter"
    ],
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
    "prerequisites": [
      "Binary Trees",
      "Array Representation"
    ],
    "icon": "BarChart2",
    "concepts": [
      "Heap Property",
      "O(1) Peek",
      "O(log N) Push/Pop",
      "Top-K Selection"
    ],
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
    "prerequisites": [
      "Trees",
      "Stacks and Queues",
      "Recursion"
    ],
    "icon": "Share2",
    "concepts": [
      "Adjacency Representation",
      "Visited Sets",
      "Cycle Detection",
      "Topological Sort"
    ],
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
    "prerequisites": [
      "Sorting and Searching",
      "Arrays"
    ],
    "icon": "Award",
    "concepts": [
      "Greedy Choice Property",
      "Optimal Substructure",
      "Interval Sorting",
      "Prefix Gas Tracking"
    ],
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
    "prerequisites": [
      "Recursion and Backtracking",
      "Arrays"
    ],
    "icon": "Cpu",
    "concepts": [
      "Memoization",
      "Tabulation",
      "State Transitions",
      "Space Optimization"
    ],
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
    "prerequisites": [
      "Trees and Binary Search Trees",
      "Hash Maps"
    ],
    "icon": "FolderTree",
    "concepts": [
      "Prefix Sharing",
      "End-of-word Flags",
      "Union by Rank",
      "Path Compression"
    ],
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
    "prerequisites": [
      "Binary Number System"
    ],
    "icon": "Binary",
    "concepts": [
      "XOR Cancellation",
      "Bit Masking",
      "Power of Two Tests",
      "Bit Shifting"
    ],
    "target": 4
  }
];

export const TOP150_PROBLEMS: DSAProblem[] = [
  {
    "id": "dsa_top150_001",
    "number": 1,
    "title": "Two Sum",
    "slug": "two-sum",
    "topic_id": "topic_arrays_hashing",
    "subtopic": "Hash Map Lookup",
    "difficulty": "EASY",
    "roadmap_stage": "Beginner Foundations",
    "companies": [
      "Google",
      "Amazon",
      "Meta",
      "Apple",
      "Microsoft"
    ],
    "tags": [
      "arrays hashing"
    ],
    "description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.",
    "input_format": "Line 1: N integers separated by space representing nums\nLine 2: Single integer representing target",
    "output_format": "Two space-separated integers representing the 0-based indices.",
    "constraints": [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9",
      "Only one valid answer exists."
    ],
    "examples": [
      {
        "input": "2 7 11 15\n9",
        "output": "0 1",
        "explanation": "nums[0] + nums[1] == 2 + 7 == 9, so return 0 1."
      },
      {
        "input": "3 2 4\n6",
        "output": "1 2",
        "explanation": "nums[1] + nums[2] == 2 + 4 == 6, so return 1 2."
      },
      {
        "input": "3 3\n6",
        "output": "0 1",
        "explanation": "nums[0] + nums[1] == 3 + 3 == 6, so return 0 1."
      }
    ],
    "public_test_cases": [
      {
        "input": "2 7 11 15\n9",
        "output": "0 1"
      },
      {
        "input": "3 2 4\n6",
        "output": "1 2"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "3 3\n6",
        "output": "0 1"
      },
      {
        "input": "1 5 8 10 14\n18",
        "output": "2 3"
      },
      {
        "input": "-3 4 3 90\n0",
        "output": "0 2"
      }
    ],
    "hints": [
      "Can you use the complement `target - num` to check if the matching number has already been seen?",
      "Use a hash map to map each visited number to its index.",
      "Iterate through the array once: for each element, check if target - num is in your hash map."
    ],
    "optimal_complexity": {
      "time": "O(N)",
      "space": "O(N)"
    },
    "solution_explanation": "We iterate over the array once while storing each element and its index in a hash map. For each element x, we check if target - x is already in the map. This achieves O(N) time and O(N) auxiliary space.",
    "starter_code": {
      "python": "# 1. Two Sum\n# Difficulty: EASY | Topic: Hash Map Lookup\n# Time Complexity Target: O(N) | Space Complexity Target: O(N)\n\nimport sys\nimport json\n\ndef twoSum(nums: list[int], target: int) -> list[int]:\n    \"\"\"\n    Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n    \"\"\"\n    # TODO: Implement your solution here\n    seen = {}\n    for i, num in enumerate(nums):\n        diff = target - num\n        if diff in seen:\n            return [seen[diff], i]\n        seen[num] = i\n    return []\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(twoSum(...))\n",
      "javascript": "/**\n * 1. Two Sum\n * Difficulty: EASY | Topic: Hash Map Lookup\n * Optimal: O(N) time, O(N) space\n */\n\nconst fs = require('fs');\n\nfunction twoSum(nums: list[int], target: int) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 1. Two Sum\n// Difficulty: EASY | Topic: Hash Map Lookup\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 1. Two Sum\n// Difficulty: EASY | Topic: Hash Map Lookup\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_002",
    "number": 2,
    "title": "Contains Duplicate",
    "slug": "contains-duplicate",
    "topic_id": "topic_arrays_hashing",
    "subtopic": "Hash Set Verification",
    "difficulty": "EASY",
    "roadmap_stage": "Beginner Foundations",
    "companies": [
      "Amazon",
      "Apple",
      "Microsoft"
    ],
    "tags": [
      "arrays hashing"
    ],
    "description": "Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.",
    "input_format": "A single line of space-separated integers representing nums.",
    "output_format": "true if duplicate exists, false otherwise.",
    "constraints": [
      "1 <= nums.length <= 10^5",
      "-10^9 <= nums[i] <= 10^9"
    ],
    "examples": [
      {
        "input": "1 2 3 1",
        "output": "true",
        "explanation": "1 appears twice in the array."
      },
      {
        "input": "1 2 3 4",
        "output": "false",
        "explanation": "All elements are distinct."
      }
    ],
    "public_test_cases": [
      {
        "input": "1 2 3 1",
        "output": "true"
      },
      {
        "input": "1 2 3 4",
        "output": "false"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "1 1 1 3 3 4 3 2 4 2",
        "output": "true"
      },
      {
        "input": "100",
        "output": "false"
      },
      {
        "input": "-1 -2 -3 -1",
        "output": "true"
      }
    ],
    "hints": [
      "A brute force comparison takes O(N^2). Can you do better with additional space?",
      "A hash set allows O(1) average lookup and insertion.",
      "Iterate through nums. If an element already exists in the set, return true. Otherwise add it."
    ],
    "optimal_complexity": {
      "time": "O(N)",
      "space": "O(N)"
    },
    "solution_explanation": "Using a hash set, we track seen numbers. If an element is already present, a duplicate exists. Alternatively, compare len(nums) with len(set(nums)).",
    "starter_code": {
      "python": "# 2. Contains Duplicate\n# Difficulty: EASY | Topic: Hash Set Verification\n# Time Complexity Target: O(N) | Space Complexity Target: O(N)\n\nimport sys\nimport json\n\ndef containsDuplicate(nums: list[int]) -> bool:\n    \"\"\"\n    Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.\n    \"\"\"\n    # TODO: Implement your solution here\n    return len(nums) != len(set(nums))\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(containsDuplicate(...))\n",
      "javascript": "/**\n * 2. Contains Duplicate\n * Difficulty: EASY | Topic: Hash Set Verification\n * Optimal: O(N) time, O(N) space\n */\n\nconst fs = require('fs');\n\nfunction containsDuplicate(nums: list[int]) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 2. Contains Duplicate\n// Difficulty: EASY | Topic: Hash Set Verification\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 2. Contains Duplicate\n// Difficulty: EASY | Topic: Hash Set Verification\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_003",
    "number": 3,
    "title": "Best Time to Buy and Sell Stock",
    "slug": "best-time-to-buy-and-sell-stock",
    "topic_id": "topic_arrays_hashing",
    "subtopic": "Prefix Minimum Tracking",
    "difficulty": "EASY",
    "roadmap_stage": "Beginner Foundations",
    "companies": [
      "Amazon",
      "Google",
      "Microsoft",
      "Meta"
    ],
    "tags": [
      "arrays hashing"
    ],
    "description": "You are given an array prices where prices[i] is the price of a given stock on the ith day.\n\nYou want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.\n\nReturn the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.",
    "input_format": "A single line of space-separated integers representing stock prices across consecutive days.",
    "output_format": "Single integer representing maximum profit.",
    "constraints": [
      "1 <= prices.length <= 10^5",
      "0 <= prices[i] <= 10^4"
    ],
    "examples": [
      {
        "input": "7 1 5 3 6 4",
        "output": "5",
        "explanation": "Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6 - 1 = 5."
      },
      {
        "input": "7 6 4 3 1",
        "output": "0",
        "explanation": "In this case, no transactions are done and the max profit = 0."
      }
    ],
    "public_test_cases": [
      {
        "input": "7 1 5 3 6 4",
        "output": "5"
      },
      {
        "input": "7 6 4 3 1",
        "output": "0"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "2 4 1",
        "output": "2"
      },
      {
        "input": "3 2 6 5 0 3",
        "output": "4"
      },
      {
        "input": "1 2",
        "output": "1"
      }
    ],
    "hints": [
      "You cannot sell before you buy.",
      "Keep track of the minimum price encountered so far as you iterate through the days.",
      "On day i, the max profit if you sell today is prices[i] - min_price. Update the global max profit."
    ],
    "optimal_complexity": {
      "time": "O(N)",
      "space": "O(1)"
    },
    "solution_explanation": "Maintain min_price seen so far. At each day i, calculate current profit prices[i] - min_price and update max_profit. Single pass O(N) time and O(1) memory.",
    "starter_code": {
      "python": "# 3. Best Time to Buy and Sell Stock\n# Difficulty: EASY | Topic: Prefix Minimum Tracking\n# Time Complexity Target: O(N) | Space Complexity Target: O(1)\n\nimport sys\nimport json\n\ndef maxProfit(prices: list[int]) -> int:\n    \"\"\"\n    You are given an array prices where prices[i] is the price of a given stock on the ith day.\n    \"\"\"\n    # TODO: Implement your solution here\n    min_p, max_p = float('inf'), 0\n    for p in prices:\n        if p < min_p: min_p = p\n        elif p - min_p > max_p: max_p = p - min_p\n    return max_p\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(maxProfit(...))\n",
      "javascript": "/**\n * 3. Best Time to Buy and Sell Stock\n * Difficulty: EASY | Topic: Prefix Minimum Tracking\n * Optimal: O(N) time, O(1) space\n */\n\nconst fs = require('fs');\n\nfunction maxProfit(prices: list[int]) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 3. Best Time to Buy and Sell Stock\n// Difficulty: EASY | Topic: Prefix Minimum Tracking\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 3. Best Time to Buy and Sell Stock\n// Difficulty: EASY | Topic: Prefix Minimum Tracking\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_004",
    "number": 4,
    "title": "Majority Element",
    "slug": "majority-element",
    "topic_id": "topic_arrays_hashing",
    "subtopic": "Boyer-Moore Voting",
    "difficulty": "EASY",
    "roadmap_stage": "Beginner Foundations",
    "companies": [
      "Amazon",
      "Google",
      "Microsoft"
    ],
    "tags": [
      "arrays hashing"
    ],
    "description": "Given an array nums of size n, return the majority element.\n\nThe majority element is the element that appears more than \u230an / 2\u230b times. You may assume that the majority element always exists in the array.",
    "input_format": "A single line of space-separated integers representing nums.",
    "output_format": "The majority integer element.",
    "constraints": [
      "n == nums.length",
      "1 <= n <= 5 * 10^4",
      "-10^9 <= nums[i] <= 10^9"
    ],
    "examples": [
      {
        "input": "3 2 3",
        "output": "3",
        "explanation": "3 appears 2 times out of 3, which is > 1.5."
      },
      {
        "input": "2 2 1 1 1 2 2",
        "output": "2",
        "explanation": "2 appears 4 times out of 7, which is > 3.5."
      }
    ],
    "public_test_cases": [
      {
        "input": "3 2 3",
        "output": "3"
      },
      {
        "input": "2 2 1 1 1 2 2",
        "output": "2"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "1",
        "output": "1"
      },
      {
        "input": "6 5 5",
        "output": "5"
      },
      {
        "input": "10 9 9 9 10",
        "output": "9"
      }
    ],
    "hints": [
      "Can you solve this in O(1) space rather than using a hash map?",
      "Look up the Boyer-Moore Voting Algorithm.",
      "Maintain a candidate and a counter. Increment when you see candidate, decrement otherwise. When count drops to 0, pick current element as candidate."
    ],
    "optimal_complexity": {
      "time": "O(N)",
      "space": "O(1)"
    },
    "solution_explanation": "Boyer-Moore Voting Algorithm maintains candidate and count. Since majority element occurs > n/2 times, its count remains positive at the end.",
    "starter_code": {
      "python": "# 4. Majority Element\n# Difficulty: EASY | Topic: Boyer-Moore Voting\n# Time Complexity Target: O(N) | Space Complexity Target: O(1)\n\nimport sys\nimport json\n\ndef majorityElement(nums: list[int]) -> int:\n    \"\"\"\n    Given an array nums of size n, return the majority element.\n    \"\"\"\n    # TODO: Implement your solution here\n    candidate, count = None, 0\n    for n in nums:\n        if count == 0:\n            candidate = n\n        count += (1 if n == candidate else -1)\n    return candidate\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(majorityElement(...))\n",
      "javascript": "/**\n * 4. Majority Element\n * Difficulty: EASY | Topic: Boyer-Moore Voting\n * Optimal: O(N) time, O(1) space\n */\n\nconst fs = require('fs');\n\nfunction majorityElement(nums: list[int]) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 4. Majority Element\n// Difficulty: EASY | Topic: Boyer-Moore Voting\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 4. Majority Element\n// Difficulty: EASY | Topic: Boyer-Moore Voting\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_merge_sorted_array",
    "number": 5,
    "title": "Merge Sorted Array",
    "slug": "merge-sorted-array",
    "topic_id": "topic_arrays_hashing",
    "subtopic": "Three Pointers / In-Place Merge",
    "difficulty": "EASY",
    "roadmap_stage": "Beginner Foundations",
    "companies": [
      "Amazon",
      "Meta",
      "Google",
      "Microsoft",
      "Apple"
    ],
    "tags": [
      "arrays hashing"
    ],
    "description": "You are given two integer arrays nums1 and nums2, sorted in non-decreasing order, and two integers m and n, representing the number of elements in nums1 and nums2 respectively.\n\nMerge nums1 and nums2 into a single array sorted in non-decreasing order.\n\nThe final sorted array should not be returned by the function, but instead be stored inside the array nums1. To accommodate this, nums1 has a length of m + n, where the first m elements denote the elements that should be merged, and the last n elements are set to 0 and should be ignored. nums2 has a length of n.",
    "input_format": "Line 1: m + n integers representing nums1\nLine 2: Single integer m\nLine 3: n integers representing nums2\nLine 4: Single integer n",
    "output_format": "A single line of space-separated integers representing the merged nums1.",
    "constraints": [
      "nums1.length == m + n",
      "nums2.length == n",
      "0 <= m, n <= 200",
      "1 <= m + n <= 200",
      "-10^9 <= nums1[i], nums2[j] <= 10^9"
    ],
    "examples": [
      {
        "input": "1 2 3 0 0 0\n3\n2 5 6\n3",
        "output": "1 2 2 3 5 6",
        "explanation": "The arrays we are merging are [1,2,3] and [2,5,6]. Result: [1,2,2,3,5,6]."
      },
      {
        "input": "1\n1\n\n0",
        "output": "1",
        "explanation": "Only one element from nums1."
      }
    ],
    "public_test_cases": [
      {
        "input": "1 2 3 0 0 0\n3\n2 5 6\n3",
        "output": "1 2 2 3 5 6"
      },
      {
        "input": "1\n1\n\n0",
        "output": "1"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "0\n0\n1\n1",
        "output": "1"
      },
      {
        "input": "4 5 6 0 0 0\n3\n1 2 3\n3",
        "output": "1 2 3 4 5 6"
      },
      {
        "input": "2 0\n1\n1\n1",
        "output": "1 2"
      }
    ],
    "hints": [
      "You can solve this in O(m + n) time and O(1) space without extra memory.",
      "Notice that nums1 has empty buffer space at the tail. Can you fill it starting from the back?",
      "Maintain three pointers: p1 = m - 1, p2 = n - 1, and p = m + n - 1. Compare nums1[p1] and nums2[p2], place the larger at nums1[p], and decrement."
    ],
    "optimal_complexity": {
      "time": "O(N)",
      "space": "O(1)"
    },
    "solution_explanation": "Use three backward pointers: place the largest elements from the back of nums1 to avoid overwriting unmerged elements.",
    "starter_code": {
      "python": "# 5. Merge Sorted Array\n# Difficulty: EASY | Topic: Three Pointers / In-Place Merge\n# Time Complexity Target: O(N) | Space Complexity Target: O(1)\n\nimport sys\nimport json\n\ndef merge(nums1: list[int], m: int, nums2: list[int], n: int) -> None:\n    \"\"\"\n    You are given two integer arrays nums1 and nums2, sorted in non-decreasing order, and two integers m and n, representing the number of elements in nums1 and nums2 respectively.\n    \"\"\"\n    # TODO: Implement your solution here\n    p1, p2, p = m - 1, n - 1, m + n - 1\n    while p2 >= 0:\n        if p1 >= 0 and nums1[p1] > nums2[p2]:\n            nums1[p] = nums1[p1]\n            p1 -= 1\n        else:\n            nums1[p] = nums2[p2]\n            p2 -= 1\n        p -= 1\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(merge(...))\n",
      "javascript": "/**\n * 5. Merge Sorted Array\n * Difficulty: EASY | Topic: Three Pointers / In-Place Merge\n * Optimal: O(N) time, O(1) space\n */\n\nconst fs = require('fs');\n\nfunction merge(nums1: list[int], m: int, nums2: list[int], n: int) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 5. Merge Sorted Array\n// Difficulty: EASY | Topic: Three Pointers / In-Place Merge\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 5. Merge Sorted Array\n// Difficulty: EASY | Topic: Three Pointers / In-Place Merge\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_006",
    "number": 6,
    "title": "Product of Array Except Self",
    "slug": "product-of-array-except-self",
    "topic_id": "topic_arrays_hashing",
    "subtopic": "Prefix & Suffix Products",
    "difficulty": "MEDIUM",
    "roadmap_stage": "Core Patterns",
    "companies": [
      "Amazon",
      "Apple",
      "Microsoft",
      "Meta"
    ],
    "tags": [
      "arrays hashing"
    ],
    "description": "Given an integer array nums, return an array answer such that answer[i] is equal to the product of all the elements of nums except nums[i].\n\nThe product of any prefix or suffix of nums is guaranteed to fit in a 32-bit integer.\n\nYou must write an algorithm that runs in O(n) time and without using the division operation.",
    "input_format": "A single line of space-separated integers representing nums.",
    "output_format": "A space-separated line of integers representing the resulting products.",
    "constraints": [
      "2 <= nums.length <= 10^5",
      "-30 <= nums[i] <= 30",
      "Product fits in 32-bit signed integer."
    ],
    "examples": [
      {
        "input": "1 2 3 4",
        "output": "24 12 8 6",
        "explanation": "2*3*4=24, 1*3*4=12, 1*2*4=8, 1*2*3=6."
      },
      {
        "input": "-1 1 0 -3 3",
        "output": "0 0 9 0 0"
      }
    ],
    "public_test_cases": [
      {
        "input": "1 2 3 4",
        "output": "24 12 8 6"
      },
      {
        "input": "-1 1 0 -3 3",
        "output": "0 0 9 0 0"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "2 3",
        "output": "3 2"
      },
      {
        "input": "4 5 1 8 2",
        "output": "80 64 320 40 160"
      }
    ],
    "hints": [
      "Can you compute the product of all elements to the left of i, and to the right of i?",
      "First pass: fill output array with prefix products.",
      "Second pass: maintain a running suffix product variable from right to left, multiplying into output."
    ],
    "optimal_complexity": {
      "time": "O(N)",
      "space": "O(1)"
    },
    "solution_explanation": "Compute prefix products left-to-right into the output array, then traverse backwards right-to-left multiplying running suffix products into each slot.",
    "starter_code": {
      "python": "# 6. Product of Array Except Self\n# Difficulty: MEDIUM | Topic: Prefix & Suffix Products\n# Time Complexity Target: O(N) | Space Complexity Target: O(1)\n\nimport sys\nimport json\n\ndef productExceptSelf(nums: list[int]) -> list[int]:\n    \"\"\"\n    Given an integer array nums, return an array answer such that answer[i] is equal to the product of all the elements of nums except nums[i].\n    \"\"\"\n    # TODO: Implement your solution here\n    n = len(nums)\n    res = [1] * n\n    prefix = 1\n    for i in range(n):\n        res[i] = prefix\n        prefix *= nums[i]\n    postfix = 1\n    for i in range(n - 1, -1, -1):\n        res[i] *= postfix\n        postfix *= nums[i]\n    return res\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(productExceptSelf(...))\n",
      "javascript": "/**\n * 6. Product of Array Except Self\n * Difficulty: MEDIUM | Topic: Prefix & Suffix Products\n * Optimal: O(N) time, O(1) space\n */\n\nconst fs = require('fs');\n\nfunction productExceptSelf(nums: list[int]) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 6. Product of Array Except Self\n// Difficulty: MEDIUM | Topic: Prefix & Suffix Products\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 6. Product of Array Except Self\n// Difficulty: MEDIUM | Topic: Prefix & Suffix Products\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "lc_150_maximum_subarray",
    "number": 7,
    "title": "Maximum Subarray",
    "slug": "maximum-subarray",
    "topic_id": "topic_arrays_hashing",
    "subtopic": "Kadane's Algorithm",
    "difficulty": "MEDIUM",
    "roadmap_stage": "Core Patterns",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Meta"
    ],
    "tags": [
      "arrays hashing"
    ],
    "description": "Given an integer array nums, find the subarray with the largest sum, and return its sum.",
    "input_format": "A single line of space-separated integers representing nums.",
    "output_format": "Single integer representing the maximum subarray sum.",
    "constraints": [
      "1 <= nums.length <= 10^5",
      "-10^4 <= nums[i] <= 10^4"
    ],
    "examples": [
      {
        "input": "-2 1 -3 4 -1 2 1 -5 4",
        "output": "6",
        "explanation": "The subarray [4, -1, 2, 1] has the largest sum 6."
      },
      {
        "input": "1",
        "output": "1",
        "explanation": "The subarray [1] has the largest sum 1."
      },
      {
        "input": "5 4 -1 7 8",
        "output": "23",
        "explanation": "The subarray [5, 4, -1, 7, 8] has the largest sum 23."
      }
    ],
    "public_test_cases": [
      {
        "input": "-2 1 -3 4 -1 2 1 -5 4",
        "output": "6"
      },
      {
        "input": "1",
        "output": "1"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "5 4 -1 7 8",
        "output": "23"
      },
      {
        "input": "-1 -2 -3",
        "output": "-1"
      },
      {
        "input": "-2 -1",
        "output": "-1"
      }
    ],
    "hints": [
      "If your current running sum drops below 0, can it help any future subarray?",
      "Whenever running sum < 0, reset it to 0.",
      "Track global maximum sum at each step."
    ],
    "optimal_complexity": {
      "time": "O(N)",
      "space": "O(1)"
    },
    "solution_explanation": "Kadane's algorithm maintains maximum sum ending at current index: curr = max(x, curr + x), and updates overall maximum so far.",
    "starter_code": {
      "python": "# 7. Maximum Subarray\n# Difficulty: MEDIUM | Topic: Kadane's Algorithm\n# Time Complexity Target: O(N) | Space Complexity Target: O(1)\n\nimport sys\nimport json\n\ndef maxSubArray(nums: list[int]) -> int:\n    \"\"\"\n    Given an integer array nums, find the subarray with the largest sum, and return its sum.\n    \"\"\"\n    # TODO: Implement your solution here\n    max_so_far = nums[0]\n    curr = 0\n    for x in nums:\n        curr = max(x, curr + x)\n        max_so_far = max(max_so_far, curr)\n    return max_so_far\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(maxSubArray(...))\n",
      "javascript": "/**\n * 7. Maximum Subarray\n * Difficulty: MEDIUM | Topic: Kadane's Algorithm\n * Optimal: O(N) time, O(1) space\n */\n\nconst fs = require('fs');\n\nfunction maxSubArray(nums: list[int]) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 7. Maximum Subarray\n// Difficulty: MEDIUM | Topic: Kadane's Algorithm\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 7. Maximum Subarray\n// Difficulty: MEDIUM | Topic: Kadane's Algorithm\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_008",
    "number": 8,
    "title": "Find the Duplicate Number",
    "slug": "find-the-duplicate-number",
    "topic_id": "topic_arrays_hashing",
    "subtopic": "Floyd's Tortoise and Hare",
    "difficulty": "MEDIUM",
    "roadmap_stage": "Core Patterns",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google"
    ],
    "tags": [
      "arrays hashing"
    ],
    "description": "Given an array of integers nums containing n + 1 integers where each integer is in the range [1, n] inclusive.\n\nThere is only one repeated number in nums, return this repeated number.\n\nYou must solve the problem without modifying the array nums and uses only constant extra space.",
    "input_format": "A single line of space-separated integers of length n + 1.",
    "output_format": "The duplicate integer.",
    "constraints": [
      "1 <= n <= 10^5",
      "nums.length == n + 1",
      "1 <= nums[i] <= n",
      "All integers in nums appear once except for one integer which appears two or more times."
    ],
    "examples": [
      {
        "input": "1 3 4 2 2",
        "output": "2",
        "explanation": "2 is the duplicate number."
      },
      {
        "input": "3 1 3 4 2",
        "output": "3",
        "explanation": "3 is the duplicate number."
      }
    ],
    "public_test_cases": [
      {
        "input": "1 3 4 2 2",
        "output": "2"
      },
      {
        "input": "3 1 3 4 2",
        "output": "3"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "2 2 2 2 2",
        "output": "2"
      },
      {
        "input": "1 1",
        "output": "1"
      }
    ],
    "hints": [
      "Think of the array values as pointers: index i points to nums[i].",
      "Because there is a duplicate, two indices point to the same next node, creating a cycle.",
      "Use Floyd's cycle-finding algorithm (tortoise and hare) to find the entrance of the cycle."
    ],
    "optimal_complexity": {
      "time": "O(N)",
      "space": "O(1)"
    },
    "solution_explanation": "Treat values as next pointers. A duplicate means multiple nodes point to the same node, forming a cycle. Floyd's cycle detection locates the cycle entrance in O(N) time and O(1) space.",
    "starter_code": {
      "python": "# 8. Find the Duplicate Number\n# Difficulty: MEDIUM | Topic: Floyd's Tortoise and Hare\n# Time Complexity Target: O(N) | Space Complexity Target: O(1)\n\nimport sys\nimport json\n\ndef findDuplicate(nums: list[int]) -> int:\n    \"\"\"\n    Given an array of integers nums containing n + 1 integers where each integer is in the range [1, n] inclusive.\n    \"\"\"\n    # TODO: Implement your solution here\n    slow = nums[0]\n    fast = nums[0]\n    while True:\n        slow = nums[slow]\n        fast = nums[nums[fast]]\n        if slow == fast:\n            break\n    slow = nums[0]\n    while slow != fast:\n        slow = nums[slow]\n        fast = nums[fast]\n    return slow\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(findDuplicate(...))\n",
      "javascript": "/**\n * 8. Find the Duplicate Number\n * Difficulty: MEDIUM | Topic: Floyd's Tortoise and Hare\n * Optimal: O(N) time, O(1) space\n */\n\nconst fs = require('fs');\n\nfunction findDuplicate(nums: list[int]) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 8. Find the Duplicate Number\n// Difficulty: MEDIUM | Topic: Floyd's Tortoise and Hare\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 8. Find the Duplicate Number\n// Difficulty: MEDIUM | Topic: Floyd's Tortoise and Hare\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_009",
    "number": 9,
    "title": "Longest Consecutive Sequence",
    "slug": "longest-consecutive-sequence",
    "topic_id": "topic_arrays_hashing",
    "subtopic": "Hash Set Sequence Extension",
    "difficulty": "MEDIUM",
    "roadmap_stage": "Core Patterns",
    "companies": [
      "Google",
      "Amazon",
      "Meta",
      "Spotify"
    ],
    "tags": [
      "arrays hashing"
    ],
    "description": "Given an unsorted array of integers nums, return the length of the longest consecutive elements sequence.\n\nYou must write an algorithm that runs in O(n) time.",
    "input_format": "A single line of space-separated integers representing nums.",
    "output_format": "Single integer representing the longest sequence length.",
    "constraints": [
      "0 <= nums.length <= 10^5",
      "-10^9 <= nums[i] <= 10^9"
    ],
    "examples": [
      {
        "input": "100 4 200 1 3 2",
        "output": "4",
        "explanation": "The longest consecutive sequence is [1, 2, 3, 4]. Its length is 4."
      },
      {
        "input": "0 3 7 2 5 8 4 6 0 1",
        "output": "9",
        "explanation": "The longest consecutive sequence is [0, 1, 2, 3, 4, 5, 6, 7, 8]. Its length is 9."
      }
    ],
    "public_test_cases": [
      {
        "input": "100 4 200 1 3 2",
        "output": "4"
      },
      {
        "input": "0 3 7 2 5 8 4 6 0 1",
        "output": "9"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "",
        "output": "0"
      },
      {
        "input": "1",
        "output": "1"
      },
      {
        "input": "9 1 4 7 3 -1 0 5 8 -1 6",
        "output": "7"
      }
    ],
    "hints": [
      "Sorting takes O(N log N). Can you use a hash set for O(1) lookups?",
      "Only start counting a sequence if num - 1 is NOT in the set (i.e. num is the start of a sequence).",
      "From each sequence start, increment by 1 while elements exist in the set."
    ],
    "optimal_complexity": {
      "time": "O(N)",
      "space": "O(N)"
    },
    "solution_explanation": "Insert all numbers into a hash set. Only count from x if x - 1 is not in the set. Each element is visited at most twice, yielding linear O(N) runtime.",
    "starter_code": {
      "python": "# 9. Longest Consecutive Sequence\n# Difficulty: MEDIUM | Topic: Hash Set Sequence Extension\n# Time Complexity Target: O(N) | Space Complexity Target: O(N)\n\nimport sys\nimport json\n\ndef longestConsecutive(nums: list[int]) -> int:\n    \"\"\"\n    Given an unsorted array of integers nums, return the length of the longest consecutive elements sequence.\n    \"\"\"\n    # TODO: Implement your solution here\n    s = set(nums)\n    best = 0\n    for x in s:\n        if x - 1 not in s:\n            curr = x\n            length = 1\n            while curr + 1 in s:\n                curr += 1\n                length += 1\n            best = max(best, length)\n    return best\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(longestConsecutive(...))\n",
      "javascript": "/**\n * 9. Longest Consecutive Sequence\n * Difficulty: MEDIUM | Topic: Hash Set Sequence Extension\n * Optimal: O(N) time, O(N) space\n */\n\nconst fs = require('fs');\n\nfunction longestConsecutive(nums: list[int]) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 9. Longest Consecutive Sequence\n// Difficulty: MEDIUM | Topic: Hash Set Sequence Extension\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 9. Longest Consecutive Sequence\n// Difficulty: MEDIUM | Topic: Hash Set Sequence Extension\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_010",
    "number": 10,
    "title": "Merge Intervals",
    "slug": "merge-intervals",
    "topic_id": "topic_arrays_hashing",
    "subtopic": "Interval Sorting & Merging",
    "difficulty": "MEDIUM",
    "roadmap_stage": "Core Patterns",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Meta"
    ],
    "tags": [
      "arrays hashing"
    ],
    "description": "Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.",
    "input_format": "Line 1: N (number of intervals)\nNext N lines: start end separated by space",
    "output_format": "Merged intervals, one per line as start end.",
    "constraints": [
      "1 <= intervals.length <= 10^4",
      "intervals[i].length == 2",
      "0 <= starti <= endi <= 10^4"
    ],
    "examples": [
      {
        "input": "4\n1 3\n2 6\n8 10\n15 18",
        "output": "1 6\n8 10\n15 18",
        "explanation": "Intervals [1,3] and [2,6] overlap, merging into [1,6]."
      },
      {
        "input": "2\n1 4\n4 5",
        "output": "1 5",
        "explanation": "Intervals [1,4] and [4,5] overlap."
      }
    ],
    "public_test_cases": [
      {
        "input": "4\n1 3\n2 6\n8 10\n15 18",
        "output": "1 6\n8 10\n15 18"
      },
      {
        "input": "2\n1 4\n4 5",
        "output": "1 5"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "1\n1 4",
        "output": "1 4"
      },
      {
        "input": "3\n1 4\n0 4\n3 5",
        "output": "0 5"
      }
    ],
    "hints": [
      "Sort the intervals by their start times.",
      "Iterate through the sorted intervals. If the current interval overlaps with the previous one (i.e. start <= last.end), merge them.",
      "Otherwise, append current interval to the result list."
    ],
    "optimal_complexity": {
      "time": "O(N log N)",
      "space": "O(N)"
    },
    "solution_explanation": "Sort intervals by start time. Maintain a list of merged intervals. If current interval starts before or at the previous interval's end, merge by updating end = max(end1, end2).",
    "starter_code": {
      "python": "# 10. Merge Intervals\n# Difficulty: MEDIUM | Topic: Interval Sorting & Merging\n# Time Complexity Target: O(N log N) | Space Complexity Target: O(N)\n\nimport sys\nimport json\n\ndef mergeIntervals(intervals: list[list[int]]) -> list[list[int]]:\n    \"\"\"\n    Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.\n    \"\"\"\n    # TODO: Implement your solution here\n    intervals.sort(key=lambda x: x[0])\n    merged = []\n    for iv in intervals:\n        if not merged or merged[-1][1] < iv[0]:\n            merged.append(iv)\n        else:\n            merged[-1][1] = max(merged[-1][1], iv[1])\n    return merged\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(mergeIntervals(...))\n",
      "javascript": "/**\n * 10. Merge Intervals\n * Difficulty: MEDIUM | Topic: Interval Sorting & Merging\n * Optimal: O(N log N) time, O(N) space\n */\n\nconst fs = require('fs');\n\nfunction mergeIntervals(intervals: list[list[int]]) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 10. Merge Intervals\n// Difficulty: MEDIUM | Topic: Interval Sorting & Merging\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 10. Merge Intervals\n// Difficulty: MEDIUM | Topic: Interval Sorting & Merging\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_011",
    "number": 11,
    "title": "Insert Interval",
    "slug": "insert-interval",
    "topic_id": "topic_arrays_hashing",
    "subtopic": "Interval Insertion & Overlap",
    "difficulty": "MEDIUM",
    "roadmap_stage": "Core Patterns",
    "companies": [
      "Google",
      "Facebook",
      "LinkedIn"
    ],
    "tags": [
      "arrays hashing"
    ],
    "description": "You are given an array of non-overlapping intervals intervals where intervals[i] = [starti, endi] sorted in ascending order by starti. You are also given an interval newInterval = [start, end] that represents the start and end of another interval.\n\nInsert newInterval into intervals such that intervals is still sorted in ascending order by starti and intervals still does not have any overlapping intervals (merge overlapping intervals if necessary).\n\nReturn intervals after the insertion.",
    "input_format": "Line 1: N (number of existing intervals)\nNext N lines: start end\nLast line: newInterval start end",
    "output_format": "Merged intervals, one per line.",
    "constraints": [
      "0 <= intervals.length <= 10^4",
      "0 <= starti <= endi <= 10^5",
      "intervals is sorted by starti in ascending order."
    ],
    "examples": [
      {
        "input": "2\n1 3\n6 9\n2 5",
        "output": "1 5\n6 9",
        "explanation": "newInterval [2,5] overlaps with [1,3], resulting in [1,5],[6,9]."
      },
      {
        "input": "5\n1 2\n3 5\n6 7\n8 10\n12 16\n4 8",
        "output": "1 2\n3 10\n12 16"
      }
    ],
    "public_test_cases": [
      {
        "input": "2\n1 3\n6 9\n2 5",
        "output": "1 5\n6 9"
      },
      {
        "input": "5\n1 2\n3 5\n6 7\n8 10\n12 16\n4 8",
        "output": "1 2\n3 10\n12 16"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "0\n5 7",
        "output": "5 7"
      },
      {
        "input": "1\n1 5\n2 3",
        "output": "1 5"
      }
    ],
    "hints": [
      "Three phases: 1) add all intervals that end before newInterval begins.",
      "2) merge all intervals that overlap with newInterval.",
      "3) add all intervals that start after newInterval ends."
    ],
    "optimal_complexity": {
      "time": "O(N)",
      "space": "O(N)"
    },
    "solution_explanation": "Iterate linearly: add non-overlapping left intervals, expand newInterval with any overlapping intervals, add newInterval, and append remaining right intervals.",
    "starter_code": {
      "python": "# 11. Insert Interval\n# Difficulty: MEDIUM | Topic: Interval Insertion & Overlap\n# Time Complexity Target: O(N) | Space Complexity Target: O(N)\n\nimport sys\nimport json\n\ndef insertInterval(intervals: list[list[int]], newInterval: list[int]) -> list[list[int]]:\n    \"\"\"\n    You are given an array of non-overlapping intervals intervals where intervals[i] = [starti, endi] sorted in ascending order by starti.\n    \"\"\"\n    # TODO: Implement your solution here\n    res = []\n    i, n = 0, len(intervals)\n    while i < n and intervals[i][1] < newInterval[0]:\n        res.append(intervals[i])\n        i += 1\n    while i < n and intervals[i][0] <= newInterval[1]:\n        newInterval[0] = min(newInterval[0], intervals[i][0])\n        newInterval[1] = max(newInterval[1], intervals[i][1])\n        i += 1\n    res.append(newInterval)\n    while i < n:\n        res.append(intervals[i])\n        i += 1\n    return res\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(insertInterval(...))\n",
      "javascript": "/**\n * 11. Insert Interval\n * Difficulty: MEDIUM | Topic: Interval Insertion & Overlap\n * Optimal: O(N) time, O(N) space\n */\n\nconst fs = require('fs');\n\nfunction insertInterval(intervals: list[list[int]], newInterval: list[int]) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 11. Insert Interval\n// Difficulty: MEDIUM | Topic: Interval Insertion & Overlap\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 11. Insert Interval\n// Difficulty: MEDIUM | Topic: Interval Insertion & Overlap\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_012",
    "number": 12,
    "title": "Set Matrix Zeroes",
    "slug": "set-matrix-zeroes",
    "topic_id": "topic_arrays_hashing",
    "subtopic": "In-Place Matrix Markers",
    "difficulty": "MEDIUM",
    "roadmap_stage": "Core Patterns",
    "companies": [
      "Amazon",
      "Microsoft",
      "Meta"
    ],
    "tags": [
      "arrays hashing"
    ],
    "description": "Given an m x n integer matrix matrix, if an element is 0, set its entire row and column to 0's.\n\nYou must do it in place without using additional O(m*n) space.",
    "input_format": "Line 1: m n (rows and columns)\nNext m lines: n space-separated integers",
    "output_format": "Matrix after modification, m lines of n space-separated integers.",
    "constraints": [
      "m == matrix.length",
      "n == matrix[0].length",
      "1 <= m, n <= 200",
      "-2^31 <= matrix[i][j] <= 2^31 - 1"
    ],
    "examples": [
      {
        "input": "3 3\n1 1 1\n1 0 1\n1 1 1",
        "output": "1 0 1\n0 0 0\n1 0 1",
        "explanation": "Row 1 and Column 1 are set to 0."
      },
      {
        "input": "3 4\n0 1 2 0\n3 4 5 2\n1 3 1 5",
        "output": "0 0 0 0\n0 4 5 0\n0 3 1 0"
      }
    ],
    "public_test_cases": [
      {
        "input": "3 3\n1 1 1\n1 0 1\n1 1 1",
        "output": "1 0 1\n0 0 0\n1 0 1"
      },
      {
        "input": "3 4\n0 1 2 0\n3 4 5 2\n1 3 1 5",
        "output": "0 0 0 0\n0 4 5 0\n0 3 1 0"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "1 1\n0",
        "output": "0"
      },
      {
        "input": "2 2\n1 2\n3 4",
        "output": "1 2\n3 4"
      }
    ],
    "hints": [
      "Can you use the first row and first column of the matrix itself as your markers?",
      "Keep a separate boolean flag for whether the first row or first column originally had a 0.",
      "Iterate from 1..m and 1..n to zero out cells based on row/column headers."
    ],
    "optimal_complexity": {
      "time": "O(M * N)",
      "space": "O(1)"
    },
    "solution_explanation": "Use first row and column as marker arrays. Use boolean flags for the first row and column themselves. Zero out inner cells first, then header lines.",
    "starter_code": {
      "python": "# 12. Set Matrix Zeroes\n# Difficulty: MEDIUM | Topic: In-Place Matrix Markers\n# Time Complexity Target: O(M * N) | Space Complexity Target: O(1)\n\nimport sys\nimport json\n\ndef setZeroes(matrix: list[list[int]]) -> None:\n    \"\"\"\n    Given an m x n integer matrix matrix, if an element is 0, set its entire row and column to 0's.\n    \"\"\"\n    # TODO: Implement your solution here\n    m, n = len(matrix), len(matrix[0])\n    row_zero = any(matrix[0][j] == 0 for j in range(n))\n    col_zero = any(matrix[i][0] == 0 for i in range(m))\n    for i in range(1, m):\n        for j in range(1, n):\n            if matrix[i][j] == 0:\n                matrix[i][0] = 0\n                matrix[0][j] = 0\n    for i in range(1, m):\n        for j in range(1, n):\n            if matrix[i][0] == 0 or matrix[0][j] == 0:\n                matrix[i][j] = 0\n    if row_zero:\n        for j in range(n): matrix[0][j] = 0\n    if col_zero:\n        for i in range(m): matrix[i][0] = 0\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(setZeroes(...))\n",
      "javascript": "/**\n * 12. Set Matrix Zeroes\n * Difficulty: MEDIUM | Topic: In-Place Matrix Markers\n * Optimal: O(M * N) time, O(1) space\n */\n\nconst fs = require('fs');\n\nfunction setZeroes(matrix: list[list[int]]) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 12. Set Matrix Zeroes\n// Difficulty: MEDIUM | Topic: In-Place Matrix Markers\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 12. Set Matrix Zeroes\n// Difficulty: MEDIUM | Topic: In-Place Matrix Markers\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_013",
    "number": 13,
    "title": "Rotate Image",
    "slug": "rotate-image",
    "topic_id": "topic_arrays_hashing",
    "subtopic": "Matrix Transpose & Reverse",
    "difficulty": "MEDIUM",
    "roadmap_stage": "Core Patterns",
    "companies": [
      "Amazon",
      "Apple",
      "Google",
      "Microsoft"
    ],
    "tags": [
      "arrays hashing"
    ],
    "description": "You are given an n x n 2D matrix representing an image, rotate the image by 90 degrees (clockwise).\n\nYou have to rotate the image in-place, which means you have to modify the input 2D matrix directly. DO NOT allocate another 2D matrix and do the rotation.",
    "input_format": "Line 1: n\nNext n lines: n space-separated integers",
    "output_format": "Rotated matrix, n lines with n space-separated integers.",
    "constraints": [
      "n == matrix.length == matrix[i].length",
      "1 <= n <= 20",
      "-1000 <= matrix[i][j] <= 1000"
    ],
    "examples": [
      {
        "input": "3\n1 2 3\n4 5 6\n7 8 9",
        "output": "7 4 1\n8 5 2\n9 6 3",
        "explanation": "Matrix rotated 90 degrees clockwise."
      },
      {
        "input": "4\n5 1 9 11\n2 4 8 10\n13 3 6 7\n15 14 12 16",
        "output": "15 13 2 5\n14 3 4 1\n12 6 8 9\n16 7 10 11"
      }
    ],
    "public_test_cases": [
      {
        "input": "3\n1 2 3\n4 5 6\n7 8 9",
        "output": "7 4 1\n8 5 2\n9 6 3"
      },
      {
        "input": "4\n5 1 9 11\n2 4 8 10\n13 3 6 7\n15 14 12 16",
        "output": "15 13 2 5\n14 3 4 1\n12 6 8 9\n16 7 10 11"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "1\n42",
        "output": "42"
      },
      {
        "input": "2\n1 2\n3 4",
        "output": "3 1\n4 2"
      }
    ],
    "hints": [
      "A clockwise 90 degree rotation is equivalent to transposing the matrix, followed by reversing each row.",
      "Transpose: swap matrix[i][j] with matrix[j][i].",
      "Reverse: reverse each row in place."
    ],
    "optimal_complexity": {
      "time": "O(N^2)",
      "space": "O(1)"
    },
    "solution_explanation": "Transpose the matrix by swapping across the main diagonal (i, j) <-> (j, i). Then reverse each row horizontally to complete the clockwise rotation in-place.",
    "starter_code": {
      "python": "# 13. Rotate Image\n# Difficulty: MEDIUM | Topic: Matrix Transpose & Reverse\n# Time Complexity Target: O(N^2) | Space Complexity Target: O(1)\n\nimport sys\nimport json\n\ndef rotateMatrix(matrix: list[list[int]]) -> None:\n    \"\"\"\n    You are given an n x n 2D matrix representing an image, rotate the image by 90 degrees (clockwise).\n    \"\"\"\n    # TODO: Implement your solution here\n    n = len(matrix)\n    for i in range(n):\n        for j in range(i + 1, n):\n            matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]\n    for i in range(n):\n        matrix[i].reverse()\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(rotateMatrix(...))\n",
      "javascript": "/**\n * 13. Rotate Image\n * Difficulty: MEDIUM | Topic: Matrix Transpose & Reverse\n * Optimal: O(N^2) time, O(1) space\n */\n\nconst fs = require('fs');\n\nfunction rotateMatrix(matrix: list[list[int]]) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 13. Rotate Image\n// Difficulty: MEDIUM | Topic: Matrix Transpose & Reverse\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 13. Rotate Image\n// Difficulty: MEDIUM | Topic: Matrix Transpose & Reverse\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_014",
    "number": 14,
    "title": "Subarray Sum Equals K",
    "slug": "subarray-sum-equals-k",
    "topic_id": "topic_arrays_hashing",
    "subtopic": "Prefix Sum with Hash Frequency",
    "difficulty": "MEDIUM",
    "roadmap_stage": "Core Patterns",
    "companies": [
      "Meta",
      "Google",
      "Amazon"
    ],
    "tags": [
      "arrays hashing"
    ],
    "description": "Given an array of integers nums and an integer k, return the total number of subarrays whose sum equals to k.\n\nA subarray is a contiguous non-empty sequence of elements within an array.",
    "input_format": "Line 1: N integers separated by space representing nums\nLine 2: Single integer k",
    "output_format": "Single integer representing total count of matching subarrays.",
    "constraints": [
      "1 <= nums.length <= 2 * 10^4",
      "-1000 <= nums[i] <= 1000",
      "-10^7 <= k <= 10^7"
    ],
    "examples": [
      {
        "input": "1 1 1\n2",
        "output": "2",
        "explanation": "[1,1] at index (0,1) and [1,1] at index (1,2)."
      },
      {
        "input": "1 2 3\n3",
        "output": "2",
        "explanation": "[1,2] and [3] both sum to 3."
      }
    ],
    "public_test_cases": [
      {
        "input": "1 1 1\n2",
        "output": "2"
      },
      {
        "input": "1 2 3\n3",
        "output": "2"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "1 -1 0\n0",
        "output": "3"
      },
      {
        "input": "3 4 7 2 -3 1 4 2\n7",
        "output": "4"
      }
    ],
    "hints": [
      "Let prefixSum[i] be the sum of elements from 0 to i.",
      "Subarray sum from j to i is prefixSum[i] - prefixSum[j-1] == k => prefixSum[j-1] == prefixSum[i] - k.",
      "Maintain a hash map of prefix sum frequencies as you iterate."
    ],
    "optimal_complexity": {
      "time": "O(N)",
      "space": "O(N)"
    },
    "solution_explanation": "Compute running prefix sum. If (prefix_sum - k) was observed previously, each occurrence marks a valid subarray ending at current index. Hash map provides O(N) time.",
    "starter_code": {
      "python": "# 14. Subarray Sum Equals K\n# Difficulty: MEDIUM | Topic: Prefix Sum with Hash Frequency\n# Time Complexity Target: O(N) | Space Complexity Target: O(N)\n\nimport sys\nimport json\n\ndef subarraySum(nums: list[int], k: int) -> int:\n    \"\"\"\n    Given an array of integers nums and an integer k, return the total number of subarrays whose sum equals to k.\n    \"\"\"\n    # TODO: Implement your solution here\n    counts = {0: 1}\n    curr_sum = 0\n    ans = 0\n    for x in nums:\n        curr_sum += x\n        if curr_sum - k in counts:\n            ans += counts[curr_sum - k]\n        counts[curr_sum] = counts.get(curr_sum, 0) + 1\n    return ans\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(subarraySum(...))\n",
      "javascript": "/**\n * 14. Subarray Sum Equals K\n * Difficulty: MEDIUM | Topic: Prefix Sum with Hash Frequency\n * Optimal: O(N) time, O(N) space\n */\n\nconst fs = require('fs');\n\nfunction subarraySum(nums: list[int], k: int) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 14. Subarray Sum Equals K\n// Difficulty: MEDIUM | Topic: Prefix Sum with Hash Frequency\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 14. Subarray Sum Equals K\n// Difficulty: MEDIUM | Topic: Prefix Sum with Hash Frequency\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_trapping_rain_water",
    "number": 15,
    "title": "Trapping Rain Water",
    "slug": "trapping-rain-water",
    "topic_id": "topic_arrays_hashing",
    "subtopic": "Two Pointer Elevation Trap",
    "difficulty": "HARD",
    "roadmap_stage": "Placement Revision",
    "companies": [
      "Amazon",
      "Google",
      "Meta",
      "Bloomberg",
      "Apple"
    ],
    "tags": [
      "arrays hashing"
    ],
    "description": "Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
    "input_format": "A single line of space-separated non-negative integers representing elevation heights.",
    "output_format": "Single integer representing total trapped water units.",
    "constraints": [
      "n == height.length",
      "1 <= n <= 2 * 10^4",
      "0 <= height[i] <= 10^5"
    ],
    "examples": [
      {
        "input": "0 1 0 2 1 0 1 3 2 1 2 1",
        "output": "6",
        "explanation": "6 units of rainwater are trapped between elevation bars."
      },
      {
        "input": "4 2 0 3 2 5",
        "output": "9"
      }
    ],
    "public_test_cases": [
      {
        "input": "0 1 0 2 1 0 1 3 2 1 2 1",
        "output": "6"
      },
      {
        "input": "4 2 0 3 2 5",
        "output": "9"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "2 0 2",
        "output": "2"
      },
      {
        "input": "3 0 0 2 0 4",
        "output": "10"
      },
      {
        "input": "5 4 1 2",
        "output": "1"
      }
    ],
    "hints": [
      "The water trapped at index i is determined by min(max_left, max_right) - height[i].",
      "Can you use two pointers at opposite ends instead of precalculating prefix/suffix maximums?",
      "Move the pointer on the side with the smaller maximum, because the boundary height is constrained by that side."
    ],
    "optimal_complexity": {
      "time": "O(N)",
      "space": "O(1)"
    },
    "solution_explanation": "Two pointers from both ends maintain left_max and right_max. Move pointer on the lower side, as water height is strictly bounded by the shorter boundary. O(N) time, O(1) auxiliary space.",
    "starter_code": {
      "python": "# 15. Trapping Rain Water\n# Difficulty: HARD | Topic: Two Pointer Elevation Trap\n# Time Complexity Target: O(N) | Space Complexity Target: O(1)\n\nimport sys\nimport json\n\ndef trapRainWater(height: list[int]) -> int:\n    \"\"\"\n    Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.\n    \"\"\"\n    # TODO: Implement your solution here\n    l, r = 0, len(height) - 1\n    left_max, right_max = 0, 0\n    water = 0\n    while l < r:\n        if height[l] < height[r]:\n            if height[l] >= left_max:\n                left_max = height[l]\n            else:\n                water += left_max - height[l]\n            l += 1\n        else:\n            if height[r] >= right_max:\n                right_max = height[r]\n            else:\n                water += right_max - height[r]\n            r -= 1\n    return water\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(trapRainWater(...))\n",
      "javascript": "/**\n * 15. Trapping Rain Water\n * Difficulty: HARD | Topic: Two Pointer Elevation Trap\n * Optimal: O(N) time, O(1) space\n */\n\nconst fs = require('fs');\n\nfunction trapRainWater(height: list[int]) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 15. Trapping Rain Water\n// Difficulty: HARD | Topic: Two Pointer Elevation Trap\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 15. Trapping Rain Water\n// Difficulty: HARD | Topic: Two Pointer Elevation Trap\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_016",
    "number": 16,
    "title": "First Missing Positive",
    "slug": "first-missing-positive",
    "topic_id": "topic_arrays_hashing",
    "subtopic": "Index as Hash Key",
    "difficulty": "HARD",
    "roadmap_stage": "Placement Revision",
    "companies": [
      "Amazon",
      "Microsoft",
      "Meta"
    ],
    "tags": [
      "arrays hashing"
    ],
    "description": "Given an unsorted integer array nums, return the smallest positive integer that is not present in nums.\n\nYou must implement an algorithm that runs in O(n) time and uses O(1) auxiliary space.",
    "input_format": "A single line of space-separated integers representing nums.",
    "output_format": "Single integer representing the smallest missing positive number.",
    "constraints": [
      "1 <= nums.length <= 10^5",
      "-2^31 <= nums[i] <= 2^31 - 1"
    ],
    "examples": [
      {
        "input": "1 2 0",
        "output": "3",
        "explanation": "Numbers 1 and 2 are present, so 3 is the smallest missing positive integer."
      },
      {
        "input": "3 4 -1 1",
        "output": "2",
        "explanation": "1 is in the array but 2 is missing."
      },
      {
        "input": "7 8 9 11 12",
        "output": "1",
        "explanation": "The smallest positive integer 1 is missing."
      }
    ],
    "public_test_cases": [
      {
        "input": "1 2 0",
        "output": "3"
      },
      {
        "input": "3 4 -1 1",
        "output": "2"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "7 8 9 11 12",
        "output": "1"
      },
      {
        "input": "1",
        "output": "2"
      },
      {
        "input": "2",
        "output": "1"
      }
    ],
    "hints": [
      "The answer must lie in the range [1, n + 1].",
      "Can you place each number x into index x - 1 using swaps?",
      "After swapping elements to their correct indices, the first index i where nums[i] != i + 1 gives the answer i + 1."
    ],
    "optimal_complexity": {
      "time": "O(N)",
      "space": "O(1)"
    },
    "solution_explanation": "Place each integer x in range 1..n at index x - 1 via cycle swaps. Second pass identifies the first index i where nums[i] != i + 1. Operates in O(N) time and O(1) extra space.",
    "starter_code": {
      "python": "# 16. First Missing Positive\n# Difficulty: HARD | Topic: Index as Hash Key\n# Time Complexity Target: O(N) | Space Complexity Target: O(1)\n\nimport sys\nimport json\n\ndef firstMissingPositive(nums: list[int]) -> int:\n    \"\"\"\n    Given an unsorted integer array nums, return the smallest positive integer that is not present in nums.\n    \"\"\"\n    # TODO: Implement your solution here\n    n = len(nums)\n    for i in range(n):\n        while 1 <= nums[i] <= n and nums[nums[i] - 1] != nums[i]:\n            target = nums[i] - 1\n            nums[i], nums[target] = nums[target], nums[i]\n    for i in range(n):\n        if nums[i] != i + 1:\n            return i + 1\n    return n + 1\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(firstMissingPositive(...))\n",
      "javascript": "/**\n * 16. First Missing Positive\n * Difficulty: HARD | Topic: Index as Hash Key\n * Optimal: O(N) time, O(1) space\n */\n\nconst fs = require('fs');\n\nfunction firstMissingPositive(nums: list[int]) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 16. First Missing Positive\n// Difficulty: HARD | Topic: Index as Hash Key\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 16. First Missing Positive\n// Difficulty: HARD | Topic: Index as Hash Key\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_017",
    "number": 17,
    "title": "Valid Anagram",
    "slug": "valid-anagram",
    "topic_id": "topic_strings",
    "subtopic": "Character Frequency Matching",
    "difficulty": "EASY",
    "roadmap_stage": "Beginner Foundations",
    "companies": [
      "Google",
      "Amazon",
      "Meta",
      "Uber"
    ],
    "tags": [
      "strings"
    ],
    "description": "Given two strings s and t, return true if t is an anagram of s, and false otherwise.\n\nAn Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.",
    "input_format": "Line 1: string s\nLine 2: string t",
    "output_format": "true or false",
    "constraints": [
      "1 <= s.length, t.length <= 5 * 10^4",
      "s and t consist of lowercase English letters."
    ],
    "examples": [
      {
        "input": "anagram\nnagaram",
        "output": "true",
        "explanation": "t can be formed by rearranging characters of s."
      },
      {
        "input": "rat\ncar",
        "output": "false",
        "explanation": "Characters do not match in frequency."
      }
    ],
    "public_test_cases": [
      {
        "input": "anagram\nnagaram",
        "output": "true"
      },
      {
        "input": "rat\ncar",
        "output": "false"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "a\na",
        "output": "true"
      },
      {
        "input": "ab\na",
        "output": "false"
      },
      {
        "input": "listen\nsilent",
        "output": "true"
      }
    ],
    "hints": [
      "Check length first: if lengths differ, they cannot be anagrams.",
      "Count character frequencies using an array of size 26 or a hash map.",
      "Increment counts for s, decrement for t. All counts must equal 0."
    ],
    "optimal_complexity": {
      "time": "O(N)",
      "space": "O(1)"
    },
    "solution_explanation": "Use an integer frequency buffer of size 26. Count characters in s and subtract characters in t. All positions must evaluate to zero.",
    "starter_code": {
      "python": "# 17. Valid Anagram\n# Difficulty: EASY | Topic: Character Frequency Matching\n# Time Complexity Target: O(N) | Space Complexity Target: O(1)\n\nimport sys\nimport json\n\ndef isAnagram(s: str, t: str) -> bool:\n    \"\"\"\n    Given two strings s and t, return true if t is an anagram of s, and false otherwise.\n    \"\"\"\n    # TODO: Implement your solution here\n    if len(s) != len(t): return False\n    counts = [0] * 26\n    for c1, c2 in zip(s, t):\n        counts[ord(c1) - ord('a')] += 1\n        counts[ord(c2) - ord('a')] -= 1\n    return all(x == 0 for x in counts)\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(isAnagram(...))\n",
      "javascript": "/**\n * 17. Valid Anagram\n * Difficulty: EASY | Topic: Character Frequency Matching\n * Optimal: O(N) time, O(1) space\n */\n\nconst fs = require('fs');\n\nfunction isAnagram(s: str, t: str) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 17. Valid Anagram\n// Difficulty: EASY | Topic: Character Frequency Matching\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 17. Valid Anagram\n// Difficulty: EASY | Topic: Character Frequency Matching\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_018",
    "number": 18,
    "title": "Valid Palindrome",
    "slug": "valid-palindrome",
    "topic_id": "topic_strings",
    "subtopic": "Alphanumeric Two Pointers",
    "difficulty": "EASY",
    "roadmap_stage": "Beginner Foundations",
    "companies": [
      "Amazon",
      "Microsoft",
      "Meta"
    ],
    "tags": [
      "strings"
    ],
    "description": "A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Alphanumeric characters include letters and numbers.\n\nGiven a string s, return true if it is a palindrome, or false otherwise.",
    "input_format": "A single line containing string s.",
    "output_format": "true or false",
    "constraints": [
      "1 <= s.length <= 2 * 10^5",
      "s consists only of printable ASCII characters."
    ],
    "examples": [
      {
        "input": "A man, a plan, a canal: Panama",
        "output": "true",
        "explanation": "\"amanaplanacanalpanama\" is a palindrome."
      },
      {
        "input": "race a car",
        "output": "false",
        "explanation": "\"raceacar\" is not a palindrome."
      }
    ],
    "public_test_cases": [
      {
        "input": "A man, a plan, a canal: Panama",
        "output": "true"
      },
      {
        "input": "race a car",
        "output": "false"
      }
    ],
    "hidden_test_cases": [
      {
        "input": " ",
        "output": "true"
      },
      {
        "input": "0P",
        "output": "false"
      },
      {
        "input": "ab_a",
        "output": "true"
      }
    ],
    "hints": [
      "Use two pointers: one at start, one at end.",
      "Skip non-alphanumeric characters using isalnum().",
      "Compare characters case-insensitively using lower()."
    ],
    "optimal_complexity": {
      "time": "O(N)",
      "space": "O(1)"
    },
    "solution_explanation": "Two pointers traverse from ends inward, advancing past non-alphanumeric symbols and comparing lowercase character matches.",
    "starter_code": {
      "python": "# 18. Valid Palindrome\n# Difficulty: EASY | Topic: Alphanumeric Two Pointers\n# Time Complexity Target: O(N) | Space Complexity Target: O(1)\n\nimport sys\nimport json\n\ndef isPalindrome(s: str) -> bool:\n    \"\"\"\n    A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.\n    \"\"\"\n    # TODO: Implement your solution here\n    l, r = 0, len(s) - 1\n    while l < r:\n        while l < r and not s[l].isalnum(): l += 1\n        while l < r and not s[r].isalnum(): r -= 1\n        if s[l].lower() != s[r].lower():\n            return False\n        l += 1\n        r -= 1\n    return True\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(isPalindrome(...))\n",
      "javascript": "/**\n * 18. Valid Palindrome\n * Difficulty: EASY | Topic: Alphanumeric Two Pointers\n * Optimal: O(N) time, O(1) space\n */\n\nconst fs = require('fs');\n\nfunction isPalindrome(s: str) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 18. Valid Palindrome\n// Difficulty: EASY | Topic: Alphanumeric Two Pointers\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 18. Valid Palindrome\n// Difficulty: EASY | Topic: Alphanumeric Two Pointers\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_019",
    "number": 19,
    "title": "Longest Common Prefix",
    "slug": "longest-common-prefix",
    "topic_id": "topic_strings",
    "subtopic": "Horizontal / Vertical Scanning",
    "difficulty": "EASY",
    "roadmap_stage": "Beginner Foundations",
    "companies": [
      "Amazon",
      "Apple",
      "Google"
    ],
    "tags": [
      "strings"
    ],
    "description": "Write a function to find the longest common prefix string amongst an array of strings.\n\nIf there is no common prefix, return an empty string \"\".",
    "input_format": "A single line of space-separated strings.",
    "output_format": "String representing the longest common prefix.",
    "constraints": [
      "1 <= strs.length <= 200",
      "0 <= strs[i].length <= 200",
      "strs[i] consists of only lowercase English letters."
    ],
    "examples": [
      {
        "input": "flower flow flight",
        "output": "fl",
        "explanation": "Prefix 'fl' is common to all strings."
      },
      {
        "input": "dog racecar car",
        "output": "",
        "explanation": "There is no common prefix among the input strings."
      }
    ],
    "public_test_cases": [
      {
        "input": "flower flow flight",
        "output": "fl"
      },
      {
        "input": "dog racecar car",
        "output": ""
      }
    ],
    "hidden_test_cases": [
      {
        "input": "interspecies interstellar interstate",
        "output": "inters"
      },
      {
        "input": "throne",
        "output": "throne"
      },
      {
        "input": "a b",
        "output": ""
      }
    ],
    "hints": [
      "Compare character by character vertically across all words.",
      "Stop at the first character mismatch or when reaching the end of any word.",
      "Return the substring slice from index 0 to the mismatch index."
    ],
    "optimal_complexity": {
      "time": "O(S)",
      "space": "O(1)"
    },
    "solution_explanation": "Take the first string as candidate prefix. Progressively trim characters from the end until each string in the array starts with the prefix.",
    "starter_code": {
      "python": "# 19. Longest Common Prefix\n# Difficulty: EASY | Topic: Horizontal / Vertical Scanning\n# Time Complexity Target: O(S) | Space Complexity Target: O(1)\n\nimport sys\nimport json\n\ndef longestCommonPrefix(strs: list[str]) -> str:\n    \"\"\"\n    Write a function to find the longest common prefix string amongst an array of strings.\n    \"\"\"\n    # TODO: Implement your solution here\n    if not strs: return ''\n    prefix = strs[0]\n    for s in strs[1:]:\n        while not s.startswith(prefix):\n            prefix = prefix[:-1]\n            if not prefix: return ''\n    return prefix\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(longestCommonPrefix(...))\n",
      "javascript": "/**\n * 19. Longest Common Prefix\n * Difficulty: EASY | Topic: Horizontal / Vertical Scanning\n * Optimal: O(S) time, O(1) space\n */\n\nconst fs = require('fs');\n\nfunction longestCommonPrefix(strs: list[str]) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 19. Longest Common Prefix\n// Difficulty: EASY | Topic: Horizontal / Vertical Scanning\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 19. Longest Common Prefix\n// Difficulty: EASY | Topic: Horizontal / Vertical Scanning\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_020",
    "number": 20,
    "title": "Find the First Occurrence of a Substring",
    "slug": "find-the-first-occurrence-of-a-substring",
    "topic_id": "topic_strings",
    "subtopic": "Substring Search (KMP / Rolling Hash)",
    "difficulty": "EASY",
    "roadmap_stage": "Beginner Foundations",
    "companies": [
      "Amazon",
      "Microsoft",
      "Meta"
    ],
    "tags": [
      "strings"
    ],
    "description": "Given two strings needle and haystack, return the index of the first occurrence of needle in haystack, or -1 if needle is not part of haystack.",
    "input_format": "Line 1: string haystack\nLine 2: string needle",
    "output_format": "0-based integer index, or -1.",
    "constraints": [
      "1 <= haystack.length, needle.length <= 10^4",
      "haystack and needle consist of only lowercase English characters."
    ],
    "examples": [
      {
        "input": "sadbutsad\nsad",
        "output": "0",
        "explanation": "'sad' occurs at index 0 and 6. First occurrence is 0."
      },
      {
        "input": "leetcode\nleeto",
        "output": "-1",
        "explanation": "'leeto' did not occur in 'leetcode'."
      }
    ],
    "public_test_cases": [
      {
        "input": "sadbutsad\nsad",
        "output": "0"
      },
      {
        "input": "leetcode\nleeto",
        "output": "-1"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "hello\nll",
        "output": "2"
      },
      {
        "input": "a\na",
        "output": "0"
      },
      {
        "input": "mississippi\nissip",
        "output": "4"
      }
    ],
    "hints": [
      "Check sliding window slices of length len(needle).",
      "For optimized linear search, KMP prefix function can skip comparisons.",
      "Return index as soon as slice matches needle."
    ],
    "optimal_complexity": {
      "time": "O(N)",
      "space": "O(1)"
    },
    "solution_explanation": "Find the first index where needle matches in haystack. KMP or direct window sliding achieves search in linear time.",
    "starter_code": {
      "python": "# 20. Find the First Occurrence of a Substring\n# Difficulty: EASY | Topic: Substring Search (KMP / Rolling Hash)\n# Time Complexity Target: O(N) | Space Complexity Target: O(1)\n\nimport sys\nimport json\n\ndef strStr(haystack: str, needle: str) -> int:\n    \"\"\"\n    Given two strings needle and haystack, return the index of the first occurrence of needle in haystack, or -1 if needle is not part of haystack.\n    \"\"\"\n    # TODO: Implement your solution here\n    return haystack.find(needle)\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(strStr(...))\n",
      "javascript": "/**\n * 20. Find the First Occurrence of a Substring\n * Difficulty: EASY | Topic: Substring Search (KMP / Rolling Hash)\n * Optimal: O(N) time, O(1) space\n */\n\nconst fs = require('fs');\n\nfunction strStr(haystack: str, needle: str) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 20. Find the First Occurrence of a Substring\n// Difficulty: EASY | Topic: Substring Search (KMP / Rolling Hash)\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 20. Find the First Occurrence of a Substring\n// Difficulty: EASY | Topic: Substring Search (KMP / Rolling Hash)\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_021",
    "number": 21,
    "title": "Reverse Words in a String",
    "slug": "reverse-words-in-a-string",
    "topic_id": "topic_strings",
    "subtopic": "Tokenization & Reversal",
    "difficulty": "MEDIUM",
    "roadmap_stage": "Core Patterns",
    "companies": [
      "Microsoft",
      "Amazon",
      "Apple",
      "Google"
    ],
    "tags": [
      "strings"
    ],
    "description": "Given an input string s, reverse the order of the words.\n\nA word is defined as a sequence of non-space characters. The words in s will be separated by at least one space.\n\nReturn a string of the words in reverse order concatenated by a single space.\n\nNote that s may contain leading or trailing spaces or multiple spaces between two words. The returned string should only have a single space separating the words. Do not include any extra spaces.",
    "input_format": "A single line containing string s.",
    "output_format": "Reversed words joined by single spaces.",
    "constraints": [
      "1 <= s.length <= 10^4",
      "s contains English letters (upper/lower-case), digits, and spaces ' '.",
      "There is at least one word in s."
    ],
    "examples": [
      {
        "input": "the sky is blue",
        "output": "blue is sky the"
      },
      {
        "input": "  hello world  ",
        "output": "world hello"
      },
      {
        "input": "a good   example",
        "output": "example good a"
      }
    ],
    "public_test_cases": [
      {
        "input": "the sky is blue",
        "output": "blue is sky the"
      },
      {
        "input": "  hello world  ",
        "output": "world hello"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "a good   example",
        "output": "example good a"
      },
      {
        "input": "EPY2 Cole",
        "output": "Cole EPY2"
      },
      {
        "input": "single",
        "output": "single"
      }
    ],
    "hints": [
      "Split the string by spaces to discard consecutive whitespace.",
      "Reverse the list of extracted word tokens.",
      "Join the reversed words using a single space delimiter."
    ],
    "optimal_complexity": {
      "time": "O(N)",
      "space": "O(N)"
    },
    "solution_explanation": "Split the string by whitespace to extract clean word tokens, reverse the token order, and re-join with a single space.",
    "starter_code": {
      "python": "# 21. Reverse Words in a String\n# Difficulty: MEDIUM | Topic: Tokenization & Reversal\n# Time Complexity Target: O(N) | Space Complexity Target: O(N)\n\nimport sys\nimport json\n\ndef reverseWords(s: str) -> str:\n    \"\"\"\n    Given an input string s, reverse the order of the words.\n    \"\"\"\n    # TODO: Implement your solution here\n    return ' '.join(s.split()[::-1])\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(reverseWords(...))\n",
      "javascript": "/**\n * 21. Reverse Words in a String\n * Difficulty: MEDIUM | Topic: Tokenization & Reversal\n * Optimal: O(N) time, O(N) space\n */\n\nconst fs = require('fs');\n\nfunction reverseWords(s: str) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 21. Reverse Words in a String\n// Difficulty: MEDIUM | Topic: Tokenization & Reversal\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 21. Reverse Words in a String\n// Difficulty: MEDIUM | Topic: Tokenization & Reversal\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_022",
    "number": 22,
    "title": "String Compression",
    "slug": "string-compression",
    "topic_id": "topic_strings",
    "subtopic": "In-Place Run-Length Encoding",
    "difficulty": "MEDIUM",
    "roadmap_stage": "Core Patterns",
    "companies": [
      "Microsoft",
      "Amazon",
      "Bloomberg",
      "Meta"
    ],
    "tags": [
      "strings"
    ],
    "description": "Given an array of characters chars, compress it using the following algorithm:\n\nBegin with an empty string s. For each group of consecutive repeating characters in chars:\n- If the group's length is 1, append the character to s.\n- Otherwise, append the character followed by the group's length.\n\nThe compressed string s should not be returned separately, but instead, be stored in the input character array chars. Note that group lengths that are 10 or longer will be split into multiple characters in chars.\n\nAfter you are done modifying the input array, return the new length of the array.",
    "input_format": "A single line containing characters separated by space.",
    "output_format": "Compressed characters separated by space.",
    "constraints": [
      "1 <= chars.length <= 2000",
      "chars[i] is a lowercase English letter, uppercase English letter, digit, or symbol."
    ],
    "examples": [
      {
        "input": "a a b b c c c",
        "output": "a 2 b 2 c 3",
        "explanation": "The groups are 'aa', 'bb', and 'ccc'. Compressed to 'a2b2c3'."
      },
      {
        "input": "a",
        "output": "a",
        "explanation": "The only group is 'a', which remains uncompressed since length is 1."
      },
      {
        "input": "a b b b b b b b b b b b",
        "output": "a b 1 2"
      }
    ],
    "public_test_cases": [
      {
        "input": "a a b b c c c",
        "output": "a 2 b 2 c 3"
      },
      {
        "input": "a",
        "output": "a"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "a b b b b b b b b b b b",
        "output": "a b 1 2"
      },
      {
        "input": "a a a b b a a",
        "output": "a 3 b 2 a 2"
      }
    ],
    "hints": [
      "Use two pointers: a read pointer scanning through consecutive identical characters, and a write pointer.",
      "Count consecutive repeats. If count > 1, write character then write each digit of count.",
      "Advance read pointer to next new character."
    ],
    "optimal_complexity": {
      "time": "O(N)",
      "space": "O(1)"
    },
    "solution_explanation": "Two pointers: read pointer counts consecutive duplicate runs, write pointer modifies array in place with the character and its frequency digits.",
    "starter_code": {
      "python": "# 22. String Compression\n# Difficulty: MEDIUM | Topic: In-Place Run-Length Encoding\n# Time Complexity Target: O(N) | Space Complexity Target: O(1)\n\nimport sys\nimport json\n\ndef compressString(chars: list[str]) -> int:\n    \"\"\"\n    Given an array of characters chars, compress it using the following algorithm:\n\nBegin with an empty string s.\n    \"\"\"\n    # TODO: Implement your solution here\n    write, read = 0, 0\n    while read < len(chars):\n        c = chars[read]\n        count = 0\n        while read < len(chars) and chars[read] == c:\n            read += 1\n            count += 1\n        chars[write] = c\n        write += 1\n        if count > 1:\n            for digit in str(count):\n                chars[write] = digit\n                write += 1\n    return write\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(compressString(...))\n",
      "javascript": "/**\n * 22. String Compression\n * Difficulty: MEDIUM | Topic: In-Place Run-Length Encoding\n * Optimal: O(N) time, O(1) space\n */\n\nconst fs = require('fs');\n\nfunction compressString(chars: list[str]) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 22. String Compression\n// Difficulty: MEDIUM | Topic: In-Place Run-Length Encoding\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 22. String Compression\n// Difficulty: MEDIUM | Topic: In-Place Run-Length Encoding\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_023",
    "number": 23,
    "title": "Longest Palindromic Substring",
    "slug": "longest-palindromic-substring",
    "topic_id": "topic_strings",
    "subtopic": "Expand Around Center",
    "difficulty": "MEDIUM",
    "roadmap_stage": "Core Patterns",
    "companies": [
      "Amazon",
      "Microsoft",
      "Meta",
      "Google"
    ],
    "tags": [
      "strings"
    ],
    "description": "Given a string s, return the longest palindromic substring in s.",
    "input_format": "A single line containing string s.",
    "output_format": "String representing the longest palindromic substring.",
    "constraints": [
      "1 <= s.length <= 1000",
      "s consist of only digits and English letters."
    ],
    "examples": [
      {
        "input": "babad",
        "output": "bab",
        "explanation": "'aba' is also a valid answer."
      },
      {
        "input": "cbbd",
        "output": "bb"
      }
    ],
    "public_test_cases": [
      {
        "input": "babad",
        "output": "bab"
      },
      {
        "input": "cbbd",
        "output": "bb"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "a",
        "output": "a"
      },
      {
        "input": "ac",
        "output": "a"
      },
      {
        "input": "racecar",
        "output": "racecar"
      }
    ],
    "hints": [
      "A palindrome mirrors around its center.",
      "There are 2n - 1 potential centers (odd length single character centers and even length pairs).",
      "Expand outward from each center while characters match."
    ],
    "optimal_complexity": {
      "time": "O(N^2)",
      "space": "O(1)"
    },
    "solution_explanation": "Expand around centers: iterate through every index as center of an odd palindrome (i, i) or even palindrome (i, i+1). Track the maximum length match.",
    "starter_code": {
      "python": "# 23. Longest Palindromic Substring\n# Difficulty: MEDIUM | Topic: Expand Around Center\n# Time Complexity Target: O(N^2) | Space Complexity Target: O(1)\n\nimport sys\nimport json\n\ndef longestPalindrome(s: str) -> str:\n    \"\"\"\n    Given a string s, return the longest palindromic substring in s.\n    \"\"\"\n    # TODO: Implement your solution here\n    if len(s) < 2: return s\n    res = ''\n    for i in range(len(s)):\n        for l, r in [(i, i), (i, i + 1)]:\n            while l >= 0 and r < len(s) and s[l] == s[r]:\n                if r - l + 1 > len(res):\n                    res = s[l:r + 1]\n                l -= 1\n                r += 1\n    return res\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(longestPalindrome(...))\n",
      "javascript": "/**\n * 23. Longest Palindromic Substring\n * Difficulty: MEDIUM | Topic: Expand Around Center\n * Optimal: O(N^2) time, O(1) space\n */\n\nconst fs = require('fs');\n\nfunction longestPalindrome(s: str) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 23. Longest Palindromic Substring\n// Difficulty: MEDIUM | Topic: Expand Around Center\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 23. Longest Palindromic Substring\n// Difficulty: MEDIUM | Topic: Expand Around Center\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_024",
    "number": 24,
    "title": "Group Anagrams",
    "slug": "group-anagrams",
    "topic_id": "topic_strings",
    "subtopic": "Categorization by Sorted Key",
    "difficulty": "MEDIUM",
    "roadmap_stage": "Core Patterns",
    "companies": [
      "Amazon",
      "Apple",
      "Google",
      "Meta"
    ],
    "tags": [
      "strings"
    ],
    "description": "Given an array of strings strs, group the anagrams together. You can return the answer in any order.\n\nAn Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.",
    "input_format": "A single line of space-separated strings.",
    "output_format": "Grouped anagrams, each group sorted alphabetically on a separate line.",
    "constraints": [
      "1 <= strs.length <= 10^4",
      "0 <= strs[i].length <= 100",
      "strs[i] consists of lowercase English letters."
    ],
    "examples": [
      {
        "input": "eat tea tan ate nat bat",
        "output": "ate eat tea\nbat\nnat tan",
        "explanation": "Three groups: ['ate','eat','tea'], ['bat'], ['nat','tan']."
      },
      {
        "input": "a",
        "output": "a"
      }
    ],
    "public_test_cases": [
      {
        "input": "eat tea tan ate nat bat",
        "output": "ate eat tea\nbat\nnat tan"
      },
      {
        "input": "a",
        "output": "a"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "listen silent enlisted",
        "output": "enlisted listen silent"
      },
      {
        "input": "abc cba bca xyz",
        "output": "abc bca cba\nxyz"
      }
    ],
    "hints": [
      "Two strings are anagrams if and only if their sorted versions are identical.",
      "Use the sorted string or character count tuple as the hash map key.",
      "Append each original string to the list corresponding to its signature key."
    ],
    "optimal_complexity": {
      "time": "O(N * K log K)",
      "space": "O(N * K)"
    },
    "solution_explanation": "Sort characters of each word to form a canonical tuple signature. Group words sharing the same signature in a hash map.",
    "starter_code": {
      "python": "# 24. Group Anagrams\n# Difficulty: MEDIUM | Topic: Categorization by Sorted Key\n# Time Complexity Target: O(N * K log K) | Space Complexity Target: O(N * K)\n\nimport sys\nimport json\n\ndef groupAnagrams(strs: list[str]) -> list[list[str]]:\n    \"\"\"\n    Given an array of strings strs, group the anagrams together.\n    \"\"\"\n    # TODO: Implement your solution here\n    from collections import defaultdict\n    groups = defaultdict(list)\n    for s in strs:\n        groups[tuple(sorted(s))].append(s)\n    return list(groups.values())\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(groupAnagrams(...))\n",
      "javascript": "/**\n * 24. Group Anagrams\n * Difficulty: MEDIUM | Topic: Categorization by Sorted Key\n * Optimal: O(N * K log K) time, O(N * K) space\n */\n\nconst fs = require('fs');\n\nfunction groupAnagrams(strs: list[str]) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 24. Group Anagrams\n// Difficulty: MEDIUM | Topic: Categorization by Sorted Key\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 24. Group Anagrams\n// Difficulty: MEDIUM | Topic: Categorization by Sorted Key\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_025",
    "number": 25,
    "title": "Decode String",
    "slug": "decode-string",
    "topic_id": "topic_strings",
    "subtopic": "Stack-Based String Expansion",
    "difficulty": "MEDIUM",
    "roadmap_stage": "Core Patterns",
    "companies": [
      "Google",
      "Bloomberg",
      "Amazon"
    ],
    "tags": [
      "strings"
    ],
    "description": "Given an encoded string, return its decoded string.\n\nThe encoding rule is: k[encoded_string], where the encoded_string inside the square brackets is being repeated exactly k times. Note that k is guaranteed to be a positive integer.\n\nYou may assume that the input string is always valid; there are no extra white spaces, square brackets are well-formed, etc.",
    "input_format": "A single line containing the encoded string.",
    "output_format": "Decoded string.",
    "constraints": [
      "1 <= s.length <= 30",
      "s consists of lowercase English letters, digits, and square brackets '[]'.",
      "All the integers in s are in the range [1, 300]."
    ],
    "examples": [
      {
        "input": "3[a]2[bc]",
        "output": "aaabcbc",
        "explanation": "3 'a's followed by 2 'bc's."
      },
      {
        "input": "3[a2[c]]",
        "output": "accaccacc",
        "explanation": "'a2[c]' -> 'acc', repeated 3 times."
      },
      {
        "input": "2[abc]3[cd]ef",
        "output": "abcabccdcdcdef"
      }
    ],
    "public_test_cases": [
      {
        "input": "3[a]2[bc]",
        "output": "aaabcbc"
      },
      {
        "input": "3[a2[c]]",
        "output": "accaccacc"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "2[abc]3[cd]ef",
        "output": "abcabccdcdcdef"
      },
      {
        "input": "10[a]",
        "output": "aaaaaaaaaa"
      }
    ],
    "hints": [
      "Use a stack to handle nested bracket repetitions.",
      "When encountering '[', push the current string and repeat multiplier k onto stack, then reset.",
      "When encountering ']', pop previous string and repeat count, then concatenate: prev_str + count * current_str."
    ],
    "optimal_complexity": {
      "time": "O(Output Length)",
      "space": "O(Depth)"
    },
    "solution_explanation": "Use a stack to store (prefix_string, repeat_count). On closing bracket, pop previous state and append multiplied inner substring.",
    "starter_code": {
      "python": "# 25. Decode String\n# Difficulty: MEDIUM | Topic: Stack-Based String Expansion\n# Time Complexity Target: O(Output Length) | Space Complexity Target: O(Depth)\n\nimport sys\nimport json\n\ndef decodeString(s: str) -> str:\n    \"\"\"\n    Given an encoded string, return its decoded string.\n    \"\"\"\n    # TODO: Implement your solution here\n    stack = []\n    curr_str = ''\n    curr_num = 0\n    for c in s:\n        if c.isdigit():\n            curr_num = curr_num * 10 + int(c)\n        elif c == '[':\n            stack.append((curr_str, curr_num))\n            curr_str, curr_num = '', 0\n        elif c == ']':\n            prev_str, num = stack.pop()\n            curr_str = prev_str + curr_str * num\n        else:\n            curr_str += c\n    return curr_str\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(decodeString(...))\n",
      "javascript": "/**\n * 25. Decode String\n * Difficulty: MEDIUM | Topic: Stack-Based String Expansion\n * Optimal: O(Output Length) time, O(Depth) space\n */\n\nconst fs = require('fs');\n\nfunction decodeString(s: str) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 25. Decode String\n// Difficulty: MEDIUM | Topic: Stack-Based String Expansion\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 25. Decode String\n// Difficulty: MEDIUM | Topic: Stack-Based String Expansion\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_026",
    "number": 26,
    "title": "Minimum Window Substring",
    "slug": "minimum-window-substring",
    "topic_id": "topic_strings",
    "subtopic": "Sliding Window with Target Frequency",
    "difficulty": "HARD",
    "roadmap_stage": "Placement Revision",
    "companies": [
      "Meta",
      "Google",
      "Amazon",
      "Microsoft",
      "Uber"
    ],
    "tags": [
      "strings"
    ],
    "description": "Given two strings s and t of lengths m and n respectively, return the minimum window substring of s such that every character in t (including duplicates) is included in the window. If there is no such substring, return the empty string \"\".",
    "input_format": "Line 1: string s\nLine 2: string t",
    "output_format": "Minimum window substring.",
    "constraints": [
      "m == s.length",
      "n == t.length",
      "1 <= m, n <= 10^5",
      "s and t consist of uppercase and lowercase English letters."
    ],
    "examples": [
      {
        "input": "ADOBECODEBANC\nABC",
        "output": "BANC",
        "explanation": "The minimum window substring \"BANC\" includes 'A', 'B', and 'C' from string t."
      },
      {
        "input": "a\na",
        "output": "a"
      },
      {
        "input": "a\naa",
        "output": "",
        "explanation": "Both 'a's from t must be included in the window, but s only has one 'a'."
      }
    ],
    "public_test_cases": [
      {
        "input": "ADOBECODEBANC\nABC",
        "output": "BANC"
      },
      {
        "input": "a\na",
        "output": "a"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "a\naa",
        "output": ""
      },
      {
        "input": "ab\nb",
        "output": "b"
      },
      {
        "input": "cabwefgewcwaefgcf\ncae",
        "output": "cwae"
      }
    ],
    "hints": [
      "Use two pointers for a sliding window [l, r].",
      "Expand r to include characters until all requirements of t are satisfied.",
      "Shrink l from left to minimize window while maintaining all required character counts."
    ],
    "optimal_complexity": {
      "time": "O(M + N)",
      "space": "O(Total Unique Characters)"
    },
    "solution_explanation": "Two-pointer sliding window tracking required character frequencies. Expand right to satisfy match condition, shrink left to minimize window length.",
    "starter_code": {
      "python": "# 26. Minimum Window Substring\n# Difficulty: HARD | Topic: Sliding Window with Target Frequency\n# Time Complexity Target: O(M + N) | Space Complexity Target: O(Total Unique Characters)\n\nimport sys\nimport json\n\ndef minWindow(s: str, t: str) -> str:\n    \"\"\"\n    Given two strings s and t of lengths m and n respectively, return the minimum window substring of s such that every character in t (including duplicates) is included in the window.\n    \"\"\"\n    # TODO: Implement your solution here\n    from collections import Counter\n    if not t or not s: return ''\n    target = Counter(t)\n    window = {}\n    have, need = 0, len(target)\n    res, res_len = [-1, -1], float('inf')\n    l = 0\n    for r, c in enumerate(s):\n        window[c] = window.get(c, 0) + 1\n        if c in target and window[c] == target[c]:\n            have += 1\n        while have == need:\n            if (r - l + 1) < res_len:\n                res = [l, r]\n                res_len = r - l + 1\n            window[s[l]] -= 1\n            if s[l] in target and window[s[l]] < target[s[l]]:\n                have -= 1\n            l += 1\n    return s[res[0]:res[1] + 1] if res_len != float('inf') else ''\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(minWindow(...))\n",
      "javascript": "/**\n * 26. Minimum Window Substring\n * Difficulty: HARD | Topic: Sliding Window with Target Frequency\n * Optimal: O(M + N) time, O(Total Unique Characters) space\n */\n\nconst fs = require('fs');\n\nfunction minWindow(s: str, t: str) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 26. Minimum Window Substring\n// Difficulty: HARD | Topic: Sliding Window with Target Frequency\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 26. Minimum Window Substring\n// Difficulty: HARD | Topic: Sliding Window with Target Frequency\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_027",
    "number": 27,
    "title": "Longest Valid Parentheses",
    "slug": "longest-valid-parentheses",
    "topic_id": "topic_strings",
    "subtopic": "Stack / Dual Counter Balancing",
    "difficulty": "HARD",
    "roadmap_stage": "Placement Revision",
    "companies": [
      "Amazon",
      "Google",
      "Meta"
    ],
    "tags": [
      "strings"
    ],
    "description": "Given a string containing just the characters '(' and ')', return the length of the longest valid (well-formed) parentheses substring.",
    "input_format": "A single line containing string s.",
    "output_format": "Single integer representing length of longest valid parentheses substring.",
    "constraints": [
      "0 <= s.length <= 3 * 10^4",
      "s[i] is '(', or ')'."
    ],
    "examples": [
      {
        "input": "(()",
        "output": "2",
        "explanation": "The longest valid parentheses substring is \"()\"."
      },
      {
        "input": ")()())",
        "output": "4",
        "explanation": "The longest valid parentheses substring is \"()()\"."
      },
      {
        "input": "",
        "output": "0"
      }
    ],
    "public_test_cases": [
      {
        "input": "(()",
        "output": "2"
      },
      {
        "input": ")()())",
        "output": "4"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "",
        "output": "0"
      },
      {
        "input": "()(()",
        "output": "2"
      },
      {
        "input": "()(())",
        "output": "6"
      }
    ],
    "hints": [
      "Use a stack initialized with -1 to serve as the base boundary index.",
      "For '(', push its index onto the stack.",
      "For ')', pop the top index. If stack is empty, push current index as new boundary. Otherwise, valid length is current index - stack.top()."
    ],
    "optimal_complexity": {
      "time": "O(N)",
      "space": "O(N)"
    },
    "solution_explanation": "Use a stack initialized with index -1. Opening brackets push their index. Closing brackets pop; remaining top index acts as the boundary of the matched substring.",
    "starter_code": {
      "python": "# 27. Longest Valid Parentheses\n# Difficulty: HARD | Topic: Stack / Dual Counter Balancing\n# Time Complexity Target: O(N) | Space Complexity Target: O(N)\n\nimport sys\nimport json\n\ndef longestValidParentheses(s: str) -> int:\n    \"\"\"\n    Given a string containing just the characters '(' and ')', return the length of the longest valid (well-formed) parentheses substring.\n    \"\"\"\n    # TODO: Implement your solution here\n    stack = [-1]\n    max_len = 0\n    for i, c in enumerate(s):\n        if c == '(':\n            stack.append(i)\n        else:\n            stack.pop()\n            if not stack:\n                stack.append(i)\n            else:\n                max_len = max(max_len, i - stack[-1])\n    return max_len\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(longestValidParentheses(...))\n",
      "javascript": "/**\n * 27. Longest Valid Parentheses\n * Difficulty: HARD | Topic: Stack / Dual Counter Balancing\n * Optimal: O(N) time, O(N) space\n */\n\nconst fs = require('fs');\n\nfunction longestValidParentheses(s: str) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 27. Longest Valid Parentheses\n// Difficulty: HARD | Topic: Stack / Dual Counter Balancing\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 27. Longest Valid Parentheses\n// Difficulty: HARD | Topic: Stack / Dual Counter Balancing\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_remove_duplicates_from_sorted_array",
    "number": 28,
    "title": "Remove Duplicates from Sorted Array",
    "slug": "remove-duplicates-from-sorted-array",
    "topic_id": "topic_two_pointers",
    "subtopic": "In-Place Read/Write Pointers",
    "difficulty": "EASY",
    "roadmap_stage": "Beginner Foundations",
    "companies": [
      "Microsoft",
      "Amazon",
      "Apple",
      "Meta"
    ],
    "tags": [
      "two pointers"
    ],
    "description": "Given an integer array nums sorted in non-decreasing order, remove the duplicates in-place such that each unique element appears only once. The relative order of the elements should be kept the same. Then return the number of unique elements in nums.",
    "input_format": "A single line of space-separated sorted integers.",
    "output_format": "Space-separated unique elements followed by length k.",
    "constraints": [
      "1 <= nums.length <= 3 * 10^4",
      "-100 <= nums[i] <= 100",
      "nums is sorted in non-decreasing order."
    ],
    "examples": [
      {
        "input": "1 1 2",
        "output": "1 2",
        "explanation": "2 unique elements: [1, 2]."
      },
      {
        "input": "0 0 1 1 1 2 2 3 3 4",
        "output": "0 1 2 3 4"
      }
    ],
    "public_test_cases": [
      {
        "input": "1 1 2",
        "output": "1 2"
      },
      {
        "input": "0 0 1 1 1 2 2 3 3 4",
        "output": "0 1 2 3 4"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "1",
        "output": "1"
      },
      {
        "input": "1 2 3",
        "output": "1 2 3"
      },
      {
        "input": "-10 -10 -5 0 0 5",
        "output": "-10 -5 0 5"
      }
    ],
    "hints": [
      "Since the array is sorted, duplicates are adjacent.",
      "Use a slow write pointer `k`.",
      "Whenever nums[i] != nums[k-1], write nums[k] = nums[i] and increment k."
    ],
    "optimal_complexity": {
      "time": "O(N)",
      "space": "O(1)"
    },
    "solution_explanation": "Slow-fast pointers: slow pointer tracks the insertion point for unique items; fast pointer iterates over the list.",
    "starter_code": {
      "python": "# 28. Remove Duplicates from Sorted Array\n# Difficulty: EASY | Topic: In-Place Read/Write Pointers\n# Time Complexity Target: O(N) | Space Complexity Target: O(1)\n\nimport sys\nimport json\n\ndef removeDuplicates(nums: list[int]) -> int:\n    \"\"\"\n    Given an integer array nums sorted in non-decreasing order, remove the duplicates in-place such that each unique element appears only once.\n    \"\"\"\n    # TODO: Implement your solution here\n    if not nums: return 0\n    k = 1\n    for i in range(1, len(nums)):\n        if nums[i] != nums[i - 1]:\n            nums[k] = nums[i]\n            k += 1\n    return k\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(removeDuplicates(...))\n",
      "javascript": "/**\n * 28. Remove Duplicates from Sorted Array\n * Difficulty: EASY | Topic: In-Place Read/Write Pointers\n * Optimal: O(N) time, O(1) space\n */\n\nconst fs = require('fs');\n\nfunction removeDuplicates(nums: list[int]) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 28. Remove Duplicates from Sorted Array\n// Difficulty: EASY | Topic: In-Place Read/Write Pointers\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 28. Remove Duplicates from Sorted Array\n// Difficulty: EASY | Topic: In-Place Read/Write Pointers\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_029",
    "number": 29,
    "title": "Move Zeroes",
    "slug": "move-zeroes",
    "topic_id": "topic_two_pointers",
    "subtopic": "In-Place Partitioning",
    "difficulty": "EASY",
    "roadmap_stage": "Beginner Foundations",
    "companies": [
      "Meta",
      "Apple",
      "Amazon",
      "Microsoft"
    ],
    "tags": [
      "two pointers"
    ],
    "description": "Given an integer array nums, move all 0's to the end of it while maintaining the relative order of the non-zero elements.\n\nNote that you must do this in-place without making a copy of the array.",
    "input_format": "A single line of space-separated integers representing nums.",
    "output_format": "Space-separated integers after moving all zeroes to the end.",
    "constraints": [
      "1 <= nums.length <= 10^4",
      "-2^31 <= nums[i] <= 2^31 - 1"
    ],
    "examples": [
      {
        "input": "0 1 0 3 12",
        "output": "1 3 12 0 0"
      },
      {
        "input": "0",
        "output": "0"
      }
    ],
    "public_test_cases": [
      {
        "input": "0 1 0 3 12",
        "output": "1 3 12 0 0"
      },
      {
        "input": "0",
        "output": "0"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "1 2 3",
        "output": "1 2 3"
      },
      {
        "input": "0 0 1",
        "output": "1 0 0"
      },
      {
        "input": "4 2 4 0 0 3 0 5 1 0",
        "output": "4 2 4 3 5 1 0 0 0 0"
      }
    ],
    "hints": [
      "Maintain a write pointer `lastNonZero` initialized to 0.",
      "Iterate through the array. When nums[i] != 0, swap nums[lastNonZero] with nums[i] and increment lastNonZero.",
      "This preserves the relative order of non-zero elements in a single pass."
    ],
    "optimal_complexity": {
      "time": "O(N)",
      "space": "O(1)"
    },
    "solution_explanation": "Swap non-zero elements into the next available slot marked by last_non_zero pointer in O(N) time and O(1) space.",
    "starter_code": {
      "python": "# 29. Move Zeroes\n# Difficulty: EASY | Topic: In-Place Partitioning\n# Time Complexity Target: O(N) | Space Complexity Target: O(1)\n\nimport sys\nimport json\n\ndef moveZeroes(nums: list[int]) -> None:\n    \"\"\"\n    Given an integer array nums, move all 0's to the end of it while maintaining the relative order of the non-zero elements.\n    \"\"\"\n    # TODO: Implement your solution here\n    last_non_zero = 0\n    for i in range(len(nums)):\n        if nums[i] != 0:\n            nums[last_non_zero], nums[i] = nums[i], nums[last_non_zero]\n            last_non_zero += 1\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(moveZeroes(...))\n",
      "javascript": "/**\n * 29. Move Zeroes\n * Difficulty: EASY | Topic: In-Place Partitioning\n * Optimal: O(N) time, O(1) space\n */\n\nconst fs = require('fs');\n\nfunction moveZeroes(nums: list[int]) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 29. Move Zeroes\n// Difficulty: EASY | Topic: In-Place Partitioning\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 29. Move Zeroes\n// Difficulty: EASY | Topic: In-Place Partitioning\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_030",
    "number": 30,
    "title": "Squares of a Sorted Array",
    "slug": "squares-of-a-sorted-array",
    "topic_id": "topic_two_pointers",
    "subtopic": "Two-End Comparison",
    "difficulty": "EASY",
    "roadmap_stage": "Beginner Foundations",
    "companies": [
      "Amazon",
      "Meta",
      "Google"
    ],
    "tags": [
      "two pointers"
    ],
    "description": "Given an integer array nums sorted in non-decreasing order, return an array of the squares of each number sorted in non-decreasing order.",
    "input_format": "A single line of space-separated sorted integers.",
    "output_format": "Space-separated integers representing sorted squares.",
    "constraints": [
      "1 <= nums.length <= 10^4",
      "-10^4 <= nums[i] <= 10^4",
      "nums is sorted in non-decreasing order."
    ],
    "examples": [
      {
        "input": "-4 -1 0 3 10",
        "output": "0 1 9 16 100",
        "explanation": "After squaring, the array becomes [16, 1, 0, 9, 100]. After sorting, it is [0, 1, 9, 16, 100]."
      },
      {
        "input": "-7 -3 2 3 11",
        "output": "4 9 9 49 121"
      }
    ],
    "public_test_cases": [
      {
        "input": "-4 -1 0 3 10",
        "output": "0 1 9 16 100"
      },
      {
        "input": "-7 -3 2 3 11",
        "output": "4 9 9 49 121"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "-1",
        "output": "1"
      },
      {
        "input": "-5 -4 -3 -2 -1",
        "output": "1 4 9 16 25"
      }
    ],
    "hints": [
      "The largest square must come from either the most negative number at the left or the largest positive number at the right.",
      "Use two pointers at opposite ends of the array.",
      "Fill the result array backwards from index n - 1 down to 0."
    ],
    "optimal_complexity": {
      "time": "O(N)",
      "space": "O(N)"
    },
    "solution_explanation": "Two pointers at the outer ends compare absolute values and place the larger square into the back of the result array.",
    "starter_code": {
      "python": "# 30. Squares of a Sorted Array\n# Difficulty: EASY | Topic: Two-End Comparison\n# Time Complexity Target: O(N) | Space Complexity Target: O(N)\n\nimport sys\nimport json\n\ndef sortedSquares(nums: list[int]) -> list[int]:\n    \"\"\"\n    Given an integer array nums sorted in non-decreasing order, return an array of the squares of each number sorted in non-decreasing order.\n    \"\"\"\n    # TODO: Implement your solution here\n    n = len(nums)\n    res = [0] * n\n    l, r, p = 0, n - 1, n - 1\n    while l <= r:\n        if abs(nums[l]) > abs(nums[r]):\n            res[p] = nums[l] ** 2\n            l += 1\n        else:\n            res[p] = nums[r] ** 2\n            r -= 1\n        p -= 1\n    return res\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(sortedSquares(...))\n",
      "javascript": "/**\n * 30. Squares of a Sorted Array\n * Difficulty: EASY | Topic: Two-End Comparison\n * Optimal: O(N) time, O(N) space\n */\n\nconst fs = require('fs');\n\nfunction sortedSquares(nums: list[int]) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 30. Squares of a Sorted Array\n// Difficulty: EASY | Topic: Two-End Comparison\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 30. Squares of a Sorted Array\n// Difficulty: EASY | Topic: Two-End Comparison\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_031",
    "number": 31,
    "title": "Two Sum II - Input Array Is Sorted",
    "slug": "two-sum-ii-input-array-is-sorted",
    "topic_id": "topic_two_pointers",
    "subtopic": "Converging Pointers",
    "difficulty": "MEDIUM",
    "roadmap_stage": "Core Patterns",
    "companies": [
      "Amazon",
      "Apple",
      "Google"
    ],
    "tags": [
      "two pointers"
    ],
    "description": "Given a 1-indexed array of integers numbers that is already sorted in non-decreasing order, find two numbers such that they add up to a specific target number.\n\nReturn the indices of the two numbers, index1 and index2, added by one as an integer array [index1, index2] of length 2.",
    "input_format": "Line 1: N sorted integers\nLine 2: target integer",
    "output_format": "Two 1-indexed integers separated by space.",
    "constraints": [
      "2 <= numbers.length <= 3 * 10^4",
      "-1000 <= numbers[i] <= 1000",
      "numbers is sorted in non-decreasing order.",
      "Exactly one solution exists."
    ],
    "examples": [
      {
        "input": "2 7 11 15\n9",
        "output": "1 2",
        "explanation": "2 + 7 == 9. Indices are 1, 2."
      },
      {
        "input": "2 3 4\n6",
        "output": "1 3"
      },
      {
        "input": "-1 0\n-1",
        "output": "1 2"
      }
    ],
    "public_test_cases": [
      {
        "input": "2 7 11 15\n9",
        "output": "1 2"
      },
      {
        "input": "2 3 4\n6",
        "output": "1 3"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "-1 0\n-1",
        "output": "1 2"
      },
      {
        "input": "1 2 3 4 4 9 56 90\n8",
        "output": "4 5"
      }
    ],
    "hints": [
      "Since the array is sorted, you do not need a hash map.",
      "Pointers at left and right: if sum < target, increment left. If sum > target, decrement right.",
      "Remember to return 1-based indices."
    ],
    "optimal_complexity": {
      "time": "O(N)",
      "space": "O(1)"
    },
    "solution_explanation": "Converging pointers take advantage of the sorted monotonic property. Adjust left/right based on sum vs target.",
    "starter_code": {
      "python": "# 31. Two Sum II - Input Array Is Sorted\n# Difficulty: MEDIUM | Topic: Converging Pointers\n# Time Complexity Target: O(N) | Space Complexity Target: O(1)\n\nimport sys\nimport json\n\ndef twoSumSorted(numbers: list[int], target: int) -> list[int]:\n    \"\"\"\n    Given a 1-indexed array of integers numbers that is already sorted in non-decreasing order, find two numbers such that they add up to a specific target number.\n    \"\"\"\n    # TODO: Implement your solution here\n    l, r = 0, len(numbers) - 1\n    while l < r:\n        s = numbers[l] + numbers[r]\n        if s == target: return [l + 1, r + 1]\n        elif s < target: l += 1\n        else: r -= 1\n    return []\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(twoSumSorted(...))\n",
      "javascript": "/**\n * 31. Two Sum II - Input Array Is Sorted\n * Difficulty: MEDIUM | Topic: Converging Pointers\n * Optimal: O(N) time, O(1) space\n */\n\nconst fs = require('fs');\n\nfunction twoSumSorted(numbers: list[int], target: int) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 31. Two Sum II - Input Array Is Sorted\n// Difficulty: MEDIUM | Topic: Converging Pointers\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 31. Two Sum II - Input Array Is Sorted\n// Difficulty: MEDIUM | Topic: Converging Pointers\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_032",
    "number": 32,
    "title": "Three Sum",
    "slug": "three-sum",
    "topic_id": "topic_two_pointers",
    "subtopic": "Sorted 3-Sum Combination",
    "difficulty": "MEDIUM",
    "roadmap_stage": "Core Patterns",
    "companies": [
      "Amazon",
      "Meta",
      "Google",
      "Microsoft"
    ],
    "tags": [
      "two pointers"
    ],
    "description": "Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.\n\nNotice that the solution set must not contain duplicate triplets.",
    "input_format": "A single line of space-separated integers representing nums.",
    "output_format": "Each triplet on a separate line as space-separated integers, sorted.",
    "constraints": [
      "3 <= nums.length <= 3000",
      "-10^5 <= nums[i] <= 10^5"
    ],
    "examples": [
      {
        "input": "-1 0 1 2 -1 -4",
        "output": "-1 -1 2\n-1 0 1"
      },
      {
        "input": "0 1 1",
        "output": ""
      },
      {
        "input": "0 0 0",
        "output": "0 0 0"
      }
    ],
    "public_test_cases": [
      {
        "input": "-1 0 1 2 -1 -4",
        "output": "-1 -1 2\n-1 0 1"
      },
      {
        "input": "0 0 0",
        "output": "0 0 0"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "0 1 1",
        "output": ""
      },
      {
        "input": "-2 0 1 1 2",
        "output": "-2 0 2\n-2 1 1"
      }
    ],
    "hints": [
      "Sort the array first.",
      "Fix the first element nums[i]. Then use two pointers for the remaining subarray to find pairs summing to -nums[i].",
      "Skip duplicates for both the outer loop and the two pointers."
    ],
    "optimal_complexity": {
      "time": "O(N^2)",
      "space": "O(1)"
    },
    "solution_explanation": "Sort array. For each index i, perform two-pointer search on remaining suffix for pair summing to -nums[i]. Deduplicate adjacent items.",
    "starter_code": {
      "python": "# 32. Three Sum\n# Difficulty: MEDIUM | Topic: Sorted 3-Sum Combination\n# Time Complexity Target: O(N^2) | Space Complexity Target: O(1)\n\nimport sys\nimport json\n\ndef threeSum(nums: list[int]) -> list[list[int]]:\n    \"\"\"\n    Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.\n    \"\"\"\n    # TODO: Implement your solution here\n    nums.sort()\n    res = []\n    for i in range(len(nums) - 2):\n        if i > 0 and nums[i] == nums[i - 1]: continue\n        l, r = i + 1, len(nums) - 1\n        while l < r:\n            s = nums[i] + nums[l] + nums[r]\n            if s == 0:\n                res.append([nums[i], nums[l], nums[r]])\n                while l < r and nums[l] == nums[l + 1]: l += 1\n                while l < r and nums[r] == nums[r - 1]: r -= 1\n                l += 1; r -= 1\n            elif s < 0: l += 1\n            else: r -= 1\n    return res\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(threeSum(...))\n",
      "javascript": "/**\n * 32. Three Sum\n * Difficulty: MEDIUM | Topic: Sorted 3-Sum Combination\n * Optimal: O(N^2) time, O(1) space\n */\n\nconst fs = require('fs');\n\nfunction threeSum(nums: list[int]) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 32. Three Sum\n// Difficulty: MEDIUM | Topic: Sorted 3-Sum Combination\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 32. Three Sum\n// Difficulty: MEDIUM | Topic: Sorted 3-Sum Combination\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_033",
    "number": 33,
    "title": "Container With Most Water",
    "slug": "container-with-most-water",
    "topic_id": "topic_two_pointers",
    "subtopic": "Area Maximization",
    "difficulty": "MEDIUM",
    "roadmap_stage": "Core Patterns",
    "companies": [
      "Amazon",
      "Google",
      "Meta",
      "Apple"
    ],
    "tags": [
      "two pointers"
    ],
    "description": "You are given an integer array height of length n. There are n vertical lines drawn such that the two endpoints of the ith line are (i, 0) and (i, height[i]).\n\nFind two lines that together with the x-axis form a container, such that the container contains the most water.\n\nReturn the maximum amount of water a container can store.",
    "input_format": "A single line of space-separated integers representing vertical line heights.",
    "output_format": "Single integer representing the maximum trapped area.",
    "constraints": [
      "n == height.length",
      "2 <= n <= 10^5",
      "0 <= height[i] <= 10^4"
    ],
    "examples": [
      {
        "input": "1 8 6 2 5 4 8 3 7",
        "output": "49",
        "explanation": "The maximum area is obtained between index 1 and index 8: min(8, 7) * 7 = 49."
      },
      {
        "input": "1 1",
        "output": "1"
      }
    ],
    "public_test_cases": [
      {
        "input": "1 8 6 2 5 4 8 3 7",
        "output": "49"
      },
      {
        "input": "1 1",
        "output": "1"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "4 3 2 1 4",
        "output": "16"
      },
      {
        "input": "1 2 1",
        "output": "2"
      }
    ],
    "hints": [
      "Area is (right - left) * min(height[left], height[right]).",
      "Start with the widest container: left = 0, right = n - 1.",
      "To have any chance of increasing the area with a narrower width, you MUST move the pointer pointing to the shorter line."
    ],
    "optimal_complexity": {
      "time": "O(N)",
      "space": "O(1)"
    },
    "solution_explanation": "Two pointers start at the furthest boundaries. Always advance the pointer pointing to the smaller height, since area is limited by the minimum height.",
    "starter_code": {
      "python": "# 33. Container With Most Water\n# Difficulty: MEDIUM | Topic: Area Maximization\n# Time Complexity Target: O(N) | Space Complexity Target: O(1)\n\nimport sys\nimport json\n\ndef maxArea(height: list[int]) -> int:\n    \"\"\"\n    You are given an integer array height of length n.\n    \"\"\"\n    # TODO: Implement your solution here\n    l, r = 0, len(height) - 1\n    max_area = 0\n    while l < r:\n        h = min(height[l], height[r])\n        max_area = max(max_area, h * (r - l))\n        if height[l] < height[r]:\n            l += 1\n        else:\n            r -= 1\n    return max_area\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(maxArea(...))\n",
      "javascript": "/**\n * 33. Container With Most Water\n * Difficulty: MEDIUM | Topic: Area Maximization\n * Optimal: O(N) time, O(1) space\n */\n\nconst fs = require('fs');\n\nfunction maxArea(height: list[int]) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 33. Container With Most Water\n// Difficulty: MEDIUM | Topic: Area Maximization\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 33. Container With Most Water\n// Difficulty: MEDIUM | Topic: Area Maximization\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_034",
    "number": 34,
    "title": "Sort Colors",
    "slug": "sort-colors",
    "topic_id": "topic_two_pointers",
    "subtopic": "Dutch National Flag Partition",
    "difficulty": "MEDIUM",
    "roadmap_stage": "Core Patterns",
    "companies": [
      "Microsoft",
      "Amazon",
      "Meta"
    ],
    "tags": [
      "two pointers"
    ],
    "description": "Given an array nums with n objects colored red, white, or blue, sort them in-place so that objects of the same color are adjacent, with the colors in the order red, white, and blue.\n\nWe will use the integers 0, 1, and 2 to represent the color red, white, and blue, respectively.\n\nYou must solve this problem without using the library's sort function.",
    "input_format": "A single line of space-separated integers consisting of 0, 1, and 2.",
    "output_format": "Sorted space-separated integers.",
    "constraints": [
      "n == nums.length",
      "1 <= n <= 300",
      "nums[i] is either 0, 1, or 2."
    ],
    "examples": [
      {
        "input": "2 0 2 1 1 0",
        "output": "0 0 1 1 2 2"
      },
      {
        "input": "2 0 1",
        "output": "0 1 2"
      }
    ],
    "public_test_cases": [
      {
        "input": "2 0 2 1 1 0",
        "output": "0 0 1 1 2 2"
      },
      {
        "input": "2 0 1",
        "output": "0 1 2"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "0",
        "output": "0"
      },
      {
        "input": "1",
        "output": "1"
      },
      {
        "input": "2 1 0",
        "output": "0 1 2"
      }
    ],
    "hints": [
      "Dutch National Flag 3-way partitioning problem.",
      "Use three pointers: low, mid, high.",
      "If nums[mid] == 0: swap with low, mid++, low++. If nums[mid] == 1: mid++. If nums[mid] == 2: swap with high, high--."
    ],
    "optimal_complexity": {
      "time": "O(N)",
      "space": "O(1)"
    },
    "solution_explanation": "Dutch National Flag three-way partition. Low pointer tracks boundary of 0s, high tracks boundary of 2s, mid scans through array.",
    "starter_code": {
      "python": "# 34. Sort Colors\n# Difficulty: MEDIUM | Topic: Dutch National Flag Partition\n# Time Complexity Target: O(N) | Space Complexity Target: O(1)\n\nimport sys\nimport json\n\ndef sortColors(nums: list[int]) -> None:\n    \"\"\"\n    Given an array nums with n objects colored red, white, or blue, sort them in-place so that objects of the same color are adjacent, with the colors in the order red, white, and blue.\n    \"\"\"\n    # TODO: Implement your solution here\n    low, mid, high = 0, 0, len(nums) - 1\n    while mid <= high:\n        if nums[mid] == 0:\n            nums[low], nums[mid] = nums[mid], nums[low]\n            low += 1; mid += 1\n        elif nums[mid] == 1:\n            mid += 1\n        else:\n            nums[mid], nums[high] = nums[high], nums[mid]\n            high -= 1\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(sortColors(...))\n",
      "javascript": "/**\n * 34. Sort Colors\n * Difficulty: MEDIUM | Topic: Dutch National Flag Partition\n * Optimal: O(N) time, O(1) space\n */\n\nconst fs = require('fs');\n\nfunction sortColors(nums: list[int]) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 34. Sort Colors\n// Difficulty: MEDIUM | Topic: Dutch National Flag Partition\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 34. Sort Colors\n// Difficulty: MEDIUM | Topic: Dutch National Flag Partition\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_035",
    "number": 35,
    "title": "Four Sum",
    "slug": "four-sum",
    "topic_id": "topic_two_pointers",
    "subtopic": "K-Sum Generalization",
    "difficulty": "HARD",
    "roadmap_stage": "Placement Revision",
    "companies": [
      "Amazon",
      "Apple",
      "Google"
    ],
    "tags": [
      "two pointers"
    ],
    "description": "Given an array nums of n integers, return an array of all the unique quadruplets [nums[a], nums[b], nums[c], nums[d]] such that:\n- 0 <= a, b, c, d < n\n- a, b, c, and d are distinct.\n- nums[a] + nums[b] + nums[c] + nums[d] == target\n\nYou may return the answer in any order.",
    "input_format": "Line 1: N integers\nLine 2: target integer",
    "output_format": "Each unique quadruplet on a separate line.",
    "constraints": [
      "1 <= nums.length <= 200",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9"
    ],
    "examples": [
      {
        "input": "1 0 -1 0 -2 2\n0",
        "output": "-2 -1 1 2\n-2 0 0 2\n-1 0 0 1"
      },
      {
        "input": "2 2 2 2 2\n8",
        "output": "2 2 2 2"
      }
    ],
    "public_test_cases": [
      {
        "input": "1 0 -1 0 -2 2\n0",
        "output": "-2 -1 1 2\n-2 0 0 2\n-1 0 0 1"
      },
      {
        "input": "2 2 2 2 2\n8",
        "output": "2 2 2 2"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "0 0 0 0\n0",
        "output": "0 0 0 0"
      },
      {
        "input": "-3 -2 -1 0 0 1 2 3\n0",
        "output": "-3 -2 2 3\n-3 -1 1 3\n-3 0 0 3\n-3 0 1 2\n-2 -1 0 3\n-2 -1 1 2\n-2 0 0 2\n-1 0 0 1"
      }
    ],
    "hints": [
      "Sort the array first.",
      "Fix two outer loops (i and j), then use two pointers (left and right) for the remaining two elements.",
      "Skip duplicates across all loops to avoid duplicate quadruplets."
    ],
    "optimal_complexity": {
      "time": "O(N^3)",
      "space": "O(1)"
    },
    "solution_explanation": "Sort array. Two outer loops fix nums[i] and nums[j], two pointers find the remaining two numbers. Careful duplicate skipping prevents duplicates.",
    "starter_code": {
      "python": "# 35. Four Sum\n# Difficulty: HARD | Topic: K-Sum Generalization\n# Time Complexity Target: O(N^3) | Space Complexity Target: O(1)\n\nimport sys\nimport json\n\ndef fourSum(nums: list[int], target: int) -> list[list[int]]:\n    \"\"\"\n    Given an array nums of n integers, return an array of all the unique quadruplets [nums[a], nums[b], nums[c], nums[d]] such that:\n- 0 <= a, b, c, d < n\n- a, b, c, and d are distinct.\n    \"\"\"\n    # TODO: Implement your solution here\n    nums.sort()\n    res = []\n    n = len(nums)\n    for i in range(n - 3):\n        if i > 0 and nums[i] == nums[i - 1]: continue\n        for j in range(i + 1, n - 2):\n            if j > i + 1 and nums[j] == nums[j - 1]: continue\n            l, r = j + 1, n - 1\n            while l < r:\n                s = nums[i] + nums[j] + nums[l] + nums[r]\n                if s == target:\n                    res.append([nums[i], nums[j], nums[l], nums[r]])\n                    while l < r and nums[l] == nums[l + 1]: l += 1\n                    while l < r and nums[r] == nums[r - 1]: r -= 1\n                    l += 1; r -= 1\n                elif s < target: l += 1\n                else: r -= 1\n    return res\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(fourSum(...))\n",
      "javascript": "/**\n * 35. Four Sum\n * Difficulty: HARD | Topic: K-Sum Generalization\n * Optimal: O(N^3) time, O(1) space\n */\n\nconst fs = require('fs');\n\nfunction fourSum(nums: list[int], target: int) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 35. Four Sum\n// Difficulty: HARD | Topic: K-Sum Generalization\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 35. Four Sum\n// Difficulty: HARD | Topic: K-Sum Generalization\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_036",
    "number": 36,
    "title": "Maximum Average Subarray I",
    "slug": "maximum-average-subarray-i",
    "topic_id": "topic_sliding_window",
    "subtopic": "Fixed-Size Sliding Window",
    "difficulty": "EASY",
    "roadmap_stage": "Beginner Foundations",
    "companies": [
      "Google",
      "Facebook"
    ],
    "tags": [
      "sliding window"
    ],
    "description": "You are given an integer array nums consisting of n elements, and an integer k.\n\nFind a contiguous subarray whose length is equal to k that has the maximum average value and return this value. Any answer with a calculation error less than 10^-5 will be accepted.",
    "input_format": "Line 1: N space-separated integers\nLine 2: integer k",
    "output_format": "Decimal number representing max average rounded to 5 decimal places.",
    "constraints": [
      "n == nums.length",
      "1 <= k <= n <= 10^5",
      "-10^4 <= nums[i] <= 10^4"
    ],
    "examples": [
      {
        "input": "1 12 -5 -6 50 3\n4",
        "output": "12.75000",
        "explanation": "Maximum average is (12 - 5 - 6 + 50) / 4 = 51 / 4 = 12.75."
      },
      {
        "input": "5\n1",
        "output": "5.00000"
      }
    ],
    "public_test_cases": [
      {
        "input": "1 12 -5 -6 50 3\n4",
        "output": "12.75000"
      },
      {
        "input": "5\n1",
        "output": "5.00000"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "0 4 0 3 2\n1",
        "output": "4.00000"
      },
      {
        "input": "-1\n1",
        "output": "-1.00000"
      }
    ],
    "hints": [
      "Calculate the sum of the first k elements.",
      "Slide the window by 1 element at a time: add the new incoming element and subtract the outgoing element.",
      "Track the maximum sum and divide by k at the end."
    ],
    "optimal_complexity": {
      "time": "O(N)",
      "space": "O(1)"
    },
    "solution_explanation": "Compute initial window sum of length k. Slide window one index right by adding nums[i] and subtracting nums[i - k]. Maximum sum divided by k yields result in O(N).",
    "starter_code": {
      "python": "# 36. Maximum Average Subarray I\n# Difficulty: EASY | Topic: Fixed-Size Sliding Window\n# Time Complexity Target: O(N) | Space Complexity Target: O(1)\n\nimport sys\nimport json\n\ndef findMaxAverage(nums: list[int], k: int) -> float:\n    \"\"\"\n    You are given an integer array nums consisting of n elements, and an integer k.\n    \"\"\"\n    # TODO: Implement your solution here\n    curr_sum = sum(nums[:k])\n    max_sum = curr_sum\n    for i in range(k, len(nums)):\n        curr_sum += nums[i] - nums[i - k]\n        max_sum = max(max_sum, curr_sum)\n    return max_sum / k\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(findMaxAverage(...))\n",
      "javascript": "/**\n * 36. Maximum Average Subarray I\n * Difficulty: EASY | Topic: Fixed-Size Sliding Window\n * Optimal: O(N) time, O(1) space\n */\n\nconst fs = require('fs');\n\nfunction findMaxAverage(nums: list[int], k: int) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 36. Maximum Average Subarray I\n// Difficulty: EASY | Topic: Fixed-Size Sliding Window\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 36. Maximum Average Subarray I\n// Difficulty: EASY | Topic: Fixed-Size Sliding Window\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_037",
    "number": 37,
    "title": "Maximum Sum Subarray of Size K",
    "slug": "maximum-sum-subarray-of-size-k",
    "topic_id": "topic_sliding_window",
    "subtopic": "Fixed Window Extremum",
    "difficulty": "EASY",
    "roadmap_stage": "Beginner Foundations",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "tags": [
      "sliding window"
    ],
    "description": "Given an array of positive integers nums and an integer k, find the maximum sum of any contiguous subarray of size k.",
    "input_format": "Line 1: N space-separated integers\nLine 2: integer k",
    "output_format": "Single integer representing maximum sum.",
    "constraints": [
      "1 <= k <= nums.length <= 10^5",
      "1 <= nums[i] <= 10^4"
    ],
    "examples": [
      {
        "input": "2 1 5 1 3 2\n3",
        "output": "9",
        "explanation": "Subarray [5, 1, 3] gives maximum sum 9."
      },
      {
        "input": "2 3 4 1 5\n2",
        "output": "7",
        "explanation": "Subarray [3, 4] gives maximum sum 7."
      }
    ],
    "public_test_cases": [
      {
        "input": "2 1 5 1 3 2\n3",
        "output": "9"
      },
      {
        "input": "2 3 4 1 5\n2",
        "output": "7"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "1 2 3 4 5 6\n1",
        "output": "6"
      },
      {
        "input": "10 20 30 40\n4",
        "output": "100"
      }
    ],
    "hints": [
      "Fixed-size window of length k.",
      "Slide the window by adding the right element and subtracting the left element.",
      "Record the max value across all window positions."
    ],
    "optimal_complexity": {
      "time": "O(N)",
      "space": "O(1)"
    },
    "solution_explanation": "Slide a window of size k across the array, adding the entering element and subtracting the leaving element.",
    "starter_code": {
      "python": "# 37. Maximum Sum Subarray of Size K\n# Difficulty: EASY | Topic: Fixed Window Extremum\n# Time Complexity Target: O(N) | Space Complexity Target: O(1)\n\nimport sys\nimport json\n\ndef maxSubarraySumK(nums: list[int], k: int) -> int:\n    \"\"\"\n    Given an array of positive integers nums and an integer k, find the maximum sum of any contiguous subarray of size k.\n    \"\"\"\n    # TODO: Implement your solution here\n    curr = sum(nums[:k])\n    ans = curr\n    for i in range(k, len(nums)):\n        curr += nums[i] - nums[i - k]\n        ans = max(ans, curr)\n    return ans\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(maxSubarraySumK(...))\n",
      "javascript": "/**\n * 37. Maximum Sum Subarray of Size K\n * Difficulty: EASY | Topic: Fixed Window Extremum\n * Optimal: O(N) time, O(1) space\n */\n\nconst fs = require('fs');\n\nfunction maxSubarraySumK(nums: list[int], k: int) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 37. Maximum Sum Subarray of Size K\n// Difficulty: EASY | Topic: Fixed Window Extremum\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 37. Maximum Sum Subarray of Size K\n// Difficulty: EASY | Topic: Fixed Window Extremum\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_038",
    "number": 38,
    "title": "Longest Substring Without Repeating Characters",
    "slug": "longest-substring-without-repeating-characters",
    "topic_id": "topic_sliding_window",
    "subtopic": "Dynamic Window with Last Seen Index",
    "difficulty": "MEDIUM",
    "roadmap_stage": "Core Patterns",
    "companies": [
      "Amazon",
      "Google",
      "Meta",
      "Bloomberg",
      "Apple"
    ],
    "tags": [
      "sliding window"
    ],
    "description": "Given a string s, find the length of the longest substring without repeating characters.",
    "input_format": "A single line containing string s.",
    "output_format": "Single integer representing the maximum length.",
    "constraints": [
      "0 <= s.length <= 5 * 10^4",
      "s consists of English letters, digits, symbols and spaces."
    ],
    "examples": [
      {
        "input": "abcabcbb",
        "output": "3",
        "explanation": "The answer is \"abc\", with the length of 3."
      },
      {
        "input": "bbbbb",
        "output": "1",
        "explanation": "The answer is \"b\", with the length of 1."
      },
      {
        "input": "pwwkew",
        "output": "3",
        "explanation": "The answer is \"wke\", with the length of 3."
      }
    ],
    "public_test_cases": [
      {
        "input": "abcabcbb",
        "output": "3"
      },
      {
        "input": "bbbbb",
        "output": "1"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "pwwkew",
        "output": "3"
      },
      {
        "input": "",
        "output": "0"
      },
      {
        "input": "abba",
        "output": "2"
      }
    ],
    "hints": [
      "Use a sliding window [start, end].",
      "Keep a hash map of character -> last seen index.",
      "When seeing a duplicate character that appeared at or after `start`, move `start` to `last_seen[char] + 1`."
    ],
    "optimal_complexity": {
      "time": "O(N)",
      "space": "O(min(N, Alphabet))"
    },
    "solution_explanation": "Map each character to its most recent index. When a duplicate is seen inside current window, jump start pointer past the previous occurrence.",
    "starter_code": {
      "python": "# 38. Longest Substring Without Repeating Characters\n# Difficulty: MEDIUM | Topic: Dynamic Window with Last Seen Index\n# Time Complexity Target: O(N) | Space Complexity Target: O(min(N, Alphabet))\n\nimport sys\nimport json\n\ndef lengthOfLongestSubstring(s: str) -> int:\n    \"\"\"\n    Given a string s, find the length of the longest substring without repeating characters.\n    \"\"\"\n    # TODO: Implement your solution here\n    seen = {}\n    start = 0\n    max_len = 0\n    for i, c in enumerate(s):\n        if c in seen and seen[c] >= start:\n            start = seen[c] + 1\n        seen[c] = i\n        max_len = max(max_len, i - start + 1)\n    return max_len\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(lengthOfLongestSubstring(...))\n",
      "javascript": "/**\n * 38. Longest Substring Without Repeating Characters\n * Difficulty: MEDIUM | Topic: Dynamic Window with Last Seen Index\n * Optimal: O(N) time, O(min(N, Alphabet)) space\n */\n\nconst fs = require('fs');\n\nfunction lengthOfLongestSubstring(s: str) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 38. Longest Substring Without Repeating Characters\n// Difficulty: MEDIUM | Topic: Dynamic Window with Last Seen Index\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 38. Longest Substring Without Repeating Characters\n// Difficulty: MEDIUM | Topic: Dynamic Window with Last Seen Index\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_039",
    "number": 39,
    "title": "Minimum Size Subarray Sum",
    "slug": "minimum-size-subarray-sum",
    "topic_id": "topic_sliding_window",
    "subtopic": "Dynamic Window Shrink",
    "difficulty": "MEDIUM",
    "roadmap_stage": "Core Patterns",
    "companies": [
      "Amazon",
      "Google",
      "Meta"
    ],
    "tags": [
      "sliding window"
    ],
    "description": "Given an array of positive integers nums and a positive integer target, return the minimal length of a subarray whose sum is greater than or equal to target. If there is no such subarray, return 0 instead.",
    "input_format": "Line 1: target integer\nLine 2: N space-separated positive integers",
    "output_format": "Single integer representing minimal subarray length, or 0.",
    "constraints": [
      "1 <= target <= 10^9",
      "1 <= nums.length <= 10^5",
      "1 <= nums[i] <= 10^4"
    ],
    "examples": [
      {
        "input": "7\n2 3 1 2 4 3",
        "output": "2",
        "explanation": "The subarray [4,3] has the minimal length under the problem constraint."
      },
      {
        "input": "4\n1 4 4",
        "output": "1"
      },
      {
        "input": "11\n1 1 1 1 1 1 1 1",
        "output": "0"
      }
    ],
    "public_test_cases": [
      {
        "input": "7\n2 3 1 2 4 3",
        "output": "2"
      },
      {
        "input": "4\n1 4 4",
        "output": "1"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "11\n1 1 1 1 1 1 1 1",
        "output": "0"
      },
      {
        "input": "15\n1 2 3 4 5",
        "output": "5"
      }
    ],
    "hints": [
      "Use a sliding window [l, r].",
      "Expand r, adding nums[r] to running sum.",
      "While running sum >= target: update minimum length, subtract nums[l], and advance l."
    ],
    "optimal_complexity": {
      "time": "O(N)",
      "space": "O(1)"
    },
    "solution_explanation": "Expand right pointer to reach target sum, then shrink left pointer as much as possible while maintaining >= target.",
    "starter_code": {
      "python": "# 39. Minimum Size Subarray Sum\n# Difficulty: MEDIUM | Topic: Dynamic Window Shrink\n# Time Complexity Target: O(N) | Space Complexity Target: O(1)\n\nimport sys\nimport json\n\ndef minSubArrayLen(target: int, nums: list[int]) -> int:\n    \"\"\"\n    Given an array of positive integers nums and a positive integer target, return the minimal length of a subarray whose sum is greater than or equal to target.\n    \"\"\"\n    # TODO: Implement your solution here\n    l = 0\n    curr_sum = 0\n    ans = float('inf')\n    for r in range(len(nums)):\n        curr_sum += nums[r]\n        while curr_sum >= target:\n            ans = min(ans, r - l + 1)\n            curr_sum -= nums[l]\n            l += 1\n    return ans if ans != float('inf') else 0\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(minSubArrayLen(...))\n",
      "javascript": "/**\n * 39. Minimum Size Subarray Sum\n * Difficulty: MEDIUM | Topic: Dynamic Window Shrink\n * Optimal: O(N) time, O(1) space\n */\n\nconst fs = require('fs');\n\nfunction minSubArrayLen(target: int, nums: list[int]) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 39. Minimum Size Subarray Sum\n// Difficulty: MEDIUM | Topic: Dynamic Window Shrink\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 39. Minimum Size Subarray Sum\n// Difficulty: MEDIUM | Topic: Dynamic Window Shrink\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_040",
    "number": 40,
    "title": "Permutation in String",
    "slug": "permutation-in-string",
    "topic_id": "topic_sliding_window",
    "subtopic": "Fixed-Size Frequency Matching",
    "difficulty": "MEDIUM",
    "roadmap_stage": "Core Patterns",
    "companies": [
      "Microsoft",
      "Meta",
      "Amazon"
    ],
    "tags": [
      "sliding window"
    ],
    "description": "Given two strings s1 and s2, return true if s2 contains a permutation of s1, or false otherwise.\n\nIn other words, return true if one of s1's permutations is the substring of s2.",
    "input_format": "Line 1: string s1\nLine 2: string s2",
    "output_format": "true or false",
    "constraints": [
      "1 <= s1.length, s2.length <= 10^4",
      "s1 and s2 consist of lowercase English letters."
    ],
    "examples": [
      {
        "input": "ab\neidbaooo",
        "output": "true",
        "explanation": "s2 contains one permutation of s1 (\"ba\")."
      },
      {
        "input": "ab\neidboaoo",
        "output": "false"
      }
    ],
    "public_test_cases": [
      {
        "input": "ab\neidbaooo",
        "output": "true"
      },
      {
        "input": "ab\neidboaoo",
        "output": "false"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "adc\ndcda",
        "output": "true"
      },
      {
        "input": "hello\nooolleoooleh",
        "output": "false"
      }
    ],
    "hints": [
      "A permutation must have the exact same length and character counts as s1.",
      "Use a sliding window of length len(s1) across s2.",
      "Compare frequency arrays or maintain a count of matching characters."
    ],
    "optimal_complexity": {
      "time": "O(N)",
      "space": "O(1)"
    },
    "solution_explanation": "Maintain frequency buffer of size len(s1) across s2. Slide window right by 1, checking if frequency array matches s1's frequency.",
    "starter_code": {
      "python": "# 40. Permutation in String\n# Difficulty: MEDIUM | Topic: Fixed-Size Frequency Matching\n# Time Complexity Target: O(N) | Space Complexity Target: O(1)\n\nimport sys\nimport json\n\ndef checkInclusion(s1: str, s2: str) -> bool:\n    \"\"\"\n    Given two strings s1 and s2, return true if s2 contains a permutation of s1, or false otherwise.\n    \"\"\"\n    # TODO: Implement your solution here\n    if len(s1) > len(s2): return False\n    c1, c2 = [0] * 26, [0] * 26\n    for i in range(len(s1)):\n        c1[ord(s1[i]) - 97] += 1\n        c2[ord(s2[i]) - 97] += 1\n    if c1 == c2: return True\n    for i in range(len(s1), len(s2)):\n        c2[ord(s2[i]) - 97] += 1\n        c2[ord(s2[i - len(s1)]) - 97] -= 1\n        if c1 == c2: return True\n    return False\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(checkInclusion(...))\n",
      "javascript": "/**\n * 40. Permutation in String\n * Difficulty: MEDIUM | Topic: Fixed-Size Frequency Matching\n * Optimal: O(N) time, O(1) space\n */\n\nconst fs = require('fs');\n\nfunction checkInclusion(s1: str, s2: str) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 40. Permutation in String\n// Difficulty: MEDIUM | Topic: Fixed-Size Frequency Matching\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 40. Permutation in String\n// Difficulty: MEDIUM | Topic: Fixed-Size Frequency Matching\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_041",
    "number": 41,
    "title": "Find All Anagrams in a String",
    "slug": "find-all-anagrams-in-a-string",
    "topic_id": "topic_sliding_window",
    "subtopic": "Sliding Window Multi-Match",
    "difficulty": "MEDIUM",
    "roadmap_stage": "Core Patterns",
    "companies": [
      "Amazon",
      "Meta",
      "Google"
    ],
    "tags": [
      "sliding window"
    ],
    "description": "Given two strings s and p, return an array of all the start indices of p's anagrams in s. You may return the answer in any order.\n\nAn Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.",
    "input_format": "Line 1: string s\nLine 2: string p",
    "output_format": "Space-separated starting indices.",
    "constraints": [
      "1 <= s.length, p.length <= 3 * 10^4",
      "s and p consist of lowercase English letters."
    ],
    "examples": [
      {
        "input": "cbaebabacd\nabc",
        "output": "0 6",
        "explanation": "The substring with start index = 0 is \"cba\", which is an anagram of \"abc\". The substring with start index = 6 is \"bac\", which is an anagram of \"abc\"."
      },
      {
        "input": "abab\nab",
        "output": "0 1 2",
        "explanation": "Substrings at indices 0, 1, 2 are anagrams."
      }
    ],
    "public_test_cases": [
      {
        "input": "cbaebabacd\nabc",
        "output": "0 6"
      },
      {
        "input": "abab\nab",
        "output": "0 1 2"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "a\na",
        "output": "0"
      },
      {
        "input": "aaaaaaaaaa\naaaaa",
        "output": "0 1 2 3 4 5"
      }
    ],
    "hints": [
      "Fixed window of length len(p).",
      "Track character counts of p and current window in s.",
      "Record starting index whenever window character counts match p."
    ],
    "optimal_complexity": {
      "time": "O(N)",
      "space": "O(1)"
    },
    "solution_explanation": "Fixed window of length len(p) sliding over s. Update rolling character frequency counts and record start index whenever counts match.",
    "starter_code": {
      "python": "# 41. Find All Anagrams in a String\n# Difficulty: MEDIUM | Topic: Sliding Window Multi-Match\n# Time Complexity Target: O(N) | Space Complexity Target: O(1)\n\nimport sys\nimport json\n\ndef findAnagrams(s: str, p: str) -> list[int]:\n    \"\"\"\n    Given two strings s and p, return an array of all the start indices of p's anagrams in s.\n    \"\"\"\n    # TODO: Implement your solution here\n    if len(p) > len(s): return []\n    p_count = [0] * 26\n    s_count = [0] * 26\n    for i in range(len(p)):\n        p_count[ord(p[i]) - 97] += 1\n        s_count[ord(s[i]) - 97] += 1\n    res = [0] if p_count == s_count else []\n    for i in range(len(p), len(s)):\n        s_count[ord(s[i]) - 97] += 1\n        s_count[ord(s[i - len(p)]) - 97] -= 1\n        if s_count == p_count:\n            res.append(i - len(p) + 1)\n    return res\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(findAnagrams(...))\n",
      "javascript": "/**\n * 41. Find All Anagrams in a String\n * Difficulty: MEDIUM | Topic: Sliding Window Multi-Match\n * Optimal: O(N) time, O(1) space\n */\n\nconst fs = require('fs');\n\nfunction findAnagrams(s: str, p: str) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 41. Find All Anagrams in a String\n// Difficulty: MEDIUM | Topic: Sliding Window Multi-Match\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 41. Find All Anagrams in a String\n// Difficulty: MEDIUM | Topic: Sliding Window Multi-Match\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_042",
    "number": 42,
    "title": "Longest Repeating Character Replacement",
    "slug": "longest-repeating-character-replacement",
    "topic_id": "topic_sliding_window",
    "subtopic": "Frequency Cap Window",
    "difficulty": "HARD",
    "roadmap_stage": "Placement Revision",
    "companies": [
      "Google",
      "Amazon",
      "Meta"
    ],
    "tags": [
      "sliding window"
    ],
    "description": "You are given a string s and an integer k. You can choose any character of the string and change it to any other uppercase English character. You can perform this operation at most k times.\n\nReturn the length of the longest substring containing the same letter you can get after performing the above operations.",
    "input_format": "Line 1: string s\nLine 2: integer k",
    "output_format": "Single integer representing maximum substring length.",
    "constraints": [
      "1 <= s.length <= 10^5",
      "s consists of only uppercase English letters.",
      "0 <= k <= s.length"
    ],
    "examples": [
      {
        "input": "ABAB\n2",
        "output": "4",
        "explanation": "Replace the two 'A's with two 'B's or vice versa."
      },
      {
        "input": "AABABBA\n1",
        "output": "4",
        "explanation": "Replace the one 'A' in the middle with 'B' and form \"AABBBBA\". The substring \"BBBB\" has length 4."
      }
    ],
    "public_test_cases": [
      {
        "input": "ABAB\n2",
        "output": "4"
      },
      {
        "input": "AABABBA\n1",
        "output": "4"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "AAAA\n2",
        "output": "4"
      },
      {
        "input": "ABBB\n2",
        "output": "4"
      }
    ],
    "hints": [
      "Window length is (r - l + 1).",
      "Number of characters to replace is (window length - max_frequency_of_single_char).",
      "If (window length - max_frequency) > k, shrink window from left."
    ],
    "optimal_complexity": {
      "time": "O(N)",
      "space": "O(1)"
    },
    "solution_explanation": "Dynamic sliding window where valid condition is (window_length - max_char_frequency <= k). Expand right, and shrink left when replacement budget is exceeded.",
    "starter_code": {
      "python": "# 42. Longest Repeating Character Replacement\n# Difficulty: HARD | Topic: Frequency Cap Window\n# Time Complexity Target: O(N) | Space Complexity Target: O(1)\n\nimport sys\nimport json\n\ndef characterReplacement(s: str, k: int) -> int:\n    \"\"\"\n    You are given a string s and an integer k.\n    \"\"\"\n    # TODO: Implement your solution here\n    counts = {}\n    max_f = 0\n    l = 0\n    res = 0\n    for r in range(len(s)):\n        counts[s[r]] = counts.get(s[r], 0) + 1\n        max_f = max(max_f, counts[s[r]])\n        while (r - l + 1) - max_f > k:\n            counts[s[l]] -= 1\n            l += 1\n        res = max(res, r - l + 1)\n    return res\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(characterReplacement(...))\n",
      "javascript": "/**\n * 42. Longest Repeating Character Replacement\n * Difficulty: HARD | Topic: Frequency Cap Window\n * Optimal: O(N) time, O(1) space\n */\n\nconst fs = require('fs');\n\nfunction characterReplacement(s: str, k: int) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 42. Longest Repeating Character Replacement\n// Difficulty: HARD | Topic: Frequency Cap Window\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 42. Longest Repeating Character Replacement\n// Difficulty: HARD | Topic: Frequency Cap Window\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_043",
    "number": 43,
    "title": "Sliding Window Maximum",
    "slug": "sliding-window-maximum",
    "topic_id": "topic_sliding_window",
    "subtopic": "Monotonic Deque",
    "difficulty": "HARD",
    "roadmap_stage": "Placement Revision",
    "companies": [
      "Amazon",
      "Google",
      "Meta",
      "Microsoft"
    ],
    "tags": [
      "sliding window"
    ],
    "description": "You are given an array of integers nums, there is a sliding window of size k which is moving from the very left of the array to the very right. You can only see the k numbers in the window. Each time the sliding window moves right by one position.\n\nReturn the max sliding window.",
    "input_format": "Line 1: N space-separated integers\nLine 2: integer k",
    "output_format": "Space-separated integers representing maximum in each window.",
    "constraints": [
      "1 <= nums.length <= 10^5",
      "-10^4 <= nums[i] <= 10^4",
      "1 <= k <= nums.length"
    ],
    "examples": [
      {
        "input": "1 3 -1 -3 5 3 6 7\n3",
        "output": "3 3 5 5 6 7",
        "explanation": "Window positions: [1, 3, -1]->3, [3, -1, -3]->3, [-1, -3, 5]->5, [-3, 5, 3]->5, [5, 3, 6]->6, [3, 6, 7]->7."
      },
      {
        "input": "1\n1",
        "output": "1"
      }
    ],
    "public_test_cases": [
      {
        "input": "1 3 -1 -3 5 3 6 7\n3",
        "output": "3 3 5 5 6 7"
      },
      {
        "input": "1\n1",
        "output": "1"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "9 11\n2",
        "output": "11"
      },
      {
        "input": "4 -2\n2",
        "output": "4"
      }
    ],
    "hints": [
      "A heap gives O(N log k). Can you do O(N) using a Monotonic Deque?",
      "Store indices in the deque in decreasing order of their corresponding values.",
      "Remove elements outside current window (index <= i - k) from front, and remove smaller elements from back before inserting nums[i]."
    ],
    "optimal_complexity": {
      "time": "O(N)",
      "space": "O(K)"
    },
    "solution_explanation": "Monotonic deque maintains indices in descending order of value. Head of deque is always the maximum for current window of size k. Operates in linear O(N) time.",
    "starter_code": {
      "python": "# 43. Sliding Window Maximum\n# Difficulty: HARD | Topic: Monotonic Deque\n# Time Complexity Target: O(N) | Space Complexity Target: O(K)\n\nimport sys\nimport json\n\ndef maxSlidingWindow(nums: list[int], k: int) -> list[int]:\n    \"\"\"\n    You are given an array of integers nums, there is a sliding window of size k which is moving from the very left of the array to the very right.\n    \"\"\"\n    # TODO: Implement your solution here\n    from collections import deque\n    q = deque()\n    res = []\n    for i, x in enumerate(nums):\n        if q and q[0] <= i - k:\n            q.popleft()\n        while q and nums[q[-1]] <= x:\n            q.pop()\n        q.append(i)\n        if i >= k - 1:\n            res.append(nums[q[0]])\n    return res\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(maxSlidingWindow(...))\n",
      "javascript": "/**\n * 43. Sliding Window Maximum\n * Difficulty: HARD | Topic: Monotonic Deque\n * Optimal: O(N) time, O(K) space\n */\n\nconst fs = require('fs');\n\nfunction maxSlidingWindow(nums: list[int], k: int) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 43. Sliding Window Maximum\n// Difficulty: HARD | Topic: Monotonic Deque\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 43. Sliding Window Maximum\n// Difficulty: HARD | Topic: Monotonic Deque\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_prob_binary_search",
    "number": 44,
    "title": "Classic Binary Search",
    "slug": "classic-binary-search",
    "topic_id": "topic_binary_search",
    "subtopic": "Logarithmic Halving",
    "difficulty": "EASY",
    "roadmap_stage": "Beginner Foundations",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Apple"
    ],
    "tags": [
      "binary search"
    ],
    "description": "Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums. If target exists, then return its index. Otherwise, return -1.\n\nYou must write an algorithm with O(log n) runtime complexity.",
    "input_format": "Line 1: N space-separated integers in ascending order\nLine 2: target integer",
    "output_format": "0-based index of target, or -1.",
    "constraints": [
      "1 <= nums.length <= 10^4",
      "-10^4 < nums[i], target < 10^4",
      "All the integers in nums are unique.",
      "nums is sorted in ascending order."
    ],
    "examples": [
      {
        "input": "-1 0 3 5 9 12\n9",
        "output": "4",
        "explanation": "9 exists in nums and its index is 4."
      },
      {
        "input": "-1 0 3 5 9 12\n2",
        "output": "-1",
        "explanation": "2 does not exist in nums so return -1."
      }
    ],
    "public_test_cases": [
      {
        "input": "-1 0 3 5 9 12\n9",
        "output": "4"
      },
      {
        "input": "-1 0 3 5 9 12\n2",
        "output": "-1"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "5\n5",
        "output": "0"
      },
      {
        "input": "1 3 5 7 9\n1",
        "output": "0"
      },
      {
        "input": "1 3 5 7 9\n10",
        "output": "-1"
      }
    ],
    "hints": [
      "Maintain search boundaries left and right.",
      "Compute mid = left + (right - left) // 2.",
      "If nums[mid] == target return mid. If nums[mid] < target, left = mid + 1, else right = mid - 1."
    ],
    "optimal_complexity": {
      "time": "O(log N)",
      "space": "O(1)"
    },
    "solution_explanation": "Standard binary search halving search space at each iteration. O(log N) time, O(1) space.",
    "starter_code": {
      "python": "# 44. Classic Binary Search\n# Difficulty: EASY | Topic: Logarithmic Halving\n# Time Complexity Target: O(log N) | Space Complexity Target: O(1)\n\nimport sys\nimport json\n\ndef binarySearch(nums: list[int], target: int) -> int:\n    \"\"\"\n    Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums.\n    \"\"\"\n    # TODO: Implement your solution here\n    l, r = 0, len(nums) - 1\n    while l <= r:\n        m = (l + r) // 2\n        if nums[m] == target: return m\n        elif nums[m] < target: l = m + 1\n        else: r = m - 1\n    return -1\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(binarySearch(...))\n",
      "javascript": "/**\n * 44. Classic Binary Search\n * Difficulty: EASY | Topic: Logarithmic Halving\n * Optimal: O(log N) time, O(1) space\n */\n\nconst fs = require('fs');\n\nfunction binarySearch(nums: list[int], target: int) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 44. Classic Binary Search\n// Difficulty: EASY | Topic: Logarithmic Halving\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 44. Classic Binary Search\n// Difficulty: EASY | Topic: Logarithmic Halving\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_045",
    "number": 45,
    "title": "Search Insert Position",
    "slug": "search-insert-position",
    "topic_id": "topic_binary_search",
    "subtopic": "Lower Bound Binary Search",
    "difficulty": "EASY",
    "roadmap_stage": "Beginner Foundations",
    "companies": [
      "Amazon",
      "Google",
      "Microsoft"
    ],
    "tags": [
      "binary search"
    ],
    "description": "Given a sorted array of distinct integers and a target value, return the index if the target is found. If not, return the index where it would be if it were inserted in order.\n\nYou must write an algorithm with O(log n) runtime complexity.",
    "input_format": "Line 1: N space-separated sorted integers\nLine 2: target integer",
    "output_format": "Integer insertion index.",
    "constraints": [
      "1 <= nums.length <= 10^4",
      "-10^4 <= nums[i] <= 10^4",
      "nums contains distinct values sorted in ascending order."
    ],
    "examples": [
      {
        "input": "1 3 5 6\n5",
        "output": "2"
      },
      {
        "input": "1 3 5 6\n2",
        "output": "1"
      },
      {
        "input": "1 3 5 6\n7",
        "output": "4"
      }
    ],
    "public_test_cases": [
      {
        "input": "1 3 5 6\n5",
        "output": "2"
      },
      {
        "input": "1 3 5 6\n2",
        "output": "1"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "1 3 5 6\n7",
        "output": "4"
      },
      {
        "input": "1 3 5 6\n0",
        "output": "0"
      }
    ],
    "hints": [
      "Find the first element that is greater than or equal to target.",
      "If target is not found, the `left` pointer will end up pointing precisely to the insertion point.",
      "Return `left` after the loop terminates."
    ],
    "optimal_complexity": {
      "time": "O(log N)",
      "space": "O(1)"
    },
    "solution_explanation": "Binary search lower bound: left pointer advances whenever nums[mid] < target, terminating exactly at the insertion point.",
    "starter_code": {
      "python": "# 45. Search Insert Position\n# Difficulty: EASY | Topic: Lower Bound Binary Search\n# Time Complexity Target: O(log N) | Space Complexity Target: O(1)\n\nimport sys\nimport json\n\ndef searchInsert(nums: list[int], target: int) -> int:\n    \"\"\"\n    Given a sorted array of distinct integers and a target value, return the index if the target is found.\n    \"\"\"\n    # TODO: Implement your solution here\n    l, r = 0, len(nums) - 1\n    while l <= r:\n        m = (l + r) // 2\n        if nums[m] == target: return m\n        elif nums[m] < target: l = m + 1\n        else: r = m - 1\n    return l\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(searchInsert(...))\n",
      "javascript": "/**\n * 45. Search Insert Position\n * Difficulty: EASY | Topic: Lower Bound Binary Search\n * Optimal: O(log N) time, O(1) space\n */\n\nconst fs = require('fs');\n\nfunction searchInsert(nums: list[int], target: int) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 45. Search Insert Position\n// Difficulty: EASY | Topic: Lower Bound Binary Search\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 45. Search Insert Position\n// Difficulty: EASY | Topic: Lower Bound Binary Search\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_046",
    "number": 46,
    "title": "First and Last Position of an Element in Sorted Array",
    "slug": "first-and-last-position-of-an-element-in-sorted-array",
    "topic_id": "topic_binary_search",
    "subtopic": "Dual Bound Binary Search",
    "difficulty": "MEDIUM",
    "roadmap_stage": "Core Patterns",
    "companies": [
      "Google",
      "Facebook",
      "Amazon",
      "Microsoft"
    ],
    "tags": [
      "binary search"
    ],
    "description": "Given an array of integers nums sorted in non-decreasing order, find the starting and ending position of a given target value.\n\nIf target is not found in the array, return [-1, -1].\n\nYou must write an algorithm with O(log n) runtime complexity.",
    "input_format": "Line 1: N space-separated sorted integers\nLine 2: target integer",
    "output_format": "Two space-separated integers representing first and last index.",
    "constraints": [
      "0 <= nums.length <= 10^5",
      "-10^9 <= nums[i] <= 10^9",
      "nums is a non-decreasing array."
    ],
    "examples": [
      {
        "input": "5 7 7 8 8 10\n8",
        "output": "3 4",
        "explanation": "8 starts at index 3 and ends at index 4."
      },
      {
        "input": "5 7 7 8 8 10\n6",
        "output": "-1 -1"
      },
      {
        "input": "\n0",
        "output": "-1 -1"
      }
    ],
    "public_test_cases": [
      {
        "input": "5 7 7 8 8 10\n8",
        "output": "3 4"
      },
      {
        "input": "5 7 7 8 8 10\n6",
        "output": "-1 -1"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "1\n1",
        "output": "0 0"
      },
      {
        "input": "2 2\n2",
        "output": "0 1"
      }
    ],
    "hints": [
      "Run binary search twice: once to find the leftmost index, and once for the rightmost index.",
      "Left search: when nums[mid] == target, continue searching in left half (right = mid - 1).",
      "Right search: when nums[mid] == target, continue searching in right half (left = mid + 1)."
    ],
    "optimal_complexity": {
      "time": "O(log N)",
      "space": "O(1)"
    },
    "solution_explanation": "Two binary search passes: left search caches match and pushes right boundary left; right search caches match and pushes left boundary right.",
    "starter_code": {
      "python": "# 46. First and Last Position of an Element in Sorted Array\n# Difficulty: MEDIUM | Topic: Dual Bound Binary Search\n# Time Complexity Target: O(log N) | Space Complexity Target: O(1)\n\nimport sys\nimport json\n\ndef searchRange(nums: list[int], target: int) -> list[int]:\n    \"\"\"\n    Given an array of integers nums sorted in non-decreasing order, find the starting and ending position of a given target value.\n    \"\"\"\n    # TODO: Implement your solution here\n    def findBound(is_first):\n        l, r, ans = 0, len(nums) - 1, -1\n        while l <= r:\n            m = (l + r) // 2\n            if nums[m] == target:\n                ans = m\n                if is_first: r = m - 1\n                else: l = m + 1\n            elif nums[m] < target: l = m + 1\n            else: r = m - 1\n        return ans\n    return [findBound(True), findBound(False)]\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(searchRange(...))\n",
      "javascript": "/**\n * 46. First and Last Position of an Element in Sorted Array\n * Difficulty: MEDIUM | Topic: Dual Bound Binary Search\n * Optimal: O(log N) time, O(1) space\n */\n\nconst fs = require('fs');\n\nfunction searchRange(nums: list[int], target: int) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 46. First and Last Position of an Element in Sorted Array\n// Difficulty: MEDIUM | Topic: Dual Bound Binary Search\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 46. First and Last Position of an Element in Sorted Array\n// Difficulty: MEDIUM | Topic: Dual Bound Binary Search\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_047",
    "number": 47,
    "title": "Search in Rotated Sorted Array",
    "slug": "search-in-rotated-sorted-array",
    "topic_id": "topic_binary_search",
    "subtopic": "Rotated Array Invariant",
    "difficulty": "MEDIUM",
    "roadmap_stage": "Core Patterns",
    "companies": [
      "Amazon",
      "Meta",
      "Google",
      "Apple",
      "Microsoft"
    ],
    "tags": [
      "binary search"
    ],
    "description": "There is an integer array nums sorted in ascending order (with distinct values). Prior to being passed to your function, nums is possibly rotated at an unknown pivot index.\n\nGiven the array nums after the possible rotation and an integer target, return the index of target if it is in nums, or -1 if it is not in nums.\n\nYou must write an algorithm with O(log n) runtime complexity.",
    "input_format": "Line 1: N space-separated rotated sorted integers\nLine 2: target integer",
    "output_format": "0-based index of target, or -1.",
    "constraints": [
      "1 <= nums.length <= 5000",
      "-10^4 <= nums[i] <= 10^4",
      "All values of nums are unique."
    ],
    "examples": [
      {
        "input": "4 5 6 7 0 1 2\n0",
        "output": "4",
        "explanation": "0 is found at index 4."
      },
      {
        "input": "4 5 6 7 0 1 2\n3",
        "output": "-1"
      },
      {
        "input": "1\n0",
        "output": "-1"
      }
    ],
    "public_test_cases": [
      {
        "input": "4 5 6 7 0 1 2\n0",
        "output": "4"
      },
      {
        "input": "4 5 6 7 0 1 2\n3",
        "output": "-1"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "1\n1",
        "output": "0"
      },
      {
        "input": "3 1\n1",
        "output": "1"
      }
    ],
    "hints": [
      "At least one half of the array (left or right of mid) is always strictly sorted.",
      "Determine which half is normally sorted: if nums[left] <= nums[mid], left half is sorted.",
      "Check if target lies inside the boundaries of the sorted half to decide which direction to branch."
    ],
    "optimal_complexity": {
      "time": "O(log N)",
      "space": "O(1)"
    },
    "solution_explanation": "Identify whether left or right half is monotonically sorted. If target falls in sorted range, recurse there; otherwise search the other half.",
    "starter_code": {
      "python": "# 47. Search in Rotated Sorted Array\n# Difficulty: MEDIUM | Topic: Rotated Array Invariant\n# Time Complexity Target: O(log N) | Space Complexity Target: O(1)\n\nimport sys\nimport json\n\ndef searchRotated(nums: list[int], target: int) -> int:\n    \"\"\"\n    There is an integer array nums sorted in ascending order (with distinct values).\n    \"\"\"\n    # TODO: Implement your solution here\n    l, r = 0, len(nums) - 1\n    while l <= r:\n        m = (l + r) // 2\n        if nums[m] == target: return m\n        if nums[l] <= nums[m]:\n            if nums[l] <= target < nums[m]: r = m - 1\n            else: l = m + 1\n        else:\n            if nums[m] < target <= nums[r]: l = m + 1\n            else: r = m - 1\n    return -1\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(searchRotated(...))\n",
      "javascript": "/**\n * 47. Search in Rotated Sorted Array\n * Difficulty: MEDIUM | Topic: Rotated Array Invariant\n * Optimal: O(log N) time, O(1) space\n */\n\nconst fs = require('fs');\n\nfunction searchRotated(nums: list[int], target: int) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 47. Search in Rotated Sorted Array\n// Difficulty: MEDIUM | Topic: Rotated Array Invariant\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 47. Search in Rotated Sorted Array\n// Difficulty: MEDIUM | Topic: Rotated Array Invariant\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_048",
    "number": 48,
    "title": "Find Minimum in Rotated Sorted Array",
    "slug": "find-minimum-in-rotated-sorted-array",
    "topic_id": "topic_binary_search",
    "subtopic": "Inflection Point Detection",
    "difficulty": "MEDIUM",
    "roadmap_stage": "Core Patterns",
    "companies": [
      "Amazon",
      "Microsoft",
      "Meta"
    ],
    "tags": [
      "binary search"
    ],
    "description": "Suppose an array of length n sorted in ascending order is rotated between 1 and n times.\n\nGiven the sorted rotated array nums of unique elements, return the minimum element of this array.\n\nYou must write an algorithm that runs in O(log n) time.",
    "input_format": "A single line of space-separated integers representing rotated array.",
    "output_format": "The minimum integer value.",
    "constraints": [
      "n == nums.length",
      "1 <= n <= 5000",
      "-5000 <= nums[i] <= 5000",
      "All the integers of nums are unique."
    ],
    "examples": [
      {
        "input": "3 4 5 1 2",
        "output": "1",
        "explanation": "The original array was [1,2,3,4,5] rotated 3 times."
      },
      {
        "input": "4 5 6 7 0 1 2",
        "output": "0"
      }
    ],
    "public_test_cases": [
      {
        "input": "3 4 5 1 2",
        "output": "1"
      },
      {
        "input": "4 5 6 7 0 1 2",
        "output": "0"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "11 13 15 17",
        "output": "11"
      },
      {
        "input": "2 1",
        "output": "1"
      }
    ],
    "hints": [
      "Compare nums[mid] with nums[right].",
      "If nums[mid] > nums[right], the minimum MUST lie in the right half (left = mid + 1).",
      "If nums[mid] < nums[right], the minimum is in the left half including mid (right = mid)."
    ],
    "optimal_complexity": {
      "time": "O(log N)",
      "space": "O(1)"
    },
    "solution_explanation": "Compare mid with right boundary. If nums[mid] > nums[right], the pivot/inflection point lies to the right; else it lies at or to the left of mid.",
    "starter_code": {
      "python": "# 48. Find Minimum in Rotated Sorted Array\n# Difficulty: MEDIUM | Topic: Inflection Point Detection\n# Time Complexity Target: O(log N) | Space Complexity Target: O(1)\n\nimport sys\nimport json\n\ndef findMinRotated(nums: list[int]) -> int:\n    \"\"\"\n    Suppose an array of length n sorted in ascending order is rotated between 1 and n times.\n    \"\"\"\n    # TODO: Implement your solution here\n    l, r = 0, len(nums) - 1\n    while l < r:\n        m = (l + r) // 2\n        if nums[m] > nums[r]: l = m + 1\n        else: r = m\n    return nums[l]\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(findMinRotated(...))\n",
      "javascript": "/**\n * 48. Find Minimum in Rotated Sorted Array\n * Difficulty: MEDIUM | Topic: Inflection Point Detection\n * Optimal: O(log N) time, O(1) space\n */\n\nconst fs = require('fs');\n\nfunction findMinRotated(nums: list[int]) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 48. Find Minimum in Rotated Sorted Array\n// Difficulty: MEDIUM | Topic: Inflection Point Detection\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 48. Find Minimum in Rotated Sorted Array\n// Difficulty: MEDIUM | Topic: Inflection Point Detection\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_049",
    "number": 49,
    "title": "Find Peak Element",
    "slug": "find-peak-element",
    "topic_id": "topic_binary_search",
    "subtopic": "Local Gradient Ascent",
    "difficulty": "MEDIUM",
    "roadmap_stage": "Core Patterns",
    "companies": [
      "Meta",
      "Google",
      "Amazon"
    ],
    "tags": [
      "binary search"
    ],
    "description": "A peak element is an element that is strictly greater than its neighbors.\n\nGiven a 0-indexed integer array nums, find a peak element, and return its index. If the array contains multiple peaks, return the index to any of the peaks.\n\nYou may imagine that nums[-1] = nums[n] = -\u221e.\n\nYou must write an algorithm that runs in O(log n) time.",
    "input_format": "A single line of space-separated integers representing nums.",
    "output_format": "0-based index of any peak element.",
    "constraints": [
      "1 <= nums.length <= 1000",
      "-2^31 <= nums[i] <= 2^31 - 1",
      "nums[i] != nums[i + 1] for all valid i."
    ],
    "examples": [
      {
        "input": "1 2 3 1",
        "output": "2",
        "explanation": "3 is a peak element and your function should return the index number 2."
      },
      {
        "input": "1 2 1 3 5 6 4",
        "output": "5",
        "explanation": "Index 5 (value 6) is a peak."
      }
    ],
    "public_test_cases": [
      {
        "input": "1 2 3 1",
        "output": "2"
      },
      {
        "input": "1 2 1 3 5 6 4",
        "output": "5"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "1",
        "output": "0"
      },
      {
        "input": "1 2",
        "output": "1"
      }
    ],
    "hints": [
      "Compare nums[mid] with nums[mid + 1].",
      "If nums[mid] < nums[mid + 1], you are on an ascending slope, so a peak is guaranteed to exist on the right.",
      "Otherwise, you are on a descending slope, so a peak is on the left (including mid)."
    ],
    "optimal_complexity": {
      "time": "O(log N)",
      "space": "O(1)"
    },
    "solution_explanation": "Binary search gradient ascent: move toward the higher neighbor because an uphill climb with -inf boundaries is guaranteed to terminate at a local peak.",
    "starter_code": {
      "python": "# 49. Find Peak Element\n# Difficulty: MEDIUM | Topic: Local Gradient Ascent\n# Time Complexity Target: O(log N) | Space Complexity Target: O(1)\n\nimport sys\nimport json\n\ndef findPeakElement(nums: list[int]) -> int:\n    \"\"\"\n    A peak element is an element that is strictly greater than its neighbors.\n    \"\"\"\n    # TODO: Implement your solution here\n    l, r = 0, len(nums) - 1\n    while l < r:\n        m = (l + r) // 2\n        if nums[m] < nums[m + 1]: l = m + 1\n        else: r = m\n    return l\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(findPeakElement(...))\n",
      "javascript": "/**\n * 49. Find Peak Element\n * Difficulty: MEDIUM | Topic: Local Gradient Ascent\n * Optimal: O(log N) time, O(1) space\n */\n\nconst fs = require('fs');\n\nfunction findPeakElement(nums: list[int]) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 49. Find Peak Element\n// Difficulty: MEDIUM | Topic: Local Gradient Ascent\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 49. Find Peak Element\n// Difficulty: MEDIUM | Topic: Local Gradient Ascent\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_050",
    "number": 50,
    "title": "Search a 2D Matrix",
    "slug": "search-a-2d-matrix",
    "topic_id": "topic_binary_search",
    "subtopic": "Flattened Matrix Binary Search",
    "difficulty": "HARD",
    "roadmap_stage": "Placement Revision",
    "companies": [
      "Amazon",
      "Microsoft",
      "Meta"
    ],
    "tags": [
      "binary search"
    ],
    "description": "You are given an m x n integer matrix matrix with the following two properties:\n- Each row is sorted in non-decreasing order.\n- The first integer of each row is greater than the last integer of the previous row.\n\nGiven an integer target, return true if target is in matrix or false otherwise.\n\nYou must write a solution in O(log(m * n)) time complexity.",
    "input_format": "Line 1: m n (dimensions)\nNext m lines: n space-separated integers\nLast line: target integer",
    "output_format": "true or false",
    "constraints": [
      "m == matrix.length",
      "n == matrix[i].length",
      "1 <= m, n <= 100",
      "-10^4 <= matrix[i][j], target <= 10^4"
    ],
    "examples": [
      {
        "input": "3 4\n1 3 5 7\n10 11 16 20\n23 30 34 60\n3",
        "output": "true",
        "explanation": "3 exists in row 0."
      },
      {
        "input": "3 4\n1 3 5 7\n10 11 16 20\n23 30 34 60\n13",
        "output": "false"
      }
    ],
    "public_test_cases": [
      {
        "input": "3 4\n1 3 5 7\n10 11 16 20\n23 30 34 60\n3",
        "output": "true"
      },
      {
        "input": "3 4\n1 3 5 7\n10 11 16 20\n23 30 34 60\n13",
        "output": "false"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "1 1\n1\n1",
        "output": "true"
      },
      {
        "input": "1 2\n1 3\n3",
        "output": "true"
      }
    ],
    "hints": [
      "Treat the m x n matrix as a single 1D sorted array of length m * n.",
      "Map 1D index `idx` to 2D coordinates: row = idx // n, col = idx % n.",
      "Perform standard binary search over the range [0, m * n - 1]."
    ],
    "optimal_complexity": {
      "time": "O(log(M * N))",
      "space": "O(1)"
    },
    "solution_explanation": "Virtual 1D array binary search: map 1D index `mid` to 2D matrix cell (mid // n, mid % n). Full O(log(M * N)) logarithmic performance.",
    "starter_code": {
      "python": "# 50. Search a 2D Matrix\n# Difficulty: HARD | Topic: Flattened Matrix Binary Search\n# Time Complexity Target: O(log(M * N)) | Space Complexity Target: O(1)\n\nimport sys\nimport json\n\ndef searchMatrix(matrix: list[list[int]], target: int) -> bool:\n    \"\"\"\n    You are given an m x n integer matrix matrix with the following two properties:\n- Each row is sorted in non-decreasing order.\n    \"\"\"\n    # TODO: Implement your solution here\n    m, n = len(matrix), len(matrix[0])\n    l, r = 0, m * n - 1\n    while l <= r:\n        mid = (l + r) // 2\n        val = matrix[mid // n][mid % n]\n        if val == target: return True\n        elif val < target: l = mid + 1\n        else: r = mid - 1\n    return False\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(searchMatrix(...))\n",
      "javascript": "/**\n * 50. Search a 2D Matrix\n * Difficulty: HARD | Topic: Flattened Matrix Binary Search\n * Optimal: O(log(M * N)) time, O(1) space\n */\n\nconst fs = require('fs');\n\nfunction searchMatrix(matrix: list[list[int]], target: int) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 50. Search a 2D Matrix\n// Difficulty: HARD | Topic: Flattened Matrix Binary Search\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 50. Search a 2D Matrix\n// Difficulty: HARD | Topic: Flattened Matrix Binary Search\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_051",
    "number": 51,
    "title": "Median of Two Sorted Arrays",
    "slug": "median-of-two-sorted-arrays",
    "topic_id": "topic_binary_search",
    "subtopic": "Dual Array Partition Binary Search",
    "difficulty": "HARD",
    "roadmap_stage": "Placement Revision",
    "companies": [
      "Google",
      "Amazon",
      "Apple",
      "Microsoft"
    ],
    "tags": [
      "binary search"
    ],
    "description": "Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.\n\nThe overall run time complexity should be O(log (m+n)).",
    "input_format": "Line 1: space-separated integers nums1\nLine 2: space-separated integers nums2",
    "output_format": "Median formatted to 5 decimal places.",
    "constraints": [
      "nums1.length == m",
      "nums2.length == n",
      "0 <= m, n <= 1000",
      "1 <= m + n <= 2000",
      "-10^6 <= nums1[i], nums2[i] <= 10^6"
    ],
    "examples": [
      {
        "input": "1 3\n2",
        "output": "2.00000",
        "explanation": "merged array = [1,2,3] and median is 2."
      },
      {
        "input": "1 2\n3 4",
        "output": "2.50000",
        "explanation": "merged array = [1,2,3,4] and median is (2 + 3) / 2 = 2.5."
      }
    ],
    "public_test_cases": [
      {
        "input": "1 3\n2",
        "output": "2.00000"
      },
      {
        "input": "1 2\n3 4",
        "output": "2.50000"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "0 0\n0 0",
        "output": "0.00000"
      },
      {
        "input": "\n1",
        "output": "1.00000"
      }
    ],
    "hints": [
      "Always perform binary search on the SHORTER of the two arrays to ensure O(log(min(m, n))).",
      "Partition both arrays such that left halves contain exactly (m + n + 1) // 2 elements.",
      "Check boundary conditions: max_left_A <= min_right_B and max_left_B <= min_right_A."
    ],
    "optimal_complexity": {
      "time": "O(log(min(M, N)))",
      "space": "O(1)"
    },
    "solution_explanation": "Binary search on the smaller array finds the partition where all left elements are <= all right elements across both arrays, yielding the median in logarithmic time.",
    "starter_code": {
      "python": "# 51. Median of Two Sorted Arrays\n# Difficulty: HARD | Topic: Dual Array Partition Binary Search\n# Time Complexity Target: O(log(min(M, N))) | Space Complexity Target: O(1)\n\nimport sys\nimport json\n\ndef findMedianSortedArrays(nums1: list[int], nums2: list[int]) -> float:\n    \"\"\"\n    Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.\n    \"\"\"\n    # TODO: Implement your solution here\n    A, B = nums1, nums2\n    if len(A) > len(B): A, B = B, A\n    m, n = len(A), len(B)\n    half = (m + n + 1) // 2\n    l, r = 0, m\n    while l <= r:\n        i = (l + r) // 2\n        j = half - i\n        A_left = A[i - 1] if i > 0 else float('-inf')\n        A_right = A[i] if i < m else float('inf')\n        B_left = B[j - 1] if j > 0 else float('-inf')\n        B_right = B[j] if j < n else float('inf')\n        if A_left <= B_right and B_left <= A_right:\n            if (m + n) % 2 == 1:\n                return float(max(A_left, B_left))\n            return (max(A_left, B_left) + min(A_right, B_right)) / 2.0\n        elif A_left > B_right:\n            r = i - 1\n        else:\n            l = i + 1\n    return 0.0\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(findMedianSortedArrays(...))\n",
      "javascript": "/**\n * 51. Median of Two Sorted Arrays\n * Difficulty: HARD | Topic: Dual Array Partition Binary Search\n * Optimal: O(log(min(M, N))) time, O(1) space\n */\n\nconst fs = require('fs');\n\nfunction findMedianSortedArrays(nums1: list[int], nums2: list[int]) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 51. Median of Two Sorted Arrays\n// Difficulty: HARD | Topic: Dual Array Partition Binary Search\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 51. Median of Two Sorted Arrays\n// Difficulty: HARD | Topic: Dual Array Partition Binary Search\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_052",
    "number": 52,
    "title": "Meeting Rooms",
    "slug": "meeting-rooms",
    "topic_id": "topic_sorting_searching",
    "subtopic": "Interval Conflict Detection",
    "difficulty": "EASY",
    "roadmap_stage": "Beginner Foundations",
    "companies": [
      "Amazon",
      "Google",
      "Meta"
    ],
    "tags": [
      "sorting searching"
    ],
    "description": "Given an array of meeting time intervals where intervals[i] = [starti, endi], determine if a person could attend all meetings without overlapping.",
    "input_format": "Line 1: N (number of meetings)\nNext N lines: start end",
    "output_format": "true or false",
    "constraints": [
      "0 <= intervals.length <= 10^4",
      "intervals[i].length == 2",
      "0 <= starti < endi <= 10^6"
    ],
    "examples": [
      {
        "input": "3\n0 30\n5 10\n15 20",
        "output": "false",
        "explanation": "[0,30] conflicts with [5,10]."
      },
      {
        "input": "2\n7 10\n2 4",
        "output": "true",
        "explanation": "Meetings do not overlap."
      }
    ],
    "public_test_cases": [
      {
        "input": "3\n0 30\n5 10\n15 20",
        "output": "false"
      },
      {
        "input": "2\n7 10\n2 4",
        "output": "true"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "1\n1 5",
        "output": "true"
      },
      {
        "input": "2\n1 5\n5 10",
        "output": "true"
      }
    ],
    "hints": [
      "Sort intervals by start time.",
      "Compare adjacent intervals: if intervals[i][0] < intervals[i - 1][1], there is an overlap.",
      "If no overlap is found across all pairs, return true."
    ],
    "optimal_complexity": {
      "time": "O(N log N)",
      "space": "O(1)"
    },
    "solution_explanation": "Sort intervals by start time. A conflict occurs if and only if any meeting starts before the prior meeting ends.",
    "starter_code": {
      "python": "# 52. Meeting Rooms\n# Difficulty: EASY | Topic: Interval Conflict Detection\n# Time Complexity Target: O(N log N) | Space Complexity Target: O(1)\n\nimport sys\nimport json\n\ndef canAttendMeetings(intervals: list[list[int]]) -> bool:\n    \"\"\"\n    Given an array of meeting time intervals where intervals[i] = [starti, endi], determine if a person could attend all meetings without overlapping.\n    \"\"\"\n    # TODO: Implement your solution here\n    intervals.sort(key=lambda x: x[0])\n    for i in range(1, len(intervals)):\n        if intervals[i][0] < intervals[i - 1][1]:\n            return False\n    return True\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(canAttendMeetings(...))\n",
      "javascript": "/**\n * 52. Meeting Rooms\n * Difficulty: EASY | Topic: Interval Conflict Detection\n * Optimal: O(N log N) time, O(1) space\n */\n\nconst fs = require('fs');\n\nfunction canAttendMeetings(intervals: list[list[int]]) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 52. Meeting Rooms\n// Difficulty: EASY | Topic: Interval Conflict Detection\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 52. Meeting Rooms\n// Difficulty: EASY | Topic: Interval Conflict Detection\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_053",
    "number": 53,
    "title": "Merge Sort",
    "slug": "merge-sort",
    "topic_id": "topic_sorting_searching",
    "subtopic": "Divide and Conquer Sorting",
    "difficulty": "MEDIUM",
    "roadmap_stage": "Core Patterns",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google"
    ],
    "tags": [
      "sorting searching"
    ],
    "description": "Given an array of integers nums, sort the array in ascending order using the Merge Sort algorithm.",
    "input_format": "A single line of space-separated integers.",
    "output_format": "Sorted space-separated integers.",
    "constraints": [
      "1 <= nums.length <= 5 * 10^4",
      "-5 * 10^4 <= nums[i] <= 5 * 10^4"
    ],
    "examples": [
      {
        "input": "5 2 3 1",
        "output": "1 2 3 5"
      },
      {
        "input": "5 1 1 2 0 0",
        "output": "0 0 1 1 2 5"
      }
    ],
    "public_test_cases": [
      {
        "input": "5 2 3 1",
        "output": "1 2 3 5"
      },
      {
        "input": "5 1 1 2 0 0",
        "output": "0 0 1 1 2 5"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "1",
        "output": "1"
      },
      {
        "input": "-4 0 7 4 9 -5 -1 0 -7 -1",
        "output": "-7 -5 -4 -1 -1 0 0 4 7 9"
      }
    ],
    "hints": [
      "Divide the array into two halves recursively until base size 1.",
      "Merge two sorted halves by comparing elements from both lists.",
      "Merge sort is guaranteed O(N log N) in worst case and is stable."
    ],
    "optimal_complexity": {
      "time": "O(N log N)",
      "space": "O(N)"
    },
    "solution_explanation": "Recursive divide and conquer: partition array into halves, recursively sort sub-arrays, and merge sorted halves with two pointers.",
    "starter_code": {
      "python": "# 53. Merge Sort\n# Difficulty: MEDIUM | Topic: Divide and Conquer Sorting\n# Time Complexity Target: O(N log N) | Space Complexity Target: O(N)\n\nimport sys\nimport json\n\ndef mergeSort(nums: list[int]) -> list[int]:\n    \"\"\"\n    Given an array of integers nums, sort the array in ascending order using the Merge Sort algorithm.\n    \"\"\"\n    # TODO: Implement your solution here\n    if len(nums) <= 1: return nums\n    mid = len(nums) // 2\n    left = mergeSort(nums[:mid])\n    right = mergeSort(nums[mid:])\n    res = []\n    i = j = 0\n    while i < len(left) and j < len(right):\n        if left[i] <= right[j]: res.append(left[i]); i += 1\n        else: res.append(right[j]); j += 1\n    res.extend(left[i:]); res.extend(right[j:])\n    return res\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(mergeSort(...))\n",
      "javascript": "/**\n * 53. Merge Sort\n * Difficulty: MEDIUM | Topic: Divide and Conquer Sorting\n * Optimal: O(N log N) time, O(N) space\n */\n\nconst fs = require('fs');\n\nfunction mergeSort(nums: list[int]) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 53. Merge Sort\n// Difficulty: MEDIUM | Topic: Divide and Conquer Sorting\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 53. Merge Sort\n// Difficulty: MEDIUM | Topic: Divide and Conquer Sorting\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_054",
    "number": 54,
    "title": "Quick Sort",
    "slug": "quick-sort",
    "topic_id": "topic_sorting_searching",
    "subtopic": "Lomuto / Hoare Partition",
    "difficulty": "MEDIUM",
    "roadmap_stage": "Core Patterns",
    "companies": [
      "Amazon",
      "Apple",
      "Google"
    ],
    "tags": [
      "sorting searching"
    ],
    "description": "Implement Quick Sort in-place on an integer array nums.",
    "input_format": "A single line of space-separated integers.",
    "output_format": "Sorted space-separated integers.",
    "constraints": [
      "1 <= nums.length <= 5 * 10^4",
      "-5 * 10^4 <= nums[i] <= 5 * 10^4"
    ],
    "examples": [
      {
        "input": "10 7 8 9 1 5",
        "output": "1 5 7 8 9 10"
      },
      {
        "input": "4 3 2 1",
        "output": "1 2 3 4"
      }
    ],
    "public_test_cases": [
      {
        "input": "10 7 8 9 1 5",
        "output": "1 5 7 8 9 10"
      },
      {
        "input": "4 3 2 1",
        "output": "1 2 3 4"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "5",
        "output": "5"
      },
      {
        "input": "3 3 3 2 2 1",
        "output": "1 2 2 3 3 3"
      }
    ],
    "hints": [
      "Pick a pivot element.",
      "Partition the array such that all elements <= pivot are on the left, and elements > pivot are on the right.",
      "Recursively apply quicksort to the left and right partitions."
    ],
    "optimal_complexity": {
      "time": "O(N log N) average",
      "space": "O(log N)"
    },
    "solution_explanation": "In-place partition using Lomuto scheme: partition elements relative to pivot, then recursively sort left and right partitions.",
    "starter_code": {
      "python": "# 54. Quick Sort\n# Difficulty: MEDIUM | Topic: Lomuto / Hoare Partition\n# Time Complexity Target: O(N log N) average | Space Complexity Target: O(log N)\n\nimport sys\nimport json\n\ndef quickSort(nums: list[int]) -> list[int]:\n    \"\"\"\n    Implement Quick Sort in-place on an integer array nums.\n    \"\"\"\n    # TODO: Implement your solution here\n    def qsort(l, r):\n        if l >= r: return\n        pivot = nums[r]\n        p = l\n        for i in range(l, r):\n            if nums[i] <= pivot:\n                nums[p], nums[i] = nums[i], nums[p]\n                p += 1\n        nums[p], nums[r] = nums[r], nums[p]\n        qsort(l, p - 1)\n        qsort(p + 1, r)\n    qsort(0, len(nums) - 1)\n    return nums\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(quickSort(...))\n",
      "javascript": "/**\n * 54. Quick Sort\n * Difficulty: MEDIUM | Topic: Lomuto / Hoare Partition\n * Optimal: O(N log N) average time, O(log N) space\n */\n\nconst fs = require('fs');\n\nfunction quickSort(nums: list[int]) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 54. Quick Sort\n// Difficulty: MEDIUM | Topic: Lomuto / Hoare Partition\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 54. Quick Sort\n// Difficulty: MEDIUM | Topic: Lomuto / Hoare Partition\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_055",
    "number": 55,
    "title": "Sort an Array",
    "slug": "sort-an-array",
    "topic_id": "topic_sorting_searching",
    "subtopic": "Guaranteed O(N log N) Sorting",
    "difficulty": "MEDIUM",
    "roadmap_stage": "Core Patterns",
    "companies": [
      "Amazon",
      "Microsoft",
      "Meta"
    ],
    "tags": [
      "sorting searching"
    ],
    "description": "Given an array of integers nums, sort the array in ascending order and return it. You must solve the problem without using any built-in functions in O(nlog(n)) time complexity and with the smallest space complexity possible.",
    "input_format": "A single line of space-separated integers.",
    "output_format": "Sorted space-separated integers.",
    "constraints": [
      "1 <= nums.length <= 5 * 10^4",
      "-5 * 10^4 <= nums[i] <= 5 * 10^4"
    ],
    "examples": [
      {
        "input": "5 2 3 1",
        "output": "1 2 3 5"
      },
      {
        "input": "5 1 1 2 0 0",
        "output": "0 0 1 1 2 5"
      }
    ],
    "public_test_cases": [
      {
        "input": "5 2 3 1",
        "output": "1 2 3 5"
      },
      {
        "input": "5 1 1 2 0 0",
        "output": "0 0 1 1 2 5"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "0",
        "output": "0"
      },
      {
        "input": "-1 2 -8 -10",
        "output": "-10 -8 -1 2"
      }
    ],
    "hints": [
      "Heap Sort or Merge Sort provide guaranteed O(N log N) even in adversarial worst-case inputs.",
      "Heapify array in-place, then repeatedly extract the maximum element.",
      "Swap root with the end of the un-sorted prefix and bubble down to maintain heap invariants."
    ],
    "optimal_complexity": {
      "time": "O(N log N)",
      "space": "O(1)"
    },
    "solution_explanation": "Heap Sort guarantees O(N log N) runtime with O(1) auxiliary space, immune to worst-case quadratic degradation.",
    "starter_code": {
      "python": "# 55. Sort an Array\n# Difficulty: MEDIUM | Topic: Guaranteed O(N log N) Sorting\n# Time Complexity Target: O(N log N) | Space Complexity Target: O(1)\n\nimport sys\nimport json\n\ndef sortArray(nums: list[int]) -> list[int]:\n    \"\"\"\n    Given an array of integers nums, sort the array in ascending order and return it.\n    \"\"\"\n    # TODO: Implement your solution here\n    def heapify(n, i):\n        largest = i\n        l, r = 2 * i + 1, 2 * i + 2\n        if l < n and nums[l] > nums[largest]: largest = l\n        if r < n and nums[r] > nums[largest]: largest = r\n        if largest != i:\n            nums[i], nums[largest] = nums[largest], nums[i]\n            heapify(n, largest)\n    n = len(nums)\n    for i in range(n // 2 - 1, -1, -1): heapify(n, i)\n    for i in range(n - 1, 0, -1):\n        nums[0], nums[i] = nums[i], nums[0]\n        heapify(i, 0)\n    return nums\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(sortArray(...))\n",
      "javascript": "/**\n * 55. Sort an Array\n * Difficulty: MEDIUM | Topic: Guaranteed O(N log N) Sorting\n * Optimal: O(N log N) time, O(1) space\n */\n\nconst fs = require('fs');\n\nfunction sortArray(nums: list[int]) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 55. Sort an Array\n// Difficulty: MEDIUM | Topic: Guaranteed O(N log N) Sorting\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 55. Sort an Array\n// Difficulty: MEDIUM | Topic: Guaranteed O(N log N) Sorting\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_056",
    "number": 56,
    "title": "Sort Characters By Frequency",
    "slug": "sort-characters-by-frequency",
    "topic_id": "topic_sorting_searching",
    "subtopic": "Bucket Sort / Frequency Sorting",
    "difficulty": "MEDIUM",
    "roadmap_stage": "Core Patterns",
    "companies": [
      "Amazon",
      "Google",
      "Bloomberg"
    ],
    "tags": [
      "sorting searching"
    ],
    "description": "Given a string s, sort it in decreasing order based on the frequency of the characters. The frequency of a character is the number of times it appears in the string.\n\nReturn the sorted string. If there are multiple answers, return any of them.",
    "input_format": "A single line containing string s.",
    "output_format": "String sorted by character frequencies descending.",
    "constraints": [
      "1 <= s.length <= 5 * 10^5",
      "s consists of uppercase and lowercase English letters and digits."
    ],
    "examples": [
      {
        "input": "tree",
        "output": "eert",
        "explanation": "'e' appears twice, 'r' and 't' both appear once. 'eetr' is also valid."
      },
      {
        "input": "cccaaa",
        "output": "aaaccc",
        "explanation": "Both 'c' and 'a' appear three times."
      },
      {
        "input": "Aabb",
        "output": "bbAa"
      }
    ],
    "public_test_cases": [
      {
        "input": "tree",
        "output": "eert"
      },
      {
        "input": "cccaaa",
        "output": "aaaccc"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "Aabb",
        "output": "bbAa"
      },
      {
        "input": "raaeaere",
        "output": "eeeeaaarr"
      }
    ],
    "hints": [
      "Count character frequencies with a hash map.",
      "Bucket Sort: create an array of buckets where bucket[freq] contains characters with that frequency.",
      "Iterate from max frequency bucket down to 1, building the output string."
    ],
    "optimal_complexity": {
      "time": "O(N)",
      "space": "O(N)"
    },
    "solution_explanation": "Bucket sort by frequency achieves linear O(N) time without comparison sorting.",
    "starter_code": {
      "python": "# 56. Sort Characters By Frequency\n# Difficulty: MEDIUM | Topic: Bucket Sort / Frequency Sorting\n# Time Complexity Target: O(N) | Space Complexity Target: O(N)\n\nimport sys\nimport json\n\ndef frequencySort(s: str) -> str:\n    \"\"\"\n    Given a string s, sort it in decreasing order based on the frequency of the characters.\n    \"\"\"\n    # TODO: Implement your solution here\n    from collections import Counter\n    counts = Counter(s)\n    buckets = [[] for _ in range(len(s) + 1)]\n    for c, freq in counts.items():\n        buckets[freq].append(c)\n    res = []\n    for f in range(len(s), 0, -1):\n        for c in buckets[f]:\n            res.append(c * f)\n    return ''.join(res)\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(frequencySort(...))\n",
      "javascript": "/**\n * 56. Sort Characters By Frequency\n * Difficulty: MEDIUM | Topic: Bucket Sort / Frequency Sorting\n * Optimal: O(N) time, O(N) space\n */\n\nconst fs = require('fs');\n\nfunction frequencySort(s: str) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 56. Sort Characters By Frequency\n// Difficulty: MEDIUM | Topic: Bucket Sort / Frequency Sorting\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 56. Sort Characters By Frequency\n// Difficulty: MEDIUM | Topic: Bucket Sort / Frequency Sorting\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_057",
    "number": 57,
    "title": "Kth Largest Element in an Array",
    "slug": "kth-largest-element-in-an-array",
    "topic_id": "topic_sorting_searching",
    "subtopic": "Quickselect / Min-Heap",
    "difficulty": "MEDIUM",
    "roadmap_stage": "Core Patterns",
    "companies": [
      "Meta",
      "Amazon",
      "Apple",
      "Microsoft"
    ],
    "tags": [
      "sorting searching"
    ],
    "description": "Given an integer array nums and an integer k, return the kth largest element in the array.\n\nNote that it is the kth largest element in the sorted order, not the kth distinct element.\n\nCan you solve it without sorting in O(n) average time complexity?",
    "input_format": "Line 1: N space-separated integers\nLine 2: integer k",
    "output_format": "The kth largest integer.",
    "constraints": [
      "1 <= k <= nums.length <= 10^5",
      "-10^4 <= nums[i] <= 10^4"
    ],
    "examples": [
      {
        "input": "3 2 1 5 6 4\n2",
        "output": "5",
        "explanation": "Sorted array is [1, 2, 3, 4, 5, 6], 2nd largest is 5."
      },
      {
        "input": "3 2 3 1 2 4 5 5 6\n4",
        "output": "4"
      }
    ],
    "public_test_cases": [
      {
        "input": "3 2 1 5 6 4\n2",
        "output": "5"
      },
      {
        "input": "3 2 3 1 2 4 5 5 6\n4",
        "output": "4"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "1\n1",
        "output": "1"
      },
      {
        "input": "7 6 5 4 3 2 1\n5",
        "output": "3"
      }
    ],
    "hints": [
      "Quickselect algorithm averages O(N) by partitioning like Quicksort but only recurring on one side.",
      "Target index in sorted array is n - k.",
      "Alternatively, keep a min-heap of size k. The heap root will be the kth largest."
    ],
    "optimal_complexity": {
      "time": "O(N) average",
      "space": "O(K)"
    },
    "solution_explanation": "Min-heap of size k or Quickselect algorithm identifies the kth largest element in O(N) average time.",
    "starter_code": {
      "python": "# 57. Kth Largest Element in an Array\n# Difficulty: MEDIUM | Topic: Quickselect / Min-Heap\n# Time Complexity Target: O(N) average | Space Complexity Target: O(K)\n\nimport sys\nimport json\n\ndef findKthLargest(nums: list[int], k: int) -> int:\n    \"\"\"\n    Given an integer array nums and an integer k, return the kth largest element in the array.\n    \"\"\"\n    # TODO: Implement your solution here\n    import heapq\n    return heapq.nlargest(k, nums)[-1]\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(findKthLargest(...))\n",
      "javascript": "/**\n * 57. Kth Largest Element in an Array\n * Difficulty: MEDIUM | Topic: Quickselect / Min-Heap\n * Optimal: O(N) average time, O(K) space\n */\n\nconst fs = require('fs');\n\nfunction findKthLargest(nums: list[int], k: int) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 57. Kth Largest Element in an Array\n// Difficulty: MEDIUM | Topic: Quickselect / Min-Heap\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 57. Kth Largest Element in an Array\n// Difficulty: MEDIUM | Topic: Quickselect / Min-Heap\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_058",
    "number": 58,
    "title": "Count Inversions",
    "slug": "count-inversions",
    "topic_id": "topic_sorting_searching",
    "subtopic": "Enhanced Merge Sort Inversions",
    "difficulty": "HARD",
    "roadmap_stage": "Placement Revision",
    "companies": [
      "Amazon",
      "Google",
      "Microsoft"
    ],
    "tags": [
      "sorting searching"
    ],
    "description": "In an array nums, two elements nums[i] and nums[j] form an inversion if nums[i] > nums[j] and i < j.\n\nGiven an integer array nums, return the total count of inversions in the array.",
    "input_format": "A single line of space-separated integers.",
    "output_format": "Single integer representing total inversion count.",
    "constraints": [
      "1 <= nums.length <= 10^5",
      "-10^9 <= nums[i] <= 10^9"
    ],
    "examples": [
      {
        "input": "2 4 1 3 5",
        "output": "3",
        "explanation": "Inversions are (2, 1), (4, 1), (4, 3). Total = 3."
      },
      {
        "input": "5 4 3 2 1",
        "output": "10",
        "explanation": "5 * 4 / 2 = 10 inversions."
      }
    ],
    "public_test_cases": [
      {
        "input": "2 4 1 3 5",
        "output": "3"
      },
      {
        "input": "5 4 3 2 1",
        "output": "10"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "1 2 3 4 5",
        "output": "0"
      },
      {
        "input": "1",
        "output": "0"
      }
    ],
    "hints": [
      "Modify Merge Sort.",
      "During the merge step, if left[i] > right[j], then because left is sorted, every element from left[i] onwards also forms an inversion with right[j].",
      "Add (len(left) - i) to inversion count."
    ],
    "optimal_complexity": {
      "time": "O(N log N)",
      "space": "O(N)"
    },
    "solution_explanation": "Modified Merge Sort: when an element from the right subarray is smaller than an element in the left subarray, all remaining elements in the left subarray form inversions.",
    "starter_code": {
      "python": "# 58. Count Inversions\n# Difficulty: HARD | Topic: Enhanced Merge Sort Inversions\n# Time Complexity Target: O(N log N) | Space Complexity Target: O(N)\n\nimport sys\nimport json\n\ndef countInversions(nums: list[int]) -> int:\n    \"\"\"\n    In an array nums, two elements nums[i] and nums[j] form an inversion if nums[i] > nums[j] and i < j.\n    \"\"\"\n    # TODO: Implement your solution here\n    def sortCount(arr):\n        if len(arr) <= 1: return arr, 0\n        m = len(arr) // 2\n        L, count_L = sortCount(arr[:m])\n        R, count_R = sortCount(arr[m:])\n        merged = []\n        inv = count_L + count_R\n        i = j = 0\n        while i < len(L) and j < len(R):\n            if L[i] <= R[j]:\n                merged.append(L[i]); i += 1\n            else:\n                merged.append(R[j]); j += 1\n                inv += len(L) - i\n        merged.extend(L[i:]); merged.extend(R[j:])\n        return merged, inv\n    _, total = sortCount(nums)\n    return total\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(countInversions(...))\n",
      "javascript": "/**\n * 58. Count Inversions\n * Difficulty: HARD | Topic: Enhanced Merge Sort Inversions\n * Optimal: O(N log N) time, O(N) space\n */\n\nconst fs = require('fs');\n\nfunction countInversions(nums: list[int]) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 58. Count Inversions\n// Difficulty: HARD | Topic: Enhanced Merge Sort Inversions\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 58. Count Inversions\n// Difficulty: HARD | Topic: Enhanced Merge Sort Inversions\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_059",
    "number": 59,
    "title": "Reverse Linked List",
    "slug": "reverse-linked-list",
    "topic_id": "topic_linked_lists",
    "subtopic": "Pointer Reversal",
    "difficulty": "EASY",
    "roadmap_stage": "Beginner Foundations",
    "companies": [
      "Amazon",
      "Apple",
      "Google",
      "Meta",
      "Microsoft"
    ],
    "tags": [
      "linked lists"
    ],
    "description": "Given the head of a singly linked list, reverse the list, and return the reversed list.",
    "input_format": "A single line of space-separated integers representing linked list nodes.",
    "output_format": "Space-separated integers of reversed list.",
    "constraints": [
      "The number of nodes in the list is the range [0, 5000].",
      "-5000 <= Node.val <= 5000"
    ],
    "examples": [
      {
        "input": "1 2 3 4 5",
        "output": "5 4 3 2 1"
      },
      {
        "input": "1 2",
        "output": "2 1"
      },
      {
        "input": "",
        "output": ""
      }
    ],
    "public_test_cases": [
      {
        "input": "1 2 3 4 5",
        "output": "5 4 3 2 1"
      },
      {
        "input": "1 2",
        "output": "2 1"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "",
        "output": ""
      },
      {
        "input": "42",
        "output": "42"
      }
    ],
    "hints": [
      "Maintain three pointers: prev, curr, next.",
      "Save next node: next = curr.next.",
      "Reverse pointer: curr.next = prev. Advance prev = curr, curr = next."
    ],
    "optimal_complexity": {
      "time": "O(N)",
      "space": "O(1)"
    },
    "solution_explanation": "Iterate through list with prev, curr, next pointers. Reverse each node's next reference to point to prev. O(N) time, O(1) space.",
    "starter_code": {
      "python": "# 59. Reverse Linked List\n# Difficulty: EASY | Topic: Pointer Reversal\n# Time Complexity Target: O(N) | Space Complexity Target: O(1)\n\nimport sys\nimport json\n\ndef reverseList(head) -> ListNode:\n    \"\"\"\n    Given the head of a singly linked list, reverse the list, and return the reversed list.\n    \"\"\"\n    # TODO: Implement your solution here\n    prev = None\n    curr = head\n    while curr:\n        nxt = curr.next\n        curr.next = prev\n        prev = curr\n        curr = nxt\n    return prev\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(reverseList(...))\n",
      "javascript": "/**\n * 59. Reverse Linked List\n * Difficulty: EASY | Topic: Pointer Reversal\n * Optimal: O(N) time, O(1) space\n */\n\nconst fs = require('fs');\n\nfunction reverseList(head) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 59. Reverse Linked List\n// Difficulty: EASY | Topic: Pointer Reversal\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 59. Reverse Linked List\n// Difficulty: EASY | Topic: Pointer Reversal\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_060",
    "number": 60,
    "title": "Middle of the Linked List",
    "slug": "middle-of-the-linked-list",
    "topic_id": "topic_linked_lists",
    "subtopic": "Fast and Slow Pointers",
    "difficulty": "EASY",
    "roadmap_stage": "Beginner Foundations",
    "companies": [
      "Amazon",
      "Apple",
      "Google"
    ],
    "tags": [
      "linked lists"
    ],
    "description": "Given the head of a singly linked list, return the middle node of the linked list.\n\nIf there are two middle nodes, return the second middle node.",
    "input_format": "A single line of space-separated integers representing linked list.",
    "output_format": "Space-separated integers starting from the middle node to the end.",
    "constraints": [
      "The number of nodes in the list is in the range [1, 100].",
      "1 <= Node.val <= 100"
    ],
    "examples": [
      {
        "input": "1 2 3 4 5",
        "output": "3 4 5",
        "explanation": "The middle node of the list is node 3."
      },
      {
        "input": "1 2 3 4 5 6",
        "output": "4 5 6",
        "explanation": "Since the list has two middle nodes with values 3 and 4, we return the second one."
      }
    ],
    "public_test_cases": [
      {
        "input": "1 2 3 4 5",
        "output": "3 4 5"
      },
      {
        "input": "1 2 3 4 5 6",
        "output": "4 5 6"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "1",
        "output": "1"
      },
      {
        "input": "1 2",
        "output": "2"
      }
    ],
    "hints": [
      "Use two pointers: slow and fast.",
      "slow advances 1 step, fast advances 2 steps.",
      "When fast reaches the end, slow is exactly at the middle."
    ],
    "optimal_complexity": {
      "time": "O(N)",
      "space": "O(1)"
    },
    "solution_explanation": "Fast and slow pointers: fast moves twice as fast as slow. When fast reaches end of list, slow is at the middle.",
    "starter_code": {
      "python": "# 60. Middle of the Linked List\n# Difficulty: EASY | Topic: Fast and Slow Pointers\n# Time Complexity Target: O(N) | Space Complexity Target: O(1)\n\nimport sys\nimport json\n\ndef middleNode(head) -> ListNode:\n    \"\"\"\n    Given the head of a singly linked list, return the middle node of the linked list.\n    \"\"\"\n    # TODO: Implement your solution here\n    slow = fast = head\n    while fast and fast.next:\n        slow = slow.next\n        fast = fast.next.next\n    return slow\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(middleNode(...))\n",
      "javascript": "/**\n * 60. Middle of the Linked List\n * Difficulty: EASY | Topic: Fast and Slow Pointers\n * Optimal: O(N) time, O(1) space\n */\n\nconst fs = require('fs');\n\nfunction middleNode(head) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 60. Middle of the Linked List\n// Difficulty: EASY | Topic: Fast and Slow Pointers\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 60. Middle of the Linked List\n// Difficulty: EASY | Topic: Fast and Slow Pointers\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_061",
    "number": 61,
    "title": "Merge Two Sorted Lists",
    "slug": "merge-two-sorted-lists",
    "topic_id": "topic_linked_lists",
    "subtopic": "Dummy Node Linear Merge",
    "difficulty": "EASY",
    "roadmap_stage": "Beginner Foundations",
    "companies": [
      "Amazon",
      "Apple",
      "Google",
      "Microsoft"
    ],
    "tags": [
      "linked lists"
    ],
    "description": "You are given the heads of two sorted linked lists list1 and list2.\n\nMerge the two lists into one sorted list. The list should be made by splicing together the nodes of the first two lists.\n\nReturn the head of the merged linked list.",
    "input_format": "Line 1: space-separated integers for list1\nLine 2: space-separated integers for list2",
    "output_format": "Merged space-separated sorted list.",
    "constraints": [
      "The number of nodes in both lists is in the range [0, 50].",
      "-100 <= Node.val <= 100",
      "Both list1 and list2 are sorted in non-decreasing order."
    ],
    "examples": [
      {
        "input": "1 2 4\n1 3 4",
        "output": "1 1 2 3 4 4"
      },
      {
        "input": "\n",
        "output": ""
      },
      {
        "input": "\n0",
        "output": "0"
      }
    ],
    "public_test_cases": [
      {
        "input": "1 2 4\n1 3 4",
        "output": "1 1 2 3 4 4"
      },
      {
        "input": "\n0",
        "output": "0"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "\n",
        "output": ""
      },
      {
        "input": "5\n1 2 3",
        "output": "1 2 3 5"
      }
    ],
    "hints": [
      "Use a dummy head node to simplify list building.",
      "Compare heads of list1 and list2, link the smaller node, and advance.",
      "Attach remaining non-null list at the end."
    ],
    "optimal_complexity": {
      "time": "O(M + N)",
      "space": "O(1)"
    },
    "solution_explanation": "Use a dummy sentinel node and compare heads of both lists, appending the smaller node to the merged list.",
    "starter_code": {
      "python": "# 61. Merge Two Sorted Lists\n# Difficulty: EASY | Topic: Dummy Node Linear Merge\n# Time Complexity Target: O(M + N) | Space Complexity Target: O(1)\n\nimport sys\nimport json\n\ndef mergeTwoLists(list1, list2) -> ListNode:\n    \"\"\"\n    You are given the heads of two sorted linked lists list1 and list2.\n    \"\"\"\n    # TODO: Implement your solution here\n    dummy = curr = ListNode(0)\n    while list1 and list2:\n        if list1.val <= list2.val:\n            curr.next = list1; list1 = list1.next\n        else:\n            curr.next = list2; list2 = list2.next\n        curr = curr.next\n    curr.next = list1 or list2\n    return dummy.next\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(mergeTwoLists(...))\n",
      "javascript": "/**\n * 61. Merge Two Sorted Lists\n * Difficulty: EASY | Topic: Dummy Node Linear Merge\n * Optimal: O(M + N) time, O(1) space\n */\n\nconst fs = require('fs');\n\nfunction mergeTwoLists(list1, list2) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 61. Merge Two Sorted Lists\n// Difficulty: EASY | Topic: Dummy Node Linear Merge\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 61. Merge Two Sorted Lists\n// Difficulty: EASY | Topic: Dummy Node Linear Merge\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_062",
    "number": 62,
    "title": "Linked List Cycle",
    "slug": "linked-list-cycle",
    "topic_id": "topic_linked_lists",
    "subtopic": "Floyd's Cycle Detection",
    "difficulty": "EASY",
    "roadmap_stage": "Beginner Foundations",
    "companies": [
      "Amazon",
      "Microsoft",
      "Meta"
    ],
    "tags": [
      "linked lists"
    ],
    "description": "Given head, the head of a linked list, determine if the linked list has a cycle in it.\n\nThere is a cycle in a linked list if there is some node in the list that can be reached again by continuously following the next pointer.",
    "input_format": "Line 1: space-separated integers\nLine 2: pos (-1 if no cycle, otherwise index connected to tail)",
    "output_format": "true or false",
    "constraints": [
      "The number of the nodes in the list is in the range [0, 10^4].",
      "-10^5 <= Node.val <= 10^5",
      "pos is -1 or a valid index in the linked-list."
    ],
    "examples": [
      {
        "input": "3 2 0 -4\n1",
        "output": "true",
        "explanation": "There is a cycle where tail connects to 1st node (0-indexed)."
      },
      {
        "input": "1 2\n0",
        "output": "true"
      },
      {
        "input": "1\n-1",
        "output": "false"
      }
    ],
    "public_test_cases": [
      {
        "input": "3 2 0 -4\n1",
        "output": "true"
      },
      {
        "input": "1 -1",
        "output": "false"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "1 2\n0",
        "output": "true"
      },
      {
        "input": "\n-1",
        "output": "false"
      }
    ],
    "hints": [
      "Floyd's Cycle-Finding Algorithm (Tortoise and Hare).",
      "Slow moves 1 step, fast moves 2 steps.",
      "If slow and fast meet, a cycle exists. If fast reaches None, there is no cycle."
    ],
    "optimal_complexity": {
      "time": "O(N)",
      "space": "O(1)"
    },
    "solution_explanation": "Floyd's tortoise and hare: fast pointer moves 2 steps, slow pointer moves 1 step. If a cycle exists, fast is guaranteed to lap and meet slow.",
    "starter_code": {
      "python": "# 62. Linked List Cycle\n# Difficulty: EASY | Topic: Floyd's Cycle Detection\n# Time Complexity Target: O(N) | Space Complexity Target: O(1)\n\nimport sys\nimport json\n\ndef hasCycle(head) -> bool:\n    \"\"\"\n    Given head, the head of a linked list, determine if the linked list has a cycle in it.\n    \"\"\"\n    # TODO: Implement your solution here\n    slow = fast = head\n    while fast and fast.next:\n        slow = slow.next\n        fast = fast.next.next\n        if slow == fast: return True\n    return False\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(hasCycle(...))\n",
      "javascript": "/**\n * 62. Linked List Cycle\n * Difficulty: EASY | Topic: Floyd's Cycle Detection\n * Optimal: O(N) time, O(1) space\n */\n\nconst fs = require('fs');\n\nfunction hasCycle(head) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 62. Linked List Cycle\n// Difficulty: EASY | Topic: Floyd's Cycle Detection\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 62. Linked List Cycle\n// Difficulty: EASY | Topic: Floyd's Cycle Detection\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_063",
    "number": 63,
    "title": "Palindrome Linked List",
    "slug": "palindrome-linked-list",
    "topic_id": "topic_linked_lists",
    "subtopic": "Half Reversal Comparison",
    "difficulty": "EASY",
    "roadmap_stage": "Beginner Foundations",
    "companies": [
      "Amazon",
      "Meta",
      "Google"
    ],
    "tags": [
      "linked lists"
    ],
    "description": "Given the head of a singly linked list, return true if it is a palindrome or false otherwise.\n\nCould you do it in O(n) time and O(1) space?",
    "input_format": "A single line of space-separated integers representing linked list nodes.",
    "output_format": "true or false",
    "constraints": [
      "The number of nodes in the list is in the range [1, 10^5].",
      "0 <= Node.val <= 9"
    ],
    "examples": [
      {
        "input": "1 2 2 1",
        "output": "true"
      },
      {
        "input": "1 2",
        "output": "false"
      }
    ],
    "public_test_cases": [
      {
        "input": "1 2 2 1",
        "output": "true"
      },
      {
        "input": "1 2",
        "output": "false"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "1",
        "output": "true"
      },
      {
        "input": "1 2 3 2 1",
        "output": "true"
      }
    ],
    "hints": [
      "Find the middle of the linked list using fast and slow pointers.",
      "Reverse the second half of the linked list in place.",
      "Compare nodes of first half and reversed second half."
    ],
    "optimal_complexity": {
      "time": "O(N)",
      "space": "O(1)"
    },
    "solution_explanation": "Find middle node with slow/fast pointers, reverse the second half in-place, and compare corresponding nodes from each half.",
    "starter_code": {
      "python": "# 63. Palindrome Linked List\n# Difficulty: EASY | Topic: Half Reversal Comparison\n# Time Complexity Target: O(N) | Space Complexity Target: O(1)\n\nimport sys\nimport json\n\ndef isPalindromeList(head) -> bool:\n    \"\"\"\n    Given the head of a singly linked list, return true if it is a palindrome or false otherwise.\n    \"\"\"\n    # TODO: Implement your solution here\n    slow = fast = head\n    while fast and fast.next:\n        slow = slow.next\n        fast = fast.next.next\n    prev = None\n    while slow:\n        nxt = slow.next\n        slow.next = prev\n        prev = slow\n        slow = nxt\n    left, right = head, prev\n    while right:\n        if left.val != right.val: return False\n        left = left.next; right = right.next\n    return True\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(isPalindromeList(...))\n",
      "javascript": "/**\n * 63. Palindrome Linked List\n * Difficulty: EASY | Topic: Half Reversal Comparison\n * Optimal: O(N) time, O(1) space\n */\n\nconst fs = require('fs');\n\nfunction isPalindromeList(head) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 63. Palindrome Linked List\n// Difficulty: EASY | Topic: Half Reversal Comparison\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 63. Palindrome Linked List\n// Difficulty: EASY | Topic: Half Reversal Comparison\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_064",
    "number": 64,
    "title": "Linked List Cycle II",
    "slug": "linked-list-cycle-ii",
    "topic_id": "topic_linked_lists",
    "subtopic": "Cycle Start Mathematics",
    "difficulty": "MEDIUM",
    "roadmap_stage": "Core Patterns",
    "companies": [
      "Amazon",
      "Microsoft",
      "Meta"
    ],
    "tags": [
      "linked lists"
    ],
    "description": "Given the head of a linked list, return the node where the cycle begins. If there is no cycle, return null.",
    "input_format": "Line 1: space-separated integers\nLine 2: pos index (-1 if no cycle)",
    "output_format": "Value of the cycle start node, or null.",
    "constraints": [
      "The number of nodes in the list is in the range [0, 10^4].",
      "-10^5 <= Node.val <= 10^5",
      "pos is -1 or a valid index in the linked-list."
    ],
    "examples": [
      {
        "input": "3 2 0 -4\n1",
        "output": "2",
        "explanation": "Cycle begins at node with value 2."
      },
      {
        "input": "1 2\n0",
        "output": "1"
      }
    ],
    "public_test_cases": [
      {
        "input": "3 2 0 -4\n1",
        "output": "2"
      },
      {
        "input": "1 2\n0",
        "output": "1"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "1\n-1",
        "output": "null"
      },
      {
        "input": "1 2 3 4 5\n2",
        "output": "3"
      }
    ],
    "hints": [
      "Phase 1: Detect cycle using slow and fast pointers.",
      "Phase 2: When slow and fast meet, reset slow to head.",
      "Advance both slow and fast 1 step at a time. The point where they meet is the start of the cycle."
    ],
    "optimal_complexity": {
      "time": "O(N)",
      "space": "O(1)"
    },
    "solution_explanation": "Mathematical invariant: distance from head to cycle entrance equals distance from meeting point to cycle entrance. Resetting slow to head and stepping together locates the cycle start.",
    "starter_code": {
      "python": "# 64. Linked List Cycle II\n# Difficulty: MEDIUM | Topic: Cycle Start Mathematics\n# Time Complexity Target: O(N) | Space Complexity Target: O(1)\n\nimport sys\nimport json\n\ndef detectCycle(head) -> ListNode:\n    \"\"\"\n    Given the head of a linked list, return the node where the cycle begins.\n    \"\"\"\n    # TODO: Implement your solution here\n    slow = fast = head\n    while fast and fast.next:\n        slow = slow.next\n        fast = fast.next.next\n        if slow == fast:\n            slow = head\n            while slow != fast:\n                slow = slow.next\n                fast = fast.next\n            return slow\n    return None\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(detectCycle(...))\n",
      "javascript": "/**\n * 64. Linked List Cycle II\n * Difficulty: MEDIUM | Topic: Cycle Start Mathematics\n * Optimal: O(N) time, O(1) space\n */\n\nconst fs = require('fs');\n\nfunction detectCycle(head) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 64. Linked List Cycle II\n// Difficulty: MEDIUM | Topic: Cycle Start Mathematics\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 64. Linked List Cycle II\n// Difficulty: MEDIUM | Topic: Cycle Start Mathematics\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_065",
    "number": 65,
    "title": "Remove Nth Node From End of List",
    "slug": "remove-nth-node-from-end-of-list",
    "topic_id": "topic_linked_lists",
    "subtopic": "Two Pointers Fixed Gap",
    "difficulty": "MEDIUM",
    "roadmap_stage": "Core Patterns",
    "companies": [
      "Amazon",
      "Apple",
      "Google",
      "Meta"
    ],
    "tags": [
      "linked lists"
    ],
    "description": "Given the head of a linked list, remove the nth node from the end of the list and return its head.",
    "input_format": "Line 1: space-separated integers representing linked list\nLine 2: integer n",
    "output_format": "Linked list with nth node from end removed.",
    "constraints": [
      "The number of nodes in the list is sz.",
      "1 <= sz <= 30",
      "0 <= Node.val <= 100",
      "1 <= n <= sz"
    ],
    "examples": [
      {
        "input": "1 2 3 4 5\n2",
        "output": "1 2 3 5",
        "explanation": "2nd node from end (4) is removed."
      },
      {
        "input": "1\n1",
        "output": ""
      },
      {
        "input": "1 2\n1",
        "output": "1"
      }
    ],
    "public_test_cases": [
      {
        "input": "1 2 3 4 5\n2",
        "output": "1 2 3 5"
      },
      {
        "input": "1\n1",
        "output": ""
      }
    ],
    "hidden_test_cases": [
      {
        "input": "1 2\n1",
        "output": "1"
      },
      {
        "input": "1 2\n2",
        "output": "2"
      }
    ],
    "hints": [
      "Use a dummy head pointing to head.",
      "Advance fast pointer n + 1 steps ahead of slow pointer.",
      "Move both pointers until fast reaches end. slow.next = slow.next.next deletes the target node."
    ],
    "optimal_complexity": {
      "time": "O(N)",
      "space": "O(1)"
    },
    "solution_explanation": "Maintain an n-step gap between two pointers. When fast reaches the end, slow is positioned right before the node to be deleted.",
    "starter_code": {
      "python": "# 65. Remove Nth Node From End of List\n# Difficulty: MEDIUM | Topic: Two Pointers Fixed Gap\n# Time Complexity Target: O(N) | Space Complexity Target: O(1)\n\nimport sys\nimport json\n\ndef removeNthFromEnd(head, n: int) -> ListNode:\n    \"\"\"\n    Given the head of a linked list, remove the nth node from the end of the list and return its head.\n    \"\"\"\n    # TODO: Implement your solution here\n    dummy = ListNode(0, head)\n    slow = fast = dummy\n    for _ in range(n + 1): fast = fast.next\n    while fast:\n        slow = slow.next; fast = fast.next\n    slow.next = slow.next.next\n    return dummy.next\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(removeNthFromEnd(...))\n",
      "javascript": "/**\n * 65. Remove Nth Node From End of List\n * Difficulty: MEDIUM | Topic: Two Pointers Fixed Gap\n * Optimal: O(N) time, O(1) space\n */\n\nconst fs = require('fs');\n\nfunction removeNthFromEnd(head, n: int) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 65. Remove Nth Node From End of List\n// Difficulty: MEDIUM | Topic: Two Pointers Fixed Gap\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 65. Remove Nth Node From End of List\n// Difficulty: MEDIUM | Topic: Two Pointers Fixed Gap\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_066",
    "number": 66,
    "title": "Add Two Numbers",
    "slug": "add-two-numbers",
    "topic_id": "topic_linked_lists",
    "subtopic": "Digit-by-Digit Addition with Carry",
    "difficulty": "MEDIUM",
    "roadmap_stage": "Core Patterns",
    "companies": [
      "Amazon",
      "Google",
      "Meta",
      "Microsoft"
    ],
    "tags": [
      "linked lists"
    ],
    "description": "You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list.",
    "input_format": "Line 1: space-separated digits of l1 (reverse order)\nLine 2: space-separated digits of l2 (reverse order)",
    "output_format": "Space-separated digits of the sum (reverse order).",
    "constraints": [
      "The number of nodes in each linked list is in the range [1, 100].",
      "0 <= Node.val <= 9",
      "It is guaranteed that the list represents a number that does not have leading zeros."
    ],
    "examples": [
      {
        "input": "2 4 3\n5 6 4",
        "output": "7 0 8",
        "explanation": "342 + 465 = 807. In reverse: 7 -> 0 -> 8."
      },
      {
        "input": "0\n0",
        "output": "0"
      },
      {
        "input": "9 9 9 9 9 9 9\n9 9 9 9",
        "output": "8 9 9 9 0 0 0 1"
      }
    ],
    "public_test_cases": [
      {
        "input": "2 4 3\n5 6 4",
        "output": "7 0 8"
      },
      {
        "input": "0\n0",
        "output": "0"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "9 9 9 9 9 9 9\n9 9 9 9",
        "output": "8 9 9 9 0 0 0 1"
      },
      {
        "input": "1\n9 9",
        "output": "0 0 1"
      }
    ],
    "hints": [
      "Simulate elementary school addition from right to left.",
      "Maintain a `carry` variable (0 or 1).",
      "At each step: val = (l1.val if l1 else 0) + (l2.val if l2 else 0) + carry. carry = val // 10."
    ],
    "optimal_complexity": {
      "time": "O(max(M, N))",
      "space": "O(max(M, N))"
    },
    "solution_explanation": "Traverse both linked lists simultaneously, computing digit sum and propagating carry. Dummy node eases result construction.",
    "starter_code": {
      "python": "# 66. Add Two Numbers\n# Difficulty: MEDIUM | Topic: Digit-by-Digit Addition with Carry\n# Time Complexity Target: O(max(M, N)) | Space Complexity Target: O(max(M, N))\n\nimport sys\nimport json\n\ndef addTwoNumbers(l1, l2) -> ListNode:\n    \"\"\"\n    You are given two non-empty linked lists representing two non-negative integers.\n    \"\"\"\n    # TODO: Implement your solution here\n    dummy = curr = ListNode(0)\n    carry = 0\n    while l1 or l2 or carry:\n        v1 = l1.val if l1 else 0\n        v2 = l2.val if l2 else 0\n        s = v1 + v2 + carry\n        carry = s // 10\n        curr.next = ListNode(s % 10)\n        curr = curr.next\n        l1 = l1.next if l1 else None\n        l2 = l2.next if l2 else None\n    return dummy.next\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(addTwoNumbers(...))\n",
      "javascript": "/**\n * 66. Add Two Numbers\n * Difficulty: MEDIUM | Topic: Digit-by-Digit Addition with Carry\n * Optimal: O(max(M, N)) time, O(max(M, N)) space\n */\n\nconst fs = require('fs');\n\nfunction addTwoNumbers(l1, l2) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 66. Add Two Numbers\n// Difficulty: MEDIUM | Topic: Digit-by-Digit Addition with Carry\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 66. Add Two Numbers\n// Difficulty: MEDIUM | Topic: Digit-by-Digit Addition with Carry\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_067",
    "number": 67,
    "title": "Reorder List",
    "slug": "reorder-list",
    "topic_id": "topic_linked_lists",
    "subtopic": "Find Middle, Reverse & Interleave",
    "difficulty": "HARD",
    "roadmap_stage": "Placement Revision",
    "companies": [
      "Meta",
      "Amazon",
      "Google"
    ],
    "tags": [
      "linked lists"
    ],
    "description": "You are given the head of a singly linked-list. The list can be represented as: L0 \u2192 L1 \u2192 \u2026 \u2192 Ln - 1 \u2192 Ln\n\nReorder the list to be on the following form: L0 \u2192 Ln \u2192 L1 \u2192 Ln - 1 \u2192 L2 \u2192 Ln - 2 \u2192 \u2026\n\nYou may not modify the values in the list's nodes. Only nodes themselves may be changed.",
    "input_format": "A single line of space-separated integers representing linked list.",
    "output_format": "Reordered space-separated list.",
    "constraints": [
      "The number of nodes in the list is in the range [1, 5 * 10^4].",
      "1 <= Node.val <= 1000"
    ],
    "examples": [
      {
        "input": "1 2 3 4",
        "output": "1 4 2 3"
      },
      {
        "input": "1 2 3 4 5",
        "output": "1 5 2 4 3"
      }
    ],
    "public_test_cases": [
      {
        "input": "1 2 3 4",
        "output": "1 4 2 3"
      },
      {
        "input": "1 2 3 4 5",
        "output": "1 5 2 4 3"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "1",
        "output": "1"
      },
      {
        "input": "1 2",
        "output": "1 2"
      }
    ],
    "hints": [
      "1) Find the middle of the linked list using slow and fast pointers.",
      "2) Reverse the second half of the list.",
      "3) Interleave the two halves: take one node from the first half, then one from the reversed second half."
    ],
    "optimal_complexity": {
      "time": "O(N)",
      "space": "O(1)"
    },
    "solution_explanation": "Find the middle node, reverse the second half of the list in-place, and alternate links between the two halves in O(N) time and O(1) space.",
    "starter_code": {
      "python": "# 67. Reorder List\n# Difficulty: HARD | Topic: Find Middle, Reverse & Interleave\n# Time Complexity Target: O(N) | Space Complexity Target: O(1)\n\nimport sys\nimport json\n\ndef reorderList(head) -> None:\n    \"\"\"\n    You are given the head of a singly linked-list.\n    \"\"\"\n    # TODO: Implement your solution here\n    if not head or not head.next: return\n    slow = fast = head\n    while fast and fast.next:\n        slow = slow.next; fast = fast.next.next\n    prev = None; curr = slow.next; slow.next = None\n    while curr:\n        nxt = curr.next; curr.next = prev; prev = curr; curr = nxt\n    first, second = head, prev\n    while second:\n        t1, t2 = first.next, second.next\n        first.next = second; second.next = t1\n        first, second = t1, t2\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(reorderList(...))\n",
      "javascript": "/**\n * 67. Reorder List\n * Difficulty: HARD | Topic: Find Middle, Reverse & Interleave\n * Optimal: O(N) time, O(1) space\n */\n\nconst fs = require('fs');\n\nfunction reorderList(head) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 67. Reorder List\n// Difficulty: HARD | Topic: Find Middle, Reverse & Interleave\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 67. Reorder List\n// Difficulty: HARD | Topic: Find Middle, Reverse & Interleave\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_068",
    "number": 68,
    "title": "Reverse Nodes in k-Group",
    "slug": "reverse-nodes-in-k-group",
    "topic_id": "topic_linked_lists",
    "subtopic": "Grouped Sublist Reversal",
    "difficulty": "HARD",
    "roadmap_stage": "Placement Revision",
    "companies": [
      "Amazon",
      "Microsoft",
      "Meta",
      "Google"
    ],
    "tags": [
      "linked lists"
    ],
    "description": "Given the head of a linked list, reverse the nodes of the list k at a time, and return the modified list.\n\nk is a positive integer and is less than or equal to the length of the linked list. If the number of nodes is not a multiple of k then left-out nodes, in the end, should remain as it is.",
    "input_format": "Line 1: space-separated integers\nLine 2: integer k",
    "output_format": "Modified space-separated list.",
    "constraints": [
      "The number of nodes in the list is n.",
      "1 <= k <= n <= 5000",
      "0 <= Node.val <= 1000"
    ],
    "examples": [
      {
        "input": "1 2 3 4 5\n2",
        "output": "2 1 4 3 5",
        "explanation": "Reverse pairs: [1,2]->[2,1], [3,4]->[4,3], 5 remains as is."
      },
      {
        "input": "1 2 3 4 5\n3",
        "output": "3 2 1 4 5"
      }
    ],
    "public_test_cases": [
      {
        "input": "1 2 3 4 5\n2",
        "output": "2 1 4 3 5"
      },
      {
        "input": "1 2 3 4 5\n3",
        "output": "3 2 1 4 5"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "1 2 3 4 5\n1",
        "output": "1 2 3 4 5"
      },
      {
        "input": "1 2 3 4 5\n5",
        "output": "5 4 3 2 1"
      }
    ],
    "hints": [
      "Check if there are at least k nodes remaining before attempting reversal.",
      "Reverse k nodes standardly.",
      "Connect the tail of the reversed group to the result of the recursive call on the next group."
    ],
    "optimal_complexity": {
      "time": "O(N)",
      "space": "O(1)"
    },
    "solution_explanation": "Count k nodes. If k nodes exist, reverse them and recursively attach the head to the result of processing the rest of the list.",
    "starter_code": {
      "python": "# 68. Reverse Nodes in k-Group\n# Difficulty: HARD | Topic: Grouped Sublist Reversal\n# Time Complexity Target: O(N) | Space Complexity Target: O(1)\n\nimport sys\nimport json\n\ndef reverseKGroup(head, k: int) -> ListNode:\n    \"\"\"\n    Given the head of a linked list, reverse the nodes of the list k at a time, and return the modified list.\n    \"\"\"\n    # TODO: Implement your solution here\n    curr = head\n    count = 0\n    while curr and count < k:\n        curr = curr.next\n        count += 1\n    if count == k:\n        prev = None\n        curr = head\n        for _ in range(k):\n            nxt = curr.next; curr.next = prev; prev = curr; curr = nxt\n        head.next = reverseKGroup(curr, k)\n        return prev\n    return head\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(reverseKGroup(...))\n",
      "javascript": "/**\n * 68. Reverse Nodes in k-Group\n * Difficulty: HARD | Topic: Grouped Sublist Reversal\n * Optimal: O(N) time, O(1) space\n */\n\nconst fs = require('fs');\n\nfunction reverseKGroup(head, k: int) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 68. Reverse Nodes in k-Group\n// Difficulty: HARD | Topic: Grouped Sublist Reversal\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 68. Reverse Nodes in k-Group\n// Difficulty: HARD | Topic: Grouped Sublist Reversal\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_prob_valid_parentheses",
    "number": 69,
    "title": "Valid Parentheses",
    "slug": "valid-parentheses",
    "topic_id": "topic_stacks_queues",
    "subtopic": "LIFO Bracket Matching",
    "difficulty": "EASY",
    "roadmap_stage": "Beginner Foundations",
    "companies": [
      "Amazon",
      "Apple",
      "Google",
      "Meta",
      "Microsoft"
    ],
    "tags": [
      "stacks queues"
    ],
    "description": "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.",
    "input_format": "A single line containing bracket string s.",
    "output_format": "true or false",
    "constraints": [
      "1 <= s.length <= 10^4",
      "s consists of parentheses only '()[]{}'."
    ],
    "examples": [
      {
        "input": "()",
        "output": "true"
      },
      {
        "input": "()[]{}",
        "output": "true"
      },
      {
        "input": "(]",
        "output": "false"
      }
    ],
    "public_test_cases": [
      {
        "input": "()",
        "output": "true"
      },
      {
        "input": "()[]{}",
        "output": "true"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "(]",
        "output": "false"
      },
      {
        "input": "([)]",
        "output": "false"
      },
      {
        "input": "{[]}",
        "output": "true"
      }
    ],
    "hints": [
      "Use a stack to keep track of unclosed opening brackets.",
      "Map closing brackets to their matching open bracket.",
      "When seeing an open bracket, push onto stack. When seeing close bracket, pop and verify match."
    ],
    "optimal_complexity": {
      "time": "O(N)",
      "space": "O(N)"
    },
    "solution_explanation": "Push open brackets onto a LIFO stack. Pop on closing bracket and verify match. True if stack is empty at completion.",
    "starter_code": {
      "python": "# 69. Valid Parentheses\n# Difficulty: EASY | Topic: LIFO Bracket Matching\n# Time Complexity Target: O(N) | Space Complexity Target: O(N)\n\nimport sys\nimport json\n\ndef isValidParentheses(s: str) -> bool:\n    \"\"\"\n    Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\n    \"\"\"\n    # TODO: Implement your solution here\n    mapping = {')': '(', '}': '{', ']': '['}\n    stack = []\n    for c in s:\n        if c in mapping:\n            top = stack.pop() if stack else '#'\n            if mapping[c] != top: return False\n        else:\n            stack.append(c)\n    return not stack\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(isValidParentheses(...))\n",
      "javascript": "/**\n * 69. Valid Parentheses\n * Difficulty: EASY | Topic: LIFO Bracket Matching\n * Optimal: O(N) time, O(N) space\n */\n\nconst fs = require('fs');\n\nfunction isValidParentheses(s: str) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 69. Valid Parentheses\n// Difficulty: EASY | Topic: LIFO Bracket Matching\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 69. Valid Parentheses\n// Difficulty: EASY | Topic: LIFO Bracket Matching\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_070",
    "number": 70,
    "title": "Implement Queue using Stacks",
    "slug": "implement-queue-using-stacks",
    "topic_id": "topic_stacks_queues",
    "subtopic": "Dual Stack FIFO Simulation",
    "difficulty": "EASY",
    "roadmap_stage": "Beginner Foundations",
    "companies": [
      "Amazon",
      "Microsoft",
      "Bloomberg"
    ],
    "tags": [
      "stacks queues"
    ],
    "description": "Implement a first in first out (FIFO) queue using only two stacks. The implemented queue should support all the functions of a normal queue (push, peek, pop, and empty).",
    "input_format": "Line 1: operation strings separated by space (push, pop, peek, empty)\nLine 2: arguments",
    "output_format": "Results of pop, peek, empty separated by space.",
    "constraints": [
      "1 <= x <= 9",
      "At most 100 calls will be made to push, pop, peek, and empty."
    ],
    "examples": [
      {
        "input": "push 1\npush 2\npeek\npop\nempty",
        "output": "1 1 false",
        "explanation": "queue: [1,2]. peek()=1. pop()=1. empty()=false."
      }
    ],
    "public_test_cases": [
      {
        "input": "push 1\npush 2\npeek\npop\nempty",
        "output": "1 1 false"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "push 5\npop\nempty",
        "output": "5 true"
      },
      {
        "input": "push 1\npush 2\npush 3\npop\npeek",
        "output": "1 2"
      }
    ],
    "hints": [
      "Use two stacks: in_stack for push, out_stack for pop/peek.",
      "When popping or peeking, if out_stack is empty, transfer all elements from in_stack to out_stack.",
      "Amortized time per operation is O(1)."
    ],
    "optimal_complexity": {
      "time": "O(1) amortized",
      "space": "O(N)"
    },
    "solution_explanation": "Two stacks: incoming items go to stack1; pop/peek pull from stack2. Reversing through stack2 preserves FIFO order in O(1) amortized time.",
    "starter_code": {
      "python": "# 70. Implement Queue using Stacks\n# Difficulty: EASY | Topic: Dual Stack FIFO Simulation\n# Time Complexity Target: O(1) amortized | Space Complexity Target: O(N)\n\nimport sys\nimport json\n\ndef MyQueue() -> :\n    \"\"\"\n    Implement a first in first out (FIFO) queue using only two stacks.\n    \"\"\"\n    # TODO: Implement your solution here\n    class MyQueue:\n    def __init__(self):\n        self.s1, self.s2 = [], []\n    def push(self, x: int) -> None:\n        self.s1.append(x)\n    def pop(self) -> int:\n        self.peek()\n        return self.s2.pop()\n    def peek(self) -> int:\n        if not self.s2:\n            while self.s1: self.s2.append(self.s1.pop())\n        return self.s2[-1]\n    def empty(self) -> bool:\n        return not self.s1 and not self.s2\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(MyQueue(...))\n",
      "javascript": "/**\n * 70. Implement Queue using Stacks\n * Difficulty: EASY | Topic: Dual Stack FIFO Simulation\n * Optimal: O(1) amortized time, O(N) space\n */\n\nconst fs = require('fs');\n\nfunction MyQueue() {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 70. Implement Queue using Stacks\n// Difficulty: EASY | Topic: Dual Stack FIFO Simulation\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 70. Implement Queue using Stacks\n// Difficulty: EASY | Topic: Dual Stack FIFO Simulation\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_071",
    "number": 71,
    "title": "Implement Stack using Queues",
    "slug": "implement-stack-using-queues",
    "topic_id": "topic_stacks_queues",
    "subtopic": "Single/Dual Queue LIFO Simulation",
    "difficulty": "EASY",
    "roadmap_stage": "Beginner Foundations",
    "companies": [
      "Amazon",
      "Apple",
      "Google"
    ],
    "tags": [
      "stacks queues"
    ],
    "description": "Implement a last-in-first-out (LIFO) stack using only two queues. The implemented stack should support all the functions of a normal stack (push, top, pop, and empty).",
    "input_format": "Series of stack operations.",
    "output_format": "Results of pop, top, empty.",
    "constraints": [
      "1 <= x <= 9",
      "At most 100 calls will be made."
    ],
    "examples": [
      {
        "input": "push 1\npush 2\ntop\npop\nempty",
        "output": "2 2 false"
      }
    ],
    "public_test_cases": [
      {
        "input": "push 1\npush 2\ntop\npop\nempty",
        "output": "2 2 false"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "push 10\npop\nempty",
        "output": "10 true"
      },
      {
        "input": "push 1\npush 2\npush 3\npop\ntop",
        "output": "3 2"
      }
    ],
    "hints": [
      "With a single queue: after enqueueing x, rotate the previous n - 1 elements to the back of the queue.",
      "This keeps the newly inserted element at the front of the queue.",
      "Pop and top can then be executed in O(1) time."
    ],
    "optimal_complexity": {
      "time": "O(N) push, O(1) pop",
      "space": "O(N)"
    },
    "solution_explanation": "On push, rotate the queue by len(q) - 1 times so the newest element is at the queue front. Pop and top become O(1).",
    "starter_code": {
      "python": "# 71. Implement Stack using Queues\n# Difficulty: EASY | Topic: Single/Dual Queue LIFO Simulation\n# Time Complexity Target: O(N) push, O(1) pop | Space Complexity Target: O(N)\n\nimport sys\nimport json\n\ndef MyStack() -> :\n    \"\"\"\n    Implement a last-in-first-out (LIFO) stack using only two queues.\n    \"\"\"\n    # TODO: Implement your solution here\n    from collections import deque\nclass MyStack:\n    def __init__(self):\n        self.q = deque()\n    def push(self, x: int) -> None:\n        self.q.append(x)\n        for _ in range(len(self.q) - 1):\n            self.q.append(self.q.popleft())\n    def pop(self) -> int:\n        return self.q.popleft()\n    def top(self) -> int:\n        return self.q[0]\n    def empty(self) -> bool:\n        return not self.q\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(MyStack(...))\n",
      "javascript": "/**\n * 71. Implement Stack using Queues\n * Difficulty: EASY | Topic: Single/Dual Queue LIFO Simulation\n * Optimal: O(N) push, O(1) pop time, O(N) space\n */\n\nconst fs = require('fs');\n\nfunction MyStack() {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 71. Implement Stack using Queues\n// Difficulty: EASY | Topic: Single/Dual Queue LIFO Simulation\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 71. Implement Stack using Queues\n// Difficulty: EASY | Topic: Single/Dual Queue LIFO Simulation\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_072",
    "number": 72,
    "title": "Next Greater Element I",
    "slug": "next-greater-element-i",
    "topic_id": "topic_stacks_queues",
    "subtopic": "Monotonic Decreasing Stack",
    "difficulty": "EASY",
    "roadmap_stage": "Beginner Foundations",
    "companies": [
      "Amazon",
      "Microsoft",
      "Meta"
    ],
    "tags": [
      "stacks queues"
    ],
    "description": "The next greater element of some element x in an array is the first greater element that is to the right of x in the same array.\n\nYou are given two distinct 0-indexed integer arrays nums1 and nums2, where nums1 is a subset of nums2.\n\nFor each 0 <= i < nums1.length, find the index j such that nums1[i] == nums2[j] and determine the next greater element of nums2[j] in nums2. If there is no next greater element, then the answer for this query is -1.",
    "input_format": "Line 1: space-separated integers nums1\nLine 2: space-separated integers nums2",
    "output_format": "Space-separated next greater elements for nums1.",
    "constraints": [
      "1 <= nums1.length <= nums2.length <= 1000",
      "0 <= nums1[i], nums2[i] <= 10^4",
      "All integers in nums1 and nums2 are unique."
    ],
    "examples": [
      {
        "input": "4 1 2\n1 3 4 2",
        "output": "-1 3 -1",
        "explanation": "For 4: no greater element. For 1: next greater is 3. For 2: no greater element."
      },
      {
        "input": "2 4\n1 2 3 4",
        "output": "3 -1"
      }
    ],
    "public_test_cases": [
      {
        "input": "4 1 2\n1 3 4 2",
        "output": "-1 3 -1"
      },
      {
        "input": "2 4\n1 2 3 4",
        "output": "3 -1"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "1\n1",
        "output": "-1"
      },
      {
        "input": "1 3 5 2 4\n6 5 4 3 2 1 7",
        "output": "7 7 7 7 7"
      }
    ],
    "hints": [
      "Use a monotonic decreasing stack over nums2.",
      "When encountering a number x greater than stack top, x is the next greater element for stack.pop(). Store this mapping in a hash map.",
      "Lookup each element of nums1 in the hash map."
    ],
    "optimal_complexity": {
      "time": "O(M + N)",
      "space": "O(N)"
    },
    "solution_explanation": "Monotonic stack over nums2: when a larger element is seen, pop elements and record mapping. Each number in nums1 is queried in O(1).",
    "starter_code": {
      "python": "# 72. Next Greater Element I\n# Difficulty: EASY | Topic: Monotonic Decreasing Stack\n# Time Complexity Target: O(M + N) | Space Complexity Target: O(N)\n\nimport sys\nimport json\n\ndef nextGreaterElement(nums1: list[int], nums2: list[int]) -> list[int]:\n    \"\"\"\n    The next greater element of some element x in an array is the first greater element that is to the right of x in the same array.\n    \"\"\"\n    # TODO: Implement your solution here\n    mapping = {}\n    stack = []\n    for n in nums2:\n        while stack and stack[-1] < n:\n            mapping[stack.pop()] = n\n        stack.append(n)\n    return [mapping.get(n, -1) for n in nums1]\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(nextGreaterElement(...))\n",
      "javascript": "/**\n * 72. Next Greater Element I\n * Difficulty: EASY | Topic: Monotonic Decreasing Stack\n * Optimal: O(M + N) time, O(N) space\n */\n\nconst fs = require('fs');\n\nfunction nextGreaterElement(nums1: list[int], nums2: list[int]) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 72. Next Greater Element I\n// Difficulty: EASY | Topic: Monotonic Decreasing Stack\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 72. Next Greater Element I\n// Difficulty: EASY | Topic: Monotonic Decreasing Stack\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_073",
    "number": 73,
    "title": "Min Stack",
    "slug": "min-stack",
    "topic_id": "topic_stacks_queues",
    "subtopic": "Dual Tracking / Running Min Stack",
    "difficulty": "MEDIUM",
    "roadmap_stage": "Core Patterns",
    "companies": [
      "Amazon",
      "Apple",
      "Google",
      "Bloomberg"
    ],
    "tags": [
      "stacks queues"
    ],
    "description": "Design a stack that supports push, pop, top, and retrieving the minimum element in constant time O(1).\n\nImplement the MinStack class:\n- MinStack() initializes the stack object.\n- void push(int val) pushes the element val onto the stack.\n- void pop() removes the element on the top of the stack.\n- int top() gets the top element of the stack.\n- int getMin() retrieves the minimum element in the stack.",
    "input_format": "Operations: push, pop, top, getMin",
    "output_format": "Outputs of getMin, top separated by space.",
    "constraints": [
      "-2^31 <= val <= 2^31 - 1",
      "Methods pop, top and getMin operations will always be called on non-empty stacks."
    ],
    "examples": [
      {
        "input": "push -2\npush 0\npush -3\ngetMin\npop\ntop\ngetMin",
        "output": "-3 0 -2"
      }
    ],
    "public_test_cases": [
      {
        "input": "push -2\npush 0\npush -3\ngetMin\npop\ntop\ngetMin",
        "output": "-3 0 -2"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "push 1\npush 2\ngetMin",
        "output": "1"
      },
      {
        "input": "push 0\npush 1\npush 0\ngetMin\npop\ngetMin",
        "output": "0 0"
      }
    ],
    "hints": [
      "Each stack element can be stored alongside the minimum seen up to that point as a tuple (val, current_min).",
      "Alternatively, use a parallel min_stack where min_stack[-1] is the current minimum.",
      "All operations run strictly in O(1) time."
    ],
    "optimal_complexity": {
      "time": "O(1) all operations",
      "space": "O(N)"
    },
    "solution_explanation": "Maintain parallel min_stack holding the running minimum corresponding to each height. Provides O(1) getMin without search.",
    "starter_code": {
      "python": "# 73. Min Stack\n# Difficulty: MEDIUM | Topic: Dual Tracking / Running Min Stack\n# Time Complexity Target: O(1) all operations | Space Complexity Target: O(N)\n\nimport sys\nimport json\n\ndef MinStack() -> :\n    \"\"\"\n    Design a stack that supports push, pop, top, and retrieving the minimum element in constant time O(1).\n    \"\"\"\n    # TODO: Implement your solution here\n    class MinStack:\n    def __init__(self):\n        self.stack = []\n        self.min_stack = []\n    def push(self, val: int) -> None:\n        self.stack.append(val)\n        m = val if not self.min_stack else min(val, self.min_stack[-1])\n        self.min_stack.append(m)\n    def pop(self) -> None:\n        self.stack.pop()\n        self.min_stack.pop()\n    def top(self) -> int:\n        return self.stack[-1]\n    def getMin(self) -> int:\n        return self.min_stack[-1]\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(MinStack(...))\n",
      "javascript": "/**\n * 73. Min Stack\n * Difficulty: MEDIUM | Topic: Dual Tracking / Running Min Stack\n * Optimal: O(1) all operations time, O(N) space\n */\n\nconst fs = require('fs');\n\nfunction MinStack() {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 73. Min Stack\n// Difficulty: MEDIUM | Topic: Dual Tracking / Running Min Stack\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 73. Min Stack\n// Difficulty: MEDIUM | Topic: Dual Tracking / Running Min Stack\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_074",
    "number": 74,
    "title": "Daily Temperatures",
    "slug": "daily-temperatures",
    "topic_id": "topic_stacks_queues",
    "subtopic": "Monotonic Stack Wait Days",
    "difficulty": "MEDIUM",
    "roadmap_stage": "Core Patterns",
    "companies": [
      "Amazon",
      "Meta",
      "Google"
    ],
    "tags": [
      "stacks queues"
    ],
    "description": "Given an array of integers temperatures represents the daily temperatures, return an array answer such that answer[i] is the number of days you have to wait after the ith day to get a warmer temperature. If there is no future day for which this is possible, keep answer[i] == 0 instead.",
    "input_format": "A single line of space-separated integers representing daily temperatures.",
    "output_format": "Space-separated integers representing waiting days.",
    "constraints": [
      "1 <= temperatures.length <= 10^5",
      "30 <= temperatures[i] <= 100"
    ],
    "examples": [
      {
        "input": "73 74 75 71 69 72 76 73",
        "output": "1 1 4 2 1 1 0 0"
      },
      {
        "input": "30 40 50 60",
        "output": "1 1 1 0"
      },
      {
        "input": "30 60 90",
        "output": "1 1 0"
      }
    ],
    "public_test_cases": [
      {
        "input": "73 74 75 71 69 72 76 73",
        "output": "1 1 4 2 1 1 0 0"
      },
      {
        "input": "30 40 50 60",
        "output": "1 1 1 0"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "30 60 90",
        "output": "1 1 0"
      },
      {
        "input": "50 50 50",
        "output": "0 0 0"
      }
    ],
    "hints": [
      "Store indices on a stack in decreasing order of temperature.",
      "When current day temperature is warmer than stack top day, pop and calculate wait time: current_day - popped_day.",
      "Push current day index onto stack."
    ],
    "optimal_complexity": {
      "time": "O(N)",
      "space": "O(N)"
    },
    "solution_explanation": "Monotonic decreasing stack of indices. When a warmer temperature is encountered, pop previous colder days and record the difference between indices.",
    "starter_code": {
      "python": "# 74. Daily Temperatures\n# Difficulty: MEDIUM | Topic: Monotonic Stack Wait Days\n# Time Complexity Target: O(N) | Space Complexity Target: O(N)\n\nimport sys\nimport json\n\ndef dailyTemperatures(temperatures: list[int]) -> list[int]:\n    \"\"\"\n    Given an array of integers temperatures represents the daily temperatures, return an array answer such that answer[i] is the number of days you have to wait after the ith day to get a warmer temperature.\n    \"\"\"\n    # TODO: Implement your solution here\n    n = len(temperatures)\n    ans = [0] * n\n    stack = []\n    for i, t in enumerate(temperatures):\n        while stack and temperatures[stack[-1]] < t:\n            prev = stack.pop()\n            ans[prev] = i - prev\n        stack.append(i)\n    return ans\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(dailyTemperatures(...))\n",
      "javascript": "/**\n * 74. Daily Temperatures\n * Difficulty: MEDIUM | Topic: Monotonic Stack Wait Days\n * Optimal: O(N) time, O(N) space\n */\n\nconst fs = require('fs');\n\nfunction dailyTemperatures(temperatures: list[int]) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 74. Daily Temperatures\n// Difficulty: MEDIUM | Topic: Monotonic Stack Wait Days\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 74. Daily Temperatures\n// Difficulty: MEDIUM | Topic: Monotonic Stack Wait Days\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_075",
    "number": 75,
    "title": "Evaluate Reverse Polish Notation",
    "slug": "evaluate-reverse-polish-notation",
    "topic_id": "topic_stacks_queues",
    "subtopic": "Postfix Stack Evaluation",
    "difficulty": "HARD",
    "roadmap_stage": "Placement Revision",
    "companies": [
      "Amazon",
      "Apple",
      "Google",
      "Microsoft"
    ],
    "tags": [
      "stacks queues"
    ],
    "description": "You are given an array of strings tokens that represents an arithmetic expression in a Reverse Polish Notation.\n\nEvaluate the expression. Return an integer that represents the value of the expression.\n\nNote that:\n- The valid operators are '+', '-', '*', and '/'.\n- Each operand may be an integer or another expression.\n- The division between two integers always truncates toward zero.",
    "input_format": "A single line of space-separated tokens.",
    "output_format": "Single integer result.",
    "constraints": [
      "1 <= tokens.length <= 10^4",
      "tokens[i] is either an operator or an integer in range [-200, 200]."
    ],
    "examples": [
      {
        "input": "2 1 + 3 *",
        "output": "9",
        "explanation": "((2 + 1) * 3) = 9."
      },
      {
        "input": "4 13 5 / +",
        "output": "6",
        "explanation": "(4 + (13 / 5)) = 6."
      },
      {
        "input": "10 6 9 3 + -11 * / * 17 + 5 +",
        "output": "22"
      }
    ],
    "public_test_cases": [
      {
        "input": "2 1 + 3 *",
        "output": "9"
      },
      {
        "input": "4 13 5 / +",
        "output": "6"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "10 6 9 3 + -11 * / * 17 + 5 +",
        "output": "22"
      },
      {
        "input": "3 -4 +",
        "output": "-1"
      }
    ],
    "hints": [
      "When encountering a number, push it onto stack.",
      "When encountering an operator, pop operand2 then operand1.",
      "Apply operator: operand1 OP operand2, and push result back. Remember Python integer division truncates towards zero via int(a / b)."
    ],
    "optimal_complexity": {
      "time": "O(N)",
      "space": "O(N)"
    },
    "solution_explanation": "Operands are pushed onto stack. Operators pop two operands, evaluate the arithmetic operation, and push result back.",
    "starter_code": {
      "python": "# 75. Evaluate Reverse Polish Notation\n# Difficulty: HARD | Topic: Postfix Stack Evaluation\n# Time Complexity Target: O(N) | Space Complexity Target: O(N)\n\nimport sys\nimport json\n\ndef evalRPN(tokens: list[str]) -> int:\n    \"\"\"\n    You are given an array of strings tokens that represents an arithmetic expression in a Reverse Polish Notation.\n    \"\"\"\n    # TODO: Implement your solution here\n    stack = []\n    for t in tokens:\n        if t in '+-*/':\n            b = stack.pop()\n            a = stack.pop()\n            if t == '+': stack.append(a + b)\n            elif t == '-': stack.append(a - b)\n            elif t == '*': stack.append(a * b)\n            else: stack.append(int(a / b))\n        else:\n            stack.append(int(t))\n    return stack[0]\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(evalRPN(...))\n",
      "javascript": "/**\n * 75. Evaluate Reverse Polish Notation\n * Difficulty: HARD | Topic: Postfix Stack Evaluation\n * Optimal: O(N) time, O(N) space\n */\n\nconst fs = require('fs');\n\nfunction evalRPN(tokens: list[str]) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 75. Evaluate Reverse Polish Notation\n// Difficulty: HARD | Topic: Postfix Stack Evaluation\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 75. Evaluate Reverse Polish Notation\n// Difficulty: HARD | Topic: Postfix Stack Evaluation\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_076",
    "number": 76,
    "title": "Largest Rectangle in Histogram",
    "slug": "largest-rectangle-in-histogram",
    "topic_id": "topic_stacks_queues",
    "subtopic": "Monotonic Increasing Stack Area",
    "difficulty": "HARD",
    "roadmap_stage": "Placement Revision",
    "companies": [
      "Google",
      "Amazon",
      "Apple",
      "Meta",
      "Microsoft"
    ],
    "tags": [
      "stacks queues"
    ],
    "description": "Given an array of integers heights representing the histogram's bar height where the width of each bar is 1, return the area of the largest rectangle in the histogram.",
    "input_format": "A single line of space-separated integers representing bar heights.",
    "output_format": "Single integer representing the largest rectangle area.",
    "constraints": [
      "1 <= heights.length <= 10^5",
      "0 <= heights[i] <= 10^4"
    ],
    "examples": [
      {
        "input": "2 1 5 6 2 3",
        "output": "10",
        "explanation": "The maximum area is 10 units (bars of height 5 and 6 with width 2)."
      },
      {
        "input": "2 4",
        "output": "4"
      }
    ],
    "public_test_cases": [
      {
        "input": "2 1 5 6 2 3",
        "output": "10"
      },
      {
        "input": "2 4",
        "output": "4"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "1",
        "output": "1"
      },
      {
        "input": "2 1 2",
        "output": "3"
      },
      {
        "input": "5 4 1 2",
        "output": "8"
      }
    ],
    "hints": [
      "A bar can extend as far left and right as bars are >= its own height.",
      "Use a monotonic increasing stack storing (index, height).",
      "When current height < stack top height, pop and calculate area with width = current_index - stack_top_index."
    ],
    "optimal_complexity": {
      "time": "O(N)",
      "space": "O(N)"
    },
    "solution_explanation": "Monotonic increasing stack tracks (start_index, height). When a shorter bar is encountered, pop taller bars and compute area bounded by popped height.",
    "starter_code": {
      "python": "# 76. Largest Rectangle in Histogram\n# Difficulty: HARD | Topic: Monotonic Increasing Stack Area\n# Time Complexity Target: O(N) | Space Complexity Target: O(N)\n\nimport sys\nimport json\n\ndef largestRectangleArea(heights: list[int]) -> int:\n    \"\"\"\n    Given an array of integers heights representing the histogram's bar height where the width of each bar is 1, return the area of the largest rectangle in the histogram.\n    \"\"\"\n    # TODO: Implement your solution here\n    stack = []\n    max_area = 0\n    heights.append(0)\n    for i, h in enumerate(heights):\n        start = i\n        while stack and stack[-1][1] > h:\n            idx, height = stack.pop()\n            max_area = max(max_area, height * (i - idx))\n            start = idx\n        stack.append((start, h))\n    return max_area\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(largestRectangleArea(...))\n",
      "javascript": "/**\n * 76. Largest Rectangle in Histogram\n * Difficulty: HARD | Topic: Monotonic Increasing Stack Area\n * Optimal: O(N) time, O(N) space\n */\n\nconst fs = require('fs');\n\nfunction largestRectangleArea(heights: list[int]) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 76. Largest Rectangle in Histogram\n// Difficulty: HARD | Topic: Monotonic Increasing Stack Area\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 76. Largest Rectangle in Histogram\n// Difficulty: HARD | Topic: Monotonic Increasing Stack Area\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_077",
    "number": 77,
    "title": "Power of Three",
    "slug": "power-of-three",
    "topic_id": "topic_recursion_backtracking",
    "subtopic": "Recursive Divisibility",
    "difficulty": "EASY",
    "roadmap_stage": "Beginner Foundations",
    "companies": [
      "Google",
      "Amazon"
    ],
    "tags": [
      "recursion backtracking"
    ],
    "description": "Given an integer n, return true if it is a power of three. Otherwise, return false.\n\nAn integer n is a power of three, if there exists an integer x such that n == 3^x.",
    "input_format": "A single integer n.",
    "output_format": "true or false",
    "constraints": [
      "-2^31 <= n <= 2^31 - 1"
    ],
    "examples": [
      {
        "input": "27",
        "output": "true",
        "explanation": "27 = 3^3."
      },
      {
        "input": "0",
        "output": "false"
      },
      {
        "input": "-1",
        "output": "false"
      }
    ],
    "public_test_cases": [
      {
        "input": "27",
        "output": "true"
      },
      {
        "input": "0",
        "output": "false"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "9",
        "output": "true"
      },
      {
        "input": "45",
        "output": "false"
      },
      {
        "input": "1",
        "output": "true"
      }
    ],
    "hints": [
      "Base cases: if n <= 0 return false; if n == 1 return true.",
      "If n % 3 != 0 return false.",
      "Recurse with n // 3."
    ],
    "optimal_complexity": {
      "time": "O(log3 N)",
      "space": "O(log3 N)"
    },
    "solution_explanation": "Repeatedly divide by 3 while divisible. If the remainder is 1, n is a power of three.",
    "starter_code": {
      "python": "# 77. Power of Three\n# Difficulty: EASY | Topic: Recursive Divisibility\n# Time Complexity Target: O(log3 N) | Space Complexity Target: O(log3 N)\n\nimport sys\nimport json\n\ndef isPowerOfThree(n: int) -> bool:\n    \"\"\"\n    Given an integer n, return true if it is a power of three.\n    \"\"\"\n    # TODO: Implement your solution here\n    if n <= 0: return False\n    while n % 3 == 0:\n        n //= 3\n    return n == 1\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(isPowerOfThree(...))\n",
      "javascript": "/**\n * 77. Power of Three\n * Difficulty: EASY | Topic: Recursive Divisibility\n * Optimal: O(log3 N) time, O(log3 N) space\n */\n\nconst fs = require('fs');\n\nfunction isPowerOfThree(n: int) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 77. Power of Three\n// Difficulty: EASY | Topic: Recursive Divisibility\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 77. Power of Three\n// Difficulty: EASY | Topic: Recursive Divisibility\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_078",
    "number": 78,
    "title": "Generate Parentheses",
    "slug": "generate-parentheses",
    "topic_id": "topic_recursion_backtracking",
    "subtopic": "Constrained Backtracking",
    "difficulty": "MEDIUM",
    "roadmap_stage": "Core Patterns",
    "companies": [
      "Amazon",
      "Apple",
      "Google",
      "Meta",
      "Microsoft"
    ],
    "tags": [
      "recursion backtracking"
    ],
    "description": "Given n pairs of parentheses, write a function to generate all combinations of well-formed parentheses.",
    "input_format": "A single integer n.",
    "output_format": "Each valid combination on a separate line.",
    "constraints": [
      "1 <= n <= 8"
    ],
    "examples": [
      {
        "input": "3",
        "output": "((()))\n(()())\n(())()\n()(())\n()()()"
      },
      {
        "input": "1",
        "output": "()"
      }
    ],
    "public_test_cases": [
      {
        "input": "3",
        "output": "((()))\n(()())\n(())()\n()(())\n()()()"
      },
      {
        "input": "1",
        "output": "()"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "2",
        "output": "(())\n()()"
      }
    ],
    "hints": [
      "Track open and close count.",
      "Only add '(' if open < n.",
      "Only add ')' if close < open."
    ],
    "optimal_complexity": {
      "time": "O(4^N / sqrt(N))",
      "space": "O(N)"
    },
    "solution_explanation": "Backtracking: branch on adding '(' when open < n, and adding ')' when close < open. Base case when string reaches 2n.",
    "starter_code": {
      "python": "# 78. Generate Parentheses\n# Difficulty: MEDIUM | Topic: Constrained Backtracking\n# Time Complexity Target: O(4^N / sqrt(N)) | Space Complexity Target: O(N)\n\nimport sys\nimport json\n\ndef generateParenthesis(n: int) -> list[str]:\n    \"\"\"\n    Given n pairs of parentheses, write a function to generate all combinations of well-formed parentheses.\n    \"\"\"\n    # TODO: Implement your solution here\n    res = []\n    def backtrack(curr, open_n, close_n):\n        if len(curr) == 2 * n:\n            res.append(curr)\n            return\n        if open_n < n:\n            backtrack(curr + '(', open_n + 1, close_n)\n        if close_n < open_n:\n            backtrack(curr + ')', open_n, close_n + 1)\n    backtrack('', 0, 0)\n    return res\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(generateParenthesis(...))\n",
      "javascript": "/**\n * 78. Generate Parentheses\n * Difficulty: MEDIUM | Topic: Constrained Backtracking\n * Optimal: O(4^N / sqrt(N)) time, O(N) space\n */\n\nconst fs = require('fs');\n\nfunction generateParenthesis(n: int) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 78. Generate Parentheses\n// Difficulty: MEDIUM | Topic: Constrained Backtracking\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 78. Generate Parentheses\n// Difficulty: MEDIUM | Topic: Constrained Backtracking\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_079",
    "number": 79,
    "title": "Subsets",
    "slug": "subsets",
    "topic_id": "topic_recursion_backtracking",
    "subtopic": "Power Set Generation",
    "difficulty": "MEDIUM",
    "roadmap_stage": "Core Patterns",
    "companies": [
      "Meta",
      "Amazon",
      "Google",
      "Microsoft"
    ],
    "tags": [
      "recursion backtracking"
    ],
    "description": "Given an integer array nums of unique elements, return all possible subsets (the power set).\n\nThe solution set must not contain duplicate subsets. Return the solution in any order.",
    "input_format": "A single line of space-separated integers representing nums.",
    "output_format": "Each subset on a separate line as space-separated integers.",
    "constraints": [
      "1 <= nums.length <= 10",
      "-10 <= nums[i] <= 10",
      "All the numbers of nums are unique."
    ],
    "examples": [
      {
        "input": "1 2 3",
        "output": "\n1\n2\n1 2\n3\n1 3\n2 3\n1 2 3"
      },
      {
        "input": "0",
        "output": "\n0"
      }
    ],
    "public_test_cases": [
      {
        "input": "1 2 3",
        "output": "\n1\n2\n1 2\n3\n1 3\n2 3\n1 2 3"
      },
      {
        "input": "0",
        "output": "\n0"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "1 2",
        "output": "\n1\n2\n1 2"
      }
    ],
    "hints": [
      "For each element, there are two choices: include it or exclude it.",
      "Decision tree branches of depth n generate 2^n subsets.",
      "Use recursion with an index pointer."
    ],
    "optimal_complexity": {
      "time": "O(N * 2^N)",
      "space": "O(N)"
    },
    "solution_explanation": "Recursive backtracking: at each index, branch into including nums[i] and excluding nums[i], generating all 2^N subsets.",
    "starter_code": {
      "python": "# 79. Subsets\n# Difficulty: MEDIUM | Topic: Power Set Generation\n# Time Complexity Target: O(N * 2^N) | Space Complexity Target: O(N)\n\nimport sys\nimport json\n\ndef subsets(nums: list[int]) -> list[list[int]]:\n    \"\"\"\n    Given an integer array nums of unique elements, return all possible subsets (the power set).\n    \"\"\"\n    # TODO: Implement your solution here\n    res = []\n    subset = []\n    def dfs(i):\n        if i >= len(nums):\n            res.append(list(subset))\n            return\n        subset.append(nums[i])\n        dfs(i + 1)\n        subset.pop()\n        dfs(i + 1)\n    dfs(0)\n    return res\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(subsets(...))\n",
      "javascript": "/**\n * 79. Subsets\n * Difficulty: MEDIUM | Topic: Power Set Generation\n * Optimal: O(N * 2^N) time, O(N) space\n */\n\nconst fs = require('fs');\n\nfunction subsets(nums: list[int]) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 79. Subsets\n// Difficulty: MEDIUM | Topic: Power Set Generation\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 79. Subsets\n// Difficulty: MEDIUM | Topic: Power Set Generation\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_080",
    "number": 80,
    "title": "Subsets II",
    "slug": "subsets-ii",
    "topic_id": "topic_recursion_backtracking",
    "subtopic": "Duplicate Pruning",
    "difficulty": "MEDIUM",
    "roadmap_stage": "Core Patterns",
    "companies": [
      "Amazon",
      "Meta",
      "Google"
    ],
    "tags": [
      "recursion backtracking"
    ],
    "description": "Given an integer array nums that may contain duplicates, return all possible subsets (the power set).\n\nThe solution set must not contain duplicate subsets. Return the solution in any order.",
    "input_format": "A single line of space-separated integers.",
    "output_format": "Each unique subset on a separate line as space-separated integers.",
    "constraints": [
      "1 <= nums.length <= 10",
      "-10 <= nums[i] <= 10"
    ],
    "examples": [
      {
        "input": "1 2 2",
        "output": "\n1\n1 2\n1 2 2\n2\n2 2"
      },
      {
        "input": "0",
        "output": "\n0"
      }
    ],
    "public_test_cases": [
      {
        "input": "1 2 2",
        "output": "\n1\n1 2\n1 2 2\n2\n2 2"
      },
      {
        "input": "0",
        "output": "\n0"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "4 4 4 1 4",
        "output": "\n1\n1 4\n1 4 4\n1 4 4 4\n1 4 4 4 4\n4\n4 4\n4 4 4\n4 4 4 4"
      }
    ],
    "hints": [
      "Sort the array first so duplicates are adjacent.",
      "When skipping an element, skip all duplicate instances of that element at the current level.",
      "This avoids generating duplicate branches in the recursion tree."
    ],
    "optimal_complexity": {
      "time": "O(N * 2^N)",
      "space": "O(N)"
    },
    "solution_explanation": "Sort array. When choosing not to include nums[i], skip all subsequent elements equal to nums[i] before branching.",
    "starter_code": {
      "python": "# 80. Subsets II\n# Difficulty: MEDIUM | Topic: Duplicate Pruning\n# Time Complexity Target: O(N * 2^N) | Space Complexity Target: O(N)\n\nimport sys\nimport json\n\ndef subsetsWithDup(nums: list[int]) -> list[list[int]]:\n    \"\"\"\n    Given an integer array nums that may contain duplicates, return all possible subsets (the power set).\n    \"\"\"\n    # TODO: Implement your solution here\n    nums.sort()\n    res = []\n    subset = []\n    def dfs(i):\n        if i >= len(nums):\n            res.append(list(subset))\n            return\n        subset.append(nums[i])\n        dfs(i + 1)\n        subset.pop()\n        while i + 1 < len(nums) and nums[i] == nums[i + 1]:\n            i += 1\n        dfs(i + 1)\n    dfs(0)\n    return res\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(subsetsWithDup(...))\n",
      "javascript": "/**\n * 80. Subsets II\n * Difficulty: MEDIUM | Topic: Duplicate Pruning\n * Optimal: O(N * 2^N) time, O(N) space\n */\n\nconst fs = require('fs');\n\nfunction subsetsWithDup(nums: list[int]) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 80. Subsets II\n// Difficulty: MEDIUM | Topic: Duplicate Pruning\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 80. Subsets II\n// Difficulty: MEDIUM | Topic: Duplicate Pruning\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_081",
    "number": 81,
    "title": "Permutations",
    "slug": "permutations",
    "topic_id": "topic_recursion_backtracking",
    "subtopic": "Complete State Permutation",
    "difficulty": "MEDIUM",
    "roadmap_stage": "Core Patterns",
    "companies": [
      "Amazon",
      "Apple",
      "Google",
      "Meta",
      "Microsoft"
    ],
    "tags": [
      "recursion backtracking"
    ],
    "description": "Given an array nums of distinct integers, return all the possible permutations. You can return the answer in any order.",
    "input_format": "A single line of space-separated distinct integers.",
    "output_format": "Each permutation on a separate line as space-separated integers.",
    "constraints": [
      "1 <= nums.length <= 6",
      "-10 <= nums[i] <= 10",
      "All the integers of nums are unique."
    ],
    "examples": [
      {
        "input": "1 2 3",
        "output": "1 2 3\n1 3 2\n2 1 3\n2 3 1\n3 1 2\n3 2 1"
      },
      {
        "input": "0 1",
        "output": "0 1\n1 0"
      },
      {
        "input": "1",
        "output": "1"
      }
    ],
    "public_test_cases": [
      {
        "input": "1 2 3",
        "output": "1 2 3\n1 3 2\n2 1 3\n2 3 1\n3 1 2\n3 2 1"
      },
      {
        "input": "0 1",
        "output": "0 1\n1 0"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "1",
        "output": "1"
      }
    ],
    "hints": [
      "Use backtracking or swapping in place.",
      "At index i, swap nums[i] with nums[j] for all j in i..n-1.",
      "Recurse on i + 1, then backtrack by swapping back."
    ],
    "optimal_complexity": {
      "time": "O(N * N!)",
      "space": "O(N)"
    },
    "solution_explanation": "In-place swapping generates all N! permutations with O(N) recursion stack and zero auxiliary array allocations.",
    "starter_code": {
      "python": "# 81. Permutations\n# Difficulty: MEDIUM | Topic: Complete State Permutation\n# Time Complexity Target: O(N * N!) | Space Complexity Target: O(N)\n\nimport sys\nimport json\n\ndef permute(nums: list[int]) -> list[list[int]]:\n    \"\"\"\n    Given an array nums of distinct integers, return all the possible permutations.\n    \"\"\"\n    # TODO: Implement your solution here\n    res = []\n    def backtrack(start):\n        if start == len(nums):\n            res.append(list(nums))\n            return\n        for i in range(start, len(nums)):\n            nums[start], nums[i] = nums[i], nums[start]\n            backtrack(start + 1)\n            nums[start], nums[i] = nums[i], nums[start]\n    backtrack(0)\n    return res\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(permute(...))\n",
      "javascript": "/**\n * 81. Permutations\n * Difficulty: MEDIUM | Topic: Complete State Permutation\n * Optimal: O(N * N!) time, O(N) space\n */\n\nconst fs = require('fs');\n\nfunction permute(nums: list[int]) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 81. Permutations\n// Difficulty: MEDIUM | Topic: Complete State Permutation\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 81. Permutations\n// Difficulty: MEDIUM | Topic: Complete State Permutation\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_082",
    "number": 82,
    "title": "Combination Sum",
    "slug": "combination-sum",
    "topic_id": "topic_recursion_backtracking",
    "subtopic": "Unlimited Multi-Choice Backtracking",
    "difficulty": "MEDIUM",
    "roadmap_stage": "Core Patterns",
    "companies": [
      "Amazon",
      "Apple",
      "Google",
      "Meta"
    ],
    "tags": [
      "recursion backtracking"
    ],
    "description": "Given an array of distinct integers candidates and a target integer target, return a list of all unique combinations of candidates where the chosen numbers sum to target. You may return the combinations in any order.\n\nThe same number may be chosen from candidates an unlimited number of times. Two combinations are unique if the frequency of at least one of the chosen numbers is different.",
    "input_format": "Line 1: space-separated integers candidates\nLine 2: target integer",
    "output_format": "Each combination on a separate line as space-separated integers.",
    "constraints": [
      "1 <= candidates.length <= 30",
      "2 <= candidates[i] <= 40",
      "All elements of candidates are distinct.",
      "1 <= target <= 40"
    ],
    "examples": [
      {
        "input": "2 3 6 7\n7",
        "output": "2 2 3\n7"
      },
      {
        "input": "2 3 5\n8",
        "output": "2 2 2 2\n2 3 3\n3 5"
      },
      {
        "input": "2\n1",
        "output": ""
      }
    ],
    "public_test_cases": [
      {
        "input": "2 3 6 7\n7",
        "output": "2 2 3\n7"
      },
      {
        "input": "2 3 5\n8",
        "output": "2 2 2 2\n2 3 3\n3 5"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "2\n1",
        "output": ""
      },
      {
        "input": "2 4\n6",
        "output": "2 2 2\n2 4"
      }
    ],
    "hints": [
      "Sort candidates to enable early break pruning.",
      "Since an element can be reused, recursive branch for inclusion stays at index i.",
      "Branch for exclusion moves to index i + 1."
    ],
    "optimal_complexity": {
      "time": "O(2^target)",
      "space": "O(target)"
    },
    "solution_explanation": "Backtrack with two choices at each step: reuse current candidate (stay at index i) or move to the next candidate (index i + 1).",
    "starter_code": {
      "python": "# 82. Combination Sum\n# Difficulty: MEDIUM | Topic: Unlimited Multi-Choice Backtracking\n# Time Complexity Target: O(2^target) | Space Complexity Target: O(target)\n\nimport sys\nimport json\n\ndef combinationSum(candidates: list[int], target: int) -> list[list[int]]:\n    \"\"\"\n    Given an array of distinct integers candidates and a target integer target, return a list of all unique combinations of candidates where the chosen numbers sum to target.\n    \"\"\"\n    # TODO: Implement your solution here\n    res = []\n    def dfs(i, cur, total):\n        if total == target:\n            res.append(list(cur))\n            return\n        if i >= len(candidates) or total > target:\n            return\n        cur.append(candidates[i])\n        dfs(i, cur, total + candidates[i])\n        cur.pop()\n        dfs(i + 1, cur, total)\n    dfs(0, [], 0)\n    return res\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(combinationSum(...))\n",
      "javascript": "/**\n * 82. Combination Sum\n * Difficulty: MEDIUM | Topic: Unlimited Multi-Choice Backtracking\n * Optimal: O(2^target) time, O(target) space\n */\n\nconst fs = require('fs');\n\nfunction combinationSum(candidates: list[int], target: int) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 82. Combination Sum\n// Difficulty: MEDIUM | Topic: Unlimited Multi-Choice Backtracking\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 82. Combination Sum\n// Difficulty: MEDIUM | Topic: Unlimited Multi-Choice Backtracking\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_083",
    "number": 83,
    "title": "Letter Combinations of a Phone Number",
    "slug": "letter-combinations-of-a-phone-number",
    "topic_id": "topic_recursion_backtracking",
    "subtopic": "Cartesian Mapping",
    "difficulty": "MEDIUM",
    "roadmap_stage": "Core Patterns",
    "companies": [
      "Amazon",
      "Google",
      "Meta",
      "Microsoft"
    ],
    "tags": [
      "recursion backtracking"
    ],
    "description": "Given a string containing digits from 2-9 inclusive, return all possible letter combinations that the number could represent. Return the answer in any order.\n\nA mapping of digits to letters (just like on the telephone buttons) is given below. Note that 1 does not map to any letters.\n2: abc, 3: def, 4: ghi, 5: jkl, 6: mno, 7: pqrs, 8: tuv, 9: wxyz.",
    "input_format": "A single line containing digit string.",
    "output_format": "Space-separated combination strings.",
    "constraints": [
      "0 <= digits.length <= 4",
      "digits[i] is a digit in the range ['2', '9']."
    ],
    "examples": [
      {
        "input": "23",
        "output": "ad ae af bd be bf cd ce cf"
      },
      {
        "input": "",
        "output": ""
      },
      {
        "input": "2",
        "output": "a b c"
      }
    ],
    "public_test_cases": [
      {
        "input": "23",
        "output": "ad ae af bd be bf cd ce cf"
      },
      {
        "input": "2",
        "output": "a b c"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "",
        "output": ""
      }
    ],
    "hints": [
      "Map each digit to its corresponding letter string.",
      "Use recursion to iterate through letters of the current digit.",
      "Append chosen letter and recurse on digit index + 1."
    ],
    "optimal_complexity": {
      "time": "O(4^N)",
      "space": "O(N)"
    },
    "solution_explanation": "Backtrack through each digit, exploring each mapped letter branch to produce all Cartesian product combinations.",
    "starter_code": {
      "python": "# 83. Letter Combinations of a Phone Number\n# Difficulty: MEDIUM | Topic: Cartesian Mapping\n# Time Complexity Target: O(4^N) | Space Complexity Target: O(N)\n\nimport sys\nimport json\n\ndef letterCombinations(digits: str) -> list[str]:\n    \"\"\"\n    Given a string containing digits from 2-9 inclusive, return all possible letter combinations that the number could represent.\n    \"\"\"\n    # TODO: Implement your solution here\n    if not digits: return []\n    mapping = {'2':'abc','3':'def','4':'ghi','5':'jkl','6':'mno','7':'pqrs','8':'tuv','9':'wxyz'}\n    res = []\n    def backtrack(i, cur):\n        if i == len(digits):\n            res.append(cur)\n            return\n        for c in mapping[digits[i]]:\n            backtrack(i + 1, cur + c)\n    backtrack(0, '')\n    return res\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(letterCombinations(...))\n",
      "javascript": "/**\n * 83. Letter Combinations of a Phone Number\n * Difficulty: MEDIUM | Topic: Cartesian Mapping\n * Optimal: O(4^N) time, O(N) space\n */\n\nconst fs = require('fs');\n\nfunction letterCombinations(digits: str) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 83. Letter Combinations of a Phone Number\n// Difficulty: MEDIUM | Topic: Cartesian Mapping\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 83. Letter Combinations of a Phone Number\n// Difficulty: MEDIUM | Topic: Cartesian Mapping\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_084",
    "number": 84,
    "title": "Word Search",
    "slug": "word-search",
    "topic_id": "topic_recursion_backtracking",
    "subtopic": "2D Grid DFS Backtracking",
    "difficulty": "HARD",
    "roadmap_stage": "Advanced Mastery",
    "companies": [
      "Amazon",
      "Apple",
      "Google",
      "Meta",
      "Microsoft"
    ],
    "tags": [
      "recursion backtracking"
    ],
    "description": "Given an m x n grid of characters board and a string word, return true if word exists in the grid.\n\nThe word can be constructed from letters of sequentially adjacent cells, where adjacent cells are horizontally or vertically neighboring. The same letter cell may not be used more than once.",
    "input_format": "Line 1: m n (rows cols)\nNext m lines: n space-separated characters\nLast line: target word",
    "output_format": "true or false",
    "constraints": [
      "m == board.length",
      "n = board[i].length",
      "1 <= m, n <= 6",
      "1 <= word.length <= 15"
    ],
    "examples": [
      {
        "input": "3 4\nA B C E\nS F C S\nA D E E\nABCCED",
        "output": "true"
      },
      {
        "input": "3 4\nA B C E\nS F C S\nA D E E\nSEE",
        "output": "true"
      },
      {
        "input": "3 4\nA B C E\nS F C S\nA D E E\nABCB",
        "output": "false"
      }
    ],
    "public_test_cases": [
      {
        "input": "3 4\nA B C E\nS F C S\nA D E E\nABCCED",
        "output": "true"
      },
      {
        "input": "3 4\nA B C E\nS F C S\nA D E E\nSEE",
        "output": "true"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "3 4\nA B C E\nS F C S\nA D E E\nABCB",
        "output": "false"
      },
      {
        "input": "1 1\nA\nA",
        "output": "true"
      }
    ],
    "hints": [
      "Iterate through all grid cells (r, c) as potential starting points.",
      "DFS in 4 directions: (r+1,c), (r-1,c), (r,c+1), (r,c-1).",
      "Mark current cell as visited (e.g. board[r][c] = '#') and restore character on return."
    ],
    "optimal_complexity": {
      "time": "O(M * N * 3^L)",
      "space": "O(L)"
    },
    "solution_explanation": "2D grid DFS: temporarily mutate cell to '#' to prevent reuse in the same path, recurse in 4 directions, and restore character during backtracking.",
    "starter_code": {
      "python": "# 84. Word Search\n# Difficulty: HARD | Topic: 2D Grid DFS Backtracking\n# Time Complexity Target: O(M * N * 3^L) | Space Complexity Target: O(L)\n\nimport sys\nimport json\n\ndef existWord(board: list[list[str]], word: str) -> bool:\n    \"\"\"\n    Given an m x n grid of characters board and a string word, return true if word exists in the grid.\n    \"\"\"\n    # TODO: Implement your solution here\n    R, C = len(board), len(board[0])\n    def dfs(r, c, i):\n        if i == len(word): return True\n        if r < 0 or r >= R or c < 0 or c >= C or board[r][c] != word[i]: return False\n        tmp, board[r][c] = board[r][c], '#'\n        res = (dfs(r+1, c, i+1) or dfs(r-1, c, i+1) or dfs(r, c+1, i+1) or dfs(r, c-1, i+1))\n        board[r][c] = tmp\n        return res\n    for r in range(R):\n        for c in range(C):\n            if dfs(r, c, 0): return True\n    return False\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(existWord(...))\n",
      "javascript": "/**\n * 84. Word Search\n * Difficulty: HARD | Topic: 2D Grid DFS Backtracking\n * Optimal: O(M * N * 3^L) time, O(L) space\n */\n\nconst fs = require('fs');\n\nfunction existWord(board: list[list[str]], word: str) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 84. Word Search\n// Difficulty: HARD | Topic: 2D Grid DFS Backtracking\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 84. Word Search\n// Difficulty: HARD | Topic: 2D Grid DFS Backtracking\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_085",
    "number": 85,
    "title": "N-Queens",
    "slug": "n-queens",
    "topic_id": "topic_recursion_backtracking",
    "subtopic": "Board State Pruning",
    "difficulty": "HARD",
    "roadmap_stage": "Placement Revision",
    "companies": [
      "Amazon",
      "Apple",
      "Google",
      "Meta"
    ],
    "tags": [
      "recursion backtracking"
    ],
    "description": "The n-queens puzzle is the problem of placing n queens on an n x n chessboard such that no two queens attack each other.\n\nGiven an integer n, return all distinct solutions to the n-queens puzzle. You may return the answer in any order.",
    "input_format": "A single integer n.",
    "output_format": "Count of distinct valid configurations followed by configurations.",
    "constraints": [
      "1 <= n <= 9"
    ],
    "examples": [
      {
        "input": "4",
        "output": "2\n.Q..\n...Q\nQ...\n..Q.\n---\n..Q.\nQ...\n...Q\n.Q..",
        "explanation": "There exist two distinct solutions to the 4-queens puzzle."
      },
      {
        "input": "1",
        "output": "1\nQ"
      }
    ],
    "public_test_cases": [
      {
        "input": "4",
        "output": "2\n.Q..\n...Q\nQ...\n..Q.\n---\n..Q.\nQ...\n...Q\n.Q.."
      },
      {
        "input": "1",
        "output": "1\nQ"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "2",
        "output": "0"
      },
      {
        "input": "3",
        "output": "0"
      }
    ],
    "hints": [
      "Place one queen per row.",
      "Maintain sets for columns, positive diagonals (r + c), and negative diagonals (r - c).",
      "If column or diagonal is already under attack, prune that branch."
    ],
    "optimal_complexity": {
      "time": "O(N!)",
      "space": "O(N)"
    },
    "solution_explanation": "Place one queen per row. Fast O(1) conflict validation using sets for column c, positive diagonal (r+c), and negative diagonal (r-c).",
    "starter_code": {
      "python": "# 85. N-Queens\n# Difficulty: HARD | Topic: Board State Pruning\n# Time Complexity Target: O(N!) | Space Complexity Target: O(N)\n\nimport sys\nimport json\n\ndef solveNQueens(n: int) -> list[list[str]]:\n    \"\"\"\n    The n-queens puzzle is the problem of placing n queens on an n x n chessboard such that no two queens attack each other.\n    \"\"\"\n    # TODO: Implement your solution here\n    col = set()\n    posDiag = set()\n    negDiag = set()\n    res = []\n    board = [['.'] * n for _ in range(n)]\n    def backtrack(r):\n        if r == n:\n            res.append([''.join(row) for row in board])\n            return\n        for c in range(n):\n            if c in col or (r + c) in posDiag or (r - c) in negDiag:\n                continue\n            col.add(c); posDiag.add(r + c); negDiag.add(r - c)\n            board[r][c] = 'Q'\n            backtrack(r + 1)\n            col.remove(c); posDiag.remove(r + c); negDiag.remove(r - c)\n            board[r][c] = '.'\n    backtrack(0)\n    return res\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(solveNQueens(...))\n",
      "javascript": "/**\n * 85. N-Queens\n * Difficulty: HARD | Topic: Board State Pruning\n * Optimal: O(N!) time, O(N) space\n */\n\nconst fs = require('fs');\n\nfunction solveNQueens(n: int) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 85. N-Queens\n// Difficulty: HARD | Topic: Board State Pruning\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 85. N-Queens\n// Difficulty: HARD | Topic: Board State Pruning\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_086",
    "number": 86,
    "title": "Sudoku Solver",
    "slug": "sudoku-solver",
    "topic_id": "topic_recursion_backtracking",
    "subtopic": "Exact Cover Backtracking",
    "difficulty": "HARD",
    "roadmap_stage": "Placement Revision",
    "companies": [
      "Amazon",
      "Google",
      "Microsoft"
    ],
    "tags": [
      "recursion backtracking"
    ],
    "description": "Write a program to solve a Sudoku puzzle by filling the empty cells.\n\nA sudoku solution must satisfy all of the following rules:\n1. Each of the digits 1-9 must occur exactly once in each row.\n2. Each of the digits 1-9 must occur exactly once in each column.\n3. Each of the digits 1-9 must occur exactly once in each of the 9 3x3 sub-boxes of the grid.",
    "input_format": "9 lines with 9 characters (digits 1-9 or '.' for empty cell).",
    "output_format": "9 lines of 9 digits representing solved board.",
    "constraints": [
      "board.length == 9",
      "board[i].length == 9",
      "board[i][j] is a digit '1'-'9' or '.'",
      "It is guaranteed that the input board has only one solution."
    ],
    "examples": [
      {
        "input": "5 3 . . 7 . . . .\n6 . . 1 9 5 . . .\n. 9 8 . . . . 6 .\n8 . . . 6 . . . 3\n4 . . 8 . 3 . . 1\n7 . . . 2 . . . 6\n. 6 . . . . 2 8 .\n. . . 4 1 9 . . 5\n. . . . 8 . . 7 9",
        "output": "5 3 4 6 7 8 9 1 2\n6 7 2 1 9 5 3 4 8\n1 9 8 3 4 2 5 6 7\n8 5 9 7 6 1 4 2 3\n4 2 6 8 5 3 7 9 1\n7 1 3 9 2 4 8 5 6\n9 6 1 5 3 7 2 8 4\n2 8 7 4 1 9 6 3 5\n3 4 5 2 8 6 1 7 9"
      }
    ],
    "public_test_cases": [
      {
        "input": "5 3 . . 7 . . . .\n6 . . 1 9 5 . . .\n. 9 8 . . . . 6 .\n8 . . . 6 . . . 3\n4 . . 8 . 3 . . 1\n7 . . . 2 . . . 6\n. 6 . . . . 2 8 .\n. . . 4 1 9 . . 5\n. . . . 8 . . 7 9",
        "output": "5 3 4 6 7 8 9 1 2\n6 7 2 1 9 5 3 4 8\n1 9 8 3 4 2 5 6 7\n8 5 9 7 6 1 4 2 3\n4 2 6 8 5 3 7 9 1\n7 1 3 9 2 4 8 5 6\n9 6 1 5 3 7 2 8 4\n2 8 7 4 1 9 6 3 5\n3 4 5 2 8 6 1 7 9"
      }
    ],
    "hidden_test_cases": [],
    "hints": [
      "Find the first empty cell.",
      "Try placing digits '1' through '9'.",
      "Verify that candidate digit is valid for current row, column, and 3x3 block before recursing."
    ],
    "optimal_complexity": {
      "time": "O(9^(empty cells))",
      "space": "O(81)"
    },
    "solution_explanation": "Backtracking search fills empty cells sequentially with digits 1-9, checking row, col, and 3x3 box validity.",
    "starter_code": {
      "python": "# 86. Sudoku Solver\n# Difficulty: HARD | Topic: Exact Cover Backtracking\n# Time Complexity Target: O(9^(empty cells)) | Space Complexity Target: O(81)\n\nimport sys\nimport json\n\ndef solveSudoku(board: list[list[str]]) -> None:\n    \"\"\"\n    Write a program to solve a Sudoku puzzle by filling the empty cells.\n    \"\"\"\n    # TODO: Implement your solution here\n    def isValid(r, c, ch):\n        for i in range(9):\n            if board[r][i] == ch: return False\n            if board[i][c] == ch: return False\n            if board[3 * (r // 3) + i // 3][3 * (c // 3) + i % 3] == ch: return False\n        return True\n    def solve():\n        for r in range(9):\n            for c in range(9):\n                if board[r][c] == '.':\n                    for ch in '123456789':\n                        if isValid(r, c, ch):\n                            board[r][c] = ch\n                            if solve(): return True\n                            board[r][c] = '.'\n                    return False\n        return True\n    solve()\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(solveSudoku(...))\n",
      "javascript": "/**\n * 86. Sudoku Solver\n * Difficulty: HARD | Topic: Exact Cover Backtracking\n * Optimal: O(9^(empty cells)) time, O(81) space\n */\n\nconst fs = require('fs');\n\nfunction solveSudoku(board: list[list[str]]) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 86. Sudoku Solver\n// Difficulty: HARD | Topic: Exact Cover Backtracking\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 86. Sudoku Solver\n// Difficulty: HARD | Topic: Exact Cover Backtracking\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_087",
    "number": 87,
    "title": "Maximum Depth of Binary Tree",
    "slug": "maximum-depth-of-binary-tree",
    "topic_id": "topic_trees_bst",
    "subtopic": "Tree Depth Recursion",
    "difficulty": "EASY",
    "roadmap_stage": "Beginner Foundations",
    "companies": [
      "Amazon",
      "Apple",
      "Google",
      "Meta",
      "Microsoft"
    ],
    "tags": [
      "trees bst"
    ],
    "description": "Given the root of a binary tree, return its maximum depth.\n\nA binary tree's maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.",
    "input_format": "A single line containing level-order tree node values (null for empty).",
    "output_format": "Single integer representing depth.",
    "constraints": [
      "The number of nodes in the tree is in the range [0, 10^4].",
      "-100 <= Node.val <= 100"
    ],
    "examples": [
      {
        "input": "3 9 20 null null 15 7",
        "output": "3",
        "explanation": "Longest path is 3 -> 20 -> 15 (depth 3)."
      },
      {
        "input": "1 null 2",
        "output": "2"
      }
    ],
    "public_test_cases": [
      {
        "input": "3 9 20 null null 15 7",
        "output": "3"
      },
      {
        "input": "1 null 2",
        "output": "2"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "",
        "output": "0"
      },
      {
        "input": "0",
        "output": "1"
      }
    ],
    "hints": [
      "Base case: if root is None, return 0.",
      "Recurse on left and right subtrees.",
      "Depth is 1 + max(maxDepth(root.left), maxDepth(root.right))."
    ],
    "optimal_complexity": {
      "time": "O(N)",
      "space": "O(Height)"
    },
    "solution_explanation": "Depth of a binary tree equals 1 + maximum depth of its left and right subtrees. Traversal is O(N) time.",
    "starter_code": {
      "python": "# 87. Maximum Depth of Binary Tree\n# Difficulty: EASY | Topic: Tree Depth Recursion\n# Time Complexity Target: O(N) | Space Complexity Target: O(Height)\n\nimport sys\nimport json\n\ndef maxDepth(root) -> int:\n    \"\"\"\n    Given the root of a binary tree, return its maximum depth.\n    \"\"\"\n    # TODO: Implement your solution here\n    if not root: return 0\n    return 1 + max(maxDepth(root.left), maxDepth(root.right))\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(maxDepth(...))\n",
      "javascript": "/**\n * 87. Maximum Depth of Binary Tree\n * Difficulty: EASY | Topic: Tree Depth Recursion\n * Optimal: O(N) time, O(Height) space\n */\n\nconst fs = require('fs');\n\nfunction maxDepth(root) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 87. Maximum Depth of Binary Tree\n// Difficulty: EASY | Topic: Tree Depth Recursion\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 87. Maximum Depth of Binary Tree\n// Difficulty: EASY | Topic: Tree Depth Recursion\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_088",
    "number": 88,
    "title": "Invert Binary Tree",
    "slug": "invert-binary-tree",
    "topic_id": "topic_trees_bst",
    "subtopic": "Subtree Pointer Swap",
    "difficulty": "EASY",
    "roadmap_stage": "Beginner Foundations",
    "companies": [
      "Google",
      "Amazon",
      "Apple",
      "Meta"
    ],
    "tags": [
      "trees bst"
    ],
    "description": "Given the root of a binary tree, invert the tree, and return its root.",
    "input_format": "Level-order traversal values.",
    "output_format": "Level-order traversal of inverted tree.",
    "constraints": [
      "The number of nodes in the tree is in the range [0, 100].",
      "-100 <= Node.val <= 100"
    ],
    "examples": [
      {
        "input": "4 2 7 1 3 6 9",
        "output": "4 7 2 9 6 3 1"
      },
      {
        "input": "2 1 3",
        "output": "2 3 1"
      },
      {
        "input": "",
        "output": ""
      }
    ],
    "public_test_cases": [
      {
        "input": "4 2 7 1 3 6 9",
        "output": "4 7 2 9 6 3 1"
      },
      {
        "input": "2 1 3",
        "output": "2 3 1"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "",
        "output": ""
      },
      {
        "input": "1",
        "output": "1"
      }
    ],
    "hints": [
      "Swap root.left and root.right.",
      "Recursively invert root.left and root.right.",
      "Base case: return None if root is None."
    ],
    "optimal_complexity": {
      "time": "O(N)",
      "space": "O(Height)"
    },
    "solution_explanation": "Swap the left and right child pointers at each node recursively. O(N) time and O(H) call stack.",
    "starter_code": {
      "python": "# 88. Invert Binary Tree\n# Difficulty: EASY | Topic: Subtree Pointer Swap\n# Time Complexity Target: O(N) | Space Complexity Target: O(Height)\n\nimport sys\nimport json\n\ndef invertTree(root) -> TreeNode:\n    \"\"\"\n    Given the root of a binary tree, invert the tree, and return its root.\n    \"\"\"\n    # TODO: Implement your solution here\n    if not root: return None\n    root.left, root.right = invertTree(root.right), invertTree(root.left)\n    return root\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(invertTree(...))\n",
      "javascript": "/**\n * 88. Invert Binary Tree\n * Difficulty: EASY | Topic: Subtree Pointer Swap\n * Optimal: O(N) time, O(Height) space\n */\n\nconst fs = require('fs');\n\nfunction invertTree(root) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 88. Invert Binary Tree\n// Difficulty: EASY | Topic: Subtree Pointer Swap\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 88. Invert Binary Tree\n// Difficulty: EASY | Topic: Subtree Pointer Swap\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_089",
    "number": 89,
    "title": "Same Tree",
    "slug": "same-tree",
    "topic_id": "topic_trees_bst",
    "subtopic": "Structural & Value Equivalence",
    "difficulty": "EASY",
    "roadmap_stage": "Beginner Foundations",
    "companies": [
      "Amazon",
      "Google",
      "Microsoft"
    ],
    "tags": [
      "trees bst"
    ],
    "description": "Given the roots of two binary trees p and q, write a function to check if they are the same or not.\n\nTwo binary trees are considered the same if they are structurally identical, and the nodes have the same value.",
    "input_format": "Line 1: level-order values of tree p\nLine 2: level-order values of tree q",
    "output_format": "true or false",
    "constraints": [
      "The number of nodes in both trees is in the range [0, 100].",
      "-10^4 <= Node.val <= 10^4"
    ],
    "examples": [
      {
        "input": "1 2 3\n1 2 3",
        "output": "true"
      },
      {
        "input": "1 2\n1 null 2",
        "output": "false"
      },
      {
        "input": "1 2 1\n1 1 2",
        "output": "false"
      }
    ],
    "public_test_cases": [
      {
        "input": "1 2 3\n1 2 3",
        "output": "true"
      },
      {
        "input": "1 2\n1 null 2",
        "output": "false"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "\n",
        "output": "true"
      },
      {
        "input": "1\n2",
        "output": "false"
      }
    ],
    "hints": [
      "If both nodes are None, return True.",
      "If exactly one node is None, return False.",
      "If values match, recurse on left and right subtrees."
    ],
    "optimal_complexity": {
      "time": "O(N)",
      "space": "O(Height)"
    },
    "solution_explanation": "Simultaneous DFS recursion: verify structural identity and matching node values across both trees.",
    "starter_code": {
      "python": "# 89. Same Tree\n# Difficulty: EASY | Topic: Structural & Value Equivalence\n# Time Complexity Target: O(N) | Space Complexity Target: O(Height)\n\nimport sys\nimport json\n\ndef isSameTree(p, q) -> bool:\n    \"\"\"\n    Given the roots of two binary trees p and q, write a function to check if they are the same or not.\n    \"\"\"\n    # TODO: Implement your solution here\n    if not p and not q: return True\n    if not p or not q or p.val != q.val: return False\n    return isSameTree(p.left, q.left) and isSameTree(p.right, q.right)\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(isSameTree(...))\n",
      "javascript": "/**\n * 89. Same Tree\n * Difficulty: EASY | Topic: Structural & Value Equivalence\n * Optimal: O(N) time, O(Height) space\n */\n\nconst fs = require('fs');\n\nfunction isSameTree(p, q) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 89. Same Tree\n// Difficulty: EASY | Topic: Structural & Value Equivalence\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 89. Same Tree\n// Difficulty: EASY | Topic: Structural & Value Equivalence\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_090",
    "number": 90,
    "title": "Symmetric Tree",
    "slug": "symmetric-tree",
    "topic_id": "topic_trees_bst",
    "subtopic": "Mirror Image Equivalence",
    "difficulty": "EASY",
    "roadmap_stage": "Beginner Foundations",
    "companies": [
      "Amazon",
      "Apple",
      "Google",
      "Microsoft"
    ],
    "tags": [
      "trees bst"
    ],
    "description": "Given the root of a binary tree, check whether it is a mirror of itself (i.e., symmetric around its center).",
    "input_format": "Level order traversal values.",
    "output_format": "true or false",
    "constraints": [
      "The number of nodes in the tree is in the range [1, 1000].",
      "-100 <= Node.val <= 100"
    ],
    "examples": [
      {
        "input": "1 2 2 3 4 4 3",
        "output": "true",
        "explanation": "Tree is symmetric about its center vertical axis."
      },
      {
        "input": "1 2 2 null 3 null 3",
        "output": "false"
      }
    ],
    "public_test_cases": [
      {
        "input": "1 2 2 3 4 4 3",
        "output": "true"
      },
      {
        "input": "1 2 2 null 3 null 3",
        "output": "false"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "1",
        "output": "true"
      },
      {
        "input": "1 2 3",
        "output": "false"
      }
    ],
    "hints": [
      "Two subtrees are mirrors if left.val == right.val.",
      "left.left must mirror right.right.",
      "left.right must mirror right.left."
    ],
    "optimal_complexity": {
      "time": "O(N)",
      "space": "O(Height)"
    },
    "solution_explanation": "Compare mirror branches: node1.left with node2.right and node1.right with node2.left.",
    "starter_code": {
      "python": "# 90. Symmetric Tree\n# Difficulty: EASY | Topic: Mirror Image Equivalence\n# Time Complexity Target: O(N) | Space Complexity Target: O(Height)\n\nimport sys\nimport json\n\ndef isSymmetric(root) -> bool:\n    \"\"\"\n    Given the root of a binary tree, check whether it is a mirror of itself (i.\n    \"\"\"\n    # TODO: Implement your solution here\n    def isMirror(t1, t2):\n        if not t1 and not t2: return True\n        if not t1 or not t2 or t1.val != t2.val: return False\n        return isMirror(t1.left, t2.right) and isMirror(t1.right, t2.left)\n    return isMirror(root.left, root.right) if root else True\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(isSymmetric(...))\n",
      "javascript": "/**\n * 90. Symmetric Tree\n * Difficulty: EASY | Topic: Mirror Image Equivalence\n * Optimal: O(N) time, O(Height) space\n */\n\nconst fs = require('fs');\n\nfunction isSymmetric(root) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 90. Symmetric Tree\n// Difficulty: EASY | Topic: Mirror Image Equivalence\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 90. Symmetric Tree\n// Difficulty: EASY | Topic: Mirror Image Equivalence\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_091",
    "number": 91,
    "title": "Diameter of Binary Tree",
    "slug": "diameter-of-binary-tree",
    "topic_id": "topic_trees_bst",
    "subtopic": "Longest Path Across Tree",
    "difficulty": "EASY",
    "roadmap_stage": "Beginner Foundations",
    "companies": [
      "Amazon",
      "Meta",
      "Google"
    ],
    "tags": [
      "trees bst"
    ],
    "description": "Given the root of a binary tree, return the length of the diameter of the tree.\n\nThe diameter of a binary tree is the length of the longest path between any two nodes in a tree. This path may or may not pass through the root.\n\nThe length of a path between two nodes is represented by the number of edges between them.",
    "input_format": "Level-order tree node values.",
    "output_format": "Single integer representing diameter.",
    "constraints": [
      "The number of nodes in the tree is in the range [1, 10^4].",
      "-100 <= Node.val <= 100"
    ],
    "examples": [
      {
        "input": "1 2 3 4 5",
        "output": "3",
        "explanation": "3 is the length of the path [4,2,1,3] or [5,2,1,3]."
      },
      {
        "input": "1 2",
        "output": "1"
      }
    ],
    "public_test_cases": [
      {
        "input": "1 2 3 4 5",
        "output": "3"
      },
      {
        "input": "1 2",
        "output": "1"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "1",
        "output": "0"
      }
    ],
    "hints": [
      "For every node, the longest path passing through it is (height(left) + height(right)).",
      "Maintain a global maximum diameter variable.",
      "Return 1 + max(height(left), height(right)) to the parent."
    ],
    "optimal_complexity": {
      "time": "O(N)",
      "space": "O(Height)"
    },
    "solution_explanation": "Post-order DFS computes height of each subtree while tracking the maximum path length (left_height + right_height) through any node.",
    "starter_code": {
      "python": "# 91. Diameter of Binary Tree\n# Difficulty: EASY | Topic: Longest Path Across Tree\n# Time Complexity Target: O(N) | Space Complexity Target: O(Height)\n\nimport sys\nimport json\n\ndef diameterOfBinaryTree(root) -> int:\n    \"\"\"\n    Given the root of a binary tree, return the length of the diameter of the tree.\n    \"\"\"\n    # TODO: Implement your solution here\n    diameter = 0\n    def height(node):\n        nonlocal diameter\n        if not node: return 0\n        lh = height(node.left)\n        rh = height(node.right)\n        diameter = max(diameter, lh + rh)\n        return 1 + max(lh, rh)\n    height(root)\n    return diameter\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(diameterOfBinaryTree(...))\n",
      "javascript": "/**\n * 91. Diameter of Binary Tree\n * Difficulty: EASY | Topic: Longest Path Across Tree\n * Optimal: O(N) time, O(Height) space\n */\n\nconst fs = require('fs');\n\nfunction diameterOfBinaryTree(root) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 91. Diameter of Binary Tree\n// Difficulty: EASY | Topic: Longest Path Across Tree\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 91. Diameter of Binary Tree\n// Difficulty: EASY | Topic: Longest Path Across Tree\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_092",
    "number": 92,
    "title": "Balanced Binary Tree",
    "slug": "balanced-binary-tree",
    "topic_id": "topic_trees_bst",
    "subtopic": "Height-Balanced Verification",
    "difficulty": "EASY",
    "roadmap_stage": "Beginner Foundations",
    "companies": [
      "Amazon",
      "Apple",
      "Google"
    ],
    "tags": [
      "trees bst"
    ],
    "description": "Given a binary tree, determine if it is height-balanced.\n\nA height-balanced binary tree is a binary tree in which the depth of the two subtrees of every node never differs by more than one.",
    "input_format": "Level order values.",
    "output_format": "true or false",
    "constraints": [
      "The number of nodes in the tree is in the range [0, 5000].",
      "-10^4 <= Node.val <= 10^4"
    ],
    "examples": [
      {
        "input": "3 9 20 null null 15 7",
        "output": "true"
      },
      {
        "input": "1 2 2 3 3 null null 4 4",
        "output": "false"
      },
      {
        "input": "",
        "output": "true"
      }
    ],
    "public_test_cases": [
      {
        "input": "3 9 20 null null 15 7",
        "output": "true"
      },
      {
        "input": "1 2 2 3 3 null null 4 4",
        "output": "false"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "",
        "output": "true"
      },
      {
        "input": "1",
        "output": "true"
      }
    ],
    "hints": [
      "Return -1 from subtree height function if it is unbalanced.",
      "If abs(height(left) - height(right)) > 1, mark as unbalanced.",
      "This checks balance in a single bottom-up O(N) pass."
    ],
    "optimal_complexity": {
      "time": "O(N)",
      "space": "O(Height)"
    },
    "solution_explanation": "Bottom-up DFS: return -1 immediately if any subtree violates the balance condition abs(lh - rh) <= 1.",
    "starter_code": {
      "python": "# 92. Balanced Binary Tree\n# Difficulty: EASY | Topic: Height-Balanced Verification\n# Time Complexity Target: O(N) | Space Complexity Target: O(Height)\n\nimport sys\nimport json\n\ndef isBalanced(root) -> bool:\n    \"\"\"\n    Given a binary tree, determine if it is height-balanced.\n    \"\"\"\n    # TODO: Implement your solution here\n    def check(node):\n        if not node: return 0\n        lh = check(node.left)\n        if lh == -1: return -1\n        rh = check(node.right)\n        if rh == -1: return -1\n        if abs(lh - rh) > 1: return -1\n        return 1 + max(lh, rh)\n    return check(root) != -1\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(isBalanced(...))\n",
      "javascript": "/**\n * 92. Balanced Binary Tree\n * Difficulty: EASY | Topic: Height-Balanced Verification\n * Optimal: O(N) time, O(Height) space\n */\n\nconst fs = require('fs');\n\nfunction isBalanced(root) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 92. Balanced Binary Tree\n// Difficulty: EASY | Topic: Height-Balanced Verification\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 92. Balanced Binary Tree\n// Difficulty: EASY | Topic: Height-Balanced Verification\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_093",
    "number": 93,
    "title": "Level Order Traversal",
    "slug": "level-order-traversal",
    "topic_id": "topic_trees_bst",
    "subtopic": "Breadth-First Queue Traversal",
    "difficulty": "MEDIUM",
    "roadmap_stage": "Core Patterns",
    "companies": [
      "Amazon",
      "Apple",
      "Google",
      "Meta",
      "Microsoft"
    ],
    "tags": [
      "trees bst"
    ],
    "description": "Given the root of a binary tree, return the level order traversal of its nodes' values. (i.e., from left to right, level by level).",
    "input_format": "Level-order tree node values.",
    "output_format": "Each level on a separate line with space-separated node values.",
    "constraints": [
      "The number of nodes in the tree is in the range [0, 2000].",
      "-1000 <= Node.val <= 1000"
    ],
    "examples": [
      {
        "input": "3 9 20 null null 15 7",
        "output": "3\n9 20\n15 7"
      },
      {
        "input": "1",
        "output": "1"
      },
      {
        "input": "",
        "output": ""
      }
    ],
    "public_test_cases": [
      {
        "input": "3 9 20 null null 15 7",
        "output": "3\n9 20\n15 7"
      },
      {
        "input": "1",
        "output": "1"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "",
        "output": ""
      }
    ],
    "hints": [
      "Use a queue to process nodes level by level (BFS).",
      "At each level, iterate len(queue) times to process all nodes belonging to the current depth.",
      "Enqueue non-null left and right children."
    ],
    "optimal_complexity": {
      "time": "O(N)",
      "space": "O(N)"
    },
    "solution_explanation": "Queue-based BFS processes one complete depth layer at a time by capturing the queue snapshot size.",
    "starter_code": {
      "python": "# 93. Level Order Traversal\n# Difficulty: MEDIUM | Topic: Breadth-First Queue Traversal\n# Time Complexity Target: O(N) | Space Complexity Target: O(N)\n\nimport sys\nimport json\n\ndef levelOrder(root) -> list[list[int]]:\n    \"\"\"\n    Given the root of a binary tree, return the level order traversal of its nodes' values.\n    \"\"\"\n    # TODO: Implement your solution here\n    from collections import deque\n    if not root: return []\n    q = deque([root])\n    res = []\n    while q:\n        level = []\n        for _ in range(len(q)):\n            node = q.popleft()\n            level.append(node.val)\n            if node.left: q.append(node.left)\n            if node.right: q.append(node.right)\n        res.append(level)\n    return res\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(levelOrder(...))\n",
      "javascript": "/**\n * 93. Level Order Traversal\n * Difficulty: MEDIUM | Topic: Breadth-First Queue Traversal\n * Optimal: O(N) time, O(N) space\n */\n\nconst fs = require('fs');\n\nfunction levelOrder(root) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 93. Level Order Traversal\n// Difficulty: MEDIUM | Topic: Breadth-First Queue Traversal\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 93. Level Order Traversal\n// Difficulty: MEDIUM | Topic: Breadth-First Queue Traversal\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_094",
    "number": 94,
    "title": "Right Side View",
    "slug": "right-side-view",
    "topic_id": "topic_trees_bst",
    "subtopic": "Level-Order Last Element",
    "difficulty": "MEDIUM",
    "roadmap_stage": "Core Patterns",
    "companies": [
      "Meta",
      "Amazon",
      "Google"
    ],
    "tags": [
      "trees bst"
    ],
    "description": "Given the root of a binary tree, imagine yourself standing on the right side of it, return the values of the nodes you can see ordered from top to bottom.",
    "input_format": "Level order tree values.",
    "output_format": "Space-separated node values visible from right side.",
    "constraints": [
      "The number of nodes in the tree is in the range [0, 100].",
      "-100 <= Node.val <= 100"
    ],
    "examples": [
      {
        "input": "1 2 3 null 5 null 4",
        "output": "1 3 4"
      },
      {
        "input": "1 null 3",
        "output": "1 3"
      },
      {
        "input": "",
        "output": ""
      }
    ],
    "public_test_cases": [
      {
        "input": "1 2 3 null 5 null 4",
        "output": "1 3 4"
      },
      {
        "input": "1 null 3",
        "output": "1 3"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "",
        "output": ""
      }
    ],
    "hints": [
      "BFS level-order: take the last element of each level.",
      "Alternatively, reverse pre-order DFS (visit root -> right -> left) and record the first node seen at each depth.",
      "The rightmost element at level L will always be the last element added to the BFS queue at that level."
    ],
    "optimal_complexity": {
      "time": "O(N)",
      "space": "O(N)"
    },
    "solution_explanation": "Level-order BFS appends the rightmost node at each depth tier.",
    "starter_code": {
      "python": "# 94. Right Side View\n# Difficulty: MEDIUM | Topic: Level-Order Last Element\n# Time Complexity Target: O(N) | Space Complexity Target: O(N)\n\nimport sys\nimport json\n\ndef rightSideView(root) -> list[int]:\n    \"\"\"\n    Given the root of a binary tree, imagine yourself standing on the right side of it, return the values of the nodes you can see ordered from top to bottom.\n    \"\"\"\n    # TODO: Implement your solution here\n    from collections import deque\n    if not root: return []\n    q = deque([root])\n    res = []\n    while q:\n        res.append(q[-1].val)\n        for _ in range(len(q)):\n            node = q.popleft()\n            if node.left: q.append(node.left)\n            if node.right: q.append(node.right)\n    return res\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(rightSideView(...))\n",
      "javascript": "/**\n * 94. Right Side View\n * Difficulty: MEDIUM | Topic: Level-Order Last Element\n * Optimal: O(N) time, O(N) space\n */\n\nconst fs = require('fs');\n\nfunction rightSideView(root) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 94. Right Side View\n// Difficulty: MEDIUM | Topic: Level-Order Last Element\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 94. Right Side View\n// Difficulty: MEDIUM | Topic: Level-Order Last Element\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_095",
    "number": 95,
    "title": "Lowest Common Ancestor of a Binary Tree",
    "slug": "lowest-common-ancestor-of-a-binary-tree",
    "topic_id": "topic_trees_bst",
    "subtopic": "Lowest Common Ancestor Search",
    "difficulty": "MEDIUM",
    "roadmap_stage": "Core Patterns",
    "companies": [
      "Amazon",
      "Meta",
      "Google",
      "Microsoft"
    ],
    "tags": [
      "trees bst"
    ],
    "description": "Given a binary tree, find the lowest common ancestor (LCA) of two given nodes in the tree.\n\nThe lowest common ancestor is defined between two nodes p and q as the lowest node in T that has both p and q as descendants (where we allow a node to be a descendant of itself).",
    "input_format": "Line 1: level order tree nodes\nLine 2: value of p\nLine 3: value of q",
    "output_format": "Integer value of the LCA node.",
    "constraints": [
      "The number of nodes in the tree is in the range [2, 10^5].",
      "-10^9 <= Node.val <= 10^9",
      "All Node.val are unique.",
      "p != q",
      "p and q will exist in the tree."
    ],
    "examples": [
      {
        "input": "3 5 1 6 2 0 8 null null 7 4\n5\n1",
        "output": "3",
        "explanation": "The LCA of nodes 5 and 1 is 3."
      },
      {
        "input": "3 5 1 6 2 0 8 null null 7 4\n5\n4",
        "output": "5",
        "explanation": "The LCA of nodes 5 and 4 is 5, since a node can be a descendant of itself."
      }
    ],
    "public_test_cases": [
      {
        "input": "3 5 1 6 2 0 8 null null 7 4\n5\n1",
        "output": "3"
      },
      {
        "input": "3 5 1 6 2 0 8 null null 7 4\n5\n4",
        "output": "5"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "1 2\n1\n2",
        "output": "1"
      }
    ],
    "hints": [
      "Base case: if root is None or root == p or root == q, return root.",
      "Recurse on left and right.",
      "If both left and right return non-null, current root is the LCA. Otherwise return the non-null branch."
    ],
    "optimal_complexity": {
      "time": "O(N)",
      "space": "O(Height)"
    },
    "solution_explanation": "If both subtrees report finding one of the targets, current node is their lowest common ancestor.",
    "starter_code": {
      "python": "# 95. Lowest Common Ancestor of a Binary Tree\n# Difficulty: MEDIUM | Topic: Lowest Common Ancestor Search\n# Time Complexity Target: O(N) | Space Complexity Target: O(Height)\n\nimport sys\nimport json\n\ndef lowestCommonAncestor(root, p, q) -> TreeNode:\n    \"\"\"\n    Given a binary tree, find the lowest common ancestor (LCA) of two given nodes in the tree.\n    \"\"\"\n    # TODO: Implement your solution here\n    if not root or root == p or root == q: return root\n    left = lowestCommonAncestor(root.left, p, q)\n    right = lowestCommonAncestor(root.right, p, q)\n    if left and right: return root\n    return left or right\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(lowestCommonAncestor(...))\n",
      "javascript": "/**\n * 95. Lowest Common Ancestor of a Binary Tree\n * Difficulty: MEDIUM | Topic: Lowest Common Ancestor Search\n * Optimal: O(N) time, O(Height) space\n */\n\nconst fs = require('fs');\n\nfunction lowestCommonAncestor(root, p, q) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 95. Lowest Common Ancestor of a Binary Tree\n// Difficulty: MEDIUM | Topic: Lowest Common Ancestor Search\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 95. Lowest Common Ancestor of a Binary Tree\n// Difficulty: MEDIUM | Topic: Lowest Common Ancestor Search\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_096",
    "number": 96,
    "title": "Validate Binary Search Tree",
    "slug": "validate-binary-search-tree",
    "topic_id": "topic_trees_bst",
    "subtopic": "BST Boundary Invariant",
    "difficulty": "MEDIUM",
    "roadmap_stage": "Core Patterns",
    "companies": [
      "Amazon",
      "Google",
      "Meta",
      "Bloomberg"
    ],
    "tags": [
      "trees bst"
    ],
    "description": "Given the root of a binary tree, determine if it is a valid binary search tree (BST).\n\nA valid BST is defined as follows:\n- The left subtree of a node contains only nodes with keys less than the node's key.\n- The right subtree of a node contains only nodes with keys greater than the node's key.\n- Both the left and right subtrees must also be binary search trees.",
    "input_format": "Level-order tree node values.",
    "output_format": "true or false",
    "constraints": [
      "The number of nodes in the tree is in the range [1, 10^4].",
      "-2^31 <= Node.val <= 2^31 - 1"
    ],
    "examples": [
      {
        "input": "2 1 3",
        "output": "true"
      },
      {
        "input": "5 1 4 null null 3 6",
        "output": "false",
        "explanation": "The root node's value is 5 but its right child's value is 4."
      }
    ],
    "public_test_cases": [
      {
        "input": "2 1 3",
        "output": "true"
      },
      {
        "input": "5 1 4 null null 3 6",
        "output": "false"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "2 2 2",
        "output": "false"
      },
      {
        "input": "10 5 15 null null 6 20",
        "output": "false"
      }
    ],
    "hints": [
      "Checking only immediate children is not sufficient: every node in the left subtree must be < root.",
      "Pass allowable min and max bounds down the recursion: (low, high).",
      "Left child must satisfy (low, root.val); right child must satisfy (root.val, high)."
    ],
    "optimal_complexity": {
      "time": "O(N)",
      "space": "O(Height)"
    },
    "solution_explanation": "Propagate valid interval bounds (low, high) down the recursive tree. Every node value must strictly lie within its assigned range.",
    "starter_code": {
      "python": "# 96. Validate Binary Search Tree\n# Difficulty: MEDIUM | Topic: BST Boundary Invariant\n# Time Complexity Target: O(N) | Space Complexity Target: O(Height)\n\nimport sys\nimport json\n\ndef isValidBST(root) -> bool:\n    \"\"\"\n    Given the root of a binary tree, determine if it is a valid binary search tree (BST).\n    \"\"\"\n    # TODO: Implement your solution here\n    def validate(node, low, high):\n        if not node: return True\n        if not (low < node.val < high): return False\n        return validate(node.left, low, node.val) and validate(node.right, node.val, high)\n    return validate(root, float('-inf'), float('inf'))\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(isValidBST(...))\n",
      "javascript": "/**\n * 96. Validate Binary Search Tree\n * Difficulty: MEDIUM | Topic: BST Boundary Invariant\n * Optimal: O(N) time, O(Height) space\n */\n\nconst fs = require('fs');\n\nfunction isValidBST(root) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 96. Validate Binary Search Tree\n// Difficulty: MEDIUM | Topic: BST Boundary Invariant\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 96. Validate Binary Search Tree\n// Difficulty: MEDIUM | Topic: BST Boundary Invariant\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_097",
    "number": 97,
    "title": "Kth Smallest Element in a BST",
    "slug": "kth-smallest-element-in-a-bst",
    "topic_id": "topic_trees_bst",
    "subtopic": "In-Order Traversal",
    "difficulty": "MEDIUM",
    "roadmap_stage": "Core Patterns",
    "companies": [
      "Amazon",
      "Google",
      "Uber"
    ],
    "tags": [
      "trees bst"
    ],
    "description": "Given the root of a binary search tree, and an integer k, return the kth smallest value (1-indexed) of all the values of the nodes in the tree.",
    "input_format": "Line 1: level-order BST node values\nLine 2: integer k",
    "output_format": "Single integer representing kth smallest element.",
    "constraints": [
      "The number of nodes in the tree is n.",
      "1 <= k <= n <= 10^4",
      "0 <= Node.val <= 10^4"
    ],
    "examples": [
      {
        "input": "3 1 4 null 2\n1",
        "output": "1"
      },
      {
        "input": "5 3 6 2 4 null null 1\n3",
        "output": "3"
      }
    ],
    "public_test_cases": [
      {
        "input": "3 1 4 null 2\n1",
        "output": "1"
      },
      {
        "input": "5 3 6 2 4 null null 1\n3",
        "output": "3"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "1\n1",
        "output": "1"
      }
    ],
    "hints": [
      "In-order traversal of a BST yields values in strictly ascending order.",
      "Iterative in-order traversal using a stack allows early stopping as soon as the kth element is popped.",
      "Return value of the kth node visited."
    ],
    "optimal_complexity": {
      "time": "O(H + K)",
      "space": "O(Height)"
    },
    "solution_explanation": "In-order traversal visits BST nodes in sorted order. Early terminate when the kth element is processed.",
    "starter_code": {
      "python": "# 97. Kth Smallest Element in a BST\n# Difficulty: MEDIUM | Topic: In-Order Traversal\n# Time Complexity Target: O(H + K) | Space Complexity Target: O(Height)\n\nimport sys\nimport json\n\ndef kthSmallest(root, k: int) -> int:\n    \"\"\"\n    Given the root of a binary search tree, and an integer k, return the kth smallest value (1-indexed) of all the values of the nodes in the tree.\n    \"\"\"\n    # TODO: Implement your solution here\n    stack = []\n    curr = root\n    while curr or stack:\n        while curr:\n            stack.append(curr)\n            curr = curr.left\n        curr = stack.pop()\n        k -= 1\n        if k == 0: return curr.val\n        curr = curr.right\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(kthSmallest(...))\n",
      "javascript": "/**\n * 97. Kth Smallest Element in a BST\n * Difficulty: MEDIUM | Topic: In-Order Traversal\n * Optimal: O(H + K) time, O(Height) space\n */\n\nconst fs = require('fs');\n\nfunction kthSmallest(root, k: int) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 97. Kth Smallest Element in a BST\n// Difficulty: MEDIUM | Topic: In-Order Traversal\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 97. Kth Smallest Element in a BST\n// Difficulty: MEDIUM | Topic: In-Order Traversal\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_098",
    "number": 98,
    "title": "Construct Tree From Preorder and Inorder Traversal",
    "slug": "construct-tree-from-preorder-and-inorder-traversal",
    "topic_id": "topic_trees_bst",
    "subtopic": "Traversal Reconstruction",
    "difficulty": "MEDIUM",
    "roadmap_stage": "Core Patterns",
    "companies": [
      "Amazon",
      "Microsoft",
      "Meta"
    ],
    "tags": [
      "trees bst"
    ],
    "description": "Given two integer arrays preorder and inorder where preorder is the preorder traversal of a binary tree and inorder is the inorder traversal of the same tree, construct and return the binary tree.",
    "input_format": "Line 1: space-separated integers for preorder\nLine 2: space-separated integers for inorder",
    "output_format": "Level-order traversal of the reconstructed tree.",
    "constraints": [
      "1 <= preorder.length <= 3000",
      "inorder.length == preorder.length",
      "-3000 <= preorder[i], inorder[i] <= 3000",
      "preorder and inorder consist of unique values."
    ],
    "examples": [
      {
        "input": "3 9 20 15 7\n9 3 15 20 7",
        "output": "3 9 20 null null 15 7"
      },
      {
        "input": "-1\n-1",
        "output": "-1"
      }
    ],
    "public_test_cases": [
      {
        "input": "3 9 20 15 7\n9 3 15 20 7",
        "output": "3 9 20 null null 15 7"
      },
      {
        "input": "-1\n-1",
        "output": "-1"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "1 2\n2 1",
        "output": "1 2"
      }
    ],
    "hints": [
      "First element in preorder is always the root of the current subtree.",
      "Locate root value in inorder array: all elements to the left belong to the left subtree, elements to the right belong to right subtree.",
      "Use a hash map to map inorder values to indices for O(1) partition lookups."
    ],
    "optimal_complexity": {
      "time": "O(N)",
      "space": "O(N)"
    },
    "solution_explanation": "Preorder supplies root nodes sequentially; inorder partitions left and right subtrees. Index lookup map provides O(N) reconstruction.",
    "starter_code": {
      "python": "# 98. Construct Tree From Preorder and Inorder Traversal\n# Difficulty: MEDIUM | Topic: Traversal Reconstruction\n# Time Complexity Target: O(N) | Space Complexity Target: O(N)\n\nimport sys\nimport json\n\ndef buildTree(preorder: list[int], inorder: list[int]) -> TreeNode:\n    \"\"\"\n    Given two integer arrays preorder and inorder where preorder is the preorder traversal of a binary tree and inorder is the inorder traversal of the same tree, construct and return the binary tree.\n    \"\"\"\n    # TODO: Implement your solution here\n    in_map = {v: i for i, v in enumerate(inorder)}\n    pre_idx = 0\n    def build(in_left, in_right):\n        nonlocal pre_idx\n        if in_left > in_right: return None\n        val = preorder[pre_idx]\n        pre_idx += 1\n        root = TreeNode(val)\n        mid = in_map[val]\n        root.left = build(in_left, mid - 1)\n        root.right = build(mid + 1, in_right)\n        return root\n    return build(0, len(inorder) - 1)\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(buildTree(...))\n",
      "javascript": "/**\n * 98. Construct Tree From Preorder and Inorder Traversal\n * Difficulty: MEDIUM | Topic: Traversal Reconstruction\n * Optimal: O(N) time, O(N) space\n */\n\nconst fs = require('fs');\n\nfunction buildTree(preorder: list[int], inorder: list[int]) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 98. Construct Tree From Preorder and Inorder Traversal\n// Difficulty: MEDIUM | Topic: Traversal Reconstruction\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 98. Construct Tree From Preorder and Inorder Traversal\n// Difficulty: MEDIUM | Topic: Traversal Reconstruction\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_099",
    "number": 99,
    "title": "Binary Tree Maximum Path Sum",
    "slug": "binary-tree-maximum-path-sum",
    "topic_id": "topic_trees_bst",
    "subtopic": "Post-Order Subtree Gain",
    "difficulty": "HARD",
    "roadmap_stage": "Placement Revision",
    "companies": [
      "Meta",
      "Amazon",
      "Google",
      "Microsoft"
    ],
    "tags": [
      "trees bst"
    ],
    "description": "A path in a binary tree is a sequence of nodes where each pair of adjacent nodes in the sequence has an edge connecting them. A node can only appear in the sequence at most once. Note that the path does not need to pass through the root.\n\nThe path sum of a path is the sum of the node's values in the path.\n\nGiven the root of a binary tree, return the maximum path sum of any non-empty path.",
    "input_format": "Level-order tree node values.",
    "output_format": "Single integer representing maximum path sum.",
    "constraints": [
      "The number of nodes in the tree is in the range [1, 3 * 10^4].",
      "-1000 <= Node.val <= 1000"
    ],
    "examples": [
      {
        "input": "1 2 3",
        "output": "6",
        "explanation": "The optimal path is 2 -> 1 -> 3 with path sum 2 + 1 + 3 = 6."
      },
      {
        "input": "-10 9 20 null null 15 7",
        "output": "42",
        "explanation": "The optimal path is 15 -> 20 -> 7 with path sum 15 + 20 + 7 = 42."
      }
    ],
    "public_test_cases": [
      {
        "input": "1 2 3",
        "output": "6"
      },
      {
        "input": "-10 9 20 null null 15 7",
        "output": "42"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "-3",
        "output": "-3"
      },
      {
        "input": "2 -1",
        "output": "2"
      }
    ],
    "hints": [
      "For each node, compute the maximum contribution it can gain from left and right subtrees (clamp negative gains to 0).",
      "At each node, update the global max path sum: node.val + left_gain + right_gain.",
      "Return to parent: node.val + max(left_gain, right_gain)."
    ],
    "optimal_complexity": {
      "time": "O(N)",
      "space": "O(Height)"
    },
    "solution_explanation": "Post-order DFS calculates maximum branch contribution from child subtrees. Negative branch sums are pruned to 0.",
    "starter_code": {
      "python": "# 99. Binary Tree Maximum Path Sum\n# Difficulty: HARD | Topic: Post-Order Subtree Gain\n# Time Complexity Target: O(N) | Space Complexity Target: O(Height)\n\nimport sys\nimport json\n\ndef maxPathSum(root) -> int:\n    \"\"\"\n    A path in a binary tree is a sequence of nodes where each pair of adjacent nodes in the sequence has an edge connecting them.\n    \"\"\"\n    # TODO: Implement your solution here\n    max_sum = float('-inf')\n    def maxGain(node):\n        nonlocal max_sum\n        if not node: return 0\n        left_gain = max(maxGain(node.left), 0)\n        right_gain = max(maxGain(node.right), 0)\n        max_sum = max(max_sum, node.val + left_gain + right_gain)\n        return node.val + max(left_gain, right_gain)\n    maxGain(root)\n    return max_sum\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(maxPathSum(...))\n",
      "javascript": "/**\n * 99. Binary Tree Maximum Path Sum\n * Difficulty: HARD | Topic: Post-Order Subtree Gain\n * Optimal: O(N) time, O(Height) space\n */\n\nconst fs = require('fs');\n\nfunction maxPathSum(root) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 99. Binary Tree Maximum Path Sum\n// Difficulty: HARD | Topic: Post-Order Subtree Gain\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 99. Binary Tree Maximum Path Sum\n// Difficulty: HARD | Topic: Post-Order Subtree Gain\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_100",
    "number": 100,
    "title": "Serialize and Deserialize Binary Tree",
    "slug": "serialize-and-deserialize-binary-tree",
    "topic_id": "topic_trees_bst",
    "subtopic": "Pre-Order Stream Serialization",
    "difficulty": "HARD",
    "roadmap_stage": "Placement Revision",
    "companies": [
      "Amazon",
      "Google",
      "Meta",
      "Microsoft"
    ],
    "tags": [
      "trees bst"
    ],
    "description": "Serialization is the process of converting a data structure or object into a sequence of bits so that it can be stored in a file or memory buffer, or transmitted across a network connection link to be reconstructed later in the same or another computer environment.\n\nDesign an algorithm to serialize and deserialize a binary tree.",
    "input_format": "Level-order tree values.",
    "output_format": "Reconstructed tree level-order values.",
    "constraints": [
      "The number of nodes in the tree is in the range [0, 10^4].",
      "-1000 <= Node.val <= 1000"
    ],
    "examples": [
      {
        "input": "1 2 3 null null 4 5",
        "output": "1 2 3 null null 4 5"
      },
      {
        "input": "",
        "output": ""
      }
    ],
    "public_test_cases": [
      {
        "input": "1 2 3 null null 4 5",
        "output": "1 2 3 null null 4 5"
      },
      {
        "input": "",
        "output": ""
      }
    ],
    "hidden_test_cases": [
      {
        "input": "1",
        "output": "1"
      }
    ],
    "hints": [
      "Preorder traversal with sentinel value '#' for null nodes is simple to deserialize recursively.",
      "Deserialize: read tokens one by one. If token == '#', return None.",
      "Otherwise create node(token), then recurse left and right."
    ],
    "optimal_complexity": {
      "time": "O(N)",
      "space": "O(N)"
    },
    "solution_explanation": "Pre-order DFS serialization encodes structural null sentinels '#'. Reconstruction iterates through preorder tokens recursively in linear time.",
    "starter_code": {
      "python": "# 100. Serialize and Deserialize Binary Tree\n# Difficulty: HARD | Topic: Pre-Order Stream Serialization\n# Time Complexity Target: O(N) | Space Complexity Target: O(N)\n\nimport sys\nimport json\n\ndef Codec() -> :\n    \"\"\"\n    Serialization is the process of converting a data structure or object into a sequence of bits so that it can be stored in a file or memory buffer, or transmitted across a network connection link to be reconstructed later in the same or another computer environment.\n    \"\"\"\n    # TODO: Implement your solution here\n    class Codec:\n    def serialize(self, root):\n        res = []\n        def dfs(node):\n            if not node: res.append('#'); return\n            res.append(str(node.val))\n            dfs(node.left)\n            dfs(node.right)\n        dfs(root)\n        return ' '.join(res)\n    def deserialize(self, data):\n        vals = iter(data.split())\n        def dfs():\n            val = next(vals)\n            if val == '#': return None\n            node = TreeNode(int(val))\n            node.left = dfs()\n            node.right = dfs()\n            return node\n        return dfs()\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(Codec(...))\n",
      "javascript": "/**\n * 100. Serialize and Deserialize Binary Tree\n * Difficulty: HARD | Topic: Pre-Order Stream Serialization\n * Optimal: O(N) time, O(N) space\n */\n\nconst fs = require('fs');\n\nfunction Codec() {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 100. Serialize and Deserialize Binary Tree\n// Difficulty: HARD | Topic: Pre-Order Stream Serialization\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 100. Serialize and Deserialize Binary Tree\n// Difficulty: HARD | Topic: Pre-Order Stream Serialization\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_101",
    "number": 101,
    "title": "Kth Largest Element in a Stream",
    "slug": "kth-largest-element-in-a-stream",
    "topic_id": "topic_heaps",
    "subtopic": "Fixed-Capacity Min-Heap",
    "difficulty": "EASY",
    "roadmap_stage": "Beginner Foundations",
    "companies": [
      "Amazon",
      "Apple",
      "Google"
    ],
    "tags": [
      "heaps"
    ],
    "description": "Design a class to find the kth largest element in a stream. Note that it is the kth largest element in the sorted order, not the kth distinct element.\n\nImplement KthLargest class:\n- KthLargest(int k, int[] nums) Initializes the object with the integer k and the stream of integers nums.\n- int add(int val) Appends the integer val to the stream and returns the element representing the kth largest element in the stream.",
    "input_format": "Line 1: k\nLine 2: initial array nums\nLine 3: stream numbers to add",
    "output_format": "Space-separated kth largest values after each add.",
    "constraints": [
      "1 <= k <= 10^4",
      "0 <= nums.length <= 10^4",
      "-10^4 <= nums[i] <= 10^4"
    ],
    "examples": [
      {
        "input": "3\n4 5 8 2\n3 5 10 9 4",
        "output": "4 5 5 8 8"
      }
    ],
    "public_test_cases": [
      {
        "input": "3\n4 5 8 2\n3 5 10 9 4",
        "output": "4 5 5 8 8"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "1\n\n-3 -2 -4 0 4",
        "output": "-3 -2 -2 0 4"
      }
    ],
    "hints": [
      "Maintain a min-heap containing only the k largest elements.",
      "If heap size > k, pop the smallest element (heappop).",
      "The top of the min-heap is always the kth largest element."
    ],
    "optimal_complexity": {
      "time": "O(log K) per add",
      "space": "O(K)"
    },
    "solution_explanation": "Min-heap of capacity k holds the largest k numbers seen. Heap root represents the kth largest item in O(log k) per addition.",
    "starter_code": {
      "python": "# 101. Kth Largest Element in a Stream\n# Difficulty: EASY | Topic: Fixed-Capacity Min-Heap\n# Time Complexity Target: O(log K) per add | Space Complexity Target: O(K)\n\nimport sys\nimport json\n\ndef KthLargest() -> :\n    \"\"\"\n    Design a class to find the kth largest element in a stream.\n    \"\"\"\n    # TODO: Implement your solution here\n    import heapq\nclass KthLargest:\n    def __init__(self, k: int, nums: list[int]):\n        self.k = k\n        self.heap = nums\n        heapq.heapify(self.heap)\n        while len(self.heap) > k:\n            heapq.heappop(self.heap)\n    def add(self, val: int) -> int:\n        heapq.heappush(self.heap, val)\n        if len(self.heap) > self.k:\n            heapq.heappop(self.heap)\n        return self.heap[0]\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(KthLargest(...))\n",
      "javascript": "/**\n * 101. Kth Largest Element in a Stream\n * Difficulty: EASY | Topic: Fixed-Capacity Min-Heap\n * Optimal: O(log K) per add time, O(K) space\n */\n\nconst fs = require('fs');\n\nfunction KthLargest() {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 101. Kth Largest Element in a Stream\n// Difficulty: EASY | Topic: Fixed-Capacity Min-Heap\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 101. Kth Largest Element in a Stream\n// Difficulty: EASY | Topic: Fixed-Capacity Min-Heap\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_102",
    "number": 102,
    "title": "Top K Frequent Elements",
    "slug": "top-k-frequent-elements",
    "topic_id": "topic_heaps",
    "subtopic": "Frequency Min-Heap / Bucket Sort",
    "difficulty": "MEDIUM",
    "roadmap_stage": "Core Patterns",
    "companies": [
      "Amazon",
      "Meta",
      "Google",
      "Microsoft"
    ],
    "tags": [
      "heaps"
    ],
    "description": "Given an integer array nums and an integer k, return the k most frequent elements. You may return the answer in any order.",
    "input_format": "Line 1: N space-separated integers\nLine 2: integer k",
    "output_format": "Space-separated k most frequent integers.",
    "constraints": [
      "1 <= nums.length <= 10^5",
      "-10^4 <= nums[i] <= 10^4",
      "k is in the range [1, the number of unique elements in the array].",
      "It is guaranteed that the answer is unique."
    ],
    "examples": [
      {
        "input": "1 1 1 2 2 3\n2",
        "output": "1 2"
      },
      {
        "input": "1\n1",
        "output": "1"
      }
    ],
    "public_test_cases": [
      {
        "input": "1 1 1 2 2 3\n2",
        "output": "1 2"
      },
      {
        "input": "1\n1",
        "output": "1"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "4 1 -1 2 -1 2 3\n2",
        "output": "-1 2"
      }
    ],
    "hints": [
      "Count frequencies using a hash map.",
      "Use a min-heap of size k storing (frequency, num) pairs.",
      "Alternatively, use Bucket Sort with frequency as index for O(N) runtime."
    ],
    "optimal_complexity": {
      "time": "O(N log K)",
      "space": "O(N)"
    },
    "solution_explanation": "Count frequencies and use a min-heap of size k (or bucket sort) to return the k most frequent elements in linearithmic time.",
    "starter_code": {
      "python": "# 102. Top K Frequent Elements\n# Difficulty: MEDIUM | Topic: Frequency Min-Heap / Bucket Sort\n# Time Complexity Target: O(N log K) | Space Complexity Target: O(N)\n\nimport sys\nimport json\n\ndef topKFrequent(nums: list[int], k: int) -> list[int]:\n    \"\"\"\n    Given an integer array nums and an integer k, return the k most frequent elements.\n    \"\"\"\n    # TODO: Implement your solution here\n    from collections import Counter\n    import heapq\n    counts = Counter(nums)\n    return [item[0] for item in heapq.nlargest(k, counts.items(), key=lambda x: x[1])]\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(topKFrequent(...))\n",
      "javascript": "/**\n * 102. Top K Frequent Elements\n * Difficulty: MEDIUM | Topic: Frequency Min-Heap / Bucket Sort\n * Optimal: O(N log K) time, O(N) space\n */\n\nconst fs = require('fs');\n\nfunction topKFrequent(nums: list[int], k: int) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 102. Top K Frequent Elements\n// Difficulty: MEDIUM | Topic: Frequency Min-Heap / Bucket Sort\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 102. Top K Frequent Elements\n// Difficulty: MEDIUM | Topic: Frequency Min-Heap / Bucket Sort\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_103",
    "number": 103,
    "title": "K Closest Points to Origin",
    "slug": "k-closest-points-to-origin",
    "topic_id": "topic_heaps",
    "subtopic": "Euclidean Max-Heap",
    "difficulty": "MEDIUM",
    "roadmap_stage": "Core Patterns",
    "companies": [
      "Amazon",
      "Meta",
      "Apple",
      "Google"
    ],
    "tags": [
      "heaps"
    ],
    "description": "Given an array of points where points[i] = [xi, yi] represents a point on the X-Y plane and an integer k, return the k closest points to the origin (0, 0).\n\nThe distance between two points on the X-Y plane is the Euclidean distance (i.e., \u221a(x1 - x2)^2 + (y1 - y2)^2).\n\nYou may return the answer in any order.",
    "input_format": "Line 1: N k\nNext N lines: x y",
    "output_format": "k lines of x y.",
    "constraints": [
      "1 <= k <= points.length <= 10^4",
      "-10^4 <= xi, yi <= 10^4"
    ],
    "examples": [
      {
        "input": "2 1\n1 3\n-2 2",
        "output": "-2 2",
        "explanation": "(-2,2) has distance sqrt(8) < sqrt(10)."
      },
      {
        "input": "3 2\n3 3\n5 -1\n-2 4",
        "output": "3 3\n-2 4"
      }
    ],
    "public_test_cases": [
      {
        "input": "2 1\n1 3\n-2 2",
        "output": "-2 2"
      },
      {
        "input": "3 2\n3 3\n5 -1\n-2 4",
        "output": "3 3\n-2 4"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "1 1\n0 1",
        "output": "0 1"
      }
    ],
    "hints": [
      "Distance metric comparison: x^2 + y^2 (no need to take square root).",
      "Maintain a max-heap of size k storing (-dist, point).",
      "If heap size > k, pop the furthest point."
    ],
    "optimal_complexity": {
      "time": "O(N log K)",
      "space": "O(K)"
    },
    "solution_explanation": "Evaluate squared Euclidean distance x^2 + y^2. Use a max-heap of size k to retain only the k smallest distance coordinates.",
    "starter_code": {
      "python": "# 103. K Closest Points to Origin\n# Difficulty: MEDIUM | Topic: Euclidean Max-Heap\n# Time Complexity Target: O(N log K) | Space Complexity Target: O(K)\n\nimport sys\nimport json\n\ndef kClosest(points: list[list[int]], k: int) -> list[list[int]]:\n    \"\"\"\n    Given an array of points where points[i] = [xi, yi] represents a point on the X-Y plane and an integer k, return the k closest points to the origin (0, 0).\n    \"\"\"\n    # TODO: Implement your solution here\n    import heapq\n    return heapq.nsmallest(k, points, key=lambda p: p[0]**2 + p[1]**2)\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(kClosest(...))\n",
      "javascript": "/**\n * 103. K Closest Points to Origin\n * Difficulty: MEDIUM | Topic: Euclidean Max-Heap\n * Optimal: O(N log K) time, O(K) space\n */\n\nconst fs = require('fs');\n\nfunction kClosest(points: list[list[int]], k: int) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 103. K Closest Points to Origin\n// Difficulty: MEDIUM | Topic: Euclidean Max-Heap\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 103. K Closest Points to Origin\n// Difficulty: MEDIUM | Topic: Euclidean Max-Heap\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_104",
    "number": 104,
    "title": "Task Scheduler",
    "slug": "task-scheduler",
    "topic_id": "topic_heaps",
    "subtopic": "Greedy Max-Heap with Cooling Queue",
    "difficulty": "MEDIUM",
    "roadmap_stage": "Core Patterns",
    "companies": [
      "Meta",
      "Amazon",
      "Google"
    ],
    "tags": [
      "heaps"
    ],
    "description": "You are given an array of CPU tasks, each represented by letters A to Z, and a cooling time, n. Each cycle or interval allows the completion of one task. Tasks can be completed in any order, but there's a constraint: identical tasks must be separated by at least n intervals of cooling.\n\nReturn the minimum number of intervals required to complete all tasks.",
    "input_format": "Line 1: space-separated task characters\nLine 2: integer n",
    "output_format": "Single integer representing total CPU intervals.",
    "constraints": [
      "1 <= tasks.length <= 10^4",
      "tasks[i] is uppercase English letter.",
      "0 <= n <= 100"
    ],
    "examples": [
      {
        "input": "A A A B B B\n2",
        "output": "8",
        "explanation": "A -> B -> idle -> A -> B -> idle -> A -> B."
      },
      {
        "input": "A C A B D B\n1",
        "output": "6"
      },
      {
        "input": "A A A B B B\n3",
        "output": "10"
      }
    ],
    "public_test_cases": [
      {
        "input": "A A A B B B\n2",
        "output": "8"
      },
      {
        "input": "A C A B D B\n1",
        "output": "6"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "A A A A B B B C C D\n2",
        "output": "10"
      }
    ],
    "hints": [
      "Always prioritize executing the task with the highest remaining frequency.",
      "Use a max-heap for frequencies and a queue for tasks currently cooling down.",
      "Queue stores (remaining_count, ready_time)."
    ],
    "optimal_complexity": {
      "time": "O(N)",
      "space": "O(1)"
    },
    "solution_explanation": "Formula: slots required by the most frequent task is (max_freq - 1) * (n + 1) + count_of_max_freq_tasks. Bounded below by len(tasks).",
    "starter_code": {
      "python": "# 104. Task Scheduler\n# Difficulty: MEDIUM | Topic: Greedy Max-Heap with Cooling Queue\n# Time Complexity Target: O(N) | Space Complexity Target: O(1)\n\nimport sys\nimport json\n\ndef leastInterval(tasks: list[str], n: int) -> int:\n    \"\"\"\n    You are given an array of CPU tasks, each represented by letters A to Z, and a cooling time, n.\n    \"\"\"\n    # TODO: Implement your solution here\n    from collections import Counter\n    counts = Counter(tasks)\n    max_f = max(counts.values())\n    max_count = sum(1 for v in counts.values() if v == max_f)\n    return max(len(tasks), (max_f - 1) * (n + 1) + max_count)\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(leastInterval(...))\n",
      "javascript": "/**\n * 104. Task Scheduler\n * Difficulty: MEDIUM | Topic: Greedy Max-Heap with Cooling Queue\n * Optimal: O(N) time, O(1) space\n */\n\nconst fs = require('fs');\n\nfunction leastInterval(tasks: list[str], n: int) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 104. Task Scheduler\n// Difficulty: MEDIUM | Topic: Greedy Max-Heap with Cooling Queue\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 104. Task Scheduler\n// Difficulty: MEDIUM | Topic: Greedy Max-Heap with Cooling Queue\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_105",
    "number": 105,
    "title": "Find Median from Data Stream",
    "slug": "find-median-from-data-stream",
    "topic_id": "topic_heaps",
    "subtopic": "Dual Heap Median Balancer",
    "difficulty": "HARD",
    "roadmap_stage": "Placement Revision",
    "companies": [
      "Amazon",
      "Google",
      "Meta",
      "Apple"
    ],
    "tags": [
      "heaps"
    ],
    "description": "The median is the middle value in an ordered integer list. If the size of the list is even, there is no middle value, and the median is the mean of the two middle values.\n\nImplement the MedianFinder class:\n- MedianFinder() initializes the MedianFinder object.\n- void addNum(int num) adds the integer num from the data stream to the data structure.\n- double findMedian() returns the median of all elements so far.",
    "input_format": "Stream operations: addNum, findMedian",
    "output_format": "Median values formatted to 5 decimal places.",
    "constraints": [
      "-10^5 <= num <= 10^5",
      "There will be at least one element in the data structure before calling findMedian.",
      "At most 5 * 10^4 calls will be made."
    ],
    "examples": [
      {
        "input": "add 1\nadd 2\nfind\nadd 3\nfind",
        "output": "1.50000 2.00000"
      }
    ],
    "public_test_cases": [
      {
        "input": "add 1\nadd 2\nfind\nadd 3\nfind",
        "output": "1.50000 2.00000"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "add 5\nfind",
        "output": "5.00000"
      }
    ],
    "hints": [
      "Maintain two heaps: a max-heap `small` for lower half, and a min-heap `large` for upper half.",
      "Balance sizes such that len(small) == len(large) or len(small) == len(large) + 1.",
      "Median is either small[0] or (small[0] + large[0]) / 2."
    ],
    "optimal_complexity": {
      "time": "O(log N) add, O(1) find",
      "space": "O(N)"
    },
    "solution_explanation": "Two heaps partition stream: max-heap holds smaller half, min-heap holds larger half. Median computation is O(1).",
    "starter_code": {
      "python": "# 105. Find Median from Data Stream\n# Difficulty: HARD | Topic: Dual Heap Median Balancer\n# Time Complexity Target: O(log N) add, O(1) find | Space Complexity Target: O(N)\n\nimport sys\nimport json\n\ndef MedianFinder() -> :\n    \"\"\"\n    The median is the middle value in an ordered integer list.\n    \"\"\"\n    # TODO: Implement your solution here\n    import heapq\nclass MedianFinder:\n    def __init__(self):\n        self.small = [] # max heap (invert signs)\n        self.large = [] # min heap\n    def addNum(self, num: int) -> None:\n        heapq.heappush(self.small, -num)\n        heapq.heappush(self.large, -heapq.heappop(self.small))\n        if len(self.large) > len(self.small):\n            heapq.heappush(self.small, -heapq.heappop(self.large))\n    def findMedian(self) -> float:\n        if len(self.small) > len(self.large):\n            return float(-self.small[0])\n        return (-self.small[0] + self.large[0]) / 2.0\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(MedianFinder(...))\n",
      "javascript": "/**\n * 105. Find Median from Data Stream\n * Difficulty: HARD | Topic: Dual Heap Median Balancer\n * Optimal: O(log N) add, O(1) find time, O(N) space\n */\n\nconst fs = require('fs');\n\nfunction MedianFinder() {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 105. Find Median from Data Stream\n// Difficulty: HARD | Topic: Dual Heap Median Balancer\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 105. Find Median from Data Stream\n// Difficulty: HARD | Topic: Dual Heap Median Balancer\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_106",
    "number": 106,
    "title": "Merge k Sorted Lists",
    "slug": "merge-k-sorted-lists",
    "topic_id": "topic_heaps",
    "subtopic": "K-Way Min-Heap Merge",
    "difficulty": "HARD",
    "roadmap_stage": "Placement Revision",
    "companies": [
      "Amazon",
      "Meta",
      "Google",
      "Microsoft"
    ],
    "tags": [
      "heaps"
    ],
    "description": "You are given an array of k linked-lists lists, each linked-list is sorted in ascending order.\n\nMerge all the linked-lists into one sorted linked-list and return it.",
    "input_format": "Line 1: k (number of lists)\nNext k lines: space-separated integers for each list",
    "output_format": "Merged space-separated sorted list.",
    "constraints": [
      "k == lists.length",
      "0 <= k <= 10^4",
      "0 <= lists[i].length <= 500",
      "-10^4 <= lists[i][j] <= 10^4",
      "lists[i] is sorted in ascending order."
    ],
    "examples": [
      {
        "input": "3\n1 4 5\n1 3 4\n2 6",
        "output": "1 1 2 3 4 4 5 6"
      },
      {
        "input": "0",
        "output": ""
      },
      {
        "input": "1\n",
        "output": ""
      }
    ],
    "public_test_cases": [
      {
        "input": "3\n1 4 5\n1 3 4\n2 6",
        "output": "1 1 2 3 4 4 5 6"
      },
      {
        "input": "0",
        "output": ""
      }
    ],
    "hidden_test_cases": [
      {
        "input": "1\n1",
        "output": "1"
      },
      {
        "input": "2\n1 3\n2 4",
        "output": "1 2 3 4"
      }
    ],
    "hints": [
      "Use a min-heap storing (node.val, list_index, node).",
      "Initialize heap with head of all k lists.",
      "Pop the smallest node, attach to result, and push node.next into heap."
    ],
    "optimal_complexity": {
      "time": "O(N log K)",
      "space": "O(K)"
    },
    "solution_explanation": "Min-heap of size k tracks the current front element across all k lists. Extracts minimum in O(log k) for each of the N total nodes.",
    "starter_code": {
      "python": "# 106. Merge k Sorted Lists\n# Difficulty: HARD | Topic: K-Way Min-Heap Merge\n# Time Complexity Target: O(N log K) | Space Complexity Target: O(K)\n\nimport sys\nimport json\n\ndef mergeKLists(lists) -> ListNode:\n    \"\"\"\n    You are given an array of k linked-lists lists, each linked-list is sorted in ascending order.\n    \"\"\"\n    # TODO: Implement your solution here\n    import heapq\n    h = []\n    for i, node in enumerate(lists):\n        if node:\n            heapq.heappush(h, (node.val, i, node))\n    dummy = curr = ListNode(0)\n    while h:\n        val, i, node = heapq.heappop(h)\n        curr.next = node\n        curr = curr.next\n        if node.next:\n            heapq.heappush(h, (node.next.val, i, node.next))\n    return dummy.next\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(mergeKLists(...))\n",
      "javascript": "/**\n * 106. Merge k Sorted Lists\n * Difficulty: HARD | Topic: K-Way Min-Heap Merge\n * Optimal: O(N log K) time, O(K) space\n */\n\nconst fs = require('fs');\n\nfunction mergeKLists(lists) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 106. Merge k Sorted Lists\n// Difficulty: HARD | Topic: K-Way Min-Heap Merge\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 106. Merge k Sorted Lists\n// Difficulty: HARD | Topic: K-Way Min-Heap Merge\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_107",
    "number": 107,
    "title": "Flood Fill",
    "slug": "flood-fill",
    "topic_id": "topic_graphs",
    "subtopic": "Connected Component DFS",
    "difficulty": "EASY",
    "roadmap_stage": "Beginner Foundations",
    "companies": [
      "Amazon",
      "Apple",
      "Google"
    ],
    "tags": [
      "graphs"
    ],
    "description": "An image is represented by an m x n integer grid image where image[i][j] represents the pixel value of the image.\n\nYou are also given three integers sr, sc, and color. You should perform a flood fill on the image starting from the pixel image[sr][sc].\n\nReturn the modified image after performing the flood fill.",
    "input_format": "Line 1: m n sr sc color\nNext m lines: n space-separated integers",
    "output_format": "m lines of n space-separated integers.",
    "constraints": [
      "m == image.length",
      "n == image[i].length",
      "1 <= m, n <= 50",
      "0 <= image[i][j], color < 65536"
    ],
    "examples": [
      {
        "input": "3 3 1 1 2\n1 1 1\n1 1 0\n1 0 1",
        "output": "2 2 2\n2 2 0\n2 0 1"
      },
      {
        "input": "2 2 0 0 0\n0 0 0\n0 0 0",
        "output": "0 0 0\n0 0 0"
      }
    ],
    "public_test_cases": [
      {
        "input": "3 3 1 1 2\n1 1 1\n1 1 0\n1 0 1",
        "output": "2 2 2\n2 2 0\n2 0 1"
      },
      {
        "input": "2 2 0 0 0\n0 0 0\n0 0 0",
        "output": "0 0 0\n0 0 0"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "1 1 0 0 5\n1",
        "output": "5"
      }
    ],
    "hints": [
      "Note original color = image[sr][sc]. If original color == new color, return image immediately.",
      "DFS in 4 directions: up, down, left, right.",
      "Recurse whenever neighboring pixel has original color."
    ],
    "optimal_complexity": {
      "time": "O(M * N)",
      "space": "O(M * N)"
    },
    "solution_explanation": "DFS traversal visits all connected pixels matching original starting color and replaces with new color.",
    "starter_code": {
      "python": "# 107. Flood Fill\n# Difficulty: EASY | Topic: Connected Component DFS\n# Time Complexity Target: O(M * N) | Space Complexity Target: O(M * N)\n\nimport sys\nimport json\n\ndef floodFill(image: list[list[int]], sr: int, sc: int, color: int) -> list[list[int]]:\n    \"\"\"\n    An image is represented by an m x n integer grid image where image[i][j] represents the pixel value of the image.\n    \"\"\"\n    # TODO: Implement your solution here\n    orig = image[sr][sc]\n    if orig == color: return image\n    R, C = len(image), len(image[0])\n    def dfs(r, c):\n        if 0 <= r < R and 0 <= c < C and image[r][c] == orig:\n            image[r][c] = color\n            dfs(r+1, c); dfs(r-1, c); dfs(r, c+1); dfs(r, c-1)\n    dfs(sr, sc)\n    return image\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(floodFill(...))\n",
      "javascript": "/**\n * 107. Flood Fill\n * Difficulty: EASY | Topic: Connected Component DFS\n * Optimal: O(M * N) time, O(M * N) space\n */\n\nconst fs = require('fs');\n\nfunction floodFill(image: list[list[int]], sr: int, sc: int, color: int) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 107. Flood Fill\n// Difficulty: EASY | Topic: Connected Component DFS\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 107. Flood Fill\n// Difficulty: EASY | Topic: Connected Component DFS\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_108",
    "number": 108,
    "title": "Shortest Path in an Unweighted Graph",
    "slug": "shortest-path-in-an-unweighted-graph",
    "topic_id": "topic_graphs",
    "subtopic": "BFS Shortest Path",
    "difficulty": "EASY",
    "roadmap_stage": "Beginner Foundations",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "tags": [
      "graphs"
    ],
    "description": "Given an unweighted undirected graph represented by an adjacency list, find the length of the shortest path from node start to node target. If no path exists, return -1.",
    "input_format": "Line 1: N E start target\nNext E lines: u v (undirected edge)",
    "output_format": "Single integer shortest path distance, or -1.",
    "constraints": [
      "1 <= N <= 10^4",
      "0 <= E <= 2 * 10^4"
    ],
    "examples": [
      {
        "input": "4 4 1 4\n1 2\n2 3\n3 4\n1 4",
        "output": "1",
        "explanation": "Direct edge 1 - 4 gives distance 1."
      },
      {
        "input": "3 1 1 3\n1 2",
        "output": "-1"
      }
    ],
    "public_test_cases": [
      {
        "input": "4 4 1 4\n1 2\n2 3\n3 4\n1 4",
        "output": "1"
      },
      {
        "input": "3 1 1 3\n1 2",
        "output": "-1"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "1 0 1 1",
        "output": "0"
      }
    ],
    "hints": [
      "Breadth-First Search (BFS) explores nodes layer by layer.",
      "Queue stores (current_node, distance).",
      "First time target is popped from queue gives the optimal shortest path."
    ],
    "optimal_complexity": {
      "time": "O(V + E)",
      "space": "O(V)"
    },
    "solution_explanation": "BFS guarantees minimum edge distance on unweighted graphs because nodes are expanded in monotonic order of distance.",
    "starter_code": {
      "python": "# 108. Shortest Path in an Unweighted Graph\n# Difficulty: EASY | Topic: BFS Shortest Path\n# Time Complexity Target: O(V + E) | Space Complexity Target: O(V)\n\nimport sys\nimport json\n\ndef shortestPathBFS(adj, start: int, target: int) -> int:\n    \"\"\"\n    Given an unweighted undirected graph represented by an adjacency list, find the length of the shortest path from node start to node target.\n    \"\"\"\n    # TODO: Implement your solution here\n    from collections import deque\n    if start == target: return 0\n    q = deque([(start, 0)])\n    visited = {start}\n    while q:\n        node, d = q.popleft()\n        if node == target: return d\n        for nxt in adj.get(node, []):\n            if nxt not in visited:\n                visited.add(nxt)\n                q.append((nxt, d + 1))\n    return -1\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(shortestPathBFS(...))\n",
      "javascript": "/**\n * 108. Shortest Path in an Unweighted Graph\n * Difficulty: EASY | Topic: BFS Shortest Path\n * Optimal: O(V + E) time, O(V) space\n */\n\nconst fs = require('fs');\n\nfunction shortestPathBFS(adj, start: int, target: int) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 108. Shortest Path in an Unweighted Graph\n// Difficulty: EASY | Topic: BFS Shortest Path\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 108. Shortest Path in an Unweighted Graph\n// Difficulty: EASY | Topic: BFS Shortest Path\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_109",
    "number": 109,
    "title": "Find Center of Star Graph",
    "slug": "find-center-of-star-graph",
    "topic_id": "topic_graphs",
    "subtopic": "Degree Invariant",
    "difficulty": "EASY",
    "roadmap_stage": "Beginner Foundations",
    "companies": [
      "Google",
      "Amazon"
    ],
    "tags": [
      "graphs"
    ],
    "description": "There is an undirected star graph consisting of n nodes labeled from 1 to n. A star graph is a graph where there is one center node and exactly n - 1 edges that connect the center node with every other node.\n\nYou are given a 2D integer array edges where each edges[i] = [ui, vi] indicates an edge between ui and vi. Return the center of the star graph.",
    "input_format": "Line 1: N - 1 (number of edges)\nNext lines: u v",
    "output_format": "Single integer center node label.",
    "constraints": [
      "3 <= n <= 10^5",
      "edges.length == n - 1"
    ],
    "examples": [
      {
        "input": "3\n1 2\n2 3\n4 2",
        "output": "2"
      },
      {
        "input": "4\n1 2\n5 1\n1 3\n1 4",
        "output": "1"
      }
    ],
    "public_test_cases": [
      {
        "input": "3\n1 2\n2 3\n4 2",
        "output": "2"
      },
      {
        "input": "4\n1 2\n5 1\n1 3\n1 4",
        "output": "1"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "2\n1 3\n2 3",
        "output": "3"
      }
    ],
    "hints": [
      "The center node must be present in every single edge.",
      "Compare the first two edges: the common node between them must be the center.",
      "O(1) time is sufficient."
    ],
    "optimal_complexity": {
      "time": "O(1)",
      "space": "O(1)"
    },
    "solution_explanation": "The center node connects to all vertices. Inspecting just the first two edges reveals the shared center in O(1) time.",
    "starter_code": {
      "python": "# 109. Find Center of Star Graph\n# Difficulty: EASY | Topic: Degree Invariant\n# Time Complexity Target: O(1) | Space Complexity Target: O(1)\n\nimport sys\nimport json\n\ndef findCenter(edges: list[list[int]]) -> int:\n    \"\"\"\n    There is an undirected star graph consisting of n nodes labeled from 1 to n.\n    \"\"\"\n    # TODO: Implement your solution here\n    return edges[0][0] if edges[0][0] in edges[1] else edges[0][1]\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(findCenter(...))\n",
      "javascript": "/**\n * 109. Find Center of Star Graph\n * Difficulty: EASY | Topic: Degree Invariant\n * Optimal: O(1) time, O(1) space\n */\n\nconst fs = require('fs');\n\nfunction findCenter(edges: list[list[int]]) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 109. Find Center of Star Graph\n// Difficulty: EASY | Topic: Degree Invariant\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 109. Find Center of Star Graph\n// Difficulty: EASY | Topic: Degree Invariant\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_110",
    "number": 110,
    "title": "Number of Islands",
    "slug": "number-of-islands",
    "topic_id": "topic_graphs",
    "subtopic": "Connected Components DFS/BFS",
    "difficulty": "MEDIUM",
    "roadmap_stage": "Core Patterns",
    "companies": [
      "Amazon",
      "Google",
      "Meta",
      "Bloomberg",
      "Microsoft"
    ],
    "tags": [
      "graphs"
    ],
    "description": "Given an m x n 2D binary grid grid which represents a map of '1's (land) and '0's (water), return the number of islands.\n\nAn island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically. You may assume all four edges of the grid are all surrounded by water.",
    "input_format": "Line 1: m n\nNext m lines: n space-separated '1' or '0'",
    "output_format": "Single integer count of islands.",
    "constraints": [
      "m == grid.length",
      "n == grid[i].length",
      "1 <= m, n <= 300",
      "grid[i][j] is '0' or '1'."
    ],
    "examples": [
      {
        "input": "4 5\n1 1 1 1 0\n1 1 0 1 0\n1 1 0 0 0\n0 0 0 0 0",
        "output": "1"
      },
      {
        "input": "4 5\n1 1 0 0 0\n1 1 0 0 0\n0 0 1 0 0\n0 0 0 1 1",
        "output": "3"
      }
    ],
    "public_test_cases": [
      {
        "input": "4 5\n1 1 1 1 0\n1 1 0 1 0\n1 1 0 0 0\n0 0 0 0 0",
        "output": "1"
      },
      {
        "input": "4 5\n1 1 0 0 0\n1 1 0 0 0\n0 0 1 0 0\n0 0 0 1 1",
        "output": "3"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "1 1\n1",
        "output": "1"
      },
      {
        "input": "1 1\n0",
        "output": "0"
      }
    ],
    "hints": [
      "Iterate through all grid cells.",
      "When seeing '1', increment island count and initiate DFS/BFS to sink the entire island (turn '1's into '0's).",
      "Visited cells will not be processed again."
    ],
    "optimal_complexity": {
      "time": "O(M * N)",
      "space": "O(M * N)"
    },
    "solution_explanation": "Traverse grid: each unvisited '1' indicates a new island. DFS floods and sinks the entire connected component to prevent duplicate counting.",
    "starter_code": {
      "python": "# 110. Number of Islands\n# Difficulty: MEDIUM | Topic: Connected Components DFS/BFS\n# Time Complexity Target: O(M * N) | Space Complexity Target: O(M * N)\n\nimport sys\nimport json\n\ndef numIslands(grid: list[list[str]]) -> int:\n    \"\"\"\n    Given an m x n 2D binary grid grid which represents a map of '1's (land) and '0's (water), return the number of islands.\n    \"\"\"\n    # TODO: Implement your solution here\n    R, C = len(grid), len(grid[0])\n    def dfs(r, c):\n        if r < 0 or r >= R or c < 0 or c >= C or grid[r][c] != '1': return\n        grid[r][c] = '0'\n        dfs(r+1, c); dfs(r-1, c); dfs(r, c+1); dfs(r, c-1)\n    ans = 0\n    for r in range(R):\n        for c in range(C):\n            if grid[r][c] == '1':\n                ans += 1\n                dfs(r, c)\n    return ans\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(numIslands(...))\n",
      "javascript": "/**\n * 110. Number of Islands\n * Difficulty: MEDIUM | Topic: Connected Components DFS/BFS\n * Optimal: O(M * N) time, O(M * N) space\n */\n\nconst fs = require('fs');\n\nfunction numIslands(grid: list[list[str]]) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 110. Number of Islands\n// Difficulty: MEDIUM | Topic: Connected Components DFS/BFS\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 110. Number of Islands\n// Difficulty: MEDIUM | Topic: Connected Components DFS/BFS\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_111",
    "number": 111,
    "title": "Clone Graph",
    "slug": "clone-graph",
    "topic_id": "topic_graphs",
    "subtopic": "Graph Deep Copy with Hash Map",
    "difficulty": "MEDIUM",
    "roadmap_stage": "Core Patterns",
    "companies": [
      "Meta",
      "Amazon",
      "Google"
    ],
    "tags": [
      "graphs"
    ],
    "description": "Given a reference of a node in a connected undirected graph. Return a deep copy (clone) of the graph.\n\nEach node in the graph contains a value (int) and a list (List[Node]) of its neighbors.",
    "input_format": "Adjacency list representation.",
    "output_format": "Cloned adjacency list representation.",
    "constraints": [
      "The number of nodes in the graph is in the range [0, 100].",
      "1 <= Node.val <= 100",
      "Node.val is unique for each node."
    ],
    "examples": [
      {
        "input": "4\n2 4\n1 3\n2 4\n1 3",
        "output": "2 4\n1 3\n2 4\n1 3"
      },
      {
        "input": "1\n",
        "output": ""
      },
      {
        "input": "0",
        "output": ""
      }
    ],
    "public_test_cases": [
      {
        "input": "4\n2 4\n1 3\n2 4\n1 3",
        "output": "2 4\n1 3\n2 4\n1 3"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "0",
        "output": ""
      }
    ],
    "hints": [
      "Use a hash map {original_node: cloned_node} to track already cloned nodes and avoid infinite loops.",
      "DFS/BFS over the graph.",
      "If neighbor already cloned, attach it. Otherwise clone neighbor and recurse."
    ],
    "optimal_complexity": {
      "time": "O(V + E)",
      "space": "O(V)"
    },
    "solution_explanation": "Hash map maps original nodes to their cloned counterparts, breaking cycle dependencies and ensuring deep copies.",
    "starter_code": {
      "python": "# 111. Clone Graph\n# Difficulty: MEDIUM | Topic: Graph Deep Copy with Hash Map\n# Time Complexity Target: O(V + E) | Space Complexity Target: O(V)\n\nimport sys\nimport json\n\ndef cloneGraph(node) -> Node:\n    \"\"\"\n    Given a reference of a node in a connected undirected graph.\n    \"\"\"\n    # TODO: Implement your solution here\n    cloned = {}\n    def dfs(curr):\n        if not curr: return None\n        if curr in cloned: return cloned[curr]\n        copy = Node(curr.val)\n        cloned[curr] = copy\n        for nxt in curr.neighbors:\n            copy.neighbors.append(dfs(nxt))\n        return copy\n    return dfs(node)\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(cloneGraph(...))\n",
      "javascript": "/**\n * 111. Clone Graph\n * Difficulty: MEDIUM | Topic: Graph Deep Copy with Hash Map\n * Optimal: O(V + E) time, O(V) space\n */\n\nconst fs = require('fs');\n\nfunction cloneGraph(node) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 111. Clone Graph\n// Difficulty: MEDIUM | Topic: Graph Deep Copy with Hash Map\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 111. Clone Graph\n// Difficulty: MEDIUM | Topic: Graph Deep Copy with Hash Map\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_112",
    "number": 112,
    "title": "Course Schedule",
    "slug": "course-schedule",
    "topic_id": "topic_graphs",
    "subtopic": "Topological Sort / Cycle Detection",
    "difficulty": "MEDIUM",
    "roadmap_stage": "Core Patterns",
    "companies": [
      "Amazon",
      "Google",
      "Meta",
      "Microsoft"
    ],
    "tags": [
      "graphs"
    ],
    "description": "There are a total of numCourses courses you have to take, labeled from 0 to numCourses - 1. You are given an array prerequisites where prerequisites[i] = [ai, bi] indicates that you must take course bi first if you want to take course ai.\n\nReturn true if you can finish all courses. Otherwise, return false (i.e. if there is a cycle).",
    "input_format": "Line 1: numCourses\nLine 2: E (number of prerequisite pairs)\nNext E lines: a b",
    "output_format": "true or false",
    "constraints": [
      "1 <= numCourses <= 2000",
      "0 <= prerequisites.length <= 5000",
      "prerequisites[i].length == 2",
      "All prerequisite pairs are unique."
    ],
    "examples": [
      {
        "input": "2\n1\n1 0",
        "output": "true",
        "explanation": "To take course 1 you should take course 0. Finished."
      },
      {
        "input": "2\n2\n1 0\n0 1",
        "output": "false",
        "explanation": "Cycle detected between course 0 and course 1."
      }
    ],
    "public_test_cases": [
      {
        "input": "2\n1\n1 0",
        "output": "true"
      },
      {
        "input": "2\n2\n1 0\n0 1",
        "output": "false"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "1\n0",
        "output": "true"
      },
      {
        "input": "3\n2\n0 1\n0 2",
        "output": "true"
      }
    ],
    "hints": [
      "Model courses as a directed graph. A cycle means courses cannot be completed.",
      "Kahn's Algorithm (BFS with in-degree array).",
      "Enqueue nodes with in-degree 0. Each time a node is popped, decrement in-degree of neighbors."
    ],
    "optimal_complexity": {
      "time": "O(V + E)",
      "space": "O(V + E)"
    },
    "solution_explanation": "Kahn's BFS topological sorting: count incoming edges (in-degree). Successive removal of zero-in-degree nodes finishes all courses if and only if no directed cycle exists.",
    "starter_code": {
      "python": "# 112. Course Schedule\n# Difficulty: MEDIUM | Topic: Topological Sort / Cycle Detection\n# Time Complexity Target: O(V + E) | Space Complexity Target: O(V + E)\n\nimport sys\nimport json\n\ndef canFinish(numCourses: int, prerequisites: list[list[int]]) -> bool:\n    \"\"\"\n    There are a total of numCourses courses you have to take, labeled from 0 to numCourses - 1.\n    \"\"\"\n    # TODO: Implement your solution here\n    from collections import deque, defaultdict\n    in_degree = [0] * numCourses\n    adj = defaultdict(list)\n    for dest, src in prerequisites:\n        adj[src].append(dest)\n        in_degree[dest] += 1\n    q = deque([i for i in range(numCourses) if in_degree[i] == 0])\n    visited = 0\n    while q:\n        node = q.popleft()\n        visited += 1\n        for nxt in adj[node]:\n            in_degree[nxt] -= 1\n            if in_degree[nxt] == 0: q.append(nxt)\n    return visited == numCourses\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(canFinish(...))\n",
      "javascript": "/**\n * 112. Course Schedule\n * Difficulty: MEDIUM | Topic: Topological Sort / Cycle Detection\n * Optimal: O(V + E) time, O(V + E) space\n */\n\nconst fs = require('fs');\n\nfunction canFinish(numCourses: int, prerequisites: list[list[int]]) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 112. Course Schedule\n// Difficulty: MEDIUM | Topic: Topological Sort / Cycle Detection\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 112. Course Schedule\n// Difficulty: MEDIUM | Topic: Topological Sort / Cycle Detection\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_113",
    "number": 113,
    "title": "Course Schedule II",
    "slug": "course-schedule-ii",
    "topic_id": "topic_graphs",
    "subtopic": "Topological Ordering Recovery",
    "difficulty": "MEDIUM",
    "roadmap_stage": "Core Patterns",
    "companies": [
      "Amazon",
      "Google",
      "Meta"
    ],
    "tags": [
      "graphs"
    ],
    "description": "There are a total of numCourses courses labeled from 0 to numCourses - 1. You are given an array prerequisites where prerequisites[i] = [ai, bi] indicates that you must take course bi first if you want to take course ai.\n\nReturn the ordering of courses you should take to finish all courses. If it is impossible, return an empty array.",
    "input_format": "Line 1: numCourses\nLine 2: E\nNext E lines: a b",
    "output_format": "Space-separated course sequence, or empty.",
    "constraints": [
      "1 <= numCourses <= 2000",
      "0 <= prerequisites.length <= numCourses * (numCourses - 1)"
    ],
    "examples": [
      {
        "input": "2\n1\n1 0",
        "output": "0 1"
      },
      {
        "input": "4\n4\n1 0\n2 0\n3 1\n3 2",
        "output": "0 1 2 3"
      }
    ],
    "public_test_cases": [
      {
        "input": "2\n1\n1 0",
        "output": "0 1"
      },
      {
        "input": "4\n4\n1 0\n2 0\n3 1\n3 2",
        "output": "0 1 2 3"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "2\n2\n0 1\n1 0",
        "output": ""
      }
    ],
    "hints": [
      "Same as Course Schedule I, but record the order in which nodes with in-degree 0 are removed.",
      "If total courses processed == numCourses, return the ordering list; otherwise return [].",
      "Initialize an in-degree array and an adjacency list, then queue all nodes with 0 incoming dependencies."
    ],
    "optimal_complexity": {
      "time": "O(V + E)",
      "space": "O(V + E)"
    },
    "solution_explanation": "Kahn's algorithm collects nodes in topological order. Returns empty list if graph contains a directed cycle.",
    "starter_code": {
      "python": "# 113. Course Schedule II\n# Difficulty: MEDIUM | Topic: Topological Ordering Recovery\n# Time Complexity Target: O(V + E) | Space Complexity Target: O(V + E)\n\nimport sys\nimport json\n\ndef findOrder(numCourses: int, prerequisites: list[list[int]]) -> list[int]:\n    \"\"\"\n    There are a total of numCourses courses labeled from 0 to numCourses - 1.\n    \"\"\"\n    # TODO: Implement your solution here\n    from collections import deque, defaultdict\n    in_degree = [0] * numCourses\n    adj = defaultdict(list)\n    for dest, src in prerequisites:\n        adj[src].append(dest)\n        in_degree[dest] += 1\n    q = deque([i for i in range(numCourses) if in_degree[i] == 0])\n    order = []\n    while q:\n        node = q.popleft()\n        order.append(node)\n        for nxt in adj[node]:\n            in_degree[nxt] -= 1\n            if in_degree[nxt] == 0: q.append(nxt)\n    return order if len(order) == numCourses else []\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(findOrder(...))\n",
      "javascript": "/**\n * 113. Course Schedule II\n * Difficulty: MEDIUM | Topic: Topological Ordering Recovery\n * Optimal: O(V + E) time, O(V + E) space\n */\n\nconst fs = require('fs');\n\nfunction findOrder(numCourses: int, prerequisites: list[list[int]]) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 113. Course Schedule II\n// Difficulty: MEDIUM | Topic: Topological Ordering Recovery\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 113. Course Schedule II\n// Difficulty: MEDIUM | Topic: Topological Ordering Recovery\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_114",
    "number": 114,
    "title": "Rotting Oranges",
    "slug": "rotting-oranges",
    "topic_id": "topic_graphs",
    "subtopic": "Multi-Source BFS",
    "difficulty": "MEDIUM",
    "roadmap_stage": "Core Patterns",
    "companies": [
      "Amazon",
      "Microsoft",
      "Meta"
    ],
    "tags": [
      "graphs"
    ],
    "description": "You are given an m x n grid where each cell can have one of three values:\n- 0 representing an empty cell,\n- 1 representing a fresh orange, or\n- 2 representing a rotten orange.\n\nEvery minute, any fresh orange that is 4-directionally adjacent to a rotten orange becomes rotten.\n\nReturn the minimum number of minutes that must elapse until no cell has a fresh orange. If this is impossible, return -1.",
    "input_format": "Line 1: m n\nNext m lines: n space-separated integers (0, 1, or 2)",
    "output_format": "Minutes elapsed, or -1.",
    "constraints": [
      "m == grid.length",
      "n == grid[i].length",
      "1 <= m, n <= 10",
      "grid[i][j] is 0, 1, or 2."
    ],
    "examples": [
      {
        "input": "3 3\n2 1 1\n1 1 0\n0 1 1",
        "output": "4"
      },
      {
        "input": "3 3\n2 1 1\n0 1 1\n1 0 1",
        "output": "-1",
        "explanation": "Orange at bottom-left cannot rot."
      }
    ],
    "public_test_cases": [
      {
        "input": "3 3\n2 1 1\n1 1 0\n0 1 1",
        "output": "4"
      },
      {
        "input": "3 3\n2 1 1\n0 1 1\n1 0 1",
        "output": "-1"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "1 1\n0",
        "output": "0"
      },
      {
        "input": "1 1\n1",
        "output": "-1"
      }
    ],
    "hints": [
      "Multi-source BFS: add all initial rotten oranges to the queue at minute 0.",
      "Count initial fresh oranges.",
      "Each minute, pop all rotten oranges in current round and rot adjacent fresh oranges. Decrement fresh count."
    ],
    "optimal_complexity": {
      "time": "O(M * N)",
      "space": "O(M * N)"
    },
    "solution_explanation": "Multi-source BFS: initialize queue with all rotten cells. Process level by level incrementing time until no fresh oranges remain.",
    "starter_code": {
      "python": "# 114. Rotting Oranges\n# Difficulty: MEDIUM | Topic: Multi-Source BFS\n# Time Complexity Target: O(M * N) | Space Complexity Target: O(M * N)\n\nimport sys\nimport json\n\ndef orangesRotting(grid: list[list[int]]) -> int:\n    \"\"\"\n    You are given an m x n grid where each cell can have one of three values:\n- 0 representing an empty cell,\n- 1 representing a fresh orange, or\n- 2 representing a rotten orange.\n    \"\"\"\n    # TODO: Implement your solution here\n    from collections import deque\n    R, C = len(grid), len(grid[0])\n    q = deque()\n    fresh = 0\n    for r in range(R):\n        for c in range(C):\n            if grid[r][c] == 2: q.append((r, c))\n            elif grid[r][c] == 1: fresh += 1\n    time = 0\n    while q and fresh > 0:\n        for _ in range(len(q)):\n            r, c = q.popleft()\n            for dr, dc in [(1,0),(-1,0),(0,1),(0,-1)]:\n                nr, nc = r + dr, c + dc\n                if 0 <= nr < R and 0 <= nc < C and grid[nr][nc] == 1:\n                    grid[nr][nc] = 2\n                    fresh -= 1\n                    q.append((nr, nc))\n        time += 1\n    return time if fresh == 0 else -1\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(orangesRotting(...))\n",
      "javascript": "/**\n * 114. Rotting Oranges\n * Difficulty: MEDIUM | Topic: Multi-Source BFS\n * Optimal: O(M * N) time, O(M * N) space\n */\n\nconst fs = require('fs');\n\nfunction orangesRotting(grid: list[list[int]]) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 114. Rotting Oranges\n// Difficulty: MEDIUM | Topic: Multi-Source BFS\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 114. Rotting Oranges\n// Difficulty: MEDIUM | Topic: Multi-Source BFS\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_115",
    "number": 115,
    "title": "Pacific Atlantic Water Flow",
    "slug": "pacific-atlantic-water-flow",
    "topic_id": "topic_graphs",
    "subtopic": "Reverse Multi-Source Flow",
    "difficulty": "MEDIUM",
    "roadmap_stage": "Core Patterns",
    "companies": [
      "Google",
      "Amazon",
      "Meta"
    ],
    "tags": [
      "graphs"
    ],
    "description": "There is an m x n rectangular island that borders both the Pacific Ocean and Atlantic Ocean. The Pacific borders top and left edges, and Atlantic borders bottom and right edges.\n\nWater can flow from a cell to an adjacent one if the adjacent cell's height is less than or equal to current cell's height.\n\nReturn a 2D list of grid coordinates result where result[i] = [ri, ci] denotes that rain water can flow from (ri, ci) to both oceans.",
    "input_format": "Line 1: m n\nNext m lines: n space-separated heights",
    "output_format": "Coordinates r c that reach both oceans, one per line.",
    "constraints": [
      "m == heights.length",
      "n == heights[r].length",
      "1 <= m, n <= 200",
      "0 <= heights[r][c] <= 10^5"
    ],
    "examples": [
      {
        "input": "5 5\n1 2 2 3 5\n3 2 3 4 4\n2 4 5 3 1\n6 7 1 4 5\n5 1 1 2 4",
        "output": "0 4\n1 3\n1 4\n2 2\n3 0\n3 1\n4 0"
      }
    ],
    "public_test_cases": [
      {
        "input": "5 5\n1 2 2 3 5\n3 2 3 4 4\n2 4 5 3 1\n6 7 1 4 5\n5 1 1 2 4",
        "output": "0 4\n1 3\n1 4\n2 2\n3 0\n3 1\n4 0"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "1 1\n1",
        "output": "0 0"
      }
    ],
    "hints": [
      "Flow backwards from the oceans inward to cells of equal or greater height.",
      "Run DFS/BFS from Pacific borders (top/left) to find reachable cells.",
      "Run DFS/BFS from Atlantic borders (bottom/right). Cells in the intersection reach both oceans."
    ],
    "optimal_complexity": {
      "time": "O(M * N)",
      "space": "O(M * N)"
    },
    "solution_explanation": "Reverse search from oceanic edges: flood inward where elevation increases or stays constant. The intersection of both visited sets can drain to both oceans.",
    "starter_code": {
      "python": "# 115. Pacific Atlantic Water Flow\n# Difficulty: MEDIUM | Topic: Reverse Multi-Source Flow\n# Time Complexity Target: O(M * N) | Space Complexity Target: O(M * N)\n\nimport sys\nimport json\n\ndef pacificAtlantic(heights: list[list[int]]) -> list[list[int]]:\n    \"\"\"\n    There is an m x n rectangular island that borders both the Pacific Ocean and Atlantic Ocean.\n    \"\"\"\n    # TODO: Implement your solution here\n    R, C = len(heights), len(heights[0])\n    pac, atl = set(), set()\n    def dfs(r, c, visit, prev_h):\n        if (r, c) in visit or r < 0 or r >= R or c < 0 or c >= C or heights[r][c] < prev_h: return\n        visit.add((r, c))\n        for dr, dc in [(1,0),(-1,0),(0,1),(0,-1)]:\n            dfs(r+dr, c+dc, visit, heights[r][c])\n    for c in range(C): dfs(0, c, pac, heights[0][c]); dfs(R-1, c, atl, heights[R-1][c])\n    for r in range(R): dfs(r, 0, pac, heights[r][0]); dfs(r, C-1, atl, heights[r][C-1])\n    return sorted([[r, c] for r, c in (pac & atl)])\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(pacificAtlantic(...))\n",
      "javascript": "/**\n * 115. Pacific Atlantic Water Flow\n * Difficulty: MEDIUM | Topic: Reverse Multi-Source Flow\n * Optimal: O(M * N) time, O(M * N) space\n */\n\nconst fs = require('fs');\n\nfunction pacificAtlantic(heights: list[list[int]]) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 115. Pacific Atlantic Water Flow\n// Difficulty: MEDIUM | Topic: Reverse Multi-Source Flow\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 115. Pacific Atlantic Water Flow\n// Difficulty: MEDIUM | Topic: Reverse Multi-Source Flow\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_116",
    "number": 116,
    "title": "Graph Valid Tree",
    "slug": "graph-valid-tree",
    "topic_id": "topic_graphs",
    "subtopic": "Tree Invariant (Acyclic & Connected)",
    "difficulty": "MEDIUM",
    "roadmap_stage": "Core Patterns",
    "companies": [
      "Google",
      "Amazon",
      "Meta",
      "LinkedIn"
    ],
    "tags": [
      "graphs"
    ],
    "description": "Given n nodes labeled from 0 to n - 1 and a list of undirected edges (each edge is a pair of nodes), write a function to check whether these edges make up a valid tree.",
    "input_format": "Line 1: n E\nNext E lines: u v",
    "output_format": "true or false",
    "constraints": [
      "1 <= n <= 2000",
      "0 <= edges.length <= 5000"
    ],
    "examples": [
      {
        "input": "5 4\n0 1\n0 2\n0 3\n1 4",
        "output": "true"
      },
      {
        "input": "5 5\n0 1\n1 2\n2 3\n1 3\n1 4",
        "output": "false"
      }
    ],
    "public_test_cases": [
      {
        "input": "5 4\n0 1\n0 2\n0 3\n1 4",
        "output": "true"
      },
      {
        "input": "5 5\n0 1\n1 2\n2 3\n1 3\n1 4",
        "output": "false"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "1 0",
        "output": "true"
      },
      {
        "input": "2 0",
        "output": "false"
      }
    ],
    "hints": [
      "A valid tree with n nodes must have exactly n - 1 edges.",
      "It must be fully connected and contain no cycles.",
      "Use Union-Find or DFS to check connectivity and cycle freedom."
    ],
    "optimal_complexity": {
      "time": "O(V + E)",
      "space": "O(V)"
    },
    "solution_explanation": "A graph is a tree if and only if edge count is n - 1 and union-find detects no cycles.",
    "starter_code": {
      "python": "# 116. Graph Valid Tree\n# Difficulty: MEDIUM | Topic: Tree Invariant (Acyclic & Connected)\n# Time Complexity Target: O(V + E) | Space Complexity Target: O(V)\n\nimport sys\nimport json\n\ndef validTree(n: int, edges: list[list[int]]) -> bool:\n    \"\"\"\n    Given n nodes labeled from 0 to n - 1 and a list of undirected edges (each edge is a pair of nodes), write a function to check whether these edges make up a valid tree.\n    \"\"\"\n    # TODO: Implement your solution here\n    if len(edges) != n - 1: return False\n    parent = list(range(n))\n    def find(i):\n        if parent[i] == i: return i\n        parent[i] = find(parent[i])\n        return parent[i]\n    for u, v in edges:\n        pu, pv = find(u), find(v)\n        if pu == pv: return False\n        parent[pu] = pv\n    return True\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(validTree(...))\n",
      "javascript": "/**\n * 116. Graph Valid Tree\n * Difficulty: MEDIUM | Topic: Tree Invariant (Acyclic & Connected)\n * Optimal: O(V + E) time, O(V) space\n */\n\nconst fs = require('fs');\n\nfunction validTree(n: int, edges: list[list[int]]) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 116. Graph Valid Tree\n// Difficulty: MEDIUM | Topic: Tree Invariant (Acyclic & Connected)\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 116. Graph Valid Tree\n// Difficulty: MEDIUM | Topic: Tree Invariant (Acyclic & Connected)\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_117",
    "number": 117,
    "title": "Number of Connected Components",
    "slug": "number-of-connected-components",
    "topic_id": "topic_graphs",
    "subtopic": "Disjoint Sets / Connected Components",
    "difficulty": "MEDIUM",
    "roadmap_stage": "Core Patterns",
    "companies": [
      "Amazon",
      "Google",
      "Meta",
      "Twitter"
    ],
    "tags": [
      "graphs"
    ],
    "description": "You have a graph of n nodes. You are given an integer n and an array edges where edges[i] = [ai, bi] indicates that there is an edge between ai and bi in the graph.\n\nReturn the number of connected components in the graph.",
    "input_format": "Line 1: n E\nNext E lines: a b",
    "output_format": "Single integer count of connected components.",
    "constraints": [
      "1 <= n <= 2000",
      "0 <= edges.length <= 5000"
    ],
    "examples": [
      {
        "input": "5 4\n0 1\n1 2\n3 4\n0 2",
        "output": "2"
      },
      {
        "input": "5 5\n0 1\n1 2\n2 3\n3 4\n0 4",
        "output": "1"
      }
    ],
    "public_test_cases": [
      {
        "input": "5 4\n0 1\n1 2\n3 4\n0 2",
        "output": "2"
      },
      {
        "input": "5 5\n0 1\n1 2\n2 3\n3 4\n0 4",
        "output": "1"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "4 0",
        "output": "4"
      }
    ],
    "hints": [
      "Use Disjoint Set Union (Union-Find).",
      "Initialize with n components.",
      "Each successful union between distinct components decrements component count by 1."
    ],
    "optimal_complexity": {
      "time": "O(V + E * alpha(V))",
      "space": "O(V)"
    },
    "solution_explanation": "Union-Find with path compression. Start with n components; decrement each time two previously disconnected sets are merged.",
    "starter_code": {
      "python": "# 117. Number of Connected Components\n# Difficulty: MEDIUM | Topic: Disjoint Sets / Connected Components\n# Time Complexity Target: O(V + E * alpha(V)) | Space Complexity Target: O(V)\n\nimport sys\nimport json\n\ndef countComponents(n: int, edges: list[list[int]]) -> int:\n    \"\"\"\n    You have a graph of n nodes.\n    \"\"\"\n    # TODO: Implement your solution here\n    parent = list(range(n))\n    def find(i):\n        if parent[i] == i: return i\n        parent[i] = find(parent[i])\n        return parent[i]\n    comp = n\n    for u, v in edges:\n        pu, pv = find(u), find(v)\n        if pu != pv:\n            parent[pu] = pv\n            comp -= 1\n    return comp\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(countComponents(...))\n",
      "javascript": "/**\n * 117. Number of Connected Components\n * Difficulty: MEDIUM | Topic: Disjoint Sets / Connected Components\n * Optimal: O(V + E * alpha(V)) time, O(V) space\n */\n\nconst fs = require('fs');\n\nfunction countComponents(n: int, edges: list[list[int]]) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 117. Number of Connected Components\n// Difficulty: MEDIUM | Topic: Disjoint Sets / Connected Components\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 117. Number of Connected Components\n// Difficulty: MEDIUM | Topic: Disjoint Sets / Connected Components\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_118",
    "number": 118,
    "title": "Word Ladder",
    "slug": "word-ladder",
    "topic_id": "topic_graphs",
    "subtopic": "Shortest Transformation BFS",
    "difficulty": "HARD",
    "roadmap_stage": "Placement Revision",
    "companies": [
      "Amazon",
      "Google",
      "Meta",
      "LinkedIn"
    ],
    "tags": [
      "graphs"
    ],
    "description": "A transformation sequence from word beginWord to word endWord using a dictionary wordList is a sequence of words beginWord -> s1 -> s2 -> ... -> sk such that:\n- Every adjacent pair of words differs by a single letter.\n- Every si for 1 <= i <= k is in wordList. Note that beginWord does not need to be in wordList.\n- sk == endWord\n\nGiven two words, beginWord and endWord, and a dictionary wordList, return the number of words in the shortest transformation sequence from beginWord to endWord, or 0 if no such sequence exists.",
    "input_format": "Line 1: beginWord\nLine 2: endWord\nLine 3: space-separated words in wordList",
    "output_format": "Length of shortest transformation sequence (count of words), or 0.",
    "constraints": [
      "1 <= beginWord.length <= 10",
      "endWord.length == beginWord.length",
      "1 <= wordList.length <= 5000",
      "All strings consist of lowercase English letters."
    ],
    "examples": [
      {
        "input": "hit\ncog\nhot dot dog lot log cog",
        "output": "5",
        "explanation": "hit -> hot -> dot -> dog -> cog (5 words)."
      },
      {
        "input": "hit\ncog\nhot dot dog lot log",
        "output": "0",
        "explanation": "endWord \"cog\" is not in wordList."
      }
    ],
    "public_test_cases": [
      {
        "input": "hit\ncog\nhot dot dog lot log cog",
        "output": "5"
      },
      {
        "input": "hit\ncog\nhot dot dog lot log",
        "output": "0"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "a\nc\na b c",
        "output": "2"
      }
    ],
    "hints": [
      "Each word is a node. An edge exists between words that differ by exactly 1 character.",
      "Use BFS to find the shortest transformation path.",
      "Intermediate generic pattern map (e.g. h*t -> [hot, hit]) speeds up neighbor generation."
    ],
    "optimal_complexity": {
      "time": "O(M^2 * N)",
      "space": "O(M^2 * N)"
    },
    "solution_explanation": "BFS on intermediate pattern graph (e.g., d*g). Level distance directly corresponds to the minimum transformation sequence length.",
    "starter_code": {
      "python": "# 118. Word Ladder\n# Difficulty: HARD | Topic: Shortest Transformation BFS\n# Time Complexity Target: O(M^2 * N) | Space Complexity Target: O(M^2 * N)\n\nimport sys\nimport json\n\ndef ladderLength(beginWord: str, endWord: str, wordList: list[str]) -> int:\n    \"\"\"\n    A transformation sequence from word beginWord to word endWord using a dictionary wordList is a sequence of words beginWord -> s1 -> s2 -> .\n    \"\"\"\n    # TODO: Implement your solution here\n    from collections import deque, defaultdict\n    words = set(wordList)\n    if endWord not in words: return 0\n    patterns = defaultdict(list)\n    L = len(beginWord)\n    for w in words:\n        for i in range(L): patterns[w[:i] + '*' + w[i+1:]].append(w)\n    q = deque([(beginWord, 1)])\n    visited = {beginWord}\n    while q:\n        word, steps = q.popleft()\n        if word == endWord: return steps\n        for i in range(L):\n            pat = word[:i] + '*' + word[i+1:]\n            for nxt in patterns[pat]:\n                if nxt not in visited:\n                    visited.add(nxt)\n                    q.append((nxt, steps + 1))\n            patterns[pat] = []\n    return 0\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(ladderLength(...))\n",
      "javascript": "/**\n * 118. Word Ladder\n * Difficulty: HARD | Topic: Shortest Transformation BFS\n * Optimal: O(M^2 * N) time, O(M^2 * N) space\n */\n\nconst fs = require('fs');\n\nfunction ladderLength(beginWord: str, endWord: str, wordList: list[str]) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 118. Word Ladder\n// Difficulty: HARD | Topic: Shortest Transformation BFS\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 118. Word Ladder\n// Difficulty: HARD | Topic: Shortest Transformation BFS\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_119",
    "number": 119,
    "title": "Alien Dictionary",
    "slug": "alien-dictionary",
    "topic_id": "topic_graphs",
    "subtopic": "Lexicographical Topological Ordering",
    "difficulty": "HARD",
    "roadmap_stage": "Placement Revision",
    "companies": [
      "Meta",
      "Google",
      "Amazon",
      "Twitter"
    ],
    "tags": [
      "graphs"
    ],
    "description": "There is a new alien language that uses the English alphabet. However, the order of the letters is unknown to you.\n\nYou are given a list of strings words from the alien language's dictionary, where the strings are sorted lexicographically by the rules of this new language.\n\nReturn a string of the unique letters in the new alien language sorted in lexicographically increasing order by the new language's rules. If there is no solution, return \"\".",
    "input_format": "A single line containing space-separated words sorted in alien lexicographical order.",
    "output_format": "String of alien character ordering, or empty string.",
    "constraints": [
      "1 <= words.length <= 100",
      "1 <= words[i].length <= 100",
      "words[i] consists of only lowercase English letters."
    ],
    "examples": [
      {
        "input": "wrt wrf er ett rftt",
        "output": "wertf"
      },
      {
        "input": "z x",
        "output": "zx"
      },
      {
        "input": "z x z",
        "output": "",
        "explanation": "Cycle between z and x."
      }
    ],
    "public_test_cases": [
      {
        "input": "wrt wrf er ett rftt",
        "output": "wertf"
      },
      {
        "input": "z x",
        "output": "zx"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "z x z",
        "output": ""
      },
      {
        "input": "abc ab",
        "output": ""
      }
    ],
    "hints": [
      "Compare adjacent words in the dictionary to find the first differing character: word1[j] -> word2[j] creates a directed edge.",
      "If word1 is a prefix of word2 but comes after word2 with greater length, it is invalid.",
      "Run topological sort on the character graph. If a cycle is detected, return \"\"."
    ],
    "optimal_complexity": {
      "time": "O(Total Characters)",
      "space": "O(Unique Characters)"
    },
    "solution_explanation": "Extract character precedence by comparing adjacent words. Topological sort establishes character order; cycle detection flags contradictions.",
    "starter_code": {
      "python": "# 119. Alien Dictionary\n# Difficulty: HARD | Topic: Lexicographical Topological Ordering\n# Time Complexity Target: O(Total Characters) | Space Complexity Target: O(Unique Characters)\n\nimport sys\nimport json\n\ndef alienOrder(words: list[str]) -> str:\n    \"\"\"\n    There is a new alien language that uses the English alphabet.\n    \"\"\"\n    # TODO: Implement your solution here\n    from collections import defaultdict, deque\n    adj = {c: set() for w in words for c in w}\n    in_degree = {c: 0 for c in adj}\n    for i in range(len(words) - 1):\n        w1, w2 = words[i], words[i + 1]\n        min_len = min(len(w1), len(w2))\n        if len(w1) > len(w2) and w1[:min_len] == w2[:min_len]: return ''\n        for j in range(min_len):\n            if w1[j] != w2[j]:\n                if w2[j] not in adj[w1[j]]:\n                    adj[w1[j]].add(w2[j])\n                    in_degree[w2[j]] += 1\n                break\n    q = deque([c for c in in_degree if in_degree[c] == 0])\n    res = []\n    while q:\n        c = q.popleft()\n        res.append(c)\n        for nxt in adj[c]:\n            in_degree[nxt] -= 1\n            if in_degree[nxt] == 0: q.append(nxt)\n    return ''.join(res) if len(res) == len(adj) else ''\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(alienOrder(...))\n",
      "javascript": "/**\n * 119. Alien Dictionary\n * Difficulty: HARD | Topic: Lexicographical Topological Ordering\n * Optimal: O(Total Characters) time, O(Unique Characters) space\n */\n\nconst fs = require('fs');\n\nfunction alienOrder(words: list[str]) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 119. Alien Dictionary\n// Difficulty: HARD | Topic: Lexicographical Topological Ordering\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 119. Alien Dictionary\n// Difficulty: HARD | Topic: Lexicographical Topological Ordering\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_120",
    "number": 120,
    "title": "Assign Cookies",
    "slug": "assign-cookies",
    "topic_id": "topic_greedy",
    "subtopic": "Greedy Matching",
    "difficulty": "EASY",
    "roadmap_stage": "Beginner Foundations",
    "companies": [
      "Amazon",
      "Apple",
      "Google"
    ],
    "tags": [
      "greedy"
    ],
    "description": "Assume you are an awesome parent and want to give your children some cookies. But, you should give each child at most one cookie.\n\nEach child i has a greed factor g[i], which is the minimum size of a cookie that the child will be content with; and each cookie j has a size s[j]. If s[j] >= g[i], we can assign the cookie j to the child i, and the child i will be content. Your goal is to maximize the number of your content children and output the maximum number.",
    "input_format": "Line 1: space-separated integers for children greed factors g\nLine 2: space-separated integers for cookie sizes s",
    "output_format": "Single integer count of content children.",
    "constraints": [
      "1 <= g.length <= 3 * 10^4",
      "0 <= s.length <= 3 * 10^4",
      "1 <= g[i], s[j] <= 2^31 - 1"
    ],
    "examples": [
      {
        "input": "1 2 3\n1 1",
        "output": "1",
        "explanation": "Only 1 child with greed 1 can be satisfied."
      },
      {
        "input": "1 2\n1 2 3",
        "output": "2",
        "explanation": "Both children can be satisfied."
      }
    ],
    "public_test_cases": [
      {
        "input": "1 2 3\n1 1",
        "output": "1"
      },
      {
        "input": "1 2\n1 2 3",
        "output": "2"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "1 2 3\n",
        "output": "0"
      },
      {
        "input": "10 9 8 7\n5 6 7 8",
        "output": "2"
      }
    ],
    "hints": [
      "Sort both the children's greed array and the cookies array.",
      "Use a greedy approach: try to satisfy the child with the smallest greed factor using the smallest sufficient cookie.",
      "Two pointers advancing through both sorted arrays."
    ],
    "optimal_complexity": {
      "time": "O(N log N + M log M)",
      "space": "O(1)"
    },
    "solution_explanation": "Sort both arrays. Greedily satisfy the least greedy child with the smallest available cookie that is >= greed factor.",
    "starter_code": {
      "python": "# 120. Assign Cookies\n# Difficulty: EASY | Topic: Greedy Matching\n# Time Complexity Target: O(N log N + M log M) | Space Complexity Target: O(1)\n\nimport sys\nimport json\n\ndef findContentChildren(g: list[int], s: list[int]) -> int:\n    \"\"\"\n    Assume you are an awesome parent and want to give your children some cookies.\n    \"\"\"\n    # TODO: Implement your solution here\n    g.sort()\n    s.sort()\n    child, cookie = 0, 0\n    while child < len(g) and cookie < len(s):\n        if s[cookie] >= g[child]:\n            child += 1\n        cookie += 1\n    return child\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(findContentChildren(...))\n",
      "javascript": "/**\n * 120. Assign Cookies\n * Difficulty: EASY | Topic: Greedy Matching\n * Optimal: O(N log N + M log M) time, O(1) space\n */\n\nconst fs = require('fs');\n\nfunction findContentChildren(g: list[int], s: list[int]) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 120. Assign Cookies\n// Difficulty: EASY | Topic: Greedy Matching\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 120. Assign Cookies\n// Difficulty: EASY | Topic: Greedy Matching\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_121",
    "number": 121,
    "title": "Jump Game",
    "slug": "jump-game",
    "topic_id": "topic_greedy",
    "subtopic": "Maximum Reach Tracking",
    "difficulty": "MEDIUM",
    "roadmap_stage": "Core Patterns",
    "companies": [
      "Amazon",
      "Apple",
      "Google",
      "Meta",
      "Microsoft"
    ],
    "tags": [
      "greedy"
    ],
    "description": "You are given an integer array nums. You are initially positioned at the array's first index, and each element in the array represents your maximum jump length at that position.\n\nReturn true if you can reach the last index, or false otherwise.",
    "input_format": "A single line of space-separated integers representing nums.",
    "output_format": "true or false",
    "constraints": [
      "1 <= nums.length <= 10^4",
      "0 <= nums[i] <= 10^5"
    ],
    "examples": [
      {
        "input": "2 3 1 1 4",
        "output": "true",
        "explanation": "Jump 1 step from index 0 to 1, then 3 steps to the last index."
      },
      {
        "input": "3 2 1 0 4",
        "output": "false",
        "explanation": "You will always arrive at index 3 no matter what. Its maximum jump length is 0, which makes it impossible to reach the last index."
      }
    ],
    "public_test_cases": [
      {
        "input": "2 3 1 1 4",
        "output": "true"
      },
      {
        "input": "3 2 1 0 4",
        "output": "false"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "0",
        "output": "true"
      },
      {
        "input": "2 0 0",
        "output": "true"
      }
    ],
    "hints": [
      "Track the furthest index you can reach so far.",
      "At each step i, if i > max_reach, return false because you cannot even reach index i.",
      "Update max_reach = max(max_reach, i + nums[i]). If max_reach >= last index, return true."
    ],
    "optimal_complexity": {
      "time": "O(N)",
      "space": "O(1)"
    },
    "solution_explanation": "Greedily update maximum reachable index. If current index exceeds maximum reach, last index is unreachable.",
    "starter_code": {
      "python": "# 121. Jump Game\n# Difficulty: MEDIUM | Topic: Maximum Reach Tracking\n# Time Complexity Target: O(N) | Space Complexity Target: O(1)\n\nimport sys\nimport json\n\ndef canJump(nums: list[int]) -> bool:\n    \"\"\"\n    You are given an integer array nums.\n    \"\"\"\n    # TODO: Implement your solution here\n    max_reach = 0\n    for i, jump in enumerate(nums):\n        if i > max_reach: return False\n        max_reach = max(max_reach, i + jump)\n        if max_reach >= len(nums) - 1: return True\n    return True\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(canJump(...))\n",
      "javascript": "/**\n * 121. Jump Game\n * Difficulty: MEDIUM | Topic: Maximum Reach Tracking\n * Optimal: O(N) time, O(1) space\n */\n\nconst fs = require('fs');\n\nfunction canJump(nums: list[int]) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 121. Jump Game\n// Difficulty: MEDIUM | Topic: Maximum Reach Tracking\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 121. Jump Game\n// Difficulty: MEDIUM | Topic: Maximum Reach Tracking\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_122",
    "number": 122,
    "title": "Jump Game II",
    "slug": "jump-game-ii",
    "topic_id": "topic_greedy",
    "subtopic": "BFS Window Boundary Jumping",
    "difficulty": "MEDIUM",
    "roadmap_stage": "Core Patterns",
    "companies": [
      "Amazon",
      "Apple",
      "Google",
      "Meta"
    ],
    "tags": [
      "greedy"
    ],
    "description": "You are given a 0-indexed array of integers nums of length n. You are initially positioned at nums[0].\n\nEach element nums[i] represents the maximum length of a forward jump from index i. In other words, if you are at nums[i], you can jump to any nums[i + j] where:\n- 0 <= j <= nums[i] and\n- i + j < n\n\nReturn the minimum number of jumps to reach nums[n - 1]. The test cases are generated such that you can reach nums[n - 1].",
    "input_format": "A single line of space-separated integers representing nums.",
    "output_format": "Single integer minimum jump count.",
    "constraints": [
      "1 <= nums.length <= 10^4",
      "0 <= nums[i] <= 1000"
    ],
    "examples": [
      {
        "input": "2 3 1 1 4",
        "output": "2",
        "explanation": "Jump 1 step from index 0 to 1, then 3 steps to the last index."
      },
      {
        "input": "2 3 0 1 4",
        "output": "2"
      }
    ],
    "public_test_cases": [
      {
        "input": "2 3 1 1 4",
        "output": "2"
      },
      {
        "input": "2 3 0 1 4",
        "output": "2"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "1",
        "output": "0"
      },
      {
        "input": "1 2 3",
        "output": "2"
      }
    ],
    "hints": [
      "Think of jumps as layers in a BFS traversal.",
      "Maintain current jump boundary `cur_end` and furthest reachable index `farthest`.",
      "When i reaches `cur_end`, increment jump count and update `cur_end = farthest`."
    ],
    "optimal_complexity": {
      "time": "O(N)",
      "space": "O(1)"
    },
    "solution_explanation": "Implicit BFS: track the furthest point reachable with the current number of jumps. Advance jump counter when exiting current layer boundary.",
    "starter_code": {
      "python": "# 122. Jump Game II\n# Difficulty: MEDIUM | Topic: BFS Window Boundary Jumping\n# Time Complexity Target: O(N) | Space Complexity Target: O(1)\n\nimport sys\nimport json\n\ndef jump(nums: list[int]) -> int:\n    \"\"\"\n    You are given a 0-indexed array of integers nums of length n.\n    \"\"\"\n    # TODO: Implement your solution here\n    jumps, cur_end, farthest = 0, 0, 0\n    for i in range(len(nums) - 1):\n        farthest = max(farthest, i + nums[i])\n        if i == cur_end:\n            jumps += 1\n            cur_end = farthest\n    return jumps\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(jump(...))\n",
      "javascript": "/**\n * 122. Jump Game II\n * Difficulty: MEDIUM | Topic: BFS Window Boundary Jumping\n * Optimal: O(N) time, O(1) space\n */\n\nconst fs = require('fs');\n\nfunction jump(nums: list[int]) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 122. Jump Game II\n// Difficulty: MEDIUM | Topic: BFS Window Boundary Jumping\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 122. Jump Game II\n// Difficulty: MEDIUM | Topic: BFS Window Boundary Jumping\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_123",
    "number": 123,
    "title": "Gas Station",
    "slug": "gas-station",
    "topic_id": "topic_greedy",
    "subtopic": "Prefix Net Gain Greedy",
    "difficulty": "MEDIUM",
    "roadmap_stage": "Core Patterns",
    "companies": [
      "Amazon",
      "Google",
      "Microsoft"
    ],
    "tags": [
      "greedy"
    ],
    "description": "There are n gas stations along a circular route, where the amount of gas at the ith station is gas[i].\n\nYou have a car with an unlimited gas tank and it costs cost[i] of gas to travel from the ith station to its next (i + 1)th station. You begin the journey with an empty tank at one of the gas stations.\n\nGiven two integer arrays gas and cost, return the starting gas station's index if you can travel around the circuit once in the clockwise direction, otherwise return -1. If there exists a solution, it is guaranteed to be unique.",
    "input_format": "Line 1: space-separated integers for gas\nLine 2: space-separated integers for cost",
    "output_format": "0-based integer starting station index, or -1.",
    "constraints": [
      "n == gas.length == cost.length",
      "1 <= n <= 10^5",
      "0 <= gas[i], cost[i] <= 10^4"
    ],
    "examples": [
      {
        "input": "1 2 3 4 5\n3 4 5 1 2",
        "output": "3",
        "explanation": "Start at station 3 (index 3) and fill up with 4 unit of gas. Complete circuit."
      },
      {
        "input": "2 3 4\n3 4 3",
        "output": "-1"
      }
    ],
    "public_test_cases": [
      {
        "input": "1 2 3 4 5\n3 4 5 1 2",
        "output": "3"
      },
      {
        "input": "2 3 4\n3 4 3",
        "output": "-1"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "5 1 2 3 4\n4 4 1 5 1",
        "output": "4"
      }
    ],
    "hints": [
      "If sum(gas) < sum(cost), it is mathematically impossible to complete the circuit, return -1.",
      "If tank drops below 0 while starting from station A and reaching B, no station between A and B can be a valid starting point either.",
      "Reset start index to B + 1 and reset current tank to 0."
    ],
    "optimal_complexity": {
      "time": "O(N)",
      "space": "O(1)"
    },
    "solution_explanation": "If total gas >= total cost, a solution is guaranteed. Whenever running tank falls below zero, the next station is chosen as the new candidate start.",
    "starter_code": {
      "python": "# 123. Gas Station\n# Difficulty: MEDIUM | Topic: Prefix Net Gain Greedy\n# Time Complexity Target: O(N) | Space Complexity Target: O(1)\n\nimport sys\nimport json\n\ndef canCompleteCircuit(gas: list[int], cost: list[int]) -> int:\n    \"\"\"\n    There are n gas stations along a circular route, where the amount of gas at the ith station is gas[i].\n    \"\"\"\n    # TODO: Implement your solution here\n    if sum(gas) < sum(cost): return -1\n    total_tank, curr_tank = 0, 0\n    start = 0\n    for i in range(len(gas)):\n        net = gas[i] - cost[i]\n        curr_tank += net\n        if curr_tank < 0:\n            start = i + 1\n            curr_tank = 0\n    return start\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(canCompleteCircuit(...))\n",
      "javascript": "/**\n * 123. Gas Station\n * Difficulty: MEDIUM | Topic: Prefix Net Gain Greedy\n * Optimal: O(N) time, O(1) space\n */\n\nconst fs = require('fs');\n\nfunction canCompleteCircuit(gas: list[int], cost: list[int]) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 123. Gas Station\n// Difficulty: MEDIUM | Topic: Prefix Net Gain Greedy\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 123. Gas Station\n// Difficulty: MEDIUM | Topic: Prefix Net Gain Greedy\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_124",
    "number": 124,
    "title": "Non-overlapping Intervals",
    "slug": "non-overlapping-intervals",
    "topic_id": "topic_greedy",
    "subtopic": "Earliest End Time Scheduling",
    "difficulty": "MEDIUM",
    "roadmap_stage": "Core Patterns",
    "companies": [
      "Amazon",
      "Facebook",
      "Google"
    ],
    "tags": [
      "greedy"
    ],
    "description": "Given an array of intervals intervals where intervals[i] = [starti, endi], return the minimum number of intervals you need to remove to make the rest of the intervals non-overlapping.",
    "input_format": "Line 1: N\nNext N lines: start end",
    "output_format": "Single integer count of removed intervals.",
    "constraints": [
      "1 <= intervals.length <= 10^5",
      "intervals[i].length == 2",
      "-5 * 10^4 <= starti < endi <= 5 * 10^4"
    ],
    "examples": [
      {
        "input": "4\n1 2\n2 3\n3 4\n1 3",
        "output": "1",
        "explanation": "[1,3] can be removed and the rest of intervals are non-overlapping."
      },
      {
        "input": "3\n1 2\n1 2\n1 2",
        "output": "2"
      },
      {
        "input": "2\n1 2\n2 3",
        "output": "0"
      }
    ],
    "public_test_cases": [
      {
        "input": "4\n1 2\n2 3\n3 4\n1 3",
        "output": "1"
      },
      {
        "input": "3\n1 2\n1 2\n1 2",
        "output": "2"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "2\n1 2\n2 3",
        "output": "0"
      }
    ],
    "hints": [
      "Interval Scheduling theorem: sorting by END time maximizes the number of non-overlapping intervals.",
      "Iterate through sorted intervals: if an interval starts before the previous one ends, remove it.",
      "Otherwise, update the last ending time."
    ],
    "optimal_complexity": {
      "time": "O(N log N)",
      "space": "O(1)"
    },
    "solution_explanation": "Greedy activity selection: sort intervals by end time. Keep intervals that do not overlap with previous end; count the rest as removed.",
    "starter_code": {
      "python": "# 124. Non-overlapping Intervals\n# Difficulty: MEDIUM | Topic: Earliest End Time Scheduling\n# Time Complexity Target: O(N log N) | Space Complexity Target: O(1)\n\nimport sys\nimport json\n\ndef eraseOverlapIntervals(intervals: list[list[int]]) -> int:\n    \"\"\"\n    Given an array of intervals intervals where intervals[i] = [starti, endi], return the minimum number of intervals you need to remove to make the rest of the intervals non-overlapping.\n    \"\"\"\n    # TODO: Implement your solution here\n    intervals.sort(key=lambda x: x[1])\n    ans = 0\n    prev_end = float('-inf')\n    for start, end in intervals:\n        if start >= prev_end:\n            prev_end = end\n        else:\n            ans += 1\n    return ans\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(eraseOverlapIntervals(...))\n",
      "javascript": "/**\n * 124. Non-overlapping Intervals\n * Difficulty: MEDIUM | Topic: Earliest End Time Scheduling\n * Optimal: O(N log N) time, O(1) space\n */\n\nconst fs = require('fs');\n\nfunction eraseOverlapIntervals(intervals: list[list[int]]) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 124. Non-overlapping Intervals\n// Difficulty: MEDIUM | Topic: Earliest End Time Scheduling\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 124. Non-overlapping Intervals\n// Difficulty: MEDIUM | Topic: Earliest End Time Scheduling\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_125",
    "number": 125,
    "title": "Partition Labels",
    "slug": "partition-labels",
    "topic_id": "topic_greedy",
    "subtopic": "Last Occurrence Boundary Partition",
    "difficulty": "HARD",
    "roadmap_stage": "Placement Revision",
    "companies": [
      "Amazon",
      "Google",
      "Meta"
    ],
    "tags": [
      "greedy"
    ],
    "description": "You are given a string s. We want to partition the string into as many parts as possible so that each letter appears in at most one part.\n\nNote that the partition is done so that after concatenating all the parts in order, the resultant string should be s.\n\nReturn a list of integers representing the size of these parts.",
    "input_format": "A single line containing string s.",
    "output_format": "Space-separated partition lengths.",
    "constraints": [
      "1 <= s.length <= 500",
      "s consists of lowercase English letters."
    ],
    "examples": [
      {
        "input": "ababcbacadefegdehijhklij",
        "output": "9 7 8",
        "explanation": "The partition is \"ababcbaca\", \"defegde\", \"hijhklij\"."
      },
      {
        "input": "eccbbbbdec",
        "output": "10"
      }
    ],
    "public_test_cases": [
      {
        "input": "ababcbacadefegdehijhklij",
        "output": "9 7 8"
      },
      {
        "input": "eccbbbbdec",
        "output": "10"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "a",
        "output": "1"
      },
      {
        "input": "abac",
        "output": "3 1"
      }
    ],
    "hints": [
      "Record the last occurrence index of each character in s.",
      "As you iterate, extend current partition end to max(current_end, last_seen[char]).",
      "When current index == current_end, you have found a partition boundary."
    ],
    "optimal_complexity": {
      "time": "O(N)",
      "space": "O(1)"
    },
    "solution_explanation": "Map each character to its last index. The partition end expands to encompass the furthest occurrence of any character within it. Closes when i == end.",
    "starter_code": {
      "python": "# 125. Partition Labels\n# Difficulty: HARD | Topic: Last Occurrence Boundary Partition\n# Time Complexity Target: O(N) | Space Complexity Target: O(1)\n\nimport sys\nimport json\n\ndef partitionLabels(s: str) -> list[int]:\n    \"\"\"\n    You are given a string s.\n    \"\"\"\n    # TODO: Implement your solution here\n    last = {c: i for i, c in enumerate(s)}\n    res = []\n    size, end = 0, 0\n    for i, c in enumerate(s):\n        size += 1\n        end = max(end, last[c])\n        if i == end:\n            res.append(size)\n            size = 0\n    return res\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(partitionLabels(...))\n",
      "javascript": "/**\n * 125. Partition Labels\n * Difficulty: HARD | Topic: Last Occurrence Boundary Partition\n * Optimal: O(N) time, O(1) space\n */\n\nconst fs = require('fs');\n\nfunction partitionLabels(s: str) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 125. Partition Labels\n// Difficulty: HARD | Topic: Last Occurrence Boundary Partition\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 125. Partition Labels\n// Difficulty: HARD | Topic: Last Occurrence Boundary Partition\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_126",
    "number": 126,
    "title": "Candy",
    "slug": "candy",
    "topic_id": "topic_greedy",
    "subtopic": "Two-Pass Bidirectional Ratings",
    "difficulty": "HARD",
    "roadmap_stage": "Placement Revision",
    "companies": [
      "Amazon",
      "Google",
      "Meta",
      "Microsoft"
    ],
    "tags": [
      "greedy"
    ],
    "description": "There are n children standing in a line. Each child is assigned a rating value given in the integer array ratings.\n\nYou are giving candies to these children subjected to the following requirements:\n- Each child must have at least one candy.\n- Children with a higher rating get more candies than their neighbors.\n\nReturn the minimum number of candies you need to have to distribute the candies to the children.",
    "input_format": "A single line of space-separated integers representing ratings.",
    "output_format": "Single integer representing total candies.",
    "constraints": [
      "n == ratings.length",
      "1 <= n <= 2 * 10^4",
      "0 <= ratings[i] <= 2 * 10^4"
    ],
    "examples": [
      {
        "input": "1 0 2",
        "output": "5",
        "explanation": "Candies: [2, 1, 2]. Total = 5."
      },
      {
        "input": "1 2 2",
        "output": "4",
        "explanation": "Candies: [1, 2, 1]. Total = 4."
      }
    ],
    "public_test_cases": [
      {
        "input": "1 0 2",
        "output": "5"
      },
      {
        "input": "1 2 2",
        "output": "4"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "1",
        "output": "1"
      },
      {
        "input": "1 3 2 2 1",
        "output": "7"
      }
    ],
    "hints": [
      "Give every child 1 candy initially.",
      "Pass 1 (left to right): if ratings[i] > ratings[i-1], candies[i] = candies[i-1] + 1.",
      "Pass 2 (right to left): if ratings[i] > ratings[i+1], candies[i] = max(candies[i], candies[i+1] + 1)."
    ],
    "optimal_complexity": {
      "time": "O(N)",
      "space": "O(N)"
    },
    "solution_explanation": "Two passes: left-to-right ensures higher rated children exceed their left neighbor; right-to-left ensures they exceed their right neighbor.",
    "starter_code": {
      "python": "# 126. Candy\n# Difficulty: HARD | Topic: Two-Pass Bidirectional Ratings\n# Time Complexity Target: O(N) | Space Complexity Target: O(N)\n\nimport sys\nimport json\n\ndef candy(ratings: list[int]) -> int:\n    \"\"\"\n    There are n children standing in a line.\n    \"\"\"\n    # TODO: Implement your solution here\n    n = len(ratings)\n    candies = [1] * n\n    for i in range(1, n):\n        if ratings[i] > ratings[i - 1]:\n            candies[i] = candies[i - 1] + 1\n    for i in range(n - 2, -1, -1):\n        if ratings[i] > ratings[i + 1]:\n            candies[i] = max(candies[i], candies[i + 1] + 1)\n    return sum(candies)\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(candy(...))\n",
      "javascript": "/**\n * 126. Candy\n * Difficulty: HARD | Topic: Two-Pass Bidirectional Ratings\n * Optimal: O(N) time, O(N) space\n */\n\nconst fs = require('fs');\n\nfunction candy(ratings: list[int]) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 126. Candy\n// Difficulty: HARD | Topic: Two-Pass Bidirectional Ratings\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 126. Candy\n// Difficulty: HARD | Topic: Two-Pass Bidirectional Ratings\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_127",
    "number": 127,
    "title": "Climbing Stairs",
    "slug": "climbing-stairs",
    "topic_id": "topic_dynamic_programming",
    "subtopic": "1D State Transitions",
    "difficulty": "EASY",
    "roadmap_stage": "Beginner Foundations",
    "companies": [
      "Amazon",
      "Apple",
      "Google",
      "Meta",
      "Microsoft"
    ],
    "tags": [
      "dynamic programming"
    ],
    "description": "You are climbing a staircase. It takes n steps to reach the top.\n\nEach time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
    "input_format": "A single integer n.",
    "output_format": "Single integer count of distinct paths.",
    "constraints": [
      "1 <= n <= 45"
    ],
    "examples": [
      {
        "input": "2",
        "output": "2",
        "explanation": "1 step + 1 step, or 2 steps."
      },
      {
        "input": "3",
        "output": "3",
        "explanation": "1+1+1, 1+2, 2+1."
      }
    ],
    "public_test_cases": [
      {
        "input": "2",
        "output": "2"
      },
      {
        "input": "3",
        "output": "3"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "1",
        "output": "1"
      },
      {
        "input": "4",
        "output": "5"
      },
      {
        "input": "5",
        "output": "8"
      }
    ],
    "hints": [
      "To reach step n, you must arrive from step n-1 or step n-2.",
      "Recurrence relation: ways(n) = ways(n-1) + ways(n-2).",
      "This is Fibonacci. Compute in O(N) time with O(1) space."
    ],
    "optimal_complexity": {
      "time": "O(N)",
      "space": "O(1)"
    },
    "solution_explanation": "Number of ways to reach step n equals the sum of ways to reach step n-1 and n-2. Solved in O(N) time with two variables.",
    "starter_code": {
      "python": "# 127. Climbing Stairs\n# Difficulty: EASY | Topic: 1D State Transitions\n# Time Complexity Target: O(N) | Space Complexity Target: O(1)\n\nimport sys\nimport json\n\ndef climbStairs(n: int) -> int:\n    \"\"\"\n    You are climbing a staircase.\n    \"\"\"\n    # TODO: Implement your solution here\n    if n <= 2: return n\n    a, b = 1, 2\n    for _ in range(3, n + 1):\n        a, b = b, a + b\n    return b\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(climbStairs(...))\n",
      "javascript": "/**\n * 127. Climbing Stairs\n * Difficulty: EASY | Topic: 1D State Transitions\n * Optimal: O(N) time, O(1) space\n */\n\nconst fs = require('fs');\n\nfunction climbStairs(n: int) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 127. Climbing Stairs\n// Difficulty: EASY | Topic: 1D State Transitions\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 127. Climbing Stairs\n// Difficulty: EASY | Topic: 1D State Transitions\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_128",
    "number": 128,
    "title": "Min Cost Climbing Stairs",
    "slug": "min-cost-climbing-stairs",
    "topic_id": "topic_dynamic_programming",
    "subtopic": "Minimum Path Sum Recurrence",
    "difficulty": "EASY",
    "roadmap_stage": "Beginner Foundations",
    "companies": [
      "Amazon",
      "Apple"
    ],
    "tags": [
      "dynamic programming"
    ],
    "description": "You are given an integer array cost where cost[i] is the cost of ith step on a staircase. Once you pay the cost, you can either climb one or two steps.\n\nYou can either start from the step with index 0, or the step with index 1.\n\nReturn the minimum cost to reach the top of the floor.",
    "input_format": "A single line of space-separated integers representing cost.",
    "output_format": "Single integer minimum cost.",
    "constraints": [
      "2 <= cost.length <= 1000",
      "0 <= cost[i] <= 999"
    ],
    "examples": [
      {
        "input": "10 15 20",
        "output": "15",
        "explanation": "Start at index 1, pay 15 and climb two steps to reach top."
      },
      {
        "input": "1 100 1 1 1 100 1 1 100 1",
        "output": "6"
      }
    ],
    "public_test_cases": [
      {
        "input": "10 15 20",
        "output": "15"
      },
      {
        "input": "1 100 1 1 1 100 1 1 100 1",
        "output": "6"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "0 0",
        "output": "0"
      },
      {
        "input": "1 2",
        "output": "1"
      }
    ],
    "hints": [
      "dp[i] = cost[i] + min(dp[i+1], dp[i+2]).",
      "Iterate backwards from n - 3 down to 0.",
      "Result is min(dp[0], dp[1])."
    ],
    "optimal_complexity": {
      "time": "O(N)",
      "space": "O(1)"
    },
    "solution_explanation": "Bottom-up DP: cost to proceed from step i is cost[i] + min(cost[i+1], cost[i+2]).",
    "starter_code": {
      "python": "# 128. Min Cost Climbing Stairs\n# Difficulty: EASY | Topic: Minimum Path Sum Recurrence\n# Time Complexity Target: O(N) | Space Complexity Target: O(1)\n\nimport sys\nimport json\n\ndef minCostClimbingStairs(cost: list[int]) -> int:\n    \"\"\"\n    You are given an integer array cost where cost[i] is the cost of ith step on a staircase.\n    \"\"\"\n    # TODO: Implement your solution here\n    cost.append(0)\n    for i in range(len(cost) - 3, -1, -1):\n        cost[i] += min(cost[i + 1], cost[i + 2])\n    return min(cost[0], cost[1])\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(minCostClimbingStairs(...))\n",
      "javascript": "/**\n * 128. Min Cost Climbing Stairs\n * Difficulty: EASY | Topic: Minimum Path Sum Recurrence\n * Optimal: O(N) time, O(1) space\n */\n\nconst fs = require('fs');\n\nfunction minCostClimbingStairs(cost: list[int]) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 128. Min Cost Climbing Stairs\n// Difficulty: EASY | Topic: Minimum Path Sum Recurrence\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 128. Min Cost Climbing Stairs\n// Difficulty: EASY | Topic: Minimum Path Sum Recurrence\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_129",
    "number": 129,
    "title": "N-th Tribonacci Number",
    "slug": "n-th-tribonacci-number",
    "topic_id": "topic_dynamic_programming",
    "subtopic": "Three-Term Recurrence",
    "difficulty": "EASY",
    "roadmap_stage": "Beginner Foundations",
    "companies": [
      "Amazon",
      "Apple"
    ],
    "tags": [
      "dynamic programming"
    ],
    "description": "The Tribonacci sequence Tn is defined as follows:\nT0 = 0, T1 = 1, T2 = 1, and Tn+3 = Tn + Tn+1 + Tn+2 for n >= 0.\n\nGiven n, return the value of Tn.",
    "input_format": "A single integer n.",
    "output_format": "Single integer Tn.",
    "constraints": [
      "0 <= n <= 37"
    ],
    "examples": [
      {
        "input": "4",
        "output": "4",
        "explanation": "T_3 = 0 + 1 + 1 = 2, T_4 = 1 + 1 + 2 = 4."
      },
      {
        "input": "25",
        "output": "1389537"
      }
    ],
    "public_test_cases": [
      {
        "input": "4",
        "output": "4"
      },
      {
        "input": "25",
        "output": "1389537"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "0",
        "output": "0"
      },
      {
        "input": "1",
        "output": "1"
      },
      {
        "input": "2",
        "output": "1"
      }
    ],
    "hints": [
      "Initialize three variables: t0 = 0, t1 = 1, t2 = 1.",
      "Loop from 3 to n, updating: t0, t1, t2 = t1, t2, t0 + t1 + t2.",
      "Return t2."
    ],
    "optimal_complexity": {
      "time": "O(N)",
      "space": "O(1)"
    },
    "solution_explanation": "Iterative constant space simulation of the 3-term linear recurrence relation.",
    "starter_code": {
      "python": "# 129. N-th Tribonacci Number\n# Difficulty: EASY | Topic: Three-Term Recurrence\n# Time Complexity Target: O(N) | Space Complexity Target: O(1)\n\nimport sys\nimport json\n\ndef tribonacci(n: int) -> int:\n    \"\"\"\n    The Tribonacci sequence Tn is defined as follows:\nT0 = 0, T1 = 1, T2 = 1, and Tn+3 = Tn + Tn+1 + Tn+2 for n >= 0.\n    \"\"\"\n    # TODO: Implement your solution here\n    if n == 0: return 0\n    if n <= 2: return 1\n    a, b, c = 0, 1, 1\n    for _ in range(3, n + 1):\n        a, b, c = b, c, a + b + c\n    return c\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(tribonacci(...))\n",
      "javascript": "/**\n * 129. N-th Tribonacci Number\n * Difficulty: EASY | Topic: Three-Term Recurrence\n * Optimal: O(N) time, O(1) space\n */\n\nconst fs = require('fs');\n\nfunction tribonacci(n: int) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 129. N-th Tribonacci Number\n// Difficulty: EASY | Topic: Three-Term Recurrence\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 129. N-th Tribonacci Number\n// Difficulty: EASY | Topic: Three-Term Recurrence\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_130",
    "number": 130,
    "title": "House Robber",
    "slug": "house-robber",
    "topic_id": "topic_dynamic_programming",
    "subtopic": "Non-Adjacent Maximum Sum",
    "difficulty": "MEDIUM",
    "roadmap_stage": "Core Patterns",
    "companies": [
      "Amazon",
      "Google",
      "Meta",
      "Microsoft"
    ],
    "tags": [
      "dynamic programming"
    ],
    "description": "You are a professional robber planning to rob houses along a street. Each house has a certain amount of money stashed, the only constraint stopping you from robbing each of them is that adjacent houses have security systems connected and it will automatically contact the police if two adjacent houses were broken into on the same night.\n\nGiven an integer array nums representing the amount of money of each house, return the maximum amount of money you can rob tonight without alerting the police.",
    "input_format": "A single line of space-separated integers representing nums.",
    "output_format": "Single integer maximum loot.",
    "constraints": [
      "1 <= nums.length <= 100",
      "0 <= nums[i] <= 400"
    ],
    "examples": [
      {
        "input": "1 2 3 1",
        "output": "4",
        "explanation": "Rob house 1 (money = 1) and then rob house 3 (money = 3). Total = 4."
      },
      {
        "input": "2 7 9 3 1",
        "output": "12",
        "explanation": "Rob house 1 (2), house 3 (9) and house 5 (1). Total = 12."
      }
    ],
    "public_test_cases": [
      {
        "input": "1 2 3 1",
        "output": "4"
      },
      {
        "input": "2 7 9 3 1",
        "output": "12"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "0",
        "output": "0"
      },
      {
        "input": "2 1 1 2",
        "output": "4"
      }
    ],
    "hints": [
      "For house i, you either rob it (money = nums[i] + max_loot(i-2)) or skip it (money = max_loot(i-1)).",
      "Recurrence: dp[i] = max(dp[i-1], nums[i] + dp[i-2]).",
      "Keep two variables for previous two max loots."
    ],
    "optimal_complexity": {
      "time": "O(N)",
      "space": "O(1)"
    },
    "solution_explanation": "At each house, choose between skipping current house (rob2) or robbing it (rob1 + n). Maintain rolling maximums in O(1) space.",
    "starter_code": {
      "python": "# 130. House Robber\n# Difficulty: MEDIUM | Topic: Non-Adjacent Maximum Sum\n# Time Complexity Target: O(N) | Space Complexity Target: O(1)\n\nimport sys\nimport json\n\ndef rob(nums: list[int]) -> int:\n    \"\"\"\n    You are a professional robber planning to rob houses along a street.\n    \"\"\"\n    # TODO: Implement your solution here\n    rob1, rob2 = 0, 0\n    for n in nums:\n        rob1, rob2 = rob2, max(rob2, rob1 + n)\n    return rob2\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(rob(...))\n",
      "javascript": "/**\n * 130. House Robber\n * Difficulty: MEDIUM | Topic: Non-Adjacent Maximum Sum\n * Optimal: O(N) time, O(1) space\n */\n\nconst fs = require('fs');\n\nfunction rob(nums: list[int]) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 130. House Robber\n// Difficulty: MEDIUM | Topic: Non-Adjacent Maximum Sum\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 130. House Robber\n// Difficulty: MEDIUM | Topic: Non-Adjacent Maximum Sum\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_131",
    "number": 131,
    "title": "House Robber II",
    "slug": "house-robber-ii",
    "topic_id": "topic_dynamic_programming",
    "subtopic": "Circular Non-Adjacent Robber",
    "difficulty": "MEDIUM",
    "roadmap_stage": "Core Patterns",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "tags": [
      "dynamic programming"
    ],
    "description": "You are a professional robber planning to rob houses along a street. Each house has a certain amount of money stashed. All houses at this place are arranged in a circle. That means the first house is the neighbor of the last one.\n\nGiven an integer array nums representing the amount of money of each house, return the maximum amount of money you can rob tonight without alerting the police.",
    "input_format": "A single line of space-separated integers representing nums.",
    "output_format": "Single integer maximum loot.",
    "constraints": [
      "1 <= nums.length <= 100",
      "0 <= nums[i] <= 1000"
    ],
    "examples": [
      {
        "input": "2 3 2",
        "output": "3",
        "explanation": "You cannot rob house 1 and house 3 because they are neighbors in a circle."
      },
      {
        "input": "1 2 3 1",
        "output": "4"
      },
      {
        "input": "1 2 3",
        "output": "3"
      }
    ],
    "public_test_cases": [
      {
        "input": "2 3 2",
        "output": "3"
      },
      {
        "input": "1 2 3 1",
        "output": "4"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "1",
        "output": "1"
      },
      {
        "input": "1 3 1 3 100",
        "output": "103"
      }
    ],
    "hints": [
      "Since house 0 and house n-1 are connected, you cannot rob both.",
      "Run House Robber I on two subarrays: nums[1:] (excluding first house) and nums[:-1] (excluding last house).",
      "The answer is max(nums[0], rob(nums[1:]), rob(nums[:-1]))."
    ],
    "optimal_complexity": {
      "time": "O(N)",
      "space": "O(1)"
    },
    "solution_explanation": "Decompose circle into two linear instances: excluding the first house or excluding the last house.",
    "starter_code": {
      "python": "# 131. House Robber II\n# Difficulty: MEDIUM | Topic: Circular Non-Adjacent Robber\n# Time Complexity Target: O(N) | Space Complexity Target: O(1)\n\nimport sys\nimport json\n\ndef rob2(nums: list[int]) -> int:\n    \"\"\"\n    You are a professional robber planning to rob houses along a street.\n    \"\"\"\n    # TODO: Implement your solution here\n    def helper(arr):\n        r1, r2 = 0, 0\n        for n in arr:\n            r1, r2 = r2, max(r2, r1 + n)\n        return r2\n    if len(nums) == 1: return nums[0]\n    return max(helper(nums[1:]), helper(nums[:-1]))\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(rob2(...))\n",
      "javascript": "/**\n * 131. House Robber II\n * Difficulty: MEDIUM | Topic: Circular Non-Adjacent Robber\n * Optimal: O(N) time, O(1) space\n */\n\nconst fs = require('fs');\n\nfunction rob2(nums: list[int]) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 131. House Robber II\n// Difficulty: MEDIUM | Topic: Circular Non-Adjacent Robber\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 131. House Robber II\n// Difficulty: MEDIUM | Topic: Circular Non-Adjacent Robber\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_132",
    "number": 132,
    "title": "Coin Change",
    "slug": "coin-change",
    "topic_id": "topic_dynamic_programming",
    "subtopic": "Unbounded Knapsack Minimum",
    "difficulty": "MEDIUM",
    "roadmap_stage": "Core Patterns",
    "companies": [
      "Amazon",
      "Apple",
      "Google",
      "Meta",
      "Microsoft"
    ],
    "tags": [
      "dynamic programming"
    ],
    "description": "You are given an integer array coins representing coins of different denominations and an integer amount representing a total amount of money.\n\nReturn the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return -1.\n\nYou may assume that you have an infinite number of each kind of coin.",
    "input_format": "Line 1: space-separated coin values\nLine 2: amount integer",
    "output_format": "Minimum number of coins, or -1.",
    "constraints": [
      "1 <= coins.length <= 12",
      "1 <= coins[i] <= 2^31 - 1",
      "0 <= amount <= 10^4"
    ],
    "examples": [
      {
        "input": "1 2 5\n11",
        "output": "3",
        "explanation": "11 = 5 + 5 + 1 (3 coins)."
      },
      {
        "input": "2\n3",
        "output": "-1"
      },
      {
        "input": "1\n0",
        "output": "0"
      }
    ],
    "public_test_cases": [
      {
        "input": "1 2 5\n11",
        "output": "3"
      },
      {
        "input": "2\n3",
        "output": "-1"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "1\n0",
        "output": "0"
      },
      {
        "input": "2 5 10 1\n27",
        "output": "4"
      }
    ],
    "hints": [
      "Let dp[i] be the minimum coins needed for amount i.",
      "Base case: dp[0] = 0, all other dp[i] = infinity.",
      "For each coin c and amount a from c to amount: dp[a] = min(dp[a], 1 + dp[a - c])."
    ],
    "optimal_complexity": {
      "time": "O(Amount * Coins)",
      "space": "O(Amount)"
    },
    "solution_explanation": "Bottom-up 1D DP: for each amount, test using each coin denomination and take the minimum of 1 + dp[amount - coin].",
    "starter_code": {
      "python": "# 132. Coin Change\n# Difficulty: MEDIUM | Topic: Unbounded Knapsack Minimum\n# Time Complexity Target: O(Amount * Coins) | Space Complexity Target: O(Amount)\n\nimport sys\nimport json\n\ndef coinChange(coins: list[int], amount: int) -> int:\n    \"\"\"\n    You are given an integer array coins representing coins of different denominations and an integer amount representing a total amount of money.\n    \"\"\"\n    # TODO: Implement your solution here\n    dp = [float('inf')] * (amount + 1)\n    dp[0] = 0\n    for a in range(1, amount + 1):\n        for c in coins:\n            if a - c >= 0:\n                dp[a] = min(dp[a], 1 + dp[a - c])\n    return dp[amount] if dp[amount] != float('inf') else -1\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(coinChange(...))\n",
      "javascript": "/**\n * 132. Coin Change\n * Difficulty: MEDIUM | Topic: Unbounded Knapsack Minimum\n * Optimal: O(Amount * Coins) time, O(Amount) space\n */\n\nconst fs = require('fs');\n\nfunction coinChange(coins: list[int], amount: int) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 132. Coin Change\n// Difficulty: MEDIUM | Topic: Unbounded Knapsack Minimum\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 132. Coin Change\n// Difficulty: MEDIUM | Topic: Unbounded Knapsack Minimum\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_133",
    "number": 133,
    "title": "Coin Change II",
    "slug": "coin-change-ii",
    "topic_id": "topic_dynamic_programming",
    "subtopic": "Unbounded Knapsack Combinations",
    "difficulty": "MEDIUM",
    "roadmap_stage": "Core Patterns",
    "companies": [
      "Amazon",
      "Google",
      "Microsoft"
    ],
    "tags": [
      "dynamic programming"
    ],
    "description": "You are given an integer array coins representing coins of different denominations and an integer amount representing a total amount of money.\n\nReturn the number of combinations that make up that amount. If that amount of money cannot be made up by any combination of the coins, return 0.",
    "input_format": "Line 1: space-separated integers for coins\nLine 2: amount integer",
    "output_format": "Single integer representing total combinations.",
    "constraints": [
      "1 <= coins.length <= 300",
      "1 <= coins[i] <= 5000",
      "All the values of coins are unique.",
      "0 <= amount <= 5000"
    ],
    "examples": [
      {
        "input": "1 2 5\n5",
        "output": "4",
        "explanation": "5=5, 5=2+2+1, 5=2+1+1+1, 5=1+1+1+1+1."
      },
      {
        "input": "2\n3",
        "output": "0"
      },
      {
        "input": "10\n10",
        "output": "1"
      }
    ],
    "public_test_cases": [
      {
        "input": "1 2 5\n5",
        "output": "4"
      },
      {
        "input": "2\n3",
        "output": "0"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "10\n10",
        "output": "1"
      }
    ],
    "hints": [
      "To count unique combinations without permutations, loop over coins in the outer loop.",
      "dp[a] += dp[a - coin].",
      "Outer coin loop ensures coins are considered in a fixed order."
    ],
    "optimal_complexity": {
      "time": "O(Amount * Coins)",
      "space": "O(Amount)"
    },
    "solution_explanation": "Unbounded knapsack combination count: outer iteration over coins guarantees combination uniqueness without permutations.",
    "starter_code": {
      "python": "# 133. Coin Change II\n# Difficulty: MEDIUM | Topic: Unbounded Knapsack Combinations\n# Time Complexity Target: O(Amount * Coins) | Space Complexity Target: O(Amount)\n\nimport sys\nimport json\n\ndef change(amount: int, coins: list[int]) -> int:\n    \"\"\"\n    You are given an integer array coins representing coins of different denominations and an integer amount representing a total amount of money.\n    \"\"\"\n    # TODO: Implement your solution here\n    dp = [0] * (amount + 1)\n    dp[0] = 1\n    for c in coins:\n        for a in range(c, amount + 1):\n            dp[a] += dp[a - c]\n    return dp[amount]\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(change(...))\n",
      "javascript": "/**\n * 133. Coin Change II\n * Difficulty: MEDIUM | Topic: Unbounded Knapsack Combinations\n * Optimal: O(Amount * Coins) time, O(Amount) space\n */\n\nconst fs = require('fs');\n\nfunction change(amount: int, coins: list[int]) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 133. Coin Change II\n// Difficulty: MEDIUM | Topic: Unbounded Knapsack Combinations\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 133. Coin Change II\n// Difficulty: MEDIUM | Topic: Unbounded Knapsack Combinations\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_134",
    "number": 134,
    "title": "Longest Increasing Subsequence",
    "slug": "longest-increasing-subsequence",
    "topic_id": "topic_dynamic_programming",
    "subtopic": "Binary Search Patience Sorting",
    "difficulty": "HARD",
    "roadmap_stage": "Advanced Mastery",
    "companies": [
      "Amazon",
      "Google",
      "Meta",
      "Microsoft"
    ],
    "tags": [
      "dynamic programming"
    ],
    "description": "Given an integer array nums, return the length of the longest strictly increasing subsequence.\n\nCan you solve it in O(n log(n)) time complexity?",
    "input_format": "A single line of space-separated integers representing nums.",
    "output_format": "Single integer length of LIS.",
    "constraints": [
      "1 <= nums.length <= 2500",
      "-10^4 <= nums[i] <= 10^4"
    ],
    "examples": [
      {
        "input": "10 9 2 5 3 7 101 18",
        "output": "4",
        "explanation": "The longest increasing subsequence is [2, 3, 7, 101], therefore the length is 4."
      },
      {
        "input": "0 1 0 3 2 3",
        "output": "4"
      },
      {
        "input": "7 7 7 7 7 7 7",
        "output": "1"
      }
    ],
    "public_test_cases": [
      {
        "input": "10 9 2 5 3 7 101 18",
        "output": "4"
      },
      {
        "input": "0 1 0 3 2 3",
        "output": "4"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "7 7 7 7 7 7 7",
        "output": "1"
      },
      {
        "input": "1 3 6 7 9 4 10 5 6",
        "output": "6"
      }
    ],
    "hints": [
      "Patience sorting algorithm using binary search (bisect_left).",
      "Maintain an array `tails` where tails[i] stores the smallest tail of all increasing subsequences of length i + 1.",
      "For each num, use binary search to find its insertion spot in `tails`."
    ],
    "optimal_complexity": {
      "time": "O(N log N)",
      "space": "O(N)"
    },
    "solution_explanation": "Patience Sorting with binary search: maintain monotonic smallest tails of increasing subsequences. Runs in O(N log N) time.",
    "starter_code": {
      "python": "# 134. Longest Increasing Subsequence\n# Difficulty: HARD | Topic: Binary Search Patience Sorting\n# Time Complexity Target: O(N log N) | Space Complexity Target: O(N)\n\nimport sys\nimport json\n\ndef lengthOfLIS(nums: list[int]) -> int:\n    \"\"\"\n    Given an integer array nums, return the length of the longest strictly increasing subsequence.\n    \"\"\"\n    # TODO: Implement your solution here\n    import bisect\n    tails = []\n    for x in nums:\n        idx = bisect.bisect_left(tails, x)\n        if idx == len(tails): tails.append(x)\n        else: tails[idx] = x\n    return len(tails)\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(lengthOfLIS(...))\n",
      "javascript": "/**\n * 134. Longest Increasing Subsequence\n * Difficulty: HARD | Topic: Binary Search Patience Sorting\n * Optimal: O(N log N) time, O(N) space\n */\n\nconst fs = require('fs');\n\nfunction lengthOfLIS(nums: list[int]) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 134. Longest Increasing Subsequence\n// Difficulty: HARD | Topic: Binary Search Patience Sorting\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 134. Longest Increasing Subsequence\n// Difficulty: HARD | Topic: Binary Search Patience Sorting\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_135",
    "number": 135,
    "title": "Longest Common Subsequence",
    "slug": "longest-common-subsequence",
    "topic_id": "topic_dynamic_programming",
    "subtopic": "2D Grid String Alignment",
    "difficulty": "MEDIUM",
    "roadmap_stage": "Core Patterns",
    "companies": [
      "Amazon",
      "Google",
      "Microsoft"
    ],
    "tags": [
      "dynamic programming"
    ],
    "description": "Given two strings text1 and text2, return the length of their longest common subsequence. If there is no common subsequence, return 0.\n\nA subsequence of a string is a new string generated from the original string with some characters (can be none) deleted without changing the relative order of the remaining characters.",
    "input_format": "Line 1: string text1\nLine 2: string text2",
    "output_format": "Single integer length of LCS.",
    "constraints": [
      "1 <= text1.length, text2.length <= 1000",
      "text1 and text2 consist of only lowercase English characters."
    ],
    "examples": [
      {
        "input": "abcde\nace",
        "output": "3",
        "explanation": "The longest common subsequence is \"ace\" and its length is 3."
      },
      {
        "input": "abc\nabc",
        "output": "3"
      },
      {
        "input": "abc\ndef",
        "output": "0"
      }
    ],
    "public_test_cases": [
      {
        "input": "abcde\nace",
        "output": "3"
      },
      {
        "input": "abc\nabc",
        "output": "3"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "abc\ndef",
        "output": "0"
      },
      {
        "input": "bsbininm\njmjkbkjkv",
        "output": "1"
      }
    ],
    "hints": [
      "Let dp[i][j] be LCS of text1[i:] and text2[j:].",
      "If text1[i] == text2[j]: dp[i][j] = 1 + dp[i+1][j+1].",
      "Otherwise: dp[i][j] = max(dp[i+1][j], dp[i][j+1])."
    ],
    "optimal_complexity": {
      "time": "O(M * N)",
      "space": "O(min(M, N))"
    },
    "solution_explanation": "2D DP table comparing characters: matching letters contribute 1 + diagonal; non-matching take the max of top and left.",
    "starter_code": {
      "python": "# 135. Longest Common Subsequence\n# Difficulty: MEDIUM | Topic: 2D Grid String Alignment\n# Time Complexity Target: O(M * N) | Space Complexity Target: O(min(M, N))\n\nimport sys\nimport json\n\ndef longestCommonSubsequence(text1: str, text2: str) -> int:\n    \"\"\"\n    Given two strings text1 and text2, return the length of their longest common subsequence.\n    \"\"\"\n    # TODO: Implement your solution here\n    m, n = len(text1), len(text2)\n    dp = [0] * (n + 1)\n    for i in range(m - 1, -1, -1):\n        cur = [0] * (n + 1)\n        for j in range(n - 1, -1, -1):\n            if text1[i] == text2[j]: cur[j] = 1 + dp[j + 1]\n            else: cur[j] = max(dp[j], cur[j + 1])\n        dp = cur\n    return dp[0]\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(longestCommonSubsequence(...))\n",
      "javascript": "/**\n * 135. Longest Common Subsequence\n * Difficulty: MEDIUM | Topic: 2D Grid String Alignment\n * Optimal: O(M * N) time, O(min(M, N)) space\n */\n\nconst fs = require('fs');\n\nfunction longestCommonSubsequence(text1: str, text2: str) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 135. Longest Common Subsequence\n// Difficulty: MEDIUM | Topic: 2D Grid String Alignment\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 135. Longest Common Subsequence\n// Difficulty: MEDIUM | Topic: 2D Grid String Alignment\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_136",
    "number": 136,
    "title": "Word Break",
    "slug": "word-break",
    "topic_id": "topic_dynamic_programming",
    "subtopic": "Prefix Word Dictionary Matching",
    "difficulty": "HARD",
    "roadmap_stage": "Advanced Mastery",
    "companies": [
      "Amazon",
      "Meta",
      "Google",
      "Bloomberg"
    ],
    "tags": [
      "dynamic programming"
    ],
    "description": "Given a string s and a dictionary of strings wordDict, return true if s can be segmented into a space-separated sequence of one or more dictionary words.\n\nNote that the same word in the dictionary may be reused multiple times in the segmentation.",
    "input_format": "Line 1: string s\nLine 2: space-separated dictionary words",
    "output_format": "true or false",
    "constraints": [
      "1 <= s.length <= 300",
      "1 <= wordDict.length <= 1000",
      "1 <= wordDict[i].length <= 20",
      "s and wordDict[i] consist of only lowercase English letters.",
      "All the strings of wordDict are unique."
    ],
    "examples": [
      {
        "input": "leetcode\nleet code",
        "output": "true",
        "explanation": "Return true because \"leetcode\" can be segmented as \"leet code\"."
      },
      {
        "input": "applepenapple\napple pen",
        "output": "true"
      },
      {
        "input": "catsandog\ncats dog sand and cat",
        "output": "false"
      }
    ],
    "public_test_cases": [
      {
        "input": "leetcode\nleet code",
        "output": "true"
      },
      {
        "input": "applepenapple\napple pen",
        "output": "true"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "catsandog\ncats dog sand and cat",
        "output": "false"
      },
      {
        "input": "a\nb",
        "output": "false"
      }
    ],
    "hints": [
      "Let dp[i] = true if s[:i] can be segmented using dictionary words.",
      "Base case: dp[0] = true.",
      "For each i from 1 to len(s), check every word w in wordDict: if i >= len(w) and dp[i - len(w)] and s[i - len(w):i] == w, then dp[i] = true."
    ],
    "optimal_complexity": {
      "time": "O(N * W)",
      "space": "O(N)"
    },
    "solution_explanation": "Bottom-up DP: dp[i] tracks whether prefix s[:i] is formable by testing each dictionary word suffix.",
    "starter_code": {
      "python": "# 136. Word Break\n# Difficulty: HARD | Topic: Prefix Word Dictionary Matching\n# Time Complexity Target: O(N * W) | Space Complexity Target: O(N)\n\nimport sys\nimport json\n\ndef wordBreak(s: str, wordDict: list[str]) -> bool:\n    \"\"\"\n    Given a string s and a dictionary of strings wordDict, return true if s can be segmented into a space-separated sequence of one or more dictionary words.\n    \"\"\"\n    # TODO: Implement your solution here\n    dp = [False] * (len(s) + 1)\n    dp[0] = True\n    for i in range(1, len(s) + 1):\n        for w in wordDict:\n            if i >= len(w) and dp[i - len(w)] and s[i - len(w):i] == w:\n                dp[i] = True\n                break\n    return dp[-1]\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(wordBreak(...))\n",
      "javascript": "/**\n * 136. Word Break\n * Difficulty: HARD | Topic: Prefix Word Dictionary Matching\n * Optimal: O(N * W) time, O(N) space\n */\n\nconst fs = require('fs');\n\nfunction wordBreak(s: str, wordDict: list[str]) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 136. Word Break\n// Difficulty: HARD | Topic: Prefix Word Dictionary Matching\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 136. Word Break\n// Difficulty: HARD | Topic: Prefix Word Dictionary Matching\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_137",
    "number": 137,
    "title": "Unique Paths",
    "slug": "unique-paths",
    "topic_id": "topic_dynamic_programming",
    "subtopic": "Grid Path Combinatorics",
    "difficulty": "MEDIUM",
    "roadmap_stage": "Core Patterns",
    "companies": [
      "Amazon",
      "Google",
      "Microsoft"
    ],
    "tags": [
      "dynamic programming"
    ],
    "description": "There is a robot on an m x n grid. The robot is initially located at the top-left corner (i.e., grid[0][0]). The robot tries to move to the bottom-right corner (i.e., grid[m - 1][n - 1]). The robot can only move either down or right at any point in time.\n\nGiven the two integers m and n, return the number of possible unique paths that the robot can take to reach the bottom-right corner.",
    "input_format": "Single line containing m n separated by space.",
    "output_format": "Single integer count of unique paths.",
    "constraints": [
      "1 <= m, n <= 100"
    ],
    "examples": [
      {
        "input": "3 7",
        "output": "28"
      },
      {
        "input": "3 2",
        "output": "3"
      }
    ],
    "public_test_cases": [
      {
        "input": "3 7",
        "output": "28"
      },
      {
        "input": "3 2",
        "output": "3"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "1 1",
        "output": "1"
      },
      {
        "input": "3 3",
        "output": "6"
      }
    ],
    "hints": [
      "dp[r][c] = dp[r+1][c] + dp[r][c+1].",
      "Can be solved in O(N) space using a single rolling 1D row array.",
      "Alternatively, combinatorial formula: C(m + n - 2, m - 1)."
    ],
    "optimal_complexity": {
      "time": "O(M * N)",
      "space": "O(N)"
    },
    "solution_explanation": "Paths to (r, c) equals sum of paths from right cell and down cell. Space optimized to a single rolling 1D array.",
    "starter_code": {
      "python": "# 137. Unique Paths\n# Difficulty: MEDIUM | Topic: Grid Path Combinatorics\n# Time Complexity Target: O(M * N) | Space Complexity Target: O(N)\n\nimport sys\nimport json\n\ndef uniquePaths(m: int, n: int) -> int:\n    \"\"\"\n    There is a robot on an m x n grid.\n    \"\"\"\n    # TODO: Implement your solution here\n    row = [1] * n\n    for _ in range(m - 1):\n        new_row = [1] * n\n        for j in range(n - 2, -1, -1):\n            new_row[j] = new_row[j + 1] + row[j]\n        row = new_row\n    return row[0]\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(uniquePaths(...))\n",
      "javascript": "/**\n * 137. Unique Paths\n * Difficulty: MEDIUM | Topic: Grid Path Combinatorics\n * Optimal: O(M * N) time, O(N) space\n */\n\nconst fs = require('fs');\n\nfunction uniquePaths(m: int, n: int) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 137. Unique Paths\n// Difficulty: MEDIUM | Topic: Grid Path Combinatorics\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 137. Unique Paths\n// Difficulty: MEDIUM | Topic: Grid Path Combinatorics\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_138",
    "number": 138,
    "title": "Minimum Path Sum",
    "slug": "minimum-path-sum",
    "topic_id": "topic_dynamic_programming",
    "subtopic": "2D Grid Minimum Cost Traversal",
    "difficulty": "MEDIUM",
    "roadmap_stage": "Core Patterns",
    "companies": [
      "Amazon",
      "Google",
      "Meta"
    ],
    "tags": [
      "dynamic programming"
    ],
    "description": "Given a m x n grid filled with non-negative numbers, find a path from top left to bottom right, which minimizes the sum of all numbers along its path.\n\nNote: You can only move either down or right at any point in time.",
    "input_format": "Line 1: m n\nNext m lines: n space-separated non-negative integers",
    "output_format": "Single integer minimum path sum.",
    "constraints": [
      "m == grid.length",
      "n == grid[i].length",
      "1 <= m, n <= 200",
      "0 <= grid[i][j] <= 200"
    ],
    "examples": [
      {
        "input": "3 3\n1 3 1\n1 5 1\n4 2 1",
        "output": "7",
        "explanation": "Path 1 -> 3 -> 1 -> 1 -> 1 minimizes the sum to 7."
      },
      {
        "input": "2 3\n1 2 3\n4 5 6",
        "output": "12"
      }
    ],
    "public_test_cases": [
      {
        "input": "3 3\n1 3 1\n1 5 1\n4 2 1",
        "output": "7"
      },
      {
        "input": "2 3\n1 2 3\n4 5 6",
        "output": "12"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "1 1\n5",
        "output": "5"
      }
    ],
    "hints": [
      "At cell (r, c), minimum path sum is grid[r][c] + min(path(r+1, c), path(r, c+1)).",
      "Fill boundary rows and columns first.",
      "Can be done directly in place on the input grid."
    ],
    "optimal_complexity": {
      "time": "O(M * N)",
      "space": "O(1)"
    },
    "solution_explanation": "In-place 2D dynamic programming: each cell adds the minimum of its incoming top or left path sums.",
    "starter_code": {
      "python": "# 138. Minimum Path Sum\n# Difficulty: MEDIUM | Topic: 2D Grid Minimum Cost Traversal\n# Time Complexity Target: O(M * N) | Space Complexity Target: O(1)\n\nimport sys\nimport json\n\ndef minPathSum(grid: list[list[int]]) -> int:\n    \"\"\"\n    Given a m x n grid filled with non-negative numbers, find a path from top left to bottom right, which minimizes the sum of all numbers along its path.\n    \"\"\"\n    # TODO: Implement your solution here\n    R, C = len(grid), len(grid[0])\n    for r in range(R):\n        for c in range(C):\n            if r == 0 and c == 0: continue\n            elif r == 0: grid[r][c] += grid[r][c - 1]\n            elif c == 0: grid[r][c] += grid[r - 1][c]\n            else: grid[r][c] += min(grid[r - 1][c], grid[r][c - 1])\n    return grid[R - 1][C - 1]\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(minPathSum(...))\n",
      "javascript": "/**\n * 138. Minimum Path Sum\n * Difficulty: MEDIUM | Topic: 2D Grid Minimum Cost Traversal\n * Optimal: O(M * N) time, O(1) space\n */\n\nconst fs = require('fs');\n\nfunction minPathSum(grid: list[list[int]]) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 138. Minimum Path Sum\n// Difficulty: MEDIUM | Topic: 2D Grid Minimum Cost Traversal\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 138. Minimum Path Sum\n// Difficulty: MEDIUM | Topic: 2D Grid Minimum Cost Traversal\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_139",
    "number": 139,
    "title": "Partition Equal Subset Sum",
    "slug": "partition-equal-subset-sum",
    "topic_id": "topic_dynamic_programming",
    "subtopic": "0/1 Knapsack Subset Target",
    "difficulty": "MEDIUM",
    "roadmap_stage": "Core Patterns",
    "companies": [
      "Amazon",
      "Meta",
      "Google"
    ],
    "tags": [
      "dynamic programming"
    ],
    "description": "Given an integer array nums, return true if you can partition the array into two subsets such that the sum of the elements in both subsets is equal or false otherwise.",
    "input_format": "A single line of space-separated integers representing nums.",
    "output_format": "true or false",
    "constraints": [
      "1 <= nums.length <= 200",
      "1 <= nums[i] <= 100"
    ],
    "examples": [
      {
        "input": "1 5 11 5",
        "output": "true",
        "explanation": "The array can be partitioned as [1, 5, 5] and [11]."
      },
      {
        "input": "1 2 3 5",
        "output": "false"
      }
    ],
    "public_test_cases": [
      {
        "input": "1 5 11 5",
        "output": "true"
      },
      {
        "input": "1 2 3 5",
        "output": "false"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "1 2 5",
        "output": "false"
      },
      {
        "input": "2 2",
        "output": "true"
      }
    ],
    "hints": [
      "Total sum must be even; if total sum is odd, return false immediately.",
      "Target sum for subset is total // 2.",
      "0/1 Knapsack: track reachable sums using a hash set or bitset."
    ],
    "optimal_complexity": {
      "time": "O(N * Target)",
      "space": "O(Target)"
    },
    "solution_explanation": "0/1 Knapsack formulation: test if a subset exists that sums to sum(nums) // 2 using dynamic set extension.",
    "starter_code": {
      "python": "# 139. Partition Equal Subset Sum\n# Difficulty: MEDIUM | Topic: 0/1 Knapsack Subset Target\n# Time Complexity Target: O(N * Target) | Space Complexity Target: O(Target)\n\nimport sys\nimport json\n\ndef canPartition(nums: list[int]) -> bool:\n    \"\"\"\n    Given an integer array nums, return true if you can partition the array into two subsets such that the sum of the elements in both subsets is equal or false otherwise.\n    \"\"\"\n    # TODO: Implement your solution here\n    total = sum(nums)\n    if total % 2 != 0: return False\n    target = total // 2\n    dp = {0}\n    for n in nums:\n        dp |= {s + n for s in dp if s + n <= target}\n        if target in dp: return True\n    return False\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(canPartition(...))\n",
      "javascript": "/**\n * 139. Partition Equal Subset Sum\n * Difficulty: MEDIUM | Topic: 0/1 Knapsack Subset Target\n * Optimal: O(N * Target) time, O(Target) space\n */\n\nconst fs = require('fs');\n\nfunction canPartition(nums: list[int]) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 139. Partition Equal Subset Sum\n// Difficulty: MEDIUM | Topic: 0/1 Knapsack Subset Target\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 139. Partition Equal Subset Sum\n// Difficulty: MEDIUM | Topic: 0/1 Knapsack Subset Target\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_140",
    "number": 140,
    "title": "Decode Ways",
    "slug": "decode-ways",
    "topic_id": "topic_dynamic_programming",
    "subtopic": "1D Lookback String Parsing",
    "difficulty": "MEDIUM",
    "roadmap_stage": "Core Patterns",
    "companies": [
      "Amazon",
      "Google",
      "Meta",
      "Microsoft"
    ],
    "tags": [
      "dynamic programming"
    ],
    "description": "A message containing letters from A-Z can be encoded into numbers using the following mapping:\n'A' -> \"1\", 'B' -> \"2\", ... 'Z' -> \"26\".\n\nGiven a string s containing only digits, return the number of ways to decode it.",
    "input_format": "A single line containing digit string s.",
    "output_format": "Single integer representing total decoding ways.",
    "constraints": [
      "1 <= s.length <= 100",
      "s contains only digits and may contain leading zero(s)."
    ],
    "examples": [
      {
        "input": "12",
        "output": "2",
        "explanation": "\"12\" could be decoded as \"AB\" (1 2) or \"L\" (12)."
      },
      {
        "input": "226",
        "output": "3",
        "explanation": "\"226\" could be decoded as \"BZ\" (2 26), \"VF\" (22 6), or \"BBF\" (2 2 6)."
      },
      {
        "input": "06",
        "output": "0",
        "explanation": "\"06\" cannot be mapped to \"F\" because \"6\" is different from \"06\"."
      }
    ],
    "public_test_cases": [
      {
        "input": "12",
        "output": "2"
      },
      {
        "input": "226",
        "output": "3"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "06",
        "output": "0"
      },
      {
        "input": "10",
        "output": "1"
      }
    ],
    "hints": [
      "Single digit decode is valid if s[i] != '0'.",
      "Two digit decode is valid if 10 <= int(s[i-1:i+1]) <= 26.",
      "dp[i] = (dp[i-1] if valid single) + (dp[i-2] if valid double)."
    ],
    "optimal_complexity": {
      "time": "O(N)",
      "space": "O(1)"
    },
    "solution_explanation": "1D DP with 2 lookback states: valid single character adds prev1, valid double character (10-26) adds prev2.",
    "starter_code": {
      "python": "# 140. Decode Ways\n# Difficulty: MEDIUM | Topic: 1D Lookback String Parsing\n# Time Complexity Target: O(N) | Space Complexity Target: O(1)\n\nimport sys\nimport json\n\ndef numDecodings(s: str) -> int:\n    \"\"\"\n    A message containing letters from A-Z can be encoded into numbers using the following mapping:\n'A' -> \"1\", 'B' -> \"2\", .\n    \"\"\"\n    # TODO: Implement your solution here\n    if not s or s[0] == '0': return 0\n    prev2, prev1 = 1, 1\n    for i in range(1, len(s)):\n        curr = 0\n        if s[i] != '0': curr += prev1\n        if 10 <= int(s[i-1:i+1]) <= 26: curr += prev2\n        prev2, prev1 = prev1, curr\n    return prev1\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(numDecodings(...))\n",
      "javascript": "/**\n * 140. Decode Ways\n * Difficulty: MEDIUM | Topic: 1D Lookback String Parsing\n * Optimal: O(N) time, O(1) space\n */\n\nconst fs = require('fs');\n\nfunction numDecodings(s: str) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 140. Decode Ways\n// Difficulty: MEDIUM | Topic: 1D Lookback String Parsing\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 140. Decode Ways\n// Difficulty: MEDIUM | Topic: 1D Lookback String Parsing\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_141",
    "number": 141,
    "title": "Maximum Product Subarray",
    "slug": "maximum-product-subarray",
    "topic_id": "topic_dynamic_programming",
    "subtopic": "Sign-Flip Min/Max Tracking",
    "difficulty": "MEDIUM",
    "roadmap_stage": "Core Patterns",
    "companies": [
      "Amazon",
      "Google",
      "LinkedIn",
      "Microsoft"
    ],
    "tags": [
      "dynamic programming"
    ],
    "description": "Given an integer array nums, find a subarray that has the largest product, and return the product.\n\nThe test cases are generated so that the answer will fit in a 32-bit integer.",
    "input_format": "A single line of space-separated integers representing nums.",
    "output_format": "Single integer maximum product.",
    "constraints": [
      "1 <= nums.length <= 2 * 10^4",
      "-10 <= nums[i] <= 10"
    ],
    "examples": [
      {
        "input": "2 3 -2 4",
        "output": "6",
        "explanation": "[2,3] has the largest product 6."
      },
      {
        "input": "-2 0 -1",
        "output": "0"
      }
    ],
    "public_test_cases": [
      {
        "input": "2 3 -2 4",
        "output": "6"
      },
      {
        "input": "-2 0 -1",
        "output": "0"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "-2 3 -4",
        "output": "24"
      },
      {
        "input": "-2",
        "output": "-2"
      }
    ],
    "hints": [
      "Multiplying by a negative number can turn a large minimum into a large maximum.",
      "Maintain both `cur_max` and `cur_min` as you iterate.",
      "When encountering a negative number, swap cur_max and cur_min."
    ],
    "optimal_complexity": {
      "time": "O(N)",
      "space": "O(1)"
    },
    "solution_explanation": "Track both rolling minimum and maximum products. A negative number swaps extremes, turning negative minimums into positive maximums.",
    "starter_code": {
      "python": "# 141. Maximum Product Subarray\n# Difficulty: MEDIUM | Topic: Sign-Flip Min/Max Tracking\n# Time Complexity Target: O(N) | Space Complexity Target: O(1)\n\nimport sys\nimport json\n\ndef maxProduct(nums: list[int]) -> int:\n    \"\"\"\n    Given an integer array nums, find a subarray that has the largest product, and return the product.\n    \"\"\"\n    # TODO: Implement your solution here\n    res = max(nums)\n    cur_min, cur_max = 1, 1\n    for n in nums:\n        if n < 0: cur_min, cur_max = cur_max, cur_min\n        cur_max = max(n, cur_max * n)\n        cur_min = min(n, cur_min * n)\n        res = max(res, cur_max)\n    return res\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(maxProduct(...))\n",
      "javascript": "/**\n * 141. Maximum Product Subarray\n * Difficulty: MEDIUM | Topic: Sign-Flip Min/Max Tracking\n * Optimal: O(N) time, O(1) space\n */\n\nconst fs = require('fs');\n\nfunction maxProduct(nums: list[int]) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 141. Maximum Product Subarray\n// Difficulty: MEDIUM | Topic: Sign-Flip Min/Max Tracking\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 141. Maximum Product Subarray\n// Difficulty: MEDIUM | Topic: Sign-Flip Min/Max Tracking\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_142",
    "number": 142,
    "title": "Edit Distance",
    "slug": "edit-distance",
    "topic_id": "topic_dynamic_programming",
    "subtopic": "Levenshtein Distance Matrix",
    "difficulty": "HARD",
    "roadmap_stage": "Placement Revision",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft"
    ],
    "tags": [
      "dynamic programming"
    ],
    "description": "Given two strings word1 and word2, return the minimum number of operations required to convert word1 to word2.\n\nYou have the following three operations permitted on a word:\n- Insert a character\n- Delete a character\n- Replace a character",
    "input_format": "Line 1: string word1\nLine 2: string word2",
    "output_format": "Single integer minimum edit operations.",
    "constraints": [
      "0 <= word1.length, word2.length <= 500",
      "word1 and word2 consist of lowercase English letters."
    ],
    "examples": [
      {
        "input": "horse\nros",
        "output": "3",
        "explanation": "horse -> rorse -> rose -> ros (3 ops)."
      },
      {
        "input": "intention\nexecution",
        "output": "5"
      }
    ],
    "public_test_cases": [
      {
        "input": "horse\nros",
        "output": "3"
      },
      {
        "input": "intention\nexecution",
        "output": "5"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "\na",
        "output": "1"
      },
      {
        "input": "abc\nabc",
        "output": "0"
      }
    ],
    "hints": [
      "Let dp[i][j] be minimum operations to convert word1[i:] to word2[j:].",
      "If characters match: dp[i][j] = dp[i+1][j+1].",
      "Otherwise: 1 + min(dp[i+1][j] (delete), dp[i][j+1] (insert), dp[i+1][j+1] (replace))."
    ],
    "optimal_complexity": {
      "time": "O(M * N)",
      "space": "O(min(M, N))"
    },
    "solution_explanation": "Levenshtein 2D table evaluates minimum operations between insertion, deletion, and replacement in O(M*N) time.",
    "starter_code": {
      "python": "# 142. Edit Distance\n# Difficulty: HARD | Topic: Levenshtein Distance Matrix\n# Time Complexity Target: O(M * N) | Space Complexity Target: O(min(M, N))\n\nimport sys\nimport json\n\ndef minDistance(word1: str, word2: str) -> int:\n    \"\"\"\n    Given two strings word1 and word2, return the minimum number of operations required to convert word1 to word2.\n    \"\"\"\n    # TODO: Implement your solution here\n    m, n = len(word1), len(word2)\n    dp = list(range(n + 1))\n    for i in range(1, m + 1):\n        new_dp = [i] + [0] * n\n        for j in range(1, n + 1):\n            if word1[i - 1] == word2[j - 1]:\n                new_dp[j] = dp[j - 1]\n            else:\n                new_dp[j] = 1 + min(dp[j], new_dp[j - 1], dp[j - 1])\n        dp = new_dp\n    return dp[n]\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(minDistance(...))\n",
      "javascript": "/**\n * 142. Edit Distance\n * Difficulty: HARD | Topic: Levenshtein Distance Matrix\n * Optimal: O(M * N) time, O(min(M, N)) space\n */\n\nconst fs = require('fs');\n\nfunction minDistance(word1: str, word2: str) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 142. Edit Distance\n// Difficulty: HARD | Topic: Levenshtein Distance Matrix\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 142. Edit Distance\n// Difficulty: HARD | Topic: Levenshtein Distance Matrix\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_143",
    "number": 143,
    "title": "Implement Trie (Prefix Tree)",
    "slug": "implement-trie-prefix-tree",
    "topic_id": "topic_tries_advanced",
    "subtopic": "Prefix Tree Character Trie",
    "difficulty": "MEDIUM",
    "roadmap_stage": "Core Patterns",
    "companies": [
      "Amazon",
      "Google",
      "Meta",
      "Microsoft"
    ],
    "tags": [
      "tries advanced"
    ],
    "description": "A trie (pronounced as \"try\") or prefix tree is a tree data structure used to efficiently store and retrieve keys in a dataset of strings.\n\nImplement the Trie class:\n- Trie() Initializes the trie object.\n- void insert(String word) Inserts the string word into the trie.\n- boolean search(String word) Returns true if the string word is in the trie, and false otherwise.\n- boolean startsWith(String prefix) Returns true if there is a previously inserted string word that has the prefix prefix, and false otherwise.",
    "input_format": "Operations: insert, search, startsWith",
    "output_format": "Search and startsWith results separated by space.",
    "constraints": [
      "1 <= word.length, prefix.length <= 2000",
      "word and prefix consist only of lowercase English letters."
    ],
    "examples": [
      {
        "input": "insert apple\nsearch apple\nsearch app\nstartsWith app\ninsert app\nsearch app",
        "output": "true false true true"
      }
    ],
    "public_test_cases": [
      {
        "input": "insert apple\nsearch apple\nsearch app\nstartsWith app\ninsert app\nsearch app",
        "output": "true false true true"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "insert cat\nsearch dog",
        "output": "false"
      }
    ],
    "hints": [
      "Each TrieNode has a dictionary of children and a boolean flag `is_end_of_word`.",
      "insert: walk down existing character nodes, create missing ones, mark final node as end of word.",
      "search checks is_end_of_word; startsWith checks only prefix path existence."
    ],
    "optimal_complexity": {
      "time": "O(L) per operation",
      "space": "O(Total Characters)"
    },
    "solution_explanation": "Prefix tree storing words by character transitions. Lookups, insertions, and prefix tests operate strictly in O(L) time where L is word length.",
    "starter_code": {
      "python": "# 143. Implement Trie (Prefix Tree)\n# Difficulty: MEDIUM | Topic: Prefix Tree Character Trie\n# Time Complexity Target: O(L) per operation | Space Complexity Target: O(Total Characters)\n\nimport sys\nimport json\n\ndef Trie() -> :\n    \"\"\"\n    A trie (pronounced as \"try\") or prefix tree is a tree data structure used to efficiently store and retrieve keys in a dataset of strings.\n    \"\"\"\n    # TODO: Implement your solution here\n    class TrieNode:\n    def __init__(self):\n        self.children = {}\n        self.is_word = False\nclass Trie:\n    def __init__(self):\n        self.root = TrieNode()\n    def insert(self, word: str) -> None:\n        curr = self.root\n        for c in word:\n            if c not in curr.children: curr.children[c] = TrieNode()\n            curr = curr.children[c]\n        curr.is_word = True\n    def search(self, word: str) -> bool:\n        curr = self.root\n        for c in word:\n            if c not in curr.children: return False\n            curr = curr.children[c]\n        return curr.is_word\n    def startsWith(self, prefix: str) -> bool:\n        curr = self.root\n        for c in prefix:\n            if c not in curr.children: return False\n            curr = curr.children[c]\n        return True\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(Trie(...))\n",
      "javascript": "/**\n * 143. Implement Trie (Prefix Tree)\n * Difficulty: MEDIUM | Topic: Prefix Tree Character Trie\n * Optimal: O(L) per operation time, O(Total Characters) space\n */\n\nconst fs = require('fs');\n\nfunction Trie() {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 143. Implement Trie (Prefix Tree)\n// Difficulty: MEDIUM | Topic: Prefix Tree Character Trie\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 143. Implement Trie (Prefix Tree)\n// Difficulty: MEDIUM | Topic: Prefix Tree Character Trie\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_144",
    "number": 144,
    "title": "Design Add and Search Words Data Structure",
    "slug": "design-add-and-search-words-data-structure",
    "topic_id": "topic_tries_advanced",
    "subtopic": "Wildcard Trie DFS",
    "difficulty": "HARD",
    "roadmap_stage": "Advanced Mastery",
    "companies": [
      "Meta",
      "Amazon",
      "Google"
    ],
    "tags": [
      "tries advanced"
    ],
    "description": "Design a data structure that supports adding new words and finding if a string matches any previously added string.\n\nImplement the WordDictionary class:\n- WordDictionary() Initializes the object.\n- void addWord(word) Adds word to the data structure, it can be matched later.\n- bool search(word) Returns true if there is any string in the data structure that matches word or false otherwise. word may contain dots '.' where dots can be matched with any letter.",
    "input_format": "Operations: addWord, search",
    "output_format": "Boolean results for search operations.",
    "constraints": [
      "1 <= word.length <= 25",
      "word in addWord consists of lowercase English letters.",
      "word in search consist of '.' or lowercase English letters."
    ],
    "examples": [
      {
        "input": "add bad\nadd dad\nadd mad\nsearch pad\nsearch bad\nsearch .ad\nsearch b..",
        "output": "false true true true"
      }
    ],
    "public_test_cases": [
      {
        "input": "add bad\nadd dad\nadd mad\nsearch pad\nsearch bad\nsearch .ad\nsearch b..",
        "output": "false true true true"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "add a\nsearch .",
        "output": "true"
      }
    ],
    "hints": [
      "Store words in a Trie.",
      "When searching, if the current character is a letter, follow the child node normally.",
      "If the current character is '.', iterate over all existing children at the current node recursively."
    ],
    "optimal_complexity": {
      "time": "O(M) add, O(26^M) wildcard search",
      "space": "O(Total Characters)"
    },
    "solution_explanation": "Trie with recursive DFS for wildcard dots. A '.' triggers exploration of all present character branches at current level.",
    "starter_code": {
      "python": "# 144. Design Add and Search Words Data Structure\n# Difficulty: HARD | Topic: Wildcard Trie DFS\n# Time Complexity Target: O(M) add, O(26^M) wildcard search | Space Complexity Target: O(Total Characters)\n\nimport sys\nimport json\n\ndef WordDictionary() -> :\n    \"\"\"\n    Design a data structure that supports adding new words and finding if a string matches any previously added string.\n    \"\"\"\n    # TODO: Implement your solution here\n    class WordDictionary:\n    def __init__(self):\n        self.root = {}\n    def addWord(self, word: str) -> None:\n        node = self.root\n        for c in word:\n            if c not in node: node[c] = {}\n            node = node[c]\n        node['#'] = True\n    def search(self, word: str) -> bool:\n        def dfs(i, node):\n            if i == len(word): return '#' in node\n            c = word[i]\n            if c == '.':\n                return any(dfs(i + 1, child) for k, child in node.items() if k != '#')\n            if c not in node: return False\n            return dfs(i + 1, node[c])\n        return dfs(0, self.root)\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(WordDictionary(...))\n",
      "javascript": "/**\n * 144. Design Add and Search Words Data Structure\n * Difficulty: HARD | Topic: Wildcard Trie DFS\n * Optimal: O(M) add, O(26^M) wildcard search time, O(Total Characters) space\n */\n\nconst fs = require('fs');\n\nfunction WordDictionary() {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 144. Design Add and Search Words Data Structure\n// Difficulty: HARD | Topic: Wildcard Trie DFS\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 144. Design Add and Search Words Data Structure\n// Difficulty: HARD | Topic: Wildcard Trie DFS\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_145",
    "number": 145,
    "title": "Implement Disjoint Set Union or Union-Find",
    "slug": "implement-disjoint-set-union-or-union-find",
    "topic_id": "topic_tries_advanced",
    "subtopic": "Disjoint Set Union (Rank & Path Compression)",
    "difficulty": "MEDIUM",
    "roadmap_stage": "Core Patterns",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft"
    ],
    "tags": [
      "tries advanced"
    ],
    "description": "Implement the Disjoint Set Union (DSU / Union-Find) data structure supporting find and union operations with path compression and union by rank.\n\nGiven N elements (0 to N-1) and a series of operations ('union u v', 'connected u v'), return whether elements u and v belong to the same connected component.",
    "input_format": "Line 1: N Q (elements and queries)\nNext Q lines: union u v OR connected u v",
    "output_format": "Results of connected queries (true/false) separated by space.",
    "constraints": [
      "1 <= N <= 10^5",
      "1 <= Q <= 10^5"
    ],
    "examples": [
      {
        "input": "5 4\nunion 0 1\nunion 1 2\nconnected 0 2\nconnected 0 3",
        "output": "true false"
      }
    ],
    "public_test_cases": [
      {
        "input": "5 4\nunion 0 1\nunion 1 2\nconnected 0 2\nconnected 0 3",
        "output": "true false"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "2 1\nconnected 0 1",
        "output": "false"
      }
    ],
    "hints": [
      "Parent array: parent[i] = i initially.",
      "Path compression in find: parent[x] = find(parent[x]).",
      "Union by rank: attach shorter tree under taller tree to keep tree height bounded by inverse Ackermann function."
    ],
    "optimal_complexity": {
      "time": "O(alpha(N)) ~ O(1) amortized",
      "space": "O(N)"
    },
    "solution_explanation": "Path compression flattens tree on lookup; union by rank attaches smaller trees under larger ones. Near-constant amortized O(alpha(N)) performance.",
    "starter_code": {
      "python": "# 145. Implement Disjoint Set Union or Union-Find\n# Difficulty: MEDIUM | Topic: Disjoint Set Union (Rank & Path Compression)\n# Time Complexity Target: O(alpha(N)) ~ O(1) amortized | Space Complexity Target: O(N)\n\nimport sys\nimport json\n\ndef UnionFind() -> :\n    \"\"\"\n    Implement the Disjoint Set Union (DSU / Union-Find) data structure supporting find and union operations with path compression and union by rank.\n    \"\"\"\n    # TODO: Implement your solution here\n    class UnionFind:\n    def __init__(self, n):\n        self.parent = list(range(n))\n        self.rank = [1] * n\n    def find(self, i):\n        if self.parent[i] == i: return i\n        self.parent[i] = self.find(self.parent[i])\n        return self.parent[i]\n    def union(self, i, j):\n        root_i, root_j = self.find(i), self.find(j)\n        if root_i != root_j:\n            if self.rank[root_i] > self.rank[root_j]: self.parent[root_j] = root_i\n            elif self.rank[root_i] < self.rank[root_j]: self.parent[root_i] = root_j\n            else: self.parent[root_j] = root_i; self.rank[root_i] += 1\n    def connected(self, i, j):\n        return self.find(i) == self.find(j)\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(UnionFind(...))\n",
      "javascript": "/**\n * 145. Implement Disjoint Set Union or Union-Find\n * Difficulty: MEDIUM | Topic: Disjoint Set Union (Rank & Path Compression)\n * Optimal: O(alpha(N)) ~ O(1) amortized time, O(N) space\n */\n\nconst fs = require('fs');\n\nfunction UnionFind() {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 145. Implement Disjoint Set Union or Union-Find\n// Difficulty: MEDIUM | Topic: Disjoint Set Union (Rank & Path Compression)\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 145. Implement Disjoint Set Union or Union-Find\n// Difficulty: MEDIUM | Topic: Disjoint Set Union (Rank & Path Compression)\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_146",
    "number": 146,
    "title": "Word Search II",
    "slug": "word-search-ii",
    "topic_id": "topic_tries_advanced",
    "subtopic": "Trie-Accelerated Grid DFS",
    "difficulty": "HARD",
    "roadmap_stage": "Placement Revision",
    "companies": [
      "Amazon",
      "Apple",
      "Google",
      "Meta",
      "Microsoft"
    ],
    "tags": [
      "tries advanced"
    ],
    "description": "Given an m x n board of characters and a list of strings words, return all words on the board.\n\nEach word must be constructed from letters of sequentially adjacent cells, where adjacent cells are horizontally or vertically neighboring. The same letter cell may not be used more than once in a word.",
    "input_format": "Line 1: m n\nNext m lines: n space-separated characters\nLast line: space-separated dictionary words",
    "output_format": "Found words sorted alphabetically.",
    "constraints": [
      "m == board.length",
      "n == board[i].length",
      "1 <= m, n <= 12",
      "1 <= words.length <= 3 * 10^4",
      "1 <= words[i].length <= 10"
    ],
    "examples": [
      {
        "input": "4 4\no a a n\ne t a e\ni h k r\ni f l v\noath pea eat rain",
        "output": "eat oath"
      },
      {
        "input": "2 2\na b\nc d\nabcb",
        "output": ""
      }
    ],
    "public_test_cases": [
      {
        "input": "4 4\no a a n\ne t a e\ni h k r\ni f l v\noath pea eat rain",
        "output": "eat oath"
      },
      {
        "input": "2 2\na b\nc d\nabcb",
        "output": ""
      }
    ],
    "hidden_test_cases": [
      {
        "input": "1 1\na\na",
        "output": "a"
      }
    ],
    "hints": [
      "Searching each word individually from all cells is too slow.",
      "Insert all dictionary words into a Trie.",
      "DFS through the grid: traverse the Trie simultaneously, pruning branches that do not exist in the Trie."
    ],
    "optimal_complexity": {
      "time": "O(M * N * 4^L)",
      "space": "O(Total Characters in Words)"
    },
    "solution_explanation": "Prefix Trie indexes all target words. Grid DFS simultaneously walks down the Trie, immediately pruning invalid path prefixes.",
    "starter_code": {
      "python": "# 146. Word Search II\n# Difficulty: HARD | Topic: Trie-Accelerated Grid DFS\n# Time Complexity Target: O(M * N * 4^L) | Space Complexity Target: O(Total Characters in Words)\n\nimport sys\nimport json\n\ndef findWords(board: list[list[str]], words: list[str]) -> list[str]:\n    \"\"\"\n    Given an m x n board of characters and a list of strings words, return all words on the board.\n    \"\"\"\n    # TODO: Implement your solution here\n    trie = {}\n    for w in words:\n        node = trie\n        for c in w:\n            if c not in node: node[c] = {}\n            node = node[c]\n        node['$'] = w\n    R, C = len(board), len(board[0])\n    res = []\n    def dfs(r, c, parent):\n        char = board[r][c]\n        curr = parent[char]\n        if '$' in curr:\n            res.append(curr.pop('$'))\n        board[r][c] = '#'\n        for dr, dc in [(1,0),(-1,0),(0,1),(0,-1)]:\n            nr, nc = r + dr, c + dc\n            if 0 <= nr < R and 0 <= nc < C and board[nr][nc] in curr:\n                dfs(nr, nc, curr)\n        board[r][c] = char\n        if not curr: parent.pop(char)\n    for r in range(R):\n        for c in range(C):\n            if board[r][c] in trie: dfs(r, c, trie)\n    return sorted(res)\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(findWords(...))\n",
      "javascript": "/**\n * 146. Word Search II\n * Difficulty: HARD | Topic: Trie-Accelerated Grid DFS\n * Optimal: O(M * N * 4^L) time, O(Total Characters in Words) space\n */\n\nconst fs = require('fs');\n\nfunction findWords(board: list[list[str]], words: list[str]) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 146. Word Search II\n// Difficulty: HARD | Topic: Trie-Accelerated Grid DFS\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 146. Word Search II\n// Difficulty: HARD | Topic: Trie-Accelerated Grid DFS\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_147",
    "number": 147,
    "title": "Single Number",
    "slug": "single-number",
    "topic_id": "topic_bit_manipulation",
    "subtopic": "XOR Cancellation Invariant",
    "difficulty": "EASY",
    "roadmap_stage": "Beginner Foundations",
    "companies": [
      "Amazon",
      "Apple",
      "Google",
      "Meta"
    ],
    "tags": [
      "bit manipulation"
    ],
    "description": "Given a non-empty array of integers nums, every element appears twice except for one. Find that single one.\n\nYou must implement a solution with a linear runtime complexity and use only constant extra space.",
    "input_format": "A single line of space-separated integers.",
    "output_format": "The unique integer.",
    "constraints": [
      "1 <= nums.length <= 3 * 10^4",
      "-3 * 10^4 <= nums[i] <= 3 * 10^4",
      "Each element in the array appears twice except for one element which appears only once."
    ],
    "examples": [
      {
        "input": "2 2 1",
        "output": "1"
      },
      {
        "input": "4 1 2 1 2",
        "output": "4"
      },
      {
        "input": "1",
        "output": "1"
      }
    ],
    "public_test_cases": [
      {
        "input": "2 2 1",
        "output": "1"
      },
      {
        "input": "4 1 2 1 2",
        "output": "4"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "1",
        "output": "1"
      },
      {
        "input": "-1 -1 -2",
        "output": "-2"
      }
    ],
    "hints": [
      "XOR properties: a ^ a = 0, and a ^ 0 = a.",
      "XOR is associative and commutative.",
      "XORing all elements together will cancel out all pairs, leaving only the unique element."
    ],
    "optimal_complexity": {
      "time": "O(N)",
      "space": "O(1)"
    },
    "solution_explanation": "XOR properties cancel duplicate pairs: a ^ a = 0 and a ^ 0 = a. The cumulative XOR across all elements isolates the single number.",
    "starter_code": {
      "python": "# 147. Single Number\n# Difficulty: EASY | Topic: XOR Cancellation Invariant\n# Time Complexity Target: O(N) | Space Complexity Target: O(1)\n\nimport sys\nimport json\n\ndef singleNumber(nums: list[int]) -> int:\n    \"\"\"\n    Given a non-empty array of integers nums, every element appears twice except for one.\n    \"\"\"\n    # TODO: Implement your solution here\n    ans = 0\n    for n in nums: ans ^= n\n    return ans\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(singleNumber(...))\n",
      "javascript": "/**\n * 147. Single Number\n * Difficulty: EASY | Topic: XOR Cancellation Invariant\n * Optimal: O(N) time, O(1) space\n */\n\nconst fs = require('fs');\n\nfunction singleNumber(nums: list[int]) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 147. Single Number\n// Difficulty: EASY | Topic: XOR Cancellation Invariant\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 147. Single Number\n// Difficulty: EASY | Topic: XOR Cancellation Invariant\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_148",
    "number": 148,
    "title": "Number of 1 Bits",
    "slug": "number-of-1-bits",
    "topic_id": "topic_bit_manipulation",
    "subtopic": "Brian Kernighan's Algorithm",
    "difficulty": "EASY",
    "roadmap_stage": "Beginner Foundations",
    "companies": [
      "Apple",
      "Microsoft"
    ],
    "tags": [
      "bit manipulation"
    ],
    "description": "Write a function that takes the binary representation of a positive integer and returns the number of set bits it has (also known as the Hamming weight).",
    "input_format": "A single integer n.",
    "output_format": "Single integer count of 1 bits.",
    "constraints": [
      "1 <= n <= 2^31 - 1"
    ],
    "examples": [
      {
        "input": "11",
        "output": "3",
        "explanation": "11 in binary is 1011, which has 3 set bits."
      },
      {
        "input": "128",
        "output": "1",
        "explanation": "128 in binary is 10000000 (1 set bit)."
      },
      {
        "input": "2147483645",
        "output": "30"
      }
    ],
    "public_test_cases": [
      {
        "input": "11",
        "output": "3"
      },
      {
        "input": "128",
        "output": "1"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "1",
        "output": "1"
      },
      {
        "input": "3",
        "output": "2"
      }
    ],
    "hints": [
      "Brian Kernighan's Algorithm: n & (n - 1) always clears the lowest set bit of n.",
      "Loop while n > 0: n = n & (n - 1) and increment count.",
      "Runs in O(Number of set bits), faster than checking all 32 bits."
    ],
    "optimal_complexity": {
      "time": "O(Set Bits)",
      "space": "O(1)"
    },
    "solution_explanation": "Brian Kernighan's bit trick n &= (n - 1) eliminates the least significant set bit in each iteration.",
    "starter_code": {
      "python": "# 148. Number of 1 Bits\n# Difficulty: EASY | Topic: Brian Kernighan's Algorithm\n# Time Complexity Target: O(Set Bits) | Space Complexity Target: O(1)\n\nimport sys\nimport json\n\ndef hammingWeight(n: int) -> int:\n    \"\"\"\n    Write a function that takes the binary representation of a positive integer and returns the number of set bits it has (also known as the Hamming weight).\n    \"\"\"\n    # TODO: Implement your solution here\n    count = 0\n    while n:\n        n &= (n - 1)\n        count += 1\n    return count\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(hammingWeight(...))\n",
      "javascript": "/**\n * 148. Number of 1 Bits\n * Difficulty: EASY | Topic: Brian Kernighan's Algorithm\n * Optimal: O(Set Bits) time, O(1) space\n */\n\nconst fs = require('fs');\n\nfunction hammingWeight(n: int) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 148. Number of 1 Bits\n// Difficulty: EASY | Topic: Brian Kernighan's Algorithm\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 148. Number of 1 Bits\n// Difficulty: EASY | Topic: Brian Kernighan's Algorithm\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_149",
    "number": 149,
    "title": "Counting Bits",
    "slug": "counting-bits",
    "topic_id": "topic_bit_manipulation",
    "subtopic": "DP Bit Transition",
    "difficulty": "EASY",
    "roadmap_stage": "Beginner Foundations",
    "companies": [
      "Amazon",
      "Apple",
      "Google"
    ],
    "tags": [
      "bit manipulation"
    ],
    "description": "Given an integer n, return an array ans of length n + 1 such that for each i (0 <= i <= n), ans[i] is the number of 1's in the binary representation of i.",
    "input_format": "A single integer n.",
    "output_format": "Space-separated integers representing bit counts from 0 to n.",
    "constraints": [
      "0 <= n <= 10^5"
    ],
    "examples": [
      {
        "input": "2",
        "output": "0 1 1",
        "explanation": "0: 0, 1: 1, 2: 1."
      },
      {
        "input": "5",
        "output": "0 1 1 2 1 2",
        "explanation": "0: 0, 1: 1, 2: 1, 3: 2, 4: 1, 5: 2."
      }
    ],
    "public_test_cases": [
      {
        "input": "2",
        "output": "0 1 1"
      },
      {
        "input": "5",
        "output": "0 1 1 2 1 2"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "0",
        "output": "0"
      },
      {
        "input": "1",
        "output": "0 1"
      }
    ],
    "hints": [
      "Notice that i >> 1 has fewer bits and has already been computed.",
      "The number of set bits in i equals bits in (i >> 1) plus (i & 1).",
      "ans[i] = ans[i >> 1] + (i & 1)."
    ],
    "optimal_complexity": {
      "time": "O(N)",
      "space": "O(N)"
    },
    "solution_explanation": "Bit transition recurrence: dp[i] = dp[i >> 1] + (i & 1). Operates in linear O(N) time in a single pass.",
    "starter_code": {
      "python": "# 149. Counting Bits\n# Difficulty: EASY | Topic: DP Bit Transition\n# Time Complexity Target: O(N) | Space Complexity Target: O(N)\n\nimport sys\nimport json\n\ndef countBits(n: int) -> list[int]:\n    \"\"\"\n    Given an integer n, return an array ans of length n + 1 such that for each i (0 <= i <= n), ans[i] is the number of 1's in the binary representation of i.\n    \"\"\"\n    # TODO: Implement your solution here\n    dp = [0] * (n + 1)\n    for i in range(1, n + 1):\n        dp[i] = dp[i >> 1] + (i & 1)\n    return dp\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(countBits(...))\n",
      "javascript": "/**\n * 149. Counting Bits\n * Difficulty: EASY | Topic: DP Bit Transition\n * Optimal: O(N) time, O(N) space\n */\n\nconst fs = require('fs');\n\nfunction countBits(n: int) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 149. Counting Bits\n// Difficulty: EASY | Topic: DP Bit Transition\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 149. Counting Bits\n// Difficulty: EASY | Topic: DP Bit Transition\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  },
  {
    "id": "dsa_top150_150",
    "number": 150,
    "title": "Reverse Bits",
    "slug": "reverse-bits",
    "topic_id": "topic_bit_manipulation",
    "subtopic": "32-Bit Reversal Shift",
    "difficulty": "EASY",
    "roadmap_stage": "Beginner Foundations",
    "companies": [
      "Apple",
      "Google",
      "Microsoft"
    ],
    "tags": [
      "bit manipulation"
    ],
    "description": "Reverse bits of a given 32 bits unsigned integer.",
    "input_format": "A single 32-bit unsigned integer.",
    "output_format": "Single unsigned integer with reversed binary bits.",
    "constraints": [
      "The input must be a binary string of length 32."
    ],
    "examples": [
      {
        "input": "43261596",
        "output": "964176192",
        "explanation": "Binary 00000010100101000001111010011100 reversed is 00111001011110000010100101000000 = 964176192."
      },
      {
        "input": "1",
        "output": "2147483648"
      }
    ],
    "public_test_cases": [
      {
        "input": "43261596",
        "output": "964176192"
      },
      {
        "input": "1",
        "output": "2147483648"
      }
    ],
    "hidden_test_cases": [
      {
        "input": "0",
        "output": "0"
      }
    ],
    "hints": [
      "Extract the lowest bit of n using n & 1.",
      "Shift result left by 1 and OR with the extracted bit.",
      "Shift n right by 1. Repeat for 32 iterations."
    ],
    "optimal_complexity": {
      "time": "O(1)",
      "space": "O(1)"
    },
    "solution_explanation": "Bitwise shift: repeatedly extract the lowest bit of n into the accumulator while shifting accumulator left. Exactly 32 operations.",
    "starter_code": {
      "python": "# 150. Reverse Bits\n# Difficulty: EASY | Topic: 32-Bit Reversal Shift\n# Time Complexity Target: O(1) | Space Complexity Target: O(1)\n\nimport sys\nimport json\n\ndef reverseBits(n: int) -> int:\n    \"\"\"\n    Reverse bits of a given 32 bits unsigned integer.\n    \"\"\"\n    # TODO: Implement your solution here\n    res = 0\n    for _ in range(32):\n        res = (res << 1) | (n & 1)\n        n >>= 1\n    return res\n\nif __name__ == '__main__':\n    # Standard I/O test harness\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        lines = [line.strip() for line in input_data.split('\\n') if line.strip()]\n        # Invoke solution\n        # print(reverseBits(...))\n",
      "javascript": "/**\n * 150. Reverse Bits\n * Difficulty: EASY | Topic: 32-Bit Reversal Shift\n * Optimal: O(1) time, O(1) space\n */\n\nconst fs = require('fs');\n\nfunction reverseBits(n: int) {\n    // TODO: Implement your solution here\n    return null;\n}\n\nif (require.main === module) {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    if (input) {\n        // Parse input and print result\n    }\n}\n",
      "java": "// 150. Reverse Bits\n// Difficulty: EASY | Topic: 32-Bit Reversal Shift\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input\n        // System.out.println(solution(...));\n    }\n}\n",
      "cpp": "// 150. Reverse Bits\n// Difficulty: EASY | Topic: 32-Bit Reversal Shift\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Write solution logic here\n    return 0;\n}\n"
    },
    "supported_languages": [
      "python",
      "javascript",
      "java",
      "cpp"
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-01T00:00:00Z"
  }
];
