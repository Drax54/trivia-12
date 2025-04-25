"""
Study Topic Content Generator using OpenAI API

This script generates in-depth, well-researched study content with rich HTML formatting
for the Trivia Master study section. The content is structured as a single HTML string
with sections for introduction, multiple detailed topics, and conclusion.

Usage: python generate-study-content.py

Prerequisites:
- Python 3.6+
- OpenAI API key set as an environment variable OPENAI_API_KEY
- Required packages: openai, python-dotenv, os, json, datetime, re
"""

import os
import json
import datetime
import re
import time
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

def clean_json_response(response):
    """
    Clean API response by removing markdown formatting
    
    Args:
        response (str): The raw API response
        
    Returns:
        str: Cleaned response ready for JSON parsing
    """
    # Remove markdown code block indicators if present
    response = re.sub(r'^```(json)?', '', response, flags=re.MULTILINE)
    response = re.sub(r'```$', '', response, flags=re.MULTILINE)
    
    # Trim whitespace
    response = response.strip()
    
    return response

def generate_topic_metadata(topic_name, category, subcategory):
    """
    Generate metadata for the study topic
    
    Returns:
        dict: Topic metadata
    """
    system_prompt = """
You are a metadata generator for educational content. Your task is to create appropriate metadata
for a study topic that will be used in an educational trivia application. This includes generating
an ID, description, meta description, and appropriate tags.

Follow these guidelines:
1. Generate concise but descriptive metadata
2. The ID should be the topic name in lowercase with hyphens (kebab-case)
3. The description should be a brief overview (1-2 sentences)
4. The meta description should be SEO-friendly (2-3 sentences)
5. Generate relevant tags (5-8 tags)
6. Estimate an appropriate reading time in minutes
7. Assign a difficulty level (Easy, Medium, or Hard)

Return ONLY the JSON object without any formatting or markdown.
"""

    user_prompt = f"""
Generate metadata for this study topic:
- Topic: {topic_name}
- Category: {category}
- Subcategory: {subcategory}

I need the following metadata fields:
1. id (kebab-case version of the topic name)
2. description (1-2 sentences overview)
3. metaDescription (2-3 sentences, SEO-friendly)
4. tags (5-8 relevant tags)
5. readingTime (estimated in minutes)
6. difficulty (Easy, Medium, or Hard)

Return the metadata as a valid JSON object. Do not include any markdown formatting (like ```json).
"""

    response = call_openai_api(system_prompt, user_prompt)
    
    try:
        # Clean the response before parsing as JSON
        cleaned_response = clean_json_response(response)
        print("Cleaned response:", cleaned_response[:100] + "..." if len(cleaned_response) > 100 else cleaned_response)
        
        # Parse the response as JSON
        metadata = json.loads(cleaned_response)
        return metadata
    except json.JSONDecodeError as e:
        print(f"Failed to parse metadata from OpenAI API response: {e}")
        print("Response was:", response)
        raise

def generate_topic_content(topic_name, category, subcategory):
    """
    Generate comprehensive study content as a single HTML string
    
    Returns:
        str: HTML-formatted content
    """
    system_prompt = """
You are an educational content creator specializing in creating comprehensive, well-researched study materials.
Your task is to create in-depth content for a specific study topic as a single HTML string with proper formatting and structure.

The content should be:
1. Academically rigorous and factually accurate
2. Well-organized with clear sections
3. Written in an engaging, educational style
4. Formatted as a single HTML string with proper styling

Follow these structural guidelines:
1. Create the content as a single HTML string that includes:
   - An introduction section with heading and paragraphs
   - 4-6 detailed content sections with headings, paragraphs, and interactive elements
   - A conclusion section with heading and summary

2. Include the following HTML structure:
   - Introduction section with <h2> heading
   - Content sections with <h2> headings and appropriate content
   - Each section should include "Mark as completed" buttons
   - Separators between major sections
   - Conclusion section with <h2> heading

3. Include a variety of content elements:
   - Paragraphs with proper spacing between them
   - Ordered or unordered lists
   - Tables with a standardized layout (see table instructions below)
   - Blockquotes from relevant sources
   - Image placeholders with alt text and captions

4. Use appropriate Tailwind CSS classes for styling:
   - Section margins and padding
   - Typography styles (headings, paragraphs)
   - Component styling (buttons, separators, etc.)

5. For TABLES, always use the following standardized structure:
   - All tables must have exactly 3 columns regardless of the topic
   - Always use the same column headers: "CATEGORY", "KEY POINT", "DETAILS"
   - Each table should have 3-5 rows of data
   - Apply the exact HTML structure and CSS classes shown in the example table
   - Table must be full width (min-w-full) and use the exact style classes provided
   - Use larger black text for better readability
   - Use brand color for headers with white bold text

The HTML should be properly formatted with appropriate classes that work with Tailwind CSS.
Make sure to include proper spacing between paragraphs with margin classes (mb-4).

IMPORTANT: Return ONLY the HTML string without any markdown formatting or code blocks (do not include ```html or ``` tags).
"""

    user_prompt = f"""
Create comprehensive study content for:
- Topic: {topic_name}
- Category: {category}
- Subcategory: {subcategory}

I need well-structured content as a SINGLE HTML STRING with this overall structure:

```html
<section>
  <h2 class="text-2xl font-bold mb-4">Introduction</h2>
  <div class="mb-4">
    <p class="mb-4">First paragraph of introduction...</p>
    
    <p>Second paragraph of introduction...</p>
  </div>
</section>

<div class="shrink-0 bg-border h-[1px] w-full my-8" data-orientation="horizontal">&nbsp;</div>

<section class="mb-8">
  <div class="flex justify-between items-center mb-4">
    <h2 class="text-2xl font-bold">Section Title</h2>
    <button class="text-sm flex items-center gap-2 text-slate-500 hover:text-[hsl(251.16deg_84.31%_60%)]">Mark as completed</button>
  </div>
  
  <div class="text-slate-700">
    <div>
      <p>Section content paragraph...</p>
      <p>Additional paragraph if needed...</p>
    </div>
  </div>
  
  <!-- Include one or more of: lists, tables, quotes, images -->
  
  <!-- Example list -->
  <div class="my-6">
    <ul class="list-disc pl-5 space-y-2">
      <li>List item 1</li>
      <li>List item 2</li>
    </ul>
  </div>
  
  <!-- Example blockquote -->
  <blockquote class="border-l-4 border-gray-300 pl-4 my-6 italic text-gray-600">
    <p>Quote text here</p>
  </blockquote>
  
  <!-- STANDARDIZED TABLE FORMAT - ALWAYS USE THIS EXACT STRUCTURE -->
  <div class="my-6 overflow-x-auto">
    <table class="min-w-full divide-y divide-gray-200 border rounded-lg">
      <thead class="bg-[hsl(251.16deg_84.31%_60%)]">
        <tr>
          <th class="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider" scope="col">CATEGORY</th>
          <th class="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider" scope="col">KEY POINT</th>
          <th class="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider" scope="col">DETAILS</th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        <tr class="bg-white">
          <td class="px-6 py-4 text-base text-black">Category 1</td>
          <td class="px-6 py-4 text-base text-black">Main point 1</td>
          <td class="px-6 py-4 text-base text-black">Detailed explanation 1</td>
        </tr>
        <tr class="bg-gray-50">
          <td class="px-6 py-4 text-base text-black">Category 2</td>
          <td class="px-6 py-4 text-base text-black">Main point 2</td>
          <td class="px-6 py-4 text-base text-black">Detailed explanation 2</td>
        </tr>
        <tr class="bg-white">
          <td class="px-6 py-4 text-base text-black">Category 3</td>
          <td class="px-6 py-4 text-base text-black">Main point 3</td>
          <td class="px-6 py-4 text-base text-black">Detailed explanation 3</td>
        </tr>
      </tbody>
    </table>
  </div>
</section>

<!-- More sections... -->

<div class="shrink-0 bg-border h-[1px] w-full my-8" data-orientation="horizontal">&nbsp;</div>

<section class="mb-8">
  <h2 class="text-2xl font-bold mb-4">Conclusion</h2>
  <div class="mb-4">
    <p>Conclusion paragraph...</p>
  </div>
</section>
```

Ensure you:
1. Create 4-6 main content sections
2. Include a variety of content elements (lists, tables, quotes, images)
3. Provide proper spacing between paragraphs
4. Maintain consistent styling with Tailwind CSS classes
5. Return ONLY the HTML string, not JSON, and no markdown formatting tags (do not include ```html or ``` tags)
6. IMPORTANT: For every table in the content, use EXACTLY the standardized table structure shown above with the three columns: CATEGORY, KEY POINT, and DETAILS. Do not modify the table structure or headers.

For images, use placeholder URLs like "URL-to-image-depicting-[description].jpg" with appropriate alt text and captions.
"""

    response = call_openai_api(system_prompt, user_prompt, temperature=0.8)
    
    # Clean any potential markdown formatting from the response
    return clean_json_response(response)

def validate_html_content(html_content):
    """
    Validate the generated HTML content
    
    Returns:
        bool: True if valid, False otherwise
    """
    # Check for required sections
    if not re.search(r'<h2[^>]*>Introduction</h2>', html_content, re.IGNORECASE):
        print("❌ Missing Introduction section")
        return False
        
    if not re.search(r'<h2[^>]*>Conclusion</h2>', html_content, re.IGNORECASE):
        print("❌ Missing Conclusion section")
        return False
    
    # Check for at least 2 content sections (beyond intro and conclusion)
    section_count = len(re.findall(r'<h2[^>]*>', html_content)) - 2  # Subtract intro and conclusion
    if section_count < 2:
        print(f"❌ Found only {section_count} content sections, need at least 2")
        return False
    
    # Check for various content elements
    if not re.search(r'<(ul|ol)[^>]*>', html_content):
        print("❌ No lists found in content")
        return False
    
    # Check for standardized table format with the required headers
    table_count = len(re.findall(r'<table[^>]*>', html_content))
    if table_count == 0:
        print("❌ No tables found in content")
        return False
    
    # Check for the standardized table headers
    required_headers = ["CATEGORY", "KEY POINT", "DETAILS"]
    for header in required_headers:
        if not re.search(fr'<th[^>]*>{header}</th>', html_content, re.IGNORECASE):
            print(f"❌ Missing required table header: {header}")
            return False
    
    # Check for reasonable content length
    if len(html_content) < 3000:
        print(f"❌ Content length ({len(html_content)} chars) is too short")
        return False
    
    return True

def generate_study_topic(topic_name, category, subcategory, category_id, subcategory_id):
    """
    Generate a complete study topic with metadata and content
    
    Returns:
        dict: Complete study topic data
    """
    print(f"\n📚 Generating study topic for: {topic_name}")
    
    # Step 1: Generate metadata
    print("⏳ Generating metadata...")
    metadata = generate_topic_metadata(topic_name, category, subcategory)
    print("✅ Metadata generated")
    
    # Step 2: Generate content as HTML string
    print("⏳ Generating detailed content (this may take a minute)...")
    html_content = generate_topic_content(topic_name, category, subcategory)
    print("✅ Content generated")
    
    # Step 3: Create a sample image URL (in a real scenario, you would use actual images)
    image_url = f"https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=1974&auto=format&fit=crop"
    
    # Step 4: Compile the complete topic
    topic = {
        "id": metadata.get("id", ""),
        "categoryId": category_id,
        "subcategoryId": subcategory_id,
        "name": topic_name,
        "description": metadata.get("description", ""),
        "metaDescription": metadata.get("metaDescription", ""),
        "image": image_url,
        "content": html_content,
        "difficulty": metadata.get("difficulty", "Medium"),
        "readingTime": metadata.get("readingTime", 15),
        "relatedQuizIds": [],
        "relatedTopicIds": [],
        "tags": metadata.get("tags", []),
        "lastUpdated": datetime.datetime.now().strftime("%Y-%m-%d")
    }
    
    return topic

def validate_study_topic(topic):
    """
    Validate the generated study topic for completeness
    
    Returns:
        bool: True if valid, False otherwise
    """
    required_fields = ["id", "categoryId", "subcategoryId", "name", "description", 
                     "metaDescription", "image", "content", "difficulty", 
                     "readingTime", "tags", "lastUpdated"]
    
    for field in required_fields:
        if field not in topic or not topic[field]:
            print(f"❌ Missing required field: {field}")
            return False
    
    # Validate HTML content
    if not validate_html_content(topic["content"]):
        return False
    
    return True

def save_to_json(topics, output_filename=None):
    """
    Save generated topics to a JSON file
    
    Args:
        topics (list): List of generated study topics
        output_filename (str, optional): Custom output filename
        
    Returns:
        str: Path to the saved file
    """
    if not output_filename:
        output_filename = f"study_topics_{TIMESTAMP}.json"
    
    output_path = os.path.join(OUTPUT_DIR, output_filename)
    
    data = {"topics": topics}
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
    
    return output_path

def main():
    print("📚 Study Topic Content Generator using OpenAI API")
    print("================================================")
    
    try:
        # Get user input
        print("\nEnter details for the study topic:")
        topic_name = input("Topic name (e.g., 'History of Jazz Music'): ")
        category = input("Category (e.g., 'Music'): ")
        subcategory = input("Subcategory (e.g., 'Jazz'): ")
        category_id = input("Category ID (e.g., 'entertainment'): ")
        subcategory_id = input("Subcategory ID (e.g., 'music'): ")
        
        if not topic_name or not category or not subcategory or not category_id or not subcategory_id:
            print("❌ All fields are required. Exiting...")
            return
        
        print(f"\n✅ Generating study topic:")
        print(f"- Topic: {topic_name}")
        print(f"- Category: {category}")
        print(f"- Subcategory: {subcategory}")
        print(f"- Category ID: {category_id}")
        print(f"- Subcategory ID: {subcategory_id}")
        
        # Generate the study topic with retry logic
        max_attempts = 3
        attempt = 0
        success = False
        
        while attempt < max_attempts and not success:
            attempt += 1
            try:
                print(f"\nAttempt {attempt}/{max_attempts}:")
                # Generate the study topic
                topic = generate_study_topic(topic_name, category, subcategory, category_id, subcategory_id)
                
                # Validate the generated topic
                if not validate_study_topic(topic):
                    print(f"❌ Generated topic failed validation on attempt {attempt}.")
                    if attempt < max_attempts:
                        print("Retrying...")
                        continue
                    else:
                        print("Max attempts reached. Please try again later.")
                        return
                
                # Save to JSON
                output_path = save_to_json([topic])
                
                print("\n✅ Study topic generation complete!")
                print(f"Output saved to: {output_path}")
                
                print("\n📝 Next steps:")
                print("1. Review the generated file")
                print("2. Manually copy the data to your study-topics.json file")
                print("3. Make any necessary adjustments or edits")
                
                success = True
                
            except Exception as e:
                print(f"\n❌ Error on attempt {attempt}: {e}")
                if attempt < max_attempts:
                    print("Retrying...")
                    time.sleep(2)  # Wait before retrying
                else:
                    print("Max attempts reached. Please try again later.")
                    return
        
    except KeyboardInterrupt:
        print("\n\n❌ Process interrupted by user. Exiting...")
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        print("Please try again later.")

if __name__ == "__main__":
    main() 