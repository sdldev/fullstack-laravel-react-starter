# Docker Deployment Guide

**Last Updated**: October 17, 2025  
**Version**: 1.0.0  
**Audience**: DevOps Engineers, System Administrators

This guide covers deployment of the Laravel + React + Inertia application using Docker with FrankenPHP worker mode.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Port Planning](#port-planning)
3. [Service Configuration](#service-configuration)
4. [Deployment Steps](#deployment-steps)
5. [Monitoring & Maintenance](#monitoring--maintenance)
6. [Backup & Recovery](#backup--recovery)
7. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

### Technology Stack

**Application Server**:
- **FrankenPHP**: Modern PHP application server built on Caddy
- **Worker Mode**: Keeps application in memory for maximum performance
- **Caddy**: Built-in web server with automatic HTTPS

**Services**:
- **MySQL 8.0**: Relational database
- **Redis 7**: Cache, session, and queue backend
- **MinIO**: S3-compatible object storage
- **NPMplus**: Nginx Proxy Manager for reverse proxy and SSL termination

**Runtime**:
- **PHP 8.3**: With OPcache, JIT compilation
- **Node.js 22**: For frontend asset building

---

## Port Planning

### External Ports (Host → Container)

| Service         | Host Port | Container Port | Protocol | Purpose                    |
|-----------------|-----------|----------------|----------|----------------------------|
| NPMplus Admin   | 81        | 81             | HTTP     | Proxy Manager Admin UI     |
| NPMplus HTTP    | 80        | 80             | HTTP     | Public HTTP traffic        |
| NPMplus HTTPS   | 443       | 443            | HTTPS    | Public HTTPS traffic       |
| Laravel App     | 8000      | 80             | HTTP     | Direct app access (dev)    |
| MySQL           | 3306      | 3306           | TCP      | Database access            |
| Redis           | 6379      | 6379           | TCP      | Cache/Session access       |
| MinIO API       | 9000      | 9000           | HTTP     | S3 API endpoint            |
| MinIO Console   | 9001      | 9001           | HTTP     | MinIO admin interface      |

---

## Deployment Steps

### Prerequisites

- Docker Engine 24.0+
- Docker Compose 2.20+
- 2GB+ free RAM
- 10GB+ free disk space

### Step 1: Configure Environment

```bash
# Copy Docker environment template
cp .env.docker .env

# Generate APP_KEY
docker run --rm dunglas/frankenphp:1-php8.3-alpine php -r "echo 'base64:'.base64_encode(random_bytes(32)).PHP_EOL;"
```

### Step 2: Build and Start Services

```bash
# Build the application image
docker compose build app

# Start all services
docker compose up -d

# Watch logs
docker compose logs -f
```

### Step 3: Verify Health

```bash
# Check health endpoint
curl http://localhost:8000/health

# Check all services
docker compose ps
```

---

## Monitoring

```bash
# View logs
docker compose logs -f app

# Check resources
docker stats

# Application logs
docker compose exec app tail -f /app/storage/logs/laravel.log
```

---

## Backup

```bash
# Backup MySQL
docker compose exec mysql mysqldump -u root -p${MYSQL_ROOT_PASSWORD} \
  --single-transaction --databases laravel > backup.sql

# Backup MinIO
mc mirror myminio/laravel /backups/minio/
```

---

## Troubleshooting

### App Not Starting

```bash
# Check logs
docker compose logs app

# Verify environment
docker compose exec app php artisan config:show
```

### Database Connection Failed

```bash
# Test connection
docker compose exec app php artisan tinker
>>> DB::connection()->getPdo();
```

---

For detailed documentation, see the full deployment guide.
