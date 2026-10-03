import { CodingProblem, CodingTestCase, SavedCode, CodingSession } from '../models/types';

export const seedProblems: CodingProblem[] = [
  {
    id: 'prob_two_sum',
    title: 'Pair with Target Sum (Two Sum)',
    slug: 'two-sum',
    description: `Given an array of integers \`nums\` and an integer \`target\`, return the indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

Output the two 0-based indices separated by a space in ascending order.`,
    difficulty: 'EASY',
    topic: 'Arrays & Hashing',
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.',
    ],
    input_format: 'First line contains an integer N (size of array).\nSecond line contains N space-separated integers.\nThird line contains the target integer.',
    output_format: 'Two space-separated indices (i j) with i < j.',
    examples: [
      {
        input: '4\n2 7 11 15\n9',
        output: '0 1',
        explanation: 'nums[0] + nums[1] == 2 + 7 == 9, so output is 0 1.',
      },
      {
        input: '3\n3 2 4\n6',
        output: '1 2',
        explanation: 'nums[1] + nums[2] == 2 + 4 == 6, so output is 1 2.',
      },
    ],
    starter_code: {
      python: `import sys

def two_sum():
    lines = sys.stdin.read().split()
    if not lines:
        return
    n = int(lines[0])
    nums = [int(x) for x in lines[1:n+1]]
    target = int(lines[n+1])
    
    # Write your solution here
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            print(f"{seen[complement]} {i}")
            return
        seen[num] = i

if __name__ == '__main__':
    two_sum()
`,
      javascript: `const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let tokens = [];
rl.on('line', (line) => {
  tokens.push(...line.trim().split(/\\s+/));
});

rl.on('close', () => {
  if (tokens.length === 0) return;
  const n = parseInt(tokens[0], 10);
  const nums = tokens.slice(1, n + 1).map(Number);
  const target = parseInt(tokens[n + 1], 10);
  
  // Write your solution here
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      console.log(\`\${map.get(complement)} \${i}\`);
      return;
    }
    map.set(nums[i], i);
  }
});
`,
      c: `/* C Solution for Two Sum */
#include <stdio.h>
#include <stdlib.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    
    int* nums = (int*)malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) {
        scanf("%d", &nums[i]);
    }
    int target;
    scanf("%d", &target);
    
    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
            if (nums[i] + nums[j] == target) {
                printf("%d %d\\n", i, j);
                free(nums);
                return 0;
            }
        }
    }
    free(nums);
    return 0;
}
`,
      cpp: `// C++17 Solution for Two Sum
#include <iostream>
#include <vector>
#include <unordered_map>

using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    int target;
    cin >> target;
    
    unordered_map<int, int> seen;
    for (int i = 0; i < n; i++) {
        int complement = target - nums[i];
        if (seen.find(complement) != seen.end()) {
            cout << seen[complement] << " " << i << "\\n";
            return 0;
        }
        seen[nums[i]] = i;
    }
    return 0;
}
`,
      java: `// Java Solution for Two Sum
import java.util.Scanner;
import java.util.HashMap;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) {
            nums[i] = sc.nextInt();
        }
        int target = sc.nextInt();
        
        HashMap<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < n; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                System.out.println(map.get(complement) + " " + i);
                return;
            }
            map.put(nums[i], i);
        }
    }
}
`,
    },
    supported_languages: ['python', 'javascript', 'c', 'cpp', 'java'],
    tags: ['array', 'hash-table', 'easy', 'two-pointers'],
    hints: [
      'A naive approach checks every pair (O(N^2)), but can we use additional memory to do this in O(N)?',
      'As you iterate through the array, what information do you need to check if the current element completes a pair?',
      'Use a hash map where keys are the numbers and values are their corresponding indices. For each number x, look up target - x.',
    ],
    created_at: new Date('2026-01-10T09:00:00Z').toISOString(),
    updated_at: new Date('2026-03-15T10:00:00Z').toISOString(),
  },
  {
    id: 'prob_reverse_string',
    title: 'Reverse a Character Sequence',
    slug: 'reverse-string',
    description: `Write a program that takes an input string and prints it in reversed order.

This is a fundamental B.Tech first-year programming exercise designed to test standard I/O and string traversal in your chosen language.`,
    difficulty: 'BEGINNER',
    topic: 'Strings & Fundamentals',
    constraints: [
      '1 <= string length <= 1000',
      'The string consists of printable ASCII characters without newline.',
    ],
    input_format: 'A single line containing the string to reverse.',
    output_format: 'The reversed string.',
    examples: [
      {
        input: 'hello',
        output: 'olleh',
        explanation: 'Reversing "hello" produces "olleh".',
      },
      {
        input: 'BTechAI',
        output: 'IAhcETB',
        explanation: 'Reversing "BTechAI" yields "IAhcETB".',
      },
    ],
    starter_code: {
      python: `import sys

def reverse_string():
    s = sys.stdin.read().strip()
    # Write your solution here
    print(s[::-1])

if __name__ == '__main__':
    reverse_string()
`,
      javascript: `const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

rl.on('line', (line) => {
  console.log(line.trim().split('').reverse().join(''));
});
`,
      c: `#include <stdio.h>
#include <string.h>

int main() {
    char str[1005];
    if (scanf("%1000s", str) == 1) {
        int len = strlen(str);
        for (int i = len - 1; i >= 0; i--) {
            putchar(str[i]);
        }
        putchar('\\n');
    }
    return 0;
}
`,
      cpp: `#include <iostream>
#include <string>
#include <algorithm>

using namespace std;

int main() {
    string s;
    if (cin >> s) {
        reverse(s.begin(), s.end());
        cout << s << "\\n";
    }
    return 0;
}
`,
      java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNext()) {
            String s = sc.next();
            StringBuilder sb = new StringBuilder(s);
            System.out.println(sb.reverse().toString());
        }
    }
}
`,
    },
    supported_languages: ['python', 'javascript', 'c', 'cpp', 'java'],
    tags: ['string', 'beginner', 'io'],
    hints: [
      'Can you iterate from the last index down to 0?',
      'Consider using built-in two-pointer swaps or string builder methods.',
    ],
    created_at: new Date('2026-01-12T09:00:00Z').toISOString(),
    updated_at: new Date('2026-03-12T10:00:00Z').toISOString(),
  },
  {
    id: 'prob_valid_parentheses',
    title: 'Balanced Parentheses & Brackets',
    slug: 'valid-parentheses',
    description: `Given a string \`s\` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.

Print \`true\` if the string is valid, or \`false\` otherwise.`,
    difficulty: 'EASY',
    topic: 'Stacks & Queues',
    constraints: [
      '1 <= s.length <= 10^4',
      's consists of parentheses only: ()[]{}',
    ],
    input_format: 'A single string of brackets.',
    output_format: 'true or false',
    examples: [
      {
        input: '()[]{}',
        output: 'true',
        explanation: 'All brackets match in correct nesting.',
      },
      {
        input: '(]',
        output: 'false',
        explanation: 'Round bracket cannot be closed by square bracket.',
      },
    ],
    starter_code: {
      python: `import sys

def is_valid():
    s = sys.stdin.read().strip()
    stack = []
    mapping = {')': '(', '}': '{', ']': '['}
    for char in s:
        if char in mapping:
            top = stack.pop() if stack else '#'
            if mapping[char] != top:
                print("false")
                return
        else:
            stack.append(char)
    print("true" if not stack else "false")

if __name__ == '__main__':
    is_valid()
`,
      javascript: `const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

rl.on('line', (line) => {
  const s = line.trim();
  const stack = [];
  const map = { ')': '(', '}': '{', ']': '[' };
  let valid = true;
  for (const char of s) {
    if (map[char]) {
      const top = stack.pop() || '#';
      if (map[char] !== top) { valid = false; break; }
    } else {
      stack.push(char);
    }
  }
  console.log(valid && stack.length === 0 ? 'true' : 'false');
});
`,
      c: `#include <stdio.h>
#include <stdbool.h>
#include <string.h>

int main() {
    char s[10005];
    if (scanf("%10000s", s) != 1) return 0;
    char stack[10005];
    int top = -1;
    bool valid = true;
    for (int i = 0; s[i] != '\\0'; i++) {
        char c = s[i];
        if (c == '(' || c == '{' || c == '[') {
            stack[++top] = c;
        } else {
            if (top == -1) { valid = false; break; }
            char open = stack[top--];
            if ((c == ')' && open != '(') ||
                (c == '}' && open != '{') ||
                (c == ']' && open != '[')) {
                valid = false; break;
            }
        }
    }
    if (valid && top == -1) printf("true\\n");
    else printf("false\\n");
    return 0;
}
`,
      cpp: `#include <iostream>
#include <string>
#include <stack>

using namespace std;

int main() {
    string s;
    if (!(cin >> s)) return 0;
    stack<char> st;
    bool valid = true;
    for (char c : s) {
        if (c == '(' || c == '{' || c == '[') st.push(c);
        else {
            if (st.empty()) { valid = false; break; }
            char top = st.top(); st.pop();
            if ((c == ')' && top != '(') || (c == '}' && top != '{') || (c == ']' && top != '[')) {
                valid = false; break;
            }
        }
    }
    cout << (valid && st.empty() ? "true" : "false") << "\\n";
    return 0;
}
`,
      java: `import java.util.Scanner;
import java.util.Stack;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNext()) return;
        String s = sc.next();
        Stack<Character> stack = new Stack<>();
        boolean valid = true;
        for (char c : s.toCharArray()) {
            if (c == '(' || c == '{' || c == '[') stack.push(c);
            else {
                if (stack.isEmpty()) { valid = false; break; }
                char top = stack.pop();
                if ((c == ')' && top != '(') || (c == '}' && top != '{') || (c == ']' && top != '[')) {
                    valid = false; break;
                }
            }
        }
        System.out.println(valid && stack.isEmpty() ? "true" : "false");
    }
}
`,
    },
    supported_languages: ['python', 'javascript', 'c', 'cpp', 'java'],
    tags: ['stack', 'brackets', 'easy'],
    hints: [
      'Think about what data structure naturally operates in Last-In First-Out (LIFO) order.',
      'Push opening brackets onto a stack. When a closing bracket arrives, verify that the top element is its matching opening bracket.',
      'Remember to check if the stack is completely empty after processing all characters.',
    ],
    created_at: new Date('2026-01-15T09:00:00Z').toISOString(),
    updated_at: new Date('2026-03-18T10:00:00Z').toISOString(),
  },
  {
    id: 'prob_knapsack_01',
    title: '0/1 Knapsack Problem',
    slug: 'knapsack-01',
    description: `Given \`N\` items, each with a specific weight and value, determine the maximum value that can be put into a knapsack of capacity \`W\`.

In the 0/1 Knapsack problem, you either take an item completely or leave it (fractional items are not allowed).

Compute the maximum total value achievable without exceeding the capacity $W$.`,
    difficulty: 'HARD',
    topic: 'Dynamic Programming',
    constraints: [
      '1 <= N <= 100',
      '1 <= W <= 1000',
      '1 <= weights[i] <= W',
      '1 <= values[i] <= 10^4',
    ],
    input_format: 'First line: N W (number of items and knapsack capacity).\nSecond line: N integers representing values of items.\nThird line: N integers representing weights of items.',
    output_format: 'A single integer: the maximum value possible.',
    examples: [
      {
        input: '3 50\n60 100 120\n10 20 30',
        output: '220',
        explanation: 'Pick item 2 (value 100, weight 20) and item 3 (value 120, weight 30). Total weight = 50, total value = 220.',
      },
      {
        input: '3 4\n1 2 3\n4 5 1',
        output: '3',
        explanation: 'Pick item 3 (weight 1, value 3). Capacity allows max value 3.',
      },
    ],
    starter_code: {
      python: `import sys

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    w = int(tokens[1])
    values = [int(x) for x in tokens[2:2+n]]
    weights = [int(x) for x in tokens[2+n:2+2*n]]
    
    # dp[j] represents max value for capacity j
    dp = [0] * (w + 1)
    for i in range(n):
        for j in range(w, weights[i] - 1, -1):
            dp[j] = max(dp[j], dp[j - weights[i]] + values[i])
            
    print(dp[w])

if __name__ == '__main__':
    solve()
`,
      javascript: `const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
let tokens = [];

rl.on('line', (line) => tokens.push(...line.trim().split(/\\s+/)));
rl.on('close', () => {
  if (tokens.length === 0) return;
  const n = parseInt(tokens[0], 10);
  const w = parseInt(tokens[1], 10);
  const values = tokens.slice(2, 2 + n).map(Number);
  const weights = tokens.slice(2 + n, 2 + 2 * n).map(Number);
  
  const dp = new Array(w + 1).fill(0);
  for (let i = 0; i < n; i++) {
    for (let j = w; j >= weights[i]; j--) {
      dp[j] = Math.max(dp[j], dp[j - weights[i]] + values[i]);
    }
  }
  console.log(dp[w]);
});
`,
      c: `#include <stdio.h>
#define MAX(a, b) ((a) > (b) ? (a) : (b))

int main() {
    int n, w;
    if (scanf("%d %d", &n, &w) != 2) return 0;
    int values[105], weights[105];
    for (int i = 0; i < n; i++) scanf("%d", &values[i]);
    for (int i = 0; i < n; i++) scanf("%d", &weights[i]);
    
    int dp[1005] = {0};
    for (int i = 0; i < n; i++) {
        for (int j = w; j >= weights[i]; j--) {
            dp[j] = MAX(dp[j], dp[j - weights[i]] + values[i]);
        }
    }
    printf("%d\\n", dp[w]);
    return 0;
}
`,
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

int main() {
    int n, w;
    if (!(cin >> n >> w)) return 0;
    vector<int> values(n), weights(n);
    for (int i = 0; i < n; i++) cin >> values[i];
    for (int i = 0; i < n; i++) cin >> weights[i];
    
    vector<int> dp(w + 1, 0);
    for (int i = 0; i < n; i++) {
        for (int j = w; j >= weights[i]; j--) {
            dp[j] = max(dp[j], dp[j - weights[i]] + values[i]);
        }
    }
    cout << dp[w] << "\\n";
    return 0;
}
`,
      java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int w = sc.nextInt();
        int[] values = new int[n];
        for (int i = 0; i < n; i++) values[i] = sc.nextInt();
        int[] weights = new int[n];
        for (int i = 0; i < n; i++) weights[i] = sc.nextInt();
        
        int[] dp = new int[w + 1];
        for (int i = 0; i < n; i++) {
            for (int j = w; j >= weights[i]; j--) {
                dp[j] = Math.max(dp[j], dp[j - weights[i]] + values[i]);
            }
        }
        System.out.println(dp[w]);
    }
}
`,
    },
    supported_languages: ['python', 'javascript', 'c', 'cpp', 'java'],
    tags: ['dynamic-programming', 'knapsack', 'hard', 'btech-curriculum'],
    hints: [
      'Formulate the state transition: dp[i][w] = max(dp[i-1][w], dp[i-1][w - weight[i]] + value[i]).',
      'Notice that each row i only depends on the previous row i-1. Can you optimize space to a 1D array of size W + 1?',
      'If iterating backwards from W down to weight[i], you prevent using the current item more than once in the same iteration.',
    ],
    created_at: new Date('2026-01-20T09:00:00Z').toISOString(),
    updated_at: new Date('2026-03-20T10:00:00Z').toISOString(),
  },
];

export const seedTestCases: Record<string, CodingTestCase[]> = {
  prob_two_sum: [
    {
      id: 'tc_ts_pub_1',
      problem_id: 'prob_two_sum',
      input: '4\n2 7 11 15\n9',
      expected_output: '0 1',
      is_hidden: false,
      explanation: 'First test case from example',
      created_at: new Date().toISOString(),
    },
    {
      id: 'tc_ts_pub_2',
      problem_id: 'prob_two_sum',
      input: '3\n3 2 4\n6',
      expected_output: '1 2',
      is_hidden: false,
      explanation: 'Second test case from example',
      created_at: new Date().toISOString(),
    },
    {
      id: 'tc_ts_hid_1',
      problem_id: 'prob_two_sum',
      input: '2\n3 3\n6',
      expected_output: '0 1',
      is_hidden: true,
      explanation: 'Hidden: Two identical numbers summing to target',
      created_at: new Date().toISOString(),
    },
    {
      id: 'tc_ts_hid_2',
      problem_id: 'prob_two_sum',
      input: '5\n-1 -2 -3 -4 -5\n-8',
      expected_output: '2 4',
      is_hidden: true,
      explanation: 'Hidden: Negative numbers test',
      created_at: new Date().toISOString(),
    },
  ],
  prob_reverse_string: [
    {
      id: 'tc_rev_pub_1',
      problem_id: 'prob_reverse_string',
      input: 'hello',
      expected_output: 'olleh',
      is_hidden: false,
      explanation: 'Standard lowercase word',
      created_at: new Date().toISOString(),
    },
    {
      id: 'tc_rev_pub_2',
      problem_id: 'prob_reverse_string',
      input: 'BTechAI',
      expected_output: 'IAhcETB',
      is_hidden: false,
      explanation: 'Mixed case word',
      created_at: new Date().toISOString(),
    },
    {
      id: 'tc_rev_hid_1',
      problem_id: 'prob_reverse_string',
      input: 'racecar',
      expected_output: 'racecar',
      is_hidden: true,
      explanation: 'Hidden: Palindrome string',
      created_at: new Date().toISOString(),
    },
    {
      id: 'tc_rev_hid_2',
      problem_id: 'prob_reverse_string',
      input: '1234567890',
      expected_output: '0987654321',
      is_hidden: true,
      explanation: 'Hidden: Numerical string',
      created_at: new Date().toISOString(),
    },
  ],
  prob_valid_parentheses: [
    {
      id: 'tc_vp_pub_1',
      problem_id: 'prob_valid_parentheses',
      input: '()[]{}',
      expected_output: 'true',
      is_hidden: false,
      explanation: 'Valid consecutive pairs',
      created_at: new Date().toISOString(),
    },
    {
      id: 'tc_vp_pub_2',
      problem_id: 'prob_valid_parentheses',
      input: '(]',
      expected_output: 'false',
      is_hidden: false,
      explanation: 'Mismatched types',
      created_at: new Date().toISOString(),
    },
    {
      id: 'tc_vp_hid_1',
      problem_id: 'prob_valid_parentheses',
      input: '([{}])',
      expected_output: 'true',
      is_hidden: true,
      explanation: 'Hidden: Deeply nested matching brackets',
      created_at: new Date().toISOString(),
    },
    {
      id: 'tc_vp_hid_2',
      problem_id: 'prob_valid_parentheses',
      input: '(((',
      expected_output: 'false',
      is_hidden: true,
      explanation: 'Hidden: Unclosed open brackets',
      created_at: new Date().toISOString(),
    },
  ],
  prob_knapsack_01: [
    {
      id: 'tc_ks_pub_1',
      problem_id: 'prob_knapsack_01',
      input: '3 50\n60 100 120\n10 20 30',
      expected_output: '220',
      is_hidden: false,
      explanation: 'Standard knapsack example',
      created_at: new Date().toISOString(),
    },
    {
      id: 'tc_ks_pub_2',
      problem_id: 'prob_knapsack_01',
      input: '3 4\n1 2 3\n4 5 1',
      expected_output: '3',
      is_hidden: false,
      explanation: 'Small capacity selection',
      created_at: new Date().toISOString(),
    },
    {
      id: 'tc_ks_hid_1',
      problem_id: 'prob_knapsack_01',
      input: '4 10\n10 40 30 50\n5 4 6 3',
      expected_output: '90',
      is_hidden: true,
      explanation: 'Hidden: Optimal combination items 2 and 4',
      created_at: new Date().toISOString(),
    },
    {
      id: 'tc_ks_hid_2',
      problem_id: 'prob_knapsack_01',
      input: '1 5\n10\n10',
      expected_output: '0',
      is_hidden: true,
      explanation: 'Hidden: Item weight exceeds knapsack capacity',
      created_at: new Date().toISOString(),
    },
  ],
};
