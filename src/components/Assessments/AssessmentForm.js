import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import SectionBuilder from './SectionBuilder';
import './AssessmentForm.css';

const AssessmentForm = ({ assessment, onSave, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { control, register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      title: assessment?.title || '',
      sections: assessment?.sections || []
    }
  });

  const watchedData = watch();

  // Update parent on changes for live preview - with debouncing
  useEffect(() => {
    if (onUpdate && watchedData.title) {
      const timeoutId = setTimeout(() => {
        onUpdate(watchedData);
      }, 300); // Debounce to avoid constant updates
      
      return () => clearTimeout(timeoutId);
    }
  }, [watchedData, onUpdate]);

  const { fields: sections, append: appendSection, remove: removeSection } = useFieldArray({
    control,
    name: 'sections'
  });

  const watchedSections = watch('sections');

  const addSection = () => {
    const newSection = {
      id: `section-${Date.now()}`,
      title: '',
      description: '',
      questions: []
    };
    appendSection(newSection);
  };

  const addQuestion = (sectionIndex) => {
    const newQuestion = {
      id: `${sectionIndex}-${Date.now()}`,
      type: 'short-text',
      text: '',
      required: false,
      options: [],
      validation: {},
      conditional: null
    };
    
    const currentSection = watchedSections[sectionIndex];
    const updatedSection = {
      ...currentSection,
      questions: [...currentSection.questions, newQuestion]
    };
    
    setValue(`sections.${sectionIndex}`, updatedSection);
  };

  const removeQuestion = (sectionIndex, questionIndex) => {
    const currentSection = watchedSections[sectionIndex];
    const updatedQuestions = currentSection.questions.filter((_, index) => index !== questionIndex);
    const updatedSection = {
      ...currentSection,
      questions: updatedQuestions
    };
    
    setValue(`sections.${sectionIndex}`, updatedSection);
  };

  const updateQuestion = (sectionIndex, questionIndex, updatedQuestion) => {
    const currentSection = watchedSections[sectionIndex];
    const updatedQuestions = [...currentSection.questions];
    updatedQuestions[questionIndex] = updatedQuestion;
    const updatedSection = {
      ...currentSection,
      questions: updatedQuestions
    };
    
    setValue(`sections.${sectionIndex}`, updatedSection);
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError(null);
      await onSave(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="assessment-form">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-header">
          <div className="form-group">
            <label className="form-label">Assessment Title *</label>
            <input
              type="text"
              className="form-input"
              {...register('title', { required: 'Title is required' })}
              placeholder="Enter assessment title"
            />
            {errors.title && <div className="error">{errors.title.message}</div>}
          </div>
        </div>

        <div className="sections-container">
          <div className="sections-header">
            <h3>Sections</h3>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={addSection}
            >
              + Add Section
            </button>
          </div>

          {sections.map((section, sectionIndex) => (
            <SectionBuilder
              key={section.id}
              section={section}
              sectionIndex={sectionIndex}
              onAddQuestion={addQuestion}
              onRemoveQuestion={removeQuestion}
              onUpdateQuestion={updateQuestion}
              onRemoveSection={() => removeSection(sectionIndex)}
              register={register}
              errors={errors}
            />
          ))}

          {sections.length === 0 && (
            <div className="empty-sections">
              <p>No sections added yet. Click "Add Section" to get started.</p>
            </div>
          )}
        </div>

        {error && <div className="error">{error}</div>}

        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Assessment'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AssessmentForm;
