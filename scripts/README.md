# Quiz Duplicate Detection and Fixing Scripts

This directory contains scripts to help find and fix duplicate quizzes in the `quizzes.json` file.

## Available Scripts

### 1. Find Duplicate Quizzes (`find_duplicate_quizzes.py`)

This script analyzes the quizzes.json file and identifies:
- Quizzes with duplicate IDs
- Quizzes with duplicate names
- Creates detailed reports of the findings

#### Usage:
```bash
python find_duplicate_quizzes.py
```

#### Output:
- Creates an `output` directory with:
  - `id_duplicates.json`: Quizzes with duplicate IDs
  - `name_duplicates.json`: Quizzes with duplicate names
  - `duplicate_summary.txt`: A human-readable summary of all duplicates

### 2. Find Exact Duplicates (`find_exact_duplicates.py`)

A simpler script focused on finding exact duplicates (same ID and name) in the quizzes.json file.

#### Usage:
```bash
python find_exact_duplicates.py
```

#### Output:
- Console output showing all duplicates
- Creates a `data/duplicates` directory with a detailed JSON report

### 3. Fix Duplicate Quizzes (`fix_duplicate_quizzes.py`)

This script can analyze and fix duplicate quizzes in the following ways:
- Remove exact duplicates (keeping the first occurrence)
- Fix duplicate IDs by generating new unique IDs for duplicates

#### Usage:
```bash
# Just analyze without making changes
python fix_duplicate_quizzes.py --mode analyze

# Remove exact duplicates (same ID and name)
python fix_duplicate_quizzes.py --mode exact

# Fix duplicate IDs by generating new unique IDs
python fix_duplicate_quizzes.py --mode id

# Preview changes without applying them
python fix_duplicate_quizzes.py --mode [exact|id] --dry-run
```

#### Features:
- Creates automatic backups before making changes
- Dry run option to preview changes
- Detailed analysis output
- Multiple fixing strategies

## Example Workflow

1. First, run the analysis to understand the duplicates:
   ```bash
   python fix_duplicate_quizzes.py --mode analyze
   ```

2. If you have exact duplicates, remove them:
   ```bash
   python fix_duplicate_quizzes.py --mode exact
   ```

3. If you still have duplicate IDs but with different content, fix the IDs:
   ```bash
   python fix_duplicate_quizzes.py --mode id
   ```

4. Verify the changes look good:
   ```bash
   python find_duplicate_quizzes.py
   ``` 