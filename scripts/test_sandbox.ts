import { SandboxService } from '../server/execution/sandbox';

async function testSandbox() {
  console.log('Testing Python sandbox...');
  const pyRes = await SandboxService.execute({
    language: 'python',
    sourceCode: 'import sys\nline = sys.stdin.read().strip()\nprint(f"Echo: {line}")',
    stdin: 'Hello World',
  });
  console.log('Python result:', pyRes);

  console.log('Testing JS sandbox...');
  const jsRes = await SandboxService.execute({
    language: 'javascript',
    sourceCode: 'const fs = require("fs"); const input = fs.readFileSync(0, "utf-8").trim(); console.log("Echo: " + input);',
    stdin: 'Hello JS',
  });
  console.log('JS result:', jsRes);
}

testSandbox().catch(console.error);
