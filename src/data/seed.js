import db from '../db';

const jobTitles = [
  'Senior Frontend Developer',
  'Full Stack Engineer',
  'React Developer',
  'Node.js Developer',
  'Python Developer',
  'DevOps Engineer',
  'UI/UX Designer',
  'Product Manager',
  'Data Scientist',
  'Machine Learning Engineer',
  'Backend Developer',
  'Mobile App Developer',
  'QA Engineer',
  'Technical Writer',
  'Solutions Architect',
  'Cloud Engineer',
  'Security Engineer',
  'Database Administrator',
  'System Administrator',
  'Business Analyst',
  'Project Manager',
  'Scrum Master',
  'Sales Engineer',
  'Marketing Manager',
  'HR Specialist'
];

const tags = [
  'React', 'JavaScript', 'TypeScript', 'Node.js', 'Python', 'Java', 'C#', 'Go',
  'AWS', 'Azure', 'Docker', 'Kubernetes', 'MongoDB', 'PostgreSQL', 'Redis',
  'GraphQL', 'REST', 'Microservices', 'Agile', 'Scrum', 'Remote', 'Full-time',
  'Part-time', 'Contract', 'Senior', 'Mid-level', 'Junior', 'Lead', 'Manager'
];

const candidateNames = [
  'Aarav Sharma', 'Vivaan Patel', 'Vihaan Kumar', 'Aditya Singh', 'Krishna Reddy',
  'Ananya Sharma', 'Saira Khan', 'Priya Gupta', 'Ishaan Mehta', 'Kavya Nair',
  'Rohan Iyer', 'Neha Rao', 'Arjun Desai', 'Siddharth Joshi', 'Maya Kapoor',
  'Aisha Verma', 'Devansh Choudhary', 'Anika Bhat', 'Sanjay Rao', 'Pooja Sharma',
  'Riya Shah', 'Karan Malhotra', 'Simran Kaur', 'Imran Sheikh', 'Nikhil Rao',
  'Tanvi Sinha', 'Harshad Joshi', 'Meera Nair', 'Kabir Khan', 'Anjali Pillai' 
];

const stages = ['applied', 'screen', 'tech', 'offer', 'hired', 'rejected'];

const questionTypes = [
  'single-choice',
  'multi-choice', 
  'short-text',
  'long-text',
  'numeric',
  'file-upload'
];

const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
};

const generateRandomTags = () => {
  const numTags = Math.floor(Math.random() * 4) + 1;
  const shuffled = [...tags].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, numTags);
};

const generateRandomEmail = (name) => {
  const domain = ['gmail.com', 'yahoo.com', 'outlook.com', 'company.com', 'tech.io'][
    Math.floor(Math.random() * 5)
  ];
  const username = name.toLowerCase().replace(/\s+/g, '.');
  return `${username}@${domain}`;
};

const generateAssessmentSections = () => {
  const sections = [];
  const numSections = Math.floor(Math.random() * 3) + 2; // 2-4 sections
  
  for (let i = 0; i < numSections; i++) {
    const questions = [];
    const numQuestions = Math.floor(Math.random() * 5) + 3; // 3-7 questions per section
    
    for (let j = 0; j < numQuestions; j++) {
      const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
      const question = {
        id: `${i}-${j}`,
        type: questionType,
        text: `Question ${j + 1} in Section ${i + 1}`,
        required: Math.random() > 0.3,
        options: questionType.includes('choice') ? 
          ['Option A', 'Option B', 'Option C', 'Option D'] : undefined,
        validation: {
          minLength: questionType === 'short-text' ? 5 : undefined,
          maxLength: questionType === 'long-text' ? 500 : undefined,
          min: questionType === 'numeric' ? 0 : undefined,
          max: questionType === 'numeric' ? 100 : undefined
        },
        conditional: j > 0 && Math.random() > 0.7 ? {
          dependsOn: `${i}-${j-1}`,
          condition: 'equals',
          value: 'Yes'
        } : undefined
      };
      questions.push(question);
    }
    
    sections.push({
      id: `section-${i}`,
      title: `Section ${i + 1}`,
      description: `This is section ${i + 1} of the assessment`,
      questions
    });
  }
  
  return sections;
};

export const seedDatabase = async (force = false) => {
  try {
    // Check if data already exists
    const existingJobs = await db.jobs.count();
    // Allow forcing a reseed by adding ?forceSeed=1 to the app URL
    const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const forceSeed = force || (urlParams ? urlParams.get('forceSeed') === '1' : false);
    
    if (forceSeed) {
      console.log('Force reseed requested, clearing existing data...');
      // Delete all existing data
      await Promise.all([
        db.jobs.clear(),
        db.candidates.clear(),
        db.candidateTimeline.clear(),
        db.assessments.clear()
      ]);
      console.log('Database cleared successfully');
    } else if (existingJobs > 0) {
      console.log('Database already seeded');
      return;
    }

    console.log('Seeding database with fresh data...');

    // Seed Jobs
    const jobs = [];
    for (let i = 0; i < 25; i++) {
      const title = jobTitles[Math.floor(Math.random() * jobTitles.length)];
      const job = {
        id: `job-${i + 1}`,
        title,
        slug: generateSlug(title),
        status: Math.random() > 0.2 ? 'active' : 'archived',
        tags: generateRandomTags(),
        order: i + 1,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString()
      };
      jobs.push(job);
    }
    await db.jobs.bulkAdd(jobs);

    // Seed Candidates
    const candidates = [];
    for (let i = 0; i < 1000; i++) {
      const name = candidateNames[Math.floor(Math.random() * candidateNames.length)];
      const candidate = {
        id: `candidate-${i + 1}`,
        name,
        email: generateRandomEmail(name),
        stage: stages[Math.floor(Math.random() * stages.length)],
        jobId: jobs[Math.floor(Math.random() * jobs.length)].id,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString()
      };
      candidates.push(candidate);
    }
    await db.candidates.bulkAdd(candidates);

    // Seed Candidate Timeline
    const timelineEntries = [];
    candidates.forEach(candidate => {
      const numEntries = Math.floor(Math.random() * 5) + 1;
      const stageHistory = ['applied'];
      
      // Generate stage progression
      for (let i = 1; i < numEntries; i++) {
        const currentStageIndex = stages.indexOf(stageHistory[stageHistory.length - 1]);
        const nextStage = stages[Math.min(currentStageIndex + 1, stages.length - 1)];
        stageHistory.push(nextStage);
      }
      
      stageHistory.forEach((stage, index) => {
        timelineEntries.push({
          id: `timeline-${candidate.id}-${index}`,
          candidateId: candidate.id,
          stage,
          timestamp: new Date(Date.now() - (stageHistory.length - index) * 24 * 60 * 60 * 1000).toISOString(),
          notes: index > 0 ? `Moved to ${stage} stage` : 'Applied for position'
        });
      });
    });
    await db.candidateTimeline.bulkAdd(timelineEntries);

    // Seed Assessments
    const assessments = [];
    // Create assessments for first 10 jobs to have more test data
    const selectedJobs = jobs.slice(0, 10);
    
    for (let i = 0; i < selectedJobs.length; i++) {
      const assessment = {
        id: `assessment-${i + 1}`,
        jobId: selectedJobs[i].id,
        title: `${selectedJobs[i].title} Assessment`,
        sections: generateAssessmentSections(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      assessments.push(assessment);
    }
    await db.assessments.bulkAdd(assessments);

    console.log('Database seeded successfully');
    console.log(`- ${jobs.length} jobs created`);
    console.log(`- ${candidates.length} candidates created`);
    console.log(`- ${timelineEntries.length} timeline entries created`);
    console.log(`- ${assessments.length} assessments created`);
    
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};
