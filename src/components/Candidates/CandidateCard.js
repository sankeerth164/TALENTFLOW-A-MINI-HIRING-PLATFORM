import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './CandidateCard.css';
import { formatDate } from '../../utils/formatDate';

const CandidateCard = ({ candidate, onStageChange, view = 'list', onOpen }) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const getStageBadge = (stage) => {
    const stageConfig = {
      applied: { class: 'badge-info', label: 'Applied' },
      screen: { class: 'badge-warning', label: 'Screen' },
      tech: { class: 'badge-warning', label: 'Tech' },
      offer: { class: 'badge-success', label: 'Offer' },
      hired: { class: 'badge-success', label: 'Hired' },
      rejected: { class: 'badge-danger', label: 'Rejected' }
    };
    return stageConfig[stage] || { class: 'badge-gray', label: stage };
  };

  const handleStageChange = async (newStage) => {
    if (newStage === candidate.stage) return;
    
    setIsUpdating(true);
    try {
      await onStageChange(candidate.id, newStage);
    } finally {
      setIsUpdating(false);
    }
  };

  const stageConfig = getStageBadge(candidate.stage);
  const initials = (candidate.name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0])
    .join('')
    .toUpperCase();

  return (
    <div className={`candidate-card ${view}`}>
      <div className="candidate-header">
        <div className="candidate-info">
          <div className="candidate-avatar" aria-hidden>{initials || '?'}</div>
          <h3 className="candidate-name">
            <Link
              to={`/candidates/${candidate.id}`}
              className="candidate-link"
              onClick={onOpen ? (e) => { e.preventDefault(); onOpen(candidate.id); } : undefined}
            >
              {candidate.name}
            </Link>
          </h3>
          <p className="candidate-email">{candidate.email}</p>
        </div>
        <div className="candidate-status">
          <span className={`badge ${stageConfig.class}`}>
            {stageConfig.label}
          </span>
        </div>
      </div>

      <div className="candidate-meta">
        <div className="candidate-dates">
          <small className="text-muted">
            Applied: {formatDate(candidate.createdAt)}
          </small>
        </div>
      </div>

      {view === 'list' && (
        <div className="candidate-actions">
          <select
            value={candidate.stage}
            onChange={(e) => handleStageChange(e.target.value)}
            disabled={isUpdating}
            className="stage-select"
          >
            <option value="applied">Applied</option>
            <option value="screen">Screen</option>
            <option value="tech">Tech</option>
            <option value="offer">Offer</option>
            <option value="hired">Hired</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      )}

      {isUpdating && (
        <div className="updating-overlay">
          <span>Updating...</span>
        </div>
      )}
    </div>
  );
};

export default CandidateCard;
