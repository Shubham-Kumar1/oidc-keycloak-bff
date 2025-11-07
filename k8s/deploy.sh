#!/bin/bash

# Deployment script for OIDC Keycloak BFF on Kubernetes

set -e

NAMESPACE="oidc-keycloak-bff"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🚀 Deploying OIDC Keycloak BFF to Kubernetes..."

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl is not installed or not in PATH"
    exit 1
fi

# Check if cluster is accessible
if ! kubectl cluster-info &> /dev/null; then
    echo "❌ Cannot access Kubernetes cluster"
    exit 1
fi

cd "$SCRIPT_DIR"

echo "📦 Creating namespace..."
kubectl apply -f namespace.yaml

echo "🔧 Applying ConfigMaps..."
kubectl apply -f configmap.yaml

echo "🔐 Applying Secrets..."
kubectl apply -f secrets.yaml

echo "💾 Creating PersistentVolumeClaims..."
kubectl apply -f pvc.yaml

echo "🐘 Deploying PostgreSQL..."
kubectl apply -f postgres-deployment.yaml

echo "⏳ Waiting for PostgreSQL to be ready..."
kubectl wait --for=condition=ready pod -l app=postgres -n "$NAMESPACE" --timeout=300s

echo "🔑 Deploying Keycloak..."
kubectl apply -f keycloak-deployment.yaml

echo "⏳ Waiting for Keycloak to be ready..."
kubectl wait --for=condition=ready pod -l app=keycloak -n "$NAMESPACE" --timeout=600s

echo "🌐 Deploying Web Application..."
kubectl apply -f web-deployment.yaml

echo "⏳ Waiting for Web App to be ready..."
kubectl wait --for=condition=ready pod -l app=web-app -n "$NAMESPACE" --timeout=300s

echo "🌍 Creating Ingress..."
kubectl apply -f ingress.yaml

echo "✅ Deployment complete!"
echo ""
echo "📊 Checking deployment status..."
kubectl get all -n "$NAMESPACE"

echo ""
echo "🔍 To check logs:"
echo "  kubectl logs -f deployment/web-app -n $NAMESPACE"
echo "  kubectl logs -f deployment/keycloak -n $NAMESPACE"
echo "  kubectl logs -f deployment/postgres -n $NAMESPACE"
echo ""
echo "🌐 To access services:"
echo "  kubectl port-forward -n $NAMESPACE svc/keycloak-service 8080:8080"
echo "  kubectl port-forward -n $NAMESPACE svc/web-service 3000:3000"

