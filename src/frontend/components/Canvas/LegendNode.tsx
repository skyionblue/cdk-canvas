import React from 'react';
import {NodeProps} from 'reactflow';
import './LegendNode.css';

interface CidrInfo {
  name: string;
  cidr: string;
  type: 'vpc' | 'subnet';
  color: string;
}

export interface LegendNodeData {
  cidrBlocks: CidrInfo[];
}

export function LegendNode({data}: NodeProps<LegendNodeData>) {
  const {cidrBlocks} = data;

  if (!cidrBlocks || cidrBlocks.length === 0) {
    return null;
  }

  const vpcs = cidrBlocks.filter((c) => c.type === 'vpc');
  const subnets = cidrBlocks.filter((c) => c.type === 'subnet');

  return (
    <div className="legend-node">
      <div className="legend-node-header">
        <h4>CIDR Blocks</h4>
      </div>
      <div className="legend-node-content">
        {vpcs.length > 0 && (
          <div className="legend-section">
            <div className="legend-section-title">VPCs</div>
            {vpcs.map((vpc, idx) => (
              <div key={idx} className="legend-entry">
                <div
                  className="legend-color-box"
                  style={{backgroundColor: vpc.color}}
                />
                <div className="legend-info">
                  <div className="legend-name">{vpc.name}</div>
                  <div className="legend-cidr">{vpc.cidr}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {subnets.length > 0 && (
          <div className="legend-section">
            <div className="legend-section-title">Subnets</div>
            {subnets.map((subnet, idx) => (
              <div key={idx} className="legend-entry">
                <div
                  className="legend-color-box"
                  style={{backgroundColor: subnet.color}}
                />
                <div className="legend-info">
                  <div className="legend-name">{subnet.name}</div>
                  <div className="legend-cidr">{subnet.cidr}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
