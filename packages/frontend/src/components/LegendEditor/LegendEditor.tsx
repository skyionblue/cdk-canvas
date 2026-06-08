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

  const handleSave = () => {
    onUpdate(legendNode.id, blocks);
    onClose();
  };

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
            Customize the display names for VPCs and Subnets:
          </p>

          {blocks.length === 0 && (
            <div className="empty-state">No network resources to edit.</div>
          )}

          {blocks.filter((b) => b.type === 'vpc').length > 0 && (
            <div className="legend-editor-section">
              <h4>VPCs</h4>
              {blocks
                .map((block, idx) => ({block, idx}))
                .filter(({block}) => block.type === 'vpc')
                .map(({block, idx}) => (
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
                      <div className="legend-editor-cidr">{block.cidr}</div>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {blocks.filter((b) => b.type === 'subnet').length > 0 && (
            <div className="legend-editor-section">
              <h4>Subnets</h4>
              {blocks
                .map((block, idx) => ({block, idx}))
                .filter(({block}) => block.type === 'subnet')
                .map(({block, idx}) => (
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
                      <div className="legend-editor-cidr">{block.cidr}</div>
                    </div>
                  </div>
                ))}
            </div>
          )}
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
