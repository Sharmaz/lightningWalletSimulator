import { useEffect, useState } from "react";

import { QRCodeSVG } from "qrcode.react";

import FormField from "../components/FormField";
import PageHeader from "../components/PageHeader";
import Toast from "../components/Toast";
import useTour from "../hooks/useTour";
import { createReceiveTour } from "../lib/tours";
import useWalletStore from "../store/useWalletStore";

export default function Receive() {
  const { createInvoice, invoices } = useWalletStore();
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [invoice, setInvoice] = useState(null);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState(null);
  const canShare = typeof navigator !== "undefined" && !!navigator.share;
  const { hasSeenTour, startTour } = useTour("receive");

  useEffect(() => {
    if (!invoice && !hasSeenTour()) {
      setTimeout(() => startTour(createReceiveTour), 400);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

  function handleShare() {
    navigator.share({ text: invoice.bolt11 }).catch(() => {});
  }

  function handleEdit() {
    setInvoice(null);
    // keep amount and description pre-filled for editing
  }

  if (invoice) {
    return (
      <div className="flex flex-col min-h-screen bg-black p-6 pb-24">
        {toast && <Toast message={toast} onDone={() => setToast(null)} />}

        <PageHeader title="Recibir" />

        <div className="flex justify-center mb-6">
          <div className="bg-white p-4 rounded-2xl">
            <QRCodeSVG value={invoice.bolt11} size={220} />
          </div>
        </div>

        {/* Action row */}
        <div className="flex justify-center gap-8 mb-6">
          <button onClick={handleCopy} className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-neutral-900 flex items-center justify-center text-green-400">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            </div>
            <span className="text-neutral-400 text-xs">{copied ? "copiado" : "copiar"}</span>
          </button>

          {canShare && (
            <button onClick={handleShare} className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-neutral-900 flex items-center justify-center text-green-400">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
              </div>
              <span className="text-neutral-400 text-xs">compartir</span>
            </button>
          )}

          <button onClick={handleEdit} className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-neutral-900 flex items-center justify-center text-green-400">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </div>
            <span className="text-neutral-400 text-xs">editar</span>
          </button>
        </div>

        {/* Amount + description */}
        <div className="text-center mb-6 w-full">
          <p className="text-white text-2xl font-bold">{invoice.amount.toLocaleString()} sat</p>
          <p className="text-neutral-500 text-sm mt-1">
            {invoice.description || "sin descripción"}
          </p>
        </div>

        <div className="w-full bg-neutral-900 rounded-xl p-3 break-all">
          <p className="text-neutral-600 text-xs font-mono">{invoice.bolt11}</p>
        </div>
      </div>
    );
  }

  const tourBtn = (
    <button
      onClick={() => startTour(createReceiveTour)}
      className="w-7 h-7 rounded-full bg-neutral-800 text-neutral-400 text-xs font-bold hover:bg-neutral-700 hover:text-white transition-colors"
      aria-label="Ver tour explicativo"
    >
      ?
    </button>
  );

  return (
    <div className="flex flex-col min-h-screen bg-black p-6 pb-24">
      <PageHeader title="Recibir" right={tourBtn} />

      <p className="text-neutral-400 text-sm mb-6">Crea un invoice Lightning para recibir sats</p>

      <div id="tour-receive-amount">
        <FormField
          label="Monto (sats)"
          type="text"
          inputMode="numeric"
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
          placeholder="Ej. 1000"
          className="mb-4"
        />
      </div>

      <div id="tour-receive-description">
        <FormField
          label="Descripción (opcional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ej. Café"
          className="mb-6"
        />
      </div>

      <button
        id="tour-receive-generate"
        onClick={handleGenerate}
        disabled={!amount || Number(amount) <= 0}
        className="w-full bg-green-500 text-black font-bold py-3 rounded-xl hover:bg-green-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Generar invoice
      </button>
    </div>
  );
}
