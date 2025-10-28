import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';
import CandidateCard from '../components/Candidates/CandidateCard';
import CandidateSlideOver from '../components/Candidates/CandidateSlideOver';
import KanbanBoard from '../components/Candidates/KanbanBoard';
import './Candidates.css';

const Candidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState('list'); // 'list' or 'kanban'
  const [kanbanKey, setKanbanKey] = useState(0); // Key to reset kanban
  const [filters, setFilters] = useState({
    search: '',
    stage: ''
  });
  const [searchInput, setSearchInput] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0
  });
  const [activeCandidateId, setActiveCandidateId] = useState(null);

  const fetchCandidates = useCallback(async () => {
    try {
      setLoading(true);
      // For kanban view, fetch many so columns are filled
      if (view === 'kanban') {
        const params = new URLSearchParams({
          page: 1,
          pageSize: 10000,
          ...filters
        });
        const response = await fetch(`/api/candidates?${params}`);
        const data = await response.json();
        if (response.ok) {
          setCandidates(data.data);
        } else {
          setError(data.error || 'Failed to fetch candidates');
        }
      } else {
        const params = new URLSearchParams({
          page: pagination.page,
          pageSize: pagination.pageSize,
          ...filters
        });
        const response = await fetch(`/api/candidates?${params}`);
        const data = await response.json();
        if (response.ok) {
          setCandidates(data.data);
          setPagination(data.pagination);
        } else {
          setError(data.error || 'Failed to fetch candidates');
        }
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.pageSize, filters, view]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

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

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleStageChange = async (candidateId, newStage) => {
    try {
      const response = await fetch(`/api/candidates/${candidateId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage })
      });

      if (response.ok) {
        if (view !== 'kanban') {
          fetchCandidates();
        } else {
          // sync local upstream list after server confirm
          setCandidates(prev => prev.map(c => c.id === candidateId ? { ...c, stage: newStage } : c));
          setKanbanKey(prev => prev + 1); // reset DnD registry after drop
        }
      } else {
        const error = await response.json();
        setError(error.error || 'Failed to update candidate');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  const groupedCandidates = useMemo(() => {
    if (view !== 'kanban') return {};
    
    const stages = ['applied', 'screen', 'tech', 'offer', 'hired', 'rejected'];
    const grouped = {};
    
    stages.forEach(stage => {
      grouped[stage] = (candidates || []).filter(candidate => candidate.stage === stage);
    });
    
    return grouped;
  }, [candidates, view]);

  const CandidateRow = ({ index, style }) => {
    const candidate = candidates[index];
    const rowStyle = { ...style, padding: '24px 24px' };
    return (
      <div style={rowStyle}>
        <CandidateCard
          candidate={candidate}
          onStageChange={handleStageChange}
          view="list"
          onOpen={() => setActiveCandidateId(candidate.id)}
        />
      </div>
    );
  };

  if (loading) {
    return <div className="loading">Loading candidates...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <>
    <div className="candidates">
      <div className="candidates-header">
        <h1>Candidates</h1>
        <div className="view-toggle">
          <button
            className={`toggle-btn ${view === 'list' ? 'active' : ''}`}
            onClick={() => {
              setView('list');
              setKanbanKey(prev => prev + 1); // Reset kanban
            }}
          >
            List
          </button>
          <button
            className={`toggle-btn ${view === 'kanban' ? 'active' : ''}`}
            onClick={() => {
              setView('kanban');
              setKanbanKey(prev => prev + 1); // Reset kanban
            }}
          >
            Kanban
          </button>
        </div>
      </div>

      <div className="candidates-filters">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search candidates..."
            value={searchInput}
            onChange={handleSearch}
          />
          <select
            value={filters.stage}
            onChange={(e) => handleFilterChange('stage', e.target.value)}
          >
            <option value="">All Stages</option>
            <option value="applied">Applied</option>
            <option value="screen">Screen</option>
            <option value="tech">Tech</option>
            <option value="offer">Offer</option>
            <option value="hired">Hired</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {view === 'list' ? (
        <div className="candidates-list">
          {candidates.length > 0 ? (
            <List
              height={600}
              itemCount={candidates.length}
              itemSize={220}
              width="100%"
            >
              {CandidateRow}
            </List>
          ) : (
            <div className="empty-state">
              <h3>No candidates found</h3>
              <p>Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      ) : (
        <KanbanBoard
          key={`kanban-${kanbanKey}`}
          candidates={groupedCandidates}
          onStageChange={handleStageChange}
        />
      )}

      {view === 'list' && pagination.totalPages > 1 && (
        <div className="pagination-info">
          Showing {candidates.length} of {pagination.total} candidates
        </div>
      )}
    </div>
    {activeCandidateId && (
      <CandidateSlideOver
        candidateId={activeCandidateId}
        onClose={() => setActiveCandidateId(null)}
      />
    )}
    </>
  );
};

export default Candidates;
