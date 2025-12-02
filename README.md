# Image Gallery API

REST API for image gallery with upload, processing, and management capabilities.

## Features

- Image upload with validation (JPEG, PNG, WebP, GIF, max 5MB)
- Automatic image processing and optimization using Sharp
- Image resizing and format conversion to WebP
- Pagination and filtering
- PostgreSQL database with Prisma ORM
- OpenAPI/Swagger documentation
- Docker support

## Tech Stack

- NestJS 11.0 (LTS)
- TypeScript 5.7
- PostgreSQL 16
- Prisma 5.22
- Sharp (image processing)
- Jest (testing)

## Quick Start

### Using Docker (recommended)

```bash
# Copy environment file
cp env.example .env

# Start services
docker-compose up -d

# Run migrations (first time only)
docker-compose exec api npx prisma migrate dev --name init

# Check status
curl http://localhost:3000/health
```

API available at: http://localhost:3000  
Swagger UI: http://localhost:3000/api/docs

### Local Development

```bash
# Install dependencies
npm install

# Setup environment
cp env.example .env

# Start PostgreSQL (or use Docker: docker-compose up -d db)

# Generate Prisma Client and run migrations
npm run prisma:generate
npm run prisma:migrate

# Start development server
npm run start:dev
```

## Environment Variables

Copy `env.example` to `.env` and configure:

```env
NODE_ENV=development
API_PORT=3000
APP_URL=http://localhost:3000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=image_gallery
DB_USER=postgres
DB_PASS=postgres
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/image_gallery
```

## API Endpoints

### Health Check
```bash
curl http://localhost:3000/health
```

### Upload Image
```bash
curl -X POST http://localhost:3000/images \
  -F "file=@image.jpg" \
  -F "title=My Image" \
  -F "width=800" \
  -F "height=600"
```

Response:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "My Image",
  "url": "http://localhost:3000/static/550e8400-e29b-41d4-a716-446655440000.jpg",
  "width": 800,
  "height": 600
}
```

### List Images
```bash
# All images
curl http://localhost:3000/images

# With pagination
curl "http://localhost:3000/images?page=1&limit=10"

# Filter by title
curl "http://localhost:3000/images?title=landscape"
```

### Get Single Image
```bash
curl http://localhost:3000/images/{id}
```

## Testing

### Run Tests
```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# With coverage
npm run test:cov

# Linting
npm run lint
```

### Manual Testing

Quick test script included:
```bash
./test-api.sh
```

Or test manually:
```bash
# Upload test image
curl -X POST http://localhost:3000/images \
  -F "file=@/tmp/test.jpg" \
  -F "title=Test" \
  -F "width=800" \
  -F "height=600"

# List images
curl http://localhost:3000/images | jq '.'

# Check processed file
curl -I http://localhost:3000/static/filename.jpg
```

## Project Structure

```
src/
├── config/               # Configuration
├── prisma/              # Database service
├── images/              # Images module
│   ├── dto/            # Data Transfer Objects
│   ├── services/       # Image processing
│   └── mappers/        # Entity mappers
├── common/             # Shared utilities
└── health/             # Health check
```

## Available Scripts

```bash
npm run start:dev          # Development mode
npm run build              # Build for production
npm run start:prod         # Production mode
npm run prisma:generate    # Generate Prisma Client
npm run prisma:migrate     # Run migrations
npm run prisma:studio      # Prisma Studio GUI
npm test                   # Run tests
npm run lint               # Run linter
```

## Docker Commands

```bash
docker-compose up -d              # Start all services
docker-compose down               # Stop services
docker-compose logs -f api        # View API logs
docker-compose restart api        # Restart API
docker-compose exec api sh        # Shell into container
```

## Troubleshooting

**Port already in use**
```bash
# Change port in .env
API_PORT=3001
```

**Database connection error**
```bash
docker-compose restart db
docker-compose logs db
```

**Prisma Client not generated**
```bash
npm run prisma:generate
```

**Docker build issues**
```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```
