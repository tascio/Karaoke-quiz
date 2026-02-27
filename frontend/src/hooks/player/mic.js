import { useEffect, useRef } from "react";
import { socket } from "../../socket";

export default function Mic() {

  const analyserRef = useRef(null);
  const audioCtxRef = useRef(null);
  const streamRef = useRef(null);

  const micInterval = useRef(null);
  const micSamplingRef = useRef(false);
  const micSumRef = useRef(0);
  const micSamplesRef = useRef(0);

  // ---------------- INIT MICROFONO ----------------

  async function initMic() {

    if (analyserRef.current) return;

    console.log("Init mic...");

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true
    });

    streamRef.current = stream;

    const ctx = new AudioContext();
    audioCtxRef.current = ctx;

    const source = ctx.createMediaStreamSource(stream);

    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;

    source.connect(analyser);

    analyserRef.current = analyser;

    console.log("Mic ready");
  }

  // ---------------- MISURA ----------------

  async function measureWindow(durationMs = 1000) {

    const analyser = analyserRef.current;

    if (!analyser)
      throw new Error("Mic non inizializzato");

    const data = new Uint8Array(analyser.frequencyBinCount);

    let sum = 0;
    let samples = 0;

    const start = Date.now();

    return new Promise(resolve => {

      const interval = setInterval(() => {

        analyser.getByteTimeDomainData(data);

        let rms = 0;

        for (let i = 0; i < data.length; i++) {
          const v = (data[i] - 128) / 128;
          rms += v*v;
        }

        rms = Math.sqrt(rms / data.length);

        const db = 20*Math.log10(rms || 0.000001);

        sum += db;
        samples++;

        if (Date.now() - start >= durationMs) {

          clearInterval(interval);
          resolve(sum/samples);

        }

      }, 50);

    });
  }

  // ---------------- SOCKET HANDLERS ----------------

  useEffect(() => {

    const startHandler = async () => {

      if (micSamplingRef.current) return;

      try {

        await initMic();

        micSamplingRef.current = true;
        micSumRef.current = 0;
        micSamplesRef.current = 0;

        micInterval.current = setInterval(async () => {

          if (!micSamplingRef.current) return;

          const avgDb = await measureWindow(1000);

          micSumRef.current += avgDb;
          micSamplesRef.current++;

        }, 1100);

      }
      catch(e) {

        console.log("Mic error:", e);

        socket.emit("mic_sampling_error", {
          message: e.message
        });

      }

    };

    const stopHandler = () => {

      micSamplingRef.current = false;

      if (micInterval.current) {
        clearInterval(micInterval.current);
        micInterval.current = null;
      }

      const finalAvgDb =
        micSamplesRef.current ?
        micSumRef.current / micSamplesRef.current :
        -Infinity;

      let score = 1;

      if (isFinite(finalAvgDb)) {

        const minDb=-50;
        const maxDb=-1;

        if (finalAvgDb>=maxDb)
          score=100;

        else if (finalAvgDb>minDb){

          let normalized=
            (finalAvgDb-minDb)/(maxDb-minDb);

          normalized=Math.pow(normalized,2);

          score=Math.round(1+normalized*99);

        }

      }

      socket.emit("mic_sampling_result",{
        avg_db:score,
        samples:micSamplesRef.current
      });

    };

    socket.on("start_mic_sampling",startHandler);
    socket.on("stop_mic_sampling",stopHandler);

    return ()=>{

      socket.off("start_mic_sampling",startHandler);
      socket.off("stop_mic_sampling",stopHandler);

    };

  }, []);

  return null;

}