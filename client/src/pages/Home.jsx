import { useNavigate } from "react-router-dom";

import useWalletStore from "../store/useWalletStore";

function formatSats(sats) {
  return `${sats.toLocaleString("es-MX")} sats`;
}

function txIcon(type) {
  if (type === "send") return "↑";
  if (type === "receive") return "↓";
  if (type === "channel_open") return "⚡";
  if (type === "channel_close") return "✕";
  return "•";
}

export default function Home() {
  const { lightningBalance, onChainBalance, transactions, soloMode, botInvoice } = useWalletStore();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-neutral-900 pb-20">
      {/* Balance */}
      <div className="bg-neutral-800 px-6 pt-12 pb-8 text-center">
        <p className="text-neutral-400 text-xs mb-1">Balance Lightning</p>
        <h1 className="text-4xl font-bold text-white mb-1">{formatSats(lightningBalance)}</h1>
        <p className="text-neutral-500 text-xs">On-chain: {formatSats(onChainBalance)}</p>
      </div>

      {/* Botones principales */}
      <div className="flex gap-4 px-6 mt-6">
        <button
          onClick={() => navigate("/receive")}
          className="flex-1 bg-yellow-400 text-neutral-900 font-bold py-3 rounded-xl hover:bg-yellow-300 transition-colors"
        >
          Recibir
        </button>
        <button
          onClick={() => navigate("/send")}
          className="flex-1 bg-neutral-700 text-white font-bold py-3 rounded-xl hover:bg-neutral-600 transition-colors"
        >
          Enviar
        </button>
      </div>

      {soloMode && botInvoice && (
        <div className="px-6 mt-6">
          <h2 className="text-neutral-400 text-xs uppercase tracking-wider mb-3">Bot solicita pago</h2>
          <div className="bg-neutral-800 border border-yellow-600/30 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-white font-bold">{botInvoice.amount.toLocaleString()} sats</p>
              <p className="text-neutral-400 text-sm">{botInvoice.description}</p>
            </div>
            <button
              onClick={() => navigate("/send", { state: { bolt11: botInvoice.bolt11 } })}
              className="bg-yellow-400 text-neutral-900 font-bold px-4 py-2 rounded-xl hover:bg-yellow-300 transition-colors text-sm ml-3 shrink-0"
            >
              Pagar
            </button>
          </div>
        </div>
      )}

      <div className="px-6 mt-8">
        <h2 className="text-neutral-400 text-xs uppercase tracking-wider mb-3">Historial</h2>
        {transactions.length === 0 ? (
          <p className="text-neutral-600 text-sm text-center py-8">Sin transacciones aún</p>
        ) : (
          <div className="space-y-2">
            {transactions.slice(0, 20).map((tx) => (
              <div key={tx.id} className="bg-neutral-800 rounded-xl px-4 py-3 flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  tx.type === "receive" ? "bg-green-900 text-green-400" :
                  tx.type === "send" ? "bg-red-900 text-red-400" :
                  "bg-yellow-900 text-yellow-400"
                }`}
                >
                  {txIcon(tx.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm truncate">{tx.description}</p>
                  <p className="text-neutral-500 text-xs">
                    {new Date(tx.timestamp).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <span className={`text-sm font-bold ${tx.type === "receive" ? "text-green-400" : "text-red-400"}`}>
                  {tx.type === "receive" ? "+" : tx.type === "send" ? "-" : ""}{formatSats(tx.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
