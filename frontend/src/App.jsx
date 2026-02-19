import { useEffect } from "react";
import { io } from "socket.io-client";

function App() {

  useEffect(() => {

    const socket = io(window.location.origin, {
      path: "/socket.io",
      transports: ["websocket"]
    });    

    socket.on("connect", () => {
      console.log("Connesso al backend:", socket.id);
    });

    socket.on("message", (data) => {
      console.log("Messaggio ricevuto:", data);
    });

    return () => {
      socket.disconnect();
    };

  }, []);

  return (
    <div>
      <h1>SingQuiz 🎤</h1>
    </div>
  );
}

export default App;
