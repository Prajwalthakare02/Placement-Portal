from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework import permissions
import json
import random

# Sample placement-related responses for different categories
RESPONSES = {
    "greeting": [
        "Hello! I'm your placement assistant. How can I help you today?",
        "Hi there! I'm here to help with your placement queries. What would you like to know?",
        "Welcome! I can help you with interview preparation, resume advice, and more. What do you need?",
    ],
    "interview": [
        "For technical interviews, practice coding problems on platforms like LeetCode and HackerRank.",
        "Prepare for behavioral questions by using the STAR method (Situation, Task, Action, Result).",
        "Research the company before your interview and prepare questions to ask the interviewer.",
        "Mock interviews with friends or mentors can help you get comfortable with the interview process.",
    ],
    "resume": [
        "Keep your resume concise, ideally 1-2 pages, focusing on your most relevant experience.",
        "Tailor your resume for each job application, highlighting skills that match the job description.",
        "Use action verbs and quantify your achievements when possible (e.g., 'Increased efficiency by 30%').",
        "Include relevant projects, especially if you're a student or recent graduate with limited work experience.",
    ],
    "skills": [
        "Focus on developing both technical skills and soft skills like communication and teamwork.",
        "Consider getting certifications relevant to your field to boost your resume.",
        "Contribute to open-source projects to demonstrate your coding skills and collaboration abilities.",
        "Join hackathons or coding competitions to build your portfolio and network with professionals.",
    ],
    "job_search": [
        "Use multiple job platforms, not just one, to maximize your opportunities.",
        "Network with professionals in your field through LinkedIn and industry events.",
        "Consider internships or part-time positions to gain experience if you're just starting out.",
        "Follow companies you're interested in on social media to stay updated on job openings.",
    ],
    "fallback": [
        "I'm not sure I understand. Could you rephrase your question about placements or interviews?",
        "I'm still learning! Could you ask something related to job placements, interviews, or resume preparation?",
        "I don't have information on that. How about asking about interview preparation or resume tips?",
    ]
}

# Simple keyword matching for intent detection
KEYWORDS = {
    "greeting": ["hello", "hi", "hey", "greetings", "good morning", "good afternoon", "good evening", "howdy"],
    "interview": ["interview", "question", "ask", "preparation", "prepare", "technical", "behavioral", "hr"],
    "resume": ["resume", "cv", "curriculum", "vitae", "portfolio", "showcase", "profile"],
    "skills": ["skill", "ability", "competency", "learn", "improve", "develop", "growth", "technical", "soft"],
    "job_search": ["job", "search", "find", "application", "apply", "opportunity", "opening", "position", "career"],
}

def detect_intent(message):
    """Simple intent detection based on keyword matching"""
    message = message.lower()
    
    for intent, keywords in KEYWORDS.items():
        for keyword in keywords:
            if keyword in message:
                return intent
    
    return "fallback"

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
@csrf_exempt
def chatbot_response(request):
    """API endpoint for chatbot responses"""
    try:
        # Parse request data
        data = json.loads(request.body)
        user_message = data.get('message', '')
        
        if not user_message:
            return JsonResponse({'error': 'No message provided'}, status=400)
        
        # Detect intent based on keywords
        intent = detect_intent(user_message)
        
        # Get response based on intent
        responses = RESPONSES.get(intent, RESPONSES['fallback'])
        response = random.choice(responses)
        
        # Log the interaction (you could also store this in a database)
        print(f"User: {user_message}")
        print(f"Intent detected: {intent}")
        print(f"Bot: {response}")
        
        return JsonResponse({
            'response': response,
            'intent': intent,
            'success': True
        })
    except Exception as e:
        print(f"Error processing chatbot request: {str(e)}")
        return JsonResponse({'error': str(e), 'success': False}, status=500) 