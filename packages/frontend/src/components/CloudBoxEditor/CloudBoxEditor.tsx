import React, {useState, useEffect} from 'react';
import {Node} from 'reactflow';
import './CloudBoxEditor.css';

const CLOUD_COLORS = [
  {name: 'Orange', bg: 'rgba(255, 153, 0, 0.02)', border: '#ff9800'},
  {name: 'Blue', bg: 'rgba(59, 130, 246, 0.02)', border: '#3b82f6'},
  {name: 'Purple', bg: 'rgba(147, 51, 234, 0.02)', border: '#9333ea'},
  {name: 'Green', bg: 'rgba(22, 163, 74, 0.02)', border: '#16a34a'},
  {name: 'Gray', bg: 'rgba(100, 116, 139, 0.02)', border: '#64748b'},
];

interface CloudBoxEditorProps {
  cloudBox: Node;
  onUpdate: (
    width: number,
    height: number,
    backgroundColor: string,
    borderColor: string,
  ) => void;
  onClose: () => void;
}

export function CloudBoxEditor({
  cloudBox,
  onUpdate,
  onClose,
}: CloudBoxEditorProps) {
  const [width, setWidth] = useState(
    parseInt(cloudBox.style?.width?.toString() || '1400'),
  );
  const [height, setHeight] = useState(
    parseInt(cloudBox.style?.height?.toString() || '800'),
  );
  const [selectedColor, setSelectedColor] = useState(CLOUD_COLORS[0]);

  useEffect(() => {
    const borderColor = cloudBox.style?.border?.toString().split(' ')[2];
    const color = CLOUD_COLORS.find((c) => c.border === borderColor);
    if (color) setSelectedColor(color);
  }, [cloudBox]);

  const handleUpdate = () => {
    onUpdate(width, height, selectedColor.bg, selectedColor.border);
    onClose();
  };

  return (
    <div className="cloud-box-editor-overlay" onClick={onClose}>
      <div className="cloud-box-editor" onClick={(e) => e.stopPropagation()}>
        <div className="cloud-box-editor-header">
          <h3>☁️ Edit AWS Cloud Box</h3>
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="cloud-box-editor-content">
          <div className="notice">
            The AWS Cloud box cannot be removed, only resized and recolored.
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="cloud-width">Width (px)</label>
              <input
                id="cloud-width"
                type="number"
                value={width}
                onChange={(e) => setWidth(parseInt(e.target.value) || 1400)}
                min="800"
                max="4000"
                step="50"
              />
            </div>
            <div className="form-group">
              <label htmlFor="cloud-height">Height (px)</label>
              <input
                id="cloud-height"
                type="number"
                value={height}
                onChange={(e) => setHeight(parseInt(e.target.value) || 800)}
                min="600"
                max="3000"
                step="50"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Border Color</label>
            <div className="color-options">
              {CLOUD_COLORS.map((color) => (
                <button
                  key={color.border}
                  className={`cloud-color-option ${selectedColor.border === color.border ? 'selected' : ''}`}
                  onClick={() => setSelectedColor(color)}
                  style={{
                    backgroundColor: color.bg,
                    borderColor: color.border,
                  }}
                >
                  {color.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="cloud-box-editor-actions">
          <button className="update-button" onClick={handleUpdate}>
            Update
          </button>
          <button className="cancel-button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
