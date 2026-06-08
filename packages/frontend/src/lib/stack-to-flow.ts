import {Node, Edge, MarkerType} from 'reactflow';
import {CdkStack, CdkResource} from '../types';
import {ResourceNodeData} from '../components/Canvas/ResourceNode';
import {applyLayout, LayoutMode} from './layout-algorithms';

/**
 * Convert CDK stack to React Flow nodes and edges.
 *
 * @param stack - Parsed CDK stack
 * @param layoutMode - Layout algorithm to use
 * @returns Nodes and edges for React Flow
 */
export function stackToFlow(
  stack: CdkStack,
  layoutMode: LayoutMode = 'dependency',
  _cidrBlocks?: unknown, // For API compatibility, not used in single-stack mode
): {
  nodes: Node<ResourceNodeData>[];
  edges: Edge[];
} {
  const resources = Object.values(stack.resources);
  const nodes = resourcesToNodes(resources);
  const edges = dependenciesToEdges(resources);

  // Apply layout algorithm
  const layoutedNodes = applyLayout(nodes, edges, resources, layoutMode);

  return {nodes: layoutedNodes, edges};
}

/**
 * Convert CDK resources to React Flow nodes.
 *
 * @param resources - Array of CDK resources
 */
function resourcesToNodes(resources: CdkResource[]): Node<ResourceNodeData>[] {
  return resources.map((resource) => {
    return {
      id: resource.id,
      type: 'resourceNode',
      position: {x: 0, y: 0}, // Will be set by layout algorithm
      data: {
        label: resource.id,
        type: resource.type,
        iconPath: resource.iconPath ?? '',
        isImported: resource.isImported,
        constructPath: resource.constructPath,
        cfnProperties: resource.properties || {},
      },
    };
  });
}

/**
 * Convert resource dependencies to React Flow edges.
 *
 * @param resources - Array of CDK resources
 */
function dependenciesToEdges(resources: CdkResource[]): Edge[] {
  const edges: Edge[] = [];

  for (const resource of resources) {
    for (const dep of resource.dependencies) {
      edges.push({
        id: `${resource.id}-${dep}`,
        source: dep,
        target: resource.id,
        type: 'smoothstep',
        animated: false,
        style: {stroke: '#94a3b8', strokeWidth: 2},
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#94a3b8',
        },
      });
    }
  }

  return edges;
}
