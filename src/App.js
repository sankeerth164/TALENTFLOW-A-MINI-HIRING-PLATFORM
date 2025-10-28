import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Layout from './components/Layout/Layout';
import JobsBoard from './pages/JobsBoard';
import JobDetail from './pages/JobDetail';
import Candidates from './pages/Candidates';
import CandidateDetail from './pages/CandidateDetail';
import Assessments from './pages/Assessments';
import AssessmentBuilder from './pages/AssessmentBuilder';
import './App.css';

function App() {
  return (
    <DndProvider backend={HTML5Backend}>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/jobs" replace />} />
            <Route path="/jobs" element={<JobsBoard />} />
            <Route path="/jobs/:jobId" element={<JobDetail />} />
            <Route path="/candidates" element={<Candidates />} />
            <Route path="/candidates/:id" element={<CandidateDetail />} />
            <Route path="/assessments" element={<Assessments />} />
            <Route path="/assessments/:jobId" element={<AssessmentBuilder />} />
          </Routes>
        </Layout>
      </Router>
    </DndProvider>
  );
}

export default App;
