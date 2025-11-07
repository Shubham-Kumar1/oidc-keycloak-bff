#!/bin/bash

# Cleanup script for OIDC Keycloak BFF from Kubernetes

set -e

NAMESPACE="oidc-keycloak-bff"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🧹 Cleaning up OIDC Keycloak BFF from Kubernetes..."

cd "$SCRIPT_DIR"

# Check if namespace exists
if ! kubectl get namespace "$NAMESPACE" &> /dev/null; then
    echo "ℹ️  Namespace $NAMESPACE does not exist. Nothing to clean up."
    exit 0
fi

# Delete all resources
echo "🗑️  Deleting all resources in namespace $NAMESPACE..."
kubectl delete -k . --ignore-not-found=true

# Wait for namespace deletion
echo "⏳ Waiting for namespace deletion..."
kubectl delete namespace "$NAMESPACE" --ignore-not-found=true

echo "✅ Cleanup complete!"

