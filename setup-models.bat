@echo off
REM setup-models.bat - Download large files from GitHub Releases (Windows)

echo Setting up Medical AI Data Generation Platform...
echo Downloading large files from GitHub Releases...

REM Configuration
set REPO_OWNER=uselessbruh
set REPO_NAME=geng
set RELEASE_TAG=v1.0.0

REM Create backend directory if it doesn't exist
if not exist "backend" mkdir backend

REM Download brain MRI generator model
echo Downloading brain MRI generator model...
curl -L -o backend/brain_mri_generator.h5 "https://github.com/%REPO_OWNER%/%REPO_NAME%/releases/download/%RELEASE_TAG%/brain_mri_generator.h5"
if %errorlevel% equ 0 (
    echo [32m✓ Brain MRI generator downloaded successfully[0m
) else (
    echo [31m✗ Failed to download brain MRI generator[0m
)

REM Download chest X-ray generator model
echo Downloading chest X-ray generator model...
curl -L -o backend/chest_xray_generator.h5 "https://github.com/%REPO_OWNER%/%REPO_NAME%/releases/download/%RELEASE_TAG%/chest_xray_generator.h5"
if %errorlevel% equ 0 (
    echo [32m✓ Chest X-ray generator downloaded successfully[0m
) else (
    echo [31m✗ Failed to download chest X-ray generator[0m
)

REM Download trained synthesizers
echo Downloading trained synthesizers...
curl -L -o trained_synthesizers.zip "https://github.com/%REPO_OWNER%/%REPO_NAME%/releases/download/%RELEASE_TAG%/trained_synthesizers.zip"
if %errorlevel% equ 0 (
    echo Extracting trained synthesizers...
    powershell -command "Expand-Archive -Path 'trained_synthesizers.zip' -DestinationPath 'backend/' -Force"
    del trained_synthesizers.zip
    echo [32m✓ Trained synthesizers downloaded and extracted[0m
) else (
    echo [31m✗ Failed to download trained synthesizers[0m
)

REM Download eICU demo dataset
echo Downloading eICU demo dataset...
curl -L -o eicu-demo.zip "https://github.com/%REPO_OWNER%/%REPO_NAME%/releases/download/%RELEASE_TAG%/eicu-demo.zip"
if %errorlevel% equ 0 (
    echo Extracting eICU demo dataset...
    powershell -command "Expand-Archive -Path 'eicu-demo.zip' -DestinationPath 'backend/' -Force"
    del eicu-demo.zip
    echo [32m✓ eICU demo dataset downloaded and extracted[0m
) else (
    echo [31m✗ Failed to download eICU demo dataset[0m
)

echo Setup complete! All large files have been downloaded.
echo You can now run the application following the README instructions.
pause
