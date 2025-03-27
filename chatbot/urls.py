from django.urls import path
from .views import chatbot_response

urlpatterns = [
    path('api/v1/chatbot/response', chatbot_response, name='chatbot_response'),
] 