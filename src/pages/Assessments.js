import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import './Assessments.css';

const Assessments = () => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [filters, setFilters] = useState({
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0
  });

  const fetchAssessments = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page,
        pageSize: pagination.pageSize,
        ...filters
      });

      const response = await fetch(`/api/assessments?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setAssessments(data.data);
        setPagination(data.pagination);
      } else {
        setError(data.error || 'Failed to fetch assessments');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.pageSize, filters]);

  useEffect(() => {
    fetchAssessments();
  }, [fetchAssessments]);

  const handleSearch = (e) => {
    setSearchInput(e.target.value);
  };

  // debounce search input to avoid fetching on every keystroke
  useEffect(() => {
    const timeout = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchInput }));
      setPagination(prev => ({ ...prev, page: 1 }));
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchInput]);

  const getTotalQuestions = (assessment) => {
    if (!assessment.sections) return 0;
    return assessment.sections.reduce((total, section) => {
      return total + (section.questions?.length || 0);
    }, 0);
  };

  const getTotalSections = (assessment) => {
    return assessment.sections?.length || 0;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return <div className="loading">Loading assessments...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="assessments">
      <div className="assessments-header">
        <h1>Assessments</h1>
      </div>

      <div className="assessments-filters">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search assessments..."
            value={searchInput}
            onChange={handleSearch}
          />
        </div>
      </div>

      <div className="assessments-grid">
        {assessments.length > 0 ? (
          assessments.map((assessment) => (
            <Link
              key={assessment.id}
              to={`/assessments/${assessment.jobId}`}
              className="assessment-card"
            >
              <div className="assessment-card-header">
                <h3>{assessment.title}</h3>
                <span className={`status-badge ${assessment.jobStatus}`}>
                  {assessment.jobStatus}
                </span>
              </div>
              <div className="assessment-card-body">
                <div className="assessment-info">
                  <span className="info-item">
                    {assessment.jobTitle}
                  </span>
                  <span className="info-item">
                    {getTotalSections(assessment)} sections
                  </span>
                  <span className="info-item">
                    {getTotalQuestions(assessment)} questions
                  </span>
                </div>
              </div>
              <div className="assessment-card-footer">
                <span className="date-info">
                  Created: {formatDate(assessment.createdAt)}
                </span>
                <span className="action-link">Edit Assessment →</span>
              </div>
            </Link>
          ))
        ) : (
          <div className="empty-state">
            <h3>No assessments found</h3>
            <p>Try adjusting your search or create a new assessment from a job page</p>
          </div>
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div className="pagination-info">
          Showing {assessments.length} of {pagination.total} assessments
        </div>
      )}
    </div>
  );
};

export default Assessments;
