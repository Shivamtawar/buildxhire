from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from datetime import datetime
import json
import os
from dotenv import load_dotenv
import uuid
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from groq import Groq

# Load environment variables
load_dotenv()

# Initialize Flask app with static files configuration
app = Flask(__name__, static_folder='frontend/dist', static_url_path='')
CORS(app)

# Configure Groq API
groq_api_key = os.getenv('GROQ_API_KEY')
if not groq_api_key:
    raise ValueError('GROQ_API_KEY environment variable is not set')

# Initialize Groq client
groq_client = Groq(api_key=groq_api_key)

# In-memory storage (replace with Firebase in production)
sessions = {}
candidate_profiles = {}
interview_responses = {}

# Constants
DIFFICULTY_LEVELS = ['EASY', 'MEDIUM', 'HARD']
TIME_LIMITS = {
    'EASY': 90,
    'MEDIUM': 120,
    'HARD': 180
}
MAX_QUESTIONS = 10
FAIL_THRESHOLD = 3
SCORE_THRESHOLD_UP = 70
SCORE_THRESHOLD_DOWN = 50

# Groq model to use - llama3-70b is very capable and fast
GROQ_MODEL = "llama-3.3-70b-versatile"  # or "mixtral-8x7b-32768" or "llama-3.1-70b-versatile"

# ======================
# HELPER FUNCTIONS
# ======================

def call_groq_api(prompt, temperature=0.3, max_tokens=2000):
    """
    Call Groq API with the given prompt
    
    Args:
        prompt: The prompt to send
        temperature: Controls randomness (0-2)
        max_tokens: Maximum tokens in response
    
    Returns:
        str: The model's response text
    """
    try:
        chat_completion = groq_client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful AI assistant that provides accurate, concise responses in the requested format."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            model=GROQ_MODEL,
            temperature=temperature,
            max_tokens=max_tokens,
        )
        
        return chat_completion.choices[0].message.content.strip()
        
    except Exception as e:
        print(f"Groq API error: {e}")
        raise e

def get_embedding_simple(text):
    """
    Simple embedding using word frequency (fallback without API)
    For production, use a proper embedding model or API
    """
    # This is a simplified version - you can use sentence-transformers locally
    # or integrate with Groq's future embedding endpoints
    words = text.lower().split()
    vocab = list(set(words))
    vector = [words.count(word) for word in vocab[:100]]  # Limit to 100 features
    
    # Pad or truncate to fixed size
    fixed_size = 100
    if len(vector) < fixed_size:
        vector.extend([0] * (fixed_size - len(vector)))
    else:
        vector = vector[:fixed_size]
    
    return np.array(vector, dtype=float)

def calculate_semantic_similarity(text1, text2):
    """Calculate cosine similarity between two texts"""
    try:
        emb1 = get_embedding_simple(text1)
        emb2 = get_embedding_simple(text2)
        
        if len(emb1) > 0 and len(emb2) > 0:
            similarity = cosine_similarity(
                [emb1], [emb2]
            )[0][0]
            return float(similarity) * 100  # Convert to percentage
        return 0
    except Exception as e:
        print(f"Similarity calculation error: {e}")
        return 0

# ======================
# RESUME INTELLIGENCE MODULE
# ======================

@app.route('/resume/analyze', methods=['POST'])
def analyze_resume():
    """Analyze candidate information and extract structured profile"""
    try:
        data = request.json
        resume_text = data.get('resume_text', '')
        
        if not resume_text:
            return jsonify({'error': 'Candidate information is required'}), 400
        
        # AI Prompt for candidate analysis (accepts resume, PDF text, or "about me" text)
        prompt = f"""Analyze the following candidate information and extract structured data in JSON format.
The input can be a resume, PDF content, or a personal description about the candidate.

Candidate Information:
{resume_text}

Extract and return ONLY a valid JSON object with this exact structure:
{{
    "skills": ["skill1", "skill2", ...],
    "experience_years": <number>,
    "projects": ["project1", "project2", ...],
    "primary_domain": "domain name"
}}

Rules:
- skills: List all technical and professional skills mentioned (extract from any format)
- experience_years: Calculate total years of experience (estimate if needed, default to 0 if unclear)
- projects: List major projects mentioned (or empty array if none)
- primary_domain: Primary field/domain (e.g., "Web Development", "Data Science", "Backend Engineering", "DevOps", etc.)

Return ONLY the JSON object, no explanation or markdown formatting."""
        
        response_text = call_groq_api(prompt, temperature=0.2)
        
        # Clean response (remove markdown code blocks if present)
        if response_text.startswith('```json'):
            response_text = response_text.replace('```json', '').replace('```', '').strip()
        elif response_text.startswith('```'):
            response_text = response_text.replace('```', '').strip()
        
        candidate_profile = json.loads(response_text)
        
        # Validate structure
        required_keys = ['skills', 'experience_years', 'projects', 'primary_domain']
        if not all(key in candidate_profile for key in required_keys):
            raise ValueError("Invalid profile structure from AI")
        
        # Store profile
        candidate_id = str(uuid.uuid4())
        candidate_profiles[candidate_id] = candidate_profile
        
        return jsonify({
            'candidate_id': candidate_id,
            'candidate_profile': candidate_profile
        }), 200
        
    except json.JSONDecodeError as e:
        return jsonify({'error': f'Failed to parse AI response: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ======================
# RESUME-JD MATCHING MODULE
# ======================

@app.route('/resume/match-jd', methods=['POST'])
def match_resume_to_jd():
    """Analyze resume compatibility with job description"""
    try:
        data = request.json
        resume_text = data.get('resume_text', '')
        job_description = data.get('job_description', '')
        candidate_id = data.get('candidate_id', '')
        
        if not resume_text or not job_description:
            return jsonify({'error': 'resume_text and job_description are required'}), 400
        
        # Get candidate profile (analyze if not exists)
        if candidate_id and candidate_id in candidate_profiles:
            candidate_profile = candidate_profiles[candidate_id]
        else:
            # Analyze resume on the fly
            analyze_prompt = f"""Analyze the following candidate information and extract structured data in JSON format.

Candidate Information:
{resume_text}

Extract and return ONLY a valid JSON object with this exact structure:
{{
    "skills": ["skill1", "skill2", ...],
    "experience_years": <number>,
    "projects": ["project1", "project2", ...],
    "primary_domain": "domain name"
}}"""
            response_text = call_groq_api(analyze_prompt, temperature=0.2)
            if response_text.startswith('```'):
                response_text = response_text.replace('```json', '').replace('```', '').strip()
            candidate_profile = json.loads(response_text)
        
        # AI analysis prompt
        matching_prompt = f"""Analyze the compatibility between a candidate's resume and a job description.

RESUME:
{resume_text}

JOB DESCRIPTION:
{job_description}

Candidate Profile:
- Skills: {', '.join(candidate_profile.get('skills', []))}
- Experience: {candidate_profile.get('experience_years', 0)} years
- Domain: {candidate_profile.get('primary_domain', 'Unknown')}

Provide a detailed JSON analysis with:

{{
    "ats_score": <0-100 number>,
    "overall_match": <0-100 number>,
    "skill_match_percentage": <0-100 number>,
    "matched_skills": ["skill1", "skill2", ...],
    "missing_skills": ["skill1", "skill2", ...],
    "matched_requirements": ["req1", "req2", ...],
    "unmet_requirements": ["req1", "req2", ...],
    "experience_match": "Suitable" | "Under-experienced" | "Over-qualified",
    "summary": "Brief assessment of fit",
    "strengths": ["strength1", "strength2"],
    "gaps": ["gap1", "gap2"],
    "recommendations": ["suggestion1", "suggestion2"]
}}

ATS Score: How well the resume will pass ATS screening (0-100)
Overall Match: How well candidate matches the job (0-100)
Skill Match: Percentage of job-required skills the candidate has
Experience Match: Whether experience level aligns with job level

Return ONLY the JSON object."""
        
        match_text = call_groq_api(matching_prompt, temperature=0.3, max_tokens=2000)
        
        if match_text.startswith('```'):
            match_text = match_text.replace('```json', '').replace('```', '').strip()
        
        match_data = json.loads(match_text)
        
        return jsonify({
            'ats_score': match_data.get('ats_score', 0),
            'overall_match': match_data.get('overall_match', 0),
            'skill_match_percentage': match_data.get('skill_match_percentage', 0),
            'matched_skills': match_data.get('matched_skills', []),
            'missing_skills': match_data.get('missing_skills', []),
            'matched_requirements': match_data.get('matched_requirements', []),
            'unmet_requirements': match_data.get('unmet_requirements', []),
            'experience_match': match_data.get('experience_match', 'Unknown'),
            'summary': match_data.get('summary', ''),
            'strengths': match_data.get('strengths', []),
            'gaps': match_data.get('gaps', []),
            'recommendations': match_data.get('recommendations', [])
        }), 200
        
    except json.JSONDecodeError as e:
        return jsonify({'error': f'Failed to parse matching response: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/resume/rewrite', methods=['POST'])
def rewrite_resume():
    """Rewrite resume to better match job description using AI"""
    try:
        data = request.json
        original_resume = data.get('resume_text', '')
        job_description = data.get('job_description', '')
        focus_areas = data.get('focus_areas', [])  # Optional: specific areas to focus on
        
        if not original_resume or not job_description:
            return jsonify({'error': 'resume_text and job_description are required'}), 400
        
        # Build focus areas text
        focus_text = ""
        if focus_areas:
            focus_text = f"\n\nPriority areas to improve:\n" + "\n".join(f"- {area}" for area in focus_areas)
        
        # Rewrite prompt
        rewrite_prompt = f"""You are an expert resume writer. Rewrite the following resume to better match the job description while keeping all factual information accurate.

ORIGINAL RESUME:
{original_resume}

TARGET JOB DESCRIPTION:
{job_description}
{focus_text}

INSTRUCTIONS:
1. Keep all factual information accurate - only rephrase and reorganize
2. Highlight relevant skills that match the job
3. Use keywords from the job description naturally
4. Improve ATS optimization (use bullets, clear sections)
5. Emphasize experience relevant to the job
6. Make achievements more impactful
7. Maintain professional formatting
8. Add missing section headers if needed (Skills, Projects, etc.)

Return the rewritten resume ONLY - no explanations or commentary."""
        
        rewritten_resume = call_groq_api(rewrite_prompt, temperature=0.5, max_tokens=3000)
        
        # Clean response
        rewritten_resume = rewritten_resume.strip()
        
        return jsonify({
            'original_resume': original_resume,
            'rewritten_resume': rewritten_resume,
            'message': 'Resume has been optimized for the job description'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ======================
# INTERVIEW SESSION ENGINE
# ======================

@app.route('/interview/start', methods=['POST'])
def start_interview():
    """Initialize interview session"""
    try:
        data = request.json
        candidate_id = data.get('candidate_id', '')
        job_description = data.get('job_description', '')
        
        if not candidate_id or not job_description:
            return jsonify({'error': 'candidate_id and job_description are required'}), 400
        
        # Get candidate profile
        candidate_profile = candidate_profiles.get(candidate_id)
        if not candidate_profile:
            return jsonify({'error': 'Candidate profile not found. Please analyze resume first.'}), 404
        
        # Create session
        session_id = str(uuid.uuid4())
        sessions[session_id] = {
            'session_id': session_id,
            'candidate_id': candidate_id,
            'job_description': job_description,
            'difficulty': 'EASY',
            'question_count': 0,
            'scores': [],
            'fail_streak': 0,
            'time_used': 0,
            'status': 'ACTIVE',
            'started_at': datetime.now().isoformat()
        }
        
        interview_responses[session_id] = []
        
        # Generate first question
        first_question = generate_question(session_id)
        
        return jsonify({
            'session_id': session_id,
            'first_question': first_question['question'],
            'difficulty': 'EASY',
            'time_limit': TIME_LIMITS['EASY']
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ======================
# QUESTION GENERATION ENGINE
# ======================

def generate_question(session_id):
    """Generate adaptive interview question"""
    session = sessions[session_id]
    candidate_profile = candidate_profiles[session['candidate_id']]
    
    difficulty = session['difficulty']
    jd = session['job_description']
    
    # Get past questions to avoid repetition
    past_questions = [r['question'] for r in interview_responses.get(session_id, [])]
    past_questions_text = "\n".join(f"- {q}" for q in past_questions) if past_questions else "None"
    
    prompt = f"""You are an expert technical interviewer. Generate ONE interview question.

Job Description:
{jd}

Candidate Information:
- Skills: {', '.join(candidate_profile['skills'])}
- Domain: {candidate_profile['primary_domain']}
- Experience: {candidate_profile['experience_years']} years

Difficulty Level: {difficulty}

Past Questions Already Asked:
{past_questions_text}

Requirements:
- Question must be relevant to the job description
- Difficulty must match {difficulty} level:
  * EASY: Basic concepts, definitions, simple scenarios (suitable for entry-level)
  * MEDIUM: Practical applications, problem-solving, trade-offs (suitable for mid-level)
  * HARD: System design, advanced concepts, complex scenarios (suitable for senior-level)
- Do NOT repeat or rephrase past questions
- Question should be clear, specific, and focused on ONE topic
- Keep question concise (1-3 sentences)

Return ONLY the question text, no explanation, no preamble, no formatting."""
    
    question_text = call_groq_api(prompt, temperature=0.7)
    
    # Clean up any extra formatting
    question_text = question_text.strip().strip('"\'')
    
    return {
        'question': question_text,
        'difficulty': difficulty,
        'time_limit': TIME_LIMITS[difficulty],
        'skill_area': candidate_profile['primary_domain']
    }

@app.route('/interview/next-question', methods=['GET'])
def get_next_question():
    """Fetch next adaptive question"""
    try:
        session_id = request.args.get('session_id')
        
        if not session_id or session_id not in sessions:
            return jsonify({'error': 'Invalid session_id'}), 404
        
        session = sessions[session_id]
        
        if session['status'] != 'ACTIVE':
            return jsonify({'error': 'Interview session is not active'}), 400
        
        # Check if max questions reached
        if session['question_count'] >= MAX_QUESTIONS:
            return jsonify({'error': 'Maximum questions reached'}), 400
        
        question_data = generate_question(session_id)
        
        return jsonify({
            'question': question_data['question'],
            'difficulty': question_data['difficulty'],
            'time_limit': question_data['time_limit']
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ======================
# ANSWER EVALUATION ENGINE
# ======================

@app.route('/interview/answer', methods=['POST'])
def submit_answer():
    """Submit and evaluate answer"""
    try:
        data = request.json
        session_id = data.get('session_id', '')
        question = data.get('question', '')
        answer_text = data.get('answer_text', '')
        time_taken = data.get('time_taken', 0)
        
        if not session_id or session_id not in sessions:
            return jsonify({'error': 'Invalid session_id'}), 404
        
        session = sessions[session_id]
        candidate_profile = candidate_profiles[session['candidate_id']]
        
        # Evaluate answer
        evaluation = evaluate_answer(
            question, 
            answer_text, 
            time_taken, 
            session['difficulty'],
            session['job_description'],
            candidate_profile
        )
        
        # Store response
        response_data = {
            'question': question,
            'answer': answer_text,
            'score': evaluation['score'],
            'time_taken': time_taken,
            'difficulty': session['difficulty'],
            'feedback': evaluation['feedback']
        }
        interview_responses[session_id].append(response_data)
        
        # Update session
        session['scores'].append(evaluation['score'])
        session['time_used'] += time_taken
        session['question_count'] += 1
        
        # Adaptation logic
        next_difficulty, status, fail_streak = adapt_difficulty(session, evaluation['score'])
        session['difficulty'] = next_difficulty
        session['fail_streak'] = fail_streak
        
        # Check termination conditions
        if status == 'TERMINATED':
            session['status'] = 'TERMINATED'
            return jsonify({
                'score': evaluation['score'],
                'status': 'TERMINATED',
                'feedback': evaluation['feedback'],
                'reason': 'Failed 3 consecutive questions',
                'message': 'Interview terminated due to poor performance'
            }), 200
        
        # Check if max questions reached
        if session['question_count'] >= MAX_QUESTIONS:
            session['status'] = 'COMPLETED'
        
        return jsonify({
            'score': evaluation['score'],
            'status': status,
            'feedback': evaluation['feedback'],
            'next_difficulty': next_difficulty,
            'questions_remaining': MAX_QUESTIONS - session['question_count']
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def evaluate_answer(question, answer, time_taken, difficulty, job_description, candidate_profile):
    """Evaluate answer using AI"""
    
    prompt = f"""You are evaluating a technical interview answer. Be fair but thorough.

Question: {question}
Candidate's Answer: {answer}
Difficulty Level: {difficulty}
Job Requirements: {job_description}

Evaluation Criteria:
1. Technical Accuracy (40%): Is the answer factually correct?
2. Relevance (20%): Does it directly address the question?
3. Depth (20%): Is the explanation detailed enough for the difficulty level?
4. Job Alignment (20%): Does it demonstrate skills relevant to the job?

Provide your evaluation in this EXACT JSON format:
{{
    "score": <number between 0-100>,
    "feedback": "<2-3 sentences of constructive feedback>"
}}

Guidelines for scoring:
- 90-100: Excellent answer, demonstrates mastery
- 70-89: Good answer, solid understanding
- 50-69: Average answer, meets minimum requirements
- 30-49: Below average, significant gaps
- 0-29: Poor answer, fundamental misunderstandings

Return ONLY the JSON object, no other text."""
    
    try:
        response_text = call_groq_api(prompt, temperature=0.3)
        
        # Clean response
        if response_text.startswith('```json'):
            response_text = response_text.replace('```json', '').replace('```', '').strip()
        elif response_text.startswith('```'):
            response_text = response_text.replace('```', '').strip()
        
        evaluation = json.loads(response_text)
        base_score = float(evaluation['score'])
        
        # Apply time penalty
        time_limit = TIME_LIMITS[difficulty]
        if time_taken > time_limit:
            overtime_penalty = min(20, (time_taken - time_limit) / time_limit * 20)
            final_score = max(0, base_score - overtime_penalty)
            evaluation['feedback'] += f" (Time penalty applied: -{overtime_penalty:.1f} points)"
        else:
            final_score = base_score
        
        # Brevity penalty (very short answers)
        if len(answer.strip()) < 20:
            final_score = max(0, final_score - 15)
            evaluation['feedback'] += " Answer is too brief."
        
        evaluation['score'] = round(final_score, 2)
        return evaluation
        
    except json.JSONDecodeError as e:
        print(f"JSON parse error: {e}, Response: {response_text}")
        # Fallback evaluation
        return {
            'score': 50,
            'feedback': 'Unable to evaluate answer properly. Please try again.'
        }
    except Exception as e:
        print(f"Evaluation error: {e}")
        # Fallback evaluation
        return {
            'score': 50,
            'feedback': 'Unable to evaluate answer properly. Please try again.'
        }

# ======================
# ADAPTATION ENGINE
# ======================

def adapt_difficulty(session, latest_score):
    """Adapt difficulty based on performance"""
    current_difficulty = session['difficulty']
    fail_streak = session['fail_streak']
    
    # Update fail streak
    if latest_score < SCORE_THRESHOLD_DOWN:
        fail_streak += 1
    else:
        fail_streak = 0
    
    # Check for termination
    if fail_streak >= FAIL_THRESHOLD:
        return current_difficulty, 'TERMINATED', fail_streak
    
    # Adapt difficulty
    current_idx = DIFFICULTY_LEVELS.index(current_difficulty)
    
    if latest_score >= SCORE_THRESHOLD_UP and current_idx < len(DIFFICULTY_LEVELS) - 1:
        # Increase difficulty
        next_difficulty = DIFFICULTY_LEVELS[current_idx + 1]
        status = 'CLEARED'
    elif latest_score < SCORE_THRESHOLD_DOWN and current_idx > 0:
        # Decrease difficulty
        next_difficulty = DIFFICULTY_LEVELS[current_idx - 1]
        status = 'WARNING'
    else:
        # Maintain difficulty
        next_difficulty = current_difficulty
        status = 'CLEARED' if latest_score >= SCORE_THRESHOLD_DOWN else 'WARNING'
    
    return next_difficulty, status, fail_streak

# ======================
# INTERVIEW TERMINATION ENGINE
# ======================

@app.route('/interview/end', methods=['POST'])
def end_interview():
    """End interview and generate final report"""
    try:
        data = request.json
        session_id = data.get('session_id', '')
        
        if not session_id or session_id not in sessions:
            return jsonify({'error': 'Invalid session_id'}), 404
        
        session = sessions[session_id]
        responses = interview_responses.get(session_id, [])
        
        if not responses:
            return jsonify({'error': 'No responses found for this session'}), 400
        
        # Calculate final score
        scores = session['scores']
        final_score = round(sum(scores) / len(scores), 2) if scores else 0
        
        # Determine category
        if final_score >= 75:
            category = 'STRONG'
            hiring_readiness = 'YES'
        elif final_score >= 60:
            category = 'GOOD'
            hiring_readiness = 'MAYBE'
        elif final_score >= 45:
            category = 'AVERAGE'
            hiring_readiness = 'NO'
        else:
            category = 'WEAK'
            hiring_readiness = 'NO'
        
        # Generate strengths and weaknesses using AI
        qa_summary = "\n".join([
            f"Q{i+1} (Score: {r['score']}): {r['question'][:100]}...\nA: {r['answer'][:150]}..."
            for i, r in enumerate(responses)
        ])
        
        feedback_prompt = f"""Analyze this technical interview performance and provide actionable feedback.

Final Score: {final_score}/100
Total Questions: {len(responses)}
Performance Category: {category}

Question-Answer Summary:
{qa_summary}

Provide a JSON response with:
1. Top 3 strengths demonstrated by the candidate
2. Top 3 areas needing improvement

Format:
{{
    "strengths": ["strength 1", "strength 2", "strength 3"],
    "weaknesses": ["area for improvement 1", "area for improvement 2", "area for improvement 3"]
}}

Be specific and constructive. Return ONLY the JSON object."""
        
        try:
            feedback_text = call_groq_api(feedback_prompt, temperature=0.4)
            
            # Clean response
            if feedback_text.startswith('```json'):
                feedback_text = feedback_text.replace('```json', '').replace('```', '').strip()
            elif feedback_text.startswith('```'):
                feedback_text = feedback_text.replace('```', '').strip()
            
            feedback_data = json.loads(feedback_text)
            strengths = feedback_data.get('strengths', ['Completed the interview'])
            weaknesses = feedback_data.get('weaknesses', ['Continue practicing technical concepts'])
            
        except Exception as e:
            print(f"Feedback generation error: {e}")
            strengths = ['Completed the interview', 'Answered all questions', 'Demonstrated effort']
            weaknesses = ['Continue practicing', 'Review fundamental concepts', 'Improve response depth']
        
        # Update session status
        session['status'] = 'COMPLETED'
        session['ended_at'] = datetime.now().isoformat()
        
        return jsonify({
            'final_score': final_score,
            'category': category,
            'strengths': strengths,
            'weaknesses': weaknesses,
            'hiring_readiness': hiring_readiness,
            'total_questions': len(responses),
            'total_time': session['time_used'],
            'score_breakdown': {
                'EASY': [r['score'] for r in responses if r['difficulty'] == 'EASY'],
                'MEDIUM': [r['score'] for r in responses if r['difficulty'] == 'MEDIUM'],
                'HARD': [r['score'] for r in responses if r['difficulty'] == 'HARD']
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ======================
# UTILITY ENDPOINTS
# ======================

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model': GROQ_MODEL,
        'active_sessions': len([s for s in sessions.values() if s['status'] == 'ACTIVE'])
    }), 200

@app.route('/session/<session_id>', methods=['GET'])
def get_session_status(session_id):
    """Get current session status"""
    if session_id not in sessions:
        return jsonify({'error': 'Session not found'}), 404
    
    session = sessions[session_id]
    responses = interview_responses.get(session_id, [])
    
    return jsonify({
        'session': session,
        'responses_count': len(responses),
        'average_score': round(sum(session['scores']) / len(session['scores']), 2) if session['scores'] else 0
    }), 200

# ======================
# STATIC FILE SERVING (FRONTEND)
# ======================

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    """Serve React frontend files"""
    # If the path is a file in the dist folder, serve it
    if path and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    # Otherwise, serve index.html (for client-side routing)
    return send_from_directory(app.static_folder, 'index.html')

# ======================
# MAIN
# ======================

if __name__ == '__main__':
    print(f"🚀 Starting AI Interview Platform with Groq ({GROQ_MODEL})")
    print("📋 Endpoints available:")
    print("\n📄 RESUME ENDPOINTS:")
    print("   POST /resume/analyze - Analyze resume and extract profile")
    print("   POST /resume/match-jd - Check resume-JD compatibility with ATS score")
    print("   POST /resume/rewrite - Rewrite resume to match JD better")
    print("\n🎯 INTERVIEW ENDPOINTS:")
    print("   POST /interview/start - Start interview")
    print("   GET  /interview/next-question - Get next question")
    print("   POST /interview/answer - Submit answer")
    print("   POST /interview/end - End interview")
    print("\n🔧 UTILITY ENDPOINTS:")
    print("   GET  /health - Health check")
    print("   GET  /session/<id> - Session status")
    port = int(os.getenv('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)