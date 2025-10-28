import React from 'react';
import { Link } from 'react-router-dom';
import './JobCard.css';
import { formatDate } from '../../utils/formatDate';

const JobCard = ({ job, onEdit, onArchiveToggle }) => {
  const getStatusBadge = (status) => {
    return status === 'active' ? 'badge-success' : 'badge-gray';
  };

  const getStatusText = (status) => {
    return status === 'active' ? 'Active' : 'Archived';
  };

  return (
    <div className="job-card">
      <div className="job-card-header">
        <div className="job-status">
          <span className={`badge ${getStatusBadge(job.status)}`}>
            {getStatusText(job.status)}
          </span>
        </div>
        <div className="job-actions">
          <button
            className="btn btn-sm btn-outline"
            onClick={() => onEdit(job)}
            title="Edit job"
          >
            Edit
          </button>
          <button
            className="btn btn-sm btn-outline"
            onClick={() => onArchiveToggle(job.id, job.status)}
            title={job.status === 'active' ? 'Archive job' : 'Unarchive job'}
          >
            {job.status === 'active' ? 'Archive' : 'Unarchive'}
          </button>
        </div>
      </div>

      <div className="job-card-content">
        <h3 className="job-title">
          <Link to={`/jobs/${job.id}`} className="job-link">
            {job.title}
          </Link>
        </h3>
        
        <div className="job-meta">
          <span className="job-slug">/{job.slug}</span>
          <span className="job-order">Order: {job.order}</span>
        </div>

        <div className="job-tags">
          {job.tags.map((tag, index) => (
            <span key={index} className="tag">
              {tag}
            </span>
          ))}
        </div>

        <div className="job-dates">
          <small className="text-muted">
            Created: {formatDate(job.createdAt)}
          </small>
        </div>
      </div>
    </div>
  );
};

export default JobCard;
