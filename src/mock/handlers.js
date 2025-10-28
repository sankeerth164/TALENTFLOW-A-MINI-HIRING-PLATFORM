import { rest } from 'msw';
import db from '../db';

// Helper function to add artificial latency
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Jobs handlers
const jobsHandlers = [
  // Jobs API
  rest.get('/api/jobs', async (req, res, ctx) => {
    try {
      console.log('[MSW] Handling GET /api/jobs request');
      await delay(200);
    
    const url = new URL(req.url);
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || '';
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
    const sort = url.searchParams.get('sort') || 'order';

      console.log('[MSW] Fetching jobs from database');
    let jobs = await db.jobs.toArray();
    
    if (search) {
      jobs = jobs.filter(job => 
        job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
      );
    }
    
    if (status) {
      jobs = jobs.filter(job => job.status === status);
    }
    
    if (sort === 'title') {
      jobs.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sort === 'createdAt') {
      jobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else {
      jobs.sort((a, b) => a.order - b.order);
    }
    
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedJobs = jobs.slice(startIndex, endIndex);
    
      console.log(`[MSW] Returning ${paginatedJobs.length} jobs`);
    return res(
        ctx.status(200),
      ctx.json({
        data: paginatedJobs,
        pagination: {
          page,
          pageSize,
          total: jobs.length,
          totalPages: Math.ceil(jobs.length / pageSize)
        }
      })
    );
    } catch (error) {
      console.error('[MSW] Error fetching jobs:', error);
      return res(
        ctx.status(500),
        ctx.json({ error: 'Failed to fetch jobs', details: error.message })
      );
    }
  }),

  // GET /api/jobs/:id
  rest.get('/api/jobs/:id', async (req, res, ctx) => {
    try {
      console.log('[MSW] Handling GET /api/jobs/:id request');
      await delay(200);
      
      const { id } = req.params;
      const job = await db.jobs.get(id);
      
      if (!job) {
        return res(ctx.status(404), ctx.json({ error: 'Job not found' }));
      }
      
      return res(ctx.json(job));
    } catch (error) {
      console.error('[MSW] Error fetching job:', error);
      return res(
        ctx.status(500),
        ctx.json({ error: 'Failed to fetch job', details: error.message })
      );
    }
  }),

  // POST /api/jobs
  rest.post('/api/jobs', async (req, res, ctx) => {
    try {
      console.log('[MSW] Handling POST /api/jobs request');
      await delay(200 + Math.random() * 1000);
      
      const jobData = await req.json();
      const id = Date.now().toString();
      
      const newJob = {
        id,
        ...jobData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await db.jobs.add(newJob);
      console.log('[MSW] Created new job:', id);
      return res(ctx.status(201), ctx.json(newJob));
    } catch (error) {
      console.error('[MSW] Error creating job:', error);
      return res(
        ctx.status(500),
        ctx.json({ error: 'Internal server error', details: error.message })
      );
    }
  }),

  // PATCH /api/jobs/:id
  rest.patch('/api/jobs/:id', async (req, res, ctx) => {
    try {
      console.log('[MSW] Handling PATCH /api/jobs/:id request');
      await delay(200 + Math.random() * 1000);
      
      const { id } = req.params;
      const updates = await req.json();
      
      const existingJob = await db.jobs.get(id);
      if (!existingJob) {
        console.log('[MSW] Job not found:', id);
        return res(ctx.status(404), ctx.json({ error: 'Job not found' }));
      }
      
      const updatedJob = {
        ...existingJob,
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      await db.jobs.put(updatedJob);
      console.log('[MSW] Updated job:', id);
      return res(ctx.json(updatedJob));
    } catch (error) {
      console.error('[MSW] Error updating job:', error);
      return res(
        ctx.status(500),
        ctx.json({ error: 'Internal server error', details: error.message })
      );
    }
  }),

  // PATCH /api/jobs/:id/reorder
  rest.patch('/api/jobs/:id/reorder', async (req, res, ctx) => {
    try {
      console.log('[MSW] Handling PATCH /api/jobs/:id/reorder request');
      await delay(200 + Math.random() * 500);
      
      const { id } = req.params;
      const { fromOrder, toOrder } = await req.json();
      
      const job = await db.jobs.get(id);
      if (!job) {
        return res(ctx.status(404), ctx.json({ error: 'Job not found' }));
      }

      // Get all jobs sorted by order
      const allJobs = await db.jobs.toArray();
      allJobs.sort((a, b) => a.order - b.order);

      // Find the source and target positions
      const fromIndex = allJobs.findIndex(j => j.id === id);
      const targetIndex = allJobs.findIndex(j => j.order === toOrder);

      if (fromIndex === -1 || targetIndex === -1) {
        return res(ctx.status(400), ctx.json({ error: 'Invalid reorder' }));
      }

      // Reorder the array
      const [movedJob] = allJobs.splice(fromIndex, 1);
      allJobs.splice(targetIndex, 0, movedJob);

      // Update order values for all affected jobs
      const updatedJobs = [];
      for (let i = 0; i < allJobs.length; i++) {
        const newOrder = i + 1;
        if (allJobs[i].order !== newOrder) {
          const updatedJob = {
            ...allJobs[i],
            order: newOrder,
            updatedAt: new Date().toISOString()
          };
          await db.jobs.put(updatedJob);
          updatedJobs.push(updatedJob);
        }
      }

      console.log('[MSW] Jobs reordered successfully');
      return res(ctx.json({ success: true, jobs: updatedJobs }));
    } catch (error) {
      console.error('[MSW] Error reordering jobs:', error);
      return res(
        ctx.status(500),
        ctx.json({ error: 'Failed to reorder jobs', details: error.message })
      );
    }
  })
];

// Candidates API handlers
export const candidatesHandlers = [
  // GET /candidates
  rest.get('/api/candidates', async (req, res, ctx) => {
    try {
      console.log('[MSW] Handling GET /api/candidates request');
      await delay(200);
      
      const url = new URL(req.url);
      const search = url.searchParams.get('search') || '';
      const stage = url.searchParams.get('stage') || '';
      const page = parseInt(url.searchParams.get('page') || '1');
      const pageSize = parseInt(url.searchParams.get('pageSize') || '20');

      console.log('[MSW] Fetching candidates from database');
      let candidates = await db.candidates.toArray();
      
      // Filter by search
      if (search) {
        candidates = candidates.filter(candidate => 
          candidate.name.toLowerCase().includes(search.toLowerCase()) ||
          candidate.email.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      // Filter by stage
      if (stage) {
        candidates = candidates.filter(candidate => candidate.stage === stage);
      }
      
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedCandidates = candidates.slice(startIndex, endIndex);
      
      console.log(`[MSW] Returning ${paginatedCandidates.length} candidates`);
      return res(
        ctx.status(200),
        ctx.json({
          data: paginatedCandidates,
          pagination: {
            page,
            pageSize,
            total: candidates.length,
            totalPages: Math.ceil(candidates.length / pageSize)
          }
        })
      );
    } catch (error) {
      console.error('[MSW] Error fetching candidates:', error);
      return res(
        ctx.status(500),
        ctx.json({ error: 'Failed to fetch candidates', details: error.message })
      );
    }
  }),

  // GET /candidates/:id
  rest.get('/api/candidates/:id', async (req, res, ctx) => {
    try {
      await delay(200 + Math.random() * 1000);
      const { id } = req.params;
      const candidate = await db.candidates.get(id);
      if (!candidate) {
        return res(ctx.status(404), ctx.json({ error: 'Candidate not found' }));
      }
      return res(ctx.json(candidate));
    } catch (error) {
      return res(
        ctx.status(500),
        ctx.json({ error: 'Failed to fetch candidate', details: String(error) })
      );
    }
  }),

  // POST /candidates
  rest.post('/api/candidates', async (req, res, ctx) => {
    try {
      console.log('[MSW] Handling POST /api/candidates request');
      await delay(200 + Math.random() * 1000);
      
      const candidateData = await req.json();
      const id = Date.now().toString();
      
      const newCandidate = {
        id,
        ...candidateData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await db.candidates.add(newCandidate);
      console.log('[MSW] Created new candidate:', id);
      return res(ctx.status(201), ctx.json(newCandidate));
    } catch (error) {
      console.error('[MSW] Error creating candidate:', error);
      return res(
        ctx.status(500),
        ctx.json({ error: 'Internal server error', details: error.message })
      );
    }
  }),

  // PATCH /candidates/:id
  rest.patch('/api/candidates/:id', async (req, res, ctx) => {
    try {
      console.log('[MSW] Handling PATCH /api/candidates/:id request');
      await delay(200 + Math.random() * 1000);
      
      const { id } = req.params;
      const updates = await req.json();
      
      const existingCandidate = await db.candidates.get(id);
      if (!existingCandidate) {
        console.log('[MSW] Candidate not found:', id);
        return res(ctx.status(404), ctx.json({ error: 'Candidate not found' }));
      }
      
      const updatedCandidate = {
        ...existingCandidate,
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      await db.candidates.put(updatedCandidate);
      
      // Add to timeline if stage changed
      if (updates.stage && updates.stage !== existingCandidate.stage) {
        const timelineEntry = {
          id: Date.now().toString(),
          candidateId: id,
          stage: updates.stage,
          timestamp: new Date().toISOString(),
          notes: updates.notes || ''
        };
        await db.candidateTimeline.add(timelineEntry);
        console.log('[MSW] Added timeline entry for stage change:', timelineEntry.id);
      }
      
      console.log('[MSW] Updated candidate:', id);
      return res(ctx.json(updatedCandidate));
    } catch (error) {
      console.error('[MSW] Error updating candidate:', error);
      return res(
        ctx.status(500),
        ctx.json({ error: 'Internal server error', details: error.message })
      );
    }
  }),

  // GET /candidates/:id/timeline
  rest.get('/api/candidates/:id/timeline', async (req, res, ctx) => {
    try {
      await delay(200 + Math.random() * 1000);
      
      const { id } = req.params;
      const timeline = await db.candidateTimeline
        .where('candidateId')
        .equals(id)
        .sortBy('timestamp');
      
      return res(ctx.json(timeline));
    } catch (error) {
      console.error('[MSW] Error fetching timeline:', error);
      return res(
        ctx.status(500),
        ctx.json({ error: 'Failed to fetch timeline', details: error.message })
      );
    }
  })
];

// Assessments API handlers
export const assessmentsHandlers = [
  // GET /assessments
  rest.get('/api/assessments', async (req, res, ctx) => {
    await delay(200 + Math.random() * 1000);
    
    const url = new URL(req.url);
    const search = url.searchParams.get('search') || '';
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '20');

    let assessments = await db.assessments.toArray();
    
    // Filter by search
    if (search) {
      assessments = assessments.filter(assessment => 
        assessment.title.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Sort by creation date (newest first)
    assessments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedAssessments = assessments.slice(startIndex, endIndex);
    
    // Enrich with job information
    const enrichedAssessments = await Promise.all(
      paginatedAssessments.map(async (assessment) => {
        const job = await db.jobs.get(assessment.jobId);
        return {
          ...assessment,
          jobTitle: job?.title || 'Unknown Job',
          jobStatus: job?.status || 'unknown'
        };
      })
    );
    
    return res(
      ctx.json({
        data: enrichedAssessments,
        pagination: {
          page,
          pageSize,
          total: assessments.length,
          totalPages: Math.ceil(assessments.length / pageSize)
        }
      })
    );
  }),

  // GET /assessments/:jobId
  rest.get('/api/assessments/:jobId', async (req, res, ctx) => {
    await delay(200 + Math.random() * 1000);
    
    const { jobId } = req.params;
    console.log('[MSW] Fetching assessment for jobId:', jobId);
    
    const assessment = await db.assessments.where('jobId').equals(jobId).first();
    console.log('[MSW] Found assessment:', assessment ? 'YES' : 'NO');
    
    if (assessment) {
      console.log('[MSW] Assessment title:', assessment.title);
      console.log('[MSW] Assessment sections count:', assessment.sections?.length);
    }
    
    return res(ctx.json(assessment || null));
  }),

  // PUT /assessments/:jobId
  rest.put('/api/assessments/:jobId', async (req, res, ctx) => {
    try {
      console.log('[MSW] Handling PUT /api/assessments/:jobId request');
    await delay(200 + Math.random() * 1000);
    
    const { jobId } = req.params;
    const assessmentData = await req.json();
    
    const existingAssessment = await db.assessments.where('jobId').equals(jobId).first();
    
    if (existingAssessment) {
      const updatedAssessment = {
        ...existingAssessment,
        ...assessmentData,
        updatedAt: new Date().toISOString()
      };
      await db.assessments.put(updatedAssessment);
        console.log('[MSW] Updated assessment for job:', jobId);
      return res(ctx.json(updatedAssessment));
    } else {
      const newAssessment = {
        id: Date.now().toString(),
        jobId,
        ...assessmentData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await db.assessments.add(newAssessment);
        console.log('[MSW] Created new assessment for job:', jobId);
      return res(ctx.status(201), ctx.json(newAssessment));
      }
    } catch (error) {
      console.error('[MSW] Error updating/creating assessment:', error);
      return res(
        ctx.status(500),
        ctx.json({ error: 'Internal server error', details: error.message })
      );
    }
  }),

  // POST /assessments/:jobId/submit
  rest.post('/api/assessments/:jobId/submit', async (req, res, ctx) => {
    try {
      console.log('[MSW] Handling POST /api/assessments/:jobId/submit request');
    await delay(200 + Math.random() * 1000);
    
    const { jobId } = req.params;
    const responseData = await req.json();
    
    const newResponse = {
      id: Date.now().toString(),
      assessmentId: jobId,
      ...responseData,
      submittedAt: new Date().toISOString()
    };
    
    await db.assessmentResponses.add(newResponse);
      console.log('[MSW] Assessment response submitted:', newResponse.id);
    return res(ctx.status(201), ctx.json(newResponse));
    } catch (error) {
      console.error('[MSW] Error submitting assessment:', error);
      return res(
        ctx.status(500),
        ctx.json({ error: 'Internal server error', details: error.message })
      );
    }
  })
];

// Static asset handlers
const staticHandlers = [
  rest.get('/favicon.ico', async (_, res, ctx) => {
    return res(ctx.status(200));
  }),
  
  rest.get('/manifest.json', async (_, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        "short_name": "TalentFlow",
        "name": "TalentFlow App",
        "start_url": ".",
        "display": "standalone",
        "theme_color": "#000000",
        "background_color": "#ffffff"
      })
    );
  })
];

// Catch-all handler for unmatched requests
const passthroughHandler = rest.get('*', async (req) => req.passthrough());

// Export all combined handlers
export const handlers = [
  ...staticHandlers,
  ...jobsHandlers,
  ...candidatesHandlers,
  ...assessmentsHandlers,
  passthroughHandler // Add catch-all handler last
];
