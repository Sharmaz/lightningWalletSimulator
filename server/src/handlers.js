const { v4: uuidv4 } = require("uuid");

const { rooms, generateRoomCode } = require("./rooms");

function registerHandlers(io) {
  io.on("connection", (socket) => {
    console.log(`[socket] conectado: ${socket.id}`);

    socket.on("create_room", ({ nodeId }) => {
      const code = generateRoomCode();
      rooms.set(code, {
        users: [{ socketId: socket.id, nodeId }],
        channels: [],
        invoices: [],
        lastActivity: Date.now(),
      });
      socket.join(code);
      socket.data.roomCode = code;
      socket.data.nodeId = nodeId;
      socket.emit("room_created", { roomCode: code });
      console.log(`[room] creada: ${code} por ${nodeId}`);
    });

    socket.on("join_room", ({ roomCode, nodeId }) => {
      const room = rooms.get(roomCode);
      if (!room) {
        socket.emit("room_error", { reason: "Room no encontrada" });
        return;
      }
      if (room.users.length >= 2) {
        socket.emit("room_error", { reason: "Room llena" });
        return;
      }

      room.users.push({ socketId: socket.id, nodeId });
      room.lastActivity = Date.now();
      socket.join(roomCode);
      socket.data.roomCode = roomCode;
      socket.data.nodeId = nodeId;

      const peer = room.users[0];
      socket.emit("room_joined", { roomCode, peerId: peer.socketId, peerNodeId: peer.nodeId });
      io.to(peer.socketId).emit("peer_connected", { peerId: socket.id, peerNodeId: nodeId });
      console.log(`[room] ${nodeId} se unió a ${roomCode}`);
    });

    socket.on("open_channel", ({ capacity }) => {
      const { roomCode, nodeId } = socket.data;
      const room = rooms.get(roomCode);
      if (!room) return;

      const peer = room.users.find((u) => u.socketId !== socket.id);
      if (!peer) {
        socket.emit("channel_error", { reason: "Sin peer conectado" });
        return;
      }

      const channel = {
        id: uuidv4(),
        fromNodeId: nodeId,
        toNodeId: peer.nodeId,
        capacity,
        localBalance: capacity,
        remoteBalance: 0,
        status: "open",
      };

      room.channels.push(channel);
      room.lastActivity = Date.now();

      socket.emit("channel_opened", {
        channel: { ...channel, peerNodeId: peer.nodeId },
      });
      io.to(peer.socketId).emit("channel_opened", {
        channel: {
          ...channel,
          peerNodeId: nodeId,
          localBalance: 0,
          remoteBalance: capacity,
        },
      });

      console.log(`[channel] abierto en ${roomCode}: ${capacity} sats`);
    });

    socket.on("register_invoice", ({ invoice }) => {
      const { roomCode } = socket.data;
      const room = rooms.get(roomCode);
      if (!room) return;
      room.invoices.push({ ...invoice, socketId: socket.id });
      room.lastActivity = Date.now();
    });

    socket.on("pay_invoice", ({ bolt11 }) => {
      const { roomCode, nodeId } = socket.data;
      const room = rooms.get(roomCode);
      if (!room) return;

      const parts = bolt11.split("_");
      if (parts.length < 7 || parts[0] !== "lnsim1") {
        socket.emit("payment_failed", { reason: "Invoice inválido" });
        return;
      }

      const expiresAt = parts[parts.length - 1];
      const invoiceId = parts[parts.length - 3];
      const payeeNodeId = parts.slice(3, parts.length - 3).join("_");
      const amountStr = parts[1];
      const amount = Number(amountStr);

      if (Date.now() > Number(expiresAt)) {
        socket.emit("payment_failed", { reason: "Invoice expirado" });
        return;
      }

      if (payeeNodeId === nodeId) {
        socket.emit("payment_failed", { reason: "No puedes pagarte a ti mismo" });
        return;
      }

      const storedInvoice = room.invoices.find((inv) => inv.id === invoiceId);
      if (storedInvoice && storedInvoice.status === "paid") {
        socket.emit("payment_failed", { reason: "Invoice ya pagado" });
        return;
      }

      const channel = room.channels.find(
        (c) => c.status === "open" &&
          ((c.fromNodeId === nodeId && c.localBalance >= amount) ||
            (c.toNodeId === nodeId && c.remoteBalance >= amount)),
      );

      if (!channel) {
        socket.emit("payment_failed", { reason: "Sin liquidez suficiente en el canal" });
        return;
      }

      if (channel.fromNodeId === nodeId) {
        channel.localBalance -= amount;
        channel.remoteBalance += amount;
      } else {
        channel.remoteBalance -= amount;
        channel.localBalance += amount;
      }

      if (storedInvoice) storedInvoice.status = "paid";
      room.lastActivity = Date.now();

      const peer = room.users.find((u) => u.socketId !== socket.id);

      socket.emit("payment_complete", { from: nodeId, to: payeeNodeId, amount, invoiceId });
      if (peer) io.to(peer.socketId).emit("payment_received", { from: nodeId, amount, invoiceId, bolt11 });

      console.log(`[payment] ${nodeId} → ${payeeNodeId}: ${amount} sats`);
    });

    socket.on("disconnect", () => {
      const { roomCode, nodeId } = socket.data;
      if (!roomCode) return;
      const room = rooms.get(roomCode);
      if (!room) return;

      room.users = room.users.filter((u) => u.socketId !== socket.id);
      const peer = room.users[0];
      if (peer) {
        io.to(peer.socketId).emit("peer_disconnected", { nodeId });
      }
      console.log(`[socket] desconectado: ${nodeId} de room ${roomCode}`);
    });
  });
}

module.exports = { registerHandlers };
