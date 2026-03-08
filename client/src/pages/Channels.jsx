import { useEffect } from "react";

import { useNavigate } from "react-router-dom";

import LiquidityBar from "../components/LiquidityBar";
import PageHeader from "../components/PageHeader";
import useTour from "../hooks/useTour";
import { createChannelsTour, createLiquidityTour } from "../lib/tours";
import useWalletStore from "../store/useWalletStore";

function statusLabel(status) {
  const map = { opening: "Abriendo...", open: "Abierto", closing: "Cerrando...", closed: "Cerrado" };
  return map[status] || status;
}

function statusColor(status) {
  if (status === "open") return "text-green-400";
  if (status === "opening" || status === "closing") return "text-yellow-400";
  return "text-neutral-500";
}

export default function Channels() {
  const { channels, onChainBalance, p2pMode } = useWalletStore();
  const navigate = useNavigate();
  const openChannels = channels.filter((c) => c.status !== "closed");
  const { hasSeenTour: hasSeenChannels, startTour: startChannelsTour } = useTour("channels");
  const { hasSeenTour: hasSeenLiquidity, startTour: startLiquidityTour } = useTour("liquidity");

  useEffect(() => {
    if (!hasSeenChannels()) {
      setTimeout(() => startChannelsTour(createChannelsTour), 400);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const tourBtn = (
    <button
      onClick={() => (openChannels.length > 0
        ? startLiquidityTour(createLiquidityTour)
        : startChannelsTour(createChannelsTour))}
      className="w-7 h-7 rounded-full bg-neutral-800 text-neutral-400 text-xs font-bold hover:bg-neutral-700 hover:text-white transition-colors"
      aria-label="Ver tour explicativo"
    >
      ?
    </button>
  );

  return (
    <div className="flex flex-col min-h-screen bg-black p-6 pb-24">
      <PageHeader title="Canales" right={tourBtn} />

      <p className="text-neutral-500 text-sm mb-6">
        On-chain disponible: <span className="text-white">{onChainBalance.toLocaleString()} sats</span>
      </p>

      <button
        id="tour-channels-open-btn"
        onClick={() => navigate("/p2p")}
        className={`w-full font-bold py-3 rounded-xl mb-6 transition-colors ${
          p2pMode
            ? "bg-green-900/40 text-green-400 border border-green-600/40"
            : "bg-neutral-800 text-white hover:bg-neutral-700"
        }`}
      >
        {p2pMode ? "⚡ P2P activo" : "Conectar en modo P2P"}
      </button>

      {openChannels.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">⚡</div>
          <p className="text-neutral-500 text-sm">Sin canales abiertos</p>
          <p className="text-neutral-600 text-xs mt-1">Conéctate en modo P2P para abrir un canal</p>
        </div>
      ) : (
        <div className="space-y-4">
          {openChannels.map((ch, idx) => (
            <div key={ch.id} className="bg-neutral-900 rounded-xl p-4">
              <div className="flex justify-between items-center mb-3">
                <span className="text-neutral-500 text-xs font-mono truncate max-w-[60%]">
                  {ch.peerNodeId}
                </span>
                <span className={`text-xs font-semibold ${statusColor(ch.status)}`}>
                  {statusLabel(ch.status)}
                </span>
              </div>

              <div id={idx === 0 ? "tour-liquidity-bar" : undefined}>
                <LiquidityBar
                  localBalance={ch.localBalance}
                  remoteBalance={ch.remoteBalance}
                  capacity={ch.capacity}
                />
              </div>
              <p className="text-neutral-700 text-xs mt-1 text-center">
                Capacidad total: {ch.capacity.toLocaleString()} sats
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
