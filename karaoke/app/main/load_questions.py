import redis, json, random

rd = redis.Redis(host='redistimeseries', port=6379, decode_responses=True)

with open("/app/quiz/questions.json", "r", encoding="utf-8") as f:
    questions = json.load(f)

questions = random.sample(questions, min(10, len(questions)))

for quest in questions:
    try:
        quest['done'] = False
        quest['id_q'] = quest.pop('quid')
        rd.json().set(f"quiz:{quest['id_q']}", "$", quest)
        print(f"new question added {quest['id_q']}")
    except Exception as e:
        print(f"question adding error: {quest} {e}")

