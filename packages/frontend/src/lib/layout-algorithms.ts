import dagre from 'dagre';
import {Node, Edge} from 'reactflow';
import {CdkResource} from '../types';

export type LayoutMode = 'dependency' | 'topology' | 'type';

const NODE_WIDTH = 200;
const NODE_HEIGHT = 150;

/**
 * Apply layout algorithm to nodes based on mode.
 *
 * @param nodes - React Flow nodes
 * @param edges - React Flow edges
 * @param resources - Original CDK resources
 * @param mode - Layout algorithm to use
 */
export function applyLayout(
  nodes: Node[],
  edges: Edge[],
  resources: CdkResource[],
  mode: LayoutMode,
): Node[] {
  switch (mode) {
    case 'dependency':
      return dependencyLayout(nodes, edges);
    case 'topology':
      return topologyLayout(nodes, resources);
    case 'type':
      return typeLayout(nodes, resources);
    default:
      return nodes;
  }
}

/**
 * Hierarchical dependency layout using dagre.
 * Shows what depends on what in a top-to-bottom flow.
 */
function dependencyLayout(nodes: Node[], edges: Edge[]): Node[] {
  const g = new dagre.graphlib.Graph();
  g.setGraph({rankdir: 'TB', ranksep: 100, nodesep: 80});
  g.setDefaultEdgeLabel(() => ({}));

  // Add nodes to graph
  nodes.forEach((node) => {
    g.setNode(node.id, {width: NODE_WIDTH, height: NODE_HEIGHT});
  });

  // Add edges to graph
  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  // Run dagre layout
  dagre.layout(g);

  // Apply positions from dagre
  return nodes.map((node) => {
    const nodeWithPosition = g.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - NODE_WIDTH / 2,
        y: nodeWithPosition.y - NODE_HEIGHT / 2,
      },
    };
  });
}

/**
 * Topology layout organized by VPC/subnet hierarchy.
 * Groups resources by their network topology.
 */
function topologyLayout(nodes: Node[], resources: CdkResource[]): Node[] {
  const resourceMap = new Map(resources.map((r) => [r.id, r]));

  // Categorize resources
  const vpcs: Node[] = [];
  const subnets: Node[] = [];
  const others: Node[] = [];

  nodes.forEach((node) => {
    const resource = resourceMap.get(node.id);
    if (!resource) {
      others.push(node);
      return;
    }

    if (resource.type === 'AWS::EC2::VPC') {
      vpcs.push(node);
    } else if (resource.type === 'AWS::EC2::Subnet') {
      subnets.push(node);
    } else {
      others.push(node);
    }
  });

  const positioned: Node[] = [];
  let currentY = 0;

  // VPCs at top
  vpcs.forEach((node, index) => {
    positioned.push({
      ...node,
      position: {x: index * 300, y: currentY},
    });
  });
  if (vpcs.length > 0) currentY += 200;

  // Subnets below VPCs
  subnets.forEach((node, index) => {
    positioned.push({
      ...node,
      position: {
        x: (index % 4) * 250,
        y: currentY + Math.floor(index / 4) * 180,
      },
    });
  });
  if (subnets.length > 0) currentY += Math.ceil(subnets.length / 4) * 180 + 50;

  // Other resources below
  others.forEach((node, index) => {
    positioned.push({
      ...node,
      position: {
        x: (index % 4) * 250,
        y: currentY + Math.floor(index / 4) * 180,
      },
    });
  });

  return positioned;
}

/**
 * Resource type layout grouped by AWS service.
 * Organizes resources by their CloudFormation type.
 */
function typeLayout(nodes: Node[], resources: CdkResource[]): Node[] {
  const resourceMap = new Map(resources.map((r) => [r.id, r]));

  // Group by service (AWS::Lambda, AWS::DynamoDB, etc.)
  const groups = new Map<string, Node[]>();

  nodes.forEach((node) => {
    const resource = resourceMap.get(node.id);
    if (!resource) return;

    // Extract service from type (AWS::Lambda::Function -> Lambda)
    const parts = resource.type.split('::');
    const service = parts.length >= 2 ? parts[1] : 'Other';

    if (!groups.has(service)) {
      groups.set(service, []);
    }
    groups.get(service)!.push(node);
  });

  // Sort groups by name
  const sortedGroups = Array.from(groups.entries()).sort((a, b) =>
    a[0].localeCompare(b[0]),
  );

  const positioned: Node[] = [];
  let currentY = 0;

  sortedGroups.forEach((group) => {
    const groupNodes = group[1];
    // Add label node for group (optional, could be rendered differently)
    groupNodes.forEach((node, index) => {
      positioned.push({
        ...node,
        position: {
          x: (index % 4) * 250,
          y: currentY + Math.floor(index / 4) * 180,
        },
      });
    });

    // Move to next group
    currentY += Math.ceil(groupNodes.length / 4) * 180 + 80;
  });

  return positioned;
}
