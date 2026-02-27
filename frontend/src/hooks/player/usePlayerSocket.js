import { useEffect } from "react";
import { socket } from "../../socket";

export default function usePlayerSocket(handlers = {}) {

    useEffect(() => {

      if (handlers.onSyncPlayerBack)
        socket.on("sync_player_back", handlers.onSyncPlayerBack);

      if (handlers.onJoinOk)
        socket.on("join_ok", handlers.onJoinOk);
  
      if (handlers.onShowQuestion)
        socket.on("show_question", handlers.onShowQuestion);

      if (handlers.onShowQuestionRefresh)
        socket.on("show_question_refresh", handlers.onShowQuestionRefresh);

      if (handlers.onForceSyncStatePlayer)
        socket.on("force_sync_state_player", handlers.onForceSyncStatePlayer);

      if (handlers.onUpdateAudioEffectsPlayersState)
        socket.on("update_audioEffectsPlayers_state", handlers.onUpdateAudioEffectsPlayersState);

      if (handlers.onEndGame)
        socket.on("end_game", handlers.onEndGame);
  
      return () => {
        socket.off("sync_player_back");
        socket.off("join_ok");
        socket.off("show_question");
        socket.off("show_question_refresh");
        socket.off("force_sync_state_player");
        socket.off("update_audioEffectsPlayers_state");
        socket.off("end_game");
      };
  
    }, []);
  }
    