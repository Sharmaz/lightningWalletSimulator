import { useState } from "react";

import { QRCodeSVG } from "qrcode.react";

import useWalletStore from "../store/useWalletStore";

export default function Receive() {
  const { createInvoice } = useWalletStore();
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [invoice, setInvoice] = useState(null);
  const [copied, setCopied] = useState(false);

  function handleGenerate() {
    if (!amount || Number(amount) <= 0) return;
    const inv = createInvoice({ amount: Number(amount), description });
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
      <div className="flex flex-col items-center min-h-screen bg-neutral-900 p-6 pb-24">
        <h2 className="text-white font-bold text-lg mb-1">Invoice generado</h2>
        <p className="text-neutral-400 text-sm mb-6">Muestra este QR para recibir el pago</p>

        <div className="bg-white p-4 rounded-2xl mb-4">
          <QRCodeSVG value={invoice.bolt11} size={220} />
        </div>

        <div className="text-center mb-4">
          <p className="text-yellow-400 text-2xl font-bold">{invoice.amount.toLocaleString()} sats</p>
          {invoice.description && (
            <p className="text-neutral-400 text-sm mt-1">{invoice.description}</p>
          )}
        </div>

        <div className="w-full bg-neutral-800 rounded-xl p-3 mb-4 break-all">
          <p className="text-neutral-500 text-xs font-mono">{invoice.bolt11}</p>
        </div>

        <button
          onClick={handleCopy}
          className="w-full bg-neutral-700 text-white font-bold py-3 rounded-xl mb-3 hover:bg-neutral-600 transition-colors"
        >
          {copied ? "✓ Copiado" : "Copiar invoice"}
        </button>
        <button
          onClick={handleReset}
          className="w-full text-neutral-400 text-sm py-2"
        >
          Crear otro invoice
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-neutral-900 p-6 pb-24">
      <h2 className="text-white font-bold text-lg mb-1">Recibir pago</h2>
      <p className="text-neutral-400 text-sm mb-6">Crea un invoice Lightning para recibir sats</p>

      <label className="text-neutral-400 text-xs mb-1">Monto (sats)</label>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Ej. 1000"
        className="bg-neutral-800 text-white rounded-xl px-4 py-3 mb-4 outline-none focus:ring-2 focus:ring-yellow-400 text-base"
      />

      <label className="text-neutral-400 text-xs mb-1">Descripción (opcional)</label>
      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Ej. Café"
        className="bg-neutral-800 text-white rounded-xl px-4 py-3 mb-6 outline-none focus:ring-2 focus:ring-yellow-400 text-base"
      />

      <button
        onClick={handleGenerate}
        disabled={!amount || Number(amount) <= 0}
        className="w-full bg-yellow-400 text-neutral-900 font-bold py-3 rounded-xl hover:bg-yellow-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Generar invoice
      </button>
    </div>
  );
}
