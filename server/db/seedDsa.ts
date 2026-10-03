import { DSATopic, Algorithm, DSAProblem } from '../models/dsaTypes';
import { topInterview150Part1 } from './seedDsaTop150Part1';
import { topInterview150Part2 } from './seedDsaTop150Part2';
import { topInterview150Part3 } from './seedDsaTop150Part3';

export const seedDSATopics: DSATopic[] = [
  {
    id: 'dsa_topic_arrays',
    name: 'Arrays & Pointers',
    slug: 'arrays',
    category: 'DATA_STRUCTURE',
    description: 'Contiguous memory allocation, random access indexing, two-pointer techniques, and prefix sums.',
    difficulty: 'EASY',
    order_index: 1,
    prerequisites: ['Basic Programming', 'Memory Addressing'],
    icon: 'Layers',
    concepts: ['Contiguous Allocation', 'Cache Locality', 'O(1) Random Access', 'Two Pointers'],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
  },
  {
    id: 'dsa_topic_searching',
    name: 'Searching Algorithms',
    slug: 'searching',
    category: 'ALGORITHM',
    description: 'Techniques to locate target values in unorganized collections or monotonic search spaces.',
    difficulty: 'BEGINNER',
    order_index: 2,
    prerequisites: ['Arrays & Pointers'],
    icon: 'Search',
    concepts: ['Linear Scan', 'Binary Partitioning', 'Monotonic Invariants', 'Logarithmic Halving'],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
  },
  {
    id: 'dsa_topic_sorting',
    name: 'Sorting Algorithms',
    slug: 'sorting',
    category: 'ALGORITHM',
    description: 'Fundamental comparison-based ordering paradigms, in-place swaps, and divide-and-conquer partitions.',
    difficulty: 'EASY',
    order_index: 3,
    prerequisites: ['Arrays & Pointers'],
    icon: 'ArrowUpDown',
    concepts: ['Stability', 'In-Place Permutations', 'Inversion Count', 'Pivot Partitioning'],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
  },
  {
    id: 'dsa_topic_linked_lists',
    name: 'Linked Lists',
    slug: 'linked-lists',
    category: 'DATA_STRUCTURE',
    description: 'Node-based linear structures connected by pointers. Dynamic size, O(1) pointer updates, and pointer manipulation.',
    difficulty: 'MEDIUM',
    order_index: 4,
    prerequisites: ['Pointers', 'Memory Reference'],
    icon: 'GitCommit',
    concepts: ['Node Pointers', 'Head / Tail References', 'Cycle Detection', 'Reversal'],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
  },
  {
    id: 'dsa_topic_stacks_queues',
    name: 'Stacks & Queues',
    slug: 'stacks-queues',
    category: 'DATA_STRUCTURE',
    description: 'Restricted access abstract data types: LIFO call stack semantics and FIFO buffering queues.',
    difficulty: 'EASY',
    order_index: 5,
    prerequisites: ['Arrays', 'Linked Lists'],
    icon: 'Inbox',
    concepts: ['LIFO discipline', 'FIFO buffering', 'Monotonic Stack', 'Circular Buffer'],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
  },
  {
    id: 'dsa_topic_trees',
    name: 'Trees & Binary Search Trees',
    slug: 'trees',
    category: 'DATA_STRUCTURE',
    description: 'Hierarchical non-linear structures. Root, branching invariants, binary search trees, and tree traversals.',
    difficulty: 'MEDIUM',
    order_index: 6,
    prerequisites: ['Recursion', 'Linked Lists'],
    icon: 'GitFork',
    concepts: ['Root & Subtrees', 'BST Invariant', 'In-order Traversal', 'Tree Height O(log N)'],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
  },
  {
    id: 'dsa_topic_heaps',
    name: 'Heaps & Priority Queues',
    slug: 'heaps',
    category: 'DATA_STRUCTURE',
    description: 'Complete binary tree representation in an array supporting O(1) peek and O(log N) min/max extraction.',
    difficulty: 'MEDIUM',
    order_index: 7,
    prerequisites: ['Binary Trees', 'Array Indexing'],
    icon: 'BarChart2',
    concepts: ['Complete Binary Tree', 'Heap Invariant', 'Bubble-up / Sift-down', 'Priority Scheduling'],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
  },
  {
    id: 'dsa_topic_graphs',
    name: 'Graphs & Traversals',
    slug: 'graphs',
    category: 'DATA_STRUCTURE',
    description: 'Networks of vertices and edges. Adjacency lists/matrices, BFS shortest paths, DFS topological sorts, and Dijkstra.',
    difficulty: 'HARD',
    order_index: 8,
    prerequisites: ['Queue', 'Stack', 'Recursion'],
    icon: 'Network',
    concepts: ['Adjacency Lists', 'Breadth-First Exploration', 'Depth-First Backtracking', 'Shortest Path'],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
  },
  {
    id: 'dsa_topic_dp',
    name: 'Dynamic Programming',
    slug: 'dynamic-programming',
    category: 'TECHNIQUE',
    description: 'Solving complex problems by breaking them into overlapping subproblems with optimal substructure and memoization.',
    difficulty: 'HARD',
    order_index: 9,
    prerequisites: ['Recursion', 'Array Tables'],
    icon: 'Grid',
    concepts: ['Optimal Substructure', 'Overlapping Subproblems', 'Memoization Table', 'Bottom-up DP'],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
  },
  {
    id: 'dsa_topic_two_pointers',
    name: 'Two Pointers',
    slug: 'two-pointers',
    category: 'TECHNIQUE',
    description: 'Technique utilizing two pointers moving across one or more collections to reduce time complexity.',
    difficulty: 'EASY',
    order_index: 10,
    prerequisites: ['Arrays & Pointers'],
    icon: 'GitCompare',
    concepts: ['Opposite Ends', 'Fast & Slow Pointers', 'Sorted Array Traversal', 'In-Place Modification'],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
  },
  {
    id: 'dsa_topic_sliding_window',
    name: 'Sliding Window',
    slug: 'sliding-window',
    category: 'TECHNIQUE',
    description: 'Maintaining a running window (subarray or substring) over a collection with dynamic or fixed bounds.',
    difficulty: 'MEDIUM',
    order_index: 11,
    prerequisites: ['Two Pointers', 'Arrays & Pointers'],
    icon: 'Sliders',
    concepts: ['Fixed Window', 'Dynamic Window', 'Frequency Hashmap', 'Shrink & Expand Invariant'],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
  },
  {
    id: 'dsa_topic_matrix',
    name: 'Matrix / 2D Arrays',
    slug: 'matrix',
    category: 'DATA_STRUCTURE',
    description: 'Two-dimensional grid operations, row-column coordinate systems, spiral traversals, and state simulations.',
    difficulty: 'MEDIUM',
    order_index: 12,
    prerequisites: ['Arrays & Pointers'],
    icon: 'Grid',
    concepts: ['Coordinate Transforms', 'In-Place Transpose', 'Simulation', 'Boundary Tracking'],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
  },
  {
    id: 'dsa_topic_hashmap',
    name: 'Hashmap & Hash Sets',
    slug: 'hashmap',
    category: 'DATA_STRUCTURE',
    description: 'O(1) average lookup associative containers mapping keys to values using hash functions.',
    difficulty: 'EASY',
    order_index: 13,
    prerequisites: ['Arrays & Pointers'],
    icon: 'Hash',
    concepts: ['O(1) Average Access', 'Frequency Table', 'Bucket Collisions', 'Lookup Invariants'],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
  },
  {
    id: 'dsa_topic_intervals',
    name: 'Intervals',
    slug: 'intervals',
    category: 'TECHNIQUE',
    description: 'Techniques for managing contiguous ranges of time, points, or spans, including sorting and merging overlaps.',
    difficulty: 'MEDIUM',
    order_index: 14,
    prerequisites: ['Sorting Algorithms'],
    icon: 'Maximize2',
    concepts: ['Interval Sorting', 'Overlap Merging', 'Greedy Selection', 'Boundary Intersection'],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
  },
  {
    id: 'dsa_topic_tree_bfs',
    name: 'Binary Tree BFS',
    slug: 'tree-bfs',
    category: 'ALGORITHM',
    description: 'Level-order breadth-first traversal of tree structures using queue-based explorations.',
    difficulty: 'MEDIUM',
    order_index: 15,
    prerequisites: ['Trees & Binary Search Trees', 'Stacks & Queues'],
    icon: 'Workflow',
    concepts: ['Level Order Queue', 'Level-by-Level Slicing', 'Side Views', 'Zigzag Traversal'],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
  },
  {
    id: 'dsa_topic_bst',
    name: 'Binary Search Tree',
    slug: 'binary-search-tree',
    category: 'DATA_STRUCTURE',
    description: 'Binary trees maintaining the sorted order invariant: left < node < right for logarithmic lookups.',
    difficulty: 'MEDIUM',
    order_index: 16,
    prerequisites: ['Trees & Binary Search Trees'],
    icon: 'GitPullRequest',
    concepts: ['BST Property', 'Inorder Monotonic Sequence', 'Tree Validation', 'Kth Element'],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
  },
  {
    id: 'dsa_topic_graph_bfs',
    name: 'Graph BFS',
    slug: 'graph-bfs',
    category: 'ALGORITHM',
    description: 'Breadth-first exploration finding shortest unweighted distances, state transformations, and mutation ladders.',
    difficulty: 'MEDIUM',
    order_index: 17,
    prerequisites: ['Graphs & Traversals', 'Stacks & Queues'],
    icon: 'Share2',
    concepts: ['Unweighted Shortest Path', 'Level Traversal', 'State Transitions', 'Bidirectional BFS'],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
  },
  {
    id: 'dsa_topic_trie',
    name: 'Trie (Prefix Tree)',
    slug: 'trie',
    category: 'DATA_STRUCTURE',
    description: 'Tree data structure used for locating specific keys within a set, especially for string retrieval and prefixes.',
    difficulty: 'MEDIUM',
    order_index: 18,
    prerequisites: ['Trees & Binary Search Trees'],
    icon: 'FolderTree',
    concepts: ['Prefix Matching', '26-Way Node Children', 'Terminal Word Flags', 'Wildcard Search'],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
  },
  {
    id: 'dsa_topic_backtracking',
    name: 'Backtracking',
    slug: 'backtracking',
    category: 'TECHNIQUE',
    description: 'Systematic depth-first combinatorial search that prunes branches that fail to satisfy problem constraints.',
    difficulty: 'HARD',
    order_index: 19,
    prerequisites: ['Recursion', 'Graphs & Traversals'],
    icon: 'RefreshCw',
    concepts: ['Decision Trees', 'Branch Pruning', 'State Undo / Restoration', 'Subsets & Permutations'],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
  },
  {
    id: 'dsa_topic_divide_conquer',
    name: 'Divide & Conquer',
    slug: 'divide-conquer',
    category: 'TECHNIQUE',
    description: 'Algorithmic paradigm breaking down a problem into two or more independent subproblems of the same or related type.',
    difficulty: 'MEDIUM',
    order_index: 20,
    prerequisites: ['Recursion'],
    icon: 'Divide',
    concepts: ['Divide Step', 'Conquer Step', 'Combine Subsolutions', 'Master Theorem'],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
  },
  {
    id: 'dsa_topic_kadane',
    name: "Kadane's Algorithm",
    slug: 'kadanes-algorithm',
    category: 'ALGORITHM',
    description: 'Linear time algorithm to locate maximum contiguous subarray sum in 1D and circular integer arrays.',
    difficulty: 'MEDIUM',
    order_index: 21,
    prerequisites: ['Arrays & Pointers', 'Dynamic Programming'],
    icon: 'Activity',
    concepts: ['Contiguous Max Sum', 'Circular Array Max', 'Reset vs Accumulate', 'O(N) Single Pass'],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
  },
  {
    id: 'dsa_topic_bit_manipulation',
    name: 'Bit Manipulation',
    slug: 'bit-manipulation',
    category: 'TECHNIQUE',
    description: 'Operating at individual bit representations using bitwise AND, OR, XOR, NOT, and bit shifts.',
    difficulty: 'EASY',
    order_index: 22,
    prerequisites: ['Binary Representation'],
    icon: 'Binary',
    concepts: ['Bitwise XOR Cancellation', 'Bit Masks', 'Kernighan Bit Counting', 'Bit Shifting'],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
  },
  {
    id: 'dsa_topic_math',
    name: 'Math & Number Theory',
    slug: 'math',
    category: 'TECHNIQUE',
    description: 'Mathematical problem solving including prime factors, modular arithmetic, fast exponentiation, and slopes.',
    difficulty: 'MEDIUM',
    order_index: 23,
    prerequisites: ['Basic Algebra'],
    icon: 'Percent',
    concepts: ['Binary Exponentiation', 'Trailing Zero Factorization', 'GCD & Reduced Fractions', 'Palindrome Integers'],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
  },
  {
    id: 'dsa_topic_1d_dp',
    name: '1D Dynamic Programming',
    slug: '1d-dp',
    category: 'TECHNIQUE',
    description: 'Linear state dynamic programming with constant or sublinear transitions (Fibonacci, house robber, coin change).',
    difficulty: 'MEDIUM',
    order_index: 24,
    prerequisites: ['Dynamic Programming'],
    icon: 'TrendingUp',
    concepts: ['Linear States', 'Transition Functions', 'Base Cases', 'Space Optimization to O(1)'],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
  },
  {
    id: 'dsa_topic_multidim_dp',
    name: 'Multidimensional DP',
    slug: 'multidimensional-dp',
    category: 'TECHNIQUE',
    description: 'Dynamic programming across 2 or more state dimensions (grid paths, edit distance, multi-state stock trading).',
    difficulty: 'HARD',
    order_index: 25,
    prerequisites: ['Dynamic Programming', 'Matrix / 2D Arrays'],
    icon: 'Box',
    concepts: ['2D Grid Recurrences', 'String Alignment DP', 'Multi-State Transitions', 'Subproblem Matrices'],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
  },
];

export const seedAlgorithms: Algorithm[] = [
  {
    id: 'algo_binary_search',
    name: 'Binary Search',
    slug: 'binary-search',
    topic_id: 'dsa_topic_searching',
    description: 'Efficiently locates a target element in a monotonically sorted collection by halving the search space on each step.',
    concept: 'At each iteration, compare the target with the midpoint. If target is smaller, eliminate the right half; otherwise, eliminate the left half.',
    pseudocode: [
      'function binarySearch(arr, target):',
      '    low = 0, high = arr.length - 1',
      '    while low <= high:',
      '        mid = floor((low + high) / 2)',
      '        if arr[mid] == target:',
      '            return mid',
      '        else if arr[mid] < target:',
      '            low = mid + 1',
      '        else:',
      '            high = mid - 1',
      '    return -1',
    ],
    time_complexity: 'O(log N)',
    space_complexity: 'O(1)',
    best_case: 'O(1)',
    average_case: 'O(log N)',
    worst_case: 'O(log N)',
    stable: false,
    in_place: true,
    visualization_type: 'ARRAY',
    supported_languages: ['python', 'javascript', 'cpp', 'c', 'java'],
    default_input: { array: [2, 5, 8, 12, 16, 23, 38, 56, 72, 91], target: 23 },
    comparison_tags: ['searching', 'divide-and-conquer'],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
  },
  {
    id: 'algo_linear_search',
    name: 'Linear Search',
    slug: 'linear-search',
    topic_id: 'dsa_topic_searching',
    description: 'Sequentially checks each element in the collection from start to finish until target is found or collection ends.',
    concept: 'Examines each index i from 0 to N-1. Requires no ordering preconditions.',
    pseudocode: [
      'function linearSearch(arr, target):',
      '    for i from 0 to arr.length - 1:',
      '        if arr[i] == target:',
      '            return i',
      '    return -1',
    ],
    time_complexity: 'O(N)',
    space_complexity: 'O(1)',
    best_case: 'O(1)',
    average_case: 'O(N)',
    worst_case: 'O(N)',
    stable: true,
    in_place: true,
    visualization_type: 'ARRAY',
    supported_languages: ['python', 'javascript', 'cpp', 'c', 'java'],
    default_input: { array: [14, 33, 27, 10, 35, 19, 42, 44], target: 35 },
    comparison_tags: ['searching', 'brute-force'],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
  },
  {
    id: 'algo_bubble_sort',
    name: 'Bubble Sort',
    slug: 'bubble-sort',
    topic_id: 'dsa_topic_sorting',
    description: 'Repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order.',
    concept: 'Larger elements bubble to the end of the array with each pass. An early-exit flag achieves O(N) when already sorted.',
    pseudocode: [
      'function bubbleSort(arr):',
      '    n = arr.length',
      '    for i from 0 to n - 2:',
      '        swapped = false',
      '        for j from 0 to n - i - 2:',
      '            if arr[j] > arr[j + 1]:',
      '                swap(arr[j], arr[j + 1])',
      '                swapped = true',
      '        if not swapped: break',
      '    return arr',
    ],
    time_complexity: 'O(N^2)',
    space_complexity: 'O(1)',
    best_case: 'O(N)',
    average_case: 'O(N^2)',
    worst_case: 'O(N^2)',
    stable: true,
    in_place: true,
    visualization_type: 'ARRAY',
    supported_languages: ['python', 'javascript', 'cpp', 'c', 'java'],
    default_input: { array: [64, 34, 25, 12, 22, 11, 90] },
    comparison_tags: ['sorting', 'comparison', 'quadratic'],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
  },
  {
    id: 'algo_selection_sort',
    name: 'Selection Sort',
    slug: 'selection-sort',
    topic_id: 'dsa_topic_sorting',
    description: 'Divides the array into sorted and unsorted segments; repeatedly selects the minimum from the unsorted portion.',
    concept: 'Scans the remaining unsorted elements, identifies the minimum, and performs exactly one swap per outer pass.',
    pseudocode: [
      'function selectionSort(arr):',
      '    n = arr.length',
      '    for i from 0 to n - 2:',
      '        minIdx = i',
      '        for j from i + 1 to n - 1:',
      '            if arr[j] < arr[minIdx]: minIdx = j',
      '        if minIdx != i: swap(arr[i], arr[minIdx])',
      '    return arr',
    ],
    time_complexity: 'O(N^2)',
    space_complexity: 'O(1)',
    best_case: 'O(N^2)',
    average_case: 'O(N^2)',
    worst_case: 'O(N^2)',
    stable: false,
    in_place: true,
    visualization_type: 'ARRAY',
    supported_languages: ['python', 'javascript', 'cpp', 'c', 'java'],
    default_input: { array: [29, 10, 14, 37, 13] },
    comparison_tags: ['sorting', 'comparison', 'quadratic'],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
  },
  {
    id: 'algo_insertion_sort',
    name: 'Insertion Sort',
    slug: 'insertion-sort',
    topic_id: 'dsa_topic_sorting',
    description: 'Builds the final sorted array one item at a time by shifting larger elements right and inserting key.',
    concept: 'Maintains a sorted prefix. Each element is compared backwards and shifted into its correct slot. Highly efficient on nearly-sorted data.',
    pseudocode: [
      'function insertionSort(arr):',
      '    for i from 1 to arr.length - 1:',
      '        key = arr[i], j = i - 1',
      '        while j >= 0 and arr[j] > key:',
      '            arr[j + 1] = arr[j]',
      '            j = j - 1',
      '        arr[j + 1] = key',
      '    return arr',
    ],
    time_complexity: 'O(N^2)',
    space_complexity: 'O(1)',
    best_case: 'O(N)',
    average_case: 'O(N^2)',
    worst_case: 'O(N^2)',
    stable: true,
    in_place: true,
    visualization_type: 'ARRAY',
    supported_languages: ['python', 'javascript', 'cpp', 'c', 'java'],
    default_input: { array: [12, 11, 13, 5, 6] },
    comparison_tags: ['sorting', 'comparison', 'online'],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
  },
  {
    id: 'algo_quick_sort',
    name: 'Quick Sort',
    slug: 'quick-sort',
    topic_id: 'dsa_topic_sorting',
    description: 'High-performance divide-and-conquer algorithm that partitions an array around a chosen pivot element.',
    concept: 'Reorders array so elements smaller than pivot precede it, and larger elements follow it. Recursively sorts sub-arrays.',
    pseudocode: [
      'function quickSort(arr, low, high):',
      '    if low < high:',
      '        pi = partition(arr, low, high)',
      '        quickSort(arr, low, pi - 1)',
      '        quickSort(arr, pi + 1, high)',
    ],
    time_complexity: 'O(N log N)',
    space_complexity: 'O(log N)',
    best_case: 'O(N log N)',
    average_case: 'O(N log N)',
    worst_case: 'O(N^2)',
    stable: false,
    in_place: true,
    visualization_type: 'ARRAY',
    supported_languages: ['python', 'javascript', 'cpp', 'c', 'java'],
    default_input: { array: [10, 80, 30, 90, 40, 50, 70] },
    comparison_tags: ['sorting', 'divide-and-conquer', 'fast'],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
  },
  {
    id: 'algo_stack_ops',
    name: 'Stack Operations (Push, Pop, Peek)',
    slug: 'stack-operations',
    topic_id: 'dsa_topic_stacks_queues',
    description: 'Visualizes Last-In First-Out (LIFO) operations with top-of-stack tracking and stack pointer dynamics.',
    concept: 'All additions and deletions are restricted to the topmost index.',
    pseudocode: [
      'class Stack:',
      '    push(val): append to top, top++',
      '    pop(): remove from top, top--',
      '    peek(): return value at top',
    ],
    time_complexity: 'O(1)',
    space_complexity: 'O(N)',
    best_case: 'O(1)',
    average_case: 'O(1)',
    worst_case: 'O(1)',
    stable: true,
    in_place: true,
    visualization_type: 'STACK',
    supported_languages: ['python', 'javascript', 'cpp', 'c', 'java'],
    default_input: { operations: [{ type: 'push', value: 10 }, { type: 'push', value: 20 }, { type: 'push', value: 30 }, { type: 'peek' }, { type: 'pop' }] },
    comparison_tags: ['linear', 'lifo'],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
  },
  {
    id: 'algo_queue_ops',
    name: 'Queue Operations (FIFO)',
    slug: 'queue-operations',
    topic_id: 'dsa_topic_stacks_queues',
    description: 'First-In First-Out (FIFO) queue with front dequeue and rear enqueue pointers.',
    concept: 'New items enter at the rear. Items are served and dequeued from the front.',
    pseudocode: [
      'class Queue:',
      '    enqueue(val): insert at rear',
      '    dequeue(): remove from front',
      '    peek(): return item at front',
    ],
    time_complexity: 'O(1)',
    space_complexity: 'O(N)',
    best_case: 'O(1)',
    average_case: 'O(1)',
    worst_case: 'O(1)',
    stable: true,
    in_place: true,
    visualization_type: 'QUEUE',
    supported_languages: ['python', 'javascript', 'cpp', 'c', 'java'],
    default_input: { operations: [{ type: 'enqueue', value: 10 }, { type: 'enqueue', value: 20 }, { type: 'dequeue' }] },
    comparison_tags: ['linear', 'fifo'],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
  },
  {
    id: 'algo_linked_list_ops',
    name: 'Singly Linked List Traversal & Insertion',
    slug: 'linked-list-traversal',
    topic_id: 'dsa_topic_linked_lists',
    description: 'Pointer-based sequential traversal through node chains and dynamic node insertion.',
    concept: 'Each node contains a data payload and a pointer to the successor node.',
    pseudocode: [
      'curr = head',
      'while curr != null:',
      '    process(curr.val)',
      '    curr = curr.next',
    ],
    time_complexity: 'O(N)',
    space_complexity: 'O(N)',
    best_case: 'O(1)',
    average_case: 'O(N)',
    worst_case: 'O(N)',
    stable: true,
    in_place: false,
    visualization_type: 'LINKED_LIST',
    supported_languages: ['python', 'javascript', 'cpp', 'c', 'java'],
    default_input: { values: [10, 20, 30, 40, 50], insertVal: 25 },
    comparison_tags: ['pointer', 'node-chain'],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
  },
  {
    id: 'algo_bst_search',
    name: 'Binary Search Tree (BST) Lookup',
    slug: 'bst-search',
    topic_id: 'dsa_topic_trees',
    description: 'Tree search exploiting the invariant that left children are strictly smaller and right children strictly greater.',
    concept: 'Compares target to root: if smaller, branch left; if greater, branch right. Achieves logarithmic height search.',
    pseudocode: [
      'function searchBST(root, val):',
      '    if root == null or root.val == val: return root',
      '    if val < root.val: return searchBST(root.left, val)',
      '    return searchBST(root.right, val)',
    ],
    time_complexity: 'O(log N)',
    space_complexity: 'O(H)',
    best_case: 'O(1)',
    average_case: 'O(log N)',
    worst_case: 'O(N)',
    stable: false,
    in_place: true,
    visualization_type: 'TREE',
    supported_languages: ['python', 'javascript', 'cpp', 'c', 'java'],
    default_input: { nodes: [8, 3, 10, 1, 6, 14, 4, 7, 13], searchVal: 7 },
    comparison_tags: ['tree', 'hierarchical', 'bst'],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
  },
  {
    id: 'algo_bfs',
    name: 'Breadth-First Search (BFS)',
    slug: 'breadth-first-search',
    topic_id: 'dsa_topic_graphs',
    description: 'Layer-by-layer graph traversal exploring all immediate neighbors before advancing to subsequent depth rings.',
    concept: 'Uses a FIFO queue to guarantee that vertices are discovered in increasing order of distance from start.',
    pseudocode: [
      'function BFS(graph, start):',
      '    visited = set([start]), queue = [start]',
      '    while queue not empty:',
      '        u = queue.pop(0)',
      '        for v in graph.neighbors(u):',
      '            if v not in visited:',
      '                visited.add(v), queue.append(v)',
    ],
    time_complexity: 'O(V + E)',
    space_complexity: 'O(V)',
    best_case: 'O(V + E)',
    average_case: 'O(V + E)',
    worst_case: 'O(V + E)',
    stable: true,
    in_place: false,
    visualization_type: 'GRAPH',
    supported_languages: ['python', 'javascript', 'cpp', 'c', 'java'],
    default_input: { startNode: 'A' },
    comparison_tags: ['graph', 'queue', 'shortest-path'],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
  },
  {
    id: 'algo_dfs',
    name: 'Depth-First Search (DFS)',
    slug: 'depth-first-search',
    topic_id: 'dsa_topic_graphs',
    description: 'Graph exploration along a branch as far as possible before backtracking via recursion call stack.',
    concept: 'Visits vertex and immediately recurses on first unvisited adjacent neighbor.',
    pseudocode: [
      'function DFS(u, visited):',
      '    visited.add(u)',
      '    for v in graph.neighbors(u):',
      '        if v not in visited: DFS(v, visited)',
    ],
    time_complexity: 'O(V + E)',
    space_complexity: 'O(V)',
    best_case: 'O(V + E)',
    average_case: 'O(V + E)',
    worst_case: 'O(V + E)',
    stable: true,
    in_place: false,
    visualization_type: 'GRAPH',
    supported_languages: ['python', 'javascript', 'cpp', 'c', 'java'],
    default_input: { startNode: 'A' },
    comparison_tags: ['graph', 'stack', 'backtracking'],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
  },
  {
    id: 'algo_fibonacci_dp',
    name: 'Fibonacci DP (Memoization & Tabulation)',
    slug: 'fibonacci-dp',
    topic_id: 'dsa_topic_dp',
    description: 'Linear time Fibonacci calculation using bottom-up dynamic programming table filling.',
    concept: 'Computes each dp[i] from previously memoized subproblems dp[i-1] and dp[i-2], eliminating 2^N exponential recursion.',
    pseudocode: [
      'function fib(n):',
      '    dp = array of size n + 1',
      '    dp[0] = 0, dp[1] = 1',
      '    for i from 2 to n:',
      '        dp[i] = dp[i-1] + dp[i-2]',
      '    return dp[n]',
    ],
    time_complexity: 'O(N)',
    space_complexity: 'O(N)',
    best_case: 'O(N)',
    average_case: 'O(N)',
    worst_case: 'O(N)',
    stable: true,
    in_place: false,
    visualization_type: 'DP_TABLE',
    supported_languages: ['python', 'javascript', 'cpp', 'c', 'java'],
    default_input: { n: 6 },
    comparison_tags: ['dp', 'tabulation'],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
  },
  {
    id: 'algo_heap_ops',
    name: 'Min-Heap Heapify & Operations',
    slug: 'heap-operations',
    topic_id: 'dsa_topic_heaps',
    description: 'Array-backed complete binary tree that maintains the min-heap property with logarithmic bubble-up.',
    concept: 'Parent index = floor((i-1)/2). If parent is larger than child, swap upwards until invariant restored.',
    pseudocode: [
      'insert(val):',
      '    heap.append(val)',
      '    bubbleUp(heap.length - 1)',
    ],
    time_complexity: 'O(log N)',
    space_complexity: 'O(N)',
    best_case: 'O(1)',
    average_case: 'O(log N)',
    worst_case: 'O(log N)',
    stable: false,
    in_place: true,
    visualization_type: 'HEAP',
    supported_languages: ['python', 'javascript', 'cpp', 'c', 'java'],
    default_input: { values: [4, 10, 3, 5, 1], type: 'min' },
    comparison_tags: ['heap', 'priority-queue'],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
  },
];

export const seedDSAProblems: DSAProblem[] = [
  {
    id: 'dsa_prob_binary_search',
    title: 'Binary Search Implementation',
    slug: 'binary-search-implementation',
    topic_id: 'dsa_topic_searching',
    algorithm_id: 'algo_binary_search',
    difficulty: 'EASY',
    description: 'Given a sorted array of distinct integers `nums` and a target integer `target`, return the index of `target` if it is in the array, or `-1` if it is not present.\n\nYou must write an algorithm with `O(log n)` runtime complexity.',
    constraints: [
      '1 <= nums.length <= 10^5',
      '-10^4 <= nums[i], target <= 10^4',
      'All integers in nums are unique.',
      'nums is sorted in ascending order.',
    ],
    input_format: 'Line 1: N (size of array)\nLine 2: N space-separated integers in ascending order\nLine 3: target integer',
    output_format: 'A single integer representing the 0-based index of target, or -1 if not found.',
    examples: [
      {
        input: '6\n-1 0 3 5 9 12\n9',
        output: '4',
        explanation: '9 exists in nums and its index is 4.',
      },
      {
        input: '6\n-1 0 3 5 9 12\n2',
        output: '-1',
        explanation: '2 does not exist in nums so return -1.',
      },
    ],
    starter_code: {
      python: `# Binary Search Solution
import sys

def solve():
    lines = sys.stdin.read().split()
    if not lines:
        return
    n = int(lines[0])
    arr = [int(x) for x in lines[1:n+1]]
    target = int(lines[n+1])

    # TODO: Implement Binary Search
    low, high = 0, n - 1
    ans = -1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            ans = mid
            break
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    print(ans)

if __name__ == "__main__":
    solve()
`,
      javascript: `const fs = require('fs');

function solve() {
    const input = fs.readFileSync('/dev/stdin', 'utf-8').trim().split(/\\s+/);
    if (!input || input.length < 3) return;
    const n = parseInt(input[0], 10);
    const arr = input.slice(1, n + 1).map(Number);
    const target = parseInt(input[n + 1], 10);

    let low = 0, high = n - 1;
    let ans = -1;
    while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        if (arr[mid] === target) {
            ans = mid;
            break;
        } else if (arr[mid] < target) {
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }
    console.log(ans);
}

solve();
`,
      cpp: `#include <iostream>
#include <vector>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n;
    if (!(cin >> n)) return 0;
    vector<int> arr(n);
    for (int i = 0; i < n; ++i) cin >> arr[i];
    int target;
    cin >> target;

    int low = 0, high = n - 1, ans = -1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (arr[mid] == target) {
            ans = mid;
            break;
        } else if (arr[mid] < target) {
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }
    cout << ans << "\\n";
    return 0;
}
`,
    },
    hints: [
      'The array is monotonically non-decreasing. What property can you test at the midpoint?',
      'Calculate mid using (low + (high - low) // 2) to avoid overflow.',
      'If arr[mid] < target, target must reside in [mid + 1, high].',
    ],
    solution_explanation: 'We maintain two pointers `low` and `high` defining the active search interval. In each iteration, we compare the midpoint `arr[mid]` with `target`. Because the array is sorted, this halves the search window, giving logarithmic O(log N) runtime.',
    supported_languages: ['python', 'javascript', 'cpp', 'c', 'java'],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
  },
  {
    id: 'dsa_prob_reverse_linked_list',
    title: 'Reverse a Singly Linked List',
    slug: 'reverse-singly-linked-list',
    topic_id: 'dsa_topic_linked_lists',
    algorithm_id: 'algo_linked_list_ops',
    difficulty: 'EASY',
    description: 'Given the head of a singly linked list represented as space-separated integers, reverse the list, and return the reversed list.\n\nDemonstrate in-place pointer swapping in O(N) time and O(1) space.',
    constraints: [
      '0 <= number of nodes <= 5000',
      '-5000 <= Node.val <= 5000',
    ],
    input_format: 'Line 1: N (number of nodes)\nLine 2: N space-separated integers representing node values in sequence.',
    output_format: 'The reversed sequence of node values separated by spaces.',
    examples: [
      {
        input: '5\n1 2 3 4 5',
        output: '5 4 3 2 1',
        explanation: 'The linked list 1->2->3->4->5 becomes 5->4->3->2->1.',
      },
    ],
    starter_code: {
      python: `# Reverse Singly Linked List
import sys

def solve():
    lines = sys.stdin.read().split()
    if not lines:
        return
    n = int(lines[0])
    vals = lines[1:n+1]
    # Reverse and print
    print(" ".join(reversed(vals)))

if __name__ == "__main__":
    solve()
`,
    },
    hints: [
      'Think about 3 pointers: `prev`, `curr`, and `next`.',
      'Before updating `curr.next = prev`, store the original `curr.next`.',
      'Advance `prev = curr` and `curr = next` until curr is null.',
    ],
    solution_explanation: 'Using three pointers (`prev = None`, `curr = head`), we iterate through the list. For each node, we save `next = curr.next`, point `curr.next` to `prev`, then advance `prev` and `curr`.',
    supported_languages: ['python', 'javascript', 'cpp'],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
  },
  {
    id: 'dsa_prob_valid_brackets',
    title: 'Valid Parentheses / Stacks',
    slug: 'valid-parentheses-brackets',
    topic_id: 'dsa_topic_stacks_queues',
    algorithm_id: 'algo_stack_ops',
    difficulty: 'EASY',
    description: 'Given a string `s` containing only \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid.\n\nOpen brackets must be closed by the same type of brackets in the correct order.',
    constraints: ['1 <= s.length <= 10^4'],
    input_format: 'A single string s.',
    output_format: 'true or false',
    examples: [
      {
        input: '()[]{}',
        output: 'true',
      },
      {
        input: '(]',
        output: 'false',
      },
    ],
    starter_code: {
      python: `import sys

def isValid(s: str) -> bool:
    stack = []
    mapping = {')': '(', '}': '{', ']': '['}
    for char in s:
        if char in mapping:
            top = stack.pop() if stack else '#'
            if mapping[char] != top:
                return False
        else:
            stack.append(char)
    return not stack

if __name__ == "__main__":
    line = sys.stdin.read().strip()
    print("true" if isValid(line) else "false")
`,
    },
    hints: [
      'Use a stack to keep track of unclosed opening brackets.',
      'When an opening bracket is seen, push it onto the stack.',
      'When a closing bracket is seen, check if it matches the top of the stack.',
    ],
    solution_explanation: 'A stack accurately tracks nested bracket structures because the most recently opened bracket must be the first one to be closed.',
    supported_languages: ['python', 'javascript', 'cpp'],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
  },
  ...topInterview150Part1,
  ...topInterview150Part2,
  ...topInterview150Part3,
];
