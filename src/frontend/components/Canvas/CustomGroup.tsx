import React from 'react';
import {NodeProps} from 'reactflow';
import './CustomGroup.css';

interface CustomGroupData {
  label: string;
  color: string;
}

export function CustomGroup({data}: NodeProps<CustomGroupData>) {
  const {label, color} = data;

  return (
    <div
      className="custom-group"
      style={{
        borderColor: color,
      }}
    >
      <div
        className="custom-group-label"
        style={{
          backgroundColor: color,
        }}
      >
        {label}
      </div>
    </div>
  );
}
