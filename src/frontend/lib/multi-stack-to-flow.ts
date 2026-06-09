import {Node, Edge} from 'reactflow';
import {CdkStack} from '../types';
import {LayoutMode, applyStaircaseLayout} from './layout-algorithms';
import {createTopologyLayout} from './topology-layout';

/**
 * Result of merging multiple CDK stacks.
 */
interface MergedStack {
  stackNames: string[];
  resources: Record<
    string,
    {
      id: string;
      type: string;
      properties: Record<string, unknown>;
      constructPath?: string;
      iconPath?: string;
      isImported: boolean;
      dependencies: string[];
      stackName: string;
      originalId: string;
    }
  >;
  resourceToStack: Record<string, string>;
}

/**
 * Merge multiple CDK stacks into a single unified view.
 */
function mergeStacks(stacks: Record<string, CdkStack>): MergedStack {
  const stackNames = Object.keys(stacks);
  const resources: MergedStack['resources'] = {};
  const resourceToStack: Record<string, string> = {};

  for (const stackName of stackNames) {
    const stack = stacks[stackName];

    for (const [resourceId, resource] of Object.entries(stack.resources)) {
      const prefixedId = `${stackName}::${resourceId}`;
      resources[prefixedId] = {
        ...resource,
        stackName,
        originalId: resourceId,
      };
      resourceToStack[prefixedId] = stackName;
    }
  }

  // Update dependencies to use prefixed IDs
  for (const [prefixedId, resource] of Object.entries(resources)) {
    const stackName = resourceToStack[prefixedId];

    if (resource.dependencies) {
      resource.dependencies = resource.dependencies.map((depId) => {
        const sameStackPrefixed = `${stackName}::${depId}`;
        if (resources[sameStackPrefixed]) {
          return sameStackPrefixed;
        }

        if (resources[depId]) {
          return depId;
        }

        for (const otherStackName of stackNames) {
          const crossStackPrefixed = `${otherStackName}::${depId}`;
          if (resources[crossStackPrefixed]) {
            return crossStackPrefixed;
          }
        }

        return depId;
      });
    }
  }

  return {stackNames, resources, resourceToStack};
}

/**
 * Get display name without stack prefix.
 */
function getResourceDisplayName(prefixedId: string): string {
  const parts = prefixedId.split('::');
  return parts.length === 2 ? parts[1] : prefixedId;
}

/**
 * Convert multiple CDK stacks to React Flow nodes and edges.
 */
interface CidrInfo {
  name: string;
  cidr: string;
  type: 'vpc' | 'subnet';
  color: string;
}

export function multiStackToFlow(
  stacks: Record<string, CdkStack>,
  layoutMode: LayoutMode,
  cidrBlocks?: CidrInfo[],
): {nodes: Node[]; edges: Edge[]} {
  const merged = mergeStacks(stacks);
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Create resource nodes (without parentNode to allow cross-stack edges)
  for (const [prefixedId, resource] of Object.entries(merged.resources)) {
    const displayName = getResourceDisplayName(prefixedId);
    const stackName = resource.stackName;

    nodes.push({
      id: prefixedId,
      type: 'resourceNode',
      position: {x: 0, y: 0},
      data: {
        label: displayName,
        type: resource.type,
        iconPath: resource.iconPath,
        isImported: resource.isImported,
        stackName,
        constructPath: resource.constructPath,
        cfnProperties: resource.properties || {},
        originalId: resource.originalId,
      },
    });
  }

  // Create edges
  for (const [prefixedId, resource] of Object.entries(merged.resources)) {
    for (const depId of resource.dependencies) {
      if (merged.resources[depId]) {
        edges.push({
          id: `${prefixedId}-${depId}`,
          source: depId,
          target: prefixedId,
          type: 'smoothstep',
          animated: false,
        });
      }
    }
  }

  // Apply layout based on mode
  if (layoutMode === 'topology') {
    // Topology mode: unified AWS Cloud → VPC diagram
    return createTopologyLayout(stacks, nodes, edges, cidrBlocks);
  } else if (layoutMode === 'dependency') {
    // Dependency mode: staircase layout with stack groups
    applyStaircaseLayout(nodes, edges);
    const stackGroups = createStackGroups(nodes, merged.stackNames);
    return {nodes: [...stackGroups, ...nodes], edges};
  } else if (layoutMode === 'type') {
    // Type mode: grouped by type with stack groups
    applyTypeLayout(nodes);
    const stackGroups = createStackGroups(nodes, merged.stackNames);
    return {nodes: [...stackGroups, ...nodes], edges};
  } else {
    // Default: staircase layout with groups
    applyStaircaseLayout(nodes, edges);
    const stackGroups = createStackGroups(nodes, merged.stackNames);
    return {nodes: [...stackGroups, ...nodes], edges};
  }
}

/**
 * Create group nodes for each stack.
 * Groups are positioned as background nodes (not parent nodes) to allow edges between stacks.
 */
function createStackGroups(
  resourceNodes: Node[],
  stackNames: string[],
): Node[] {
  const groups: Node[] = [];
  const stackGap = 150;
  const padding = 40;
  const headerHeight = 60;

  let currentX = 0;

  stackNames.forEach((stackName) => {
    const stackNodes = resourceNodes.filter(
      (node) => node.data.stackName === stackName,
    );

    if (stackNodes.length === 0) return;

    // Calculate bounds
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    stackNodes.forEach((node) => {
      minX = Math.min(minX, node.position.x);
      minY = Math.min(minY, node.position.y);
      maxX = Math.max(maxX, node.position.x + 180);
      maxY = Math.max(maxY, node.position.y + 80);
    });

    const groupWidth = maxX - minX + padding * 2;
    const groupHeight = maxY - minY + padding * 2 + headerHeight;

    // Create background group node
    groups.push({
      id: `stack-group-${stackName}`,
      type: 'group',
      position: {
        x: currentX,
        y: 0,
      },
      style: {
        width: groupWidth,
        height: groupHeight,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        border: '3px solid #8b5cf6',
        borderRadius: '16px',
        padding: '10px',
        zIndex: -1,
      },
      data: {
        label: stackName,
      },
      draggable: false,
      selectable: false,
    });

    // Offset nodes to fit within group bounds
    const groupX = currentX + padding;
    const groupY = padding + headerHeight;

    stackNodes.forEach((node) => {
      node.position = {
        x: groupX + (node.position.x - minX),
        y: groupY + (node.position.y - minY),
      };
    });

    currentX += groupWidth + stackGap;
  });

  return groups;
}

/**
 * Apply type-based grid layout with stack grouping.
 */
function applyTypeLayout(nodes: Node[]): void {
  const stackGroups = new Map<string, Node[]>();

  // Group by stack
  nodes.forEach((node) => {
    const stackName = node.data.stackName || 'unknown';
    if (!stackGroups.has(stackName)) {
      stackGroups.set(stackName, []);
    }
    stackGroups.get(stackName)!.push(node);
  });

  let stackX = 0;
  const stackSpacing = 400;

  // Layout each stack side by side
  for (const [, stackNodes] of stackGroups) {
    const typeGroups = new Map<string, Node[]>();

    // Group by type within stack
    stackNodes.forEach((node) => {
      const type = node.data.type || 'Unknown';
      if (!typeGroups.has(type)) {
        typeGroups.set(type, []);
      }
      typeGroups.get(type)!.push(node);
    });

    let y = 0;
    const verticalSpacing = 140;

    // Layout types vertically
    for (const [, typeNodes] of typeGroups) {
      typeNodes.forEach((node, idx) => {
        node.position = {
          x: stackX + idx * 240,
          y,
        };
      });
      y += verticalSpacing;
    }

    stackX += stackSpacing;
  }
}
