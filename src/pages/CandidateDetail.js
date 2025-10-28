import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Timeline from '../components/Candidates/Timeline';
import './CandidateDetail.css';
import { formatDate } from '../utils/formatDate';

const CandidateDetail = () => {
  const { id } = useParams();
  const [candidate, setCandidate] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [note, setNote] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSuggestions, setMentionSuggestions] = useState([]);
  const [selectedStage, setSelectedStage] = useState('');

  useEffect(() => {
    const fetchCandidate = async () => {
      try {
        setLoading(true);
        
        // Fetch candidate details
        const candidateResponse = await fetch(`/api/candidates/${id}`);
        if (!candidateResponse.ok) {
          setError('Candidate not found');
          return;
        }
        const candidateData = await candidateResponse.json();
        setCandidate(candidateData);

        // Fetch timeline
        const timelineResponse = await fetch(`/api/candidates/${id}/timeline`);
        if (timelineResponse.ok) {
          const timelineData = await timelineResponse.json();
          setTimeline(timelineData);
        }
      } catch (err) {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };

    fetchCandidate();
  }, [id]);

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

  if (loading) {
    return <div className="loading">Loading candidate details...</div>;
  }

  if (error || !candidate) {
    return (
      <div className="error-state">
        <h2>Candidate not found</h2>
        <p>The candidate you're looking for doesn't exist or has been removed.</p>
        <Link to="/candidates" className="btn btn-primary">
          Back to Candidates
        </Link>
      </div>
    );
  }

  const stageConfig = getStageBadge(candidate.stage);

  const handleNoteChange = (e) => {
    const value = e.target.value;
    setNote(value);
    
    // Check for @ mentions
    const lastAtIndex = value.lastIndexOf('@');
    if (lastAtIndex !== -1) {
      const afterAt = value.substring(lastAtIndex + 1).toLowerCase();
      const mentions = ['john', 'jane', 'sarah', 'michael', 'emily'];
      const suggestions = mentions.filter(m => 
        m.toLowerCase().includes(afterAt) && afterAt.length > 0
      );
      
      if (suggestions.length > 0) {
        setShowMentions(true);
        setMentionSuggestions(suggestions);
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  const insertMention = (mention) => {
    const lastAtIndex = note.lastIndexOf('@');
    const newNote = note.substring(0, lastAtIndex) + `@${mention} `;
    setNote(newNote);
    setShowMentions(false);
  };

  const handleStageUpdate = async (e) => {
    const newStage = e.target.value;
    if (newStage === candidate.stage) return;
    
    setSelectedStage(newStage);
    try {
      const response = await fetch(`/api/candidates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          stage: newStage,
          notes: note || ''
        })
      });

      if (response.ok) {
        // Refresh candidate and timeline
        const updatedCandidate = await response.json();
        setCandidate(updatedCandidate);
        
        const timelineResponse = await fetch(`/api/candidates/${id}/timeline`);
        if (timelineResponse.ok) {
          const timelineData = await timelineResponse.json();
          setTimeline(timelineData);
        }
        
        setNote('');
        setSelectedStage('');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  return (
    <div className="candidate-detail">
      <div className="candidate-detail-header">
        <Link to="/candidates" className="back-link">
          ← Back to Candidates
        </Link>
        <div className="candidate-header-content">
          <div className="candidate-info">
            <h1>{candidate.name}</h1>
            <p className="candidate-email">{candidate.email}</p>
            <div className="candidate-status">
              <span className={`badge ${stageConfig.class}`}>
                {stageConfig.label}
              </span>
            </div>
          </div>
          <div className="candidate-actions">
            <Link to={`/jobs/${candidate.jobId}`} className="btn btn-outline">
              View Job
            </Link>
          </div>
        </div>
      </div>

      <div className="candidate-detail-content">
        <div className="candidate-details">
          <div className="info-section">
            <h3>Candidate Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Name</label>
                <span>{candidate.name}</span>
              </div>
              <div className="info-item">
                <label>Email</label>
                <span>{candidate.email}</span>
              </div>
              <div className="info-item">
                <label>Current Stage</label>
                <span className={`status-badge ${candidate.stage}`}>
                  {stageConfig.label}
                </span>
              </div>
              <div className="info-item">
                <label>Applied Date</label>
                <span>{formatDate(candidate.createdAt)}</span>
              </div>
              <div className="info-item">
                <label>Last Updated</label>
                <span>{formatDate(candidate.updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="candidate-notes">
          <h3>Add Note or Change Stage</h3>
          <div className="notes-section">
            <textarea
              className="notes-input"
              placeholder="Add notes or mention someone with @..."
              value={note}
              onChange={handleNoteChange}
              rows="4"
            />
            {showMentions && mentionSuggestions.length > 0 && (
              <div className="mention-suggestions">
                {mentionSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    className="mention-item"
                    onClick={() => insertMention(suggestion)}
                  >
                    @{suggestion}
                  </button>
                ))}
              </div>
            )}
            <div className="stage-update-section">
              <label>Update Stage:</label>
              <select
                value={selectedStage || candidate.stage}
                onChange={handleStageUpdate}
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
          </div>
        </div>

        <div className="candidate-timeline">
          <h3>Timeline</h3>
          <Timeline timeline={timeline} />
        </div>
      </div>
    </div>
  );
};

export default CandidateDetail;
