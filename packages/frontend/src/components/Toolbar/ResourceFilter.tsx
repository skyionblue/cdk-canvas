import React, {useState} from 'react';
import './ResourceFilter.css';

interface ResourceFilterProps {
  availableTypes: string[];
  hiddenTypes: Set<string>;
  onToggleType: (type: string) => void;
}

export function ResourceFilter({
  availableTypes,
  hiddenTypes,
  onToggleType,
}: ResourceFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const visibleCount = availableTypes.length - hiddenTypes.size;

  return (
    <div className="resource-filter">
      <button
        className="toolbar-button"
        onClick={() => setIsOpen(!isOpen)}
        title="Filter resource types"
      >
        🔍 Filter ({visibleCount}/{availableTypes.length})
      </button>

      {isOpen && (
        <div className="filter-dropdown">
          <div className="filter-header">
            <h3>Resource Types</h3>
            <button
              className="filter-close"
              onClick={() => setIsOpen(false)}
              title="Close"
            >
              ✕
            </button>
          </div>

          <div className="filter-actions">
            <button
              className="filter-action-button"
              onClick={() =>
                availableTypes.forEach((type) => {
                  if (!hiddenTypes.has(type)) {
                    onToggleType(type);
                  }
                })
              }
            >
              Hide All
            </button>
            <button
              className="filter-action-button"
              onClick={() =>
                availableTypes.forEach((type) => {
                  if (hiddenTypes.has(type)) {
                    onToggleType(type);
                  }
                })
              }
            >
              Show All
            </button>
          </div>

          <div className="filter-list">
            {availableTypes.sort().map((type) => {
              const isVisible = !hiddenTypes.has(type);
              const shortName = type.replace('AWS::', '').replace(/::/g, ' ');

              return (
                <label key={type} className="filter-item">
                  <input
                    type="checkbox"
                    checked={isVisible}
                    onChange={() => onToggleType(type)}
                  />
                  <span className="filter-item-label">{shortName}</span>
                  <span className="filter-item-type">{type}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
