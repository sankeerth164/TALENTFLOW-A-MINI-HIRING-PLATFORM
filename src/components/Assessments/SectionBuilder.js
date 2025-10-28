import React from 'react';
import QuestionBuilder from './QuestionBuilder';
import './SectionBuilder.css';

const SectionBuilder = ({
  section,
  sectionIndex,
  onAddQuestion,
  onRemoveQuestion,
  onUpdateQuestion,
  onRemoveSection,
  register,
  errors
}) => {
  return (
    <div className="section-builder">
      <div className="section-header">
        <div className="section-info">
          <input
            type="text"
            className="form-input section-title"
            placeholder="Section title"
            defaultValue={section.title}
            {...register(`sections.${sectionIndex}.title`)}
          />
          <textarea
            className="form-textarea section-description"
            placeholder="Section description (optional)"
            defaultValue={section.description}
            {...register(`sections.${sectionIndex}.description`)}
          />
        </div>
        <div className="section-actions">
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => onAddQuestion(sectionIndex)}
          >
            + Add Question
          </button>
          <button
            type="button"
            className="btn btn-outline btn-sm danger"
            onClick={onRemoveSection}
          >
            Remove Section
          </button>
        </div>
      </div>

      <div className="questions-container">
        {section.questions && section.questions.length > 0 ? (
          section.questions.map((question, questionIndex) => (
            <QuestionBuilder
              key={question.id}
              question={question}
              sectionIndex={sectionIndex}
              questionIndex={questionIndex}
              onUpdate={(updatedQuestion) => 
                onUpdateQuestion(sectionIndex, questionIndex, updatedQuestion)
              }
              onRemove={() => onRemoveQuestion(sectionIndex, questionIndex)}
            />
          ))
        ) : (
          <div className="empty-questions">
            <p>No questions in this section yet.</p>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => onAddQuestion(sectionIndex)}
            >
              Add First Question
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SectionBuilder;
