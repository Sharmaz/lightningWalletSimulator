import { v4 as uuidv4 } from "uuid";

const INVOICE_PREFIX = "lnsim1";
const DEFAULT_EXPIRY = 3600;

export function encodeInvoice({ amount, description, payeeNodeId }) {
  const id = uuidv4();
  const timestamp = Date.now();
  const expiresAt = timestamp + DEFAULT_EXPIRY * 1000;
  const descB64 = btoa(encodeURIComponent(description));
  const bolt11 = `${INVOICE_PREFIX}_${amount}_${descB64}_${payeeNodeId}_${id}_${timestamp}_${expiresAt}`;
  return { id, bolt11, amount, description, timestamp, expiresAt, status: "pending" };
}

export function decodeInvoice(bolt11) {
  if (!bolt11.startsWith(`${INVOICE_PREFIX}_`)) return null;
  const parts = bolt11.split("_");

  if (parts.length < 7) return null;

  const expiresAt = parts[parts.length - 1];
  const timestamp = parts[parts.length - 2];
  const id = parts[parts.length - 3];
  const payeeNodeId = parts.slice(3, parts.length - 3).join("_");
  const amount = parts[1];
  const descB64 = parts[2];

  let description = "";
  try {
    description = decodeURIComponent(atob(descB64));
  } catch {
    description = descB64;
  }
  return {
    id,
    bolt11,
    amount: Number(amount),
    description,
    payeeNodeId,
    timestamp: Number(timestamp),
    expiresAt: Number(expiresAt),
    status: "pending",
  };
}

export function isExpired(invoice) {
  return Date.now() > invoice.expiresAt;
}
