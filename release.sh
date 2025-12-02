#!/bin/sh
set -e

IMAGE_NAME="oleg-nextjs-app"
TAR_NAME="${IMAGE_NAME}.tar"

echo "🚀 Building optimized Next.js app and Docker image..."

# Convert images to WebP and build optimized app
echo "📦 Converting images to WebP and building app with Vite..."
yarn build:optimize

echo "🐳 Building optimized Docker image..."
# Build Docker image with caching for faster builds
docker build -t $IMAGE_NAME .

# Show image size
echo "📊 Image size:"
docker images $IMAGE_NAME --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"

# Save Docker image to tar file
echo "💾 Exporting image to tar..."
docker save $IMAGE_NAME -o $TAR_NAME

# Show file sizes and savings
echo "📈 Final results:"
echo "Tar file size: $(du -h $TAR_NAME | cut -f1)"
echo "✅ Docker image saved as $TAR_NAME"
echo "🚀 Ready to upload to Plesk!"

# Cleanup old images to save space
echo "🧹 Cleaning up old images..."
docker image prune -f

echo "✨ All done! Your optimized website is ready for deployment."
