import os
import re

# Files to clean
files_to_clean = [
    '.env',
    '.env.example',
    'scripts/generate-data-openai.py',
    'scripts/generate-study-content.py', 
    'scripts/generate_quiz_content.py'
]

# Regex pattern to find OpenAI API keys (sk-...)
api_key_pattern = r'(sk-[a-zA-Z0-9]{48})'

# Replacement text
replacement = 'your-api-key-here'

def clean_file(file_path):
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        return False
    
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # Replace API keys with placeholder
        cleaned_content = re.sub(api_key_pattern, replacement, content)
        
        # If an environment variable is set directly
        cleaned_content = re.sub(r'OPENAI_API_KEY\s*=\s*"[^"]*"', f'OPENAI_API_KEY="{replacement}"', cleaned_content)
        cleaned_content = re.sub(r'OPENAI_API_KEY\s*=\s*\'[^\']*\'', f"OPENAI_API_KEY='{replacement}'", cleaned_content)
        
        # For .env files specifically
        if file_path.endswith('.env') or file_path.endswith('.env.example'):
            cleaned_content = re.sub(r'OPENAI_API_KEY=.*', f'OPENAI_API_KEY={replacement}', cleaned_content)
        
        with open(file_path, 'w', encoding='utf-8') as file:
            file.write(cleaned_content)
        
        print(f"Cleaned: {file_path}")
        return True
    
    except Exception as e:
        print(f"Error cleaning {file_path}: {e}")
        return False

def main():
    print("Starting to clean files...")
    
    success_count = 0
    for file_path in files_to_clean:
        if clean_file(file_path):
            success_count += 1
    
    print(f"Cleaned {success_count}/{len(files_to_clean)} files successfully.")
    print("\nNext steps:")
    print("1. Update .gitignore to include .env files")
    print("2. Run: git add .")
    print("3. Run: git commit --amend --no-edit")
    print("4. Run: git push -f origin main")
    print("\nWARNING: Force pushing will overwrite remote history!")

if __name__ == "__main__":
    main() 