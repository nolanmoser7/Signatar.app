# Email Signature Builder Application

## Overview
This application enables users to create professional email signatures with customizable templates, animations, and visual elements. It provides a user-friendly interface for designing signatures and generating them in HTML and GIF formats. The project aims to offer a robust and intuitive solution for personal and business branding through email communication.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React with TypeScript (Vite build tool)
- **UI**: shadcn/ui (built on Radix UI)
- **Styling**: Tailwind CSS
- **State Management**: React hooks (local), TanStack Query (server)
- **Routing**: Wouter
- **Form Handling**: React Hook Form with Zod validation
- **Core Features**: Template system, form builder, image management (upload/cropping), animation engine, live preview, HTML/GIF export.
- **UI/UX Decisions**: Responsive design, vertical tab interface for workflow, toast notifications, modal dialogs, professional typography (Playfair Display), branded aesthetic (Signatar blue).

### Backend
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL (Neon Database) with Drizzle ORM
- **File Upload**: Multer
- **Session Management**: Express sessions with PostgreSQL store
- **Key Components**:
    - **Authentication System**: Cookie-based session management, bcrypt password hashing, secure API routes.
    - **Data Persistence**: Signatures and templates stored in PostgreSQL, replacing in-memory storage.
    - **Signature Management**: Naming, complete state saving (personal info, images, social media, animations, element positions, custom layouts), and tagging (static/dynamic).
    - **Export Logic**: Comprehensive static signature export pipeline with proper image URL conversion, SVG icon rendering, and template preservation.
    - **Image Handling**: Support for both uploaded files (/api/files/) and attached assets (/attached_assets/) with automatic URL conversion for email compatibility.

### System Design Choices
- **Monorepo Architecture**: Clear separation of client and server code.
- **Data Models**: Signatures (user-created with customizations), Templates (pre-defined layouts), Images (uploaded files), Social Media (platform links).
- **Data Flow**: User input -> Template selection -> Customization -> Live preview -> Export -> Storage.

## External Dependencies

### Database
- **Neon Database**: Serverless PostgreSQL hosting.
- **Drizzle ORM**: Type-safe database queries and migrations.

### File Storage
- **Local Storage**: Uploaded images stored in `/uploads` directory (with size/type validation).

### Third-Party Libraries
- **gif.js**: Client-side GIF generation.
- **TanStack Query**: Server state management.
- **Radix UI**: Accessible component primitives.
- **Embla Carousel**: Carousel functionality.
- **date-fns**: Date manipulation.

### Development Tools
- **Vite**: Fast development server and build tool.
- **ESBuild**: Production bundle optimization.
- **TypeScript**: Type safety.