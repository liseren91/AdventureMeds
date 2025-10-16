# AI for Business Platform

## Overview

This full-stack web application enables businesses to discover, compare, and manage AI services. It offers features for browsing, searching, filtering, and comparing various AI tools across categories like copywriting, design, marketing, and text processing. Users can save favorites, track viewing history, manage notifications, calculate costs, and explore industry-specific use cases. The platform also includes comprehensive features for managing service purchases, subscriptions, and financial transactions through a multi-entity payer system.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend

The frontend is a React 18 SPA with TypeScript, built using Vite. It utilizes Wouter for routing and shadcn/ui (Radix UI + Tailwind CSS) for a consistent "New York" style UI with dark mode support. State management relies on React Context for global state, TanStack Query for server state, and localStorage for client-side persistence of user data (favorites, comparisons, history, cart, purchases, payers, transactions). Styling is managed with Tailwind CSS and custom CSS variables.

### Backend

The backend is an Express.js server developed with TypeScript, running with `tsx` for hot reloading in development and `esbuild` for production. It exposes a RESTful API with JSON communication and includes custom middleware for logging and error handling.

### Data Storage

The application uses PostgreSQL via Neon serverless driver and Drizzle ORM for type-safe database interactions. Key data models include:
- **AI Services**: Comprehensive catalog with categories, pricing, features, and supported job titles.
- **Jobs (Professions)**: Definitions of professions, their AI impact, and associated tasks.
- **Users, Favorites, View History, Comparisons, Notifications**: Standard user-centric data.
- **Payers**: Multi-entity financial accounts (companies/individuals) with balance tracking.
- **Transactions**: Financial operations (deposit, withdrawal, purchase).
- **Purchases**: Service subscriptions linked to payers with billing cycles and status.

### Key Components & Features

- **Service Catalog**: Browsing, advanced filtering (features, use cases, free tier, price range, newness, team size), sorting, and AI-powered search (future).
- **Purchase Flow**: A 3-4 step modal for purchasing services, including plan selection, payer integration with real-time balance validation, credential management, and payment screen (for individual payers only). When individual payer selected, displays payment screen with top-up options (500₽-10000₽ quick select), 4 payment methods (Банковские карты, ЮMoney, СБП, SberPay - UI only), and "Списать с баланса" button. Company payers skip payment screen. Success screen displays "Спасибо за ваш заказ!" with 1-7 day processing time notification. It records transactions and links purchases to payers.
- **Shopping Cart System**: Frontend-only cart with credential input fields for each service, payer selection, balance validation, and dedicated success screen showing order summary with 1-7 day processing time notification.
- **Account Management**: A personal cabinet with tabs for an enhanced dashboard overview (active services, monthly cost, upcoming payments), "My Services" (active subscriptions, credentials), purchase history, and settings.
- **Job Impact Index**: Analyzes AI's impact on 20 professions, allowing users to filter services by profession and view profession-specific tasks.
- **Finances/Payer Management**: A multi-entity payer system (companies/individuals) with payer creation, balance management (top-up/withdraw), service tracking per payer, and a complete transaction history.
- **User Engagement**: Favorites, service comparison (up to 4 services), viewing history, notification system, and cost calculator.
- **UI/UX**: Consistent card-based layouts, badge variants, icon-driven navigation, and breadcrumb navigation across all pages. Dark mode is default with HSL-based color system.
- **Localization**: Full Russian localization for navigation, pages, forms, and all UI elements. All user-facing content is in Russian for better accessibility.
- **Help & Onboarding**: Contextual tooltips explain complex concepts (payers, payment methods) inline. Comprehensive Help/FAQ page at `/help` covers platform basics, payment system, glossary, and beginner guidance.

## External Dependencies

### UI & Component Libraries

- **shadcn/ui**: Component library based on Radix UI primitives and Tailwind CSS.
- **Lucide React**: Iconography.
- **cmdk**: Command palette.
- **embla-carousel-react**: Carousel functionality.
- **vaul**: Drawer components.
- **react-day-picker**: Calendar/date selection.

### Form & Validation

- **React Hook Form**: Form state management.
- **Zod**: Runtime type validation and schema definition.

### Utilities

- **class-variance-authority (cva)**: Variant-based styling.
- **clsx + tailwind-merge**: Conditional class composition.
- **date-fns**: Date manipulation and formatting.
- **nanoid**: Unique ID generation.

### Database & ORM

- **@neondatabase/serverless**: PostgreSQL connectivity.
- **drizzle-orm**: TypeScript-first ORM.
- **drizzle-zod**: Automatic Zod schema generation from database schema.

### Development Tools

- **drizzle-kit**: Database migrations and schema management.
- **@replit/* plugins**: Enhanced Replit development experience.
- **esbuild**: Production bundling.