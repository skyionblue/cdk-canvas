import React, {useCallback} from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  NodeProps,
  EdgeProps,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import './Canvas.css';

interface CanvasProps {
  nodes: Node[];
  edges: Edge[];
  nodeTypes?: Record<string, React.ComponentType<NodeProps>>;
  edgeTypes?: Record<string, React.ComponentType<EdgeProps>>;
  onNodesChange?: (nodes: Node[]) => void;
  onEdgesChange?: (edges: Edge[]) => void;
  onConnect?: OnConnect;
  onEdgeClick?: (event: React.MouseEvent, edge: Edge) => void;
  onNodeDoubleClick?: (event: React.MouseEvent, node: Node) => void;
}

export function Canvas({
  nodes,
  edges,
  nodeTypes,
  edgeTypes,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onEdgeClick,
  onNodeDoubleClick,
}: CanvasProps) {
  const [localNodes, setLocalNodes] = React.useState<Node[]>(nodes);
  const [localEdges, setLocalEdges] = React.useState<Edge[]>(edges);

  React.useEffect(() => {
    setLocalNodes(nodes);
  }, [nodes]);

  React.useEffect(() => {
    setLocalEdges(edges);
  }, [edges]);

  const handleNodesChange: OnNodesChange = useCallback(
    (changes) => {
      // Filter out any "remove" changes to prevent node deletion
      const filteredChanges = changes.filter(
        (change) => change.type !== 'remove',
      );
      const updatedNodes = applyNodeChanges(filteredChanges, localNodes);
      setLocalNodes(updatedNodes);
      onNodesChange?.(updatedNodes);
    },
    [localNodes, onNodesChange],
  );

  const handleEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      const updatedEdges = applyEdgeChanges(changes, localEdges);
      setLocalEdges(updatedEdges);
      onEdgesChange?.(updatedEdges);
    },
    [localEdges, onEdgesChange],
  );

  return (
    <div className="canvas-container">
      <ReactFlow
        nodes={localNodes}
        edges={localEdges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onEdgeClick={onEdgeClick}
        onNodeDoubleClick={onNodeDoubleClick}
        selectNodesOnDrag={false}
        panOnDrag={[1, 2]}
        selectionOnDrag={true}
        multiSelectionKeyCode="Control"
        fitView
        minZoom={0.1}
        maxZoom={2}
        defaultViewport={{x: 0, y: 0, zoom: 0.8}}
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            if (node.data?.isImported) {
              return '#fbbf24';
            }
            return '#3b82f6';
          }}
          maskColor="rgba(0, 0, 0, 0.1)"
        />
      </ReactFlow>
    </div>
  );
}
