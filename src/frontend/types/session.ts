import {Node, Edge} from 'reactflow';
import {StylingOptions} from '../components/StylingPanel';

export interface SessionState {
  version: '1';
  savedAt: string;
  selectedStacks: string[];
  layoutMode: string;
  /** Positions for all nodes at the time of save, keyed by node ID */
  nodePositions: Record<string, {x: number; y: number}>;
  customNodes: Node[];
  customEdges: Edge[];
  annotations: Node[];
  hiddenTypes: string[];
  baseHiddenTypes: string[];
  deletedCfnEdgeIds: string[];
  hiddenGroupIds: string[];
  stylingOptions: StylingOptions;
}
