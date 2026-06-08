import {Edge} from 'reactflow';

export interface CustomEdgeData {
  label?: string;
  color?: string;
  strokeWidth?: number;
  dashed?: boolean;
  isCustom: boolean; // true = user-added, false = CloudFormation
}

export type CustomEdge = Edge<CustomEdgeData>;

export interface CustomEdgeStyle {
  color: string;
  strokeWidth: number;
  dashed: boolean;
}

export const DEFAULT_EDGE_STYLE: CustomEdgeStyle = {
  color: '#2563eb',
  strokeWidth: 2,
  dashed: false,
};

export const CLOUDFORMATION_EDGE_STYLE: CustomEdgeStyle = {
  color: '#94a3b8',
  strokeWidth: 1.5,
  dashed: false,
};

export const CUSTOM_EDGE_COLORS = [
  {name: 'Blue', value: '#2563eb'},
  {name: 'Green', value: '#16a34a'},
  {name: 'Orange', value: '#ea580c'},
  {name: 'Purple', value: '#9333ea'},
  {name: 'Red', value: '#dc2626'},
  {name: 'Gray', value: '#64748b'},
];
