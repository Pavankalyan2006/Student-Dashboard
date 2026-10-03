import { CodingLanguage, LanguageConfig } from '../models/types';

export class LanguageRegistry {
  private static configs: Map<CodingLanguage, LanguageConfig> = new Map();

  static {
    // 1. Python 3
    this.register({
      id: 'python',
      display_name: 'Python 3',
      file_extension: '.py',
      run_command: 'python -u {{file}}',
      version_command: 'python --version',
      timeout: 5000,
      memory_limit_mb: 128,
      enabled: true,
      boilerplate: `# Python 3 Solution
import sys

def solve():
    # Read standard input
    input_data = sys.stdin.read().split()
    if not input_data:
        print("Hello, Coding Lab!")
        return
    print(f"Processed: {input_data}")

if __name__ == "__main__":
    solve()
`,
    });

    // 2. JavaScript (Node.js)
    this.register({
      id: 'javascript',
      display_name: 'JavaScript (Node.js)',
      file_extension: '.js',
      run_command: 'node {{file}}',
      version_command: 'node --version',
      timeout: 5000,
      memory_limit_mb: 128,
      enabled: true,
      boilerplate: `// JavaScript (Node.js) Solution
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

let input = [];
rl.on('line', (line) => {
  input.push(line);
});

rl.on('close', () => {
  if (input.length === 0) {
    console.log("Hello, Coding Lab!");
  } else {
    console.log("Input received:", input.join(' '));
  }
});
`,
    });

    // 3. C (C11)
    this.register({
      id: 'c',
      display_name: 'C (GCC)',
      file_extension: '.c',
      compiler_command: 'gcc -O2 -std=c11 {{file}} -o {{output}} -lm',
      run_command: '{{output}}',
      version_command: 'gcc --version',
      timeout: 5000,
      memory_limit_mb: 128,
      enabled: true,
      boilerplate: `/* C (C11) Solution */
#include <stdio.h>
#include <stdlib.h>

int main() {
    int num;
    if (scanf("%d", &num) == 1) {
        printf("Received: %d\\n", num);
    } else {
        printf("Hello, Coding Lab!\\n");
    }
    return 0;
}
`,
    });

    // 4. C++ (C++17)
    this.register({
      id: 'cpp',
      display_name: 'C++ (G++ 17)',
      file_extension: '.cpp',
      compiler_command: 'g++ -O2 -std=c++17 {{file}} -o {{output}}',
      run_command: '{{output}}',
      version_command: 'g++ --version',
      timeout: 5000,
      memory_limit_mb: 128,
      enabled: true,
      boilerplate: `// C++17 Solution
#include <iostream>
#include <vector>
#include <string>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    string word;
    if (cin >> word) {
        cout << "Received: " << word << "\\n";
    } else {
        cout << "Hello, Coding Lab!" << "\\n";
    }
    return 0;
}
`,
    });

    // 5. Java (OpenJDK 17/21)
    this.register({
      id: 'java',
      display_name: 'Java (OpenJDK)',
      file_extension: '.java',
      compiler_command: 'javac {{file}}',
      run_command: 'java -cp {{dir}} Main',
      version_command: 'java -version',
      timeout: 7000,
      memory_limit_mb: 256,
      enabled: true,
      boilerplate: `// Java Solution
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNext()) {
            String token = sc.next();
            System.out.println("Received: " + token);
        } else {
            System.out.println("Hello, Coding Lab!");
        }
        sc.close();
    }
}
`,
    });
  }

  public static register(config: LanguageConfig): void {
    this.configs.set(config.id, config);
  }

  public static get(id: string): LanguageConfig | undefined {
    const normalized = id.toLowerCase().trim() as CodingLanguage;
    if (normalized === 'py' as any) return this.configs.get('python');
    if (normalized === 'js' as any || normalized === 'node' as any) return this.configs.get('javascript');
    if (normalized === 'c++' as any) return this.configs.get('cpp');
    return this.configs.get(normalized);
  }

  public static getAll(): LanguageConfig[] {
    return Array.from(this.configs.values());
  }

  public static isSupported(id: string): boolean {
    return this.get(id) !== undefined;
  }
}
