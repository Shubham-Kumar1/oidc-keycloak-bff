clea#!/bin/bash

# Build Docker image and deploy to Kubernetes

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
WEB_DIR="$PROJECT_ROOT/web"

# Configuration
IMAGE_NAME="${IMAGE_NAME:-oidc-keycloak-bff-web}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
REGISTRY="${REGISTRY:-}"

# Build full image name
if [ -n "$REGISTRY" ]; then
    FULL_IMAGE_NAME="$REGISTRY/$IMAGE_NAME:$IMAGE_TAG"
else
    FULL_IMAGE_NAME="$IMAGE_NAME:$IMAGE_TAG"
fi

echo "🔨 Building Docker image: $FULL_IMAGE_NAME"
cd "$WEB_DIR"

# Build the image
docker build -t "$FULL_IMAGE_NAME" .

# If registry is provided, push the image
if [ -n "$REGISTRY" ]; then
    echo "📤 Pushing image to registry..."
    docker push "$FULL_IMAGE_NAME"
    
    # Update the deployment file with the new image
    echo "📝 Updating deployment with image: $FULL_IMAGE_NAME"
    cd "$SCRIPT_DIR"
    sed -i.bak "s|image:.*|image: $FULL_IMAGE_NAME|" web-deployment.yaml
    rm -f web-deployment.yaml.bak
fi

echo "✅ Build complete!"
echo ""
echo "🚀 To deploy to Kubernetes:"
echo "  cd $SCRIPT_DIR"
echo "  ./deploy.sh"
echo ""
echo "Or manually:"
echo "  kubectl apply -k $SCRIPT_DIR"

