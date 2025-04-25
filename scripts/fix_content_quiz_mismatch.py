#!/usr/bin/env python3
import json
import os
import shutil
from collections import defaultdict

# Get the script directory and set up paths
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
DATA_DIR = os.path.join(PROJECT_ROOT, "data")

# Paths
QUIZZES_PATH = os.path.join(DATA_DIR, "quizzes.json")
CONTENT_QUIZ_PATH = os.path.join(DATA_DIR, "content-quiz.json")
BACKUP_PATH = os.path.join(DATA_DIR, "content-quiz.backup.json")

def load_json_file(file_path):
    """Load JSON data from a file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading {file_path}: {e}")
        return None

def save_json_file(file_path, data):
    """Save JSON data to a file."""
    try:
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        return True
    except Exception as e:
        print(f"Error saving {file_path}: {e}")
        return False

def main():
    # Load data files
    quizzes_data = load_json_file(QUIZZES_PATH)
    content_quiz_data = load_json_file(CONTENT_QUIZ_PATH)
    
    if not quizzes_data or not content_quiz_data:
        print("Failed to load data files. Exiting.")
        return
    
    # Create a backup of the content-quiz.json file
    shutil.copy2(CONTENT_QUIZ_PATH, BACKUP_PATH)
    print(f"Created backup of content-quiz.json at {BACKUP_PATH}")
    
    # Create sets of quiz IDs
    quiz_ids = {quiz["id"] for quiz in quizzes_data["quizzes"]}
    
    # Find mismatched content entries and fix them
    fixed_count = 0
    
    for content in content_quiz_data.get("contents", []):
        quiz_id = content["quizId"]
        
        # Check if quiz ID doesn't exist but removing "-2" suffix would match
        if quiz_id not in quiz_ids and quiz_id.endswith("-2"):
            base_id = quiz_id[:-2]  # Remove the "-2" suffix
            
            if base_id in quiz_ids:
                print(f"Fixing content entry: {quiz_id} -> {base_id}")
                content["quizId"] = base_id
                fixed_count += 1
    
    if fixed_count > 0:
        # Save the updated content-quiz.json file
        if save_json_file(CONTENT_QUIZ_PATH, content_quiz_data):
            print(f"Successfully fixed {fixed_count} content entries.")
            print(f"Updated content-quiz.json saved.")
        else:
            print("Failed to save the updated content-quiz.json file.")
    else:
        print("No content entries needed fixing.")

if __name__ == "__main__":
    main() 