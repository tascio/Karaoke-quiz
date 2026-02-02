var audioEffectsPlayers = false;

//PART OF THE CODE RELATING INITIALIZING AUDIO EFFECTS
//null
const Pnull = "/static/audio/players/null"
const audioUnpollo = new Audio(`${Pnull}/un_pollo.mp3`);
const audioEwwDude = new Audio(`${Pnull}/eww_dude.mp3`);
const audioDramaticfart = new Audio(`${Pnull}/dramatic_fart.mp3`);
//rights
const Prights = "/static/audio/players/rights"
const audioHappy = new Audio(`${Prights}/happy_happy.mp3`);
const audioOk = new Audio(`${Prights}/ok_letsgo.mp3`);
const audioOhhhh = new Audio(`${Prights}/ohhhh.mp3`);
const audioBtb = new Audio(`${Prights}/bad_to_bone.mp3`);
const audioJsr = new Audio(`${Prights}/jet_set_radio.mp3`);
const audioBungeeZombie = new Audio(`${Prights}/bungee_zombie.mp3`);
const audioOhyesdaddy = new Audio(`${Prights}/oh_yes_daddy.mp3`);
const audioIcantstopwinning = new Audio(`${Prights}/i_cant_stop_winning.mp3`);
const audioHalleluja = new Audio(`${Prights}/halleluja.mp3`);
//wrongs
const Pwrongs = "/static/audio/players/wrongs"
const audioGemido = new Audio(`${Pwrongs}/gemido_anime.mp3`);
const audioFlight = new Audio(`${Pwrongs}/flight_reacs.mp3`);
const audioDeath = new Audio(`${Pwrongs}/death.mp3`);
const audioFail_trumpet = new Audio(`${Pwrongs}/fail_trumpet.mp3`);
const audioIncorrectBuzzer = new Audio(`${Pwrongs}/incorrect_buzzer.mp3`);
const audioSadMeow = new Audio(`${Pwrongs}/sad_meow.mp3`);
const audioWerehogdeath = new Audio(`${Pwrongs}/werehog_death.mp3`);
const audioBartsimpson = new Audio(`${Pwrongs}/bart_simpson.mp3`);
const audioYourefired = new Audio(`${Pwrongs}/youre_fired.mp3`);

const audioRights = [audioHappy, audioOk, audioOhhhh, audioBtb, audioJsr, audioBungeeZombie, audioOhyesdaddy, audioIcantstopwinning, 
  audioHalleluja
];
const audioWrongs = [audioFail_trumpet, audioDeath, audioGemido, audioFlight, audioIncorrectBuzzer, audioSadMeow, audioWerehogdeath,
  audioBartsimpson, audioYourefired
];
const audioNull = [audioUnpollo, audioEwwDude, audioDramaticfart];

socket.on("update_audioEffectsPlayers_state", data =>{
    console.log("new audio state", data);
    audioEffectsPlayers = data;
  })
  
//PART OF THE CODE RELATING EXECUTING OF AUDIO EFFECTS
function playRandomAudio(audioArray) {
    if (!audioEffectsPlayers) {
      return;
    }
    if (!audioArray || audioArray.length === 0) return;
  
    const index = Math.floor(Math.random() * audioArray.length);
    const audio = audioArray[index];
  
    audio.currentTime = 0;
    audio.play().catch(err => {
      console.warn("Audio play blocked:", err);
    });
  }
