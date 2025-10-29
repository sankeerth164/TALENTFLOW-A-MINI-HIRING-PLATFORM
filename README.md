# TalentFlow - Mini Hiring Platform

A comprehensive React-based hiring platform that allows HR teams to manage jobs, candidates, and assessments with a modern, intuitive interface.

## 🌐 Live Demo

**🚀 [View Live Application](https://talentflowhiringplatform.netlify.app/jobs)**

Experience the full platform with sample data including 25 jobs, 1000+ candidates, and interactive assessments.

## Features

### Jobs Management
- **Jobs Board**: List with server-like pagination & filtering (title, status, tags)
- **Create/Edit Jobs**: Modal-based job creation with validation (title required, unique slug)
- **Archive/Unarchive**: Toggle job status with visual indicators
- **Drag & Drop Reordering**: Optimistic updates with rollback on failure
- **Deep Linking**: Direct access to jobs via `/jobs/:jobId`

### Candidates Management
- **Virtualized List**: Efficient handling of 1000+ candidates with client-side search
- **Advanced Filtering**: Search by name/email and filter by current stage
- **Kanban Board**: Drag-and-drop stage management with visual workflow
- **Candidate Profiles**: Detailed candidate information with timeline of status changes
- **Timeline Tracking**: Complete audit trail of candidate progression

### Assessments Builder
- **Question Types**: Single-choice, multi-choice, short text, long text, numeric, file upload
- **Live Preview**: Real-time preview of assessment as candidates will see it
- **Validation Rules**: Required fields, numeric ranges, character limits
- **Conditional Logic**: Show/hide questions based on previous answers
- **Section Management**: Organize questions into logical sections

## Technical Architecture

### Frontend Stack
- **React 18**: Modern React with hooks and functional components
- **React Router**: Client-side routing with deep linking support
- **React Hook Form**: Form management with validation
- **React DnD**: Drag and drop functionality
- **React Window**: Virtualization for large lists
- **MSW (Mock Service Worker)**: API mocking for development

### Data Layer
- **Dexie.js**: IndexedDB wrapper for local data persistence
- **MSW Handlers**: RESTful API simulation
- **Seed Data**: 25 jobs, 1000 candidates, 3 assessments with 10+ questions each

### Key Technical Decisions

1. **Local-First Architecture**: All data persisted in IndexedDB, MSW simulates network layer
2. **Optimistic Updates**: UI updates immediately, rolls back on API failures
3. **Virtualization**: Efficient rendering of large candidate lists
4. **Error Simulation**: 5-10% error rate on write operations for testing resilience
5. **Mocked Network Layer**: Handlers simulate REST responses without external servers

## Installation & Setup

### Prerequisites
- Node.js
- npm or yarn

### Quick Start

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd talentflow-app
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm start
   ```

3. **Open Application**
   - Navigate to `http://localhost:3000`
   - Database will be automatically seeded with sample data

### Available Scripts

```bash
# Development
npm start          # Start development server
npm test           # Run test suite
npm run build      # Build for production

# Database
npm run seed       # Manually seed database (if needed)
```

## Project Structure

```
src/
├── App.js, App.css
├── index.js, index.css                 # App entry (MSW bootstrapped in dev)
├── components/
│   ├── Layout/                         # Header, nav
│   │   ├── Layout.js, Layout.css
│   ├── Jobs/
│   │   ├── JobCard.js, JobCard.css
│   │   ├── JobModal.js, JobModal.css
│   ├── Candidates/
│   │   ├── CandidateCard.js, CandidateCard.css
│   │   ├── CandidateSlideOver.js, CandidateSlideOver.css
│   │   ├── KanbanBoard.js, KanbanBoard.css
│   │   ├── Timeline.js, Timeline.css
│   ├── Assessments/
│   │   ├── AssessmentForm.js, AssessmentForm.css
│   │   ├── AssessmentPreview.js, AssessmentPreview.css
│   │   ├── SectionBuilder.js, SectionBuilder.css
│   │   └── QuestionBuilder.js, QuestionBuilder.css
│   └── Common/
│       ├── Pagination.js, Pagination.css
├── pages/
│   ├── JobsBoard.js, JobsBoard.css
│   ├── JobDetail.js, JobDetail.css
│   ├── Candidates.js, Candidates.css
│   ├── CandidateDetail.js, CandidateDetail.css
│   ├── Assessments.js, Assessments.css
│   └── AssessmentBuilder.js, AssessmentBuilder.css
├── mock/
│   ├── handlers.js                     # MSW request handlers (write-through to Dexie)
│   └── browser.js                      # MSW worker setup
├── db/
│   └── index.js                        # Dexie schema
├── data/
│   └── seed.js                         # Seeding logic (25 jobs, 1000 candidates, assessments)
└── utils/
    └── formatDate.js
```

## API Endpoints

### Jobs
- `GET /api/jobs` - List jobs with pagination and filtering
- `POST /api/jobs` - Create new job
- `PATCH /api/jobs/:id` - Update job
- `PATCH /api/jobs/:id/reorder` - Reorder jobs (with error simulation)

### Candidates
- `GET /api/candidates` - List candidates with search and filtering
- `POST /api/candidates` - Create new candidate
- `PATCH /api/candidates/:id` - Update candidate stage
- `GET /api/candidates/:id/timeline` - Get candidate timeline

### Assessments
- `GET /api/assessments/:jobId` - Get assessment for job
- `PUT /api/assessments/:jobId` - Create/update assessment
- `POST /api/assessments/:jobId/submit` - Submit assessment response

## UI/UX Features

### Design System
- **Consistent Styling**: CSS modules with design tokens
- **Responsive Design**: Mobile-first approach with breakpoints
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **Loading States**: Skeleton screens and loading indicators
- **Error Handling**: User-friendly error messages

### User Experience
- **Intuitive Navigation**: Clear breadcrumbs and navigation
- **Search & Filter**: Real-time search with multiple filter options
- **Drag & Drop**: Visual feedback for reordering operations
- **Optimistic Updates**: Immediate UI feedback with error recovery
- **Deep Linking**: Shareable URLs for specific jobs and candidates

## Testing & Quality

### Error Simulation
- **Network Errors**: 5-10% failure rate on write operations
- **Rollback Testing**: Optimistic updates with failure recovery

### Data Validation
- **Form Validation**: Client-side validation with Yup schemas
- **Required Fields**: Job titles, candidate names, assessment questions
- **Unique Constraints**: Job slugs must be unique
- **Data Types**: Proper validation for numeric fields, email formats

## Deployment

### 🌐 Live Deployment
This application is currently deployed on **Netlify**:
- **Live URL**: [https://talentflowhiringplatform.netlify.app/jobs](https://talentflowhiringplatform.netlify.app/jobs)
- **Auto-deployment**: Connected to GitHub main branch
- **Build Status**: Automatically builds on every commit

### Build for Production
```bash
npm run build
```

### Environment Variables
```bash
REACT_APP_API_URL=http://localhost:3001  # API base URL
REACT_APP_ENABLE_MOCK=true               # Enable MSW in production
```

### Deployment Options
- **Netlify**: ✅ Currently deployed (Static site deployment)
- **Vercel**: Serverless deployment
- **GitHub Pages**: Free hosting for public repos
- **AWS S3**: Static website hosting

## Future Enhancements

### Planned Features
- **Real-time Collaboration**: WebSocket integration for team collaboration
- **Advanced Analytics**: Candidate pipeline metrics and reporting
- **Email Integration**: Automated email notifications
- **File Upload**: Resume and document management
- **Calendar Integration**: Interview scheduling
- **Mobile App**: React Native companion app

### Technical Improvements
- **Performance**: Code splitting and lazy loading
- **Testing**: Comprehensive test coverage with Jest and React Testing Library
- **Monitoring**: Error tracking with Sentry
- **CI/CD**: Automated deployment pipeline


### Code Standards
- **ESLint**: Configured for React best practices
- **Prettier**: Code formatting
- **Conventional Commits**: Standardized commit messages
- **Component Structure**: Functional components with hooks


### Common Issues

**Database not seeding?**
- Check browser console for errors
- Clear browser storage and refresh
- Verify IndexedDB is enabled

**Drag and drop not working?**
- Ensure you're using a modern browser
- Check for JavaScript errors in console
- Verify React DnD is properly configured

**Performance issues with large lists?**
- Virtualization is enabled for candidates list
- Consider reducing page size in pagination
- Check for memory leaks in browser dev tools

### Getting Help
- **Documentation**: Check this README and inline code comments
- **Issues**: Create GitHub issue with detailed description
- **Discussions**: Use GitHub Discussions for questions

## How to Test Key Flows

### Kanban Drag-and-Drop (Candidates)
1. Go to `Candidates` → switch to `Kanban` view.
2. Drag a candidate card from `Applied` to another stage (e.g., `Screen`).
3. The card moves immediately; the server update is applied after drop (with rollback on failure).

### Slide-over Candidate Profile
1. In `Candidates` list view, click a candidate name.
2. A slide-over opens with: info, stage selector, notes with `@mentions`, timeline.
3. Use “View full profile” to navigate to `/candidates/:id` for the detailed page.

