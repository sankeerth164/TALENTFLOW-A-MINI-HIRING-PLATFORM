import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './JobDetail.css';
import { formatDate } from '../utils/formatDate';

const JobDetail = () => {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/jobs/${jobId}`);
        
        if (response.ok) {
          const jobData = await response.json();
          setJob(jobData);
        } else {
          setError('Job not found');
        }
      } catch (err) {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId]);

  if (loading) {
    return <div className="loading">Loading job details...</div>;
  }

  if (error || !job) {
    return (
      <div className="error-state">
        <h2>Job not found</h2>
        <p>The job you're looking for doesn't exist or has been removed.</p>
        <Link to="/jobs" className="btn btn-primary">
          Back to Jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="job-detail">
      <div className="job-detail-header">
        <Link to="/jobs" className="back-link">
          ← Back to Jobs
        </Link>
        <h1>{job.title}</h1>
        <div className="job-meta">
          <span className={`badge ${job.status === 'active' ? 'badge-success' : 'badge-gray'}`}>
            {job.status === 'active' ? 'Active' : 'Archived'}
          </span>
          <span className="job-slug">/{job.slug}</span>
          <span className="job-order">Order: {job.order}</span>
        </div>
      </div>

      <div className="job-detail-content">
        <div className="job-info">
          <div className="info-section">
            <h3>Job Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Title</label>
                <span>{job.title}</span>
              </div>
              <div className="info-item">
                <label>Slug</label>
                <span className="slug-value">/{job.slug}</span>
              </div>
              <div className="info-item">
                <label>Status</label>
                <span className={`status-badge ${job.status === 'active' ? 'active' : 'archived'}`}>
                  {job.status === 'active' ? 'Active' : 'Archived'}
                </span>
              </div>
              <div className="info-item">
                <label>Order</label>
                <span>{job.order}</span>
              </div>
              <div className="info-item">
                <label>Created</label>
                <span>{formatDate(job.createdAt)}</span>
              </div>
              <div className="info-item">
                <label>Updated</label>
                <span>{formatDate(job.updatedAt)}</span>
              </div>
            </div>
          </div>

          <div className="info-section">
            <h3>Tags</h3>
            <div className="tags-list">
              {job.tags && job.tags.length > 0 ? (
                job.tags.map((tag, index) => (
                  <span key={index} className="tag">
                    {tag}
                  </span>
                ))
              ) : (
                <span className="no-tags">No tags assigned</span>
              )}
            </div>
          </div>
        </div>

        <div className="job-actions">
          <Link to={`/assessments/${job.id}`} className="btn btn-primary">
            Manage Assessment
          </Link>
          <Link to="/candidates" className="btn btn-secondary">
            View Candidates
          </Link>
        </div>
      </div>
    </div>
  );
};

export default JobDetail;
