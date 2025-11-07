# Kubernetes Deployment Guide

This directory contains Kubernetes manifests for deploying the OIDC Keycloak BFF application.

## Prerequisites

1. **Kubernetes Cluster**: A running Kubernetes cluster (v1.24+)
2. **kubectl**: Configured to access your cluster
3. **Docker**: For building the Next.js application image
4. **Ingress Controller**: NGINX Ingress Controller or similar (for external access)

## Architecture

The deployment consists of:
- **PostgreSQL**: Database for Keycloak
- **Keycloak**: Identity and Access Management server
- **Next.js Web App**: Backend-for-Frontend application

## Quick Start

### 1. Build and Push Docker Image

First, build the Next.js application Docker image:

```bash
cd web
docker build -t <your-registry>/oidc-keycloak-bff-web:latest .
docker push <your-registry>/oidc-keycloak-bff-web:latest
```

Update the image reference in `web-deployment.yaml`:

```yaml
image: <your-registry>/oidc-keycloak-bff-web:latest
```

### 2. Configure Secrets

**IMPORTANT**: Update `secrets.yaml` with secure values:

```bash
# Generate a secure session password
openssl rand -base64 32

# Edit secrets.yaml and update:
# - POSTGRES_PASSWORD
# - KEYCLOAK_ADMIN_PASSWORD
# - KC_DB_PASSWORD
# - OIDC_CLIENT_SECRET
# - SESSION_PASSWORD
```

### 3. Update Configuration

Edit `configmap.yaml` and update:
- `OIDC_ISSUER_URL`: Should point to your Keycloak service
- `OIDC_REDIRECT_URI`: Should match your application URL
- `BASE_URL`: Should match your application URL
- `KEYCLOAK_EXTERNAL_URL`: Hostname the browser should use to reach Keycloak (ingress, load balancer, or port-forward)

### 4. Update Ingress

Edit `ingress.yaml` and update:
- `host`: Replace `keycloak.local` and `app.local` with your actual domains
- `ingressClassName`: Adjust based on your ingress controller

### 5. Deploy

#### Option A: Using kubectl

```bash
# Apply all manifests
kubectl apply -f namespace.yaml
kubectl apply -f configmap.yaml
kubectl apply -f secrets.yaml
kubectl apply -f pvc.yaml
kubectl apply -f postgres-deployment.yaml
kubectl apply -f keycloak-deployment.yaml
kubectl apply -f web-deployment.yaml
kubectl apply -f ingress.yaml
```

#### Option B: Using kustomize

```bash
kubectl apply -k .
```

### 6. Verify Deployment

```bash
# Check all pods are running
kubectl get pods -n oidc-keycloak-bff

# Check services
kubectl get svc -n oidc-keycloak-bff

# Check ingress
kubectl get ingress -n oidc-keycloak-bff
```

### 7. Access the Application

After deployment, access:
- **Keycloak Admin Console**: `https://keycloak.shubham.it.com` (or your configured domain)
- **Web Application**: `https://app.shubham.it.com` (or your configured domain)

## Configuration Details

### Environment Variables

#### PostgreSQL
- `POSTGRES_DB`: Database name (default: keycloak)
- `POSTGRES_USER`: Database user (default: keycloak)
- `POSTGRES_PASSWORD`: Database password (from secrets)

#### Keycloak
- `KEYCLOAK_ADMIN`: Admin username (default: admin)
- `KEYCLOAK_ADMIN_PASSWORD`: Admin password (from secrets)
- `KC_DB_URL`: Database connection URL
- `KC_DB_USERNAME`: Database username
- `KC_DB_PASSWORD`: Database password (from secrets)

#### Next.js Web App
- `OIDC_ISSUER_URL`: Keycloak realm issuer URL
- `OIDC_CLIENT_ID`: OIDC client ID
- `OIDC_CLIENT_SECRET`: OIDC client secret (from secrets)
- `OIDC_REDIRECT_URI`: OAuth callback URL
- `SESSION_PASSWORD`: Session encryption password (from secrets)
- `BASE_URL`: Base URL of the application
- `KEYCLOAK_EXTERNAL_URL`: Public URL the browser uses to reach Keycloak

### Persistent Volumes

- **PostgreSQL**: 10Gi storage for database data
- **Keycloak**: 5Gi storage for Keycloak data

Adjust storage sizes in `pvc.yaml` based on your needs.

### Resource Limits

Default resource requests/limits:
- **PostgreSQL**: 256Mi-512Mi memory, 250m-500m CPU
- **Keycloak**: 512Mi-2Gi memory, 500m-2000m CPU
- **Web App**: 256Mi-512Mi memory, 250m-500m CPU

Adjust in respective deployment files as needed.

## Post-Deployment Setup

### 1. Configure Keycloak Realm

1. Access Keycloak Admin Console
2. Create or import the `oidc-demo` realm
3. Configure the client:
   - Client ID: `next-bff`
   - Client Protocol: `openid-connect`
   - Access Type: `confidential`
   - Valid Redirect URIs: `https://app.shubham.it.com/api/auth/callback` (update with your domain)
  - Valid Post Logout Redirect URIs: `https://app.shubham.it.com/*`
  - Web Origins: `https://app.shubham.it.com`

### 2. Update OIDC Configuration

After Keycloak is configured, update the ConfigMap with the correct:
- `OIDC_ISSUER_URL`: Should match Keycloak's issuer (e.g., `https://keycloak.shubham.it.com/realms/oidc-demo`)
- `OIDC_REDIRECT_URI`: Should match your application's callback URL
- `BASE_URL`: Should match your application's base URL

### 3. Restart Web App

After updating configuration:

```bash
kubectl rollout restart deployment/web-app -n oidc-keycloak-bff
```

## Troubleshooting

### Check Pod Logs

```bash
# PostgreSQL logs
kubectl logs -f deployment/postgres -n oidc-keycloak-bff

# Keycloak logs
kubectl logs -f deployment/keycloak -n oidc-keycloak-bff

# Web app logs
kubectl logs -f deployment/web-app -n oidc-keycloak-bff
```

### Check Pod Status

```bash
kubectl describe pod <pod-name> -n oidc-keycloak-bff
```

### Common Issues

1. **Pods not starting**: Check resource limits and PVC availability
2. **Keycloak can't connect to PostgreSQL**: Verify service name and network policies
3. **Web app can't connect to Keycloak**: Verify OIDC_ISSUER_URL and service names
4. **Ingress not working**: Check ingress controller and host configuration

## Scaling

To scale the web application:

```bash
kubectl scale deployment/web-app --replicas=3 -n oidc-keycloak-bff
```

**Note**: PostgreSQL and Keycloak are currently configured as single replicas. For production, consider:
- PostgreSQL: Use a managed database service or StatefulSet with replication
- Keycloak: Configure for high availability with multiple instances

## Production Considerations

1. **Secrets Management**: Use a secrets management system (e.g., Sealed Secrets, External Secrets Operator)
2. **TLS/HTTPS**: Configure TLS certificates for ingress
3. **Database**: Use a managed PostgreSQL service or configure replication
4. **Monitoring**: Set up monitoring and logging (Prometheus, Grafana, ELK)
5. **Backup**: Configure regular backups for PostgreSQL
6. **Network Policies**: Implement network policies for security
7. **Resource Quotas**: Set appropriate resource quotas for the namespace
8. **High Availability**: Configure multiple replicas with proper session storage

## Cleanup

To remove all resources:

```bash
kubectl delete namespace oidc-keycloak-bff
```

Or using kustomize:

```bash
kubectl delete -k .
```

## Additional Resources

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Keycloak Documentation](https://www.keycloak.org/documentation)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

