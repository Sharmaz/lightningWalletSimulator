const { io: Client } = require("socket.io-client");

const { server, rooms } = require("../src/index");

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
});

afterEach(() => {
  clientA.disconnect();
  clientB.disconnect();
});

describe("open_channel", () => {
  it("emits channel_opened to the opener with localBalance equal to capacity", async () => {
    clientA.emit("open_channel", { capacity: 50000 });
    const { channel } = await once(clientA, "channel_opened");

    expect(channel.capacity).toBe(50000);
    expect(channel.localBalance).toBe(50000);
    expect(channel.remoteBalance).toBe(0);
    expect(channel.status).toBe("open");
  });

  it("emits channel_opened to the peer with inverted balances", async () => {
    const peerChannelPromise = once(clientB, "channel_opened");
    clientA.emit("open_channel", { capacity: 50000 });
    const { channel } = await peerChannelPromise;

    expect(channel.localBalance).toBe(0);
    expect(channel.remoteBalance).toBe(50000);
  });

  it("stores the channel in the room", async () => {
    clientA.emit("open_channel", { capacity: 30000 });
    await once(clientA, "channel_opened");
    const room = rooms.get(roomCode);

    expect(room.channels).toHaveLength(1);
    expect(room.channels[0].capacity).toBe(30000);
  });
});
