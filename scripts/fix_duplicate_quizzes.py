#!/usr/bin/env python3
import json
import os
import sys
from collections import defaultdict
import argparse
import shutil
from datetime import datetime

def load_quizzes_data():
    """Load the quizzes data from the JSON file."""
    try:
        file_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'quizzes.json')
        with open(file_path, 'r') as file:
            return file_path, json.load(file)
    except Exception as e:
        print(f"Error loading quizzes.json: {e}")
        return None, None

def find_duplicates(quizzes_data):
    """Find duplicate quizzes by ID and by name."""
    if not quizzes_data or 'quizzes' not in quizzes_data:
        print("No quizzes data found or invalid format")
        return None, None
    
    # Track quizzes by ID and name
    id_map = defaultdict(list)
    name_map = defaultdict(list)
    
    # Find duplicates and store indices
    for i, quiz in enumerate(quizzes_data['quizzes']):
        quiz_id = quiz.get('id')
        quiz_name = quiz.get('name')
        
        if quiz_id:
            id_map[quiz_id].append(i)
        
        if quiz_name:
            name_map[quiz_name].append(i)
    
    # Filter to only include duplicates
    id_duplicates = {k: v for k, v in id_map.items() if len(v) > 1}
    name_duplicates = {k: v for k, v in name_map.items() if len(v) > 1}
    
    # Find exact duplicates (same ID and same name)
    exact_duplicates = []
    for quiz_id, indices in id_duplicates.items():
        # Group by name
        by_name = defaultdict(list)
        for idx in indices:
            quiz_name = quizzes_data['quizzes'][idx].get('name')
            by_name[quiz_name].append(idx)
        
        # Add to exact duplicates
        for name, name_indices in by_name.items():
            if len(name_indices) > 1:
                exact_duplicates.append({
                    'id': quiz_id,
                    'name': name,
                    'indices': name_indices
                })
    
    return id_duplicates, name_duplicates, exact_duplicates

def backup_quizzes_file(file_path):
    """Create a backup of the quizzes.json file."""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_path = f"{file_path}.{timestamp}.bak"
    shutil.copy2(file_path, backup_path)
    print(f"Created backup at {backup_path}")
    return backup_path

def fix_exact_duplicates(quizzes_data, exact_duplicates):
    """Remove exact duplicate quizzes (keeping only the first occurrence)."""
    if not exact_duplicates:
        print("No exact duplicates found, no changes needed.")
        return quizzes_data, 0
    
    # Get all indices to remove (sorted in descending order to avoid index shifting)
    indices_to_remove = []
    for dup in exact_duplicates:
        # Keep the first occurrence, remove the rest
        indices_to_remove.extend(dup['indices'][1:])
    
    indices_to_remove.sort(reverse=True)
    
    # Create a deep copy of the quizzes data
    fixed_data = json.loads(json.dumps(quizzes_data))
    
    # Remove duplicates
    for idx in indices_to_remove:
        del fixed_data['quizzes'][idx]
    
    return fixed_data, len(indices_to_remove)

def fix_id_duplicates(quizzes_data, id_duplicates):
    """Generate new IDs for duplicates to ensure ID uniqueness."""
    if not id_duplicates:
        print("No ID duplicates found, no changes needed.")
        return quizzes_data, 0
    
    # Create a deep copy of the quizzes data
    fixed_data = json.loads(json.dumps(quizzes_data))
    count = 0
    
    # Fix each duplicate ID
    for quiz_id, indices in id_duplicates.items():
        # Keep the first occurrence unchanged
        for i in range(1, len(indices)):
            idx = indices[i]
            old_id = fixed_data['quizzes'][idx]['id']
            # Generate a new unique ID by appending a suffix
            new_id = f"{old_id}-variant-{i}"
            fixed_data['quizzes'][idx]['id'] = new_id
            count += 1
    
    return fixed_data, count

def main():
    parser = argparse.ArgumentParser(description='Fix duplicate quizzes in the quizzes.json file')
    parser.add_argument('--mode', choices=['exact', 'id', 'analyze'], default='analyze',
                      help='Mode of operation: remove exact duplicates, fix duplicate IDs, or just analyze without changing')
    parser.add_argument('--dry-run', action='store_true', help='Show what would be changed without making changes')
    args = parser.parse_args()
    
    # Load quizzes data
    file_path, quizzes_data = load_quizzes_data()
    if not file_path or not quizzes_data:
        print("Failed to load quizzes data. Exiting.")
        sys.exit(1)
    
    # Find duplicates
    print("Analyzing quizzes for duplicates...")
    id_duplicates, name_duplicates, exact_duplicates = find_duplicates(quizzes_data)
    
    # Print analysis
    print("\n=== DUPLICATE ANALYSIS ===")
    
    # ID duplicates
    print(f"\nFound {sum(len(v) for v in id_duplicates.values()) - len(id_duplicates)} quiz(es) with duplicate IDs:")
    for quiz_id, indices in id_duplicates.items():
        names = [quizzes_data['quizzes'][i].get('name') for i in indices]
        print(f"  ID '{quiz_id}' appears {len(indices)} times with names: {', '.join(names)}")
    
    # Name duplicates
    print(f"\nFound {sum(len(v) for v in name_duplicates.values()) - len(name_duplicates)} quiz(es) with duplicate names:")
    for quiz_name, indices in name_duplicates.items():
        ids = [quizzes_data['quizzes'][i].get('id') for i in indices]
        print(f"  Name '{quiz_name}' appears {len(indices)} times with IDs: {', '.join(ids)}")
    
    # Exact duplicates
    total_exact = sum(len(dup['indices']) - 1 for dup in exact_duplicates)
    print(f"\nFound {total_exact} exact duplicate quiz(es) (same ID and name):")
    for dup in exact_duplicates:
        print(f"  ID: '{dup['id']}', Name: '{dup['name']}', Count: {len(dup['indices'])}")
    
    # If only analyzing, exit here
    if args.mode == 'analyze':
        print("\nAnalysis complete. No changes made.")
        sys.exit(0)
    
    # Create backup before making changes
    if not args.dry_run:
        backup_quizzes_file(file_path)
    
    # Fix duplicates based on mode
    fixed_data = quizzes_data
    if args.mode == 'exact':
        fixed_data, count = fix_exact_duplicates(quizzes_data, exact_duplicates)
        if count > 0:
            print(f"\nRemoved {count} exact duplicate quiz(es).")
        else:
            print("\nNo exact duplicates found, no changes needed.")
    elif args.mode == 'id':
        fixed_data, count = fix_id_duplicates(quizzes_data, id_duplicates)
        if count > 0:
            print(f"\nFixed {count} duplicate ID(s) by generating new unique IDs.")
        else:
            print("\nNo ID duplicates found, no changes needed.")
    
    # Save changes
    if not args.dry_run and fixed_data != quizzes_data:
        with open(file_path, 'w') as file:
            json.dump(fixed_data, file, indent=2)
        print(f"\nChanges saved to {file_path}")
    elif args.dry_run and fixed_data != quizzes_data:
        print("\nDry run: Changes were not saved. Re-run without --dry-run to apply changes.")
    
    print("\nDone!")

if __name__ == "__main__":
    main() 