import * as React from 'react';
import { Code2, Play, Sparkles } from 'lucide-react';
import { PageContainer, PageHeader } from '../components/layout/PageComponents';
import { CodeEditor } from '../components/code/CodeEditor';
import { ResizableWorkspace } from '../components/workspace/ResizableWorkspace';
import { Button } from '../components/ui/button';
import { MarkdownContent } from '../components/content/MarkdownContent';

export function CodingLabPage() {
  const [code, setCode] = React.useState(
`// B.Tech Coding Lab - Asymptotic Performance Test
// Language: TypeScript / Algorithm: QuickSort

function quickSort(arr: number[]): number[] {
  if (arr.length <= 1) return arr;
  const pivot = arr[Math.floor(arr.length / 2)];
  const left = arr.filter(x => x < pivot);
  const middle = arr.filter(x => x === pivot);
  const right = arr.filter(x => x > pivot);
  return [...quickSort(left), ...middle, ...quickSort(right)];
}

const sampleData = [64, 34, 25, 12, 22, 11, 90];
console.log("Sorted Array:", quickSort(sampleData));
`
  );

  const problemExplanation = `
### QuickSort Analysis & Invariants

**Divide & Conquer Strategy:**
- **Best / Average Time Complexity:** $\\mathcal{O}(n \\log n)$
- **Worst Case Time Complexity:** $\\mathcal{O}(n^2)$ (when pivot is poorly partitioned)
- **Auxiliary Space:** $\\mathcal{O}(\\log n)$ recursion stack depth

In Phase 7 (Coding Lab), this workspace will execute code against sandboxed test runners and provide step-by-step AI debugging telemetry.
  `;

  return (
    <PageContainer>
      <PageHeader
        title="B.Tech Coding Lab"
        description="Interactive coding environment with dual-panel AI explanation and algorithm verification."
        badge={
          <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
            Phase 7 Foundation
          </span>
        }
      />

      <div className="h-[600px] w-full">
        <ResizableWorkspace
          leftPanel={
            <div className="h-full p-4 flex flex-col justify-between bg-white overflow-y-auto">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-900">
                  <Sparkles className="h-4 w-4 text-indigo-600" />
                  <span>Problem Specification &amp; KaTeX Mathematics</span>
                </div>
                <MarkdownContent content={problemExplanation} />
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Resizable Workspace Active</span>
                <span className="font-mono text-[11px]">Panel Split: 50/50</span>
              </div>
            </div>
          }
          rightPanel={
            <div className="h-full p-3 bg-slate-900">
              <CodeEditor
                value={code}
                onChange={setCode}
                language="typescript"
                filename="quicksort_lab.ts"
                className="h-full border-none"
              />
            </div>
          }
        />
      </div>
    </PageContainer>
  );
}
