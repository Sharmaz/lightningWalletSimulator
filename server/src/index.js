require("dotenv").config();

const http = require("http");

const cors = require("cors");
const express = require("express");
const { Server } = require("socket.io");

const { registerHandlers } = require("./handlers");
const { rooms } = require("./rooms");

const PORT = process.env.PORT || 3001;

const app = express();
app.use(express.json());
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

registerHandlers(io);

app.get("/health", (_req, res) => res.json({ status: "ok", rooms: rooms.size }));

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`Server corriendo en http://localhost:${PORT}`);
  });
}

module.exports = { server, io, rooms };
