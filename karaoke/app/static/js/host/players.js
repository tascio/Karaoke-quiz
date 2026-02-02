function audioEffectsPlayersOn() {
    socket.emit("setAudioEffectsPlayersOn");
    const audioSt = document.getElementById("audioPlayersStatus");
    audioSt.classList.remove("text-bg-danger");
    audioSt.classList.add("text-bg-success");
    audioSt.textContent = "Players Audio is ON";
  }
  
  function audioEffectsPlayersOff() {
    socket.emit("setAudioEffectsPlayersOff");
    const audioSt = document.getElementById("audioPlayersStatus");
    audioSt.classList.remove("text-bg-success");
    audioSt.classList.add("text-bg-danger");
    audioSt.textContent = "Players Audio is OFF";
  }