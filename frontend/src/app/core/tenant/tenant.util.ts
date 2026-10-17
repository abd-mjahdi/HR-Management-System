const RESERVED_SLUGS = new Set(['www', 'api', 'app', 'admin', 'mail', 'localhost']);
const SLUG_PATTERN = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/;
const LOCAL_SUFFIX = '.localhost';
const BASE_DOMAIN = 'workline.casa';
const LOCAL_API_PORT = 8080;

/**
 * Detects the base domain from a hostname dynamically.
 * Handles: *.localhost (local dev), *.workline.casa (production)
 * Returns the suffix including the leading dot, or null if not a tenant host.
 */
function detectBaseSuffix(host: string): string | null {
  if (host.endsWith(LOCAL_SUFFIX)) {
    return LOCAL_SUFFIX;
  }
  if (host.endsWith(`.${BASE_DOMAIN}`)) {
    return `.${BASE_DOMAIN}`;
  }
  return null;
}

export function parseTenantSlug(hostname: string | null | undefined): string | null {
  if (!hostname) {
    return null;
  }
  const host = hostname.trim().toLowerCase();
  if (host === 'localhost' || host === '127.0.0.1' || host === '[::1]' || host === '::1') {
    return null;
  }

  if (host === BASE_DOMAIN || host === `www.${BASE_DOMAIN}`) {
    return null;
  }

  const suffix = detectBaseSuffix(host);
  if (suffix) {
    const slug = host.slice(0, -suffix.length);
    return usableSlug(slug);
  }

  return null;
}

export function parseCompanyDomainInput(raw: string | null | undefined): string | null {
  if (!raw) {
    return null;
  }
  let value = raw.trim().toLowerCase();
  if (!value) {
    return null;
  }
  value = value.replace(/^https?:\/\//, '');
  value = value.split('/')[0] ?? value;
  value = value.split(':')[0] ?? value;
  if (!value.includes('.')) {
    return usableSlug(value);
  }
  return parseTenantSlug(value);
}

export function companyPortalHost(slug: string, currentHostname: string): string {
  const host = currentHostname.toLowerCase();
  const suffix = detectBaseSuffix(host);
  if (suffix && suffix !== LOCAL_SUFFIX) {
    return `${slug}${suffix}`;
  }
  // On the apex domain itself (workline.casa), route to subdomain
  if (host === BASE_DOMAIN || host === `www.${BASE_DOMAIN}`) {
    return `${slug}.${BASE_DOMAIN}`;
  }
  return `${slug}.localhost`;
}

export function companyPortalLoginUrl(
  slug: string,
  location: Pick<Location, 'protocol' | 'hostname' | 'port'>
): string {
  const portalHost = companyPortalHost(slug, location.hostname);
  const host = location.hostname.toLowerCase();
  // Don't append port for production domain (nginx serves on 80/443)
  const isProduction = host === BASE_DOMAIN || host === `www.${BASE_DOMAIN}` || host.endsWith(`.${BASE_DOMAIN}`);
  const portPart = isProduction ? '' : (location.port ? `:${location.port}` : '');
  return `${location.protocol}//${portalHost}${portPart}/login`;
}

export function companyDomainSuffix(currentHostname: string): string {
  const host = currentHostname.toLowerCase();
  const suffix = detectBaseSuffix(host);
  if (suffix) return suffix;
  if (host === BASE_DOMAIN || host === `www.${BASE_DOMAIN}`) return `.${BASE_DOMAIN}`;
  return LOCAL_SUFFIX;
}

function usableSlug(slug: string): string | null {
  if (!slug || slug.includes('.') || RESERVED_SLUGS.has(slug) || !SLUG_PATTERN.test(slug)) {
    return null;
  }
  return slug;
}

export function apiBaseUrlForHost(hostname: string, protocol: string): string {
  const host = hostname.toLowerCase();
  if (host === 'localhost' || host.endsWith(LOCAL_SUFFIX) || host === '127.0.0.1') {
    return `${protocol}//${hostname}:${LOCAL_API_PORT}`;
  }
  return `${protocol}//${hostname}`;
}
