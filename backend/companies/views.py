from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

@csrf_exempt
def get_company_list(request):
    """Return a list of companies"""
    return JsonResponse({
        'success': True,
        'companies': []
    })

@csrf_exempt
def get_company(request, pk):
    """Return a specific company"""
    return JsonResponse({
        'success': True,
        'company': {
            'id': pk,
            'name': 'Sample Company',
            'description': 'This is a placeholder company',
        }
    })

@csrf_exempt
def update_company(request, pk):
    """Update a company"""
    return JsonResponse({
        'success': True,
        'company': {
            'id': pk,
            'name': 'Updated Company',
            'description': 'This company was updated',
        }
    })

@csrf_exempt
def delete_company(request, pk):
    """Delete a company"""
    return JsonResponse({
        'success': True,
        'message': f'Company {pk} deleted successfully'
    }) 