import React, {useState} from 'react';
import './ExportDialog.css';

interface ExportDialogProps {
  onExport: (options: ExportOptions) => void;
  onClose: () => void;
}

export interface ExportOptions {
  format: 'png' | 'svg' | 'drawio';
  title?: string;
  footer?: string;
  includeBranding: boolean;
  logoUrl?: string;
  width: number;
  height: number;
}

export function ExportDialog({onExport, onClose}: ExportDialogProps) {
  const [format, setFormat] = useState<'png' | 'svg' | 'drawio'>('png');
  const [title, setTitle] = useState('');
  const [footer, setFooter] = useState('');
  const [includeBranding, setIncludeBranding] = useState(true);
  const [logoUrl, setLogoUrl] = useState('');
  const [width, setWidth] = useState(1920);
  const [height, setHeight] = useState(1080);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExport = () => {
    onExport({
      format,
      title: title.trim() || undefined,
      footer: footer.trim() || undefined,
      includeBranding,
      logoUrl: logoUrl || undefined,
      width,
      height,
    });
    onClose();
  };

  return (
    <div className="export-dialog-overlay" onClick={onClose}>
      <div className="export-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="export-dialog-header">
          <h3>📸 Export Diagram</h3>
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="export-dialog-content">
          <div className="form-group">
            <label>Format</label>
            <div className="format-buttons">
              <button
                className={`format-button ${format === 'png' ? 'selected' : ''}`}
                onClick={() => setFormat('png')}
              >
                🖼️ PNG
              </button>
              <button
                className={`format-button ${format === 'svg' ? 'selected' : ''}`}
                onClick={() => setFormat('svg')}
              >
                📐 SVG
              </button>
              <button
                className={`format-button ${format === 'drawio' ? 'selected' : ''}`}
                onClick={() => setFormat('drawio')}
              >
                ✏️ Draw.io
              </button>
            </div>
          </div>

          {format === 'drawio' && (
            <p className="helper-text">
              Exports a .drawio file that can be opened and edited in{' '}
              <strong>draw.io</strong> or <strong>diagrams.net</strong>. All
              nodes, groups, and connections are preserved with their current
              positions.
            </p>
          )}

          <div className="form-group">
            <label htmlFor="export-title">
              {format === 'drawio'
                ? 'Diagram name (optional)'
                : 'Title (optional)'}
            </label>
            <input
              id="export-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                format === 'drawio'
                  ? 'e.g., Production Infrastructure'
                  : 'e.g., Production Infrastructure'
              }
              maxLength={80}
            />
          </div>

          {format !== 'drawio' && (
            <>
              <div className="form-group">
                <label htmlFor="export-footer">Footer (optional)</label>
                <input
                  id="export-footer"
                  type="text"
                  value={footer}
                  onChange={(e) => setFooter(e.target.value)}
                  placeholder="e.g., Last updated: 2026-06-07"
                  maxLength={80}
                />
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={includeBranding}
                    onChange={(e) => setIncludeBranding(e.target.checked)}
                  />
                  <span>Include logo</span>
                </label>
              </div>

              {includeBranding && (
                <div className="form-group">
                  <label htmlFor="logo-upload">
                    Custom Logo (optional - PNG/SVG/JPG)
                  </label>
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml"
                    onChange={handleLogoUpload}
                    className="file-input"
                  />
                  {logoUrl && (
                    <div className="logo-preview">
                      <img src={logoUrl} alt="Logo preview" />
                      <button
                        className="remove-logo"
                        onClick={() => setLogoUrl('')}
                        type="button"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                  {!logoUrl && (
                    <p className="helper-text">
                      If no logo is uploaded, TrueMark default will be used
                    </p>
                  )}
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="export-width">Width (px)</label>
                  <input
                    id="export-width"
                    type="number"
                    value={width}
                    onChange={(e) => setWidth(parseInt(e.target.value) || 1920)}
                    min="800"
                    max="4096"
                    step="100"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="export-height">Height (px)</label>
                  <input
                    id="export-height"
                    type="number"
                    value={height}
                    onChange={(e) =>
                      setHeight(parseInt(e.target.value) || 1080)
                    }
                    min="600"
                    max="4096"
                    step="100"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        <div className="export-dialog-actions">
          <button className="export-button" onClick={handleExport}>
            Export {format === 'drawio' ? 'Draw.io' : format.toUpperCase()}
          </button>
          <button className="cancel-button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
