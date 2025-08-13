# 🏥 Medical AI Data Generation Platform

A comprehensive full-stack web application for generating synthetic medical data, managing patient information, and conducting medical literature reviews. This platform combines advanced AI models with intuitive user interfaces to support medical research and AI development.

## 🌟 Features

### 🔬 Synthetic Medical Data Generation

- **25+ Medical Data Types**: Generate synthetic data for patient demographics, medications, lab results, vital signs, care plans, and more
- **Quality Validation**: Built-in data quality assessment using Synthetic Data Vault (SDV)
- **Customizable Parameters**: Adjust data generation parameters to meet specific research needs
- **Batch Processing**: Generate large datasets efficiently

### 🖼️ Medical Image Generation

- **X-Ray Images**: AI-generated chest X-ray images using GAN models
- **MRI Scans**: AI-generated brain MRI images
- **Batch Download**: Generate and download multiple images as ZIP files
- **High Quality**: Realistic medical images suitable for research and training

### 📚 Literature Research

- **PubMed Integration**: Search and access medical literature
- **AI Summarization**: Automatic paper summarization using BART models
- **Research Management**: Organize and review medical papers
- **Citation Support**: Easy access to research citations

### 🔐 Security & Authentication

- **Firebase Authentication**: Secure user registration and login
- **Protected Routes**: Role-based access control
- **Session Management**: Persistent user sessions
- **Data Privacy**: Secure handling of sensitive medical data

## 🏗️ Architecture

### Frontend (React)

```text
frontend/
├── src/
│   ├── Auth/                 # User authentication components
│   ├── DataGeneration/       # Synthetic data generation modules
│   │   ├── PatientInfo/      # Patient demographics
│   │   ├── DiaAndCond/       # Diagnosis and conditions
│   │   ├── MediAndTreat/     # Medications and treatments
│   │   ├── CareAndNurse/     # Care plans and nursing data
│   │   ├── VitalAndObv/      # Vital signs and observations
│   │   ├── InAndOut/         # Intake/output data
│   │   └── DataValidation/   # Data quality validation
│   ├── XRayData/             # X-ray image generation
│   ├── MRIData/              # MRI image generation
│   ├── LiteratureReview/     # Academic paper search
│   └── components/           # Shared UI components
└── public/                   # Static assets
```

### Backend (Flask)

```text
backend/
├── app.py                    # Main Flask application
├── search.py                 # Search functionality
├── brain_mri_generator.h5    # Pre-trained MRI generator
├── chest_xray_generator.h5   # Pre-trained X-ray generator
├── trained_synthesizers/     # 25+ data synthesizers
└── eicu-demo/               # Sample medical dataset (32 data types)
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **Python** (v3.8 or higher)
- **Git**

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/uselessbruh/geng.git
cd geng
```

2. **Download Large Files (Models and Datasets)**

The ML models and datasets are stored in GitHub Releases due to their size. Run the setup script to download them:

**For Linux/Mac:**
```bash
chmod +x setup-models.sh
./setup-models.sh
```

**For Windows:**
```cmd
setup-models.bat
```

*Alternatively, you can manually download from the [Releases page](https://github.com/uselessbruh/geng/releases) and extract to the `backend/` directory.*

3. **Backend Setup**

```bash
cd backend
pip install -r requirements.txt
```

4. **Frontend Setup**

```bash
cd frontend
npm install
```

### Running the Application

1. **Start the Backend Server**

```bash
cd backend
python app.py
```

The backend will run on `http://localhost:6002`

2. **Start the Frontend Development Server**

```bash
cd frontend
npm start
```

The frontend will run on `http://localhost:3000`

## 📋 API Endpoints

### Data Generation

- `POST /generate` - Generate synthetic medical data
- `GET /tables` - List available data types
- `POST /evaluate` - Evaluate data quality

### Medical Imaging

- `GET /xray_generate?count=N` - Generate N X-ray images
- `GET /mri_generate?count=N` - Generate N MRI images

### Literature Search

- `POST /search` - Search PubMed literature
- `POST /summarize` - Summarize research papers

## 🛠️ Technology Stack

### Frontend

- **React 19** - Modern UI framework
- **React Router DOM** - Client-side routing
- **Firebase** - Authentication and hosting
- **Chart.js & Recharts** - Data visualization
- **Axios** - HTTP client

### Backend

- **Flask** - Python web framework
- **TensorFlow/Keras** - Deep learning models
- **SDV (Synthetic Data Vault)** - Data generation and validation
- **Transformers** - NLP models for summarization
- **Pandas & NumPy** - Data manipulation
- **Flask-CORS** - Cross-origin resource sharing

### AI Models

- **GAN Models** - For medical image generation
- **BART** - For text summarization
- **Custom Synthesizers** - For medical data generation

## 📊 Available Medical Data Types

The platform supports generation of 25+ medical data types including:

- **Patient Information**: Demographics, admission data
- **Clinical Data**: Diagnoses, conditions, allergies
- **Medications**: Drug administration, infusion data
- **Laboratory**: Lab results, microbiology data
- **Vital Signs**: Periodic and aperiodic measurements
- **Care Plans**: General care, infectious disease protocols
- **Nursing Data**: Assessments, care notes, charting
- **Procedures**: Physical exams, respiratory care
- **Treatment**: Medical treatments and interventions

## 🔬 Use Cases

### Medical Research

- Generate synthetic datasets for research studies
- Protect patient privacy while maintaining data utility
- Create control datasets for comparative studies

### AI/ML Development

- Train machine learning models with synthetic data
- Augment existing datasets
- Test model robustness with diverse synthetic samples

### Healthcare Analytics

- Develop and test healthcare analytics tools
- Prototype new medical applications
- Conduct data quality assessments

### Education & Training

- Create realistic datasets for medical education
- Train healthcare professionals with synthetic cases
- Develop medical simulation scenarios

## 📈 Data Quality & Validation

The platform includes comprehensive data quality assessment tools:

- **Statistical Similarity**: Compare distributions between real and synthetic data
- **Privacy Metrics**: Ensure synthetic data doesn't leak sensitive information
- **Utility Metrics**: Validate that synthetic data maintains analytical utility
- **Diagnostic Reports**: Automated quality assessment reports

## 🔒 Privacy & Compliance

- **Data Anonymization**: All generated data is synthetic and non-identifiable
- **Secure Authentication**: Firebase-based user management
- **Privacy-First Design**: No real patient data is stored or transmitted
- **Compliance Ready**: Designed with HIPAA considerations in mind

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, questions, or feature requests, please create an issue in the repository or contact the development team.

## 🙏 Acknowledgments

- **eICU Collaborative Research Database** - For providing the demo dataset
- **Synthetic Data Vault** - For data generation and validation tools
- **Hugging Face Transformers** - For NLP model integration
- **Firebase** - For authentication and hosting services

---

**Note**: This platform generates synthetic medical data for research and development purposes. It should not be used for actual patient care or clinical decision-making.
