var audioEffectsKaraoke = false;

const Pendround = "/static/audio/karaoke/end_round"
const audioCoffinDance = new Audio(`${Pendround}/coffin_dance.mp3`);
const audioBigShoe = new Audio(`${Pendround}/big_shoe.mp3`);
const audioNcs = new Audio(`${Pendround}/ncs.mp3`);
const audioOmfghello = new Audio(`${Pendround}/omfg_hello.mp3`);
const audioRatdance = new Audio(`${Pendround}/rat_dance.mp3`);
const audioThunderstruck = new Audio(`${Pendround}/thunderstruck.mp3`);
const audioEndRound = [audioCoffinDance, audioBigShoe, audioNcs, audioOmfghello, audioRatdance, audioThunderstruck];

const Peffects = "/static/audio/karaoke/effects"
const audioApplausecrowd = new Audio(`${Peffects}/applause_crowd.mp3`);
const audioBoxingbell = new Audio(`${Peffects}/boxing_bell.mp3`);
const audioCrowdpanic = new Audio(`${Peffects}/crowd_panic.mp3`);
const audioGemido = new Audio(`${Peffects}/gemido_anime.mp3`);
const audioGemido2 = new Audio(`${Peffects}/gemido_anime2.mp3`);


socket.on("update_audioEffectsKaraoke_state", data => {
    console.log("new audo state", data);
    audioEffectsKaraoke = data;
});

socket.on ("audioStopAllKaraoke", () => {
    audioEndRound.forEach(audio => {
        if (!audio.paused) {
            audio.pause();
            audio.currentTime = 0;
        }
    });
});

socket.on("audioBoxingBellKaraoke", () => {
    toggleAudio(audioBoxingbell);
})
socket.on("audioApplauseCrowdKaraoke", () => {
    toggleAudio(audioApplausecrowd);
})
socket.on("audioCrowdPanicKaraoke", () => {
    toggleAudio(audioCrowdpanic);
})
socket.on("audioGemidoKaraoke", () => {
    toggleAudio(audioGemido);
})
socket.on("audioGemido2Karaoke", () => {
    toggleAudio(audioGemido2);
})

function playRandomAudioKaraoke(audioArray) {
    if (!audioEffectsKaraoke) {
        console.log("audio effect false");
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

function toggleAudio(audio) {
    if (!audio.paused) {
      audio.pause();
      audio.currentTime = 0;
    } else {
      audio.currentTime = 0;
      audio.play();
    }
}

function audioStopAllKaraoke() {
    audioEndRound.forEach(audio => {
        if (!audio.paused) {
            audio.pause();
            audio.currentTime = 0;
        }
    });
}