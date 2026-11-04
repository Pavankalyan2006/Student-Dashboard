from dsa_builder_helper import make_problem

part2_problems = [
    # ------------------ TOPIC 5: BINARY SEARCH (8 questions: 2 Easy, 4 Medium, 2 Hard) ------------------
    make_problem(
        id="dsa_prob_binary_search",
        number=44,
        title="Classic Binary Search",
        topic_id="topic_binary_search",
        subtopic="Logarithmic Halving",
        difficulty="EASY",
        roadmap_stage="Beginner Foundations",
        companies=["Google", "Amazon", "Microsoft", "Apple"],
        description="Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums. If target exists, then return its index. Otherwise, return -1.\n\nYou must write an algorithm with O(log n) runtime complexity.",
        input_format="Line 1: N space-separated integers in ascending order\nLine 2: target integer",
        output_format="0-based index of target, or -1.",
        constraints=["1 <= nums.length <= 10^4", "-10^4 < nums[i], target < 10^4", "All the integers in nums are unique.", "nums is sorted in ascending order."],
        examples=[
            {"input": "-1 0 3 5 9 12\n9", "output": "4", "explanation": "9 exists in nums and its index is 4."},
            {"input": "-1 0 3 5 9 12\n2", "output": "-1", "explanation": "2 does not exist in nums so return -1."}
        ],
        public_test_cases=[
            {"input": "-1 0 3 5 9 12\n9", "output": "4"},
            {"input": "-1 0 3 5 9 12\n2", "output": "-1"}
        ],
        hidden_test_cases=[
            {"input": "5\n5", "output": "0"},
            {"input": "1 3 5 7 9\n1", "output": "0"},
            {"input": "1 3 5 7 9\n10", "output": "-1"}
        ],
        hints=[
            "Maintain search boundaries left and right.",
            "Compute mid = left + (right - left) // 2.",
            "If nums[mid] == target return mid. If nums[mid] < target, left = mid + 1, else right = mid - 1."
        ],
        time_complexity="O(log N)",
        space_complexity="O(1)",
        py_fn_name="binarySearch",
        py_fn_params="nums: list[int], target: int",
        py_fn_ret_type="int",
        py_sample_body="l, r = 0, len(nums) - 1\n    while l <= r:\n        m = (l + r) // 2\n        if nums[m] == target: return m\n        elif nums[m] < target: l = m + 1\n        else: r = m - 1\n    return -1",
        solution_explanation="Standard binary search halving search space at each iteration. O(log N) time, O(1) space."
    ),

    make_problem(
        id="dsa_top150_045",
        number=45,
        title="Search Insert Position",
        topic_id="topic_binary_search",
        subtopic="Lower Bound Binary Search",
        difficulty="EASY",
        roadmap_stage="Beginner Foundations",
        companies=["Amazon", "Google", "Microsoft"],
        description="Given a sorted array of distinct integers and a target value, return the index if the target is found. If not, return the index where it would be if it were inserted in order.\n\nYou must write an algorithm with O(log n) runtime complexity.",
        input_format="Line 1: N space-separated sorted integers\nLine 2: target integer",
        output_format="Integer insertion index.",
        constraints=["1 <= nums.length <= 10^4", "-10^4 <= nums[i] <= 10^4", "nums contains distinct values sorted in ascending order."],
        examples=[
            {"input": "1 3 5 6\n5", "output": "2"},
            {"input": "1 3 5 6\n2", "output": "1"},
            {"input": "1 3 5 6\n7", "output": "4"}
        ],
        public_test_cases=[
            {"input": "1 3 5 6\n5", "output": "2"},
            {"input": "1 3 5 6\n2", "output": "1"}
        ],
        hidden_test_cases=[
            {"input": "1 3 5 6\n7", "output": "4"},
            {"input": "1 3 5 6\n0", "output": "0"}
        ],
        hints=[
            "Find the first element that is greater than or equal to target.",
            "If target is not found, the `left` pointer will end up pointing precisely to the insertion point.",
            "Return `left` after the loop terminates."
        ],
        time_complexity="O(log N)",
        space_complexity="O(1)",
        py_fn_name="searchInsert",
        py_fn_params="nums: list[int], target: int",
        py_fn_ret_type="int",
        py_sample_body="l, r = 0, len(nums) - 1\n    while l <= r:\n        m = (l + r) // 2\n        if nums[m] == target: return m\n        elif nums[m] < target: l = m + 1\n        else: r = m - 1\n    return l",
        solution_explanation="Binary search lower bound: left pointer advances whenever nums[mid] < target, terminating exactly at the insertion point."
    ),

    make_problem(
        id="dsa_top150_046",
        number=46,
        title="First and Last Position of an Element in Sorted Array",
        topic_id="topic_binary_search",
        subtopic="Dual Bound Binary Search",
        difficulty="MEDIUM",
        roadmap_stage="Core Patterns",
        companies=["Google", "Facebook", "Amazon", "Microsoft"],
        description="Given an array of integers nums sorted in non-decreasing order, find the starting and ending position of a given target value.\n\nIf target is not found in the array, return [-1, -1].\n\nYou must write an algorithm with O(log n) runtime complexity.",
        input_format="Line 1: N space-separated sorted integers\nLine 2: target integer",
        output_format="Two space-separated integers representing first and last index.",
        constraints=["0 <= nums.length <= 10^5", "-10^9 <= nums[i] <= 10^9", "nums is a non-decreasing array."],
        examples=[
            {"input": "5 7 7 8 8 10\n8", "output": "3 4", "explanation": "8 starts at index 3 and ends at index 4."},
            {"input": "5 7 7 8 8 10\n6", "output": "-1 -1"},
            {"input": "\n0", "output": "-1 -1"}
        ],
        public_test_cases=[
            {"input": "5 7 7 8 8 10\n8", "output": "3 4"},
            {"input": "5 7 7 8 8 10\n6", "output": "-1 -1"}
        ],
        hidden_test_cases=[
            {"input": "1\n1", "output": "0 0"},
            {"input": "2 2\n2", "output": "0 1"}
        ],
        hints=[
            "Run binary search twice: once to find the leftmost index, and once for the rightmost index.",
            "Left search: when nums[mid] == target, continue searching in left half (right = mid - 1).",
            "Right search: when nums[mid] == target, continue searching in right half (left = mid + 1)."
        ],
        time_complexity="O(log N)",
        space_complexity="O(1)",
        py_fn_name="searchRange",
        py_fn_params="nums: list[int], target: int",
        py_fn_ret_type="list[int]",
        py_sample_body="def findBound(is_first):\n        l, r, ans = 0, len(nums) - 1, -1\n        while l <= r:\n            m = (l + r) // 2\n            if nums[m] == target:\n                ans = m\n                if is_first: r = m - 1\n                else: l = m + 1\n            elif nums[m] < target: l = m + 1\n            else: r = m - 1\n        return ans\n    return [findBound(True), findBound(False)]",
        solution_explanation="Two binary search passes: left search caches match and pushes right boundary left; right search caches match and pushes left boundary right."
    ),

    make_problem(
        id="dsa_top150_047",
        number=47,
        title="Search in Rotated Sorted Array",
        topic_id="topic_binary_search",
        subtopic="Rotated Array Invariant",
        difficulty="MEDIUM",
        roadmap_stage="Core Patterns",
        companies=["Amazon", "Meta", "Google", "Apple", "Microsoft"],
        description="There is an integer array nums sorted in ascending order (with distinct values). Prior to being passed to your function, nums is possibly rotated at an unknown pivot index.\n\nGiven the array nums after the possible rotation and an integer target, return the index of target if it is in nums, or -1 if it is not in nums.\n\nYou must write an algorithm with O(log n) runtime complexity.",
        input_format="Line 1: N space-separated rotated sorted integers\nLine 2: target integer",
        output_format="0-based index of target, or -1.",
        constraints=["1 <= nums.length <= 5000", "-10^4 <= nums[i] <= 10^4", "All values of nums are unique."],
        examples=[
            {"input": "4 5 6 7 0 1 2\n0", "output": "4", "explanation": "0 is found at index 4."},
            {"input": "4 5 6 7 0 1 2\n3", "output": "-1"},
            {"input": "1\n0", "output": "-1"}
        ],
        public_test_cases=[
            {"input": "4 5 6 7 0 1 2\n0", "output": "4"},
            {"input": "4 5 6 7 0 1 2\n3", "output": "-1"}
        ],
        hidden_test_cases=[
            {"input": "1\n1", "output": "0"},
            {"input": "3 1\n1", "output": "1"}
        ],
        hints=[
            "At least one half of the array (left or right of mid) is always strictly sorted.",
            "Determine which half is normally sorted: if nums[left] <= nums[mid], left half is sorted.",
            "Check if target lies inside the boundaries of the sorted half to decide which direction to branch."
        ],
        time_complexity="O(log N)",
        space_complexity="O(1)",
        py_fn_name="searchRotated",
        py_fn_params="nums: list[int], target: int",
        py_fn_ret_type="int",
        py_sample_body="l, r = 0, len(nums) - 1\n    while l <= r:\n        m = (l + r) // 2\n        if nums[m] == target: return m\n        if nums[l] <= nums[m]:\n            if nums[l] <= target < nums[m]: r = m - 1\n            else: l = m + 1\n        else:\n            if nums[m] < target <= nums[r]: l = m + 1\n            else: r = m - 1\n    return -1",
        solution_explanation="Identify whether left or right half is monotonically sorted. If target falls in sorted range, recurse there; otherwise search the other half."
    ),

    make_problem(
        id="dsa_top150_048",
        number=48,
        title="Find Minimum in Rotated Sorted Array",
        topic_id="topic_binary_search",
        subtopic="Inflection Point Detection",
        difficulty="MEDIUM",
        roadmap_stage="Core Patterns",
        companies=["Amazon", "Microsoft", "Meta"],
        description="Suppose an array of length n sorted in ascending order is rotated between 1 and n times.\n\nGiven the sorted rotated array nums of unique elements, return the minimum element of this array.\n\nYou must write an algorithm that runs in O(log n) time.",
        input_format="A single line of space-separated integers representing rotated array.",
        output_format="The minimum integer value.",
        constraints=["n == nums.length", "1 <= n <= 5000", "-5000 <= nums[i] <= 5000", "All the integers of nums are unique."],
        examples=[
            {"input": "3 4 5 1 2", "output": "1", "explanation": "The original array was [1,2,3,4,5] rotated 3 times."},
            {"input": "4 5 6 7 0 1 2", "output": "0"}
        ],
        public_test_cases=[
            {"input": "3 4 5 1 2", "output": "1"},
            {"input": "4 5 6 7 0 1 2", "output": "0"}
        ],
        hidden_test_cases=[
            {"input": "11 13 15 17", "output": "11"},
            {"input": "2 1", "output": "1"}
        ],
        hints=[
            "Compare nums[mid] with nums[right].",
            "If nums[mid] > nums[right], the minimum MUST lie in the right half (left = mid + 1).",
            "If nums[mid] < nums[right], the minimum is in the left half including mid (right = mid)."
        ],
        time_complexity="O(log N)",
        space_complexity="O(1)",
        py_fn_name="findMinRotated",
        py_fn_params="nums: list[int]",
        py_fn_ret_type="int",
        py_sample_body="l, r = 0, len(nums) - 1\n    while l < r:\n        m = (l + r) // 2\n        if nums[m] > nums[r]: l = m + 1\n        else: r = m\n    return nums[l]",
        solution_explanation="Compare mid with right boundary. If nums[mid] > nums[right], the pivot/inflection point lies to the right; else it lies at or to the left of mid."
    ),

    make_problem(
        id="dsa_top150_049",
        number=49,
        title="Find Peak Element",
        topic_id="topic_binary_search",
        subtopic="Local Gradient Ascent",
        difficulty="MEDIUM",
        roadmap_stage="Core Patterns",
        companies=["Meta", "Google", "Amazon"],
        description="A peak element is an element that is strictly greater than its neighbors.\n\nGiven a 0-indexed integer array nums, find a peak element, and return its index. If the array contains multiple peaks, return the index to any of the peaks.\n\nYou may imagine that nums[-1] = nums[n] = -∞.\n\nYou must write an algorithm that runs in O(log n) time.",
        input_format="A single line of space-separated integers representing nums.",
        output_format="0-based index of any peak element.",
        constraints=["1 <= nums.length <= 1000", "-2^31 <= nums[i] <= 2^31 - 1", "nums[i] != nums[i + 1] for all valid i."],
        examples=[
            {"input": "1 2 3 1", "output": "2", "explanation": "3 is a peak element and your function should return the index number 2."},
            {"input": "1 2 1 3 5 6 4", "output": "5", "explanation": "Index 5 (value 6) is a peak."}
        ],
        public_test_cases=[
            {"input": "1 2 3 1", "output": "2"},
            {"input": "1 2 1 3 5 6 4", "output": "5"}
        ],
        hidden_test_cases=[
            {"input": "1", "output": "0"},
            {"input": "1 2", "output": "1"}
        ],
        hints=[
            "Compare nums[mid] with nums[mid + 1].",
            "If nums[mid] < nums[mid + 1], you are on an ascending slope, so a peak is guaranteed to exist on the right.",
            "Otherwise, you are on a descending slope, so a peak is on the left (including mid)."
        ],
        time_complexity="O(log N)",
        space_complexity="O(1)",
        py_fn_name="findPeakElement",
        py_fn_params="nums: list[int]",
        py_fn_ret_type="int",
        py_sample_body="l, r = 0, len(nums) - 1\n    while l < r:\n        m = (l + r) // 2\n        if nums[m] < nums[m + 1]: l = m + 1\n        else: r = m\n    return l",
        solution_explanation="Binary search gradient ascent: move toward the higher neighbor because an uphill climb with -inf boundaries is guaranteed to terminate at a local peak."
    ),

    make_problem(
        id="dsa_top150_050",
        number=50,
        title="Search a 2D Matrix",
        topic_id="topic_binary_search",
        subtopic="Flattened Matrix Binary Search",
        difficulty="HARD",
        roadmap_stage="Placement Revision",
        companies=["Amazon", "Microsoft", "Meta"],
        description="You are given an m x n integer matrix matrix with the following two properties:\n- Each row is sorted in non-decreasing order.\n- The first integer of each row is greater than the last integer of the previous row.\n\nGiven an integer target, return true if target is in matrix or false otherwise.\n\nYou must write a solution in O(log(m * n)) time complexity.",
        input_format="Line 1: m n (dimensions)\nNext m lines: n space-separated integers\nLast line: target integer",
        output_format="true or false",
        constraints=["m == matrix.length", "n == matrix[i].length", "1 <= m, n <= 100", "-10^4 <= matrix[i][j], target <= 10^4"],
        examples=[
            {"input": "3 4\n1 3 5 7\n10 11 16 20\n23 30 34 60\n3", "output": "true", "explanation": "3 exists in row 0."},
            {"input": "3 4\n1 3 5 7\n10 11 16 20\n23 30 34 60\n13", "output": "false"}
        ],
        public_test_cases=[
            {"input": "3 4\n1 3 5 7\n10 11 16 20\n23 30 34 60\n3", "output": "true"},
            {"input": "3 4\n1 3 5 7\n10 11 16 20\n23 30 34 60\n13", "output": "false"}
        ],
        hidden_test_cases=[
            {"input": "1 1\n1\n1", "output": "true"},
            {"input": "1 2\n1 3\n3", "output": "true"}
        ],
        hints=[
            "Treat the m x n matrix as a single 1D sorted array of length m * n.",
            "Map 1D index `idx` to 2D coordinates: row = idx // n, col = idx % n.",
            "Perform standard binary search over the range [0, m * n - 1]."
        ],
        time_complexity="O(log(M * N))",
        space_complexity="O(1)",
        py_fn_name="searchMatrix",
        py_fn_params="matrix: list[list[int]], target: int",
        py_fn_ret_type="bool",
        py_sample_body="m, n = len(matrix), len(matrix[0])\n    l, r = 0, m * n - 1\n    while l <= r:\n        mid = (l + r) // 2\n        val = matrix[mid // n][mid % n]\n        if val == target: return True\n        elif val < target: l = mid + 1\n        else: r = mid - 1\n    return False",
        solution_explanation="Virtual 1D array binary search: map 1D index `mid` to 2D matrix cell (mid // n, mid % n). Full O(log(M * N)) logarithmic performance."
    ),

    make_problem(
        id="dsa_top150_051",
        number=51,
        title="Median of Two Sorted Arrays",
        topic_id="topic_binary_search",
        subtopic="Dual Array Partition Binary Search",
        difficulty="HARD",
        roadmap_stage="Placement Revision",
        companies=["Google", "Amazon", "Apple", "Microsoft"],
        description="Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.\n\nThe overall run time complexity should be O(log (m+n)).",
        input_format="Line 1: space-separated integers nums1\nLine 2: space-separated integers nums2",
        output_format="Median formatted to 5 decimal places.",
        constraints=["nums1.length == m", "nums2.length == n", "0 <= m, n <= 1000", "1 <= m + n <= 2000", "-10^6 <= nums1[i], nums2[i] <= 10^6"],
        examples=[
            {"input": "1 3\n2", "output": "2.00000", "explanation": "merged array = [1,2,3] and median is 2."},
            {"input": "1 2\n3 4", "output": "2.50000", "explanation": "merged array = [1,2,3,4] and median is (2 + 3) / 2 = 2.5."}
        ],
        public_test_cases=[
            {"input": "1 3\n2", "output": "2.00000"},
            {"input": "1 2\n3 4", "output": "2.50000"}
        ],
        hidden_test_cases=[
            {"input": "0 0\n0 0", "output": "0.00000"},
            {"input": "\n1", "output": "1.00000"}
        ],
        hints=[
            "Always perform binary search on the SHORTER of the two arrays to ensure O(log(min(m, n))).",
            "Partition both arrays such that left halves contain exactly (m + n + 1) // 2 elements.",
            "Check boundary conditions: max_left_A <= min_right_B and max_left_B <= min_right_A."
        ],
        time_complexity="O(log(min(M, N)))",
        space_complexity="O(1)",
        py_fn_name="findMedianSortedArrays",
        py_fn_params="nums1: list[int], nums2: list[int]",
        py_fn_ret_type="float",
        py_sample_body="A, B = nums1, nums2\n    if len(A) > len(B): A, B = B, A\n    m, n = len(A), len(B)\n    half = (m + n + 1) // 2\n    l, r = 0, m\n    while l <= r:\n        i = (l + r) // 2\n        j = half - i\n        A_left = A[i - 1] if i > 0 else float('-inf')\n        A_right = A[i] if i < m else float('inf')\n        B_left = B[j - 1] if j > 0 else float('-inf')\n        B_right = B[j] if j < n else float('inf')\n        if A_left <= B_right and B_left <= A_right:\n            if (m + n) % 2 == 1:\n                return float(max(A_left, B_left))\n            return (max(A_left, B_left) + min(A_right, B_right)) / 2.0\n        elif A_left > B_right:\n            r = i - 1\n        else:\n            l = i + 1\n    return 0.0",
        solution_explanation="Binary search on the smaller array finds the partition where all left elements are <= all right elements across both arrays, yielding the median in logarithmic time."
    ),

    # ------------------ TOPIC 6: SORTING AND SEARCHING (7 questions: 1 Easy, 5 Medium, 1 Hard) ------------------
    make_problem(
        id="dsa_top150_052",
        number=52,
        title="Meeting Rooms",
        topic_id="topic_sorting_searching",
        subtopic="Interval Conflict Detection",
        difficulty="EASY",
        roadmap_stage="Beginner Foundations",
        companies=["Amazon", "Google", "Meta"],
        description="Given an array of meeting time intervals where intervals[i] = [starti, endi], determine if a person could attend all meetings without overlapping.",
        input_format="Line 1: N (number of meetings)\nNext N lines: start end",
        output_format="true or false",
        constraints=["0 <= intervals.length <= 10^4", "intervals[i].length == 2", "0 <= starti < endi <= 10^6"],
        examples=[
            {"input": "3\n0 30\n5 10\n15 20", "output": "false", "explanation": "[0,30] conflicts with [5,10]."},
            {"input": "2\n7 10\n2 4", "output": "true", "explanation": "Meetings do not overlap."}
        ],
        public_test_cases=[
            {"input": "3\n0 30\n5 10\n15 20", "output": "false"},
            {"input": "2\n7 10\n2 4", "output": "true"}
        ],
        hidden_test_cases=[
            {"input": "1\n1 5", "output": "true"},
            {"input": "2\n1 5\n5 10", "output": "true"}
        ],
        hints=[
            "Sort intervals by start time.",
            "Compare adjacent intervals: if intervals[i][0] < intervals[i - 1][1], there is an overlap.",
            "If no overlap is found across all pairs, return true."
        ],
        time_complexity="O(N log N)",
        space_complexity="O(1)",
        py_fn_name="canAttendMeetings",
        py_fn_params="intervals: list[list[int]]",
        py_fn_ret_type="bool",
        py_sample_body="intervals.sort(key=lambda x: x[0])\n    for i in range(1, len(intervals)):\n        if intervals[i][0] < intervals[i - 1][1]:\n            return False\n    return True",
        solution_explanation="Sort intervals by start time. A conflict occurs if and only if any meeting starts before the prior meeting ends."
    ),

    make_problem(
        id="dsa_top150_053",
        number=53,
        title="Merge Sort",
        topic_id="topic_sorting_searching",
        subtopic="Divide and Conquer Sorting",
        difficulty="MEDIUM",
        roadmap_stage="Core Patterns",
        companies=["Amazon", "Microsoft", "Google"],
        description="Given an array of integers nums, sort the array in ascending order using the Merge Sort algorithm.",
        input_format="A single line of space-separated integers.",
        output_format="Sorted space-separated integers.",
        constraints=["1 <= nums.length <= 5 * 10^4", "-5 * 10^4 <= nums[i] <= 5 * 10^4"],
        examples=[
            {"input": "5 2 3 1", "output": "1 2 3 5"},
            {"input": "5 1 1 2 0 0", "output": "0 0 1 1 2 5"}
        ],
        public_test_cases=[
            {"input": "5 2 3 1", "output": "1 2 3 5"},
            {"input": "5 1 1 2 0 0", "output": "0 0 1 1 2 5"}
        ],
        hidden_test_cases=[
            {"input": "1", "output": "1"},
            {"input": "-4 0 7 4 9 -5 -1 0 -7 -1", "output": "-7 -5 -4 -1 -1 0 0 4 7 9"}
        ],
        hints=[
            "Divide the array into two halves recursively until base size 1.",
            "Merge two sorted halves by comparing elements from both lists.",
            "Merge sort is guaranteed O(N log N) in worst case and is stable."
        ],
        time_complexity="O(N log N)",
        space_complexity="O(N)",
        py_fn_name="mergeSort",
        py_fn_params="nums: list[int]",
        py_fn_ret_type="list[int]",
        py_sample_body="if len(nums) <= 1: return nums\n    mid = len(nums) // 2\n    left = mergeSort(nums[:mid])\n    right = mergeSort(nums[mid:])\n    res = []\n    i = j = 0\n    while i < len(left) and j < len(right):\n        if left[i] <= right[j]: res.append(left[i]); i += 1\n        else: res.append(right[j]); j += 1\n    res.extend(left[i:]); res.extend(right[j:])\n    return res",
        solution_explanation="Recursive divide and conquer: partition array into halves, recursively sort sub-arrays, and merge sorted halves with two pointers."
    ),

    make_problem(
        id="dsa_top150_054",
        number=54,
        title="Quick Sort",
        topic_id="topic_sorting_searching",
        subtopic="Lomuto / Hoare Partition",
        difficulty="MEDIUM",
        roadmap_stage="Core Patterns",
        companies=["Amazon", "Apple", "Google"],
        description="Implement Quick Sort in-place on an integer array nums.",
        input_format="A single line of space-separated integers.",
        output_format="Sorted space-separated integers.",
        constraints=["1 <= nums.length <= 5 * 10^4", "-5 * 10^4 <= nums[i] <= 5 * 10^4"],
        examples=[
            {"input": "10 7 8 9 1 5", "output": "1 5 7 8 9 10"},
            {"input": "4 3 2 1", "output": "1 2 3 4"}
        ],
        public_test_cases=[
            {"input": "10 7 8 9 1 5", "output": "1 5 7 8 9 10"},
            {"input": "4 3 2 1", "output": "1 2 3 4"}
        ],
        hidden_test_cases=[
            {"input": "5", "output": "5"},
            {"input": "3 3 3 2 2 1", "output": "1 2 2 3 3 3"}
        ],
        hints=[
            "Pick a pivot element.",
            "Partition the array such that all elements <= pivot are on the left, and elements > pivot are on the right.",
            "Recursively apply quicksort to the left and right partitions."
        ],
        time_complexity="O(N log N) average",
        space_complexity="O(log N)",
        py_fn_name="quickSort",
        py_fn_params="nums: list[int]",
        py_fn_ret_type="list[int]",
        py_sample_body="def qsort(l, r):\n        if l >= r: return\n        pivot = nums[r]\n        p = l\n        for i in range(l, r):\n            if nums[i] <= pivot:\n                nums[p], nums[i] = nums[i], nums[p]\n                p += 1\n        nums[p], nums[r] = nums[r], nums[p]\n        qsort(l, p - 1)\n        qsort(p + 1, r)\n    qsort(0, len(nums) - 1)\n    return nums",
        solution_explanation="In-place partition using Lomuto scheme: partition elements relative to pivot, then recursively sort left and right partitions."
    ),

    make_problem(
        id="dsa_top150_055",
        number=55,
        title="Sort an Array",
        topic_id="topic_sorting_searching",
        subtopic="Guaranteed O(N log N) Sorting",
        difficulty="MEDIUM",
        roadmap_stage="Core Patterns",
        companies=["Amazon", "Microsoft", "Meta"],
        description="Given an array of integers nums, sort the array in ascending order and return it. You must solve the problem without using any built-in functions in O(nlog(n)) time complexity and with the smallest space complexity possible.",
        input_format="A single line of space-separated integers.",
        output_format="Sorted space-separated integers.",
        constraints=["1 <= nums.length <= 5 * 10^4", "-5 * 10^4 <= nums[i] <= 5 * 10^4"],
        examples=[
            {"input": "5 2 3 1", "output": "1 2 3 5"},
            {"input": "5 1 1 2 0 0", "output": "0 0 1 1 2 5"}
        ],
        public_test_cases=[
            {"input": "5 2 3 1", "output": "1 2 3 5"},
            {"input": "5 1 1 2 0 0", "output": "0 0 1 1 2 5"}
        ],
        hidden_test_cases=[
            {"input": "0", "output": "0"},
            {"input": "-1 2 -8 -10", "output": "-10 -8 -1 2"}
        ],
        hints=[
            "Heap Sort or Merge Sort provide guaranteed O(N log N) even in adversarial worst-case inputs.",
            "Heapify array in-place, then repeatedly extract the maximum element.",
            "Swap root with the end of the un-sorted prefix and bubble down to maintain heap invariants."
        ],
        time_complexity="O(N log N)",
        space_complexity="O(1)",
        py_fn_name="sortArray",
        py_fn_params="nums: list[int]",
        py_fn_ret_type="list[int]",
        py_sample_body="def heapify(n, i):\n        largest = i\n        l, r = 2 * i + 1, 2 * i + 2\n        if l < n and nums[l] > nums[largest]: largest = l\n        if r < n and nums[r] > nums[largest]: largest = r\n        if largest != i:\n            nums[i], nums[largest] = nums[largest], nums[i]\n            heapify(n, largest)\n    n = len(nums)\n    for i in range(n // 2 - 1, -1, -1): heapify(n, i)\n    for i in range(n - 1, 0, -1):\n        nums[0], nums[i] = nums[i], nums[0]\n        heapify(i, 0)\n    return nums",
        solution_explanation="Heap Sort guarantees O(N log N) runtime with O(1) auxiliary space, immune to worst-case quadratic degradation."
    ),

    make_problem(
        id="dsa_top150_056",
        number=56,
        title="Sort Characters By Frequency",
        topic_id="topic_sorting_searching",
        subtopic="Bucket Sort / Frequency Sorting",
        difficulty="MEDIUM",
        roadmap_stage="Core Patterns",
        companies=["Amazon", "Google", "Bloomberg"],
        description="Given a string s, sort it in decreasing order based on the frequency of the characters. The frequency of a character is the number of times it appears in the string.\n\nReturn the sorted string. If there are multiple answers, return any of them.",
        input_format="A single line containing string s.",
        output_format="String sorted by character frequencies descending.",
        constraints=["1 <= s.length <= 5 * 10^5", "s consists of uppercase and lowercase English letters and digits."],
        examples=[
            {"input": "tree", "output": "eert", "explanation": "'e' appears twice, 'r' and 't' both appear once. 'eetr' is also valid."},
            {"input": "cccaaa", "output": "aaaccc", "explanation": "Both 'c' and 'a' appear three times."},
            {"input": "Aabb", "output": "bbAa"}
        ],
        public_test_cases=[
            {"input": "tree", "output": "eert"},
            {"input": "cccaaa", "output": "aaaccc"}
        ],
        hidden_test_cases=[
            {"input": "Aabb", "output": "bbAa"},
            {"input": "raaeaere", "output": "eeeeaaarr"}
        ],
        hints=[
            "Count character frequencies with a hash map.",
            "Bucket Sort: create an array of buckets where bucket[freq] contains characters with that frequency.",
            "Iterate from max frequency bucket down to 1, building the output string."
        ],
        time_complexity="O(N)",
        space_complexity="O(N)",
        py_fn_name="frequencySort",
        py_fn_params="s: str",
        py_fn_ret_type="str",
        py_sample_body="from collections import Counter\n    counts = Counter(s)\n    buckets = [[] for _ in range(len(s) + 1)]\n    for c, freq in counts.items():\n        buckets[freq].append(c)\n    res = []\n    for f in range(len(s), 0, -1):\n        for c in buckets[f]:\n            res.append(c * f)\n    return ''.join(res)",
        solution_explanation="Bucket sort by frequency achieves linear O(N) time without comparison sorting."
    ),

    make_problem(
        id="dsa_top150_057",
        number=57,
        title="Kth Largest Element in an Array",
        topic_id="topic_sorting_searching",
        subtopic="Quickselect / Min-Heap",
        difficulty="MEDIUM",
        roadmap_stage="Core Patterns",
        companies=["Meta", "Amazon", "Apple", "Microsoft"],
        description="Given an integer array nums and an integer k, return the kth largest element in the array.\n\nNote that it is the kth largest element in the sorted order, not the kth distinct element.\n\nCan you solve it without sorting in O(n) average time complexity?",
        input_format="Line 1: N space-separated integers\nLine 2: integer k",
        output_format="The kth largest integer.",
        constraints=["1 <= k <= nums.length <= 10^5", "-10^4 <= nums[i] <= 10^4"],
        examples=[
            {"input": "3 2 1 5 6 4\n2", "output": "5", "explanation": "Sorted array is [1, 2, 3, 4, 5, 6], 2nd largest is 5."},
            {"input": "3 2 3 1 2 4 5 5 6\n4", "output": "4"}
        ],
        public_test_cases=[
            {"input": "3 2 1 5 6 4\n2", "output": "5"},
            {"input": "3 2 3 1 2 4 5 5 6\n4", "output": "4"}
        ],
        hidden_test_cases=[
            {"input": "1\n1", "output": "1"},
            {"input": "7 6 5 4 3 2 1\n5", "output": "3"}
        ],
        hints=[
            "Quickselect algorithm averages O(N) by partitioning like Quicksort but only recurring on one side.",
            "Target index in sorted array is n - k.",
            "Alternatively, keep a min-heap of size k. The heap root will be the kth largest."
        ],
        time_complexity="O(N) average",
        space_complexity="O(K)",
        py_fn_name="findKthLargest",
        py_fn_params="nums: list[int], k: int",
        py_fn_ret_type="int",
        py_sample_body="import heapq\n    return heapq.nlargest(k, nums)[-1]",
        solution_explanation="Min-heap of size k or Quickselect algorithm identifies the kth largest element in O(N) average time."
    ),

    make_problem(
        id="dsa_top150_058",
        number=58,
        title="Count Inversions",
        topic_id="topic_sorting_searching",
        subtopic="Enhanced Merge Sort Inversions",
        difficulty="HARD",
        roadmap_stage="Placement Revision",
        companies=["Amazon", "Google", "Microsoft"],
        description="In an array nums, two elements nums[i] and nums[j] form an inversion if nums[i] > nums[j] and i < j.\n\nGiven an integer array nums, return the total count of inversions in the array.",
        input_format="A single line of space-separated integers.",
        output_format="Single integer representing total inversion count.",
        constraints=["1 <= nums.length <= 10^5", "-10^9 <= nums[i] <= 10^9"],
        examples=[
            {"input": "2 4 1 3 5", "output": "3", "explanation": "Inversions are (2, 1), (4, 1), (4, 3). Total = 3."},
            {"input": "5 4 3 2 1", "output": "10", "explanation": "5 * 4 / 2 = 10 inversions."}
        ],
        public_test_cases=[
            {"input": "2 4 1 3 5", "output": "3"},
            {"input": "5 4 3 2 1", "output": "10"}
        ],
        hidden_test_cases=[
            {"input": "1 2 3 4 5", "output": "0"},
            {"input": "1", "output": "0"}
        ],
        hints=[
            "Modify Merge Sort.",
            "During the merge step, if left[i] > right[j], then because left is sorted, every element from left[i] onwards also forms an inversion with right[j].",
            "Add (len(left) - i) to inversion count."
        ],
        time_complexity="O(N log N)",
        space_complexity="O(N)",
        py_fn_name="countInversions",
        py_fn_params="nums: list[int]",
        py_fn_ret_type="int",
        py_sample_body="def sortCount(arr):\n        if len(arr) <= 1: return arr, 0\n        m = len(arr) // 2\n        L, count_L = sortCount(arr[:m])\n        R, count_R = sortCount(arr[m:])\n        merged = []\n        inv = count_L + count_R\n        i = j = 0\n        while i < len(L) and j < len(R):\n            if L[i] <= R[j]:\n                merged.append(L[i]); i += 1\n            else:\n                merged.append(R[j]); j += 1\n                inv += len(L) - i\n        merged.extend(L[i:]); merged.extend(R[j:])\n        return merged, inv\n    _, total = sortCount(nums)\n    return total",
        solution_explanation="Modified Merge Sort: when an element from the right subarray is smaller than an element in the left subarray, all remaining elements in the left subarray form inversions."
    ),

    # ------------------ TOPIC 7: LINKED LISTS (10 questions: 5 Easy, 3 Medium, 2 Hard) ------------------
    make_problem(
        id="dsa_top150_059",
        number=59,
        title="Reverse Linked List",
        topic_id="topic_linked_lists",
        subtopic="Pointer Reversal",
        difficulty="EASY",
        roadmap_stage="Beginner Foundations",
        companies=["Amazon", "Apple", "Google", "Meta", "Microsoft"],
        description="Given the head of a singly linked list, reverse the list, and return the reversed list.",
        input_format="A single line of space-separated integers representing linked list nodes.",
        output_format="Space-separated integers of reversed list.",
        constraints=["The number of nodes in the list is the range [0, 5000].", "-5000 <= Node.val <= 5000"],
        examples=[
            {"input": "1 2 3 4 5", "output": "5 4 3 2 1"},
            {"input": "1 2", "output": "2 1"},
            {"input": "", "output": ""}
        ],
        public_test_cases=[
            {"input": "1 2 3 4 5", "output": "5 4 3 2 1"},
            {"input": "1 2", "output": "2 1"}
        ],
        hidden_test_cases=[
            {"input": "", "output": ""},
            {"input": "42", "output": "42"}
        ],
        hints=[
            "Maintain three pointers: prev, curr, next.",
            "Save next node: next = curr.next.",
            "Reverse pointer: curr.next = prev. Advance prev = curr, curr = next."
        ],
        time_complexity="O(N)",
        space_complexity="O(1)",
        py_fn_name="reverseList",
        py_fn_params="head",
        py_fn_ret_type="ListNode",
        py_sample_body="prev = None\n    curr = head\n    while curr:\n        nxt = curr.next\n        curr.next = prev\n        prev = curr\n        curr = nxt\n    return prev",
        solution_explanation="Iterate through list with prev, curr, next pointers. Reverse each node's next reference to point to prev. O(N) time, O(1) space."
    ),

    make_problem(
        id="dsa_top150_060",
        number=60,
        title="Middle of the Linked List",
        topic_id="topic_linked_lists",
        subtopic="Fast and Slow Pointers",
        difficulty="EASY",
        roadmap_stage="Beginner Foundations",
        companies=["Amazon", "Apple", "Google"],
        description="Given the head of a singly linked list, return the middle node of the linked list.\n\nIf there are two middle nodes, return the second middle node.",
        input_format="A single line of space-separated integers representing linked list.",
        output_format="Space-separated integers starting from the middle node to the end.",
        constraints=["The number of nodes in the list is in the range [1, 100].", "1 <= Node.val <= 100"],
        examples=[
            {"input": "1 2 3 4 5", "output": "3 4 5", "explanation": "The middle node of the list is node 3."},
            {"input": "1 2 3 4 5 6", "output": "4 5 6", "explanation": "Since the list has two middle nodes with values 3 and 4, we return the second one."}
        ],
        public_test_cases=[
            {"input": "1 2 3 4 5", "output": "3 4 5"},
            {"input": "1 2 3 4 5 6", "output": "4 5 6"}
        ],
        hidden_test_cases=[
            {"input": "1", "output": "1"},
            {"input": "1 2", "output": "2"}
        ],
        hints=[
            "Use two pointers: slow and fast.",
            "slow advances 1 step, fast advances 2 steps.",
            "When fast reaches the end, slow is exactly at the middle."
        ],
        time_complexity="O(N)",
        space_complexity="O(1)",
        py_fn_name="middleNode",
        py_fn_params="head",
        py_fn_ret_type="ListNode",
        py_sample_body="slow = fast = head\n    while fast and fast.next:\n        slow = slow.next\n        fast = fast.next.next\n    return slow",
        solution_explanation="Fast and slow pointers: fast moves twice as fast as slow. When fast reaches end of list, slow is at the middle."
    ),

    make_problem(
        id="dsa_top150_061",
        number=61,
        title="Merge Two Sorted Lists",
        topic_id="topic_linked_lists",
        subtopic="Dummy Node Linear Merge",
        difficulty="EASY",
        roadmap_stage="Beginner Foundations",
        companies=["Amazon", "Apple", "Google", "Microsoft"],
        description="You are given the heads of two sorted linked lists list1 and list2.\n\nMerge the two lists into one sorted list. The list should be made by splicing together the nodes of the first two lists.\n\nReturn the head of the merged linked list.",
        input_format="Line 1: space-separated integers for list1\nLine 2: space-separated integers for list2",
        output_format="Merged space-separated sorted list.",
        constraints=["The number of nodes in both lists is in the range [0, 50].", "-100 <= Node.val <= 100", "Both list1 and list2 are sorted in non-decreasing order."],
        examples=[
            {"input": "1 2 4\n1 3 4", "output": "1 1 2 3 4 4"},
            {"input": "\n", "output": ""},
            {"input": "\n0", "output": "0"}
        ],
        public_test_cases=[
            {"input": "1 2 4\n1 3 4", "output": "1 1 2 3 4 4"},
            {"input": "\n0", "output": "0"}
        ],
        hidden_test_cases=[
            {"input": "\n", "output": ""},
            {"input": "5\n1 2 3", "output": "1 2 3 5"}
        ],
        hints=[
            "Use a dummy head node to simplify list building.",
            "Compare heads of list1 and list2, link the smaller node, and advance.",
            "Attach remaining non-null list at the end."
        ],
        time_complexity="O(M + N)",
        space_complexity="O(1)",
        py_fn_name="mergeTwoLists",
        py_fn_params="list1, list2",
        py_fn_ret_type="ListNode",
        py_sample_body="dummy = curr = ListNode(0)\n    while list1 and list2:\n        if list1.val <= list2.val:\n            curr.next = list1; list1 = list1.next\n        else:\n            curr.next = list2; list2 = list2.next\n        curr = curr.next\n    curr.next = list1 or list2\n    return dummy.next",
        solution_explanation="Use a dummy sentinel node and compare heads of both lists, appending the smaller node to the merged list."
    ),

    make_problem(
        id="dsa_top150_062",
        number=62,
        title="Linked List Cycle",
        topic_id="topic_linked_lists",
        subtopic="Floyd's Cycle Detection",
        difficulty="EASY",
        roadmap_stage="Beginner Foundations",
        companies=["Amazon", "Microsoft", "Meta"],
        description="Given head, the head of a linked list, determine if the linked list has a cycle in it.\n\nThere is a cycle in a linked list if there is some node in the list that can be reached again by continuously following the next pointer.",
        input_format="Line 1: space-separated integers\nLine 2: pos (-1 if no cycle, otherwise index connected to tail)",
        output_format="true or false",
        constraints=["The number of the nodes in the list is in the range [0, 10^4].", "-10^5 <= Node.val <= 10^5", "pos is -1 or a valid index in the linked-list."],
        examples=[
            {"input": "3 2 0 -4\n1", "output": "true", "explanation": "There is a cycle where tail connects to 1st node (0-indexed)."},
            {"input": "1 2\n0", "output": "true"},
            {"input": "1\n-1", "output": "false"}
        ],
        public_test_cases=[
            {"input": "3 2 0 -4\n1", "output": "true"},
            {"input": "1 -1", "output": "false"}
        ],
        hidden_test_cases=[
            {"input": "1 2\n0", "output": "true"},
            {"input": "\n-1", "output": "false"}
        ],
        hints=[
            "Floyd's Cycle-Finding Algorithm (Tortoise and Hare).",
            "Slow moves 1 step, fast moves 2 steps.",
            "If slow and fast meet, a cycle exists. If fast reaches None, there is no cycle."
        ],
        time_complexity="O(N)",
        space_complexity="O(1)",
        py_fn_name="hasCycle",
        py_fn_params="head",
        py_fn_ret_type="bool",
        py_sample_body="slow = fast = head\n    while fast and fast.next:\n        slow = slow.next\n        fast = fast.next.next\n        if slow == fast: return True\n    return False",
        solution_explanation="Floyd's tortoise and hare: fast pointer moves 2 steps, slow pointer moves 1 step. If a cycle exists, fast is guaranteed to lap and meet slow."
    ),

    make_problem(
        id="dsa_top150_063",
        number=63,
        title="Palindrome Linked List",
        topic_id="topic_linked_lists",
        subtopic="Half Reversal Comparison",
        difficulty="EASY",
        roadmap_stage="Beginner Foundations",
        companies=["Amazon", "Meta", "Google"],
        description="Given the head of a singly linked list, return true if it is a palindrome or false otherwise.\n\nCould you do it in O(n) time and O(1) space?",
        input_format="A single line of space-separated integers representing linked list nodes.",
        output_format="true or false",
        constraints=["The number of nodes in the list is in the range [1, 10^5].", "0 <= Node.val <= 9"],
        examples=[
            {"input": "1 2 2 1", "output": "true"},
            {"input": "1 2", "output": "false"}
        ],
        public_test_cases=[
            {"input": "1 2 2 1", "output": "true"},
            {"input": "1 2", "output": "false"}
        ],
        hidden_test_cases=[
            {"input": "1", "output": "true"},
            {"input": "1 2 3 2 1", "output": "true"}
        ],
        hints=[
            "Find the middle of the linked list using fast and slow pointers.",
            "Reverse the second half of the linked list in place.",
            "Compare nodes of first half and reversed second half."
        ],
        time_complexity="O(N)",
        space_complexity="O(1)",
        py_fn_name="isPalindromeList",
        py_fn_params="head",
        py_fn_ret_type="bool",
        py_sample_body="slow = fast = head\n    while fast and fast.next:\n        slow = slow.next\n        fast = fast.next.next\n    prev = None\n    while slow:\n        nxt = slow.next\n        slow.next = prev\n        prev = slow\n        slow = nxt\n    left, right = head, prev\n    while right:\n        if left.val != right.val: return False\n        left = left.next; right = right.next\n    return True",
        solution_explanation="Find middle node with slow/fast pointers, reverse the second half in-place, and compare corresponding nodes from each half."
    ),

    make_problem(
        id="dsa_top150_064",
        number=64,
        title="Linked List Cycle II",
        topic_id="topic_linked_lists",
        subtopic="Cycle Start Mathematics",
        difficulty="MEDIUM",
        roadmap_stage="Core Patterns",
        companies=["Amazon", "Microsoft", "Meta"],
        description="Given the head of a linked list, return the node where the cycle begins. If there is no cycle, return null.",
        input_format="Line 1: space-separated integers\nLine 2: pos index (-1 if no cycle)",
        output_format="Value of the cycle start node, or null.",
        constraints=["The number of nodes in the list is in the range [0, 10^4].", "-10^5 <= Node.val <= 10^5", "pos is -1 or a valid index in the linked-list."],
        examples=[
            {"input": "3 2 0 -4\n1", "output": "2", "explanation": "Cycle begins at node with value 2."},
            {"input": "1 2\n0", "output": "1"}
        ],
        public_test_cases=[
            {"input": "3 2 0 -4\n1", "output": "2"},
            {"input": "1 2\n0", "output": "1"}
        ],
        hidden_test_cases=[
            {"input": "1\n-1", "output": "null"},
            {"input": "1 2 3 4 5\n2", "output": "3"}
        ],
        hints=[
            "Phase 1: Detect cycle using slow and fast pointers.",
            "Phase 2: When slow and fast meet, reset slow to head.",
            "Advance both slow and fast 1 step at a time. The point where they meet is the start of the cycle."
        ],
        time_complexity="O(N)",
        space_complexity="O(1)",
        py_fn_name="detectCycle",
        py_fn_params="head",
        py_fn_ret_type="ListNode",
        py_sample_body="slow = fast = head\n    while fast and fast.next:\n        slow = slow.next\n        fast = fast.next.next\n        if slow == fast:\n            slow = head\n            while slow != fast:\n                slow = slow.next\n                fast = fast.next\n            return slow\n    return None",
        solution_explanation="Mathematical invariant: distance from head to cycle entrance equals distance from meeting point to cycle entrance. Resetting slow to head and stepping together locates the cycle start."
    ),

    make_problem(
        id="dsa_top150_065",
        number=65,
        title="Remove Nth Node From End of List",
        topic_id="topic_linked_lists",
        subtopic="Two Pointers Fixed Gap",
        difficulty="MEDIUM",
        roadmap_stage="Core Patterns",
        companies=["Amazon", "Apple", "Google", "Meta"],
        description="Given the head of a linked list, remove the nth node from the end of the list and return its head.",
        input_format="Line 1: space-separated integers representing linked list\nLine 2: integer n",
        output_format="Linked list with nth node from end removed.",
        constraints=["The number of nodes in the list is sz.", "1 <= sz <= 30", "0 <= Node.val <= 100", "1 <= n <= sz"],
        examples=[
            {"input": "1 2 3 4 5\n2", "output": "1 2 3 5", "explanation": "2nd node from end (4) is removed."},
            {"input": "1\n1", "output": ""},
            {"input": "1 2\n1", "output": "1"}
        ],
        public_test_cases=[
            {"input": "1 2 3 4 5\n2", "output": "1 2 3 5"},
            {"input": "1\n1", "output": ""}
        ],
        hidden_test_cases=[
            {"input": "1 2\n1", "output": "1"},
            {"input": "1 2\n2", "output": "2"}
        ],
        hints=[
            "Use a dummy head pointing to head.",
            "Advance fast pointer n + 1 steps ahead of slow pointer.",
            "Move both pointers until fast reaches end. slow.next = slow.next.next deletes the target node."
        ],
        time_complexity="O(N)",
        space_complexity="O(1)",
        py_fn_name="removeNthFromEnd",
        py_fn_params="head, n: int",
        py_fn_ret_type="ListNode",
        py_sample_body="dummy = ListNode(0, head)\n    slow = fast = dummy\n    for _ in range(n + 1): fast = fast.next\n    while fast:\n        slow = slow.next; fast = fast.next\n    slow.next = slow.next.next\n    return dummy.next",
        solution_explanation="Maintain an n-step gap between two pointers. When fast reaches the end, slow is positioned right before the node to be deleted."
    ),

    make_problem(
        id="dsa_top150_066",
        number=66,
        title="Add Two Numbers",
        topic_id="topic_linked_lists",
        subtopic="Digit-by-Digit Addition with Carry",
        difficulty="MEDIUM",
        roadmap_stage="Core Patterns",
        companies=["Amazon", "Google", "Meta", "Microsoft"],
        description="You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list.",
        input_format="Line 1: space-separated digits of l1 (reverse order)\nLine 2: space-separated digits of l2 (reverse order)",
        output_format="Space-separated digits of the sum (reverse order).",
        constraints=["The number of nodes in each linked list is in the range [1, 100].", "0 <= Node.val <= 9", "It is guaranteed that the list represents a number that does not have leading zeros."],
        examples=[
            {"input": "2 4 3\n5 6 4", "output": "7 0 8", "explanation": "342 + 465 = 807. In reverse: 7 -> 0 -> 8."},
            {"input": "0\n0", "output": "0"},
            {"input": "9 9 9 9 9 9 9\n9 9 9 9", "output": "8 9 9 9 0 0 0 1"}
        ],
        public_test_cases=[
            {"input": "2 4 3\n5 6 4", "output": "7 0 8"},
            {"input": "0\n0", "output": "0"}
        ],
        hidden_test_cases=[
            {"input": "9 9 9 9 9 9 9\n9 9 9 9", "output": "8 9 9 9 0 0 0 1"},
            {"input": "1\n9 9", "output": "0 0 1"}
        ],
        hints=[
            "Simulate elementary school addition from right to left.",
            "Maintain a `carry` variable (0 or 1).",
            "At each step: val = (l1.val if l1 else 0) + (l2.val if l2 else 0) + carry. carry = val // 10."
        ],
        time_complexity="O(max(M, N))",
        space_complexity="O(max(M, N))",
        py_fn_name="addTwoNumbers",
        py_fn_params="l1, l2",
        py_fn_ret_type="ListNode",
        py_sample_body="dummy = curr = ListNode(0)\n    carry = 0\n    while l1 or l2 or carry:\n        v1 = l1.val if l1 else 0\n        v2 = l2.val if l2 else 0\n        s = v1 + v2 + carry\n        carry = s // 10\n        curr.next = ListNode(s % 10)\n        curr = curr.next\n        l1 = l1.next if l1 else None\n        l2 = l2.next if l2 else None\n    return dummy.next",
        solution_explanation="Traverse both linked lists simultaneously, computing digit sum and propagating carry. Dummy node eases result construction."
    ),

    make_problem(
        id="dsa_top150_067",
        number=67,
        title="Reorder List",
        topic_id="topic_linked_lists",
        subtopic="Find Middle, Reverse & Interleave",
        difficulty="HARD",
        roadmap_stage="Placement Revision",
        companies=["Meta", "Amazon", "Google"],
        description="You are given the head of a singly linked-list. The list can be represented as: L0 → L1 → … → Ln - 1 → Ln\n\nReorder the list to be on the following form: L0 → Ln → L1 → Ln - 1 → L2 → Ln - 2 → …\n\nYou may not modify the values in the list's nodes. Only nodes themselves may be changed.",
        input_format="A single line of space-separated integers representing linked list.",
        output_format="Reordered space-separated list.",
        constraints=["The number of nodes in the list is in the range [1, 5 * 10^4].", "1 <= Node.val <= 1000"],
        examples=[
            {"input": "1 2 3 4", "output": "1 4 2 3"},
            {"input": "1 2 3 4 5", "output": "1 5 2 4 3"}
        ],
        public_test_cases=[
            {"input": "1 2 3 4", "output": "1 4 2 3"},
            {"input": "1 2 3 4 5", "output": "1 5 2 4 3"}
        ],
        hidden_test_cases=[
            {"input": "1", "output": "1"},
            {"input": "1 2", "output": "1 2"}
        ],
        hints=[
            "1) Find the middle of the linked list using slow and fast pointers.",
            "2) Reverse the second half of the list.",
            "3) Interleave the two halves: take one node from the first half, then one from the reversed second half."
        ],
        time_complexity="O(N)",
        space_complexity="O(1)",
        py_fn_name="reorderList",
        py_fn_params="head",
        py_fn_ret_type="None",
        py_sample_body="if not head or not head.next: return\n    slow = fast = head\n    while fast and fast.next:\n        slow = slow.next; fast = fast.next.next\n    prev = None; curr = slow.next; slow.next = None\n    while curr:\n        nxt = curr.next; curr.next = prev; prev = curr; curr = nxt\n    first, second = head, prev\n    while second:\n        t1, t2 = first.next, second.next\n        first.next = second; second.next = t1\n        first, second = t1, t2",
        solution_explanation="Find the middle node, reverse the second half of the list in-place, and alternate links between the two halves in O(N) time and O(1) space."
    ),

    make_problem(
        id="dsa_top150_068",
        number=68,
        title="Reverse Nodes in k-Group",
        topic_id="topic_linked_lists",
        subtopic="Grouped Sublist Reversal",
        difficulty="HARD",
        roadmap_stage="Placement Revision",
        companies=["Amazon", "Microsoft", "Meta", "Google"],
        description="Given the head of a linked list, reverse the nodes of the list k at a time, and return the modified list.\n\nk is a positive integer and is less than or equal to the length of the linked list. If the number of nodes is not a multiple of k then left-out nodes, in the end, should remain as it is.",
        input_format="Line 1: space-separated integers\nLine 2: integer k",
        output_format="Modified space-separated list.",
        constraints=["The number of nodes in the list is n.", "1 <= k <= n <= 5000", "0 <= Node.val <= 1000"],
        examples=[
            {"input": "1 2 3 4 5\n2", "output": "2 1 4 3 5", "explanation": "Reverse pairs: [1,2]->[2,1], [3,4]->[4,3], 5 remains as is."},
            {"input": "1 2 3 4 5\n3", "output": "3 2 1 4 5"}
        ],
        public_test_cases=[
            {"input": "1 2 3 4 5\n2", "output": "2 1 4 3 5"},
            {"input": "1 2 3 4 5\n3", "output": "3 2 1 4 5"}
        ],
        hidden_test_cases=[
            {"input": "1 2 3 4 5\n1", "output": "1 2 3 4 5"},
            {"input": "1 2 3 4 5\n5", "output": "5 4 3 2 1"}
        ],
        hints=[
            "Check if there are at least k nodes remaining before attempting reversal.",
            "Reverse k nodes standardly.",
            "Connect the tail of the reversed group to the result of the recursive call on the next group."
        ],
        time_complexity="O(N)",
        space_complexity="O(1)",
        py_fn_name="reverseKGroup",
        py_fn_params="head, k: int",
        py_fn_ret_type="ListNode",
        py_sample_body="curr = head\n    count = 0\n    while curr and count < k:\n        curr = curr.next\n        count += 1\n    if count == k:\n        prev = None\n        curr = head\n        for _ in range(k):\n            nxt = curr.next; curr.next = prev; prev = curr; curr = nxt\n        head.next = reverseKGroup(curr, k)\n        return prev\n    return head",
        solution_explanation="Count k nodes. If k nodes exist, reverse them and recursively attach the head to the result of processing the rest of the list."
    ),

    # ------------------ TOPIC 8: STACKS AND QUEUES (8 questions: 4 Easy, 2 Medium, 2 Hard) ------------------
    make_problem(
        id="dsa_prob_valid_parentheses",
        number=69,
        title="Valid Parentheses",
        topic_id="topic_stacks_queues",
        subtopic="LIFO Bracket Matching",
        difficulty="EASY",
        roadmap_stage="Beginner Foundations",
        companies=["Amazon", "Apple", "Google", "Meta", "Microsoft"],
        description="Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.",
        input_format="A single line containing bracket string s.",
        output_format="true or false",
        constraints=["1 <= s.length <= 10^4", "s consists of parentheses only '()[]{}'."],
        examples=[
            {"input": "()", "output": "true"},
            {"input": "()[]{}", "output": "true"},
            {"input": "(]", "output": "false"}
        ],
        public_test_cases=[
            {"input": "()", "output": "true"},
            {"input": "()[]{}", "output": "true"}
        ],
        hidden_test_cases=[
            {"input": "(]", "output": "false"},
            {"input": "([)]", "output": "false"},
            {"input": "{[]}", "output": "true"}
        ],
        hints=[
            "Use a stack to keep track of unclosed opening brackets.",
            "Map closing brackets to their matching open bracket.",
            "When seeing an open bracket, push onto stack. When seeing close bracket, pop and verify match."
        ],
        time_complexity="O(N)",
        space_complexity="O(N)",
        py_fn_name="isValidParentheses",
        py_fn_params="s: str",
        py_fn_ret_type="bool",
        py_sample_body="mapping = {')': '(', '}': '{', ']': '['}\n    stack = []\n    for c in s:\n        if c in mapping:\n            top = stack.pop() if stack else '#'\n            if mapping[c] != top: return False\n        else:\n            stack.append(c)\n    return not stack",
        solution_explanation="Push open brackets onto a LIFO stack. Pop on closing bracket and verify match. True if stack is empty at completion."
    ),

    make_problem(
        id="dsa_top150_070",
        number=70,
        title="Implement Queue using Stacks",
        topic_id="topic_stacks_queues",
        subtopic="Dual Stack FIFO Simulation",
        difficulty="EASY",
        roadmap_stage="Beginner Foundations",
        companies=["Amazon", "Microsoft", "Bloomberg"],
        description="Implement a first in first out (FIFO) queue using only two stacks. The implemented queue should support all the functions of a normal queue (push, peek, pop, and empty).",
        input_format="Line 1: operation strings separated by space (push, pop, peek, empty)\nLine 2: arguments",
        output_format="Results of pop, peek, empty separated by space.",
        constraints=["1 <= x <= 9", "At most 100 calls will be made to push, pop, peek, and empty."],
        examples=[
            {"input": "push 1\npush 2\npeek\npop\nempty", "output": "1 1 false", "explanation": "queue: [1,2]. peek()=1. pop()=1. empty()=false."}
        ],
        public_test_cases=[
            {"input": "push 1\npush 2\npeek\npop\nempty", "output": "1 1 false"}
        ],
        hidden_test_cases=[
            {"input": "push 5\npop\nempty", "output": "5 true"},
            {"input": "push 1\npush 2\npush 3\npop\npeek", "output": "1 2"}
        ],
        hints=[
            "Use two stacks: in_stack for push, out_stack for pop/peek.",
            "When popping or peeking, if out_stack is empty, transfer all elements from in_stack to out_stack.",
            "Amortized time per operation is O(1)."
        ],
        time_complexity="O(1) amortized",
        space_complexity="O(N)",
        py_fn_name="MyQueue",
        py_fn_params="",
        py_fn_ret_type="",
        py_sample_body="class MyQueue:\n    def __init__(self):\n        self.s1, self.s2 = [], []\n    def push(self, x: int) -> None:\n        self.s1.append(x)\n    def pop(self) -> int:\n        self.peek()\n        return self.s2.pop()\n    def peek(self) -> int:\n        if not self.s2:\n            while self.s1: self.s2.append(self.s1.pop())\n        return self.s2[-1]\n    def empty(self) -> bool:\n        return not self.s1 and not self.s2",
        solution_explanation="Two stacks: incoming items go to stack1; pop/peek pull from stack2. Reversing through stack2 preserves FIFO order in O(1) amortized time."
    ),

    make_problem(
        id="dsa_top150_071",
        number=71,
        title="Implement Stack using Queues",
        topic_id="topic_stacks_queues",
        subtopic="Single/Dual Queue LIFO Simulation",
        difficulty="EASY",
        roadmap_stage="Beginner Foundations",
        companies=["Amazon", "Apple", "Google"],
        description="Implement a last-in-first-out (LIFO) stack using only two queues. The implemented stack should support all the functions of a normal stack (push, top, pop, and empty).",
        input_format="Series of stack operations.",
        output_format="Results of pop, top, empty.",
        constraints=["1 <= x <= 9", "At most 100 calls will be made."],
        examples=[
            {"input": "push 1\npush 2\ntop\npop\nempty", "output": "2 2 false"}
        ],
        public_test_cases=[
            {"input": "push 1\npush 2\ntop\npop\nempty", "output": "2 2 false"}
        ],
        hidden_test_cases=[
            {"input": "push 10\npop\nempty", "output": "10 true"},
            {"input": "push 1\npush 2\npush 3\npop\ntop", "output": "3 2"}
        ],
        hints=[
            "With a single queue: after enqueueing x, rotate the previous n - 1 elements to the back of the queue.",
            "This keeps the newly inserted element at the front of the queue.",
            "Pop and top can then be executed in O(1) time."
        ],
        time_complexity="O(N) push, O(1) pop",
        space_complexity="O(N)",
        py_fn_name="MyStack",
        py_fn_params="",
        py_fn_ret_type="",
        py_sample_body="from collections import deque\nclass MyStack:\n    def __init__(self):\n        self.q = deque()\n    def push(self, x: int) -> None:\n        self.q.append(x)\n        for _ in range(len(self.q) - 1):\n            self.q.append(self.q.popleft())\n    def pop(self) -> int:\n        return self.q.popleft()\n    def top(self) -> int:\n        return self.q[0]\n    def empty(self) -> bool:\n        return not self.q",
        solution_explanation="On push, rotate the queue by len(q) - 1 times so the newest element is at the queue front. Pop and top become O(1)."
    ),

    make_problem(
        id="dsa_top150_072",
        number=72,
        title="Next Greater Element I",
        topic_id="topic_stacks_queues",
        subtopic="Monotonic Decreasing Stack",
        difficulty="EASY",
        roadmap_stage="Beginner Foundations",
        companies=["Amazon", "Microsoft", "Meta"],
        description="The next greater element of some element x in an array is the first greater element that is to the right of x in the same array.\n\nYou are given two distinct 0-indexed integer arrays nums1 and nums2, where nums1 is a subset of nums2.\n\nFor each 0 <= i < nums1.length, find the index j such that nums1[i] == nums2[j] and determine the next greater element of nums2[j] in nums2. If there is no next greater element, then the answer for this query is -1.",
        input_format="Line 1: space-separated integers nums1\nLine 2: space-separated integers nums2",
        output_format="Space-separated next greater elements for nums1.",
        constraints=["1 <= nums1.length <= nums2.length <= 1000", "0 <= nums1[i], nums2[i] <= 10^4", "All integers in nums1 and nums2 are unique."],
        examples=[
            {"input": "4 1 2\n1 3 4 2", "output": "-1 3 -1", "explanation": "For 4: no greater element. For 1: next greater is 3. For 2: no greater element."},
            {"input": "2 4\n1 2 3 4", "output": "3 -1"}
        ],
        public_test_cases=[
            {"input": "4 1 2\n1 3 4 2", "output": "-1 3 -1"},
            {"input": "2 4\n1 2 3 4", "output": "3 -1"}
        ],
        hidden_test_cases=[
            {"input": "1\n1", "output": "-1"},
            {"input": "1 3 5 2 4\n6 5 4 3 2 1 7", "output": "7 7 7 7 7"}
        ],
        hints=[
            "Use a monotonic decreasing stack over nums2.",
            "When encountering a number x greater than stack top, x is the next greater element for stack.pop(). Store this mapping in a hash map.",
            "Lookup each element of nums1 in the hash map."
        ],
        time_complexity="O(M + N)",
        space_complexity="O(N)",
        py_fn_name="nextGreaterElement",
        py_fn_params="nums1: list[int], nums2: list[int]",
        py_fn_ret_type="list[int]",
        py_sample_body="mapping = {}\n    stack = []\n    for n in nums2:\n        while stack and stack[-1] < n:\n            mapping[stack.pop()] = n\n        stack.append(n)\n    return [mapping.get(n, -1) for n in nums1]",
        solution_explanation="Monotonic stack over nums2: when a larger element is seen, pop elements and record mapping. Each number in nums1 is queried in O(1)."
    ),

    make_problem(
        id="dsa_top150_073",
        number=73,
        title="Min Stack",
        topic_id="topic_stacks_queues",
        subtopic="Dual Tracking / Running Min Stack",
        difficulty="MEDIUM",
        roadmap_stage="Core Patterns",
        companies=["Amazon", "Apple", "Google", "Bloomberg"],
        description="Design a stack that supports push, pop, top, and retrieving the minimum element in constant time O(1).\n\nImplement the MinStack class:\n- MinStack() initializes the stack object.\n- void push(int val) pushes the element val onto the stack.\n- void pop() removes the element on the top of the stack.\n- int top() gets the top element of the stack.\n- int getMin() retrieves the minimum element in the stack.",
        input_format="Operations: push, pop, top, getMin",
        output_format="Outputs of getMin, top separated by space.",
        constraints=["-2^31 <= val <= 2^31 - 1", "Methods pop, top and getMin operations will always be called on non-empty stacks."],
        examples=[
            {"input": "push -2\npush 0\npush -3\ngetMin\npop\ntop\ngetMin", "output": "-3 0 -2"}
        ],
        public_test_cases=[
            {"input": "push -2\npush 0\npush -3\ngetMin\npop\ntop\ngetMin", "output": "-3 0 -2"}
        ],
        hidden_test_cases=[
            {"input": "push 1\npush 2\ngetMin", "output": "1"},
            {"input": "push 0\npush 1\npush 0\ngetMin\npop\ngetMin", "output": "0 0"}
        ],
        hints=[
            "Each stack element can be stored alongside the minimum seen up to that point as a tuple (val, current_min).",
            "Alternatively, use a parallel min_stack where min_stack[-1] is the current minimum.",
            "All operations run strictly in O(1) time."
        ],
        time_complexity="O(1) all operations",
        space_complexity="O(N)",
        py_fn_name="MinStack",
        py_fn_params="",
        py_fn_ret_type="",
        py_sample_body="class MinStack:\n    def __init__(self):\n        self.stack = []\n        self.min_stack = []\n    def push(self, val: int) -> None:\n        self.stack.append(val)\n        m = val if not self.min_stack else min(val, self.min_stack[-1])\n        self.min_stack.append(m)\n    def pop(self) -> None:\n        self.stack.pop()\n        self.min_stack.pop()\n    def top(self) -> int:\n        return self.stack[-1]\n    def getMin(self) -> int:\n        return self.min_stack[-1]",
        solution_explanation="Maintain parallel min_stack holding the running minimum corresponding to each height. Provides O(1) getMin without search."
    ),

    make_problem(
        id="dsa_top150_074",
        number=74,
        title="Daily Temperatures",
        topic_id="topic_stacks_queues",
        subtopic="Monotonic Stack Wait Days",
        difficulty="MEDIUM",
        roadmap_stage="Core Patterns",
        companies=["Amazon", "Meta", "Google"],
        description="Given an array of integers temperatures represents the daily temperatures, return an array answer such that answer[i] is the number of days you have to wait after the ith day to get a warmer temperature. If there is no future day for which this is possible, keep answer[i] == 0 instead.",
        input_format="A single line of space-separated integers representing daily temperatures.",
        output_format="Space-separated integers representing waiting days.",
        constraints=["1 <= temperatures.length <= 10^5", "30 <= temperatures[i] <= 100"],
        examples=[
            {"input": "73 74 75 71 69 72 76 73", "output": "1 1 4 2 1 1 0 0"},
            {"input": "30 40 50 60", "output": "1 1 1 0"},
            {"input": "30 60 90", "output": "1 1 0"}
        ],
        public_test_cases=[
            {"input": "73 74 75 71 69 72 76 73", "output": "1 1 4 2 1 1 0 0"},
            {"input": "30 40 50 60", "output": "1 1 1 0"}
        ],
        hidden_test_cases=[
            {"input": "30 60 90", "output": "1 1 0"},
            {"input": "50 50 50", "output": "0 0 0"}
        ],
        hints=[
            "Store indices on a stack in decreasing order of temperature.",
            "When current day temperature is warmer than stack top day, pop and calculate wait time: current_day - popped_day.",
            "Push current day index onto stack."
        ],
        time_complexity="O(N)",
        space_complexity="O(N)",
        py_fn_name="dailyTemperatures",
        py_fn_params="temperatures: list[int]",
        py_fn_ret_type="list[int]",
        py_sample_body="n = len(temperatures)\n    ans = [0] * n\n    stack = []\n    for i, t in enumerate(temperatures):\n        while stack and temperatures[stack[-1]] < t:\n            prev = stack.pop()\n            ans[prev] = i - prev\n        stack.append(i)\n    return ans",
        solution_explanation="Monotonic decreasing stack of indices. When a warmer temperature is encountered, pop previous colder days and record the difference between indices."
    ),

    make_problem(
        id="dsa_top150_075",
        number=75,
        title="Evaluate Reverse Polish Notation",
        topic_id="topic_stacks_queues",
        subtopic="Postfix Stack Evaluation",
        difficulty="HARD",
        roadmap_stage="Placement Revision",
        companies=["Amazon", "Apple", "Google", "Microsoft"],
        description="You are given an array of strings tokens that represents an arithmetic expression in a Reverse Polish Notation.\n\nEvaluate the expression. Return an integer that represents the value of the expression.\n\nNote that:\n- The valid operators are '+', '-', '*', and '/'.\n- Each operand may be an integer or another expression.\n- The division between two integers always truncates toward zero.",
        input_format="A single line of space-separated tokens.",
        output_format="Single integer result.",
        constraints=["1 <= tokens.length <= 10^4", "tokens[i] is either an operator or an integer in range [-200, 200]."],
        examples=[
            {"input": "2 1 + 3 *", "output": "9", "explanation": "((2 + 1) * 3) = 9."},
            {"input": "4 13 5 / +", "output": "6", "explanation": "(4 + (13 / 5)) = 6."},
            {"input": "10 6 9 3 + -11 * / * 17 + 5 +", "output": "22"}
        ],
        public_test_cases=[
            {"input": "2 1 + 3 *", "output": "9"},
            {"input": "4 13 5 / +", "output": "6"}
        ],
        hidden_test_cases=[
            {"input": "10 6 9 3 + -11 * / * 17 + 5 +", "output": "22"},
            {"input": "3 -4 +", "output": "-1"}
        ],
        hints=[
            "When encountering a number, push it onto stack.",
            "When encountering an operator, pop operand2 then operand1.",
            "Apply operator: operand1 OP operand2, and push result back. Remember Python integer division truncates towards zero via int(a / b)."
        ],
        time_complexity="O(N)",
        space_complexity="O(N)",
        py_fn_name="evalRPN",
        py_fn_params="tokens: list[str]",
        py_fn_ret_type="int",
        py_sample_body="stack = []\n    for t in tokens:\n        if t in '+-*/':\n            b = stack.pop()\n            a = stack.pop()\n            if t == '+': stack.append(a + b)\n            elif t == '-': stack.append(a - b)\n            elif t == '*': stack.append(a * b)\n            else: stack.append(int(a / b))\n        else:\n            stack.append(int(t))\n    return stack[0]",
        solution_explanation="Operands are pushed onto stack. Operators pop two operands, evaluate the arithmetic operation, and push result back."
    ),

    make_problem(
        id="dsa_top150_076",
        number=76,
        title="Largest Rectangle in Histogram",
        topic_id="topic_stacks_queues",
        subtopic="Monotonic Increasing Stack Area",
        difficulty="HARD",
        roadmap_stage="Placement Revision",
        companies=["Google", "Amazon", "Apple", "Meta", "Microsoft"],
        description="Given an array of integers heights representing the histogram's bar height where the width of each bar is 1, return the area of the largest rectangle in the histogram.",
        input_format="A single line of space-separated integers representing bar heights.",
        output_format="Single integer representing the largest rectangle area.",
        constraints=["1 <= heights.length <= 10^5", "0 <= heights[i] <= 10^4"],
        examples=[
            {"input": "2 1 5 6 2 3", "output": "10", "explanation": "The maximum area is 10 units (bars of height 5 and 6 with width 2)."},
            {"input": "2 4", "output": "4"}
        ],
        public_test_cases=[
            {"input": "2 1 5 6 2 3", "output": "10"},
            {"input": "2 4", "output": "4"}
        ],
        hidden_test_cases=[
            {"input": "1", "output": "1"},
            {"input": "2 1 2", "output": "3"},
            {"input": "5 4 1 2", "output": "8"}
        ],
        hints=[
            "A bar can extend as far left and right as bars are >= its own height.",
            "Use a monotonic increasing stack storing (index, height).",
            "When current height < stack top height, pop and calculate area with width = current_index - stack_top_index."
        ],
        time_complexity="O(N)",
        space_complexity="O(N)",
        py_fn_name="largestRectangleArea",
        py_fn_params="heights: list[int]",
        py_fn_ret_type="int",
        py_sample_body="stack = []\n    max_area = 0\n    heights.append(0)\n    for i, h in enumerate(heights):\n        start = i\n        while stack and stack[-1][1] > h:\n            idx, height = stack.pop()\n            max_area = max(max_area, height * (i - idx))\n            start = idx\n        stack.append((start, h))\n    return max_area",
        solution_explanation="Monotonic increasing stack tracks (start_index, height). When a shorter bar is encountered, pop taller bars and compute area bounded by popped height."
    )
]

print(f"Part 2 loaded with {len(part2_problems)} problems.")
