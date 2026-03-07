import "@testing-library/jest-dom";

import socket from "../../src/lib/socket";
import useWalletStore from "../../src/store/useWalletStore";

jest.mock("bip39", () => ({
  generateMnemonic: () => "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about",
}));

const PEER_NODE_ID = "node_peer_001";
const CAPACITY = 50_000;

beforeEach(() => {
  useWalletStore.getState().reset();
  jest.clearAllMocks();
  socket.connected = false;
});

describe("initP2P", () => {
  it("connects the socket when not already connected", () => {
    socket.connected = false;
    useWalletStore.getState().initP2P();

    expect(socket.connect).toHaveBeenCalled();
  });

  it("does not call connect if socket is already connected", () => {
    socket.connected = true;
    useWalletStore.getState().initP2P();

    expect(socket.connect).not.toHaveBeenCalled();
  });

  it("registers all required socket listeners", () => {
    useWalletStore.getState().initP2P();

    const registeredEvents = socket.on.mock.calls.map(([event]) => event);
    expect(registeredEvents).toContain("room_created");
    expect(registeredEvents).toContain("peer_connected");
    expect(registeredEvents).toContain("room_joined");
    expect(registeredEvents).toContain("peer_disconnected");
    expect(registeredEvents).toContain("channel_opened");
    expect(registeredEvents).toContain("payment_received");
  });
});

describe("createRoom", () => {
  it("sets p2pMode to true", () => {
    useWalletStore.getState().generateWallet();
    useWalletStore.getState().createRoom();

    expect(useWalletStore.getState().p2pMode).toBe(true);
  });

  it("emits create_room with the nodeId", () => {
    useWalletStore.getState().generateWallet();
    const { nodeId } = useWalletStore.getState();
    useWalletStore.getState().createRoom();

    expect(socket.emit).toHaveBeenCalledWith("create_room", { nodeId });
  });
});

describe("joinRoom", () => {
  it("sets p2pMode to true", () => {
    useWalletStore.getState().generateWallet();
    useWalletStore.getState().joinRoom("ABC123");

    expect(useWalletStore.getState().p2pMode).toBe(true);
  });

  it("emits join_room with the roomCode and nodeId", () => {
    useWalletStore.getState().generateWallet();
    const { nodeId } = useWalletStore.getState();
    useWalletStore.getState().joinRoom("ABC123");

    expect(socket.emit).toHaveBeenCalledWith("join_room", { roomCode: "ABC123", nodeId });
  });
});

describe("openChannelP2P", () => {
  beforeEach(() => {
    useWalletStore.getState().addOnChainBalance(100_000);
  });

  it("deducts the capacity from onChainBalance", () => {
    useWalletStore.getState().openChannelP2P(CAPACITY);

    expect(useWalletStore.getState().onChainBalance).toBe(50_000);
  });

  it("emits open_channel with the capacity", () => {
    useWalletStore.getState().openChannelP2P(CAPACITY);

    expect(socket.emit).toHaveBeenCalledWith("open_channel", { capacity: CAPACITY });
  });
});

describe("registerInvoiceP2P", () => {
  it("emits register_invoice with the invoice", () => {
    const invoice = { id: "inv-1", amount: 1000, bolt11: "lnsim1_..." };
    useWalletStore.getState().registerInvoiceP2P(invoice);

    expect(socket.emit).toHaveBeenCalledWith("register_invoice", { invoice });
  });
});

describe("confirmP2PPayment", () => {
  beforeEach(() => {
    useWalletStore.getState().addOnChainBalance(100_000);
    useWalletStore.getState().openChannelP2P(CAPACITY);
    useWalletStore.setState({
      channels: [{
        id: "ch-1",
        peerNodeId: PEER_NODE_ID,
        capacity: CAPACITY,
        localBalance: CAPACITY,
        remoteBalance: 0,
        status: "open",
      }],
      lightningBalance: CAPACITY,
    });
  });

  it("deducts the amount from lightningBalance", () => {
    useWalletStore.getState().confirmP2PPayment({
      amount: 1_000,
      invoiceId: "inv-1",
      description: "Test",
      peerNodeId: PEER_NODE_ID,
    });

    expect(useWalletStore.getState().lightningBalance).toBe(49_000);
  });

  it("updates channel localBalance and remoteBalance", () => {
    useWalletStore.getState().confirmP2PPayment({
      amount: 5_000,
      invoiceId: "inv-1",
      description: "Test",
      peerNodeId: PEER_NODE_ID,
    });

    const channel = useWalletStore.getState().channels[0];
    expect(channel.localBalance).toBe(45_000);
    expect(channel.remoteBalance).toBe(5_000);
  });

  it("adds a send transaction to history", () => {
    useWalletStore.getState().confirmP2PPayment({
      amount: 2_000,
      invoiceId: "inv-1",
      description: "Café P2P",
      peerNodeId: PEER_NODE_ID,
    });

    const { transactions } = useWalletStore.getState();
    expect(transactions[0].type).toBe("send");
    expect(transactions[0].amount).toBe(2_000);
    expect(transactions[0].description).toBe("Café P2P");
  });
});

describe("leaveP2P", () => {
  it("disconnects the socket", () => {
    useWalletStore.getState().leaveP2P();

    expect(socket.disconnect).toHaveBeenCalled();
  });

  it("resets all P2P state", () => {
    useWalletStore.setState({ p2pMode: true, roomCode: "ABC123", peerId: "peer-1", peerNodeId: PEER_NODE_ID });
    useWalletStore.getState().leaveP2P();

    const state = useWalletStore.getState();
    expect(state.p2pMode).toBe(false);
    expect(state.roomCode).toBeNull();
    expect(state.peerId).toBeNull();
    expect(state.peerNodeId).toBeNull();
  });

  it("removes all socket listeners", () => {
    useWalletStore.getState().leaveP2P();

    const removedEvents = socket.off.mock.calls.map(([event]) => event);
    expect(removedEvents).toContain("room_created");
    expect(removedEvents).toContain("peer_connected");
    expect(removedEvents).toContain("room_joined");
    expect(removedEvents).toContain("peer_disconnected");
    expect(removedEvents).toContain("channel_opened");
    expect(removedEvents).toContain("payment_received");
  });
});

describe("reset clears P2P state", () => {
  it("resets p2pMode and room info", () => {
    useWalletStore.setState({ p2pMode: true, roomCode: "XYZ", peerId: "p1", peerNodeId: "node_abc" });
    useWalletStore.getState().reset();

    const state = useWalletStore.getState();
    expect(state.p2pMode).toBe(false);
    expect(state.roomCode).toBeNull();
    expect(state.peerId).toBeNull();
    expect(state.peerNodeId).toBeNull();
  });
});
