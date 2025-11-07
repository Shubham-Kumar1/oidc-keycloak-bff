#!/bin/bash

# Rebuild Docker image for AMD64 architecture (Kubernetes cluster)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
WEB_DIR="$PROJECT_ROOT/web"

# Configuration
IMAGE_NAME="${IMAGE_NAME:-oidc-keycloak-bff-web}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
REGISTRY="${REGISTRY:-kumarshubham16}"

# Build full image name
FULL_IMAGE_NAME="$REGISTRY/$IMAGE_NAME:$IMAGE_TAG"

echo "🔨 Building Docker image for AMD64 architecture: $FULL_IMAGE_NAME"
cd "$WEB_DIR"

# Build for AMD64 platform (Linux/amd64)
docker buildx build --platform linux/amd64 -t "$FULL_IMAGE_NAME" --load .

echo "📤 Pushing image to registry..."
docker push "$FULL_IMAGE_NAME"

echo "✅ Build and push complete!"
echo ""
echo "Image: $FULL_IMAGE_NAME"
echo ""
echo "To update Kubernetes deployment:"
echo "  kubectl rollout restart deployment/web-app -n oidc-keycloak-bff"

