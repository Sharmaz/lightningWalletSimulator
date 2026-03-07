const { io: Client } = require("socket.io-client");

const { server, rooms } = require("../src/index");

// Note: nodeIds in these tests have no "_" because the server parses bolt11
// positionally (split("_")), and a nodeId with "_" would break parsing.
const NODE_A = "nodeA";
const NODE_B = "nodeB";

let port;
let clientA;
let clientB;
let roomCode;

function connect(nodeId) {
  return new Promise((resolve) => {
    const client = Client(`http://localhost:${port}`, { forceNew: true });
    client.once("connect", () => resolve(client));
    client.data = { nodeId };
  });
}

function once(socket, event) {
  return new Promise((resolve) => socket.once(event, resolve));
}

function makeBolt11({ amount, payeeNodeId, id = "fakeinvoiceid", expired = false }) {
  const now = Date.now();
  const expiresAt = expired ? now - 5000 : now + 3600000;
  return `lnsim1_${amount}_dGVzdA_${payeeNodeId}_${id}_${now}_${expiresAt}`;
}

beforeAll((done) => {
  server.listen(0, () => {
    port = server.address().port;
    done();
  });
});

afterAll((done) => {
  server.close(done);
});

beforeEach(async () => {
  rooms.clear();
  clientA = await connect(NODE_A);
  clientB = await connect(NODE_B);

  clientA.emit("create_room", { nodeId: NODE_A });
  ({ roomCode } = await once(clientA, "room_created"));
  clientB.emit("join_room", { roomCode, nodeId: NODE_B });
  await once(clientB, "room_joined");

  clientA.emit("open_channel", { capacity: 50000 });
  await once(clientA, "channel_opened");
});

afterEach(() => {
  clientA.disconnect();
  clientB.disconnect();
});

describe("register_invoice", () => {
  it("stores the invoice in the room", async () => {
    const invoice = { id: "inv-1", amount: 1000, status: "pending" };
    clientA.emit("register_invoice", { invoice });

    await new Promise((r) => setTimeout(r, 50));
    const room = rooms.get(roomCode);

    expect(room.invoices).toHaveLength(1);
    expect(room.invoices[0].id).toBe("inv-1");
  });
});

describe("pay_invoice", () => {
  it("emits payment_complete to the sender", async () => {
    const bolt11 = makeBolt11({ amount: 1000, payeeNodeId: NODE_B });
    clientA.emit("pay_invoice", { bolt11 });
    const data = await once(clientA, "payment_complete");

    expect(data.from).toBe(NODE_A);
    expect(data.to).toBe(NODE_B);
    expect(data.amount).toBe(1000);
  });

  it("emits payment_received to the receiver", async () => {
    const bolt11 = makeBolt11({ amount: 2000, payeeNodeId: NODE_B });
    const receivedPromise = once(clientB, "payment_received");
    clientA.emit("pay_invoice", { bolt11 });
    const data = await receivedPromise;

    expect(data.from).toBe(NODE_A);
    expect(data.amount).toBe(2000);
  });

  it("updates channel balances after payment", async () => {
    const bolt11 = makeBolt11({ amount: 5000, payeeNodeId: NODE_B });
    clientA.emit("pay_invoice", { bolt11 });
    await once(clientA, "payment_complete");

    const room = rooms.get(roomCode);
    const channel = room.channels[0];
    expect(channel.localBalance).toBe(45000);
    expect(channel.remoteBalance).toBe(5000);
  });

  it("marks a registered invoice as paid", async () => {
    const invoice = { id: "inv-pay-1", amount: 1000, status: "pending" };
    clientB.emit("register_invoice", { invoice });
    await new Promise((r) => setTimeout(r, 50));

    const bolt11 = makeBolt11({ amount: 1000, payeeNodeId: NODE_B, id: "inv-pay-1" });
    clientA.emit("pay_invoice", { bolt11 });
    await once(clientA, "payment_complete");

    const room = rooms.get(roomCode);
    expect(room.invoices[0].status).toBe("paid");
  });

  it("emits payment_failed for an invalid bolt11 string", async () => {
    clientA.emit("pay_invoice", { bolt11: "not-valid" });
    const data = await once(clientA, "payment_failed");

    expect(data.reason).toMatch(/inv[aá]lido/i);
  });

  it("emits payment_failed for an expired invoice", async () => {
    const bolt11 = makeBolt11({ amount: 1000, payeeNodeId: NODE_B, expired: true });
    clientA.emit("pay_invoice", { bolt11 });
    const data = await once(clientA, "payment_failed");

    expect(data.reason).toMatch(/expirado/i);
  });

  it("emits payment_failed when trying to pay yourself", async () => {
    const bolt11 = makeBolt11({ amount: 1000, payeeNodeId: NODE_A });
    clientA.emit("pay_invoice", { bolt11 });
    const data = await once(clientA, "payment_failed");

    expect(data.reason).toMatch(/ti mismo/i);
  });

  it("emits payment_failed if the invoice was already paid", async () => {
    const invoice = { id: "inv-dup", amount: 500, status: "pending" };
    clientB.emit("register_invoice", { invoice });
    await new Promise((r) => setTimeout(r, 50));

    const bolt11 = makeBolt11({ amount: 500, payeeNodeId: NODE_B, id: "inv-dup" });
    clientA.emit("pay_invoice", { bolt11 });
    await once(clientA, "payment_complete");

    clientA.emit("pay_invoice", { bolt11 });
    const data = await once(clientA, "payment_failed");
    expect(data.reason).toMatch(/ya pagado/i);
  });

  it("emits payment_failed when there is insufficient channel liquidity", async () => {
    const bolt11 = makeBolt11({ amount: 999999, payeeNodeId: NODE_B });
    clientA.emit("pay_invoice", { bolt11 });
    const data = await once(clientA, "payment_failed");

    expect(data.reason).toMatch(/liquidez/i);
  });
});

describe("GET /health", () => {
  it("responds with status ok", async () => {
    const res = await fetch(`http://localhost:${port}/health`);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.status).toBe("ok");
  });
});
