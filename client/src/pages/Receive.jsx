import { useEffect, useState } from "react";

import { QRCodeSVG } from "qrcode.react";
import { useNavigate } from "react-router-dom";

import Toast from "../components/Toast";
import useWalletStore from "../store/useWalletStore";

export default function Receive() {
  const { createInvoice, invoices } = useWalletStore();
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [invoice, setInvoice] = useState(null);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!invoice) return;
    const stored = invoices.find((i) => i.id === invoice.id);
    if (stored?.status === "paid") {
      setToast(`Pago recibido — ${invoice.amount.toLocaleString()} sats`);
    }
  }, [invoices, invoice]);

  function handleGenerate() {
    if (!amount || Number(amount) <= 0) return;
    const inv = createInvoice({ amount: Number(amount), description });
    if (useWalletStore.getState().p2pMode) {
      useWalletStore.getState().registerInvoiceP2P(inv);
    }
    setInvoice(inv);
  }

  function handleCopy() {
    navigator.clipboard.writeText(invoice.bolt11);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleReset() {
    setInvoice(null);
    setAmount("");
    setDescription("");
  }

  if (invoice) {
    return (
      <div className="flex flex-col items-center min-h-screen bg-black p-6 pb-24">
        {toast && <Toast message={toast} onDone={() => setToast(null)} />}

        <div className="w-full flex items-center mb-6">
          <button
            onClick={() => navigate("/home")}
            className="text-green-400 text-sm font-semibold flex items-center gap-1"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Inicio
          </button>
          <h2 className="text-white font-bold text-base flex-1 text-center">Recibir</h2>
          <div className="w-16" />
        </div>

        <div className="bg-white p-4 rounded-2xl mb-4">
          <QRCodeSVG value={invoice.bolt11} size={220} />
        </div>

        <div className="text-center mb-6">
          <p className="text-green-400 text-2xl font-bold">{invoice.amount.toLocaleString()} sat</p>
          {invoice.description && (
            <p className="text-neutral-400 text-sm mt-1">{invoice.description}</p>
          )}
        </div>

        <div className="flex gap-6 mb-6">
          <button onClick={handleCopy} className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-neutral-900 flex items-center justify-center text-green-400">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            </div>
            <span className="text-neutral-400 text-xs">{copied ? "copiado" : "copiar"}</span>
          </button>
          <button onClick={handleReset} className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-neutral-900 flex items-center justify-center text-green-400">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </div>
            <span className="text-neutral-400 text-xs">nuevo</span>
          </button>
        </div>

        <div className="w-full bg-neutral-900 rounded-xl p-3 break-all">
          <p className="text-neutral-600 text-xs font-mono">{invoice.bolt11}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-black p-6 pb-24">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate("/home")}
          className="text-green-400 text-sm font-semibold flex items-center gap-1"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Inicio
        </button>
        <h2 className="text-white font-bold text-base flex-1 text-center">Recibir</h2>
        <div className="w-16" />
      </div>

      <p className="text-neutral-400 text-sm mb-6">Crea un invoice Lightning para recibir sats</p>

      <label className="text-neutral-500 text-xs mb-1">Monto (sats)</label>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Ej. 1000"
        className="bg-neutral-900 text-white rounded-xl px-4 py-3 mb-4 outline-none focus:ring-2 focus:ring-green-400 text-base"
      />

      <label className="text-neutral-500 text-xs mb-1">Descripción (opcional)</label>
      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Ej. Café"
        className="bg-neutral-900 text-white rounded-xl px-4 py-3 mb-6 outline-none focus:ring-2 focus:ring-green-400 text-base"
      />

      <button
        onClick={handleGenerate}
        disabled={!amount || Number(amount) <= 0}
        className="w-full bg-green-500 text-black font-bold py-3 rounded-xl hover:bg-green-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Generar invoice
      </button>
    </div>
  );
}
