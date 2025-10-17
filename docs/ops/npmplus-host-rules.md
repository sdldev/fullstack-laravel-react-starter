# NPMplus Host Rules (Forwarding to private app port 10080)

1) DNS: Point your domain/subdomain to the public IP of the NPMplus VPS.
2) In NPMplus → Proxy Hosts → Add Proxy Host:
   - Domain Names: `site-a.example.com`
   - Scheme: `http`
   - Forward Hostname/IP: `10.10.0.20`
   - Forward Port: `10080`
   - Block Common Exploits: Enabled
   - Websockets Support: Enabled (if your app uses WS/SSE)
3) SSL tab:
   - Request a new certificate (Let’s Encrypt)
   - Force SSL Redirect: Enabled
   - HTTP/2 Support: Enabled
   - HSTS: Optional
   - If using Cloudflare proxied, consider DNS-01 or Origin Cert instead of HTTP-01.
4) Advanced (optional; for long-lived connections):
```
proxy_read_timeout 3600;
proxy_send_timeout 3600;
proxy_buffering off;
```
5) Save and test `https://site-a.example.com/healthz` → should return `ok`.
