import {Node, Edge} from 'reactflow';
import {CdkStack} from '../types';

interface VpcInfo {
  id: string;
  name: string;
  resources: Node[];
}

interface CidrInfo {
  name: string;
  cidr: string;
  type: 'vpc' | 'subnet';
  color: string;
}

/**
 * Create a unified topology layout for multiple stacks.
 * Merges all resources into AWS Cloud → VPC → Resources hierarchy.
 */
export function createTopologyLayout(
  stacks: Record<string, CdkStack>,
  nodes: Node[],
  edges: Edge[],
  cidrBlocks?: CidrInfo[],
): {nodes: Node[]; edges: Edge[]} {
  // Find all VPCs across all stacks
  const vpcs = findVpcs(nodes);

  // Assign resources to VPCs
  const vpcResourceMap = assignResourcesToVpcs(nodes, vpcs);

  // Resources not in any VPC (external or shared services)
  const externalResources = nodes.filter(
    (node) => !vpcResourceMap.has(node.id),
  );

  const layoutNodes: Node[] = [];
  let currentY = 100;
  const vpcGap = 150;
  const cloudPadding = 80;

  // Layout VPCs and their resources
  vpcs.forEach((vpc) => {
    const vpcResources = vpc.resources;
    if (vpcResources.length === 0) return;

    // Simple grid layout within VPC
    const cols = 4;
    const nodeWidth = 200;
    const nodeHeight = 100;
    const spacing = 40;

    vpcResources.forEach((node, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);

      layoutNodes.push({
        ...node,
        position: {
          x: cloudPadding + 60 + col * (nodeWidth + spacing),
          y: currentY + 80 + row * (nodeHeight + spacing),
        },
      });
    });

    // Calculate VPC bounds
    const vpcWidth =
      Math.min(cols, vpcResources.length) * (nodeWidth + spacing) + 100;
    const vpcHeight =
      Math.ceil(vpcResources.length / cols) * (nodeHeight + spacing) + 140;

    // Create VPC group node
    layoutNodes.push({
      id: `vpc-group-${vpc.id}`,
      type: 'group',
      position: {x: cloudPadding + 20, y: currentY},
      style: {
        width: vpcWidth,
        height: vpcHeight,
        backgroundColor: 'rgba(76, 175, 80, 0.05)',
        border: '3px solid #4caf50',
        borderRadius: '12px',
        padding: '10px',
        zIndex: -2,
        pointerEvents: 'none', // Only badge is clickable
      },
      data: {
        label: 'VPC',
        isVpcBox: true,
        vpcId: vpc.id,
      },
      draggable: false,
      selectable: false,
    });

    currentY += vpcHeight + vpcGap;
  });

  // Layout external resources at bottom
  if (externalResources.length > 0) {
    const cols = 4;
    const nodeWidth = 200;
    const nodeHeight = 100;
    const spacing = 40;

    externalResources.forEach((node, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);

      layoutNodes.push({
        ...node,
        position: {
          x: cloudPadding + 60 + col * (nodeWidth + spacing),
          y: currentY + 60 + row * (nodeHeight + spacing),
        },
      });
    });

    currentY +=
      Math.ceil(externalResources.length / cols) * (nodeHeight + spacing) + 80;
  }

  // Create AWS Cloud boundary
  const cloudWidth = 1400;
  const cloudHeight = currentY + cloudPadding;

  layoutNodes.unshift({
    id: 'aws-cloud-boundary',
    type: 'group',
    position: {x: 20, y: 20},
    style: {
      width: cloudWidth,
      height: cloudHeight,
      backgroundColor: 'rgba(255, 153, 0, 0.02)',
      border: '4px solid #ff9800',
      borderRadius: '16px',
      padding: '20px',
      zIndex: -10,
      pointerEvents: 'none', // Only badge is clickable
    },
    data: {
      label: 'AWS Cloud',
      isCloudBox: true,
    },
    draggable: false,
    selectable: false,
  });

  // Always add the CIDR legend in topology view, even when no blocks are
  // found, so users can see the section and double-click to edit.
  const legendWidth = 300;
  const legendPadding = 40;
  const cloudBoxX = 20;
  const cloudBoxY = 20;

  layoutNodes.push({
    id: 'cidr-legend-node',
    type: 'legendNode',
    position: {
      x: cloudBoxX + cloudWidth - legendWidth - legendPadding,
      y: cloudBoxY + cloudHeight - legendPadding - 20,
    },
    data: {
      label: 'CIDR Blocks',
      cidrBlocks: cidrBlocks ?? [],
    },
    draggable: true,
    selectable: true,
  });

  return {nodes: layoutNodes, edges};
}

/**
 * Find all VPC resources across stacks.
 */
function findVpcs(nodes: Node[]): VpcInfo[] {
  const vpcs: VpcInfo[] = [];

  nodes.forEach((node) => {
    if (node.data.type === 'AWS::EC2::VPC') {
      vpcs.push({
        id: node.id,
        name: node.data.label || 'VPC',
        resources: [],
      });
    }
  });

  return vpcs;
}

/**
 * Assign resources to their VPCs based on dependencies and properties.
 */
function assignResourcesToVpcs(
  nodes: Node[],
  vpcs: VpcInfo[],
): Map<string, string> {
  const assignments = new Map<string, string>();

  // Simple heuristic: if resource depends on VPC or has VPC in name, assign it
  nodes.forEach((node) => {
    if (node.data.type === 'AWS::EC2::VPC') return;

    // Check if resource ID or label contains VPC ID
    for (const vpc of vpcs) {
      const vpcName = vpc.name.toLowerCase();
      const nodeLabel = (node.data.label || '').toLowerCase();

      // Simple heuristic: assign to first VPC if none specified
      if (vpcs.length === 1) {
        vpc.resources.push(node);
        assignments.set(node.id, vpc.id);
        break;
      }

      // Try to match by name patterns
      if (nodeLabel.includes(vpcName) || nodeLabel.includes('vpc')) {
        vpc.resources.push(node);
        assignments.set(node.id, vpc.id);
        break;
      }
    }

    // If no VPC found and there's at least one VPC, assign to first VPC
    if (!assignments.has(node.id) && vpcs.length > 0) {
      vpcs[0].resources.push(node);
      assignments.set(node.id, vpcs[0].id);
    }
  });

  return assignments;
}
