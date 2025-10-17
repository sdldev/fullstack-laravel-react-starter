# Architecture Decision Record: Docker Deployment with FrankenPHP Worker Mode

**Status**: Accepted  
**Date**: October 17, 2025  
**Decision Makers**: Development Team, DevOps Team  
**Context**: Production deployment strategy for Laravel + React + Inertia application

---

## Summary

We have decided to use **Docker** with **FrankenPHP in worker mode** as our production deployment platform, along with supporting services (MySQL, Redis, MinIO, NPMplus).

---

## Context and Problem Statement

The application needs a production-ready deployment solution that:
- Provides excellent performance for Laravel applications
- Supports modern PHP features (PHP 8.3+)
- Enables easy scaling and management
- Includes all necessary infrastructure services
- Is cost-effective and maintainable
- Follows industry best practices

**Requirements**:
- High-performance PHP execution
- Static asset serving with compression
- HTTPS support with automatic certificate management
- Database, cache, and object storage
- Queue processing and task scheduling
- Easy deployment and rollback
- Monitoring and logging capabilities

---

## Decision Drivers

### Performance Requirements
- Sub-100ms response times for cached requests
- Support for 1000+ concurrent users
- Efficient memory utilization
- Fast cold start times

### Operational Requirements
- Simple deployment process
- Easy scaling (horizontal and vertical)
- Built-in health checks
- Centralized logging
- Automated backups

### Development Experience
- Consistent dev/prod environments
- Fast local development setup
- Easy debugging and troubleshooting
- Clear documentation

### Cost Considerations
- Minimize infrastructure costs
- Reduce operational overhead
- Open-source technologies preferred

---

## Considered Options

### Option 1: Traditional LAMP Stack (Apache/Nginx + PHP-FPM)
**Pros**:
- Well-established and proven
- Extensive documentation
- Widely understood
- Many deployment examples

**Cons**:
- Higher memory usage (separate web server + PHP-FPM)
- More complex configuration
- Slower request handling (CGI overhead)
- Requires separate queue workers
- Manual SSL certificate management

**Performance**: ~50-100 req/s per instance

---

### Option 2: Laravel Octane (Swoole/RoadRunner)
**Pros**:
- Native Laravel support
- Excellent performance (worker mode)
- Active community
- Good documentation

**Cons**:
- Requires Swoole extension or Go runtime
- Application state management complexity
- Memory leak risks
- Requires code modifications for full compatibility
- Less mature ecosystem

**Performance**: ~1000-2000 req/s per instance

---

### Option 3: FrankenPHP (Selected)
**Pros**:
- **Built on Caddy**: Automatic HTTPS, modern web server
- **Worker Mode**: Application stays in memory (like Octane)
- **Zero Configuration**: Works with existing Laravel apps
- **Early Hints**: HTTP/103 support for faster page loads
- **Native PHP**: No special extensions required
- **HTTP/2 & HTTP/3**: Modern protocol support
- **Automatic Compression**: zstd, gzip, brotli
- **Low Memory**: Single binary, efficient resource usage
- **Built-in Health Checks**: Native support

**Cons**:
- Relatively new (less than 2 years old)
- Smaller community compared to Nginx/Apache
- Limited third-party modules
- Documentation still growing

**Performance**: ~1500-3000 req/s per instance (worker mode)

---

## Decision: FrankenPHP with Docker

### Why FrankenPHP?

**1. Performance Without Complexity**
- Worker mode provides Octane-like performance
- No code changes required (unlike Octane)
- Efficient memory usage (~100MB per worker)
- OPcache and JIT compilation enabled

**2. Modern Web Server (Caddy)**
- Automatic HTTPS with Let's Encrypt
- HTTP/2 and HTTP/3 support
- Built-in compression (zstd, gzip)
- Simple configuration (Caddyfile)
- Security headers by default

**3. Developer Experience**
- Drop-in replacement for PHP-FPM
- Standard Laravel development workflow
- No application code changes needed
- Easy local development with Docker

**4. Operational Simplicity**
- Single binary (no separate web server)
- Built-in health checks
- Graceful shutdowns
- Zero-downtime deployments possible
- Clear error messages and logging

**5. Cost Effectiveness**
- Lower memory footprint vs PHP-FPM + Nginx
- Handle more requests per instance
- Fewer instances needed
- Open-source (MIT license)

---

## Technology Stack Details

### Application Layer
```yaml
FrankenPHP 1.x (PHP 8.3)
├── Caddy Web Server
│   ├── HTTP/2 & HTTP/3
│   ├── Automatic HTTPS
│   └── Compression (zstd, gzip)
├── PHP Worker Mode
│   ├── 4 workers (configurable)
│   ├── OPcache enabled
│   └── JIT compilation
└── Laravel 12
    ├── Inertia.js SSR
    ├── React 19 frontend
    └── Queue workers
```

### Infrastructure Layer
```yaml
Docker Compose
├── MySQL 8.0 (Primary Database)
├── Redis 7 (Cache/Session/Queue)
├── MinIO (S3-compatible Storage)
└── NPMplus (Reverse Proxy/SSL)
```

---

## Architecture Benefits

### Performance Optimization

**Worker Mode Benefits**:
- Application bootstrap happens once per worker
- Database connections persist across requests
- Configuration cached in memory
- Route resolution cached
- ~10x faster than PHP-FPM for dynamic content

**Static Asset Optimization**:
- Caddy serves static files directly
- Aggressive caching headers
- zstd compression (better than gzip)
- HTTP/2 push for critical resources

### Scalability

**Horizontal Scaling**:
```bash
# Scale to 3 app instances
docker compose up -d --scale app=3

# Load balanced via NPMplus
# Session shared via Redis
# Database handles via connection pooling
```

**Vertical Scaling**:
```bash
# Increase workers per instance
FRANKENPHP_WORKERS=8

# More memory = more workers
# 4 workers ~= 400MB RAM
# 8 workers ~= 800MB RAM
```

### Reliability

**Health Checks**:
- HTTP `/health` endpoint
- Docker health checks (30s interval)
- Automatic container restart on failure
- NPMplus monitors backend health

**Data Persistence**:
- MySQL data in Docker volume
- Redis AOF persistence
- MinIO data in volume
- Logs in persistent volume

### Security

**Application Security**:
- Security headers by default (Caddy)
- HTTPS enforced in production
- Session encryption enabled
- CSRF protection (Laravel)
- XSS protection headers

**Infrastructure Security**:
- Network isolation (Docker networks)
- No direct database access
- Redis password authentication
- MinIO access control
- NPMplus firewall rules

---

## Deployment Architecture

### Production Setup

```
Internet
    │
    ▼
[Firewall]
    │
    ├─► Port 80/443 → NPMplus (SSL Termination)
    │                     │
    │                     ├─► app:80 (FrankenPHP)
    │                     │   ├─► MySQL
    │                     │   ├─► Redis
    │                     │   └─► MinIO
    │                     │
    │                     └─► app:80 (Load Balanced)
    │
    ├─► Port 81 → NPMplus Admin (Restricted)
    └─► Port 9001 → MinIO Console (Restricted)

Internal Network:
- MySQL: app-network only
- Redis: app-network only
- MinIO: app-network + external (optional)
```

### Resource Allocation

**Minimum Resources** (single instance):
- CPU: 2 cores
- RAM: 2GB
  - App: 800MB (4 workers)
  - MySQL: 512MB
  - Redis: 256MB
  - MinIO: 256MB
  - NPMplus: 256MB

**Recommended Resources** (production):
- CPU: 4 cores
- RAM: 4GB
- Disk: 20GB SSD
- Network: 100Mbps+

**Scaling Guidelines**:
- 1-100 users: 1 app instance, 2 CPU, 2GB RAM
- 100-500 users: 2 app instances, 4 CPU, 4GB RAM
- 500-1000 users: 3 app instances, 8 CPU, 8GB RAM
- 1000+ users: 4+ instances, load balancer, database replication

---

## Risks and Mitigation

### Risk 1: FrankenPHP Maturity
**Risk**: FrankenPHP is relatively new (2023)  
**Probability**: Medium  
**Impact**: High  
**Mitigation**:
- Active development and community support
- Backed by Symfony and Laravel communities
- Can fall back to PHP-FPM if needed (Dockerfile modification)
- Regular testing and monitoring
- Keep up with updates

### Risk 2: Memory Leaks in Worker Mode
**Risk**: Long-running workers may accumulate memory  
**Probability**: Low  
**Impact**: Medium  
**Mitigation**:
- Docker memory limits configured
- Regular health checks and restarts
- Monitor memory usage with `docker stats`
- Worker recycling after X requests (planned feature)
- Graceful shutdown on high memory

### Risk 3: Database Connection Pooling
**Risk**: Workers hold database connections  
**Probability**: Low  
**Impact**: Low  
**Mitigation**:
- MySQL max_connections increased (200)
- Connection pooling in Laravel
- Monitor active connections
- Restart workers if connection issues

### Risk 4: Cache Invalidation
**Risk**: OPcache may serve stale code after deployment  
**Probability**: Medium  
**Impact**: Low  
**Mitigation**:
- `opcache.validate_timestamps=0` in production
- Docker image rebuild clears cache
- Container restart required for code changes
- Zero-downtime deployment strategy

### Risk 5: Vendor Lock-in
**Risk**: Dependency on FrankenPHP-specific features  
**Probability**: Low  
**Impact**: Low  
**Mitigation**:
- No application code changes required
- Standard Laravel application
- Can switch to PHP-FPM with Dockerfile change
- Caddyfile can be converted to Nginx config

---

## Alternatives and Trade-offs

### Why Not Laravel Forge/Vapor?
**Pros of Forge/Vapor**:
- Official Laravel deployment
- Managed infrastructure
- Built-in monitoring
- Easy scaling

**Cons**:
- Monthly subscription costs ($15-300/month)
- Less control over infrastructure
- Vendor lock-in
- May require code modifications (Vapor)

**Decision**: Self-hosted provides more control and lower cost for our use case.

### Why Not Kubernetes?
**Pros of K8s**:
- Enterprise-grade orchestration
- Advanced scaling
- Service mesh
- Multi-cloud support

**Cons**:
- High complexity
- Significant learning curve
- Overkill for small-medium applications
- Higher operational overhead
- More expensive infrastructure

**Decision**: Docker Compose is sufficient for our scale (< 10,000 users).

### Why Not Traditional VPS Setup?
**Pros of VPS**:
- Simple setup
- Direct control
- Lower overhead

**Cons**:
- Manual dependency management
- Difficult to scale
- No containerization benefits
- Harder to replicate environments
- Manual SSL management

**Decision**: Docker provides better portability and consistency.

---

## Success Metrics

### Performance Metrics
- [ ] Response time: < 100ms (cached)
- [ ] Response time: < 500ms (dynamic)
- [ ] Throughput: > 1000 req/s per instance
- [ ] Memory usage: < 1GB per app instance
- [ ] CPU usage: < 70% average

### Reliability Metrics
- [ ] Uptime: > 99.9%
- [ ] Failed deployments: < 1%
- [ ] Recovery time: < 5 minutes
- [ ] Zero data loss during updates

### Operational Metrics
- [ ] Deployment time: < 5 minutes
- [ ] Rollback time: < 2 minutes
- [ ] Scale-up time: < 1 minute
- [ ] Mean time to recovery: < 10 minutes

---

## Implementation Timeline

### Phase 1: Setup (Completed)
- [x] Dockerfile creation
- [x] Caddyfile configuration
- [x] docker-compose.yml setup
- [x] Documentation

### Phase 2: Testing (1-2 weeks)
- [ ] Load testing (1000+ concurrent users)
- [ ] Memory leak testing (24h+ runs)
- [ ] Failover testing
- [ ] Backup and restore testing

### Phase 3: Production Deployment (1 week)
- [ ] Staging environment setup
- [ ] Production environment setup
- [ ] DNS and SSL configuration
- [ ] Monitoring setup

### Phase 4: Optimization (Ongoing)
- [ ] Performance tuning
- [ ] Cost optimization
- [ ] Monitoring refinement
- [ ] Documentation updates

---

## Related Decisions

### Complementary Technologies

**MinIO over S3**:
- Self-hosted, no AWS costs
- S3-compatible API
- Easy migration path to AWS later
- Full control over data

**NPMplus over Traefik**:
- User-friendly web interface
- Easier certificate management
- Better for small teams
- Can switch to Traefik later if needed

**MySQL over PostgreSQL**:
- Laravel default database
- Better Laravel ecosystem support
- Simpler replication setup
- Team familiarity

**Redis over Memcached**:
- Persistent cache option
- Queue backend support
- Session storage support
- More versatile

---

## References

### Documentation
- [FrankenPHP Official Docs](https://frankenphp.dev/)
- [Caddy Documentation](https://caddyserver.com/docs/)
- [Docker Compose Docs](https://docs.docker.com/compose/)
- [Laravel Deployment Docs](https://laravel.com/docs/deployment)

### Benchmarks
- [FrankenPHP vs PHP-FPM Benchmark](https://frankenphp.dev/docs/benchmark/)
- [Laravel Octane Benchmarks](https://github.com/laravel/octane#benchmarks)

### Community Resources
- [FrankenPHP GitHub](https://github.com/dunglas/frankenphp)
- [Laravel Docker Best Practices](https://laravel-news.com/laravel-docker)

---

## Review and Updates

**Review Schedule**: Quarterly  
**Next Review**: January 2026  
**Review Criteria**:
- Performance metrics achievement
- Operational issues encountered
- Community adoption trends
- Alternative technologies emergence

**Update Process**:
1. Performance review
2. Cost analysis
3. Community feedback
4. Alternative evaluation
5. Decision confirmation or revision

---

## Approval

**Approved By**: Development Team, DevOps Team  
**Date**: October 17, 2025  
**Valid Until**: Superseded by new ADR or major technology change

---

## Appendix

### Configuration Files

All configuration files are located in:
- `Dockerfile` - Application image
- `docker-compose.yml` - Service orchestration
- `docker/Caddyfile` - Web server config
- `docker/php.ini` - PHP settings
- `docker/entrypoint.sh` - Startup script
- `.env.docker` - Environment template

### Support Contacts

- **Technical Issues**: GitHub Issues
- **Security Issues**: indatechnologi@gmail.com
- **Documentation**: docs/operations/

### Version History

- **v1.0.0** (2025-10-17): Initial ADR with FrankenPHP decision
