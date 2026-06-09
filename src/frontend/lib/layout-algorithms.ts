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
 * Mutating wrapper around dependencyLayout for callers that manage node arrays
 * by reference (e.g. multi-stack-to-flow).
 */
export function applyStaircaseLayout(nodes: Node[], edges: Edge[]): void {
  const laid = dependencyLayout(nodes, edges);
  const posMap = new Map(laid.map((n) => [n.id, n.position]));
  nodes.forEach((node) => {
    const pos = posMap.get(node.id);
    if (pos) node.position = pos;
  });
}

/**
 * Staircase dependency layout.
 * Computes each node's rank via longest-path from roots, then cascades each
 * rank diagonally — one column to the right and one step down per rank.
 * Nodes at the same rank stack vertically within their column.
 */
function dependencyLayout(nodes: Node[], edges: Edge[]): Node[] {
  if (nodes.length === 0) return nodes;

  const outgoing = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  for (const node of nodes) {
    outgoing.set(node.id, []);
    inDegree.set(node.id, 0);
  }

  for (const edge of edges) {
    outgoing.get(edge.source)?.push(edge.target);
    inDegree.set(edge.target, (inDegree.get(edge.target) ?? 0) + 1);
  }

  // Kahn's topological sort
  const inDegCopy = new Map(inDegree);
  const topoOrder: string[] = [];
  const queue: string[] = nodes
    .filter((n) => (inDegCopy.get(n.id) ?? 0) === 0)
    .map((n) => n.id);
  let qi = 0;
  while (qi < queue.length) {
    const id = queue[qi++];
    topoOrder.push(id);
    for (const neighbor of outgoing.get(id) ?? []) {
      const d = (inDegCopy.get(neighbor) ?? 1) - 1;
      inDegCopy.set(neighbor, d);
      if (d === 0) queue.push(neighbor);
    }
  }
  // Append cycle-involved or disconnected nodes that were skipped
  for (const node of nodes) {
    if (!topoOrder.includes(node.id)) topoOrder.push(node.id);
  }

  // Longest-path DP: rank = furthest distance from any root
  const rank = new Map<string, number>(nodes.map((n) => [n.id, 0]));
  for (const id of topoOrder) {
    const r = rank.get(id) ?? 0;
    for (const neighbor of outgoing.get(id) ?? []) {
      if (r + 1 > (rank.get(neighbor) ?? 0)) {
        rank.set(neighbor, r + 1);
      }
    }
  }

  // Group nodes by rank, preserving stable insertion order
  const rankGroups = new Map<number, Node[]>();
  for (const node of nodes) {
    const r = rank.get(node.id) ?? 0;
    if (!rankGroups.has(r)) rankGroups.set(r, []);
    rankGroups.get(r)!.push(node);
  }

  const H_GAP = 80; // horizontal gap between rank columns
  const STAIR_STEP = 80; // minimum vertical drop from one rank's bottom to the next's top
  const WITHIN_GAP = 30; // vertical gap between nodes stacked within the same rank

  // Compute each rank's y origin, guaranteeing STAIR_STEP clearance below the
  // previous rank's last node so columns never overlap.
  const sortedRanks = Array.from(rankGroups.keys()).sort((a, b) => a - b);
  const rankYStart = new Map<number, number>();
  let prevBottom = 0;

  for (const r of sortedRanks) {
    const yStart = r === 0 ? 0 : prevBottom + STAIR_STEP;
    rankYStart.set(r, yStart);
    const count = (rankGroups.get(r) ?? []).length;
    prevBottom = yStart + count * (NODE_HEIGHT + WITHIN_GAP) - WITHIN_GAP;
  }

  return nodes.map((node) => {
    const r = rank.get(node.id) ?? 0;
    const rankNodes = rankGroups.get(r) ?? [];
    const i = rankNodes.indexOf(node);
    return {
      ...node,
      position: {
        x: r * (NODE_WIDTH + H_GAP),
        y: (rankYStart.get(r) ?? 0) + i * (NODE_HEIGHT + WITHIN_GAP),
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

  vpcs.forEach((node, index) => {
    positioned.push({
      ...node,
      position: {x: index * 300, y: currentY},
    });
  });
  if (vpcs.length > 0) currentY += 200;

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

  const groups = new Map<string, Node[]>();

  nodes.forEach((node) => {
    const resource = resourceMap.get(node.id);
    if (!resource) return;

    // AWS::Lambda::Function -> Lambda
    const parts = resource.type.split('::');
    const service = parts.length >= 2 ? parts[1] : 'Other';

    if (!groups.has(service)) {
      groups.set(service, []);
    }
    groups.get(service)!.push(node);
  });

  const sortedGroups = Array.from(groups.entries()).sort((a, b) =>
    a[0].localeCompare(b[0]),
  );

  const positioned: Node[] = [];
  let currentY = 0;

  sortedGroups.forEach((group) => {
    const groupNodes = group[1];
    groupNodes.forEach((node, index) => {
      positioned.push({
        ...node,
        position: {
          x: (index % 4) * 250,
          y: currentY + Math.floor(index / 4) * 180,
        },
      });
    });

    currentY += Math.ceil(groupNodes.length / 4) * 180 + 80;
  });

  return positioned;
}
