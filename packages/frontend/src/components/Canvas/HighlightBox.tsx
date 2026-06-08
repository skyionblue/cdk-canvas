import React from 'react';
import {NodeProps} from 'reactflow';
import './HighlightBox.css';

export interface HighlightBoxData {
  label: string;
  color: string;
  width: number;
  height: number;
  opacity: number;
}

export function HighlightBox({data, selected}: NodeProps<HighlightBoxData>) {
  const {label, color, width = 300, height = 200, opacity = 0.3} = data;

  return (
    <div
      className={`highlight-box ${selected ? 'selected' : ''}`}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: color,
        opacity,
        borderColor: color,
      }}
    >
      {label && (
        <div className="highlight-label" style={{color}}>
          {label}
        </div>
      )}
      {selected && <div className="resize-handle" />}
    </div>
  );
}
