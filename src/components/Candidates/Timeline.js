import React from 'react';
import './Timeline.css';
import { formatDate } from '../../utils/formatDate';

const Timeline = ({ timeline }) => {
  const getStageLabel = (stage) => {
    const stageLabels = {
      applied: 'Applied',
      screen: 'Screen Interview',
      tech: 'Technical Interview',
      offer: 'Offer Extended',
      hired: 'Hired',
      rejected: 'Rejected'
    };
    return stageLabels[stage] || stage;
  };

  const getStageIcon = (stage) => {
    const stageIcons = {
      applied: '•',
      screen: '•',
      tech: '•',
      offer: '•',
      hired: '•',
      rejected: '•'
    };
    return stageIcons[stage] || '•';
  };

  const getStageColor = (stage) => {
    const stageColors = {
      applied: '#3b82f6',
      screen: '#f59e0b',
      tech: '#f59e0b',
      offer: '#10b981',
      hired: '#10b981',
      rejected: '#ef4444'
    };
    return stageColors[stage] || '#6b7280';
  };

  if (!timeline || timeline.length === 0) {
    return (
      <div className="timeline-empty">
        <p>No timeline entries found</p>
      </div>
    );
  }

  return (
    <div className="timeline">
      {timeline.map((entry, index) => (
        <div key={entry.id} className="timeline-item">
          <div className="timeline-marker">
            <div
              className="timeline-icon"
              style={{ backgroundColor: getStageColor(entry.stage) }}
            >
              {getStageIcon(entry.stage)}
            </div>
            {index < timeline.length - 1 && <div className="timeline-line" />}
          </div>
          
          <div className="timeline-content">
            <div className="timeline-header">
              <h4 className="timeline-title">
                {getStageLabel(entry.stage)}
              </h4>
              <span className="timeline-date">
                {formatDate(entry.timestamp)}
              </span>
            </div>
            
            {entry.notes && (
              <p className="timeline-notes">{entry.notes}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Timeline;
