export type DSATopicCategory = 'DATA_STRUCTURE' | 'ALGORITHM' | 'TECHNIQUE';

export type DSADifficulty = 'BEGINNER' | 'EASY' | 'MEDIUM' | 'HARD' | 'ADVANCED';

export type VisualizationType =
  | 'ARRAY'
  | 'STRING'
  | 'LINKED_LIST'
  | 'STACK'
  | 'QUEUE'
  | 'TREE'
  | 'HEAP'
  | 'GRAPH'
  | 'GRID'
  | 'POINTERS'
  | 'RECURSION'
  | 'DP_TABLE';

export interface DSATopic {
  id: string;
  name: string;
  slug: string;
  category: DSATopicCategory;
  description: string;
  difficulty: DSADifficulty;
  order_index: number;
  prerequisites: string[];
  icon?: string;
  concepts?: string[];
  created_at: string;
  updated_at: string;
}

export interface Algorithm {
  id: string;
  name: string;
  slug: string;
  topic_id: string;
  description: string;
  concept: string;
  pseudocode: string[];
  time_complexity: string;
  space_complexity: string;
  best_case: string;
  average_case: string;
  worst_case: string;
  stable: boolean;
  in_place: boolean;
  visualization_type: VisualizationType;
  supported_languages: string[];
  default_input?: any;
  comparison_tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface VisualizationStep {
  step_number: number;
  title: string;
  description: string;
  state: any;
  highlighted_elements?: (number | string)[];
  comparisons?: (number | string)[];
  swaps?: [number | string, number | string];
  pointers?: Record<string, number | string>;
  variables?: Record<string, any>;
  code_line?: number;
  complexity_info?: {
    time: string;
    space: string;
  };
}

export interface VisualizationSession {
  algorithm_id: string;
  algorithm_name: string;
  visualization_type: VisualizationType;
  input_data: any;
  steps: VisualizationStep[];
  pseudocode: string[];
  total_steps: number;
  complexity: {
    time: string;
    space: string;
    best_case: string;
    average_case: string;
    worst_case: string;
    in_place: boolean;
    stable: boolean;
  };
}

export interface DSAProblem {
  id: string;
  title: string;
  slug: string;
  description: string;
  topic_id: string;
  algorithm_id?: string;
  difficulty: DSADifficulty;
  constraints: string[];
  input_format: string;
  output_format: string;
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  starter_code: Record<string, string>;
  hints: string[];
  solution_explanation?: string;
  editorial_url?: string;
  optimal_complexity?: {
    time: string;
    space: string;
  };
  supported_languages: string[];
  created_at: string;
  updated_at: string;
}

export interface DSAProgress {
  student_id: string;
  topics_viewed: string[];
  algorithms_viewed: string[];
  visualizations_completed: string[];
  problems_attempted: string[];
  problems_solved: string[];
  hints_used: number;
  weak_topics: string[];
  last_activity_at: string;
  updated_at: string;
}

export interface AlgorithmComparisonDimension {
  id: string;
  name: string;
  best_case: string;
  average_case: string;
  worst_case: string;
  space_complexity: string;
  stable: boolean;
  in_place: boolean;
  use_cases: string[];
}
