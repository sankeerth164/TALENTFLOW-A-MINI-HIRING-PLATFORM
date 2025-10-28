import React, { useState, useEffect } from 'react';
import './QuestionBuilder.css';

const QuestionBuilder = ({ question, sectionIndex, questionIndex, onUpdate, onRemove }) => {
  // Ensure questionData always has expected shape to avoid runtime errors
  const [questionData, setQuestionData] = useState(() => ({
    type: question?.type || 'short-text',
    text: question?.text || '',
    required: question?.required || false,
    options: question?.options || [],
    validation: question?.validation || {},
    conditional: question?.conditional || null,
    ...question
  }));

  useEffect(() => {
    setQuestionData({
      type: question?.type || 'short-text',
      text: question?.text || '',
      required: question?.required || false,
      options: question?.options || [],
      validation: question?.validation || {},
      conditional: question?.conditional || null,
      ...question
    });
  }, [question]);

  const handleFieldChange = (field, value) => {
    const updatedQuestion = {
      ...questionData,
      [field]: value
    };
    setQuestionData(updatedQuestion);
    // call onUpdate if provided by parent
    if (typeof onUpdate === 'function') onUpdate(updatedQuestion);
  };

  const handleOptionChange = (optionIndex, value) => {
    const updatedOptions = [...(questionData.options || [])];
    updatedOptions[optionIndex] = value;
    handleFieldChange('options', updatedOptions);
  };

  const addOption = () => {
    const updatedOptions = [...(questionData.options || []), ''];
    handleFieldChange('options', updatedOptions);
  };

  const removeOption = (optionIndex) => {
    const updatedOptions = (questionData.options || []).filter((_, index) => index !== optionIndex);
    handleFieldChange('options', updatedOptions);
  };

  // removed unused getQuestionTypeLabel to avoid lint warnings

  const renderQuestionTypeOptions = () => {
  if (!String(questionData.type).includes('choice')) return null;

    return (
      <div className="options-container">
        <label className="form-label">Options</label>
  {(questionData.options || []).map((option, index) => (
          <div key={index} className="option-input">
            <input
              type="text"
              className="form-input"
              value={option}
              onChange={(e) => handleOptionChange(index, e.target.value)}
              placeholder={`Option ${index + 1}`}
            />
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => removeOption(index)}
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={addOption}
        >
          + Add Option
        </button>
      </div>
    );
  };

  const renderValidationOptions = () => {
    if (questionData.type === 'short-text' || questionData.type === 'long-text') {
      return (
        <div className="validation-container">
          <div className="form-group">
            <label className="form-label">Min Length</label>
            <input
              type="number"
              className="form-input"
              value={questionData.validation?.minLength || ''}
              onChange={(e) => handleFieldChange('validation', {
                ...questionData.validation,
                minLength: parseInt(e.target.value) || undefined
              })}
              placeholder="Minimum length"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Max Length</label>
            <input
              type="number"
              className="form-input"
              value={questionData.validation?.maxLength || ''}
              onChange={(e) => handleFieldChange('validation', {
                ...questionData.validation,
                maxLength: parseInt(e.target.value) || undefined
              })}
              placeholder="Maximum length"
            />
          </div>
        </div>
      );
    }

    if (questionData.type === 'numeric') {
      return (
        <div className="validation-container">
          <div className="form-group">
            <label className="form-label">Min Value</label>
            <input
              type="number"
              className="form-input"
              value={questionData.validation?.min || ''}
              onChange={(e) => handleFieldChange('validation', {
                ...questionData.validation,
                min: parseInt(e.target.value) || undefined
              })}
              placeholder="Minimum value"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Max Value</label>
            <input
              type="number"
              className="form-input"
              value={questionData.validation?.max || ''}
              onChange={(e) => handleFieldChange('validation', {
                ...questionData.validation,
                max: parseInt(e.target.value) || undefined
              })}
              placeholder="Maximum value"
            />
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="question-builder">
      <div className="question-header">
        <div className="question-info">
          <input
            type="text"
            className="form-input question-text"
            value={questionData.text}
            onChange={(e) => handleFieldChange('text', e.target.value)}
            placeholder="Enter your question here..."
          />
        </div>
        <div className="question-actions">
          <button
            type="button"
            className="btn btn-outline btn-sm danger"
            onClick={onRemove}
          >
            Remove
          </button>
        </div>
      </div>

      <div className="question-config">
        <div className="config-row">
          <div className="form-group">
            <label className="form-label">Question Type</label>
            <select
              className="form-select"
              value={questionData.type}
              onChange={(e) => handleFieldChange('type', e.target.value)}
            >
              <option value="short-text">Short Text</option>
              <option value="long-text">Long Text</option>
              <option value="single-choice">Single Choice</option>
              <option value="multi-choice">Multiple Choice</option>
              <option value="numeric">Numeric</option>
              <option value="file-upload">File Upload</option>
            </select>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={questionData.required}
                onChange={(e) => handleFieldChange('required', e.target.checked)}
              />
              Required
            </label>
          </div>
        </div>

        {renderQuestionTypeOptions()}
        {renderValidationOptions()}
        
        {/* Conditional Question Settings */}
        <div className="conditional-container">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={!!questionData.conditional}
              onChange={(e) => handleFieldChange('conditional', e.target.checked ? {
                dependsOn: '',
                condition: 'equals',
                value: ''
              } : null)}
            />
            Make this a conditional question
          </label>
          
          {questionData.conditional && (
            <div className="conditional-fields">
              <div className="form-group">
                <label className="form-label">Depends on Question ID</label>
                <input
                  type="text"
                  className="form-input"
                  value={questionData.conditional.dependsOn || ''}
                  onChange={(e) => handleFieldChange('conditional', {
                    ...questionData.conditional,
                    dependsOn: e.target.value
                  })}
                  placeholder="Question ID (e.g., 0-0)"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Condition</label>
                <select
                  className="form-select"
                  value={questionData.conditional.condition || 'equals'}
                  onChange={(e) => handleFieldChange('conditional', {
                    ...questionData.conditional,
                    condition: e.target.value
                  })}
                >
                  <option value="equals">Equals</option>
                  <option value="not-equals">Not Equals</option>
                  <option value="contains">Contains</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Value</label>
                <input
                  type="text"
                  className="form-input"
                  value={questionData.conditional.value || ''}
                  onChange={(e) => handleFieldChange('conditional', {
                    ...questionData.conditional,
                    value: e.target.value
                  })}
                  placeholder="Expected value"
                />
              </div>
              <small className="field-hint">
                This question will only show if the specified condition is met
              </small>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionBuilder;
