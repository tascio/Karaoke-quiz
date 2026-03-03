import { useEffect } from "react";
import { socket } from "../../socket";

export default function useKaraokeSocket(handlers = {}) {

  useEffect(() => {

    if (handlers.onPlaySong)
      socket.on("play_song", handlers.onPlaySong);

    if (handlers.onShowQuestion)
      socket.on("show_question", handlers.onShowQuestion);
    
    if (handlers.onShowAnswer)
      socket.on("show_answer", handlers.onShowAnswer);

    if (handlers.onShowRoundScores)
      socket.on("show_round_scores", handlers.onShowRoundScores);

    if (handlers.onShowRanking)
      socket.on("show_ranking_karaoke", handlers.onShowRanking)
    
    if (handlers.onShowCountdown)
      socket.on("show_countdown", handlers.onShowCountdown);
    
    if (handlers.onIdle)
      socket.on("karaoke_idle", handlers.onIdle);
    
    if (handlers.onPremiation)
      socket.on("showPremiationKaraoke", handlers.onPremiation);

    return () => {
      socket.off("play_song");
      socket.off("show_question");
      socket.off("show_answer");
      socket.off("show_round_scores");
      socket.off("show_ranking_karaoke");
      socket.off("show_countdown");
      socket.off("karaoke_idle");
      socket.off("showPremiationKaraoke");
    };
  }, []);
}
