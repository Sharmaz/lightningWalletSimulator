import * as bip39 from "bip39";
import { v4 as uuidv4 } from "uuid";
import { create } from "zustand";

import { encodeInvoice, decodeInvoice, isExpired } from "../lib/invoice";
import socket from "../lib/socket";

export const BOT_NODE_ID = "node_00000bot";

const BOT_AMOUNTS = [500, 1000, 2000, 3000, 5000];
const BOT_DESCRIPTIONS = ["Café", "Tacos", "Pizza", "Cerveza", "Libro"];

function deriveNodeId(seedPhrase) {
  const str = seedPhrase.join("");
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (Math.imul(31, hash) + str.charCodeAt(i)) | 0;
  }
  return `node_${Math.abs(hash).toString(16).padStart(8, "0")}`;
}

const useWalletStore = create((set, get) => ({
  seedPhrase: [],
  nodeId: null,

  onChainBalance: 0,
  lightningBalance: 0,

  channels: [],
  invoices: [],
  transactions: [],

  isInitialized: false,

  soloMode: false,
  botInvoice: null,

  p2pMode: false,
  roomCode: null,
  peerId: null,
  peerNodeId: null,

  generateWallet() {
    const mnemonic = bip39.generateMnemonic();
    const seedPhrase = mnemonic.split(" ");
    const nodeId = deriveNodeId(seedPhrase);
    set({ seedPhrase, nodeId, isInitialized: true });
  },

  addOnChainBalance(amount) {
    set((s) => ({ onChainBalance: s.onChainBalance + amount }));
  },

  openChannel({ peerNodeId, capacity }) {
    const { onChainBalance } = get();
    if (onChainBalance < capacity) return { error: "Saldo on-chain insuficiente" };

    const channel = {
      id: uuidv4(),
      peerNodeId,
      capacity,
      localBalance: capacity,
      remoteBalance: 0,
      status: "opening",
    };

    set((s) => ({
      onChainBalance: s.onChainBalance - capacity,
      lightningBalance: s.lightningBalance + capacity,
      channels: [...s.channels, channel],
      transactions: [
        {
          id: uuidv4(),
          type: "channel_open",
          amount: capacity,
          timestamp: Date.now(),
          description: `Canal abierto con ${peerNodeId}`,
        },
        ...s.transactions,
      ],
    }));

    setTimeout(() => {
      set((s) => ({
        channels: s.channels.map((c) => (c.id === channel.id ? { ...c, status: "open" } : c),
        ),
      }));
    }, 1000);

    return { channel };
  },

  updateChannel(channelId, updates) {
    set((s) => ({
      channels: s.channels.map((c) => (c.id === channelId ? { ...c, ...updates } : c)),
    }));
  },

  addChannel(channel) {
    set((s) => ({ channels: [...s.channels, channel] }));
  },

  createInvoice({ amount, description }) {
    const { nodeId, soloMode } = get();
    const invoice = encodeInvoice({ amount, description, payeeNodeId: nodeId });
    set((s) => ({ invoices: [invoice, ...s.invoices] }));
    if (soloMode) get()._botPayUserInvoice(invoice);
    return invoice;
  },

  payInvoice(bolt11) {
    const { nodeId, channels, soloMode } = get();
    const invoice = decodeInvoice(bolt11);
    if (!invoice) return { error: "Invoice inválido. Verifica que sea un invoice generado por este simulador." };
    if (isExpired(invoice)) return { error: "Este invoice ya expiró. Los invoices Lightning tienen una ventana de tiempo limitada — pide uno nuevo al destinatario." };
    if (invoice.payeeNodeId === nodeId) return { error: "No puedes pagarte a ti mismo. Genera el invoice desde otra wallet." };

    const channel = channels.find(
      (c) => c.status === "open" && c.localBalance >= invoice.amount,
    );
    if (!channel) return { error: `Sin liquidez suficiente. Necesitas al menos ${invoice.amount.toLocaleString()} sats de saldo de salida (outbound) en un canal abierto.` };

    set((s) => ({
      lightningBalance: s.lightningBalance - invoice.amount,
      channels: s.channels.map((c) => (c.id === channel.id
        ? {
            ...c,
            localBalance: c.localBalance - invoice.amount,
            remoteBalance: c.remoteBalance + invoice.amount,
          }
        : c),
      ),
      transactions: [
        {
          id: uuidv4(),
          type: "send",
          amount: invoice.amount,
          timestamp: Date.now(),
          description: invoice.description || "Pago enviado",
          invoiceId: invoice.id,
        },
        ...s.transactions,
      ],
    }));

    if (soloMode && invoice.payeeNodeId === BOT_NODE_ID) {
      setTimeout(() => get()._generateBotInvoice(), 1500);
    }

    return { success: true, invoice, channelId: channel.id };
  },

  receivePayment({ amount, invoiceId, description }) {
    set((s) => {
      const invoices = s.invoices.map((inv) => (inv.id === invoiceId ? { ...inv, status: "paid" } : inv),
      );

      const channel = s.channels.find((c) => c.status === "open" && c.remoteBalance >= amount);
      const channels = channel
        ? s.channels.map((c) => (c.id === channel.id
          ? {
              ...c,
              localBalance: c.localBalance + amount,
              remoteBalance: c.remoteBalance - amount,
            }
          : c),
        )
        : s.channels;

      return {
        invoices,
        channels,
        lightningBalance: s.lightningBalance + amount,
        transactions: [
          {
            id: uuidv4(),
            type: "receive",
            amount,
            timestamp: Date.now(),
            description: description || "Pago recibido",
            invoiceId,
          },
          ...s.transactions,
        ],
      };
    });
  },

  syncState(remoteState) {
    set((s) => ({ ...s, ...remoteState }));
  },

  initSoloMode() {
    set((s) => ({
      soloMode: true,
      onChainBalance: s.onChainBalance + 100_000 - 50_000,
      lightningBalance: s.lightningBalance + 50_000,
      channels: [...s.channels, {
        id: uuidv4(),
        peerNodeId: BOT_NODE_ID,
        capacity: 100_000,
        localBalance: 50_000,
        remoteBalance: 50_000,
        status: "open",
      }],
      transactions: [{
        id: uuidv4(),
        type: "channel_open",
        amount: 50_000,
        timestamp: Date.now(),
        description: "Canal abierto con nodo bot",
      }, ...s.transactions],
    }));
    get()._generateBotInvoice();
  },

  _generateBotInvoice() {
    const amount = BOT_AMOUNTS[Math.floor(Math.random() * BOT_AMOUNTS.length)];
    const description = BOT_DESCRIPTIONS[Math.floor(Math.random() * BOT_DESCRIPTIONS.length)];
    const invoice = encodeInvoice({ amount, description, payeeNodeId: BOT_NODE_ID });
    set({ botInvoice: invoice });
  },

  _botPayUserInvoice(invoice) {
    setTimeout(() => {
      if (!get().soloMode) return;
      get().receivePayment({
        amount: invoice.amount,
        invoiceId: invoice.id,
        description: `Bot pagó: ${invoice.description || "tu invoice"}`,
      });
    }, 3000);
  },

  initP2P() {
    socket.off("room_created").on("room_created", ({ roomCode }) => {
      set({ roomCode });
    });

    socket.off("peer_connected").on("peer_connected", ({ peerId, peerNodeId }) => {
      set({ peerId, peerNodeId });
    });

    socket.off("room_joined").on("room_joined", ({ roomCode, peerId, peerNodeId }) => {
      set({ roomCode, peerId, peerNodeId });
    });

    socket.off("peer_disconnected").on("peer_disconnected", () => {
      set({ peerId: null, peerNodeId: null });
    });

    socket.off("channel_opened").on("channel_opened", ({ channel }) => {
      set((s) => ({
        channels: [...s.channels, { ...channel, status: "open" }],
        lightningBalance: s.lightningBalance + channel.localBalance,
        transactions: channel.localBalance > 0
          ? [{
              id: uuidv4(),
              type: "channel_open",
              amount: channel.localBalance,
              timestamp: Date.now(),
              description: `Canal P2P con ${channel.peerNodeId}`,
            }, ...s.transactions]
          : s.transactions,
      }));
    });

    socket.off("payment_received").on("payment_received", ({ amount, invoiceId }) => {
      get().receivePayment({ amount, invoiceId, description: "Pago recibido (P2P)" });
    });

    if (!socket.connected) socket.connect();
  },

  createRoom() {
    const { nodeId } = get();
    get().initP2P();
    set({ p2pMode: true });
    socket.emit("create_room", { nodeId });
  },

  joinRoom(roomCode) {
    const { nodeId } = get();
    get().initP2P();
    set({ p2pMode: true });
    socket.emit("join_room", { roomCode, nodeId });
  },

  openChannelP2P(capacity) {
    set((s) => ({ onChainBalance: s.onChainBalance - capacity }));
    socket.emit("open_channel", { capacity });
  },

  registerInvoiceP2P(invoice) {
    socket.emit("register_invoice", { invoice });
  },

  confirmP2PPayment({ amount, description, invoiceId, peerNodeId }) {
    set((s) => {
      const channel = s.channels.find(
        (c) => c.status === "open" && c.peerNodeId === peerNodeId,
      );
      return {
        lightningBalance: s.lightningBalance - amount,
        channels: channel
          ? s.channels.map((c) => (c.id === channel.id
            ? { ...c, localBalance: c.localBalance - amount, remoteBalance: c.remoteBalance + amount }
            : c))
          : s.channels,
        transactions: [{
          id: uuidv4(),
          type: "send",
          amount,
          timestamp: Date.now(),
          description: description || "Pago P2P enviado",
          invoiceId,
        }, ...s.transactions],
      };
    });
  },

  leaveP2P() {
    socket.off("room_created");
    socket.off("peer_connected");
    socket.off("room_joined");
    socket.off("peer_disconnected");
    socket.off("channel_opened");
    socket.off("payment_received");
    socket.disconnect();
    set({ p2pMode: false, roomCode: null, peerId: null, peerNodeId: null });
  },

  reset() {
    set({
      seedPhrase: [],
      nodeId: null,
      onChainBalance: 0,
      lightningBalance: 0,
      channels: [],
      invoices: [],
      transactions: [],
      isInitialized: false,
      soloMode: false,
      botInvoice: null,
      p2pMode: false,
      roomCode: null,
      peerId: null,
      peerNodeId: null,
    });
  },
}));

export default useWalletStore;
