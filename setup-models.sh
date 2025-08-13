#!/bin/bash
# setup-models.sh - Download large files from GitHub Releases

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
REPO_OWNER="uselessbruh"
REPO_NAME="geng"
RELEASE_TAG="v1.0.0"  # Update this when you create the release

echo -e "${YELLOW}Setting up Medical AI Data Generation Platform...${NC}"
echo "Downloading large files from GitHub Releases..."

# Create backend directory if it doesn't exist
mkdir -p backend

# Download brain MRI generator model
echo -e "${YELLOW}Downloading brain MRI generator model...${NC}"
curl -L -o backend/brain_mri_generator.h5 \
  "https://github.com/${REPO_OWNER}/${REPO_NAME}/releases/download/${RELEASE_TAG}/brain_mri_generator.h5"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Brain MRI generator downloaded successfully${NC}"
else
    echo -e "${RED}✗ Failed to download brain MRI generator${NC}"
fi

# Download chest X-ray generator model
echo -e "${YELLOW}Downloading chest X-ray generator model...${NC}"
curl -L -o backend/chest_xray_generator.h5 \
  "https://github.com/${REPO_OWNER}/${REPO_NAME}/releases/download/${RELEASE_TAG}/chest_xray_generator.h5"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Chest X-ray generator downloaded successfully${NC}"
else
    echo -e "${RED}✗ Failed to download chest X-ray generator${NC}"
fi

# Download trained synthesizers
echo -e "${YELLOW}Downloading trained synthesizers...${NC}"
curl -L -o trained_synthesizers.zip \
  "https://github.com/${REPO_OWNER}/${REPO_NAME}/releases/download/${RELEASE_TAG}/trained_synthesizers.zip"

if [ $? -eq 0 ]; then
    echo -e "${YELLOW}Extracting trained synthesizers...${NC}"
    unzip -q trained_synthesizers.zip -d backend/
    rm trained_synthesizers.zip
    echo -e "${GREEN}✓ Trained synthesizers downloaded and extracted${NC}"
else
    echo -e "${RED}✗ Failed to download trained synthesizers${NC}"
fi

# Download eICU demo dataset
echo -e "${YELLOW}Downloading eICU demo dataset...${NC}"
curl -L -o eicu-demo.zip \
  "https://github.com/${REPO_OWNER}/${REPO_NAME}/releases/download/${RELEASE_TAG}/eicu-demo.zip"

if [ $? -eq 0 ]; then
    echo -e "${YELLOW}Extracting eICU demo dataset...${NC}"
    unzip -q eicu-demo.zip -d backend/
    rm eicu-demo.zip
    echo -e "${GREEN}✓ eICU demo dataset downloaded and extracted${NC}"
else
    echo -e "${RED}✗ Failed to download eICU demo dataset${NC}"
fi

echo -e "${GREEN}Setup complete! All large files have been downloaded.${NC}"
echo -e "${YELLOW}You can now run the application following the README instructions.${NC}"
