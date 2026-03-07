import { io } from "socket.io-client";

const WS_URL = import.meta.env.VITE_WS_URL || window.location.origin;

const socket = io(WS_URL, {
  autoConnect: false,
});

export default socket;
