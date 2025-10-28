import { http, HttpResponse } from 'msw';
import db from '../db';

// Helper function to add artificial latency
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Jobs handlers
const jobsHandlers = [
  // GET /api/jobs
  http.get('/api/jobs', async ({ request }) => {
    await delay(200 + Math.random() * 1000);
    
    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '20');
    const status = url.searchParams.get('status') || '';
    const tags = url.searchParams.get('tags') || '';

    let jobs = await db.jobs.orderBy('order').toArray();
    
    // Filter by search
    if (search) {
      jobs = jobs.filter(job => 
        job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.description.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Filter by status
    if (status) {
      jobs = jobs.filter(job => job.status === status);
    }
    
    // Filter by tags
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      jobs = jobs.filter(job => 
        tagArray.some(tag => job.tags.includes(tag))
      );
    }
    
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedJobs = jobs.slice(startIndex, endIndex);
    
    return HttpResponse.json({
      data: paginatedJobs,
      pagination: {
        page,
        pageSize,
        total: jobs.length,
        totalPages: Math.ceil(jobs.length / pageSize)
      }
    });
  }),

  // POST /api/jobs
  http.post('/api/jobs', async ({ request }) => {
    try {
      await delay(200 + Math.random() * 1000);
      
      const jobData = await request.json();
      
      // Generate unique slug
      const baseSlug = jobData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      let slug = baseSlug;
      let counter = 1;
      
      while (await db.jobs.where('slug').equals(slug).first()) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      
      const newJob = {
        id: Date.now().toString(),
        ...jobData,
        slug,
        status: 'active',
        order: await db.jobs.count(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await db.jobs.add(newJob);
      return HttpResponse.json(newJob, { status: 201 });
    } catch (error) {
      return HttpResponse.json(
        { error: 'Internal server error', details: error.message },
        { status: 500 }
      );
    }
  }),

  // PATCH /api/jobs/:id
  http.patch('/api/jobs/:id', async ({ request, params }) => {
    try {
      await delay(200 + Math.random() * 1000);
      
      const { id } = params;
      const updates = await request.json();
      
      const existingJob = await db.jobs.get(id);
      if (!existingJob) {
        return HttpResponse.json({ error: 'Job not found' }, { status: 404 });
      }
      
      const updatedJob = {
        ...existingJob,
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      await db.jobs.put(updatedJob);
      return HttpResponse.json(updatedJob);
    } catch (error) {
      return HttpResponse.json(
        { error: 'Internal server error', details: error.message },
        { status: 500 }
      );
    }
  }),

  // PATCH /api/jobs/:id/reorder
  http.patch('/api/jobs/:id/reorder', async ({ request, params }) => {
    try {
      await delay(200 + Math.random() * 1000);
      
      const { id } = params;
      const { newOrder } = await request.json();
      
      const job = await db.jobs.get(id);
      if (!job) {
        return HttpResponse.json({ error: 'Job not found' }, { status: 404 });
      }
      
      // Simulate 10% failure rate for testing optimistic updates
      if (Math.random() < 0.1) {
        return HttpResponse.json(
          { error: 'Reorder failed - please try again' },
          { status: 500 }
        );
      }
      
      // Update order
      job.order = newOrder;
      job.updatedAt = new Date().toISOString();
      await db.jobs.put(job);
      
      return HttpResponse.json(job);
    } catch (error) {
      return HttpResponse.json(
        { error: 'Internal server error', details: error.message },
        { status: 500 }
      );
    }
  })
];

// Candidates handlers
const candidatesHandlers = [
  // GET /api/candidates
  http.get('/api/candidates', async ({ request }) => {
    await delay(200 + Math.random() * 1000);
    
    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    const stage = url.searchParams.get('stage') || '';
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '50');

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
    
    // Sort by creation date (newest first)
    candidates.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedCandidates = candidates.slice(startIndex, endIndex);
    
    return HttpResponse.json({
      data: paginatedCandidates,
      pagination: {
        page,
        pageSize,
        total: candidates.length,
        totalPages: Math.ceil(candidates.length / pageSize)
      }
    });
  }),

  // POST /api/candidates
  http.post('/api/candidates', async ({ request }) => {
    try {
      await delay(200 + Math.random() * 1000);
      
      const candidateData = await request.json();
      
      const newCandidate = {
        id: Date.now().toString(),
        ...candidateData,
        stage: 'applied',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await db.candidates.add(newCandidate);
      
      // Add to timeline
      await db.candidateTimeline.add({
        id: Date.now().toString(),
        candidateId: newCandidate.id,
        stage: 'applied',
        timestamp: new Date().toISOString(),
        notes: 'Candidate applied'
      });
      
      return HttpResponse.json(newCandidate, { status: 201 });
    } catch (error) {
      return HttpResponse.json(
        { error: 'Internal server error', details: error.message },
        { status: 500 }
      );
    }
  }),

  // PATCH /api/candidates/:id
  http.patch('/api/candidates/:id', async ({ request, params }) => {
    try {
      await delay(200 + Math.random() * 1000);
      
      const { id } = params;
      const updates = await request.json();
      
      const existingCandidate = await db.candidates.get(id);
      if (!existingCandidate) {
        return HttpResponse.json({ error: 'Candidate not found' }, { status: 404 });
      }
      
      const updatedCandidate = {
        ...existingCandidate,
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      await db.candidates.put(updatedCandidate);
      
      // Add to timeline if stage changed
      if (updates.stage && updates.stage !== existingCandidate.stage) {
        await db.candidateTimeline.add({
          id: Date.now().toString(),
          candidateId: id,
          stage: updates.stage,
          timestamp: new Date().toISOString(),
          notes: `Stage changed to ${updates.stage}`
        });
      }
      
      return HttpResponse.json(updatedCandidate);
    } catch (error) {
      return HttpResponse.json(
        { error: 'Internal server error', details: error.message },
        { status: 500 }
      );
    }
  }),

  // GET /api/candidates/:id/timeline
  http.get('/api/candidates/:id/timeline', async ({ params }) => {
    await delay(200 + Math.random() * 1000);
    
    const { id } = params;
    const timeline = await db.candidateTimeline
      .where('candidateId')
      .equals(id)
      .reverse()
      .sortBy('timestamp');
    
    return HttpResponse.json(timeline);
  })
];

// Assessments handlers
const assessmentsHandlers = [
  // GET /api/assessments
  http.get('/api/assessments', async ({ request }) => {
    await delay(200 + Math.random() * 1000);
    
    const url = new URL(request.url);
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
    
    return HttpResponse.json({
      data: enrichedAssessments,
      pagination: {
        page,
        pageSize,
        total: assessments.length,
        totalPages: Math.ceil(assessments.length / pageSize)
      }
    });
  }),

  // GET /api/assessments/:jobId
  http.get('/api/assessments/:jobId', async ({ params }) => {
    await delay(200 + Math.random() * 1000);
    
    const { jobId } = params;
    const assessment = await db.assessments.where('jobId').equals(jobId).first();
    
    return HttpResponse.json(assessment || null);
  }),

  // PUT /api/assessments/:jobId
  http.put('/api/assessments/:jobId', async ({ request, params }) => {
    try {
      await delay(200 + Math.random() * 1000);
      
      const { jobId } = params;
      const assessmentData = await request.json();
      
      const existingAssessment = await db.assessments.where('jobId').equals(jobId).first();
      
      if (existingAssessment) {
        const updatedAssessment = {
          ...existingAssessment,
          ...assessmentData,
          updatedAt: new Date().toISOString()
        };
        await db.assessments.put(updatedAssessment);
        return HttpResponse.json(updatedAssessment);
      } else {
        const newAssessment = {
          id: Date.now().toString(),
          jobId,
          ...assessmentData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await db.assessments.add(newAssessment);
        return HttpResponse.json(newAssessment, { status: 201 });
      }
    } catch (error) {
      return HttpResponse.json(
        { error: 'Internal server error', details: error.message },
        { status: 500 }
      );
    }
  }),

  // DELETE /api/assessments/:jobId
  http.delete('/api/assessments/:jobId', async ({ params }) => {
    try {
      await delay(200 + Math.random() * 1000);
      const { jobId } = params;

      const existing = await db.assessments.where('jobId').equals(jobId).first();
      if (!existing) {
        return HttpResponse.json({ error: 'Assessment not found' }, { status: 404 });
      }

      await db.assessments.where('jobId').equals(jobId).delete();
      return HttpResponse.json(null, { status: 204 });
    } catch (error) {
      return HttpResponse.json(
        { error: 'Internal server error', details: error.message },
        { status: 500 }
      );
    }
  }),

  // POST /api/assessments/:jobId/submit
  http.post('/api/assessments/:jobId/submit', async ({ request, params }) => {
    try {
      await delay(200 + Math.random() * 1000);
      
      const { jobId } = params;
      const responseData = await request.json();
      
      const newResponse = {
        id: Date.now().toString(),
        assessmentId: jobId,
        ...responseData,
        submittedAt: new Date().toISOString()
      };
      
      await db.assessmentResponses.add(newResponse);
      return HttpResponse.json(newResponse, { status: 201 });
    } catch (error) {
      return HttpResponse.json(
        { error: 'Internal server error', details: error.message },
        { status: 500 }
      );
    }
  })
];

// Static asset handlers
const staticHandlers = [
  http.get('/favicon.ico', async () => {
    return HttpResponse.json(null, { status: 200 });
  }),
  
  http.get('/manifest.json', async () => {
    return HttpResponse.json({
      "short_name": "TalentFlow",
      "name": "TalentFlow App",
      "start_url": ".",
      "display": "standalone",
      "theme_color": "#000000",
      "background_color": "#ffffff"
    });
  })
];

// Export all combined handlers
export const handlers = [
  ...staticHandlers,
  ...jobsHandlers,
  ...candidatesHandlers,
  ...assessmentsHandlers
];