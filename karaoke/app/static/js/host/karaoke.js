function showPremiation() {
    socket.emit("showPremiation");
}

function audioStopAllKaraoke() {
    socket.emit("audioStopAllKaraoke");
}

function audioEffectsKaraokeOn() {
    socket.emit("setAudioEffectsKaraokeOn");
    const audioSt = document.getElementById("audioKaraokeStatus");
    audioSt.classList.remove("text-bg-danger");
    audioSt.classList.add("text-bg-success");
    audioSt.textContent = "Karaoke Audio is ON";
}

function audioEffectsKaraokeOff() {
    socket.emit("setAudioEffectsKaraokeOff");
    const audioSt = document.getElementById("audioKaraokeStatus");
    audioSt.classList.remove("text-bg-success");
    audioSt.classList.add("text-bg-danger");
    audioSt.textContent = "Karaoke Audio is OFF";
}

function audioBoxingBell() {
socket.emit("audioBoxingBell");
}

function audioApplauseCrowd() {
socket.emit("audioApplauseCrowd");
}

function audioCrowdPanic() {
socket.emit("audioCrowdPanic");
}

function audioGemido() {
socket.emit("audioGemido");
}

function audioGemido2() {
socket.emit("audioGemido2");
}


