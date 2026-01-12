from os import listdir
from containers.containers import teams_service, quiz_service, rounds_service, gamestate_service, answers_service
from services.models import GameState
from logger.logger import logger

MP4_PATH = "/app/static/media"

def get_mp4_by_id_question(q_id):
    video = [v for v in listdir(MP4_PATH) if q_id in v][0]
    return video

class GameController:
    def start_song(self):
        if quiz:=quiz_service.get_random_quiz():
            gamestate_service.update_game_state(GameState.SING)

            video = get_mp4_by_id_question(quiz["id_q"])
            rounds_service.set_current_question(quiz["id_q"])

            teams = teams_service.get_teams()
            answers_service.initialize_players(quiz['id_q'], teams)

            return video
        else:
            return False
    
    def send_question(self):
        if question:=rounds_service.get_current_question():
            gamestate_service.update_game_state(GameState.QUIZ)
            quiz = quiz_service.get_quiz(question['id_q'])
            quiz['id_q'] = question['id_q']
            rounds_service.set_start_question(question['id_q'])
            logger.info(f"sending quiz {quiz}")
            return quiz
       
    
    def on_quiz_timeout(self):
        logger.info(f"on quiz timeout > ")
        question = rounds_service.get_current_question()

        gamestate_service.update_game_state(GameState.RESULTS)

        answers_service.set_players_done(question['id_q'])
        round_answers = answers_service.get_all_player_answers(question['id_q'])
        logger.info(f"round answers {round_answers}")

        for ip, data in round_answers.items():
            logger.info(f"update points {ip}, {data['points']}, {data['p_audio']}")
            teams_service.update_points(ip, data['points'], data['p_audio'])

        quiz = quiz_service.get_quiz(question['id_q'])
        correct = quiz['correct']

        teams = teams_service.get_teams()

        scores_this_round = self._score_this_round(round_answers, teams)
        return teams, correct, scores_this_round
    
    def _score_this_round(self, round_answers, teams):
        scores = {}
        logger.info(f"round scores {round_answers} {teams}")
        for ip, data in round_answers.items():
            logger.info(f"score {[teams['ip:'+ip]['username']]} = 'points': {data['points']}, p_audio: {data['p_audio']}")
            scores[teams['ip:'+ip]['username']] = {'points': data['points'], 'p_audio': data['p_audio']}
        return scores
        





