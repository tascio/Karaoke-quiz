import { useState, useEffect } from "react";
import { socket } from "../socket";
import { useHostSocket } from "../hooks/host/useHostSocket";
import Layout from "../layout/Layout";

export default function Host() {

  const [teams, setTeams] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [audioEffectsKaraoke, setAudioEffectsKaraoke] = useState(false);
  const [audioEffectsPlayers, setAudioEffectsPlayers] = useState(false);

  useHostSocket({
    setTeams,
    setCurrentQuestion,
    setQuestions,
    setAudioEffectsKaraoke,
    setAudioEffectsPlayers
  });

  const emit = (event) => socket.emit(event);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:5090/api/host"); // il tuo nuovo endpoint
        const json = await res.json();
        
        console.log(json);
        setTeams(json.teams);
        setCurrentQuestion(json.current_question);
        setQuestions(json.questions);
        setAudioEffectsKaraoke(json.audioEffectsKaraoke);
        setAudioEffectsPlayers(json.audioEffectsPlayers);
  
      } catch (err) {
        console.error("Errore nel fetch host data:", err);
      }
    };
  
    fetchData();
  }, []);
  
  return (
    <Layout>
        <div className="container-fluid">

        <h1 className="my-3">SINGQUIZ</h1>

        <div className="row">

            {/* 🎵 AUDIO EFFECTS */}
            <div className="col-4">
            <button onClick={() => emit("audioBoxingBell")}>BoxingBell</button>
            <button onClick={() => emit("audioApplauseCrowd")}>ApplauseCrowd</button>
            <button onClick={() => emit("audioCrowdPanic")}>CrowdPanic</button>
            <button onClick={() => emit("audioAttenzioneNapoletan")}>AttenzioneNapoletan</button>
            <br/>
            <button onClick={() => emit("audioGemido")}>Haa</button>
            <button onClick={() => emit("audioGemido2")}>Haa2</button>
            <button onClick={() => emit("audioMarioByeBye")}>MarioBye</button>
            <button onClick={() => emit("audioSignLimoni")}>SignLimoni</button>
            <br/>
            <button onClick={() => emit("audioItaRage")}>ItaRage</button>
            </div>

            {/* 🎮 CONTROL */}
            <div className="col-4">
            <button onClick={() => emit("start_song")}>🎵 Avvia Karaoke</button>
            <button onClick={() => emit("request_question")}>❓ Avvia Domanda</button>
            <button onClick={() => emit("showRoundScore")}>✅ Mostra Round</button>
            <button onClick={() => emit("show_ranking")}>📄 Mostra Classifica</button>
            <button onClick={() => emit("refresh_players")}>Refresh Players</button>
            <br/><br/>
            <button onClick={() => emit("show_premiation")}>Premiation</button>
            </div>

            {/* 🔊 AUDIO STATUS */}
            <div className="col-4">

            <div className="mb-3 text-center">
                <div className={`badge ${audioEffectsKaraoke ? "bg-success" : "bg-danger"}`}>
                    Karaoke Audio {audioEffectsKaraoke ? "ON" : "OFF"}
                </div>
                <div className="mt-2">
                    <button onClick={() => emit("audioEffectsKaraokeOn")}>On</button>
                    <button onClick={() => emit("audioEffectsKaraokeOff")}>Off</button>
                    <button onClick={() => emit("audioStopAllKaraoke")}>Stop</button>
                </div>
                <div className="mt-2">
                    <button onClick={() => emit("changeStateToIdle")}>Idle</button>
                    <button onClick={() => emit("changeStateToSing")}>Sing</button>
                    <button onClick={() => emit("changeStateToQuiz")}>Quiz</button>
                    <button onClick={() => emit("changeStateToQuizEnd")}>QuizEnd</button>
                </div>
            </div>

            <hr/>

            <div className="text-center">
                <div className={`badge ${audioEffectsPlayers ? "bg-success" : "bg-danger"}`}>
                Players Audio {audioEffectsPlayers ? "ON" : "OFF"}
                </div>
                <div className="mt-2">
                <button onClick={() => emit("setAudioEffectsPlayersOn")}>On</button>
                <button onClick={() => emit("setAudioEffectsPlayersOff")}>Off</button>
                </div>
            </div>

            </div>
        </div>

        {/* 🏆 CLASSIFICA */}
        <div className="col-6 mx-auto mt-4">
            <h3>Classifica</h3>
            <table className="table table-dark table-striped">
            <thead>
                <tr>
                <th>IP</th>
                <th>USERNAME</th>
                <th>PUNTI</th>
                <th>P.AUDIO</th>
                </tr>
            </thead>
            <tbody>
                {Object.entries(teams)
                .sort((a, b) => (b[1].points + b[1].p_audio) - (a[1].points + a[1].p_audio))
                .map(([ip, data]) => (
                    <tr key={ip}>
                    <td>{ip.split(":")[1]}</td>
                    <td>{data.username}</td>
                    <td>{data.points}</td>
                    <td>{data.p_audio}</td>
                    </tr>
                ))}
            </tbody>
            </table>
        </div>

        {/* ❓ CURRENT QUESTION */}
        {currentQuestion && (
            <div className="mt-5">
            <h3>Current Question</h3>
            <table className="table table-dark">
                <tbody>
                <tr className="table-success">
                    <td>{currentQuestion.id_q}</td>
                    <td>{currentQuestion.title}</td>
                    <td>{currentQuestion.artist}</td>
                    <td>{currentQuestion.question}</td>
                    <td>{currentQuestion.answers}</td>
                    <td>{"ABCD"[currentQuestion.correct]}</td>
                    <td>{currentQuestion.author}</td>
                    <td>{currentQuestion.done ? "✔️" : "❌"}</td>
                </tr>
                </tbody>
            </table>
            </div>
        )}

        {/* 📚 ALL QUESTIONS */}
        <div className="mt-4">
            <h3>All Questions</h3>
            <table className="table table-dark">
            <tbody>
                {questions.map(q => (
                <tr
                    key={q.id_q}
                    className={
                    q.done
                        ? "table-danger"
                        : currentQuestion?.id_q === q.id_q
                        ? "table-success"
                        : ""
                    }
                >
                    <td>{q.id_q}</td>
                    <td>{q.title}</td>
                    <td>{q.artist}</td>
                    <td>{q.question}</td>
                    <td>{q.answers}</td>
                    <td>{"ABCD"[q.correct]}</td>
                    <td>{q.author}</td>
                    <td>{q.done ? "✔️" : "❌"}</td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>

        </div>
    </Layout>
  );
}
