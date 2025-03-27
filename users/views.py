from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth import get_user_model, authenticate, login
from .serializers import UserSerializer, UserRegistrationSerializer
from rest_framework.authtoken.models import Token
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import json
import logging

logger = logging.getLogger(__name__)

User = get_user_model()

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return super().get_permissions()

    def get_serializer_class(self):
        if self.action == 'create':
            return UserRegistrationSerializer
        return UserSerializer
    
    def create(self, request, *args, **kwargs):
        # Debug logging
        logger.error(f"Request data: {request.data}")
        if hasattr(request, 'body'):
            logger.error(f"Request body: {request.body}")
        
        # Check if the request data is a plain JSON string that needs parsing
        if isinstance(request.data, dict) and 'username' in request.data:
            data = request.data
        else:
            try:
                # Try to parse the request body as JSON
                data = json.loads(request.body)
                logger.error(f"Parsed JSON data: {data}")
            except Exception as e:
                logger.error(f"Error parsing JSON: {str(e)}")
                data = request.data
        
        # Map frontend field names to our backend field names if needed
        mapped_data = {
            'username': data.get('username', ''),
            'email': data.get('email', ''),
            'password': data.get('password', ''),
            'password2': data.get('confirmPassword', data.get('password', '')),  # Try to get confirmPassword first
            'user_type': data.get('userType', 'student'),
            'first_name': data.get('firstName', ''),
            'last_name': data.get('lastName', ''),
            'phone_number': data.get('phone', '')
        }
        
        logger.error(f"Mapped data: {mapped_data}")
        
        serializer = self.get_serializer(data=mapped_data)
        if not serializer.is_valid():
            logger.error(f"Serializer errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        self.perform_create(serializer)
        
        # Create or get authentication token
        user = serializer.instance
        token, created = Token.objects.get_or_create(user=user)
        
        headers = self.get_success_headers(serializer.data)
        return Response({
            'token': token.key,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'userType': user.user_type
            }
        }, status=status.HTTP_201_CREATED, headers=headers)

    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['put', 'patch'])
    def update_profile(self, request):
        serializer = self.get_serializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

# SIMPLIFIED AUTHENTICATION VIEWS WITHOUT RESTRICTIONS
@csrf_exempt
def user_register_view(request):
    """
    Simplified user registration view
    """
    if request.method == 'OPTIONS':
        response = JsonResponse({})
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, X-Requested-With"
        return response

    if request.method == 'POST':
        try:
            # Parse the request body
            try:
                data = json.loads(request.body)
            except:
                data = request.POST.dict()
            
            logger.error(f"Registration data: {data}")
            
            # Extract user data
            username = data.get('username')
            email = data.get('email')
            password = data.get('password')
            user_type = data.get('userType', 'student')
            
            # Generate username from email if not provided
            if not username:
                username = email.split('@')[0]
            
            # Validate required fields
            if not email or not password:
                return JsonResponse({
                    'success': False,
                    'error': 'Email and password are required'
                }, status=400)
            
            # Check if user already exists
            if User.objects.filter(username=username).exists():
                return JsonResponse({
                    'success': False,
                    'error': 'Username already exists'
                }, status=400)
                
            if User.objects.filter(email=email).exists():
                return JsonResponse({
                    'success': False,
                    'error': 'Email already exists'
                }, status=400)
            
            # Create the user
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                user_type=user_type
            )
            
            # Create token
            token, _ = Token.objects.get_or_create(user=user)
            
            # Return success response
            response = JsonResponse({
                'success': True,
                'token': token.key,
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'userType': user.user_type
                }
            })
            response["Access-Control-Allow-Origin"] = "*"
            return response
            
        except Exception as e:
            logger.error(f"Registration error: {str(e)}")
            return JsonResponse({
                'success': False,
                'error': str(e)
            }, status=500)

@csrf_exempt
def user_login_view(request):
    """
    Simplified user login view
    """
    if request.method == 'OPTIONS':
        response = JsonResponse({})
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, X-Requested-With"
        return response
    
    if request.method == 'POST':
        try:
            # Parse the request body
            try:
                data = json.loads(request.body)
            except:
                data = request.POST.dict()
            
            logger.error(f"Login data: {data}")
            
            # Extract login credentials
            username = data.get('username', '')  # Could be email or username
            password = data.get('password', '')
            
            # Validate required fields
            if not username or not password:
                return JsonResponse({
                    'success': False,
                    'error': 'Username/Email and password are required'
                }, status=400)
            
            # Try to authenticate with the username
            user = authenticate(username=username, password=password)
            
            # If that doesn't work, try to find the user by email
            if user is None and '@' in username:
                try:
                    user_obj = User.objects.get(email=username)
                    user = authenticate(username=user_obj.username, password=password)
                except User.DoesNotExist:
                    user = None
            
            # If authentication successful
            if user is not None:
                # Login the user
                login(request, user)
                
                # Create or get token
                token, _ = Token.objects.get_or_create(user=user)
                
                # Return success response
                response = JsonResponse({
                    'success': True,
                    'token': token.key,
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'userType': user.user_type,
                        'fullname': f"{user.first_name} {user.last_name}".strip(),
                        'phoneNumber': user.phone_number or ''
                    }
                })
                response["Access-Control-Allow-Origin"] = "*"
                return response
            else:
                return JsonResponse({
                    'success': False,
                    'error': 'Invalid credentials'
                }, status=400)
                
        except Exception as e:
            logger.error(f"Login error: {str(e)}")
            return JsonResponse({
                'success': False,
                'error': str(e)
            }, status=500)

@api_view(['POST', 'OPTIONS'])
@permission_classes([permissions.IsAuthenticated])
@csrf_exempt
def update_profile_view(request):
    """
    API endpoint for updating user profile
    """
    # Handle OPTIONS request for CORS preflight
    if request.method == 'OPTIONS':
        response = JsonResponse({})
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
        return response
    
    # Get the Authorization header
    auth_header = request.META.get('HTTP_AUTHORIZATION', '')
    logger.error(f"Auth header: {auth_header}")
    
    # Extract token if it exists
    token = None
    if auth_header.startswith('Token '):
        token = auth_header[6:]
        logger.error(f"Extracted token: {token}")
    
    # Try to authenticate with the token
    if token:
        try:
            token_obj = Token.objects.get(key=token)
            user = token_obj.user
            logger.error(f"Authenticated user: {user.username}")
        except Token.DoesNotExist:
            logger.error(f"Token does not exist: {token}")
            return JsonResponse({
                'success': False,
                'error': 'Invalid token'
            }, status=401)
    else:
        # Fall back to the request.user if token authentication failed
        user = request.user
        if user.is_anonymous:
            logger.error("Anonymous user - no authentication")
            return JsonResponse({
                'success': False,
                'error': 'Authentication required'
            }, status=401)
        logger.error(f"Using request.user: {user.username}")
    
    logger.error(f"Profile update request from user: {user.username}")
    
    try:
        # Handle both JSON and form-data requests
        if request.content_type and 'application/json' in request.content_type:
            data = json.loads(request.body)
        else:
            data = request.data
        
        logger.error(f"Profile update data: {data}")
        logger.error(f"Profile update FILES: {request.FILES}")
        
        # Update user fields
        if 'fullname' in data and data['fullname']:
            logger.error(f"Updating fullname to: {data['fullname']}")
            name_parts = data['fullname'].split(' ', 1)
            user.first_name = name_parts[0]
            user.last_name = name_parts[1] if len(name_parts) > 1 else ''
        
        if 'email' in data and data['email']:
            logger.error(f"Updating email to: {data['email']}")
            user.email = data['email']
            
        if 'phoneNumber' in data and data['phoneNumber']:
            logger.error(f"Updating phone to: {data['phoneNumber']}")
            user.phone_number = data['phoneNumber']
            
        # Update profile fields directly on User model
        if 'bio' in data:
            logger.error(f"Updating bio to: {data['bio']}")
            user.bio = data['bio']
            logger.error(f"User bio after update: {user.bio}")
            
        if 'skills' in data and data['skills']:
            logger.error(f"Updating skills to: {data['skills']}")
            # Skills are stored as text field directly on User
            user.skills = data['skills']
        
        # Handle resume file
        if 'file' in request.FILES:
            logger.error(f"Updating resume to: {request.FILES['file'].name}")
            user.resume = request.FILES['file']
        
        # Save the user
        user.save()
        logger.error(f"User after save - bio: {user.bio}")
        
        # Get user token
        token_key = ""
        try:
            token_obj = Token.objects.get(user=user)
            token_key = token_obj.key
        except Token.DoesNotExist:
            # Create a new token if it doesn't exist
            token_obj = Token.objects.create(user=user)
            token_key = token_obj.key
        
        # Return the updated user with token
        response_data = {
            'success': True,
            'message': 'Profile updated successfully',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'fullname': f"{user.first_name} {user.last_name}".strip(),
                'userType': user.user_type,
                'phoneNumber': user.phone_number or '',
                'token': token_key,
                'bio': user.bio or '',  # Add bio directly at top level for easier access
                'skills': user.skills or '',  # Add skills directly at top level for easier access
                'profile': {
                    'bio': user.bio or '',
                    'skills': user.skills or '',
                    'resume': str(user.resume) if user.resume else None
                }
            }
        }
        logger.error(f"Returning updated user data: {response_data}")
        response = JsonResponse(response_data)
        return response
    except Exception as e:
        logger.error(f"Profile update error: {str(e)}")
        import traceback
        logger.error(f"Profile update traceback: {traceback.format_exc()}")
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500) 