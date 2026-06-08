import React from 'react';
import {NodeProps} from 'reactflow';
import './TextAnnotation.css';

export interface TextAnnotationData {
  text: string;
  color: string;
  fontSize: number;
  width?: number;
  height?: number;
}

export function TextAnnotation({
  data,
  selected,
}: NodeProps<TextAnnotationData>) {
  const {text, color, fontSize, width = 200, height = 100} = data;

  return (
    <div
      className={`text-annotation ${selected ? 'selected' : ''}`}
      style={{
        backgroundColor: color,
        width: `${width}px`,
        minHeight: `${height}px`,
        fontSize: `${fontSize}px`,
      }}
    >
      <div className="annotation-content">{text || 'Double-click to edit'}</div>
      {selected && <div className="resize-handle" />}
    </div>
  );
}
