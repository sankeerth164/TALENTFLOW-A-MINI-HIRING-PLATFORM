import React, { useEffect, useState } from 'react';
import './CandidateSlideOver.css';

const CandidateSlideOver = ({ candidateId, onClose }) => {
  const [candidate, setCandidate] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [note, setNote] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [cRes, tRes] = await Promise.all([
          fetch(`/api/candidates/${candidateId}`),
          fetch(`/api/candidates/${candidateId}/timeline`)
        ]);
        if (!cRes.ok) throw new Error('Candidate not found');
        const c = await cRes.json();
        setCandidate(c);
        if (tRes.ok) setTimeline(await tRes.json());
      } catch (e) {
        setError(e.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    };
    if (candidateId) fetchData();
  }, [candidateId]);

  const updateStage = async (newStage) => {
    try {
      const res = await fetch(`/api/candidates/${candidateId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage, notes: note })
      });
      if (res.ok) {
        const c = await res.json();
        setCandidate(c);
        setNote('');
        const t = await fetch(`/api/candidates/${candidateId}/timeline`);
        if (t.ok) setTimeline(await t.json());
      }
    } catch {}
  };

  if (!candidateId) return null;

  return (
    <div className="slideover-backdrop" onClick={onClose}>
      <div className="slideover-panel" onClick={(e) => e.stopPropagation()}>
        <div className="slideover-header">
          <h3>Candidate</h3>
          <button className="close-btn" onClick={onClose}>Close</button>
        </div>
        {loading ? (
          <div className="loading">Loading...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <div className="slideover-content">
            <div className="candidate-top">
              <div>
                <div className="name">{candidate.name}</div>
                <div className="email">{candidate.email}</div>
              </div>
              <a className="btn btn-outline" href={`/candidates/${candidate.id}`}>View full profile</a>
            </div>
            <div className="stage-row">
              <label>Stage</label>
              <select value={candidate.stage} onChange={(e) => updateStage(e.target.value)}>
                <option value="applied">Applied</option>
                <option value="screen">Screen</option>
                <option value="tech">Tech</option>
                <option value="offer">Offer</option>
                <option value="hired">Hired</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div className="notes-row">
              <textarea
                placeholder="Add note with @mentions..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
              />
              <button className="btn" onClick={() => updateStage(candidate.stage)}>Save note</button>
            </div>
            <div className="timeline">
              <h4>Timeline</h4>
              {timeline.map((t) => (
                <div key={t.id} className="timeline-item">
                  <div className={`badge ${t.stage}`}>{t.stage}</div>
                  <div className="time">{new Date(t.timestamp).toLocaleString()}</div>
                  {t.notes && <div className="notes">{t.notes}</div>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateSlideOver;


