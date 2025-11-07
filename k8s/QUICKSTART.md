# Quick Start Guide

## Prerequisites Checklist

- [ ] Kubernetes cluster (v1.24+)
- [ ] kubectl configured
- [ ] Docker installed
- [ ] Ingress controller installed (NGINX recommended)

## Step-by-Step Deployment

### 1. Build Docker Image

```bash
cd web
docker build -t oidc-keycloak-bff-web:latest .
```

Or use the build script:

```bash
cd k8s
./build-and-deploy.sh
```

### 2. Update Secrets

**IMPORTANT**: Edit `secrets.yaml` and update all passwords:

```bash
# Generate secure passwords
openssl rand -base64 32  # For SESSION_PASSWORD
openssl rand -base64 24  # For database passwords

# Edit secrets.yaml
vim secrets.yaml
```

### 3. Update Configuration

Edit `configmap.yaml` and update:

- `OIDC_REDIRECT_URI`: Your application callback URL (e.g., `https://app.shubham.it.com/api/auth/callback`)
- `BASE_URL`: Your application base URL (e.g., `https://app.shubham.it.com`)
- `KEYCLOAK_EXTERNAL_URL`: Public Keycloak URL (e.g., `https://keycloak.shubham.it.com`)
- `OIDC_ISSUER_URL`: Match Keycloak's issuer (e.g., `https://keycloak.shubham.it.com/realms/oidc-demo`)

### 4. Update Ingress

Edit `ingress.yaml` and update:

- Replace `keycloak.local` with your Keycloak domain
- Replace `app.local` with your application domain
- Update `ingressClassName` if needed

### 5. Deploy

```bash
cd k8s
./deploy.sh
```

Or manually:

```bash
kubectl apply -k k8s/
```

### 6. Verify

```bash
# Check pods
kubectl get pods -n oidc-keycloak-bff

# Check services
kubectl get svc -n oidc-keycloak-bff

# Check ingress
kubectl get ingress -n oidc-keycloak-bff
```

### 7. Configure Keycloak

1. Access Keycloak Admin Console (via ingress or port-forward)
2. Create realm `oidc-demo` or import from `keycloak/realm-export.json`
3. Configure client:
   - Client ID: `next-bff`
   - Valid Redirect URIs: `https://app.shubham.it.com/api/auth/callback` (update with your domain)
   - Valid Post Logout Redirect URIs: `https://app.shubham.it.com/*`
   - Web Origins: `https://app.shubham.it.com`

### 8. Update OIDC URLs (if using external access)

If accessing Keycloak via ingress, ensure `OIDC_ISSUER_URL` matches the external issuer (already shown in step 3).

Then restart web app:

```bash
kubectl rollout restart deployment/web-app -n oidc-keycloak-bff
```

## Port Forwarding (for local testing)

```bash
# Keycloak
kubectl port-forward -n oidc-keycloak-bff svc/keycloak-service 8080:8080

# Web App
kubectl port-forward -n oidc-keycloak-bff svc/web-service 3000:3000
```

Then access:
- Keycloak: http://localhost:8080
- Web App: http://localhost:3000

## Troubleshooting

### Pods not starting

```bash
# Check pod status
kubectl describe pod <pod-name> -n oidc-keycloak-bff

# Check logs
kubectl logs -f <pod-name> -n oidc-keycloak-bff
```

### Keycloak can't connect to PostgreSQL

```bash
# Check PostgreSQL is running
kubectl get pods -n oidc-keycloak-bff -l app=postgres

# Check service
kubectl get svc -n oidc-keycloak-bff postgres-service

# Test connection
kubectl exec -it deployment/postgres -n oidc-keycloak-bff -- psql -U keycloak -d keycloak
```

### Web app can't connect to Keycloak

```bash
# Check Keycloak is running
kubectl get pods -n oidc-keycloak-bff -l app=keycloak

# Check OIDC_ISSUER_URL in configmap
kubectl get configmap app-config -n oidc-keycloak-bff -o yaml

# Test from web app pod
kubectl exec -it deployment/web-app -n oidc-keycloak-bff -- wget -O- http://keycloak-service:8080/realms/oidc-demo/.well-known/openid-configuration
```

## Cleanup

```bash
cd k8s
./cleanup.sh
```

Or manually:

```bash
kubectl delete namespace oidc-keycloak-bff
```

## Common Issues

1. **Image pull errors**: Make sure Docker image is built and available
2. **PVC pending**: Check storage class and available storage
3. **Ingress not working**: Verify ingress controller is installed
4. **OIDC redirect errors**: Check redirect URIs match in Keycloak and ConfigMap

