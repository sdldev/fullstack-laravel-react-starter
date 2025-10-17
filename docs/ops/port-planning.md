# Private Port Planning

- Reserve a contiguous range, e.g., 10080–10150 for app sites.
- Example mapping on App VPS (10.10.0.20):
  - site-a → 10080
  - site-b → 10081
  - site-c → 10082
- Firewall rules:
  - Allow from NPMplus IP (10.10.0.10) to 10.10.0.20:10080–10150
  - Block all public ingress to App/DB/Storage nodes
- Health checks: each site serves `/healthz` over its private port.
