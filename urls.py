"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

# Commented out missing module import
# from prediction.views import predict_placement

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/auth/', include('accounts.urls')),
    path('api/v1/jobs/', include('jobs.urls')),
    path('api/v1/companies/', include('companies.urls')),
    path('api/v1/users/', include('users.urls')),
    
    # Commented out the prediction URL since the module is missing
    # path('api/v1/predict/<str:user_id>/', predict_placement, name='predict_placement'),
]

# Add media URL patterns if media root is configured
if settings.MEDIA_URL and settings.MEDIA_ROOT:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) 