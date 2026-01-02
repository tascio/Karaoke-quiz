from main.dbdriver import Redis_driver
from main.extensions import redis


class redis_view:
    def __init__(self):
        self.redis = Redis_driver(redis)
    
    def get_teams(self):
        return self.redis.get_teams()
    
    def get_team(self, ip):
        return self.redis.get_team(ip)

class redis_write:
    def __init__(self):
        self.redis = Redis_driver(redis)
    
    def registrazione(self, ip, username):
        if self.redis.registrazione(ip, username):
            return True
        else:
            return False
        
    def update_points(self, ip, punteggio, indovinate, sbagliate, p_audio):
        self.redis.update_points(ip, punteggio, indovinate, sbagliate, p_audio)
    
    def update_points_audio(self, ip, p_audio):
        self.redis.update_points_audio(ip, p_audio)

class redis_questions:
    def __init__(self):
        self.redis = Redis_driver(redis)

    def get_random_question(self):
        return self.redis.get_random_question()
    
    def set_current_question(self, question):
        return self.redis.set_current_question(question)
    
    def set_start_question(self, question):
        return self.redis.set_start_question(question)
    
    def get_current_question(self):
        return self.redis.get_current_question()
    
    def get_all_questions(self):
        return self.redis.get_all_questions()

class redis_answer:
    def __init__(self):
        self.redis = Redis_driver(redis)
    
    def save_player_answer(self, ip, answer, response_time_ms):
        ip = ip.split(':')[-1]
        return self.redis.save_player_answer(ip, answer, response_time_ms)

    def get_player_answer(self, ip):
        ip = ip.split(':')[-1]
        return self.redis.get_player_answer(ip)
    
    def set_processed(self, ip):
        ip = ip.split(':')[-1]
        return self.redis.set_processed(ip)
    
    def clear_player_answers(self):
        return self.redis.clear_player_answers()
    
    def reset_player_answers(self, teams):
        return self.redis.reset_player_answers(teams)

class redis_game_state:
    #IDLE, #SING, #QUIZ
    def __init__(self):
        self.redis = Redis_driver(redis)
    
    def update_game_state(self, state):
        return self.redis.update_game_state(state)

    def get_current_game_state(self):
        return self.redis.get_current_game_state()