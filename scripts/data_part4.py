from dsa_builder_helper import make_problem

part4_problems = [
    # ------------------ TOPIC 13: GREEDY ALGORITHMS (7 questions: 1 Easy, 4 Medium, 2 Hard) ------------------
    make_problem(
        id="dsa_top150_120",
        number=120,
        title="Assign Cookies",
        topic_id="topic_greedy",
        subtopic="Greedy Matching",
        difficulty="EASY",
        roadmap_stage="Beginner Foundations",
        companies=["Amazon", "Apple", "Google"],
        description="Assume you are an awesome parent and want to give your children some cookies. But, you should give each child at most one cookie.\n\nEach child i has a greed factor g[i], which is the minimum size of a cookie that the child will be content with; and each cookie j has a size s[j]. If s[j] >= g[i], we can assign the cookie j to the child i, and the child i will be content. Your goal is to maximize the number of your content children and output the maximum number.",
        input_format="Line 1: space-separated integers for children greed factors g\nLine 2: space-separated integers for cookie sizes s",
        output_format="Single integer count of content children.",
        constraints=["1 <= g.length <= 3 * 10^4", "0 <= s.length <= 3 * 10^4", "1 <= g[i], s[j] <= 2^31 - 1"],
        examples=[
            {"input": "1 2 3\n1 1", "output": "1", "explanation": "Only 1 child with greed 1 can be satisfied."},
            {"input": "1 2\n1 2 3", "output": "2", "explanation": "Both children can be satisfied."}
        ],
        public_test_cases=[
            {"input": "1 2 3\n1 1", "output": "1"},
            {"input": "1 2\n1 2 3", "output": "2"}
        ],
        hidden_test_cases=[
            {"input": "1 2 3\n", "output": "0"},
            {"input": "10 9 8 7\n5 6 7 8", "output": "2"}
        ],
        hints=[
            "Sort both the children's greed array and the cookies array.",
            "Use a greedy approach: try to satisfy the child with the smallest greed factor using the smallest sufficient cookie.",
            "Two pointers advancing through both sorted arrays."
        ],
        time_complexity="O(N log N + M log M)",
        space_complexity="O(1)",
        py_fn_name="findContentChildren",
        py_fn_params="g: list[int], s: list[int]",
        py_fn_ret_type="int",
        py_sample_body="g.sort()\n    s.sort()\n    child, cookie = 0, 0\n    while child < len(g) and cookie < len(s):\n        if s[cookie] >= g[child]:\n            child += 1\n        cookie += 1\n    return child",
        solution_explanation="Sort both arrays. Greedily satisfy the least greedy child with the smallest available cookie that is >= greed factor."
    ),

    make_problem(
        id="dsa_top150_121",
        number=121,
        title="Jump Game",
        topic_id="topic_greedy",
        subtopic="Maximum Reach Tracking",
        difficulty="MEDIUM",
        roadmap_stage="Core Patterns",
        companies=["Amazon", "Apple", "Google", "Meta", "Microsoft"],
        description="You are given an integer array nums. You are initially positioned at the array's first index, and each element in the array represents your maximum jump length at that position.\n\nReturn true if you can reach the last index, or false otherwise.",
        input_format="A single line of space-separated integers representing nums.",
        output_format="true or false",
        constraints=["1 <= nums.length <= 10^4", "0 <= nums[i] <= 10^5"],
        examples=[
            {"input": "2 3 1 1 4", "output": "true", "explanation": "Jump 1 step from index 0 to 1, then 3 steps to the last index."},
            {"input": "3 2 1 0 4", "output": "false", "explanation": "You will always arrive at index 3 no matter what. Its maximum jump length is 0, which makes it impossible to reach the last index."}
        ],
        public_test_cases=[
            {"input": "2 3 1 1 4", "output": "true"},
            {"input": "3 2 1 0 4", "output": "false"}
        ],
        hidden_test_cases=[
            {"input": "0", "output": "true"},
            {"input": "2 0 0", "output": "true"}
        ],
        hints=[
            "Track the furthest index you can reach so far.",
            "At each step i, if i > max_reach, return false because you cannot even reach index i.",
            "Update max_reach = max(max_reach, i + nums[i]). If max_reach >= last index, return true."
        ],
        time_complexity="O(N)",
        space_complexity="O(1)",
        py_fn_name="canJump",
        py_fn_params="nums: list[int]",
        py_fn_ret_type="bool",
        py_sample_body="max_reach = 0\n    for i, jump in enumerate(nums):\n        if i > max_reach: return False\n        max_reach = max(max_reach, i + jump)\n        if max_reach >= len(nums) - 1: return True\n    return True",
        solution_explanation="Greedily update maximum reachable index. If current index exceeds maximum reach, last index is unreachable."
    ),

    make_problem(
        id="dsa_top150_122",
        number=122,
        title="Jump Game II",
        topic_id="topic_greedy",
        subtopic="BFS Window Boundary Jumping",
        difficulty="MEDIUM",
        roadmap_stage="Core Patterns",
        companies=["Amazon", "Apple", "Google", "Meta"],
        description="You are given a 0-indexed array of integers nums of length n. You are initially positioned at nums[0].\n\nEach element nums[i] represents the maximum length of a forward jump from index i. In other words, if you are at nums[i], you can jump to any nums[i + j] where:\n- 0 <= j <= nums[i] and\n- i + j < n\n\nReturn the minimum number of jumps to reach nums[n - 1]. The test cases are generated such that you can reach nums[n - 1].",
        input_format="A single line of space-separated integers representing nums.",
        output_format="Single integer minimum jump count.",
        constraints=["1 <= nums.length <= 10^4", "0 <= nums[i] <= 1000"],
        examples=[
            {"input": "2 3 1 1 4", "output": "2", "explanation": "Jump 1 step from index 0 to 1, then 3 steps to the last index."},
            {"input": "2 3 0 1 4", "output": "2"}
        ],
        public_test_cases=[
            {"input": "2 3 1 1 4", "output": "2"},
            {"input": "2 3 0 1 4", "output": "2"}
        ],
        hidden_test_cases=[
            {"input": "1", "output": "0"},
            {"input": "1 2 3", "output": "2"}
        ],
        hints=[
            "Think of jumps as layers in a BFS traversal.",
            "Maintain current jump boundary `cur_end` and furthest reachable index `farthest`.",
            "When i reaches `cur_end`, increment jump count and update `cur_end = farthest`."
        ],
        time_complexity="O(N)",
        space_complexity="O(1)",
        py_fn_name="jump",
        py_fn_params="nums: list[int]",
        py_fn_ret_type="int",
        py_sample_body="jumps, cur_end, farthest = 0, 0, 0\n    for i in range(len(nums) - 1):\n        farthest = max(farthest, i + nums[i])\n        if i == cur_end:\n            jumps += 1\n            cur_end = farthest\n    return jumps",
        solution_explanation="Implicit BFS: track the furthest point reachable with the current number of jumps. Advance jump counter when exiting current layer boundary."
    ),

    make_problem(
        id="dsa_top150_123",
        number=123,
        title="Gas Station",
        topic_id="topic_greedy",
        subtopic="Prefix Net Gain Greedy",
        difficulty="MEDIUM",
        roadmap_stage="Core Patterns",
        companies=["Amazon", "Google", "Microsoft"],
        description="There are n gas stations along a circular route, where the amount of gas at the ith station is gas[i].\n\nYou have a car with an unlimited gas tank and it costs cost[i] of gas to travel from the ith station to its next (i + 1)th station. You begin the journey with an empty tank at one of the gas stations.\n\nGiven two integer arrays gas and cost, return the starting gas station's index if you can travel around the circuit once in the clockwise direction, otherwise return -1. If there exists a solution, it is guaranteed to be unique.",
        input_format="Line 1: space-separated integers for gas\nLine 2: space-separated integers for cost",
        output_format="0-based integer starting station index, or -1.",
        constraints=["n == gas.length == cost.length", "1 <= n <= 10^5", "0 <= gas[i], cost[i] <= 10^4"],
        examples=[
            {"input": "1 2 3 4 5\n3 4 5 1 2", "output": "3", "explanation": "Start at station 3 (index 3) and fill up with 4 unit of gas. Complete circuit."},
            {"input": "2 3 4\n3 4 3", "output": "-1"}
        ],
        public_test_cases=[
            {"input": "1 2 3 4 5\n3 4 5 1 2", "output": "3"},
            {"input": "2 3 4\n3 4 3", "output": "-1"}
        ],
        hidden_test_cases=[
            {"input": "5 1 2 3 4\n4 4 1 5 1", "output": "4"}
        ],
        hints=[
            "If sum(gas) < sum(cost), it is mathematically impossible to complete the circuit, return -1.",
            "If tank drops below 0 while starting from station A and reaching B, no station between A and B can be a valid starting point either.",
            "Reset start index to B + 1 and reset current tank to 0."
        ],
        time_complexity="O(N)",
        space_complexity="O(1)",
        py_fn_name="canCompleteCircuit",
        py_fn_params="gas: list[int], cost: list[int]",
        py_fn_ret_type="int",
        py_sample_body="if sum(gas) < sum(cost): return -1\n    total_tank, curr_tank = 0, 0\n    start = 0\n    for i in range(len(gas)):\n        net = gas[i] - cost[i]\n        curr_tank += net\n        if curr_tank < 0:\n            start = i + 1\n            curr_tank = 0\n    return start",
        solution_explanation="If total gas >= total cost, a solution is guaranteed. Whenever running tank falls below zero, the next station is chosen as the new candidate start."
    ),

    make_problem(
        id="dsa_top150_124",
        number=124,
        title="Non-overlapping Intervals",
        topic_id="topic_greedy",
        subtopic="Earliest End Time Scheduling",
        difficulty="MEDIUM",
        roadmap_stage="Core Patterns",
        companies=["Amazon", "Facebook", "Google"],
        description="Given an array of intervals intervals where intervals[i] = [starti, endi], return the minimum number of intervals you need to remove to make the rest of the intervals non-overlapping.",
        input_format="Line 1: N\nNext N lines: start end",
        output_format="Single integer count of removed intervals.",
        constraints=["1 <= intervals.length <= 10^5", "intervals[i].length == 2", "-5 * 10^4 <= starti < endi <= 5 * 10^4"],
        examples=[
            {"input": "4\n1 2\n2 3\n3 4\n1 3", "output": "1", "explanation": "[1,3] can be removed and the rest of intervals are non-overlapping."},
            {"input": "3\n1 2\n1 2\n1 2", "output": "2"},
            {"input": "2\n1 2\n2 3", "output": "0"}
        ],
        public_test_cases=[
            {"input": "4\n1 2\n2 3\n3 4\n1 3", "output": "1"},
            {"input": "3\n1 2\n1 2\n1 2", "output": "2"}
        ],
        hidden_test_cases=[
            {"input": "2\n1 2\n2 3", "output": "0"}
        ],
        hints=[
            "Interval Scheduling theorem: sorting by END time maximizes the number of non-overlapping intervals.",
            "Iterate through sorted intervals: if an interval starts before the previous one ends, remove it.",
            "Otherwise, update the last ending time."
        ],
        time_complexity="O(N log N)",
        space_complexity="O(1)",
        py_fn_name="eraseOverlapIntervals",
        py_fn_params="intervals: list[list[int]]",
        py_fn_ret_type="int",
        py_sample_body="intervals.sort(key=lambda x: x[1])\n    ans = 0\n    prev_end = float('-inf')\n    for start, end in intervals:\n        if start >= prev_end:\n            prev_end = end\n        else:\n            ans += 1\n    return ans",
        solution_explanation="Greedy activity selection: sort intervals by end time. Keep intervals that do not overlap with previous end; count the rest as removed."
    ),

    make_problem(
        id="dsa_top150_125",
        number=125,
        title="Partition Labels",
        topic_id="topic_greedy",
        subtopic="Last Occurrence Boundary Partition",
        difficulty="HARD",
        roadmap_stage="Placement Revision",
        companies=["Amazon", "Google", "Meta"],
        description="You are given a string s. We want to partition the string into as many parts as possible so that each letter appears in at most one part.\n\nNote that the partition is done so that after concatenating all the parts in order, the resultant string should be s.\n\nReturn a list of integers representing the size of these parts.",
        input_format="A single line containing string s.",
        output_format="Space-separated partition lengths.",
        constraints=["1 <= s.length <= 500", "s consists of lowercase English letters."],
        examples=[
            {"input": "ababcbacadefegdehijhklij", "output": "9 7 8", "explanation": "The partition is \"ababcbaca\", \"defegde\", \"hijhklij\"."},
            {"input": "eccbbbbdec", "output": "10"}
        ],
        public_test_cases=[
            {"input": "ababcbacadefegdehijhklij", "output": "9 7 8"},
            {"input": "eccbbbbdec", "output": "10"}
        ],
        hidden_test_cases=[
            {"input": "a", "output": "1"},
            {"input": "abac", "output": "3 1"}
        ],
        hints=[
            "Record the last occurrence index of each character in s.",
            "As you iterate, extend current partition end to max(current_end, last_seen[char]).",
            "When current index == current_end, you have found a partition boundary."
        ],
        time_complexity="O(N)",
        space_complexity="O(1)",
        py_fn_name="partitionLabels",
        py_fn_params="s: str",
        py_fn_ret_type="list[int]",
        py_sample_body="last = {c: i for i, c in enumerate(s)}\n    res = []\n    size, end = 0, 0\n    for i, c in enumerate(s):\n        size += 1\n        end = max(end, last[c])\n        if i == end:\n            res.append(size)\n            size = 0\n    return res",
        solution_explanation="Map each character to its last index. The partition end expands to encompass the furthest occurrence of any character within it. Closes when i == end."
    ),

    make_problem(
        id="dsa_top150_126",
        number=126,
        title="Candy",
        topic_id="topic_greedy",
        subtopic="Two-Pass Bidirectional Ratings",
        difficulty="HARD",
        roadmap_stage="Placement Revision",
        companies=["Amazon", "Google", "Meta", "Microsoft"],
        description="There are n children standing in a line. Each child is assigned a rating value given in the integer array ratings.\n\nYou are giving candies to these children subjected to the following requirements:\n- Each child must have at least one candy.\n- Children with a higher rating get more candies than their neighbors.\n\nReturn the minimum number of candies you need to have to distribute the candies to the children.",
        input_format="A single line of space-separated integers representing ratings.",
        output_format="Single integer representing total candies.",
        constraints=["n == ratings.length", "1 <= n <= 2 * 10^4", "0 <= ratings[i] <= 2 * 10^4"],
        examples=[
            {"input": "1 0 2", "output": "5", "explanation": "Candies: [2, 1, 2]. Total = 5."},
            {"input": "1 2 2", "output": "4", "explanation": "Candies: [1, 2, 1]. Total = 4."}
        ],
        public_test_cases=[
            {"input": "1 0 2", "output": "5"},
            {"input": "1 2 2", "output": "4"}
        ],
        hidden_test_cases=[
            {"input": "1", "output": "1"},
            {"input": "1 3 2 2 1", "output": "7"}
        ],
        hints=[
            "Give every child 1 candy initially.",
            "Pass 1 (left to right): if ratings[i] > ratings[i-1], candies[i] = candies[i-1] + 1.",
            "Pass 2 (right to left): if ratings[i] > ratings[i+1], candies[i] = max(candies[i], candies[i+1] + 1)."
        ],
        time_complexity="O(N)",
        space_complexity="O(N)",
        py_fn_name="candy",
        py_fn_params="ratings: list[int]",
        py_fn_ret_type="int",
        py_sample_body="n = len(ratings)\n    candies = [1] * n\n    for i in range(1, n):\n        if ratings[i] > ratings[i - 1]:\n            candies[i] = candies[i - 1] + 1\n    for i in range(n - 2, -1, -1):\n        if ratings[i] > ratings[i + 1]:\n            candies[i] = max(candies[i], candies[i + 1] + 1)\n    return sum(candies)",
        solution_explanation="Two passes: left-to-right ensures higher rated children exceed their left neighbor; right-to-left ensures they exceed their right neighbor."
    ),

    # ------------------ TOPIC 14: DYNAMIC PROGRAMMING (16 questions: 3 Easy, 9 Medium, 4 Hard) ------------------
    make_problem(
        id="dsa_top150_127",
        number=127,
        title="Climbing Stairs",
        topic_id="topic_dynamic_programming",
        subtopic="1D State Transitions",
        difficulty="EASY",
        roadmap_stage="Beginner Foundations",
        companies=["Amazon", "Apple", "Google", "Meta", "Microsoft"],
        description="You are climbing a staircase. It takes n steps to reach the top.\n\nEach time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
        input_format="A single integer n.",
        output_format="Single integer count of distinct paths.",
        constraints=["1 <= n <= 45"],
        examples=[
            {"input": "2", "output": "2", "explanation": "1 step + 1 step, or 2 steps."},
            {"input": "3", "output": "3", "explanation": "1+1+1, 1+2, 2+1."}
        ],
        public_test_cases=[
            {"input": "2", "output": "2"},
            {"input": "3", "output": "3"}
        ],
        hidden_test_cases=[
            {"input": "1", "output": "1"},
            {"input": "4", "output": "5"},
            {"input": "5", "output": "8"}
        ],
        hints=[
            "To reach step n, you must arrive from step n-1 or step n-2.",
            "Recurrence relation: ways(n) = ways(n-1) + ways(n-2).",
            "This is Fibonacci. Compute in O(N) time with O(1) space."
        ],
        time_complexity="O(N)",
        space_complexity="O(1)",
        py_fn_name="climbStairs",
        py_fn_params="n: int",
        py_fn_ret_type="int",
        py_sample_body="if n <= 2: return n\n    a, b = 1, 2\n    for _ in range(3, n + 1):\n        a, b = b, a + b\n    return b",
        solution_explanation="Number of ways to reach step n equals the sum of ways to reach step n-1 and n-2. Solved in O(N) time with two variables."
    ),

    make_problem(
        id="dsa_top150_128",
        number=128,
        title="Min Cost Climbing Stairs",
        topic_id="topic_dynamic_programming",
        subtopic="Minimum Path Sum Recurrence",
        difficulty="EASY",
        roadmap_stage="Beginner Foundations",
        companies=["Amazon", "Apple"],
        description="You are given an integer array cost where cost[i] is the cost of ith step on a staircase. Once you pay the cost, you can either climb one or two steps.\n\nYou can either start from the step with index 0, or the step with index 1.\n\nReturn the minimum cost to reach the top of the floor.",
        input_format="A single line of space-separated integers representing cost.",
        output_format="Single integer minimum cost.",
        constraints=["2 <= cost.length <= 1000", "0 <= cost[i] <= 999"],
        examples=[
            {"input": "10 15 20", "output": "15", "explanation": "Start at index 1, pay 15 and climb two steps to reach top."},
            {"input": "1 100 1 1 1 100 1 1 100 1", "output": "6"}
        ],
        public_test_cases=[
            {"input": "10 15 20", "output": "15"},
            {"input": "1 100 1 1 1 100 1 1 100 1", "output": "6"}
        ],
        hidden_test_cases=[
            {"input": "0 0", "output": "0"},
            {"input": "1 2", "output": "1"}
        ],
        hints=[
            "dp[i] = cost[i] + min(dp[i+1], dp[i+2]).",
            "Iterate backwards from n - 3 down to 0.",
            "Result is min(dp[0], dp[1])."
        ],
        time_complexity="O(N)",
        space_complexity="O(1)",
        py_fn_name="minCostClimbingStairs",
        py_fn_params="cost: list[int]",
        py_fn_ret_type="int",
        py_sample_body="cost.append(0)\n    for i in range(len(cost) - 3, -1, -1):\n        cost[i] += min(cost[i + 1], cost[i + 2])\n    return min(cost[0], cost[1])",
        solution_explanation="Bottom-up DP: cost to proceed from step i is cost[i] + min(cost[i+1], cost[i+2])."
    ),

    make_problem(
        id="dsa_top150_129",
        number=129,
        title="N-th Tribonacci Number",
        topic_id="topic_dynamic_programming",
        subtopic="Three-Term Recurrence",
        difficulty="EASY",
        roadmap_stage="Beginner Foundations",
        companies=["Amazon", "Apple"],
        description="The Tribonacci sequence Tn is defined as follows:\nT0 = 0, T1 = 1, T2 = 1, and Tn+3 = Tn + Tn+1 + Tn+2 for n >= 0.\n\nGiven n, return the value of Tn.",
        input_format="A single integer n.",
        output_format="Single integer Tn.",
        constraints=["0 <= n <= 37"],
        examples=[
            {"input": "4", "output": "4", "explanation": "T_3 = 0 + 1 + 1 = 2, T_4 = 1 + 1 + 2 = 4."},
            {"input": "25", "output": "1389537"}
        ],
        public_test_cases=[
            {"input": "4", "output": "4"},
            {"input": "25", "output": "1389537"}
        ],
        hidden_test_cases=[
            {"input": "0", "output": "0"},
            {"input": "1", "output": "1"},
            {"input": "2", "output": "1"}
        ],
        hints=[
            "Initialize three variables: t0 = 0, t1 = 1, t2 = 1.",
            "Loop from 3 to n, updating: t0, t1, t2 = t1, t2, t0 + t1 + t2.",
            "Return t2."
        ],
        time_complexity="O(N)",
        space_complexity="O(1)",
        py_fn_name="tribonacci",
        py_fn_params="n: int",
        py_fn_ret_type="int",
        py_sample_body="if n == 0: return 0\n    if n <= 2: return 1\n    a, b, c = 0, 1, 1\n    for _ in range(3, n + 1):\n        a, b, c = b, c, a + b + c\n    return c",
        solution_explanation="Iterative constant space simulation of the 3-term linear recurrence relation."
    ),

    make_problem(
        id="dsa_top150_130",
        number=130,
        title="House Robber",
        topic_id="topic_dynamic_programming",
        subtopic="Non-Adjacent Maximum Sum",
        difficulty="MEDIUM",
        roadmap_stage="Core Patterns",
        companies=["Amazon", "Google", "Meta", "Microsoft"],
        description="You are a professional robber planning to rob houses along a street. Each house has a certain amount of money stashed, the only constraint stopping you from robbing each of them is that adjacent houses have security systems connected and it will automatically contact the police if two adjacent houses were broken into on the same night.\n\nGiven an integer array nums representing the amount of money of each house, return the maximum amount of money you can rob tonight without alerting the police.",
        input_format="A single line of space-separated integers representing nums.",
        output_format="Single integer maximum loot.",
        constraints=["1 <= nums.length <= 100", "0 <= nums[i] <= 400"],
        examples=[
            {"input": "1 2 3 1", "output": "4", "explanation": "Rob house 1 (money = 1) and then rob house 3 (money = 3). Total = 4."},
            {"input": "2 7 9 3 1", "output": "12", "explanation": "Rob house 1 (2), house 3 (9) and house 5 (1). Total = 12."}
        ],
        public_test_cases=[
            {"input": "1 2 3 1", "output": "4"},
            {"input": "2 7 9 3 1", "output": "12"}
        ],
        hidden_test_cases=[
            {"input": "0", "output": "0"},
            {"input": "2 1 1 2", "output": "4"}
        ],
        hints=[
            "For house i, you either rob it (money = nums[i] + max_loot(i-2)) or skip it (money = max_loot(i-1)).",
            "Recurrence: dp[i] = max(dp[i-1], nums[i] + dp[i-2]).",
            "Keep two variables for previous two max loots."
        ],
        time_complexity="O(N)",
        space_complexity="O(1)",
        py_fn_name="rob",
        py_fn_params="nums: list[int]",
        py_fn_ret_type="int",
        py_sample_body="rob1, rob2 = 0, 0\n    for n in nums:\n        rob1, rob2 = rob2, max(rob2, rob1 + n)\n    return rob2",
        solution_explanation="At each house, choose between skipping current house (rob2) or robbing it (rob1 + n). Maintain rolling maximums in O(1) space."
    ),

    make_problem(
        id="dsa_top150_131",
        number=131,
        title="House Robber II",
        topic_id="topic_dynamic_programming",
        subtopic="Circular Non-Adjacent Robber",
        difficulty="MEDIUM",
        roadmap_stage="Core Patterns",
        companies=["Amazon", "Microsoft"],
        description="You are a professional robber planning to rob houses along a street. Each house has a certain amount of money stashed. All houses at this place are arranged in a circle. That means the first house is the neighbor of the last one.\n\nGiven an integer array nums representing the amount of money of each house, return the maximum amount of money you can rob tonight without alerting the police.",
        input_format="A single line of space-separated integers representing nums.",
        output_format="Single integer maximum loot.",
        constraints=["1 <= nums.length <= 100", "0 <= nums[i] <= 1000"],
        examples=[
            {"input": "2 3 2", "output": "3", "explanation": "You cannot rob house 1 and house 3 because they are neighbors in a circle."},
            {"input": "1 2 3 1", "output": "4"},
            {"input": "1 2 3", "output": "3"}
        ],
        public_test_cases=[
            {"input": "2 3 2", "output": "3"},
            {"input": "1 2 3 1", "output": "4"}
        ],
        hidden_test_cases=[
            {"input": "1", "output": "1"},
            {"input": "1 3 1 3 100", "output": "103"}
        ],
        hints=[
            "Since house 0 and house n-1 are connected, you cannot rob both.",
            "Run House Robber I on two subarrays: nums[1:] (excluding first house) and nums[:-1] (excluding last house).",
            "The answer is max(nums[0], rob(nums[1:]), rob(nums[:-1]))."
        ],
        time_complexity="O(N)",
        space_complexity="O(1)",
        py_fn_name="rob2",
        py_fn_params="nums: list[int]",
        py_fn_ret_type="int",
        py_sample_body="def helper(arr):\n        r1, r2 = 0, 0\n        for n in arr:\n            r1, r2 = r2, max(r2, r1 + n)\n        return r2\n    if len(nums) == 1: return nums[0]\n    return max(helper(nums[1:]), helper(nums[:-1]))",
        solution_explanation="Decompose circle into two linear instances: excluding the first house or excluding the last house."
    ),

    make_problem(
        id="dsa_top150_132",
        number=132,
        title="Coin Change",
        topic_id="topic_dynamic_programming",
        subtopic="Unbounded Knapsack Minimum",
        difficulty="MEDIUM",
        roadmap_stage="Core Patterns",
        companies=["Amazon", "Apple", "Google", "Meta", "Microsoft"],
        description="You are given an integer array coins representing coins of different denominations and an integer amount representing a total amount of money.\n\nReturn the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return -1.\n\nYou may assume that you have an infinite number of each kind of coin.",
        input_format="Line 1: space-separated coin values\nLine 2: amount integer",
        output_format="Minimum number of coins, or -1.",
        constraints=["1 <= coins.length <= 12", "1 <= coins[i] <= 2^31 - 1", "0 <= amount <= 10^4"],
        examples=[
            {"input": "1 2 5\n11", "output": "3", "explanation": "11 = 5 + 5 + 1 (3 coins)."},
            {"input": "2\n3", "output": "-1"},
            {"input": "1\n0", "output": "0"}
        ],
        public_test_cases=[
            {"input": "1 2 5\n11", "output": "3"},
            {"input": "2\n3", "output": "-1"}
        ],
        hidden_test_cases=[
            {"input": "1\n0", "output": "0"},
            {"input": "2 5 10 1\n27", "output": "4"}
        ],
        hints=[
            "Let dp[i] be the minimum coins needed for amount i.",
            "Base case: dp[0] = 0, all other dp[i] = infinity.",
            "For each coin c and amount a from c to amount: dp[a] = min(dp[a], 1 + dp[a - c])."
        ],
        time_complexity="O(Amount * Coins)",
        space_complexity="O(Amount)",
        py_fn_name="coinChange",
        py_fn_params="coins: list[int], amount: int",
        py_fn_ret_type="int",
        py_sample_body="dp = [float('inf')] * (amount + 1)\n    dp[0] = 0\n    for a in range(1, amount + 1):\n        for c in coins:\n            if a - c >= 0:\n                dp[a] = min(dp[a], 1 + dp[a - c])\n    return dp[amount] if dp[amount] != float('inf') else -1",
        solution_explanation="Bottom-up 1D DP: for each amount, test using each coin denomination and take the minimum of 1 + dp[amount - coin]."
    ),

    make_problem(
        id="dsa_top150_133",
        number=133,
        title="Coin Change II",
        topic_id="topic_dynamic_programming",
        subtopic="Unbounded Knapsack Combinations",
        difficulty="MEDIUM",
        roadmap_stage="Core Patterns",
        companies=["Amazon", "Google", "Microsoft"],
        description="You are given an integer array coins representing coins of different denominations and an integer amount representing a total amount of money.\n\nReturn the number of combinations that make up that amount. If that amount of money cannot be made up by any combination of the coins, return 0.",
        input_format="Line 1: space-separated integers for coins\nLine 2: amount integer",
        output_format="Single integer representing total combinations.",
        constraints=["1 <= coins.length <= 300", "1 <= coins[i] <= 5000", "All the values of coins are unique.", "0 <= amount <= 5000"],
        examples=[
            {"input": "1 2 5\n5", "output": "4", "explanation": "5=5, 5=2+2+1, 5=2+1+1+1, 5=1+1+1+1+1."},
            {"input": "2\n3", "output": "0"},
            {"input": "10\n10", "output": "1"}
        ],
        public_test_cases=[
            {"input": "1 2 5\n5", "output": "4"},
            {"input": "2\n3", "output": "0"}
        ],
        hidden_test_cases=[
            {"input": "10\n10", "output": "1"}
        ],
        hints=[
            "To count unique combinations without permutations, loop over coins in the outer loop.",
            "dp[a] += dp[a - coin].",
            "Outer coin loop ensures coins are considered in a fixed order."
        ],
        time_complexity="O(Amount * Coins)",
        space_complexity="O(Amount)",
        py_fn_name="change",
        py_fn_params="amount: int, coins: list[int]",
        py_fn_ret_type="int",
        py_sample_body="dp = [0] * (amount + 1)\n    dp[0] = 1\n    for c in coins:\n        for a in range(c, amount + 1):\n            dp[a] += dp[a - c]\n    return dp[amount]",
        solution_explanation="Unbounded knapsack combination count: outer iteration over coins guarantees combination uniqueness without permutations."
    ),

    make_problem(
        id="dsa_top150_134",
        number=134,
        title="Longest Increasing Subsequence",
        topic_id="topic_dynamic_programming",
        subtopic="Binary Search Patience Sorting",
        difficulty="HARD",
        roadmap_stage="Advanced Mastery",
        companies=["Amazon", "Google", "Meta", "Microsoft"],
        description="Given an integer array nums, return the length of the longest strictly increasing subsequence.\n\nCan you solve it in O(n log(n)) time complexity?",
        input_format="A single line of space-separated integers representing nums.",
        output_format="Single integer length of LIS.",
        constraints=["1 <= nums.length <= 2500", "-10^4 <= nums[i] <= 10^4"],
        examples=[
            {"input": "10 9 2 5 3 7 101 18", "output": "4", "explanation": "The longest increasing subsequence is [2, 3, 7, 101], therefore the length is 4."},
            {"input": "0 1 0 3 2 3", "output": "4"},
            {"input": "7 7 7 7 7 7 7", "output": "1"}
        ],
        public_test_cases=[
            {"input": "10 9 2 5 3 7 101 18", "output": "4"},
            {"input": "0 1 0 3 2 3", "output": "4"}
        ],
        hidden_test_cases=[
            {"input": "7 7 7 7 7 7 7", "output": "1"},
            {"input": "1 3 6 7 9 4 10 5 6", "output": "6"}
        ],
        hints=[
            "Patience sorting algorithm using binary search (bisect_left).",
            "Maintain an array `tails` where tails[i] stores the smallest tail of all increasing subsequences of length i + 1.",
            "For each num, use binary search to find its insertion spot in `tails`."
        ],
        time_complexity="O(N log N)",
        space_complexity="O(N)",
        py_fn_name="lengthOfLIS",
        py_fn_params="nums: list[int]",
        py_fn_ret_type="int",
        py_sample_body="import bisect\n    tails = []\n    for x in nums:\n        idx = bisect.bisect_left(tails, x)\n        if idx == len(tails): tails.append(x)\n        else: tails[idx] = x\n    return len(tails)",
        solution_explanation="Patience Sorting with binary search: maintain monotonic smallest tails of increasing subsequences. Runs in O(N log N) time."
    ),

    make_problem(
        id="dsa_top150_135",
        number=135,
        title="Longest Common Subsequence",
        topic_id="topic_dynamic_programming",
        subtopic="2D Grid String Alignment",
        difficulty="MEDIUM",
        roadmap_stage="Core Patterns",
        companies=["Amazon", "Google", "Microsoft"],
        description="Given two strings text1 and text2, return the length of their longest common subsequence. If there is no common subsequence, return 0.\n\nA subsequence of a string is a new string generated from the original string with some characters (can be none) deleted without changing the relative order of the remaining characters.",
        input_format="Line 1: string text1\nLine 2: string text2",
        output_format="Single integer length of LCS.",
        constraints=["1 <= text1.length, text2.length <= 1000", "text1 and text2 consist of only lowercase English characters."],
        examples=[
            {"input": "abcde\nace", "output": "3", "explanation": "The longest common subsequence is \"ace\" and its length is 3."},
            {"input": "abc\nabc", "output": "3"},
            {"input": "abc\ndef", "output": "0"}
        ],
        public_test_cases=[
            {"input": "abcde\nace", "output": "3"},
            {"input": "abc\nabc", "output": "3"}
        ],
        hidden_test_cases=[
            {"input": "abc\ndef", "output": "0"},
            {"input": "bsbininm\njmjkbkjkv", "output": "1"}
        ],
        hints=[
            "Let dp[i][j] be LCS of text1[i:] and text2[j:].",
            "If text1[i] == text2[j]: dp[i][j] = 1 + dp[i+1][j+1].",
            "Otherwise: dp[i][j] = max(dp[i+1][j], dp[i][j+1])."
        ],
        time_complexity="O(M * N)",
        space_complexity="O(min(M, N))",
        py_fn_name="longestCommonSubsequence",
        py_fn_params="text1: str, text2: str",
        py_fn_ret_type="int",
        py_sample_body="m, n = len(text1), len(text2)\n    dp = [0] * (n + 1)\n    for i in range(m - 1, -1, -1):\n        cur = [0] * (n + 1)\n        for j in range(n - 1, -1, -1):\n            if text1[i] == text2[j]: cur[j] = 1 + dp[j + 1]\n            else: cur[j] = max(dp[j], cur[j + 1])\n        dp = cur\n    return dp[0]",
        solution_explanation="2D DP table comparing characters: matching letters contribute 1 + diagonal; non-matching take the max of top and left."
    ),

    make_problem(
        id="dsa_top150_136",
        number=136,
        title="Word Break",
        topic_id="topic_dynamic_programming",
        subtopic="Prefix Word Dictionary Matching",
        difficulty="HARD",
        roadmap_stage="Advanced Mastery",
        companies=["Amazon", "Meta", "Google", "Bloomberg"],
        description="Given a string s and a dictionary of strings wordDict, return true if s can be segmented into a space-separated sequence of one or more dictionary words.\n\nNote that the same word in the dictionary may be reused multiple times in the segmentation.",
        input_format="Line 1: string s\nLine 2: space-separated dictionary words",
        output_format="true or false",
        constraints=["1 <= s.length <= 300", "1 <= wordDict.length <= 1000", "1 <= wordDict[i].length <= 20", "s and wordDict[i] consist of only lowercase English letters.", "All the strings of wordDict are unique."],
        examples=[
            {"input": "leetcode\nleet code", "output": "true", "explanation": "Return true because \"leetcode\" can be segmented as \"leet code\"."},
            {"input": "applepenapple\napple pen", "output": "true"},
            {"input": "catsandog\ncats dog sand and cat", "output": "false"}
        ],
        public_test_cases=[
            {"input": "leetcode\nleet code", "output": "true"},
            {"input": "applepenapple\napple pen", "output": "true"}
        ],
        hidden_test_cases=[
            {"input": "catsandog\ncats dog sand and cat", "output": "false"},
            {"input": "a\nb", "output": "false"}
        ],
        hints=[
            "Let dp[i] = true if s[:i] can be segmented using dictionary words.",
            "Base case: dp[0] = true.",
            "For each i from 1 to len(s), check every word w in wordDict: if i >= len(w) and dp[i - len(w)] and s[i - len(w):i] == w, then dp[i] = true."
        ],
        time_complexity="O(N * W)",
        space_complexity="O(N)",
        py_fn_name="wordBreak",
        py_fn_params="s: str, wordDict: list[str]",
        py_fn_ret_type="bool",
        py_sample_body="dp = [False] * (len(s) + 1)\n    dp[0] = True\n    for i in range(1, len(s) + 1):\n        for w in wordDict:\n            if i >= len(w) and dp[i - len(w)] and s[i - len(w):i] == w:\n                dp[i] = True\n                break\n    return dp[-1]",
        solution_explanation="Bottom-up DP: dp[i] tracks whether prefix s[:i] is formable by testing each dictionary word suffix."
    ),

    make_problem(
        id="dsa_top150_137",
        number=137,
        title="Unique Paths",
        topic_id="topic_dynamic_programming",
        subtopic="Grid Path Combinatorics",
        difficulty="MEDIUM",
        roadmap_stage="Core Patterns",
        companies=["Amazon", "Google", "Microsoft"],
        description="There is a robot on an m x n grid. The robot is initially located at the top-left corner (i.e., grid[0][0]). The robot tries to move to the bottom-right corner (i.e., grid[m - 1][n - 1]). The robot can only move either down or right at any point in time.\n\nGiven the two integers m and n, return the number of possible unique paths that the robot can take to reach the bottom-right corner.",
        input_format="Single line containing m n separated by space.",
        output_format="Single integer count of unique paths.",
        constraints=["1 <= m, n <= 100"],
        examples=[
            {"input": "3 7", "output": "28"},
            {"input": "3 2", "output": "3"}
        ],
        public_test_cases=[
            {"input": "3 7", "output": "28"},
            {"input": "3 2", "output": "3"}
        ],
        hidden_test_cases=[
            {"input": "1 1", "output": "1"},
            {"input": "3 3", "output": "6"}
        ],
        hints=[
            "dp[r][c] = dp[r+1][c] + dp[r][c+1].",
            "Can be solved in O(N) space using a single rolling 1D row array.",
            "Alternatively, combinatorial formula: C(m + n - 2, m - 1)."
        ],
        time_complexity="O(M * N)",
        space_complexity="O(N)",
        py_fn_name="uniquePaths",
        py_fn_params="m: int, n: int",
        py_fn_ret_type="int",
        py_sample_body="row = [1] * n\n    for _ in range(m - 1):\n        new_row = [1] * n\n        for j in range(n - 2, -1, -1):\n            new_row[j] = new_row[j + 1] + row[j]\n        row = new_row\n    return row[0]",
        solution_explanation="Paths to (r, c) equals sum of paths from right cell and down cell. Space optimized to a single rolling 1D array."
    ),

    make_problem(
        id="dsa_top150_138",
        number=138,
        title="Minimum Path Sum",
        topic_id="topic_dynamic_programming",
        subtopic="2D Grid Minimum Cost Traversal",
        difficulty="MEDIUM",
        roadmap_stage="Core Patterns",
        companies=["Amazon", "Google", "Meta"],
        description="Given a m x n grid filled with non-negative numbers, find a path from top left to bottom right, which minimizes the sum of all numbers along its path.\n\nNote: You can only move either down or right at any point in time.",
        input_format="Line 1: m n\nNext m lines: n space-separated non-negative integers",
        output_format="Single integer minimum path sum.",
        constraints=["m == grid.length", "n == grid[i].length", "1 <= m, n <= 200", "0 <= grid[i][j] <= 200"],
        examples=[
            {"input": "3 3\n1 3 1\n1 5 1\n4 2 1", "output": "7", "explanation": "Path 1 -> 3 -> 1 -> 1 -> 1 minimizes the sum to 7."},
            {"input": "2 3\n1 2 3\n4 5 6", "output": "12"}
        ],
        public_test_cases=[
            {"input": "3 3\n1 3 1\n1 5 1\n4 2 1", "output": "7"},
            {"input": "2 3\n1 2 3\n4 5 6", "output": "12"}
        ],
        hidden_test_cases=[
            {"input": "1 1\n5", "output": "5"}
        ],
        hints=[
            "At cell (r, c), minimum path sum is grid[r][c] + min(path(r+1, c), path(r, c+1)).",
            "Fill boundary rows and columns first.",
            "Can be done directly in place on the input grid."
        ],
        time_complexity="O(M * N)",
        space_complexity="O(1)",
        py_fn_name="minPathSum",
        py_fn_params="grid: list[list[int]]",
        py_fn_ret_type="int",
        py_sample_body="R, C = len(grid), len(grid[0])\n    for r in range(R):\n        for c in range(C):\n            if r == 0 and c == 0: continue\n            elif r == 0: grid[r][c] += grid[r][c - 1]\n            elif c == 0: grid[r][c] += grid[r - 1][c]\n            else: grid[r][c] += min(grid[r - 1][c], grid[r][c - 1])\n    return grid[R - 1][C - 1]",
        solution_explanation="In-place 2D dynamic programming: each cell adds the minimum of its incoming top or left path sums."
    ),

    make_problem(
        id="dsa_top150_139",
        number=139,
        title="Partition Equal Subset Sum",
        topic_id="topic_dynamic_programming",
        subtopic="0/1 Knapsack Subset Target",
        difficulty="MEDIUM",
        roadmap_stage="Core Patterns",
        companies=["Amazon", "Meta", "Google"],
        description="Given an integer array nums, return true if you can partition the array into two subsets such that the sum of the elements in both subsets is equal or false otherwise.",
        input_format="A single line of space-separated integers representing nums.",
        output_format="true or false",
        constraints=["1 <= nums.length <= 200", "1 <= nums[i] <= 100"],
        examples=[
            {"input": "1 5 11 5", "output": "true", "explanation": "The array can be partitioned as [1, 5, 5] and [11]."},
            {"input": "1 2 3 5", "output": "false"}
        ],
        public_test_cases=[
            {"input": "1 5 11 5", "output": "true"},
            {"input": "1 2 3 5", "output": "false"}
        ],
        hidden_test_cases=[
            {"input": "1 2 5", "output": "false"},
            {"input": "2 2", "output": "true"}
        ],
        hints=[
            "Total sum must be even; if total sum is odd, return false immediately.",
            "Target sum for subset is total // 2.",
            "0/1 Knapsack: track reachable sums using a hash set or bitset."
        ],
        time_complexity="O(N * Target)",
        space_complexity="O(Target)",
        py_fn_name="canPartition",
        py_fn_params="nums: list[int]",
        py_fn_ret_type="bool",
        py_sample_body="total = sum(nums)\n    if total % 2 != 0: return False\n    target = total // 2\n    dp = {0}\n    for n in nums:\n        dp |= {s + n for s in dp if s + n <= target}\n        if target in dp: return True\n    return False",
        solution_explanation="0/1 Knapsack formulation: test if a subset exists that sums to sum(nums) // 2 using dynamic set extension."
    ),

    make_problem(
        id="dsa_top150_140",
        number=140,
        title="Decode Ways",
        topic_id="topic_dynamic_programming",
        subtopic="1D Lookback String Parsing",
        difficulty="MEDIUM",
        roadmap_stage="Core Patterns",
        companies=["Amazon", "Google", "Meta", "Microsoft"],
        description="A message containing letters from A-Z can be encoded into numbers using the following mapping:\n'A' -> \"1\", 'B' -> \"2\", ... 'Z' -> \"26\".\n\nGiven a string s containing only digits, return the number of ways to decode it.",
        input_format="A single line containing digit string s.",
        output_format="Single integer representing total decoding ways.",
        constraints=["1 <= s.length <= 100", "s contains only digits and may contain leading zero(s)."],
        examples=[
            {"input": "12", "output": "2", "explanation": "\"12\" could be decoded as \"AB\" (1 2) or \"L\" (12)."},
            {"input": "226", "output": "3", "explanation": "\"226\" could be decoded as \"BZ\" (2 26), \"VF\" (22 6), or \"BBF\" (2 2 6)."},
            {"input": "06", "output": "0", "explanation": "\"06\" cannot be mapped to \"F\" because \"6\" is different from \"06\"."}
        ],
        public_test_cases=[
            {"input": "12", "output": "2"},
            {"input": "226", "output": "3"}
        ],
        hidden_test_cases=[
            {"input": "06", "output": "0"},
            {"input": "10", "output": "1"}
        ],
        hints=[
            "Single digit decode is valid if s[i] != '0'.",
            "Two digit decode is valid if 10 <= int(s[i-1:i+1]) <= 26.",
            "dp[i] = (dp[i-1] if valid single) + (dp[i-2] if valid double)."
        ],
        time_complexity="O(N)",
        space_complexity="O(1)",
        py_fn_name="numDecodings",
        py_fn_params="s: str",
        py_fn_ret_type="int",
        py_sample_body="if not s or s[0] == '0': return 0\n    prev2, prev1 = 1, 1\n    for i in range(1, len(s)):\n        curr = 0\n        if s[i] != '0': curr += prev1\n        if 10 <= int(s[i-1:i+1]) <= 26: curr += prev2\n        prev2, prev1 = prev1, curr\n    return prev1",
        solution_explanation="1D DP with 2 lookback states: valid single character adds prev1, valid double character (10-26) adds prev2."
    ),

    make_problem(
        id="dsa_top150_141",
        number=141,
        title="Maximum Product Subarray",
        topic_id="topic_dynamic_programming",
        subtopic="Sign-Flip Min/Max Tracking",
        difficulty="MEDIUM",
        roadmap_stage="Core Patterns",
        companies=["Amazon", "Google", "LinkedIn", "Microsoft"],
        description="Given an integer array nums, find a subarray that has the largest product, and return the product.\n\nThe test cases are generated so that the answer will fit in a 32-bit integer.",
        input_format="A single line of space-separated integers representing nums.",
        output_format="Single integer maximum product.",
        constraints=["1 <= nums.length <= 2 * 10^4", "-10 <= nums[i] <= 10"],
        examples=[
            {"input": "2 3 -2 4", "output": "6", "explanation": "[2,3] has the largest product 6."},
            {"input": "-2 0 -1", "output": "0"}
        ],
        public_test_cases=[
            {"input": "2 3 -2 4", "output": "6"},
            {"input": "-2 0 -1", "output": "0"}
        ],
        hidden_test_cases=[
            {"input": "-2 3 -4", "output": "24"},
            {"input": "-2", "output": "-2"}
        ],
        hints=[
            "Multiplying by a negative number can turn a large minimum into a large maximum.",
            "Maintain both `cur_max` and `cur_min` as you iterate.",
            "When encountering a negative number, swap cur_max and cur_min."
        ],
        time_complexity="O(N)",
        space_complexity="O(1)",
        py_fn_name="maxProduct",
        py_fn_params="nums: list[int]",
        py_fn_ret_type="int",
        py_sample_body="res = max(nums)\n    cur_min, cur_max = 1, 1\n    for n in nums:\n        if n < 0: cur_min, cur_max = cur_max, cur_min\n        cur_max = max(n, cur_max * n)\n        cur_min = min(n, cur_min * n)\n        res = max(res, cur_max)\n    return res",
        solution_explanation="Track both rolling minimum and maximum products. A negative number swaps extremes, turning negative minimums into positive maximums."
    ),

    make_problem(
        id="dsa_top150_142",
        number=142,
        title="Edit Distance",
        topic_id="topic_dynamic_programming",
        subtopic="Levenshtein Distance Matrix",
        difficulty="HARD",
        roadmap_stage="Placement Revision",
        companies=["Google", "Amazon", "Microsoft"],
        description="Given two strings word1 and word2, return the minimum number of operations required to convert word1 to word2.\n\nYou have the following three operations permitted on a word:\n- Insert a character\n- Delete a character\n- Replace a character",
        input_format="Line 1: string word1\nLine 2: string word2",
        output_format="Single integer minimum edit operations.",
        constraints=["0 <= word1.length, word2.length <= 500", "word1 and word2 consist of lowercase English letters."],
        examples=[
            {"input": "horse\nros", "output": "3", "explanation": "horse -> rorse -> rose -> ros (3 ops)."},
            {"input": "intention\nexecution", "output": "5"}
        ],
        public_test_cases=[
            {"input": "horse\nros", "output": "3"},
            {"input": "intention\nexecution", "output": "5"}
        ],
        hidden_test_cases=[
            {"input": "\na", "output": "1"},
            {"input": "abc\nabc", "output": "0"}
        ],
        hints=[
            "Let dp[i][j] be minimum operations to convert word1[i:] to word2[j:].",
            "If characters match: dp[i][j] = dp[i+1][j+1].",
            "Otherwise: 1 + min(dp[i+1][j] (delete), dp[i][j+1] (insert), dp[i+1][j+1] (replace))."
        ],
        time_complexity="O(M * N)",
        space_complexity="O(min(M, N))",
        py_fn_name="minDistance",
        py_fn_params="word1: str, word2: str",
        py_fn_ret_type="int",
        py_sample_body="m, n = len(word1), len(word2)\n    dp = list(range(n + 1))\n    for i in range(1, m + 1):\n        new_dp = [i] + [0] * n\n        for j in range(1, n + 1):\n            if word1[i - 1] == word2[j - 1]:\n                new_dp[j] = dp[j - 1]\n            else:\n                new_dp[j] = 1 + min(dp[j], new_dp[j - 1], dp[j - 1])\n        dp = new_dp\n    return dp[n]",
        solution_explanation="Levenshtein 2D table evaluates minimum operations between insertion, deletion, and replacement in O(M*N) time."
    ),

    # ------------------ TOPIC 15: TRIES AND ADVANCED (4 questions: 0 Easy, 3 Medium, 1 Hard) ------------------
    make_problem(
        id="dsa_top150_143",
        number=143,
        title="Implement Trie (Prefix Tree)",
        topic_id="topic_tries_advanced",
        subtopic="Prefix Tree Character Trie",
        difficulty="MEDIUM",
        roadmap_stage="Core Patterns",
        companies=["Amazon", "Google", "Meta", "Microsoft"],
        description="A trie (pronounced as \"try\") or prefix tree is a tree data structure used to efficiently store and retrieve keys in a dataset of strings.\n\nImplement the Trie class:\n- Trie() Initializes the trie object.\n- void insert(String word) Inserts the string word into the trie.\n- boolean search(String word) Returns true if the string word is in the trie, and false otherwise.\n- boolean startsWith(String prefix) Returns true if there is a previously inserted string word that has the prefix prefix, and false otherwise.",
        input_format="Operations: insert, search, startsWith",
        output_format="Search and startsWith results separated by space.",
        constraints=["1 <= word.length, prefix.length <= 2000", "word and prefix consist only of lowercase English letters."],
        examples=[
            {"input": "insert apple\nsearch apple\nsearch app\nstartsWith app\ninsert app\nsearch app", "output": "true false true true"}
        ],
        public_test_cases=[
            {"input": "insert apple\nsearch apple\nsearch app\nstartsWith app\ninsert app\nsearch app", "output": "true false true true"}
        ],
        hidden_test_cases=[
            {"input": "insert cat\nsearch dog", "output": "false"}
        ],
        hints=[
            "Each TrieNode has a dictionary of children and a boolean flag `is_end_of_word`.",
            "insert: walk down existing character nodes, create missing ones, mark final node as end of word.",
            "search checks is_end_of_word; startsWith checks only prefix path existence."
        ],
        time_complexity="O(L) per operation",
        space_complexity="O(Total Characters)",
        py_fn_name="Trie",
        py_fn_params="",
        py_fn_ret_type="",
        py_sample_body="class TrieNode:\n    def __init__(self):\n        self.children = {}\n        self.is_word = False\nclass Trie:\n    def __init__(self):\n        self.root = TrieNode()\n    def insert(self, word: str) -> None:\n        curr = self.root\n        for c in word:\n            if c not in curr.children: curr.children[c] = TrieNode()\n            curr = curr.children[c]\n        curr.is_word = True\n    def search(self, word: str) -> bool:\n        curr = self.root\n        for c in word:\n            if c not in curr.children: return False\n            curr = curr.children[c]\n        return curr.is_word\n    def startsWith(self, prefix: str) -> bool:\n        curr = self.root\n        for c in prefix:\n            if c not in curr.children: return False\n            curr = curr.children[c]\n        return True",
        solution_explanation="Prefix tree storing words by character transitions. Lookups, insertions, and prefix tests operate strictly in O(L) time where L is word length."
    ),

    make_problem(
        id="dsa_top150_144",
        number=144,
        title="Design Add and Search Words Data Structure",
        topic_id="topic_tries_advanced",
        subtopic="Wildcard Trie DFS",
        difficulty="HARD",
        roadmap_stage="Advanced Mastery",
        companies=["Meta", "Amazon", "Google"],
        description="Design a data structure that supports adding new words and finding if a string matches any previously added string.\n\nImplement the WordDictionary class:\n- WordDictionary() Initializes the object.\n- void addWord(word) Adds word to the data structure, it can be matched later.\n- bool search(word) Returns true if there is any string in the data structure that matches word or false otherwise. word may contain dots '.' where dots can be matched with any letter.",
        input_format="Operations: addWord, search",
        output_format="Boolean results for search operations.",
        constraints=["1 <= word.length <= 25", "word in addWord consists of lowercase English letters.", "word in search consist of '.' or lowercase English letters."],
        examples=[
            {"input": "add bad\nadd dad\nadd mad\nsearch pad\nsearch bad\nsearch .ad\nsearch b..", "output": "false true true true"}
        ],
        public_test_cases=[
            {"input": "add bad\nadd dad\nadd mad\nsearch pad\nsearch bad\nsearch .ad\nsearch b..", "output": "false true true true"}
        ],
        hidden_test_cases=[
            {"input": "add a\nsearch .", "output": "true"}
        ],
        hints=[
            "Store words in a Trie.",
            "When searching, if the current character is a letter, follow the child node normally.",
            "If the current character is '.', iterate over all existing children at the current node recursively."
        ],
        time_complexity="O(M) add, O(26^M) wildcard search",
        space_complexity="O(Total Characters)",
        py_fn_name="WordDictionary",
        py_fn_params="",
        py_fn_ret_type="",
        py_sample_body="class WordDictionary:\n    def __init__(self):\n        self.root = {}\n    def addWord(self, word: str) -> None:\n        node = self.root\n        for c in word:\n            if c not in node: node[c] = {}\n            node = node[c]\n        node['#'] = True\n    def search(self, word: str) -> bool:\n        def dfs(i, node):\n            if i == len(word): return '#' in node\n            c = word[i]\n            if c == '.':\n                return any(dfs(i + 1, child) for k, child in node.items() if k != '#')\n            if c not in node: return False\n            return dfs(i + 1, node[c])\n        return dfs(0, self.root)",
        solution_explanation="Trie with recursive DFS for wildcard dots. A '.' triggers exploration of all present character branches at current level."
    ),

    make_problem(
        id="dsa_top150_145",
        number=145,
        title="Implement Disjoint Set Union or Union-Find",
        topic_id="topic_tries_advanced",
        subtopic="Disjoint Set Union (Rank & Path Compression)",
        difficulty="MEDIUM",
        roadmap_stage="Core Patterns",
        companies=["Google", "Amazon", "Microsoft"],
        description="Implement the Disjoint Set Union (DSU / Union-Find) data structure supporting find and union operations with path compression and union by rank.\n\nGiven N elements (0 to N-1) and a series of operations ('union u v', 'connected u v'), return whether elements u and v belong to the same connected component.",
        input_format="Line 1: N Q (elements and queries)\nNext Q lines: union u v OR connected u v",
        output_format="Results of connected queries (true/false) separated by space.",
        constraints=["1 <= N <= 10^5", "1 <= Q <= 10^5"],
        examples=[
            {"input": "5 4\nunion 0 1\nunion 1 2\nconnected 0 2\nconnected 0 3", "output": "true false"}
        ],
        public_test_cases=[
            {"input": "5 4\nunion 0 1\nunion 1 2\nconnected 0 2\nconnected 0 3", "output": "true false"}
        ],
        hidden_test_cases=[
            {"input": "2 1\nconnected 0 1", "output": "false"}
        ],
        hints=[
            "Parent array: parent[i] = i initially.",
            "Path compression in find: parent[x] = find(parent[x]).",
            "Union by rank: attach shorter tree under taller tree to keep tree height bounded by inverse Ackermann function."
        ],
        time_complexity="O(alpha(N)) ~ O(1) amortized",
        space_complexity="O(N)",
        py_fn_name="UnionFind",
        py_fn_params="",
        py_fn_ret_type="",
        py_sample_body="class UnionFind:\n    def __init__(self, n):\n        self.parent = list(range(n))\n        self.rank = [1] * n\n    def find(self, i):\n        if self.parent[i] == i: return i\n        self.parent[i] = self.find(self.parent[i])\n        return self.parent[i]\n    def union(self, i, j):\n        root_i, root_j = self.find(i), self.find(j)\n        if root_i != root_j:\n            if self.rank[root_i] > self.rank[root_j]: self.parent[root_j] = root_i\n            elif self.rank[root_i] < self.rank[root_j]: self.parent[root_i] = root_j\n            else: self.parent[root_j] = root_i; self.rank[root_i] += 1\n    def connected(self, i, j):\n        return self.find(i) == self.find(j)",
        solution_explanation="Path compression flattens tree on lookup; union by rank attaches smaller trees under larger ones. Near-constant amortized O(alpha(N)) performance."
    ),

    make_problem(
        id="dsa_top150_146",
        number=146,
        title="Word Search II",
        topic_id="topic_tries_advanced",
        subtopic="Trie-Accelerated Grid DFS",
        difficulty="HARD",
        roadmap_stage="Placement Revision",
        companies=["Amazon", "Apple", "Google", "Meta", "Microsoft"],
        description="Given an m x n board of characters and a list of strings words, return all words on the board.\n\nEach word must be constructed from letters of sequentially adjacent cells, where adjacent cells are horizontally or vertically neighboring. The same letter cell may not be used more than once in a word.",
        input_format="Line 1: m n\nNext m lines: n space-separated characters\nLast line: space-separated dictionary words",
        output_format="Found words sorted alphabetically.",
        constraints=["m == board.length", "n == board[i].length", "1 <= m, n <= 12", "1 <= words.length <= 3 * 10^4", "1 <= words[i].length <= 10"],
        examples=[
            {"input": "4 4\no a a n\ne t a e\ni h k r\ni f l v\noath pea eat rain", "output": "eat oath"},
            {"input": "2 2\na b\nc d\nabcb", "output": ""}
        ],
        public_test_cases=[
            {"input": "4 4\no a a n\ne t a e\ni h k r\ni f l v\noath pea eat rain", "output": "eat oath"},
            {"input": "2 2\na b\nc d\nabcb", "output": ""}
        ],
        hidden_test_cases=[
            {"input": "1 1\na\na", "output": "a"}
        ],
        hints=[
            "Searching each word individually from all cells is too slow.",
            "Insert all dictionary words into a Trie.",
            "DFS through the grid: traverse the Trie simultaneously, pruning branches that do not exist in the Trie."
        ],
        time_complexity="O(M * N * 4^L)",
        space_complexity="O(Total Characters in Words)",
        py_fn_name="findWords",
        py_fn_params="board: list[list[str]], words: list[str]",
        py_fn_ret_type="list[str]",
        py_sample_body="trie = {}\n    for w in words:\n        node = trie\n        for c in w:\n            if c not in node: node[c] = {}\n            node = node[c]\n        node['$'] = w\n    R, C = len(board), len(board[0])\n    res = []\n    def dfs(r, c, parent):\n        char = board[r][c]\n        curr = parent[char]\n        if '$' in curr:\n            res.append(curr.pop('$'))\n        board[r][c] = '#'\n        for dr, dc in [(1,0),(-1,0),(0,1),(0,-1)]:\n            nr, nc = r + dr, c + dc\n            if 0 <= nr < R and 0 <= nc < C and board[nr][nc] in curr:\n                dfs(nr, nc, curr)\n        board[r][c] = char\n        if not curr: parent.pop(char)\n    for r in range(R):\n        for c in range(C):\n            if board[r][c] in trie: dfs(r, c, trie)\n    return sorted(res)",
        solution_explanation="Prefix Trie indexes all target words. Grid DFS simultaneously walks down the Trie, immediately pruning invalid path prefixes."
    ),

    # ------------------ TOPIC 16: BIT MANIPULATION (4 questions: 4 Easy, 0 Medium, 0 Hard) ------------------
    make_problem(
        id="dsa_top150_147",
        number=147,
        title="Single Number",
        topic_id="topic_bit_manipulation",
        subtopic="XOR Cancellation Invariant",
        difficulty="EASY",
        roadmap_stage="Beginner Foundations",
        companies=["Amazon", "Apple", "Google", "Meta"],
        description="Given a non-empty array of integers nums, every element appears twice except for one. Find that single one.\n\nYou must implement a solution with a linear runtime complexity and use only constant extra space.",
        input_format="A single line of space-separated integers.",
        output_format="The unique integer.",
        constraints=["1 <= nums.length <= 3 * 10^4", "-3 * 10^4 <= nums[i] <= 3 * 10^4", "Each element in the array appears twice except for one element which appears only once."],
        examples=[
            {"input": "2 2 1", "output": "1"},
            {"input": "4 1 2 1 2", "output": "4"},
            {"input": "1", "output": "1"}
        ],
        public_test_cases=[
            {"input": "2 2 1", "output": "1"},
            {"input": "4 1 2 1 2", "output": "4"}
        ],
        hidden_test_cases=[
            {"input": "1", "output": "1"},
            {"input": "-1 -1 -2", "output": "-2"}
        ],
        hints=[
            "XOR properties: a ^ a = 0, and a ^ 0 = a.",
            "XOR is associative and commutative.",
            "XORing all elements together will cancel out all pairs, leaving only the unique element."
        ],
        time_complexity="O(N)",
        space_complexity="O(1)",
        py_fn_name="singleNumber",
        py_fn_params="nums: list[int]",
        py_fn_ret_type="int",
        py_sample_body="ans = 0\n    for n in nums: ans ^= n\n    return ans",
        solution_explanation="XOR properties cancel duplicate pairs: a ^ a = 0 and a ^ 0 = a. The cumulative XOR across all elements isolates the single number."
    ),

    make_problem(
        id="dsa_top150_148",
        number=148,
        title="Number of 1 Bits",
        topic_id="topic_bit_manipulation",
        subtopic="Brian Kernighan's Algorithm",
        difficulty="EASY",
        roadmap_stage="Beginner Foundations",
        companies=["Apple", "Microsoft"],
        description="Write a function that takes the binary representation of a positive integer and returns the number of set bits it has (also known as the Hamming weight).",
        input_format="A single integer n.",
        output_format="Single integer count of 1 bits.",
        constraints=["1 <= n <= 2^31 - 1"],
        examples=[
            {"input": "11", "output": "3", "explanation": "11 in binary is 1011, which has 3 set bits."},
            {"input": "128", "output": "1", "explanation": "128 in binary is 10000000 (1 set bit)."},
            {"input": "2147483645", "output": "30"}
        ],
        public_test_cases=[
            {"input": "11", "output": "3"},
            {"input": "128", "output": "1"}
        ],
        hidden_test_cases=[
            {"input": "1", "output": "1"},
            {"input": "3", "output": "2"}
        ],
        hints=[
            "Brian Kernighan's Algorithm: n & (n - 1) always clears the lowest set bit of n.",
            "Loop while n > 0: n = n & (n - 1) and increment count.",
            "Runs in O(Number of set bits), faster than checking all 32 bits."
        ],
        time_complexity="O(Set Bits)",
        space_complexity="O(1)",
        py_fn_name="hammingWeight",
        py_fn_params="n: int",
        py_fn_ret_type="int",
        py_sample_body="count = 0\n    while n:\n        n &= (n - 1)\n        count += 1\n    return count",
        solution_explanation="Brian Kernighan's bit trick n &= (n - 1) eliminates the least significant set bit in each iteration."
    ),

    make_problem(
        id="dsa_top150_149",
        number=149,
        title="Counting Bits",
        topic_id="topic_bit_manipulation",
        subtopic="DP Bit Transition",
        difficulty="EASY",
        roadmap_stage="Beginner Foundations",
        companies=["Amazon", "Apple", "Google"],
        description="Given an integer n, return an array ans of length n + 1 such that for each i (0 <= i <= n), ans[i] is the number of 1's in the binary representation of i.",
        input_format="A single integer n.",
        output_format="Space-separated integers representing bit counts from 0 to n.",
        constraints=["0 <= n <= 10^5"],
        examples=[
            {"input": "2", "output": "0 1 1", "explanation": "0: 0, 1: 1, 2: 1."},
            {"input": "5", "output": "0 1 1 2 1 2", "explanation": "0: 0, 1: 1, 2: 1, 3: 2, 4: 1, 5: 2."}
        ],
        public_test_cases=[
            {"input": "2", "output": "0 1 1"},
            {"input": "5", "output": "0 1 1 2 1 2"}
        ],
        hidden_test_cases=[
            {"input": "0", "output": "0"},
            {"input": "1", "output": "0 1"}
        ],
        hints=[
            "Notice that i >> 1 has fewer bits and has already been computed.",
            "The number of set bits in i equals bits in (i >> 1) plus (i & 1).",
            "ans[i] = ans[i >> 1] + (i & 1)."
        ],
        time_complexity="O(N)",
        space_complexity="O(N)",
        py_fn_name="countBits",
        py_fn_params="n: int",
        py_fn_ret_type="list[int]",
        py_sample_body="dp = [0] * (n + 1)\n    for i in range(1, n + 1):\n        dp[i] = dp[i >> 1] + (i & 1)\n    return dp",
        solution_explanation="Bit transition recurrence: dp[i] = dp[i >> 1] + (i & 1). Operates in linear O(N) time in a single pass."
    ),

    make_problem(
        id="dsa_top150_150",
        number=150,
        title="Reverse Bits",
        topic_id="topic_bit_manipulation",
        subtopic="32-Bit Reversal Shift",
        difficulty="EASY",
        roadmap_stage="Beginner Foundations",
        companies=["Apple", "Google", "Microsoft"],
        description="Reverse bits of a given 32 bits unsigned integer.",
        input_format="A single 32-bit unsigned integer.",
        output_format="Single unsigned integer with reversed binary bits.",
        constraints=["The input must be a binary string of length 32."],
        examples=[
            {"input": "43261596", "output": "964176192", "explanation": "Binary 00000010100101000001111010011100 reversed is 00111001011110000010100101000000 = 964176192."},
            {"input": "1", "output": "2147483648"}
        ],
        public_test_cases=[
            {"input": "43261596", "output": "964176192"},
            {"input": "1", "output": "2147483648"}
        ],
        hidden_test_cases=[
            {"input": "0", "output": "0"}
        ],
        hints=[
            "Extract the lowest bit of n using n & 1.",
            "Shift result left by 1 and OR with the extracted bit.",
            "Shift n right by 1. Repeat for 32 iterations."
        ],
        time_complexity="O(1)",
        space_complexity="O(1)",
        py_fn_name="reverseBits",
        py_fn_params="n: int",
        py_fn_ret_type="int",
        py_sample_body="res = 0\n    for _ in range(32):\n        res = (res << 1) | (n & 1)\n        n >>= 1\n    return res",
        solution_explanation="Bitwise shift: repeatedly extract the lowest bit of n into the accumulator while shifting accumulator left. Exactly 32 operations."
    )
]

print(f"Part 4 loaded with {len(part4_problems)} problems.")
