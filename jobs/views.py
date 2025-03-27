from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Job, Category, Company
from .serializers import JobSerializer, CategorySerializer, JobCreateSerializer, CompanySerializer
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from django.utils import timezone
from django.views import View
from django.utils.decorators import method_decorator

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class JobViewSet(viewsets.ModelViewSet):
    queryset = Job.objects.all()
    serializer_class = JobSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'job_type', 'experience_level', 'is_active']
    search_fields = ['title', 'company', 'description', 'requirements']
    ordering_fields = ['created_at', 'deadline', 'salary_range']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'create':
            return JobCreateSerializer
        return JobSerializer

    def perform_create(self, serializer):
        serializer.save(posted_by=self.request.user)

    @action(detail=True, methods=['get'])
    def applications(self, request, pk=None):
        job = self.get_object()
        applications = job.applications.all()
        from applications.serializers import ApplicationSerializer
        serializer = ApplicationSerializer(applications, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def my_jobs(self, request):
        jobs = Job.objects.filter(posted_by=request.user)
        serializer = self.get_serializer(jobs, many=True)
        return Response(serializer.data)

class CompanyViewSet(viewsets.ModelViewSet):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def job_search_view(request):
    """
    API endpoint that allows jobs to be searched by keyword.
    This endpoint matches the frontend's expected API structure.
    """
    keyword = request.GET.get('keyword', '')
    location = request.GET.get('location', '')
    
    # Get the queryset with filters
    queryset = Job.objects.all()
    
    if keyword:
        queryset = queryset.filter(title__icontains=keyword) | \
                   queryset.filter(description__icontains=keyword) | \
                   queryset.filter(requirements__icontains=keyword) | \
                   queryset.filter(skills_required__icontains=keyword)
    
    if location:
        queryset = queryset.filter(location__icontains=location)
    
    # Serialize the data in the format expected by the frontend
    jobs = []
    for job in queryset:
        jobs.append({
            'id': job.id,
            'title': job.title,
            'description': job.description,
            'location': job.location,
            'company': job.company,
            'job_type': job.job_type,
            'salary_range': job.salary_range,
            'deadline': job.deadline.strftime('%Y-%m-%d'),
            'experience_level': job.experience_level,
            'created_at': job.created_at.strftime('%Y-%m-%d'),
            'is_active': job.is_active,
            'skills_required': job.skills_required,
            'category': job.category.name,
            'posted_by': job.posted_by.get_full_name() or job.posted_by.username,
        })
    
    return JsonResponse({'jobs': jobs})

@api_view(['GET', 'POST', 'OPTIONS'])
@permission_classes([permissions.AllowAny])
@csrf_exempt
def get_companies_view(request):
    """
    API endpoint that allows companies to be retrieved.
    """
    # Handle OPTIONS request for CORS
    if request.method == 'OPTIONS':
        response = JsonResponse({})
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
        return response
        
    try:
        # Get all companies or filter by the owner if requested
        owner_id = request.GET.get('owner_id')
        if owner_id:
            queryset = Company.objects.filter(owner_id=owner_id)
        else:
            queryset = Company.objects.all()
        
        # Serialize the data
        companies = []
        for company in queryset:
            companies.append({
                'id': company.id,
                'name': company.name,
                'description': company.description,
                'website': company.website,
                'location': company.location,
                'logo': request.build_absolute_uri(company.logo.url) if company.logo and company.logo.name else None,
                'owner': company.owner.username if company.owner else None,
            })
        
        print("Returning companies:", companies)
        return JsonResponse({'success': True, 'companies': companies})
    except Exception as e:
        import traceback
        print(f"Error getting companies: {str(e)}")
        print(traceback.format_exc())
        return JsonResponse({'success': False, 'error': str(e)}, status=500)

@api_view(['GET', 'POST', 'OPTIONS'])
@permission_classes([permissions.IsAuthenticated])
@csrf_exempt
def get_admin_jobs_view(request):
    """
    API endpoint that allows recruiters to view jobs they've posted.
    """
    # Handle OPTIONS request for CORS
    if request.method == 'OPTIONS':
        response = JsonResponse({})
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
        return response
        
    try:
        user = request.user
        print(f"User accessing admin jobs: {user.username}, Type: {user.user_type}")
        
        # Check if user is a recruiter
        if user.user_type != 'recruiter':
            return JsonResponse({'success': False, 'error': 'Only recruiters can access this endpoint'}, status=403)
        
        # Get jobs posted by this recruiter
        queryset = Job.objects.filter(posted_by=user)
        print(f"Found {queryset.count()} jobs for user {user.username}")
        
        # Serialize the data
        jobs = []
        for job in queryset:
            jobs.append({
                'id': job.id,
                'title': job.title,
                'description': job.description,
                'location': job.location,
                'company': job.company,
                'job_type': job.job_type,
                'salary_range': job.salary_range,
                'deadline': job.deadline.strftime('%Y-%m-%d') if job.deadline else None,
                'experience_level': job.experience_level,
                'created_at': job.created_at.strftime('%Y-%m-%d'),
                'is_active': job.is_active,
                'skills_required': job.skills_required,
                'category': job.category.name if job.category else None,
                'applications_count': job.applications.count(),
            })
        
        print("Returning jobs:", jobs)
        return JsonResponse({'success': True, 'jobs': jobs})
    except Exception as e:
        import traceback
        print(f"Error getting admin jobs: {str(e)}")
        print(traceback.format_exc())
        return JsonResponse({'success': False, 'error': str(e)}, status=500)

@api_view(['POST', 'OPTIONS'])
@permission_classes([permissions.IsAuthenticated])
@csrf_exempt
def create_company_view(request):
    """
    API endpoint for creating a new company.
    """
    if request.method == 'OPTIONS':
        response = JsonResponse({})
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
        return response
            
    try:
        user = request.user
        print(f"User creating company: {user.username}, Type: {user.user_type}")
        
        # Check if user is a recruiter
        if user.user_type != 'recruiter':
            return JsonResponse({'success': False, 'error': 'Only recruiters can create companies'}, status=403)
        
        # Process form data
        data = {}
        if request.content_type and 'application/json' in request.content_type:
            data = json.loads(request.body)
        else:
            data = request.data
        
        # Log received data for debugging
        print(f"Creating company with data: {data}")
        
        # Create company instance
        company = Company(
            name=data.get('name', ''),
            description=data.get('description', ''),
            website=data.get('website', ''),
            location=data.get('location', ''),
            owner=user
        )
        
        # Handle logo if present
        if 'logo' in request.FILES:
            company.logo = request.FILES['logo']
        
        # Save company
        company.save()
        
        # Return success response
        return JsonResponse({
            'success': True,
            'message': 'Company created successfully',
            'company': {
                'id': company.id,
                'name': company.name,
                'description': company.description,
                'website': company.website,
                'location': company.location,
                'logo': request.build_absolute_uri(company.logo.url) if company.logo and company.logo.name else None,
                'owner': company.owner.username
            }
        })
    except Exception as e:
        import traceback
        print(f"Error creating company: {str(e)}")
        print(traceback.format_exc())
        return JsonResponse({'success': False, 'error': str(e)}, status=500)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
@csrf_exempt
def create_job_view(request):
    """
    API endpoint for creating a new job.
    """
    try:
        if request.method == 'OPTIONS':
            response = JsonResponse({})
            response["Access-Control-Allow-Origin"] = "*"
            response["Access-Control-Allow-Methods"] = "POST, OPTIONS"
            response["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
            return response
            
        user = request.user
        
        # Check if user is a recruiter
        if user.user_type != 'recruiter':
            return JsonResponse({'success': False, 'error': 'Only recruiters can create jobs'}, status=403)
        
        # Process form data
        data = {}
        if request.content_type and 'application/json' in request.content_type:
            data = json.loads(request.body)
        else:
            data = request.data
        
        # Log received data for debugging
        print(f"Creating job with data: {data}")
        
        # Get category by ID or create default
        category_id = data.get('category')
        category = None
        if category_id:
            try:
                category = Category.objects.get(id=category_id)
            except Category.DoesNotExist:
                # Use first category as default
                category = Category.objects.first()
                if not category:
                    # Create a default category if none exists
                    category = Category.objects.create(name="General")
        else:
            # Use first category as default
            category = Category.objects.first()
            if not category:
                # Create a default category if none exists
                category = Category.objects.create(name="General")
        
        # Create job instance
        job = Job(
            title=data.get('title', ''),
            company=data.get('company', ''),
            location=data.get('location', ''),
            category=category,
            description=data.get('description', ''),
            requirements=data.get('requirements', ''),
            salary_range=data.get('salary_range', ''),
            posted_by=user,
            deadline=data.get('deadline') or timezone.now().date() + timezone.timedelta(days=30),
            is_active=data.get('is_active', True),
            experience_level=data.get('experience_level', ''),
            job_type=data.get('job_type', ''),
            skills_required=data.get('skills_required', ''),
            benefits=data.get('benefits', ''),
            application_url=data.get('application_url', '')
        )
        
        # Save job
        job.save()
        
        # Return success response
        return JsonResponse({
            'success': True,
            'message': 'Job created successfully',
            'job': {
                'id': job.id,
                'title': job.title,
                'company': job.company,
                'location': job.location,
                'category': job.category.name,
                'is_active': job.is_active
            }
        })
    except Exception as e:
        import traceback
        print(f"Error creating job: {str(e)}")
        print(traceback.format_exc())
        return JsonResponse({'success': False, 'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
@csrf_exempt
def get_categories_view(request):
    """
    API endpoint that allows job categories to be retrieved.
    """
    try:
        # Get all categories
        queryset = Category.objects.all()
        
        # Serialize the data
        categories = []
        for category in queryset:
            categories.append({
                'id': category.id,
                'name': category.name,
                'description': category.description,
                'icon': category.icon
            })
        
        return JsonResponse({'success': True, 'categories': categories})
    except Exception as e:
        import traceback
        print(f"Error getting categories: {str(e)}")
        print(traceback.format_exc())
        return JsonResponse({'success': False, 'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
@csrf_exempt
def debug_view(request):
    """Debug view to help identify authentication issues"""
    response_data = {
        'success': True,
        'authenticated': request.user.is_authenticated,
        'username': request.user.username if request.user.is_authenticated else None,
        'user_type': request.user.user_type if request.user.is_authenticated else None,
        'auth_header': request.META.get('HTTP_AUTHORIZATION', None),
        'cookies': dict(request.COOKIES),
        'session_key': request.session.session_key,
        'session_is_empty': request.session.is_empty(),
    }
    
    if request.user.is_authenticated:
        # Add more user info if authenticated
        response_data.update({
            'email': request.user.email,
            'is_staff': request.user.is_staff,
            'id': request.user.id,
        })
    
    return JsonResponse(response_data)

@method_decorator(csrf_exempt, name='dispatch')
class JobCreateView(View):
    def post(self, request):
        try:
            data = json.loads(request.body)
            job = Job.objects.create(**data)
            return JsonResponse({
                'success': True,
                'job': {
                    'id': job.id,
                    'title': job.title,
                    'description': job.description,
                    'company': job.company,
                    'location': job.location,
                    'salary': job.salary,
                    'requirements': job.requirements,
                    'created_at': job.created_at
                }
            })
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            }, status=400)

@method_decorator(csrf_exempt, name='dispatch')
class JobUpdateView(View):
    def put(self, request, pk):
        try:
            job = Job.objects.get(pk=pk)
            data = json.loads(request.body)
            for key, value in data.items():
                setattr(job, key, value)
            job.save()
            return JsonResponse({
                'success': True,
                'job': {
                    'id': job.id,
                    'title': job.title,
                    'description': job.description,
                    'company': job.company,
                    'location': job.location,
                    'salary': job.salary,
                    'requirements': job.requirements,
                    'updated_at': job.updated_at
                }
            })
        except Job.DoesNotExist:
            return JsonResponse({
                'success': False,
                'error': 'Job not found'
            }, status=404)
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            }, status=400)

@method_decorator(csrf_exempt, name='dispatch')
class JobDeleteView(View):
    def delete(self, request, pk):
        try:
            job = Job.objects.get(pk=pk)
            job.delete()
            return JsonResponse({
                'success': True,
                'message': 'Job deleted successfully'
            })
        except Job.DoesNotExist:
            return JsonResponse({
                'success': False,
                'error': 'Job not found'
            }, status=404)
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            }, status=400)

@method_decorator(csrf_exempt, name='dispatch')
class JobListView(View):
    def get(self, request):
        try:
            jobs = Job.objects.all().order_by('-created_at')
            return JsonResponse({
                'success': True,
                'jobs': [{
                    'id': job.id,
                    'title': job.title,
                    'description': job.description,
                    'company': job.company,
                    'location': job.location,
                    'salary': job.salary,
                    'requirements': job.requirements,
                    'created_at': job.created_at
                } for job in jobs]
            })
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            }, status=400)

@method_decorator(csrf_exempt, name='dispatch')
class UserJobListView(View):
    def get(self, request, user_id):
        try:
            jobs = Job.objects.filter(user_id=user_id).order_by('-created_at')
            return JsonResponse({
                'success': True,
                'jobs': [{
                    'id': job.id,
                    'title': job.title,
                    'description': job.description,
                    'company': job.company,
                    'location': job.location,
                    'salary': job.salary,
                    'requirements': job.requirements,
                    'created_at': job.created_at
                } for job in jobs]
            })
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            }, status=400)

@method_decorator(csrf_exempt, name='dispatch')
class JobDetailView(View):
    def get(self, request, pk):
        try:
            job = Job.objects.get(pk=pk)
            return JsonResponse({
                'success': True,
                'job': {
                    'id': job.id,
                    'title': job.title,
                    'description': job.description,
                    'company': job.company,
                    'location': job.location,
                    'salary': job.salary,
                    'requirements': job.requirements,
                    'created_at': job.created_at
                }
            })
        except Job.DoesNotExist:
            return JsonResponse({
                'success': False,
                'error': 'Job not found'
            }, status=404)
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            }, status=400)

@csrf_exempt
def get_job_applicants(request, job_id):
    try:
        job = Job.objects.get(pk=job_id)
        applicants = job.applicants.all()
        return JsonResponse({
            'success': True,
            'applicants': [{
                'id': applicant.id,
                'name': applicant.name,
                'email': applicant.email,
                'resume': applicant.resume.url if applicant.resume else None,
                'applied_at': applicant.applied_at
            } for applicant in applicants]
        })
    except Job.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Job not found'
        }, status=404)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=400)

@csrf_exempt
def get_all_jobs(request):
    try:
        jobs = Job.objects.all().order_by('-created_at')
        return JsonResponse({
            'success': True,
            'jobs': [{
                'id': job.id,
                'title': job.title,
                'description': job.description,
                'company': job.company,
                'location': job.location,
                'salary': job.salary,
                'requirements': job.requirements,
                'created_at': job.created_at
            } for job in jobs]
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=400)

@csrf_exempt
def apply_to_job(request, job_id):
    """
    Handle job application for a user
    """
    if request.method != 'POST':
        return JsonResponse({
            'success': False,
            'error': 'Only POST method is allowed'
        }, status=405)
    
    try:
        from .models import Job
        from django.contrib.auth import get_user_model
        
        User = get_user_model()
        
        # Get data from request
        data = json.loads(request.body)
        user_id = data.get('user_id')
        
        # Validate user and job
        try:
            user = User.objects.get(id=user_id)
            job = Job.objects.get(id=job_id)
        except User.DoesNotExist:
            return JsonResponse({
                'success': False,
                'error': 'User not found'
            }, status=404)
        except Job.DoesNotExist:
            return JsonResponse({
                'success': False,
                'error': 'Job not found'
            }, status=404)
        
        # Check if already applied
        if job.applicants.filter(id=user_id).exists():
            return JsonResponse({
                'success': False,
                'error': 'You have already applied to this job'
            }, status=400)
        
        # Add user to job applicants
        job.applicants.add(user)
        job.save()
        
        return JsonResponse({
            'success': True,
            'message': 'Application submitted successfully'
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)

@csrf_exempt
def get_user_applications(request, user_id):
    """
    Get all job applications for a user
    """
    try:
        from .models import Job
        from django.contrib.auth import get_user_model
        
        User = get_user_model()
        
        # Validate user
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return JsonResponse({
                'success': False,
                'error': 'User not found'
            }, status=404)
        
        # Get jobs where user has applied
        applied_jobs = Job.objects.filter(applicants=user)
        
        return JsonResponse({
            'success': True,
            'applications': [{
                'id': job.id,
                'title': job.title,
                'company': job.company,
                'location': job.location,
                'applied_at': job.created_at
            } for job in applied_jobs]
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500) 