import React, {useState} from 'react';
import {Node} from 'reactflow';
import './LayersPanel.css';

interface LayersPanelProps {
  groups: Node[];
  annotations: Node[];
  onEditGroup: (groupId: string) => void;
  onDeleteGroup: (groupId: string) => void;
  onToggleGroupVisibility: (groupId: string) => void;
  onSelectGroup: (groupId: string) => void;
  onEditAnnotation: (annotation: Node) => void;
  onDeleteAnnotation: (annotationId: string) => void;
  onToggleAnnotationVisibility: (annotationId: string) => void;
}

export function LayersPanel({
  groups,
  annotations,
  onEditGroup,
  onDeleteGroup,
  onToggleGroupVisibility,
  onSelectGroup,
  onEditAnnotation,
  onDeleteAnnotation,
  onToggleAnnotationVisibility,
}: LayersPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const totalLayers = groups.length + annotations.length;

  if (totalLayers === 0) {
    return null;
  }

  const getAnnotationIcon = (type?: string): string => {
    switch (type) {
      case 'textAnnotation':
        return '📄';
      case 'calloutAnnotation':
        return '💬';
      case 'highlightBox':
        return '🔆';
      default:
        return '📝';
    }
  };

  const getAnnotationLabel = (annotation: Node): string => {
    if (annotation.type === 'textAnnotation') {
      const text = (annotation.data?.text as string) || 'Text Note';
      return text.length > 30 ? text.substring(0, 30) + '...' : text;
    } else if (annotation.type === 'calloutAnnotation') {
      return (annotation.data?.text as string) || 'Callout';
    } else if (annotation.type === 'highlightBox') {
      return (annotation.data?.label as string) || 'Highlight Box';
    }
    return 'Annotation';
  };

  return (
    <div className={`layers-panel ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="layers-header">
        <h3>📚 Layers ({totalLayers})</h3>
        <button
          className="collapse-button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? 'Expand' : 'Collapse'}
        >
          {isCollapsed ? '▶' : '▼'}
        </button>
      </div>

      {!isCollapsed && (
        <div className="layers-content">
          {/* Annotations Section */}
          {annotations.length > 0 && (
            <>
              <div className="layers-section-header">Annotations</div>
              {annotations.map((annotation) => (
                <div key={annotation.id} className="layer-item annotation">
                  <button
                    className="visibility-button"
                    onClick={() => onToggleAnnotationVisibility(annotation.id)}
                    title={
                      annotation.hidden ? 'Show annotation' : 'Hide annotation'
                    }
                  >
                    {annotation.hidden ? '👁️‍🗨️' : '👁️'}
                  </button>
                  <span className="annotation-icon">
                    {getAnnotationIcon(annotation.type)}
                  </span>
                  <div
                    className="layer-name"
                    onClick={() => onEditAnnotation(annotation)}
                    title="Click to edit annotation"
                  >
                    {getAnnotationLabel(annotation)}
                  </div>
                  <button
                    className="layer-action-button"
                    onClick={() => onEditAnnotation(annotation)}
                    title="Edit annotation"
                  >
                    ✏️
                  </button>
                  <button
                    className="layer-action-button delete"
                    onClick={() => onDeleteAnnotation(annotation.id)}
                    title="Delete annotation"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </>
          )}

          {/* Groups Section */}
          {groups.length > 0 && annotations.length > 0 && (
            <div className="layers-section-header">Groups</div>
          )}

          {groups.map((group) => {
            const isSystemLayer =
              group.data?.isCloudBox ||
              group.data?.isVpcBox ||
              group.type === 'legendNode';
            const isDeletable = !isSystemLayer;

            return (
              <div key={group.id} className="layer-item">
                <button
                  className="visibility-button"
                  onClick={() => onToggleGroupVisibility(group.id)}
                  title={group.hidden ? 'Show layer' : 'Hide layer'}
                >
                  {group.hidden ? '👁️‍🗨️' : '👁️'}
                </button>
                <div
                  className="layer-color"
                  style={{backgroundColor: group.data.color || '#e2e8f0'}}
                />
                <div
                  className="layer-name"
                  onClick={() => onSelectGroup(group.id)}
                  title="Click to select group"
                >
                  {group.data.label}
                </div>
                {!isSystemLayer && (
                  <button
                    className="layer-action-button"
                    onClick={() => onEditGroup(group.id)}
                    title="Edit group"
                  >
                    ✏️
                  </button>
                )}
                {isDeletable && (
                  <button
                    className="layer-action-button delete"
                    onClick={() => onDeleteGroup(group.id)}
                    title="Delete group"
                  >
                    🗑️
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
