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
docker compose build
docker compose up -d
```

## 📦 Services

| Service | Port | Description |
|---------|------|-------------|
| App (FrankenPHP) | 8000 | Laravel application |
| MySQL | 3306 | Database |
| Redis | 6379 | Cache/Queue/Session |
| MinIO | 9000/9001 | S3-compatible storage |
| NPMplus | 80/443/81 | Reverse proxy |

## 🔍 Monitoring

```bash
# Check status
docker compose ps

# View logs
docker compose logs -f app

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
# Start services
docker compose up -d

# Stop services
docker compose down

# Restart app
docker compose restart app

# View specific service logs
docker compose logs -f mysql

# Run artisan commands
docker compose exec app php artisan migrate

# Access shell
docker compose exec app bash

# Update and rebuild
git pull
docker compose build app
docker compose up -d --force-recreate app
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
