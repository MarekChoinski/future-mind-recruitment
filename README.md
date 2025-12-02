# Image Gallery API

REST API for image gallery with upload, processing, and management capabilities built with NestJS, TypeScript, Prisma, and PostgreSQL.

## Features

- ✅ Image upload with validation (jpeg, png, webp, gif, max 5MB)
- ✅ Automatic image processing and optimization (Sharp)
- ✅ Image resizing and cropping
- ✅ Pagination and filtering
- ✅ PostgreSQL database with Prisma ORM
- ✅ OpenAPI/Swagger documentation
- ✅ Docker support
- ✅ Unit and E2E tests

## Prerequisites

- Node.js 18+
- npm 9+
- PostgreSQL 16 (or use Docker)
- Docker & Docker Compose (optional)

## Setup

### 1. Clone and Install

```bash
cd future-mind-recruitment
npm install
```

### 2. Environment Variables

Copy the example env file:

```bash
cp env.example .env
```

Edit `.env` and configure:

```bash
# Application
NODE_ENV=development
API_PORT=3000
APP_URL=http://localhost:3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=image_gallery
DB_USER=postgres
DB_PASS=postgres
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/image_gallery
```

### 3. Database Setup

**Option A: Local PostgreSQL**

Make sure PostgreSQL is running locally, then run migrations:

```bash
npm run prisma:generate
npm run prisma:migrate
```

**Option B: Docker PostgreSQL**

```bash
docker-compose up -d db
npm run prisma:generate
npm run prisma:migrate
```

### 4. Start the Application

**Development mode:**

```bash
npm run start:dev
```

**Production mode:**

```bash
npm run build
npm run start:prod
```

API will be available at: `http://localhost:3000`

## Docker Setup

### Quick Start with Docker

```bash
# 1. Copy environment file
cp env.example .env

# 2. Start all services (API + PostgreSQL)
docker-compose up -d

# 3. Check logs
docker-compose logs -f api

# 4. Stop services
docker-compose down
```

### Run Migrations in Docker

```bash
docker-compose exec api npx prisma migrate deploy
```

## API Documentation

Swagger UI is available at: **http://localhost:3000/api/docs**

## API Endpoints

### Health Check

```bash
curl http://localhost:3000/health
```

**Response:**
```json
{
  "status": "ok"
}
```

### Upload Image

```bash
curl -X POST http://localhost:3000/images \
  -F "file=@/path/to/image.jpg" \
  -F "title=Beautiful Landscape" \
  -F "width=1920" \
  -F "height=1080"
```

**Response:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "Beautiful Landscape",
  "url": "http://localhost:3000/static/abc123.jpg",
  "width": 1920,
  "height": 1080
}
```

### Get All Images (with pagination)

```bash
curl "http://localhost:3000/images?page=1&limit=10"
```

**Response:**
```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "title": "Beautiful Landscape",
      "url": "http://localhost:3000/static/abc123.jpg",
      "width": 1920,
      "height": 1080
    }
  ],
  "meta": {
    "count": 42,
    "page": 1,
    "limit": 10,
    "pages": 5
  }
}
```

### Filter Images by Title

```bash
curl "http://localhost:3000/images?title=landscape"
```

### Get Single Image

```bash
curl http://localhost:3000/images/123e4567-e89b-12d3-a456-426614174000
```

**Response:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "Beautiful Landscape",
  "url": "http://localhost:3000/static/abc123.jpg",
  "width": 1920,
  "height": 1080
}
```

## Available Scripts

### Development

```bash
npm run start          # Start application
npm run start:dev      # Start with hot-reload
npm run start:debug    # Start in debug mode
npm run build          # Build for production
npm run start:prod     # Run production build
```

### Database

```bash
npm run prisma:generate        # Generate Prisma Client
npm run prisma:migrate         # Run migrations (dev)
npm run prisma:migrate:deploy  # Run migrations (production)
npm run prisma:studio          # Open Prisma Studio
```

### Testing

```bash
npm run test           # Unit tests
npm run test:watch     # Unit tests in watch mode
npm run test:cov       # Unit tests with coverage
npm run test:e2e       # E2E tests
```

### Code Quality

```bash
npm run lint           # Run ESLint
npm run format         # Format code with Prettier
```

### Docker

```bash
docker-compose up -d              # Start all services
docker-compose down               # Stop all services
docker-compose down -v            # Stop and remove volumes
docker-compose logs -f api        # View API logs
docker-compose logs -f db         # View database logs
docker-compose restart api        # Restart API
docker-compose exec api sh        # Shell into API container
```

## Project Structure

```
.
├── src/
│   ├── app.module.ts              # Main application module
│   ├── main.ts                    # Application entry point
│   ├── config/
│   │   ├── env.validation.ts      # Environment validation
│   │   ├── database.config.ts     # Database configuration
│   │   └── multer.config.ts       # File upload configuration
│   ├── prisma/
│   │   ├── prisma.module.ts       # Prisma module
│   │   └── prisma.service.ts      # Prisma service
│   ├── images/
│   │   ├── images.module.ts       # Images module
│   │   ├── images.controller.ts   # Images controller
│   │   ├── images.service.ts      # Images service
│   │   ├── dto/                   # Data Transfer Objects
│   │   ├── mappers/               # Entity to DTO mappers
│   │   └── services/
│   │       └── image-processing.service.ts  # Sharp image processing
│   └── common/
│       ├── filters/               # Exception filters
│       └── pipes/                 # Validation pipes
├── test/
│   ├── images.e2e-spec.ts        # E2E tests
│   └── fixtures/                 # Test fixtures
├── prisma/
│   └── schema.prisma             # Prisma schema
├── uploads/
│   ├── tmp/                      # Temporary uploads
│   └── processed/                # Processed images
├── docker-compose.yml            # Docker Compose config
├── Dockerfile                    # Production Dockerfile
└── package.json                  # Project dependencies
```

## Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment (development, production, test) | `development` | Yes |
| `API_PORT` | API port | `3000` | Yes |
| `APP_URL` | Full application URL | `http://localhost:3000` | Yes |
| `DB_HOST` | Database host | `localhost` | Yes |
| `DB_PORT` | Database port | `5432` | Yes |
| `DB_NAME` | Database name | `image_gallery` | Yes |
| `DB_USER` | Database user | `postgres` | Yes |
| `DB_PASS` | Database password | `postgres` | Yes |
| `DATABASE_URL` | Full database connection string | - | Yes |

## Image Upload Requirements

- **Formats**: JPEG, PNG, WebP, GIF
- **Max Size**: 5MB
- **Processing**: Automatic resize and optimization
- **Storage**: Local filesystem (`uploads/processed/`)

## Troubleshooting

### Port already in use

```bash
# Change port in .env
API_PORT=3001
```

### Database connection error

```bash
# Check PostgreSQL is running
docker-compose ps

# Restart database
docker-compose restart db

# Check logs
docker-compose logs db
```

### Prisma Client not generated

```bash
npm run prisma:generate
```

### Permission errors with uploads folder

```bash
mkdir -p uploads/tmp uploads/processed
chmod 755 uploads
```

### Docker build fails

```bash
# Clean rebuild
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

## Testing

### Run All Tests

```bash
npm test
```

### Run Specific Test Suite

```bash
npm test -- images.service.spec.ts
npm run test:e2e -- images.e2e-spec.ts
```

### Test Coverage

```bash
npm run test:cov
```

Coverage report will be in `coverage/` directory.

## Tech Stack

- **Framework**: NestJS 11.0 (LTS)
- **Language**: TypeScript 5.7
- **Database**: PostgreSQL 16
- **ORM**: Prisma 5.22
- **Image Processing**: Sharp
- **Testing**: Jest
- **API Docs**: Swagger/OpenAPI
- **File Upload**: Multer
- **Validation**: class-validator, class-transformer

## License

UNLICENSED
