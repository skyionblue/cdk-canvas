import React, {useState, useEffect, useMemo, useCallback} from 'react';
import {
  ReactFlowProvider,
  useReactFlow,
  getNodesBounds,
  getViewportForBounds,
  Edge,
  Node,
} from 'reactflow';
import {toPng} from 'html-to-image';
import {Canvas} from './components/Canvas';
import {Sidebar} from './components/Sidebar';
import {Toolbar} from './components/Toolbar';
import {ResourceNode} from './components/Canvas/ResourceNode';
import {StackGroup} from './components/Canvas/StackGroup';
import {LegendNode} from './components/Canvas/LegendNode';
import {CustomEdge} from './components/Canvas/CustomEdge';
import {TextAnnotation} from './components/Canvas/TextAnnotation';
import {CalloutAnnotation} from './components/Canvas/CalloutAnnotation';
import {HighlightBox} from './components/Canvas/HighlightBox';
import {EdgeEditor} from './components/EdgeEditor/EdgeEditor';
import {NodeCreator} from './components/NodeCreator/NodeCreator';
import {GroupCreator} from './components/GroupCreator/GroupCreator';
import {GroupEditor} from './components/GroupEditor/GroupEditor';
import {CustomGroup} from './components/Canvas/CustomGroup';
import {LayersPanel} from './components/LayersPanel/LayersPanel';
import {
  ExportDialog,
  ExportOptions,
} from './components/ExportDialog/ExportDialog';
import {NodeInspector} from './components/NodeInspector/NodeInspector';
import {CloudBoxEditor} from './components/CloudBoxEditor/CloudBoxEditor';
import {LegendEditor} from './components/LegendEditor/LegendEditor';
import {
  StylingPanel,
  StylingOptions,
  NodeStyle,
} from './components/StylingPanel';
import {AnnotationEditor} from './components/AnnotationEditor';
import {SecurityPanel} from './components/SecurityPanel';
import {CloudBoxEditorProvider} from './contexts/CloudBoxEditorContext';
import {ThemeProvider} from './contexts/ThemeContext';
import {
  scanForSecurityIssues,
  groupIssuesByResource,
  SecurityIssue,
} from './lib/security-scanner';
import {apiClient} from './lib/api-client';
import {stackToFlow} from './lib/stack-to-flow';
import {multiStackToFlow} from './lib/multi-stack-to-flow';
import {LayoutMode} from './lib/layout-algorithms';
import {applyTopologyFilter} from './lib/topology-filter';
import {computeTransitiveEdges} from './lib/transitive-edges';
import {CdkStack} from './types';
import {
  CustomEdgeData,
  DEFAULT_EDGE_STYLE,
  CLOUDFORMATION_EDGE_STYLE,
} from './types/custom-edge';
import './theme.css';
import './App.css';

const nodeTypes = {
  resourceNode: ResourceNode,
  group: StackGroup,
  customGroup: CustomGroup,
  legendNode: LegendNode,
  textAnnotation: TextAnnotation,
  calloutAnnotation: CalloutAnnotation,
  highlightBox: HighlightBox,
};

const edgeTypes = {
  custom: CustomEdge,
};

function AppContent() {
  const [stacks, setStacks] = useState<string[]>([]);
  const [selectedStacks, setSelectedStacks] = useState<string[]>([]);
  const [stackDataMap, setStackDataMap] = useState<Record<string, CdkStack>>(
    {},
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('dependency');
  const [hiddenTypes, setHiddenTypes] = useState<Set<string>>(new Set());
  const [baseHiddenTypes, setBaseHiddenTypes] = useState<Set<string>>(
    new Set(),
  );
  const [customEdges, setCustomEdges] = useState<Array<Edge<CustomEdgeData>>>(
    [],
  );
  const [deletedCfnEdgeIds, setDeletedCfnEdgeIds] = useState<Set<string>>(
    new Set(),
  );
  const [selectedEdge, setSelectedEdge] = useState<Edge<CustomEdgeData> | null>(
    null,
  );
  const [customNodes, setCustomNodes] = useState<Node[]>([]);
  const [showNodeCreator, setShowNodeCreator] = useState(false);
  const [showGroupCreator, setShowGroupCreator] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Node | null>(null);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [inspectingNode, setInspectingNode] = useState<Node | null>(null);
  const [editingCloudBox, setEditingCloudBox] = useState<Node | null>(null);
  const [editingLegend, setEditingLegend] = useState<Node | null>(null);
  const [showStylingPanel, setShowStylingPanel] = useState(false);
  const [stylingOptions, setStylingOptions] = useState<StylingOptions>({
    globalFontSize: 14,
    nodeStylesByType: {},
  });
  const [annotations, setAnnotations] = useState<Node[]>([]);
  const [editingAnnotation, setEditingAnnotation] = useState<Node | null>(null);
  const [securityIssues, setSecurityIssues] = useState<SecurityIssue[]>([]);
  const reactFlowInstance = useReactFlow();

  // Auto-apply topology filters when switching layout modes
  useEffect(() => {
    if (layoutMode === 'topology') {
      setHiddenTypes(applyTopologyFilter(baseHiddenTypes));
    } else {
      setHiddenTypes(baseHiddenTypes);
    }
  }, [layoutMode, baseHiddenTypes]);

  // Load stacks list on mount
  useEffect(() => {
    async function loadStacks() {
      try {
        setLoading(true);
        const stacksList = await apiClient.listStacks();
        setStacks(stacksList);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load stacks');
      } finally {
        setLoading(false);
      }
    }
    loadStacks();
  }, []);

  // Load stack data when selected stacks change
  useEffect(() => {
    if (selectedStacks.length === 0) {
      setStackDataMap({});
      return;
    }

    async function loadStacks() {
      try {
        setLoading(true);
        const dataMap: Record<string, CdkStack> = {};

        // Load all selected stacks in parallel
        await Promise.all(
          selectedStacks.map(async (stackName) => {
            const data = await apiClient.getStack(stackName);
            dataMap[stackName] = data;
          }),
        );

        setStackDataMap(dataMap);
        setError(null);

        // Run security scan
        const issues = scanForSecurityIssues(dataMap);
        setSecurityIssues(issues);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load stacks');
      } finally {
        setLoading(false);
      }
    }
    loadStacks();
  }, [selectedStacks]);

  // Handle stack toggle
  const handleToggleStack = useCallback((stackName: string) => {
    setSelectedStacks((prev) => {
      if (prev.includes(stackName)) {
        return prev.filter((s) => s !== stackName);
      }
      return [...prev, stackName];
    });
  }, []);

  // Handle toggle resource type visibility
  const handleToggleType = useCallback((type: string) => {
    setBaseHiddenTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  }, []);

  // Handle new connection (drag from handle to handle)
  const handleConnect = useCallback(
    (connection: {
      source: string | null;
      target: string | null;
      sourceHandle?: string | null;
      targetHandle?: string | null;
    }) => {
      if (!connection.source || !connection.target) return;

      const newEdge: Edge<CustomEdgeData> = {
        id: `custom-${connection.source}-${connection.target}-${Date.now()}`,
        source: connection.source,
        target: connection.target,
        sourceHandle: connection.sourceHandle || undefined,
        targetHandle: connection.targetHandle || undefined,
        type: 'custom',
        data: {
          isCustom: true,
          ...DEFAULT_EDGE_STYLE,
        },
      };
      setCustomEdges((prev) => [...prev, newEdge]);
    },
    [],
  );

  // Handle edge click
  const handleEdgeClick = useCallback(
    (_event: React.MouseEvent, edge: Edge) => {
      setSelectedEdge(edge as Edge<CustomEdgeData>);
    },
    [],
  );

  // Handle update edge
  const handleUpdateEdge = useCallback(
    (edgeId: string, data: Partial<CustomEdgeData>) => {
      // Update custom edges array
      setCustomEdges((prev) =>
        prev.map((edge) => {
          if (edge.id === edgeId) {
            return {
              ...edge,
              data: {
                ...edge.data,
                ...data,
              },
            } as Edge<CustomEdgeData>;
          }
          return edge;
        }),
      );
    },
    [],
  );

  // Handle delete edge
  const handleDeleteEdge = useCallback(
    (edgeId: string) => {
      // Check if it's a custom edge
      const isCustomEdge = customEdges.some((edge) => edge.id === edgeId);

      if (isCustomEdge) {
        // Remove from custom edges
        setCustomEdges((prev) => prev.filter((edge) => edge.id !== edgeId));
      } else {
        // It's a CloudFormation edge - track as deleted
        setDeletedCfnEdgeIds((prev) => new Set(prev).add(edgeId));
      }
    },
    [customEdges],
  );

  // Handle create custom node
  const handleCreateNode = useCallback(
    (resourceType: string, label: string) => {
      const iconPath = getIconPath(resourceType);

      // Create node at center of viewport
      const viewport = reactFlowInstance.getViewport();
      const centerX = -viewport.x / viewport.zoom + 400;
      const centerY = -viewport.y / viewport.zoom + 300;

      const newNode: Node = {
        id: `custom-node-${Date.now()}`,
        type: 'resourceNode',
        position: {x: centerX, y: centerY},
        data: {
          label,
          type: resourceType,
          iconPath,
          isImported: false,
        },
      };

      setCustomNodes((prev) => [...prev, newNode]);
    },
    [reactFlowInstance],
  );

  // Helper to get icon path for resource type
  const getIconPath = (resourceType: string): string => {
    const iconSize = 32;
    const basePath = '/assets/aws-icons/Architecture-Service-Icons_04302026';

    const iconMap: Record<string, string> = {
      'AWS::Lambda::Function': `${basePath}/Arch_Compute/${iconSize}/Arch_AWS-Lambda_${iconSize}.svg`,
      'AWS::EC2::Instance': `${basePath}/Arch_Compute/${iconSize}/Arch_Amazon-EC2_${iconSize}.svg`,
      'AWS::ECS::Service': `${basePath}/Arch_Containers/${iconSize}/Arch_Amazon-Elastic-Container-Service_${iconSize}.svg`,
      'AWS::ECS::Cluster': `${basePath}/Arch_Containers/${iconSize}/Arch_Amazon-Elastic-Container-Service_${iconSize}.svg`,
      'AWS::EKS::Cluster': `${basePath}/Arch_Containers/${iconSize}/Arch_Amazon-Elastic-Kubernetes-Service_${iconSize}.svg`,
      'AWS::S3::Bucket': `${basePath}/Arch_Storage/${iconSize}/Arch_Amazon-Simple-Storage-Service_${iconSize}.svg`,
      'AWS::EFS::FileSystem': `${basePath}/Arch_Storage/${iconSize}/Arch_Amazon-Elastic-File-System_${iconSize}.svg`,
      'AWS::FSx::FileSystem': `${basePath}/Arch_Storage/${iconSize}/Arch_Amazon-FSx_${iconSize}.svg`,
      'AWS::DynamoDB::Table': `${basePath}/Arch_Databases/${iconSize}/Arch_Amazon-DynamoDB_${iconSize}.svg`,
      'AWS::RDS::DBInstance': `${basePath}/Arch_Databases/${iconSize}/Arch_Amazon-RDS_${iconSize}.svg`,
      'AWS::RDS::DBCluster': `${basePath}/Arch_Databases/${iconSize}/Arch_Amazon-Aurora_${iconSize}.svg`,
      'AWS::ElastiCache::CacheCluster': `${basePath}/Arch_Databases/${iconSize}/Arch_Amazon-ElastiCache_${iconSize}.svg`,
      'AWS::Neptune::DBCluster': `${basePath}/Arch_Databases/${iconSize}/Arch_Amazon-Neptune_${iconSize}.svg`,
      'AWS::DocumentDB::DBCluster': `${basePath}/Arch_Databases/${iconSize}/Arch_Amazon-DocumentDB_${iconSize}.svg`,
      'AWS::Redshift::Cluster': `${basePath}/Arch_Databases/${iconSize}/Arch_Amazon-Redshift_${iconSize}.svg`,
      'AWS::EC2::VPC': `${basePath}/Arch_Networking-Content-Delivery/${iconSize}/Arch_Amazon-Virtual-Private-Cloud_${iconSize}.svg`,
      'AWS::EC2::Subnet': `${basePath}/Arch_Networking-Content-Delivery/${iconSize}/Arch_Amazon-Virtual-Private-Cloud_${iconSize}.svg`,
      'AWS::EC2::InternetGateway': `${basePath}/Arch_Networking-Content-Delivery/${iconSize}/Arch_Amazon-Virtual-Private-Cloud_${iconSize}.svg`,
      'AWS::EC2::NatGateway': `${basePath}/Arch_Networking-Content-Delivery/${iconSize}/Arch_Amazon-Virtual-Private-Cloud_${iconSize}.svg`,
      'AWS::ElasticLoadBalancingV2::LoadBalancer': `${basePath}/Arch_Networking-Content-Delivery/${iconSize}/Arch_Elastic-Load-Balancing_${iconSize}.svg`,
      'AWS::ApiGateway::RestApi': `${basePath}/Arch_Networking-Content-Delivery/${iconSize}/Arch_Amazon-API-Gateway_${iconSize}.svg`,
      'AWS::ApiGatewayV2::Api': `${basePath}/Arch_Networking-Content-Delivery/${iconSize}/Arch_Amazon-API-Gateway_${iconSize}.svg`,
      'AWS::SQS::Queue': `${basePath}/Arch_App-Integration/${iconSize}/Arch_Amazon-Simple-Queue-Service_${iconSize}.svg`,
      'AWS::SNS::Topic': `${basePath}/Arch_App-Integration/${iconSize}/Arch_Amazon-Simple-Notification-Service_${iconSize}.svg`,
      'AWS::Kinesis::Stream': `${basePath}/Arch_Analytics/${iconSize}/Arch_Amazon-Kinesis_${iconSize}.svg`,
      'AWS::Events::Rule': `${basePath}/Arch_App-Integration/${iconSize}/Arch_Amazon-EventBridge_${iconSize}.svg`,
      'AWS::StepFunctions::StateMachine': `${basePath}/Arch_App-Integration/${iconSize}/Arch_AWS-Step-Functions_${iconSize}.svg`,
      'AWS::IAM::Role': `${basePath}/Arch_Security-Identity-Compliance/${iconSize}/Arch_AWS-Identity-and-Access-Management_${iconSize}.svg`,
      'AWS::SecretsManager::Secret': `${basePath}/Arch_Security-Identity-Compliance/${iconSize}/Arch_AWS-Secrets-Manager_${iconSize}.svg`,
      'AWS::KMS::Key': `${basePath}/Arch_Security-Identity-Compliance/${iconSize}/Arch_AWS-Key-Management-Service_${iconSize}.svg`,
      'AWS::CertificateManager::Certificate': `${basePath}/Arch_Security-Identity-Compliance/${iconSize}/Arch_AWS-Certificate-Manager_${iconSize}.svg`,
      'AWS::CloudFront::Distribution': `${basePath}/Arch_Networking-Content-Delivery/${iconSize}/Arch_Amazon-CloudFront_${iconSize}.svg`,
      'AWS::Route53::HostedZone': `${basePath}/Arch_Networking-Content-Delivery/${iconSize}/Arch_Amazon-Route-53_${iconSize}.svg`,
      'AWS::CloudWatch::Alarm': `${basePath}/Arch_Management-Governance/${iconSize}/Arch_Amazon-CloudWatch_${iconSize}.svg`,
      'AWS::Logs::LogGroup': `${basePath}/Arch_Management-Governance/${iconSize}/Arch_Amazon-CloudWatch_${iconSize}.svg`,
      'AWS::Glue::Database': `${basePath}/Arch_Analytics/${iconSize}/Arch_AWS-Glue_${iconSize}.svg`,
      'AWS::Athena::WorkGroup': `${basePath}/Arch_Analytics/${iconSize}/Arch_Amazon-Athena_${iconSize}.svg`,
      'AWS::CodeBuild::Project': `${basePath}/Arch_Developer-Tools/${iconSize}/Arch_AWS-CodeBuild_${iconSize}.svg`,
      'AWS::CodePipeline::Pipeline': `${basePath}/Arch_Developer-Tools/${iconSize}/Arch_AWS-CodePipeline_${iconSize}.svg`,
      'AWS::CodeDeploy::Application': `${basePath}/Arch_Developer-Tools/${iconSize}/Arch_AWS-CodeDeploy_${iconSize}.svg`,
    };

    return (
      iconMap[resourceType] ||
      `${basePath}/Arch_Management-Governance/${iconSize}/Arch_AWS-CloudFormation_${iconSize}.svg`
    );
  };

  // Handle create group from selected nodes
  const handleCreateGroup = useCallback(
    (label: string, color: string) => {
      const selectedNodes = reactFlowInstance
        .getNodes()
        .filter((node) => node.selected && node.type === 'resourceNode');

      if (selectedNodes.length === 0) return;

      // Calculate bounding box of selected nodes
      const padding = 40;
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;

      selectedNodes.forEach((node) => {
        const x = node.position.x;
        const y = node.position.y;
        const width = 200; // Approximate node width
        const height = 140; // Approximate node height

        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x + width);
        maxY = Math.max(maxY, y + height);
      });

      // Create group node
      const groupNode: Node = {
        id: `custom-group-${Date.now()}`,
        type: 'customGroup',
        position: {
          x: minX - padding,
          y: minY - padding,
        },
        style: {
          width: maxX - minX + padding * 2,
          height: maxY - minY + padding * 2,
          zIndex: -1,
        },
        data: {
          label,
          color,
        },
        draggable: true,
        selectable: true,
      };

      setCustomNodes((prev) => [...prev, groupNode]);

      // Deselect nodes after grouping
      const updatedNodes = reactFlowInstance
        .getNodes()
        .map((node) => ({...node, selected: false}));
      reactFlowInstance.setNodes(updatedNodes);
    },
    [reactFlowInstance],
  );

  // Handle edit group
  const handleEditGroup = useCallback(
    (groupId: string) => {
      const group = customNodes.find((node) => node.id === groupId);
      if (group) {
        setEditingGroup(group);
      }
    },
    [customNodes],
  );

  // Handle update group
  const handleUpdateGroup = useCallback(
    (groupId: string, label: string, color: string) => {
      setCustomNodes((prev) =>
        prev.map((node) =>
          node.id === groupId
            ? {...node, data: {...node.data, label, color}}
            : node,
        ),
      );
    },
    [],
  );

  // Handle delete group (only custom groups can be deleted)
  const handleDeleteGroup = useCallback(
    (groupId: string) => {
      // Only allow deletion of custom groups
      const isCustomGroup = customNodes.some(
        (n) => n.id === groupId && n.type === 'customGroup',
      );

      if (!isCustomGroup) {
        alert('System layers (AWS Cloud, VPC, Legend) cannot be deleted.');
        return;
      }

      if (confirm('Are you sure you want to delete this group?')) {
        setCustomNodes((prev) => prev.filter((node) => node.id !== groupId));
      }
    },
    [customNodes],
  );

  // Handle toggle group visibility
  const handleToggleGroupVisibility = useCallback(
    (groupId: string) => {
      // Check if it's a custom node
      const isCustomNode = customNodes.some((n) => n.id === groupId);

      if (isCustomNode) {
        // Update custom nodes
        setCustomNodes((prev) =>
          prev.map((node) =>
            node.id === groupId ? {...node, hidden: !node.hidden} : node,
          ),
        );
      } else {
        // Update React Flow nodes (topology boxes, legend, etc.)
        const allNodes = reactFlowInstance.getNodes();
        const updatedNodes = allNodes.map((node) =>
          node.id === groupId ? {...node, hidden: !node.hidden} : node,
        );
        reactFlowInstance.setNodes(updatedNodes);
      }
    },
    [customNodes, reactFlowInstance],
  );

  // Handle select group
  const handleSelectGroup = useCallback(
    (groupId: string) => {
      const allNodes = reactFlowInstance.getNodes();
      const updatedNodes = allNodes.map((node) => ({
        ...node,
        selected: node.id === groupId,
      }));
      reactFlowInstance.setNodes(updatedNodes);
    },
    [reactFlowInstance],
  );

  // Handle node double click (for all nodes, cloud box, and VPC boxes)
  const handleNodeDoubleClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      // Open legend editor for legend nodes
      if (node.type === 'legendNode') {
        setEditingLegend(node);
        return;
      }

      // Open annotation editor for annotations
      if (
        node.type === 'textAnnotation' ||
        node.type === 'calloutAnnotation' ||
        node.type === 'highlightBox'
      ) {
        setEditingAnnotation(node);
        return;
      }

      // Open inspector for any resource node
      if (node.type === 'resourceNode') {
        setInspectingNode(node);
      }
    },
    [],
  );

  // Handler for opening cloud/VPC box editor (called from badge click)
  const handleOpenCloudBoxEditor = useCallback((node: Node) => {
    setEditingCloudBox(node);
  }, []);

  // Handle update node (custom or CloudFormation)
  const handleUpdateNode = useCallback(
    (
      nodeId: string,
      label: string,
      notes?: string,
      properties?: Record<string, unknown>,
    ) => {
      // Check if it's a custom node
      const isCustomNode = customNodes.some((n) => n.id === nodeId);

      if (isCustomNode) {
        // Update custom node
        setCustomNodes((prev) =>
          prev.map((node) =>
            node.id === nodeId
              ? {
                  ...node,
                  data: {
                    ...node.data,
                    label,
                    customNotes: notes,
                    cfnProperties: properties,
                  },
                }
              : node,
          ),
        );
      } else {
        // Update CloudFormation node in React Flow
        const allNodes = reactFlowInstance.getNodes();
        const updatedNodes = allNodes.map((node) =>
          node.id === nodeId
            ? {
                ...node,
                data: {
                  ...node.data,
                  label,
                  customNotes: notes,
                  cfnProperties: properties,
                  isModified: true,
                },
              }
            : node,
        );
        reactFlowInstance.setNodes(updatedNodes);
      }
    },
    [customNodes, reactFlowInstance],
  );

  // Handle delete node (custom nodes only)
  const handleDeleteNode = useCallback((nodeId: string) => {
    setCustomNodes((prev) => prev.filter((node) => node.id !== nodeId));
  }, []);

  // Handle update cloud/VPC box
  const handleUpdateCloudBox = useCallback(
    (
      width: number,
      height: number,
      backgroundColor: string,
      borderColor: string,
    ) => {
      if (!editingCloudBox) return;

      const allNodes = reactFlowInstance.getNodes();
      const updatedNodes = allNodes.map((node) =>
        node.id === editingCloudBox.id
          ? {
              ...node,
              style: {
                ...node.style,
                width,
                height,
                backgroundColor,
                border: `${node.data?.isVpcBox ? '3px' : '4px'} solid ${borderColor}`,
              },
            }
          : node,
      );
      reactFlowInstance.setNodes(updatedNodes);
    },
    [editingCloudBox, reactFlowInstance],
  );

  // Handle update legend
  const handleUpdateLegend = useCallback(
    (nodeId: string, updatedBlocks: unknown) => {
      const allNodes = reactFlowInstance.getNodes();
      const updatedNodes = allNodes.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              data: {
                ...node.data,
                cidrBlocks: updatedBlocks,
              },
            }
          : node,
      );
      reactFlowInstance.setNodes(updatedNodes);
    },
    [reactFlowInstance],
  );

  // Handle update styling options
  const handleUpdateStyling = useCallback(
    (options: Partial<StylingOptions>) => {
      setStylingOptions((prev) => ({...prev, ...options}));
    },
    [],
  );

  // Handle apply style to selected nodes
  const handleApplyStyleToSelected = useCallback(
    (style: NodeStyle) => {
      const allNodes = reactFlowInstance.getNodes();
      const updatedNodes = allNodes.map((node) => {
        if (node.selected && node.type === 'resourceNode') {
          return {
            ...node,
            data: {
              ...node.data,
              customStyle: {...node.data.customStyle, ...style},
            },
          };
        }
        return node;
      });
      reactFlowInstance.setNodes(updatedNodes);
    },
    [reactFlowInstance],
  );

  // Handle align nodes
  const handleAlignNodes = useCallback(
    (
      alignment: 'left' | 'right' | 'top' | 'bottom' | 'center-h' | 'center-v',
    ) => {
      const allNodes = reactFlowInstance.getNodes();
      const selectedNodes = allNodes.filter(
        (node) => node.selected && node.type === 'resourceNode',
      );

      if (selectedNodes.length < 2) return;

      const nodeWidth = 200;
      const nodeHeight = 140;
      let alignValue = 0;

      if (alignment === 'left') {
        alignValue = Math.min(...selectedNodes.map((n) => n.position.x));
        selectedNodes.forEach((node) => {
          node.position.x = alignValue;
        });
      } else if (alignment === 'right') {
        alignValue = Math.max(
          ...selectedNodes.map((n) => n.position.x + nodeWidth),
        );
        selectedNodes.forEach((node) => {
          node.position.x = alignValue - nodeWidth;
        });
      } else if (alignment === 'top') {
        alignValue = Math.min(...selectedNodes.map((n) => n.position.y));
        selectedNodes.forEach((node) => {
          node.position.y = alignValue;
        });
      } else if (alignment === 'bottom') {
        alignValue = Math.max(
          ...selectedNodes.map((n) => n.position.y + nodeHeight),
        );
        selectedNodes.forEach((node) => {
          node.position.y = alignValue - nodeHeight;
        });
      } else if (alignment === 'center-h') {
        const avgX =
          selectedNodes.reduce(
            (sum, n) => sum + n.position.x + nodeWidth / 2,
            0,
          ) / selectedNodes.length;
        selectedNodes.forEach((node) => {
          node.position.x = avgX - nodeWidth / 2;
        });
      } else if (alignment === 'center-v') {
        const avgY =
          selectedNodes.reduce(
            (sum, n) => sum + n.position.y + nodeHeight / 2,
            0,
          ) / selectedNodes.length;
        selectedNodes.forEach((node) => {
          node.position.y = avgY - nodeHeight / 2;
        });
      }

      reactFlowInstance.setNodes([...allNodes]);
    },
    [reactFlowInstance],
  );

  // Handle distribute nodes
  const handleDistributeNodes = useCallback(
    (direction: 'horizontal' | 'vertical') => {
      const allNodes = reactFlowInstance.getNodes();
      const selectedNodes = allNodes.filter(
        (node) => node.selected && node.type === 'resourceNode',
      );

      if (selectedNodes.length < 3) return;

      // const nodeWidth = 200;
      // const nodeHeight = 140;

      if (direction === 'horizontal') {
        // Sort by X position
        const sorted = [...selectedNodes].sort(
          (a, b) => a.position.x - b.position.x,
        );
        const first = sorted[0];
        const last = sorted[sorted.length - 1];
        const totalSpace = last.position.x - first.position.x;
        const spacing = totalSpace / (sorted.length - 1);

        sorted.forEach((node, index) => {
          node.position.x = first.position.x + spacing * index;
        });
      } else {
        // Sort by Y position
        const sorted = [...selectedNodes].sort(
          (a, b) => a.position.y - b.position.y,
        );
        const first = sorted[0];
        const last = sorted[sorted.length - 1];
        const totalSpace = last.position.y - first.position.y;
        const spacing = totalSpace / (sorted.length - 1);

        sorted.forEach((node, index) => {
          node.position.y = first.position.y + spacing * index;
        });
      }

      reactFlowInstance.setNodes([...allNodes]);
    },
    [reactFlowInstance],
  );

  // Handle add annotation
  const handleAddAnnotation = useCallback(
    (type: 'text' | 'callout' | 'highlight') => {
      const viewport = reactFlowInstance.getViewport();
      const centerX = -viewport.x / viewport.zoom + 400;
      const centerY = -viewport.y / viewport.zoom + 300;

      let newAnnotation: Node;

      if (type === 'text') {
        newAnnotation = {
          id: `annotation-text-${Date.now()}`,
          type: 'textAnnotation',
          position: {x: centerX, y: centerY},
          data: {
            text: 'Double-click to edit',
            color: '#fff59d',
            fontSize: 14,
            width: 200,
            height: 100,
          },
          draggable: true,
          selectable: true,
        };
      } else if (type === 'callout') {
        newAnnotation = {
          id: `annotation-callout-${Date.now()}`,
          type: 'calloutAnnotation',
          position: {x: centerX, y: centerY},
          data: {
            text: 'Add callout text',
            color: '#e3f2fd',
            fontSize: 13,
            arrowPosition: 'right',
          },
          draggable: true,
          selectable: true,
        };
      } else {
        // highlight
        newAnnotation = {
          id: `annotation-highlight-${Date.now()}`,
          type: 'highlightBox',
          position: {x: centerX, y: centerY},
          data: {
            label: '',
            color: '#fff59d',
            width: 300,
            height: 200,
            opacity: 0.3,
          },
          draggable: true,
          selectable: true,
          style: {zIndex: -5},
        };
      }

      setAnnotations((prev) => [...prev, newAnnotation]);
    },
    [reactFlowInstance],
  );

  // Handle update annotation
  const handleUpdateAnnotation = useCallback(
    (nodeId: string, updates: Record<string, unknown>) => {
      setAnnotations((prev) =>
        prev.map((node) =>
          node.id === nodeId
            ? {...node, data: {...node.data, ...updates}}
            : node,
        ),
      );
    },
    [],
  );

  // Handle delete annotation
  const handleDeleteAnnotation = useCallback((nodeId: string) => {
    setAnnotations((prev) => prev.filter((node) => node.id !== nodeId));
  }, []);

  // Handle highlight resource from security panel
  const handleHighlightResource = useCallback(
    (resourceId: string) => {
      const allNodes = reactFlowInstance.getNodes();
      const updatedNodes = allNodes.map((node) => ({
        ...node,
        selected: node.id === resourceId,
      }));
      reactFlowInstance.setNodes(updatedNodes);

      // Find the node and center it
      const targetNode = allNodes.find((n) => n.id === resourceId);
      if (targetNode) {
        reactFlowInstance.setCenter(
          targetNode.position.x + 100,
          targetNode.position.y + 70,
          {zoom: 1.5, duration: 800},
        );
      }
    },
    [reactFlowInstance],
  );

  // Convert stacks to React Flow format
  const {nodes, edges, availableTypes} = useMemo(() => {
    if (Object.keys(stackDataMap).length === 0) {
      return {nodes: [], edges: [], availableTypes: []};
    }

    // Group security issues by resource
    const issuesByResource = groupIssuesByResource(securityIssues);

    // Helper function to extract property value (handles strings and CloudFormation intrinsics)
    const extractPropertyValue = (prop: unknown): string | null => {
      if (typeof prop === 'string') {
        return prop;
      }
      if (prop && typeof prop === 'object') {
        const obj = prop as Record<string, unknown>;
        // Handle Ref
        if ('Ref' in obj) {
          return `{Ref: ${obj.Ref}}`;
        }
        // Handle Fn::GetAtt
        if ('Fn::GetAtt' in obj) {
          const attr = Array.isArray(obj['Fn::GetAtt'])
            ? (obj['Fn::GetAtt'] as string[]).join('.')
            : obj['Fn::GetAtt'];
          return `{GetAtt: ${attr}}`;
        }
        // Handle Fn::ImportValue
        if ('Fn::ImportValue' in obj) {
          return `{Import: ${obj['Fn::ImportValue']}}`;
        }
        // Handle other intrinsics
        const keys = Object.keys(obj);
        if (keys.length > 0) {
          return `{${keys[0]}: ...}`;
        }
      }
      return null;
    };

    // Extract CIDR blocks for topology mode (before layout)
    const cidrBlocks: Array<{
      name: string;
      cidr: string;
      type: 'vpc' | 'subnet';
      color: string;
    }> = [];

    if (layoutMode === 'topology') {
      // Parse VPC and Subnet resources from all selected stacks
      Object.values(stackDataMap).forEach((stack) => {
        Object.values(stack.resources).forEach((resource) => {
          // Extract VPCs
          if (resource.type === 'AWS::EC2::VPC') {
            const cidrBlock = extractPropertyValue(
              resource.properties?.CidrBlock,
            );
            if (cidrBlock) {
              cidrBlocks.push({
                name: resource.id,
                cidr: cidrBlock,
                type: 'vpc',
                color: '#4caf50', // Green for VPCs
              });
            }
          }

          // Extract Subnets
          if (resource.type === 'AWS::EC2::Subnet') {
            const cidrBlock = extractPropertyValue(
              resource.properties?.CidrBlock,
            );
            if (cidrBlock) {
              cidrBlocks.push({
                name: resource.id,
                cidr: cidrBlock,
                type: 'subnet',
                color: '#2196f3', // Blue for Subnets
              });
            }
          }
        });
      });
    }

    let result;
    // If only one stack, use single-stack flow
    if (selectedStacks.length === 1) {
      const stackName = selectedStacks[0];
      result = stackToFlow(stackDataMap[stackName], layoutMode, cidrBlocks);
    } else {
      // Multi-stack: merge and convert
      result = multiStackToFlow(stackDataMap, layoutMode, cidrBlocks);
    }

    // Collect all unique resource types
    const types = new Set<string>();
    result.nodes.forEach((node) => {
      if (node.data.type) {
        types.add(node.data.type);
      }
    });

    // Filter out hidden types and apply styling + security issues
    const filteredNodes = result.nodes
      .filter((node) => {
        return !hiddenTypes.has(node.data.type);
      })
      .map((node) => {
        // Get security issue count for this node
        const nodeIssues = issuesByResource.get(node.id);
        const securityIssueCount = nodeIssues ? nodeIssues.length : 0;

        // Apply type-specific styling
        const typeStyle = stylingOptions.nodeStylesByType[node.data.type];
        if (typeStyle && node.type === 'resourceNode') {
          return {
            ...node,
            data: {
              ...node.data,
              customStyle: {
                ...node.data.customStyle,
                ...typeStyle,
                fontSize: typeStyle.fontSize || stylingOptions.globalFontSize,
              },
              securityIssues: securityIssueCount,
            },
          };
        }
        // Apply global font size and security issues
        if (node.type === 'resourceNode') {
          return {
            ...node,
            data: {
              ...node.data,
              customStyle: {
                ...node.data.customStyle,
                fontSize:
                  node.data.customStyle?.fontSize ||
                  stylingOptions.globalFontSize,
              },
              securityIssues: securityIssueCount,
            },
          };
        }
        return node;
      });

    // Filter edges to only visible resource nodes
    // Exclude group nodes (VPC, AWS Cloud, Stack groups) from edge computation
    const resourceNodeIds = new Set(
      filteredNodes.filter((n) => n.type === 'resourceNode').map((n) => n.id),
    );

    // Compute transitive edges (traverse through hidden nodes to find connections)
    const cfnEdges = computeTransitiveEdges(result.edges, resourceNodeIds);

    // Mark CloudFormation edges and apply default styling
    const styledCfnEdges: Array<Edge<CustomEdgeData>> = cfnEdges
      .filter((edge) => !deletedCfnEdgeIds.has(edge.id))
      .map((edge) => ({
        ...edge,
        type: 'custom',
        data: {
          isCustom: false,
          ...CLOUDFORMATION_EDGE_STYLE,
        },
      }));

    // Filter custom edges to only visible nodes
    const visibleCustomEdges = customEdges.filter(
      (edge) =>
        resourceNodeIds.has(edge.source) && resourceNodeIds.has(edge.target),
    );

    // Combine CloudFormation and custom edges
    const allEdges = [...styledCfnEdges, ...visibleCustomEdges];

    // Add custom nodes and annotations to the nodes list
    const allNodes = [...filteredNodes, ...customNodes, ...annotations];

    return {
      nodes: allNodes,
      edges: allEdges,
      availableTypes: Array.from(types),
    };
  }, [
    stackDataMap,
    selectedStacks,
    layoutMode,
    hiddenTypes,
    customEdges,
    deletedCfnEdgeIds,
    customNodes,
    stylingOptions,
    annotations,
    securityIssues,
  ]);

  // Get all group nodes (including topology boxes and legend)
  const groupNodes = useMemo(() => {
    // Include custom groups, topology groups (AWS Cloud, VPC boxes), and legend node
    const customGroups = customNodes.filter(
      (node) => node.type === 'customGroup',
    );
    const topologyGroups = nodes.filter(
      (node) =>
        node.type === 'group' && (node.data?.isCloudBox || node.data?.isVpcBox),
    );
    const legendNodes = nodes.filter((node) => node.type === 'legendNode');
    return [...customGroups, ...topologyGroups, ...legendNodes];
  }, [customNodes, nodes]);

  // Track selected node count from React Flow instance
  const [selectedNodeCount, setSelectedNodeCount] = useState(0);

  // Update selected count when nodes change
  useEffect(() => {
    const updateSelectionCount = () => {
      const currentNodes = reactFlowInstance.getNodes();
      const count = currentNodes.filter(
        (node) => node.selected && node.type === 'resourceNode',
      ).length;
      setSelectedNodeCount(count);
    };

    updateSelectionCount();
    // Poll for selection changes (React Flow doesn't expose selection change events)
    const interval = setInterval(updateSelectionCount, 100);
    return () => clearInterval(interval);
  }, [nodes, reactFlowInstance]);

  // Handle fit view
  const handleFitView = useCallback(() => {
    reactFlowInstance.fitView({padding: 0.2});
  }, [reactFlowInstance]);

  // Auto-fit view when nodes change (for multi-stack layout updates)
  useEffect(() => {
    if (nodes.length > 0) {
      // Small delay to let React Flow render the nodes first
      const timer = setTimeout(() => {
        reactFlowInstance.fitView({padding: 0.2, duration: 400});
      }, 100);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [nodes.length, selectedStacks.length, reactFlowInstance]);

  // Handle save layout
  const handleSaveLayout = useCallback(async () => {
    if (selectedStacks.length === 0) return;

    const defaultName =
      selectedStacks.length === 1 ? selectedStacks[0] : 'multi-stack-diagram';
    const layoutName = prompt('Enter a name for this layout:', defaultName);
    if (!layoutName) return;

    try {
      const flowNodes = reactFlowInstance.getNodes();
      const layout = {
        version: '1.0',
        name: layoutName,
        stackNames: selectedStacks,
        layoutMode,
        nodes: flowNodes.map((node) => ({
          id: node.id,
          position: node.position,
        })),
        created: new Date().toISOString(),
      };

      await apiClient.saveLayout(layoutName, layout);
      alert(`Layout "${layoutName}" saved successfully!`);
    } catch (error) {
      alert(
        `Failed to save layout: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }, [selectedStacks, layoutMode, reactFlowInstance]);

  // Handle load layout
  const handleLoadLayout = useCallback(async () => {
    try {
      const layouts = await apiClient.listLayouts();
      if (layouts.length === 0) {
        alert('No saved layouts found.');
        return;
      }

      const layoutName = prompt(
        `Available layouts:\n${layouts.join('\n')}\n\nEnter layout name to load:`,
      );
      if (!layoutName) return;

      const layout = (await apiClient.getLayout(layoutName)) as {
        layoutMode?: LayoutMode;
        nodes?: Array<{id: string; position: {x: number; y: number}}>;
      };

      // Apply saved positions
      const currentNodes = reactFlowInstance.getNodes();
      const updatedNodes = currentNodes.map((node) => {
        const savedNode = layout.nodes?.find((n) => n.id === node.id);
        if (savedNode) {
          return {...node, position: savedNode.position};
        }
        return node;
      });

      reactFlowInstance.setNodes(updatedNodes);

      // Apply saved layout mode if present
      if (layout.layoutMode) {
        setLayoutMode(layout.layoutMode);
      }

      alert(`Layout "${layoutName}" loaded successfully!`);
    } catch (error) {
      alert(
        `Failed to load layout: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }, [reactFlowInstance, setLayoutMode]);

  // Handle export with options
  const handleExportWithOptions = useCallback(
    async (options: ExportOptions) => {
      if (selectedStacks.length === 0) return;

      try {
        const nodesBounds = getNodesBounds(reactFlowInstance.getNodes());
        const viewport = getViewportForBounds(
          nodesBounds,
          options.width,
          options.height,
          0.5,
          2,
          0.2,
        );

        const viewportElement = document.querySelector(
          '.react-flow__viewport',
        ) as HTMLElement;

        if (!viewportElement) {
          throw new Error('Canvas viewport not found');
        }

        // Create a wrapper with title, footer, and branding
        const wrapper = document.createElement('div');
        wrapper.style.width = `${options.width}px`;
        wrapper.style.height = `${options.height}px`;
        wrapper.style.background = 'white';
        wrapper.style.position = 'relative';
        wrapper.style.fontFamily = 'system-ui, -apple-system, sans-serif';

        // Add logo in upper-left
        if (options.includeBranding) {
          if (options.logoUrl) {
            // Use custom uploaded logo
            const logoImg = document.createElement('img');
            logoImg.src = options.logoUrl;
            logoImg.style.cssText = `
              position: absolute;
              top: 20px;
              left: 20px;
              max-width: 150px;
              max-height: 60px;
              object-fit: contain;
            `;
            wrapper.appendChild(logoImg);
          } else {
            // Use default TrueMark text logo
            const logoDiv = document.createElement('div');
            logoDiv.textContent = 'TrueMark';
            logoDiv.style.cssText = `
              position: absolute;
              top: 20px;
              left: 20px;
              font-size: 24px;
              font-weight: 700;
              color: #2563eb;
              letter-spacing: -0.5px;
            `;
            wrapper.appendChild(logoDiv);
          }
        }

        // Add title
        if (options.title) {
          const titleDiv = document.createElement('div');
          titleDiv.textContent = options.title;
          titleDiv.style.cssText = `
            position: absolute;
            top: 20px;
            left: ${options.includeBranding ? '140px' : '20px'};
            right: 20px;
            font-size: 28px;
            font-weight: 700;
            color: #1e293b;
            text-align: center;
          `;
          wrapper.appendChild(titleDiv);
        }

        // Clone and add diagram
        const diagramClone = viewportElement.cloneNode(true) as HTMLElement;
        diagramClone.style.cssText = `
          position: absolute;
          top: ${options.title ? '80px' : '20px'};
          left: 20px;
          right: 20px;
          bottom: ${options.footer || options.includeBranding ? '80px' : '20px'};
          transform: translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom});
        `;
        wrapper.appendChild(diagramClone);

        // Add footer
        if (options.footer) {
          const footerDiv = document.createElement('div');
          footerDiv.textContent = options.footer;
          footerDiv.style.cssText = `
            position: absolute;
            bottom: 20px;
            left: 20px;
            right: 20px;
            font-size: 14px;
            color: #64748b;
            text-align: center;
          `;
          wrapper.appendChild(footerDiv);
        }

        document.body.appendChild(wrapper);

        let dataUrl: string;
        let fileName: string;

        if (options.format === 'svg') {
          // SVG export (simplified - React Flow doesn't natively support SVG)
          fileName =
            selectedStacks.length === 1
              ? `${selectedStacks[0]}-diagram.svg`
              : 'multi-stack-diagram.svg';
          // For now, convert to PNG then notify user
          dataUrl = await toPng(wrapper, {backgroundColor: '#ffffff'});
          alert(
            'Note: SVG export converts to PNG. Native SVG support coming soon.',
          );
          fileName = fileName.replace('.svg', '.png');
        } else {
          // PNG export
          fileName =
            selectedStacks.length === 1
              ? `${selectedStacks[0]}-diagram.png`
              : 'multi-stack-diagram.png';
          dataUrl = await toPng(wrapper, {backgroundColor: '#ffffff'});
        }

        document.body.removeChild(wrapper);

        // Create download link
        const link = document.createElement('a');
        link.download = fileName;
        link.href = dataUrl;
        link.click();

        alert('Diagram exported successfully!');
      } catch (error) {
        console.error('Export failed:', error);
        alert(
          `Failed to export diagram: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    },
    [selectedStacks, reactFlowInstance],
  );

  return (
    <div className="app">
      <header className="app-header">
        <h1>CDK-Canvas</h1>
        <p>Interactive CDK Diagram Designer</p>
      </header>
      <main className="app-main">
        <Sidebar
          stacks={stacks}
          selectedStacks={selectedStacks}
          onToggleStack={handleToggleStack}
          loading={loading && stacks.length === 0}
          error={error}
        />
        <div className="canvas-wrapper">
          {selectedStacks.length > 0 &&
            Object.keys(stackDataMap).length > 0 && (
              <Toolbar
                layoutMode={layoutMode}
                onLayoutModeChange={setLayoutMode}
                onSaveLayout={handleSaveLayout}
                onLoadLayout={handleLoadLayout}
                onExport={() => setShowExportDialog(true)}
                onFitView={handleFitView}
                availableTypes={availableTypes}
                hiddenTypes={hiddenTypes}
                onToggleType={handleToggleType}
                onAddNode={() => setShowNodeCreator(true)}
                onCreateGroup={() => setShowGroupCreator(true)}
                selectedNodeCount={selectedNodeCount}
                onOpenStyling={() => setShowStylingPanel(true)}
                onAddAnnotation={handleAddAnnotation}
              />
            )}
          {selectedStacks.length === 0 && (
            <div className="canvas-placeholder">
              <h2>Select stacks to visualize</h2>
              <p>
                Choose one or more CDK stacks from the sidebar to get started.
              </p>
            </div>
          )}
          {selectedStacks.length > 0 && loading && (
            <div className="canvas-loading">
              <div className="spinner"></div>
              <p>Loading {selectedStacks.length} stack(s)...</p>
            </div>
          )}
          {selectedStacks.length > 0 &&
            !loading &&
            Object.keys(stackDataMap).length > 0 && (
              <>
                <CloudBoxEditorProvider onOpenEditor={handleOpenCloudBoxEditor}>
                  <Canvas
                    nodes={nodes}
                    edges={edges}
                    nodeTypes={nodeTypes}
                    edgeTypes={edgeTypes}
                    onConnect={handleConnect}
                    onEdgeClick={handleEdgeClick}
                    onNodeDoubleClick={handleNodeDoubleClick}
                  />
                </CloudBoxEditorProvider>
                <EdgeEditor
                  selectedEdge={selectedEdge}
                  onUpdateEdge={handleUpdateEdge}
                  onDeleteEdge={handleDeleteEdge}
                  onClose={() => setSelectedEdge(null)}
                />
                {showNodeCreator && (
                  <NodeCreator
                    onCreateNode={handleCreateNode}
                    onClose={() => setShowNodeCreator(false)}
                  />
                )}
                {showGroupCreator && (
                  <GroupCreator
                    selectedNodeCount={selectedNodeCount}
                    onCreateGroup={handleCreateGroup}
                    onClose={() => setShowGroupCreator(false)}
                  />
                )}
                {editingGroup && (
                  <GroupEditor
                    group={editingGroup}
                    onUpdateGroup={handleUpdateGroup}
                    onClose={() => setEditingGroup(null)}
                  />
                )}
                <LayersPanel
                  groups={groupNodes}
                  annotations={annotations}
                  onEditGroup={handleEditGroup}
                  onDeleteGroup={handleDeleteGroup}
                  onToggleGroupVisibility={handleToggleGroupVisibility}
                  onSelectGroup={handleSelectGroup}
                  onEditAnnotation={setEditingAnnotation}
                  onDeleteAnnotation={handleDeleteAnnotation}
                  onToggleAnnotationVisibility={(annotationId) => {
                    setAnnotations((prev) =>
                      prev.map((a) =>
                        a.id === annotationId ? {...a, hidden: !a.hidden} : a,
                      ),
                    );
                  }}
                />
                {showExportDialog && (
                  <ExportDialog
                    onExport={handleExportWithOptions}
                    onClose={() => setShowExportDialog(false)}
                  />
                )}
                {inspectingNode && (
                  <NodeInspector
                    node={inspectingNode}
                    onUpdateNode={handleUpdateNode}
                    onDeleteNode={handleDeleteNode}
                    onClose={() => setInspectingNode(null)}
                  />
                )}
                {editingCloudBox && (
                  <CloudBoxEditor
                    cloudBox={editingCloudBox}
                    onUpdate={handleUpdateCloudBox}
                    onClose={() => setEditingCloudBox(null)}
                  />
                )}
                {editingLegend && (
                  <LegendEditor
                    legendNode={editingLegend}
                    onUpdate={handleUpdateLegend}
                    onClose={() => setEditingLegend(null)}
                  />
                )}
                {showStylingPanel && (
                  <StylingPanel
                    isOpen={showStylingPanel}
                    onClose={() => setShowStylingPanel(false)}
                    availableTypes={availableTypes}
                    selectedNodes={reactFlowInstance
                      .getNodes()
                      .filter((n) => n.selected && n.type === 'resourceNode')
                      .map((n) => n.id)}
                    stylingOptions={stylingOptions}
                    onUpdateStyling={handleUpdateStyling}
                    onAlignNodes={handleAlignNodes}
                    onDistributeNodes={handleDistributeNodes}
                    onApplyStyleToSelected={handleApplyStyleToSelected}
                  />
                )}
                {editingAnnotation && (
                  <AnnotationEditor
                    annotation={editingAnnotation}
                    onUpdate={handleUpdateAnnotation}
                    onDelete={handleDeleteAnnotation}
                    onClose={() => setEditingAnnotation(null)}
                  />
                )}
                {securityIssues.length > 0 && (
                  <SecurityPanel
                    issues={securityIssues}
                    onHighlightResource={handleHighlightResource}
                  />
                )}
              </>
            )}
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <ReactFlowProvider>
        <AppContent />
      </ReactFlowProvider>
    </ThemeProvider>
  );
}

export default App;
