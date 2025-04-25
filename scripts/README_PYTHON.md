# Trivia App Data Generator (Python)

This Python script generates JSON data for quizzes and questions using the OpenAI API. It's designed to match the structure of your existing data files exactly.

## Features

- Takes simple natural language input like "Under Movies, Action Movies, Classic Movies, Sci-Fi Movies"
- Automatically generates one quiz for each subcategory
- Creates 10 detailed questions for each quiz
- Outputs properly formatted JSON files that match your existing structure
- Uses OpenAI's GPT models for high-quality content generation

## Prerequisites

- Python 3.6 or higher
- OpenAI API key

## Installation

1. Install required packages:
   ```bash
   pip install openai python-dotenv
   ```

2. Set up your API key either:
   - In a `.env` file in the project root:
     ```
     OPENAI_API_KEY=your_api_key_here
     ```
   - Or as an environment variable

## Usage

1. Run the script:
   ```bash
   python scripts/generate-data-openai.py
   ```

2. When prompted, enter your input in the format:
   ```
   Under [Category], [Subcategory1], [Subcategory2], [Subcategory3], ...
   ```

   Example:
   ```
   Under Movies Sub Category, Action Movies, Classic Movies, Sci Fi Movies
   ```

3. The script will:
   - Parse your input to determine the category and subcategories
   - Generate quiz data for each subcategory
   - Generate 10 questions for each quiz
   - Save the data to JSON files in the `data/generated` directory

## Example Output

The script generates two files:

### 1. quizzes_[timestamp].json

```json
{
  "quizzes": [
    {
      "id": "action-movies",
      "categoryId": "movies",
      "subcategoryId": "action-movies",
      "name": "Action Movie Mayhem",
      "description": "Test your knowledge about explosive action films, iconic heroes, and heart-pumping stunts that defined the genre.",
      "questionCount": 28,
      "timeLimit": 20,
      "difficulty": "Medium",
      "popularity": 4.7,
      "attempts": 18500,
      "studyTopicId": "action-films-history",
      "tags": [
        "Action Heroes",
        "Blockbusters",
        "Stunts",
        "Action Directors"
      ]
    },
    {
      "id": "classic-movies",
      "categoryId": "movies",
      "subcategoryId": "classic-movies",
      "name": "Golden Age Cinema",
      "description": "Challenge yourself with questions about timeless classics from Hollywood's golden era.",
      "questionCount": 25,
      "timeLimit": 18,
      "difficulty": "Hard",
      "popularity": 4.5,
      "attempts": 15300,
      "studyTopicId": "classic-cinema-history",
      "tags": [
        "Film Classics",
        "Hollywood Golden Age",
        "Film History"
      ]
    },
    // Additional quizzes...
  ]
}
```

### 2. questions_[timestamp].json

```json
{
  "quizzes": [
    {
      "id": "action-movies",
      "title": "Action Movie Mayhem",
      "category": "Movies",
      "subcategory": "Action Movies",
      "description": "Test your knowledge about explosive action films, iconic heroes, and heart-pumping stunts that defined the genre.",
      "difficulty": "Medium",
      "timeLimit": 20,
      "questionCount": 10,
      "popularity": 4.7,
      "attempts": 18500,
      "tags": ["Action Heroes", "Blockbusters", "Stunts", "Action Directors"],
      "questions": [
        {
          "id": "q1",
          "text": "Which actor is known for performing his own stunts in the 'Mission: Impossible' franchise?",
          "options": [
            "Tom Cruise",
            "Jason Statham",
            "Dwayne Johnson",
            "Vin Diesel"
          ],
          "correctAnswer": "Tom Cruise",
          "explanation": "Tom Cruise is famous for performing many dangerous stunts himself in the Mission: Impossible series, including hanging from the Burj Khalifa and clinging to the outside of an airplane during takeoff.",
          "difficulty": "Easy"
        },
        // Additional questions...
      ]
    },
    // Additional quizzes with questions...
  ]
}
```

## Customization

You can customize the script by:

- Changing the model used for generation (edit the `.env` file):
  ```
  MODEL=gpt-3.5-turbo  # Faster, cheaper
  ```
  or
  ```
  MODEL=gpt-4-turbo  # Higher quality, more expensive
  ```

- Modifying the system prompts in the script to guide content generation

## Troubleshooting

- **API Key Issues**: Make sure your OpenAI API key is correctly set in the `.env` file or as an environment variable
- **JSON Parsing Errors**: If you encounter JSON parsing errors, try running the script again (occasionally the API might not return perfectly formatted JSON)
- **Rate Limiting**: If you hit API rate limits, the script includes a small delay between calls to prevent this, but you might need to wait a few minutes before running it again

## Notes

- Each run generates up to 5 subcategories at once
- Each subcategory gets one quiz
- Each quiz gets 10 questions
- The script uses the OpenAI API, which may incur charges based on your usage 