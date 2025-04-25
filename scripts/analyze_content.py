import json
import os

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

def main():
    # Load data files
    quizzes_data = load_json_file(QUIZZES_PATH)
    if not quizzes_data:
        print("Failed to load quizzes data. Exiting.")
        return
    
    questions_data = load_json_file(QUESTIONS_PATH)
    if not questions_data:
        print("Failed to load questions data. Exiting.")
        return
    
    content_quiz_data = load_json_file(CONTENT_QUIZ_PATH)
    if not content_quiz_data:
        print("Failed to load content quiz data. Exiting.")
        return
    
    # Extract all quiz IDs
    all_quiz_ids = {quiz["id"]: quiz for quiz in quizzes_data["quizzes"]}
    
    # Extract quiz IDs that have content
    content_quiz_ids = {content["quizId"] for content in content_quiz_data["contents"]}
    
    # Extract quiz IDs that have questions
    quizzes_with_questions = set()
    for quiz in questions_data["quizzes"]:
        if "questions" in quiz and len(quiz["questions"]) > 0:
            quizzes_with_questions.add(quiz["id"])
    
    # Find quizzes missing content
    missing_content_ids = set(all_quiz_ids.keys()) - content_quiz_ids
    
    # Find quizzes that have questions but no content
    missing_content_with_questions = missing_content_ids.intersection(quizzes_with_questions)
    
    # Categorize quizzes
    entertainment_quizzes = [quiz_id for quiz_id, quiz in all_quiz_ids.items() if quiz["categoryId"] == "entertainment"]
    history_quizzes = [quiz_id for quiz_id, quiz in all_quiz_ids.items() if quiz["categoryId"] == "history"]
    
    # Print results
    print(f"Total quizzes: {len(all_quiz_ids)}")
    print(f"Quizzes with content: {len(content_quiz_ids)}")
    print(f"Quizzes with questions: {len(quizzes_with_questions)}")
    print(f"Missing content for {len(missing_content_ids)} quizzes")
    print(f"Quizzes with questions but no content: {len(missing_content_with_questions)}")
    print()
    
    print(f"Entertainment quizzes: {len(entertainment_quizzes)}")
    print(f"History quizzes: {len(history_quizzes)}")
    print()
    
    print("Entertainment quizzes without content:")
    for quiz_id in [q for q in entertainment_quizzes if q not in content_quiz_ids]:
        if quiz_id in quizzes_with_questions:
            print(f"  - {quiz_id} (has questions)")
        else:
            print(f"  - {quiz_id} (no questions)")
    print()
    
    print("History quizzes without content:")
    for quiz_id in [q for q in history_quizzes if q not in content_quiz_ids]:
        if quiz_id in quizzes_with_questions:
            print(f"  - {quiz_id} (has questions)")
        else:
            print(f"  - {quiz_id} (no questions)")

if __name__ == "__main__":
    main() 