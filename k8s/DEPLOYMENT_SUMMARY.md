# Kubernetes Deployment Summary

## Overview

This directory contains a complete Kubernetes deployment configuration for the OIDC Keycloak BFF application. The deployment includes:

- **PostgreSQL** (Database for Keycloak)
- **Keycloak** (Identity Provider)
- **Next.js Web Application** (BFF)

## File Structure

```
k8s/
├── namespace.yaml              # Kubernetes namespace
├── configmap.yaml              # Non-sensitive configuration
├── secrets.yaml                # Sensitive data (passwords, secrets)
├── pvc.yaml                    # Persistent volume claims
├── postgres-deployment.yaml    # PostgreSQL deployment and service
├── keycloak-deployment.yaml    # Keycloak deployment and service
├── web-deployment.yaml         # Next.js web app deployment and service
├── ingress.yaml                # Ingress for external access
├── kustomization.yaml          # Kustomize configuration
├── deploy.sh                   # Deployment script
├── build-and-deploy.sh         # Build and deploy script
├── cleanup.sh                  # Cleanup script
├── values.yaml.example         # Example values for customization
├── README.md                   # Detailed deployment guide
├── QUICKSTART.md               # Quick start guide
└── DEPLOYMENT_SUMMARY.md       # This file
```

## Key Components

### 1. Namespace
- Creates isolated namespace: `oidc-keycloak-bff`

### 2. ConfigMaps
- Stores non-sensitive configuration
- Database settings
- Keycloak settings
- OIDC configuration
- Application URLs

### 3. Secrets
- **IMPORTANT**: Update before deployment!
- Database passwords
- Keycloak admin password
- OIDC client secret
- Session encryption password

### 4. Persistent Volumes
- PostgreSQL: 10Gi storage
- Keycloak: 5Gi storage

### 5. Deployments
- **PostgreSQL**: Single replica, persistent storage
- **Keycloak**: Single replica, health checks, init container for DB wait
- **Web App**: 2 replicas (scalable), health checks

### 6. Services
- All services use ClusterIP (internal access)
- External access via Ingress

### 7. Ingress
- Configures external access
- Separate hosts for Keycloak and Web App
- NGINX Ingress Controller compatible

## Deployment Steps

1. **Build Docker Image**
   ```bash
   cd web
   docker build -t oidc-keycloak-bff-web:latest .
   ```

2. **Update Secrets**
   ```bash
   # Edit k8s/secrets.yaml with secure passwords
   ```

3. **Update Configuration**
   ```bash
   # Edit k8s/configmap.yaml with your URLs
   # Edit k8s/ingress.yaml with your domains
   ```

4. **Deploy**
   ```bash
   cd k8s
   ./deploy.sh
   ```

5. **Configure Keycloak**
   - Access Keycloak Admin Console
   - Create/import realm
   - Configure OIDC client

## Configuration Points

### Must Update Before Deployment:

1. **secrets.yaml**
   - All passwords
   - Session encryption key

2. **configmap.yaml**
   - `OIDC_REDIRECT_URI`: Your callback URL
   - `BASE_URL`: Your application URL

3. **ingress.yaml**
   - Host names
   - Ingress class name

4. **web-deployment.yaml**
   - Docker image name/registry

## Resource Requirements

### Minimum Requirements:
- **CPU**: ~1.5 cores total
- **Memory**: ~1.5GB total
- **Storage**: ~15GB (10GB PostgreSQL + 5GB Keycloak)

### Recommended for Production:
- **CPU**: ~3 cores total
- **Memory**: ~3GB total
- **Storage**: 20GB+ with backups

## Network Architecture

```
Internet
  ↓
Ingress Controller
  ↓
┌─────────────────┬─────────────────┐
│  Keycloak       │  Web App        │
│  Service        │  Service        │
│  :8080          │  :3000          │
└────────┬────────┴────────┬────────┘
         │                 │
    ┌────▼────┐      ┌─────▼─────┐
    │Keycloak │      │  Web App  │
    │  Pod    │      │   Pods    │
    └────┬────┘      └───────────┘
         │
    ┌────▼────┐
    │Postgres │
    │ Service │
    │  :5432  │
    └────┬────┘
         │
    ┌────▼────┐
    │Postgres │
    │   Pod   │
    └─────────┘
```

## Security Considerations

1. **Secrets Management**: Use proper secrets management in production
2. **TLS/HTTPS**: Configure TLS certificates for ingress
3. **Network Policies**: Implement network policies for pod communication
4. **Resource Limits**: All deployments have resource limits configured
5. **Non-root User**: Web app runs as non-root user
6. **Health Checks**: All deployments have liveness and readiness probes

## Scaling

### Horizontal Scaling:
- **Web App**: Already configured with 2 replicas, can scale to N
- **Keycloak**: Can be scaled but requires shared session storage
- **PostgreSQL**: Use managed service or StatefulSet with replication

### Vertical Scaling:
- Adjust resource requests/limits in deployment files

## Monitoring

### Health Checks:
- All pods have liveness and readiness probes
- Keycloak has health endpoints enabled

### Logs:
```bash
kubectl logs -f deployment/web-app -n oidc-keycloak-bff
kubectl logs -f deployment/keycloak -n oidc-keycloak-bff
kubectl logs -f deployment/postgres -n oidc-keycloak-bff
```

## Backup & Recovery

### PostgreSQL:
- PVC contains database data
- Backup PVC or use database backup tools

### Keycloak:
- Realm configuration can be exported
- Import via Admin Console

## Troubleshooting

See `QUICKSTART.md` for common issues and solutions.

## Cleanup

```bash
cd k8s
./cleanup.sh
```

Or:
```bash
kubectl delete namespace oidc-keycloak-bff
```

## Next Steps

1. Review and update all configuration files
2. Build and push Docker image to registry
3. Deploy to cluster
4. Configure Keycloak realm and client
5. Test authentication flow
6. Set up monitoring and logging
7. Configure backups
8. Implement production security measures

## Support

For issues or questions:
- Check `README.md` for detailed documentation
- Check `QUICKSTART.md` for quick reference
- Review pod logs for errors
- Check Kubernetes events: `kubectl get events -n oidc-keycloak-bff`

