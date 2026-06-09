import React from 'react';
import './RestoreBanner.css';

interface RestoreBannerProps {
  savedAt: string;
  onRestore: () => void;
  onDismiss: () => void;
}

function formatAge(savedAt: string): string {
  const diff = Date.now() - new Date(savedAt).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes === 1) return '1 minute ago';
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = Math.floor(minutes / 60);
  if (hours === 1) return '1 hour ago';
  if (hours < 24) return `${hours} hours ago`;
  return `${Math.floor(hours / 24)} day(s) ago`;
}

export function RestoreBanner({
  savedAt,
  onRestore,
  onDismiss,
}: RestoreBannerProps) {
  return (
    <div className="restore-banner">
      <span className="restore-banner-icon">💾</span>
      <span className="restore-banner-message">
        A previous session was saved {formatAge(savedAt)}. Restore it?
      </span>
      <button className="restore-banner-restore" onClick={onRestore}>
        Restore Session
      </button>
      <button className="restore-banner-dismiss" onClick={onDismiss}>
        Dismiss
      </button>
    </div>
  );
}
