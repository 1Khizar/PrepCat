# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is PrepCat, a state-of-the-art EdTech platform for Pakistani medical aspirants preparing for MDCAT & NUMS exams. The platform combines precision study tools with AI-powered insights to ensure student success.

## Technology Stack

- **Frontend**: Next.js 15+, TypeScript, Tailwind CSS, Framer Motion
- **UI Components**: Lucide React icons
- **State Management**: React built-in hooks (useState, useEffect, etc.)
- **API Communication**: Axios with interceptors for authentication
- **Data Visualization**: Recharts for progress tracking
- **Animations**: Framer Motion for interactive UI elements
- **Authentication**: JWT-based authentication with localStorage storage
- **Styling**: Tailwind CSS with custom design tokens

## Project Structure

```
frontend/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── login/           # Authentication pages
│   │   ├── register/        # User registration
│   │   ├── dashboard/       # Main user dashboard
│   │   └── ...              # Other pages
│   ├── components/          # Reusable UI components
│   └── lib/                 # Utility functions and API setup
├── public/                  # Static assets
└── ...
```

## Key Commands

### Development
```bash
npm run dev     # Start development server
npm run build   # Build for production
npm run start   # Start production server
npm run lint    # Run ESLint
```

### Testing
Currently, there are no specific testing commands configured. Tests would need to be added using Jest/React Testing Library.

## Architecture Patterns

### Authentication Flow
- Uses JWT tokens stored in localStorage
- Axios interceptors handle automatic token attachment to requests
- API interceptors handle token expiration and unauthorized access
- Real-time security checks with polling to detect account blocking/deletion

### Component Structure
- Uses a clean, modern design system with consistent spacing and typography
- Implements a dashboard layout with sidebar navigation
- Mobile-responsive design with bottom navigation on small screens
- Interactive elements with hover states and animations

### State Management
- Local component state with React useState/useReducer
- Global state managed through localStorage for user session data
- API state management with loading/error states

### API Integration
- Centralized API configuration in `src/lib/api.ts`
- Environment-based API URLs (localhost for development, production URL for production)
- Automatic request/response interceptors for authentication handling

## Key Components

### Authentication Pages
- Login (`src/app/login/page.tsx`): Form with email/username and password
- Register (`src/app/register/page.tsx`): Multi-field registration form with password strength validation

### Dashboard
- Main dashboard (`src/app/dashboard/page.tsx`): Comprehensive user interface with:
  - Sidebar navigation
  - Multiple tabs (Home, My Progress, Saved Papers, AI Tutor)
  - Paper browsing by exam type (MDCAT/NUMS) and subject
  - Progress tracking with streaks and activity visualization
  - AI Tutor chat interface with streaming responses

### UI Components
- Navbar (`src/components/Navbar.tsx`): Responsive navigation bar
- Custom styling with Tailwind CSS and custom design tokens in `src/app/globals.css`

## Development Guidelines

### Styling
- Use Tailwind CSS classes for styling
- Follow the established design system with brand colors (blue primary, clean white backgrounds)
- Maintain responsive design for all screen sizes
- Use Framer Motion for animations and interactive elements

### API Integration
- Always use the centralized `api` instance from `src/lib/api.ts`
- Handle loading and error states appropriately
- Implement optimistic UI updates where applicable
- Follow the existing authentication pattern with token storage

### Component Design
- Use TypeScript for type safety
- Implement proper error handling and user feedback
- Follow the existing UI pattern library
- Ensure accessibility with proper semantic HTML

## Common Development Tasks

### Adding New Pages
1. Create a new directory under `src/app/`
2. Add a `page.tsx` file with the page component
3. Implement necessary styling with Tailwind CSS
4. Add navigation links as needed

### Adding API Endpoints
1. Extend the API service in `src/lib/api.ts` if needed
2. Follow the existing request/response patterns
3. Handle authentication appropriately
4. Implement proper error handling

### Adding New Components
1. Create component files in `src/components/`
2. Use TypeScript interfaces for props
3. Follow the existing styling patterns
4. Ensure responsive design

## Testing
Currently, no testing framework is configured. To add testing:
1. Install Jest and React Testing Library
2. Configure test environment
3. Add test files alongside components
4. Implement unit and integration tests

## Deployment
The application is configured for deployment with Next.js:
1. Run `npm run build` to create production build
2. Run `npm run start` to start production server
3. Environment variables should be configured for production API URLs