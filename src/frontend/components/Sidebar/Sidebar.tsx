import React from 'react';
import './Sidebar.css';

interface SidebarProps {
  stacks: string[];
  selectedStacks: string[];
  onToggleStack: (stackName: string) => void;
  loading?: boolean;
  error?: string | null;
}

export function Sidebar({
  stacks,
  selectedStacks,
  onToggleStack,
  loading,
  error,
}: SidebarProps) {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>CDK Stacks</h2>
        <span className="stack-count">
          {selectedStacks.length} of {stacks.length} selected
        </span>
      </div>

      {loading && (
        <div className="sidebar-loading">
          <div className="spinner"></div>
          <p>Loading stacks...</p>
        </div>
      )}

      {error && (
        <div className="sidebar-error">
          <p>❌ {error}</p>
        </div>
      )}

      {!loading && !error && stacks.length === 0 && (
        <div className="sidebar-empty">
          <p>No CDK stacks found.</p>
          <p className="hint">Run "cdk synth" to generate stacks.</p>
        </div>
      )}

      {!loading && !error && stacks.length > 0 && (
        <ul className="stack-list">
          {stacks.map((stack) => {
            const isSelected = selectedStacks.includes(stack);
            return (
              <li
                key={stack}
                className={`stack-item ${isSelected ? 'selected' : ''}`}
                onClick={() => onToggleStack(stack)}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => {
                    e.stopPropagation();
                    onToggleStack(stack);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="stack-checkbox"
                />
                <span className="stack-icon">📦</span>
                <span className="stack-name">{stack}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
