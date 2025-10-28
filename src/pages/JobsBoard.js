import React, { useState, useEffect, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import JobCard from '../components/Jobs/JobCard';
import JobModal from '../components/Jobs/JobModal';
import Pagination from '../components/Common/Pagination';
import './JobsBoard.css';

const JobsBoard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  });
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    sort: 'order'
  });
  // local input state for debounced search to avoid immediate fetches and focus loss
  const [searchInput, setSearchInput] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page,
        pageSize: pagination.pageSize,
        ...filters
      });

      const response = await fetch(`/api/jobs?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setJobs(data.data);
        setPagination(data.pagination);
      } else {
        setError(data.error || 'Failed to fetch jobs');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.pageSize, filters]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleSearch = (e) => {
    // update local input immediately for smooth typing
    setSearchInput(e.target.value);
    // don't update filters directly here — debounced effect below will update filters.search
  };

  // Debounce updating filters.search so we don't fetch on every keystroke
  useEffect(() => {
    const timeout = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchInput }));
      setPagination(prev => ({ ...prev, page: 1 }));
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchInput]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handleCreateJob = () => {
    setEditingJob(null);
    setShowModal(true);
  };

  const handleEditJob = (job) => {
    setEditingJob(job);
    setShowModal(true);
  };

  const handleJobSaved = () => {
    setShowModal(false);
    setEditingJob(null);
    fetchJobs();
  };

  const handleArchiveToggle = async (jobId, currentStatus) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: currentStatus === 'active' ? 'archived' : 'active'
        })
      });

      if (response.ok) {
        fetchJobs();
      } else {
        const error = await response.json();
        setError(error.error || 'Failed to update job');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const jobId = jobs[source.index].id;
    const fromOrder = jobs[source.index].order;
    const toOrder = jobs[destination.index].order;

    // Optimistic update
    const newJobs = Array.from(jobs);
    const [reorderedJob] = newJobs.splice(source.index, 1);
    newJobs.splice(destination.index, 0, reorderedJob);
    setJobs(newJobs);

    try {
      const response = await fetch(`/api/jobs/${jobId}/reorder`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromOrder, toOrder })
      });

      if (!response.ok) {
        // Rollback on failure
        fetchJobs();
        const error = await response.json();
        setError(error.error || 'Failed to reorder jobs');
      }
    } catch (err) {
      // Rollback on failure
      fetchJobs();
      setError('Network error');
    }
  };

  if (loading) {
    return <div className="loading">Loading jobs...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="jobs-board">
      <div className="jobs-header">
        <h1>Jobs Board</h1>
        <button className="btn btn-primary" onClick={handleCreateJob}>
          Create Job
        </button>
      </div>

      <div className="jobs-filters">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search jobs..."
            value={searchInput}
            onChange={handleSearch}
            aria-label="Search jobs"
          />
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
          <select
            value={filters.sort}
            onChange={(e) => handleFilterChange('sort', e.target.value)}
          >
            <option value="order">Order</option>
            <option value="title">Title</option>
            <option value="createdAt">Date Created</option>
          </select>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="jobs">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="jobs-grid"
            >
              {jobs.map((job, index) => (
                <Draggable key={job.id} draggableId={job.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`job-card-wrapper ${
                        snapshot.isDragging ? 'dragging' : ''
                      }`}
                    >
                      <JobCard
                        job={job}
                        onEdit={handleEditJob}
                        onArchiveToggle={handleArchiveToggle}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {jobs.length === 0 && (
        <div className="empty-state">
          <h3>No jobs found</h3>
          <p>Create your first job to get started</p>
        </div>
      )}

      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={handlePageChange}
      />

      {showModal && (
        <JobModal
          job={editingJob}
          onClose={() => {
            setShowModal(false);
            setEditingJob(null);
          }}
          onSave={handleJobSaved}
        />
      )}
    </div>
  );
};

export default JobsBoard;
