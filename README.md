# Placement Portal

A full-stack placement portal application with Django backend and React frontend.

## Features

- User Authentication (Students, Recruiters, Admins)
- Job Posting and Management
- Job Applications
- Profile Management
- Application Status Tracking
- Job Categories
- Search and Filter Jobs

## Backend Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
Create a `.env` file in the root directory with:
```
DEBUG=True
SECRET_KEY=your-secret-key
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-specific-password
```

4. Run migrations:
```bash
python manage.py makemigrations
python manage.py migrate
```

5. Create a superuser:
```bash
python manage.py createsuperuser
```

6. Run the development server:
```bash
python manage.py runserver
```

The backend API will be available at `http://localhost:8000/api/`

## API Endpoints

### Authentication
- POST `/api/users/` - Register a new user
- GET `/api/users/me/` - Get current user profile
- PUT/PATCH `/api/users/me/` - Update current user profile

### Jobs
- GET `/api/jobs/` - List all jobs
- POST `/api/jobs/` - Create a new job (Recruiters only)
- GET `/api/jobs/{id}/` - Get job details
- PUT/PATCH `/api/jobs/{id}/` - Update job (Recruiters only)
- DELETE `/api/jobs/{id}/` - Delete job (Recruiters only)

### Categories
- GET `/api/categories/` - List all categories
- POST `/api/categories/` - Create a new category (Admin only)
- GET `/api/categories/{id}/` - Get category details
- PUT/PATCH `/api/categories/{id}/` - Update category (Admin only)
- DELETE `/api/categories/{id}/` - Delete category (Admin only)

### Applications
- GET `/api/applications/` - List user's applications
- POST `/api/applications/` - Submit a new application
- GET `/api/applications/{id}/` - Get application details
- POST `/api/applications/{id}/update_status/` - Update application status (Recruiters only)

## Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request 