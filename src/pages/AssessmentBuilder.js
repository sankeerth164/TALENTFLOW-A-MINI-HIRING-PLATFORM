import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import AssessmentForm from '../components/Assessments/AssessmentForm';
import AssessmentPreview from '../components/Assessments/AssessmentPreview';
import './AssessmentBuilder.css';

const AssessmentBuilder = () => {
  const { jobId } = useParams();
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('builder');
  const [assessmentData, setAssessmentData] = useState(null);

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        setLoading(true);
        console.log('[AssessmentBuilder] Fetching assessment for jobId:', jobId);
        const response = await fetch(`/api/assessments/${jobId}`);
        
        console.log('[AssessmentBuilder] Response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('[AssessmentBuilder] Assessment data:', data);
          if (data) {
            setAssessment(data);
            setAssessmentData(data);
            setError(null);
          } else {
            console.log('[AssessmentBuilder] No assessment exists yet, creating new one');
            // No assessment exists yet, create a new empty one
            const newAssessment = {
              jobId: jobId,
              title: '',
              sections: []
            };
            setAssessment(newAssessment);
            setAssessmentData(newAssessment);
            setError(null);
          }
        } else {
          const errorData = await response.json();
          console.log('[AssessmentBuilder] Error data:', errorData);
          setError('Assessment not found');
        }
      } catch (err) {
        console.error('[AssessmentBuilder] Network error:', err);
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };

    fetchAssessment();
  }, [jobId]);

  useEffect(() => {
    setAssessmentData(assessment);
  }, [assessment]);

  const handleAssessmentSave = async (assessmentData) => {
    try {
      const response = await fetch(`/api/assessments/${jobId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assessmentData)
      });

      if (response.ok) {
        const updatedAssessment = await response.json();
        setAssessment(updatedAssessment);
        return true;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save assessment');
      }
    } catch (err) {
      throw err;
    }
  };

  if (loading) {
    return <div className="loading">Loading assessment...</div>;
  }

  if (error) {
    return (
      <div className="error-state">
        <h2>Assessment not found</h2>
        <p>The assessment you're looking for doesn't exist.</p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/assessments" className="btn btn-outline">
            Back to Assessments
          </Link>
          <Link to="/jobs" className="btn btn-primary">
            Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  const handleBuilderUpdate = (updatedAssessment) => {
    setAssessmentData(updatedAssessment);
  };

  return (
    <div className="assessment-builder">
      <div className="assessment-header">
        <Link to="/assessments" className="back-link">
          ← Back to Assessments
        </Link>
        <h1>Assessment Builder</h1>
        <p className="assessment-subtitle">
          {assessmentData?.title || 'Create a new assessment for this job'}
        </p>
      </div>

      <div className="assessment-tabs">
        <button
          className={`tab-button ${activeTab === 'builder' ? 'active' : ''}`}
          onClick={() => setActiveTab('builder')}
        >
          Builder
        </button>
        <button
          className={`tab-button ${activeTab === 'preview' ? 'active' : ''}`}
          onClick={() => setActiveTab('preview')}
        >
          Preview
        </button>
        <button
          className={`tab-button ${activeTab === 'split' ? 'active' : ''}`}
          onClick={() => setActiveTab('split')}
        >
          Split View
        </button>
      </div>

      <div className="assessment-content">
        {activeTab === 'builder' ? (
          <AssessmentForm
            assessment={assessmentData}
            onSave={handleAssessmentSave}
            onUpdate={handleBuilderUpdate}
          />
        ) : activeTab === 'preview' ? (
          <AssessmentPreview assessment={assessmentData} />
        ) : (
          <div className="split-view">
            <div className="split-panel left-panel">
              <h3>Builder</h3>
              <AssessmentForm
                assessment={assessmentData}
                onSave={handleAssessmentSave}
                onUpdate={handleBuilderUpdate}
              />
            </div>
            <div className="split-panel right-panel">
              <h3>Preview</h3>
              <AssessmentPreview assessment={assessmentData} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssessmentBuilder;
