import { useState, useRef } from "react";
import { socket } from "../socket";
import usePlayerSocket from "../hooks/player/usePlayerSocket";
import Mic from "../hooks/player/mic";

import Index from "../components/player/Index";

export default function Player() {

    const [view, setView] = useState("index");
    const [team, setTeam] = useState(null);

    const [status, setStatus] = useState("idle");
    const [question, setQuestion] = useState(null);

    const [audioEffectsPlayers, setAudioEffectsPlayers] = useState(false);

    socket.on("connect", () => {
      socket.emit("sync_player");
    });
      

  usePlayerSocket({
    onSyncPlayerBack: (data) => {
      console.log("connected → request sync", data);
      setStatus(data.state);
      setTeam(data.team);
      setAudioEffectsPlayers(data.audioEffectsPlayers);
    },

    onJoinOk: (data) => {
      setTeam(data.team);
    },

    onShowQuestion: (data) => {
      console.log("show question", data);
      setQuestion(data);
    },

    onShowQuestionRefresh: (data) => {
      console.log("show question refresh", data);
      setQuestion(data);
    },

    onForceSyncStatePlayer: () => {
      socket.emit("sync_state_show_answer");
    },

    onUpdateAudioEffectsPlayersState: (data) => {
      console.log("audioEffectsPlayers ", data);
      setAudioEffectsPlayers(data);
    },

    onEndGame: () => {
      console.log("END GAME");
      alert("GAME ENDED");
    }
  });

  // ---------------- ACTIONS ----------------

  const answer = (index) => {
    socket.emit("answer", { choice: index });
  };


  // ---------------- RENDER ----------------
  return (
    <>
      <Mic />
      { view === "index" && <Index 
        team={team} 
        status={status} 
        question={question} 
        audioEffectsPlayers={audioEffectsPlayers} 
        answer={answer}/>}
    </>
  );
}
