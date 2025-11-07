#!/bin/bash

# Script to tag and push Docker image to registry

set -e

IMAGE_NAME="oidc-keycloak-bff-web"
VERSION="${1:-latest}"
REGISTRY="${2:-}"

if [ -z "$REGISTRY" ]; then
    echo "Usage: $0 [version] [registry]"
    echo ""
    echo "Examples:"
    echo "  $0 latest docker.io/username"
    echo "  $0 v1.0.0 ghcr.io/username"
    echo "  $0 latest registry.example.com"
    echo ""
    echo "Current image tags:"
    docker images | grep "$IMAGE_NAME" || echo "No images found"
    exit 1
fi

FULL_IMAGE_NAME="$REGISTRY/$IMAGE_NAME:$VERSION"

echo "📦 Tagging image: $IMAGE_NAME:latest -> $FULL_IMAGE_NAME"
docker tag "$IMAGE_NAME:latest" "$FULL_IMAGE_NAME"

echo "📤 Pushing image to registry..."
docker push "$FULL_IMAGE_NAME"

echo "✅ Image pushed successfully!"
echo ""
echo "To update Kubernetes deployment, update web-deployment.yaml:"
echo "  image: $FULL_IMAGE_NAME"

