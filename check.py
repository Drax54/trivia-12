import
json
try:
    with open('data/quizzes.json', 'r', encoding='utf-8') as f:
        quizzes = json.load(f)
    with open('data/content-quiz.json', 'r', encoding='utf-8') as f:
        content = json.load(f)
    quiz_ids = set(q['id'] for q in quizzes['quizzes'])
    content_ids = set(c['quizId'] for c in content['contents'])
    missing = quiz_ids - content_ids
    print(f'Total quizzes: {len(quiz_ids)}')
    print(f'With content: {len(content_ids)}')
    print(f'Missing content: {len(missing)}')
except Exception as e:
    print(f'Error: {e}')
