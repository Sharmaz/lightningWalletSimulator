const { io: Client } = require("socket.io-client");

const { server, rooms } = require("../src/index");

const NODE_A = "nodeA";
const NODE_B = "nodeB";

let port;
let clientA;
let clientB;

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
});

afterEach(() => {
  clientA.disconnect();
  clientB.disconnect();
});

describe("create_room", () => {
  it("emits room_created with a 6-character room code", async () => {
    clientA.emit("create_room", { nodeId: NODE_A });
    const { roomCode } = await once(clientA, "room_created");

    expect(roomCode).toMatch(/^[A-Z0-9]{6}$/);
  });

  it("stores the room in memory", async () => {
    clientA.emit("create_room", { nodeId: NODE_A });
    const { roomCode } = await once(clientA, "room_created");

    expect(rooms.has(roomCode)).toBe(true);
    expect(rooms.get(roomCode).users).toHaveLength(1);
  });
});

describe("join_room", () => {
  let roomCode;

  beforeEach(async () => {
    clientA.emit("create_room", { nodeId: NODE_A });
    ({ roomCode } = await once(clientA, "room_created"));
  });

  it("emits room_joined to the second user with peer info", async () => {
    clientB.emit("join_room", { roomCode, nodeId: NODE_B });
    const data = await once(clientB, "room_joined");

    expect(data.roomCode).toBe(roomCode);
    expect(data.peerNodeId).toBe(NODE_A);
  });

  it("emits peer_connected to the creator when someone joins", async () => {
    const peerConnectedPromise = once(clientA, "peer_connected");
    clientB.emit("join_room", { roomCode, nodeId: NODE_B });
    const data = await peerConnectedPromise;

    expect(data.peerNodeId).toBe(NODE_B);
  });

  it("emits room_error when the room does not exist", async () => {
    clientB.emit("join_room", { roomCode: "NOEXIST", nodeId: NODE_B });
    const data = await once(clientB, "room_error");

    expect(data.reason).toMatch(/no encontrada/i);
  });

  it("emits room_error when the room is full", async () => {
    const clientC = await connect("nodeC");
    clientB.emit("join_room", { roomCode, nodeId: NODE_B });
    await once(clientB, "room_joined");

    clientC.emit("join_room", { roomCode, nodeId: "nodeC" });
    const data = await once(clientC, "room_error");
    clientC.disconnect();

    expect(data.reason).toMatch(/llena/i);
  });
});

describe("disconnect", () => {
  it("emits peer_disconnected to the remaining user", async () => {
    clientA.emit("create_room", { nodeId: NODE_A });
    const { roomCode } = await once(clientA, "room_created");
    clientB.emit("join_room", { roomCode, nodeId: NODE_B });
    await once(clientB, "room_joined");

    const disconnectedPromise = once(clientA, "peer_disconnected");
    clientB.disconnect();
    const data = await disconnectedPromise;

    expect(data.nodeId).toBe(NODE_B);
  });
});
