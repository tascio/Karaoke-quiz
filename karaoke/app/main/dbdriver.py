from main.logger import logger
import random, time

TEN_CENTS = 1000
BASE_CENTS = 100
TEN_MS = 10000
BASE_MS = 1000

class Redis_driver:
    def __init__(self, redis):
        self.redis = redis
    
    def registrazione(self, ip, username):
        ip_ = self.redis.json().get(f"ip:{ip}")

        if ip_:
            logger.error(f"registration ip already exist {ip}")
            return False
        teams = self.get_teams()
        if any(team_data['username'] == username for team_data in teams.values()):
            logger.error(f"Registration failed: Username already exists {username}")
            return False
        
        try:
            self.redis.json().set(f"ip:{ip}", "$", {
                "username": username,
                "punteggio": 0,
                "p_audio": 0,
                "indovinate": 0,
                "sbagliate": 0,
            })
            logger.info(f"new player added {ip} {username}")
        except Exception as e:
            logger.error(f"Redis driver registration: {e}")
            return False
        return True
    
    def get_teams(self):
        teams = {}
        cursor = 0

        while True:
            cursor, keys = self.redis.scan(cursor, match="ip:*", count=100)
            for key in keys:
                if isinstance(key, bytes):
                    key = key.decode("utf-8")
                teams[key] = self.redis.json().get(key)
            if cursor== 0:
                break
        return teams
    
    def get_team(self, ip):
        ip = self.redis.json().get(f"ip:{ip}")
        if ip:
            return ip
        else:
            return False
        
    def update_points(self, ip, punteggio, indovinate, sbagliate, p_audio):
        try:
            if punteggio:
                self.redis.json().numincrby(ip, "$.punteggio", punteggio)
            if indovinate:
                self.redis.json().numincrby(ip, "$.indovinate", indovinate)
            if sbagliate:
                self.redis.json().numincrby(ip, "$.sbagliate", sbagliate)
            if p_audio:
                self.redis.json().numincrby(ip, "$.p_audio", p_audio)

            logger.info(f"point update for {ip} with {punteggio} {indovinate} {sbagliate} {p_audio}")
        except Exception as e:
            logger.error(f"Error in points update {ip} - {e}")
            return False
        return True
    
    def update_points_audio(self, ip, p_audio):
        logger.info(f"update point audio {ip} {p_audio}")
        data = self.redis.json().get(f"answer:{ip}")
        logger.info(f"DEBUG answer:{ip} = {data}")
        try:
            if p_audio:
                self.redis.json().numincrby(f"answer:{ip}", "$.p_audio", p_audio)
            logger.info(f"points audio update for {ip} with {p_audio}")
        except Exception as e:
            logger.error(f"Error in points audio update {ip} - {e}")
            return False
        return True
    
    def get_random_question(self):
        keys = []
        cursor = 0

        while True:
            cursor, batch = self.redis.scan(
                cursor,
                match="questions:*",
                count=100
            )

            for key in batch:
                q = self.redis.json().get(key)
                if q and not q.get("done", False):
                    keys.append(key)

            if cursor == 0:
                break

        if not keys:
            return False  #quiz finito

        key = random.choice(keys)
        try:
            self.redis.json().set(key, "$.done", True)
        except Exception as e:
            logger.error(f"Error marking question done {key}: {e}")
            return None
        question = self.redis.json().get(key)
        question["id"] = key.split(":")[1]

        return question

    def set_current_question(self, question):
        try:
            self.redis.json().set("current_question", "$", question)
            logger.info(f"question setted {question}")
        except Exception as e:
            logger.error(f"setting question error: {e}")
            return False
    
    def set_start_question(self, question):
        question["start_ts"] = time.time()
        try:
            self.redis.json().set("current_question", "$", question)
            logger.info(f"question time start setted {question}")
        except Exception as e:
            logger.error(f"question time start error: {e}")
            return False

    def get_current_question(self):
        try:
            question = self.redis.json().get("current_question")
            return question
        except Exception as e:
            logger.error(f"Error getting current question: {e}")
            return False
    
    def get_all_questions(self):
        questions = []
        cursor = 0
        try:
            while True:
                cursor, keys = self.redis.scan(cursor, match="questions:*", count=100)
                for key in keys:
                    if isinstance(key, bytes):
                        key = key.decode("utf-8")
                    questions.append(self.redis.json().get(key))
                if cursor== 0:
                    break
            return questions    
        except Exception as e:
            logger.error(f"Error in getting all questions {e}")
            return False
        
    def save_player_answer(self, ip, answer, response_time_ms):
        logger.info(f"save player answer {ip} {answer} {response_time_ms}")
        ip_ = self.redis.json().get(f"answer:{ip}")
        if ip_.get("done"):
            logger.error(f"player has already responded  {ip}")
            return False
        
        try:
            self.redis.json().set(f"answer:{ip}", "$.answer", answer)
            self.redis.json().set(f"answer:{ip}", "$.response_time_ms", response_time_ms)
            logger.info(f"player answer saved {ip} - {answer}")
        except Exception as e:
            logger.error(f"player answer error {e}")
            return False
        return True

    def get_player_answer(self, ip):
        logger.info(f"get player {ip}")
        return self.redis.json().get(f"answer:{ip}") or False

    def set_processed(self, ip):
        logger.info(f"set player {ip} done True")
        try:
            self.redis.json().set(f"answer:{ip}", "$.done", True)
            logger.info(f"set player {ip} done True")
        except Exception as e:
            logger.error(f"error in set done player {e}")
            return False
    
    def clear_player_answers(self):
        logger.info("Clearing all player answers")
        cursor = 0
        try:
            while True:
                cursor, keys = self.redis.scan(
                    cursor=cursor,
                    match="answer:*",
                    count=100
                )
                if keys:
                    self.redis.delete(*keys)
                    logger.info(f"Deleted {len(keys)} answer keys")
                if cursor == 0:
                    break
        except Exception as e:
            logger.error(f"Error clearing player answers: {e}")
            return False
        return True
    
    def reset_player_answers(self, teams):
        for ip_, _ in teams.items():
            ip = ip_.split(':')[-1]
            try:
                self.redis.json().set(f"answer:{ip}", "$", {
                    "answer": -1,
                    "response_time_ms": TEN_CENTS,
                    "p_audio": 0,
                    "done" : False
                })
                logger.info(f"reset player answer saved {ip} {self.get_player_answer(ip_)}")
            except Exception as e:
                logger.error(f"reset player answer error {e}")
                return False
        return True


    def update_game_state(self, state):
        try:
            self.redis.json().set(f"game:state", "$", {
                "state" : state
            })
            logger.info(f"game state updated in {state}")
        except Exception as e:
            logger.error(f"error in game state update {e}")
            return False

    def get_current_game_state(self):
        state = self.redis.json().get(f"game:state")
        logger.info(f"get game state {state}")
        return state