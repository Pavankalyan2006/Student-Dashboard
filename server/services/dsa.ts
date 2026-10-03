import { db } from '../db/database';
import {
  DSATopic,
  Algorithm,
  DSAProblem,
  DSAProgress,
  VisualizationSession,
  VisualizationStep,
  AlgorithmComparisonDimension,
} from '../models/dsaTypes';
import { DSAStepGenerators } from './dsaStepGenerators';
import { DSALeetCodeVisualizers } from './dsaLeetCodeVisualizers';
import { NotFoundError, ValidationError, AuthorizationError } from '../core/exceptions';
import { logger } from '../core/logging';

export class DSAService {
  /**
   * Topics
   */
  public static async getTopics(): Promise<DSATopic[]> {
    return db.getDSATopics();
  }

  public static async getTopic(idOrSlug: string): Promise<DSATopic> {
    const topic = await db.getDSATopic(idOrSlug);
    if (!topic) {
      throw new NotFoundError(`DSA Topic '${idOrSlug}' not found`);
    }
    return topic;
  }

  /**
   * Algorithms
   */
  public static async getAlgorithms(topicId?: string): Promise<Algorithm[]> {
    return db.getDSAAlgorithms(topicId);
  }

  public static async getAlgorithm(idOrSlug: string): Promise<Algorithm> {
    let algo = await db.getDSAAlgorithm(idOrSlug);
    if (!algo) {
      // Check if this is a DSA Problem (e.g. any of the 150 LeetCode problems)!
      const prob = await db.getDSAProblem(idOrSlug);
      if (prob) {
        algo = DSALeetCodeVisualizers.mapProblemToAlgorithm(prob);
      }
    }
    if (!algo) {
      throw new NotFoundError(`Algorithm or Problem '${idOrSlug}' not found`);
    }
    return algo;
  }

  /**
   * Generate Deterministic Visualization Session
   */
  public static async visualizeAlgorithm(
    algorithmId: string,
    customInput?: any
  ): Promise<VisualizationSession> {
    // If it's a LeetCode problem, generate its dedicated LeetCode visualization session!
    const prob = await db.getDSAProblem(algorithmId);
    if (prob) {
      return DSALeetCodeVisualizers.generateProblemSession(prob, customInput);
    }

    const algo = await this.getAlgorithm(algorithmId);
    let steps: VisualizationStep[] = [];
    const input = customInput || algo.default_input || {};

    switch (algo.slug) {
      case 'binary-search': {
        const arr = Array.isArray(input.array) ? input.array.map(Number) : [2, 5, 8, 12, 16, 23, 38, 56, 72, 91];
        if (arr.length > 50) throw new ValidationError('Array size cannot exceed 50 elements for visualization.');
        const target = input.target !== undefined ? Number(input.target) : 23;
        steps = DSAStepGenerators.generateBinarySearch(arr, target);
        break;
      }
      case 'linear-search': {
        const arr = Array.isArray(input.array) ? input.array.map(Number) : [14, 33, 27, 10, 35, 19, 42, 44];
        if (arr.length > 50) throw new ValidationError('Array size cannot exceed 50 elements for visualization.');
        const target = input.target !== undefined ? Number(input.target) : 35;
        steps = DSAStepGenerators.generateLinearSearch(arr, target);
        break;
      }
      case 'bubble-sort': {
        const arr = Array.isArray(input.array) ? input.array.map(Number) : [64, 34, 25, 12, 22, 11, 90];
        if (arr.length > 30) throw new ValidationError('Sorting array size cannot exceed 30 elements.');
        steps = DSAStepGenerators.generateBubbleSort(arr);
        break;
      }
      case 'selection-sort': {
        const arr = Array.isArray(input.array) ? input.array.map(Number) : [29, 10, 14, 37, 13];
        if (arr.length > 30) throw new ValidationError('Sorting array size cannot exceed 30 elements.');
        steps = DSAStepGenerators.generateSelectionSort(arr);
        break;
      }
      case 'insertion-sort': {
        const arr = Array.isArray(input.array) ? input.array.map(Number) : [12, 11, 13, 5, 6];
        if (arr.length > 30) throw new ValidationError('Sorting array size cannot exceed 30 elements.');
        steps = DSAStepGenerators.generateInsertionSort(arr);
        break;
      }
      case 'quick-sort': {
        const arr = Array.isArray(input.array) ? input.array.map(Number) : [10, 80, 30, 90, 40, 50, 70];
        if (arr.length > 30) throw new ValidationError('Sorting array size cannot exceed 30 elements.');
        steps = DSAStepGenerators.generateQuickSort(arr);
        break;
      }
      case 'stack-operations': {
        const ops = Array.isArray(input.operations)
          ? input.operations
          : [{ type: 'push', value: 10 }, { type: 'push', value: 20 }, { type: 'push', value: 30 }, { type: 'peek' }, { type: 'pop' }];
        steps = DSAStepGenerators.generateStack(ops);
        break;
      }
      case 'queue-operations': {
        const ops = Array.isArray(input.operations)
          ? input.operations
          : [{ type: 'enqueue', value: 10 }, { type: 'enqueue', value: 20 }, { type: 'dequeue' }];
        steps = DSAStepGenerators.generateQueue(ops);
        break;
      }
      case 'linked-list-traversal': {
        const vals = Array.isArray(input.values) ? input.values.map(Number) : [10, 20, 30, 40, 50];
        const insertVal = input.insertVal !== undefined ? Number(input.insertVal) : 25;
        steps = DSAStepGenerators.generateLinkedList(vals, insertVal);
        break;
      }
      case 'bst-search': {
        const nodes = Array.isArray(input.nodes) ? input.nodes.map(Number) : [8, 3, 10, 1, 6, 14, 4, 7, 13];
        const target = input.searchVal !== undefined ? Number(input.searchVal) : 7;
        steps = DSAStepGenerators.generateBST(nodes, target);
        break;
      }
      case 'breadth-first-search': {
        const start = input.startNode || 'A';
        steps = DSAStepGenerators.generateBFS(undefined, undefined, start);
        break;
      }
      case 'depth-first-search': {
        const start = input.startNode || 'A';
        steps = DSAStepGenerators.generateDFS(undefined, undefined, start);
        break;
      }
      case 'fibonacci-dp': {
        const n = input.n !== undefined ? Number(input.n) : 6;
        steps = DSAStepGenerators.generateDPFibonacci(n);
        break;
      }
      case 'heap-operations': {
        const vals = Array.isArray(input.values) ? input.values.map(Number) : [4, 10, 3, 5, 1];
        const type = input.type === 'max' ? 'max' : 'min';
        steps = DSAStepGenerators.generateHeap(vals, type);
        break;
      }
      default:
        // Default to bubble sort or linear search if generic
        steps = DSAStepGenerators.generateBubbleSort([5, 1, 4, 2, 8]);
        break;
    }

    return {
      algorithm_id: algo.id,
      algorithm_name: algo.name,
      visualization_type: algo.visualization_type,
      input_data: input,
      steps,
      pseudocode: algo.pseudocode,
      total_steps: steps.length,
      complexity: {
        time: algo.time_complexity,
        space: algo.space_complexity,
        best_case: algo.best_case,
        average_case: algo.average_case,
        worst_case: algo.worst_case,
        in_place: algo.in_place,
        stable: algo.stable,
      },
    };
  }

  /**
   * Problems
   */
  public static async getProblems(filters?: {
    topic_id?: string;
    difficulty?: string;
    search?: string;
  }): Promise<DSAProblem[]> {
    return db.getDSAProblems(filters);
  }

  public static async getProblem(idOrSlug: string): Promise<DSAProblem> {
    const prob = await db.getDSAProblem(idOrSlug);
    if (!prob) {
      throw new NotFoundError(`DSA Problem '${idOrSlug}' not found`);
    }
    return prob;
  }

  public static async getHints(problemId: string, level: number = 1): Promise<{
    problem_id: string;
    level: number;
    hint: string;
    total_hints: number;
  }> {
    const prob = await this.getProblem(problemId);
    const lvl = Math.max(1, Math.min(level, prob.hints.length));
    return {
      problem_id: prob.id,
      level: lvl,
      hint: prob.hints[lvl - 1] || 'Break the problem down into smaller base cases.',
      total_hints: prob.hints.length,
    };
  }

  /**
   * Progress Tracking
   */
  public static async getProgress(studentId: string): Promise<DSAProgress> {
    return db.getDSAProgress(studentId);
  }

  public static async recordVisualization(studentId: string, algorithmId: string): Promise<DSAProgress> {
    return db.recordDSAVisualization(studentId, algorithmId);
  }

  public static async recordProblemSolved(studentId: string, problemId: string): Promise<DSAProgress> {
    return db.recordDSAProblemSolved(studentId, problemId);
  }

  /**
   * Algorithm Comparison
   */
  public static async compareAlgorithms(algoIds: string[]): Promise<AlgorithmComparisonDimension[]> {
    const algorithms = await db.getDSAAlgorithms();
    const selected = algorithms.filter((a) => algoIds.includes(a.id) || algoIds.includes(a.slug));

    return selected.map((a) => ({
      id: a.id,
      name: a.name,
      best_case: a.best_case,
      average_case: a.average_case,
      worst_case: a.worst_case,
      space_complexity: a.space_complexity,
      stable: a.stable,
      in_place: a.in_place,
      use_cases: a.comparison_tags || ['General algorithmic problem solving'],
    }));
  }
}
