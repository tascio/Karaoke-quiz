from logger.logger import logger
import time

class RedisClient:
    def __init__(self, redis_client):
        self.redis = redis_client
    
class TeamsRepo:
    def __init__(self, redis: RedisClient):
        self.redis = redis.redis

    def exist_ip(self, ip):
        return bool(self.redis.json().get(f"ip:{ip}"))
    
    def exist_username(self, username):
        teams = self.get_teams()
        return bool(any(team_data['username'] == username for team_data in teams.values()))
    
    def create(self, ip, username):
        try:
            self.redis.json().set(f"ip:{ip}", "$", {
                "username": username,
                "points": 0,
                "p_audio": 0,
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
        
    def update_points(self, ip, points, p_audio):
        try:
            if points:
                self.redis.json().numincrby(f"ip:{ip}", "$.points", points)
            if p_audio:
                self.redis.json().numincrby(f"ip:{ip}", "$.p_audio", p_audio)

            logger.info(f"point update for {ip} with {points} {p_audio}")
        except Exception as e:
            logger.error(f"Error in points update {ip} - {e}")
            return False
        return True
    
class QuizRepo:
    def __init__(self, redis: RedisClient):
        self.redis = redis.redis
    
    def get_quizzes_not_done(self):
        keys = []
        cursor = 0

        while True:
            cursor, batch = self.redis.scan(cursor, match="quiz:*", count=100)

            for id_q in batch:
                q = self.redis.json().get(id_q)
                if q and not q.get("done", False):
                    keys.append(id_q)

            if cursor == 0:
                break
        return keys
    
    def mark_quiz_done(self, id_q):
        try:
            self.redis.json().set(f"quiz:{id_q}", "$.done", True)
        except Exception as e:
            logger.error(f"Error marking quiz done {id_q}: {e}")
            return False

    def get_quiz(self, id_q):
        quiz = self.redis.json().get(f"quiz:{id_q}")
        return quiz
    
    def get_all_quizzes(self):
        quiz = []
        cursor = 0
        try:
            while True:
                cursor, keys = self.redis.scan(cursor, match="quiz:*", count=100)
                for key in keys:
                    if isinstance(key, bytes):
                        key = key.decode("utf-8")
                    quiz.append(self.redis.json().get(key))
                if cursor == 0:
                    break
            return quiz    
        except Exception as e:
            logger.error(f"Error in getting all quiz {e}")
            return False
    

class RoundsRepo:
    def __init__(self, redis: RedisClient):
        self.redis = redis.redis

    def set_start_question(self):
        try:
            t = time.time()
            self.redis.json().set(f"round:current", "$.start_ts", t)
            logger.info(f"question start setted {t}")
            return True
        except Exception as e:
            logger.error(f"start setting question error: {e}")
            return False
    
    def initialize_current_qestion_round(self, question):
        try:
            question["start_ts"] = None
            self.redis.json().set("round:current", "$", question)
            logger.info(f"Inizializzato round current question {question}")
            return True
        except Exception as e:
            logger.error(f"Error in inizialize current question {e}")
            return False
    
    def get_current_question_round(self):
        try:
            question = self.redis.json().get("round:current", "$")[0]
            logger.info(f"Getting current question {question}")
            return question
        except Exception as e:
            logger.error(f"Error getting current question round {e}")
            return False
        
class AnswersRepo:
    def __init__(self, redis: RedisClient):
        self.redis = redis.redis
    
    def exist_answer(self, id_q, ip):
        data = self.redis.json().get(f"answer:{id_q}", f"$.players.{ip}.done")
        return bool(data and data[0] is True)

    
    def initialize_player(self, id_q, ip):
        if not self.redis.exists(f"answer:{id_q}"):
            self.redis.json().set(f"answer:{id_q}", "$", {"players": {}})
        self.redis.json().set(f"answer:{id_q}", f"$.players.{ip}", {
                "response_time": None,
                "answer": None,
                "points": 0,
                "p_audio": 1,
                "done": False,
            }
        )
    
    def set_players_done(self, id_q):
        try:
            data = self.redis.json().get(f"answer:{id_q}", "$.players")
            if not data:
                return False

            players = data[0] 

            for ip in players.keys():
                self.redis.json().set(f"answer:{id_q}", f"$.players.{ip}.done", True)
            # self.redis.json().set(f"answer:{id_q}", "$.players.*.done", True)
            return True
        except Exception as e:
            logger.error(f"set players done error: {e}")
            return False

    def save_player_answer(self, id_q, ip, answer, points, response_time):        
        try:
            self.redis.json().set(f"answer:{id_q}", f"$.players.{ip}.response_time", response_time)
            self.redis.json().set(f"answer:{id_q}", f"$.players.{ip}.answer", answer)
            self.redis.json().set(f"answer:{id_q}", f"$.players.{ip}.points", points)
            self.redis.json().set(f"answer:{id_q}", f"$.players.{ip}.done", True)
            logger.info(f"player answer saved {id_q} {ip} - answ={answer} - rt={response_time} - p={points}")
        except Exception as e:
            logger.error(f"player answer error {e}")
            return False
        return True
    
    def save_player_p_audio(self, id_q, ip, p_audio):
        self.redis.json().set(f"answer:{id_q}", f"$.players.{ip}.p_audio", p_audio)

    def get_all_player_answers(self, id_q):
        data = self.redis.json().get(f"answer:{id_q}", "$.players")
        if not data:
            return False

        return data[0]
    
    def get_player_answer(self, id_q, ip):
        answ = self.redis.json().get(f"answer:{id_q}", f"$.players.{ip}.answer")
        logger.info(f"get player answer id_q={id_q} ip={ip} answ={answ}")
        if answ is None:
            return False
        return answ[0] if len(answ) > 0 else False

class CurrentGameState:
    def __init__(self, redis: RedisClient):
        self.redis = redis.redis
        self.redis.json().set(f"game:state", "$", {"state" : "idle" })
        self.redis.json().set(f"game:audio", "$", {"effects" : True })
        
    def update_game_state(self, state):
        try:
            self.redis.json().set(f"game:state", "$", {
                "state" : state
            })
            logger.info(f"game state updated in {state}")
            return True
        except Exception as e:
            logger.error(f"error in game state update {e}")
            return False

    def get_current_game_state(self):
        state = (self.redis.json().get(f"game:state") or {}).get('state', None)
        logger.info(f"get game state {state}")
        return state
    
    def set_audio_effects_karaoke(self, setting):
        try:
            self.redis.json().set("game:audio_k", "$", {
                "effects": setting
            })
            logger.info(f"game audio karaoke effects setting {setting}")
            return True
        except Exception as e:
            logger.error(f"error in game audio karaoke effects setting {e}")
            return False
        
    def get_audio_effects_karaoke(self):
        effects = (self.redis.json().get("game:audio_k") or {}).get('effects', None)
        logger.info(f"get game audio karaoke effetcs {effects}")
        return effects
    
    def set_audio_effects_players(self, setting):
        try:
            self.redis.json().set("game:audio_p", "$", {
                "effects": setting
            })
            logger.info(f"game audio players effects setting {setting}")
            return True
        except Exception as e:
            logger.error(f"error in game audio players effects setting {e}")
            return False
        
    def get_audio_effects_players(self):
        effects = (self.redis.json().get("game:audio_p") or {}).get('effects', None)
        logger.info(f"get game audio players effetcs {effects}")
        return effects