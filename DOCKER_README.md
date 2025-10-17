# Docker Deployment

Quick start guide for deploying this Laravel application with Docker.

## 🚀 Quick Start

```bash
# 1. Copy environment template
cp .env.docker .env

# 2. Generate APP_KEY
docker run --rm dunglas/frankenphp:1-php8.3-alpine php -r "echo 'base64:'.base64_encode(random_bytes(32)).PHP_EOL;"

# 3. Edit .env and update:
#    - APP_KEY (from step 2)
#    - All passwords
#    - APP_URL

# 4. Deploy
bash scripts/docker-deploy.sh

# Or manually:
# For production (use pre-built images from GitHub)
docker compose -f docker-compose.infrastructure.yml up -d  # Infrastructure
docker compose up -d  # Application

# For development (build locally)
docker compose -f docker-compose.infrastructure.yml up -d  # Infrastructure
docker compose -f docker-compose.yml -f docker-compose.dev.yml build
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

## 📦 Services

### Application Services (`docker-compose.yml`)
| Service | Port | Description |
|---------|------|-------------|
| App (FrankenPHP) | 8000 | Laravel application |
| Redis | 6379 | Cache/Queue/Session |
| Queue Worker | - | Laravel queue processor |
| Scheduler | - | Laravel task scheduler |

### Infrastructure Services (`docker-compose.infrastructure.yml`)
| Service | Port | Description |
|---------|------|-------------|
| MySQL | 3306 | Database |
| MinIO | 9000/9001 | S3-compatible storage |
| NPMplus | 80/443/81 | Reverse proxy |

## 🔧 Deployment Options

### Production Deployment (Pre-built Images)

Uses images from GitHub Container Registry:

```bash
# Application only
docker compose up -d

# Infrastructure only
docker compose -f docker-compose.infrastructure.yml up -d

# Full stack
docker compose -f docker-compose.infrastructure.yml up -d
docker compose up -d
```

### Development Deployment (Local Build)

Builds images locally for development:

```bash
# Application only
docker compose -f docker-compose.yml -f docker-compose.dev.yml build
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Infrastructure only
docker compose -f docker-compose.infrastructure.yml up -d

# Full stack
docker compose -f docker-compose.infrastructure.yml up -d
docker compose -f docker-compose.yml -f docker-compose.dev.yml build
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

## 🔍 Monitoring

```bash
# Check application services
docker compose ps
docker compose logs -f app

# Check infrastructure services
docker compose -f docker-compose.infrastructure.yml ps
docker compose -f docker-compose.infrastructure.yml logs -f mysql

# Health check
curl http://localhost:8000/health
```

## 📚 Full Documentation

See [docs/operations/DOCKER_DEPLOYMENT.md](docs/operations/DOCKER_DEPLOYMENT.md) for:
- Architecture details
- Port planning
- Production setup
- Monitoring
- Backup procedures
- Troubleshooting

## 🏗️ Architecture Decision

See [docs/operations/ADR_DOCKER_FRANKENPHP.md](docs/operations/ADR_DOCKER_FRANKENPHP.md) for:
- Why FrankenPHP?
- Technology choices
- Performance benchmarks
- Trade-offs

## 🛠️ Useful Commands

```bash
# Start all services
docker compose -f docker-compose.infrastructure.yml up -d
docker compose up -d

# Stop services
docker compose down
docker compose -f docker-compose.infrastructure.yml down

# Restart app
docker compose restart app

# View specific service logs
docker compose logs -f queue
docker compose -f docker-compose.infrastructure.yml logs -f mysql

# Run artisan commands
docker compose exec app php artisan migrate

# Access shell
docker compose exec app bash

# Update with new images (production)
docker compose pull
docker compose up -d --force-recreate app queue scheduler

# Update with local build (development)
git pull
docker compose -f docker-compose.yml -f docker-compose.dev.yml build app queue scheduler
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --force-recreate app queue scheduler
```

## 🔐 Security Checklist

Before production:
- [ ] Strong passwords for all services
- [ ] APP_DEBUG=false
- [ ] SESSION_SECURE_COOKIE=true
- [ ] Firewall configured
- [ ] SSL certificates (via NPMplus)
- [ ] Regular backups scheduled

## 📞 Support

- Issues: [GitHub Issues](https://github.com/sdldev/fullstack-laravel-react-starter/issues)
- Security: indatechnologi@gmail.com
