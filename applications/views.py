from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from .models import Application, ApplicationStatus
from .serializers import ApplicationSerializer, ApplicationCreateSerializer, ApplicationStatusSerializer
from django.http import JsonResponse
import json

class ApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'recruiter':
            return Application.objects.filter(job__posted_by=user)
        return Application.objects.filter(applicant=user)

    def get_serializer_class(self):
        if self.action == 'create':
            return ApplicationCreateSerializer
        return ApplicationSerializer

    def perform_create(self, serializer):
        serializer.save(applicant=self.request.user)

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        application = self.get_object()
        if request.user.user_type != 'recruiter' or application.job.posted_by != request.user:
            return Response(
                {"detail": "You don't have permission to update this application's status."},
                status=status.HTTP_403_FORBIDDEN
            )

        status_serializer = ApplicationStatusSerializer(data=request.data)
        if status_serializer.is_valid():
            status_serializer.save(
                application=application,
                changed_by=request.user
            )
            application.status = status_serializer.validated_data['status']
            application.save()
            return Response(ApplicationSerializer(application).data)
        return Response(status_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def my_applications(self, request):
        applications = Application.objects.filter(applicant=request.user)
        serializer = self.get_serializer(applications, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def received_applications(self, request):
        if request.user.user_type != 'recruiter':
            return Response(
                {"detail": "Only recruiters can view received applications."},
                status=status.HTTP_403_FORBIDDEN
            )
        applications = Application.objects.filter(job__posted_by=request.user)
        serializer = self.get_serializer(applications, many=True)
        return Response(serializer.data)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_applications_view(request):
    """
    API endpoint to get the applications for current user
    """
    user = request.user
    
    try:
        if user.user_type == 'recruiter':
            applications = Application.objects.filter(job__posted_by=user)
        else:
            applications = Application.objects.filter(applicant=user)
        
        # Convert applications to simplified format
        application_data = []
        for app in applications:
            application_data.append({
                'id': app.id,
                'status': app.status,
                'applied_at': app.applied_at.strftime('%Y-%m-%d'),
                'last_updated': app.last_updated.strftime('%Y-%m-%d'),
                'job': {
                    'id': app.job.id,
                    'title': app.job.title,
                    'company': app.job.company
                }
            })
        
        return JsonResponse({
            'success': True,
            'application': application_data
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500) 