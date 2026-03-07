import { io } from "socket.io-client";

const WS_URL = import.meta.env.VITE_WS_URL || "http://localhost:3001";

const socket = io(WS_URL, {
  autoConnect: false,
});

export default socket;
