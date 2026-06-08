import React from 'react';
import {NodeProps, useReactFlow} from 'reactflow';
import {useCloudBoxEditor} from '../../contexts/CloudBoxEditorContext';
import './StackGroup.css';

export interface StackGroupData {
  label: string;
  isCloudBox?: boolean;
  isVpcBox?: boolean;
}

export function StackGroup({data, id}: NodeProps<StackGroupData>) {
  const {label, isCloudBox, isVpcBox} = data;
  const reactFlow = useReactFlow();
  const {openEditor} = useCloudBoxEditor();

  // Different styling for AWS Cloud vs VPC vs Stack groups
  const isAwsCloud = id === 'aws-cloud-boundary';
  const isVpc = id?.startsWith('vpc-group-');

  const handleBadgeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCloudBox || isVpcBox) {
      const node = reactFlow.getNode(id);
      if (node) {
        openEditor(node);
      }
    }
  };

  return (
    <div className="stack-group">
      <div className="stack-group-header">
        <div
          className={`stack-badge ${isAwsCloud ? 'aws-cloud-badge' : isVpc ? 'vpc-badge' : ''} ${isCloudBox || isVpcBox ? 'clickable' : ''}`}
          onClick={isCloudBox || isVpcBox ? handleBadgeClick : undefined}
        >
          {label}
        </div>
        <div className="stack-label">{label}</div>
      </div>
    </div>
  );
}
