import { useState } from "react";

import { useNavigate } from "react-router-dom";

import useWalletStore from "../store/useWalletStore";

export default function Home() {
  const { lightningBalance, channels, transactions, soloMode, botInvoice } = useWalletStore();
  const navigate = useNavigate();
  const [balanceVisible, setBalanceVisible] = useState(false);

  const totalCapacity = channels.reduce(
    (sum, c) => (c.status === "open" ? sum + c.capacity : sum),
    0,
  );
  const liquidityPct = totalCapacity > 0
    ? Math.min((lightningBalance / totalCapacity) * 100, 100)
    : 0;

  return (
    <div className="flex flex-col min-h-screen bg-black pb-20">

      <div className="flex justify-between items-center px-4 pt-12 pb-2">
        <div className="flex gap-2">
          <button
            onClick={() => navigate("/settings")}
            className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
            </svg>
          </button>
          <button
            onClick={() => navigate("/channels")}
            className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate("/p2p")}
            className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex flex-col items-center py-10">
        <button onClick={() => setBalanceVisible((v) => !v)} className="mb-4">
          {balanceVisible ? (
            <div className="text-center">
              <span className="text-4xl font-bold text-white">
                {Number(lightningBalance).toLocaleString()}
              </span>
              <span className="text-neutral-400 text-lg ml-2">sat</span>
            </div>
          ) : (
            <div className="flex gap-3 items-center py-2">
              <span className="w-3 h-3 rounded-full bg-neutral-600" />
              <span className="w-3 h-3 rounded-full bg-neutral-600" />
              <span className="w-3 h-3 rounded-full bg-neutral-600" />
            </div>
          )}
        </button>

        {totalCapacity > 0 ? (
          <div className="w-32 h-1.5 rounded-full bg-neutral-800">
            <div
              className="h-1.5 rounded-full bg-green-400 transition-all duration-500"
              style={{ width: `${liquidityPct}%` }}
            />
          </div>
        ) : (
          <button
            onClick={() => navigate("/channels")}
            className="bg-neutral-900 text-neutral-400 text-xs px-4 py-1.5 rounded-full hover:bg-neutral-800 transition-colors"
          >
            añade liquidez
          </button>
        )}
      </div>

      {soloMode && botInvoice && (
        <div className="px-4 mb-2">
          <div className="bg-neutral-900 border border-green-600/30 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-white font-bold">{botInvoice.amount.toLocaleString()} sats</p>
              <p className="text-neutral-400 text-sm">{botInvoice.description}</p>
            </div>
            <button
              onClick={() => navigate("/send", { state: { bolt11: botInvoice.bolt11 } })}
              className="bg-green-500 text-black font-bold px-4 py-2 rounded-xl hover:bg-green-400 transition-colors text-sm ml-3 shrink-0"
            >
              Pagar
            </button>
          </div>
        </div>
      )}

      <div className="px-4 mt-2 flex-1">
        {transactions.length === 0 ? (
          <p className="text-neutral-700 text-sm text-center py-12">Sin transacciones aún</p>
        ) : (
          <>
            {transactions.slice(0, 20).map((tx) => (
              <div key={tx.id} className="flex items-center gap-3 py-4 border-b border-neutral-900">
                <div className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm truncate">{tx.description}</p>
                  <p className="text-neutral-500 text-xs">
                    {new Date(tx.timestamp).toLocaleDateString([], { day: "numeric", month: "long" })},{" "}
                    {new Date(tx.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <span className="text-neutral-600 text-sm font-mono">***</span>
              </div>
            ))}
            {transactions.length > 20 && (
              <p className="text-neutral-600 text-xs text-center py-4">
                {transactions.length} transacciones en total
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
