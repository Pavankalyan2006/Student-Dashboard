import { VisualizationStep, VisualizationType } from '../models/dsaTypes';

// Helper to clone state
const clone = <T>(val: T): T => JSON.parse(JSON.stringify(val));

export class DSAStepGenerators {
  /**
   * 1. Binary Search Generator (Deterministic)
   */
  public static generateBinarySearch(
    arrInput: number[] = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91],
    targetInput: number = 23
  ): VisualizationStep[] {
    const arr = [...arrInput].sort((a, b) => a - b);
    const target = Number(targetInput);
    const steps: VisualizationStep[] = [];
    let stepNum = 1;

    steps.push({
      step_number: stepNum++,
      title: 'Initialize Range',
      description: `Starting Binary Search for target ${target} across sorted array of ${arr.length} elements. Setting low = 0 and high = ${arr.length - 1}.`,
      state: clone(arr),
      highlighted_elements: [0, arr.length - 1],
      pointers: { low: 0, high: arr.length - 1 },
      variables: { target, low: 0, high: arr.length - 1 },
      code_line: 1,
      complexity_info: { time: 'O(log N)', space: 'O(1)' },
    });

    let low = 0;
    let high = arr.length - 1;
    let found = false;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const midVal = arr[mid];

      steps.push({
        step_number: stepNum++,
        title: 'Calculate Midpoint',
        description: `Midpoint calculated at index ${mid} (value ${midVal}) using floor((low + high) / 2).`,
        state: clone(arr),
        highlighted_elements: [mid],
        pointers: { low, high, mid },
        variables: { target, low, high, mid, midVal },
        code_line: 4,
        complexity_info: { time: 'O(log N)', space: 'O(1)' },
      });

      steps.push({
        step_number: stepNum++,
        title: 'Compare with Target',
        description: `Comparing arr[mid] (${midVal}) with target (${target}).`,
        state: clone(arr),
        highlighted_elements: [mid],
        comparisons: [midVal, target],
        pointers: { low, high, mid },
        variables: { target, low, high, mid, midVal },
        code_line: 5,
        complexity_info: { time: 'O(log N)', space: 'O(1)' },
      });

      if (midVal === target) {
        steps.push({
          step_number: stepNum++,
          title: 'Target Found!',
          description: `Success! Target ${target} found at index ${mid}. Returning index ${mid}.`,
          state: clone(arr),
          highlighted_elements: [mid],
          pointers: { low, high, mid },
          variables: { target, resultIndex: mid, status: 'FOUND' },
          code_line: 6,
          complexity_info: { time: 'O(1) best case', space: 'O(1)' },
        });
        found = true;
        break;
      } else if (midVal < target) {
        steps.push({
          step_number: stepNum++,
          title: 'Search Right Half',
          description: `${midVal} < ${target}: Target must lie in the right subarray. Adjusting low = ${mid + 1}.`,
          state: clone(arr),
          highlighted_elements: [mid],
          pointers: { low: mid + 1, high },
          variables: { target, low: mid + 1, high },
          code_line: 8,
          complexity_info: { time: 'O(log N)', space: 'O(1)' },
        });
        low = mid + 1;
      } else {
        steps.push({
          step_number: stepNum++,
          title: 'Search Left Half',
          description: `${midVal} > ${target}: Target must lie in the left subarray. Adjusting high = ${mid - 1}.`,
          state: clone(arr),
          highlighted_elements: [mid],
          pointers: { low, high: mid - 1 },
          variables: { target, low, high: mid - 1 },
          code_line: 10,
          complexity_info: { time: 'O(log N)', space: 'O(1)' },
        });
        high = mid - 1;
      }
    }

    if (!found) {
      steps.push({
        step_number: stepNum++,
        title: 'Target Not Found',
        description: `Search space exhausted (low > high). Target ${target} does not exist in array. Returning -1.`,
        state: clone(arr),
        pointers: { low, high },
        variables: { target, resultIndex: -1, status: 'NOT_FOUND' },
        code_line: 12,
        complexity_info: { time: 'O(log N)', space: 'O(1)' },
      });
    }

    return steps;
  }

  /**
   * 2. Linear Search Generator
   */
  public static generateLinearSearch(
    arrInput: number[] = [14, 33, 27, 10, 35, 19, 42, 44],
    targetInput: number = 35
  ): VisualizationStep[] {
    const arr = [...arrInput];
    const target = Number(targetInput);
    const steps: VisualizationStep[] = [];
    let stepNum = 1;

    steps.push({
      step_number: stepNum++,
      title: 'Initialize Linear Search',
      description: `Searching sequentially for target ${target} from index 0 through index ${arr.length - 1}.`,
      state: clone(arr),
      pointers: { i: 0 },
      variables: { target, index: 0 },
      code_line: 1,
      complexity_info: { time: 'O(N)', space: 'O(1)' },
    });

    let foundIndex = -1;
    for (let i = 0; i < arr.length; i++) {
      steps.push({
        step_number: stepNum++,
        title: `Inspect Index ${i}`,
        description: `Examining element at index ${i}: value is ${arr[i]}.`,
        state: clone(arr),
        highlighted_elements: [i],
        comparisons: [arr[i], target],
        pointers: { i },
        variables: { currentIndex: i, currentValue: arr[i], target },
        code_line: 3,
        complexity_info: { time: 'O(N)', space: 'O(1)' },
      });

      if (arr[i] === target) {
        steps.push({
          step_number: stepNum++,
          title: 'Target Found',
          description: `Target ${target} matches element at index ${i}. Search terminates successfully.`,
          state: clone(arr),
          highlighted_elements: [i],
          pointers: { i },
          variables: { result: i, status: 'MATCH' },
          code_line: 4,
          complexity_info: { time: 'O(1) best case', space: 'O(1)' },
        });
        foundIndex = i;
        break;
      }
    }

    if (foundIndex === -1) {
      steps.push({
        step_number: stepNum++,
        title: 'Target Absent',
        description: `Full array traversed. Target ${target} is not in the array. Returning -1.`,
        state: clone(arr),
        variables: { result: -1 },
        code_line: 6,
        complexity_info: { time: 'O(N)', space: 'O(1)' },
      });
    }

    return steps;
  }

  /**
   * 3. Bubble Sort Generator
   */
  public static generateBubbleSort(arrInput: number[] = [64, 34, 25, 12, 22, 11, 90]): VisualizationStep[] {
    const arr = [...arrInput];
    const n = arr.length;
    const steps: VisualizationStep[] = [];
    let stepNum = 1;

    steps.push({
      step_number: stepNum++,
      title: 'Initial Array',
      description: `Starting Bubble Sort with ${n} elements. In each pass, adjacent elements are compared and swapped if inverted.`,
      state: clone(arr),
      code_line: 1,
      complexity_info: { time: 'O(N^2)', space: 'O(1)' },
    });

    for (let i = 0; i < n - 1; i++) {
      let swapped = false;
      for (let j = 0; j < n - i - 1; j++) {
        steps.push({
          step_number: stepNum++,
          title: `Compare Elements (Pass ${i + 1})`,
          description: `Comparing adjacent elements at index ${j} (${arr[j]}) and index ${j + 1} (${arr[j + 1]}).`,
          state: clone(arr),
          highlighted_elements: [j, j + 1],
          comparisons: [arr[j], arr[j + 1]],
          pointers: { j, 'j+1': j + 1 },
          code_line: 4,
          complexity_info: { time: 'O(N^2)', space: 'O(1)' },
        });

        if (arr[j] > arr[j + 1]) {
          const temp = arr[j];
          arr[j] = arr[j + 1];
          arr[j + 1] = temp;
          swapped = true;

          steps.push({
            step_number: stepNum++,
            title: `Swap Inverted Pair`,
            description: `${temp} > ${arr[j]}: Swapped ${temp} and ${arr[j]} at positions ${j} and ${j + 1}.`,
            state: clone(arr),
            highlighted_elements: [j, j + 1],
            swaps: [j, j + 1],
            pointers: { j, 'j+1': j + 1 },
            code_line: 5,
            complexity_info: { time: 'O(N^2)', space: 'O(1)' },
          });
        }
      }

      steps.push({
        step_number: stepNum++,
        title: `End of Pass ${i + 1}`,
        description: `Element ${arr[n - 1 - i]} is now permanently placed in its final sorted position at index ${n - 1 - i}.`,
        state: clone(arr),
        highlighted_elements: [n - 1 - i],
        code_line: 7,
        complexity_info: { time: 'O(N^2)', space: 'O(1)' },
      });

      if (!swapped) {
        steps.push({
          step_number: stepNum++,
          title: 'Early Exit Optimization',
          description: 'No swaps occurred during this entire pass. Array is already completely sorted!',
          state: clone(arr),
          code_line: 8,
          complexity_info: { time: 'O(N) best case', space: 'O(1)' },
        });
        break;
      }
    }

    steps.push({
      step_number: stepNum++,
      title: 'Array Sorted',
      description: 'Bubble Sort finished. The array is fully sorted in ascending order.',
      state: clone(arr),
      code_line: 10,
      complexity_info: { time: 'Completed in O(N^2) worst case', space: 'O(1)' },
    });

    return steps;
  }

  /**
   * 4. Selection Sort Generator
   */
  public static generateSelectionSort(arrInput: number[] = [29, 10, 14, 37, 13]): VisualizationStep[] {
    const arr = [...arrInput];
    const n = arr.length;
    const steps: VisualizationStep[] = [];
    let stepNum = 1;

    steps.push({
      step_number: stepNum++,
      title: 'Initialize Selection Sort',
      description: `Starting Selection Sort on ${n} items. In each pass, we locate the global minimum in the unsorted suffix and place it at index i.`,
      state: clone(arr),
      pointers: { i: 0 },
      code_line: 1,
      complexity_info: { time: 'O(N^2)', space: 'O(1)' },
    });

    for (let i = 0; i < n - 1; i++) {
      let minIdx = i;

      steps.push({
        step_number: stepNum++,
        title: `Pass ${i + 1}: Candidate Min`,
        description: `Assuming index ${i} (${arr[i]}) as minimum. Scanning indices ${i + 1} to ${n - 1} for smaller value.`,
        state: clone(arr),
        highlighted_elements: [i],
        pointers: { i, min: minIdx },
        code_line: 3,
        complexity_info: { time: 'O(N^2)', space: 'O(1)' },
      });

      for (let j = i + 1; j < n; j++) {
        if (arr[j] < arr[minIdx]) {
          minIdx = j;
          steps.push({
            step_number: stepNum++,
            title: `New Minimum Discovered`,
            description: `Found smaller value ${arr[minIdx]} at index ${minIdx}. Updating minimum index.`,
            state: clone(arr),
            highlighted_elements: [minIdx],
            pointers: { i, min: minIdx, j },
            code_line: 6,
            complexity_info: { time: 'O(N^2)', space: 'O(1)' },
          });
        }
      }

      if (minIdx !== i) {
        const temp = arr[i];
        arr[i] = arr[minIdx];
        arr[minIdx] = temp;

        steps.push({
          step_number: stepNum++,
          title: `Swap Minimum to Front`,
          description: `Swapped minimum element ${arr[i]} into sorted position index ${i} with ${temp}.`,
          state: clone(arr),
          highlighted_elements: [i, minIdx],
          swaps: [i, minIdx],
          pointers: { i, min: minIdx },
          code_line: 8,
          complexity_info: { time: 'O(N^2)', space: 'O(1)' },
        });
      }
    }

    steps.push({
      step_number: stepNum++,
      title: 'Selection Sort Complete',
      description: 'All passes complete. Array is completely sorted.',
      state: clone(arr),
      code_line: 10,
      complexity_info: { time: 'O(N^2)', space: 'O(1)' },
    });

    return steps;
  }

  /**
   * 5. Insertion Sort Generator
   */
  public static generateInsertionSort(arrInput: number[] = [12, 11, 13, 5, 6]): VisualizationStep[] {
    const arr = [...arrInput];
    const n = arr.length;
    const steps: VisualizationStep[] = [];
    let stepNum = 1;

    steps.push({
      step_number: stepNum++,
      title: 'Initialize Insertion Sort',
      description: `Starting Insertion Sort. Elements before index i are considered sorted; arr[i] is inserted into its proper place.`,
      state: clone(arr),
      code_line: 1,
      complexity_info: { time: 'O(N^2)', space: 'O(1)' },
    });

    for (let i = 1; i < n; i++) {
      const key = arr[i];
      let j = i - 1;

      steps.push({
        step_number: stepNum++,
        title: `Pick Element arr[${i}] = ${key}`,
        description: `Selecting key = ${key}. Comparing backwards into sorted prefix [0..${i - 1}].`,
        state: clone(arr),
        highlighted_elements: [i],
        pointers: { i, keyIndex: i },
        variables: { key },
        code_line: 3,
        complexity_info: { time: 'O(N^2)', space: 'O(1)' },
      });

      while (j >= 0 && arr[j] > key) {
        arr[j + 1] = arr[j];
        steps.push({
          step_number: stepNum++,
          title: `Shift Greater Element Right`,
          description: `${arr[j]} > ${key}: Shifting ${arr[j]} right from index ${j} to ${j + 1}.`,
          state: clone(arr),
          highlighted_elements: [j + 1],
          pointers: { keyPos: j + 1, j },
          variables: { key, shifted: arr[j] },
          code_line: 6,
          complexity_info: { time: 'O(N^2)', space: 'O(1)' },
        });
        j--;
      }
      arr[j + 1] = key;

      steps.push({
        step_number: stepNum++,
        title: `Insert Key at Position ${j + 1}`,
        description: `Inserted key ${key} at index ${j + 1}. Prefix [0..${i}] is now fully sorted.`,
        state: clone(arr),
        highlighted_elements: [j + 1],
        pointers: { inserted: j + 1 },
        variables: { key },
        code_line: 8,
        complexity_info: { time: 'O(N^2)', space: 'O(1)' },
      });
    }

    return steps;
  }

  /**
   * 6. Quick Sort Generator
   */
  public static generateQuickSort(arrInput: number[] = [10, 80, 30, 90, 40, 50, 70]): VisualizationStep[] {
    const arr = [...arrInput];
    const steps: VisualizationStep[] = [];
    let stepNum = 1;

    steps.push({
      step_number: stepNum++,
      title: 'Initialize Quick Sort',
      description: `Starting Divide & Conquer Quick Sort. Using Lomuto partition scheme with rightmost element as pivot.`,
      state: clone(arr),
      code_line: 1,
      complexity_info: { time: 'O(N log N) avg', space: 'O(log N)' },
    });

    const quickSortHelper = (low: number, high: number) => {
      if (low < high) {
        const pivot = arr[high];
        steps.push({
          step_number: stepNum++,
          title: `Choose Pivot arr[${high}] = ${pivot}`,
          description: `Partitioning subarray [${low}..${high}]. Pivot is ${pivot} at index ${high}.`,
          state: clone(arr),
          highlighted_elements: [high],
          pointers: { low, high, pivot: high },
          variables: { pivot, range: `[${low}..${high}]` },
          code_line: 3,
          complexity_info: { time: 'O(N log N)', space: 'O(log N)' },
        });

        let i = low - 1;
        for (let j = low; j < high; j++) {
          if (arr[j] < pivot) {
            i++;
            const tmp = arr[i];
            arr[i] = arr[j];
            arr[j] = tmp;

            steps.push({
              step_number: stepNum++,
              title: `Partition Swap (Element < Pivot)`,
              description: `${arr[i]} < ${pivot}: Swapped into left partition at index ${i}.`,
              state: clone(arr),
              highlighted_elements: [i, j],
              swaps: [i, j],
              pointers: { i, j, pivot: high },
              code_line: 6,
              complexity_info: { time: 'O(N log N)', space: 'O(log N)' },
            });
          }
        }

        const swapTmp = arr[i + 1];
        arr[i + 1] = arr[high];
        arr[high] = swapTmp;
        const pi = i + 1;

        steps.push({
          step_number: stepNum++,
          title: `Place Pivot in Final Position`,
          description: `Pivot ${arr[pi]} locked into index ${pi}. All elements to left are <= pivot, right are >= pivot.`,
          state: clone(arr),
          highlighted_elements: [pi],
          pointers: { pivotFinal: pi },
          code_line: 8,
          complexity_info: { time: 'O(N log N)', space: 'O(log N)' },
        });

        quickSortHelper(low, pi - 1);
        quickSortHelper(pi + 1, high);
      }
    };

    quickSortHelper(0, arr.length - 1);

    steps.push({
      step_number: stepNum++,
      title: 'Quick Sort Complete',
      description: 'All partitions resolved. Array is completely sorted.',
      state: clone(arr),
      code_line: 10,
      complexity_info: { time: 'O(N log N) avg', space: 'O(log N)' },
    });

    return steps;
  }

  /**
   * 7. Stack Operations Generator
   */
  public static generateStack(
    operations: { type: 'push' | 'pop' | 'peek'; value?: number }[] = [
      { type: 'push', value: 10 },
      { type: 'push', value: 20 },
      { type: 'push', value: 30 },
      { type: 'peek' },
      { type: 'pop' },
      { type: 'push', value: 40 },
    ]
  ): VisualizationStep[] {
    const stack: number[] = [];
    const steps: VisualizationStep[] = [];
    let stepNum = 1;

    steps.push({
      step_number: stepNum++,
      title: 'Initialize Empty Stack',
      description: 'Stack follows Last-In, First-Out (LIFO) order. Top pointer is currently null.',
      state: clone(stack),
      pointers: { top: -1 },
      code_line: 1,
      complexity_info: { time: 'O(1) per op', space: 'O(N)' },
    });

    for (const op of operations) {
      if (op.type === 'push' && op.value !== undefined) {
        stack.push(op.value);
        steps.push({
          step_number: stepNum++,
          title: `Push ${op.value}`,
          description: `Pushed value ${op.value} onto the top of the stack. New stack size is ${stack.length}.`,
          state: clone(stack),
          highlighted_elements: [stack.length - 1],
          pointers: { top: stack.length - 1 },
          variables: { pushedValue: op.value, size: stack.length },
          code_line: 3,
          complexity_info: { time: 'O(1)', space: 'O(N)' },
        });
      } else if (op.type === 'pop') {
        if (stack.length === 0) {
          steps.push({
            step_number: stepNum++,
            title: 'Stack Underflow',
            description: 'Cannot pop: stack is currently empty.',
            state: clone(stack),
            code_line: 5,
            complexity_info: { time: 'O(1)', space: 'O(N)' },
          });
        } else {
          const popped = stack.pop();
          steps.push({
            step_number: stepNum++,
            title: `Pop Element`,
            description: `Popped top element ${popped} from the stack. Top pointer points to index ${stack.length - 1}.`,
            state: clone(stack),
            pointers: { top: stack.length - 1 },
            variables: { poppedValue: popped, size: stack.length },
            code_line: 6,
            complexity_info: { time: 'O(1)', space: 'O(N)' },
          });
        }
      } else if (op.type === 'peek') {
        const topVal = stack[stack.length - 1];
        steps.push({
          step_number: stepNum++,
          title: 'Peek Top Element',
          description: `Inspecting top element without removing: value is ${topVal}.`,
          state: clone(stack),
          highlighted_elements: [stack.length - 1],
          pointers: { top: stack.length - 1 },
          variables: { peekValue: topVal },
          code_line: 8,
          complexity_info: { time: 'O(1)', space: 'O(N)' },
        });
      }
    }

    return steps;
  }

  /**
   * 8. Queue Operations Generator
   */
  public static generateQueue(
    operations: { type: 'enqueue' | 'dequeue' | 'peek'; value?: number }[] = [
      { type: 'enqueue', value: 10 },
      { type: 'enqueue', value: 20 },
      { type: 'enqueue', value: 30 },
      { type: 'peek' },
      { type: 'dequeue' },
      { type: 'enqueue', value: 40 },
    ]
  ): VisualizationStep[] {
    const queue: number[] = [];
    const steps: VisualizationStep[] = [];
    let stepNum = 1;

    steps.push({
      step_number: stepNum++,
      title: 'Initialize Empty Queue',
      description: 'Queue follows First-In, First-Out (FIFO) discipline. Elements are enqueued at REAR and dequeued from FRONT.',
      state: clone(queue),
      pointers: { front: -1, rear: -1 },
      code_line: 1,
      complexity_info: { time: 'O(1) per op', space: 'O(N)' },
    });

    for (const op of operations) {
      if (op.type === 'enqueue' && op.value !== undefined) {
        queue.push(op.value);
        steps.push({
          step_number: stepNum++,
          title: `Enqueue ${op.value}`,
          description: `Inserted ${op.value} at the REAR of the queue. Queue length is ${queue.length}.`,
          state: clone(queue),
          highlighted_elements: [queue.length - 1],
          pointers: { front: 0, rear: queue.length - 1 },
          variables: { enqueued: op.value, size: queue.length },
          code_line: 3,
          complexity_info: { time: 'O(1)', space: 'O(N)' },
        });
      } else if (op.type === 'dequeue') {
        if (queue.length === 0) {
          steps.push({
            step_number: stepNum++,
            title: 'Queue Underflow',
            description: 'Cannot dequeue from an empty queue.',
            state: clone(queue),
            code_line: 5,
            complexity_info: { time: 'O(1)', space: 'O(N)' },
          });
        } else {
          const removed = queue.shift();
          steps.push({
            step_number: stepNum++,
            title: `Dequeue Front Element`,
            description: `Removed ${removed} from the FRONT of the queue. Remaining items shift forward.`,
            state: clone(queue),
            pointers: { front: queue.length > 0 ? 0 : -1, rear: queue.length - 1 },
            variables: { dequeued: removed, size: queue.length },
            code_line: 6,
            complexity_info: { time: 'O(1)', space: 'O(N)' },
          });
        }
      } else if (op.type === 'peek') {
        steps.push({
          step_number: stepNum++,
          title: 'Peek Front',
          description: `Inspecting element at FRONT: value is ${queue[0]}.`,
          state: clone(queue),
          highlighted_elements: [0],
          pointers: { front: 0, rear: queue.length - 1 },
          variables: { frontValue: queue[0] },
          code_line: 8,
          complexity_info: { time: 'O(1)', space: 'O(N)' },
        });
      }
    }

    return steps;
  }

  /**
   * 9. Singly Linked List Traversal & Insertion
   */
  public static generateLinkedList(
    initialValues: number[] = [10, 20, 30, 40, 50],
    insertVal: number = 25
  ): VisualizationStep[] {
    const list = [...initialValues];
    const steps: VisualizationStep[] = [];
    let stepNum = 1;

    steps.push({
      step_number: stepNum++,
      title: 'Initial Linked List',
      description: `Linked List initialized with ${list.length} nodes: Head -> ${list.join(' -> ')} -> NULL.`,
      state: clone(list),
      pointers: { head: 0 },
      code_line: 1,
      complexity_info: { time: 'O(N) traversal', space: 'O(N)' },
    });

    for (let i = 0; i < list.length; i++) {
      steps.push({
        step_number: stepNum++,
        title: `Traverse Node ${i}`,
        description: `Pointer current is at Node with value ${list[i]}. Next points to ${i + 1 < list.length ? list[i + 1] : 'NULL'}.`,
        state: clone(list),
        highlighted_elements: [i],
        pointers: { current: i, next: i + 1 < list.length ? i + 1 : 'NULL' },
        variables: { currentNodeValue: list[i] },
        code_line: 3,
        complexity_info: { time: 'O(N)', space: 'O(1)' },
      });
    }

    // Insert new node after node 1 (value 20)
    const insertIdx = 2;
    list.splice(insertIdx, 0, insertVal);

    steps.push({
      step_number: stepNum++,
      title: `Insert Node ${insertVal}`,
      description: `Allocated new node ${insertVal}. Adjusting pointer of previous node to point to new node, and new node to next node.`,
      state: clone(list),
      highlighted_elements: [insertIdx],
      pointers: { newNode: insertIdx, prev: insertIdx - 1 },
      variables: { insertedValue: insertVal, position: insertIdx },
      code_line: 6,
      complexity_info: { time: 'O(1) given pointer', space: 'O(1)' },
    });

    return steps;
  }

  /**
   * 10. Binary Search Tree (BST) Generator
   */
  public static generateBST(
    initialNodes: number[] = [8, 3, 10, 1, 6, 14, 4, 7, 13],
    searchVal: number = 7
  ): VisualizationStep[] {
    const steps: VisualizationStep[] = [];
    let stepNum = 1;

    interface BSTNode {
      val: number;
      left?: BSTNode;
      right?: BSTNode;
    }

    const insertNode = (root: BSTNode | undefined, val: number): BSTNode => {
      if (!root) return { val };
      if (val < root.val) root.left = insertNode(root.left, val);
      else root.right = insertNode(root.right, val);
      return root;
    };

    let tree: BSTNode | undefined;
    for (const v of initialNodes) {
      tree = insertNode(tree, v);
    }

    steps.push({
      step_number: stepNum++,
      title: 'BST Structure Initialized',
      description: `Constructed Binary Search Tree with root ${initialNodes[0]}. Invariant: left < parent < right.`,
      state: { tree, flatList: initialNodes },
      highlighted_elements: [initialNodes[0]],
      pointers: { root: initialNodes[0] },
      variables: { target: searchVal },
      code_line: 1,
      complexity_info: { time: 'O(log N) avg, O(N) worst', space: 'O(H)' },
    });

    let curr = tree;
    while (curr) {
      steps.push({
        step_number: stepNum++,
        title: `Visit Node ${curr.val}`,
        description: `Inspecting node ${curr.val}. Comparing with search target ${searchVal}.`,
        state: { tree, flatList: initialNodes },
        highlighted_elements: [curr.val],
        comparisons: [curr.val, searchVal],
        pointers: { current: curr.val },
        variables: { currentVal: curr.val, target: searchVal },
        code_line: 3,
        complexity_info: { time: 'O(log N)', space: 'O(1)' },
      });

      if (curr.val === searchVal) {
        steps.push({
          step_number: stepNum++,
          title: 'Target Node Found',
          description: `Target ${searchVal} matches current node. Search successfully terminates.`,
          state: { tree, flatList: initialNodes },
          highlighted_elements: [curr.val],
          pointers: { match: curr.val },
          variables: { status: 'FOUND', value: curr.val },
          code_line: 4,
          complexity_info: { time: 'O(log N)', space: 'O(1)' },
        });
        break;
      } else if (searchVal < curr.val) {
        steps.push({
          step_number: stepNum++,
          title: `Branch Left (${searchVal} < ${curr.val})`,
          description: `${searchVal} is strictly smaller than ${curr.val}. Navigating to left child.`,
          state: { tree, flatList: initialNodes },
          highlighted_elements: [curr.val],
          pointers: { current: curr.val, next: curr.left ? curr.left.val : 'NULL' },
          code_line: 6,
          complexity_info: { time: 'O(log N)', space: 'O(1)' },
        });
        curr = curr.left;
      } else {
        steps.push({
          step_number: stepNum++,
          title: `Branch Right (${searchVal} > ${curr.val})`,
          description: `${searchVal} is strictly greater than ${curr.val}. Navigating to right child.`,
          state: { tree, flatList: initialNodes },
          highlighted_elements: [curr.val],
          pointers: { current: curr.val, next: curr.right ? curr.right.val : 'NULL' },
          code_line: 8,
          complexity_info: { time: 'O(log N)', space: 'O(1)' },
        });
        curr = curr.right;
      }
    }

    return steps;
  }

  /**
   * 11. Breadth-First Search (BFS) Graph Traversal
   */
  public static generateBFS(
    nodes: string[] = ['A', 'B', 'C', 'D', 'E', 'F'],
    adj: Record<string, string[]> = {
      A: ['B', 'C'],
      B: ['A', 'D', 'E'],
      C: ['A', 'F'],
      D: ['B'],
      E: ['B', 'F'],
      F: ['C', 'E'],
    },
    startNode: string = 'A'
  ): VisualizationStep[] {
    const steps: VisualizationStep[] = [];
    let stepNum = 1;
    const visited: string[] = [];
    const queue: string[] = [startNode];
    visited.push(startNode);

    steps.push({
      step_number: stepNum++,
      title: 'Initialize BFS with Start Node',
      description: `Enqueue start node ${startNode} and mark as visited. BFS explores vertices layer by layer using a FIFO queue.`,
      state: { nodes, adj, visited: [...visited], queue: [...queue], current: startNode },
      highlighted_elements: [startNode],
      pointers: { current: startNode },
      variables: { queue: [...queue], visited: [...visited] },
      code_line: 1,
      complexity_info: { time: 'O(V + E)', space: 'O(V)' },
    });

    while (queue.length > 0) {
      const u = queue.shift()!;
      steps.push({
        step_number: stepNum++,
        title: `Dequeue Vertex ${u}`,
        description: `Dequeued vertex ${u}. Now exploring all undiscovered adjacent neighbors.`,
        state: { nodes, adj, visited: [...visited], queue: [...queue], current: u },
        highlighted_elements: [u],
        pointers: { current: u },
        variables: { currentVertex: u, queue: [...queue] },
        code_line: 4,
        complexity_info: { time: 'O(V + E)', space: 'O(V)' },
      });

      for (const v of adj[u] || []) {
        if (!visited.includes(v)) {
          visited.push(v);
          queue.push(v);

          steps.push({
            step_number: stepNum++,
            title: `Discover Neighbor ${v}`,
            description: `Discovered unvisited neighbor ${v} through edge (${u}, ${v}). Enqueueing ${v}.`,
            state: { nodes, adj, visited: [...visited], queue: [...queue], current: u, activeEdge: [u, v] },
            highlighted_elements: [u, v],
            pointers: { current: u, neighbor: v },
            variables: { newlyDiscovered: v, queue: [...queue], visited: [...visited] },
            code_line: 7,
            complexity_info: { time: 'O(V + E)', space: 'O(V)' },
          });
        }
      }
    }

    steps.push({
      step_number: stepNum++,
      title: 'BFS Traversal Completed',
      description: `All reachable vertices visited: [${visited.join(', ')}]. Queue is now empty.`,
      state: { nodes, adj, visited: [...visited], queue: [], traversalOrder: visited },
      variables: { completedOrder: visited },
      code_line: 10,
      complexity_info: { time: 'O(V + E)', space: 'O(V)' },
    });

    return steps;
  }

  /**
   * 12. Depth-First Search (DFS) Graph Traversal
   */
  public static generateDFS(
    nodes: string[] = ['A', 'B', 'C', 'D', 'E', 'F'],
    adj: Record<string, string[]> = {
      A: ['B', 'C'],
      B: ['A', 'D', 'E'],
      C: ['A', 'F'],
      D: ['B'],
      E: ['B', 'F'],
      F: ['C', 'E'],
    },
    startNode: string = 'A'
  ): VisualizationStep[] {
    const steps: VisualizationStep[] = [];
    let stepNum = 1;
    const visited: string[] = [];
    const callStack: string[] = [];

    steps.push({
      step_number: stepNum++,
      title: 'Initialize DFS',
      description: `Starting Depth-First Search from vertex ${startNode}. DFS explores down each path as deep as possible before backtracking.`,
      state: { nodes, adj, visited: [], callStack: [startNode], current: startNode },
      highlighted_elements: [startNode],
      pointers: { current: startNode },
      code_line: 1,
      complexity_info: { time: 'O(V + E)', space: 'O(V)' },
    });

    const dfs = (u: string) => {
      visited.push(u);
      callStack.push(u);

      steps.push({
        step_number: stepNum++,
        title: `Enter DFS(${u})`,
        description: `Pushed ${u} onto recursion stack and marked as visited. Exploring adjacent edges.`,
        state: { nodes, adj, visited: [...visited], callStack: [...callStack], current: u },
        highlighted_elements: [u],
        pointers: { current: u },
        variables: { stackDepth: callStack.length, visited: [...visited] },
        code_line: 3,
        complexity_info: { time: 'O(V + E)', space: 'O(V)' },
      });

      for (const v of adj[u] || []) {
        if (!visited.includes(v)) {
          steps.push({
            step_number: stepNum++,
            title: `Traverse Tree Edge (${u} -> ${v})`,
            description: `Neighbor ${v} is unvisited. Making recursive DFS call for ${v}.`,
            state: { nodes, adj, visited: [...visited], callStack: [...callStack], current: u, activeEdge: [u, v] },
            highlighted_elements: [u, v],
            pointers: { from: u, to: v },
            code_line: 5,
            complexity_info: { time: 'O(V + E)', space: 'O(V)' },
          });

          dfs(v);

          steps.push({
            step_number: stepNum++,
            title: `Backtrack to Vertex ${u}`,
            description: `Returned from DFS call on subtree of ${v}. Resuming exploration of ${u}'s remaining neighbors.`,
            state: { nodes, adj, visited: [...visited], callStack: [...callStack], current: u },
            highlighted_elements: [u],
            pointers: { current: u },
            code_line: 7,
            complexity_info: { time: 'O(V + E)', space: 'O(V)' },
          });
        }
      }

      callStack.pop();
    };

    dfs(startNode);

    steps.push({
      step_number: stepNum++,
      title: 'DFS Traversal Finished',
      description: `Complete graph traversal finalized: [${visited.join(', ')}].`,
      state: { nodes, adj, visited: [...visited], callStack: [], traversalOrder: visited },
      variables: { completedOrder: visited },
      code_line: 9,
      complexity_info: { time: 'O(V + E)', space: 'O(V)' },
    });

    return steps;
  }

  /**
   * 13. Dynamic Programming: Fibonacci Table Computation
   */
  public static generateDPFibonacci(nInput: number = 6): VisualizationStep[] {
    const n = Math.min(Math.max(Number(nInput) || 6, 2), 10);
    const table: number[] = new Array(n + 1).fill(0);
    const steps: VisualizationStep[] = [];
    let stepNum = 1;

    steps.push({
      step_number: stepNum++,
      title: 'Initialize DP Table',
      description: `Creating 1D DP table of size ${n + 1} initialized to 0. Base cases: dp[0] = 0, dp[1] = 1.`,
      state: { table: [...table], n },
      pointers: { i: 0 },
      code_line: 1,
      complexity_info: { time: 'O(N)', space: 'O(N)' },
    });

    table[0] = 0;
    table[1] = 1;

    steps.push({
      step_number: stepNum++,
      title: 'Set Base Cases',
      description: 'Base values established: dp[0] = 0, dp[1] = 1.',
      state: { table: [...table], n },
      highlighted_elements: [0, 1],
      pointers: { base0: 0, base1: 1 },
      code_line: 3,
      complexity_info: { time: 'O(N)', space: 'O(N)' },
    });

    for (let i = 2; i <= n; i++) {
      table[i] = table[i - 1] + table[i - 2];
      steps.push({
        step_number: stepNum++,
        title: `Compute dp[${i}] = dp[${i - 1}] + dp[${i - 2}]`,
        description: `dp[${i}] = ${table[i - 1]} + ${table[i - 2]} = ${table[i]}. Stored for future subproblem reuse.`,
        state: { table: [...table], n },
        highlighted_elements: [i],
        comparisons: [i - 1, i - 2],
        pointers: { current: i, dep1: i - 1, dep2: i - 2 },
        variables: { currentSubproblem: `F(${i})`, result: table[i] },
        code_line: 5,
        complexity_info: { time: 'O(N)', space: 'O(N)' },
      });
    }

    steps.push({
      step_number: stepNum++,
      title: `Final Result: F(${n}) = ${table[n]}`,
      description: `Computation complete. The ${n}th Fibonacci number is ${table[n]} computed in linear O(N) time.`,
      state: { table: [...table], n, finalResult: table[n] },
      highlighted_elements: [n],
      pointers: { result: n },
      variables: { answer: table[n] },
      code_line: 7,
      complexity_info: { time: 'O(N)', space: 'O(N)' },
    });

    return steps;
  }

  /**
   * 14. Min/Max Heap Operations
   */
  public static generateHeap(
    values: number[] = [4, 10, 3, 5, 1],
    type: 'min' | 'max' = 'min'
  ): VisualizationStep[] {
    const heap: number[] = [];
    const steps: VisualizationStep[] = [];
    let stepNum = 1;

    steps.push({
      step_number: stepNum++,
      title: `Initialize Empty ${type.toUpperCase()} Heap`,
      description: `A ${type} heap is a complete binary tree where parent node is always ${
        type === 'min' ? '<=' : '>='
      } its children. Elements stored in contiguous array.`,
      state: { heap: [...heap], type },
      code_line: 1,
      complexity_info: { time: 'O(log N) insert', space: 'O(N)' },
    });

    for (const val of values) {
      heap.push(val);
      let idx = heap.length - 1;

      steps.push({
        step_number: stepNum++,
        title: `Insert Value ${val}`,
        description: `Appended ${val} at the end of the array (index ${idx}). Bubble-up (heapify) begins if heap invariant violated.`,
        state: { heap: [...heap], type },
        highlighted_elements: [idx],
        pointers: { current: idx },
        code_line: 3,
        complexity_info: { time: 'O(log N)', space: 'O(N)' },
      });

      // Bubble up
      while (idx > 0) {
        const parentIdx = Math.floor((idx - 1) / 2);
        const shouldSwap =
          type === 'min' ? heap[idx] < heap[parentIdx] : heap[idx] > heap[parentIdx];

        if (shouldSwap) {
          const temp = heap[idx];
          heap[idx] = heap[parentIdx];
          heap[parentIdx] = temp;

          steps.push({
            step_number: stepNum++,
            title: `Bubble Up Swap`,
            description: `${temp} ${type === 'min' ? '<' : '>'} parent ${
              heap[idx]
            }. Swapped with parent index ${parentIdx}.`,
            state: { heap: [...heap], type },
            highlighted_elements: [idx, parentIdx],
            swaps: [idx, parentIdx],
            pointers: { current: parentIdx, old: idx },
            code_line: 5,
            complexity_info: { time: 'O(log N)', space: 'O(N)' },
          });

          idx = parentIdx;
        } else {
          break;
        }
      }
    }

    steps.push({
      step_number: stepNum++,
      title: `${type.toUpperCase()} Heap Ready`,
      description: `All elements inserted. Root element at index 0 is the ${
        type === 'min' ? 'minimum' : 'maximum'
      } value: ${heap[0]}.`,
      state: { heap: [...heap], type },
      highlighted_elements: [0],
      pointers: { root: 0 },
      code_line: 8,
      complexity_info: { time: 'O(1) peek root', space: 'O(N)' },
    });

    return steps;
  }
}
