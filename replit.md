# Email Signature Builder Application

## Overview

This is a modern email signature builder application that allows users to create professional email signatures with customizable templates, animations, and visual elements. The application provides a user-friendly interface for designing signatures and generating them in multiple formats (HTML and GIF).

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a full-stack monorepo architecture with clear separation between client and server code:

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: shadcn/ui components built on top of Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: React hooks for local state, TanStack Query for server state
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **File Upload**: Multer middleware for image handling
- **Session Management**: Express sessions with PostgreSQL store

## Key Components

### Core Features
1. **Template System**: Multiple pre-built signature templates (Professional, Modern, Minimal, Creative, Sales Professional)
2. **Form Builder**: Step-by-step form for personal information, contact details, and social media
3. **Image Management**: Upload and manage headshots, logos, and background images
4. **Animation Engine**: Custom animation system with fade-in, pulse, and cross-dissolve effects
5. **Live Preview**: Real-time signature preview with device view switching (desktop/mobile)
6. **Export Options**: HTML and animated GIF generation capabilities

### Recent Changes (July 31, 2025)
- **PostgreSQL Database Integration**: Successfully migrated from in-memory storage to PostgreSQL using Neon Database
  - Implemented DatabaseStorage class to replace MemStorage while maintaining the same IStorage interface
  - All signatures and templates are now persisted in the database with proper CRUD operations
  - Automatic template initialization ensures default templates are available on first application startup
  - Database schema created and synchronized using Drizzle ORM with `npm run db:push` command
- **Modern Template Implementation**: Created new modern template with dark futuristic design
  - Dark gradient background with cyan accent colors and decorative geometric patterns
  - TECHSPACE branding with modern geometric logo design (three horizontal bars)
  - Circular profile photo with cyan glow effect and animation support
  - HTML export functionality for email client compatibility
  - GIF animation support with element-specific micro-animations
- **Social Media Icon Consistency**: Updated all templates to show social media icons only when corresponding URLs are provided
  - Icons are completely transparent/invisible when input fields are left blank
  - Removed default placeholder icons from minimal and sales professional templates
  - Consistent behavior across modern, minimal, and sales professional templates
- **Sales Professional Template**: Redesigned to match modern visual mockup with left sidebar for social media icons, geometric portrait clipping, and professional branding layout
- **Template Components**: Created dedicated template components with responsive design and modern styling
- **Minimal Template**: Added new minimal template component matching user's visual mockup with APEX Solutions branding, circular gradient portrait, and clean layout
- **Individual Element Animations**: Updated animation system to apply micro-animations to specific elements (logo, headshot, social icons) rather than entire template containers
- **HTML Export**: Updated HTML generation for all templates with email-client-compatible table structures
- **GIF Generation**: Enhanced canvas rendering to support all template designs with element-specific animations and proper visual recreation
- **Upload System Fix**: Resolved image upload issues by fixing multer TypeScript configuration and FormData handling in API requests
- **Typography Update**: Changed all template fonts to "Playfair Display" serif font for enhanced visual appeal and professional appearance
  - Updated Modern template with Playfair Display for company name, personal name, title, and contact information
  - Updated Sales Professional template with Playfair Display throughout all text elements
  - Updated Minimal template with Playfair Display for both mobile and desktop versions
  - Added Google Fonts import for Playfair Display with full weight and style support (400-900, normal and italic)
- **Default Image Settings**: Set optimized default sizes for better template previews
  - Logo size default increased to 160% for better brand visibility
  - Headshot size default set to 110% for optimal portrait presentation
  - Added professional default headshot image for complete template previews
- **Social Media Layout Improvements**: Enhanced icon positioning and sizing
  - Sales Professional template: Centered social icons vertically and increased size to 24px
  - Modern template: Repositioned social icons with 48px right margin for better alignment

### Data Models
- **Signatures**: User-created signatures with personal info, template selection, and customizations
- **Templates**: Pre-defined signature layouts with metadata
- **Images**: File storage for user-uploaded images
- **Social Media**: Social platform links integration

### UI Components
- Responsive design with mobile-first approach
- Comprehensive form validation using Zod schemas
- Toast notifications for user feedback
- Modal dialogs for advanced features
- Progress indicators for multi-step processes

## Data Flow

1. **User Input**: Forms collect personal information, contact details, and preferences
2. **Template Selection**: Users choose from available signature templates
3. **Customization**: Users upload images and configure animations
4. **Live Preview**: Real-time rendering of signature with applied customizations
5. **Export**: Generation of HTML code or animated GIF files
6. **Storage**: Signatures saved to PostgreSQL database with user associations

## External Dependencies

### Database
- **Neon Database**: Serverless PostgreSQL hosting
- **Drizzle ORM**: Type-safe database queries and migrations
- **Connection Pooling**: Built-in connection management

### File Storage
- **Local Storage**: Uploaded images stored in `/uploads` directory
- **File Validation**: Size limits (5MB) and type restrictions (JPEG, PNG, SVG, WebP)

### Third-Party Libraries
- **gif.js**: Client-side GIF generation from canvas frames
- **TanStack Query**: Server state management and caching
- **Radix UI**: Accessible component primitives
- **Embla Carousel**: Carousel/slider functionality
- **date-fns**: Date manipulation utilities

### Development Tools
- **Vite**: Fast development server and build tool
- **ESBuild**: Bundle optimization for production
- **TypeScript**: Type safety across the entire codebase
- **Replit Integration**: Development environment optimizations

## Deployment Strategy

### Development Environment
- **Vite Dev Server**: Hot module replacement for rapid development
- **Express Middleware**: API routes served alongside frontend
- **Environment Variables**: Database connection and configuration management

### Production Build
- **Frontend**: Vite builds optimized React application to `/dist/public`
- **Backend**: ESBuild bundles Express server to `/dist/index.js`
- **Static Assets**: Served directly by Express in production mode

### Database Management
- **Migrations**: Drizzle Kit for schema management
- **Connection**: Environment-based database URL configuration
- **Schema**: Shared TypeScript definitions between client and server

### Scalability Considerations
- **Serverless Ready**: Compatible with serverless deployment platforms
- **Stateless Design**: Session data stored in database, not memory
- **File Management**: Local file storage suitable for single-instance deployment
- **Database Pooling**: Efficient connection management for high concurrency