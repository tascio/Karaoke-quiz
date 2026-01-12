from main.dbdriver import TeamsRepo, RoundsRepo, QuizRepo, CurrentGameState, RoundsRepo, AnswersRepo
from logger.logger import logger
from configs.config import *
import random

class GameState:
    IDLE = "idle"
    SING = "sing"
    QUIZ = "quiz"
    QUIZ_END = "quiz_end"
    RESULTS = "results"

class TeamsService:
    def __init__(self, teams_repo: TeamsRepo):
        self.teams = teams_repo

    def register(self, ip, username):
        if self.teams.exist_ip(ip):
            return False
        if self.teams.exist_username(username):
            return False
        self.teams.create(ip, username)
        return True
    
    def update_points(self, ip, points, p_audio):
        self.teams.update_points(ip, points, p_audio)
    
    def get_teams(self):
        return self.teams.get_teams()
    
    def get_team(self, ip):
        return self.teams.get_team(ip)

class QuizService:
    def __init__(self, quiz_repo: QuizRepo):
        self.quiz = quiz_repo
    
    def get_random_quiz(self):
        quizzes = self.quiz.get_quizzes_not_done()
        if not quizzes:
            return False
        
        key = random.choice(quizzes).split(':')[-1]
        self.quiz.mark_quiz_done(key)

        quiz = self.quiz.get_quiz(key)
        quiz['id_q'] = key
        return quiz
    
    def get_quiz(self, id_q):
        return self.quiz.get_quiz(id_q)
    
    def get_all_quizzes(self):
        return self.quiz.get_all_quizzes()
    
class RoundsService:
    def __init__(self, rounds_service: RoundsRepo):
        self.round = rounds_service
    
    def set_current_question(self, id_q):
        self.round.set_current_question(id_q)
    
    def set_start_question(self, id_q):
        self.round.set_start_question(id_q)
    
    def get_current_question(self):
        return self.round.get_current_question()

class AnswersService:
    def __init__(self, answers_repo: AnswersRepo, rounds_repo: RoundsRepo, quiz_repo: QuizRepo):
        self.answer = answers_repo
        self.rounds = rounds_repo
        self.quiz = quiz_repo

    def exist_answer(self, id_q, ip):
        return self.answer.exist_answer(id_q, ip)
    
    def initialize_players(self, id_q, ips):
        for ip in ips:
            ip = ip.split(':')[-1]
            logger.info(f"initialize round {id_q} player {ip}")
            self.answer.initialize_player(id_q, ip)
    
    def set_players_done(self, id_q):
        self.answer.set_players_done(id_q)
    
    def save_player_answer(self, ip, answer, time_answer):
        round = self.rounds.get_current_question()
        id_q = round['id_q']
        start_ts = round['start_ts']

        if self.answer.exist_answer(id_q, ip):
            logger.error(f"player has already responded {id_q} {ip}")
            return "you have already responded"

        response_time = int((time_answer - start_ts) * CD_BASE)
        logger.info(f"{ip} answer in {start_ts} - {time_answer} = {response_time}")

        if response_time > CD_PER_BASE:
            logger.warning(f"Answer arrived too late {ip}")
            return "ops, too late :("
        
        points = self._calculate_points(id_q, answer, response_time)

        return self.answer.save_player_answer(id_q, ip, answer, points, response_time)         
    
    def save_player_p_audio(self, id_q, ip, p_audio):
        self.answer.save_player_p_audio(id_q, ip, p_audio)
    
    def get_all_player_answers(self, id_q):
        return self.answer.get_all_player_answers(id_q)
    
    def get_player_answer(self, id_q, ip):
        return self.answer.get_player_answer(id_q, ip)
        
    def _calculate_points(self, id_q, answer, response_time):
        quiz = self.quiz.get_quiz(id_q)
        correct = quiz['correct']

        if answer == correct:
            points = CD_PER_BASE - response_time
            return points
        return 0

class GameStateService:
    def __init__(self, gamestate_service: CurrentGameState):
        self.gmservice = gamestate_service

    def update_game_state(self, state):
        return self.gmservice.update_game_state(state)
    
    def get_current_game_state(self):
        return self.gmservice.get_current_game_state()


