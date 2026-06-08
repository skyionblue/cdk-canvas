import React from 'react';
import './CidrLegend.css';

interface CidrInfo {
  name: string;
  cidr: string;
  type: 'vpc' | 'subnet';
  color: string;
}

interface CidrLegendProps {
  cidrBlocks: CidrInfo[];
}

export function CidrLegend({cidrBlocks}: CidrLegendProps) {
  if (cidrBlocks.length === 0) {
    return null;
  }

  const vpcs = cidrBlocks.filter((c) => c.type === 'vpc');
  const subnets = cidrBlocks.filter((c) => c.type === 'subnet');

  return (
    <div className="cidr-legend">
      <div className="cidr-legend-header">
        <h4>🌐 Network Topology</h4>
      </div>
      <div className="cidr-legend-content">
        {vpcs.length > 0 && (
          <div className="cidr-section">
            <div className="cidr-section-title">VPCs</div>
            {vpcs.map((vpc, idx) => (
              <div key={idx} className="cidr-entry">
                <div
                  className="cidr-color-box"
                  style={{backgroundColor: vpc.color}}
                />
                <div className="cidr-info">
                  <div className="cidr-name">{vpc.name}</div>
                  <div className="cidr-block">{vpc.cidr}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {subnets.length > 0 && (
          <div className="cidr-section">
            <div className="cidr-section-title">Subnets</div>
            {subnets.map((subnet, idx) => (
              <div key={idx} className="cidr-entry">
                <div
                  className="cidr-color-box"
                  style={{backgroundColor: subnet.color}}
                />
                <div className="cidr-info">
                  <div className="cidr-name">{subnet.name}</div>
                  <div className="cidr-block">{subnet.cidr}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
