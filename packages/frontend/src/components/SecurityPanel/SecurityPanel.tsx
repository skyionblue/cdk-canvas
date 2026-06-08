import React, {useState} from 'react';
import {SecurityIssue, getSecuritySummary} from '../../lib/security-scanner';
import './SecurityPanel.css';

interface SecurityPanelProps {
  issues: SecurityIssue[];
  onHighlightResource: (resourceId: string) => void;
}

export function SecurityPanel({
  issues,
  onHighlightResource,
}: SecurityPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedSeverity, setSelectedSeverity] = useState<
    'all' | 'critical' | 'warning'
  >('all');

  if (issues.length === 0) {
    return null;
  }

  const summary = getSecuritySummary(issues);
  const filteredIssues =
    selectedSeverity === 'all'
      ? issues
      : issues.filter((i) => i.severity === selectedSeverity);

  const getSeverityIcon = (severity: 'critical' | 'warning') => {
    return severity === 'critical' ? '🔴' : '🟡';
  };

  return (
    <div className={`security-panel ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="security-header">
        <div className="security-title">
          <span className="security-icon">🛡️</span>
          <h3>Security Issues ({summary.total})</h3>
        </div>
        <button
          className="collapse-button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? 'Expand' : 'Collapse'}
        >
          {isCollapsed ? '▶' : '▼'}
        </button>
      </div>

      {!isCollapsed && (
        <>
          <div className="security-summary">
            <div className="summary-item critical">
              <span className="summary-icon">🔴</span>
              <span className="summary-label">Critical:</span>
              <span className="summary-value">{summary.critical}</span>
            </div>
            <div className="summary-item warning">
              <span className="summary-icon">🟡</span>
              <span className="summary-label">Warnings:</span>
              <span className="summary-value">{summary.warnings}</span>
            </div>
            <div className="summary-item">
              <span className="summary-icon">📦</span>
              <span className="summary-label">Resources:</span>
              <span className="summary-value">{summary.affectedResources}</span>
            </div>
          </div>

          <div className="security-filters">
            <button
              className={`filter-button ${selectedSeverity === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedSeverity('all')}
            >
              All ({summary.total})
            </button>
            <button
              className={`filter-button critical ${selectedSeverity === 'critical' ? 'active' : ''}`}
              onClick={() => setSelectedSeverity('critical')}
            >
              Critical ({summary.critical})
            </button>
            <button
              className={`filter-button warning ${selectedSeverity === 'warning' ? 'active' : ''}`}
              onClick={() => setSelectedSeverity('warning')}
            >
              Warnings ({summary.warnings})
            </button>
          </div>

          <div className="security-issues-list">
            {filteredIssues.map((issue) => (
              <div
                key={issue.id}
                className={`security-issue ${issue.severity}`}
                onClick={() => onHighlightResource(issue.resourceId)}
              >
                <div className="issue-header">
                  <span className="issue-severity-icon">
                    {getSeverityIcon(issue.severity)}
                  </span>
                  <span className="issue-title">{issue.title}</span>
                </div>
                <div className="issue-resource">
                  <span className="resource-icon">📦</span>
                  <span className="resource-name">{issue.resourceId}</span>
                </div>
                <div className="issue-description">{issue.description}</div>
                <div className="issue-recommendation">
                  <strong>Fix:</strong> {issue.recommendation}
                </div>
              </div>
            ))}
          </div>

          {filteredIssues.length === 0 && (
            <div className="no-issues">
              <p>No {selectedSeverity} issues found</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
