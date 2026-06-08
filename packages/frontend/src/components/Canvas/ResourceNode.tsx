import React from 'react';
import {Handle, Position, NodeProps} from 'reactflow';
import './ResourceNode.css';

export interface ResourceNodeData {
  label: string;
  type: string;
  iconPath: string;
  isImported: boolean;
  constructPath?: string;
  stackName?: string;
  customStyle?: {
    fontSize?: number;
    borderColor?: string;
    backgroundColor?: string;
  };
  securityIssues?: number;
}

export function ResourceNode({data}: NodeProps<ResourceNodeData>) {
  const {label, type, iconPath, isImported, constructPath, customStyle, securityIssues} = data;

  // Extract service name from type (AWS::Lambda::Function -> Lambda Function)
  const serviceName = type.replace('AWS::', '').replace(/::/g, ' ').trim();

  // Build inline styles from custom styling
  const nodeStyle: React.CSSProperties = {
    ...(customStyle?.borderColor && {borderColor: customStyle.borderColor}),
    ...(customStyle?.backgroundColor && {
      backgroundColor: customStyle.backgroundColor,
    }),
  };

  const labelStyle: React.CSSProperties = {
    ...(customStyle?.fontSize && {fontSize: `${customStyle.fontSize}px`}),
  };

  return (
    <div
      className={`resource-node ${isImported ? 'imported' : ''}`}
      style={nodeStyle}
    >
      {/* Connection handles on all 4 sides */}
      <Handle type="target" position={Position.Top} id="top" />
      <Handle type="target" position={Position.Right} id="right" />
      <Handle type="target" position={Position.Bottom} id="bottom" />
      <Handle type="target" position={Position.Left} id="left" />

      <Handle type="source" position={Position.Top} id="top-source" />
      <Handle type="source" position={Position.Right} id="right-source" />
      <Handle type="source" position={Position.Bottom} id="bottom-source" />
      <Handle type="source" position={Position.Left} id="left-source" />

      <div className="resource-node-header">
        <img
          src={iconPath}
          alt={serviceName}
          className="resource-node-icon"
          onError={(e) => {
            // Fallback to CloudFormation icon if image fails to load
            e.currentTarget.src =
              '/assets/aws-icons/Architecture-Service-Icons_04302026/Arch_Management-Governance/32/Arch_AWS-CloudFormation_32.svg';
          }}
        />
        {isImported && (
          <span className="imported-indicator" title="Imported resource">
            ⛓️
          </span>
        )}
        {securityIssues && securityIssues > 0 && (
          <span className="security-badge" title={`${securityIssues} security issue(s)`}>
            ⚠️ {securityIssues}
          </span>
        )}
      </div>

      <div className="resource-node-body">
        <div className="resource-node-id" title={label} style={labelStyle}>
          {label}
        </div>
        <div className="resource-node-type" title={type} style={labelStyle}>
          {serviceName}
        </div>
        {constructPath && (
          <div className="resource-node-path" title={constructPath} style={labelStyle}>
            {constructPath.split('/').pop()}
          </div>
        )}
      </div>
    </div>
  );
}
