import redis, json, random

rd = redis.Redis(host='redistimeseries', port=6379, decode_responses=True)

with open("/app/quiz/questions.json", "r", encoding="utf-8") as f:
    questions = json.load(f)

questions = random.sample(questions, min(10, len(questions)))

for quest in questions:
    try:
        rd.json().set(f"questions:{quest['id']}", "$", {
            "question": quest['question'],
            "answers": quest['answers'],
            "correct": quest['correct'],
            "done" : False
        })
        print(f"new question added {quest['id']}")
    except Exception as e:
        print(f"question adding error: {e}")
