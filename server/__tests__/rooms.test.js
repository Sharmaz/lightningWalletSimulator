const { rooms, generateRoomCode } = require("../src/rooms");

beforeEach(() => {
  rooms.clear();
});

describe("generateRoomCode", () => {
  it("returns a 6-character alphanumeric uppercase string", () => {
    const code = generateRoomCode();

    expect(code).toMatch(/^[A-Z0-9]{6}$/);
  });

  it("generates unique codes across multiple calls", () => {
    const codes = new Set(Array.from({ length: 100 }, generateRoomCode));

    expect(codes.size).toBeGreaterThan(95);
  });
});

describe("rooms", () => {
  it("starts empty", () => {
    expect(rooms.size).toBe(0);
  });

  it("stores and retrieves a room by code", () => {
    rooms.set("ABC123", { users: [], channels: [], invoices: [], lastActivity: Date.now() });

    expect(rooms.has("ABC123")).toBe(true);
    expect(rooms.get("ABC123").users).toHaveLength(0);
  });

  it("deletes a room by code", () => {
    rooms.set("DEL123", { users: [], channels: [], invoices: [], lastActivity: Date.now() });
    rooms.delete("DEL123");

    expect(rooms.has("DEL123")).toBe(false);
  });
});
