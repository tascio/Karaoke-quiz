
socket.on("sync_state", state => {
  if (!state || !state.state) {
    return;
  }
  if (state.state === "quiz") {
      socket.emit("request_question_refresh");
  }
  if (state.state === "sing") {
      socket.emit("start_song_refresh");
  }
});

let username = "";
let joined = false;
let answered = false;

function join() {
  if (joined) return;

  const input = document.getElementById("username");
  username = input.value.trim();

  if (!username) {
    alert("Inserisci un nome squadra");
    return;
  }

  socket.emit("join", { "username": username , "role": "player" });
}

socket.on("join_ok", () => {
  setTimeout(() => {
    window.location.reload();
  }, 300);
});

socket.on("username_exist", () => {
  alert("Username or player already exist!");
});


//QUIZ
socket.on("show_question", data => {
  console.log(data);
  answered = false;
  let givenAnswer = null;
  
  if (data.answer !== undefined && data.answer.done === true) {
    answered = true;
    givenAnswer = data.answer.answer;
  }
  
  document.getElementById("quiz").classList.remove("d-none");
  document.getElementById("sing").classList.add("d-none");
  document.getElementById("status").classList.add("d-none");
  document.getElementById("question").innerText = data.question;

  const choicesDiv = document.getElementById("choices");
  choicesDiv.innerHTML = "";
  choicesDiv.className = "d-flex flex-column align-items-center gap-3";

  const colors = ["info", "warning", "danger", "success"];

  data.choices.forEach((c, i) => {
    const [letter, _] = c.split(/:(.+)/);

    const btn = document.createElement("button");
    btn.className = `btn btn-${colors[i % colors.length]} choice-btn display-1`;
    btn.style.width = "200px";
    btn.style.height = "120px";
    btn.style.borderRadius = "90%"; 

    btn.innerText = letter;

    if (answered) {
      btn.disabled = true;

      if (i === givenAnswer) {
        btn.classList.replace(`btn-${colors[i]}`, "btn-primary");
        btn.disabled = false;
      } else {
        btn.style.opacity = "0.4";
      }
    }

  

    btn.onclick = () => {
      if (!answered) {
        socket.emit("answer", { choice: i });
        btn.classList.replace(`btn-${colors[i % colors.length]}`, "btn-primary");
        document.querySelectorAll(".choice-btn").forEach(b => b.disabled = true);
        answered = true;
      }
    };

    choicesDiv.appendChild(btn);
  });
});

//SING
socket.on("show_sing", () => {
  document.getElementById("quiz").classList.add("d-none");
  document.getElementById("status").classList.add("d-none");
  document.getElementById("sing").classList.remove("d-none");
});

//IDLE
socket.on("idle", () => {
  document.getElementById("quiz").classList.add("d-none");
  document.getElementById("sing").classList.add("d-none");
  document.getElementById("status").classList.remove("d-none");
});

socket.on("quiz_finished", () => alert("Quiz ended!"));


let micStream = null;
let audioContext = null;
let analyser = null;
let micSampling = false;
let micSum = 0;
let micSamples = 0;
let micInterval = null;

// Funzione per inizializzare l'accesso al microfono una sola volta
async function initMic() {
  if (micStream) return; // Evita di reinizializzare se già fatto
  micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  audioContext = new AudioContext();
  const source = audioContext.createMediaStreamSource(micStream);
  analyser = audioContext.createAnalyser();
  analyser.fftSize = 2048;
  source.connect(analyser);
}

// Funzione per misurare il volume in una finestra di tempo
async function measureWindow(durationMs = 1000) { // Ridotto a 1 secondo per campionamenti più frequenti e precisi
  if (!analyser) {
    throw new Error("Microfono non inizializzato");
  }
  const data = new Uint8Array(analyser.fftSize);
  let sum = 0;
  let samples = 0;
  const start = Date.now();
  return new Promise(resolve => {
    const interval = setInterval(() => {
      analyser.getByteTimeDomainData(data);
      let rms = 0;
      for (let i = 0; i < data.length; i++) {
        const v = (data[i] - 128) / 128.0;
        rms += v * v;
      }
      rms = Math.sqrt(rms / data.length);
      const db = 20 * Math.log10(rms || 0.000001); // Evita log di zero
      sum += db;
      samples++;
      if (Date.now() - start >= durationMs) {
        clearInterval(interval);
        resolve(sum / samples);
      }
    }, 50); // Campionamento più frequente (ogni 50ms) per una media più accurata nella finestra
  });
}

socket.on("start_mic_sampling", async () => {
  if (micSampling) return;
  try {
    await initMic(); // Inizializza una volta sola
    micSampling = true;
    micSum = 0;
    micSamples = 0;
    micInterval = setInterval(async () => {
      if (!micSampling) return;
      const avgDb = await measureWindow(1000); // Finestra di 1 secondo
      micSum += avgDb;
      micSamples++;
    }, 1100); // Leggero overlap per coprire meglio, ma evita sovraccarico su smartphone
  } catch (error) {
    console.error("Errore nell'accesso al microfono:", error);
    socket.emit("mic_sampling_error", { message: error.message });
  }
});

socket.on("stop_mic_sampling", () => {
  micSampling = false;
  if (micInterval) {
    clearInterval(micInterval);
    micInterval = null;
  }

  let finalAvgDb = micSamples ? micSum / micSamples : -Infinity;

  let score = 1; // minimo assoluto, mai 0

  if (finalAvgDb !== -Infinity && isFinite(finalAvgDb)) {
    // NUOVA SCALA più severa, calibrata per il canto vero
    const minDb = -55;    // canto molto piano o parlato normale → punteggio bassissimo
    const maxDb = 15;    // canto davvero forte e proiettato → 100 punti

    if (finalAvgDb >= maxDb) {
      score = 100;
    } else if (finalAvgDb > minDb) {
      let normalized = (finalAvgDb - minDb) / (maxDb - minDb); // da 0 a 1
      // Curva esponenziale forte: premia moltissimo solo i volumi alti
      normalized = Math.pow(normalized, 2.0); // esponente 2 = curva quadratica
      score = Math.round(1 + normalized * 99); // da 1 a 100
    } else {
      score = 1; // sotto -65 dB → quasi silenzio o parlato molto piano
    }
  }

  // INVIO AL BACKEND: solo lo score positivo e i campioni (avg_db opzionale solo per debug)
  socket.emit("mic_sampling_result", {
    avg_db: score,          // ← QUESTO è il punteggio del quiz (1-100)
    samples: micSamples,
    // avg_db: finalAvgDb.toFixed(1)  ← commenta o rimuovi se non ti serve più nel backend
  });
});