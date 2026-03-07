import "@testing-library/jest-dom";

import { decodeInvoice, encodeInvoice, isExpired } from "../../src/lib/invoice";

const MOCK_NODE_ID = "node_abc123";

describe("encodeInvoice", () => {
  it("returns an invoice with all required fields", () => {
    const invoice = encodeInvoice({ amount: 1000, description: "Café", payeeNodeId: MOCK_NODE_ID });

    expect(invoice.id).toBeDefined();
    expect(invoice.bolt11).toMatch(/^lnsim1_/);
    expect(invoice.amount).toBe(1000);
    expect(invoice.description).toBe("Café");
    expect(invoice.status).toBe("pending");
    expect(invoice.timestamp).toBeLessThanOrEqual(Date.now());
    expect(invoice.expiresAt).toBeGreaterThan(Date.now());
  });

  it("bolt11 contains the payeeNodeId", () => {
    const invoice = encodeInvoice({ amount: 500, description: "test", payeeNodeId: MOCK_NODE_ID });

    expect(invoice.bolt11).toContain(MOCK_NODE_ID);
  });

  it("sets expiry 1 hour from creation", () => {
    const before = Date.now();
    const invoice = encodeInvoice({ amount: 100, description: "", payeeNodeId: MOCK_NODE_ID });
    const after = Date.now();

    expect(invoice.expiresAt).toBeGreaterThanOrEqual(before + 3600 * 1000);
    expect(invoice.expiresAt).toBeLessThanOrEqual(after + 3600 * 1000);
  });
});

describe("decodeInvoice", () => {
  it("correctly decodes an encoded invoice (round-trip)", () => {
    const original = encodeInvoice({ amount: 2000, description: "Tacos", payeeNodeId: MOCK_NODE_ID });
    const decoded = decodeInvoice(original.bolt11);

    expect(decoded.id).toBe(original.id);
    expect(decoded.amount).toBe(2000);
    expect(decoded.description).toBe("Tacos");
    expect(decoded.payeeNodeId).toBe(MOCK_NODE_ID);
    expect(decoded.status).toBe("pending");
  });

  it("returns null for a string without the lnsim1 prefix", () => {
    expect(decodeInvoice("btc_1000_abc")).toBeNull();
  });

  it("returns null for an empty string", () => {
    expect(decodeInvoice("")).toBeNull();
  });

  it("returns null for a bolt11 with too few segments", () => {
    expect(decodeInvoice("lnsim1_1000_abc")).toBeNull();
  });

  it("casts amount to number", () => {
    const invoice = encodeInvoice({ amount: 9999, description: "", payeeNodeId: MOCK_NODE_ID });
    const decoded = decodeInvoice(invoice.bolt11);

    expect(typeof decoded.amount).toBe("number");
    expect(decoded.amount).toBe(9999);
  });
});

describe("isExpired", () => {
  it("returns false for an invoice that has not expired", () => {
    const invoice = encodeInvoice({ amount: 100, description: "", payeeNodeId: MOCK_NODE_ID });

    expect(isExpired(invoice)).toBe(false);
  });

  it("returns true for an invoice with expiresAt in the past", () => {
    const expiredInvoice = { expiresAt: Date.now() - 1000 };

    expect(isExpired(expiredInvoice)).toBe(true);
  });
});
