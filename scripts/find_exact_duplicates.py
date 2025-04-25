#!/usr/bin/env python3
import json
import os
from collections import defaultdict

def find_exact_duplicates():
    """Find quizzes that are exact duplicates in quizzes.json"""
    # Load quizzes data
    try:
        with open(os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'quizzes.json'), 'r') as file:
            data = json.load(file)
    except Exception as e:
        print(f"Error loading quizzes.json: {e}")
        return
    
    if 'quizzes' not in data:
        print("Invalid JSON structure: 'quizzes' key not found")
        return
    
    # Track duplicates by ID and name combinations
    id_duplicates = defaultdict(list)
    name_duplicates = defaultdict(list)
    exact_duplicates = []
    
    # Count quizzes with the same ID or name
    for index, quiz in enumerate(data['quizzes']):
        quiz_id = quiz.get('id')
        quiz_name = quiz.get('name')
        
        if quiz_id:
            id_duplicates[quiz_id].append(index)
        
        if quiz_name:
            name_duplicates[quiz_name].append(index)
    
    # Find exact duplicates (matching both ID and name)
    for quiz_id, indices in id_duplicates.items():
        if len(indices) > 1:
            duplicates = [data['quizzes'][i] for i in indices]
            
            # Group by name to find exact duplicates
            by_name = defaultdict(list)
            for i, dup in enumerate(duplicates):
                by_name[dup.get('name')].append((indices[i], dup))
            
            # Add to exact duplicates
            for name, quizzes in by_name.items():
                if len(quizzes) > 1:
                    exact_duplicates.append({
                        'id': quiz_id,
                        'name': name,
                        'indices': [q[0] for q in quizzes],
                        'quizzes': [q[1] for q in quizzes]
                    })
    
    # Output duplicates to console
    print(f"\n=== DUPLICATE QUIZZES REPORT ===\n")
    
    # Report ID duplicates
    print("QUIZZES WITH DUPLICATE IDs:")
    for quiz_id, indices in id_duplicates.items():
        if len(indices) > 1:
            names = [data['quizzes'][i].get('name') for i in indices]
            print(f"  ID '{quiz_id}' appears {len(indices)} times with names: {', '.join(names)}")
    
    # Report name duplicates
    print("\nQUIZZES WITH DUPLICATE NAMES:")
    for quiz_name, indices in name_duplicates.items():
        if len(indices) > 1:
            ids = [data['quizzes'][i].get('id') for i in indices]
            print(f"  Name '{quiz_name}' appears {len(indices)} times with IDs: {', '.join(ids)}")
    
    # Report exact duplicates
    print("\nEXACT DUPLICATES (SAME ID AND NAME):")
    if exact_duplicates:
        for dup in exact_duplicates:
            print(f"  ID: '{dup['id']}', Name: '{dup['name']}', Count: {len(dup['indices'])}")
    else:
        print("  None found")
    
    # Save results to file
    output_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'duplicates')
    os.makedirs(output_dir, exist_ok=True)
    
    with open(os.path.join(output_dir, 'duplicates_report.json'), 'w') as f:
        json.dump({
            'id_duplicates': {k: v for k, v in id_duplicates.items() if len(v) > 1},
            'name_duplicates': {k: v for k, v in name_duplicates.items() if len(v) > 1},
            'exact_duplicates': exact_duplicates
        }, f, indent=2)
    
    print(f"\nDetailed report saved to {os.path.join('data', 'duplicates', 'duplicates_report.json')}")

if __name__ == "__main__":
    find_exact_duplicates() 