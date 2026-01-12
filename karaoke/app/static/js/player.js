
socket.on("sync_state", state => {
  console.log(state);
  if (!state || !state.state) {
    return;
  }
  if (state.state === "quiz") {
      socket.emit("request_question_refresh");
  }
  if (state.state === "sing") {
      socket.emit("start_song_refresh");
  }
  if (state.state === "results") {
    socket.emit("request_question_refresh");
  }
});

socket.on("refresh_players", () => {
  location.reload();
})

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

  const colors = ["primary", "warning", "pink", "purple"];

  data.choices.forEach((c, i) => {
    const [letter, _] = c.split(/:(.+)/);

    const btn = document.createElement("button");
    btn.className = `btn btn-${colors[i % colors.length]} choice-btn display-1 text-white`;
    btn.style.width = "200px";
    btn.style.height = "120px";
    btn.style.borderRadius = "90%"; 

    btn.innerText = letter;
    btn.dataset.index = i;

    if (answered) {
      btn.disabled = true;

      if (i === givenAnswer) {
        btn.disabled = false;
      } else {
        btn.style.opacity = "0.1";
      }
    }

    btn.onclick = () => {
      if (!answered) {
        socket.emit("answer", { choice: i });
        document.querySelectorAll(".choice-btn").forEach(b => {
          b.disabled = true; 
          b.style.opacity = '0.1';
        });
        btn.disabled = false;
        btn.style.opacity = '1';
        answered = true;
      }
    };

    choicesDiv.appendChild(btn);
  });
});

socket.on("show_question_refresh", data => {
  console.log(data);
  document.getElementById("quiz").classList.remove("d-none");
  document.getElementById("sing").classList.add("d-none");
  document.getElementById("status").classList.add("d-none");
  document.getElementById("question").innerText = data.question;

  const choicesDiv = document.getElementById("choices");
  choicesDiv.innerHTML = "";
  choicesDiv.className = "d-flex flex-column align-items-center gap-3";

  const colors = ["primary", "warning", "pink", "purple"];

  data.choices.forEach((c, i) => {
    const [letter, _] = c.split(/:(.+)/);

    const btn = document.createElement("button");
    btn.className = `btn btn-${colors[i % colors.length]} choice-btn display-1 text-white`;
    btn.style.width = "200px";
    btn.style.height = "120px";
    btn.style.borderRadius = "90%"; 

    btn.innerText = letter;
    btn.dataset.index = i;

      btn.disabled = true;

      if (i === data.answer) {
        btn.disabled = false;
      } else {
        btn.style.opacity = "0.1";
      }
      choicesDiv.appendChild(btn);
      show_answer_right_players({"correct": data.correct,
                                  "answer": data.answer
                                });
  });
})

socket.on("show_answer_right_players", data => {
  show_answer_right_players(data); 
});

function show_answer_right_players(data) {
  document.querySelectorAll(".choice-btn").forEach(btn => {
    const index = parseInt(btn.dataset.index);
    if (index === data.correct && !btn.disabled) {
      btn.classList.add("border", "border-success", "border-6");
      btn.style.width = "240px";
      btn.style.height = "160px";
      btn.style.position = "relative";

      const icon = document.createElement("div");
      icon.className = "bg-success";
      icon.style.width = "64px";
      icon.style.height = "64px";
      icon.style.position = "absolute";
      icon.style.mask = "url('/static/icons/check2-circle.svg') no-repeat center";
      icon.style.maskSize = "contain";
      icon.style.webkitMask = icon.style.mask;
      icon.style.top = "30%";
      icon.style.left = "60%";

      btn.appendChild(icon);
    }
    if (index !== data.correct && index === data.answer && !btn.disabled)
    {
      btn.classList.add("border", "border-danger", "border-6");
      btn.style.width = "240px";
      btn.style.height = "160px";
      btn.style.position = "relative";

      const icon = document.createElement("div");
      icon.className = "bg-danger";
      icon.style.width = "64px";
      icon.style.height = "64px";
      icon.style.position = "absolute";
      icon.style.mask = "url('/static/icons/x-circle.svg') no-repeat center";
      icon.style.maskSize = "contain";
      icon.style.webkitMask = icon.style.mask;
      icon.style.top = "30%";
      icon.style.left = "60%";

      btn.appendChild(icon);
    }
  });
}



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

async function initMic() {// Evita di reinizializzare se già fatto
  micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  audioContext = new AudioContext();
  const source = audioContext.createMediaStreamSource(micStream);
  analyser = audioContext.createAnalyser();
  analyser.fftSize = 2048;
  source.connect(analyser);
}

async function measureWindow(durationMs = 1000) { 
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
      const db = 20 * Math.log10(rms || 0.000001); 
      sum += db;
      samples++;
      if (Date.now() - start >= durationMs) {
        clearInterval(interval);
        resolve(sum / samples);
      }
    }, 50); 
  });
}

socket.on("start_mic_sampling", async () => {
  if (micSampling) return;
  try {
    await initMic();
    micSampling = true;
    micSum = 0;
    micSamples = 0;
    micInterval = setInterval(async () => {
      if (!micSampling) return;
      const avgDb = await measureWindow(1000); 
      micSum += avgDb;
      micSamples++;
    }, 1100); 
  } catch (error) {
    console.error("Error in reading mic:", error);
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

  let score = 1;

  if (finalAvgDb !== -Infinity && isFinite(finalAvgDb)) {
    const minDb = -50;    // Range Db min
    const maxDb = -1;    // Range Db max

    if (finalAvgDb >= maxDb) {
      score = 100;
    } else if (finalAvgDb > minDb) {
      let normalized = (finalAvgDb - minDb) / (maxDb - minDb); 
      normalized = Math.pow(normalized, 2.0); 
      score = Math.round(1 + normalized * 99); 
    } else {
      score = 1;
    }
  }

  socket.emit("mic_sampling_result", {
    avg_db: score,         
    samples: micSamples,
  });
});