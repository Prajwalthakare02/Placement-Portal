# AI-Enabled Placement Portal

A comprehensive placement portal with AI features to help students prepare for and find their dream jobs. The portal includes features like resume parsing, placement prediction, and an AI chatbot for interview preparation.

## Features

- **AI-Powered Placement Prediction**: Uses machine learning to predict placement chances based on student profiles
- **Resume Parsing**: Automatically extracts information from uploaded resumes
- **Interview Preparation Chatbot**: AI-powered chatbot for company-specific interview preparation
- **Job Listings**: Browse and apply for jobs from various companies
- **Profile Management**: Students can manage their profiles and track applications
- **Admin Dashboard**: For managing companies, job postings, and applications

## Tech Stack

### Frontend
- React.js
- Redux for state management
- Tailwind CSS for styling
- Vite for build tooling

### Backend
- Django
- Django REST Framework
- Machine Learning (scikit-learn, XGBoost)
- Natural Language Processing for resume parsing

## Setup Instructions

### Backend Setup
1. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run migrations:
   ```bash
   python manage.py migrate
   ```

4. Start the server:
   ```bash
   python manage.py runserver
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

Create a `.env` file in the root directory with the following variables:
```
DEBUG=True
SECRET_KEY=your_secret_key
DATABASE_URL=your_database_url
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 