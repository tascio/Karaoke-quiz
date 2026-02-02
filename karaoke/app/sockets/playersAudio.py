from main.extensions import socketio
from containers.containers import gamestate_service

@socketio.on("setAudioEffectsPlayersOn")
def setAudioEffectsPlayersOn():
    gamestate_service.set_audio_effects_players(True)
    socketio.emit("update_audioEffectsPlayers_state", gamestate_service.get_audio_effects_players())

@socketio.on("setAudioEffectsPlayersOff")
def setAudioEffectsPlayersOff():
    gamestate_service.set_audio_effects_players(False)
    socketio.emit("update_audioEffectsPlayers_state", gamestate_service.get_audio_effects_players())