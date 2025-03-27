from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import re
import PyPDF2
import io
import logging

logger = logging.getLogger(__name__)

@csrf_exempt
def parse_resume(request):
    """
    Parse resume and extract information
    """
    if request.method != 'POST':
        return JsonResponse({
            'success': False,
            'error': 'Only POST method is allowed'
        }, status=405)
    
    try:
        # Check if file was uploaded
        if 'resume' not in request.FILES:
            return JsonResponse({
                'success': False,
                'error': 'No resume file provided'
            }, status=400)
        
        resume_file = request.FILES['resume']
        
        # Check file type (only accept PDF for now)
        if not resume_file.name.endswith('.pdf'):
            return JsonResponse({
                'success': False,
                'error': 'Only PDF files are supported'
            }, status=400)
        
        # Extract text from PDF
        text = extract_text_from_pdf(resume_file)
        
        # Parse information from text
        parsed_data = {
            'name': extract_name(text),
            'email': extract_email(text),
            'phone': extract_phone(text),
            'skills': extract_skills(text),
            'education': extract_education(text),
            'experience': extract_experience(text)
        }
        
        return JsonResponse({
            'success': True,
            'data': parsed_data
        })
    
    except Exception as e:
        logger.error(f"Resume parsing error: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)

def extract_text_from_pdf(pdf_file):
    """Extract text from a PDF file"""
    try:
        # Read the PDF file
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(pdf_file.read()))
        
        # Extract text from all pages
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        
        return text
    except Exception as e:
        logger.error(f"PDF extraction error: {str(e)}")
        raise Exception(f"Error extracting text from PDF: {str(e)}")

def extract_name(text):
    """Extract name from resume text"""
    # Simple heuristic: First line often contains the name
    lines = text.split('\n')
    for line in lines[:5]:  # Check first 5 lines
        line = line.strip()
        if len(line) > 0 and len(line.split()) <= 4:  # Name usually has 1-4 words
            return line
    return ""

def extract_email(text):
    """Extract email from resume text"""
    email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
    match = re.search(email_pattern, text)
    if match:
        return match.group(0)
    return ""

def extract_phone(text):
    """Extract phone number from resume text"""
    # Phone patterns (handles various formats)
    phone_pattern = r'(?:\+\d{1,3}[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}'
    match = re.search(phone_pattern, text)
    if match:
        # Clean up the phone number
        phone = re.sub(r'[^\d+]', '', match.group(0))
        return phone
    return ""

def extract_skills(text):
    """Extract skills from resume text"""
    # Look for skills section and extract keywords
    skills = []
    
    # Common skill indicators
    skill_indicators = [
        "skills", "technical skills", "technologies", "programming languages",
        "languages", "tools", "frameworks", "libraries", "technologies"
    ]
    
    # Common technical skills to look for
    common_skills = [
        "python", "java", "javascript", "html", "css", "react", "angular", "vue", 
        "node", "express", "django", "flask", "spring", "hibernate", "sql", "mysql", 
        "postgresql", "mongodb", "nosql", "aws", "azure", "gcp", "docker", "kubernetes",
        "git", "linux", "bash", "c++", "c#", "php", "ruby", "swift", "kotlin", "flutter",
        "tensorflow", "pytorch", "pandas", "numpy", "sklearn", "ai", "ml", "data science"
    ]
    
    # Extract skills based on common technical terms
    for skill in common_skills:
        if re.search(r'\b' + skill + r'\b', text.lower()):
            skills.append(skill.capitalize())
    
    return skills[:10]  # Limit to 10 skills

def extract_education(text):
    """Extract education information from resume text"""
    education = []
    
    # Look for degree indicators
    degree_indicators = [
        "bachelor", "b.tech", "b.e.", "master", "m.tech", "m.e.", "phd", 
        "b.sc", "m.sc", "b.a.", "m.a.", "diploma"
    ]
    
    # Extract education sections
    lines = text.split('\n')
    for i, line in enumerate(lines):
        line_lower = line.lower()
        if any(indicator in line_lower for indicator in degree_indicators):
            # Found a potential education entry
            education_info = line.strip()
            
            # Try to get institution name from nearby lines
            if i < len(lines) - 1:
                next_line = lines[i+1].strip()
                if next_line and len(next_line) > 5:  # Likely institution name
                    education_info += f" - {next_line}"
            
            education.append(education_info)
    
    return education[:3]  # Limit to 3 education entries

def extract_experience(text):
    """Extract work experience information from resume text"""
    experiences = []
    
    # Look for experience section indicators
    exp_indicators = [
        "experience", "work experience", "employment history", "work history"
    ]
    
    # Extract experience sections
    lines = text.split('\n')
    in_experience_section = False
    current_experience = ""
    
    for i, line in enumerate(lines):
        line_lower = line.lower()
        
        # Check if this line indicates the start of experience section
        if any(indicator in line_lower for indicator in exp_indicators):
            in_experience_section = True
            continue
        
        # Check if we're in an experience section and collect information
        if in_experience_section:
            # Check if this line might be the start of a new section
            if line.strip() and (line.isupper() or line.strip().endswith(':')):
                if current_experience:
                    experiences.append(current_experience.strip())
                    current_experience = ""
                if len(experiences) >= 3:  # Limit to 3 experiences
                    break
            
            # Add the line to current experience
            if line.strip():
                current_experience += line.strip() + " "
    
    # Add the last experience if present
    if current_experience and len(experiences) < 3:
        experiences.append(current_experience.strip())
    
    return experiences[:3]  # Limit to 3 experience entries 