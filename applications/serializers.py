from rest_framework import serializers
from .models import Application, ApplicationStatus
from jobs.serializers import JobSerializer
from users.serializers import UserSerializer

class ApplicationStatusSerializer(serializers.ModelSerializer):
    changed_by_name = serializers.CharField(source='changed_by.get_full_name', read_only=True)

    class Meta:
        model = ApplicationStatus
        fields = '__all__'
        read_only_fields = ('changed_by', 'changed_at')

class ApplicationSerializer(serializers.ModelSerializer):
    job_details = JobSerializer(source='job', read_only=True)
    applicant_details = UserSerializer(source='applicant', read_only=True)
    status_history = ApplicationStatusSerializer(many=True, read_only=True)

    class Meta:
        model = Application
        fields = '__all__'
        read_only_fields = ('applicant', 'applied_at', 'last_updated')

class ApplicationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = ('job', 'cover_letter', 'resume')
        read_only_fields = ('applicant', 'applied_at', 'last_updated') 