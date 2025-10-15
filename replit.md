# AI for Business Platform

## Overview

This is a full-stack web application for discovering and comparing AI services for business use. The platform allows users to browse, search, filter, and compare various AI tools across categories like copywriting, design, marketing, and text processing. Users can save favorites, track viewing history, manage notifications, calculate costs, and explore industry-specific use cases.

The application is built as a single-page application (SPA) with a React frontend and Express backend, designed to run on the Replit platform.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build Tools:**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and dev server for fast HMR (Hot Module Replacement)
- Wouter for lightweight client-side routing (alternative to React Router)
- Path aliases configured for clean imports (`@/`, `@shared/`, `@assets/`)

**UI Component Strategy:**
- shadcn/ui component library (Radix UI primitives with Tailwind styling)
- "New York" style variant configured in components.json
- Comprehensive component coverage including forms, dialogs, cards, navigation, data display
- Dark mode support with class-based theme switching
- Custom CSS variables for consistent theming (defined in index.css)

**State Management:**
- React Context API (AppContext) for global application state
- TanStack Query (React Query) for server state and data fetching
- Local state with useState/useEffect for component-level concerns
- localStorage for persistence of favorites, comparison list, history, and notifications

**Styling Approach:**
- Tailwind CSS with custom configuration (neutral base color, custom border radius)
- CSS custom properties for theme colors supporting light/dark modes
- Hover and active state elevation effects via utility classes
- PostCSS for CSS processing with autoprefixer

### Backend Architecture

**Server Framework:**
- Express.js as the HTTP server framework
- TypeScript for type safety across the stack
- Development mode with tsx for hot reloading
- Production build uses esbuild for efficient bundling

**Development Environment:**
- Replit-specific plugins for enhanced development experience:
  - Runtime error overlay for debugging
  - Cartographer for code navigation
  - Dev banner for environment awareness
- Vite middleware integration in development mode
- Custom logging middleware for API request tracking

**API Design:**
- RESTful API pattern with `/api` prefix for all endpoints
- JSON request/response format
- Error handling middleware with status code and message propagation
- Request/response logging with duration tracking and JSON payload capture

### Data Storage

**Database Configuration:**
- PostgreSQL via Neon serverless driver (@neondatabase/serverless)
- Drizzle ORM for type-safe database operations
- Schema defined in shared/schema.ts for code reuse between client/server
- Zod validation schemas generated from Drizzle schemas

**Data Models:**
- **Users:** Basic authentication with username/password
- **AI Services:** Comprehensive service catalog with categories, pricing, ratings, features
- **Favorites:** User-service relationships for saved items
- **View History:** Tracking of viewed services per user
- **Comparisons:** Saved service comparisons
- **Notifications:** User notification system with read/unread status

**Storage Abstraction:**
- IStorage interface defining CRUD operations
- MemStorage implementation for in-memory development/testing
- Designed for easy swapping to database-backed storage
- Currently using mock data (MOCK_SERVICES) on frontend pending API implementation

### Application Features

**Core Functionality:**
- Service catalog browsing with grid layout (3 columns × 2 rows per page)
- Advanced filtering: category, price type (Free/Freemium/Paid), rating thresholds
- Sorting options: rating, popularity, date, price
- AI-powered search (placeholder for future implementation)
- Detailed service pages with full descriptions, features, pricing tiers, use cases

**User Features:**
- Favorites management with localStorage persistence
- Service comparison (up to 4 services) with feature matrix
- Viewing history tracking
- Notification system with unread count badges
- Cost calculator for team-based pricing estimation
- Industry-specific use case explorer
- Breadcrumb navigation on all pages for easy wayfinding

**Data Export:**
- CSV export functionality for favorites and comparisons
- PDF export placeholder (requires library integration)

### External Dependencies

**UI & Component Libraries:**
- Radix UI primitives for accessible, unstyled components
- Lucide React for iconography
- cmdk for command palette patterns
- embla-carousel-react for carousel functionality
- vaul for drawer components
- react-day-picker for calendar/date selection

**Form & Validation:**
- React Hook Form for form state management
- @hookform/resolvers for validation schema integration
- Zod for runtime type validation and schema definition

**Utilities:**
- class-variance-authority (cva) for variant-based styling
- clsx + tailwind-merge for conditional class composition
- date-fns for date manipulation and formatting
- nanoid for unique ID generation

**Development Tools:**
- drizzle-kit for database migrations and schema management
- @replit/* plugins for enhanced Replit development experience
- esbuild for production bundling

**Database & ORM:**
- @neondatabase/serverless for PostgreSQL connectivity
- drizzle-orm for TypeScript-first ORM
- drizzle-zod for automatic Zod schema generation from database schema
- connect-pg-simple for PostgreSQL session storage (configured but not actively used)

**Session Management:**
- express-session integration prepared (via connect-pg-simple)
- Currently using cookie-based credentials for API requests

### Design System

**Color Scheme:**
- Dark mode as default (class="dark" on root HTML)
- HSL-based color system with CSS custom properties
- Neutral base color palette
- High contrast for accessibility
- Elevation effects via background overlays (--elevate-1, --elevate-2)

**Typography:**
- Multiple font families configured (Architects Daughter, DM Sans, Fira Code, Geist Mono)
- Consistent typographic hierarchy across components
- Font preloading from Google Fonts

**Component Patterns:**
- Card-based layouts with consistent border radius (9px/6px/3px)
- Badge variants for categorization and status
- Icon-driven navigation with visual feedback
- Breadcrumb navigation with shadcn Breadcrumb component (ChevronRight separators)
- Responsive grid layouts with mobile considerations

**Navigation Features:**
- Breadcrumbs on all pages showing hierarchical navigation:
  * Service Detail: Home > [Category] > [Service Name]
  * All other pages: Home > [Page Name]
- Clickable category badges that filter catalog and navigate to home
- "View All [Category]" button in similar services section
- Logo-based service cards with fallback to initials
- Price formatting with "From" prefix for paid services