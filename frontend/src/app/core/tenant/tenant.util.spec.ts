import { apiBaseUrlForHost, parseCompanyDomainInput, parseTenantSlug, companyPortalLoginUrl, companyDomainSuffix, companyPortalHost } from './tenant.util';

describe('parseTenantSlug', () => {
  it('reads acme from acme.localhost', () => {
    expect(parseTenantSlug('acme.localhost')).toBe('acme');
  });

  it('normalizes Acme.MyHR.com', () => {
    expect(parseTenantSlug('Acme.MyHR.com')).toBe('acme');
  });

  it('reads slug from nip.io hostname', () => {
    expect(parseTenantSlug('acme.151.80.56.83.nip.io')).toBe('acme');
    expect(parseTenantSlug('globex.10.0.0.1.nip.io')).toBe('globex');
  });

  it('rejects bare nip.io without slug', () => {
    expect(parseTenantSlug('151.80.56.83.nip.io')).toBeNull();
  });

  it('rejects bare public IP', () => {
    expect(parseTenantSlug('151.80.56.83')).toBeNull();
  });

  it('rejects apex, reserved, and bare localhost', () => {
    expect(parseTenantSlug('localhost')).toBeNull();
    expect(parseTenantSlug('127.0.0.1')).toBeNull();
    expect(parseTenantSlug('myhr.com')).toBeNull();
    expect(parseTenantSlug('www.myhr.com')).toBeNull();
    expect(parseTenantSlug('api.myhr.com')).toBeNull();
  });
});

describe('parseCompanyDomainInput', () => {
  it('accepts a bare slug', () => {
    expect(parseCompanyDomainInput('Acme')).toBe('acme');
  });

  it('accepts a host or pasted URL', () => {
    expect(parseCompanyDomainInput('acme.localhost')).toBe('acme');
    expect(parseCompanyDomainInput('http://globex.localhost:4200/login')).toBe('globex');
  });

  it('accepts a nip.io host', () => {
    expect(parseCompanyDomainInput('acme.151.80.56.83.nip.io')).toBe('acme');
  });

  it('rejects reserved slugs', () => {
    expect(parseCompanyDomainInput('api')).toBeNull();
    expect(parseCompanyDomainInput('localhost')).toBeNull();
  });
});

describe('companyPortalHost', () => {
  it('routes bare public IP to slug.IP.nip.io', () => {
    expect(companyPortalHost('acme', '151.80.56.83')).toBe('acme.151.80.56.83.nip.io');
  });

  it('routes localhost to slug.localhost', () => {
    expect(companyPortalHost('acme', 'localhost')).toBe('acme.localhost');
  });

  it('keeps nip.io suffix when already on nip.io', () => {
    expect(companyPortalHost('acme', 'globex.151.80.56.83.nip.io')).toBe('acme.151.80.56.83.nip.io');
  });
});

describe('companyPortalLoginUrl', () => {
  it('routes localhost to slug.localhost keeping the UI port', () => {
    expect(
      companyPortalLoginUrl('acme', { protocol: 'http:', hostname: 'localhost', port: '4200' })
    ).toBe('http://acme.localhost:4200/login');
  });

  it('routes bare public IP to slug.IP.nip.io without port', () => {
    expect(
      companyPortalLoginUrl('acme', { protocol: 'http:', hostname: '151.80.56.83', port: '' })
    ).toBe('http://acme.151.80.56.83.nip.io/login');
  });

  it('routes nip.io to slug.IP.nip.io without port', () => {
    expect(
      companyPortalLoginUrl('acme', { protocol: 'http:', hostname: 'globex.151.80.56.83.nip.io', port: '' })
    ).toBe('http://acme.151.80.56.83.nip.io/login');
  });
});

describe('companyDomainSuffix', () => {
  it('returns nip.io suffix for nip.io hosts', () => {
    expect(companyDomainSuffix('acme.151.80.56.83.nip.io')).toBe('.151.80.56.83.nip.io');
  });

  it('returns nip.io suffix for bare public IP', () => {
    expect(companyDomainSuffix('151.80.56.83')).toBe('.151.80.56.83.nip.io');
  });

  it('returns .localhost for local hosts', () => {
    expect(companyDomainSuffix('acme.localhost')).toBe('.localhost');
  });
});

describe('apiBaseUrlForHost', () => {
  it('uses port 8080 on localhost tenants', () => {
    expect(apiBaseUrlForHost('acme.localhost', 'http:')).toBe('http://acme.localhost:8080');
  });

  it('uses no port on nip.io tenants', () => {
    expect(apiBaseUrlForHost('acme.151.80.56.83.nip.io', 'http:')).toBe('http://acme.151.80.56.83.nip.io');
  });
});
