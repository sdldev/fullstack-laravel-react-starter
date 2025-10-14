# Security Checklist - Quick Reference

## Pre-Production Deployment

### 🔴 CRITICAL (Must Fix)

- [ ] **Remove/Change Default Passwords**
  - [ ] Seeder passwords changed to strong random values
  - [ ] No hardcoded passwords in code
  - [ ] Admin default password set via environment variable

- [ ] **Filter Sensitive Data in Frontend**
  - [ ] User object in Inertia props only exposes safe fields
  - [ ] Password hash not exposed
  - [ ] Two-factor secret not exposed
  - [ ] Recovery codes not exposed
  - [ ] Remember token not exposed

### 🟠 HIGH Priority

- [ ] **File Upload Security**
  - [ ] MIME type validation implemented
  - [ ] File content validation (read/parse actual file)
  - [ ] Image re-encoding to strip malicious code
  - [ ] Secure filename generation (random, unpredictable)
  - [ ] File size limits enforced
  - [ ] Secure file deletion with path validation

- [ ] **HTTPS Configuration**
  - [ ] HTTPS enforced in production
  - [ ] `APP_URL` uses https:// in production
  - [ ] `SESSION_SECURE_COOKIE=true`
  - [ ] HSTS header enabled

- [ ] **Security Headers**
  - [ ] `X-Frame-Options: SAMEORIGIN`
  - [ ] `X-Content-Type-Options: nosniff`
  - [ ] `X-XSS-Protection: 1; mode=block`
  - [ ] `Strict-Transport-Security` (HSTS)
  - [ ] `Referrer-Policy`
  - [ ] Content Security Policy (CSP)

- [ ] **Authorization**
  - [ ] All admin routes protected with middleware
  - [ ] Gate/Policy checks implemented
  - [ ] Authorization tests written
  - [ ] No role-based vulnerabilities

- [ ] **Security Logging**
  - [ ] Failed login attempts logged
  - [ ] Account lockouts logged
  - [ ] Unauthorized access logged
  - [ ] Security log retention configured (90 days)

### 🟡 MEDIUM Priority

- [ ] **Session Security**
  - [ ] `SESSION_LIFETIME=30` (30 minutes)
  - [ ] `SESSION_EXPIRE_ON_CLOSE=true`
  - [ ] `SESSION_ENCRYPT=true`
  - [ ] `AUTH_PASSWORD_TIMEOUT=900` (15 minutes)

- [ ] **Rate Limiting**
  - [ ] Global rate limiting enabled (120/min per IP)
  - [ ] Login throttling: 5 attempts
  - [ ] Password reset throttling
  - [ ] 2FA throttling: 5 attempts/min
  - [ ] API rate limiting (if applicable)

- [ ] **Activity Logging**
  - [ ] Spatie Activity Log configured
  - [ ] User CRUD operations logged
  - [ ] Sensitive data access logged
  - [ ] Log retention policy defined

- [ ] **Data Exposure Prevention**
  - [ ] Pagination data filtered before sending to frontend
  - [ ] API responses don't include internal data
  - [ ] Error messages don't leak system info

### 🟢 LOW Priority

- [ ] **Additional Security Measures**
  - [ ] CSP properly configured
  - [ ] Cookie security flags set
  - [ ] CORS configured (if API exists)
  - [ ] Database backup automated
  - [ ] Monitoring and alerting setup

---

## Environment Configuration

### Production .env Settings

```env
# Application
APP_NAME=YourAppName
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.com

# Security
APP_KEY=base64:... # Strong key
BCRYPT_ROUNDS=12

# Session
SESSION_DRIVER=database
SESSION_LIFETIME=30
SESSION_EXPIRE_ON_CLOSE=true
SESSION_ENCRYPT=true
SESSION_SECURE_COOKIE=true
SESSION_SAME_SITE=lax

# Authentication
AUTH_PASSWORD_TIMEOUT=900

# Logging
LOG_CHANNEL=stack
LOG_LEVEL=error

# Cache & Queue
CACHE_STORE=redis  # or database
QUEUE_CONNECTION=database

# Database
DB_CONNECTION=mysql  # or postgresql
# ... secure credentials

# Mail
# ... configure with secure SMTP

# Optional: Security Headers
CSP_ENABLED=true
CSP_REPORT_ONLY=false
```

---

## Testing Checklist

### Automated Tests

```bash
# Run all tests
php artisan test

# Run security tests specifically
php artisan test --filter=SecurityTest

# Static analysis
./vendor/bin/phpstan analyse

# Code style
./vendor/bin/pint --test

# Dependency audit
composer audit
npm audit --audit-level=high
```

### Manual Security Testing

- [ ] **Authentication Tests**
  - [ ] Try login with wrong password (should rate limit after 5 attempts)
  - [ ] Check session expires after inactivity
  - [ ] Verify 2FA works correctly
  - [ ] Test password reset flow

- [ ] **Authorization Tests**
  - [ ] Try accessing `/admin/*` without login (should redirect)
  - [ ] Try accessing admin pages with user role (should 403)
  - [ ] Test that users can't modify other users' data
  - [ ] Verify admin can't delete themselves

- [ ] **Input Validation Tests**
  - [ ] Try XSS injection in forms: `<script>alert('XSS')</script>`
  - [ ] Try SQL injection: `' OR 1=1--`
  - [ ] Upload malicious files (PHP, executable)
  - [ ] Test file size limits
  - [ ] Try path traversal: `../../etc/passwd`

- [ ] **Data Exposure Tests**
  - [ ] Check browser console/network tab for sensitive data
  - [ ] Verify passwords not visible in responses
  - [ ] Check that error messages don't leak info

- [ ] **HTTPS & Headers Tests**
  - [ ] Visit site via HTTP (should redirect to HTTPS)
  - [ ] Check security headers in browser DevTools
  - [ ] Verify HSTS header present
  - [ ] Test CSP doesn't block legitimate resources

---

## Security Monitoring

### What to Monitor

- [ ] Failed login attempts (spike = possible attack)
- [ ] Account lockouts (repeated lockouts = targeted attack)
- [ ] Unusual file uploads (large files, suspicious types)
- [ ] Unauthorized access attempts (403 errors)
- [ ] Privilege escalation attempts
- [ ] Unusual user behavior (access patterns)
- [ ] Server resource usage (CPU, memory, disk)
- [ ] Database query performance (slow queries)

### Logging Locations

```
storage/logs/laravel.log          # General application logs
storage/logs/security.log         # Security events (if configured)
```

### Log Analysis Commands

```bash
# View recent security logs
tail -f storage/logs/security.log

# Count failed login attempts
grep "Failed login" storage/logs/security.log | wc -l

# List locked accounts
grep "Account locked" storage/logs/security.log

# Find suspicious IPs
grep "Unauthorized access" storage/logs/security.log | grep -oP '\d+\.\d+\.\d+\.\d+' | sort | uniq -c | sort -rn
```

---

## Incident Response Plan

### If Security Breach Detected

1. **Immediate Actions**
   - [ ] Take affected systems offline if necessary
   - [ ] Change all passwords and API keys
   - [ ] Revoke compromised access tokens
   - [ ] Enable additional logging
   - [ ] Document everything

2. **Investigation**
   - [ ] Review logs for breach timeline
   - [ ] Identify compromised accounts
   - [ ] Determine scope of data exposure
   - [ ] Find attack vector

3. **Remediation**
   - [ ] Patch vulnerabilities
   - [ ] Update all dependencies
   - [ ] Reset all user passwords (force)
   - [ ] Implement additional security measures

4. **Communication**
   - [ ] Notify affected users
   - [ ] Report to authorities if required
   - [ ] Update security documentation
   - [ ] Conduct post-mortem

---

## Regular Maintenance Schedule

### Daily
- [ ] Monitor security logs for anomalies
- [ ] Check application health
- [ ] Review error logs

### Weekly
- [ ] Review user access logs
- [ ] Check disk space and backups
- [ ] Run security scan

### Monthly
- [ ] Update dependencies (`composer update`, `npm update`)
- [ ] Run security audits
- [ ] Review and rotate API keys
- [ ] Test backup restoration
- [ ] Review user accounts (remove inactive)

### Quarterly
- [ ] Security assessment and penetration testing
- [ ] Update security documentation
- [ ] Review and update security policies
- [ ] Train team on new threats

---

## Resources

### Security Tools

- **Dependency Scanning**
  - Snyk: https://snyk.io/
  - Dependabot: https://github.com/dependabot

- **SAST (Static Analysis)**
  - PHPStan: https://phpstan.org/
  - Psalm: https://psalm.dev/

- **Monitoring**
  - Sentry: https://sentry.io/
  - Laravel Telescope: https://laravel.com/docs/telescope

- **Penetration Testing**
  - OWASP ZAP: https://www.zaproxy.org/
  - Burp Suite: https://portswigger.net/burp

### Learning Resources

- OWASP Top 10: https://owasp.org/www-project-top-ten/
- Laravel Security: https://laravel.com/docs/security
- Security Best Practices: https://github.com/Snipe/laravel-security-checklist

---

## Sign-off

Before deploying to production, ensure:

- [ ] All CRITICAL items addressed
- [ ] All HIGH items addressed
- [ ] Security tests passing
- [ ] Penetration testing completed
- [ ] Backup and recovery tested
- [ ] Monitoring and alerting configured
- [ ] Team trained on security procedures
- [ ] Incident response plan documented

**Deployed by**: _______________  
**Date**: _______________  
**Security Review by**: _______________  
**Approval**: _______________

---

**Last Updated**: October 14, 2025  
**Version**: 1.0

*Keep this checklist updated as new security measures are implemented or new threats are discovered.*
