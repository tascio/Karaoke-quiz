import { useEffect } from "react";
import { socket } from "../../socket";

export function useHostSocket({
  setTeams,
  setCurrentQuestion,
  setQuestions,
  setAudioEffectsKaraoke,
  setAudioEffectsPlayers
}) {

  useEffect(() => {

    socket.on("show_scores_host", setTeams);
    socket.on("current_question_host", setCurrentQuestion);
    socket.on("all_questions", setQuestions);
    socket.on("update_audioEffectsKaraoke_state", setAudioEffectsKaraoke);
    socket.on("update_audioEffectsPlayers_state", setAudioEffectsPlayers);

    socket.on("quiz_finished", () => {
      alert("Quiz ended!");
    });

    return () => {
      socket.off("show_scores_host");
      socket.off("current_question_host");
      socket.off("all_questions");
      socket.off("update_audioEffectsKaraoke_state");
      socket.off("update_audioEffectsPlayers_state");
      socket.off("quiz_finished");
    };

  }, []);
}
