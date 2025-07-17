# Project Structure & Organization

## Repository Layout
```
/
├── .claude/                 # Project documentation and specs
│   ├── design/             # Design system and user flows
│   ├── templates/          # Code standards and workflows
│   └── *.md               # Requirements, schemas, roadmap
├── .kiro/                  # Kiro AI assistant configuration
│   └── steering/          # AI guidance rules
├── docs/                   # Additional documentation
│   └── wireframes/        # UI wireframes and mockups
├── frontend/              # Next.js application (when created)
├── backend/               # Go API server (when created)
├── docker-compose.yml     # Development environment setup
└── README.md             # Project overview
```

## Frontend Structure (Next.js)
```
frontend/
├── src/
│   ├── app/               # App Router pages
│   │   ├── (auth)/       # Authentication routes
│   │   ├── dashboard/    # Main application
│   │   └── layout.tsx    # Root layout
│   ├── components/        # Reusable UI components
│   │   ├── ui/           # Base UI components
│   │   ├── forms/        # Form components
│   │   └── layout/       # Layout components
│   ├── lib/              # Utilities and configurations
│   │   ├── auth.ts       # NextAuth configuration
│   │   ├── api.ts        # API client
│   │   └── utils.ts      # Helper functions
│   ├── types/            # TypeScript type definitions
│   └── styles/           # Global styles
├── public/               # Static assets
└── package.json          # Dependencies and scripts
```

## Backend Structure (Go)
```
backend/
├── cmd/
│   └── server/           # Application entry point
├── internal/
│   ├── handlers/         # HTTP request handlers
│   ├── models/           # Database models (GORM)
│   ├── services/         # Business logic
│   ├── middleware/       # HTTP middleware
│   └── config/           # Configuration management
├── pkg/                  # Shared packages
├── migrations/           # Database migrations
├── docs/                 # API documentation
├── go.mod               # Go module definition
└── main.go              # Application entry point
```

## Database Schema Organization
- **Users**: Employee data and roles
- **VacationRequests**: Request lifecycle management
- **Notifications**: System notifications
- **Departments**: Organizational structure
- **Holidays**: Company and national holidays

## File Naming Conventions
- **Frontend**: kebab-case for files, PascalCase for components
- **Backend**: snake_case for files, camelCase for Go code
- **Database**: snake_case for tables and columns
- **API Routes**: RESTful naming with plural nouns

## Key Directories
- `.claude/` - Project documentation and AI context
- `.kiro/steering/` - AI assistant guidance rules
- `docs/wireframes/` - UI mockups and design references