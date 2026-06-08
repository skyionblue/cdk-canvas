import React from 'react';
import {LayoutMode} from '../../lib/layout-algorithms';
import {ResourceFilter} from './ResourceFilter';
import {useTheme} from '../../contexts/ThemeContext';
import './Toolbar.css';

interface ToolbarProps {
  layoutMode: LayoutMode;
  onLayoutModeChange: (mode: LayoutMode) => void;
  onSaveLayout?: () => void;
  onLoadLayout?: () => void;
  onExport?: () => void;
  onFitView?: () => void;
  availableTypes?: string[];
  hiddenTypes?: Set<string>;
  onToggleType?: (type: string) => void;
  onAddNode?: () => void;
  onCreateGroup?: () => void;
  selectedNodeCount?: number;
  onOpenStyling?: () => void;
  onAddAnnotation?: (type: 'text' | 'callout' | 'highlight') => void;
}

export function Toolbar({
  layoutMode,
  onLayoutModeChange,
  onSaveLayout,
  onLoadLayout,
  onExport,
  onFitView,
  availableTypes = [],
  hiddenTypes = new Set(),
  onToggleType,
  onAddNode,
  onCreateGroup,
  selectedNodeCount = 0,
  onOpenStyling,
  onAddAnnotation,
}: ToolbarProps) {
  const {theme, toggleTheme} = useTheme();
  const [showAnnotationMenu, setShowAnnotationMenu] = React.useState(false);

  return (
    <div className="toolbar">
      <div className="toolbar-section">
        <label className="toolbar-label">Layout:</label>
        <div className="button-group">
          <button
            className={`toolbar-button ${layoutMode === 'dependency' ? 'active' : ''}`}
            onClick={() => onLayoutModeChange('dependency')}
            title="Hierarchical layout showing dependencies"
          >
            🔀 Dependencies
          </button>
          <button
            className={`toolbar-button ${layoutMode === 'topology' ? 'active' : ''}`}
            onClick={() => onLayoutModeChange('topology')}
            title="Network topology layout (VPC/Subnets)"
          >
            🌐 Topology
          </button>
          <button
            className={`toolbar-button ${layoutMode === 'type' ? 'active' : ''}`}
            onClick={() => onLayoutModeChange('type')}
            title="Grouped by resource type"
          >
            📦 By Type
          </button>
        </div>
      </div>

      <div className="toolbar-divider"></div>

      <div className="toolbar-section">
        {availableTypes.length > 0 && onToggleType && (
          <ResourceFilter
            availableTypes={availableTypes}
            hiddenTypes={hiddenTypes}
            onToggleType={onToggleType}
          />
        )}
        {onAddNode && (
          <button
            className="toolbar-button"
            onClick={onAddNode}
            title="Add a custom AWS resource node"
          >
            ➕ Add Node
          </button>
        )}
        {onCreateGroup && (
          <button
            className="toolbar-button"
            onClick={onCreateGroup}
            disabled={selectedNodeCount < 2}
            title={
              selectedNodeCount >= 2
                ? `Create group from ${selectedNodeCount} selected nodes`
                : 'Select 2+ nodes to create a group'
            }
          >
            📦 Group ({selectedNodeCount})
          </button>
        )}
        <button
          className="toolbar-button"
          onClick={onFitView}
          title="Fit diagram to view"
        >
          🔍 Fit View
        </button>
        <button
          className="toolbar-button"
          onClick={onSaveLayout}
          title="Save current layout"
          disabled={!onSaveLayout}
        >
          💾 Save
        </button>
        <button
          className="toolbar-button"
          onClick={onLoadLayout}
          title="Load saved layout"
          disabled={!onLoadLayout}
        >
          📂 Load
        </button>
        <button
          className="toolbar-button"
          onClick={onExport}
          title="Export as PNG"
          disabled={!onExport}
        >
          📸 Export
        </button>
      </div>

      <div className="toolbar-divider"></div>

      <div className="toolbar-section">
        <div className="annotation-menu-container">
          <button
            className="toolbar-button"
            onClick={() => setShowAnnotationMenu(!showAnnotationMenu)}
            title="Add annotations"
            disabled={!onAddAnnotation}
          >
            📝 Annotate
          </button>
          {showAnnotationMenu && onAddAnnotation && (
            <div className="annotation-menu">
              <button
                className="annotation-menu-item"
                onClick={() => {
                  onAddAnnotation('text');
                  setShowAnnotationMenu(false);
                }}
              >
                📄 Text Note
              </button>
              <button
                className="annotation-menu-item"
                onClick={() => {
                  onAddAnnotation('callout');
                  setShowAnnotationMenu(false);
                }}
              >
                💬 Callout
              </button>
              <button
                className="annotation-menu-item"
                onClick={() => {
                  onAddAnnotation('highlight');
                  setShowAnnotationMenu(false);
                }}
              >
                🔆 Highlight Box
              </button>
            </div>
          )}
        </div>
        <button
          className="toolbar-button"
          onClick={onOpenStyling}
          title="Open styling panel"
          disabled={!onOpenStyling}
        >
          🎨 Styling
        </button>
        <button
          className="toolbar-button"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
      </div>
    </div>
  );
}
