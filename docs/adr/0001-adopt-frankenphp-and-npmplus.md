# ADR 0001: Adopt FrankenPHP + NPMplus (single public IP, MySQL DB, MinIO storage)

Status: Accepted  
Date: 2025-10-17  
Author: @sdldev

## Context
We host 10–100 Laravel websites (≈30 initially) with this topology:
- 1 VPS public reverse proxy running NPMplus (only 80/443 exposed)
- 1 VPS App (private) for multi-website containers
- 1 VPS Database (private) — MySQL
- 1 VPS Storage (private) — MinIO (S3-compatible)
- Docker managed with Portainer; per-site private port forwarding from NPMplus

Alternatives considered: PHP-FPM, Laravel Octane (Swoole/RoadRunner), Traefik, control panels.

References:
- Laravel Octane: https://laravel.com/docs/12.x/octane
- FrankenPHP (Laravel): https://frankenphp.dev/docs/laravel/
- NPMplus: https://github.com/ZoeyVid/NPMplus

## Decision
- Use Docker for isolation and reproducibility.
- Use NPMplus as the single public reverse proxy and SSL manager.
- Use FrankenPHP worker-mode as runtime (do NOT run `php artisan octane:start`).
- Expose each site on a unique private port (first site on 10080). NPMplus forwards domain → 10.10.0.20:10080.
- Use MySQL on a private VPS. One DB+user per site.
- Use MinIO on a private VPS as S3-compatible storage, optionally fronted by a CDN.

## Consequences
Pros:
- Faster TTFB and throughput (no full bootstrap per request).
- Simple GUI for routing/SSL with NPMplus.
- Clean separation (App vs DB vs Storage) and easier scaling.

Trade-offs:
- Ensure code is stateless per request; avoid leaking state across workers.
- Manage private port planning and firewall rules.
- Configure proxy timeouts for SSE/WebSockets as needed.

## Implementation Sketch
- Add Dockerfile.frankenphp and Caddyfile under docker/.
- Add docker/compose/production.example.yml exposing 10.10.0.20:10080.
- Configure Laravel for MySQL and S3 (MinIO) via .env.
- NPMplus host: Forward 10.10.0.20:10080, Enable WebSockets; Advanced:
  - `proxy_read_timeout 3600;`
  - `proxy_send_timeout 3600;`
  - `proxy_buffering off;`

## Security
- Only 80/443 open on proxy; all other services private-only.
- Secrets via environment variables or secret manager.
- Regular DB and object storage backups; periodically test restores.

## Rollout
- Pilot with one site (port 10080).
- Validate health, logs, and performance; then migrate other sites.
- Rollback path: fall back to PHP-FPM/nginx if needed.
