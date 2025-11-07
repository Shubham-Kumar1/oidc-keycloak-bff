/**
 * Utility functions to convert internal Kubernetes service URLs to external URLs
 * for browser access via ingress
 */

/**
 * Replaces internal service URLs with external URLs for browser access
 * @param url - URL that may contain internal service names
 * @returns URL with external domain for browser access
 */
export function toExternalUrl(url: string): string {
  try {
    const parsed = new URL(url);

    if (isInternalKeycloakHost(parsed)) {
      const external = new URL(getExternalKeycloakUrl());
      parsed.protocol = external.protocol;
      parsed.host = external.host;
      parsed.port = external.port || '';
      return parsed.toString();
    }

    if (isInternalWebHost(parsed)) {
      const external = new URL(getExternalBaseUrl());
      parsed.protocol = external.protocol;
      parsed.host = external.host;
      parsed.port = external.port || '';
      return parsed.toString();
    }
  } catch (error) {
    // Fall through to string replacement if URL parsing fails (e.g., relative URLs)
  }

  // Fallback replacements for strings we know about
  if (url.includes('keycloak-service:8080')) {
    return url.replace('http://keycloak-service:8080', getExternalKeycloakUrl());
  }
  if (url.includes('http://keycloak.local')) {
    return url.replace('http://keycloak.local', getExternalKeycloakUrl());
  }
  if (url.includes('https://keycloak.local')) {
    return url.replace('https://keycloak.local', getExternalKeycloakUrl());
  }
  if (url.includes('web-service:3000')) {
    return url.replace('http://web-service:3000', getExternalBaseUrl());
  }

  return url;
}

/**
 * Gets the external Keycloak base URL
 * @returns External Keycloak URL
 */
export function getExternalKeycloakUrl(): string {
  const externalUrl = process.env.KEYCLOAK_EXTERNAL_URL || 'http://keycloak.local';
  return externalUrl.replace(/\/$/, '');
}

function getExternalBaseUrl(): string {
  const externalUrl = process.env.BASE_URL || 'http://app.local';
  return externalUrl.replace(/\/$/, '');
}

function isInternalKeycloakHost(parsedUrl: URL): boolean {
  const internalHosts = new Set([
    'keycloak-service',
    'keycloak-service.oidc-keycloak-bff.svc.cluster.local',
    'keycloak.local'
  ]);

  if (internalHosts.has(parsedUrl.hostname)) {
    return true;
  }

  return parsedUrl.hostname.startsWith('keycloak-service.');
}

function isInternalWebHost(parsedUrl: URL): boolean {
  const internalHosts = new Set([
    'web-service',
    'web-service.oidc-keycloak-bff.svc.cluster.local'
  ]);

  if (internalHosts.has(parsedUrl.hostname)) {
    return true;
  }

  return parsedUrl.hostname.startsWith('web-service.');
}

