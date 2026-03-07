import "@testing-library/jest-dom";

import { encodeInvoice } from "../../src/lib/invoice";
import useWalletStore, { BOT_NODE_ID } from "../../src/store/useWalletStore";

jest.mock("bip39", () => ({
  generateMnemonic: () => "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about",
}));

beforeEach(() => {
  useWalletStore.getState().reset();
  useWalletStore.getState().generateWallet();
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe("initSoloMode", () => {
  it("sets soloMode to true", () => {
    useWalletStore.getState().initSoloMode();

    expect(useWalletStore.getState().soloMode).toBe(true);
  });

  it("grants 50,000 sats of lightning balance", () => {
    useWalletStore.getState().initSoloMode();

    expect(useWalletStore.getState().lightningBalance).toBe(50_000);
  });

  it("sets onChainBalance to 50,000 (100k faucet minus 50k to channel)", () => {
    useWalletStore.getState().initSoloMode();

    expect(useWalletStore.getState().onChainBalance).toBe(50_000);
  });

  it("opens one channel with the bot node", () => {
    useWalletStore.getState().initSoloMode();
    const { channels } = useWalletStore.getState();

    expect(channels).toHaveLength(1);
    expect(channels[0].peerNodeId).toBe(BOT_NODE_ID);
    expect(channels[0].status).toBe("open");
    expect(channels[0].capacity).toBe(100_000);
    expect(channels[0].localBalance).toBe(50_000);
    expect(channels[0].remoteBalance).toBe(50_000);
  });

  it("adds a channel_open transaction to history", () => {
    useWalletStore.getState().initSoloMode();
    const { transactions } = useWalletStore.getState();

    expect(transactions[0].type).toBe("channel_open");
    expect(transactions[0].amount).toBe(50_000);
  });

  it("generates an initial bot invoice", () => {
    useWalletStore.getState().initSoloMode();
    const { botInvoice } = useWalletStore.getState();

    expect(botInvoice).not.toBeNull();
    expect(botInvoice.bolt11).toContain(BOT_NODE_ID);
    expect(botInvoice.amount).toBeGreaterThan(0);
  });
});

describe("_generateBotInvoice", () => {
  it("creates a bot invoice with a valid amount", () => {
    useWalletStore.getState()._generateBotInvoice();
    const { botInvoice } = useWalletStore.getState();

    expect(botInvoice).not.toBeNull();
    expect(botInvoice.bolt11).toMatch(/^lnsim1_/);
    expect(botInvoice.bolt11).toContain(BOT_NODE_ID);
  });

  it("replaces the previous bot invoice on each call", () => {
    useWalletStore.getState()._generateBotInvoice();
    const first = useWalletStore.getState().botInvoice.id;

    useWalletStore.getState()._generateBotInvoice();
    const second = useWalletStore.getState().botInvoice.id;

    expect(first).not.toBe(second);
  });
});

describe("_botPayUserInvoice", () => {
  it("receives the payment after 3 seconds", () => {
    useWalletStore.getState().initSoloMode();
    const { nodeId } = useWalletStore.getState();
    const invoice = encodeInvoice({ amount: 1_000, description: "Test", payeeNodeId: nodeId });
    const balanceBefore = useWalletStore.getState().lightningBalance;

    useWalletStore.getState()._botPayUserInvoice(invoice);
    jest.advanceTimersByTime(3000);

    expect(useWalletStore.getState().lightningBalance).toBe(balanceBefore + 1_000);
  });

  it("marks the invoice as paid after the bot pays", () => {
    useWalletStore.getState().initSoloMode();
    const { nodeId } = useWalletStore.getState();
    const invoice = encodeInvoice({ amount: 500, description: "Café", payeeNodeId: nodeId });
    useWalletStore.getState().invoices.push ? null : null;

    useWalletStore.setState((s) => ({ invoices: [{ ...invoice, status: "pending" }, ...s.invoices] }));

    useWalletStore.getState()._botPayUserInvoice(invoice);
    jest.advanceTimersByTime(3000);

    const stored = useWalletStore.getState().invoices.find((i) => i.id === invoice.id);
    expect(stored.status).toBe("paid");
  });

  it("does not pay if soloMode was disabled before the timeout", () => {
    useWalletStore.getState().initSoloMode();
    const { nodeId } = useWalletStore.getState();
    const invoice = encodeInvoice({ amount: 500, description: "Test", payeeNodeId: nodeId });

    useWalletStore.getState()._botPayUserInvoice(invoice);
    useWalletStore.getState().reset();
    jest.advanceTimersByTime(3000);

    expect(useWalletStore.getState().lightningBalance).toBe(0);
  });
});

describe("createInvoice in solo mode", () => {
  it("triggers bot payment automatically after 3 seconds", () => {
    useWalletStore.getState().initSoloMode();
    const balanceBefore = useWalletStore.getState().lightningBalance;

    useWalletStore.getState().createInvoice({ amount: 2_000, description: "Auto" });
    expect(useWalletStore.getState().lightningBalance).toBe(balanceBefore);

    jest.advanceTimersByTime(3000);
    expect(useWalletStore.getState().lightningBalance).toBe(balanceBefore + 2_000);
  });
});

describe("payInvoice in solo mode", () => {
  it("generates a new bot invoice 1.5 seconds after paying a bot invoice", () => {
    useWalletStore.getState().initSoloMode();
    const firstBotInvoice = useWalletStore.getState().botInvoice;

    useWalletStore.getState().payInvoice(firstBotInvoice.bolt11);
    jest.advanceTimersByTime(1500);

    const newBotInvoice = useWalletStore.getState().botInvoice;
    expect(newBotInvoice.id).not.toBe(firstBotInvoice.id);
  });
});
