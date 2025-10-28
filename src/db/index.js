import Dexie from 'dexie';

const db = new Dexie('TalentFlowDB');

db.version(2).stores({
  jobs: 'id, title, slug, status, tags, order, createdAt, updatedAt',
  candidates: 'id, name, email, stage, jobId, createdAt, updatedAt',
  candidateTimeline: 'id, candidateId, stage, timestamp, notes',
  assessments: 'id, jobId, title, sections, createdAt, updatedAt',
  assessmentResponses: 'id, assessmentId, candidateId, responses, submittedAt'
});

export default db;
