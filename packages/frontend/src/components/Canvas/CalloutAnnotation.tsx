import React from 'react';
import {NodeProps, Handle, Position} from 'reactflow';
import './CalloutAnnotation.css';

export interface CalloutAnnotationData {
  text: string;
  color: string;
  fontSize: number;
  arrowPosition: 'top' | 'right' | 'bottom' | 'left';
}

export function CalloutAnnotation({
  data,
  selected,
}: NodeProps<CalloutAnnotationData>) {
  const {text, color, fontSize, arrowPosition = 'right'} = data;

  // Determine which handle to show based on arrow position
  const handlePosition = {
    top: Position.Top,
    right: Position.Right,
    bottom: Position.Bottom,
    left: Position.Left,
  }[arrowPosition];

  return (
    <div
      className={`callout-annotation ${selected ? 'selected' : ''}`}
      style={{
        backgroundColor: color,
        fontSize: `${fontSize}px`,
      }}
    >
      <div className="callout-content">{text || 'Add callout text'}</div>

      {/* Connection handle for pointing to resources */}
      <Handle
        type="source"
        position={handlePosition}
        id={arrowPosition}
        style={{
          background: color,
          border: '2px solid #fff',
          width: '12px',
          height: '12px',
        }}
      />
    </div>
  );
}
