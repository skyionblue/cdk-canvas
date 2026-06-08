import React, {useState} from 'react';
import {Node} from 'reactflow';
import './NodeInspector.css';

interface NodeInspectorProps {
  node: Node;
  onUpdateNode: (
    nodeId: string,
    label: string,
    notes?: string,
    properties?: Record<string, unknown>,
  ) => void;
  onDeleteNode?: (nodeId: string) => void;
  onClose: () => void;
}

type TabType = 'edit' | 'properties' | 'info';

export function NodeInspector({
  node,
  onUpdateNode,
  onDeleteNode,
  onClose,
}: NodeInspectorProps) {
  const [activeTab, setActiveTab] = useState<TabType>('edit');
  const [label, setLabel] = useState(node.data.label || '');
  const [notes, setNotes] = useState(node.data.customNotes || '');
  const [properties, setProperties] = useState<Record<string, unknown>>(
    node.data.cfnProperties || {},
  );
  const [editingProperty, setEditingProperty] = useState<string | null>(null);

  const isCustomNode = node.id.startsWith('custom-node-');
  const isDeletable = isCustomNode;
  const resourceType = node.data.type || 'Unknown';
  const serviceName = resourceType
    .replace('AWS::', '')
    .replace(/::/g, ' ')
    .trim();

  const handleUpdate = () => {
    onUpdateNode(node.id, label.trim(), notes.trim(), properties);
    onClose();
  };

  const handleDelete = () => {
    if (
      confirm(
        'Are you sure you want to delete this node? This cannot be undone.',
      )
    ) {
      onDeleteNode?.(node.id);
      onClose();
    }
  };

  const handlePropertyChange = (key: string, value: string) => {
    try {
      // Try to parse as JSON for numbers, booleans, arrays, objects
      const parsed = JSON.parse(value);
      setProperties((prev) => ({...prev, [key]: parsed}));
    } catch {
      // Keep as string if not valid JSON
      setProperties((prev) => ({...prev, [key]: value}));
    }
  };

  return (
    <div className="node-inspector-overlay" onClick={onClose}>
      <div className="node-inspector" onClick={(e) => e.stopPropagation()}>
        <div className="node-inspector-header">
          <h3>🔍 Node Inspector</h3>
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="node-inspector-tabs">
          <button
            className={`tab ${activeTab === 'edit' ? 'active' : ''}`}
            onClick={() => setActiveTab('edit')}
          >
            ✏️ Edit
          </button>
          <button
            className={`tab ${activeTab === 'properties' ? 'active' : ''}`}
            onClick={() => setActiveTab('properties')}
          >
            ⚙️ Properties
          </button>
          <button
            className={`tab ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => setActiveTab('info')}
          >
            ℹ️ Info
          </button>
        </div>

        <div className="node-inspector-content">
          {activeTab === 'edit' && (
            <div className="tab-panel">
              <div className="form-group">
                <label htmlFor="node-label">Display Label</label>
                <input
                  id="node-label"
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="e.g., Users Database, API Gateway"
                  maxLength={80}
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label htmlFor="node-notes">Custom Notes (optional)</label>
                <textarea
                  id="node-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g., Handles authentication data, Proposed: Enable Multi-AZ"
                  rows={4}
                  maxLength={500}
                />
                <div className="helper-text">
                  Use notes to document proposals or important context
                </div>
              </div>
            </div>
          )}

          {activeTab === 'properties' && (
            <div className="tab-panel">
              <div className="notice">
                💡 These are CloudFormation properties. Edit them to explore
                options or show proposed changes. Changes are visual only - they
                don't modify your infrastructure.
              </div>

              {Object.keys(properties).length === 0 ? (
                <div className="empty-state">
                  No CloudFormation properties available for this node.
                </div>
              ) : (
                <div className="properties-list">
                  {Object.entries(properties).map(([key, value]) => (
                    <div key={key} className="property-entry">
                      <div className="property-key">{key}</div>
                      {editingProperty === key ? (
                        <div className="property-edit">
                          <input
                            type="text"
                            defaultValue={JSON.stringify(value)}
                            onBlur={(e) => {
                              handlePropertyChange(key, e.target.value);
                              setEditingProperty(null);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handlePropertyChange(
                                  key,
                                  e.currentTarget.value,
                                );
                                setEditingProperty(null);
                              }
                            }}
                            autoFocus
                          />
                        </div>
                      ) : (
                        <div
                          className="property-value"
                          onClick={() => setEditingProperty(key)}
                          title="Click to edit"
                        >
                          {typeof value === 'object'
                            ? JSON.stringify(value)
                            : String(value)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'info' && (
            <div className="tab-panel">
              <div className="info-grid">
                <div className="info-entry">
                  <div className="info-label">Resource Type</div>
                  <div className="info-value">{serviceName}</div>
                </div>
                <div className="info-entry">
                  <div className="info-label">Full Type</div>
                  <div className="info-value code">{resourceType}</div>
                </div>
                {node.data.stackName && (
                  <div className="info-entry">
                    <div className="info-label">Stack</div>
                    <div className="info-value">{node.data.stackName}</div>
                  </div>
                )}
                {node.data.constructPath && (
                  <div className="info-entry">
                    <div className="info-label">Construct Path</div>
                    <div className="info-value code">
                      {node.data.constructPath}
                    </div>
                  </div>
                )}
                {node.data.originalId && (
                  <div className="info-entry">
                    <div className="info-label">Original ID</div>
                    <div className="info-value code">
                      {node.data.originalId}
                    </div>
                  </div>
                )}
                <div className="info-entry">
                  <div className="info-label">Node Type</div>
                  <div className="info-value">
                    {isCustomNode ? 'Custom Node' : 'CloudFormation Resource'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="node-inspector-actions">
          <button className="update-button" onClick={handleUpdate}>
            Save Changes
          </button>
          {isDeletable && (
            <button className="delete-button" onClick={handleDelete}>
              Delete Node
            </button>
          )}
          <button className="cancel-button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
