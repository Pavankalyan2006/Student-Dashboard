import { DSAProblem } from '../models/dsaTypes';
import { createProblem } from './seedDsaTop150Helper';

export const topInterview150Part3: DSAProblem[] = [
  // ==========================================
  // Kadane's Algorithm (2 questions)
  // ==========================================
  createProblem({
    id: 'lc_150_maximum_subarray',
    title: 'Maximum Subarray',
    topic_id: 'dsa_topic_kadane',
    difficulty: 'MEDIUM',
    editorial_url: 'https://leetcode.com/problems/maximum-subarray/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: `Given an integer array nums, find the subarray with the largest sum, and return its sum.

A subarray is a contiguous non-empty sequence of elements within an array.`,
    constraints: ['1 <= nums.length <= 10^5', '-10^4 <= nums[i] <= 10^4'],
    examples: [
      { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6', explanation: 'The subarray [4,-1,2,1] has the largest sum 6.' },
      { input: 'nums = [1]', output: '1' },
      { input: 'nums = [5,4,-1,7,8]', output: '23' }
    ],
    hints: [
      'Think about dynamic programming: at each index, do you extend the previous subarray or start fresh?',
      "Kadane's algorithm: current_max = max(nums[i], current_max + nums[i]).",
      'Keep track of the global maximum seen so far.'
    ],
    optimal_complexity: { time: 'O(n)', space: 'O(1)' }
  }),
  createProblem({
    id: 'lc_150_maximum_sum_circular_subarray',
    title: 'Maximum Sum Circular Subarray',
    topic_id: 'dsa_topic_kadane',
    difficulty: 'MEDIUM',
    editorial_url: 'https://leetcode.com/problems/maximum-sum-circular-subarray/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: `Given a circular integer array nums of length n, return the maximum possible sum of a non-empty subarray of nums.

A circular array means the end of the array connects to the beginning of the array. Formally, the next element of nums[i] is nums[(i + 1) % n] and the previous element of nums[i] is nums[(i - 1 + n) % n].

A subarray may only include each element of the fixed buffer nums at most once.`,
    constraints: ['n == nums.length', '1 <= n <= 3 * 10^4', '-3 * 10^4 <= nums[i] <= 3 * 10^4'],
    examples: [
      { input: 'nums = [1,-2,3,-2]', output: '3', explanation: 'Subarray [3] has maximum sum 3.' },
      { input: 'nums = [5,-3,5]', output: '10', explanation: 'Subarray [5,5] has maximum sum 5 + 5 = 10.' },
      { input: 'nums = [-3,-2,-3]', output: '-2', explanation: 'Subarray [-2] has maximum sum -2.' }
    ],
    hints: [
      'The maximum subarray is either non-circular (standard Kadane) or circular (total sum minus minimum non-circular subarray).',
      'Be careful when all elements are negative: in that case, the circular max would be empty (sum - min = 0), so standard max is the answer.'
    ],
    optimal_complexity: { time: 'O(n)', space: 'O(1)' }
  }),

  // ==========================================
  // Binary Search (7 questions)
  // ==========================================
  createProblem({
    id: 'lc_150_search_insert_position',
    title: 'Search Insert Position',
    topic_id: 'dsa_topic_searching',
    difficulty: 'EASY',
    editorial_url: 'https://leetcode.com/problems/search-insert-position/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: `Given a sorted array of distinct integers and a target value, return the index if the target is found. If not, return the index where it would be if it were inserted in order.

You must write an algorithm with O(log n) runtime complexity.`,
    constraints: ['1 <= nums.length <= 10^4', '-10^4 <= nums[i] <= 10^4', 'nums contains distinct values sorted in ascending order', '-10^4 <= target <= 10^4'],
    examples: [
      { input: 'nums = [1,3,5,6], target = 5', output: '2' },
      { input: 'nums = [1,3,5,6], target = 2', output: '1' },
      { input: 'nums = [1,3,5,6], target = 7', output: '4' }
    ],
    hints: [
      'Binary search standard template: compare mid with target.',
      'When loop terminates (left > right), left is the insertion point.'
    ],
    optimal_complexity: { time: 'O(log n)', space: 'O(1)' }
  }),
  createProblem({
    id: 'lc_150_search_a_2d_matrix',
    title: 'Search a 2D Matrix',
    topic_id: 'dsa_topic_searching',
    difficulty: 'MEDIUM',
    editorial_url: 'https://leetcode.com/problems/search-a-2d-matrix/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: `You are given an m x n integer matrix matrix with the following two properties:
- Each row is sorted in non-decreasing order.
- The first integer of each row is greater than the last integer of the previous row.

Given an integer target, return true if target is in matrix or false otherwise.
You must write a solution in O(log(m * n)) time complexity.`,
    constraints: ['m == matrix.length', 'n == matrix[i].length', '1 <= m, n <= 100', '-10^4 <= matrix[i][j], target <= 10^4'],
    examples: [
      { input: 'matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]], target = 3', output: 'true' },
      { input: 'matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]], target = 13', output: 'false' }
    ],
    hints: [
      'Treat the m x n 2D matrix as a 1D sorted array of length m * n.',
      'Index mid maps to row = mid // n and col = mid % n.'
    ],
    optimal_complexity: { time: 'O(log(m * n))', space: 'O(1)' }
  }),
  createProblem({
    id: 'lc_150_find_peak_element',
    title: 'Find Peak Element',
    topic_id: 'dsa_topic_searching',
    difficulty: 'MEDIUM',
    editorial_url: 'https://leetcode.com/problems/find-peak-element/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: `A peak element is an element that is strictly greater than its neighbors.

Given a 0-indexed integer array nums, find a peak element, and return its index. If the array contains multiple peaks, return the index to any of the peaks.

You may imagine that nums[-1] = nums[n] = -infinity. In other words, an element is always considered to be strictly greater than a neighbor that is outside the array.

You must write an algorithm that runs in O(log n) time.`,
    constraints: ['1 <= nums.length <= 1000', '-2^31 <= nums[i] <= 2^31 - 1', 'nums[i] != nums[i + 1] for all valid i'],
    examples: [
      { input: 'nums = [1,2,3,1]', output: '2', explanation: '3 is a peak element and your function should return the index number 2.' },
      { input: 'nums = [1,2,1,3,5,6,4]', output: '5', explanation: 'Your function can return either index number 1 where the peak element is 2, or index number 5 where the peak element is 6.' }
    ],
    hints: [
      'If nums[mid] < nums[mid + 1], a peak must exist to the right because the slope is increasing towards the right.',
      'Otherwise, a peak must exist at mid or to the left.'
    ],
    optimal_complexity: { time: 'O(log n)', space: 'O(1)' }
  }),
  createProblem({
    id: 'lc_150_search_in_rotated_sorted_array',
    title: 'Search in Rotated Sorted Array',
    topic_id: 'dsa_topic_searching',
    difficulty: 'MEDIUM',
    editorial_url: 'https://leetcode.com/problems/search-in-rotated-sorted-array/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: `There is an integer array nums sorted in ascending order (with distinct values).

Prior to being passed to your function, nums is possibly rotated at an unknown pivot index k (1 <= k < nums.length) such that the resulting array is [nums[k], nums[k+1], ..., nums[n-1], nums[0], nums[1], ..., nums[k-1]].

Given the array nums after the possible rotation and an integer target, return the index of target if it is in nums, or -1 if it is not in nums.

You must write an algorithm with O(log n) runtime complexity.`,
    constraints: ['1 <= nums.length <= 5000', '-10^4 <= nums[i] <= 10^4', 'All values of nums are unique', '-10^4 <= target <= 10^4'],
    examples: [
      { input: 'nums = [4,5,6,7,0,1,2], target = 0', output: '4' },
      { input: 'nums = [4,5,6,7,0,1,2], target = 3', output: '-1' },
      { input: 'nums = [1], target = 0', output: '-1' }
    ],
    hints: [
      'At least one half of nums[left..right] will always be sorted.',
      'Check if the left half is sorted (nums[left] <= nums[mid]). If so, check if target falls in that range.',
      'Otherwise, the right half is sorted.'
    ],
    optimal_complexity: { time: 'O(log n)', space: 'O(1)' }
  }),
  createProblem({
    id: 'lc_150_find_first_and_last_position_of_element_in_sorted_array',
    title: 'Find First and Last Position of Element in Sorted Array',
    topic_id: 'dsa_topic_searching',
    difficulty: 'MEDIUM',
    editorial_url: 'https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: `Given an array of integers nums sorted in non-decreasing order, find the starting and ending position of a given target value.

If target is not found in the array, return [-1, -1].

You must write an algorithm with O(log n) runtime complexity.`,
    constraints: ['0 <= nums.length <= 10^5', '-10^9 <= nums[i] <= 10^9', 'nums is a non-decreasing array', '-10^9 <= target <= 10^9'],
    examples: [
      { input: 'nums = [5,7,7,8,8,10], target = 8', output: '[3,4]' },
      { input: 'nums = [5,7,7,8,8,10], target = 6', output: '[-1,-1]' },
      { input: 'nums = [], target = 0', output: '[-1,-1]' }
    ],
    hints: [
      'Run two binary searches: one finding the lower bound (first occurrence) and one finding the upper bound (last occurrence).',
      'In lower bound search, when nums[mid] == target, continue searching left.'
    ],
    optimal_complexity: { time: 'O(log n)', space: 'O(1)' }
  }),
  createProblem({
    id: 'lc_150_find_minimum_in_rotated_sorted_array',
    title: 'Find Minimum in Rotated Sorted Array',
    topic_id: 'dsa_topic_searching',
    difficulty: 'MEDIUM',
    editorial_url: 'https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: `Suppose an array of length n sorted in ascending order is rotated between 1 and n times.

Notice that rotating an array [a[0], a[1], a[2], ..., a[n-1]] 1 time results in the array [a[n-1], a[0], a[1], a[2], ..., a[n-2]].

Given the sorted rotated array nums of unique elements, return the minimum element of this array.

You must write an algorithm that runs in O(log n) time.`,
    constraints: ['n == nums.length', '1 <= n <= 5000', '-5000 <= nums[i] <= 5000', 'All the integers of nums are unique'],
    examples: [
      { input: 'nums = [3,4,5,1,2]', output: '1', explanation: 'The original array was [1,2,3,4,5] rotated 3 times.' },
      { input: 'nums = [4,5,6,7,0,1,2]', output: '0', explanation: 'The original array was [0,1,2,4,5,6,7] and it was rotated 4 times.' },
      { input: 'nums = [11,13,15,17]', output: '11' }
    ],
    hints: [
      'Compare nums[mid] with nums[right].',
      'If nums[mid] > nums[right], the minimum is in the right half (left = mid + 1).',
      'If nums[mid] <= nums[right], the minimum is at mid or in the left half (right = mid).'
    ],
    optimal_complexity: { time: 'O(log n)', space: 'O(1)' }
  }),
  createProblem({
    id: 'lc_150_median_of_two_sorted_arrays',
    title: 'Median of Two Sorted Arrays',
    topic_id: 'dsa_topic_searching',
    difficulty: 'HARD',
    editorial_url: 'https://leetcode.com/problems/median-of-two-sorted-arrays/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: `Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.

The overall run time complexity should be O(log (m+n)).`,
    constraints: ['nums1.length == m', 'nums2.length == n', '0 <= m <= 1000', '0 <= n <= 1000', '1 <= m + n <= 2000', '-10^6 <= nums1[i], nums2[i] <= 10^6'],
    examples: [
      { input: 'nums1 = [1,3], nums2 = [2]', output: '2.00000', explanation: 'merged array = [1,2,3] and median is 2.' },
      { input: 'nums1 = [1,2], nums2 = [3,4]', output: '2.50000', explanation: 'merged array = [1,2,3,4] and median is (2 + 3) / 2 = 2.5.' }
    ],
    hints: [
      'Binary search on the partition of the smaller array.',
      'Partition nums1 and nums2 such that the left partition has (m + n + 1) // 2 elements.',
      'Check if maxLeft1 <= minRight2 and maxLeft2 <= minRight1.'
    ],
    optimal_complexity: { time: 'O(log(min(m, n)))', space: 'O(1)' }
  }),

  // ==========================================
  // Heap (4 questions)
  // ==========================================
  createProblem({
    id: 'lc_150_kth_largest_element_in_an_array',
    title: 'Kth Largest Element in an Array',
    topic_id: 'dsa_topic_heaps',
    difficulty: 'MEDIUM',
    editorial_url: 'https://leetcode.com/problems/kth-largest-element-in-an-array/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: `Given an integer array nums and an integer k, return the kth largest element in the array.

Note that it is the kth largest element in the sorted order, not the kth distinct element.

Can you solve it without sorting?`,
    constraints: ['1 <= k <= nums.length <= 10^5', '-10^4 <= nums[i] <= 10^4'],
    examples: [
      { input: 'nums = [3,2,1,5,6,4], k = 2', output: '5' },
      { input: 'nums = [3,2,3,1,2,4,5,5,6], k = 4', output: '4' }
    ],
    hints: [
      'Maintain a min-heap of size k. After adding all elements, the top of the heap is the kth largest.',
      'Alternatively, Quickselect has average O(n) runtime complexity.'
    ],
    optimal_complexity: { time: 'O(n log k)', space: 'O(k)' }
  }),
  createProblem({
    id: 'lc_150_ipo',
    title: 'IPO',
    topic_id: 'dsa_topic_heaps',
    difficulty: 'HARD',
    editorial_url: 'https://leetcode.com/problems/ipo/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: `Suppose LeetCode will start its IPO soon. In order to sell a good price of its shares to Venture Capital, LeetCode would like to work on some projects to increase its capital before the IPO. Since it has limited resources, it can only finish at most k distinct projects before the IPO. Help LeetCode design the best way to maximize its total capital after finishing at most k distinct projects.

You are given n projects where the ith project has a pure profit profits[i] and a minimum capital of capital[i] is needed to start it.

Initially, you have w capital. When you finish a project, you will obtain its pure profit and the profit will be added to your total capital.

Pick a list of at most k distinct projects from given projects to maximize your final capital, and return the final maximized capital.`,
    constraints: ['1 <= k <= 10^5', '0 <= w <= 10^9', 'n == profits.length == capital.length', '1 <= n <= 10^5', '0 <= profits[i] <= 10^4', '0 <= capital[i] <= 10^9'],
    examples: [
      { input: 'k = 2, w = 0, profits = [1,2,3], capital = [0,1,1]', output: '4', explanation: 'Since your initial capital is 0, you can only start project indexed 0. After finishing it you will obtain profit 1 and your capital becomes 1. With capital 1, you can either start project indexed 1 or project indexed 2. Choose project 2 to maximize profit: 1 + 3 = 4.' },
      { input: 'k = 3, w = 0, profits = [1,2,3], capital = [0,1,2]', output: '6' }
    ],
    hints: [
      'Sort projects by required capital.',
      'Maintain a max-heap of profits for all projects you can currently afford with capital w.',
      'In each step, pick the top of the max-heap and add its profit to w.'
    ],
    optimal_complexity: { time: 'O(n log n + k log n)', space: 'O(n)' }
  }),
  createProblem({
    id: 'lc_150_find_k_pairs_with_smallest_sums',
    title: 'Find K Pairs with Smallest Sums',
    topic_id: 'dsa_topic_heaps',
    difficulty: 'MEDIUM',
    editorial_url: 'https://leetcode.com/problems/find-k-pairs-with-smallest-sums/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: `You are given two integer arrays nums1 and nums2 sorted in non-decreasing order and an integer k.

Define a pair (u, v) which consists of one element from nums1 and one element from nums2.

Return the k pairs (u1, v1), (u2, v2), ..., (uk, vk) with the smallest sums.`,
    constraints: ['1 <= nums1.length, nums2.length <= 10^5', '-10^9 <= nums1[i], nums2[i] <= 10^9', 'nums1 and nums2 in non-decreasing order', '1 <= k <= 10^4'],
    examples: [
      { input: 'nums1 = [1,7,11], nums2 = [2,4,6], k = 3', output: '[[1,2],[1,4],[1,6]]', explanation: 'The first 3 pairs are returned from the sequence: [1,2],[1,4],[1,6],[7,2],[7,4],[11,2],[7,6],[11,4],[11,6]' },
      { input: 'nums1 = [1,1,2], nums2 = [1,2,3], k = 2', output: '[[1,1],[1,1]]' }
    ],
    hints: [
      'Use a min-heap to track candidate pairs (sum, i, j).',
      'Initialize heap with (nums1[i] + nums2[0], i, 0) for min(k, nums1.length) indices.',
      'When popping (i, j), push (i, j + 1) if j + 1 < nums2.length.'
    ],
    optimal_complexity: { time: 'O(k log(min(k, n1)))', space: 'O(min(k, n1))' }
  }),
  createProblem({
    id: 'lc_150_find_median_from_data_stream',
    title: 'Find Median from Data Stream',
    topic_id: 'dsa_topic_heaps',
    difficulty: 'HARD',
    editorial_url: 'https://leetcode.com/problems/find-median-from-data-stream/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: `The median is the middle value in an ordered integer list. If the size of the list is even, there is no middle value, and the median is the mean of the two middle values.

Implement the MedianFinder class:
- MedianFinder() initializes the MedianFinder object.
- void addNum(int num) adds the integer num from the data stream to the data structure.
- double findMedian() returns the median of all elements so far. Answers within 10^-5 of the actual answer will be accepted.`,
    constraints: ['-10^5 <= num <= 10^5', 'There will be at least one element in the data structure before calling findMedian', 'At most 5 * 10^4 calls will be made to addNum and findMedian'],
    examples: [
      {
        input: '["MedianFinder", "addNum", "addNum", "findMedian", "addNum", "findMedian"]\n[[], [1], [2], [], [3], []]',
        output: '[null, null, null, 1.5, null, 2.0]',
        explanation: 'addNum(1), addNum(2) -> median is 1.5; addNum(3) -> median is 2.0'
      }
    ],
    hints: [
      'Maintain two heaps: a max-heap for the lower half of numbers and a min-heap for the upper half.',
      'Keep the size difference between the two heaps at most 1.'
    ],
    optimal_complexity: { time: 'O(log n) per add, O(1) find', space: 'O(n)' }
  }),

  // ==========================================
  // Bit Manipulation (6 questions)
  // ==========================================
  createProblem({
    id: 'lc_150_add_binary',
    title: 'Add Binary',
    topic_id: 'dsa_topic_bit_manipulation',
    difficulty: 'EASY',
    editorial_url: 'https://leetcode.com/problems/add-binary/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: `Given two binary strings a and b, return their sum as a binary string.`,
    constraints: ['1 <= a.length, b.length <= 10^4', 'a and b consist only of "0" or "1" characters', 'Each string does not contain leading zeros except for the zero itself'],
    examples: [
      { input: 'a = "11", b = "1"', output: '"100"' },
      { input: 'a = "1010", b = "1011"', output: '"10101"' }
    ],
    hints: [
      'Traverse both strings from right to left, keeping track of carry.',
      'Sum the digits and carry: digit = total % 2, carry = total // 2.'
    ],
    optimal_complexity: { time: 'O(max(n, m))', space: 'O(max(n, m))' }
  }),
  createProblem({
    id: 'lc_150_reverse_bits',
    title: 'Reverse Bits',
    topic_id: 'dsa_topic_bit_manipulation',
    difficulty: 'EASY',
    editorial_url: 'https://leetcode.com/problems/reverse-bits/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: `Reverse bits of a given 32 bits unsigned integer.`,
    constraints: ['The input must be a binary string of length 32 or a 32-bit unsigned integer'],
    examples: [
      { input: 'n = 00000010100101000001111010011100', output: '964176192 (00111001011110000010100101000000)' }
    ],
    hints: [
      'Loop 32 times. In each iteration, shift result left by 1 and add (n & 1), then shift n right by 1.'
    ],
    optimal_complexity: { time: 'O(1)', space: 'O(1)' }
  }),
  createProblem({
    id: 'lc_150_number_of_1_bits',
    title: 'Number of 1 Bits',
    topic_id: 'dsa_topic_bit_manipulation',
    difficulty: 'EASY',
    editorial_url: 'https://leetcode.com/problems/number-of-1-bits/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: `Write a function that takes the binary representation of a positive integer and returns the number of set bits it has (also known as the Hamming weight).`,
    constraints: ['1 <= n <= 2^31 - 1'],
    examples: [
      { input: 'n = 11', output: '3', explanation: 'The input binary string 1011 has a total of three set bits.' },
      { input: 'n = 128', output: '1', explanation: 'The input binary string 10000000 has a total of one set bit.' }
    ],
    hints: [
      'Brian Kernighan’s algorithm: n = n & (n - 1) removes the lowest set bit in each step.'
    ],
    optimal_complexity: { time: 'O(k) where k is set bits', space: 'O(1)' }
  }),
  createProblem({
    id: 'lc_150_single_number',
    title: 'Single Number',
    topic_id: 'dsa_topic_bit_manipulation',
    difficulty: 'EASY',
    editorial_url: 'https://leetcode.com/problems/single-number/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: `Given a non-empty array of integers nums, every element appears twice except for one. Find that single one.

You must implement a solution with a linear runtime complexity and use only constant extra space.`,
    constraints: ['1 <= nums.length <= 3 * 10^4', '-3 * 10^4 <= nums[i] <= 3 * 10^4', 'Every element in nums appears twice except for one element which appears only once'],
    examples: [
      { input: 'nums = [2,2,1]', output: '1' },
      { input: 'nums = [4,1,2,1,2]', output: '4' },
      { input: 'nums = [1]', output: '1' }
    ],
    hints: [
      'XOR of any number with itself is 0 (a ^ a = 0).',
      'XOR of any number with 0 is the number (a ^ 0 = a).',
      'XOR all elements together.'
    ],
    optimal_complexity: { time: 'O(n)', space: 'O(1)' }
  }),
  createProblem({
    id: 'lc_150_single_number_ii',
    title: 'Single Number II',
    topic_id: 'dsa_topic_bit_manipulation',
    difficulty: 'MEDIUM',
    editorial_url: 'https://leetcode.com/problems/single-number-ii/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: `Given an integer array nums where every element appears three times except for one, which appears exactly once. Find the single element and return it.

You must implement a solution with a linear runtime complexity and use only constant extra space.`,
    constraints: ['1 <= nums.length <= 3 * 10^4', '-2^31 <= nums[i] <= 2^31 - 1', 'Every element in nums appears three times except for one element which appears once'],
    examples: [
      { input: 'nums = [2,2,3,2]', output: '3' },
      { input: 'nums = [0,1,0,1,0,1,99]', output: '99' }
    ],
    hints: [
      'Count the number of 1 bits at each of the 32 bit positions.',
      'Bits of elements appearing 3 times will sum to a multiple of 3, leaving only the single element bits modulo 3.'
    ],
    optimal_complexity: { time: 'O(n)', space: 'O(1)' }
  }),
  createProblem({
    id: 'lc_150_bitwise_and_of_numbers_range',
    title: 'Bitwise AND of Numbers Range',
    topic_id: 'dsa_topic_bit_manipulation',
    difficulty: 'MEDIUM',
    editorial_url: 'https://leetcode.com/problems/bitwise-and-of-numbers-range/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: `Given two integers left and right that represent the range [left, right], return the bitwise AND of all numbers in this range, inclusive.`,
    constraints: ['0 <= left <= right <= 2^31 - 1'],
    examples: [
      { input: 'left = 5, right = 7', output: '4' },
      { input: 'left = 0, right = 0', output: '0' },
      { input: 'left = 1, right = 2147483647', output: '0' }
    ],
    hints: [
      'The bitwise AND of a range keeps only the common prefix of left and right in binary.',
      'Shift left and right rightwards until left == right, counting shifts, then shift back left.'
    ],
    optimal_complexity: { time: 'O(log(right))', space: 'O(1)' }
  }),

  // ==========================================
  // Math (6 questions)
  // ==========================================
  createProblem({
    id: 'lc_150_palindrome_number',
    title: 'Palindrome Number',
    topic_id: 'dsa_topic_math',
    difficulty: 'EASY',
    editorial_url: 'https://leetcode.com/problems/palindrome-number/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: `Given an integer x, return true if x is a palindrome, and false otherwise.`,
    constraints: ['-2^31 <= x <= 2^31 - 1'],
    examples: [
      { input: 'x = 121', output: 'true', explanation: '121 reads as 121 from left to right and from right to left.' },
      { input: 'x = -121', output: 'false', explanation: 'From left to right, it reads -121. From right to left, it becomes 121-. Therefore it is not a palindrome.' },
      { input: 'x = 10', output: 'false', explanation: 'Reads 01 from right to left. Therefore it is not a palindrome.' }
    ],
    hints: [
      'Negative numbers cannot be palindromes.',
      'Revert half of the number to avoid 32-bit integer overflow.'
    ],
    optimal_complexity: { time: 'O(log10(n))', space: 'O(1)' }
  }),
  createProblem({
    id: 'lc_150_plus_one',
    title: 'Plus One',
    topic_id: 'dsa_topic_math',
    difficulty: 'EASY',
    editorial_url: 'https://leetcode.com/problems/plus-one/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: `You are given a large integer represented as an integer array digits, where each digits[i] is the ith digit of the integer. The digits are ordered from most significant to least significant in left-to-right order. The large integer does not contain any leading 0's.

Increment the large integer by one and return the resulting array of digits.`,
    constraints: ['1 <= digits.length <= 100', '0 <= digits[i] <= 9', 'digits does not contain any leading 0s'],
    examples: [
      { input: 'digits = [1,2,3]', output: '[1,2,4]' },
      { input: 'digits = [4,3,2,1]', output: '[4,3,2,2]' },
      { input: 'digits = [9]', output: '[1,0]' }
    ],
    hints: [
      'Iterate backwards from digits.length - 1.',
      'If digit < 9, increment and return.',
      'If 9, set to 0 and continue. If loop finishes, prepend 1.'
    ],
    optimal_complexity: { time: 'O(n)', space: 'O(1)' }
  }),
  createProblem({
    id: 'lc_150_factorial_trailing_zeroes',
    title: 'Factorial Trailing Zeroes',
    topic_id: 'dsa_topic_math',
    difficulty: 'MEDIUM',
    editorial_url: 'https://leetcode.com/problems/factorial-trailing-zeroes/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: `Given an integer n, return the number of trailing zeroes in n!.

Note that n! = n * (n - 1) * (n - 2) * ... * 3 * 2 * 1.`,
    constraints: ['0 <= n <= 10^4'],
    examples: [
      { input: 'n = 3', output: '0', explanation: '3! = 6, no trailing zero.' },
      { input: 'n = 5', output: '1', explanation: '5! = 120, one trailing zero.' },
      { input: 'n = 0', output: '0' }
    ],
    hints: [
      'Trailing zeroes come from factors of 10 = 2 * 5.',
      'Since 2s are abundant, count factors of 5 in n! by summing floor(n / 5^k).'
    ],
    optimal_complexity: { time: 'O(log5(n))', space: 'O(1)' }
  }),
  createProblem({
    id: 'lc_150_sqrtx',
    title: 'Sqrt(x)',
    topic_id: 'dsa_topic_math',
    difficulty: 'EASY',
    editorial_url: 'https://leetcode.com/problems/sqrtx/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: `Given a non-negative integer x, return the square root of x rounded down to the nearest integer. The returned integer should be non-negative as well.

You must not use any built-in exponent function or operator.`,
    constraints: ['0 <= x <= 2^31 - 1'],
    examples: [
      { input: 'x = 4', output: '2' },
      { input: 'x = 8', output: '2', explanation: 'The square root of 8 is 2.82842..., and since we round it down to the nearest integer, 2 is returned.' }
    ],
    hints: [
      'Use binary search on [0, x].',
      'Compare mid * mid with x. Watch out for integer overflow (use mid <= x / mid).'
    ],
    optimal_complexity: { time: 'O(log x)', space: 'O(1)' }
  }),
  createProblem({
    id: 'lc_150_powx_n',
    title: 'Pow(x, n)',
    topic_id: 'dsa_topic_math',
    difficulty: 'MEDIUM',
    editorial_url: 'https://leetcode.com/problems/powx-n/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: `Implement pow(x, n), which calculates x raised to the power n (i.e., x^n).`,
    constraints: ['-100.0 < x < 100.0', '-2^31 <= n <= 2^31 - 1', 'n is an integer', 'Either x is not zero or n > 0', '-10^4 <= x^n <= 10^4'],
    examples: [
      { input: 'x = 2.00000, n = 10', output: '1024.00000' },
      { input: 'x = 2.10000, n = 3', output: '9.26100' },
      { input: 'x = 2.00000, n = -2', output: '0.25000', explanation: '2^-2 = 1/2^2 = 1/4 = 0.25' }
    ],
    hints: [
      'Binary exponentiation: x^n = (x^2)^(n/2) if n is even, x * x^(n-1) if odd.',
      'Handle negative exponents: x^(-n) = (1/x)^n.'
    ],
    optimal_complexity: { time: 'O(log n)', space: 'O(1)' }
  }),
  createProblem({
    id: 'lc_150_max_points_on_a_line',
    title: 'Max Points on a Line',
    topic_id: 'dsa_topic_math',
    difficulty: 'HARD',
    editorial_url: 'https://leetcode.com/problems/max-points-on-a-line/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: `Given an array of points where points[i] = [xi, yi] represents a point on the X-Y plane, return the maximum number of points that lie on the same straight line.`,
    constraints: ['1 <= points.length <= 300', 'points[i].length == 2', '-10^4 <= xi, yi <= 10^4', 'All the points are unique'],
    examples: [
      { input: 'points = [[1,1],[2,2],[3,3]]', output: '3' },
      { input: 'points = [[1,1],[3,2],[5,3],[4,1],[2,3],[1,4]]', output: '4' }
    ],
    hints: [
      'For each point i, calculate the slope to all other points j (j > i).',
      'Store slopes in a hash map: slope = (y2 - y1) / (x2 - x1). Use reduced fractions or math.atan2 to avoid floating point inaccuracies.'
    ],
    optimal_complexity: { time: 'O(n^2)', space: 'O(n)' }
  }),

  // ==========================================
  // 1D DP (5 questions)
  // ==========================================
  createProblem({
    id: 'lc_150_climbing_stairs',
    title: 'Climbing Stairs',
    topic_id: 'dsa_topic_1d_dp',
    difficulty: 'EASY',
    editorial_url: 'https://leetcode.com/problems/climbing-stairs/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: `You are climbing a staircase. It takes n steps to reach the top.

Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?`,
    constraints: ['1 <= n <= 45'],
    examples: [
      { input: 'n = 2', output: '2', explanation: 'There are two ways to climb to the top: 1. 1 step + 1 step, 2. 2 steps' },
      { input: 'n = 3', output: '3', explanation: 'There are three ways: 1. 1+1+1, 2. 1+2, 3. 2+1' }
    ],
    hints: [
      'To reach step n, you must arrive from either step n - 1 or step n - 2.',
      'dp[n] = dp[n - 1] + dp[n - 2], which is the Fibonacci sequence.'
    ],
    optimal_complexity: { time: 'O(n)', space: 'O(1)' }
  }),
  createProblem({
    id: 'lc_150_house_robber',
    title: 'House Robber',
    topic_id: 'dsa_topic_1d_dp',
    difficulty: 'MEDIUM',
    editorial_url: 'https://leetcode.com/problems/house-robber/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: `You are a professional robber planning to rob houses along a street. Each house has a certain amount of money stashed, the only constraint stopping you from robbing each of them is that adjacent houses have security systems connected and it will automatically contact the police if two adjacent houses were broken into on the same night.

Given an integer array nums representing the amount of money of each house, return the maximum amount of money you can rob tonight without alerting the police.`,
    constraints: ['1 <= nums.length <= 100', '0 <= nums[i] <= 400'],
    examples: [
      { input: 'nums = [1,2,3,1]', output: '4', explanation: 'Rob house 1 (money = 1) and then rob house 3 (money = 3). Total amount = 1 + 3 = 4.' },
      { input: 'nums = [2,7,9,3,1]', output: '12', explanation: 'Rob house 1 (2), house 3 (9), house 5 (1). Total = 12.' }
    ],
    hints: [
      'At house i, you can either rob it (nums[i] + rob(i - 2)) or skip it (rob(i - 1)).',
      'dp[i] = max(dp[i - 1], dp[i - 2] + nums[i]).'
    ],
    optimal_complexity: { time: 'O(n)', space: 'O(1)' }
  }),
  createProblem({
    id: 'lc_150_word_break',
    title: 'Word Break',
    topic_id: 'dsa_topic_1d_dp',
    difficulty: 'MEDIUM',
    editorial_url: 'https://leetcode.com/problems/word-break/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: `Given a string s and a dictionary of strings wordDict, return true if s can be segmented into a space-separated sequence of one or more dictionary words.

Note that the same word in the dictionary may be reused multiple times in the segmentation.`,
    constraints: ['1 <= s.length <= 300', '1 <= wordDict.length <= 1000', '1 <= wordDict[i].length <= 20', 's and wordDict[i] consist of lowercase English letters', 'All strings of wordDict are unique'],
    examples: [
      { input: 's = "leetcode", wordDict = ["leet","code"]', output: 'true', explanation: 'Return true because "leetcode" can be segmented as "leet code".' },
      { input: 's = "applepenapple", wordDict = ["apple","pen"]', output: 'true', explanation: 'Note that words can be reused.' },
      { input: 's = "catsandog", wordDict = ["cats","dog","sand","and","cat"]', output: 'false' }
    ],
    hints: [
      'Let dp[i] be true if s[0:i] can be segmented.',
      'dp[i] is true if there exists some j < i such that dp[j] is true and s[j:i] is in wordDict.'
    ],
    optimal_complexity: { time: 'O(n^2 * k)', space: 'O(n)' }
  }),
  createProblem({
    id: 'lc_150_coin_change',
    title: 'Coin Change',
    topic_id: 'dsa_topic_1d_dp',
    difficulty: 'MEDIUM',
    editorial_url: 'https://leetcode.com/problems/coin-change/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: `You are given an integer array coins representing coins of different denominations and an integer amount representing a total amount of money.

Return the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return -1.

You may assume that you have an infinite number of each kind of coin.`,
    constraints: ['1 <= coins.length <= 12', '1 <= coins[i] <= 2^31 - 1', '0 <= amount <= 10^4'],
    examples: [
      { input: 'coins = [1,2,5], amount = 11', output: '3', explanation: '11 = 5 + 5 + 1' },
      { input: 'coins = [2], amount = 3', output: '-1' },
      { input: 'coins = [1], amount = 0', output: '0' }
    ],
    hints: [
      'Let dp[i] be the minimum coins to make amount i.',
      'dp[i] = min(dp[i - c] + 1) for all c in coins where i - c >= 0.'
    ],
    optimal_complexity: { time: 'O(amount * coins.length)', space: 'O(amount)' }
  }),
  createProblem({
    id: 'lc_150_longest_increasing_subsequence',
    title: 'Longest Increasing Subsequence',
    topic_id: 'dsa_topic_1d_dp',
    difficulty: 'MEDIUM',
    editorial_url: 'https://leetcode.com/problems/longest-increasing-subsequence/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: `Given an integer array nums, return the length of the longest strictly increasing subsequence.`,
    constraints: ['1 <= nums.length <= 2500', '-10^4 <= nums[i] <= 10^4'],
    examples: [
      { input: 'nums = [10,9,2,5,3,7,101,18]', output: '4', explanation: 'The longest increasing subsequence is [2,3,7,101], therefore the length is 4.' },
      { input: 'nums = [0,1,0,3,2,3]', output: '4' },
      { input: 'nums = [7,7,7,7,7,7,7]', output: '1' }
    ],
    hints: [
      'Classic dynamic programming: dp[i] = max(dp[j] + 1) for all j < i with nums[j] < nums[i] gives O(n^2).',
      'For O(n log n), maintain tails array with binary search (bisect_left).'
    ],
    optimal_complexity: { time: 'O(n log n)', space: 'O(n)' }
  }),

  // ==========================================
  // Multidimensional DP (9 questions)
  // ==========================================
  createProblem({
    id: 'lc_150_triangle',
    title: 'Triangle',
    topic_id: 'dsa_topic_multidim_dp',
    difficulty: 'MEDIUM',
    editorial_url: 'https://leetcode.com/problems/triangle/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: `Given a triangle array, return the minimum path sum from top to bottom.

For each step, you may move to an adjacent number of the row below. More formally, if you are on index i on the current row, you may move to either index i or index i + 1 on the next row.`,
    constraints: ['1 <= triangle.length <= 200', 'triangle[0].length == 1', 'triangle[i].length == triangle[i - 1].length + 1', '-10^4 <= triangle[i][j] <= 10^4'],
    examples: [
      { input: 'triangle = [[2],[3,4],[6,5,7],[4,1,8,3]]', output: '11', explanation: 'The path 2 -> 3 -> 5 -> 1 has the minimum sum 11.' },
      { input: 'triangle = [[-10]]', output: '-10' }
    ],
    hints: [
      'Bottom-up DP is very elegant: start from the second-to-last row up to the top.',
      'triangle[r][c] += min(triangle[r+1][c], triangle[r+1][c+1]).'
    ],
    optimal_complexity: { time: 'O(n^2)', space: 'O(1) in-place or O(n)' }
  }),
  createProblem({
    id: 'lc_150_minimum_path_sum',
    title: 'Minimum Path Sum',
    topic_id: 'dsa_topic_multidim_dp',
    difficulty: 'MEDIUM',
    editorial_url: 'https://leetcode.com/problems/minimum-path-sum/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: `Given a m x n grid filled with non-negative numbers, find a path from top left to bottom right, which minimizes the sum of all numbers along its path.

Note: You can only move either down or right at any point in time.`,
    constraints: ['m == grid.length', 'n == grid[i].length', '1 <= m, n <= 200', '0 <= grid[i][j] <= 200'],
    examples: [
      { input: 'grid = [[1,3,1],[1,5,1],[4,2,1]]', output: '7', explanation: 'Because the path 1 -> 3 -> 1 -> 1 -> 1 minimizes the sum.' },
      { input: 'grid = [[1,2,3],[4,5,6]]', output: '12' }
    ],
    hints: [
      'grid[r][c] += min(grid[r-1][c], grid[r][c-1]).',
      'Initialize first row and first column accumulatively.'
    ],
    optimal_complexity: { time: 'O(m * n)', space: 'O(1) in-place' }
  }),
  createProblem({
    id: 'lc_150_unique_paths_ii',
    title: 'Unique Paths II',
    topic_id: 'dsa_topic_multidim_dp',
    difficulty: 'MEDIUM',
    editorial_url: 'https://leetcode.com/problems/unique-paths-ii/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: `You are given an m x n integer array grid. There is a robot initially located at the top-left corner (i.e., grid[0][0]). The robot tries to move to the bottom-right corner (i.e., grid[m - 1][n - 1]). The robot can only move either down or right at any point in time.

An obstacle and space are marked as 1 or 0 respectively in grid. A path that the robot takes cannot include any square that is an obstacle.

Return the number of possible unique paths that the robot can take to reach the bottom-right corner.`,
    constraints: ['m == obstacleGrid.length', 'n == obstacleGrid[i].length', '1 <= m, n <= 100', 'obstacleGrid[i][j] is 0 or 1'],
    examples: [
      { input: 'obstacleGrid = [[0,0,0],[0,1,0],[0,0,0]]', output: '2', explanation: 'There is one obstacle in the middle of the 3x3 grid above.' },
      { input: 'obstacleGrid = [[0,1],[0,0]]', output: '1' }
    ],
    hints: [
      'If grid[r][c] == 1, dp[r][c] = 0 (cannot traverse obstacle).',
      'Otherwise, dp[r][c] = dp[r-1][c] + dp[r][c-1].'
    ],
    optimal_complexity: { time: 'O(m * n)', space: 'O(n)' }
  }),
  createProblem({
    id: 'lc_150_longest_palindromic_substring',
    title: 'Longest Palindromic Substring',
    topic_id: 'dsa_topic_multidim_dp',
    difficulty: 'MEDIUM',
    editorial_url: 'https://leetcode.com/problems/longest-palindromic-substring/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: `Given a string s, return the longest palindromic substring in s.`,
    constraints: ['1 <= s.length <= 1000', 's consist of only digits and English letters'],
    examples: [
      { input: 's = "babad"', output: '"bab"', explanation: '"aba" is also a valid answer.' },
      { input: 's = "cbbd"', output: '"bb"' }
    ],
    hints: [
      'Expand around centers: each index i is a center for odd-length palindromes, (i, i+1) for even-length palindromes.',
      'There are 2n - 1 such centers.'
    ],
    optimal_complexity: { time: 'O(n^2)', space: 'O(1)' }
  }),
  createProblem({
    id: 'lc_150_interleaving_string',
    title: 'Interleaving String',
    topic_id: 'dsa_topic_multidim_dp',
    difficulty: 'MEDIUM',
    editorial_url: 'https://leetcode.com/problems/interleaving-string/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: `Given strings s1, s2, and s3, find whether s3 is formed by an interleaving of s1 and s2.

An interleaving of two strings s and t is a configuration where s and t are divided into n and m substrings respectively, such that:
- s = s1 + s2 + ... + sn
- t = t1 + t2 + ... + tm
- |n - m| <= 1
- The interleaving is s1 + t1 + s2 + t2 + ... or t1 + s1 + t2 + s2 + ...`,
    constraints: ['0 <= s1.length, s2.length <= 100', '0 <= s3.length <= 200', 's1, s2, and s3 consist of lowercase English letters'],
    examples: [
      { input: 's1 = "aabcc", s2 = "dbbca", s3 = "aadbbcbcac"', output: 'true' },
      { input: 's1 = "aabcc", s2 = "dbbca", s3 = "aadbbbaccc"', output: 'false' },
      { input: 's1 = "", s2 = "", s3 = ""', output: 'true' }
    ],
    hints: [
      'First check if len(s1) + len(s2) == len(s3).',
      'Let dp[i][j] be true if s1[0:i] and s2[0:j] interleave into s3[0:i+j].'
    ],
    optimal_complexity: { time: 'O(len(s1) * len(s2))', space: 'O(len(s2))' }
  }),
  createProblem({
    id: 'lc_150_edit_distance',
    title: 'Edit Distance',
    topic_id: 'dsa_topic_multidim_dp',
    difficulty: 'MEDIUM',
    editorial_url: 'https://leetcode.com/problems/edit-distance/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: `Given two strings word1 and word2, return the minimum number of operations required to convert word1 to word2.

You have the following three operations permitted on a word:
- Insert a character
- Delete a character
- Replace a character`,
    constraints: ['0 <= word1.length, word2.length <= 500', 'word1 and word2 consist of lowercase English letters'],
    examples: [
      { input: 'word1 = "horse", word2 = "ros"', output: '3', explanation: 'horse -> rorse (replace "h" with "r") -> rose (remove "r") -> ros (remove "e")' },
      { input: 'word1 = "intention", word2 = "execution"', output: '5' }
    ],
    hints: [
      'Let dp[i][j] be the edit distance between word1[0..i] and word2[0..j].',
      'If word1[i-1] == word2[j-1], dp[i][j] = dp[i-1][j-1].',
      'Otherwise, dp[i][j] = 1 + min(dp[i-1][j] (delete), dp[i][j-1] (insert), dp[i-1][j-1] (replace)).'
    ],
    optimal_complexity: { time: 'O(m * n)', space: 'O(m * n)' }
  }),
  createProblem({
    id: 'lc_150_best_time_to_buy_and_sell_stock_iii',
    title: 'Best Time to Buy and Sell Stock III',
    topic_id: 'dsa_topic_multidim_dp',
    difficulty: 'HARD',
    editorial_url: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iii/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: `You are given an array prices where prices[i] is the price of a given stock on the ith day.

Find the maximum profit you can achieve. You may complete at most two transactions.

Note: You may not engage in multiple transactions simultaneously (i.e., you must sell the stock before you buy again).`,
    constraints: ['1 <= prices.length <= 10^5', '0 <= prices[i] <= 10^5'],
    examples: [
      { input: 'prices = [3,3,5,0,0,3,1,4]', output: '6', explanation: 'Buy on day 4 (price = 0) and sell on day 6 (price = 3), profit = 3. Then buy on day 7 (price = 1) and sell on day 8 (price = 4), profit = 3. Total = 6.' },
      { input: 'prices = [1,2,3,4,5]', output: '4' },
      { input: 'prices = [7,6,4,3,1]', output: '0' }
    ],
    hints: [
      'Maintain 4 states: buy1, sell1, buy2, sell2.',
      'buy1 = max(buy1, -price), sell1 = max(sell1, buy1 + price), buy2 = max(buy2, sell1 - price), sell2 = max(sell2, buy2 + price).'
    ],
    optimal_complexity: { time: 'O(n)', space: 'O(1)' }
  }),
  createProblem({
    id: 'lc_150_best_time_to_buy_and_sell_stock_iv',
    title: 'Best Time to Buy and Sell Stock IV',
    topic_id: 'dsa_topic_multidim_dp',
    difficulty: 'HARD',
    editorial_url: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iv/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: `You are given an integer array prices where prices[i] is the price of a given stock on the ith day, and an integer k.

Find the maximum profit you can achieve. You may complete at most k transactions: i.e. you may buy at most k times and sell at most k times.

Note: You may not engage in multiple transactions simultaneously (i.e., you must sell the stock before you buy again).`,
    constraints: ['1 <= k <= 100', '1 <= prices.length <= 1000', '0 <= prices[i] <= 1000'],
    examples: [
      { input: 'k = 2, prices = [2,4,1]', output: '2', explanation: 'Buy on day 1 (price = 2) and sell on day 2 (price = 4), profit = 2.' },
      { input: 'k = 2, prices = [3,2,6,5,0,3]', output: '7', explanation: 'Buy on day 2 (price = 2) and sell on day 3 (price = 6), profit = 4. Buy on day 5 (price = 0) and sell on day 6 (price = 3), profit = 3. Total = 7.' }
    ],
    hints: [
      'Generalize the DP from Stock III: maintain buy[j] and sell[j] for j from 1 to k.',
      'If k >= n // 2, it is equivalent to unlimited transactions (Stock II).'
    ],
    optimal_complexity: { time: 'O(k * n)', space: 'O(k)' }
  }),
  createProblem({
    id: 'lc_150_maximal_square',
    title: 'Maximal Square',
    topic_id: 'dsa_topic_multidim_dp',
    difficulty: 'MEDIUM',
    editorial_url: 'https://leetcode.com/problems/maximal-square/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: `Given an m x n binary matrix filled with 0's and 1's, find the largest square containing only 1's and return its area.`,
    constraints: ['m == matrix.length', 'n == matrix[i].length', '1 <= m, n <= 300', 'matrix[i][j] is "0" or "1"'],
    examples: [
      { input: 'matrix = [["1","0","1","0","0"],["1","0","1","1","1"],["1","1","1","1","1"],["1","0","0","1","0"]]', output: '4' },
      { input: 'matrix = [["0","1"],["1","0"]]', output: '1' },
      { input: 'matrix = [["0"]]', output: '0' }
    ],
    hints: [
      'Let dp[i][j] represent the side length of the maximum square whose bottom-right corner is at (i, j).',
      'If matrix[i][j] == "1", dp[i][j] = min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]) + 1.',
      'The area is max_side * max_side.'
    ],
    optimal_complexity: { time: 'O(m * n)', space: 'O(n)' }
  })
];
