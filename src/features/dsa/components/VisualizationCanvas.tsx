import * as React from 'react';
import { VisualizationStep, VisualizationType } from '../types/dsa';
import { ArrayVisualizer } from './visualizers/ArrayVisualizer';
import { LinkedListVisualizer } from './visualizers/LinkedListVisualizer';
import { StackVisualizer } from './visualizers/StackVisualizer';
import { QueueVisualizer } from './visualizers/QueueVisualizer';
import { TreeVisualizer } from './visualizers/TreeVisualizer';
import { HeapVisualizer } from './visualizers/HeapVisualizer';
import { GraphVisualizer } from './visualizers/GraphVisualizer';
import { DPTableVisualizer } from './visualizers/DPTableVisualizer';
import { RecursionVisualizer } from './visualizers/RecursionVisualizer';

interface VisualizationCanvasProps {
  step: VisualizationStep;
  type: VisualizationType;
}

export const VisualizationCanvas: React.FC<VisualizationCanvasProps> = ({ step, type }) => {
  switch (type) {
    case 'LINKED_LIST':
      return <LinkedListVisualizer step={step} />;
    case 'STACK':
      return <StackVisualizer step={step} />;
    case 'QUEUE':
      return <QueueVisualizer step={step} />;
    case 'TREE':
      return <TreeVisualizer step={step} />;
    case 'HEAP':
      return <HeapVisualizer step={step} />;
    case 'GRAPH':
      return <GraphVisualizer step={step} />;
    case 'DP_TABLE':
      return <DPTableVisualizer step={step} />;
    case 'RECURSION':
      return <RecursionVisualizer step={step} />;
    case 'ARRAY':
    case 'STRING':
    case 'POINTERS':
    case 'GRID':
    default:
      return <ArrayVisualizer step={step} />;
  }
};
