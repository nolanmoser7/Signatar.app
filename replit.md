# Email Signature Builder Application

## Overview

This is a modern email signature builder application enabling users to create professional, customizable email signatures with templates, animations, and visual elements. It offers a user-friendly interface for design and generates signatures in HTML and GIF formats. The project aims to provide a comprehensive tool for enhancing professional digital communication.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application employs a full-stack monorepo architecture, separating client and server code.

### Frontend Architecture
- **Framework**: React with TypeScript using Vite.
- **UI Library**: shadcn/ui (Radix UI).
- **Styling**: Tailwind CSS with custom CSS variables.
- **State Management**: React hooks (local), TanStack Query (server).
- **Routing**: Wouter.
- **Form Handling**: React Hook Form with Zod validation.
- **UI/UX Decisions**: Responsive design (mobile-first), toast notifications, modal dialogs, progress indicators. The design incorporates a professional aesthetic with specific color schemes like Signatar blue and "Playfair Display" font for enhanced visual appeal. Templates include Professional, Modern, Minimal, Creative, and Sales Professional designs, prioritizing the Sales Professional template for initial launch.
- **Key Features**: Template system, step-by-step form builder, image management with persistent cloud storage, custom animation engine (fade-in, pulse, cross-dissolve, element-specific), live preview (desktop/mobile views), HTML and animated GIF export with reliable image URLs, signature naming and complete state saving (personal info, images, social media, animations, element positions, custom layouts), advanced layout customization with drag-and-drop editor.

### Backend Architecture
- **Runtime**: Node.js with Express.js.
- **Language**: TypeScript with ES modules.
- **Database**: PostgreSQL with Drizzle ORM.
- **File Upload**: Multer for image handling.
- **Session Management**: Express sessions with PostgreSQL store.
- **Technical Implementations**: Authentication system (disabled for dev, bcrypt hashing, cookie-based sessions), persistence of signatures and templates in PostgreSQL, API routes for authentication and signature management.

### Data Models
- **Signatures**: User-created signatures with personal info, template selection, and customizations (including element positions and animations).
- **Templates**: Pre-defined signature layouts with metadata.
- **Images**: File storage for user-uploaded images.
- **Social Media**: Social platform links integration.

### System Design Choices
- **Data Flow**: User input -> Template selection -> Customization (images, animations) -> Live preview -> Export (HTML/GIF) -> Storage (PostgreSQL).
- **Scalability**: Designed for serverless compatibility, stateless design (session data in DB), and efficient database connection management.

## External Dependencies

### Database
- **Neon Database**: Serverless PostgreSQL hosting.
- **Drizzle ORM**: Type-safe database queries and migrations.

### File Storage
- **Replit Object Storage**: Cloud-based file storage with persistent URLs for reliable image rendering in exported signatures.
- **Legacy Local Storage**: Previous implementation with `/uploads` directory (deprecated in favor of object storage).

### Third-Party Libraries
- **gif.js**: Client-side GIF generation.
- **TanStack Query**: Server state management and caching.
- **Radix UI**: Accessible component primitives.
- **Embla Carousel**: Carousel/slider functionality.
- **date-fns**: Date manipulation utilities.
- **bcrypt**: Password hashing.
- **cookie-parser**: Cookie parsing middleware.

### Development Tools (Integrated for project development, not directly part of runtime dependencies)
- **Vite**: Fast development server and build tool.
- **ESBuild**: Bundle optimization.
- **TypeScript**: Type safety.
- **Replit Integration**: Development environment optimizations.