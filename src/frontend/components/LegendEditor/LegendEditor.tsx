import React, {useState} from 'react';
import {Node} from 'reactflow';
import './LegendEditor.css';

interface CidrInfo {
  name: string;
  cidr: string;
  type: 'vpc' | 'subnet';
  color: string;
}

interface LegendEditorProps {
  legendNode: Node;
  onUpdate: (nodeId: string, updatedBlocks: CidrInfo[]) => void;
  onClose: () => void;
}

export function LegendEditor({
  legendNode,
  onUpdate,
  onClose,
}: LegendEditorProps) {
  const [blocks, setBlocks] = useState<CidrInfo[]>(
    legendNode.data.cidrBlocks || [],
  );

  const handleNameChange = (index: number, newName: string) => {
    setBlocks((prev) =>
      prev.map((block, idx) =>
        idx === index ? {...block, name: newName} : block,
      ),
    );
  };

  const handleCidrChange = (index: number, newCidr: string) => {
    setBlocks((prev) =>
      prev.map((block, idx) =>
        idx === index ? {...block, cidr: newCidr} : block,
      ),
    );
  };

  const handleDelete = (index: number) => {
    setBlocks((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleAdd = (type: 'vpc' | 'subnet') => {
    setBlocks((prev) => [
      ...prev,
      {
        name: type === 'vpc' ? 'VPC' : 'Subnet',
        cidr: '',
        type,
        color: type === 'vpc' ? '#4caf50' : '#2196f3',
      },
    ]);
  };

  const handleSave = () => {
    onUpdate(legendNode.id, blocks);
    onClose();
  };

  const vpcs = blocks
    .map((block, idx) => ({block, idx}))
    .filter(({block}) => block.type === 'vpc');
  const subnets = blocks
    .map((block, idx) => ({block, idx}))
    .filter(({block}) => block.type === 'subnet');

  return (
    <div className="legend-editor-overlay" onClick={onClose}>
      <div className="legend-editor" onClick={(e) => e.stopPropagation()}>
        <div className="legend-editor-header">
          <h3>✏️ Edit CIDR Blocks</h3>
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="legend-editor-content">
          <p className="legend-editor-instructions">
            Add or edit VPC and subnet CIDR ranges for this topology.
          </p>

          <div className="legend-editor-section">
            <h4>VPCs</h4>
            {vpcs.map(({block, idx}) => (
              <div key={idx} className="legend-editor-entry">
                <div
                  className="legend-editor-color"
                  style={{backgroundColor: block.color}}
                />
                <div className="legend-editor-fields">
                  <input
                    type="text"
                    value={block.name}
                    onChange={(e) => handleNameChange(idx, e.target.value)}
                    placeholder="Display name"
                    maxLength={80}
                  />
                  <input
                    type="text"
                    className="legend-editor-cidr-input"
                    value={block.cidr}
                    onChange={(e) => handleCidrChange(idx, e.target.value)}
                    placeholder="e.g. 10.0.0.0/16"
                    maxLength={18}
                  />
                </div>
                <button
                  className="delete-entry-button"
                  onClick={() => handleDelete(idx)}
                  title="Remove entry"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              className="add-entry-button"
              onClick={() => handleAdd('vpc')}
            >
              + Add VPC
            </button>
          </div>

          <div className="legend-editor-section">
            <h4>Subnets</h4>
            {subnets.map(({block, idx}) => (
              <div key={idx} className="legend-editor-entry">
                <div
                  className="legend-editor-color"
                  style={{backgroundColor: block.color}}
                />
                <div className="legend-editor-fields">
                  <input
                    type="text"
                    value={block.name}
                    onChange={(e) => handleNameChange(idx, e.target.value)}
                    placeholder="Display name"
                    maxLength={80}
                  />
                  <input
                    type="text"
                    className="legend-editor-cidr-input"
                    value={block.cidr}
                    onChange={(e) => handleCidrChange(idx, e.target.value)}
                    placeholder="e.g. 10.0.1.0/24"
                    maxLength={18}
                  />
                </div>
                <button
                  className="delete-entry-button"
                  onClick={() => handleDelete(idx)}
                  title="Remove entry"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              className="add-entry-button"
              onClick={() => handleAdd('subnet')}
            >
              + Add Subnet
            </button>
          </div>
        </div>

        <div className="legend-editor-actions">
          <button className="save-button" onClick={handleSave}>
            Save Changes
          </button>
          <button className="cancel-button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
