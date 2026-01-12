from main.extensions import redis
from main.dbdriver import RedisClient, TeamsRepo, QuizRepo, RoundsRepo, CurrentGameState, AnswersRepo
from services.models import TeamsService, QuizService, RoundsService, GameStateService, AnswersService

redis_client = RedisClient(redis)

teams_repo = TeamsRepo(redis_client)
teams_service = TeamsService(teams_repo)

quiz_repo = QuizRepo(redis_client)
quiz_service = QuizService(quiz_repo)

rounds_repo = RoundsRepo(redis_client)
rounds_service = RoundsService(rounds_repo)

gamestate_repo = CurrentGameState(redis_client)
gamestate_service = GameStateService(gamestate_repo)

answers_repo = AnswersRepo(redis_client)
answers_service = AnswersService(answers_repo, rounds_repo, quiz_repo)