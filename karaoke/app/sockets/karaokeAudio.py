from main.extensions import socketio
from containers.containers import gamestate_service

@socketio.on("setAudioEffectsKaraokeOn")
def setAudioEffectsKaraokeOn():
    gamestate_service.set_audio_effects_karaoke(True)
    socketio.emit("update_audioEffectsKaraoke_state", gamestate_service.get_audio_effects_karaoke())

@socketio.on("setAudioEffectsKaraokeOff")
def setAudioEffectsKaraokeOff():
    gamestate_service.set_audio_effects_karaoke(False)
    socketio.emit("update_audioEffectsKaraoke_state", gamestate_service.get_audio_effects_karaoke())

@socketio.on("audioStopAllKaraoke")
def audioStopAllKaraoke():
    socketio.emit("audioStopAllKaraoke")

@socketio.on("audioBoxingBell")
def audioBoxingBell():
    socketio.emit("audioBoxingBellKaraoke")

@socketio.on("audioApplauseCrowd")
def audioApplauseCrowd():
    socketio.emit("audioApplauseCrowdKaraoke")

@socketio.on("audioCrowdPanic")
def audioCrowdPanic():
    socketio.emit("audioCrowdPanicKaraoke")

@socketio.on("audioGemido")
def audioGemido():
    socketio.emit("audioGemidoKaraoke")

@socketio.on("audioGemido2")
def audioGemido2():
    socketio.emit("audioGemido2Karaoke")

@socketio.on("audioAttenzioneNapoletan")
def audioAttenzioneNapoletan():
    socketio.emit("audioAttenzioneNapoletanKaraoke")

@socketio.on("audioMarioByeBye")
def audioMarioByeBye():
    socketio.emit("audioMarioByeByeKaraoke")

@socketio.on("audioSignLimoni")
def audioSignLimoni():
    socketio.emit("audioSignLimoniKaraoke")

@socketio.on("audioItaRage")
def audioItaRage():
    socketio.emit("audioItaRageKaraoke")