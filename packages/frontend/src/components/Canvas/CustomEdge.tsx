import React from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getSmoothStepPath,
} from 'reactflow';
import {CustomEdgeData} from '../../types/custom-edge';
import './CustomEdge.css';

export function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd,
  selected,
}: EdgeProps<CustomEdgeData>) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 8,
  });

  const color = data?.color || '#94a3b8';
  const strokeWidth = data?.strokeWidth || 1.5;
  const dashed = data?.dashed || false;
  const isCustom = data?.isCustom || false;

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          stroke: color,
          strokeWidth: selected ? strokeWidth + 1 : strokeWidth,
          strokeDasharray: dashed ? '5,5' : 'none',
          opacity: isCustom ? 1 : 0.6,
        }}
      />
      {data?.label && (
        <EdgeLabelRenderer>
          <div
            className="custom-edge-label"
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
              backgroundColor: isCustom ? color : '#94a3b8',
            }}
          >
            {data.label}
          </div>
        </EdgeLabelRenderer>
      )}
      {isCustom && (
        <EdgeLabelRenderer>
          <div
            className="custom-edge-badge"
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX + 60}px,${labelY - 20}px)`,
              pointerEvents: 'none',
            }}
          >
            ✏️
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
