import React, {useState, useEffect} from 'react';
import {Edge} from 'reactflow';
import {
  CustomEdgeData,
  CUSTOM_EDGE_COLORS,
  DEFAULT_EDGE_STYLE,
} from '../../types/custom-edge';
import './EdgeEditor.css';

interface EdgeEditorProps {
  selectedEdge: Edge<CustomEdgeData> | null;
  onUpdateEdge: (edgeId: string, data: Partial<CustomEdgeData>) => void;
  onDeleteEdge: (edgeId: string) => void;
  onClose: () => void;
}

export function EdgeEditor({
  selectedEdge,
  onUpdateEdge,
  onDeleteEdge,
  onClose,
}: EdgeEditorProps) {
  const [label, setLabel] = useState('');
  const [color, setColor] = useState(DEFAULT_EDGE_STYLE.color);
  const [strokeWidth, setStrokeWidth] = useState(
    DEFAULT_EDGE_STYLE.strokeWidth,
  );
  const [dashed, setDashed] = useState(DEFAULT_EDGE_STYLE.dashed);

  useEffect(() => {
    if (selectedEdge?.data) {
      setLabel(selectedEdge.data.label || '');
      setColor(selectedEdge.data.color || DEFAULT_EDGE_STYLE.color);
      setStrokeWidth(
        selectedEdge.data.strokeWidth || DEFAULT_EDGE_STYLE.strokeWidth,
      );
      setDashed(selectedEdge.data.dashed || DEFAULT_EDGE_STYLE.dashed);
    }
  }, [selectedEdge]);

  if (!selectedEdge) return null;

  const isCustom = selectedEdge.data?.isCustom || false;

  const handleApply = () => {
    onUpdateEdge(selectedEdge.id, {
      label: label.trim() || undefined,
      color,
      strokeWidth,
      dashed,
    });
    onClose();
  };

  const handleDelete = () => {
    if (
      confirm(
        'Are you sure you want to delete this edge? This cannot be undone.',
      )
    ) {
      onDeleteEdge(selectedEdge.id);
      onClose();
    }
  };

  return (
    <div className="edge-editor">
      <div className="edge-editor-header">
        <h3>{isCustom ? '✏️ Edit Custom Edge' : '🔗 CloudFormation Edge'}</h3>
        <button className="close-button" onClick={onClose}>
          ✕
        </button>
      </div>

      <div className="edge-editor-content">
        {!isCustom && (
          <div className="edge-editor-notice">
            This edge was generated from CloudFormation dependencies.
          </div>
        )}

        <div className="form-group">
          <label htmlFor="edge-label">Label (optional)</label>
          <input
            id="edge-label"
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g., API calls, Data flow"
            maxLength={30}
          />
        </div>

        <div className="form-group">
          <label>Color</label>
          <div className="color-picker">
            {CUSTOM_EDGE_COLORS.map((c) => (
              <button
                key={c.value}
                className={`color-button ${color === c.value ? 'selected' : ''}`}
                style={{backgroundColor: c.value}}
                onClick={() => setColor(c.value)}
                title={c.name}
              />
            ))}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="edge-width">Thickness: {strokeWidth}px</label>
          <input
            id="edge-width"
            type="range"
            min="1"
            max="6"
            step="0.5"
            value={strokeWidth}
            onChange={(e) => setStrokeWidth(parseFloat(e.target.value))}
          />
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={dashed}
              onChange={(e) => setDashed(e.target.checked)}
            />
            <span>Dashed line</span>
          </label>
        </div>

        <div className="edge-editor-actions">
          <button className="apply-button" onClick={handleApply}>
            Apply
          </button>
          <button className="delete-button" onClick={handleDelete}>
            Delete Edge
          </button>
          <button className="cancel-button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
