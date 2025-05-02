"""
Trivia App Data Generator using OpenAI API

This script generates JSON data for quizzes and their questions using the OpenAI API.
It reads quiz data from a CSV file and generates appropriate JSON files that match the existing format.

Usage: python generate-data-openai.py

Prerequisites:
- Python 3.6+
- OpenAI API key set as an environment variable OPENAI_API_KEY
- Required packages: openai, python-dotenv, os, json, datetime, re, random, pandas

Installation:
pip install openai python-dotenv pandas
"""

import os
import json
import datetime
import re
import time
import random
import pandas as pd
from openai import OpenAI

# Hardcoded API key directly in the code
OPENAI_API_KEY = "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"

# Initialize OpenAI client
client = OpenAI(api_key=OPENAI_API_KEY)

# Configuration
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "generated")
TIMESTAMP = datetime.datetime.now().strftime("%Y-%m-%d-%H-%M-%S")
MODEL = "gpt-4-turbo"  # Default to GPT-4 Turbo
CSV_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "Quiz-data.csv")

# Create output directory if it doesn't exist
os.makedirs(OUTPUT_DIR, exist_ok=True)

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

def read_quiz_data_from_csv():
    """
    Read quiz data from CSV file
    
    Returns:
        tuple: (category, subcategories_dict)
        where subcategories_dict is a dictionary mapping subcategory names to their IDs
    """
    try:
        df = pd.read_csv(CSV_FILE)
        if df.empty:
            raise ValueError("CSV file is empty")
            
        # Get unique category (should be 'Entertainment' for all rows)
        categories = df['Category ID'].unique()
        if len(categories) != 1:
            raise ValueError(f"Expected exactly one category, found {len(categories)}")
        category = categories[0]
        
        # Create dictionary of subcategories and their IDs
        subcategories_dict = {}
        for _, row in df.iterrows():
            quiz_name = row['Quiz'].replace(' Trivia', '')  # Remove 'Trivia' from the name
            subcategories_dict[quiz_name] = row['Subcategory ID']
            
        return category, subcategories_dict
    except Exception as e:
        print(f"Error reading CSV file: {e}")
        raise

def clean_json_string(json_str):
    """
    Clean a JSON string to handle common issues like control characters
    
    Args:
        json_str (str): The JSON string to clean
        
    Returns:
        str: The cleaned JSON string
    """
    # Remove any control characters
    json_str = re.sub(r'[\x00-\x1F\x7F]', '', json_str)
    
    # Handle any trailing commas in arrays or objects
    json_str = re.sub(r',\s*}', '}', json_str)
    json_str = re.sub(r',\s*]', ']', json_str)
    
    return json_str

def generate_quizzes_data(category, subcategories_dict):
    """
    Generate quizzes data for the given category and subcategories
    
    Args:
        category (str): The category name
        subcategories_dict (dict): Dictionary mapping subcategory names to their IDs
        
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
            }
        ]
    }

    # Convert subcategories_dict to a list of names
    subcategory_names = list(subcategories_dict.keys())
    
    # Split into batches of 15 (or less for the last batch)
    batch_size = 15
    all_quizzes = {"quizzes": []}
    
    # Process subcategories in batches
    for i in range(0, len(subcategory_names), batch_size):
        batch = subcategory_names[i:i+batch_size]
        print(f"Processing batch {i//batch_size + 1} of {(len(subcategory_names) + batch_size - 1) // batch_size} ({len(batch)} quizzes)...")
        
        user_prompt = f"""
Generate quiz data for these inputs:
- Category: {category}
- Subcategories: {', '.join(batch)}

IMPORTANT FORMAT REQUIREMENTS:
1. Always use "{category_id_fixed}" as the categoryId for all quizzes
2. For each quiz, use the provided subcategoryId from the dictionary
3. The id field MUST follow this format: [subcategory-name-in-lowercase-with-hyphens]-trivia-questions-answers
4. The quiz name MUST be EXACTLY the same as the subcategory name
5. Include a studyTopicId field that relates to the quiz topic

I need one quiz for each subcategory. Please make sure all data is realistic with engaging descriptions.

Use this JSON format:
{json.dumps(example_json, indent=2)}

Return only valid, well-formatted JSON with NO additional text or explanations.
"""

        response = call_openai_api(system_prompt, user_prompt)
        
        try:
            # Clean the response and parse as JSON
            cleaned_response = clean_json_string(response)
            batch_quizzes_data = json.loads(cleaned_response)
            
            # Add subcategory_id to each quiz in this batch
            for quiz in batch_quizzes_data["quizzes"]:
                # Try to find the matching subcategory
                for subcat_name, subcat_id in subcategories_dict.items():
                    if quiz["name"] == subcat_name:
                        quiz["subcategoryId"] = subcat_id
                        break
            
            # Add quizzes from this batch to the overall list
            all_quizzes["quizzes"].extend(batch_quizzes_data["quizzes"])
            
            # Add a small delay to avoid rate limiting
            time.sleep(2)
        except json.JSONDecodeError as e:
            print(f"Failed to parse quizzes data from OpenAI API response: {e}")
            print("Attempting to fix JSON manually...")
            
            # Try to extract just the quizzes array if the full JSON can't be parsed
            try:
                # Look for the quizzes array
                match = re.search(r'"quizzes"\s*:\s*\[(.*?)\]\s*}', response, re.DOTALL)
                if match:
                    # Try to parse just the quizzes array
                    quizzes_array = f'{{"quizzes": [{match.group(1)}]}}'
                    cleaned_quizzes = clean_json_string(quizzes_array)
                    batch_quizzes_data = json.loads(cleaned_quizzes)
                    
                    # Add quizzes from this batch to the overall list
                    all_quizzes["quizzes"].extend(batch_quizzes_data["quizzes"])
                    print(f"Successfully extracted {len(batch_quizzes_data['quizzes'])} quizzes from partial JSON")
                    
                    # Add a small delay to avoid rate limiting
                    time.sleep(2)
                    continue
            except Exception as inner_e:
                print(f"Failed to extract quizzes from partial JSON: {inner_e}")
            
            print("Response was:", response)
            print("Skipping this batch and continuing...")
            time.sleep(2)
            continue  # Skip this batch but continue with the next one
    
    return all_quizzes

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
            # Clean the response and parse as JSON
            cleaned_response = clean_json_string(response)
            questions_quiz_data = json.loads(cleaned_response)
            questions_data["quizzes"].append(questions_quiz_data)
            
            # Add a small delay to avoid rate limiting
            time.sleep(1)
        except json.JSONDecodeError as e:
            print(f"Failed to parse questions data for quiz {quiz['name']} from OpenAI API response: {e}")
            print("Skipping this quiz and continuing...")
            time.sleep(1)
            continue  # Skip this quiz but continue with the next one
    
    return questions_data

def main():
    print("🔍 Trivia App Data Generator using OpenAI API")
    print("============================================")
    
    try:
        # Read quiz data from CSV
        print("\n📖 Reading quiz data from CSV file...")
        category, subcategories_dict = read_quiz_data_from_csv()
        
        print(f"\n✅ Read data from CSV:")
        print(f"- Category: {category}")
        print(f"- Number of subcategories: {len(subcategories_dict)}")
        
        if len(subcategories_dict) == 0:
            print("❌ No valid subcategories found in CSV. Exiting...")
            return
        
        print(f"\n📝 Generating data for {len(subcategories_dict)} subcategories using OpenAI API...")
        
        # Step 1: Generate quizzes data
        print("\n🎮 Generating quizzes data...")
        quizzes_data = generate_quizzes_data(category, subcategories_dict)
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