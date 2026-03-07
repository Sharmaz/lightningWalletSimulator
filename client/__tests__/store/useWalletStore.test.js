import "@testing-library/jest-dom";

import useWalletStore from "../../src/store/useWalletStore";

jest.mock("bip39", () => ({
  generateMnemonic: () => "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about",
}));

const PEER_NODE_ID = "node_peer_001";
const CAPACITY = 50_000;

beforeEach(() => {
  useWalletStore.getState().reset();
});

describe("generateWallet", () => {
  it("sets seedPhrase with 12 words", () => {
    useWalletStore.getState().generateWallet();
    const { seedPhrase } = useWalletStore.getState();

    expect(seedPhrase).toHaveLength(12);
  });

  it("sets a non-null nodeId", () => {
    useWalletStore.getState().generateWallet();
    const { nodeId } = useWalletStore.getState();

    expect(nodeId).toBeTruthy();
    expect(nodeId).toMatch(/^node_/);
  });

  it("sets isInitialized to true", () => {
    useWalletStore.getState().generateWallet();

    expect(useWalletStore.getState().isInitialized).toBe(true);
  });
});

describe("addOnChainBalance", () => {
  it("increases onChainBalance by the given amount", () => {
    useWalletStore.getState().addOnChainBalance(100_000);

    expect(useWalletStore.getState().onChainBalance).toBe(100_000);
  });

  it("accumulates multiple faucet calls", () => {
    useWalletStore.getState().addOnChainBalance(50_000);
    useWalletStore.getState().addOnChainBalance(50_000);

    expect(useWalletStore.getState().onChainBalance).toBe(100_000);
  });
});

describe("openChannel", () => {
  beforeEach(() => {
    useWalletStore.getState().addOnChainBalance(100_000);
  });

  it("creates a channel with status opening", () => {
    useWalletStore.getState().openChannel({ peerNodeId: PEER_NODE_ID, capacity: CAPACITY });
    const { channels } = useWalletStore.getState();

    expect(channels).toHaveLength(1);
    expect(channels[0].status).toBe("opening");
    expect(channels[0].peerNodeId).toBe(PEER_NODE_ID);
    expect(channels[0].capacity).toBe(CAPACITY);
    expect(channels[0].localBalance).toBe(CAPACITY);
    expect(channels[0].remoteBalance).toBe(0);
  });

  it("moves sats from onChainBalance to lightningBalance", () => {
    useWalletStore.getState().openChannel({ peerNodeId: PEER_NODE_ID, capacity: CAPACITY });
    const state = useWalletStore.getState();

    expect(state.onChainBalance).toBe(50_000);
    expect(state.lightningBalance).toBe(CAPACITY);
  });

  it("adds a channel_open transaction to history", () => {
    useWalletStore.getState().openChannel({ peerNodeId: PEER_NODE_ID, capacity: CAPACITY });
    const { transactions } = useWalletStore.getState();

    expect(transactions[0].type).toBe("channel_open");
    expect(transactions[0].amount).toBe(CAPACITY);
  });

  it("returns error when onChainBalance is insufficient", () => {
    const result = useWalletStore.getState().openChannel({ peerNodeId: PEER_NODE_ID, capacity: 200_000 });

    expect(result.error).toBeDefined();
    expect(useWalletStore.getState().channels).toHaveLength(0);
  });
});

describe("createInvoice", () => {
  beforeEach(() => {
    useWalletStore.getState().generateWallet();
  });

  it("creates an invoice and adds it to the store", () => {
    useWalletStore.getState().createInvoice({ amount: 1000, description: "Café" });
    const { invoices } = useWalletStore.getState();

    expect(invoices).toHaveLength(1);
    expect(invoices[0].amount).toBe(1000);
    expect(invoices[0].description).toBe("Café");
    expect(invoices[0].status).toBe("pending");
  });

  it("returns the created invoice", () => {
    const invoice = useWalletStore.getState().createInvoice({ amount: 500, description: "Test" });

    expect(invoice.bolt11).toMatch(/^lnsim1_/);
    expect(invoice.amount).toBe(500);
  });
});

describe("payInvoice", () => {
  const PEER_NODE = "node_peer_xyz";

  beforeEach(() => {
    useWalletStore.getState().generateWallet();
    useWalletStore.getState().addOnChainBalance(100_000);
    useWalletStore.getState().openChannel({ peerNodeId: PEER_NODE, capacity: 50_000 });

    const channel = useWalletStore.getState().channels[0];
    useWalletStore.getState().updateChannel(channel.id, { status: "open" });
  });

  it("deducts amount from lightningBalance", () => {
    const invoice = `lnsim1_1000_dGVzdA_${PEER_NODE}_fake-id_${Date.now()}_${Date.now() + 3600000}`;
    useWalletStore.getState().payInvoice(invoice);

    expect(useWalletStore.getState().lightningBalance).toBe(49_000);
  });

  it("updates channel localBalance and remoteBalance", () => {
    const invoice = `lnsim1_1000_dGVzdA_${PEER_NODE}_fake-id_${Date.now()}_${Date.now() + 3600000}`;
    useWalletStore.getState().payInvoice(invoice);
    const channel = useWalletStore.getState().channels[0];

    expect(channel.localBalance).toBe(49_000);
    expect(channel.remoteBalance).toBe(1_000);
  });

  it("adds a send transaction to history", () => {
    const invoice = `lnsim1_1000_dGVzdA_${PEER_NODE}_fake-id_${Date.now()}_${Date.now() + 3600000}`;
    useWalletStore.getState().payInvoice(invoice);
    const { transactions } = useWalletStore.getState();

    expect(transactions[0].type).toBe("send");
    expect(transactions[0].amount).toBe(1000);
  });

  it("returns error for an invalid bolt11 string", () => {
    const result = useWalletStore.getState().payInvoice("not-valid");

    expect(result.error).toBeDefined();
  });

  it("returns error for an expired invoice", () => {
    const expired = `lnsim1_1000_dGVzdA_${PEER_NODE}_fake-id_${Date.now() - 10000}_${Date.now() - 5000}`;
    const result = useWalletStore.getState().payInvoice(expired);

    expect(result.error).toMatch(/expir/i);
  });

  it("returns error when there is no open channel with enough liquidity", () => {
    const bigInvoice = `lnsim1_999999_dGVzdA_${PEER_NODE}_fake-id_${Date.now()}_${Date.now() + 3600000}`;
    const result = useWalletStore.getState().payInvoice(bigInvoice);

    expect(result.error).toBeDefined();
  });
});

describe("receivePayment", () => {
  beforeEach(() => {
    useWalletStore.getState().generateWallet();
    useWalletStore.getState().addOnChainBalance(100_000);
    useWalletStore.getState().openChannel({ peerNodeId: PEER_NODE_ID, capacity: CAPACITY });
    const channel = useWalletStore.getState().channels[0];
    useWalletStore.getState().updateChannel(channel.id, { status: "open", remoteBalance: 10_000 });
  });

  it("increases lightningBalance by the payment amount", () => {
    const invoice = useWalletStore.getState().createInvoice({ amount: 5_000, description: "Recibo" });
    useWalletStore.getState().receivePayment({ amount: 5_000, invoiceId: invoice.id });

    expect(useWalletStore.getState().lightningBalance).toBe(55_000);
  });

  it("marks the invoice as paid", () => {
    const invoice = useWalletStore.getState().createInvoice({ amount: 3_000, description: "Test" });
    useWalletStore.getState().receivePayment({ amount: 3_000, invoiceId: invoice.id });
    const stored = useWalletStore.getState().invoices.find((i) => i.id === invoice.id);

    expect(stored.status).toBe("paid");
  });

  it("adds a receive transaction to history", () => {
    const invoice = useWalletStore.getState().createInvoice({ amount: 2_000, description: "Pago" });
    useWalletStore.getState().receivePayment({ amount: 2_000, invoiceId: invoice.id, description: "Pago recibido" });
    const { transactions } = useWalletStore.getState();

    expect(transactions[0].type).toBe("receive");
    expect(transactions[0].amount).toBe(2_000);
  });
});

describe("reset", () => {
  it("clears all wallet state", () => {
    useWalletStore.getState().generateWallet();
    useWalletStore.getState().addOnChainBalance(100_000);
    useWalletStore.getState().reset();
    const state = useWalletStore.getState();

    expect(state.seedPhrase).toHaveLength(0);
    expect(state.nodeId).toBeNull();
    expect(state.onChainBalance).toBe(0);
    expect(state.lightningBalance).toBe(0);
    expect(state.channels).toHaveLength(0);
    expect(state.isInitialized).toBe(false);
  });
});
