# Technology Stack & Standards

## Architecture
Full-stack web application with separate frontend and backend services.

## Frontend Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **State Management**: Zustand or React Query
- **Validation**: Zod schemas
- **UI Components**: Headless UI + custom components
- **Authentication**: NextAuth.js
- **Fonts**: Inter (Google Fonts)

## Backend Stack
- **Language**: Go (Golang)
- **Framework**: Gin Web Framework
- **Database**: PostgreSQL 15+
- **ORM**: GORM
- **Authentication**: JWT tokens
- **API Documentation**: Swagger/OpenAPI
- **Testing**: Testify + Ginkgo

## Infrastructure
- **Containerization**: Docker + Docker Compose
- **Frontend Deploy**: Vercel
- **Backend Deploy**: Railway or DigitalOcean
- **Database**: Supabase or Railway PostgreSQL
- **Monitoring**: Sentry
- **CI/CD**: GitHub Actions

## Development Commands
```bash
# Frontend (Next.js)
npm run dev          # Start development server (port 3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking

# Backend (Go)
go run main.go       # Start development server (port 8080)
go build            # Build binary
go test ./...        # Run tests
go mod tidy          # Clean dependencies

# Docker
docker-compose up -d # Start all services
docker-compose down  # Stop all services
```

## Code Quality Standards
- TypeScript strict mode enabled
- ESLint + Prettier for code formatting
- Minimum 80% test coverage target
- API response time < 200ms
- All API endpoints documented with Swagger