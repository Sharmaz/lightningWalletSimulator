import { useState, useRef, useEffect } from "react";

import { Html5Qrcode } from "html5-qrcode";
import { useNavigate } from "react-router-dom";

import { decodeInvoice, isExpired } from "../lib/invoice";
import socket from "../lib/socket";
import useWalletStore from "../store/useWalletStore";

export default function Send() {
  const { payInvoice } = useWalletStore();
  const navigate = useNavigate();

  const [input, setInput] = useState("");
  const [parsed, setParsed] = useState(null);
  const [error, setError] = useState("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const scannerRef = useRef(null);
  const scannerInstanceRef = useRef(null);

  useEffect(() => () => {
    if (scannerInstanceRef.current) {
      scannerInstanceRef.current.stop().catch(() => {});
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
          scanner.stop().catch(() => {});
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-900 p-6 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-white font-bold text-xl mb-2">Pago enviado</h2>
        <p className="text-yellow-400 text-2xl font-bold mb-1">{parsed.amount.toLocaleString()} sats</p>
        {parsed.description && <p className="text-neutral-400 text-sm mb-6">{parsed.description}</p>}
        <button
          onClick={() => navigate("/home")}
          className="w-full max-w-xs bg-yellow-400 text-neutral-900 font-bold py-3 rounded-xl hover:bg-yellow-300 transition-colors"
        >
          Volver al inicio
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-neutral-900 p-6 pb-24">
      <h2 className="text-white font-bold text-lg mb-1">Enviar pago</h2>
      <p className="text-neutral-400 text-sm mb-6">Escanea un QR o pega el invoice</p>

      {scanning ? (
        <div className="mb-4">
          <div id="qr-reader" ref={scannerRef} className="rounded-xl overflow-hidden" />
          <button
            onClick={() => {
              scannerInstanceRef.current?.stop().catch(() => {});
              setScanning(false);
            }}
            className="w-full mt-3 text-neutral-400 text-sm py-2"
          >
            Cancelar escaneo
          </button>
        </div>
      ) : (
        <button
          onClick={startScanner}
          className="w-full bg-neutral-700 text-white font-bold py-3 rounded-xl mb-4 hover:bg-neutral-600 transition-colors"
        >
          📷 Escanear QR
        </button>
      )}

      <div className="relative mb-4">
        <div className="absolute inset-x-0 top-1/2 border-t border-neutral-700" />
        <span className="relative bg-neutral-900 px-3 text-neutral-500 text-xs mx-auto block w-fit">o pega el invoice</span>
      </div>

      <textarea
        value={input}
        onChange={(e) => { setInput(e.target.value); setParsed(null); setError(""); }}
        placeholder="lnsim1_..."
        rows={3}
        className="bg-neutral-800 text-white rounded-xl px-4 py-3 mb-4 outline-none focus:ring-2 focus:ring-yellow-400 text-xs font-mono resize-none"
      />

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      {!parsed ? (
        <button
          onClick={handleParse}
          disabled={!input.trim()}
          className="w-full bg-neutral-700 text-white font-bold py-3 rounded-xl hover:bg-neutral-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Verificar invoice
        </button>
      ) : (
        <div className="bg-neutral-800 rounded-xl p-4 mb-4">
          <p className="text-neutral-400 text-xs mb-2">Detalles del pago</p>
          <p className="text-white font-bold text-xl mb-1">{parsed.amount.toLocaleString()} sats</p>
          {parsed.description && <p className="text-neutral-400 text-sm mb-3">{parsed.description}</p>}
          <button
            onClick={handlePay}
            className="w-full bg-yellow-400 text-neutral-900 font-bold py-3 rounded-xl hover:bg-yellow-300 transition-colors"
          >
            Confirmar pago
          </button>
        </div>
      )}
    </div>
  );
}
