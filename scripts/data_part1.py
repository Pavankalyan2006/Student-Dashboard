from dsa_builder_helper import make_problem

part1_problems = [
    # ------------------ TOPIC 1: ARRAYS & HASHING (16 questions: 5 Easy, 9 Medium, 2 Hard) ------------------
    make_problem(
        id="dsa_top150_001",
        number=1,
        title="Two Sum",
        topic_id="topic_arrays_hashing",
        subtopic="Hash Map Lookup",
        difficulty="EASY",
        roadmap_stage="Beginner Foundations",
        companies=["Google", "Amazon", "Meta", "Apple", "Microsoft"],
        description="Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.",
        input_format="Line 1: N integers separated by space representing nums\nLine 2: Single integer representing target",
        output_format="Two space-separated integers representing the 0-based indices.",
        constraints=["2 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9", "-10^9 <= target <= 10^9", "Only one valid answer exists."],
        examples=[
            {"input": "2 7 11 15\n9", "output": "0 1", "explanation": "nums[0] + nums[1] == 2 + 7 == 9, so return 0 1."},
            {"input": "3 2 4\n6", "output": "1 2", "explanation": "nums[1] + nums[2] == 2 + 4 == 6, so return 1 2."},
            {"input": "3 3\n6", "output": "0 1", "explanation": "nums[0] + nums[1] == 3 + 3 == 6, so return 0 1."}
        ],
        public_test_cases=[
            {"input": "2 7 11 15\n9", "output": "0 1"},
            {"input": "3 2 4\n6", "output": "1 2"}
        ],
        hidden_test_cases=[
            {"input": "3 3\n6", "output": "0 1"},
            {"input": "1 5 8 10 14\n18", "output": "2 3"},
            {"input": "-3 4 3 90\n0", "output": "0 2"}
        ],
        hints=[
            "Can you use the complement `target - num` to check if the matching number has already been seen?",
            "Use a hash map to map each visited number to its index.",
            "Iterate through the array once: for each element, check if target - num is in your hash map."
        ],
        time_complexity="O(N)",
        space_complexity="O(N)",
        py_fn_name="twoSum",
        py_fn_params="nums: list[int], target: int",
        py_fn_ret_type="list[int]",
        py_sample_body="seen = {}\n    for i, num in enumerate(nums):\n        diff = target - num\n        if diff in seen:\n            return [seen[diff], i]\n        seen[num] = i\n    return []",
        solution_explanation="We iterate over the array once while storing each element and its index in a hash map. For each element x, we check if target - x is already in the map. This achieves O(N) time and O(N) auxiliary space."
    ),

    make_problem(
        id="dsa_top150_002",
        number=2,
        title="Contains Duplicate",
        topic_id="topic_arrays_hashing",
        subtopic="Hash Set Verification",
        difficulty="EASY",
        roadmap_stage="Beginner Foundations",
        companies=["Amazon", "Apple", "Microsoft"],
        description="Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.",
        input_format="A single line of space-separated integers representing nums.",
        output_format="true if duplicate exists, false otherwise.",
        constraints=["1 <= nums.length <= 10^5", "-10^9 <= nums[i] <= 10^9"],
        examples=[
            {"input": "1 2 3 1", "output": "true", "explanation": "1 appears twice in the array."},
            {"input": "1 2 3 4", "output": "false", "explanation": "All elements are distinct."}
        ],
        public_test_cases=[
            {"input": "1 2 3 1", "output": "true"},
            {"input": "1 2 3 4", "output": "false"}
        ],
        hidden_test_cases=[
            {"input": "1 1 1 3 3 4 3 2 4 2", "output": "true"},
            {"input": "100", "output": "false"},
            {"input": "-1 -2 -3 -1", "output": "true"}
        ],
        hints=[
            "A brute force comparison takes O(N^2). Can you do better with additional space?",
            "A hash set allows O(1) average lookup and insertion.",
            "Iterate through nums. If an element already exists in the set, return true. Otherwise add it."
        ],
        time_complexity="O(N)",
        space_complexity="O(N)",
        py_fn_name="containsDuplicate",
        py_fn_params="nums: list[int]",
        py_fn_ret_type="bool",
        py_sample_body="return len(nums) != len(set(nums))",
        solution_explanation="Using a hash set, we track seen numbers. If an element is already present, a duplicate exists. Alternatively, compare len(nums) with len(set(nums))."
    ),

    make_problem(
        id="dsa_top150_003",
        number=3,
        title="Best Time to Buy and Sell Stock",
        topic_id="topic_arrays_hashing",
        subtopic="Prefix Minimum Tracking",
        difficulty="EASY",
        roadmap_stage="Beginner Foundations",
        companies=["Amazon", "Google", "Microsoft", "Meta"],
        description="You are given an array prices where prices[i] is the price of a given stock on the ith day.\n\nYou want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.\n\nReturn the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.",
        input_format="A single line of space-separated integers representing stock prices across consecutive days.",
        output_format="Single integer representing maximum profit.",
        constraints=["1 <= prices.length <= 10^5", "0 <= prices[i] <= 10^4"],
        examples=[
            {"input": "7 1 5 3 6 4", "output": "5", "explanation": "Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6 - 1 = 5."},
            {"input": "7 6 4 3 1", "output": "0", "explanation": "In this case, no transactions are done and the max profit = 0."}
        ],
        public_test_cases=[
            {"input": "7 1 5 3 6 4", "output": "5"},
            {"input": "7 6 4 3 1", "output": "0"}
        ],
        hidden_test_cases=[
            {"input": "2 4 1", "output": "2"},
            {"input": "3 2 6 5 0 3", "output": "4"},
            {"input": "1 2", "output": "1"}
        ],
        hints=[
            "You cannot sell before you buy.",
            "Keep track of the minimum price encountered so far as you iterate through the days.",
            "On day i, the max profit if you sell today is prices[i] - min_price. Update the global max profit."
        ],
        time_complexity="O(N)",
        space_complexity="O(1)",
        py_fn_name="maxProfit",
        py_fn_params="prices: list[int]",
        py_fn_ret_type="int",
        py_sample_body="min_p, max_p = float('inf'), 0\n    for p in prices:\n        if p < min_p: min_p = p\n        elif p - min_p > max_p: max_p = p - min_p\n    return max_p",
        solution_explanation="Maintain min_price seen so far. At each day i, calculate current profit prices[i] - min_price and update max_profit. Single pass O(N) time and O(1) memory."
    ),

    make_problem(
        id="dsa_top150_004",
        number=4,
        title="Majority Element",
        topic_id="topic_arrays_hashing",
        subtopic="Boyer-Moore Voting",
        difficulty="EASY",
        roadmap_stage="Beginner Foundations",
        companies=["Amazon", "Google", "Microsoft"],
        description="Given an array nums of size n, return the majority element.\n\nThe majority element is the element that appears more than ⌊n / 2⌋ times. You may assume that the majority element always exists in the array.",
        input_format="A single line of space-separated integers representing nums.",
        output_format="The majority integer element.",
        constraints=["n == nums.length", "1 <= n <= 5 * 10^4", "-10^9 <= nums[i] <= 10^9"],
        examples=[
            {"input": "3 2 3", "output": "3", "explanation": "3 appears 2 times out of 3, which is > 1.5."},
            {"input": "2 2 1 1 1 2 2", "output": "2", "explanation": "2 appears 4 times out of 7, which is > 3.5."}
        ],
        public_test_cases=[
            {"input": "3 2 3", "output": "3"},
            {"input": "2 2 1 1 1 2 2", "output": "2"}
        ],
        hidden_test_cases=[
            {"input": "1", "output": "1"},
            {"input": "6 5 5", "output": "5"},
            {"input": "10 9 9 9 10", "output": "9"}
        ],
        hints=[
            "Can you solve this in O(1) space rather than using a hash map?",
            "Look up the Boyer-Moore Voting Algorithm.",
            "Maintain a candidate and a counter. Increment when you see candidate, decrement otherwise. When count drops to 0, pick current element as candidate."
        ],
        time_complexity="O(N)",
        space_complexity="O(1)",
        py_fn_name="majorityElement",
        py_fn_params="nums: list[int]",
        py_fn_ret_type="int",
        py_sample_body="candidate, count = None, 0\n    for n in nums:\n        if count == 0:\n            candidate = n\n        count += (1 if n == candidate else -1)\n    return candidate",
        solution_explanation="Boyer-Moore Voting Algorithm maintains candidate and count. Since majority element occurs > n/2 times, its count remains positive at the end."
    ),

    make_problem(
        id="dsa_top150_merge_sorted_array",
        number=5,
        title="Merge Sorted Array",
        topic_id="topic_arrays_hashing",
        subtopic="Three Pointers / In-Place Merge",
        difficulty="EASY",
        roadmap_stage="Beginner Foundations",
        companies=["Amazon", "Meta", "Google", "Microsoft", "Apple"],
        description="You are given two integer arrays nums1 and nums2, sorted in non-decreasing order, and two integers m and n, representing the number of elements in nums1 and nums2 respectively.\n\nMerge nums1 and nums2 into a single array sorted in non-decreasing order.\n\nThe final sorted array should not be returned by the function, but instead be stored inside the array nums1. To accommodate this, nums1 has a length of m + n, where the first m elements denote the elements that should be merged, and the last n elements are set to 0 and should be ignored. nums2 has a length of n.",
        input_format="Line 1: m + n integers representing nums1\nLine 2: Single integer m\nLine 3: n integers representing nums2\nLine 4: Single integer n",
        output_format="A single line of space-separated integers representing the merged nums1.",
        constraints=["nums1.length == m + n", "nums2.length == n", "0 <= m, n <= 200", "1 <= m + n <= 200", "-10^9 <= nums1[i], nums2[j] <= 10^9"],
        examples=[
            {"input": "1 2 3 0 0 0\n3\n2 5 6\n3", "output": "1 2 2 3 5 6", "explanation": "The arrays we are merging are [1,2,3] and [2,5,6]. Result: [1,2,2,3,5,6]."},
            {"input": "1\n1\n\n0", "output": "1", "explanation": "Only one element from nums1."}
        ],
        public_test_cases=[
            {"input": "1 2 3 0 0 0\n3\n2 5 6\n3", "output": "1 2 2 3 5 6"},
            {"input": "1\n1\n\n0", "output": "1"}
        ],
        hidden_test_cases=[
            {"input": "0\n0\n1\n1", "output": "1"},
            {"input": "4 5 6 0 0 0\n3\n1 2 3\n3", "output": "1 2 3 4 5 6"},
            {"input": "2 0\n1\n1\n1", "output": "1 2"}
        ],
        hints=[
            "You can solve this in O(m + n) time and O(1) space without extra memory.",
            "Notice that nums1 has empty buffer space at the tail. Can you fill it starting from the back?",
            "Maintain three pointers: p1 = m - 1, p2 = n - 1, and p = m + n - 1. Compare nums1[p1] and nums2[p2], place the larger at nums1[p], and decrement."
        ],
        time_complexity="O(N)",
        space_complexity="O(1)",
        py_fn_name="merge",
        py_fn_params="nums1: list[int], m: int, nums2: list[int], n: int",
        py_fn_ret_type="None",
        py_sample_body="p1, p2, p = m - 1, n - 1, m + n - 1\n    while p2 >= 0:\n        if p1 >= 0 and nums1[p1] > nums2[p2]:\n            nums1[p] = nums1[p1]\n            p1 -= 1\n        else:\n            nums1[p] = nums2[p2]\n            p2 -= 1\n        p -= 1",
        solution_explanation="Use three backward pointers: place the largest elements from the back of nums1 to avoid overwriting unmerged elements."
    ),

    make_problem(
        id="dsa_top150_006",
        number=6,
        title="Product of Array Except Self",
        topic_id="topic_arrays_hashing",
        subtopic="Prefix & Suffix Products",
        difficulty="MEDIUM",
        roadmap_stage="Core Patterns",
        companies=["Amazon", "Apple", "Microsoft", "Meta"],
        description="Given an integer array nums, return an array answer such that answer[i] is equal to the product of all the elements of nums except nums[i].\n\nThe product of any prefix or suffix of nums is guaranteed to fit in a 32-bit integer.\n\nYou must write an algorithm that runs in O(n) time and without using the division operation.",
        input_format="A single line of space-separated integers representing nums.",
        output_format="A space-separated line of integers representing the resulting products.",
        constraints=["2 <= nums.length <= 10^5", "-30 <= nums[i] <= 30", "Product fits in 32-bit signed integer."],
        examples=[
            {"input": "1 2 3 4", "output": "24 12 8 6", "explanation": "2*3*4=24, 1*3*4=12, 1*2*4=8, 1*2*3=6."},
            {"input": "-1 1 0 -3 3", "output": "0 0 9 0 0"}
        ],
        public_test_cases=[
            {"input": "1 2 3 4", "output": "24 12 8 6"},
            {"input": "-1 1 0 -3 3", "output": "0 0 9 0 0"}
        ],
        hidden_test_cases=[
            {"input": "2 3", "output": "3 2"},
            {"input": "4 5 1 8 2", "output": "80 64 320 40 160"}
        ],
        hints=[
            "Can you compute the product of all elements to the left of i, and to the right of i?",
            "First pass: fill output array with prefix products.",
            "Second pass: maintain a running suffix product variable from right to left, multiplying into output."
        ],
        time_complexity="O(N)",
        space_complexity="O(1)",
        py_fn_name="productExceptSelf",
        py_fn_params="nums: list[int]",
        py_fn_ret_type="list[int]",
        py_sample_body="n = len(nums)\n    res = [1] * n\n    prefix = 1\n    for i in range(n):\n        res[i] = prefix\n        prefix *= nums[i]\n    postfix = 1\n    for i in range(n - 1, -1, -1):\n        res[i] *= postfix\n        postfix *= nums[i]\n    return res",
        solution_explanation="Compute prefix products left-to-right into the output array, then traverse backwards right-to-left multiplying running suffix products into each slot."
    ),

    make_problem(
        id="lc_150_maximum_subarray",
        number=7,
        title="Maximum Subarray",
        topic_id="topic_arrays_hashing",
        subtopic="Kadane's Algorithm",
        difficulty="MEDIUM",
        roadmap_stage="Core Patterns",
        companies=["Google", "Amazon", "Microsoft", "Meta"],
        description="Given an integer array nums, find the subarray with the largest sum, and return its sum.",
        input_format="A single line of space-separated integers representing nums.",
        output_format="Single integer representing the maximum subarray sum.",
        constraints=["1 <= nums.length <= 10^5", "-10^4 <= nums[i] <= 10^4"],
        examples=[
            {"input": "-2 1 -3 4 -1 2 1 -5 4", "output": "6", "explanation": "The subarray [4, -1, 2, 1] has the largest sum 6."},
            {"input": "1", "output": "1", "explanation": "The subarray [1] has the largest sum 1."},
            {"input": "5 4 -1 7 8", "output": "23", "explanation": "The subarray [5, 4, -1, 7, 8] has the largest sum 23."}
        ],
        public_test_cases=[
            {"input": "-2 1 -3 4 -1 2 1 -5 4", "output": "6"},
            {"input": "1", "output": "1"}
        ],
        hidden_test_cases=[
            {"input": "5 4 -1 7 8", "output": "23"},
            {"input": "-1 -2 -3", "output": "-1"},
            {"input": "-2 -1", "output": "-1"}
        ],
        hints=[
            "If your current running sum drops below 0, can it help any future subarray?",
            "Whenever running sum < 0, reset it to 0.",
            "Track global maximum sum at each step."
        ],
        time_complexity="O(N)",
        space_complexity="O(1)",
        py_fn_name="maxSubArray",
        py_fn_params="nums: list[int]",
        py_fn_ret_type="int",
        py_sample_body="max_so_far = nums[0]\n    curr = 0\n    for x in nums:\n        curr = max(x, curr + x)\n        max_so_far = max(max_so_far, curr)\n    return max_so_far",
        solution_explanation="Kadane's algorithm maintains maximum sum ending at current index: curr = max(x, curr + x), and updates overall maximum so far."
    ),

    make_problem(
        id="dsa_top150_008",
        number=8,
        title="Find the Duplicate Number",
        topic_id="topic_arrays_hashing",
        subtopic="Floyd's Tortoise and Hare",
        difficulty="MEDIUM",
        roadmap_stage="Core Patterns",
        companies=["Amazon", "Microsoft", "Google"],
        description="Given an array of integers nums containing n + 1 integers where each integer is in the range [1, n] inclusive.\n\nThere is only one repeated number in nums, return this repeated number.\n\nYou must solve the problem without modifying the array nums and uses only constant extra space.",
        input_format="A single line of space-separated integers of length n + 1.",
        output_format="The duplicate integer.",
        constraints=["1 <= n <= 10^5", "nums.length == n + 1", "1 <= nums[i] <= n", "All integers in nums appear once except for one integer which appears two or more times."],
        examples=[
            {"input": "1 3 4 2 2", "output": "2", "explanation": "2 is the duplicate number."},
            {"input": "3 1 3 4 2", "output": "3", "explanation": "3 is the duplicate number."}
        ],
        public_test_cases=[
            {"input": "1 3 4 2 2", "output": "2"},
            {"input": "3 1 3 4 2", "output": "3"}
        ],
        hidden_test_cases=[
            {"input": "2 2 2 2 2", "output": "2"},
            {"input": "1 1", "output": "1"}
        ],
        hints=[
            "Think of the array values as pointers: index i points to nums[i].",
            "Because there is a duplicate, two indices point to the same next node, creating a cycle.",
            "Use Floyd's cycle-finding algorithm (tortoise and hare) to find the entrance of the cycle."
        ],
        time_complexity="O(N)",
        space_complexity="O(1)",
        py_fn_name="findDuplicate",
        py_fn_params="nums: list[int]",
        py_fn_ret_type="int",
        py_sample_body="slow = nums[0]\n    fast = nums[0]\n    while True:\n        slow = nums[slow]\n        fast = nums[nums[fast]]\n        if slow == fast:\n            break\n    slow = nums[0]\n    while slow != fast:\n        slow = nums[slow]\n        fast = nums[fast]\n    return slow",
        solution_explanation="Treat values as next pointers. A duplicate means multiple nodes point to the same node, forming a cycle. Floyd's cycle detection locates the cycle entrance in O(N) time and O(1) space."
    ),

    make_problem(
        id="dsa_top150_009",
        number=9,
        title="Longest Consecutive Sequence",
        topic_id="topic_arrays_hashing",
        subtopic="Hash Set Sequence Extension",
        difficulty="MEDIUM",
        roadmap_stage="Core Patterns",
        companies=["Google", "Amazon", "Meta", "Spotify"],
        description="Given an unsorted array of integers nums, return the length of the longest consecutive elements sequence.\n\nYou must write an algorithm that runs in O(n) time.",
        input_format="A single line of space-separated integers representing nums.",
        output_format="Single integer representing the longest sequence length.",
        constraints=["0 <= nums.length <= 10^5", "-10^9 <= nums[i] <= 10^9"],
        examples=[
            {"input": "100 4 200 1 3 2", "output": "4", "explanation": "The longest consecutive sequence is [1, 2, 3, 4]. Its length is 4."},
            {"input": "0 3 7 2 5 8 4 6 0 1", "output": "9", "explanation": "The longest consecutive sequence is [0, 1, 2, 3, 4, 5, 6, 7, 8]. Its length is 9."}
        ],
        public_test_cases=[
            {"input": "100 4 200 1 3 2", "output": "4"},
            {"input": "0 3 7 2 5 8 4 6 0 1", "output": "9"}
        ],
        hidden_test_cases=[
            {"input": "", "output": "0"},
            {"input": "1", "output": "1"},
            {"input": "9 1 4 7 3 -1 0 5 8 -1 6", "output": "7"}
        ],
        hints=[
            "Sorting takes O(N log N). Can you use a hash set for O(1) lookups?",
            "Only start counting a sequence if num - 1 is NOT in the set (i.e. num is the start of a sequence).",
            "From each sequence start, increment by 1 while elements exist in the set."
        ],
        time_complexity="O(N)",
        space_complexity="O(N)",
        py_fn_name="longestConsecutive",
        py_fn_params="nums: list[int]",
        py_fn_ret_type="int",
        py_sample_body="s = set(nums)\n    best = 0\n    for x in s:\n        if x - 1 not in s:\n            curr = x\n            length = 1\n            while curr + 1 in s:\n                curr += 1\n                length += 1\n            best = max(best, length)\n    return best",
        solution_explanation="Insert all numbers into a hash set. Only count from x if x - 1 is not in the set. Each element is visited at most twice, yielding linear O(N) runtime."
    ),

    make_problem(
        id="dsa_top150_010",
        number=10,
        title="Merge Intervals",
        topic_id="topic_arrays_hashing",
        subtopic="Interval Sorting & Merging",
        difficulty="MEDIUM",
        roadmap_stage="Core Patterns",
        companies=["Google", "Amazon", "Microsoft", "Meta"],
        description="Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.",
        input_format="Line 1: N (number of intervals)\nNext N lines: start end separated by space",
        output_format="Merged intervals, one per line as start end.",
        constraints=["1 <= intervals.length <= 10^4", "intervals[i].length == 2", "0 <= starti <= endi <= 10^4"],
        examples=[
            {"input": "4\n1 3\n2 6\n8 10\n15 18", "output": "1 6\n8 10\n15 18", "explanation": "Intervals [1,3] and [2,6] overlap, merging into [1,6]."},
            {"input": "2\n1 4\n4 5", "output": "1 5", "explanation": "Intervals [1,4] and [4,5] overlap."}
        ],
        public_test_cases=[
            {"input": "4\n1 3\n2 6\n8 10\n15 18", "output": "1 6\n8 10\n15 18"},
            {"input": "2\n1 4\n4 5", "output": "1 5"}
        ],
        hidden_test_cases=[
            {"input": "1\n1 4", "output": "1 4"},
            {"input": "3\n1 4\n0 4\n3 5", "output": "0 5"}
        ],
        hints=[
            "Sort the intervals by their start times.",
            "Iterate through the sorted intervals. If the current interval overlaps with the previous one (i.e. start <= last.end), merge them.",
            "Otherwise, append current interval to the result list."
        ],
        time_complexity="O(N log N)",
        space_complexity="O(N)",
        py_fn_name="mergeIntervals",
        py_fn_params="intervals: list[list[int]]",
        py_fn_ret_type="list[list[int]]",
        py_sample_body="intervals.sort(key=lambda x: x[0])\n    merged = []\n    for iv in intervals:\n        if not merged or merged[-1][1] < iv[0]:\n            merged.append(iv)\n        else:\n            merged[-1][1] = max(merged[-1][1], iv[1])\n    return merged",
        solution_explanation="Sort intervals by start time. Maintain a list of merged intervals. If current interval starts before or at the previous interval's end, merge by updating end = max(end1, end2)."
    ),

    make_problem(
        id="dsa_top150_011",
        number=11,
        title="Insert Interval",
        topic_id="topic_arrays_hashing",
        subtopic="Interval Insertion & Overlap",
        difficulty="MEDIUM",
        roadmap_stage="Core Patterns",
        companies=["Google", "Facebook", "LinkedIn"],
        description="You are given an array of non-overlapping intervals intervals where intervals[i] = [starti, endi] sorted in ascending order by starti. You are also given an interval newInterval = [start, end] that represents the start and end of another interval.\n\nInsert newInterval into intervals such that intervals is still sorted in ascending order by starti and intervals still does not have any overlapping intervals (merge overlapping intervals if necessary).\n\nReturn intervals after the insertion.",
        input_format="Line 1: N (number of existing intervals)\nNext N lines: start end\nLast line: newInterval start end",
        output_format="Merged intervals, one per line.",
        constraints=["0 <= intervals.length <= 10^4", "0 <= starti <= endi <= 10^5", "intervals is sorted by starti in ascending order."],
        examples=[
            {"input": "2\n1 3\n6 9\n2 5", "output": "1 5\n6 9", "explanation": "newInterval [2,5] overlaps with [1,3], resulting in [1,5],[6,9]."},
            {"input": "5\n1 2\n3 5\n6 7\n8 10\n12 16\n4 8", "output": "1 2\n3 10\n12 16"}
        ],
        public_test_cases=[
            {"input": "2\n1 3\n6 9\n2 5", "output": "1 5\n6 9"},
            {"input": "5\n1 2\n3 5\n6 7\n8 10\n12 16\n4 8", "output": "1 2\n3 10\n12 16"}
        ],
        hidden_test_cases=[
            {"input": "0\n5 7", "output": "5 7"},
            {"input": "1\n1 5\n2 3", "output": "1 5"}
        ],
        hints=[
            "Three phases: 1) add all intervals that end before newInterval begins.",
            "2) merge all intervals that overlap with newInterval.",
            "3) add all intervals that start after newInterval ends."
        ],
        time_complexity="O(N)",
        space_complexity="O(N)",
        py_fn_name="insertInterval",
        py_fn_params="intervals: list[list[int]], newInterval: list[int]",
        py_fn_ret_type="list[list[int]]",
        py_sample_body="res = []\n    i, n = 0, len(intervals)\n    while i < n and intervals[i][1] < newInterval[0]:\n        res.append(intervals[i])\n        i += 1\n    while i < n and intervals[i][0] <= newInterval[1]:\n        newInterval[0] = min(newInterval[0], intervals[i][0])\n        newInterval[1] = max(newInterval[1], intervals[i][1])\n        i += 1\n    res.append(newInterval)\n    while i < n:\n        res.append(intervals[i])\n        i += 1\n    return res",
        solution_explanation="Iterate linearly: add non-overlapping left intervals, expand newInterval with any overlapping intervals, add newInterval, and append remaining right intervals."
    ),

    make_problem(
        id="dsa_top150_012",
        number=12,
        title="Set Matrix Zeroes",
        topic_id="topic_arrays_hashing",
        subtopic="In-Place Matrix Markers",
        difficulty="MEDIUM",
        roadmap_stage="Core Patterns",
        companies=["Amazon", "Microsoft", "Meta"],
        description="Given an m x n integer matrix matrix, if an element is 0, set its entire row and column to 0's.\n\nYou must do it in place without using additional O(m*n) space.",
        input_format="Line 1: m n (rows and columns)\nNext m lines: n space-separated integers",
        output_format="Matrix after modification, m lines of n space-separated integers.",
        constraints=["m == matrix.length", "n == matrix[0].length", "1 <= m, n <= 200", "-2^31 <= matrix[i][j] <= 2^31 - 1"],
        examples=[
            {"input": "3 3\n1 1 1\n1 0 1\n1 1 1", "output": "1 0 1\n0 0 0\n1 0 1", "explanation": "Row 1 and Column 1 are set to 0."},
            {"input": "3 4\n0 1 2 0\n3 4 5 2\n1 3 1 5", "output": "0 0 0 0\n0 4 5 0\n0 3 1 0"}
        ],
        public_test_cases=[
            {"input": "3 3\n1 1 1\n1 0 1\n1 1 1", "output": "1 0 1\n0 0 0\n1 0 1"},
            {"input": "3 4\n0 1 2 0\n3 4 5 2\n1 3 1 5", "output": "0 0 0 0\n0 4 5 0\n0 3 1 0"}
        ],
        hidden_test_cases=[
            {"input": "1 1\n0", "output": "0"},
            {"input": "2 2\n1 2\n3 4", "output": "1 2\n3 4"}
        ],
        hints=[
            "Can you use the first row and first column of the matrix itself as your markers?",
            "Keep a separate boolean flag for whether the first row or first column originally had a 0.",
            "Iterate from 1..m and 1..n to zero out cells based on row/column headers."
        ],
        time_complexity="O(M * N)",
        space_complexity="O(1)",
        py_fn_name="setZeroes",
        py_fn_params="matrix: list[list[int]]",
        py_fn_ret_type="None",
        py_sample_body="m, n = len(matrix), len(matrix[0])\n    row_zero = any(matrix[0][j] == 0 for j in range(n))\n    col_zero = any(matrix[i][0] == 0 for i in range(m))\n    for i in range(1, m):\n        for j in range(1, n):\n            if matrix[i][j] == 0:\n                matrix[i][0] = 0\n                matrix[0][j] = 0\n    for i in range(1, m):\n        for j in range(1, n):\n            if matrix[i][0] == 0 or matrix[0][j] == 0:\n                matrix[i][j] = 0\n    if row_zero:\n        for j in range(n): matrix[0][j] = 0\n    if col_zero:\n        for i in range(m): matrix[i][0] = 0",
        solution_explanation="Use first row and column as marker arrays. Use boolean flags for the first row and column themselves. Zero out inner cells first, then header lines."
    ),

    make_problem(
        id="dsa_top150_013",
        number=13,
        title="Rotate Image",
        topic_id="topic_arrays_hashing",
        subtopic="Matrix Transpose & Reverse",
        difficulty="MEDIUM",
        roadmap_stage="Core Patterns",
        companies=["Amazon", "Apple", "Google", "Microsoft"],
        description="You are given an n x n 2D matrix representing an image, rotate the image by 90 degrees (clockwise).\n\nYou have to rotate the image in-place, which means you have to modify the input 2D matrix directly. DO NOT allocate another 2D matrix and do the rotation.",
        input_format="Line 1: n\nNext n lines: n space-separated integers",
        output_format="Rotated matrix, n lines with n space-separated integers.",
        constraints=["n == matrix.length == matrix[i].length", "1 <= n <= 20", "-1000 <= matrix[i][j] <= 1000"],
        examples=[
            {"input": "3\n1 2 3\n4 5 6\n7 8 9", "output": "7 4 1\n8 5 2\n9 6 3", "explanation": "Matrix rotated 90 degrees clockwise."},
            {"input": "4\n5 1 9 11\n2 4 8 10\n13 3 6 7\n15 14 12 16", "output": "15 13 2 5\n14 3 4 1\n12 6 8 9\n16 7 10 11"}
        ],
        public_test_cases=[
            {"input": "3\n1 2 3\n4 5 6\n7 8 9", "output": "7 4 1\n8 5 2\n9 6 3"},
            {"input": "4\n5 1 9 11\n2 4 8 10\n13 3 6 7\n15 14 12 16", "output": "15 13 2 5\n14 3 4 1\n12 6 8 9\n16 7 10 11"}
        ],
        hidden_test_cases=[
            {"input": "1\n42", "output": "42"},
            {"input": "2\n1 2\n3 4", "output": "3 1\n4 2"}
        ],
        hints=[
            "A clockwise 90 degree rotation is equivalent to transposing the matrix, followed by reversing each row.",
            "Transpose: swap matrix[i][j] with matrix[j][i].",
            "Reverse: reverse each row in place."
        ],
        time_complexity="O(N^2)",
        space_complexity="O(1)",
        py_fn_name="rotateMatrix",
        py_fn_params="matrix: list[list[int]]",
        py_fn_ret_type="None",
        py_sample_body="n = len(matrix)\n    for i in range(n):\n        for j in range(i + 1, n):\n            matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]\n    for i in range(n):\n        matrix[i].reverse()",
        solution_explanation="Transpose the matrix by swapping across the main diagonal (i, j) <-> (j, i). Then reverse each row horizontally to complete the clockwise rotation in-place."
    ),

    make_problem(
        id="dsa_top150_014",
        number=14,
        title="Subarray Sum Equals K",
        topic_id="topic_arrays_hashing",
        subtopic="Prefix Sum with Hash Frequency",
        difficulty="MEDIUM",
        roadmap_stage="Core Patterns",
        companies=["Meta", "Google", "Amazon"],
        description="Given an array of integers nums and an integer k, return the total number of subarrays whose sum equals to k.\n\nA subarray is a contiguous non-empty sequence of elements within an array.",
        input_format="Line 1: N integers separated by space representing nums\nLine 2: Single integer k",
        output_format="Single integer representing total count of matching subarrays.",
        constraints=["1 <= nums.length <= 2 * 10^4", "-1000 <= nums[i] <= 1000", "-10^7 <= k <= 10^7"],
        examples=[
            {"input": "1 1 1\n2", "output": "2", "explanation": "[1,1] at index (0,1) and [1,1] at index (1,2)."},
            {"input": "1 2 3\n3", "output": "2", "explanation": "[1,2] and [3] both sum to 3."}
        ],
        public_test_cases=[
            {"input": "1 1 1\n2", "output": "2"},
            {"input": "1 2 3\n3", "output": "2"}
        ],
        hidden_test_cases=[
            {"input": "1 -1 0\n0", "output": "3"},
            {"input": "3 4 7 2 -3 1 4 2\n7", "output": "4"}
        ],
        hints=[
            "Let prefixSum[i] be the sum of elements from 0 to i.",
            "Subarray sum from j to i is prefixSum[i] - prefixSum[j-1] == k => prefixSum[j-1] == prefixSum[i] - k.",
            "Maintain a hash map of prefix sum frequencies as you iterate."
        ],
        time_complexity="O(N)",
        space_complexity="O(N)",
        py_fn_name="subarraySum",
        py_fn_params="nums: list[int], k: int",
        py_fn_ret_type="int",
        py_sample_body="counts = {0: 1}\n    curr_sum = 0\n    ans = 0\n    for x in nums:\n        curr_sum += x\n        if curr_sum - k in counts:\n            ans += counts[curr_sum - k]\n        counts[curr_sum] = counts.get(curr_sum, 0) + 1\n    return ans",
        solution_explanation="Compute running prefix sum. If (prefix_sum - k) was observed previously, each occurrence marks a valid subarray ending at current index. Hash map provides O(N) time."
    ),

    make_problem(
        id="dsa_top150_trapping_rain_water",
        number=15,
        title="Trapping Rain Water",
        topic_id="topic_arrays_hashing",
        subtopic="Two Pointer Elevation Trap",
        difficulty="HARD",
        roadmap_stage="Placement Revision",
        companies=["Amazon", "Google", "Meta", "Bloomberg", "Apple"],
        description="Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
        input_format="A single line of space-separated non-negative integers representing elevation heights.",
        output_format="Single integer representing total trapped water units.",
        constraints=["n == height.length", "1 <= n <= 2 * 10^4", "0 <= height[i] <= 10^5"],
        examples=[
            {"input": "0 1 0 2 1 0 1 3 2 1 2 1", "output": "6", "explanation": "6 units of rainwater are trapped between elevation bars."},
            {"input": "4 2 0 3 2 5", "output": "9"}
        ],
        public_test_cases=[
            {"input": "0 1 0 2 1 0 1 3 2 1 2 1", "output": "6"},
            {"input": "4 2 0 3 2 5", "output": "9"}
        ],
        hidden_test_cases=[
            {"input": "2 0 2", "output": "2"},
            {"input": "3 0 0 2 0 4", "output": "10"},
            {"input": "5 4 1 2", "output": "1"}
        ],
        hints=[
            "The water trapped at index i is determined by min(max_left, max_right) - height[i].",
            "Can you use two pointers at opposite ends instead of precalculating prefix/suffix maximums?",
            "Move the pointer on the side with the smaller maximum, because the boundary height is constrained by that side."
        ],
        time_complexity="O(N)",
        space_complexity="O(1)",
        py_fn_name="trapRainWater",
        py_fn_params="height: list[int]",
        py_fn_ret_type="int",
        py_sample_body="l, r = 0, len(height) - 1\n    left_max, right_max = 0, 0\n    water = 0\n    while l < r:\n        if height[l] < height[r]:\n            if height[l] >= left_max:\n                left_max = height[l]\n            else:\n                water += left_max - height[l]\n            l += 1\n        else:\n            if height[r] >= right_max:\n                right_max = height[r]\n            else:\n                water += right_max - height[r]\n            r -= 1\n    return water",
        solution_explanation="Two pointers from both ends maintain left_max and right_max. Move pointer on the lower side, as water height is strictly bounded by the shorter boundary. O(N) time, O(1) auxiliary space."
    ),

    make_problem(
        id="dsa_top150_016",
        number=16,
        title="First Missing Positive",
        topic_id="topic_arrays_hashing",
        subtopic="Index as Hash Key",
        difficulty="HARD",
        roadmap_stage="Placement Revision",
        companies=["Amazon", "Microsoft", "Meta"],
        description="Given an unsorted integer array nums, return the smallest positive integer that is not present in nums.\n\nYou must implement an algorithm that runs in O(n) time and uses O(1) auxiliary space.",
        input_format="A single line of space-separated integers representing nums.",
        output_format="Single integer representing the smallest missing positive number.",
        constraints=["1 <= nums.length <= 10^5", "-2^31 <= nums[i] <= 2^31 - 1"],
        examples=[
            {"input": "1 2 0", "output": "3", "explanation": "Numbers 1 and 2 are present, so 3 is the smallest missing positive integer."},
            {"input": "3 4 -1 1", "output": "2", "explanation": "1 is in the array but 2 is missing."},
            {"input": "7 8 9 11 12", "output": "1", "explanation": "The smallest positive integer 1 is missing."}
        ],
        public_test_cases=[
            {"input": "1 2 0", "output": "3"},
            {"input": "3 4 -1 1", "output": "2"}
        ],
        hidden_test_cases=[
            {"input": "7 8 9 11 12", "output": "1"},
            {"input": "1", "output": "2"},
            {"input": "2", "output": "1"}
        ],
        hints=[
            "The answer must lie in the range [1, n + 1].",
            "Can you place each number x into index x - 1 using swaps?",
            "After swapping elements to their correct indices, the first index i where nums[i] != i + 1 gives the answer i + 1."
        ],
        time_complexity="O(N)",
        space_complexity="O(1)",
        py_fn_name="firstMissingPositive",
        py_fn_params="nums: list[int]",
        py_fn_ret_type="int",
        py_sample_body="n = len(nums)\n    for i in range(n):\n        while 1 <= nums[i] <= n and nums[nums[i] - 1] != nums[i]:\n            target = nums[i] - 1\n            nums[i], nums[target] = nums[target], nums[i]\n    for i in range(n):\n        if nums[i] != i + 1:\n            return i + 1\n    return n + 1",
        solution_explanation="Place each integer x in range 1..n at index x - 1 via cycle swaps. Second pass identifies the first index i where nums[i] != i + 1. Operates in O(N) time and O(1) extra space."
    ),

    # ------------------ TOPIC 2: STRINGS (11 questions: 4 Easy, 5 Medium, 2 Hard) ------------------
    make_problem(
        id="dsa_top150_017",
        number=17,
        title="Valid Anagram",
        topic_id="topic_strings",
        subtopic="Character Frequency Matching",
        difficulty="EASY",
        roadmap_stage="Beginner Foundations",
        companies=["Google", "Amazon", "Meta", "Uber"],
        description="Given two strings s and t, return true if t is an anagram of s, and false otherwise.\n\nAn Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.",
        input_format="Line 1: string s\nLine 2: string t",
        output_format="true or false",
        constraints=["1 <= s.length, t.length <= 5 * 10^4", "s and t consist of lowercase English letters."],
        examples=[
            {"input": "anagram\nnagaram", "output": "true", "explanation": "t can be formed by rearranging characters of s."},
            {"input": "rat\ncar", "output": "false", "explanation": "Characters do not match in frequency."}
        ],
        public_test_cases=[
            {"input": "anagram\nnagaram", "output": "true"},
            {"input": "rat\ncar", "output": "false"}
        ],
        hidden_test_cases=[
            {"input": "a\na", "output": "true"},
            {"input": "ab\na", "output": "false"},
            {"input": "listen\nsilent", "output": "true"}
        ],
        hints=[
            "Check length first: if lengths differ, they cannot be anagrams.",
            "Count character frequencies using an array of size 26 or a hash map.",
            "Increment counts for s, decrement for t. All counts must equal 0."
        ],
        time_complexity="O(N)",
        space_complexity="O(1)",
        py_fn_name="isAnagram",
        py_fn_params="s: str, t: str",
        py_fn_ret_type="bool",
        py_sample_body="if len(s) != len(t): return False\n    counts = [0] * 26\n    for c1, c2 in zip(s, t):\n        counts[ord(c1) - ord('a')] += 1\n        counts[ord(c2) - ord('a')] -= 1\n    return all(x == 0 for x in counts)",
        solution_explanation="Use an integer frequency buffer of size 26. Count characters in s and subtract characters in t. All positions must evaluate to zero."
    ),

    make_problem(
        id="dsa_top150_018",
        number=18,
        title="Valid Palindrome",
        topic_id="topic_strings",
        subtopic="Alphanumeric Two Pointers",
        difficulty="EASY",
        roadmap_stage="Beginner Foundations",
        companies=["Amazon", "Microsoft", "Meta"],
        description="A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Alphanumeric characters include letters and numbers.\n\nGiven a string s, return true if it is a palindrome, or false otherwise.",
        input_format="A single line containing string s.",
        output_format="true or false",
        constraints=["1 <= s.length <= 2 * 10^5", "s consists only of printable ASCII characters."],
        examples=[
            {"input": "A man, a plan, a canal: Panama", "output": "true", "explanation": "\"amanaplanacanalpanama\" is a palindrome."},
            {"input": "race a car", "output": "false", "explanation": "\"raceacar\" is not a palindrome."}
        ],
        public_test_cases=[
            {"input": "A man, a plan, a canal: Panama", "output": "true"},
            {"input": "race a car", "output": "false"}
        ],
        hidden_test_cases=[
            {"input": " ", "output": "true"},
            {"input": "0P", "output": "false"},
            {"input": "ab_a", "output": "true"}
        ],
        hints=[
            "Use two pointers: one at start, one at end.",
            "Skip non-alphanumeric characters using isalnum().",
            "Compare characters case-insensitively using lower()."
        ],
        time_complexity="O(N)",
        space_complexity="O(1)",
        py_fn_name="isPalindrome",
        py_fn_params="s: str",
        py_fn_ret_type="bool",
        py_sample_body="l, r = 0, len(s) - 1\n    while l < r:\n        while l < r and not s[l].isalnum(): l += 1\n        while l < r and not s[r].isalnum(): r -= 1\n        if s[l].lower() != s[r].lower():\n            return False\n        l += 1\n        r -= 1\n    return True",
        solution_explanation="Two pointers traverse from ends inward, advancing past non-alphanumeric symbols and comparing lowercase character matches."
    ),

    make_problem(
        id="dsa_top150_019",
        number=19,
        title="Longest Common Prefix",
        topic_id="topic_strings",
        subtopic="Horizontal / Vertical Scanning",
        difficulty="EASY",
        roadmap_stage="Beginner Foundations",
        companies=["Amazon", "Apple", "Google"],
        description="Write a function to find the longest common prefix string amongst an array of strings.\n\nIf there is no common prefix, return an empty string \"\".",
        input_format="A single line of space-separated strings.",
        output_format="String representing the longest common prefix.",
        constraints=["1 <= strs.length <= 200", "0 <= strs[i].length <= 200", "strs[i] consists of only lowercase English letters."],
        examples=[
            {"input": "flower flow flight", "output": "fl", "explanation": "Prefix 'fl' is common to all strings."},
            {"input": "dog racecar car", "output": "", "explanation": "There is no common prefix among the input strings."}
        ],
        public_test_cases=[
            {"input": "flower flow flight", "output": "fl"},
            {"input": "dog racecar car", "output": ""}
        ],
        hidden_test_cases=[
            {"input": "interspecies interstellar interstate", "output": "inters"},
            {"input": "throne", "output": "throne"},
            {"input": "a b", "output": ""}
        ],
        hints=[
            "Compare character by character vertically across all words.",
            "Stop at the first character mismatch or when reaching the end of any word.",
            "Return the substring slice from index 0 to the mismatch index."
        ],
        time_complexity="O(S)",
        space_complexity="O(1)",
        py_fn_name="longestCommonPrefix",
        py_fn_params="strs: list[str]",
        py_fn_ret_type="str",
        py_sample_body="if not strs: return ''\n    prefix = strs[0]\n    for s in strs[1:]:\n        while not s.startswith(prefix):\n            prefix = prefix[:-1]\n            if not prefix: return ''\n    return prefix",
        solution_explanation="Take the first string as candidate prefix. Progressively trim characters from the end until each string in the array starts with the prefix."
    ),

    make_problem(
        id="dsa_top150_020",
        number=20,
        title="Find the First Occurrence of a Substring",
        topic_id="topic_strings",
        subtopic="Substring Search (KMP / Rolling Hash)",
        difficulty="EASY",
        roadmap_stage="Beginner Foundations",
        companies=["Amazon", "Microsoft", "Meta"],
        description="Given two strings needle and haystack, return the index of the first occurrence of needle in haystack, or -1 if needle is not part of haystack.",
        input_format="Line 1: string haystack\nLine 2: string needle",
        output_format="0-based integer index, or -1.",
        constraints=["1 <= haystack.length, needle.length <= 10^4", "haystack and needle consist of only lowercase English characters."],
        examples=[
            {"input": "sadbutsad\nsad", "output": "0", "explanation": "'sad' occurs at index 0 and 6. First occurrence is 0."},
            {"input": "leetcode\nleeto", "output": "-1", "explanation": "'leeto' did not occur in 'leetcode'."}
        ],
        public_test_cases=[
            {"input": "sadbutsad\nsad", "output": "0"},
            {"input": "leetcode\nleeto", "output": "-1"}
        ],
        hidden_test_cases=[
            {"input": "hello\nll", "output": "2"},
            {"input": "a\na", "output": "0"},
            {"input": "mississippi\nissip", "output": "4"}
        ],
        hints=[
            "Check sliding window slices of length len(needle).",
            "For optimized linear search, KMP prefix function can skip comparisons.",
            "Return index as soon as slice matches needle."
        ],
        time_complexity="O(N)",
        space_complexity="O(1)",
        py_fn_name="strStr",
        py_fn_params="haystack: str, needle: str",
        py_fn_ret_type="int",
        py_sample_body="return haystack.find(needle)",
        solution_explanation="Find the first index where needle matches in haystack. KMP or direct window sliding achieves search in linear time."
    ),

    make_problem(
        id="dsa_top150_021",
        number=21,
        title="Reverse Words in a String",
        topic_id="topic_strings",
        subtopic="Tokenization & Reversal",
        difficulty="MEDIUM",
        roadmap_stage="Core Patterns",
        companies=["Microsoft", "Amazon", "Apple", "Google"],
        description="Given an input string s, reverse the order of the words.\n\nA word is defined as a sequence of non-space characters. The words in s will be separated by at least one space.\n\nReturn a string of the words in reverse order concatenated by a single space.\n\nNote that s may contain leading or trailing spaces or multiple spaces between two words. The returned string should only have a single space separating the words. Do not include any extra spaces.",
        input_format="A single line containing string s.",
        output_format="Reversed words joined by single spaces.",
        constraints=["1 <= s.length <= 10^4", "s contains English letters (upper/lower-case), digits, and spaces ' '.", "There is at least one word in s."],
        examples=[
            {"input": "the sky is blue", "output": "blue is sky the"},
            {"input": "  hello world  ", "output": "world hello"},
            {"input": "a good   example", "output": "example good a"}
        ],
        public_test_cases=[
            {"input": "the sky is blue", "output": "blue is sky the"},
            {"input": "  hello world  ", "output": "world hello"}
        ],
        hidden_test_cases=[
            {"input": "a good   example", "output": "example good a"},
            {"input": "EPY2 Cole", "output": "Cole EPY2"},
            {"input": "single", "output": "single"}
        ],
        hints=[
            "Split the string by spaces to discard consecutive whitespace.",
            "Reverse the list of extracted word tokens.",
            "Join the reversed words using a single space delimiter."
        ],
        time_complexity="O(N)",
        space_complexity="O(N)",
        py_fn_name="reverseWords",
        py_fn_params="s: str",
        py_fn_ret_type="str",
        py_sample_body="return ' '.join(s.split()[::-1])",
        solution_explanation="Split the string by whitespace to extract clean word tokens, reverse the token order, and re-join with a single space."
    ),

    make_problem(
        id="dsa_top150_022",
        number=22,
        title="String Compression",
        topic_id="topic_strings",
        subtopic="In-Place Run-Length Encoding",
        difficulty="MEDIUM",
        roadmap_stage="Core Patterns",
        companies=["Microsoft", "Amazon", "Bloomberg", "Meta"],
        description="Given an array of characters chars, compress it using the following algorithm:\n\nBegin with an empty string s. For each group of consecutive repeating characters in chars:\n- If the group's length is 1, append the character to s.\n- Otherwise, append the character followed by the group's length.\n\nThe compressed string s should not be returned separately, but instead, be stored in the input character array chars. Note that group lengths that are 10 or longer will be split into multiple characters in chars.\n\nAfter you are done modifying the input array, return the new length of the array.",
        input_format="A single line containing characters separated by space.",
        output_format="Compressed characters separated by space.",
        constraints=["1 <= chars.length <= 2000", "chars[i] is a lowercase English letter, uppercase English letter, digit, or symbol."],
        examples=[
            {"input": "a a b b c c c", "output": "a 2 b 2 c 3", "explanation": "The groups are 'aa', 'bb', and 'ccc'. Compressed to 'a2b2c3'."},
            {"input": "a", "output": "a", "explanation": "The only group is 'a', which remains uncompressed since length is 1."},
            {"input": "a b b b b b b b b b b b", "output": "a b 1 2"}
        ],
        public_test_cases=[
            {"input": "a a b b c c c", "output": "a 2 b 2 c 3"},
            {"input": "a", "output": "a"}
        ],
        hidden_test_cases=[
            {"input": "a b b b b b b b b b b b", "output": "a b 1 2"},
            {"input": "a a a b b a a", "output": "a 3 b 2 a 2"}
        ],
        hints=[
            "Use two pointers: a read pointer scanning through consecutive identical characters, and a write pointer.",
            "Count consecutive repeats. If count > 1, write character then write each digit of count.",
            "Advance read pointer to next new character."
        ],
        time_complexity="O(N)",
        space_complexity="O(1)",
        py_fn_name="compressString",
        py_fn_params="chars: list[str]",
        py_fn_ret_type="int",
        py_sample_body="write, read = 0, 0\n    while read < len(chars):\n        c = chars[read]\n        count = 0\n        while read < len(chars) and chars[read] == c:\n            read += 1\n            count += 1\n        chars[write] = c\n        write += 1\n        if count > 1:\n            for digit in str(count):\n                chars[write] = digit\n                write += 1\n    return write",
        solution_explanation="Two pointers: read pointer counts consecutive duplicate runs, write pointer modifies array in place with the character and its frequency digits."
    ),

    make_problem(
        id="dsa_top150_023",
        number=23,
        title="Longest Palindromic Substring",
        topic_id="topic_strings",
        subtopic="Expand Around Center",
        difficulty="MEDIUM",
        roadmap_stage="Core Patterns",
        companies=["Amazon", "Microsoft", "Meta", "Google"],
        description="Given a string s, return the longest palindromic substring in s.",
        input_format="A single line containing string s.",
        output_format="String representing the longest palindromic substring.",
        constraints=["1 <= s.length <= 1000", "s consist of only digits and English letters."],
        examples=[
            {"input": "babad", "output": "bab", "explanation": "'aba' is also a valid answer."},
            {"input": "cbbd", "output": "bb"}
        ],
        public_test_cases=[
            {"input": "babad", "output": "bab"},
            {"input": "cbbd", "output": "bb"}
        ],
        hidden_test_cases=[
            {"input": "a", "output": "a"},
            {"input": "ac", "output": "a"},
            {"input": "racecar", "output": "racecar"}
        ],
        hints=[
            "A palindrome mirrors around its center.",
            "There are 2n - 1 potential centers (odd length single character centers and even length pairs).",
            "Expand outward from each center while characters match."
        ],
        time_complexity="O(N^2)",
        space_complexity="O(1)",
        py_fn_name="longestPalindrome",
        py_fn_params="s: str",
        py_fn_ret_type="str",
        py_sample_body="if len(s) < 2: return s\n    res = ''\n    for i in range(len(s)):\n        for l, r in [(i, i), (i, i + 1)]:\n            while l >= 0 and r < len(s) and s[l] == s[r]:\n                if r - l + 1 > len(res):\n                    res = s[l:r + 1]\n                l -= 1\n                r += 1\n    return res",
        solution_explanation="Expand around centers: iterate through every index as center of an odd palindrome (i, i) or even palindrome (i, i+1). Track the maximum length match."
    ),

    make_problem(
        id="dsa_top150_024",
        number=24,
        title="Group Anagrams",
        topic_id="topic_strings",
        subtopic="Categorization by Sorted Key",
        difficulty="MEDIUM",
        roadmap_stage="Core Patterns",
        companies=["Amazon", "Apple", "Google", "Meta"],
        description="Given an array of strings strs, group the anagrams together. You can return the answer in any order.\n\nAn Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.",
        input_format="A single line of space-separated strings.",
        output_format="Grouped anagrams, each group sorted alphabetically on a separate line.",
        constraints=["1 <= strs.length <= 10^4", "0 <= strs[i].length <= 100", "strs[i] consists of lowercase English letters."],
        examples=[
            {"input": "eat tea tan ate nat bat", "output": "ate eat tea\nbat\nnat tan", "explanation": "Three groups: ['ate','eat','tea'], ['bat'], ['nat','tan']."},
            {"input": "a", "output": "a"}
        ],
        public_test_cases=[
            {"input": "eat tea tan ate nat bat", "output": "ate eat tea\nbat\nnat tan"},
            {"input": "a", "output": "a"}
        ],
        hidden_test_cases=[
            {"input": "listen silent enlisted", "output": "enlisted listen silent"},
            {"input": "abc cba bca xyz", "output": "abc bca cba\nxyz"}
        ],
        hints=[
            "Two strings are anagrams if and only if their sorted versions are identical.",
            "Use the sorted string or character count tuple as the hash map key.",
            "Append each original string to the list corresponding to its signature key."
        ],
        time_complexity="O(N * K log K)",
        space_complexity="O(N * K)",
        py_fn_name="groupAnagrams",
        py_fn_params="strs: list[str]",
        py_fn_ret_type="list[list[str]]",
        py_sample_body="from collections import defaultdict\n    groups = defaultdict(list)\n    for s in strs:\n        groups[tuple(sorted(s))].append(s)\n    return list(groups.values())",
        solution_explanation="Sort characters of each word to form a canonical tuple signature. Group words sharing the same signature in a hash map."
    ),

    make_problem(
        id="dsa_top150_025",
        number=25,
        title="Decode String",
        topic_id="topic_strings",
        subtopic="Stack-Based String Expansion",
        difficulty="MEDIUM",
        roadmap_stage="Core Patterns",
        companies=["Google", "Bloomberg", "Amazon"],
        description="Given an encoded string, return its decoded string.\n\nThe encoding rule is: k[encoded_string], where the encoded_string inside the square brackets is being repeated exactly k times. Note that k is guaranteed to be a positive integer.\n\nYou may assume that the input string is always valid; there are no extra white spaces, square brackets are well-formed, etc.",
        input_format="A single line containing the encoded string.",
        output_format="Decoded string.",
        constraints=["1 <= s.length <= 30", "s consists of lowercase English letters, digits, and square brackets '[]'.", "All the integers in s are in the range [1, 300]."],
        examples=[
            {"input": "3[a]2[bc]", "output": "aaabcbc", "explanation": "3 'a's followed by 2 'bc's."},
            {"input": "3[a2[c]]", "output": "accaccacc", "explanation": "'a2[c]' -> 'acc', repeated 3 times."},
            {"input": "2[abc]3[cd]ef", "output": "abcabccdcdcdef"}
        ],
        public_test_cases=[
            {"input": "3[a]2[bc]", "output": "aaabcbc"},
            {"input": "3[a2[c]]", "output": "accaccacc"}
        ],
        hidden_test_cases=[
            {"input": "2[abc]3[cd]ef", "output": "abcabccdcdcdef"},
            {"input": "10[a]", "output": "aaaaaaaaaa"}
        ],
        hints=[
            "Use a stack to handle nested bracket repetitions.",
            "When encountering '[', push the current string and repeat multiplier k onto stack, then reset.",
            "When encountering ']', pop previous string and repeat count, then concatenate: prev_str + count * current_str."
        ],
        time_complexity="O(Output Length)",
        space_complexity="O(Depth)",
        py_fn_name="decodeString",
        py_fn_params="s: str",
        py_fn_ret_type="str",
        py_sample_body="stack = []\n    curr_str = ''\n    curr_num = 0\n    for c in s:\n        if c.isdigit():\n            curr_num = curr_num * 10 + int(c)\n        elif c == '[':\n            stack.append((curr_str, curr_num))\n            curr_str, curr_num = '', 0\n        elif c == ']':\n            prev_str, num = stack.pop()\n            curr_str = prev_str + curr_str * num\n        else:\n            curr_str += c\n    return curr_str",
        solution_explanation="Use a stack to store (prefix_string, repeat_count). On closing bracket, pop previous state and append multiplied inner substring."
    ),

    make_problem(
        id="dsa_top150_026",
        number=26,
        title="Minimum Window Substring",
        topic_id="topic_strings",
        subtopic="Sliding Window with Target Frequency",
        difficulty="HARD",
        roadmap_stage="Placement Revision",
        companies=["Meta", "Google", "Amazon", "Microsoft", "Uber"],
        description="Given two strings s and t of lengths m and n respectively, return the minimum window substring of s such that every character in t (including duplicates) is included in the window. If there is no such substring, return the empty string \"\".",
        input_format="Line 1: string s\nLine 2: string t",
        output_format="Minimum window substring.",
        constraints=["m == s.length", "n == t.length", "1 <= m, n <= 10^5", "s and t consist of uppercase and lowercase English letters."],
        examples=[
            {"input": "ADOBECODEBANC\nABC", "output": "BANC", "explanation": "The minimum window substring \"BANC\" includes 'A', 'B', and 'C' from string t."},
            {"input": "a\na", "output": "a"},
            {"input": "a\naa", "output": "", "explanation": "Both 'a's from t must be included in the window, but s only has one 'a'."}
        ],
        public_test_cases=[
            {"input": "ADOBECODEBANC\nABC", "output": "BANC"},
            {"input": "a\na", "output": "a"}
        ],
        hidden_test_cases=[
            {"input": "a\naa", "output": ""},
            {"input": "ab\nb", "output": "b"},
            {"input": "cabwefgewcwaefgcf\ncae", "output": "cwae"}
        ],
        hints=[
            "Use two pointers for a sliding window [l, r].",
            "Expand r to include characters until all requirements of t are satisfied.",
            "Shrink l from left to minimize window while maintaining all required character counts."
        ],
        time_complexity="O(M + N)",
        space_complexity="O(Total Unique Characters)",
        py_fn_name="minWindow",
        py_fn_params="s: str, t: str",
        py_fn_ret_type="str",
        py_sample_body="from collections import Counter\n    if not t or not s: return ''\n    target = Counter(t)\n    window = {}\n    have, need = 0, len(target)\n    res, res_len = [-1, -1], float('inf')\n    l = 0\n    for r, c in enumerate(s):\n        window[c] = window.get(c, 0) + 1\n        if c in target and window[c] == target[c]:\n            have += 1\n        while have == need:\n            if (r - l + 1) < res_len:\n                res = [l, r]\n                res_len = r - l + 1\n            window[s[l]] -= 1\n            if s[l] in target and window[s[l]] < target[s[l]]:\n                have -= 1\n            l += 1\n    return s[res[0]:res[1] + 1] if res_len != float('inf') else ''",
        solution_explanation="Two-pointer sliding window tracking required character frequencies. Expand right to satisfy match condition, shrink left to minimize window length."
    ),

    make_problem(
        id="dsa_top150_027",
        number=27,
        title="Longest Valid Parentheses",
        topic_id="topic_strings",
        subtopic="Stack / Dual Counter Balancing",
        difficulty="HARD",
        roadmap_stage="Placement Revision",
        companies=["Amazon", "Google", "Meta"],
        description="Given a string containing just the characters '(' and ')', return the length of the longest valid (well-formed) parentheses substring.",
        input_format="A single line containing string s.",
        output_format="Single integer representing length of longest valid parentheses substring.",
        constraints=["0 <= s.length <= 3 * 10^4", "s[i] is '(', or ')'."],
        examples=[
            {"input": "(()", "output": "2", "explanation": "The longest valid parentheses substring is \"()\"."},
            {"input": ")()())", "output": "4", "explanation": "The longest valid parentheses substring is \"()()\"."},
            {"input": "", "output": "0"}
        ],
        public_test_cases=[
            {"input": "(()", "output": "2"},
            {"input": ")()())", "output": "4"}
        ],
        hidden_test_cases=[
            {"input": "", "output": "0"},
            {"input": "()(()", "output": "2"},
            {"input": "()(())", "output": "6"}
        ],
        hints=[
            "Use a stack initialized with -1 to serve as the base boundary index.",
            "For '(', push its index onto the stack.",
            "For ')', pop the top index. If stack is empty, push current index as new boundary. Otherwise, valid length is current index - stack.top()."
        ],
        time_complexity="O(N)",
        space_complexity="O(N)",
        py_fn_name="longestValidParentheses",
        py_fn_params="s: str",
        py_fn_ret_type="int",
        py_sample_body="stack = [-1]\n    max_len = 0\n    for i, c in enumerate(s):\n        if c == '(':\n            stack.append(i)\n        else:\n            stack.pop()\n            if not stack:\n                stack.append(i)\n            else:\n                max_len = max(max_len, i - stack[-1])\n    return max_len",
        solution_explanation="Use a stack initialized with index -1. Opening brackets push their index. Closing brackets pop; remaining top index acts as the boundary of the matched substring."
    ),

    # ------------------ TOPIC 3: TWO POINTERS (8 questions: 3 Easy, 4 Medium, 1 Hard) ------------------
    make_problem(
        id="dsa_top150_remove_duplicates_from_sorted_array",
        number=28,
        title="Remove Duplicates from Sorted Array",
        topic_id="topic_two_pointers",
        subtopic="In-Place Read/Write Pointers",
        difficulty="EASY",
        roadmap_stage="Beginner Foundations",
        companies=["Microsoft", "Amazon", "Apple", "Meta"],
        description="Given an integer array nums sorted in non-decreasing order, remove the duplicates in-place such that each unique element appears only once. The relative order of the elements should be kept the same. Then return the number of unique elements in nums.",
        input_format="A single line of space-separated sorted integers.",
        output_format="Space-separated unique elements followed by length k.",
        constraints=["1 <= nums.length <= 3 * 10^4", "-100 <= nums[i] <= 100", "nums is sorted in non-decreasing order."],
        examples=[
            {"input": "1 1 2", "output": "1 2", "explanation": "2 unique elements: [1, 2]."},
            {"input": "0 0 1 1 1 2 2 3 3 4", "output": "0 1 2 3 4"}
        ],
        public_test_cases=[
            {"input": "1 1 2", "output": "1 2"},
            {"input": "0 0 1 1 1 2 2 3 3 4", "output": "0 1 2 3 4"}
        ],
        hidden_test_cases=[
            {"input": "1", "output": "1"},
            {"input": "1 2 3", "output": "1 2 3"},
            {"input": "-10 -10 -5 0 0 5", "output": "-10 -5 0 5"}
        ],
        hints=[
            "Since the array is sorted, duplicates are adjacent.",
            "Use a slow write pointer `k`.",
            "Whenever nums[i] != nums[k-1], write nums[k] = nums[i] and increment k."
        ],
        time_complexity="O(N)",
        space_complexity="O(1)",
        py_fn_name="removeDuplicates",
        py_fn_params="nums: list[int]",
        py_fn_ret_type="int",
        py_sample_body="if not nums: return 0\n    k = 1\n    for i in range(1, len(nums)):\n        if nums[i] != nums[i - 1]:\n            nums[k] = nums[i]\n            k += 1\n    return k",
        solution_explanation="Slow-fast pointers: slow pointer tracks the insertion point for unique items; fast pointer iterates over the list."
    ),

    make_problem(
        id="dsa_top150_029",
        number=29,
        title="Move Zeroes",
        topic_id="topic_two_pointers",
        subtopic="In-Place Partitioning",
        difficulty="EASY",
        roadmap_stage="Beginner Foundations",
        companies=["Meta", "Apple", "Amazon", "Microsoft"],
        description="Given an integer array nums, move all 0's to the end of it while maintaining the relative order of the non-zero elements.\n\nNote that you must do this in-place without making a copy of the array.",
        input_format="A single line of space-separated integers representing nums.",
        output_format="Space-separated integers after moving all zeroes to the end.",
        constraints=["1 <= nums.length <= 10^4", "-2^31 <= nums[i] <= 2^31 - 1"],
        examples=[
            {"input": "0 1 0 3 12", "output": "1 3 12 0 0"},
            {"input": "0", "output": "0"}
        ],
        public_test_cases=[
            {"input": "0 1 0 3 12", "output": "1 3 12 0 0"},
            {"input": "0", "output": "0"}
        ],
        hidden_test_cases=[
            {"input": "1 2 3", "output": "1 2 3"},
            {"input": "0 0 1", "output": "1 0 0"},
            {"input": "4 2 4 0 0 3 0 5 1 0", "output": "4 2 4 3 5 1 0 0 0 0"}
        ],
        hints=[
            "Maintain a write pointer `lastNonZero` initialized to 0.",
            "Iterate through the array. When nums[i] != 0, swap nums[lastNonZero] with nums[i] and increment lastNonZero.",
            "This preserves the relative order of non-zero elements in a single pass."
        ],
        time_complexity="O(N)",
        space_complexity="O(1)",
        py_fn_name="moveZeroes",
        py_fn_params="nums: list[int]",
        py_fn_ret_type="None",
        py_sample_body="last_non_zero = 0\n    for i in range(len(nums)):\n        if nums[i] != 0:\n            nums[last_non_zero], nums[i] = nums[i], nums[last_non_zero]\n            last_non_zero += 1",
        solution_explanation="Swap non-zero elements into the next available slot marked by last_non_zero pointer in O(N) time and O(1) space."
    ),

    make_problem(
        id="dsa_top150_030",
        number=30,
        title="Squares of a Sorted Array",
        topic_id="topic_two_pointers",
        subtopic="Two-End Comparison",
        difficulty="EASY",
        roadmap_stage="Beginner Foundations",
        companies=["Amazon", "Meta", "Google"],
        description="Given an integer array nums sorted in non-decreasing order, return an array of the squares of each number sorted in non-decreasing order.",
        input_format="A single line of space-separated sorted integers.",
        output_format="Space-separated integers representing sorted squares.",
        constraints=["1 <= nums.length <= 10^4", "-10^4 <= nums[i] <= 10^4", "nums is sorted in non-decreasing order."],
        examples=[
            {"input": "-4 -1 0 3 10", "output": "0 1 9 16 100", "explanation": "After squaring, the array becomes [16, 1, 0, 9, 100]. After sorting, it is [0, 1, 9, 16, 100]."},
            {"input": "-7 -3 2 3 11", "output": "4 9 9 49 121"}
        ],
        public_test_cases=[
            {"input": "-4 -1 0 3 10", "output": "0 1 9 16 100"},
            {"input": "-7 -3 2 3 11", "output": "4 9 9 49 121"}
        ],
        hidden_test_cases=[
            {"input": "-1", "output": "1"},
            {"input": "-5 -4 -3 -2 -1", "output": "1 4 9 16 25"}
        ],
        hints=[
            "The largest square must come from either the most negative number at the left or the largest positive number at the right.",
            "Use two pointers at opposite ends of the array.",
            "Fill the result array backwards from index n - 1 down to 0."
        ],
        time_complexity="O(N)",
        space_complexity="O(N)",
        py_fn_name="sortedSquares",
        py_fn_params="nums: list[int]",
        py_fn_ret_type="list[int]",
        py_sample_body="n = len(nums)\n    res = [0] * n\n    l, r, p = 0, n - 1, n - 1\n    while l <= r:\n        if abs(nums[l]) > abs(nums[r]):\n            res[p] = nums[l] ** 2\n            l += 1\n        else:\n            res[p] = nums[r] ** 2\n            r -= 1\n        p -= 1\n    return res",
        solution_explanation="Two pointers at the outer ends compare absolute values and place the larger square into the back of the result array."
    ),

    make_problem(
        id="dsa_top150_031",
        number=31,
        title="Two Sum II - Input Array Is Sorted",
        topic_id="topic_two_pointers",
        subtopic="Converging Pointers",
        difficulty="MEDIUM",
        roadmap_stage="Core Patterns",
        companies=["Amazon", "Apple", "Google"],
        description="Given a 1-indexed array of integers numbers that is already sorted in non-decreasing order, find two numbers such that they add up to a specific target number.\n\nReturn the indices of the two numbers, index1 and index2, added by one as an integer array [index1, index2] of length 2.",
        input_format="Line 1: N sorted integers\nLine 2: target integer",
        output_format="Two 1-indexed integers separated by space.",
        constraints=["2 <= numbers.length <= 3 * 10^4", "-1000 <= numbers[i] <= 1000", "numbers is sorted in non-decreasing order.", "Exactly one solution exists."],
        examples=[
            {"input": "2 7 11 15\n9", "output": "1 2", "explanation": "2 + 7 == 9. Indices are 1, 2."},
            {"input": "2 3 4\n6", "output": "1 3"},
            {"input": "-1 0\n-1", "output": "1 2"}
        ],
        public_test_cases=[
            {"input": "2 7 11 15\n9", "output": "1 2"},
            {"input": "2 3 4\n6", "output": "1 3"}
        ],
        hidden_test_cases=[
            {"input": "-1 0\n-1", "output": "1 2"},
            {"input": "1 2 3 4 4 9 56 90\n8", "output": "4 5"}
        ],
        hints=[
            "Since the array is sorted, you do not need a hash map.",
            "Pointers at left and right: if sum < target, increment left. If sum > target, decrement right.",
            "Remember to return 1-based indices."
        ],
        time_complexity="O(N)",
        space_complexity="O(1)",
        py_fn_name="twoSumSorted",
        py_fn_params="numbers: list[int], target: int",
        py_fn_ret_type="list[int]",
        py_sample_body="l, r = 0, len(numbers) - 1\n    while l < r:\n        s = numbers[l] + numbers[r]\n        if s == target: return [l + 1, r + 1]\n        elif s < target: l += 1\n        else: r -= 1\n    return []",
        solution_explanation="Converging pointers take advantage of the sorted monotonic property. Adjust left/right based on sum vs target."
    ),

    make_problem(
        id="dsa_top150_032",
        number=32,
        title="Three Sum",
        topic_id="topic_two_pointers",
        subtopic="Sorted 3-Sum Combination",
        difficulty="MEDIUM",
        roadmap_stage="Core Patterns",
        companies=["Amazon", "Meta", "Google", "Microsoft"],
        description="Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.\n\nNotice that the solution set must not contain duplicate triplets.",
        input_format="A single line of space-separated integers representing nums.",
        output_format="Each triplet on a separate line as space-separated integers, sorted.",
        constraints=["3 <= nums.length <= 3000", "-10^5 <= nums[i] <= 10^5"],
        examples=[
            {"input": "-1 0 1 2 -1 -4", "output": "-1 -1 2\n-1 0 1"},
            {"input": "0 1 1", "output": ""},
            {"input": "0 0 0", "output": "0 0 0"}
        ],
        public_test_cases=[
            {"input": "-1 0 1 2 -1 -4", "output": "-1 -1 2\n-1 0 1"},
            {"input": "0 0 0", "output": "0 0 0"}
        ],
        hidden_test_cases=[
            {"input": "0 1 1", "output": ""},
            {"input": "-2 0 1 1 2", "output": "-2 0 2\n-2 1 1"}
        ],
        hints=[
            "Sort the array first.",
            "Fix the first element nums[i]. Then use two pointers for the remaining subarray to find pairs summing to -nums[i].",
            "Skip duplicates for both the outer loop and the two pointers."
        ],
        time_complexity="O(N^2)",
        space_complexity="O(1)",
        py_fn_name="threeSum",
        py_fn_params="nums: list[int]",
        py_fn_ret_type="list[list[int]]",
        py_sample_body="nums.sort()\n    res = []\n    for i in range(len(nums) - 2):\n        if i > 0 and nums[i] == nums[i - 1]: continue\n        l, r = i + 1, len(nums) - 1\n        while l < r:\n            s = nums[i] + nums[l] + nums[r]\n            if s == 0:\n                res.append([nums[i], nums[l], nums[r]])\n                while l < r and nums[l] == nums[l + 1]: l += 1\n                while l < r and nums[r] == nums[r - 1]: r -= 1\n                l += 1; r -= 1\n            elif s < 0: l += 1\n            else: r -= 1\n    return res",
        solution_explanation="Sort array. For each index i, perform two-pointer search on remaining suffix for pair summing to -nums[i]. Deduplicate adjacent items."
    ),

    make_problem(
        id="dsa_top150_033",
        number=33,
        title="Container With Most Water",
        topic_id="topic_two_pointers",
        subtopic="Area Maximization",
        difficulty="MEDIUM",
        roadmap_stage="Core Patterns",
        companies=["Amazon", "Google", "Meta", "Apple"],
        description="You are given an integer array height of length n. There are n vertical lines drawn such that the two endpoints of the ith line are (i, 0) and (i, height[i]).\n\nFind two lines that together with the x-axis form a container, such that the container contains the most water.\n\nReturn the maximum amount of water a container can store.",
        input_format="A single line of space-separated integers representing vertical line heights.",
        output_format="Single integer representing the maximum trapped area.",
        constraints=["n == height.length", "2 <= n <= 10^5", "0 <= height[i] <= 10^4"],
        examples=[
            {"input": "1 8 6 2 5 4 8 3 7", "output": "49", "explanation": "The maximum area is obtained between index 1 and index 8: min(8, 7) * 7 = 49."},
            {"input": "1 1", "output": "1"}
        ],
        public_test_cases=[
            {"input": "1 8 6 2 5 4 8 3 7", "output": "49"},
            {"input": "1 1", "output": "1"}
        ],
        hidden_test_cases=[
            {"input": "4 3 2 1 4", "output": "16"},
            {"input": "1 2 1", "output": "2"}
        ],
        hints=[
            "Area is (right - left) * min(height[left], height[right]).",
            "Start with the widest container: left = 0, right = n - 1.",
            "To have any chance of increasing the area with a narrower width, you MUST move the pointer pointing to the shorter line."
        ],
        time_complexity="O(N)",
        space_complexity="O(1)",
        py_fn_name="maxArea",
        py_fn_params="height: list[int]",
        py_fn_ret_type="int",
        py_sample_body="l, r = 0, len(height) - 1\n    max_area = 0\n    while l < r:\n        h = min(height[l], height[r])\n        max_area = max(max_area, h * (r - l))\n        if height[l] < height[r]:\n            l += 1\n        else:\n            r -= 1\n    return max_area",
        solution_explanation="Two pointers start at the furthest boundaries. Always advance the pointer pointing to the smaller height, since area is limited by the minimum height."
    ),

    make_problem(
        id="dsa_top150_034",
        number=34,
        title="Sort Colors",
        topic_id="topic_two_pointers",
        subtopic="Dutch National Flag Partition",
        difficulty="MEDIUM",
        roadmap_stage="Core Patterns",
        companies=["Microsoft", "Amazon", "Meta"],
        description="Given an array nums with n objects colored red, white, or blue, sort them in-place so that objects of the same color are adjacent, with the colors in the order red, white, and blue.\n\nWe will use the integers 0, 1, and 2 to represent the color red, white, and blue, respectively.\n\nYou must solve this problem without using the library's sort function.",
        input_format="A single line of space-separated integers consisting of 0, 1, and 2.",
        output_format="Sorted space-separated integers.",
        constraints=["n == nums.length", "1 <= n <= 300", "nums[i] is either 0, 1, or 2."],
        examples=[
            {"input": "2 0 2 1 1 0", "output": "0 0 1 1 2 2"},
            {"input": "2 0 1", "output": "0 1 2"}
        ],
        public_test_cases=[
            {"input": "2 0 2 1 1 0", "output": "0 0 1 1 2 2"},
            {"input": "2 0 1", "output": "0 1 2"}
        ],
        hidden_test_cases=[
            {"input": "0", "output": "0"},
            {"input": "1", "output": "1"},
            {"input": "2 1 0", "output": "0 1 2"}
        ],
        hints=[
            "Dutch National Flag 3-way partitioning problem.",
            "Use three pointers: low, mid, high.",
            "If nums[mid] == 0: swap with low, mid++, low++. If nums[mid] == 1: mid++. If nums[mid] == 2: swap with high, high--."
        ],
        time_complexity="O(N)",
        space_complexity="O(1)",
        py_fn_name="sortColors",
        py_fn_params="nums: list[int]",
        py_fn_ret_type="None",
        py_sample_body="low, mid, high = 0, 0, len(nums) - 1\n    while mid <= high:\n        if nums[mid] == 0:\n            nums[low], nums[mid] = nums[mid], nums[low]\n            low += 1; mid += 1\n        elif nums[mid] == 1:\n            mid += 1\n        else:\n            nums[mid], nums[high] = nums[high], nums[mid]\n            high -= 1",
        solution_explanation="Dutch National Flag three-way partition. Low pointer tracks boundary of 0s, high tracks boundary of 2s, mid scans through array."
    ),

    make_problem(
        id="dsa_top150_035",
        number=35,
        title="Four Sum",
        topic_id="topic_two_pointers",
        subtopic="K-Sum Generalization",
        difficulty="HARD",
        roadmap_stage="Placement Revision",
        companies=["Amazon", "Apple", "Google"],
        description="Given an array nums of n integers, return an array of all the unique quadruplets [nums[a], nums[b], nums[c], nums[d]] such that:\n- 0 <= a, b, c, d < n\n- a, b, c, and d are distinct.\n- nums[a] + nums[b] + nums[c] + nums[d] == target\n\nYou may return the answer in any order.",
        input_format="Line 1: N integers\nLine 2: target integer",
        output_format="Each unique quadruplet on a separate line.",
        constraints=["1 <= nums.length <= 200", "-10^9 <= nums[i] <= 10^9", "-10^9 <= target <= 10^9"],
        examples=[
            {"input": "1 0 -1 0 -2 2\n0", "output": "-2 -1 1 2\n-2 0 0 2\n-1 0 0 1"},
            {"input": "2 2 2 2 2\n8", "output": "2 2 2 2"}
        ],
        public_test_cases=[
            {"input": "1 0 -1 0 -2 2\n0", "output": "-2 -1 1 2\n-2 0 0 2\n-1 0 0 1"},
            {"input": "2 2 2 2 2\n8", "output": "2 2 2 2"}
        ],
        hidden_test_cases=[
            {"input": "0 0 0 0\n0", "output": "0 0 0 0"},
            {"input": "-3 -2 -1 0 0 1 2 3\n0", "output": "-3 -2 2 3\n-3 -1 1 3\n-3 0 0 3\n-3 0 1 2\n-2 -1 0 3\n-2 -1 1 2\n-2 0 0 2\n-1 0 0 1"}
        ],
        hints=[
            "Sort the array first.",
            "Fix two outer loops (i and j), then use two pointers (left and right) for the remaining two elements.",
            "Skip duplicates across all loops to avoid duplicate quadruplets."
        ],
        time_complexity="O(N^3)",
        space_complexity="O(1)",
        py_fn_name="fourSum",
        py_fn_params="nums: list[int], target: int",
        py_fn_ret_type="list[list[int]]",
        py_sample_body="nums.sort()\n    res = []\n    n = len(nums)\n    for i in range(n - 3):\n        if i > 0 and nums[i] == nums[i - 1]: continue\n        for j in range(i + 1, n - 2):\n            if j > i + 1 and nums[j] == nums[j - 1]: continue\n            l, r = j + 1, n - 1\n            while l < r:\n                s = nums[i] + nums[j] + nums[l] + nums[r]\n                if s == target:\n                    res.append([nums[i], nums[j], nums[l], nums[r]])\n                    while l < r and nums[l] == nums[l + 1]: l += 1\n                    while l < r and nums[r] == nums[r - 1]: r -= 1\n                    l += 1; r -= 1\n                elif s < target: l += 1\n                else: r -= 1\n    return res",
        solution_explanation="Sort array. Two outer loops fix nums[i] and nums[j], two pointers find the remaining two numbers. Careful duplicate skipping prevents duplicates."
    ),

    # ------------------ TOPIC 4: SLIDING WINDOW (8 questions: 2 Easy, 4 Medium, 2 Hard) ------------------
    make_problem(
        id="dsa_top150_036",
        number=36,
        title="Maximum Average Subarray I",
        topic_id="topic_sliding_window",
        subtopic="Fixed-Size Sliding Window",
        difficulty="EASY",
        roadmap_stage="Beginner Foundations",
        companies=["Google", "Facebook"],
        description="You are given an integer array nums consisting of n elements, and an integer k.\n\nFind a contiguous subarray whose length is equal to k that has the maximum average value and return this value. Any answer with a calculation error less than 10^-5 will be accepted.",
        input_format="Line 1: N space-separated integers\nLine 2: integer k",
        output_format="Decimal number representing max average rounded to 5 decimal places.",
        constraints=["n == nums.length", "1 <= k <= n <= 10^5", "-10^4 <= nums[i] <= 10^4"],
        examples=[
            {"input": "1 12 -5 -6 50 3\n4", "output": "12.75000", "explanation": "Maximum average is (12 - 5 - 6 + 50) / 4 = 51 / 4 = 12.75."},
            {"input": "5\n1", "output": "5.00000"}
        ],
        public_test_cases=[
            {"input": "1 12 -5 -6 50 3\n4", "output": "12.75000"},
            {"input": "5\n1", "output": "5.00000"}
        ],
        hidden_test_cases=[
            {"input": "0 4 0 3 2\n1", "output": "4.00000"},
            {"input": "-1\n1", "output": "-1.00000"}
        ],
        hints=[
            "Calculate the sum of the first k elements.",
            "Slide the window by 1 element at a time: add the new incoming element and subtract the outgoing element.",
            "Track the maximum sum and divide by k at the end."
        ],
        time_complexity="O(N)",
        space_complexity="O(1)",
        py_fn_name="findMaxAverage",
        py_fn_params="nums: list[int], k: int",
        py_fn_ret_type="float",
        py_sample_body="curr_sum = sum(nums[:k])\n    max_sum = curr_sum\n    for i in range(k, len(nums)):\n        curr_sum += nums[i] - nums[i - k]\n        max_sum = max(max_sum, curr_sum)\n    return max_sum / k",
        solution_explanation="Compute initial window sum of length k. Slide window one index right by adding nums[i] and subtracting nums[i - k]. Maximum sum divided by k yields result in O(N)."
    ),

    make_problem(
        id="dsa_top150_037",
        number=37,
        title="Maximum Sum Subarray of Size K",
        topic_id="topic_sliding_window",
        subtopic="Fixed Window Extremum",
        difficulty="EASY",
        roadmap_stage="Beginner Foundations",
        companies=["Amazon", "Microsoft"],
        description="Given an array of positive integers nums and an integer k, find the maximum sum of any contiguous subarray of size k.",
        input_format="Line 1: N space-separated integers\nLine 2: integer k",
        output_format="Single integer representing maximum sum.",
        constraints=["1 <= k <= nums.length <= 10^5", "1 <= nums[i] <= 10^4"],
        examples=[
            {"input": "2 1 5 1 3 2\n3", "output": "9", "explanation": "Subarray [5, 1, 3] gives maximum sum 9."},
            {"input": "2 3 4 1 5\n2", "output": "7", "explanation": "Subarray [3, 4] gives maximum sum 7."}
        ],
        public_test_cases=[
            {"input": "2 1 5 1 3 2\n3", "output": "9"},
            {"input": "2 3 4 1 5\n2", "output": "7"}
        ],
        hidden_test_cases=[
            {"input": "1 2 3 4 5 6\n1", "output": "6"},
            {"input": "10 20 30 40\n4", "output": "100"}
        ],
        hints=[
            "Fixed-size window of length k.",
            "Slide the window by adding the right element and subtracting the left element.",
            "Record the max value across all window positions."
        ],
        time_complexity="O(N)",
        space_complexity="O(1)",
        py_fn_name="maxSubarraySumK",
        py_fn_params="nums: list[int], k: int",
        py_fn_ret_type="int",
        py_sample_body="curr = sum(nums[:k])\n    ans = curr\n    for i in range(k, len(nums)):\n        curr += nums[i] - nums[i - k]\n        ans = max(ans, curr)\n    return ans",
        solution_explanation="Slide a window of size k across the array, adding the entering element and subtracting the leaving element."
    ),

    make_problem(
        id="dsa_top150_038",
        number=38,
        title="Longest Substring Without Repeating Characters",
        topic_id="topic_sliding_window",
        subtopic="Dynamic Window with Last Seen Index",
        difficulty="MEDIUM",
        roadmap_stage="Core Patterns",
        companies=["Amazon", "Google", "Meta", "Bloomberg", "Apple"],
        description="Given a string s, find the length of the longest substring without repeating characters.",
        input_format="A single line containing string s.",
        output_format="Single integer representing the maximum length.",
        constraints=["0 <= s.length <= 5 * 10^4", "s consists of English letters, digits, symbols and spaces."],
        examples=[
            {"input": "abcabcbb", "output": "3", "explanation": "The answer is \"abc\", with the length of 3."},
            {"input": "bbbbb", "output": "1", "explanation": "The answer is \"b\", with the length of 1."},
            {"input": "pwwkew", "output": "3", "explanation": "The answer is \"wke\", with the length of 3."}
        ],
        public_test_cases=[
            {"input": "abcabcbb", "output": "3"},
            {"input": "bbbbb", "output": "1"}
        ],
        hidden_test_cases=[
            {"input": "pwwkew", "output": "3"},
            {"input": "", "output": "0"},
            {"input": "abba", "output": "2"}
        ],
        hints=[
            "Use a sliding window [start, end].",
            "Keep a hash map of character -> last seen index.",
            "When seeing a duplicate character that appeared at or after `start`, move `start` to `last_seen[char] + 1`."
        ],
        time_complexity="O(N)",
        space_complexity="O(min(N, Alphabet))",
        py_fn_name="lengthOfLongestSubstring",
        py_fn_params="s: str",
        py_fn_ret_type="int",
        py_sample_body="seen = {}\n    start = 0\n    max_len = 0\n    for i, c in enumerate(s):\n        if c in seen and seen[c] >= start:\n            start = seen[c] + 1\n        seen[c] = i\n        max_len = max(max_len, i - start + 1)\n    return max_len",
        solution_explanation="Map each character to its most recent index. When a duplicate is seen inside current window, jump start pointer past the previous occurrence."
    ),

    make_problem(
        id="dsa_top150_039",
        number=39,
        title="Minimum Size Subarray Sum",
        topic_id="topic_sliding_window",
        subtopic="Dynamic Window Shrink",
        difficulty="MEDIUM",
        roadmap_stage="Core Patterns",
        companies=["Amazon", "Google", "Meta"],
        description="Given an array of positive integers nums and a positive integer target, return the minimal length of a subarray whose sum is greater than or equal to target. If there is no such subarray, return 0 instead.",
        input_format="Line 1: target integer\nLine 2: N space-separated positive integers",
        output_format="Single integer representing minimal subarray length, or 0.",
        constraints=["1 <= target <= 10^9", "1 <= nums.length <= 10^5", "1 <= nums[i] <= 10^4"],
        examples=[
            {"input": "7\n2 3 1 2 4 3", "output": "2", "explanation": "The subarray [4,3] has the minimal length under the problem constraint."},
            {"input": "4\n1 4 4", "output": "1"},
            {"input": "11\n1 1 1 1 1 1 1 1", "output": "0"}
        ],
        public_test_cases=[
            {"input": "7\n2 3 1 2 4 3", "output": "2"},
            {"input": "4\n1 4 4", "output": "1"}
        ],
        hidden_test_cases=[
            {"input": "11\n1 1 1 1 1 1 1 1", "output": "0"},
            {"input": "15\n1 2 3 4 5", "output": "5"}
        ],
        hints=[
            "Use a sliding window [l, r].",
            "Expand r, adding nums[r] to running sum.",
            "While running sum >= target: update minimum length, subtract nums[l], and advance l."
        ],
        time_complexity="O(N)",
        space_complexity="O(1)",
        py_fn_name="minSubArrayLen",
        py_fn_params="target: int, nums: list[int]",
        py_fn_ret_type="int",
        py_sample_body="l = 0\n    curr_sum = 0\n    ans = float('inf')\n    for r in range(len(nums)):\n        curr_sum += nums[r]\n        while curr_sum >= target:\n            ans = min(ans, r - l + 1)\n            curr_sum -= nums[l]\n            l += 1\n    return ans if ans != float('inf') else 0",
        solution_explanation="Expand right pointer to reach target sum, then shrink left pointer as much as possible while maintaining >= target."
    ),

    make_problem(
        id="dsa_top150_040",
        number=40,
        title="Permutation in String",
        topic_id="topic_sliding_window",
        subtopic="Fixed-Size Frequency Matching",
        difficulty="MEDIUM",
        roadmap_stage="Core Patterns",
        companies=["Microsoft", "Meta", "Amazon"],
        description="Given two strings s1 and s2, return true if s2 contains a permutation of s1, or false otherwise.\n\nIn other words, return true if one of s1's permutations is the substring of s2.",
        input_format="Line 1: string s1\nLine 2: string s2",
        output_format="true or false",
        constraints=["1 <= s1.length, s2.length <= 10^4", "s1 and s2 consist of lowercase English letters."],
        examples=[
            {"input": "ab\neidbaooo", "output": "true", "explanation": "s2 contains one permutation of s1 (\"ba\")."},
            {"input": "ab\neidboaoo", "output": "false"}
        ],
        public_test_cases=[
            {"input": "ab\neidbaooo", "output": "true"},
            {"input": "ab\neidboaoo", "output": "false"}
        ],
        hidden_test_cases=[
            {"input": "adc\ndcda", "output": "true"},
            {"input": "hello\nooolleoooleh", "output": "false"}
        ],
        hints=[
            "A permutation must have the exact same length and character counts as s1.",
            "Use a sliding window of length len(s1) across s2.",
            "Compare frequency arrays or maintain a count of matching characters."
        ],
        time_complexity="O(N)",
        space_complexity="O(1)",
        py_fn_name="checkInclusion",
        py_fn_params="s1: str, s2: str",
        py_fn_ret_type="bool",
        py_sample_body="if len(s1) > len(s2): return False\n    c1, c2 = [0] * 26, [0] * 26\n    for i in range(len(s1)):\n        c1[ord(s1[i]) - 97] += 1\n        c2[ord(s2[i]) - 97] += 1\n    if c1 == c2: return True\n    for i in range(len(s1), len(s2)):\n        c2[ord(s2[i]) - 97] += 1\n        c2[ord(s2[i - len(s1)]) - 97] -= 1\n        if c1 == c2: return True\n    return False",
        solution_explanation="Maintain frequency buffer of size len(s1) across s2. Slide window right by 1, checking if frequency array matches s1's frequency."
    ),

    make_problem(
        id="dsa_top150_041",
        number=41,
        title="Find All Anagrams in a String",
        topic_id="topic_sliding_window",
        subtopic="Sliding Window Multi-Match",
        difficulty="MEDIUM",
        roadmap_stage="Core Patterns",
        companies=["Amazon", "Meta", "Google"],
        description="Given two strings s and p, return an array of all the start indices of p's anagrams in s. You may return the answer in any order.\n\nAn Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.",
        input_format="Line 1: string s\nLine 2: string p",
        output_format="Space-separated starting indices.",
        constraints=["1 <= s.length, p.length <= 3 * 10^4", "s and p consist of lowercase English letters."],
        examples=[
            {"input": "cbaebabacd\nabc", "output": "0 6", "explanation": "The substring with start index = 0 is \"cba\", which is an anagram of \"abc\". The substring with start index = 6 is \"bac\", which is an anagram of \"abc\"."},
            {"input": "abab\nab", "output": "0 1 2", "explanation": "Substrings at indices 0, 1, 2 are anagrams."}
        ],
        public_test_cases=[
            {"input": "cbaebabacd\nabc", "output": "0 6"},
            {"input": "abab\nab", "output": "0 1 2"}
        ],
        hidden_test_cases=[
            {"input": "a\na", "output": "0"},
            {"input": "aaaaaaaaaa\naaaaa", "output": "0 1 2 3 4 5"}
        ],
        hints=[
            "Fixed window of length len(p).",
            "Track character counts of p and current window in s.",
            "Record starting index whenever window character counts match p."
        ],
        time_complexity="O(N)",
        space_complexity="O(1)",
        py_fn_name="findAnagrams",
        py_fn_params="s: str, p: str",
        py_fn_ret_type="list[int]",
        py_sample_body="if len(p) > len(s): return []\n    p_count = [0] * 26\n    s_count = [0] * 26\n    for i in range(len(p)):\n        p_count[ord(p[i]) - 97] += 1\n        s_count[ord(s[i]) - 97] += 1\n    res = [0] if p_count == s_count else []\n    for i in range(len(p), len(s)):\n        s_count[ord(s[i]) - 97] += 1\n        s_count[ord(s[i - len(p)]) - 97] -= 1\n        if s_count == p_count:\n            res.append(i - len(p) + 1)\n    return res",
        solution_explanation="Fixed window of length len(p) sliding over s. Update rolling character frequency counts and record start index whenever counts match."
    ),

    make_problem(
        id="dsa_top150_042",
        number=42,
        title="Longest Repeating Character Replacement",
        topic_id="topic_sliding_window",
        subtopic="Frequency Cap Window",
        difficulty="HARD",
        roadmap_stage="Placement Revision",
        companies=["Google", "Amazon", "Meta"],
        description="You are given a string s and an integer k. You can choose any character of the string and change it to any other uppercase English character. You can perform this operation at most k times.\n\nReturn the length of the longest substring containing the same letter you can get after performing the above operations.",
        input_format="Line 1: string s\nLine 2: integer k",
        output_format="Single integer representing maximum substring length.",
        constraints=["1 <= s.length <= 10^5", "s consists of only uppercase English letters.", "0 <= k <= s.length"],
        examples=[
            {"input": "ABAB\n2", "output": "4", "explanation": "Replace the two 'A's with two 'B's or vice versa."},
            {"input": "AABABBA\n1", "output": "4", "explanation": "Replace the one 'A' in the middle with 'B' and form \"AABBBBA\". The substring \"BBBB\" has length 4."}
        ],
        public_test_cases=[
            {"input": "ABAB\n2", "output": "4"},
            {"input": "AABABBA\n1", "output": "4"}
        ],
        hidden_test_cases=[
            {"input": "AAAA\n2", "output": "4"},
            {"input": "ABBB\n2", "output": "4"}
        ],
        hints=[
            "Window length is (r - l + 1).",
            "Number of characters to replace is (window length - max_frequency_of_single_char).",
            "If (window length - max_frequency) > k, shrink window from left."
        ],
        time_complexity="O(N)",
        space_complexity="O(1)",
        py_fn_name="characterReplacement",
        py_fn_params="s: str, k: int",
        py_fn_ret_type="int",
        py_sample_body="counts = {}\n    max_f = 0\n    l = 0\n    res = 0\n    for r in range(len(s)):\n        counts[s[r]] = counts.get(s[r], 0) + 1\n        max_f = max(max_f, counts[s[r]])\n        while (r - l + 1) - max_f > k:\n            counts[s[l]] -= 1\n            l += 1\n        res = max(res, r - l + 1)\n    return res",
        solution_explanation="Dynamic sliding window where valid condition is (window_length - max_char_frequency <= k). Expand right, and shrink left when replacement budget is exceeded."
    ),

    make_problem(
        id="dsa_top150_043",
        number=43,
        title="Sliding Window Maximum",
        topic_id="topic_sliding_window",
        subtopic="Monotonic Deque",
        difficulty="HARD",
        roadmap_stage="Placement Revision",
        companies=["Amazon", "Google", "Meta", "Microsoft"],
        description="You are given an array of integers nums, there is a sliding window of size k which is moving from the very left of the array to the very right. You can only see the k numbers in the window. Each time the sliding window moves right by one position.\n\nReturn the max sliding window.",
        input_format="Line 1: N space-separated integers\nLine 2: integer k",
        output_format="Space-separated integers representing maximum in each window.",
        constraints=["1 <= nums.length <= 10^5", "-10^4 <= nums[i] <= 10^4", "1 <= k <= nums.length"],
        examples=[
            {"input": "1 3 -1 -3 5 3 6 7\n3", "output": "3 3 5 5 6 7", "explanation": "Window positions: [1, 3, -1]->3, [3, -1, -3]->3, [-1, -3, 5]->5, [-3, 5, 3]->5, [5, 3, 6]->6, [3, 6, 7]->7."},
            {"input": "1\n1", "output": "1"}
        ],
        public_test_cases=[
            {"input": "1 3 -1 -3 5 3 6 7\n3", "output": "3 3 5 5 6 7"},
            {"input": "1\n1", "output": "1"}
        ],
        hidden_test_cases=[
            {"input": "9 11\n2", "output": "11"},
            {"input": "4 -2\n2", "output": "4"}
        ],
        hints=[
            "A heap gives O(N log k). Can you do O(N) using a Monotonic Deque?",
            "Store indices in the deque in decreasing order of their corresponding values.",
            "Remove elements outside current window (index <= i - k) from front, and remove smaller elements from back before inserting nums[i]."
        ],
        time_complexity="O(N)",
        space_complexity="O(K)",
        py_fn_name="maxSlidingWindow",
        py_fn_params="nums: list[int], k: int",
        py_fn_ret_type="list[int]",
        py_sample_body="from collections import deque\n    q = deque()\n    res = []\n    for i, x in enumerate(nums):\n        if q and q[0] <= i - k:\n            q.popleft()\n        while q and nums[q[-1]] <= x:\n            q.pop()\n        q.append(i)\n        if i >= k - 1:\n            res.append(nums[q[0]])\n    return res",
        solution_explanation="Monotonic deque maintains indices in descending order of value. Head of deque is always the maximum for current window of size k. Operates in linear O(N) time."
    )
]

print(f"Part 1 loaded with {len(part1_problems)} problems.")
