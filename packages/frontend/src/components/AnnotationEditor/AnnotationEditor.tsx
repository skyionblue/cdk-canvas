import React, {useState, useEffect} from 'react';
import {Node} from 'reactflow';
import './AnnotationEditor.css';

interface AnnotationEditorProps {
  annotation: Node | null;
  onUpdate: (nodeId: string, updates: Record<string, any>) => void;
  onDelete: (nodeId: string) => void;
  onClose: () => void;
}

const ANNOTATION_COLORS = [
  {name: 'Yellow', value: '#fff59d', dark: '#f9a825'},
  {name: 'Blue', value: '#e3f2fd', dark: '#1565c0'},
  {name: 'Green', value: '#c8e6c9', dark: '#388e3c'},
  {name: 'Red', value: '#ffcdd2', dark: '#d32f2f'},
  {name: 'Purple', value: '#e1bee7', dark: '#7b1fa2'},
  {name: 'Orange', value: '#ffe0b2', dark: '#f57c00'},
];

const ARROW_POSITIONS = [
  {name: 'Top', value: 'top'},
  {name: 'Right', value: 'right'},
  {name: 'Bottom', value: 'bottom'},
  {name: 'Left', value: 'left'},
];

export function AnnotationEditor({
  annotation,
  onUpdate,
  onDelete,
  onClose,
}: AnnotationEditorProps) {
  const [text, setText] = useState('');
  const [label, setLabel] = useState('');
  const [color, setColor] = useState('#fff59d');
  const [fontSize, setFontSize] = useState(14);
  const [width, setWidth] = useState(200);
  const [height, setHeight] = useState(100);
  const [opacity, setOpacity] = useState(0.3);
  const [arrowPosition, setArrowPosition] = useState('right');

  useEffect(() => {
    if (!annotation) return;

    const {data} = annotation;
    setText(data.text || '');
    setLabel(data.label || '');
    setColor(data.color || '#fff59d');
    setFontSize(data.fontSize || 14);
    setWidth(data.width || 200);
    setHeight(data.height || 100);
    setOpacity(data.opacity || 0.3);
    setArrowPosition(data.arrowPosition || 'right');
  }, [annotation]);

  if (!annotation) return null;

  const annotationType = annotation.type;

  const handleSave = () => {
    const updates: Record<string, any> = {};

    if (annotationType === 'textAnnotation') {
      updates.text = text;
      updates.color = color;
      updates.fontSize = fontSize;
      updates.width = width;
      updates.height = height;
    } else if (annotationType === 'calloutAnnotation') {
      updates.text = text;
      updates.color = color;
      updates.fontSize = fontSize;
      updates.arrowPosition = arrowPosition;
    } else if (annotationType === 'highlightBox') {
      updates.label = label;
      updates.color = color;
      updates.width = width;
      updates.height = height;
      updates.opacity = opacity;
    }

    onUpdate(annotation.id, updates);
    onClose();
  };

  const handleDelete = () => {
    if (confirm('Delete this annotation?')) {
      onDelete(annotation.id);
      onClose();
    }
  };

  const getTypeName = () => {
    switch (annotationType) {
      case 'textAnnotation':
        return 'Text Note';
      case 'calloutAnnotation':
        return 'Callout';
      case 'highlightBox':
        return 'Highlight Box';
      default:
        return 'Annotation';
    }
  };

  return (
    <div className="annotation-editor-overlay" onClick={onClose}>
      <div className="annotation-editor" onClick={(e) => e.stopPropagation()}>
        <div className="annotation-editor-header">
          <h3>📝 Edit {getTypeName()}</h3>
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="annotation-editor-content">
          {/* Text Note Fields */}
          {annotationType === 'textAnnotation' && (
            <>
              <div className="form-group">
                <label>Text</label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Enter note text..."
                  rows={4}
                  maxLength={500}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Width</label>
                  <input
                    type="number"
                    value={width}
                    onChange={(e) => setWidth(parseInt(e.target.value))}
                    min={100}
                    max={600}
                  />
                </div>
                <div className="form-group">
                  <label>Height</label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(parseInt(e.target.value))}
                    min={60}
                    max={400}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Font Size</label>
                <input
                  type="range"
                  min="10"
                  max="24"
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value))}
                />
                <span className="slider-value">{fontSize}px</span>
              </div>

              <div className="form-group">
                <label>Color</label>
                <div className="color-swatches">
                  {ANNOTATION_COLORS.map((c) => (
                    <button
                      key={c.value}
                      className={`color-swatch ${color === c.value ? 'active' : ''}`}
                      style={{backgroundColor: c.value}}
                      onClick={() => setColor(c.value)}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Callout Fields */}
          {annotationType === 'calloutAnnotation' && (
            <>
              <div className="form-group">
                <label>Text</label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Enter callout text..."
                  rows={3}
                  maxLength={200}
                />
              </div>

              <div className="form-group">
                <label>Font Size</label>
                <input
                  type="range"
                  min="10"
                  max="20"
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value))}
                />
                <span className="slider-value">{fontSize}px</span>
              </div>

              <div className="form-group">
                <label>Arrow Position</label>
                <div className="arrow-buttons">
                  {ARROW_POSITIONS.map((pos) => (
                    <button
                      key={pos.value}
                      className={`arrow-button ${arrowPosition === pos.value ? 'active' : ''}`}
                      onClick={() => setArrowPosition(pos.value)}
                    >
                      {pos.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Color</label>
                <div className="color-swatches">
                  {ANNOTATION_COLORS.map((c) => (
                    <button
                      key={c.value}
                      className={`color-swatch ${color === c.value ? 'active' : ''}`}
                      style={{backgroundColor: c.value}}
                      onClick={() => setColor(c.value)}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Highlight Box Fields */}
          {annotationType === 'highlightBox' && (
            <>
              <div className="form-group">
                <label>Label (optional)</label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="e.g., Critical Path, Security Zone"
                  maxLength={50}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Width</label>
                  <input
                    type="number"
                    value={width}
                    onChange={(e) => setWidth(parseInt(e.target.value))}
                    min={150}
                    max={800}
                  />
                </div>
                <div className="form-group">
                  <label>Height</label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(parseInt(e.target.value))}
                    min={100}
                    max={600}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Opacity</label>
                <input
                  type="range"
                  min="0.1"
                  max="0.8"
                  step="0.1"
                  value={opacity}
                  onChange={(e) => setOpacity(parseFloat(e.target.value))}
                />
                <span className="slider-value">{Math.round(opacity * 100)}%</span>
              </div>

              <div className="form-group">
                <label>Color</label>
                <div className="color-swatches">
                  {ANNOTATION_COLORS.map((c) => (
                    <button
                      key={c.value}
                      className={`color-swatch ${color === c.value ? 'active' : ''}`}
                      style={{backgroundColor: c.value}}
                      onClick={() => setColor(c.value)}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="annotation-editor-actions">
          <button className="save-button" onClick={handleSave}>
            Save Changes
          </button>
          <button className="delete-button" onClick={handleDelete}>
            Delete
          </button>
          <button className="cancel-button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
