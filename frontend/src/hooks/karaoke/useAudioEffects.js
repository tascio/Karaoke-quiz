import { useEffect, useRef } from "react";
import { socket } from "../../socket";

export default function useAudioEffects() {
  const Peffects = "/static/audio/karaoke/effects";

  const audioMap = useRef({
    audioGemido2: new Audio(`${Peffects}/gemido_anime2.mp3`),
    audioBoxingBell: new Audio(`${Peffects}/boxing_bell.mp3`),
    audioApplauseCrowd: new Audio(`${Peffects}/applause_crowd.mp3`),
    audioCrowdPanic: new Audio(`${Peffects}/crowd_panic.mp3`),
    audioGemido: new Audio(`${Peffects}/gemido_anime.mp3`),
    audioAttenzioneNapoletan: new Audio(`${Peffects}/attenzione_napoletan.mp3`),
    audioMarioByeBye: new Audio(`${Peffects}/mario_bye_bye.mp3`),
    audioSignLimoni: new Audio(`${Peffects}/sign_i_limoni.mp3`),
    audioItaRage: new Audio(`${Peffects}/ita_rage.mp3`),
  });

  const toggleAudio = async (key) => {
    const audio = audioMap.current[key];
    if (!audio) return;

    try {
      if (!audio.paused) {
        audio.pause();
        audio.currentTime = 0;
      } else {
        audio.currentTime = 0;
        await audio.play();
      }
    } catch (err) {
      console.warn("Audio play blocked:", err);
    }
  };

  useEffect(() => {
    const handlers = {
      audioGemido2Karaoke: () => toggleAudio("audioGemido2"),
      audioBoxingBellKaraoke: () => toggleAudio("audioBoxingBell"),
      audioApplauseCrowdKaraoke: () => toggleAudio("audioApplauseCrowd"),
      audioCrowdpanicKaraoke: () => toggleAudio("audioCrowdPanic"),
      audioGemidoKaraoke: () => toggleAudio("audioGemido"),
      audioAttenzioneNapoletanKaraoke: () => toggleAudio("audioAttenzioneNapoletan"),
      audioMarioByeByeKaraoke: () => toggleAudio("audioMarioByeBye"),
      audioSignLimoniKaraoke: () => toggleAudio("audioSignLimoni"),
      audioItaRageKaraoke: () => toggleAudio("audioItaRage"),
    };

    Object.entries(handlers).forEach(([event, handler]) => socket.on(event, handler));

    return () => {
      Object.entries(handlers).forEach(([event, handler]) => socket.off(event, handler));
    };
  }, []);

  return { toggleAudio, audioMap };
}
