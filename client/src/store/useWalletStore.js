import * as bip39 from "bip39";
import { v4 as uuidv4 } from "uuid";
import { create } from "zustand";

import { encodeInvoice, decodeInvoice, isExpired } from "../lib/invoice";

// Deriva un nodeId simulado del seed (no criptografía real)
function deriveNodeId(seedPhrase) {
  const str = seedPhrase.join("");
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (Math.imul(31, hash) + str.charCodeAt(i)) | 0;
  }
  return `node_${Math.abs(hash).toString(16).padStart(8, "0")}`;
}

const useWalletStore = create((set, get) => ({
  // Identidad
  seedPhrase: [],
  nodeId: null,

  // Balances
  onChainBalance: 0,
  lightningBalance: 0,

  // Canales e historial
  channels: [],
  invoices: [],
  transactions: [],

  // UI state
  isInitialized: false,

  // --- Acciones ---

  generateWallet() {
    const mnemonic = bip39.generateMnemonic();
    const seedPhrase = mnemonic.split(" ");
    const nodeId = deriveNodeId(seedPhrase);
    set({ seedPhrase, nodeId, isInitialized: true });
  },

  addOnChainBalance(amount) {
    set((s) => ({ onChainBalance: s.onChainBalance + amount }));
  },

  // Abre un canal moviendo sats de on-chain a Lightning
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

    // Simula la apertura del canal tras 1s
    setTimeout(() => {
      set((s) => ({
        channels: s.channels.map((c) => (c.id === channel.id ? { ...c, status: "open" } : c),
        ),
      }));
    }, 1000);

    return { channel };
  },

  // Actualiza un canal existente (usado por Socket.io en P2P)
  updateChannel(channelId, updates) {
    set((s) => ({
      channels: s.channels.map((c) => (c.id === channelId ? { ...c, ...updates } : c)),
    }));
  },

  // Agrega un canal externo (recibido del server en P2P)
  addChannel(channel) {
    set((s) => ({ channels: [...s.channels, channel] }));
  },

  createInvoice({ amount, description }) {
    const { nodeId } = get();
    const invoice = encodeInvoice({ amount, description, payeeNodeId: nodeId });
    set((s) => ({ invoices: [invoice, ...s.invoices] }));
    return invoice;
  },

  // Pago saliente (Solo Mode o validado localmente)
  payInvoice(bolt11) {
    const { nodeId, channels } = get();
    const invoice = decodeInvoice(bolt11);
    if (!invoice) return { error: "Invoice inválido" };
    if (isExpired(invoice)) return { error: "Invoice expirado" };
    if (invoice.payeeNodeId === nodeId) return { error: "No puedes pagarte a ti mismo" };

    // Busca canal con suficiente liquidez outbound
    const channel = channels.find(
      (c) => c.status === "open" && c.localBalance >= invoice.amount,
    );
    if (!channel) return { error: "Sin liquidez suficiente en ningún canal" };

    // Actualiza canal y balances
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

    return { success: true, invoice, channelId: channel.id };
  },

  // Pago entrante
  receivePayment({ amount, invoiceId, description }) {
    set((s) => {
      // Marca el invoice como pagado
      const invoices = s.invoices.map((inv) => (inv.id === invoiceId ? { ...inv, status: "paid" } : inv),
      );

      // Actualiza el canal con más liquidez remota → local
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

  // Sync completo desde el server (reconexión P2P)
  syncState(remoteState) {
    set((s) => ({ ...s, ...remoteState }));
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
    });
  },
}));

export default useWalletStore;
