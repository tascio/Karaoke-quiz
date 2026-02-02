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
