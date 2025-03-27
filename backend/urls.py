"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from users.views import user_login_view, user_register_view, update_profile_view, parse_resume
from jobs.views import (
    JobViewSet, CategoryViewSet, CompanyViewSet, job_search_view, 
    get_admin_jobs_view, get_companies_view, create_company_view, create_job_view,
    get_categories_view, debug_view, JobCreateView, JobUpdateView, JobDeleteView,
    JobListView, UserJobListView, JobDetailView, get_job_applicants, get_all_jobs,
    apply_to_job, get_user_applications
)
from applications.views import ApplicationViewSet, get_applications_view
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.contrib.auth import get_user_model
import json
from prediction.views import predict_placement

User = get_user_model()

router = DefaultRouter()
router.register(r'jobs', JobViewSet)
router.register(r'categories', CategoryViewSet)
router.register(r'applications', ApplicationViewSet, basename='application')
router.register(r'companies', CompanyViewSet)

# Simple user creation endpoint for testing
@csrf_exempt
def create_test_user(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username')
            email = data.get('email')
            password = data.get('password')
            
            if not username or not email or not password:
                return JsonResponse({
                    'success': False,
                    'error': 'Username, email and password are required'
                }, status=400)
            
            # Check if user exists
            if User.objects.filter(username=username).exists():
                return JsonResponse({
                    'success': False,
                    'error': 'Username already exists'
                }, status=400)
            
            # Create user
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                user_type='student'
            )
            
            return JsonResponse({
                'success': True,
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'userType': user.user_type
                }
            })
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            }, status=500)
    
    return JsonResponse({
        'success': False,
        'error': 'Only POST method is allowed'
    }, status=405)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api-auth/', include('rest_framework.urls')),
    
    # API v1 endpoints for frontend
    path('api/v1/job/get', csrf_exempt(job_search_view), name='job_search'),
    path('api/v1/job/search', csrf_exempt(job_search_view), name='job_search_alt'),  # Alternate URL
    path('api/v1/user/register', csrf_exempt(user_register_view), name='user_register'),
    path('api/v1/user/login', csrf_exempt(user_login_view), name='user_login'),
    
    # Test endpoint for debugging
    path('api/test/create-user', create_test_user, name='create_test_user'),
    
    # New endpoints for applications and profile
    path('api/v1/application/get', csrf_exempt(get_applications_view), name='get_applications'),
    path('api/v1/user/profile/update', csrf_exempt(update_profile_view), name='update_profile'),
    
    # Job endpoints
    path('api/v1/job/getadminjobs', csrf_exempt(get_admin_jobs_view), name='get_admin_jobs'),
    path('api/v1/job/create', JobCreateView.as_view(), name='job_create'),
    path('api/v1/job/update/<int:pk>', JobUpdateView.as_view(), name='job_update'),
    path('api/v1/job/delete/<int:pk>', JobDeleteView.as_view(), name='job_delete'),
    path('api/v1/job/list', JobListView.as_view(), name='job_list'),
    path('api/v1/job/user/<int:user_id>', UserJobListView.as_view(), name='user_job_list'),
    path('api/v1/job/<int:pk>', JobDetailView.as_view(), name='job_detail'),
    path('api/v1/job/<int:job_id>/applicants', get_job_applicants, name='job_applicants'),
    path('api/v1/job/get', get_all_jobs, name='get_all_jobs'),
    
    # Company endpoints
    path('api/v1/company/get', csrf_exempt(get_companies_view), name='get_companies'),
    path('api/v1/company/create', csrf_exempt(create_company_view), name='create_company'),
    path('api/v1/company/list', get_company_list, name='get_company_list'),
    path('api/v1/company/<int:pk>', get_company, name='get_company'),
    path('api/v1/company/update/<int:pk>', update_company, name='update_company'),
    path('api/v1/company/delete/<int:pk>', delete_company, name='delete_company'),
    
    # Category endpoints
    path('api/v1/category/get', csrf_exempt(get_categories_view), name='get_categories'),
    
    # Debug endpoint
    path('api/v1/debug', csrf_exempt(debug_view), name='debug'),
    
    # Chatbot endpoints
    path('', include('chatbot.urls')),
    
    # Application Management
    path('api/v1/application/create/<int:job_id>', apply_to_job, name='apply_to_job'),
    path('api/v1/application/user/<int:user_id>', get_user_applications, name='get_user_applications'),
    
    # Placement Prediction
    path('api/v1/predict/<int:user_id>', predict_placement, name='predict_placement'),
    
    # Resume parsing endpoint
    path('api/v1/resume/parse', parse_resume, name='parse_resume'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
