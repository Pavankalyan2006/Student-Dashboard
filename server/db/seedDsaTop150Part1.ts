import { DSAProblem } from '../models/dsaTypes';
import { createProblem } from './seedDsaTop150Helper';

export const topInterview150Part1: DSAProblem[] = [
  // ================= ARRAY / STRING (24 Problems) =================
  createProblem({
    id: 'dsa_top150_merge_sorted_array',
    title: 'Merge Sorted Array',
    topic_id: 'dsa_topic_arrays',
    difficulty: 'EASY',
    editorial_url: 'https://leetcode.com/problems/merge-sorted-array/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'You are given two integer arrays nums1 and nums2, sorted in non-decreasing order, and two integers m and n, representing the number of elements in nums1 and nums2 respectively.\n\nMerge nums1 and nums2 into a single array sorted in non-decreasing order. The final sorted array should not be returned by the function, but instead be stored inside the array nums1. To accommodate this, nums1 has a length of m + n, where the first m elements denote the elements that should be merged, and the last n elements are set to 0 and should be ignored.',
    examples: [
      { input: 'nums1 = [1,2,3,0,0,0], m = 3, nums2 = [2,5,6], n = 3', output: '[1,2,2,3,5,6]', explanation: 'The arrays we are merging are [1,2,3] and [2,5,6]. The result of the merge is [1,2,2,3,5,6].' },
      { input: 'nums1 = [1], m = 1, nums2 = [], n = 0', output: '[1]' }
    ],
    hints: [
      'You can easily solve this in O((m+n) log(m+n)) by appending and sorting, but can you do it in O(m+n)?',
      'Notice that nums1 has empty space at the back. Can you place the largest elements from the back towards the front?',
      'Use three pointers: p1 at m-1, p2 at n-1, and p at m+n-1.'
    ],
    optimal_complexity: { time: 'O(m + n)', space: 'O(1)' }
  }),

  createProblem({
    id: 'dsa_top150_remove_element',
    title: 'Remove Element',
    topic_id: 'dsa_topic_arrays',
    difficulty: 'EASY',
    editorial_url: 'https://leetcode.com/problems/remove-element/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'Given an integer array nums and an integer val, remove all occurrences of val in nums in-place. The order of the elements may be changed. Then return the number of elements in nums which are not equal to val.\n\nChange the array nums such that the first k elements of nums contain the elements which are not equal to val. The remaining elements of nums are not important as well as the size of nums. Return k.',
    examples: [
      { input: 'nums = [3,2,2,3], val = 3', output: '2, nums = [2,2,_,_]', explanation: 'Your function should return k = 2, with the first two elements of nums being 2.' },
      { input: 'nums = [0,1,2,2,3,0,4,2], val = 2', output: '5, nums = [0,1,4,0,3,_,_,_]' }
    ],
    hints: [
      'The problem asks to do this in-place and with O(1) extra memory.',
      'Use a write pointer `k` initialized to 0.',
      'Iterate through the array. Whenever nums[i] != val, assign nums[k++] = nums[i].'
    ],
    optimal_complexity: { time: 'O(N)', space: 'O(1)' }
  }),

  createProblem({
    id: 'dsa_top150_remove_duplicates_from_sorted_array',
    title: 'Remove Duplicates from Sorted Array',
    topic_id: 'dsa_topic_arrays',
    difficulty: 'EASY',
    editorial_url: 'https://leetcode.com/problems/remove-duplicates-from-sorted-array/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'Given an integer array nums sorted in non-decreasing order, remove the duplicates in-place such that each unique element appears only once. The relative order of the elements should be kept the same. Then return the number of unique elements in nums.',
    examples: [
      { input: 'nums = [1,1,2]', output: '2, nums = [1,2,_]', explanation: 'Your function should return k = 2, with the first two elements of nums being 1 and 2 respectively.' },
      { input: 'nums = [0,0,1,1,1,2,2,3,3,4]', output: '5, nums = [0,1,2,3,4,_,_,_,_,_]' }
    ],
    hints: [
      'Since the array is sorted, duplicates are adjacent to each other.',
      'Maintain an index for the position of the next unique element.',
      'When nums[i] != nums[k-1], copy nums[i] to nums[k].'
    ],
    optimal_complexity: { time: 'O(N)', space: 'O(1)' }
  }),

  createProblem({
    id: 'dsa_top150_remove_duplicates_from_sorted_array_ii',
    title: 'Remove Duplicates from Sorted Array II',
    topic_id: 'dsa_topic_arrays',
    difficulty: 'MEDIUM',
    editorial_url: 'https://leetcode.com/problems/remove-duplicates-from-sorted-array-ii/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'Given an integer array nums sorted in non-decreasing order, remove some duplicates in-place such that each unique element appears at most twice. The relative order of the elements should be kept the same.',
    examples: [
      { input: 'nums = [1,1,1,2,2,3]', output: '5, nums = [1,1,2,2,3,_]', explanation: 'Your function should return k = 5, with the first five elements of nums being 1, 1, 2, 2 and 3.' },
      { input: 'nums = [0,0,1,1,1,1,2,3,3]', output: '7, nums = [0,0,1,1,2,3,3,_,_]' }
    ],
    hints: [
      'Each element can appear at most twice.',
      'Compare nums[i] with nums[k - 2].',
      'If nums[i] > nums[k - 2], write nums[i] to nums[k] and increment k.'
    ],
    optimal_complexity: { time: 'O(N)', space: 'O(1)' }
  }),

  createProblem({
    id: 'dsa_top150_majority_element',
    title: 'Majority Element',
    topic_id: 'dsa_topic_arrays',
    difficulty: 'EASY',
    editorial_url: 'https://leetcode.com/problems/majority-element/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'Given an array nums of size n, return the majority element. The majority element is the element that appears more than ⌊n / 2⌋ times. You may assume that the majority element always exists in the array.',
    examples: [
      { input: 'nums = [3,2,3]', output: '3' },
      { input: 'nums = [2,2,1,1,1,2,2]', output: '2' }
    ],
    hints: [
      'Can you solve it in linear time and O(1) space?',
      'Boyer-Moore Voting Algorithm maintains a candidate and a count.',
      'Whenever count reaches 0, choose current element as the candidate.'
    ],
    optimal_complexity: { time: 'O(N)', space: 'O(1)' }
  }),

  createProblem({
    id: 'dsa_top150_rotate_array',
    title: 'Rotate Array',
    topic_id: 'dsa_topic_arrays',
    difficulty: 'MEDIUM',
    editorial_url: 'https://leetcode.com/problems/rotate-array/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'Given an integer array nums, rotate the array to the right by k steps, where k is non-negative.',
    examples: [
      { input: 'nums = [1,2,3,4,5,6,7], k = 3', output: '[5,6,7,1,2,3,4]', explanation: 'rotate 1: [7,1,2,3,4,5,6], rotate 2: [6,7,1,2,3,4,5], rotate 3: [5,6,7,1,2,3,4]' },
      { input: 'nums = [-1,-100,3,99], k = 2', output: '[3,99,-1,-100]' }
    ],
    hints: [
      'k can be greater than the array length, so take k = k % n.',
      'Reverse the whole array, then reverse the first k elements, then reverse the remaining n-k elements.',
      'This requires zero extra space and 3 reverse passes.'
    ],
    optimal_complexity: { time: 'O(N)', space: 'O(1)' }
  }),

  createProblem({
    id: 'dsa_top150_best_time_to_buy_and_sell_stock',
    title: 'Best Time to Buy and Sell Stock',
    topic_id: 'dsa_topic_arrays',
    difficulty: 'EASY',
    editorial_url: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'You are given an array prices where prices[i] is the price of a given stock on the ith day. You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock. Return the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.',
    examples: [
      { input: 'prices = [7,1,5,3,6,4]', output: '5', explanation: 'Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5.' },
      { input: 'prices = [7,6,4,3,1]', output: '0', explanation: 'No transactions are done and max profit = 0.' }
    ],
    hints: [
      'Keep track of the minimum price observed so far.',
      'At each day, calculate profit if sold today (current price - min price).',
      'Update the maximum profit across all days.'
    ],
    optimal_complexity: { time: 'O(N)', space: 'O(1)' }
  }),

  createProblem({
    id: 'dsa_top150_best_time_to_buy_and_sell_stock_ii',
    title: 'Best Time to Buy and Sell Stock II',
    topic_id: 'dsa_topic_arrays',
    difficulty: 'MEDIUM',
    editorial_url: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock-ii/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'You are given an integer array prices where prices[i] is the price of a given stock on the ith day. On each day, you may decide to buy and/or sell the stock. You can only hold at most one share of the stock at any time. However, you can buy it then immediately sell it on the same day. Find and return the maximum profit you can achieve.',
    examples: [
      { input: 'prices = [7,1,5,3,6,4]', output: '7', explanation: 'Buy on day 2 (price = 1) and sell on day 3 (price = 5), profit = 4. Then buy on day 4 (price = 3) and sell on day 5 (price = 6), profit = 3. Total profit = 4 + 3 = 7.' },
      { input: 'prices = [1,2,3,4,5]', output: '4' }
    ],
    hints: [
      'Greedy approach: anytime prices[i] > prices[i-1], take the difference.',
      'Summing up all positive slopes captures every upward movement.',
      'No complex state tracking required.'
    ],
    optimal_complexity: { time: 'O(N)', space: 'O(1)' }
  }),

  createProblem({
    id: 'dsa_top150_jump_game',
    title: 'Jump Game',
    topic_id: 'dsa_topic_arrays',
    difficulty: 'MEDIUM',
    editorial_url: 'https://leetcode.com/problems/jump-game/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'You are given an integer array nums. You are initially positioned at the array\'s first index, and each element in the array represents your maximum jump length at that position. Return true if you can reach the last index, or false otherwise.',
    examples: [
      { input: 'nums = [2,3,1,1,4]', output: 'true', explanation: 'Jump 1 step from index 0 to 1, then 3 steps to the last index.' },
      { input: 'nums = [3,2,1,0,4]', output: 'false', explanation: 'You will always arrive at index 3 no matter what. Its maximum jump length is 0, which makes it impossible to reach the last index.' }
    ],
    hints: [
      'Maintain the furthest reachable index `maxReach`.',
      'For index `i`, if `i > maxReach`, you cannot reach this index, return false.',
      'Otherwise, update `maxReach = max(maxReach, i + nums[i])`.'
    ],
    optimal_complexity: { time: 'O(N)', space: 'O(1)' }
  }),

  createProblem({
    id: 'dsa_top150_jump_game_ii',
    title: 'Jump Game II',
    topic_id: 'dsa_topic_arrays',
    difficulty: 'MEDIUM',
    editorial_url: 'https://leetcode.com/problems/jump-game-ii/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'You are given a 0-indexed array of integers nums of length n. You are initially positioned at nums[0]. Each element nums[i] represents the maximum length of a forward jump from index i. Return the minimum number of jumps to reach nums[n - 1].',
    examples: [
      { input: 'nums = [2,3,1,1,4]', output: '2', explanation: 'Jump 1 step from index 0 to 1, then 3 steps to the last index.' },
      { input: 'nums = [2,3,0,1,4]', output: '2' }
    ],
    hints: [
      'Use a BFS-like greedy approach.',
      'Track current jump window boundaries: [curStart, curEnd].',
      'When reaching curEnd, increment jumps and set curEnd to maxReach.'
    ],
    optimal_complexity: { time: 'O(N)', space: 'O(1)' }
  }),

  createProblem({
    id: 'dsa_top150_h_index',
    title: 'H-Index',
    topic_id: 'dsa_topic_arrays',
    difficulty: 'MEDIUM',
    editorial_url: 'https://leetcode.com/problems/h-index/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'Given an array of integers citations where citations[i] is the number of citations a researcher received for their ith paper, return the researcher\'s h-index. A scientist has an index h if h of their n papers have at least h citations each, and the other n − h papers have no more than h citations each.',
    examples: [
      { input: 'citations = [3,0,6,1,5]', output: '3', explanation: '[3,0,6,1,5] means the researcher has 5 papers with 3, 0, 6, 1, 5 citations. Since the researcher has 3 papers with at least 3 citations, their h-index is 3.' },
      { input: 'citations = [1,3,1]', output: '1' }
    ],
    hints: [
      'Sort citations in descending order or use counting sort.',
      'Find the largest i where citations[i-1] >= i.',
      'Counting sort achieves O(N) time and O(N) space.'
    ],
    optimal_complexity: { time: 'O(N)', space: 'O(N)' }
  }),

  createProblem({
    id: 'dsa_top150_insert_delete_getrandom_o1',
    title: 'Insert Delete GetRandom O(1)',
    topic_id: 'dsa_topic_arrays',
    difficulty: 'MEDIUM',
    editorial_url: 'https://leetcode.com/problems/insert-delete-getrandom-o1/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'Implement the RandomizedSet class:\n- bool insert(int val) Inserts an item val into the set if not present. Returns true if the item was not present, false otherwise.\n- bool remove(int val) Removes an item val from the set if present. Returns true if the item was present, false otherwise.\n- int getRandom() Returns a random element from the current set of elements (it\'s guaranteed that at least one element exists when this method is called). Each element must have the same probability of being returned.\n\nYou must implement the functions of the class such that each function works in average O(1) time complexity.',
    examples: [
      { input: '["RandomizedSet", "insert", "remove", "insert", "getRandom", "remove", "insert", "getRandom"]\n[[], [1], [2], [2], [], [1], [2], []]', output: '[null, true, false, true, 2, true, false, 2]' }
    ],
    hints: [
      'Hash table gives O(1) insert and delete, but how to get a uniform random element in O(1)?',
      'Dynamic array gives O(1) random access by index.',
      'Combine an array and a hash map storing value -> index. To remove in O(1), swap target with the last element in array.'
    ],
    optimal_complexity: { time: 'O(1) avg', space: 'O(N)' }
  }),

  createProblem({
    id: 'dsa_top150_product_of_array_except_self',
    title: 'Product of Array Except Self',
    topic_id: 'dsa_topic_arrays',
    difficulty: 'MEDIUM',
    editorial_url: 'https://leetcode.com/problems/product-of-array-except-self/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'Given an integer array nums, return an array answer such that answer[i] is equal to the product of all the elements of nums except nums[i]. The product of any prefix or suffix of nums is guaranteed to fit in a 32-bit integer. You must write an algorithm that runs in O(n) time and without using the division operation.',
    examples: [
      { input: 'nums = [1,2,3,4]', output: '[24,12,8,6]' },
      { input: 'nums = [-1,1,0,-3,3]', output: '[0,0,9,0,0]' }
    ],
    hints: [
      'Can you compute prefix products and suffix products separately?',
      'Store prefix products directly in output array.',
      'Make a second pass from right to left maintaining a running suffix product accumulator.'
    ],
    optimal_complexity: { time: 'O(N)', space: 'O(1) aux' }
  }),

  createProblem({
    id: 'dsa_top150_gas_station',
    title: 'Gas Station',
    topic_id: 'dsa_topic_arrays',
    difficulty: 'MEDIUM',
    editorial_url: 'https://leetcode.com/problems/gas-station/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'There are n gas stations along a circular route, where the amount of gas at the ith station is gas[i]. You have a car with an unlimited gas tank and it costs cost[i] of gas to travel from the ith station to its next (i + 1)th station. You begin the journey with an empty tank at one of the gas stations. Return the starting gas station\'s index if you can travel around the circuit once in the clockwise direction, otherwise return -1.',
    examples: [
      { input: 'gas = [1,2,3,4,5], cost = [3,4,5,1,2]', output: '3', explanation: 'Start at station 3 (index 3). Fill with 4 gas. Your tank = 4. Travel to station 4. Cost is 1. Tank = 4 - 1 + 5 = 8.' }
    ],
    hints: [
      'If sum(gas) < sum(cost), it is impossible to complete the circuit.',
      'If you start at A and fail at B, no station between A and B can reach B either.',
      'Reset start station to B+1 and reset current tank.'
    ],
    optimal_complexity: { time: 'O(N)', space: 'O(1)' }
  }),

  createProblem({
    id: 'dsa_top150_candy',
    title: 'Candy',
    topic_id: 'dsa_topic_arrays',
    difficulty: 'HARD',
    editorial_url: 'https://leetcode.com/problems/candy/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'There are n children standing in a line. Each child is assigned a rating value given in the integer array ratings. You are giving candies to these children subjected to the following requirements:\n- Each child must have at least one candy.\n- Children with a higher rating get more candies than their neighbors.\nReturn the minimum number of candies you need to have to distribute the candies to the children.',
    examples: [
      { input: 'ratings = [1,0,2]', output: '5', explanation: 'You can allocate to the first, second and third child with 2, 1, 2 candies respectively.' },
      { input: 'ratings = [1,2,2]', output: '4' }
    ],
    hints: [
      'Satisfy the left neighbor condition with a left-to-right pass.',
      'Satisfy the right neighbor condition with a right-to-left pass.',
      'Each child gets max(candies_from_left, candies_from_right).'
    ],
    optimal_complexity: { time: 'O(N)', space: 'O(N)' }
  }),

  createProblem({
    id: 'dsa_top150_trapping_rain_water',
    title: 'Trapping Rain Water',
    topic_id: 'dsa_topic_arrays',
    difficulty: 'HARD',
    editorial_url: 'https://leetcode.com/problems/trapping-rain-water/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.',
    examples: [
      { input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]', output: '6', explanation: 'The elevation map traps 6 units of rain water.' },
      { input: 'height = [4,2,0,3,2,5]', output: '9' }
    ],
    hints: [
      'Water trapped above index i is min(max_left, max_right) - height[i].',
      'Can you do this in O(1) space with two pointers?',
      'Move the pointer with smaller height towards the center.'
    ],
    optimal_complexity: { time: 'O(N)', space: 'O(1)' }
  }),

  createProblem({
    id: 'dsa_top150_roman_to_integer',
    title: 'Roman to Integer',
    topic_id: 'dsa_topic_arrays',
    difficulty: 'EASY',
    editorial_url: 'https://leetcode.com/problems/roman-to-integer/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'Roman numerals are represented by seven different symbols: I, V, X, L, C, D and M. Given a roman numeral, convert it to an integer.',
    examples: [
      { input: 's = "III"', output: '3' },
      { input: 's = "LVIII"', output: '58', explanation: 'L = 50, V= 5, III = 3.' },
      { input: 's = "MCMXCIV"', output: '1994', explanation: 'M = 1000, CM = 900, XC = 90 and IV = 4.' }
    ],
    hints: [
      'Iterate through the string from left to right.',
      'If current symbol value is less than next symbol value, subtract current symbol value.',
      'Otherwise, add current symbol value.'
    ],
    optimal_complexity: { time: 'O(N)', space: 'O(1)' }
  }),

  createProblem({
    id: 'dsa_top150_integer_to_roman',
    title: 'Integer to Roman',
    topic_id: 'dsa_topic_arrays',
    difficulty: 'MEDIUM',
    editorial_url: 'https://leetcode.com/problems/integer-to-roman/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'Seven different symbols represent Roman numerals. Given an integer, convert it to a Roman numeral.',
    examples: [
      { input: 'num = 3749', output: '"MMMDCCXLIX"', explanation: '3000 = MMM, 700 = DCC, 40 = XL, 9 = IX.' },
      { input: 'num = 58', output: '"LVIII"' }
    ],
    hints: [
      'Store values and corresponding roman symbols in descending order (including subtractive forms like 900 -> CM, 400 -> CD).',
      'Greedily divide and append symbols.'
    ],
    optimal_complexity: { time: 'O(1)', space: 'O(1)' }
  }),

  createProblem({
    id: 'dsa_top150_length_of_last_word',
    title: 'Length of Last Word',
    topic_id: 'dsa_topic_arrays',
    difficulty: 'EASY',
    editorial_url: 'https://leetcode.com/problems/length-of-last-word/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'Given a string s consisting of words and spaces, return the length of the last word in the string. A word is a maximal substring consisting of non-space characters only.',
    examples: [
      { input: 's = "Hello World"', output: '5' },
      { input: 's = "   fly me   to   the moon  "', output: '4' }
    ],
    hints: [
      'Trim trailing spaces first or traverse from end to beginning.',
      'Count characters until a space is encountered.'
    ],
    optimal_complexity: { time: 'O(N)', space: 'O(1)' }
  }),

  createProblem({
    id: 'dsa_top150_longest_common_prefix',
    title: 'Longest Common Prefix',
    topic_id: 'dsa_topic_arrays',
    difficulty: 'EASY',
    editorial_url: 'https://leetcode.com/problems/longest-common-prefix/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'Write a function to find the longest common prefix string amongst an array of strings. If there is no common prefix, return an empty string "".',
    examples: [
      { input: 'strs = ["flower","flow","flight"]', output: '"fl"' },
      { input: 'strs = ["dog","racecar","car"]', output: '""' }
    ],
    hints: [
      'Vertical scanning: compare characters column by column.',
      'Stop as soon as a mismatch occurs or string length is exceeded.'
    ],
    optimal_complexity: { time: 'O(S)', space: 'O(1)' }
  }),

  createProblem({
    id: 'dsa_top150_reverse_words_in_a_string',
    title: 'Reverse Words in a String',
    topic_id: 'dsa_topic_arrays',
    difficulty: 'MEDIUM',
    editorial_url: 'https://leetcode.com/problems/reverse-words-in-a-string/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'Given an input string s, reverse the order of the words. Return a string of the words in reverse order concatenated by a single space.',
    examples: [
      { input: 's = "the sky is blue"', output: '"blue is sky the"' },
      { input: 's = "  hello world  "', output: '"world hello"' }
    ],
    hints: [
      'Split by spaces and filter out empty strings, then reverse.',
      'In C++, reverse the whole string and then reverse each individual word.'
    ],
    optimal_complexity: { time: 'O(N)', space: 'O(N)' }
  }),

  createProblem({
    id: 'dsa_top150_zigzag_conversion',
    title: 'Zigzag Conversion',
    topic_id: 'dsa_topic_arrays',
    difficulty: 'MEDIUM',
    editorial_url: 'https://leetcode.com/problems/zigzag-conversion/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'The string "PAYPALISHIRING" is written in a zigzag pattern on a given number of rows. Read line by line: "PAHNAPLSIIGYIR".',
    examples: [
      { input: 's = "PAYPALISHIRING", numRows = 3', output: '"PAHNAPLSIIGYIR"' },
      { input: 's = "PAYPALISHIRING", numRows = 4', output: '"PINALSIGYAHRPI"' }
    ],
    hints: [
      'Simulate the movement using a direction flag (down vs up).',
      'Append characters to row buffers.',
      'Concatenate all row buffers at the end.'
    ],
    optimal_complexity: { time: 'O(N)', space: 'O(N)' }
  }),

  createProblem({
    id: 'dsa_top150_find_the_index_of_the_first_occurrence_in_a_string',
    title: 'Find the Index of the First Occurrence in a String',
    topic_id: 'dsa_topic_arrays',
    difficulty: 'EASY',
    editorial_url: 'https://leetcode.com/problems/find-the-index-of-the-first-occurrence-in-a-string/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'Given two strings needle and haystack, return the index of the first occurrence of needle in haystack, or -1 if needle is not part of haystack.',
    examples: [
      { input: 'haystack = "sadbutsad", needle = "sad"', output: '0' },
      { input: 'haystack = "leetcode", needle = "leeto"', output: '-1' }
    ],
    hints: [
      'Sliding window or KMP algorithm.',
      'Knuth-Morris-Pratt (KMP) achieves linear O(N) time using LPS array.'
    ],
    optimal_complexity: { time: 'O(N + M)', space: 'O(M)' }
  }),

  createProblem({
    id: 'dsa_top150_text_justification',
    title: 'Text Justification',
    topic_id: 'dsa_topic_arrays',
    difficulty: 'HARD',
    editorial_url: 'https://leetcode.com/problems/text-justification/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'Given an array of strings words and a width maxWidth, format the text such that each line has exactly maxWidth characters and is fully (left and right) justified.',
    examples: [
      { input: 'words = ["This", "is", "an", "example", "of", "text", "justification."], maxWidth = 16', output: '["This    is    an", "example  of text", "justification.  "]' }
    ],
    hints: [
      'Pack as many words as possible into each line.',
      'Distribute spaces evenly between words. Extra spaces go to left slots.',
      'Last line and single-word lines must be left-justified.'
    ],
    optimal_complexity: { time: 'O(N)', space: 'O(N)' }
  }),

  // ================= TWO POINTERS (5 Problems) =================
  createProblem({
    id: 'dsa_top150_valid_palindrome',
    title: 'Valid Palindrome',
    topic_id: 'dsa_topic_two_pointers',
    difficulty: 'EASY',
    editorial_url: 'https://leetcode.com/problems/valid-palindrome/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.',
    examples: [
      { input: 's = "A man, a plan, a canal: Panama"', output: 'true' },
      { input: 's = "race a car"', output: 'false' }
    ],
    hints: [
      'Two pointers: one at start, one at end.',
      'Skip non-alphanumeric characters.',
      'Compare lowercase characters.'
    ],
    optimal_complexity: { time: 'O(N)', space: 'O(1)' }
  }),

  createProblem({
    id: 'dsa_top150_is_subsequence',
    title: 'Is Subsequence',
    topic_id: 'dsa_topic_two_pointers',
    difficulty: 'EASY',
    editorial_url: 'https://leetcode.com/problems/is-subsequence/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'Given two strings s and t, return true if s is a subsequence of t, or false otherwise.',
    examples: [
      { input: 's = "abc", t = "ahbgdc"', output: 'true' },
      { input: 's = "axc", t = "ahbgdc"', output: 'false' }
    ],
    hints: [
      'Use two pointers: i for s, j for t.',
      'When s[i] == t[j], increment i. Always increment j.',
      'Return i == s.length.'
    ],
    optimal_complexity: { time: 'O(N)', space: 'O(1)' }
  }),

  createProblem({
    id: 'dsa_top150_two_sum_ii_input_array_is_sorted',
    title: 'Two Sum II - Input Array Is Sorted',
    topic_id: 'dsa_topic_two_pointers',
    difficulty: 'MEDIUM',
    editorial_url: 'https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'Given a 1-indexed array of integers numbers that is already sorted in non-decreasing order, find two numbers such that they add up to a specific target number.',
    examples: [
      { input: 'numbers = [2,7,11,15], target = 9', output: '[1,2]' },
      { input: 'numbers = [2,3,4], target = 6', output: '[1,3]' }
    ],
    hints: [
      'Pointers at low = 0 and high = n - 1.',
      'If sum < target, low++. If sum > target, high--.',
      'Return 1-indexed positions.'
    ],
    optimal_complexity: { time: 'O(N)', space: 'O(1)' }
  }),

  createProblem({
    id: 'dsa_top150_container_with_most_water',
    title: 'Container With Most Water',
    topic_id: 'dsa_topic_two_pointers',
    difficulty: 'MEDIUM',
    editorial_url: 'https://leetcode.com/problems/container-with-most-water/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'Find two lines that together with the x-axis form a container, such that the container contains the most water. Return the maximum amount of water a container can store.',
    examples: [
      { input: 'height = [1,8,6,2,5,4,8,3,7]', output: '49' },
      { input: 'height = [1,1]', output: '1' }
    ],
    hints: [
      'Area is limited by the shorter line: (right - left) * min(h[left], h[right]).',
      'Always move the pointer pointing to the shorter line inward.'
    ],
    optimal_complexity: { time: 'O(N)', space: 'O(1)' }
  }),

  createProblem({
    id: 'dsa_top150_3sum',
    title: '3Sum',
    topic_id: 'dsa_topic_two_pointers',
    difficulty: 'MEDIUM',
    editorial_url: 'https://leetcode.com/problems/3sum/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0. Notice that the solution set must not contain duplicate triplets.',
    examples: [
      { input: 'nums = [-1,0,1,2,-1,-4]', output: '[[-1,-1,2],[-1,0,1]]' },
      { input: 'nums = [0,1,1]', output: '[]' }
    ],
    hints: [
      'Sort the array first.',
      'Fix the first element nums[i], then use two pointers for the remaining pair.',
      'Skip duplicate elements to avoid duplicate triplets.'
    ],
    optimal_complexity: { time: 'O(N^2)', space: 'O(1) aux' }
  }),

  // ================= SLIDING WINDOW (4 Problems) =================
  createProblem({
    id: 'dsa_top150_minimum_size_subarray_sum',
    title: 'Minimum Size Subarray Sum',
    topic_id: 'dsa_topic_sliding_window',
    difficulty: 'MEDIUM',
    editorial_url: 'https://leetcode.com/problems/minimum-size-subarray-sum/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'Given an array of positive integers nums and a positive integer target, return the minimal length of a subarray whose sum is greater than or equal to target. If there is no such subarray, return 0 instead.',
    examples: [
      { input: 'target = 7, nums = [2,3,1,2,4,3]', output: '2', explanation: 'Subarray [4,3] has the minimal length.' },
      { input: 'target = 11, nums = [1,1,1,1,1,1,1,1]', output: '0' }
    ],
    hints: [
      'Sliding window with left and right pointers.',
      'Expand right until sum >= target, then contract left as much as possible.'
    ],
    optimal_complexity: { time: 'O(N)', space: 'O(1)' }
  }),

  createProblem({
    id: 'dsa_top150_longest_substring_without_repeating_characters',
    title: 'Longest Substring Without Repeating Characters',
    topic_id: 'dsa_topic_sliding_window',
    difficulty: 'MEDIUM',
    editorial_url: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'Given a string s, find the length of the longest substring without duplicate characters.',
    examples: [
      { input: 's = "abcabcbb"', output: '3', explanation: 'The answer is "abc", with length of 3.' },
      { input: 's = "bbbbb"', output: '1' }
    ],
    hints: [
      'Use a hash map to remember the last seen index of each character.',
      'When duplicate is seen, slide left pointer to max(left, last_seen[char] + 1).'
    ],
    optimal_complexity: { time: 'O(N)', space: 'O(min(N, M))' }
  }),

  createProblem({
    id: 'dsa_top150_substring_with_concatenation_of_all_words',
    title: 'Substring with Concatenation of All Words',
    topic_id: 'dsa_topic_sliding_window',
    difficulty: 'HARD',
    editorial_url: 'https://leetcode.com/problems/substring-with-concatenation-of-all-words/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'You are given a string s and an array of strings words. All strings of words are of the same length. Find all starting indices of substring(s) in s that is a concatenation of each word in words exactly once.',
    examples: [
      { input: 's = "barfoothefoobarman", words = ["foo","bar"]', output: '[0,9]' }
    ],
    hints: [
      'Word length is fixed (wordLen). Total length is words.length * wordLen.',
      'Slide window of wordLen across string starting from offsets 0 to wordLen - 1.'
    ],
    optimal_complexity: { time: 'O(N * wordLen)', space: 'O(M)' }
  }),

  createProblem({
    id: 'dsa_top150_minimum_window_substring',
    title: 'Minimum Window Substring',
    topic_id: 'dsa_topic_sliding_window',
    difficulty: 'HARD',
    editorial_url: 'https://leetcode.com/problems/minimum-window-substring/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'Given two strings s and t of lengths m and n respectively, return the minimum window substring of s such that every character in t (including duplicates) is included in the window. If there is no such substring, return the empty string "".',
    examples: [
      { input: 's = "ADOBECODEBANC", t = "ABC"', output: '"BANC"' }
    ],
    hints: [
      'Count frequencies of characters in t.',
      'Expand right pointer until all characters are satisfied.',
      'Shrink left pointer to find minimum valid window.'
    ],
    optimal_complexity: { time: 'O(M + N)', space: 'O(K)' }
  }),

  // ================= MATRIX (5 Problems) =================
  createProblem({
    id: 'dsa_top150_valid_sudoku',
    title: 'Valid Sudoku',
    topic_id: 'dsa_topic_matrix',
    difficulty: 'MEDIUM',
    editorial_url: 'https://leetcode.com/problems/valid-sudoku/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'Determine if a 9 x 9 Sudoku board is valid. Only the filled cells need to be validated according to the mention rules:\n1. Each row must contain digits 1-9 without repetition.\n2. Each column must contain digits 1-9 without repetition.\n3. Each of the nine 3 x 3 sub-boxes must contain digits 1-9 without repetition.',
    examples: [
      { input: 'board = [["5","3",".",...]]', output: 'true' }
    ],
    hints: [
      'Hash sets or bitmasks for each row, column, and 3x3 block.',
      'Block index can be computed as: (r / 3) * 3 + (c / 3).'
    ],
    optimal_complexity: { time: 'O(1)', space: 'O(1)' }
  }),

  createProblem({
    id: 'dsa_top150_spiral_matrix',
    title: 'Spiral Matrix',
    topic_id: 'dsa_topic_matrix',
    difficulty: 'MEDIUM',
    editorial_url: 'https://leetcode.com/problems/spiral-matrix/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'Given an m x n matrix, return all elements of the matrix in spiral order.',
    examples: [
      { input: 'matrix = [[1,2,3],[4,5,6],[7,8,9]]', output: '[1,2,3,6,9,8,7,4,5]' }
    ],
    hints: [
      'Maintain 4 boundaries: top, bottom, left, right.',
      'Traverse top row, right column, bottom row, left column, adjusting bounds.'
    ],
    optimal_complexity: { time: 'O(M * N)', space: 'O(1) aux' }
  }),

  createProblem({
    id: 'dsa_top150_rotate_image',
    title: 'Rotate Image',
    topic_id: 'dsa_topic_matrix',
    difficulty: 'MEDIUM',
    editorial_url: 'https://leetcode.com/problems/rotate-image/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'You are given an n x n 2D matrix representing an image, rotate the image by 90 degrees (clockwise) in-place.',
    examples: [
      { input: 'matrix = [[1,2,3],[4,5,6],[7,8,9]]', output: '[[7,4,1],[8,5,2],[9,6,3]]' }
    ],
    hints: [
      'Rotate 90 degrees clockwise = Transpose matrix + Reverse each row.',
      'Transpose: swap matrix[i][j] with matrix[j][i].'
    ],
    optimal_complexity: { time: 'O(N^2)', space: 'O(1)' }
  }),

  createProblem({
    id: 'dsa_top150_set_matrix_zeroes',
    title: 'Set Matrix Zeroes',
    topic_id: 'dsa_topic_matrix',
    difficulty: 'MEDIUM',
    editorial_url: 'https://leetcode.com/problems/set-matrix-zeroes/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'Given an m x n integer matrix matrix, if an element is 0, set its entire row and column to 0\'s. You must do it in place.',
    examples: [
      { input: 'matrix = [[1,1,1],[1,0,1],[1,1,1]]', output: '[[1,0,1],[0,0,0],[1,0,1]]' }
    ],
    hints: [
      'Use the first row and first column of the matrix itself as flags.',
      'Use a single extra variable for the first column.'
    ],
    optimal_complexity: { time: 'O(M * N)', space: 'O(1)' }
  }),

  createProblem({
    id: 'dsa_top150_game_of_life',
    title: 'Game of Life',
    topic_id: 'dsa_topic_matrix',
    difficulty: 'MEDIUM',
    editorial_url: 'https://leetcode.com/problems/game-of-life/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'According to Conway\'s Game of Life rules, calculate the next state of the m x n board in-place.',
    examples: [
      { input: 'board = [[0,1,0],[0,0,1],[1,1,1],[0,0,0]]', output: '[[0,0,0],[1,0,1],[0,1,1],[0,1,0]]' }
    ],
    hints: [
      'Use extra state bits or intermediate numbers (e.g. 2 for dead->live, -1 for live->dead).',
      'Resolve states in a second pass.'
    ],
    optimal_complexity: { time: 'O(M * N)', space: 'O(1)' }
  }),

  // ================= HASHMAP (9 Problems) =================
  createProblem({
    id: 'dsa_top150_ransom_note',
    title: 'Ransom Note',
    topic_id: 'dsa_topic_hashmap',
    difficulty: 'EASY',
    editorial_url: 'https://leetcode.com/problems/ransom-note/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'Given two strings ransomNote and magazine, return true if ransomNote can be constructed by using the letters from magazine and false otherwise.',
    examples: [
      { input: 'ransomNote = "a", magazine = "b"', output: 'false' },
      { input: 'ransomNote = "aa", magazine = "aab"', output: 'true' }
    ],
    hints: [
      'Count frequencies of each character in magazine.',
      'Decrement counts while reading ransomNote.'
    ],
    optimal_complexity: { time: 'O(M + N)', space: 'O(1) (26 letters)' }
  }),

  createProblem({
    id: 'dsa_top150_isomorphic_strings',
    title: 'Isomorphic Strings',
    topic_id: 'dsa_topic_hashmap',
    difficulty: 'EASY',
    editorial_url: 'https://leetcode.com/problems/isomorphic-strings/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'Given two strings s and t, determine if they are isomorphic. Two strings s and t are isomorphic if the characters in s can be replaced to get t.',
    examples: [
      { input: 's = "egg", t = "add"', output: 'true' },
      { input: 's = "foo", t = "bar"', output: 'false' }
    ],
    hints: [
      'Bijection mapping: character in s maps to character in t and vice-versa.',
      'Use two hash maps or track last seen positions.'
    ],
    optimal_complexity: { time: 'O(N)', space: 'O(1)' }
  }),

  createProblem({
    id: 'dsa_top150_word_pattern',
    title: 'Word Pattern',
    topic_id: 'dsa_topic_hashmap',
    difficulty: 'EASY',
    editorial_url: 'https://leetcode.com/problems/word-pattern/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'Given a pattern and a string s, find if s follows the same pattern. Follow means a full match, such that there is a bijection between a letter in pattern and a non-empty word in s.',
    examples: [
      { input: 'pattern = "abba", s = "dog cat cat dog"', output: 'true' },
      { input: 'pattern = "abba", s = "dog cat cat fish"', output: 'false' }
    ],
    hints: [
      'Split words in s.',
      'Check bijection between pattern[i] and words[i].'
    ],
    optimal_complexity: { time: 'O(N)', space: 'O(N)' }
  }),

  createProblem({
    id: 'dsa_top150_valid_anagram',
    title: 'Valid Anagram',
    topic_id: 'dsa_topic_hashmap',
    difficulty: 'EASY',
    editorial_url: 'https://leetcode.com/problems/valid-anagram/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'Given two strings s and t, return true if t is an anagram of s, and false otherwise.',
    examples: [
      { input: 's = "anagram", t = "nagaram"', output: 'true' },
      { input: 's = "rat", t = "car"', output: 'false' }
    ],
    hints: [
      'Character frequency count table of size 26.',
      'Increment for s, decrement for t. Check if all zeros.'
    ],
    optimal_complexity: { time: 'O(N)', space: 'O(1)' }
  }),

  createProblem({
    id: 'dsa_top150_group_anagrams',
    title: 'Group Anagrams',
    topic_id: 'dsa_topic_hashmap',
    difficulty: 'MEDIUM',
    editorial_url: 'https://leetcode.com/problems/group-anagrams/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'Given an array of strings strs, group the anagrams together. You can return the answer in any order.',
    examples: [
      { input: 'strs = ["eat","tea","tan","ate","nat","bat"]', output: '[["bat"],["nat","tan"],["ate","eat","tea"]]' }
    ],
    hints: [
      'Sorted string or 26-element character tuple as hash map key.',
      'Group matching keys into list.'
    ],
    optimal_complexity: { time: 'O(N * K log K)', space: 'O(N * K)' }
  }),

  createProblem({
    id: 'dsa_top150_two_sum',
    title: 'Two Sum',
    topic_id: 'dsa_topic_hashmap',
    difficulty: 'EASY',
    editorial_url: 'https://leetcode.com/problems/two-sum/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]' },
      { input: 'nums = [3,2,4], target = 6', output: '[1,2]' }
    ],
    hints: [
      'Hash map storing value -> index.',
      'For each num, check if target - num exists in map.'
    ],
    optimal_complexity: { time: 'O(N)', space: 'O(N)' }
  }),

  createProblem({
    id: 'dsa_top150_happy_number',
    title: 'Happy Number',
    topic_id: 'dsa_topic_hashmap',
    difficulty: 'EASY',
    editorial_url: 'https://leetcode.com/problems/happy-number/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'Starting with any positive integer, replace the number by the sum of the squares of its digits. Repeat until number equals 1 or loops endlessly in a cycle.',
    examples: [
      { input: 'n = 19', output: 'true', explanation: '1^2 + 9^2 = 82 -> 68 -> 100 -> 1' },
      { input: 'n = 2', output: 'false' }
    ],
    hints: [
      'Floyd\'s Cycle-Finding Algorithm (slow and fast pointers) or hash set.'
    ],
    optimal_complexity: { time: 'O(log N)', space: 'O(1)' }
  }),

  createProblem({
    id: 'dsa_top150_contains_duplicate_ii',
    title: 'Contains Duplicate II',
    topic_id: 'dsa_topic_hashmap',
    difficulty: 'EASY',
    editorial_url: 'https://leetcode.com/problems/contains-duplicate-ii/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'Given an integer array nums and an integer k, return true if there are two distinct indices i and j in the array such that nums[i] == nums[j] and abs(i - j) <= k.',
    examples: [
      { input: 'nums = [1,2,3,1], k = 3', output: 'true' },
      { input: 'nums = [1,2,3,1,2,3], k = 2', output: 'false' }
    ],
    hints: [
      'Hash map storing last seen index or sliding window hash set of size k.'
    ],
    optimal_complexity: { time: 'O(N)', space: 'O(min(N, k))' }
  }),

  createProblem({
    id: 'dsa_top150_longest_consecutive_sequence',
    title: 'Longest Consecutive Sequence',
    topic_id: 'dsa_topic_hashmap',
    difficulty: 'MEDIUM',
    editorial_url: 'https://leetcode.com/problems/longest-consecutive-sequence/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'Given an unsorted array of integers nums, return the length of the longest consecutive elements sequence. You must write an algorithm that runs in O(n) time.',
    examples: [
      { input: 'nums = [100,4,200,1,3,2]', output: '4', explanation: 'The longest consecutive elements sequence is [1, 2, 3, 4].' },
      { input: 'nums = [0,3,7,2,5,8,4,6,0,1]', output: '9' }
    ],
    hints: [
      'Put all numbers into a hash set.',
      'Only start counting from numbers that have no left neighbor (x - 1 not in set).'
    ],
    optimal_complexity: { time: 'O(N)', space: 'O(N)' }
  }),

  // ================= INTERVALS (4 Problems) =================
  createProblem({
    id: 'dsa_top150_summary_ranges',
    title: 'Summary Ranges',
    topic_id: 'dsa_topic_intervals',
    difficulty: 'EASY',
    editorial_url: 'https://leetcode.com/problems/summary-ranges/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'Return the smallest sorted list of ranges that cover all the numbers in the array exactly.',
    examples: [
      { input: 'nums = [0,1,2,4,5,7]', output: '["0->2","4->5","7"]' }
    ],
    hints: [
      'Two pointers or two indices to identify consecutive ranges.'
    ],
    optimal_complexity: { time: 'O(N)', space: 'O(1) aux' }
  }),

  createProblem({
    id: 'dsa_top150_merge_intervals',
    title: 'Merge Intervals',
    topic_id: 'dsa_topic_intervals',
    difficulty: 'MEDIUM',
    editorial_url: 'https://leetcode.com/problems/merge-intervals/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals, and return an array of the non-overlapping intervals.',
    examples: [
      { input: 'intervals = [[1,3],[2,6],[8,10],[15,18]]', output: '[[1,6],[8,10],[15,18]]' }
    ],
    hints: [
      'Sort intervals by start time.',
      'If current interval overlaps with previous merged interval, update end = max(end, cur.end).'
    ],
    optimal_complexity: { time: 'O(N log N)', space: 'O(N)' }
  }),

  createProblem({
    id: 'dsa_top150_insert_interval',
    title: 'Insert Interval',
    topic_id: 'dsa_topic_intervals',
    difficulty: 'MEDIUM',
    editorial_url: 'https://leetcode.com/problems/insert-interval/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'Insert newInterval into intervals such that intervals is still sorted in ascending order and intervals does not have any overlapping intervals.',
    examples: [
      { input: 'intervals = [[1,3],[6,9]], newInterval = [2,5]', output: '[[1,5],[6,9]]' }
    ],
    hints: [
      'Add all intervals ending before newInterval starts.',
      'Merge all overlapping intervals with newInterval.',
      'Add all remaining intervals.'
    ],
    optimal_complexity: { time: 'O(N)', space: 'O(N)' }
  }),

  createProblem({
    id: 'dsa_top150_minimum_number_of_arrows_to_burst_balloons',
    title: 'Minimum Number of Arrows to Burst Balloons',
    topic_id: 'dsa_topic_intervals',
    difficulty: 'MEDIUM',
    editorial_url: 'https://leetcode.com/problems/minimum-number-of-arrows-to-burst-balloons/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'Given spherical balloons on flat wall, find the minimum number of arrows that must be shot to burst all balloons.',
    examples: [
      { input: 'points = [[10,16],[2,8],[1,6],[7,12]]', output: '2' }
    ],
    hints: [
      'Greedy algorithm: sort balloons by end coordinate.',
      'Shoot an arrow at the end coordinate of the earliest-ending balloon.'
    ],
    optimal_complexity: { time: 'O(N log N)', space: 'O(1) aux' }
  }),

  // ================= STACK (5 Problems) =================
  createProblem({
    id: 'dsa_top150_valid_parentheses',
    title: 'Valid Parentheses',
    topic_id: 'dsa_topic_stacks_queues',
    difficulty: 'EASY',
    editorial_url: 'https://leetcode.com/problems/valid-parentheses/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'Given a string s containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid.',
    examples: [
      { input: 's = "()"', output: 'true' },
      { input: 's = "()[]{}"', output: 'true' },
      { input: 's = "(]"', output: 'false' }
    ],
    hints: [
      'Use a stack to match closing brackets with opening brackets.',
      'Pop when matching closing bracket is observed.'
    ],
    optimal_complexity: { time: 'O(N)', space: 'O(N)' }
  }),

  createProblem({
    id: 'dsa_top150_simplify_path',
    title: 'Simplify Path',
    topic_id: 'dsa_topic_stacks_queues',
    difficulty: 'MEDIUM',
    editorial_url: 'https://leetcode.com/problems/simplify-path/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'Given an absolute path for a Unix-style file system, convert it to the simplified canonical path.',
    examples: [
      { input: 'path = "/home/"', output: '"/home"' },
      { input: 'path = "/../"', output: '"/"' },
      { input: 'path = "/home//foo/"', output: '"/home/foo"' }
    ],
    hints: [
      'Split by "/" and use a stack.',
      '".." pops from stack, "." or empty string ignored, otherwise push.'
    ],
    optimal_complexity: { time: 'O(N)', space: 'O(N)' }
  }),

  createProblem({
    id: 'dsa_top150_min_stack',
    title: 'Min Stack',
    topic_id: 'dsa_topic_stacks_queues',
    difficulty: 'MEDIUM',
    editorial_url: 'https://leetcode.com/problems/min-stack/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'Design a stack that supports push, pop, top, and retrieving the minimum element in constant time O(1).',
    examples: [
      { input: '["MinStack","push","push","push","getMin","pop","top","getMin"]\n[[],[-2],[0],[-3],[],[],[],[]]', output: '[null,null,null,null,-3,null,0,-2]' }
    ],
    hints: [
      'Use two stacks or store pairs (value, min_so_far) in a single stack.'
    ],
    optimal_complexity: { time: 'O(1) all ops', space: 'O(N)' }
  }),

  createProblem({
    id: 'dsa_top150_evaluate_reverse_polish_notation',
    title: 'Evaluate Reverse Polish Notation',
    topic_id: 'dsa_topic_stacks_queues',
    difficulty: 'MEDIUM',
    editorial_url: 'https://leetcode.com/problems/evaluate-reverse-polish-notation/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'Evaluate the value of an arithmetic expression in Reverse Polish Notation (postfix). Valid operators are +, -, *, and /.',
    examples: [
      { input: 'tokens = ["2","1","+","3","*"]', output: '9', explanation: '((2 + 1) * 3) = 9' },
      { input: 'tokens = ["4","13","5","/","+"]', output: '6' }
    ],
    hints: [
      'Push operands onto a stack.',
      'When operator is encountered, pop top two operands, evaluate, and push result.'
    ],
    optimal_complexity: { time: 'O(N)', space: 'O(N)' }
  }),

  createProblem({
    id: 'dsa_top150_basic_calculator',
    title: 'Basic Calculator',
    topic_id: 'dsa_topic_stacks_queues',
    difficulty: 'HARD',
    editorial_url: 'https://leetcode.com/problems/basic-calculator/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'Given a string s representing a valid expression, implement a basic calculator to evaluate it. Handles +, -, parentheses, and spaces.',
    examples: [
      { input: 's = "1 + 1"', output: '2' },
      { input: 's = " 2-1 + 2 "', output: '3' },
      { input: 's = "(1+(4+5+2)-3)+(6+8)"', output: '23' }
    ],
    hints: [
      'Maintain running result and sign (+1 or -1).',
      'When \'(\' is encountered, push current result and sign to stack, reset result to 0 and sign to 1.',
      'When \')\' is encountered, pop sign and previous result, and calculate: prev_res + prev_sign * cur_res.'
    ],
    optimal_complexity: { time: 'O(N)', space: 'O(N)' }
  }),
];
