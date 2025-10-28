import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import CandidateCard from './CandidateCard';
import './KanbanBoard.css';

const KanbanBoard = ({ candidates, onStageChange }) => {
  const stages = [
    { id: 'applied', title: 'Applied', color: '#3b82f6' },
    { id: 'screen', title: 'Screen', color: '#f59e0b' },
    { id: 'tech', title: 'Tech', color: '#f59e0b' },
    { id: 'offer', title: 'Offer', color: '#10b981' },
    { id: 'hired', title: 'Hired', color: '#10b981' },
    { id: 'rejected', title: 'Rejected', color: '#ef4444' }
  ];

  const [localColumns, setLocalColumns] = useState({});

  // sync local state when upstream candidates change
  useEffect(() => {
    setLocalColumns(candidates || {});
  }, [candidates]);

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    
    const { destination, source, draggableId } = result;

    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStage = destination.droppableId;
    const candidateId = draggableId;

    // Local reorder/move to keep DOM stable
    setLocalColumns(prev => {
      const next = { ...prev };
      const sourceList = Array.from(next[source.droppableId] || []);
      const destList = source.droppableId === newStage
        ? sourceList
        : Array.from(next[newStage] || []);

      const sourceIndex = source.index;
      const [moved] = sourceList.splice(sourceIndex, 1);
      const updatedMoved = moved ? { ...moved, stage: newStage } : moved;
      destList.splice(destination.index, 0, updatedMoved);

      next[source.droppableId] = source.droppableId === newStage ? destList : sourceList;
      next[newStage] = destList;
      return next;
    });

    await onStageChange(candidateId, newStage);
  };

  return (
    <div className="kanban-board">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="kanban-columns">
          {stages.map(stage => (
            <div key={stage.id} className="kanban-column">
              <div className="kanban-column-header">
                <h3 className="kanban-column-title" style={{ color: stage.color }}>
                  {stage.title}
                </h3>
                <span className="kanban-column-count">
                  {localColumns[stage.id]?.length || 0}
                </span>
              </div>
              
              <Droppable droppableId={stage.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`kanban-column-content ${
                      snapshot.isDraggingOver ? 'dragging-over' : ''
                    }`}
                  >
                    {(localColumns[stage.id] || []).map((candidate, index) => {
                      if (!candidate || !candidate.id) return null;
                      return (
                        <Draggable
                          key={candidate.id}
                          draggableId={candidate.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`kanban-card-wrapper ${
                                snapshot.isDragging ? 'dragging' : ''
                              }`}
                            >
                              <CandidateCard
                                candidate={candidate}
                                onStageChange={onStageChange}
                                view="kanban"
                              />
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default React.memo(KanbanBoard, (prev, next) => prev.candidates === next.candidates && prev.onStageChange === next.onStageChange);
