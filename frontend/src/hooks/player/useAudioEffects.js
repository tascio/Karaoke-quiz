import { useRef } from "react";

export default function useAudioEffects() {
  const Pnull = "/static/audio/players/null";
  const Prights = "/static/audio/players/rights";
  const Pwrongs = "/static/audio/players/wrongs";

  const audioNull = useRef([
    new Audio(`${Pnull}/un_pollo.mp3`),
    new Audio(`${Pnull}/eww_dude.mp3`),
    new Audio(`${Pnull}/dramatic_fart.mp3`),
  ]);
  const audioRights = useRef([
    new Audio(`${Prights}/happy_happy.mp3`),
    new Audio(`${Prights}/ok_letsgo.mp3`),
    new Audio(`${Prights}/ohhhh.mp3`),
    new Audio(`${Prights}/bad_to_bone.mp3`),
    new Audio(`${Prights}/jet_set_radio.mp3`),
    new Audio(`${Prights}/bungee_zombie.mp3`),
    new Audio(`${Prights}/oh_yes_daddy.mp3`),
    new Audio(`${Prights}/i_cant_stop_winning.mp3`),
    new Audio(`${Prights}/halleluja.mp3`),
  ]);

  const audioWrongs = useRef([
    new Audio(`${Pwrongs}/gemido_anime.mp3`),
    new Audio(`${Pwrongs}/flight_reacs.mp3`),
    new Audio(`${Pwrongs}/death.mp3`),
    new Audio(`${Pwrongs}/fail_trumpet.mp3`),
    new Audio(`${Pwrongs}/incorrect_buzzer.mp3`),
    new Audio(`${Pwrongs}/sad_meow.mp3`),
    new Audio(`${Pwrongs}/werehog_death.mp3`),
    new Audio(`${Pwrongs}/bart_simpson.mp3`),
    new Audio(`${Pwrongs}/youre_fired.mp3`),
  ]);

  //PART OF THE CODE RELATING EXECUTING OF AUDIO EFFECTS
function playRandomAudio(audioList) {
  if (!audioList || audioList.length === 0) return;

  audioList.forEach(a => {
    a.pause();
    a.currentTime = 0;
  });

  const index = Math.floor(Math.random() * audioList.length);
  const audio = audioList[index];

  audio.currentTime = 0;
  audio.play().catch(err => {
    console.warn("Audio play blocked:", err);
  });
  }

  return {
    audioNull: audioNull.current,
    audioRights: audioRights.current,
    audioWrongs: audioWrongs.current,
    playRandomAudio
  };

} 

  

