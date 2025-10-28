import React, { useState, useEffect } from 'react';
import './AssessmentPreview.css';

const AssessmentPreview = ({ assessment }) => {
  const [responses, setResponses] = useState({});
  const [errors, setErrors] = useState({});
  const [visibleQuestions, setVisibleQuestions] = useState({});

  useEffect(() => {
    // Initialize visibility based on conditional logic
    if (assessment && assessment.sections) {
      const visibility = {};
      assessment.sections.forEach((section, sectionIndex) => {
        section.questions?.forEach((question, questionIndex) => {
          const key = `${sectionIndex}-${questionIndex}`;
          
          if (question.conditional) {
            // Check if the condition is met
            const dependsOnKey = question.conditional.dependsOn;
            const dependsOnResponse = responses[dependsOnKey];
            const conditionalValue = question.conditional.value;
            
            if (dependsOnResponse && conditionalValue) {
              switch (question.conditional.condition) {
                case 'equals':
                  visibility[key] = String(dependsOnResponse).trim() === String(conditionalValue).trim();
                  break;
                case 'not-equals':
                  visibility[key] = String(dependsOnResponse).trim() !== String(conditionalValue).trim();
                  break;
                case 'contains':
                  visibility[key] = String(dependsOnResponse).toLowerCase().includes(String(conditionalValue).toLowerCase());
                  break;
                default:
                  visibility[key] = false;
              }
            } else {
              visibility[key] = false;
            }
          } else {
            visibility[key] = true;
          }
        });
      });
      setVisibleQuestions(visibility);
    } else {
      const allVisible = {};
      if (assessment && assessment.sections) {
        assessment.sections.forEach((section, sectionIndex) => {
          section.questions?.forEach((question, questionIndex) => {
            allVisible[`${sectionIndex}-${questionIndex}`] = true;
          });
        });
      }
      setVisibleQuestions(allVisible);
    }
  }, [assessment, responses]);

  const validateResponse = (question, value) => {
    if (question.required && (!value || value === '')) {
      return 'This field is required';
    }

    if (question.validation) {
      if (question.type === 'short-text' || question.type === 'long-text') {
        if (question.validation.minLength && value.length < question.validation.minLength) {
          return `Must be at least ${question.validation.minLength} characters`;
        }
        if (question.validation.maxLength && value.length > question.validation.maxLength) {
          return `Must be no more than ${question.validation.maxLength} characters`;
        }
      }
      
      if (question.type === 'numeric') {
        const numValue = Number(value);
        if (question.validation.min !== undefined && numValue < question.validation.min) {
          return `Must be at least ${question.validation.min}`;
        }
        if (question.validation.max !== undefined && numValue > question.validation.max) {
          return `Must be no more than ${question.validation.max}`;
        }
      }
    }

    return null;
  };

  const handleChange = (question, value, questionKey) => {
    setResponses(prev => ({
      ...prev,
      [questionKey]: value
    }));

    const error = validateResponse(question, value);
    if (error) {
      setErrors(prev => ({
        ...prev,
        [questionKey]: error
      }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[questionKey];
        return newErrors;
      });
    }
  };

  if (!assessment || !assessment.sections) {
    return (
      <div className="assessment-preview">
        <div className="preview-empty">
          <h3>No Assessment Created Yet</h3>
          <p>Switch to the Builder tab to create your assessment.</p>
        </div>
      </div>
    );
  }

  const renderQuestion = (question, questionIndex, sectionIndex) => {
    const questionKey = `${sectionIndex}-${questionIndex}`;
    const isVisible = visibleQuestions[questionKey] !== false;

    if (!isVisible) {
      return null;
    }

    switch (question.type) {
      case 'short-text':
        return (
          <div key={questionKey} className="question-field">
            <label className="question-label">
              {question.text}
              {question.required && <span className="required">*</span>}
            </label>
            <input
              type="text"
              className="form-input"
              value={responses[questionKey] || ''}
              onChange={(e) => handleChange(question, e.target.value, questionKey)}
              placeholder="Enter your answer..."
            />
            {errors[questionKey] && <div className="field-error">{errors[questionKey]}</div>}
            {question.validation?.minLength && (
              <small className="field-hint">
                Minimum {question.validation.minLength} characters
              </small>
            )}
          </div>
        );

      case 'long-text':
        return (
          <div key={questionKey} className="question-field">
            <label className="question-label">
              {question.text}
              {question.required && <span className="required">*</span>}
            </label>
            <textarea
              className="form-textarea"
              value={responses[questionKey] || ''}
              onChange={(e) => handleChange(question, e.target.value, questionKey)}
              placeholder="Enter your answer..."
              rows="4"
            />
            {errors[questionKey] && <div className="field-error">{errors[questionKey]}</div>}
            {question.validation?.minLength && (
              <small className="field-hint">
                Minimum {question.validation.minLength} characters
              </small>
            )}
          </div>
        );

      case 'single-choice':
        return (
          <div key={questionKey} className="question-field">
            <label className="question-label">
              {question.text}
              {question.required && <span className="required">*</span>}
            </label>
            <div className="radio-group">
              {question.options?.map((option, optionIndex) => (
                <label key={optionIndex} className="radio-option">
                  <input
                    type="radio"
                    name={questionKey}
                    value={option}
                    checked={responses[questionKey] === option}
                    onChange={(e) => handleChange(question, e.target.value, questionKey)}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
            {errors[questionKey] && <div className="field-error">{errors[questionKey]}</div>}
          </div>
        );

      case 'multi-choice':
        return (
          <div key={questionKey} className="question-field">
            <label className="question-label">
              {question.text}
              {question.required && <span className="required">*</span>}
            </label>
            <div className="checkbox-group">
              {question.options?.map((option, optionIndex) => (
                <label key={optionIndex} className="checkbox-option">
                  <input
                    type="checkbox"
                    value={option}
                    checked={(responses[questionKey] || []).includes(option)}
                    onChange={(e) => {
                      const currentValues = responses[questionKey] || [];
                      const newValues = e.target.checked
                        ? [...currentValues, option]
                        : currentValues.filter(v => v !== option);
                      handleChange(question, newValues, questionKey);
                    }}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
            {errors[questionKey] && <div className="field-error">{errors[questionKey]}</div>}
          </div>
        );

      case 'numeric':
        return (
          <div key={questionKey} className="question-field">
            <label className="question-label">
              {question.text}
              {question.required && <span className="required">*</span>}
            </label>
            <input
              type="number"
              className="form-input"
              value={responses[questionKey] || ''}
              onChange={(e) => handleChange(question, e.target.value, questionKey)}
              placeholder="Enter a number..."
            />
            {errors[questionKey] && <div className="field-error">{errors[questionKey]}</div>}
            {question.validation?.min !== undefined && question.validation?.max !== undefined && (
              <small className="field-hint">
                Range: {question.validation.min} - {question.validation.max}
              </small>
            )}
          </div>
        );

      case 'file-upload':
        return (
          <div key={questionKey} className="question-field">
            <label className="question-label">
              {question.text}
              {question.required && <span className="required">*</span>}
            </label>
            <div className="file-upload">
              <input
                type="file"
                onChange={(e) => {
                  const file = e.target.files[0];
                  handleChange(question, file?.name || '', questionKey);
                }}
              />
            </div>
            {errors[questionKey] && <div className="field-error">{errors[questionKey]}</div>}
            {responses[questionKey] && (
              <small className="field-hint">File selected: {responses[questionKey]}</small>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="assessment-preview">
      <div className="preview-header">
        <h2>{assessment.title}</h2>
        <p className="preview-subtitle">Preview of your assessment</p>
      </div>

      <div className="preview-form">
        {assessment.sections.map((section, sectionIndex) => (
          <div key={section.id} className="preview-section">
            <div className="section-header">
              <h3>{section.title}</h3>
              {section.description && (
                <p className="section-description">{section.description}</p>
              )}
            </div>

            <div className="section-questions">
              {section.questions?.map((question, questionIndex) =>
                renderQuestion(question, questionIndex, sectionIndex)
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="preview-footer">
        <button className="btn btn-primary" disabled>
          Submit Assessment (Preview Mode)
        </button>
      </div>
    </div>
  );
};

export default AssessmentPreview;
