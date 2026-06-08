import React, {useState} from 'react';
import './StylingPanel.css';

export interface NodeStyle {
  fontSize?: number;
  borderColor?: string;
  backgroundColor?: string;
}

export interface StylingOptions {
  globalFontSize: number;
  nodeStylesByType: Record<string, NodeStyle>;
  selectedNodeStyle?: NodeStyle;
}

interface StylingPanelProps {
  isOpen: boolean;
  onClose: () => void;
  availableTypes: string[];
  selectedNodes: string[];
  stylingOptions: StylingOptions;
  onUpdateStyling: (options: Partial<StylingOptions>) => void;
  onAlignNodes: (alignment: 'left' | 'right' | 'top' | 'bottom' | 'center-h' | 'center-v') => void;
  onDistributeNodes: (direction: 'horizontal' | 'vertical') => void;
  onApplyStyleToSelected: (style: NodeStyle) => void;
}

export function StylingPanel({
  isOpen,
  onClose,
  availableTypes,
  selectedNodes,
  stylingOptions,
  onUpdateStyling,
  onAlignNodes,
  onDistributeNodes,
  onApplyStyleToSelected,
}: StylingPanelProps) {
  const [activeTab, setActiveTab] = useState<'global' | 'types' | 'alignment'>('global');
  const [selectedType, setSelectedType] = useState<string | null>(null);

  if (!isOpen) return null;

  const selectedTypeStyle = selectedType
    ? stylingOptions.nodeStylesByType[selectedType] || {}
    : {};

  const handleGlobalFontSizeChange = (size: number) => {
    onUpdateStyling({globalFontSize: size});
  };

  const handleTypeStyleChange = (type: string, style: Partial<NodeStyle>) => {
    const updatedStyles = {
      ...stylingOptions.nodeStylesByType,
      [type]: {
        ...stylingOptions.nodeStylesByType[type],
        ...style,
      },
    };
    onUpdateStyling({nodeStylesByType: updatedStyles});
  };

  const handleResetTypeStyle = (type: string) => {
    const updatedStyles = {...stylingOptions.nodeStylesByType};
    delete updatedStyles[type];
    onUpdateStyling({nodeStylesByType: updatedStyles});
  };

  return (
    <div className="styling-panel-overlay" onClick={onClose}>
      <div className="styling-panel" onClick={(e) => e.stopPropagation()}>
        <div className="styling-panel-header">
          <h2>🎨 Styling Options</h2>
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="styling-panel-tabs">
          <button
            className={`tab-button ${activeTab === 'global' ? 'active' : ''}`}
            onClick={() => setActiveTab('global')}
          >
            Global
          </button>
          <button
            className={`tab-button ${activeTab === 'types' ? 'active' : ''}`}
            onClick={() => setActiveTab('types')}
          >
            By Type
          </button>
          <button
            className={`tab-button ${activeTab === 'alignment' ? 'active' : ''}`}
            onClick={() => setActiveTab('alignment')}
          >
            Alignment
          </button>
        </div>

        <div className="styling-panel-content">
          {activeTab === 'global' && (
            <div className="styling-section">
              <h3>Global Font Size</h3>
              <div className="control-group">
                <label>Label Font Size</label>
                <div className="slider-container">
                  <input
                    type="range"
                    min="10"
                    max="24"
                    value={stylingOptions.globalFontSize}
                    onChange={(e) =>
                      handleGlobalFontSizeChange(parseInt(e.target.value))
                    }
                  />
                  <span className="slider-value">
                    {stylingOptions.globalFontSize}px
                  </span>
                </div>
              </div>

              {selectedNodes.length > 0 && (
                <div className="styling-section">
                  <h3>Selected Nodes ({selectedNodes.length})</h3>
                  <div className="control-group">
                    <label>Border Color</label>
                    <div className="color-picker-group">
                      <input
                        type="color"
                        value={stylingOptions.selectedNodeStyle?.borderColor || '#3b82f6'}
                        onChange={(e) =>
                          onApplyStyleToSelected({borderColor: e.target.value})
                        }
                      />
                      <button
                        className="reset-button"
                        onClick={() =>
                          onApplyStyleToSelected({borderColor: undefined})
                        }
                      >
                        Reset
                      </button>
                    </div>
                  </div>

                  <div className="control-group">
                    <label>Background Color</label>
                    <div className="color-picker-group">
                      <input
                        type="color"
                        value={
                          stylingOptions.selectedNodeStyle?.backgroundColor ||
                          '#ffffff'
                        }
                        onChange={(e) =>
                          onApplyStyleToSelected({
                            backgroundColor: e.target.value,
                          })
                        }
                      />
                      <button
                        className="reset-button"
                        onClick={() =>
                          onApplyStyleToSelected({backgroundColor: undefined})
                        }
                      >
                        Reset
                      </button>
                    </div>
                  </div>

                  <div className="control-group">
                    <label>Font Size</label>
                    <div className="slider-container">
                      <input
                        type="range"
                        min="10"
                        max="24"
                        value={stylingOptions.selectedNodeStyle?.fontSize || 14}
                        onChange={(e) =>
                          onApplyStyleToSelected({
                            fontSize: parseInt(e.target.value),
                          })
                        }
                      />
                      <span className="slider-value">
                        {stylingOptions.selectedNodeStyle?.fontSize || 14}px
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'types' && (
            <div className="styling-section">
              <h3>Style by Resource Type</h3>
              <div className="type-selector">
                <select
                  value={selectedType || ''}
                  onChange={(e) => setSelectedType(e.target.value || null)}
                >
                  <option value="">Select a type...</option>
                  {availableTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                      {stylingOptions.nodeStylesByType[type] ? ' ✓' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {selectedType && (
                <div className="type-style-controls">
                  <div className="control-group">
                    <label>Border Color</label>
                    <div className="color-picker-group">
                      <input
                        type="color"
                        value={selectedTypeStyle.borderColor || '#3b82f6'}
                        onChange={(e) =>
                          handleTypeStyleChange(selectedType, {
                            borderColor: e.target.value,
                          })
                        }
                      />
                      <span className="color-value">
                        {selectedTypeStyle.borderColor || 'Default'}
                      </span>
                    </div>
                  </div>

                  <div className="control-group">
                    <label>Background Color</label>
                    <div className="color-picker-group">
                      <input
                        type="color"
                        value={selectedTypeStyle.backgroundColor || '#ffffff'}
                        onChange={(e) =>
                          handleTypeStyleChange(selectedType, {
                            backgroundColor: e.target.value,
                          })
                        }
                      />
                      <span className="color-value">
                        {selectedTypeStyle.backgroundColor || 'Default'}
                      </span>
                    </div>
                  </div>

                  <div className="control-group">
                    <label>Font Size</label>
                    <div className="slider-container">
                      <input
                        type="range"
                        min="10"
                        max="24"
                        value={selectedTypeStyle.fontSize || 14}
                        onChange={(e) =>
                          handleTypeStyleChange(selectedType, {
                            fontSize: parseInt(e.target.value),
                          })
                        }
                      />
                      <span className="slider-value">
                        {selectedTypeStyle.fontSize || 14}px
                      </span>
                    </div>
                  </div>

                  <button
                    className="reset-type-button"
                    onClick={() => handleResetTypeStyle(selectedType)}
                  >
                    Reset {selectedType} Style
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'alignment' && (
            <div className="styling-section">
              <h3>Alignment Tools</h3>
              {selectedNodes.length < 2 ? (
                <p className="hint">Select 2 or more nodes to use alignment tools</p>
              ) : (
                <>
                  <div className="alignment-group">
                    <h4>Align</h4>
                    <div className="button-grid">
                      <button
                        className="alignment-button"
                        onClick={() => onAlignNodes('left')}
                        title="Align left edges"
                      >
                        ⬅️ Left
                      </button>
                      <button
                        className="alignment-button"
                        onClick={() => onAlignNodes('center-h')}
                        title="Align horizontal centers"
                      >
                        ↔️ Center H
                      </button>
                      <button
                        className="alignment-button"
                        onClick={() => onAlignNodes('right')}
                        title="Align right edges"
                      >
                        ➡️ Right
                      </button>
                      <button
                        className="alignment-button"
                        onClick={() => onAlignNodes('top')}
                        title="Align top edges"
                      >
                        ⬆️ Top
                      </button>
                      <button
                        className="alignment-button"
                        onClick={() => onAlignNodes('center-v')}
                        title="Align vertical centers"
                      >
                        ↕️ Center V
                      </button>
                      <button
                        className="alignment-button"
                        onClick={() => onAlignNodes('bottom')}
                        title="Align bottom edges"
                      >
                        ⬇️ Bottom
                      </button>
                    </div>
                  </div>

                  <div className="alignment-group">
                    <h4>Distribute</h4>
                    <div className="button-grid">
                      <button
                        className="alignment-button"
                        onClick={() => onDistributeNodes('horizontal')}
                        title="Distribute horizontally with equal spacing"
                      >
                        ↔️ Horizontal
                      </button>
                      <button
                        className="alignment-button"
                        onClick={() => onDistributeNodes('vertical')}
                        title="Distribute vertically with equal spacing"
                      >
                        ↕️ Vertical
                      </button>
                    </div>
                  </div>

                  <div className="selected-info">
                    <p>{selectedNodes.length} nodes selected</p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
