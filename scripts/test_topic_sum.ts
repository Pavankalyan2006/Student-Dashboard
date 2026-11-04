import fs from 'fs';
import path from 'path';

// Definition of the 16 Canonical Topics
export const CANONICAL_DSA_TOPICS = [
  { id: 'topic_arrays_hashing', name: 'Arrays and Hashing', slug: 'arrays-and-hashing', target: 15 },
  { id: 'topic_strings', name: 'Strings', slug: 'strings', target: 10 },
  { id: 'topic_two_pointers', name: 'Two Pointers', slug: 'two-pointers', target: 8 },
  { id: 'topic_sliding_window', name: 'Sliding Window', slug: 'sliding-window', target: 8 },
  { id: 'topic_binary_search', name: 'Binary Search', slug: 'binary-search', target: 8 },
  { id: 'topic_sorting_searching', name: 'Sorting and Searching', slug: 'sorting-and-searching', target: 7 },
  { id: 'topic_linked_lists', name: 'Linked Lists', slug: 'linked-lists', target: 10 },
  { id: 'topic_stacks_queues', name: 'Stacks and Queues', slug: 'stacks-and-queues', target: 8 },
  { id: 'topic_recursion_backtracking', name: 'Recursion and Backtracking', slug: 'recursion-and-backtracking', target: 10 },
  { id: 'topic_trees_bst', name: 'Trees and Binary Search Trees', slug: 'trees-and-binary-search-trees', target: 14 },
  { id: 'topic_heaps', name: 'Heaps and Priority Queues', slug: 'heaps-and-priority-queues', target: 6 },
  { id: 'topic_graphs', name: 'Graphs', slug: 'graphs', target: 12 },
  { id: 'topic_greedy', name: 'Greedy Algorithms', slug: 'greedy-algorithms', target: 7 },
  { id: 'topic_dynamic_programming', name: 'Dynamic Programming', slug: 'dynamic-programming', target: 15 },
  { id: 'topic_tries_advanced', name: 'Tries and Advanced Data Structures', slug: 'tries-and-advanced-data-structures', target: 4 },
  { id: 'topic_bit_manipulation', name: 'Bit Manipulation', slug: 'bit-manipulation', target: 4 },
];

console.log('Total topic target sum:', CANONICAL_DSA_TOPICS.reduce((acc, t) => acc + t.target, 0));
