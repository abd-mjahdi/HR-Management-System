import { apiBaseUrlForHost, parseCompanyDomainInput, parseTenantSlug, companyPortalLoginUrl, companyDomainSuffix, companyPortalHost } from './tenant.util';

describe('parseTenantSlug', () => {
  it('reads acme from acme.localhost', () => {
    expect(parseTenantSlug('acme.localhost')).toBe('acme');
  });

  it('reads slug from workline.casa subdomain', () => {
    expect(parseTenantSlug('acme.workline.casa')).toBe('acme');
    expect(parseTenantSlug('Acme.Workline.Casa')).toBe('acme');
  });

  it('rejects apex, reserved, and bare localhost', () => {
    expect(parseTenantSlug('localhost')).toBeNull();
    expect(parseTenantSlug('127.0.0.1')).toBeNull();
    expect(parseTenantSlug('workline.casa')).toBeNull();
    expect(parseTenantSlug('www.workline.casa')).toBeNull();
    expect(parseTenantSlug('api.workline.casa')).toBeNull();
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

  it('accepts a workline.casa host', () => {
    expect(parseCompanyDomainInput('acme.workline.casa')).toBe('acme');
  });

  it('rejects reserved slugs', () => {
    expect(parseCompanyDomainInput('api')).toBeNull();
    expect(parseCompanyDomainInput('localhost')).toBeNull();
  });
});

describe('companyPortalHost', () => {
  it('routes workline.casa apex to slug.workline.casa', () => {
    expect(companyPortalHost('acme', 'workline.casa')).toBe('acme.workline.casa');
  });

  it('routes localhost to slug.localhost', () => {
    expect(companyPortalHost('acme', 'localhost')).toBe('acme.localhost');
  });

  it('keeps workline.casa suffix when already on a subdomain', () => {
    expect(companyPortalHost('acme', 'globex.workline.casa')).toBe('acme.workline.casa');
  });
});

describe('companyPortalLoginUrl', () => {
  it('routes localhost to slug.localhost keeping the UI port', () => {
    expect(
      companyPortalLoginUrl('acme', { protocol: 'http:', hostname: 'localhost', port: '4200' })
    ).toBe('http://acme.localhost:4200/login');
  });

  it('routes workline.casa to slug.workline.casa without port', () => {
    expect(
      companyPortalLoginUrl('acme', { protocol: 'http:', hostname: 'workline.casa', port: '' })
    ).toBe('http://acme.workline.casa/login');
  });
});

describe('companyDomainSuffix', () => {
  it('returns .workline.casa for production hosts', () => {
    expect(companyDomainSuffix('acme.workline.casa')).toBe('.workline.casa');
  });

  it('returns .workline.casa for apex', () => {
    expect(companyDomainSuffix('workline.casa')).toBe('.workline.casa');
  });

  it('returns .localhost for local hosts', () => {
    expect(companyDomainSuffix('acme.localhost')).toBe('.localhost');
  });
});

describe('apiBaseUrlForHost', () => {
  it('uses port 8080 on localhost tenants', () => {
    expect(apiBaseUrlForHost('acme.localhost', 'http:')).toBe('http://acme.localhost:8080');
  });

  it('uses no port on production tenants', () => {
    expect(apiBaseUrlForHost('acme.workline.casa', 'http:')).toBe('http://acme.workline.casa');
  });
});
