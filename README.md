# Versisi

A comprehensive project scope management and change control system built with Next.js, designed for software development teams and their clients.

## Overview

Versisi is a collaborative platform that streamlines project scope management, change proposals, and approval workflows between development teams and clients. It provides version-controlled project scopes, structured change management, and digital signature capabilities for approvals.

## Key Features

### Project Management
- Multi-workspace support for organizing teams and projects
- Client organization management with dedicated portals
- Role-based access control (RBAC) for team members and clients
- Project status tracking (Draft, Active, Released, Archived)

### Scope Management
- Version-controlled project scopes with major/minor versioning
- Immutable scope versions after approval
- Hierarchical scope structure with sections and items
- Priority-based scope items (Must-have, Should-have, Could-have)
- Acceptance criteria definition

### Change Proposals
- Structured change request workflow
- Impact assessment (timeline, cost, risk analysis)
- Differential tracking between scope versions
- Proposal status management (Draft, Internal Review, Awaiting Approval, Approved, Rejected, Withdrawn)
- Support for both client-initiated and developer-initiated changes

### Approval & Signatures
- Configurable approval rules for clients and developers
- Digital signature capture with audit trail
- Multi-recipient approval workflows
- Email notifications for approval requests
- Signature verification with IP tracking and user agent logging

### Collaboration
- Real-time commenting system with thread support
- Internal and shared comment visibility modes
- Field-level comments on scope items
- Comment resolution tracking

### Audit & Compliance
- Comprehensive audit logging for all actions
- Immutable audit trail
- Snapshot hashing for version integrity
- Signature verification and compliance tracking

## Technology Stack

- **Framework**: Next.js 16 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js v5
- **Styling**: Tailwind CSS v4
- **Email**: Nodemailer/Resend for notifications
- **Document Generation**: PDFKit for PDF exports, ExcelJS for spreadsheets, DOCX for Word documents
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 20 or higher
- PostgreSQL database
- npm or pnpm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd versisi
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following variables:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/versisi"
AUTH_SECRET="your-secret-key"
AUTH_URL="http://localhost:3000"
RESEND_API_KEY="your-resend-api-key"
```

4. Run database migrations:
```bash
npx prisma migrate dev
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
versisi/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── (auth)/            # Authentication pages
│   ├── (main)/            # Main application pages
│   └── ...
├── components/            # React components
│   ├── ui/               # UI primitives
│   └── ...
├── lib/                  # Utility libraries
│   ├── auth/            # Authentication logic
│   ├── db/              # Database utilities
│   └── ...
├── prisma/              # Database schema and migrations
├── types/               # TypeScript type definitions
└── public/              # Static assets
```

## Database Schema

The application uses a comprehensive PostgreSQL schema with the following main entities:

- **Users & Authentication**: Internal users, client users, workspaces
- **Projects**: Multi-tenant project management with client organizations
- **Scope Versions**: Immutable, version-controlled project scopes
- **Change Proposals**: Structured change request system
- **Approvals**: Digital signature workflow with multi-party approval
- **Comments**: Threaded commenting system
- **Audit Log**: Comprehensive activity tracking

## Development

### Code Style

The project uses ESLint and Prettier for code formatting:

```bash
npm run lint
npm run format
```

### Database Management

Generate Prisma client after schema changes:
```bash
npx prisma generate
```

Create a new migration:
```bash
npx prisma migrate dev --name description_of_changes
```

Reset database (warning: deletes all data):
```bash
npx prisma migrate reset
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

sabiguru

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
