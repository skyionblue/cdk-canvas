import React, {useState} from 'react';
import './GroupCreator.css';

interface GroupCreatorProps {
  selectedNodeCount: number;
  onCreateGroup: (label: string, color: string) => void;
  onClose: () => void;
}

const GROUP_COLORS = [
  {name: 'Blue', value: '#dbeafe', border: '#3b82f6'},
  {name: 'Green', value: '#dcfce7', border: '#16a34a'},
  {name: 'Purple', value: '#f3e8ff', border: '#9333ea'},
  {name: 'Orange', value: '#ffedd5', border: '#ea580c'},
  {name: 'Pink', value: '#fce7f3', border: '#ec4899'},
  {name: 'Gray', value: '#f1f5f9', border: '#64748b'},
];

export function GroupCreator({
  selectedNodeCount,
  onCreateGroup,
  onClose,
}: GroupCreatorProps) {
  const [label, setLabel] = useState('');
  const [selectedColor, setSelectedColor] = useState(GROUP_COLORS[0]);

  const handleCreate = () => {
    if (!label.trim()) {
      alert('Please enter a label for the group.');
      return;
    }
    onCreateGroup(label.trim(), selectedColor.border);
    onClose();
  };

  return (
    <div className="group-creator-overlay" onClick={onClose}>
      <div className="group-creator" onClick={(e) => e.stopPropagation()}>
        <div className="group-creator-header">
          <h3>📦 Create Group</h3>
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="group-creator-content">
          <div className="group-info">
            Grouping <strong>{selectedNodeCount}</strong> selected node
            {selectedNodeCount !== 1 ? 's' : ''}
          </div>

          <div className="form-group">
            <label htmlFor="group-label">Group Label</label>
            <input
              id="group-label"
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g., API Layer, Database Tier, Frontend"
              maxLength={40}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Group Color</label>
            <div className="color-grid">
              {GROUP_COLORS.map((color) => (
                <button
                  key={color.value}
                  className={`color-option ${selectedColor.value === color.value ? 'selected' : ''}`}
                  onClick={() => setSelectedColor(color)}
                  style={{
                    backgroundColor: color.value,
                    borderColor: color.border,
                  }}
                  title={color.name}
                >
                  <span className="color-name">{color.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="group-creator-actions">
          <button
            className="create-button"
            onClick={handleCreate}
            disabled={!label.trim()}
          >
            Create Group
          </button>
          <button className="cancel-button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
