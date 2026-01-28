/**
 * Quick Route Audit Script
 * Checks HTTP status for all jobsmarket routes
 *
 * Usage: npx tsx scripts/audit-routes.ts
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

interface RouteCheck {
  ris: string;
  path: string;
  domain: string;
  requiresAuth: boolean;
  description: string;
}

// Routes based on actual file structure in src/app/jobsmarket/
// All routes are prefixed with /jobsmarket as this is a subdomain app
const ALL_ROUTES: RouteCheck[] = [
  // ============ AUTH DOMAIN ============
  { ris: 'AUTH-R01', path: '/jobsmarket/auth/login', domain: 'auth', requiresAuth: false, description: 'Login page' },
  { ris: 'AUTH-R02', path: '/jobsmarket/auth/register', domain: 'auth', requiresAuth: false, description: 'Registration page' },
  { ris: 'AUTH-R03', path: '/jobsmarket/auth/verify', domain: 'auth', requiresAuth: false, description: 'Email verification' },
  { ris: 'AUTH-R04', path: '/jobsmarket/auth/reset', domain: 'auth', requiresAuth: false, description: 'Password reset' },
  { ris: 'AUTH-R05', path: '/jobsmarket/auth/status', domain: 'auth', requiresAuth: true, description: 'Auth status' },
  { ris: 'AUTH-R06', path: '/jobsmarket/auth/settings', domain: 'auth', requiresAuth: true, description: 'Account settings' },
  { ris: 'AUTH-R07', path: '/jobsmarket/auth/select-role', domain: 'auth', requiresAuth: true, description: 'Role selection' },
  { ris: 'AUTH-R08', path: '/jobsmarket/auth/session-expired', domain: 'auth', requiresAuth: false, description: 'Session expired' },
  { ris: 'AUTH-XX', path: '/jobsmarket/auth/token-login', domain: 'auth', requiresAuth: false, description: 'Token login (magic link)' },

  // ============ CANDIDATE DOMAIN ============
  { ris: 'CAND-R01', path: '/jobsmarket/candidates/test-candidate', domain: 'candidate', requiresAuth: true, description: 'Candidate dashboard (redirects to profile)' },
  { ris: 'CAND-R02', path: '/jobsmarket/candidates/test-candidate/profile', domain: 'candidate', requiresAuth: true, description: 'Candidate profile' },
  { ris: 'CAND-R03', path: '/jobsmarket/candidates/test-candidate/settings', domain: 'candidate', requiresAuth: true, description: 'Candidate settings' },
  { ris: 'CAND-R04', path: '/jobsmarket/candidates/test-candidate/applications', domain: 'candidate', requiresAuth: true, description: 'Application list' },
  { ris: 'CAND-R05', path: '/jobsmarket/candidates/test-candidate/saved', domain: 'candidate', requiresAuth: true, description: 'Saved jobs' },
  { ris: 'WALLET-R01', path: '/jobsmarket/candidates/test-candidate/wallet', domain: 'candidate', requiresAuth: true, description: 'Wallet' },
  { ris: 'CAND-XX', path: '/jobsmarket/candidates/profile/create', domain: 'candidate', requiresAuth: true, description: 'Profile creation wizard' },

  // ============ COMPANY DOMAIN ============
  // Note: Company routes are nested under /companies/[id]/dashboard/
  { ris: 'COMP-R01', path: '/jobsmarket/companies/test-company/pending', domain: 'company', requiresAuth: true, description: 'Company pending approval' },
  { ris: 'COMP-R04', path: '/jobsmarket/companies/test-company/dashboard', domain: 'company', requiresAuth: true, description: 'Company dashboard' },
  { ris: 'COMP-R02', path: '/jobsmarket/companies/test-company/dashboard/team', domain: 'company', requiresAuth: true, description: 'Team management' },
  { ris: 'COMP-R03', path: '/jobsmarket/companies/test-company/dashboard/settings', domain: 'company', requiresAuth: true, description: 'Company settings' },
  { ris: 'COMP-R05', path: '/jobsmarket/companies/test-company/dashboard/jobs', domain: 'company', requiresAuth: true, description: 'Jobs list' },
  { ris: 'COMP-R06', path: '/jobsmarket/companies/test-company/dashboard/jobs/new', domain: 'company', requiresAuth: true, description: 'Create new job' },
  { ris: 'COMP-R07', path: '/jobsmarket/companies/test-company/dashboard/jobs/test-job', domain: 'company', requiresAuth: true, description: 'Job detail' },
  { ris: 'COMP-R08', path: '/jobsmarket/companies/test-company/dashboard/applications', domain: 'company', requiresAuth: true, description: 'Applications management' },
  { ris: 'COMP-PUBLIC', path: '/jobsmarket/companies/test-company', domain: 'company', requiresAuth: false, description: 'Public company profile' },

  // ============ JOBS DOMAIN (PUBLIC) ============
  { ris: 'JOB-R01', path: '/jobsmarket/jobs', domain: 'jobs', requiresAuth: false, description: 'Job search/listing' },
  { ris: 'JOB-R02', path: '/jobsmarket/jobs/test-job-id', domain: 'jobs', requiresAuth: false, description: 'Job detail' },

  // ============ CHAT DOMAIN ============
  { ris: 'CHAT-R01', path: '/jobsmarket/chat', domain: 'chat', requiresAuth: true, description: 'Chat list' },
  { ris: 'CHAT-R02', path: '/jobsmarket/chat/test-room-id', domain: 'chat', requiresAuth: true, description: 'Chat room' },

  // ============ NOTIFICATIONS DOMAIN ============
  { ris: 'NOTIF-R01', path: '/jobsmarket/notifications', domain: 'notifications', requiresAuth: true, description: 'Notifications' },

  // ============ ROOT ============
  { ris: 'HOME', path: '/jobsmarket', domain: 'root', requiresAuth: false, description: 'Jobsmarket home' },
];

interface AuditResult {
  ris: string;
  path: string;
  domain: string;
  description: string;
  status: number;
  ok: boolean;
  redirected: boolean;
  redirectUrl?: string;
  finalUrl?: string;
  error?: string;
  responseTime: number;
  contentType?: string;
  hasHtml: boolean;
}

async function auditRoute(route: RouteCheck): Promise<AuditResult> {
  const url = `${BASE_URL}${route.path}`;
  const startTime = Date.now();

  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'User-Agent': 'Route-Audit-Script',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    const responseTime = Date.now() - startTime;
    const contentType = response.headers.get('content-type') || '';
    const text = await response.text();
    const hasHtml = text.includes('<!DOCTYPE html') || text.includes('<html');

    // Check for Next.js error pages
    const isErrorPage = text.includes('Application error') ||
                        text.includes('Internal Server Error') ||
                        text.includes('This page could not be found') ||
                        text.includes('404') && text.includes('Not Found');

    return {
      ris: route.ris,
      path: route.path,
      domain: route.domain,
      description: route.description,
      status: response.status,
      ok: response.ok && !isErrorPage,
      redirected: response.redirected,
      redirectUrl: response.redirected ? response.url : undefined,
      finalUrl: response.url,
      responseTime,
      contentType,
      hasHtml,
    };
  } catch (error) {
    return {
      ris: route.ris,
      path: route.path,
      domain: route.domain,
      description: route.description,
      status: 0,
      ok: false,
      redirected: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime: Date.now() - startTime,
      hasHtml: false,
    };
  }
}

async function runAudit() {
  console.log('🔍 Starting Route Audit...\n');
  console.log(`Base URL: ${BASE_URL}\n`);
  console.log('=' .repeat(80));

  const results: AuditResult[] = [];

  for (const route of ALL_ROUTES) {
    const result = await auditRoute(route);
    results.push(result);

    let statusIcon: string;
    if (result.ok) {
      statusIcon = '✅';
    } else if (result.status === 0) {
      statusIcon = '💥';
    } else if (result.status === 404) {
      statusIcon = '❌';
    } else if (result.status >= 500) {
      statusIcon = '🔥';
    } else if (result.redirected) {
      statusIcon = '↪️';
    } else {
      statusIcon = '⚠️';
    }

    console.log(`${statusIcon} [${result.ris.padEnd(10)}] ${result.path.padEnd(50)} ${result.status} (${result.responseTime}ms)`);

    if (result.redirected && result.finalUrl) {
      const finalPath = new URL(result.finalUrl).pathname;
      console.log(`   ↳ Redirected to: ${finalPath}`);
    }
    if (result.error) {
      console.log(`   ↳ Error: ${result.error}`);
    }
  }

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('SUMMARY BY DOMAIN');
  console.log('='.repeat(80));

  const domains = [...new Set(ALL_ROUTES.map(r => r.domain))];

  for (const domain of domains) {
    const domainResults = results.filter(r => r.domain === domain);
    const ok = domainResults.filter(r => r.ok).length;
    const redirected = domainResults.filter(r => r.redirected && r.status < 400).length;
    const failed = domainResults.filter(r => !r.ok && !r.redirected).length;
    const total = domainResults.length;

    let status: string;
    if (ok + redirected === total) {
      status = '✅';
    } else if (ok + redirected === 0) {
      status = '❌';
    } else {
      status = '⚠️';
    }

    console.log(`${status} ${domain.toUpperCase().padEnd(15)} ${ok}/${total} OK, ${redirected} redirects, ${failed} failed`);

    // List failed routes
    const failedRoutes = domainResults.filter(r => !r.ok && !r.redirected);
    for (const f of failedRoutes) {
      console.log(`   ❌ [${f.ris}] ${f.path} - ${f.status || f.error}`);
    }
  }

  // Overall
  const totalOk = results.filter(r => r.ok).length;
  const totalRedirected = results.filter(r => r.redirected && r.status < 400).length;
  const total = results.length;

  console.log('\n' + '='.repeat(80));
  console.log(`OVERALL: ${totalOk} OK + ${totalRedirected} redirected = ${totalOk + totalRedirected}/${total} accessible (${Math.round((totalOk + totalRedirected)/total*100)}%)`);
  console.log('='.repeat(80));

  // Generate report
  const report = generateMarkdownReport(results);
  const fs = await import('fs');
  fs.writeFileSync('docs/jobsmarket/reports/route-audit-results.md', report);
  console.log('\n📄 Report saved to: docs/jobsmarket/reports/route-audit-results.md');

  // Return exit code based on results
  const hasFailures = results.some(r => !r.ok && !r.redirected && r.status !== 0);
  return hasFailures ? 1 : 0;
}

function generateMarkdownReport(results: AuditResult[]): string {
  const now = new Date().toISOString();

  let md = `# Route Audit Results

**Generated:** ${now}
**Base URL:** ${BASE_URL}

## Quick Summary

| Status | Count |
|--------|-------|
| ✅ OK | ${results.filter(r => r.ok).length} |
| ↪️ Redirected | ${results.filter(r => r.redirected && r.status < 400).length} |
| ❌ Failed | ${results.filter(r => !r.ok && !r.redirected).length} |
| **Total** | ${results.length} |

## Summary by Domain

| Domain | OK | Redirects | Failed | Total | Status |
|--------|-----|-----------|--------|-------|--------|
`;

  const domains = [...new Set(results.map(r => r.domain))];

  for (const domain of domains) {
    const domainResults = results.filter(r => r.domain === domain);
    const ok = domainResults.filter(r => r.ok).length;
    const redirected = domainResults.filter(r => r.redirected && r.status < 400).length;
    const failed = domainResults.length - ok - redirected;
    const total = domainResults.length;

    let icon: string;
    if (ok + redirected === total) {
      icon = '✅';
    } else if (ok + redirected === 0) {
      icon = '❌';
    } else {
      icon = '⚠️';
    }

    md += `| ${domain} | ${ok} | ${redirected} | ${failed} | ${total} | ${icon} |\n`;
  }

  md += `\n## Detailed Results\n\n`;

  for (const domain of domains) {
    md += `### ${domain.toUpperCase()}\n\n`;
    md += `| RIS | Path | Description | Status | Time | Notes |\n`;
    md += `|-----|------|-------------|--------|------|-------|\n`;

    const domainResults = results.filter(r => r.domain === domain);
    for (const r of domainResults) {
      let icon: string;
      if (r.ok) {
        icon = '✅';
      } else if (r.redirected && r.status < 400) {
        icon = '↪️';
      } else if (r.status === 404) {
        icon = '❌';
      } else if (r.status >= 500) {
        icon = '🔥';
      } else {
        icon = '⚠️';
      }

      let notes = '-';
      if (r.error) {
        notes = r.error;
      } else if (r.redirected && r.finalUrl) {
        const finalPath = new URL(r.finalUrl).pathname;
        notes = `→ ${finalPath}`;
      }

      md += `| ${r.ris} | \`${r.path}\` | ${r.description} | ${icon} ${r.status} | ${r.responseTime}ms | ${notes} |\n`;
    }

    md += '\n';
  }

  // Failed routes section
  const failedRoutes = results.filter(r => !r.ok && !r.redirected);
  if (failedRoutes.length > 0) {
    md += `## ❌ Failed Routes (Need Attention)\n\n`;
    md += `| RIS | Path | Status | Error |\n`;
    md += `|-----|------|--------|-------|\n`;

    for (const r of failedRoutes) {
      md += `| ${r.ris} | \`${r.path}\` | ${r.status} | ${r.error || 'HTTP error'} |\n`;
    }
    md += '\n';
  }

  // Routes requiring auth section
  md += `## 🔐 Routes Requiring Authentication\n\n`;
  md += `These routes likely redirect to login (expected behavior for unauthenticated access):\n\n`;

  const authRoutes = ALL_ROUTES.filter(r => r.requiresAuth);
  for (const r of authRoutes) {
    md += `- \`${r.path}\` - ${r.description}\n`;
  }

  return md;
}

// Run
runAudit()
  .then(exitCode => process.exit(exitCode))
  .catch(err => {
    console.error('Audit failed:', err);
    process.exit(1);
  });
