const RESERVED_SLUGS = new Set(['www', 'api', 'app', 'admin', 'mail', 'localhost']);
const SLUG_PATTERN = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/;
const LOCAL_SUFFIX = '.localhost';
const BASE_DOMAIN = 'myhr.com';
const NIP_IO_SUFFIX = '.nip.io';
const LOCAL_API_PORT = 8080;

/** Simple check: is this a bare IPv4 address like 151.80.56.83? */
const IPV4_PATTERN = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;

function isPublicIp(host: string): boolean {
  if (!IPV4_PATTERN.test(host)) return false;
  // Exclude local/private IPs — those should use .localhost
  return !host.startsWith('127.') && !host.startsWith('10.') &&
         !host.startsWith('192.168.') && !host.startsWith('172.');
}

/**
 * Detects the base domain from a hostname dynamically.
 * Handles: *.localhost, *.myhr.com, *.IP.nip.io (e.g. acme.151.80.56.83.nip.io)
 * Returns the suffix including the leading dot, or null if not a tenant host.
 */
function detectBaseSuffix(host: string): string | null {
  if (host.endsWith(LOCAL_SUFFIX)) {
    return LOCAL_SUFFIX;
  }
  if (host.endsWith(`.${BASE_DOMAIN}`)) {
    return `.${BASE_DOMAIN}`;
  }
  // nip.io: slug.IP.nip.io — suffix is everything after the first dot
  if (host.endsWith(NIP_IO_SUFFIX)) {
    const firstDot = host.indexOf('.');
    if (firstDot > 0 && firstDot < host.length - NIP_IO_SUFFIX.length) {
      return host.substring(firstDot);
    }
  }
  return null;
}

/**
 * Returns the nip.io suffix for a bare IP, e.g. '151.80.56.83' -> '.151.80.56.83.nip.io'
 */
function nipIoSuffix(ip: string): string {
  return `.${ip}${NIP_IO_SUFFIX}`;
}

export function parseTenantSlug(hostname: string | null | undefined): string | null {
  if (!hostname) {
    return null;
  }
  const host = hostname.trim().toLowerCase();
  if (host === 'localhost' || host === '127.0.0.1' || host === '[::1]' || host === '::1') {
    return null;
  }

  // Bare public IP has no slug
  if (isPublicIp(host)) {
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
  // Bare public IP -> use nip.io (e.g. 151.80.56.83 -> acme.151.80.56.83.nip.io)
  if (isPublicIp(host)) {
    return `${slug}${nipIoSuffix(host)}`;
  }
  return `${slug}.localhost`;
}

export function companyPortalLoginUrl(
  slug: string,
  location: Pick<Location, 'protocol' | 'hostname' | 'port'>
): string {
  const portalHost = companyPortalHost(slug, location.hostname);
  // Don't append port when redirecting to nip.io (nginx serves on 80)
  const host = location.hostname.toLowerCase();
  const portPart = (isPublicIp(host) || host.endsWith(NIP_IO_SUFFIX))
    ? ''
    : (location.port ? `:${location.port}` : '');
  return `${location.protocol}//${portalHost}${portPart}/login`;
}

export function companyDomainSuffix(currentHostname: string): string {
  const host = currentHostname.toLowerCase();
  const suffix = detectBaseSuffix(host);
  if (suffix) return suffix;
  if (isPublicIp(host)) return nipIoSuffix(host);
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
