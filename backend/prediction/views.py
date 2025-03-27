from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import get_user_model
import joblib
import json
import os
import numpy as np
import logging
import random  # Add for generating mock predictions

# Get user model
User = get_user_model()

# Setup logging
logger = logging.getLogger(__name__)

# Load the predict2 model
try:
    model_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'predict2.joblib')
    if os.path.exists(model_path):
        predict_model = joblib.load(model_path)
        logger.info(f"Successfully loaded prediction model from {model_path}")
    else:
        logger.warning(f"Model file {model_path} does not exist. Using mock predictions.")
        predict_model = None
except Exception as e:
    logger.error(f"Failed to load prediction model: {str(e)}")
    predict_model = None

@csrf_exempt
def predict_placement(request, user_id):
    """
    API endpoint to predict placement chances for a student
    Using mock data for demonstration
    """
    try:
        # Get user data
        user = User.objects.get(id=user_id)
        
        # Generate a random probability between 45 and 85
        probability = random.uniform(45, 85)
        
        # Create mock features for recommendations
        mock_features = [
            random.uniform(6.5, 9.0),  # CGPA
            random.randint(0, 6),      # Internship months
            random.randint(3, 10),     # Skills count
            random.randint(1, 5),      # Projects count
            random.uniform(5, 9)       # Technical score
        ]
        
        # Generate recommendations based on the mock features
        recommendations = generate_recommendations(mock_features, probability)
        
        # Generate factors with the mock features
        factors = [
            {
                'type': 'academic',
                'name': 'CGPA',
                'value': f"{mock_features[0]:.2f}"
            },
            {
                'type': 'experience',
                'name': 'Internship Experience',
                'value': f"{int(mock_features[1])} months"
            },
            {
                'type': 'skills',
                'name': 'Technical Skills',
                'value': f"{int(mock_features[2])} skills"
            },
            {
                'type': 'experience',
                'name': 'Projects',
                'value': f"{int(mock_features[3])} projects"
            }
        ]
        
        return JsonResponse({
            'success': True,
            'prediction': {
                'placement_probability': probability,
                'recommendations': recommendations,
                'factors': factors
            }
        })
    except User.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'User not found'
        }, status=404)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)

def generate_recommendations(features, probability):
    """
    Generate recommendations based on features and probability
    """
    recommendations = []
    
    # Check CGPA
    cgpa = features[0]
    if cgpa < 7.5:
        recommendations.append("Improve your academic performance to increase placement chances.")
    
    # Check internship experience
    internship_months = features[1]
    if internship_months < 3:
        recommendations.append("Gain more industry experience through internships or part-time work.")
    
    # Check skills
    skill_count = features[2]
    if skill_count < 5:
        recommendations.append("Develop more technical and relevant skills for your target roles.")
    
    # Check projects
    projects_count = features[3]
    if projects_count < 3:
        recommendations.append("Work on more hands-on projects to showcase your practical skills.")
    
    # Check technical score
    if len(features) > 4:
        technical_score = features[4]
        if technical_score < 7:
            recommendations.append("Improve your technical fundamentals through additional courses or practice.")
    
    # General recommendations based on probability
    if probability < 50:
        recommendations.append("Consider joining placement preparation groups or finding a mentor.")
        recommendations.append("Practice mock interviews and coding challenges regularly.")
    
    return recommendations

def extract_user_features(user):
    """
    Extract features from user profile for prediction model
    """
    try:
        # Get profile data
        profile = getattr(user, 'profile', None)
        
        # Basic feature extraction
        features = []
        
        # Academic features
        cgpa = getattr(profile, 'cgpa', None) or getattr(user, 'cgpa', None) or 0
        features.append(float(cgpa))
        
        # Experience features
        internship_months = getattr(profile, 'internship_experience', None) or 0
        features.append(float(internship_months))
        
        # Skills features
        skills = getattr(user, 'skills', '') or getattr(profile, 'skills', '') or ''
        skill_count = len(skills.split(',')) if skills else 0
        features.append(float(skill_count))
        
        # Project features
        projects_count = getattr(profile, 'projects_count', None) or 0
        features.append(float(projects_count))
        
        # Technical score (calculated or provided)
        technical_score = getattr(profile, 'technical_score', None) or 0
        features.append(float(technical_score))
        
        return features
    except Exception as e:
        logger.error(f"Feature extraction error: {str(e)}")
        return None

def extract_key_factors(user, features):
    """
    Extract key factors that influence the prediction
    """
    factors = []
    
    # Academic factor
    factors.append({
        'type': 'academic',
        'name': 'CGPA',
        'value': f"{features[0]:.2f}"
    })
    
    # Experience factor
    factors.append({
        'type': 'experience',
        'name': 'Internship Experience',
        'value': f"{int(features[1])} months"
    })
    
    # Skills factor
    factors.append({
        'type': 'skills',
        'name': 'Technical Skills',
        'value': f"{int(features[2])} skills"
    })
    
    # Projects factor
    factors.append({
        'type': 'experience',
        'name': 'Projects',
        'value': f"{int(features[3])} projects"
    })
    
    return factors 