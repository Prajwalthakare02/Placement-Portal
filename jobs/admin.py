from django.contrib import admin
from .models import Job, Category, Company

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name',)

@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ('name', 'location', 'website', 'owner')
    search_fields = ('name', 'location')
    list_filter = ('created_at',)

@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ('title', 'company', 'location', 'category', 'posted_by', 'created_at', 'deadline', 'is_active')
    list_filter = ('is_active', 'category', 'job_type', 'experience_level', 'created_at')
    search_fields = ('title', 'company', 'location', 'description')
    date_hierarchy = 'created_at' 