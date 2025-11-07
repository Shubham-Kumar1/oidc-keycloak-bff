# URL Configuration Guide

## Overview

The application uses **internal Kubernetes service URLs** for server-to-server communication and **external URLs** (via ingress) for browser access.

## Configuration Strategy

### Internal URLs (Server-to-Server)
- Used by the Next.js pod to communicate with Keycloak
- Resolvable within the Kubernetes cluster
- Example: `http://keycloak-service:8080/realms/oidc-demo`

### External URLs (Browser Access)
- Used for browser redirects and user-facing links
- Accessible via ingress
- Example: `https://keycloak.shubham.it.com/realms/oidc-demo`

## Current Configuration

### ConfigMap (`k8s/configmap.yaml`)
```yaml
OIDC_ISSUER_URL: "https://keycloak.shubham.it.com/realms/oidc-demo" # External - matches Keycloak issuer
OIDC_REDIRECT_URI: "https://app.shubham.it.com/api/auth/callback"   # External - for browser
BASE_URL: "https://app.shubham.it.com"                               # External - for browser
KEYCLOAK_EXTERNAL_URL: "https://keycloak.shubham.it.com"            # External Keycloak host for browser
NODE_TLS_REJECT_UNAUTHORIZED: "0"                                   # Trust self-signed certs in development
```

### URL Conversion

The application automatically converts internal URLs to external URLs for browser-facing operations. Set `KEYCLOAK_EXTERNAL_URL` to whatever hostname (ingress, load-balancer, or port-forward) your browser uses to reach Keycloak.

1. **Login Route** (`/api/auth/login`)
   - Generates authorization URL using internal service
   - Converts to external URL before redirecting browser
   - Uses `toExternalUrl()` utility function

2. **Logout Route** (`/api/auth/logout`)
   - Generates end session URL using internal service
   - Converts to external URL before redirecting browser
   - Uses `toExternalUrl()` utility function

3. **Callback Route** (`/api/auth/callback`)
   - Server-to-server communication only
   - Uses internal service URL (no conversion needed)

4. **Token Refresh** (`/api/auth/refresh`)
   - Server-to-server communication only
   - Uses internal service URL (no conversion needed)

## Utility Function

Located in `web/src/lib/url-utils.ts`:

```typescript
export function toExternalUrl(url: string): string {
  // Replaces internal service URLs with external URLs
  if (url.includes('keycloak-service:8080')) {
    return url.replace('http://keycloak-service:8080', getExternalKeycloakUrl());
  }
  if (url.includes('web-service:3000')) {
    return url.replace('http://web-service:3000', getExternalBaseUrl());
  }
  return url;
}

export function getExternalKeycloakUrl(): string {
  const externalUrl = process.env.KEYCLOAK_EXTERNAL_URL || 'http://keycloak.local';
  return externalUrl.replace(/\/$/, '');
}

function getExternalBaseUrl(): string {
  const externalUrl = process.env.BASE_URL || 'http://app.local';
  return externalUrl.replace(/\/$/, '');
}
```

## Verification Checklist

✅ **Login Flow**
- [x] Authorization URL converted to external URL
- [x] Browser can access Keycloak login page

✅ **Callback Flow**
- [x] Server uses internal URL for token exchange
- [x] Redirect uses external BASE_URL

✅ **Logout Flow**
- [x] End session URL converted to external URL
- [x] Browser can access Keycloak logout endpoint

✅ **Token Refresh**
- [x] Server uses internal URL (server-to-server)
- [x] No browser interaction needed

## Updating URLs

If you need to change the external URLs:

1. **Update ConfigMap** (`k8s/configmap.yaml`):
   ```yaml
   OIDC_REDIRECT_URI: "http://your-domain/api/auth/callback"
   BASE_URL: "http://your-domain"
   KEYCLOAK_EXTERNAL_URL: "http://your-keycloak-domain"
   ```

2. **Update URL utility** (`web/src/lib/url-utils.ts`):
   ```typescript
   // Ensure KEYCLOAK_EXTERNAL_URL is read from the environment (no code change needed now)
   ```

3. **Update Ingress** (`k8s/ingress.yaml`):
   ```yaml
   - host: your-domain
   - host: your-keycloak-domain
   ```

4. **Rebuild and redeploy**:
   ```bash
   cd web
   docker buildx build --platform linux/amd64 -t kumarshubham16/oidc-keycloak-bff-web:latest --load .
   docker push kumarshubham16/oidc-keycloak-bff-web:latest
   kubectl rollout restart deployment/web-app -n oidc-keycloak-bff
   ```

### Port-forwarding Instead of Ingress

If you prefer to use `kubectl port-forward` (for example with local clusters that lack an ingress controller):

1. Update `configmap.yaml`:
   ```yaml
   OIDC_REDIRECT_URI: "http://localhost:3000/api/auth/callback"
   BASE_URL: "http://localhost:3000"
   KEYCLOAK_EXTERNAL_URL: "http://localhost:8080"
   ```
2. Forward services locally:
   ```bash
   kubectl port-forward svc/web-service 3000:3000 -n oidc-keycloak-bff
   kubectl port-forward svc/keycloak-service 8080:8080 -n oidc-keycloak-bff
   ```
3. Access the app at http://localhost:3000. The login flow will redirect the browser to http://localhost:8080 for Keycloak.

## Troubleshooting

### Browser can't access Keycloak
- Check `/etc/hosts` has correct entries
- Verify ingress is configured correctly
- Check ingress IP: `kubectl get ingress -n oidc-keycloak-bff`

### Server can't discover Keycloak
- Verify `OIDC_ISSUER_URL` uses internal service URL
- Check Keycloak pod is running: `kubectl get pods -n oidc-keycloak-bff -l app=keycloak`
- Check service: `kubectl get svc -n oidc-keycloak-bff keycloak-service`

### Redirect URI mismatch
- Ensure Keycloak client has correct redirect URIs
- Verify `OIDC_REDIRECT_URI` matches Keycloak configuration
- Check both internal and external URLs if needed

