import { io } from "socket.io-client";

// per browser su host
export const socket = io("http://localhost:5090", {
  path: "/socket.io",
  transports: ["websocket"]
});
