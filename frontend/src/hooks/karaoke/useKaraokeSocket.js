import { useEffect } from "react";
import { socket } from "../../socket";

export default function useKaraokeSocket(handlers) {

  useEffect(() => {

    socket.on("play_song", handlers.onPlaySong);
    socket.on("show_question", handlers.onShowQuestion);
    socket.on("show_answer", handlers.onShowAnswer);
    socket.on("show_countdown", handlers.onShowCountdown);
    socket.on("karaoke_idle", handlers.onIdle);
    socket.on("showPremiationKaraoke", handlers.onPremiation);

    return () => {
      socket.off();
    };
  }, []);
}
