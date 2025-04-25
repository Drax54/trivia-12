#!/usr/bin/env python3
import json
import os
from collections import defaultdict

def load_quizzes_data():
    """Load the quizzes data from the JSON file."""
    try:
        with open(os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'quizzes.json'), 'r') as file:
            return json.load(file)
    except Exception as e:
        print(f"Error loading quizzes.json: {e}")
        return None

def find_duplicates(quizzes_data):
    """Find duplicate quizzes by ID and by name."""
    if not quizzes_data or 'quizzes' not in quizzes_data:
        print("No quizzes data found or invalid format")
        return None, None
    
    # Track quizzes by ID and name
    id_map = {}
    name_map = defaultdict(list)
    
    # Find duplicates
    id_duplicates = []
    name_duplicates = []
    
    for quiz in quizzes_data['quizzes']:
        quiz_id = quiz.get('id')
        quiz_name = quiz.get('name')
        
        # Check for ID duplicates
        if quiz_id in id_map:
            id_duplicates.append({
                'id': quiz_id,
                'first_occurrence': id_map[quiz_id],
                'duplicate': quiz
            })
        else:
            id_map[quiz_id] = quiz
        
        # Check for name duplicates
        if quiz_name:
            name_map[quiz_name].append(quiz)
    
    # Process name duplicates
    for name, quizzes in name_map.items():
        if len(quizzes) > 1:
            name_duplicates.append({
                'name': name,
                'quizzes': quizzes
            })
    
    return id_duplicates, name_duplicates

def write_results(id_duplicates, name_duplicates):
    """Write the duplicate results to files."""
    # Create output directory if it doesn't exist
    output_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'scripts', 'output')
    os.makedirs(output_dir, exist_ok=True)
    
    # Write ID duplicates
    if id_duplicates:
        with open(os.path.join(output_dir, 'id_duplicates.json'), 'w') as file:
            json.dump(id_duplicates, file, indent=2)
        print(f"Found {len(id_duplicates)} duplicates by ID. Results saved to 'output/id_duplicates.json'")
    else:
        print("No duplicates found by ID")
    
    # Write name duplicates
    if name_duplicates:
        with open(os.path.join(output_dir, 'name_duplicates.json'), 'w') as file:
            json.dump(name_duplicates, file, indent=2)
        print(f"Found {len(name_duplicates)} duplicates by name. Results saved to 'output/name_duplicates.json'")
    else:
        print("No duplicates found by name")
    
    # Write summary
    with open(os.path.join(output_dir, 'duplicate_summary.txt'), 'w') as file:
        file.write("Duplicate Quizzes Summary\n")
        file.write("========================\n\n")
        
        file.write("ID Duplicates:\n")
        if id_duplicates:
            for dup in id_duplicates:
                file.write(f"  - ID: {dup['id']}, Name: {dup['duplicate'].get('name')}\n")
        else:
            file.write("  None found\n")
        
        file.write("\nName Duplicates:\n")
        if name_duplicates:
            for dup in name_duplicates:
                file.write(f"  - Name: {dup['name']}, Count: {len(dup['quizzes'])}\n")
                for quiz in dup['quizzes']:
                    file.write(f"      ID: {quiz.get('id')}\n")
        else:
            file.write("  None found\n")
    
    print(f"Summary saved to 'output/duplicate_summary.txt'")

def main():
    # Load data
    print("Loading quizzes data...")
    quizzes_data = load_quizzes_data()
    
    if not quizzes_data:
        print("Failed to load quizzes data. Exiting.")
        return
    
    # Find duplicates
    print("Finding duplicates...")
    id_duplicates, name_duplicates = find_duplicates(quizzes_data)
    
    # Write results
    print("Writing results...")
    write_results(id_duplicates, name_duplicates)
    
    print("Done!")

if __name__ == "__main__":
    main() 