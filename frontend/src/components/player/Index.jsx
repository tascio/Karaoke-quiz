import { useState } from "react";
import { socket } from "../../socket";
import Layout from "../../layout/Layout";

import Idle from "./Idle";
import Sing from "./Sing";
import Quiz from "./Quiz";

export default function Index({team, status, question, answer, audioEffectsPlayers}) {
    const [usernameInput, setUsernameInput] = useState("");
    const join = () => {
        if (!usernameInput) return;
        socket.emit("join", { username: usernameInput });
      };
    return (
        <Layout>
            <div className="container vh-100 d-flex flex-column justify-content-center text-center">
    
            {team && (
                <div className="container-fluid fixed-top bg-dark text-white py-2 shadow">
                    <div className="d-flex justify-content-between align-items-center px-2">
                        <div className="fw-bold text-truncate">
                        🎤 Team: {team.username}
                        </div>
        
                        <div className="badge bg-success fs-6">
                            {team.points + team.p_audio} pts
                        </div>
                    </div>
                </div>
            )}
    
            {!team ? (
                // ---------------- JOIN ----------------
                <div className="mx-auto w-100" style={{ maxWidth: 360 }}>
                <h2 className="mb-3">Nome squadra</h2>
    
                <input
                    className="form-control form-control-lg text-center mb-3"
                    placeholder="Inserisci nome"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                />
    
                <button
                    className="btn btn-success btn-lg w-100"
                    onClick={join}
                >
                    Entra
                </button>
                </div>
    
            ) : (
    
                // ---------------- LOGGED PLAYER ----------------
                <>
                {status === "idle" && <Idle status={status} />}
                {status === "quiz" && <Quiz question={question} answer={answer} />}
                {status === "quiz_end" && <Quiz question={question} audioEffectsPlayers={audioEffectsPlayers} />}
                {status === "sing" && <Sing status={status} />}
                </>
            )}
    
            </div>
        </Layout>
    );
}