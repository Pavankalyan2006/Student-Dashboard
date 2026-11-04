from dsa_builder_helper import make_problem

part3_problems = [
    # ------------------ TOPIC 9: RECURSION AND BACKTRACKING (10 questions: 1 Easy, 6 Medium, 3 Hard) ------------------
    make_problem(
        id="dsa_top150_077",
        number=77,
        title="Power of Three",
        topic_id="topic_recursion_backtracking",
        subtopic="Recursive Divisibility",
        difficulty="EASY",
        roadmap_stage="Beginner Foundations",
        companies=["Google", "Amazon"],
        description="Given an integer n, return true if it is a power of three. Otherwise, return false.\n\nAn integer n is a power of three, if there exists an integer x such that n == 3^x.",
        input_format="A single integer n.",
        output_format="true or false",
        constraints=["-2^31 <= n <= 2^31 - 1"],
        examples=[
            {"input": "27", "output": "true", "explanation": "27 = 3^3."},
            {"input": "0", "output": "false"},
            {"input": "-1", "output": "false"}
        ],
        public_test_cases=[
            {"input": "27", "output": "true"},
            {"input": "0", "output": "false"}
        ],
        hidden_test_cases=[
            {"input": "9", "output": "true"},
            {"input": "45", "output": "false"},
            {"input": "1", "output": "true"}
        ],
        hints=[
            "Base cases: if n <= 0 return false; if n == 1 return true.",
            "If n % 3 != 0 return false.",
            "Recurse with n // 3."
        ],
        time_complexity="O(log3 N)",
        space_complexity="O(log3 N)",
        py_fn_name="isPowerOfThree",
        py_fn_params="n: int",
        py_fn_ret_type="bool",
        py_sample_body="if n <= 0: return False\n    while n % 3 == 0:\n        n //= 3\n    return n == 1",
        solution_explanation="Repeatedly divide by 3 while divisible. If the remainder is 1, n is a power of three."
    ),

    make_problem(
        id="dsa_top150_078",
        number=78,
        title="Generate Parentheses",
        topic_id="topic_recursion_backtracking",
        subtopic="Constrained Backtracking",
        difficulty="MEDIUM",
        roadmap_stage="Core Patterns",
        companies=["Amazon", "Apple", "Google", "Meta", "Microsoft"],
        description="Given n pairs of parentheses, write a function to generate all combinations of well-formed parentheses.",
        input_format="A single integer n.",
        output_format="Each valid combination on a separate line.",
        constraints=["1 <= n <= 8"],
        examples=[
            {"input": "3", "output": "((()))\n(()())\n(())()\n()(())\n()()()"},
            {"input": "1", "output": "()"}
        ],
        public_test_cases=[
            {"input": "3", "output": "((()))\n(()())\n(())()\n()(())\n()()()"},
            {"input": "1", "output": "()"}
        ],
        hidden_test_cases=[
            {"input": "2", "output": "(())\n()()"}
        ],
        hints=[
            "Track open and close count.",
            "Only add '(' if open < n.",
            "Only add ')' if close < open."
        ],
        time_complexity="O(4^N / sqrt(N))",
        space_complexity="O(N)",
        py_fn_name="generateParenthesis",
        py_fn_params="n: int",
        py_fn_ret_type="list[str]",
        py_sample_body="res = []\n    def backtrack(curr, open_n, close_n):\n        if len(curr) == 2 * n:\n            res.append(curr)\n            return\n        if open_n < n:\n            backtrack(curr + '(', open_n + 1, close_n)\n        if close_n < open_n:\n            backtrack(curr + ')', open_n, close_n + 1)\n    backtrack('', 0, 0)\n    return res",
        solution_explanation="Backtracking: branch on adding '(' when open < n, and adding ')' when close < open. Base case when string reaches 2n."
    ),

    make_problem(
        id="dsa_top150_079",
        number=79,
        title="Subsets",
        topic_id="topic_recursion_backtracking",
        subtopic="Power Set Generation",
        difficulty="MEDIUM",
        roadmap_stage="Core Patterns",
        companies=["Meta", "Amazon", "Google", "Microsoft"],
        description="Given an integer array nums of unique elements, return all possible subsets (the power set).\n\nThe solution set must not contain duplicate subsets. Return the solution in any order.",
        input_format="A single line of space-separated integers representing nums.",
        output_format="Each subset on a separate line as space-separated integers.",
        constraints=["1 <= nums.length <= 10", "-10 <= nums[i] <= 10", "All the numbers of nums are unique."],
        examples=[
            {"input": "1 2 3", "output": "\n1\n2\n1 2\n3\n1 3\n2 3\n1 2 3"},
            {"input": "0", "output": "\n0"}
        ],
        public_test_cases=[
            {"input": "1 2 3", "output": "\n1\n2\n1 2\n3\n1 3\n2 3\n1 2 3"},
            {"input": "0", "output": "\n0"}
        ],
        hidden_test_cases=[
            {"input": "1 2", "output": "\n1\n2\n1 2"}
        ],
        hints=[
            "For each element, there are two choices: include it or exclude it.",
            "Decision tree branches of depth n generate 2^n subsets.",
            "Use recursion with an index pointer."
        ],
        time_complexity="O(N * 2^N)",
        space_complexity="O(N)",
        py_fn_name="subsets",
        py_fn_params="nums: list[int]",
        py_fn_ret_type="list[list[int]]",
        py_sample_body="res = []\n    subset = []\n    def dfs(i):\n        if i >= len(nums):\n            res.append(list(subset))\n            return\n        subset.append(nums[i])\n        dfs(i + 1)\n        subset.pop()\n        dfs(i + 1)\n    dfs(0)\n    return res",
        solution_explanation="Recursive backtracking: at each index, branch into including nums[i] and excluding nums[i], generating all 2^N subsets."
    ),

    make_problem(
        id="dsa_top150_080",
        number=80,
        title="Subsets II",
        topic_id="topic_recursion_backtracking",
        subtopic="Duplicate Pruning",
        difficulty="MEDIUM",
        roadmap_stage="Core Patterns",
        companies=["Amazon", "Meta", "Google"],
        description="Given an integer array nums that may contain duplicates, return all possible subsets (the power set).\n\nThe solution set must not contain duplicate subsets. Return the solution in any order.",
        input_format="A single line of space-separated integers.",
        output_format="Each unique subset on a separate line as space-separated integers.",
        constraints=["1 <= nums.length <= 10", "-10 <= nums[i] <= 10"],
        examples=[
            {"input": "1 2 2", "output": "\n1\n1 2\n1 2 2\n2\n2 2"},
            {"input": "0", "output": "\n0"}
        ],
        public_test_cases=[
            {"input": "1 2 2", "output": "\n1\n1 2\n1 2 2\n2\n2 2"},
            {"input": "0", "output": "\n0"}
        ],
        hidden_test_cases=[
            {"input": "4 4 4 1 4", "output": "\n1\n1 4\n1 4 4\n1 4 4 4\n1 4 4 4 4\n4\n4 4\n4 4 4\n4 4 4 4"}
        ],
        hints=[
            "Sort the array first so duplicates are adjacent.",
            "When skipping an element, skip all duplicate instances of that element at the current level.",
            "This avoids generating duplicate branches in the recursion tree."
        ],
        time_complexity="O(N * 2^N)",
        space_complexity="O(N)",
        py_fn_name="subsetsWithDup",
        py_fn_params="nums: list[int]",
        py_fn_ret_type="list[list[int]]",
        py_sample_body="nums.sort()\n    res = []\n    subset = []\n    def dfs(i):\n        if i >= len(nums):\n            res.append(list(subset))\n            return\n        subset.append(nums[i])\n        dfs(i + 1)\n        subset.pop()\n        while i + 1 < len(nums) and nums[i] == nums[i + 1]:\n            i += 1\n        dfs(i + 1)\n    dfs(0)\n    return res",
        solution_explanation="Sort array. When choosing not to include nums[i], skip all subsequent elements equal to nums[i] before branching."
    ),

    make_problem(
        id="dsa_top150_081",
        number=81,
        title="Permutations",
        topic_id="topic_recursion_backtracking",
        subtopic="Complete State Permutation",
        difficulty="MEDIUM",
        roadmap_stage="Core Patterns",
        companies=["Amazon", "Apple", "Google", "Meta", "Microsoft"],
        description="Given an array nums of distinct integers, return all the possible permutations. You can return the answer in any order.",
        input_format="A single line of space-separated distinct integers.",
        output_format="Each permutation on a separate line as space-separated integers.",
        constraints=["1 <= nums.length <= 6", "-10 <= nums[i] <= 10", "All the integers of nums are unique."],
        examples=[
            {"input": "1 2 3", "output": "1 2 3\n1 3 2\n2 1 3\n2 3 1\n3 1 2\n3 2 1"},
            {"input": "0 1", "output": "0 1\n1 0"},
            {"input": "1", "output": "1"}
        ],
        public_test_cases=[
            {"input": "1 2 3", "output": "1 2 3\n1 3 2\n2 1 3\n2 3 1\n3 1 2\n3 2 1"},
            {"input": "0 1", "output": "0 1\n1 0"}
        ],
        hidden_test_cases=[
            {"input": "1", "output": "1"}
        ],
        hints=[
            "Use backtracking or swapping in place.",
            "At index i, swap nums[i] with nums[j] for all j in i..n-1.",
            "Recurse on i + 1, then backtrack by swapping back."
        ],
        time_complexity="O(N * N!)",
        space_complexity="O(N)",
        py_fn_name="permute",
        py_fn_params="nums: list[int]",
        py_fn_ret_type="list[list[int]]",
        py_sample_body="res = []\n    def backtrack(start):\n        if start == len(nums):\n            res.append(list(nums))\n            return\n        for i in range(start, len(nums)):\n            nums[start], nums[i] = nums[i], nums[start]\n            backtrack(start + 1)\n            nums[start], nums[i] = nums[i], nums[start]\n    backtrack(0)\n    return res",
        solution_explanation="In-place swapping generates all N! permutations with O(N) recursion stack and zero auxiliary array allocations."
    ),

    make_problem(
        id="dsa_top150_082",
        number=82,
        title="Combination Sum",
        topic_id="topic_recursion_backtracking",
        subtopic="Unlimited Multi-Choice Backtracking",
        difficulty="MEDIUM",
        roadmap_stage="Core Patterns",
        companies=["Amazon", "Apple", "Google", "Meta"],
        description="Given an array of distinct integers candidates and a target integer target, return a list of all unique combinations of candidates where the chosen numbers sum to target. You may return the combinations in any order.\n\nThe same number may be chosen from candidates an unlimited number of times. Two combinations are unique if the frequency of at least one of the chosen numbers is different.",
        input_format="Line 1: space-separated integers candidates\nLine 2: target integer",
        output_format="Each combination on a separate line as space-separated integers.",
        constraints=["1 <= candidates.length <= 30", "2 <= candidates[i] <= 40", "All elements of candidates are distinct.", "1 <= target <= 40"],
        examples=[
            {"input": "2 3 6 7\n7", "output": "2 2 3\n7"},
            {"input": "2 3 5\n8", "output": "2 2 2 2\n2 3 3\n3 5"},
            {"input": "2\n1", "output": ""}
        ],
        public_test_cases=[
            {"input": "2 3 6 7\n7", "output": "2 2 3\n7"},
            {"input": "2 3 5\n8", "output": "2 2 2 2\n2 3 3\n3 5"}
        ],
        hidden_test_cases=[
            {"input": "2\n1", "output": ""},
            {"input": "2 4\n6", "output": "2 2 2\n2 4"}
        ],
        hints=[
            "Sort candidates to enable early break pruning.",
            "Since an element can be reused, recursive branch for inclusion stays at index i.",
            "Branch for exclusion moves to index i + 1."
        ],
        time_complexity="O(2^target)",
        space_complexity="O(target)",
        py_fn_name="combinationSum",
        py_fn_params="candidates: list[int], target: int",
        py_fn_ret_type="list[list[int]]",
        py_sample_body="res = []\n    def dfs(i, cur, total):\n        if total == target:\n            res.append(list(cur))\n            return\n        if i >= len(candidates) or total > target:\n            return\n        cur.append(candidates[i])\n        dfs(i, cur, total + candidates[i])\n        cur.pop()\n        dfs(i + 1, cur, total)\n    dfs(0, [], 0)\n    return res",
        solution_explanation="Backtrack with two choices at each step: reuse current candidate (stay at index i) or move to the next candidate (index i + 1)."
    ),

    make_problem(
        id="dsa_top150_083",
        number=83,
        title="Letter Combinations of a Phone Number",
        topic_id="topic_recursion_backtracking",
        subtopic="Cartesian Mapping",
        difficulty="MEDIUM",
        roadmap_stage="Core Patterns",
        companies=["Amazon", "Google", "Meta", "Microsoft"],
        description="Given a string containing digits from 2-9 inclusive, return all possible letter combinations that the number could represent. Return the answer in any order.\n\nA mapping of digits to letters (just like on the telephone buttons) is given below. Note that 1 does not map to any letters.\n2: abc, 3: def, 4: ghi, 5: jkl, 6: mno, 7: pqrs, 8: tuv, 9: wxyz.",
        input_format="A single line containing digit string.",
        output_format="Space-separated combination strings.",
        constraints=["0 <= digits.length <= 4", "digits[i] is a digit in the range ['2', '9']."],
        examples=[
            {"input": "23", "output": "ad ae af bd be bf cd ce cf"},
            {"input": "", "output": ""},
            {"input": "2", "output": "a b c"}
        ],
        public_test_cases=[
            {"input": "23", "output": "ad ae af bd be bf cd ce cf"},
            {"input": "2", "output": "a b c"}
        ],
        hidden_test_cases=[
            {"input": "", "output": ""}
        ],
        hints=[
            "Map each digit to its corresponding letter string.",
            "Use recursion to iterate through letters of the current digit.",
            "Append chosen letter and recurse on digit index + 1."
        ],
        time_complexity="O(4^N)",
        space_complexity="O(N)",
        py_fn_name="letterCombinations",
        py_fn_params="digits: str",
        py_fn_ret_type="list[str]",
        py_sample_body="if not digits: return []\n    mapping = {'2':'abc','3':'def','4':'ghi','5':'jkl','6':'mno','7':'pqrs','8':'tuv','9':'wxyz'}\n    res = []\n    def backtrack(i, cur):\n        if i == len(digits):\n            res.append(cur)\n            return\n        for c in mapping[digits[i]]:\n            backtrack(i + 1, cur + c)\n    backtrack(0, '')\n    return res",
        solution_explanation="Backtrack through each digit, exploring each mapped letter branch to produce all Cartesian product combinations."
    ),

    make_problem(
        id="dsa_top150_084",
        number=84,
        title="Word Search",
        topic_id="topic_recursion_backtracking",
        subtopic="2D Grid DFS Backtracking",
        difficulty="HARD",
        roadmap_stage="Advanced Mastery",
        companies=["Amazon", "Apple", "Google", "Meta", "Microsoft"],
        description="Given an m x n grid of characters board and a string word, return true if word exists in the grid.\n\nThe word can be constructed from letters of sequentially adjacent cells, where adjacent cells are horizontally or vertically neighboring. The same letter cell may not be used more than once.",
        input_format="Line 1: m n (rows cols)\nNext m lines: n space-separated characters\nLast line: target word",
        output_format="true or false",
        constraints=["m == board.length", "n = board[i].length", "1 <= m, n <= 6", "1 <= word.length <= 15"],
        examples=[
            {"input": "3 4\nA B C E\nS F C S\nA D E E\nABCCED", "output": "true"},
            {"input": "3 4\nA B C E\nS F C S\nA D E E\nSEE", "output": "true"},
            {"input": "3 4\nA B C E\nS F C S\nA D E E\nABCB", "output": "false"}
        ],
        public_test_cases=[
            {"input": "3 4\nA B C E\nS F C S\nA D E E\nABCCED", "output": "true"},
            {"input": "3 4\nA B C E\nS F C S\nA D E E\nSEE", "output": "true"}
        ],
        hidden_test_cases=[
            {"input": "3 4\nA B C E\nS F C S\nA D E E\nABCB", "output": "false"},
            {"input": "1 1\nA\nA", "output": "true"}
        ],
        hints=[
            "Iterate through all grid cells (r, c) as potential starting points.",
            "DFS in 4 directions: (r+1,c), (r-1,c), (r,c+1), (r,c-1).",
            "Mark current cell as visited (e.g. board[r][c] = '#') and restore character on return."
        ],
        time_complexity="O(M * N * 3^L)",
        space_complexity="O(L)",
        py_fn_name="existWord",
        py_fn_params="board: list[list[str]], word: str",
        py_fn_ret_type="bool",
        py_sample_body="R, C = len(board), len(board[0])\n    def dfs(r, c, i):\n        if i == len(word): return True\n        if r < 0 or r >= R or c < 0 or c >= C or board[r][c] != word[i]: return False\n        tmp, board[r][c] = board[r][c], '#'\n        res = (dfs(r+1, c, i+1) or dfs(r-1, c, i+1) or dfs(r, c+1, i+1) or dfs(r, c-1, i+1))\n        board[r][c] = tmp\n        return res\n    for r in range(R):\n        for c in range(C):\n            if dfs(r, c, 0): return True\n    return False",
        solution_explanation="2D grid DFS: temporarily mutate cell to '#' to prevent reuse in the same path, recurse in 4 directions, and restore character during backtracking."
    ),

    make_problem(
        id="dsa_top150_085",
        number=85,
        title="N-Queens",
        topic_id="topic_recursion_backtracking",
        subtopic="Board State Pruning",
        difficulty="HARD",
        roadmap_stage="Placement Revision",
        companies=["Amazon", "Apple", "Google", "Meta"],
        description="The n-queens puzzle is the problem of placing n queens on an n x n chessboard such that no two queens attack each other.\n\nGiven an integer n, return all distinct solutions to the n-queens puzzle. You may return the answer in any order.",
        input_format="A single integer n.",
        output_format="Count of distinct valid configurations followed by configurations.",
        constraints=["1 <= n <= 9"],
        examples=[
            {"input": "4", "output": "2\n.Q..\n...Q\nQ...\n..Q.\n---\n..Q.\nQ...\n...Q\n.Q..", "explanation": "There exist two distinct solutions to the 4-queens puzzle."},
            {"input": "1", "output": "1\nQ"}
        ],
        public_test_cases=[
            {"input": "4", "output": "2\n.Q..\n...Q\nQ...\n..Q.\n---\n..Q.\nQ...\n...Q\n.Q.."},
            {"input": "1", "output": "1\nQ"}
        ],
        hidden_test_cases=[
            {"input": "2", "output": "0"},
            {"input": "3", "output": "0"}
        ],
        hints=[
            "Place one queen per row.",
            "Maintain sets for columns, positive diagonals (r + c), and negative diagonals (r - c).",
            "If column or diagonal is already under attack, prune that branch."
        ],
        time_complexity="O(N!)",
        space_complexity="O(N)",
        py_fn_name="solveNQueens",
        py_fn_params="n: int",
        py_fn_ret_type="list[list[str]]",
        py_sample_body="col = set()\n    posDiag = set()\n    negDiag = set()\n    res = []\n    board = [['.'] * n for _ in range(n)]\n    def backtrack(r):\n        if r == n:\n            res.append([''.join(row) for row in board])\n            return\n        for c in range(n):\n            if c in col or (r + c) in posDiag or (r - c) in negDiag:\n                continue\n            col.add(c); posDiag.add(r + c); negDiag.add(r - c)\n            board[r][c] = 'Q'\n            backtrack(r + 1)\n            col.remove(c); posDiag.remove(r + c); negDiag.remove(r - c)\n            board[r][c] = '.'\n    backtrack(0)\n    return res",
        solution_explanation="Place one queen per row. Fast O(1) conflict validation using sets for column c, positive diagonal (r+c), and negative diagonal (r-c)."
    ),

    make_problem(
        id="dsa_top150_086",
        number=86,
        title="Sudoku Solver",
        topic_id="topic_recursion_backtracking",
        subtopic="Exact Cover Backtracking",
        difficulty="HARD",
        roadmap_stage="Placement Revision",
        companies=["Amazon", "Google", "Microsoft"],
        description="Write a program to solve a Sudoku puzzle by filling the empty cells.\n\nA sudoku solution must satisfy all of the following rules:\n1. Each of the digits 1-9 must occur exactly once in each row.\n2. Each of the digits 1-9 must occur exactly once in each column.\n3. Each of the digits 1-9 must occur exactly once in each of the 9 3x3 sub-boxes of the grid.",
        input_format="9 lines with 9 characters (digits 1-9 or '.' for empty cell).",
        output_format="9 lines of 9 digits representing solved board.",
        constraints=["board.length == 9", "board[i].length == 9", "board[i][j] is a digit '1'-'9' or '.'", "It is guaranteed that the input board has only one solution."],
        examples=[
            {
                "input": "5 3 . . 7 . . . .\n6 . . 1 9 5 . . .\n. 9 8 . . . . 6 .\n8 . . . 6 . . . 3\n4 . . 8 . 3 . . 1\n7 . . . 2 . . . 6\n. 6 . . . . 2 8 .\n. . . 4 1 9 . . 5\n. . . . 8 . . 7 9",
                "output": "5 3 4 6 7 8 9 1 2\n6 7 2 1 9 5 3 4 8\n1 9 8 3 4 2 5 6 7\n8 5 9 7 6 1 4 2 3\n4 2 6 8 5 3 7 9 1\n7 1 3 9 2 4 8 5 6\n9 6 1 5 3 7 2 8 4\n2 8 7 4 1 9 6 3 5\n3 4 5 2 8 6 1 7 9"
            }
        ],
        public_test_cases=[
            {
                "input": "5 3 . . 7 . . . .\n6 . . 1 9 5 . . .\n. 9 8 . . . . 6 .\n8 . . . 6 . . . 3\n4 . . 8 . 3 . . 1\n7 . . . 2 . . . 6\n. 6 . . . . 2 8 .\n. . . 4 1 9 . . 5\n. . . . 8 . . 7 9",
                "output": "5 3 4 6 7 8 9 1 2\n6 7 2 1 9 5 3 4 8\n1 9 8 3 4 2 5 6 7\n8 5 9 7 6 1 4 2 3\n4 2 6 8 5 3 7 9 1\n7 1 3 9 2 4 8 5 6\n9 6 1 5 3 7 2 8 4\n2 8 7 4 1 9 6 3 5\n3 4 5 2 8 6 1 7 9"
            }
        ],
        hidden_test_cases=[],
        hints=[
            "Find the first empty cell.",
            "Try placing digits '1' through '9'.",
            "Verify that candidate digit is valid for current row, column, and 3x3 block before recursing."
        ],
        time_complexity="O(9^(empty cells))",
        space_complexity="O(81)",
        py_fn_name="solveSudoku",
        py_fn_params="board: list[list[str]]",
        py_fn_ret_type="None",
        py_sample_body="def isValid(r, c, ch):\n        for i in range(9):\n            if board[r][i] == ch: return False\n            if board[i][c] == ch: return False\n            if board[3 * (r // 3) + i // 3][3 * (c // 3) + i % 3] == ch: return False\n        return True\n    def solve():\n        for r in range(9):\n            for c in range(9):\n                if board[r][c] == '.':\n                    for ch in '123456789':\n                        if isValid(r, c, ch):\n                            board[r][c] = ch\n                            if solve(): return True\n                            board[r][c] = '.'\n                    return False\n        return True\n    solve()",
        solution_explanation="Backtracking search fills empty cells sequentially with digits 1-9, checking row, col, and 3x3 box validity."
    ),

    # ------------------ TOPIC 10: TREES AND BST (14 questions: 6 Easy, 6 Medium, 2 Hard) ------------------
    make_problem(
        id="dsa_top150_087",
        number=87,
        title="Maximum Depth of Binary Tree",
        topic_id="topic_trees_bst",
        subtopic="Tree Depth Recursion",
        difficulty="EASY",
        roadmap_stage="Beginner Foundations",
        companies=["Amazon", "Apple", "Google", "Meta", "Microsoft"],
        description="Given the root of a binary tree, return its maximum depth.\n\nA binary tree's maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.",
        input_format="A single line containing level-order tree node values (null for empty).",
        output_format="Single integer representing depth.",
        constraints=["The number of nodes in the tree is in the range [0, 10^4].", "-100 <= Node.val <= 100"],
        examples=[
            {"input": "3 9 20 null null 15 7", "output": "3", "explanation": "Longest path is 3 -> 20 -> 15 (depth 3)."},
            {"input": "1 null 2", "output": "2"}
        ],
        public_test_cases=[
            {"input": "3 9 20 null null 15 7", "output": "3"},
            {"input": "1 null 2", "output": "2"}
        ],
        hidden_test_cases=[
            {"input": "", "output": "0"},
            {"input": "0", "output": "1"}
        ],
        hints=[
            "Base case: if root is None, return 0.",
            "Recurse on left and right subtrees.",
            "Depth is 1 + max(maxDepth(root.left), maxDepth(root.right))."
        ],
        time_complexity="O(N)",
        space_complexity="O(Height)",
        py_fn_name="maxDepth",
        py_fn_params="root",
        py_fn_ret_type="int",
        py_sample_body="if not root: return 0\n    return 1 + max(maxDepth(root.left), maxDepth(root.right))",
        solution_explanation="Depth of a binary tree equals 1 + maximum depth of its left and right subtrees. Traversal is O(N) time."
    ),

    make_problem(
        id="dsa_top150_088",
        number=88,
        title="Invert Binary Tree",
        topic_id="topic_trees_bst",
        subtopic="Subtree Pointer Swap",
        difficulty="EASY",
        roadmap_stage="Beginner Foundations",
        companies=["Google", "Amazon", "Apple", "Meta"],
        description="Given the root of a binary tree, invert the tree, and return its root.",
        input_format="Level-order traversal values.",
        output_format="Level-order traversal of inverted tree.",
        constraints=["The number of nodes in the tree is in the range [0, 100].", "-100 <= Node.val <= 100"],
        examples=[
            {"input": "4 2 7 1 3 6 9", "output": "4 7 2 9 6 3 1"},
            {"input": "2 1 3", "output": "2 3 1"},
            {"input": "", "output": ""}
        ],
        public_test_cases=[
            {"input": "4 2 7 1 3 6 9", "output": "4 7 2 9 6 3 1"},
            {"input": "2 1 3", "output": "2 3 1"}
        ],
        hidden_test_cases=[
            {"input": "", "output": ""},
            {"input": "1", "output": "1"}
        ],
        hints=[
            "Swap root.left and root.right.",
            "Recursively invert root.left and root.right.",
            "Base case: return None if root is None."
        ],
        time_complexity="O(N)",
        space_complexity="O(Height)",
        py_fn_name="invertTree",
        py_fn_params="root",
        py_fn_ret_type="TreeNode",
        py_sample_body="if not root: return None\n    root.left, root.right = invertTree(root.right), invertTree(root.left)\n    return root",
        solution_explanation="Swap the left and right child pointers at each node recursively. O(N) time and O(H) call stack."
    ),

    make_problem(
        id="dsa_top150_089",
        number=89,
        title="Same Tree",
        topic_id="topic_trees_bst",
        subtopic="Structural & Value Equivalence",
        difficulty="EASY",
        roadmap_stage="Beginner Foundations",
        companies=["Amazon", "Google", "Microsoft"],
        description="Given the roots of two binary trees p and q, write a function to check if they are the same or not.\n\nTwo binary trees are considered the same if they are structurally identical, and the nodes have the same value.",
        input_format="Line 1: level-order values of tree p\nLine 2: level-order values of tree q",
        output_format="true or false",
        constraints=["The number of nodes in both trees is in the range [0, 100].", "-10^4 <= Node.val <= 10^4"],
        examples=[
            {"input": "1 2 3\n1 2 3", "output": "true"},
            {"input": "1 2\n1 null 2", "output": "false"},
            {"input": "1 2 1\n1 1 2", "output": "false"}
        ],
        public_test_cases=[
            {"input": "1 2 3\n1 2 3", "output": "true"},
            {"input": "1 2\n1 null 2", "output": "false"}
        ],
        hidden_test_cases=[
            {"input": "\n", "output": "true"},
            {"input": "1\n2", "output": "false"}
        ],
        hints=[
            "If both nodes are None, return True.",
            "If exactly one node is None, return False.",
            "If values match, recurse on left and right subtrees."
        ],
        time_complexity="O(N)",
        space_complexity="O(Height)",
        py_fn_name="isSameTree",
        py_fn_params="p, q",
        py_fn_ret_type="bool",
        py_sample_body="if not p and not q: return True\n    if not p or not q or p.val != q.val: return False\n    return isSameTree(p.left, q.left) and isSameTree(p.right, q.right)",
        solution_explanation="Simultaneous DFS recursion: verify structural identity and matching node values across both trees."
    ),

    make_problem(
        id="dsa_top150_090",
        number=90,
        title="Symmetric Tree",
        topic_id="topic_trees_bst",
        subtopic="Mirror Image Equivalence",
        difficulty="EASY",
        roadmap_stage="Beginner Foundations",
        companies=["Amazon", "Apple", "Google", "Microsoft"],
        description="Given the root of a binary tree, check whether it is a mirror of itself (i.e., symmetric around its center).",
        input_format="Level order traversal values.",
        output_format="true or false",
        constraints=["The number of nodes in the tree is in the range [1, 1000].", "-100 <= Node.val <= 100"],
        examples=[
            {"input": "1 2 2 3 4 4 3", "output": "true", "explanation": "Tree is symmetric about its center vertical axis."},
            {"input": "1 2 2 null 3 null 3", "output": "false"}
        ],
        public_test_cases=[
            {"input": "1 2 2 3 4 4 3", "output": "true"},
            {"input": "1 2 2 null 3 null 3", "output": "false"}
        ],
        hidden_test_cases=[
            {"input": "1", "output": "true"},
            {"input": "1 2 3", "output": "false"}
        ],
        hints=[
            "Two subtrees are mirrors if left.val == right.val.",
            "left.left must mirror right.right.",
            "left.right must mirror right.left."
        ],
        time_complexity="O(N)",
        space_complexity="O(Height)",
        py_fn_name="isSymmetric",
        py_fn_params="root",
        py_fn_ret_type="bool",
        py_sample_body="def isMirror(t1, t2):\n        if not t1 and not t2: return True\n        if not t1 or not t2 or t1.val != t2.val: return False\n        return isMirror(t1.left, t2.right) and isMirror(t1.right, t2.left)\n    return isMirror(root.left, root.right) if root else True",
        solution_explanation="Compare mirror branches: node1.left with node2.right and node1.right with node2.left."
    ),

    make_problem(
        id="dsa_top150_091",
        number=91,
        title="Diameter of Binary Tree",
        topic_id="topic_trees_bst",
        subtopic="Longest Path Across Tree",
        difficulty="EASY",
        roadmap_stage="Beginner Foundations",
        companies=["Amazon", "Meta", "Google"],
        description="Given the root of a binary tree, return the length of the diameter of the tree.\n\nThe diameter of a binary tree is the length of the longest path between any two nodes in a tree. This path may or may not pass through the root.\n\nThe length of a path between two nodes is represented by the number of edges between them.",
        input_format="Level-order tree node values.",
        output_format="Single integer representing diameter.",
        constraints=["The number of nodes in the tree is in the range [1, 10^4].", "-100 <= Node.val <= 100"],
        examples=[
            {"input": "1 2 3 4 5", "output": "3", "explanation": "3 is the length of the path [4,2,1,3] or [5,2,1,3]."},
            {"input": "1 2", "output": "1"}
        ],
        public_test_cases=[
            {"input": "1 2 3 4 5", "output": "3"},
            {"input": "1 2", "output": "1"}
        ],
        hidden_test_cases=[
            {"input": "1", "output": "0"}
        ],
        hints=[
            "For every node, the longest path passing through it is (height(left) + height(right)).",
            "Maintain a global maximum diameter variable.",
            "Return 1 + max(height(left), height(right)) to the parent."
        ],
        time_complexity="O(N)",
        space_complexity="O(Height)",
        py_fn_name="diameterOfBinaryTree",
        py_fn_params="root",
        py_fn_ret_type="int",
        py_sample_body="diameter = 0\n    def height(node):\n        nonlocal diameter\n        if not node: return 0\n        lh = height(node.left)\n        rh = height(node.right)\n        diameter = max(diameter, lh + rh)\n        return 1 + max(lh, rh)\n    height(root)\n    return diameter",
        solution_explanation="Post-order DFS computes height of each subtree while tracking the maximum path length (left_height + right_height) through any node."
    ),

    make_problem(
        id="dsa_top150_092",
        number=92,
        title="Balanced Binary Tree",
        topic_id="topic_trees_bst",
        subtopic="Height-Balanced Verification",
        difficulty="EASY",
        roadmap_stage="Beginner Foundations",
        companies=["Amazon", "Apple", "Google"],
        description="Given a binary tree, determine if it is height-balanced.\n\nA height-balanced binary tree is a binary tree in which the depth of the two subtrees of every node never differs by more than one.",
        input_format="Level order values.",
        output_format="true or false",
        constraints=["The number of nodes in the tree is in the range [0, 5000].", "-10^4 <= Node.val <= 10^4"],
        examples=[
            {"input": "3 9 20 null null 15 7", "output": "true"},
            {"input": "1 2 2 3 3 null null 4 4", "output": "false"},
            {"input": "", "output": "true"}
        ],
        public_test_cases=[
            {"input": "3 9 20 null null 15 7", "output": "true"},
            {"input": "1 2 2 3 3 null null 4 4", "output": "false"}
        ],
        hidden_test_cases=[
            {"input": "", "output": "true"},
            {"input": "1", "output": "true"}
        ],
        hints=[
            "Return -1 from subtree height function if it is unbalanced.",
            "If abs(height(left) - height(right)) > 1, mark as unbalanced.",
            "This checks balance in a single bottom-up O(N) pass."
        ],
        time_complexity="O(N)",
        space_complexity="O(Height)",
        py_fn_name="isBalanced",
        py_fn_params="root",
        py_fn_ret_type="bool",
        py_sample_body="def check(node):\n        if not node: return 0\n        lh = check(node.left)\n        if lh == -1: return -1\n        rh = check(node.right)\n        if rh == -1: return -1\n        if abs(lh - rh) > 1: return -1\n        return 1 + max(lh, rh)\n    return check(root) != -1",
        solution_explanation="Bottom-up DFS: return -1 immediately if any subtree violates the balance condition abs(lh - rh) <= 1."
    ),

    make_problem(
        id="dsa_top150_093",
        number=93,
        title="Level Order Traversal",
        topic_id="topic_trees_bst",
        subtopic="Breadth-First Queue Traversal",
        difficulty="MEDIUM",
        roadmap_stage="Core Patterns",
        companies=["Amazon", "Apple", "Google", "Meta", "Microsoft"],
        description="Given the root of a binary tree, return the level order traversal of its nodes' values. (i.e., from left to right, level by level).",
        input_format="Level-order tree node values.",
        output_format="Each level on a separate line with space-separated node values.",
        constraints=["The number of nodes in the tree is in the range [0, 2000].", "-1000 <= Node.val <= 1000"],
        examples=[
            {"input": "3 9 20 null null 15 7", "output": "3\n9 20\n15 7"},
            {"input": "1", "output": "1"},
            {"input": "", "output": ""}
        ],
        public_test_cases=[
            {"input": "3 9 20 null null 15 7", "output": "3\n9 20\n15 7"},
            {"input": "1", "output": "1"}
        ],
        hidden_test_cases=[
            {"input": "", "output": ""}
        ],
        hints=[
            "Use a queue to process nodes level by level (BFS).",
            "At each level, iterate len(queue) times to process all nodes belonging to the current depth.",
            "Enqueue non-null left and right children."
        ],
        time_complexity="O(N)",
        space_complexity="O(N)",
        py_fn_name="levelOrder",
        py_fn_params="root",
        py_fn_ret_type="list[list[int]]",
        py_sample_body="from collections import deque\n    if not root: return []\n    q = deque([root])\n    res = []\n    while q:\n        level = []\n        for _ in range(len(q)):\n            node = q.popleft()\n            level.append(node.val)\n            if node.left: q.append(node.left)\n            if node.right: q.append(node.right)\n        res.append(level)\n    return res",
        solution_explanation="Queue-based BFS processes one complete depth layer at a time by capturing the queue snapshot size."
    ),

    make_problem(
        id="dsa_top150_094",
        number=94,
        title="Right Side View",
        topic_id="topic_trees_bst",
        subtopic="Level-Order Last Element",
        difficulty="MEDIUM",
        roadmap_stage="Core Patterns",
        companies=["Meta", "Amazon", "Google"],
        description="Given the root of a binary tree, imagine yourself standing on the right side of it, return the values of the nodes you can see ordered from top to bottom.",
        input_format="Level order tree values.",
        output_format="Space-separated node values visible from right side.",
        constraints=["The number of nodes in the tree is in the range [0, 100].", "-100 <= Node.val <= 100"],
        examples=[
            {"input": "1 2 3 null 5 null 4", "output": "1 3 4"},
            {"input": "1 null 3", "output": "1 3"},
            {"input": "", "output": ""}
        ],
        public_test_cases=[
            {"input": "1 2 3 null 5 null 4", "output": "1 3 4"},
            {"input": "1 null 3", "output": "1 3"}
        ],
        hidden_test_cases=[
            {"input": "", "output": ""}
        ],
        hints=[
            "BFS level-order: take the last element of each level.",
            "Alternatively, reverse pre-order DFS (visit root -> right -> left) and record the first node seen at each depth.",
            "The rightmost element at level L will always be the last element added to the BFS queue at that level."
        ],
        time_complexity="O(N)",
        space_complexity="O(N)",
        py_fn_name="rightSideView",
        py_fn_params="root",
        py_fn_ret_type="list[int]",
        py_sample_body="from collections import deque\n    if not root: return []\n    q = deque([root])\n    res = []\n    while q:\n        res.append(q[-1].val)\n        for _ in range(len(q)):\n            node = q.popleft()\n            if node.left: q.append(node.left)\n            if node.right: q.append(node.right)\n    return res",
        solution_explanation="Level-order BFS appends the rightmost node at each depth tier."
    ),

    make_problem(
        id="dsa_top150_095",
        number=95,
        title="Lowest Common Ancestor of a Binary Tree",
        topic_id="topic_trees_bst",
        subtopic="Lowest Common Ancestor Search",
        difficulty="MEDIUM",
        roadmap_stage="Core Patterns",
        companies=["Amazon", "Meta", "Google", "Microsoft"],
        description="Given a binary tree, find the lowest common ancestor (LCA) of two given nodes in the tree.\n\nThe lowest common ancestor is defined between two nodes p and q as the lowest node in T that has both p and q as descendants (where we allow a node to be a descendant of itself).",
        input_format="Line 1: level order tree nodes\nLine 2: value of p\nLine 3: value of q",
        output_format="Integer value of the LCA node.",
        constraints=["The number of nodes in the tree is in the range [2, 10^5].", "-10^9 <= Node.val <= 10^9", "All Node.val are unique.", "p != q", "p and q will exist in the tree."],
        examples=[
            {"input": "3 5 1 6 2 0 8 null null 7 4\n5\n1", "output": "3", "explanation": "The LCA of nodes 5 and 1 is 3."},
            {"input": "3 5 1 6 2 0 8 null null 7 4\n5\n4", "output": "5", "explanation": "The LCA of nodes 5 and 4 is 5, since a node can be a descendant of itself."}
        ],
        public_test_cases=[
            {"input": "3 5 1 6 2 0 8 null null 7 4\n5\n1", "output": "3"},
            {"input": "3 5 1 6 2 0 8 null null 7 4\n5\n4", "output": "5"}
        ],
        hidden_test_cases=[
            {"input": "1 2\n1\n2", "output": "1"}
        ],
        hints=[
            "Base case: if root is None or root == p or root == q, return root.",
            "Recurse on left and right.",
            "If both left and right return non-null, current root is the LCA. Otherwise return the non-null branch."
        ],
        time_complexity="O(N)",
        space_complexity="O(Height)",
        py_fn_name="lowestCommonAncestor",
        py_fn_params="root, p, q",
        py_fn_ret_type="TreeNode",
        py_sample_body="if not root or root == p or root == q: return root\n    left = lowestCommonAncestor(root.left, p, q)\n    right = lowestCommonAncestor(root.right, p, q)\n    if left and right: return root\n    return left or right",
        solution_explanation="If both subtrees report finding one of the targets, current node is their lowest common ancestor."
    ),

    make_problem(
        id="dsa_top150_096",
        number=96,
        title="Validate Binary Search Tree",
        topic_id="topic_trees_bst",
        subtopic="BST Boundary Invariant",
        difficulty="MEDIUM",
        roadmap_stage="Core Patterns",
        companies=["Amazon", "Google", "Meta", "Bloomberg"],
        description="Given the root of a binary tree, determine if it is a valid binary search tree (BST).\n\nA valid BST is defined as follows:\n- The left subtree of a node contains only nodes with keys less than the node's key.\n- The right subtree of a node contains only nodes with keys greater than the node's key.\n- Both the left and right subtrees must also be binary search trees.",
        input_format="Level-order tree node values.",
        output_format="true or false",
        constraints=["The number of nodes in the tree is in the range [1, 10^4].", "-2^31 <= Node.val <= 2^31 - 1"],
        examples=[
            {"input": "2 1 3", "output": "true"},
            {"input": "5 1 4 null null 3 6", "output": "false", "explanation": "The root node's value is 5 but its right child's value is 4."}
        ],
        public_test_cases=[
            {"input": "2 1 3", "output": "true"},
            {"input": "5 1 4 null null 3 6", "output": "false"}
        ],
        hidden_test_cases=[
            {"input": "2 2 2", "output": "false"},
            {"input": "10 5 15 null null 6 20", "output": "false"}
        ],
        hints=[
            "Checking only immediate children is not sufficient: every node in the left subtree must be < root.",
            "Pass allowable min and max bounds down the recursion: (low, high).",
            "Left child must satisfy (low, root.val); right child must satisfy (root.val, high)."
        ],
        time_complexity="O(N)",
        space_complexity="O(Height)",
        py_fn_name="isValidBST",
        py_fn_params="root",
        py_fn_ret_type="bool",
        py_sample_body="def validate(node, low, high):\n        if not node: return True\n        if not (low < node.val < high): return False\n        return validate(node.left, low, node.val) and validate(node.right, node.val, high)\n    return validate(root, float('-inf'), float('inf'))",
        solution_explanation="Propagate valid interval bounds (low, high) down the recursive tree. Every node value must strictly lie within its assigned range."
    ),

    make_problem(
        id="dsa_top150_097",
        number=97,
        title="Kth Smallest Element in a BST",
        topic_id="topic_trees_bst",
        subtopic="In-Order Traversal",
        difficulty="MEDIUM",
        roadmap_stage="Core Patterns",
        companies=["Amazon", "Google", "Uber"],
        description="Given the root of a binary search tree, and an integer k, return the kth smallest value (1-indexed) of all the values of the nodes in the tree.",
        input_format="Line 1: level-order BST node values\nLine 2: integer k",
        output_format="Single integer representing kth smallest element.",
        constraints=["The number of nodes in the tree is n.", "1 <= k <= n <= 10^4", "0 <= Node.val <= 10^4"],
        examples=[
            {"input": "3 1 4 null 2\n1", "output": "1"},
            {"input": "5 3 6 2 4 null null 1\n3", "output": "3"}
        ],
        public_test_cases=[
            {"input": "3 1 4 null 2\n1", "output": "1"},
            {"input": "5 3 6 2 4 null null 1\n3", "output": "3"}
        ],
        hidden_test_cases=[
            {"input": "1\n1", "output": "1"}
        ],
        hints=[
            "In-order traversal of a BST yields values in strictly ascending order.",
            "Iterative in-order traversal using a stack allows early stopping as soon as the kth element is popped.",
            "Return value of the kth node visited."
        ],
        time_complexity="O(H + K)",
        space_complexity="O(Height)",
        py_fn_name="kthSmallest",
        py_fn_params="root, k: int",
        py_fn_ret_type="int",
        py_sample_body="stack = []\n    curr = root\n    while curr or stack:\n        while curr:\n            stack.append(curr)\n            curr = curr.left\n        curr = stack.pop()\n        k -= 1\n        if k == 0: return curr.val\n        curr = curr.right",
        solution_explanation="In-order traversal visits BST nodes in sorted order. Early terminate when the kth element is processed."
    ),

    make_problem(
        id="dsa_top150_098",
        number=98,
        title="Construct Tree From Preorder and Inorder Traversal",
        topic_id="topic_trees_bst",
        subtopic="Traversal Reconstruction",
        difficulty="MEDIUM",
        roadmap_stage="Core Patterns",
        companies=["Amazon", "Microsoft", "Meta"],
        description="Given two integer arrays preorder and inorder where preorder is the preorder traversal of a binary tree and inorder is the inorder traversal of the same tree, construct and return the binary tree.",
        input_format="Line 1: space-separated integers for preorder\nLine 2: space-separated integers for inorder",
        output_format="Level-order traversal of the reconstructed tree.",
        constraints=["1 <= preorder.length <= 3000", "inorder.length == preorder.length", "-3000 <= preorder[i], inorder[i] <= 3000", "preorder and inorder consist of unique values."],
        examples=[
            {"input": "3 9 20 15 7\n9 3 15 20 7", "output": "3 9 20 null null 15 7"},
            {"input": "-1\n-1", "output": "-1"}
        ],
        public_test_cases=[
            {"input": "3 9 20 15 7\n9 3 15 20 7", "output": "3 9 20 null null 15 7"},
            {"input": "-1\n-1", "output": "-1"}
        ],
        hidden_test_cases=[
            {"input": "1 2\n2 1", "output": "1 2"}
        ],
        hints=[
            "First element in preorder is always the root of the current subtree.",
            "Locate root value in inorder array: all elements to the left belong to the left subtree, elements to the right belong to right subtree.",
            "Use a hash map to map inorder values to indices for O(1) partition lookups."
        ],
        time_complexity="O(N)",
        space_complexity="O(N)",
        py_fn_name="buildTree",
        py_fn_params="preorder: list[int], inorder: list[int]",
        py_fn_ret_type="TreeNode",
        py_sample_body="in_map = {v: i for i, v in enumerate(inorder)}\n    pre_idx = 0\n    def build(in_left, in_right):\n        nonlocal pre_idx\n        if in_left > in_right: return None\n        val = preorder[pre_idx]\n        pre_idx += 1\n        root = TreeNode(val)\n        mid = in_map[val]\n        root.left = build(in_left, mid - 1)\n        root.right = build(mid + 1, in_right)\n        return root\n    return build(0, len(inorder) - 1)",
        solution_explanation="Preorder supplies root nodes sequentially; inorder partitions left and right subtrees. Index lookup map provides O(N) reconstruction."
    ),

    make_problem(
        id="dsa_top150_099",
        number=99,
        title="Binary Tree Maximum Path Sum",
        topic_id="topic_trees_bst",
        subtopic="Post-Order Subtree Gain",
        difficulty="HARD",
        roadmap_stage="Placement Revision",
        companies=["Meta", "Amazon", "Google", "Microsoft"],
        description="A path in a binary tree is a sequence of nodes where each pair of adjacent nodes in the sequence has an edge connecting them. A node can only appear in the sequence at most once. Note that the path does not need to pass through the root.\n\nThe path sum of a path is the sum of the node's values in the path.\n\nGiven the root of a binary tree, return the maximum path sum of any non-empty path.",
        input_format="Level-order tree node values.",
        output_format="Single integer representing maximum path sum.",
        constraints=["The number of nodes in the tree is in the range [1, 3 * 10^4].", "-1000 <= Node.val <= 1000"],
        examples=[
            {"input": "1 2 3", "output": "6", "explanation": "The optimal path is 2 -> 1 -> 3 with path sum 2 + 1 + 3 = 6."},
            {"input": "-10 9 20 null null 15 7", "output": "42", "explanation": "The optimal path is 15 -> 20 -> 7 with path sum 15 + 20 + 7 = 42."}
        ],
        public_test_cases=[
            {"input": "1 2 3", "output": "6"},
            {"input": "-10 9 20 null null 15 7", "output": "42"}
        ],
        hidden_test_cases=[
            {"input": "-3", "output": "-3"},
            {"input": "2 -1", "output": "2"}
        ],
        hints=[
            "For each node, compute the maximum contribution it can gain from left and right subtrees (clamp negative gains to 0).",
            "At each node, update the global max path sum: node.val + left_gain + right_gain.",
            "Return to parent: node.val + max(left_gain, right_gain)."
        ],
        time_complexity="O(N)",
        space_complexity="O(Height)",
        py_fn_name="maxPathSum",
        py_fn_params="root",
        py_fn_ret_type="int",
        py_sample_body="max_sum = float('-inf')\n    def maxGain(node):\n        nonlocal max_sum\n        if not node: return 0\n        left_gain = max(maxGain(node.left), 0)\n        right_gain = max(maxGain(node.right), 0)\n        max_sum = max(max_sum, node.val + left_gain + right_gain)\n        return node.val + max(left_gain, right_gain)\n    maxGain(root)\n    return max_sum",
        solution_explanation="Post-order DFS calculates maximum branch contribution from child subtrees. Negative branch sums are pruned to 0."
    ),

    make_problem(
        id="dsa_top150_100",
        number=100,
        title="Serialize and Deserialize Binary Tree",
        topic_id="topic_trees_bst",
        subtopic="Pre-Order Stream Serialization",
        difficulty="HARD",
        roadmap_stage="Placement Revision",
        companies=["Amazon", "Google", "Meta", "Microsoft"],
        description="Serialization is the process of converting a data structure or object into a sequence of bits so that it can be stored in a file or memory buffer, or transmitted across a network connection link to be reconstructed later in the same or another computer environment.\n\nDesign an algorithm to serialize and deserialize a binary tree.",
        input_format="Level-order tree values.",
        output_format="Reconstructed tree level-order values.",
        constraints=["The number of nodes in the tree is in the range [0, 10^4].", "-1000 <= Node.val <= 1000"],
        examples=[
            {"input": "1 2 3 null null 4 5", "output": "1 2 3 null null 4 5"},
            {"input": "", "output": ""}
        ],
        public_test_cases=[
            {"input": "1 2 3 null null 4 5", "output": "1 2 3 null null 4 5"},
            {"input": "", "output": ""}
        ],
        hidden_test_cases=[
            {"input": "1", "output": "1"}
        ],
        hints=[
            "Preorder traversal with sentinel value '#' for null nodes is simple to deserialize recursively.",
            "Deserialize: read tokens one by one. If token == '#', return None.",
            "Otherwise create node(token), then recurse left and right."
        ],
        time_complexity="O(N)",
        space_complexity="O(N)",
        py_fn_name="Codec",
        py_fn_params="",
        py_fn_ret_type="",
        py_sample_body="class Codec:\n    def serialize(self, root):\n        res = []\n        def dfs(node):\n            if not node: res.append('#'); return\n            res.append(str(node.val))\n            dfs(node.left)\n            dfs(node.right)\n        dfs(root)\n        return ' '.join(res)\n    def deserialize(self, data):\n        vals = iter(data.split())\n        def dfs():\n            val = next(vals)\n            if val == '#': return None\n            node = TreeNode(int(val))\n            node.left = dfs()\n            node.right = dfs()\n            return node\n        return dfs()",
        solution_explanation="Pre-order DFS serialization encodes structural null sentinels '#'. Reconstruction iterates through preorder tokens recursively in linear time."
    ),

    # ------------------ TOPIC 11: HEAPS AND PRIORITY QUEUES (6 questions: 1 Easy, 3 Medium, 2 Hard) ------------------
    make_problem(
        id="dsa_top150_101",
        number=101,
        title="Kth Largest Element in a Stream",
        topic_id="topic_heaps",
        subtopic="Fixed-Capacity Min-Heap",
        difficulty="EASY",
        roadmap_stage="Beginner Foundations",
        companies=["Amazon", "Apple", "Google"],
        description="Design a class to find the kth largest element in a stream. Note that it is the kth largest element in the sorted order, not the kth distinct element.\n\nImplement KthLargest class:\n- KthLargest(int k, int[] nums) Initializes the object with the integer k and the stream of integers nums.\n- int add(int val) Appends the integer val to the stream and returns the element representing the kth largest element in the stream.",
        input_format="Line 1: k\nLine 2: initial array nums\nLine 3: stream numbers to add",
        output_format="Space-separated kth largest values after each add.",
        constraints=["1 <= k <= 10^4", "0 <= nums.length <= 10^4", "-10^4 <= nums[i] <= 10^4"],
        examples=[
            {"input": "3\n4 5 8 2\n3 5 10 9 4", "output": "4 5 5 8 8"}
        ],
        public_test_cases=[
            {"input": "3\n4 5 8 2\n3 5 10 9 4", "output": "4 5 5 8 8"}
        ],
        hidden_test_cases=[
            {"input": "1\n\n-3 -2 -4 0 4", "output": "-3 -2 -2 0 4"}
        ],
        hints=[
            "Maintain a min-heap containing only the k largest elements.",
            "If heap size > k, pop the smallest element (heappop).",
            "The top of the min-heap is always the kth largest element."
        ],
        time_complexity="O(log K) per add",
        space_complexity="O(K)",
        py_fn_name="KthLargest",
        py_fn_params="",
        py_fn_ret_type="",
        py_sample_body="import heapq\nclass KthLargest:\n    def __init__(self, k: int, nums: list[int]):\n        self.k = k\n        self.heap = nums\n        heapq.heapify(self.heap)\n        while len(self.heap) > k:\n            heapq.heappop(self.heap)\n    def add(self, val: int) -> int:\n        heapq.heappush(self.heap, val)\n        if len(self.heap) > self.k:\n            heapq.heappop(self.heap)\n        return self.heap[0]",
        solution_explanation="Min-heap of capacity k holds the largest k numbers seen. Heap root represents the kth largest item in O(log k) per addition."
    ),

    make_problem(
        id="dsa_top150_102",
        number=102,
        title="Top K Frequent Elements",
        topic_id="topic_heaps",
        subtopic="Frequency Min-Heap / Bucket Sort",
        difficulty="MEDIUM",
        roadmap_stage="Core Patterns",
        companies=["Amazon", "Meta", "Google", "Microsoft"],
        description="Given an integer array nums and an integer k, return the k most frequent elements. You may return the answer in any order.",
        input_format="Line 1: N space-separated integers\nLine 2: integer k",
        output_format="Space-separated k most frequent integers.",
        constraints=["1 <= nums.length <= 10^5", "-10^4 <= nums[i] <= 10^4", "k is in the range [1, the number of unique elements in the array].", "It is guaranteed that the answer is unique."],
        examples=[
            {"input": "1 1 1 2 2 3\n2", "output": "1 2"},
            {"input": "1\n1", "output": "1"}
        ],
        public_test_cases=[
            {"input": "1 1 1 2 2 3\n2", "output": "1 2"},
            {"input": "1\n1", "output": "1"}
        ],
        hidden_test_cases=[
            {"input": "4 1 -1 2 -1 2 3\n2", "output": "-1 2"}
        ],
        hints=[
            "Count frequencies using a hash map.",
            "Use a min-heap of size k storing (frequency, num) pairs.",
            "Alternatively, use Bucket Sort with frequency as index for O(N) runtime."
        ],
        time_complexity="O(N log K)",
        space_complexity="O(N)",
        py_fn_name="topKFrequent",
        py_fn_params="nums: list[int], k: int",
        py_fn_ret_type="list[int]",
        py_sample_body="from collections import Counter\n    import heapq\n    counts = Counter(nums)\n    return [item[0] for item in heapq.nlargest(k, counts.items(), key=lambda x: x[1])]",
        solution_explanation="Count frequencies and use a min-heap of size k (or bucket sort) to return the k most frequent elements in linearithmic time."
    ),

    make_problem(
        id="dsa_top150_103",
        number=103,
        title="K Closest Points to Origin",
        topic_id="topic_heaps",
        subtopic="Euclidean Max-Heap",
        difficulty="MEDIUM",
        roadmap_stage="Core Patterns",
        companies=["Amazon", "Meta", "Apple", "Google"],
        description="Given an array of points where points[i] = [xi, yi] represents a point on the X-Y plane and an integer k, return the k closest points to the origin (0, 0).\n\nThe distance between two points on the X-Y plane is the Euclidean distance (i.e., √(x1 - x2)^2 + (y1 - y2)^2).\n\nYou may return the answer in any order.",
        input_format="Line 1: N k\nNext N lines: x y",
        output_format="k lines of x y.",
        constraints=["1 <= k <= points.length <= 10^4", "-10^4 <= xi, yi <= 10^4"],
        examples=[
            {"input": "2 1\n1 3\n-2 2", "output": "-2 2", "explanation": "(-2,2) has distance sqrt(8) < sqrt(10)."},
            {"input": "3 2\n3 3\n5 -1\n-2 4", "output": "3 3\n-2 4"}
        ],
        public_test_cases=[
            {"input": "2 1\n1 3\n-2 2", "output": "-2 2"},
            {"input": "3 2\n3 3\n5 -1\n-2 4", "output": "3 3\n-2 4"}
        ],
        hidden_test_cases=[
            {"input": "1 1\n0 1", "output": "0 1"}
        ],
        hints=[
            "Distance metric comparison: x^2 + y^2 (no need to take square root).",
            "Maintain a max-heap of size k storing (-dist, point).",
            "If heap size > k, pop the furthest point."
        ],
        time_complexity="O(N log K)",
        space_complexity="O(K)",
        py_fn_name="kClosest",
        py_fn_params="points: list[list[int]], k: int",
        py_fn_ret_type="list[list[int]]",
        py_sample_body="import heapq\n    return heapq.nsmallest(k, points, key=lambda p: p[0]**2 + p[1]**2)",
        solution_explanation="Evaluate squared Euclidean distance x^2 + y^2. Use a max-heap of size k to retain only the k smallest distance coordinates."
    ),

    make_problem(
        id="dsa_top150_104",
        number=104,
        title="Task Scheduler",
        topic_id="topic_heaps",
        subtopic="Greedy Max-Heap with Cooling Queue",
        difficulty="MEDIUM",
        roadmap_stage="Core Patterns",
        companies=["Meta", "Amazon", "Google"],
        description="You are given an array of CPU tasks, each represented by letters A to Z, and a cooling time, n. Each cycle or interval allows the completion of one task. Tasks can be completed in any order, but there's a constraint: identical tasks must be separated by at least n intervals of cooling.\n\nReturn the minimum number of intervals required to complete all tasks.",
        input_format="Line 1: space-separated task characters\nLine 2: integer n",
        output_format="Single integer representing total CPU intervals.",
        constraints=["1 <= tasks.length <= 10^4", "tasks[i] is uppercase English letter.", "0 <= n <= 100"],
        examples=[
            {"input": "A A A B B B\n2", "output": "8", "explanation": "A -> B -> idle -> A -> B -> idle -> A -> B."},
            {"input": "A C A B D B\n1", "output": "6"},
            {"input": "A A A B B B\n3", "output": "10"}
        ],
        public_test_cases=[
            {"input": "A A A B B B\n2", "output": "8"},
            {"input": "A C A B D B\n1", "output": "6"}
        ],
        hidden_test_cases=[
            {"input": "A A A A B B B C C D\n2", "output": "10"}
        ],
        hints=[
            "Always prioritize executing the task with the highest remaining frequency.",
            "Use a max-heap for frequencies and a queue for tasks currently cooling down.",
            "Queue stores (remaining_count, ready_time)."
        ],
        time_complexity="O(N)",
        space_complexity="O(1)",
        py_fn_name="leastInterval",
        py_fn_params="tasks: list[str], n: int",
        py_fn_ret_type="int",
        py_sample_body="from collections import Counter\n    counts = Counter(tasks)\n    max_f = max(counts.values())\n    max_count = sum(1 for v in counts.values() if v == max_f)\n    return max(len(tasks), (max_f - 1) * (n + 1) + max_count)",
        solution_explanation="Formula: slots required by the most frequent task is (max_freq - 1) * (n + 1) + count_of_max_freq_tasks. Bounded below by len(tasks)."
    ),

    make_problem(
        id="dsa_top150_105",
        number=105,
        title="Find Median from Data Stream",
        topic_id="topic_heaps",
        subtopic="Dual Heap Median Balancer",
        difficulty="HARD",
        roadmap_stage="Placement Revision",
        companies=["Amazon", "Google", "Meta", "Apple"],
        description="The median is the middle value in an ordered integer list. If the size of the list is even, there is no middle value, and the median is the mean of the two middle values.\n\nImplement the MedianFinder class:\n- MedianFinder() initializes the MedianFinder object.\n- void addNum(int num) adds the integer num from the data stream to the data structure.\n- double findMedian() returns the median of all elements so far.",
        input_format="Stream operations: addNum, findMedian",
        output_format="Median values formatted to 5 decimal places.",
        constraints=["-10^5 <= num <= 10^5", "There will be at least one element in the data structure before calling findMedian.", "At most 5 * 10^4 calls will be made."],
        examples=[
            {"input": "add 1\nadd 2\nfind\nadd 3\nfind", "output": "1.50000 2.00000"}
        ],
        public_test_cases=[
            {"input": "add 1\nadd 2\nfind\nadd 3\nfind", "output": "1.50000 2.00000"}
        ],
        hidden_test_cases=[
            {"input": "add 5\nfind", "output": "5.00000"}
        ],
        hints=[
            "Maintain two heaps: a max-heap `small` for lower half, and a min-heap `large` for upper half.",
            "Balance sizes such that len(small) == len(large) or len(small) == len(large) + 1.",
            "Median is either small[0] or (small[0] + large[0]) / 2."
        ],
        time_complexity="O(log N) add, O(1) find",
        space_complexity="O(N)",
        py_fn_name="MedianFinder",
        py_fn_params="",
        py_fn_ret_type="",
        py_sample_body="import heapq\nclass MedianFinder:\n    def __init__(self):\n        self.small = [] # max heap (invert signs)\n        self.large = [] # min heap\n    def addNum(self, num: int) -> None:\n        heapq.heappush(self.small, -num)\n        heapq.heappush(self.large, -heapq.heappop(self.small))\n        if len(self.large) > len(self.small):\n            heapq.heappush(self.small, -heapq.heappop(self.large))\n    def findMedian(self) -> float:\n        if len(self.small) > len(self.large):\n            return float(-self.small[0])\n        return (-self.small[0] + self.large[0]) / 2.0",
        solution_explanation="Two heaps partition stream: max-heap holds smaller half, min-heap holds larger half. Median computation is O(1)."
    ),

    make_problem(
        id="dsa_top150_106",
        number=106,
        title="Merge k Sorted Lists",
        topic_id="topic_heaps",
        subtopic="K-Way Min-Heap Merge",
        difficulty="HARD",
        roadmap_stage="Placement Revision",
        companies=["Amazon", "Meta", "Google", "Microsoft"],
        description="You are given an array of k linked-lists lists, each linked-list is sorted in ascending order.\n\nMerge all the linked-lists into one sorted linked-list and return it.",
        input_format="Line 1: k (number of lists)\nNext k lines: space-separated integers for each list",
        output_format="Merged space-separated sorted list.",
        constraints=["k == lists.length", "0 <= k <= 10^4", "0 <= lists[i].length <= 500", "-10^4 <= lists[i][j] <= 10^4", "lists[i] is sorted in ascending order."],
        examples=[
            {"input": "3\n1 4 5\n1 3 4\n2 6", "output": "1 1 2 3 4 4 5 6"},
            {"input": "0", "output": ""},
            {"input": "1\n", "output": ""}
        ],
        public_test_cases=[
            {"input": "3\n1 4 5\n1 3 4\n2 6", "output": "1 1 2 3 4 4 5 6"},
            {"input": "0", "output": ""}
        ],
        hidden_test_cases=[
            {"input": "1\n1", "output": "1"},
            {"input": "2\n1 3\n2 4", "output": "1 2 3 4"}
        ],
        hints=[
            "Use a min-heap storing (node.val, list_index, node).",
            "Initialize heap with head of all k lists.",
            "Pop the smallest node, attach to result, and push node.next into heap."
        ],
        time_complexity="O(N log K)",
        space_complexity="O(K)",
        py_fn_name="mergeKLists",
        py_fn_params="lists",
        py_fn_ret_type="ListNode",
        py_sample_body="import heapq\n    h = []\n    for i, node in enumerate(lists):\n        if node:\n            heapq.heappush(h, (node.val, i, node))\n    dummy = curr = ListNode(0)\n    while h:\n        val, i, node = heapq.heappop(h)\n        curr.next = node\n        curr = curr.next\n        if node.next:\n            heapq.heappush(h, (node.next.val, i, node.next))\n    return dummy.next",
        solution_explanation="Min-heap of size k tracks the current front element across all k lists. Extracts minimum in O(log k) for each of the N total nodes."
    ),

    # ------------------ TOPIC 12: GRAPHS (13 questions: 3 Easy, 8 Medium, 2 Hard) ------------------
    make_problem(
        id="dsa_top150_107",
        number=107,
        title="Flood Fill",
        topic_id="topic_graphs",
        subtopic="Connected Component DFS",
        difficulty="EASY",
        roadmap_stage="Beginner Foundations",
        companies=["Amazon", "Apple", "Google"],
        description="An image is represented by an m x n integer grid image where image[i][j] represents the pixel value of the image.\n\nYou are also given three integers sr, sc, and color. You should perform a flood fill on the image starting from the pixel image[sr][sc].\n\nReturn the modified image after performing the flood fill.",
        input_format="Line 1: m n sr sc color\nNext m lines: n space-separated integers",
        output_format="m lines of n space-separated integers.",
        constraints=["m == image.length", "n == image[i].length", "1 <= m, n <= 50", "0 <= image[i][j], color < 65536"],
        examples=[
            {"input": "3 3 1 1 2\n1 1 1\n1 1 0\n1 0 1", "output": "2 2 2\n2 2 0\n2 0 1"},
            {"input": "2 2 0 0 0\n0 0 0\n0 0 0", "output": "0 0 0\n0 0 0"}
        ],
        public_test_cases=[
            {"input": "3 3 1 1 2\n1 1 1\n1 1 0\n1 0 1", "output": "2 2 2\n2 2 0\n2 0 1"},
            {"input": "2 2 0 0 0\n0 0 0\n0 0 0", "output": "0 0 0\n0 0 0"}
        ],
        hidden_test_cases=[
            {"input": "1 1 0 0 5\n1", "output": "5"}
        ],
        hints=[
            "Note original color = image[sr][sc]. If original color == new color, return image immediately.",
            "DFS in 4 directions: up, down, left, right.",
            "Recurse whenever neighboring pixel has original color."
        ],
        time_complexity="O(M * N)",
        space_complexity="O(M * N)",
        py_fn_name="floodFill",
        py_fn_params="image: list[list[int]], sr: int, sc: int, color: int",
        py_fn_ret_type="list[list[int]]",
        py_sample_body="orig = image[sr][sc]\n    if orig == color: return image\n    R, C = len(image), len(image[0])\n    def dfs(r, c):\n        if 0 <= r < R and 0 <= c < C and image[r][c] == orig:\n            image[r][c] = color\n            dfs(r+1, c); dfs(r-1, c); dfs(r, c+1); dfs(r, c-1)\n    dfs(sr, sc)\n    return image",
        solution_explanation="DFS traversal visits all connected pixels matching original starting color and replaces with new color."
    ),

    make_problem(
        id="dsa_top150_108",
        number=108,
        title="Shortest Path in an Unweighted Graph",
        topic_id="topic_graphs",
        subtopic="BFS Shortest Path",
        difficulty="EASY",
        roadmap_stage="Beginner Foundations",
        companies=["Amazon", "Microsoft"],
        description="Given an unweighted undirected graph represented by an adjacency list, find the length of the shortest path from node start to node target. If no path exists, return -1.",
        input_format="Line 1: N E start target\nNext E lines: u v (undirected edge)",
        output_format="Single integer shortest path distance, or -1.",
        constraints=["1 <= N <= 10^4", "0 <= E <= 2 * 10^4"],
        examples=[
            {"input": "4 4 1 4\n1 2\n2 3\n3 4\n1 4", "output": "1", "explanation": "Direct edge 1 - 4 gives distance 1."},
            {"input": "3 1 1 3\n1 2", "output": "-1"}
        ],
        public_test_cases=[
            {"input": "4 4 1 4\n1 2\n2 3\n3 4\n1 4", "output": "1"},
            {"input": "3 1 1 3\n1 2", "output": "-1"}
        ],
        hidden_test_cases=[
            {"input": "1 0 1 1", "output": "0"}
        ],
        hints=[
            "Breadth-First Search (BFS) explores nodes layer by layer.",
            "Queue stores (current_node, distance).",
            "First time target is popped from queue gives the optimal shortest path."
        ],
        time_complexity="O(V + E)",
        space_complexity="O(V)",
        py_fn_name="shortestPathBFS",
        py_fn_params="adj, start: int, target: int",
        py_fn_ret_type="int",
        py_sample_body="from collections import deque\n    if start == target: return 0\n    q = deque([(start, 0)])\n    visited = {start}\n    while q:\n        node, d = q.popleft()\n        if node == target: return d\n        for nxt in adj.get(node, []):\n            if nxt not in visited:\n                visited.add(nxt)\n                q.append((nxt, d + 1))\n    return -1",
        solution_explanation="BFS guarantees minimum edge distance on unweighted graphs because nodes are expanded in monotonic order of distance."
    ),

    make_problem(
        id="dsa_top150_109",
        number=109,
        title="Find Center of Star Graph",
        topic_id="topic_graphs",
        subtopic="Degree Invariant",
        difficulty="EASY",
        roadmap_stage="Beginner Foundations",
        companies=["Google", "Amazon"],
        description="There is an undirected star graph consisting of n nodes labeled from 1 to n. A star graph is a graph where there is one center node and exactly n - 1 edges that connect the center node with every other node.\n\nYou are given a 2D integer array edges where each edges[i] = [ui, vi] indicates an edge between ui and vi. Return the center of the star graph.",
        input_format="Line 1: N - 1 (number of edges)\nNext lines: u v",
        output_format="Single integer center node label.",
        constraints=["3 <= n <= 10^5", "edges.length == n - 1"],
        examples=[
            {"input": "3\n1 2\n2 3\n4 2", "output": "2"},
            {"input": "4\n1 2\n5 1\n1 3\n1 4", "output": "1"}
        ],
        public_test_cases=[
            {"input": "3\n1 2\n2 3\n4 2", "output": "2"},
            {"input": "4\n1 2\n5 1\n1 3\n1 4", "output": "1"}
        ],
        hidden_test_cases=[
            {"input": "2\n1 3\n2 3", "output": "3"}
        ],
        hints=[
            "The center node must be present in every single edge.",
            "Compare the first two edges: the common node between them must be the center.",
            "O(1) time is sufficient."
        ],
        time_complexity="O(1)",
        space_complexity="O(1)",
        py_fn_name="findCenter",
        py_fn_params="edges: list[list[int]]",
        py_fn_ret_type="int",
        py_sample_body="return edges[0][0] if edges[0][0] in edges[1] else edges[0][1]",
        solution_explanation="The center node connects to all vertices. Inspecting just the first two edges reveals the shared center in O(1) time."
    ),

    make_problem(
        id="dsa_top150_110",
        number=110,
        title="Number of Islands",
        topic_id="topic_graphs",
        subtopic="Connected Components DFS/BFS",
        difficulty="MEDIUM",
        roadmap_stage="Core Patterns",
        companies=["Amazon", "Google", "Meta", "Bloomberg", "Microsoft"],
        description="Given an m x n 2D binary grid grid which represents a map of '1's (land) and '0's (water), return the number of islands.\n\nAn island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically. You may assume all four edges of the grid are all surrounded by water.",
        input_format="Line 1: m n\nNext m lines: n space-separated '1' or '0'",
        output_format="Single integer count of islands.",
        constraints=["m == grid.length", "n == grid[i].length", "1 <= m, n <= 300", "grid[i][j] is '0' or '1'."],
        examples=[
            {"input": "4 5\n1 1 1 1 0\n1 1 0 1 0\n1 1 0 0 0\n0 0 0 0 0", "output": "1"},
            {"input": "4 5\n1 1 0 0 0\n1 1 0 0 0\n0 0 1 0 0\n0 0 0 1 1", "output": "3"}
        ],
        public_test_cases=[
            {"input": "4 5\n1 1 1 1 0\n1 1 0 1 0\n1 1 0 0 0\n0 0 0 0 0", "output": "1"},
            {"input": "4 5\n1 1 0 0 0\n1 1 0 0 0\n0 0 1 0 0\n0 0 0 1 1", "output": "3"}
        ],
        hidden_test_cases=[
            {"input": "1 1\n1", "output": "1"},
            {"input": "1 1\n0", "output": "0"}
        ],
        hints=[
            "Iterate through all grid cells.",
            "When seeing '1', increment island count and initiate DFS/BFS to sink the entire island (turn '1's into '0's).",
            "Visited cells will not be processed again."
        ],
        time_complexity="O(M * N)",
        space_complexity="O(M * N)",
        py_fn_name="numIslands",
        py_fn_params="grid: list[list[str]]",
        py_fn_ret_type="int",
        py_sample_body="R, C = len(grid), len(grid[0])\n    def dfs(r, c):\n        if r < 0 or r >= R or c < 0 or c >= C or grid[r][c] != '1': return\n        grid[r][c] = '0'\n        dfs(r+1, c); dfs(r-1, c); dfs(r, c+1); dfs(r, c-1)\n    ans = 0\n    for r in range(R):\n        for c in range(C):\n            if grid[r][c] == '1':\n                ans += 1\n                dfs(r, c)\n    return ans",
        solution_explanation="Traverse grid: each unvisited '1' indicates a new island. DFS floods and sinks the entire connected component to prevent duplicate counting."
    ),

    make_problem(
        id="dsa_top150_111",
        number=111,
        title="Clone Graph",
        topic_id="topic_graphs",
        subtopic="Graph Deep Copy with Hash Map",
        difficulty="MEDIUM",
        roadmap_stage="Core Patterns",
        companies=["Meta", "Amazon", "Google"],
        description="Given a reference of a node in a connected undirected graph. Return a deep copy (clone) of the graph.\n\nEach node in the graph contains a value (int) and a list (List[Node]) of its neighbors.",
        input_format="Adjacency list representation.",
        output_format="Cloned adjacency list representation.",
        constraints=["The number of nodes in the graph is in the range [0, 100].", "1 <= Node.val <= 100", "Node.val is unique for each node."],
        examples=[
            {"input": "4\n2 4\n1 3\n2 4\n1 3", "output": "2 4\n1 3\n2 4\n1 3"},
            {"input": "1\n", "output": ""},
            {"input": "0", "output": ""}
        ],
        public_test_cases=[
            {"input": "4\n2 4\n1 3\n2 4\n1 3", "output": "2 4\n1 3\n2 4\n1 3"}
        ],
        hidden_test_cases=[
            {"input": "0", "output": ""}
        ],
        hints=[
            "Use a hash map {original_node: cloned_node} to track already cloned nodes and avoid infinite loops.",
            "DFS/BFS over the graph.",
            "If neighbor already cloned, attach it. Otherwise clone neighbor and recurse."
        ],
        time_complexity="O(V + E)",
        space_complexity="O(V)",
        py_fn_name="cloneGraph",
        py_fn_params="node",
        py_fn_ret_type="Node",
        py_sample_body="cloned = {}\n    def dfs(curr):\n        if not curr: return None\n        if curr in cloned: return cloned[curr]\n        copy = Node(curr.val)\n        cloned[curr] = copy\n        for nxt in curr.neighbors:\n            copy.neighbors.append(dfs(nxt))\n        return copy\n    return dfs(node)",
        solution_explanation="Hash map maps original nodes to their cloned counterparts, breaking cycle dependencies and ensuring deep copies."
    ),

    make_problem(
        id="dsa_top150_112",
        number=112,
        title="Course Schedule",
        topic_id="topic_graphs",
        subtopic="Topological Sort / Cycle Detection",
        difficulty="MEDIUM",
        roadmap_stage="Core Patterns",
        companies=["Amazon", "Google", "Meta", "Microsoft"],
        description="There are a total of numCourses courses you have to take, labeled from 0 to numCourses - 1. You are given an array prerequisites where prerequisites[i] = [ai, bi] indicates that you must take course bi first if you want to take course ai.\n\nReturn true if you can finish all courses. Otherwise, return false (i.e. if there is a cycle).",
        input_format="Line 1: numCourses\nLine 2: E (number of prerequisite pairs)\nNext E lines: a b",
        output_format="true or false",
        constraints=["1 <= numCourses <= 2000", "0 <= prerequisites.length <= 5000", "prerequisites[i].length == 2", "All prerequisite pairs are unique."],
        examples=[
            {"input": "2\n1\n1 0", "output": "true", "explanation": "To take course 1 you should take course 0. Finished."},
            {"input": "2\n2\n1 0\n0 1", "output": "false", "explanation": "Cycle detected between course 0 and course 1."}
        ],
        public_test_cases=[
            {"input": "2\n1\n1 0", "output": "true"},
            {"input": "2\n2\n1 0\n0 1", "output": "false"}
        ],
        hidden_test_cases=[
            {"input": "1\n0", "output": "true"},
            {"input": "3\n2\n0 1\n0 2", "output": "true"}
        ],
        hints=[
            "Model courses as a directed graph. A cycle means courses cannot be completed.",
            "Kahn's Algorithm (BFS with in-degree array).",
            "Enqueue nodes with in-degree 0. Each time a node is popped, decrement in-degree of neighbors."
        ],
        time_complexity="O(V + E)",
        space_complexity="O(V + E)",
        py_fn_name="canFinish",
        py_fn_params="numCourses: int, prerequisites: list[list[int]]",
        py_fn_ret_type="bool",
        py_sample_body="from collections import deque, defaultdict\n    in_degree = [0] * numCourses\n    adj = defaultdict(list)\n    for dest, src in prerequisites:\n        adj[src].append(dest)\n        in_degree[dest] += 1\n    q = deque([i for i in range(numCourses) if in_degree[i] == 0])\n    visited = 0\n    while q:\n        node = q.popleft()\n        visited += 1\n        for nxt in adj[node]:\n            in_degree[nxt] -= 1\n            if in_degree[nxt] == 0: q.append(nxt)\n    return visited == numCourses",
        solution_explanation="Kahn's BFS topological sorting: count incoming edges (in-degree). Successive removal of zero-in-degree nodes finishes all courses if and only if no directed cycle exists."
    ),

    make_problem(
        id="dsa_top150_113",
        number=113,
        title="Course Schedule II",
        topic_id="topic_graphs",
        subtopic="Topological Ordering Recovery",
        difficulty="MEDIUM",
        roadmap_stage="Core Patterns",
        companies=["Amazon", "Google", "Meta"],
        description="There are a total of numCourses courses labeled from 0 to numCourses - 1. You are given an array prerequisites where prerequisites[i] = [ai, bi] indicates that you must take course bi first if you want to take course ai.\n\nReturn the ordering of courses you should take to finish all courses. If it is impossible, return an empty array.",
        input_format="Line 1: numCourses\nLine 2: E\nNext E lines: a b",
        output_format="Space-separated course sequence, or empty.",
        constraints=["1 <= numCourses <= 2000", "0 <= prerequisites.length <= numCourses * (numCourses - 1)"],
        examples=[
            {"input": "2\n1\n1 0", "output": "0 1"},
            {"input": "4\n4\n1 0\n2 0\n3 1\n3 2", "output": "0 1 2 3"}
        ],
        public_test_cases=[
            {"input": "2\n1\n1 0", "output": "0 1"},
            {"input": "4\n4\n1 0\n2 0\n3 1\n3 2", "output": "0 1 2 3"}
        ],
        hidden_test_cases=[
            {"input": "2\n2\n0 1\n1 0", "output": ""}
        ],
        hints=[
            "Same as Course Schedule I, but record the order in which nodes with in-degree 0 are removed.",
            "If total courses processed == numCourses, return the ordering list; otherwise return [].",
            "Initialize an in-degree array and an adjacency list, then queue all nodes with 0 incoming dependencies."
        ],
        time_complexity="O(V + E)",
        space_complexity="O(V + E)",
        py_fn_name="findOrder",
        py_fn_params="numCourses: int, prerequisites: list[list[int]]",
        py_fn_ret_type="list[int]",
        py_sample_body="from collections import deque, defaultdict\n    in_degree = [0] * numCourses\n    adj = defaultdict(list)\n    for dest, src in prerequisites:\n        adj[src].append(dest)\n        in_degree[dest] += 1\n    q = deque([i for i in range(numCourses) if in_degree[i] == 0])\n    order = []\n    while q:\n        node = q.popleft()\n        order.append(node)\n        for nxt in adj[node]:\n            in_degree[nxt] -= 1\n            if in_degree[nxt] == 0: q.append(nxt)\n    return order if len(order) == numCourses else []",
        solution_explanation="Kahn's algorithm collects nodes in topological order. Returns empty list if graph contains a directed cycle."
    ),

    make_problem(
        id="dsa_top150_114",
        number=114,
        title="Rotting Oranges",
        topic_id="topic_graphs",
        subtopic="Multi-Source BFS",
        difficulty="MEDIUM",
        roadmap_stage="Core Patterns",
        companies=["Amazon", "Microsoft", "Meta"],
        description="You are given an m x n grid where each cell can have one of three values:\n- 0 representing an empty cell,\n- 1 representing a fresh orange, or\n- 2 representing a rotten orange.\n\nEvery minute, any fresh orange that is 4-directionally adjacent to a rotten orange becomes rotten.\n\nReturn the minimum number of minutes that must elapse until no cell has a fresh orange. If this is impossible, return -1.",
        input_format="Line 1: m n\nNext m lines: n space-separated integers (0, 1, or 2)",
        output_format="Minutes elapsed, or -1.",
        constraints=["m == grid.length", "n == grid[i].length", "1 <= m, n <= 10", "grid[i][j] is 0, 1, or 2."],
        examples=[
            {"input": "3 3\n2 1 1\n1 1 0\n0 1 1", "output": "4"},
            {"input": "3 3\n2 1 1\n0 1 1\n1 0 1", "output": "-1", "explanation": "Orange at bottom-left cannot rot."}
        ],
        public_test_cases=[
            {"input": "3 3\n2 1 1\n1 1 0\n0 1 1", "output": "4"},
            {"input": "3 3\n2 1 1\n0 1 1\n1 0 1", "output": "-1"}
        ],
        hidden_test_cases=[
            {"input": "1 1\n0", "output": "0"},
            {"input": "1 1\n1", "output": "-1"}
        ],
        hints=[
            "Multi-source BFS: add all initial rotten oranges to the queue at minute 0.",
            "Count initial fresh oranges.",
            "Each minute, pop all rotten oranges in current round and rot adjacent fresh oranges. Decrement fresh count."
        ],
        time_complexity="O(M * N)",
        space_complexity="O(M * N)",
        py_fn_name="orangesRotting",
        py_fn_params="grid: list[list[int]]",
        py_fn_ret_type="int",
        py_sample_body="from collections import deque\n    R, C = len(grid), len(grid[0])\n    q = deque()\n    fresh = 0\n    for r in range(R):\n        for c in range(C):\n            if grid[r][c] == 2: q.append((r, c))\n            elif grid[r][c] == 1: fresh += 1\n    time = 0\n    while q and fresh > 0:\n        for _ in range(len(q)):\n            r, c = q.popleft()\n            for dr, dc in [(1,0),(-1,0),(0,1),(0,-1)]:\n                nr, nc = r + dr, c + dc\n                if 0 <= nr < R and 0 <= nc < C and grid[nr][nc] == 1:\n                    grid[nr][nc] = 2\n                    fresh -= 1\n                    q.append((nr, nc))\n        time += 1\n    return time if fresh == 0 else -1",
        solution_explanation="Multi-source BFS: initialize queue with all rotten cells. Process level by level incrementing time until no fresh oranges remain."
    ),

    make_problem(
        id="dsa_top150_115",
        number=115,
        title="Pacific Atlantic Water Flow",
        topic_id="topic_graphs",
        subtopic="Reverse Multi-Source Flow",
        difficulty="MEDIUM",
        roadmap_stage="Core Patterns",
        companies=["Google", "Amazon", "Meta"],
        description="There is an m x n rectangular island that borders both the Pacific Ocean and Atlantic Ocean. The Pacific borders top and left edges, and Atlantic borders bottom and right edges.\n\nWater can flow from a cell to an adjacent one if the adjacent cell's height is less than or equal to current cell's height.\n\nReturn a 2D list of grid coordinates result where result[i] = [ri, ci] denotes that rain water can flow from (ri, ci) to both oceans.",
        input_format="Line 1: m n\nNext m lines: n space-separated heights",
        output_format="Coordinates r c that reach both oceans, one per line.",
        constraints=["m == heights.length", "n == heights[r].length", "1 <= m, n <= 200", "0 <= heights[r][c] <= 10^5"],
        examples=[
            {"input": "5 5\n1 2 2 3 5\n3 2 3 4 4\n2 4 5 3 1\n6 7 1 4 5\n5 1 1 2 4", "output": "0 4\n1 3\n1 4\n2 2\n3 0\n3 1\n4 0"}
        ],
        public_test_cases=[
            {"input": "5 5\n1 2 2 3 5\n3 2 3 4 4\n2 4 5 3 1\n6 7 1 4 5\n5 1 1 2 4", "output": "0 4\n1 3\n1 4\n2 2\n3 0\n3 1\n4 0"}
        ],
        hidden_test_cases=[
            {"input": "1 1\n1", "output": "0 0"}
        ],
        hints=[
            "Flow backwards from the oceans inward to cells of equal or greater height.",
            "Run DFS/BFS from Pacific borders (top/left) to find reachable cells.",
            "Run DFS/BFS from Atlantic borders (bottom/right). Cells in the intersection reach both oceans."
        ],
        time_complexity="O(M * N)",
        space_complexity="O(M * N)",
        py_fn_name="pacificAtlantic",
        py_fn_params="heights: list[list[int]]",
        py_fn_ret_type="list[list[int]]",
        py_sample_body="R, C = len(heights), len(heights[0])\n    pac, atl = set(), set()\n    def dfs(r, c, visit, prev_h):\n        if (r, c) in visit or r < 0 or r >= R or c < 0 or c >= C or heights[r][c] < prev_h: return\n        visit.add((r, c))\n        for dr, dc in [(1,0),(-1,0),(0,1),(0,-1)]:\n            dfs(r+dr, c+dc, visit, heights[r][c])\n    for c in range(C): dfs(0, c, pac, heights[0][c]); dfs(R-1, c, atl, heights[R-1][c])\n    for r in range(R): dfs(r, 0, pac, heights[r][0]); dfs(r, C-1, atl, heights[r][C-1])\n    return sorted([[r, c] for r, c in (pac & atl)])",
        solution_explanation="Reverse search from oceanic edges: flood inward where elevation increases or stays constant. The intersection of both visited sets can drain to both oceans."
    ),

    make_problem(
        id="dsa_top150_116",
        number=116,
        title="Graph Valid Tree",
        topic_id="topic_graphs",
        subtopic="Tree Invariant (Acyclic & Connected)",
        difficulty="MEDIUM",
        roadmap_stage="Core Patterns",
        companies=["Google", "Amazon", "Meta", "LinkedIn"],
        description="Given n nodes labeled from 0 to n - 1 and a list of undirected edges (each edge is a pair of nodes), write a function to check whether these edges make up a valid tree.",
        input_format="Line 1: n E\nNext E lines: u v",
        output_format="true or false",
        constraints=["1 <= n <= 2000", "0 <= edges.length <= 5000"],
        examples=[
            {"input": "5 4\n0 1\n0 2\n0 3\n1 4", "output": "true"},
            {"input": "5 5\n0 1\n1 2\n2 3\n1 3\n1 4", "output": "false"}
        ],
        public_test_cases=[
            {"input": "5 4\n0 1\n0 2\n0 3\n1 4", "output": "true"},
            {"input": "5 5\n0 1\n1 2\n2 3\n1 3\n1 4", "output": "false"}
        ],
        hidden_test_cases=[
            {"input": "1 0", "output": "true"},
            {"input": "2 0", "output": "false"}
        ],
        hints=[
            "A valid tree with n nodes must have exactly n - 1 edges.",
            "It must be fully connected and contain no cycles.",
            "Use Union-Find or DFS to check connectivity and cycle freedom."
        ],
        time_complexity="O(V + E)",
        space_complexity="O(V)",
        py_fn_name="validTree",
        py_fn_params="n: int, edges: list[list[int]]",
        py_fn_ret_type="bool",
        py_sample_body="if len(edges) != n - 1: return False\n    parent = list(range(n))\n    def find(i):\n        if parent[i] == i: return i\n        parent[i] = find(parent[i])\n        return parent[i]\n    for u, v in edges:\n        pu, pv = find(u), find(v)\n        if pu == pv: return False\n        parent[pu] = pv\n    return True",
        solution_explanation="A graph is a tree if and only if edge count is n - 1 and union-find detects no cycles."
    ),

    make_problem(
        id="dsa_top150_117",
        number=117,
        title="Number of Connected Components",
        topic_id="topic_graphs",
        subtopic="Disjoint Sets / Connected Components",
        difficulty="MEDIUM",
        roadmap_stage="Core Patterns",
        companies=["Amazon", "Google", "Meta", "Twitter"],
        description="You have a graph of n nodes. You are given an integer n and an array edges where edges[i] = [ai, bi] indicates that there is an edge between ai and bi in the graph.\n\nReturn the number of connected components in the graph.",
        input_format="Line 1: n E\nNext E lines: a b",
        output_format="Single integer count of connected components.",
        constraints=["1 <= n <= 2000", "0 <= edges.length <= 5000"],
        examples=[
            {"input": "5 4\n0 1\n1 2\n3 4\n0 2", "output": "2"},
            {"input": "5 5\n0 1\n1 2\n2 3\n3 4\n0 4", "output": "1"}
        ],
        public_test_cases=[
            {"input": "5 4\n0 1\n1 2\n3 4\n0 2", "output": "2"},
            {"input": "5 5\n0 1\n1 2\n2 3\n3 4\n0 4", "output": "1"}
        ],
        hidden_test_cases=[
            {"input": "4 0", "output": "4"}
        ],
        hints=[
            "Use Disjoint Set Union (Union-Find).",
            "Initialize with n components.",
            "Each successful union between distinct components decrements component count by 1."
        ],
        time_complexity="O(V + E * alpha(V))",
        space_complexity="O(V)",
        py_fn_name="countComponents",
        py_fn_params="n: int, edges: list[list[int]]",
        py_fn_ret_type="int",
        py_sample_body="parent = list(range(n))\n    def find(i):\n        if parent[i] == i: return i\n        parent[i] = find(parent[i])\n        return parent[i]\n    comp = n\n    for u, v in edges:\n        pu, pv = find(u), find(v)\n        if pu != pv:\n            parent[pu] = pv\n            comp -= 1\n    return comp",
        solution_explanation="Union-Find with path compression. Start with n components; decrement each time two previously disconnected sets are merged."
    ),

    make_problem(
        id="dsa_top150_118",
        number=118,
        title="Word Ladder",
        topic_id="topic_graphs",
        subtopic="Shortest Transformation BFS",
        difficulty="HARD",
        roadmap_stage="Placement Revision",
        companies=["Amazon", "Google", "Meta", "LinkedIn"],
        description="A transformation sequence from word beginWord to word endWord using a dictionary wordList is a sequence of words beginWord -> s1 -> s2 -> ... -> sk such that:\n- Every adjacent pair of words differs by a single letter.\n- Every si for 1 <= i <= k is in wordList. Note that beginWord does not need to be in wordList.\n- sk == endWord\n\nGiven two words, beginWord and endWord, and a dictionary wordList, return the number of words in the shortest transformation sequence from beginWord to endWord, or 0 if no such sequence exists.",
        input_format="Line 1: beginWord\nLine 2: endWord\nLine 3: space-separated words in wordList",
        output_format="Length of shortest transformation sequence (count of words), or 0.",
        constraints=["1 <= beginWord.length <= 10", "endWord.length == beginWord.length", "1 <= wordList.length <= 5000", "All strings consist of lowercase English letters."],
        examples=[
            {"input": "hit\ncog\nhot dot dog lot log cog", "output": "5", "explanation": "hit -> hot -> dot -> dog -> cog (5 words)."},
            {"input": "hit\ncog\nhot dot dog lot log", "output": "0", "explanation": "endWord \"cog\" is not in wordList."}
        ],
        public_test_cases=[
            {"input": "hit\ncog\nhot dot dog lot log cog", "output": "5"},
            {"input": "hit\ncog\nhot dot dog lot log", "output": "0"}
        ],
        hidden_test_cases=[
            {"input": "a\nc\na b c", "output": "2"}
        ],
        hints=[
            "Each word is a node. An edge exists between words that differ by exactly 1 character.",
            "Use BFS to find the shortest transformation path.",
            "Intermediate generic pattern map (e.g. h*t -> [hot, hit]) speeds up neighbor generation."
        ],
        time_complexity="O(M^2 * N)",
        space_complexity="O(M^2 * N)",
        py_fn_name="ladderLength",
        py_fn_params="beginWord: str, endWord: str, wordList: list[str]",
        py_fn_ret_type="int",
        py_sample_body="from collections import deque, defaultdict\n    words = set(wordList)\n    if endWord not in words: return 0\n    patterns = defaultdict(list)\n    L = len(beginWord)\n    for w in words:\n        for i in range(L): patterns[w[:i] + '*' + w[i+1:]].append(w)\n    q = deque([(beginWord, 1)])\n    visited = {beginWord}\n    while q:\n        word, steps = q.popleft()\n        if word == endWord: return steps\n        for i in range(L):\n            pat = word[:i] + '*' + word[i+1:]\n            for nxt in patterns[pat]:\n                if nxt not in visited:\n                    visited.add(nxt)\n                    q.append((nxt, steps + 1))\n            patterns[pat] = []\n    return 0",
        solution_explanation="BFS on intermediate pattern graph (e.g., d*g). Level distance directly corresponds to the minimum transformation sequence length."
    ),

    make_problem(
        id="dsa_top150_119",
        number=119,
        title="Alien Dictionary",
        topic_id="topic_graphs",
        subtopic="Lexicographical Topological Ordering",
        difficulty="HARD",
        roadmap_stage="Placement Revision",
        companies=["Meta", "Google", "Amazon", "Twitter"],
        description="There is a new alien language that uses the English alphabet. However, the order of the letters is unknown to you.\n\nYou are given a list of strings words from the alien language's dictionary, where the strings are sorted lexicographically by the rules of this new language.\n\nReturn a string of the unique letters in the new alien language sorted in lexicographically increasing order by the new language's rules. If there is no solution, return \"\".",
        input_format="A single line containing space-separated words sorted in alien lexicographical order.",
        output_format="String of alien character ordering, or empty string.",
        constraints=["1 <= words.length <= 100", "1 <= words[i].length <= 100", "words[i] consists of only lowercase English letters."],
        examples=[
            {"input": "wrt wrf er ett rftt", "output": "wertf"},
            {"input": "z x", "output": "zx"},
            {"input": "z x z", "output": "", "explanation": "Cycle between z and x."}
        ],
        public_test_cases=[
            {"input": "wrt wrf er ett rftt", "output": "wertf"},
            {"input": "z x", "output": "zx"}
        ],
        hidden_test_cases=[
            {"input": "z x z", "output": ""},
            {"input": "abc ab", "output": ""}
        ],
        hints=[
            "Compare adjacent words in the dictionary to find the first differing character: word1[j] -> word2[j] creates a directed edge.",
            "If word1 is a prefix of word2 but comes after word2 with greater length, it is invalid.",
            "Run topological sort on the character graph. If a cycle is detected, return \"\"."
        ],
        time_complexity="O(Total Characters)",
        space_complexity="O(Unique Characters)",
        py_fn_name="alienOrder",
        py_fn_params="words: list[str]",
        py_fn_ret_type="str",
        py_sample_body="from collections import defaultdict, deque\n    adj = {c: set() for w in words for c in w}\n    in_degree = {c: 0 for c in adj}\n    for i in range(len(words) - 1):\n        w1, w2 = words[i], words[i + 1]\n        min_len = min(len(w1), len(w2))\n        if len(w1) > len(w2) and w1[:min_len] == w2[:min_len]: return ''\n        for j in range(min_len):\n            if w1[j] != w2[j]:\n                if w2[j] not in adj[w1[j]]:\n                    adj[w1[j]].add(w2[j])\n                    in_degree[w2[j]] += 1\n                break\n    q = deque([c for c in in_degree if in_degree[c] == 0])\n    res = []\n    while q:\n        c = q.popleft()\n        res.append(c)\n        for nxt in adj[c]:\n            in_degree[nxt] -= 1\n            if in_degree[nxt] == 0: q.append(nxt)\n    return ''.join(res) if len(res) == len(adj) else ''",
        solution_explanation="Extract character precedence by comparing adjacent words. Topological sort establishes character order; cycle detection flags contradictions."
    )
]

print(f"Part 3 loaded with {len(part3_problems)} problems.")
