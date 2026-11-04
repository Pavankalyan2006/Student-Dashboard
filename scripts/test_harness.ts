import { SandboxService } from '../server/execution/sandbox';

async function testWrapper() {
  const studentCode = `
class Solution:
    def twoSum(self, nums, target):
        d = {}
        for i, n in enumerate(nums):
            if target - n in d:
                return [d[target - n], i]
            d[n] = i
        return []
`;

  const harness = `
import sys, json

lines = sys.stdin.read().strip().split('\\n')
if lines and lines[0]:
    nums = json.loads(lines[0])
    target = int(lines[1])
    res = Solution().twoSum(nums, target)
    print(json.dumps(res))
`;

  const fullCode = studentCode + '\n' + harness;
  const exec = await SandboxService.execute({
    language: 'python',
    sourceCode: fullCode,
    stdin: '[2, 7, 11, 15]\n9',
  });

  console.log('Test harness result:', exec);
}

testWrapper().catch(console.error);
