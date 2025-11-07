# Accessing the Application via Ingress

## Step 1: Configure DNS

Point the following DNS records at your ingress IP (already configured in Namecheap):

- `app.shubham.it.com` → ingress IP
- `keycloak.shubham.it.com` → ingress IP

## Step 2: Access the Application

Once DNS has propagated, you can access:

- **Next.js Application**: https://app.shubham.it.com
- **Keycloak Admin Console**: https://keycloak.shubham.it.com

> Ensure `configmap.yaml` has `BASE_URL` set to `https://app.shubham.it.com`, `OIDC_REDIRECT_URI` set to `https://app.shubham.it.com/api/auth/callback`, `OIDC_ISSUER_URL` set to `https://keycloak.shubham.it.com/realms/oidc-demo`, and `KEYCLOAK_EXTERNAL_URL` set to `https://keycloak.shubham.it.com` so the web app generates the correct browser redirects.

## Step 3: Configure Keycloak Client

1. Access Keycloak Admin Console: http://keycloak.local
2. Login with admin credentials (from secrets.yaml)
3. Go to **Clients** → **next-bff**
4. Update **Valid Redirect URIs**:
   - Add: `https://app.shubham.it.com/api/auth/callback`
   - Add: `https://app.shubham.it.com/*`
5. Update **Web Origins**:
   - Add: `https://app.shubham.it.com`
6. Save

## Step 4: Verify Configuration

Check that the web app has the updated configuration:
```bash
kubectl get pods -n oidc-keycloak-bff -l app=web-app
kubectl logs -n oidc-keycloak-bff -l app=web-app --tail=20
```

## Alternative: Using IP Directly

If you prefer to use the IP directly instead of domain names:

1. Update `ingress.yaml` to remove host requirements (or add a rule for your IP)
2. Update `configmap.yaml`:
   - `OIDC_ISSUER_URL: "http://35.222.8.94/realms/oidc-demo"`
   - `OIDC_REDIRECT_URI: "http://35.222.8.94/api/auth/callback"`
   - `BASE_URL: "http://35.222.8.94"`
   - `KEYCLOAK_EXTERNAL_URL: "http://35.222.8.94"`

Then access:
- **App**: http://35.222.8.94
- **Keycloak**: http://35.222.8.94 (if using path-based routing)

## Alternative: Port-Forwarding Only

If you do not have DNS or an ingress controller, you can port-forward both services locally:

1. Update `configmap.yaml`:
   - `OIDC_REDIRECT_URI: "http://localhost:3000/api/auth/callback"`
   - `BASE_URL: "http://localhost:3000"`
   - `KEYCLOAK_EXTERNAL_URL: "http://localhost:8080"`
2. Port-forward in separate terminals:
   ```bash
   kubectl port-forward svc/web-service 3000:3000 -n oidc-keycloak-bff
   kubectl port-forward svc/keycloak-service 8080:8080 -n oidc-keycloak-bff
   ```
3. Open http://localhost:3000 and log in. The browser will be redirected to http://localhost:8080 for Keycloak.

## Troubleshooting

### Can't access via domain names:
- Verify `/etc/hosts` entries are correct
- Try accessing via IP directly
- Check ingress status: `kubectl get ingress -n oidc-keycloak-bff`

### OIDC redirect errors:
- Verify Keycloak client redirect URIs match exactly
- Check web app logs for OIDC errors
- Verify ConfigMap has correct URLs

### Ingress not working:
- Check ingress controller is installed: `kubectl get ingressclass`
- Verify ingress status: `kubectl describe ingress -n oidc-keycloak-bff`

