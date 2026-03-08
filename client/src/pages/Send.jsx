import { useState, useRef, useEffect } from "react";

import { Html5Qrcode } from "html5-qrcode";
import { useLocation, useNavigate } from "react-router-dom";

import PageHeader from "../components/PageHeader";
import { decodeInvoice, isExpired } from "../lib/invoice";
import socket from "../lib/socket";
import useWalletStore from "../store/useWalletStore";

export default function Send() {
  const { payInvoice } = useWalletStore();
  const navigate = useNavigate();
  const location = useLocation();

  const prefilled = location.state?.bolt11 || "";
  const [input, setInput] = useState(prefilled);
  const [parsed, setParsed] = useState(() => {
    if (!prefilled) return null;
    const inv = decodeInvoice(prefilled);
    return inv && !isExpired(inv) ? inv : null;
  });
  const [error, setError] = useState("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const cameraAvailable = typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia;
  const scannerRef = useRef(null);
  const scannerInstanceRef = useRef(null);

  useEffect(() => () => {
    try {
      scannerInstanceRef.current?.stop().catch(() => {});
    } catch {
      // scanner was not running
    }
  }, []);

  function handleParse() {
    setError("");
    const inv = decodeInvoice(input.trim());
    if (!inv) return setError("Invoice inválido. Verifica que sea un invoice de este simulador.");
    if (isExpired(inv)) return setError("Este invoice ya expiró.");
    setParsed(inv);
  }

  function handlePay() {
    const { p2pMode, confirmP2PPayment } = useWalletStore.getState();

    if (p2pMode) {
      socket.emit("pay_invoice", { bolt11: parsed.bolt11 });
      socket.once("payment_complete", ({ amount, invoiceId }) => {
        confirmP2PPayment({
          amount,
          invoiceId,
          description: parsed.description,
          peerNodeId: parsed.payeeNodeId,
        });
        setResult({ success: true });
      });
      socket.once("payment_failed", ({ reason }) => {
        setError(reason);
      });
      return;
    }

    const res = payInvoice(parsed.bolt11);
    if (res.error) return setError(res.error);
    setResult(res);
  }

  async function startScanner() {
    setScanning(true);
    setError("");

    await new Promise((r) => setTimeout(r, 100));
    try {
      const scanner = new Html5Qrcode("qr-reader");
      scannerInstanceRef.current = scanner;
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        (decodedText) => {
          try { scanner.stop().catch(() => {}); } catch { /* noop */ }
          setScanning(false);
          setInput(decodedText);
          const inv = decodeInvoice(decodedText);
          if (inv && !isExpired(inv)) {
            setParsed(inv);
          } else {
            setError("QR escaneado no contiene un invoice válido.");
          }
        },
        () => {},
      );
    } catch {
      setScanning(false);
      setError("No se pudo acceder a la cámara. Pega el invoice manualmente.");
    }
  }

  if (result) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center mb-6">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 className="text-white font-bold text-xl mb-2">Pago enviado</h2>
        <p className="text-green-400 text-2xl font-bold mb-1">{parsed.amount.toLocaleString()} sat</p>
        {parsed.description && <p className="text-neutral-400 text-sm mb-8">{parsed.description}</p>}
        <button
          onClick={() => navigate("/home")}
          className="w-full max-w-xs bg-green-500 text-black font-bold py-3 rounded-xl hover:bg-green-400 transition-colors"
        >
          Volver al inicio
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-black p-6 pb-36">
      <PageHeader title="Enviar" />

      {scanning ? (
        <div className="mb-4">
          <div id="qr-reader" ref={scannerRef} className="rounded-xl overflow-hidden" />
          <button
            onClick={() => {
              try { scannerInstanceRef.current?.stop().catch(() => {}); } catch { /* noop */ }
              setScanning(false);
            }}
            className="w-full mt-3 text-neutral-500 text-sm py-2"
          >
            Cancelar escaneo
          </button>
        </div>
      ) : (
        <>
          <input
            value={input}
            onChange={(e) => { setInput(e.target.value); setParsed(null); setError(""); }}
            placeholder="lnsim1_..."
            className="bg-neutral-900 text-white rounded-xl px-4 py-3 mb-4 outline-none focus:ring-2 focus:ring-green-400 text-xs font-mono"
          />

          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

          {!parsed ? (
            <button
              onClick={handleParse}
              disabled={!input.trim()}
              className="w-full bg-neutral-800 text-white font-bold py-3 rounded-xl hover:bg-neutral-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Verificar invoice
            </button>
          ) : (
            <div className="bg-neutral-900 rounded-xl p-4 mb-4">
              <p className="text-neutral-500 text-xs mb-2">Detalles del pago</p>
              <p className="text-white font-bold text-xl mb-1">{parsed.amount.toLocaleString()} sat</p>
              {parsed.description && <p className="text-neutral-400 text-sm mb-4">{parsed.description}</p>}
              <button
                onClick={handlePay}
                className="w-full bg-green-500 text-black font-bold py-3 rounded-xl hover:bg-green-400 transition-colors"
              >
                Confirmar pago
              </button>
            </div>
          )}
        </>
      )}

      {!scanning && !parsed && (
        <div className="fixed bottom-0 inset-x-0 bg-black border-t border-neutral-800">
          <div className="max-w-md mx-auto flex">
            <button
              onClick={() => {
                navigator.clipboard.readText?.().then((text) => {
                  if (text) { setInput(text); setParsed(null); setError(""); }
                }).catch(() => {});
              }}
              className="flex-1 flex flex-col items-center gap-1 py-4 text-neutral-500 hover:text-white transition-colors"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              <span className="text-xs">pegar</span>
            </button>
            {cameraAvailable && (
              <button
                onClick={startScanner}
                className="flex-1 flex flex-col items-center gap-1 py-4 text-neutral-500 hover:text-white transition-colors"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" />
                </svg>
                <span className="text-xs">escanear QR</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
