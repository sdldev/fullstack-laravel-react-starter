# Summary
Describe what this PR does in 1–3 sentences.

## Context & Rationale
- Why is this change needed? What problem does it solve?
- Link ADR(s) and external docs:
  - ADR: [docs/adr/0001-adopt-frankenphp-and-npmplus.md](../docs/adr/0001-adopt-frankenphp-and-npmplus.md)
  - Laravel Octane: https://laravel.com/docs/12.x/octane
  - FrankenPHP (Laravel): https://frankenphp.dev/docs/laravel/
  - NPMplus: https://github.com/ZoeyVid/NPMplus

## Scope
- [ ] App runtime: FrankenPHP worker-mode (no `php artisan octane:start`)
- [ ] Reverse proxy: NPMplus on single public IP
- [ ] Private network ports per site (this PR uses 10080)
- [ ] Storage: MinIO (S3-compatible) via private IP
- [ ] Database: MySQL on private IP

## Implementation Notes
- Key files added/modified:
  - docker/Dockerfile.frankenphp
  - docker/frankenphp/Caddyfile
  - docker/compose/production.example.yml
  - docs/adr/0001-adopt-frankenphp-and-npmplus.md
  - docs/ops/* (NPMplus rules, port planning, MinIO, MySQL)
  - .dockerignore
- Security: Only 80/443 on proxy; App/DB/Storage are private-only; secrets via env.

## Testing
- Build image
- Health endpoint `/healthz`
- Reverse proxy routing with NPMplus
- Uploads to MinIO
- Queue & Scheduler run

## Rollout Plan
- Deploy to App VPS on private port 10080
- Configure NPMplus host forwarding
- Monitor logs/metrics
- Rollback: revert to PHP-FPM/nginx if needed

## Checklist
- [ ] Code builds and passes tests
- [ ] Documentation updated (ADR + Ops)
- [ ] Secrets managed securely
- [ ] Backups verified
