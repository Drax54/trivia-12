#!/usr/bin/env python3
import json
import os
from collections import defaultdict

# Get the script directory and set up paths
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
DATA_DIR = os.path.join(PROJECT_ROOT, "data")

# Paths
QUIZZES_PATH = os.path.join(DATA_DIR, "quizzes.json")
CONTENT_QUIZ_PATH = os.path.join(DATA_DIR, "content-quiz.json")

def load_json_file(file_path):
    """Load JSON data from a file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading {file_path}: {e}")
        return None

def main():
    # Load data files
    quizzes_data = load_json_file(QUIZZES_PATH)
    content_quiz_data = load_json_file(CONTENT_QUIZ_PATH)
    
    if not quizzes_data or not content_quiz_data:
        print("Failed to load data files. Exiting.")
        return
    
    # Create sets of quiz IDs
    quiz_ids = {quiz["id"] for quiz in quizzes_data["quizzes"]}
    content_quiz_ids = {content["quizId"] for content in content_quiz_data.get("contents", [])}
    
    # Count totals
    total_quizzes = len(quiz_ids)
    total_content = len(content_quiz_ids)
    
    # Get mismatches
    quizzes_without_content = quiz_ids - content_quiz_ids
    content_without_quiz = content_quiz_ids - quiz_ids
    
    # Print summary
    print(f"Total quizzes in quizzes.json: {total_quizzes}")
    print(f"Total quizzes with content: {total_content}")
    print(f"Quizzes without content: {len(quizzes_without_content)}")
    print(f"Content entries for non-existent quizzes: {len(content_without_quiz)}")
    
    # Print details of quizzes without content
    if quizzes_without_content:
        print("\n=== QUIZZES WITHOUT CONTENT ===")
        for i, quiz_id in enumerate(sorted(quizzes_without_content), 1):
            # Find the quiz details
            quiz = next((q for q in quizzes_data["quizzes"] if q["id"] == quiz_id), None)
            if quiz:
                print(f"{i}. {quiz.get('name', 'Unknown')} ({quiz_id})")
                print(f"   Category: {quiz.get('categoryId', 'Unknown')}, Subcategory: {quiz.get('subcategoryId', 'Unknown')}")
            else:
                print(f"{i}. Unknown Quiz ({quiz_id})")
    else:
        print("\nAll quizzes have content!")
    
    # Print details of content without quizzes
    if content_without_quiz:
        print("\n=== CONTENT WITHOUT MATCHING QUIZ ===")
        for i, quiz_id in enumerate(sorted(content_without_quiz), 1):
            # Find the content details
            content = next((c for c in content_quiz_data["contents"] if c["quizId"] == quiz_id), None)
            if content:
                print(f"{i}. {quiz_id}")
                print(f"   Category: {content.get('categoryId', 'Unknown')}, Subcategory: {content.get('subcategoryId', 'Unknown')}")
            else:
                print(f"{i}. Unknown Content ({quiz_id})")
    else:
        print("\nAll content entries have matching quizzes!")

if __name__ == "__main__":
    main() 