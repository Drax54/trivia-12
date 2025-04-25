"""
Trivia App Data Generator using OpenAI API

This script generates JSON data for quizzes and their questions using the OpenAI API.
It takes user input in the format "Under [Category], [Subcategory1], [Subcategory2], [Subcategory3]..."
and generates appropriate JSON files that match the existing format.

Usage: python generate-data-openai.py

Prerequisites:
- Python 3.6+
- OpenAI API key set as an environment variable OPENAI_API_KEY
- Required packages: openai, python-dotenv, os, json, datetime, re, random

Installation:
pip install openai python-dotenv
"""

import os
import json
import datetime
import re
import time
import random
from openai import OpenAI

# Hardcoded API key directly in the code
OPENAI_API_KEY = "key"

# Initialize OpenAI client
client = OpenAI(api_key=OPENAI_API_KEY)

# Configuration
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "generated")
TIMESTAMP = datetime.datetime.now().strftime("%Y-%m-%d-%H-%M-%S")
MODEL = "gpt-4-turbo"  # Default to GPT-4 Turbo

# Create output directory if it doesn't exist
os.makedirs(OUTPUT_DIR, exist_ok=True)

def parse_input(user_input):
    """
    Parse user input in the format "Under [Category], [Subcategory1], [Subcategory2], ..."
    
    Returns:
        tuple: (category, subcategories)
    """
    # Match "Under X" or "Under the X" at the beginning
    category_match = re.match(r"Under\s+(?:the\s+)?([^,]+?)\s*(?:Sub\s*C[a-z]*)?", user_input, re.IGNORECASE)
    
    if not category_match:
        raise ValueError("Input must start with 'Under [Category]'")
    
    category = category_match.group(1).strip()
    
    # Remove the category part and split the rest by commas
    remaining = user_input[category_match.end():].strip()
    if remaining.startswith(","):
        remaining = remaining[1:].strip()
    
    subcategories = [s.strip() for s in remaining.split(",") if s.strip()]
    
    return category, subcategories

def call_openai_api(system_prompt, user_prompt, temperature=0.7):
    """
    Call OpenAI API with system and user prompts
    
    Returns:
        str: The API response content
    """
    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=temperature
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Error calling OpenAI API: {e}")
        raise

def generate_quizzes_data(category, subcategories):
    """
    Generate quizzes data for the given category and subcategories
    
    Returns:
        dict: Quizzes data in the format matching quizzes.json
    """
    # Get category ID (lowercase with hyphens)
    category_id = category.lower().replace(" ", "-")
    
    # Always use "entertainment" as the categoryId for now
    # This can be modified if more categories are added
    category_id_fixed = "entertainment"
    
    system_prompt = """
You are a JSON data generator for a trivia application.
Your task is to create JSON data for quizzes based on the given category and subcategories.
Each quiz should have realistic and engaging details.

Follow these guidelines:
1. Generate JSON data in the exact format shown in the example
2. Always use the provided categoryId
3. The subcategoryId must be derived from the subcategory name (lowercase with hyphens)
4. The id field MUST be the subcategory name converted to lowercase with hyphens, and MUST end with "-trivia-questions-answers"
   - Example: For "Kids Movies", the id should be "kids-movies-trivia-questions-answers"
5. Create quiz names that EXACTLY match the subcategory name
6. Write detailed, interesting descriptions that accurately describe what the quiz is about
7. Include appropriate difficulty levels (Easy, Medium, or Hard)
8. Generate realistic values for questionCount, timeLimit, popularity, and attempts
9. Create relevant and specific tags for each quiz (3-4 tags)
10. Include a studyTopicId that is related to the quiz topic (like "oscar-awards" for an Oscars quiz)
11. Make sure the data is well-formatted JSON
"""

    example_json = {
        "quizzes": [
            {
                "id": "oscar-winners-trivia-questions-answers",
                "categoryId": "entertainment",
                "subcategoryId": "movies",
                "name": "Oscar Winners",
                "description": "Test your knowledge about Academy Award-winning movies throughout history.",
                "questionCount": 30,
                "timeLimit": 20,
                "difficulty": "Medium",
                "popularity": 4.8,
                "attempts": 24500,
                "studyTopicId": "oscar-awards",
                "tags": [
                    "Oscars",
                    "Best Picture",
                    "Award Winners"
                ]
            },
            {
                "id": "classic-hollywood-trivia-questions-answers",
                "categoryId": "entertainment",
                "subcategoryId": "movies",
                "name": "Classic Hollywood",
                "description": "How much do you know about the golden age of Hollywood?",
                "questionCount": 25,
                "timeLimit": 15,
                "difficulty": "Hard",
                "popularity": 4.5,
                "attempts": 19800,
                "studyTopicId": "classic-hollywood-history",
                "tags": ["Hollywood", "Classic Movies", "Film Legends"]
            }
        ]
    }

    user_prompt = f"""
Generate quiz data for these inputs:
- Category: {category}
- Subcategories: {", ".join(subcategories)}

IMPORTANT FORMAT REQUIREMENTS:
1. Always use "{category_id_fixed}" as the categoryId for all quizzes
2. For each quiz, derive the subcategoryId from the subcategory name (lowercase with hyphens)
   - Example: For "Kids Movies", the subcategoryId should be "kids-movies"
3. The id field MUST follow this format: [subcategory-name-in-lowercase-with-hyphens]-trivia-questions-answers
   - Example: For "Kids Movies", the id must be "kids-movies-trivia-questions-answers"
4. The quiz name MUST be EXACTLY the same as the subcategory name
5. Include a studyTopicId field that relates to the quiz topic

I need one quiz for each subcategory. Please make sure all data is realistic with engaging descriptions.

Use this JSON format:
{json.dumps(example_json, indent=2)}

Return only valid, well-formatted JSON with NO additional text or explanations.
"""

    response = call_openai_api(system_prompt, user_prompt)
    
    try:
        # Parse the response as JSON
        quizzes_data = json.loads(response)
        return quizzes_data
    except json.JSONDecodeError:
        print("Failed to parse quizzes data from OpenAI API response")
        print("Response was:", response)
        raise

def generate_questions_data(quizzes_data):
    """
    Generate questions data for the given quizzes
    
    Args:
        quizzes_data (dict): The quizzes data from which to generate questions
        
    Returns:
        dict: Questions data in the format matching questions.json
    """
    questions_data = {"quizzes": []}
    
    # For each quiz, generate questions
    for quiz in quizzes_data["quizzes"]:
        print(f"Generating questions for quiz: {quiz['name']}...")
        
        # Random number of questions between 15 and 20
        question_count = random.randint(15, 20)
        
        system_prompt = """
You are a quiz content creator specializing in creating trivia questions.
Your task is to generate a set of 15-20 questions for a specific quiz topic.
Each question should be well-researched, factually accurate, and engaging.

Follow these guidelines:
1. Generate JSON data in the exact format shown in the example
2. Create the EXACT number of questions specified in the prompt (between 15-20)
3. Each question should have 4 distinct options (all reasonable possibilities, not obvious wrong answers)
4. Mark the correct answer and provide a brief, educational explanation of why it's correct
5. Vary the difficulty levels (Easy, Medium, Hard)
6. Each question must have a unique ID in the format "q1", "q2", etc.
7. Make sure the data is well-formatted JSON
8. Always use the provided Category and Subcategory values from the input
9. The quiz title MUST be in the format: [Quiz Name] + "Trivia Questions and Answers"
   - Example: "Kids Movies Trivia Questions and Answers"
10. The quiz ID MUST be exactly the same as provided in the input
"""

        example_json = {
            "id": "oscar-winners-trivia-questions-answers",
            "title": "Oscar Winners Trivia Questions and Answers",
            "category": "Entertainment",
            "subcategory": "Movies",
            "description": "Test your knowledge about Academy Award-winning movies throughout history.",
            "difficulty": "Medium",
            "timeLimit": 20,
            "questionCount": 15,
            "popularity": 4.8,
            "attempts": 24500,
            "tags": ["Oscars", "Best Picture", "Award Winners"],
            "questions": [
                {
                    "id": "q1",
                    "text": "Which film won the Academy Award for Best Picture in 2020?",
                    "options": [
                        "1917",
                        "Parasite",
                        "Joker",
                        "Once Upon a Time in Hollywood"
                    ],
                    "correctAnswer": "Parasite",
                    "explanation": "Parasite, directed by Bong Joon-ho, became the first non-English language film to win the Academy Award for Best Picture in 2020.",
                    "difficulty": "Medium"
                },
                {
                    "id": "q2",
                    "text": "Who holds the record for most Academy Award wins for Best Director?",
                    "options": [
                        "Steven Spielberg",
                        "Martin Scorsese",
                        "John Ford",
                        "Francis Ford Coppola"
                    ],
                    "correctAnswer": "John Ford",
                    "explanation": "John Ford won the Academy Award for Best Director four times for 'The Informer' (1935), 'The Grapes of Wrath' (1940), 'How Green Was My Valley' (1941), and 'The Quiet Man' (1952).",
                    "difficulty": "Hard"
                }
            ]
        }

        user_prompt = f"""
Generate questions data for this quiz:
- Quiz ID: {quiz['id']}
- Quiz Title: {quiz['name']} Trivia Questions and Answers
- Category: {quiz.get('categoryId', 'Entertainment')}
- Subcategory: {quiz.get('subcategoryId', 'Movies')}
- Description: {quiz['description']}

IMPORTANT FORMAT REQUIREMENTS:
1. Always use "{quiz.get('categoryId', 'Entertainment').capitalize()}" as the category
2. Always use "{quiz.get('subcategoryId', 'Movies').capitalize()}" as the subcategory
3. Use the exact format shown in the example
4. IMPORTANT: The ID must be EXACTLY: {quiz['id']}
5. The title must be EXACTLY: "{quiz['name']} Trivia Questions and Answers"

Create {question_count} questions for this quiz. Follow these guidelines:
1. Questions should be factually accurate and cover different aspects of {quiz['name']}
2. Each question should have 4 reasonable options (not obviously wrong answers)
3. Include a brief explanation for each correct answer
4. Vary the difficulty levels (Easy, Medium, Hard)

Use this JSON format:
{json.dumps(example_json, indent=2)}

Return only valid, well-formatted JSON with NO additional text or explanations.
"""

        response = call_openai_api(system_prompt, user_prompt)
        
        try:
            # Parse the response as JSON
            questions_quiz_data = json.loads(response)
            questions_data["quizzes"].append(questions_quiz_data)
            
            # Add a small delay to avoid rate limiting
            time.sleep(1)
        except json.JSONDecodeError:
            print(f"Failed to parse questions data for quiz {quiz['name']} from OpenAI API response")
            print("Response was:", response)
            raise
    
    return questions_data

def main():
    print("🔍 Trivia App Data Generator using OpenAI API")
    print("============================================")
    
    try:
        # Get user input
        print("\nEnter your input in the format: Under [Category], [Subcategory1], [Subcategory2], ...")
        print("Example: Under Movies, Action Movies, Classic Movies, Sci Fi Movies\n")
        print("Note: All quizzes will be generated with:")
        print(" - categoryId: 'entertainment'")
        print(" - subcategoryId: derived from each subcategory name")
        print(" - The id field will be derived from each subcategory name")
        print(" - A relevant studyTopicId will be included\n")
        
        user_input = input("> ")
        
        # Parse user input
        category, subcategories = parse_input(user_input)
        
        # Limit to 5 subcategories
        if len(subcategories) > 5:
            print(f"⚠️ Limiting to 5 subcategories (you provided {len(subcategories)})")
            subcategories = subcategories[:5]
        
        print(f"\n✅ Parsed input:")
        print(f"- Category: {category}")
        print(f"- Subcategories: {', '.join(subcategories)}")
        
        if len(subcategories) == 0:
            print("❌ No valid subcategories provided. Exiting...")
            return
        
        print(f"\n📝 Generating data for {len(subcategories)} subcategories using OpenAI API...")
        
        # Step 1: Generate quizzes data
        print("\n🎮 Generating quizzes data...")
        quizzes_data = generate_quizzes_data(category, subcategories)
        print(f"✅ Generated data for {len(quizzes_data['quizzes'])} quizzes")
        
        # Step 2: Generate questions data
        print("\n❓ Generating questions data...")
        questions_data = generate_questions_data(quizzes_data)
        print(f"✅ Generated data for {len(questions_data['quizzes'])} sets of questions")
        
        # Write data to files
        quizzes_file_path = os.path.join(OUTPUT_DIR, f"quizzes_{TIMESTAMP}.json")
        questions_file_path = os.path.join(OUTPUT_DIR, f"questions_{TIMESTAMP}.json")
        
        with open(quizzes_file_path, 'w', encoding='utf-8') as f:
            json.dump(quizzes_data, f, indent=2)
        
        with open(questions_file_path, 'w', encoding='utf-8') as f:
            json.dump(questions_data, f, indent=2)
        
        print("\n✅ Data generation complete!")
        print("\nGenerated files:")
        print(f"1. {quizzes_file_path}")
        print(f"2. {questions_file_path}")
        
        print("\n📝 Next steps:")
        print("1. Review the generated files")
        print("2. Manually copy the data to your actual JSON files")
        print("3. Make any necessary adjustments to match your needs")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")

if __name__ == "__main__":
    main() 