# GitHub Releases Setup Guide

This guide explains how to create a GitHub Release with the large files for the Medical AI Data Generation Platform.

## 📦 Files to Include in Release

The following large files should be uploaded to GitHub Releases:

### **Individual Files:**
- `backend/brain_mri_generator.h5` (~200-500MB)
- `backend/chest_xray_generator.h5` (~200-500MB)

### **Compressed Folders:**
- `trained_synthesizers.zip` (compress `backend/trained_synthesizers/` folder)
- `eicu-demo.zip` (compress `backend/eicu-demo/` folder)

## 🚀 Step-by-Step Release Creation

### 1. **Prepare the Files**

First, create ZIP files for the large directories:

**For trained_synthesizers:**
```bash
cd backend
zip -r ../trained_synthesizers.zip trained_synthesizers/
```

**For eicu-demo:**
```bash
cd backend
zip -r ../eicu-demo.zip eicu-demo/
```

### 2. **Create GitHub Release**

1. Go to your GitHub repository: `https://github.com/uselessbruh/geng`
2. Click on **"Releases"** in the right sidebar
3. Click **"Create a new release"**
4. Fill in the details:
   - **Tag version**: `v1.0.0`
   - **Release title**: `Medical AI Models and Datasets v1.0.0`
   - **Description**: Use the template below

### 3. **Release Description Template**

```markdown
# Medical AI Data Generation Platform - Models and Datasets

This release contains the large machine learning models and datasets required for the Medical AI Data Generation Platform.

## 📦 Included Files

### **AI Models**
- `brain_mri_generator.h5` - Pre-trained GAN model for generating brain MRI images
- `chest_xray_generator.h5` - Pre-trained GAN model for generating chest X-ray images

### **Datasets and Synthesizers**
- `trained_synthesizers.zip` - Contains 25+ pre-trained data synthesizers for medical data generation
- `eicu-demo.zip` - Demo dataset based on eICU Collaborative Research Database

## 🛠️ Setup Instructions

After cloning the repository, download these files by running:

**Linux/Mac:**
```bash
chmod +x setup-models.sh
./setup-models.sh
```

**Windows:**
```cmd
setup-models.bat
```

## 📋 Manual Download

If the setup script doesn't work, manually download and extract:

1. Download all files from this release
2. Place `*.h5` files in the `backend/` directory
3. Extract `trained_synthesizers.zip` to `backend/trained_synthesizers/`
4. Extract `eicu-demo.zip` to `backend/eicu-demo/`

## ⚠️ Requirements

- Ensure you have sufficient disk space (~2-5GB total)
- Python environment with TensorFlow/Keras installed
- Node.js for the frontend application

For full setup instructions, see the main [README.md](https://github.com/uselessbruh/geng/blob/main/README.md)
```

### 4. **Upload Files**

Drag and drop or select the following files:
- `brain_mri_generator.h5`
- `chest_xray_generator.h5`
- `trained_synthesizers.zip`
- `eicu-demo.zip`

### 5. **Publish Release**

1. Choose **"Set as the latest release"**
2. Click **"Publish release"**

## ✅ After Release Creation

1. **Test the setup scripts** to ensure they work correctly
2. **Update the scripts** if the release tag or repository details change
3. **Update README** with correct download links

## 🔄 Future Updates

When updating models or datasets:

1. Create a new release (e.g., `v1.1.0`)
2. Update the `RELEASE_TAG` in both setup scripts
3. Upload new/updated files
4. Update the release description

## 📝 Notes

- GitHub allows files up to 2GB per file in releases
- Releases are perfect for binary files like ML models
- Users can download specific files or the entire release
- This keeps the main repository lightweight and fast to clone
