import json
import os
import time
import argparse
from openai import OpenAI
from collections import defaultdict

# Configuration
# Hardcoded API key directly in the code
OPENAI_API_KEY = "key"

MODEL = "gpt-4-turbo-preview"  # You can change to a different model if needed
MAX_RETRIES = 3
RETRY_DELAY = 5  # seconds

# Get the script directory and set up paths
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)  # Parent directory of scripts
DATA_DIR = os.path.join(PROJECT_ROOT, "data")

# Paths
QUIZZES_PATH = os.path.join(DATA_DIR, "quizzes.json")
QUESTIONS_PATH = os.path.join(DATA_DIR, "questions.json")
CONTENT_QUIZ_PATH = os.path.join(DATA_DIR, "content-quiz.json")

def load_json_file(file_path):
    """Load JSON data from a file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading {file_path}: {e}")
        return None

def save_json_file(data, file_path):
    """Save JSON data to a file."""
    try:
        # Make sure the directory exists
        directory = os.path.dirname(file_path)
        if not os.path.exists(directory):
            os.makedirs(directory)
            
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"Successfully saved data to {file_path}")
        return True
    except Exception as e:
        print(f"Error saving to {file_path}: {e}")
        return False

def get_quiz_questions(quiz_id, questions_data):
    """Extract questions for a specific quiz."""
    for quiz in questions_data.get("quizzes", []):
        if quiz["id"] == quiz_id:
            return quiz["questions"]
    return []

def create_prompt(quiz, questions=None):
    """Create a detailed prompt for the OpenAI API."""
    # Prepare sample questions text
    if questions and len(questions) > 0:
        sample_questions = [q["text"] for q in questions[:5] if "text" in q]
    else:
        sample_questions = []
    
    # Get tags and category info
    tags = quiz.get('tags', [])
    tags_text = ', '.join(tags) if tags else "No specific tags"
    category = quiz.get('categoryId', 'general')
    subcategory = quiz.get('subcategoryId', 'general')
    
    prompt = f"""
Create detailed, informative, and SEO-optimized content about "{quiz['name']}" for a trivia website.
The content should provide educational value related to this quiz's topic: {quiz['description']}

The content should:
1. Include a compelling headline
2. Provide comprehensive background information on the topic
3. Include relevant historical context, key figures, important developments, or interesting facts
4. Be educational and well-structured with proper paragraphing
5. Be factually accurate and well-researched
6. Include proper HTML formatting using these classes: 'text-2xl font-bold mb-4' for headers, 'text-gray-700 leading-relaxed mb-4' for paragraphs
7. Follow this structure: headline (h2), 2-3 informative paragraphs, and a keywords section
"""

    # Add sample questions if available
    if sample_questions:
        prompt += f"\nHere are some sample questions from the quiz to guide your content generation:\n{sample_questions}\n"
    else:
        prompt += f"\nNo sample questions are available, but please create content that would be relevant for a quiz about {quiz['name']} and covers topics that would be appropriate for the quiz description: {quiz['description']}\n"

    prompt += f"""
Tags related to this quiz: {tags_text}
Category: {category}
Subcategory: {subcategory}

Format your response as a complete HTML article with Schema.org markup to enhance SEO, similar to this example:
<article itemscope itemtype='https://schema.org/Article'>
    <h2 class='text-2xl font-bold mb-4' itemprop='headline'>Academy Awards: A Comprehensive Guide to Oscar History</h2>
    <div itemprop='articleBody'>
        <p class='text-gray-700 leading-relaxed mb-4'>First paragraph...</p>
        <p class='text-gray-700 leading-relaxed mb-4'>Second paragraph...</p>
        <p class='text-gray-700 leading-relaxed'>Third paragraph...</p>
    </div>
    <div class='mt-4 text-sm text-gray-500' itemprop='keywords'>Keywords: keyword1, keyword2, etc.</div>
</article>
"""
    return prompt

def generate_content_with_openai(prompt, client):
    """Generate content using OpenAI API with retries."""
    for attempt in range(MAX_RETRIES):
        try:
            # Ensure we're using the correct API key
            response = client.chat.completions.create(
                model=MODEL,
                messages=[
                    {"role": "system", "content": "You are a knowledgeable content writer specializing in educational material for trivia websites."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=1000,
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"Attempt {attempt + 1} failed: {e}")
            if attempt < MAX_RETRIES - 1:
                print(f"Retrying in {RETRY_DELAY} seconds...")
                time.sleep(RETRY_DELAY)
            else:
                print("Max retries reached, skipping this quiz.")
                return None

def analyze_missing_content(quizzes_data, existing_quiz_ids):
    """Analyze what content is missing by category and subcategory."""
    missing_content = defaultdict(lambda: defaultdict(list))
    
    for quiz in quizzes_data["quizzes"]:
        quiz_id = quiz["id"]
        if quiz_id not in existing_quiz_ids:
            category_id = quiz.get("categoryId", "unknown")
            subcategory_id = quiz.get("subcategoryId", "unknown")
            missing_content[category_id][subcategory_id].append(quiz)
    
    # Print summary of missing content
    print("\n=== MISSING CONTENT SUMMARY ===")
    
    total_missing = sum(sum(len(quizzes) for quizzes in subcategories.values()) for subcategories in missing_content.values())
    print(f"Total quizzes missing content: {total_missing}")
    
    for category_id, subcategories in missing_content.items():
        category_total = sum(len(quizzes) for quizzes in subcategories.values())
        print(f"\nCategory '{category_id}': {category_total} quizzes missing content")
        
        for subcategory_id, quizzes in subcategories.items():
            quiz_names = [f"{quiz['name']} ({quiz['id']})" for quiz in quizzes]
            print(f"  - Subcategory '{subcategory_id}': {len(quizzes)} quizzes missing content")
            for quiz_name in quiz_names:
                print(f"    * {quiz_name}")
    
    return missing_content

def main():
    # Parse command line arguments
    parser = argparse.ArgumentParser(description='Generate quiz content')
    parser.add_argument('--start-from', dest='start_from_id', type=str, 
                        help='Start generating from this quiz ID (inclusive)', default=None)
    parser.add_argument('--force-all', dest='force_all', action='store_true',
                        help='Generate content for all quizzes, even those without questions')
    parser.add_argument('--analyze-only', action='store_true',
                        help='Only analyze missing content without generating any')
    parser.add_argument('--category', type=str, help='Process only this category ID', default=None)
    parser.add_argument('--subcategory', type=str, help='Process only this subcategory ID', default=None)
    parser.add_argument('--max', type=int, help='Maximum number of quizzes to process', default=None)
    args = parser.parse_args()
    
    # Print path information
    print(f"Script directory: {SCRIPT_DIR}")
    print(f"Project root: {PROJECT_ROOT}")
    print(f"Data directory: {DATA_DIR}")
    print(f"Quizzes path: {QUIZZES_PATH}")
    print(f"Questions path: {QUESTIONS_PATH}")
    print(f"Content quiz path: {CONTENT_QUIZ_PATH}")
    
    # Initialize OpenAI client
    client = OpenAI(api_key=OPENAI_API_KEY)
    
    # Print API key info for debugging (don't show full key)
    key_preview = OPENAI_API_KEY[:4] + "..." + OPENAI_API_KEY[-4:] if OPENAI_API_KEY else "None"
    print(f"Using API key: {key_preview}")
    
    # Load data files
    quizzes_data = load_json_file(QUIZZES_PATH)
    if not quizzes_data:
        print("Failed to load quizzes data. Exiting.")
        return
    
    questions_data = load_json_file(QUESTIONS_PATH) or {"quizzes": []}
    
    # Load existing content quiz data or create new structure
    try:
        content_quiz_data = load_json_file(CONTENT_QUIZ_PATH)
        if not content_quiz_data:
            content_quiz_data = {"contents": []}
    except:
        content_quiz_data = {"contents": []}
    
    # Create a set of quizzes that already have content
    existing_quiz_ids = {content["quizId"] for content in content_quiz_data.get("contents", [])}
    print(f"Found {len(existing_quiz_ids)} quizzes with existing content.")
    
    # Analyze missing content
    missing_content = analyze_missing_content(quizzes_data, existing_quiz_ids)
    
    # If we're only analyzing, exit here
    if args.analyze_only:
        print("\nAnalysis complete. Exiting without generating content.")
        return
    
    # Filter quizzes based on command-line arguments
    filtered_quizzes = []
    for quiz in quizzes_data["quizzes"]:
        quiz_id = quiz["id"]
        
        # Skip if content already exists
        if quiz_id in existing_quiz_ids:
            continue
        
        # Filter by category if specified
        if args.category and quiz.get("categoryId") != args.category:
            continue
        
        # Filter by subcategory if specified
        if args.subcategory and quiz.get("subcategoryId") != args.subcategory:
            continue
        
        filtered_quizzes.append(quiz)
    
    # Determine if we're starting from a specific quiz ID
    if args.start_from_id:
        start_idx = next((i for i, quiz in enumerate(filtered_quizzes) if quiz["id"] == args.start_from_id), 0)
        filtered_quizzes = filtered_quizzes[start_idx:]
        print(f"Starting from quiz ID {args.start_from_id} (position {start_idx + 1})")
    
    # Limit the number of quizzes to process if specified
    if args.max and len(filtered_quizzes) > args.max:
        filtered_quizzes = filtered_quizzes[:args.max]
        print(f"Processing only the first {args.max} quizzes")
    
    # Process the filtered quizzes
    total_to_process = len(filtered_quizzes)
    print(f"\nReady to process {total_to_process} quizzes")
    
    # Process each quiz
    for i, quiz in enumerate(filtered_quizzes):
        quiz_id = quiz["id"]
        
        print(f"[{i+1}/{total_to_process}] Generating content for quiz: {quiz['name']} ({quiz_id})")
        print(f"  Category: {quiz.get('categoryId', 'unknown')}, Subcategory: {quiz.get('subcategoryId', 'unknown')}")
        
        # Get questions for this quiz
        questions = get_quiz_questions(quiz_id, questions_data)
        
        if not questions and not args.force_all:
            print(f"  No questions found for quiz {quiz_id}. Use --force-all to generate content without questions. Skipping.")
            continue
        
        # Create prompt and generate content
        prompt = create_prompt(quiz, questions)
        content_html = generate_content_with_openai(prompt, client)
        
        if content_html:
            # Add to content_quiz_data
            content_entry = {
                "quizId": quiz_id,
                "categoryId": quiz.get("categoryId", "unknown"),
                "subcategoryId": quiz.get("subcategoryId", "unknown"),
                "content": content_html
            }
            content_quiz_data.setdefault("contents", []).append(content_entry)
            existing_quiz_ids.add(quiz_id)  # Update the set of existing quizzes
            
            # Save after each successful generation to prevent data loss
            save_json_file(content_quiz_data, CONTENT_QUIZ_PATH)
            print(f"  Successfully generated and saved content for {quiz['name']}")
            
            # Add a delay to avoid rate limiting
            time.sleep(1)
        else:
            print(f"  Failed to generate content for {quiz['name']}")
    
    print("Content generation complete!")
    
    # Final summary
    print("\n=== FINAL SUMMARY ===")
    total_quizzes = len(quizzes_data["quizzes"])
    total_with_content = len(existing_quiz_ids)
    print(f"Total quizzes: {total_quizzes}")
    print(f"Quizzes with content: {total_with_content} ({(total_with_content/total_quizzes)*100:.1f}%)")
    print(f"Quizzes without content: {total_quizzes - total_with_content} ({((total_quizzes - total_with_content)/total_quizzes)*100:.1f}%)")

if __name__ == "__main__":
    main() 