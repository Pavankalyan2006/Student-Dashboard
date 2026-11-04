import { topInterview150Part1 } from '../server/db/seedDsaTop150Part1';
import { topInterview150Part2 } from '../server/db/seedDsaTop150Part2';
import { topInterview150Part3 } from '../server/db/seedDsaTop150Part3';

const all150 = [...topInterview150Part1, ...topInterview150Part2, ...topInterview150Part3];
const titles = all150.map(p => p.title.toLowerCase());

const requiredPatterns = [
  // Arrays & Hashing
  "Two Sum", "Contains Duplicate", "Maximum Subarray", "Best Time to Buy and Sell Stock",
  "Product of Array Except Self", "Majority Element", "Missing Number", "Find the Duplicate Number",
  "Longest Consecutive Sequence", "Merge Intervals", "Insert Interval", "Set Matrix Zeroes",
  "Rotate Image", "Subarray Sum Equals K", "Trapping Rain Water",
  // Strings
  "Valid Anagram", "Valid Palindrome", "Longest Common Prefix", "Reverse Words in a String",
  "String Compression", "Longest Palindromic Substring", "Group Anagrams", "Minimum Window Substring",
  "First Occurrence", "Longest Repeating Character Replacement",
  // Two Pointers
  "Two Sum II", "Three Sum", "3Sum", "Container With Most Water", "Remove Duplicates from Sorted Array",
  "Move Zeroes", "Squares of a Sorted Array", "Sort Colors", "Four Sum",
  // Sliding Window
  "Maximum Average Subarray", "Maximum Sum Subarray", "Longest Substring Without Repeating Characters",
  "Minimum Size Subarray Sum", "Permutation in String", "Find All Anagrams", "Sliding Window Maximum",
  // Binary Search
  "Binary Search", "Search Insert Position", "First and Last Position", "Search in Rotated Sorted Array",
  "Find Minimum in Rotated Sorted Array", "Find Peak Element", "Search a 2D Matrix", "Koko Eating Bananas",
  // Sorting and Searching
  "Merge Sort", "Quick Sort", "Sort an Array", "Sort Characters by Frequency", "Kth Largest Element",
  "Meeting Rooms", "Count Inversions",
  // Linked Lists
  "Reverse Linked List", "Middle of the Linked List", "Merge Two Sorted Lists", "Linked List Cycle",
  "Remove Nth Node From End", "Palindrome Linked List", "Intersection of Two Linked Lists", "Add Two Numbers",
  "Reorder List",
  // Stacks and Queues
  "Valid Parentheses", "Min Stack", "Implement Queue Using Stacks", "Implement Stack Using Queues",
  "Daily Temperatures", "Next Greater Element", "Evaluate Reverse Polish Notation", "Largest Rectangle in Histogram",
  // Recursion and Backtracking
  "Generate Parentheses", "Subsets", "Permutations", "Combination Sum",
  "Letter Combinations of a Phone Number", "Word Search", "N-Queens", "Sudoku Solver",
  // Trees and BST
  "Maximum Depth of Binary Tree", "Invert Binary Tree", "Same Tree", "Symmetric Tree", "Level Order Traversal",
  "Right Side View", "Diameter of Binary Tree", "Balanced Binary Tree", "Lowest Common Ancestor",
  "Validate Binary Search Tree", "Kth Smallest Element in a BST", "Construct Tree From", "Binary Tree Maximum Path Sum",
  "Serialize and Deserialize Binary Tree",
  // Heaps
  "Kth Largest Element in a Stream", "Top K Frequent Elements", "Find Median From Data Stream", "Merge K Sorted Lists",
  "K Closest Points to Origin", "Task Scheduler",
  // Graphs
  "Number of Islands", "Flood Fill", "Clone Graph", "Course Schedule", "Rotting Oranges", "Pacific Atlantic Water Flow",
  "Graph Valid Tree", "Number of Connected Components", "Word Ladder", "Network Delay Time",
  // Greedy
  "Jump Game", "Gas Station", "Assign Cookies", "Non-overlapping Intervals", "Minimum Number of Arrows to Burst Balloons",
  "Partition Labels",
  // Dynamic Programming
  "Climbing Stairs", "House Robber", "Coin Change", "Longest Increasing Subsequence", "Longest Common Subsequence",
  "Word Break", "Unique Paths", "Minimum Path Sum", "Partition Equal Subset Sum", "Edit Distance",
  "Decode Ways", "Maximum Product Subarray",
  // Tries
  "Implement Trie", "Word Search II", "Design Add and Search Words", "Union-Find",
  // Bit Manipulation
  "Single Number", "Number of 1 Bits", "Counting Bits", "Reverse Bits"
];

let found = 0;
let missing: string[] = [];

for (const pat of requiredPatterns) {
  const match = titles.some(t => t.includes(pat.toLowerCase()));
  if (match) {
    found++;
  } else {
    missing.push(pat);
  }
}

console.log(`Found: ${found} / ${requiredPatterns.length}`);
console.log('Missing patterns from current 150:', missing);
