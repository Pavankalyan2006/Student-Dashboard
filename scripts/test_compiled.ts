import { SandboxService } from '../server/execution/sandbox';

async function testCompiled() {
  console.log('Testing C++...');
  const cppRes = await SandboxService.execute({
    language: 'cpp',
    sourceCode: '#include <iostream>\nusing namespace std;\nint main() { cout << "Hello C++" << endl; return 0; }',
  });
  console.log('C++ result:', cppRes.status, cppRes.stdout, cppRes.stderr);

  console.log('Testing Java...');
  const javaRes = await SandboxService.execute({
    language: 'java',
    sourceCode: 'public class Main { public static void main(String[] args) { System.out.println("Hello Java"); } }',
  });
  console.log('Java result:', javaRes.status, javaRes.stdout, javaRes.stderr);
}

testCompiled().catch(console.error);
