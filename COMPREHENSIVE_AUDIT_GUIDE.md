# Comprehensive Security Audit Guide

## Overview

This repository includes a comprehensive security audit workflow that performs automated security checks, vulnerability scanning, code quality analysis, and security testing. The audit can be triggered manually when needed for security reviews, compliance checks, or before production deployments.

## Audit Components

### 1. Vulnerability Scanning 🔍

**Purpose**: Detect known security vulnerabilities (CVEs) in PHP and JavaScript dependencies.

**Tools**:
- `composer audit` - Scans PHP packages against the PHP Security Advisories Database
- `npm audit` - Scans JavaScript packages against the npm Security Advisories

**Outputs**:
- `composer-audit.json` - Detailed PHP vulnerability report
- `npm-audit.json` - Detailed JavaScript vulnerability report
- Both files available as downloadable artifacts (30-day retention)

### 2. Static Code Analysis 🔬

**Purpose**: Identify potential bugs, type errors, and code quality issues without running the code.

**Tools**:
- **PHPStan** (Level 5) - Static analysis for PHP
  - Type checking
  - Dead code detection
  - Method signature validation
  - Configuration: `phpstan.neon`

**Benefits**:
- Catches errors before runtime
- Ensures type safety
- Improves code maintainability

### 3. Code Quality Checks ✨

**Purpose**: Ensure code follows best practices and consistent styling.

**Tools**:

#### PHP
- **Laravel Pint** - Opinionated PHP code formatter
  - PSR-12 compliance
  - Laravel coding standards
  - Automatic code formatting

#### JavaScript/TypeScript
- **ESLint** - Linting and error detection
- **Prettier** - Code formatting
- **TypeScript** - Type checking with `tsc --noEmit`

**Outputs**: Formatted code that meets project standards

### 4. Full Test Suite 🧪

**Purpose**: Validate application functionality and business logic.

**Framework**: Pest PHP (built on PHPUnit)

**Test Coverage**:
- Authentication tests
- Registration and verification
- Two-factor authentication
- Profile and settings management
- Admin functionality
- Dashboard access

**Database**: SQLite in-memory for fast, isolated testing

### 5. Security-Specific Tests 🛡️

**Purpose**: Validate security controls and protections are working correctly.

**File**: `tests/Feature/Security/SecurityTest.php`

**Test Categories**:

#### Authentication & Authorization
- ✅ Admin access control enforcement
- ✅ Authentication requirement for protected routes
- ✅ Self-deletion prevention
- ✅ Rate limiting on login attempts
- ✅ CSRF token validation

#### Data Protection
- ✅ Password hashing (bcrypt verification)
- ✅ Sensitive data exposure prevention in API responses
- ✅ Hidden password fields in model serialization
- ✅ Mass assignment vulnerability prevention

#### Security Headers
- ✅ X-Frame-Options (clickjacking protection)
- ✅ X-Content-Type-Options (MIME sniffing prevention)
- ✅ X-XSS-Protection (XSS attack mitigation)
- ✅ Referrer-Policy

#### Input Validation & Injection Prevention
- ✅ SQL injection prevention
- ✅ XSS (Cross-Site Scripting) prevention
- ✅ File upload validation (type and size)
- ✅ Email format validation
- ✅ Strong password requirements
- ✅ File name sanitization

#### Session Security
- ✅ Secure session configuration
- ✅ HTTP-only cookies
- ✅ SameSite cookie policy

#### Production Security
- ✅ HTTPS enforcement checks
- ✅ Open redirect prevention

## Running the Audit

### Manual Trigger (Recommended)

1. Navigate to the **Actions** tab in GitHub
2. Select **"security-audit"** from the workflow list
3. Click **"Run workflow"** button
4. Select the branch to audit (typically `main` or `develop`)
5. Click **"Run workflow"** to start execution

### Workflow Execution Order

The audit runs **sequentially** to ensure each stage is stable before proceeding:

```
1. Vulnerability Scan (parallel: composer + npm)
         ↓
2. Code Quality Check (Pint, PHPStan, ESLint, TypeScript)
         ↓
3. Full Test Suite
         ↓
4. Security Tests + Report Generation
```

**Estimated Duration**: 5-10 minutes (depending on codebase size)

## Understanding Results

### Success Indicators ✅

All jobs should show green checkmarks:
- ✅ Vulnerability scanning completed (warnings acceptable for known low-risk issues)
- ✅ Code quality checks passed
- ✅ All tests passed
- ✅ Security tests passed

### Failure Scenarios ❌

If any job fails, check the detailed logs:

#### Vulnerability Scan Failures
- **High/Critical CVEs found**: Update affected packages immediately
- **Moderate CVEs**: Review and plan updates
- **Low CVEs**: Monitor and update when convenient

#### Code Quality Failures
- **PHPStan errors**: Fix type errors and undefined variables
- **Linting errors**: Run `vendor/bin/pint` locally to auto-fix
- **TypeScript errors**: Fix type mismatches in frontend code

#### Test Failures
- **Unit/Feature tests**: Fix broken business logic
- **Security tests**: Critical - address security issues immediately

### Downloading Reports

After workflow completion:

1. Go to the workflow run summary page
2. Scroll to **Artifacts** section
3. Download:
   - `security-audit-results` - JSON vulnerability reports (30 days)
   - `security-report` - Comprehensive Markdown report (90 days)

## Artifacts & Reports

### security-audit-results.zip
Contains:
- `composer-audit.json` - Detailed PHP dependency vulnerabilities
- `npm-audit.json` - Detailed JavaScript dependency vulnerabilities

**Format**: JSON (machine-readable for automation)

**Use Cases**:
- Feed into security dashboards
- Track vulnerability trends over time
- Generate compliance reports

### security-report.md
Contains:
- Executive summary
- Vulnerability scan results summary
- Security test coverage details
- Code quality analysis results
- Audit status table
- Links to relevant security resources

**Format**: Markdown (human-readable documentation)

**Use Cases**:
- Share with stakeholders
- Compliance documentation
- Security review records

## Integration with CI/CD

### Current Setup
- **Trigger**: Manual (`workflow_dispatch` only)
- **Branches**: Any branch can be audited
- **Existing Workflows Preserved**:
  - `lint.yml` - Runs automatically on push/PR
  - `tests.yml` - Runs automatically on push/PR

### Why Manual Trigger?

The audit is designed to be run manually because:
1. **Comprehensive but time-consuming** (~5-10 minutes)
2. **Intensive resource usage** (multiple jobs, full dependency scans)
3. **Suitable for periodic reviews** rather than every commit
4. **Complements automatic linting/testing** workflows

### Recommended Schedule

- **Weekly**: During active development
- **Before major releases**: Always
- **After dependency updates**: Verify no new vulnerabilities
- **Compliance requirements**: As needed for audits
- **Security incidents**: Immediate audit to assess impact

## Security Best Practices

### Dependency Management

1. **Regular Updates**: Keep dependencies current
   ```bash
   composer update
   npm update
   ```

2. **Review Changelogs**: Understand what's changing
3. **Test After Updates**: Run full audit after dependency changes
4. **Pin Critical Versions**: Use exact versions for critical packages

### Vulnerability Response

When vulnerabilities are detected:

1. **Assess Severity**:
   - **Critical/High**: Immediate action required
   - **Moderate**: Plan update within 1-2 weeks
   - **Low**: Include in next regular maintenance

2. **Check Exploitability**: Is the vulnerable code path actually used?
3. **Apply Patches**: Update to patched versions
4. **Verify Fix**: Re-run audit to confirm resolution
5. **Document**: Record the issue and resolution in CHANGELOG

### Code Quality Maintenance

1. **Run PHPStan Locally**: Before committing
   ```bash
   ./vendor/bin/phpstan analyze --memory-limit=2G
   ```

2. **Format Code**: Use automated formatters
   ```bash
   ./vendor/bin/pint
   npm run format
   ```

3. **Type Check**: Before pushing frontend changes
   ```bash
   npm run types
   ```

### Security Testing

1. **Add Tests for New Features**: Include security considerations
2. **Review Security Test Failures**: Never ignore security test failures
3. **Expand Coverage**: Add tests for new attack vectors
4. **Regular Review**: Audit security tests quarterly

## Customization

### Adding Custom Security Tests

Edit `tests/Feature/Security/SecurityTest.php`:

```php
test('it prevents my custom vulnerability', function () {
    // Your test logic here
    expect($condition)->toBeTrue();
});
```

### Enhancing the Audit Workflow

Edit `.github/workflows/audit.yml`:

```yaml
- name: My Custom Security Check
  run: |
    # Your custom security tool or script
    echo "Running custom check..."
```

### Adjusting PHPStan Level

Edit `phpstan.neon`:

```yaml
parameters:
    level: 6  # Increase for stricter analysis (max: 10)
```

## Troubleshooting

### Composer Audit Token Error

If you see GitHub token errors during composer audit:
- This is expected in CI environments with high API usage
- The workflow handles this gracefully
- Audit results are still generated

### PHPStan Memory Issues

If PHPStan runs out of memory:
```yaml
run: ./vendor/bin/phpstan analyze --memory-limit=4G  # Increase from 2G
```

### Test Database Issues

If database tests fail:
- Check `.env.example` has correct testing config
- Verify migrations run successfully
- Ensure SQLite is available

### NPM Audit False Positives

If npm audit reports vulnerabilities in dev dependencies:
- Assess if they affect production
- Use `npm audit --omit=dev` for production-only scan
- Document accepted risks if packages can't be updated

## Resources

### Security References
- [OWASP Top 10](https://owasp.org/www-project-top-ten/) - Most critical web application security risks
- [Laravel Security](https://laravel.com/docs/security) - Official Laravel security documentation
- [PHP Security Advisories](https://github.com/FriendsOfPHP/security-advisories) - Database of known PHP vulnerabilities
- [NPM Security Advisories](https://www.npmjs.com/advisories) - JavaScript package vulnerabilities

### Tools Documentation
- [Composer Audit](https://getcomposer.org/doc/03-cli.md#audit) - PHP dependency security scanner
- [NPM Audit](https://docs.npmjs.com/cli/v8/commands/npm-audit) - JavaScript dependency security scanner
- [PHPStan](https://phpstan.org/user-guide/getting-started) - PHP static analysis tool
- [Laravel Pint](https://laravel.com/docs/pint) - PHP code formatter
- [Pest PHP](https://pestphp.com/) - Testing framework

### Compliance Standards
- PCI DSS - Payment Card Industry Data Security Standard
- GDPR - General Data Protection Regulation
- HIPAA - Health Insurance Portability and Accountability Act
- SOC 2 - Service Organization Control 2

## Support

For issues or questions about the security audit:

1. **Check Workflow Logs**: Detailed error messages in Actions tab
2. **Review This Guide**: Most common issues covered here
3. **Security Issues**: Report privately to maintainers
4. **General Questions**: Open a discussion in the repository

---

**Last Updated**: 2025-10-17  
**Workflow Version**: 1.1 (Enhanced with PHPStan and additional security tests)
