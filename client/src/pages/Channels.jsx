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
  const { channels, onChainBalance } = useWalletStore();
  const openChannels = channels.filter((c) => c.status !== "closed");

  return (
    <div className="flex flex-col min-h-screen bg-neutral-900 p-6 pb-24">
      <h2 className="text-white font-bold text-lg mb-1">Canales</h2>
      <p className="text-neutral-400 text-sm mb-6">
        On-chain disponible: <span className="text-white">{onChainBalance.toLocaleString()} sats</span>
      </p>

      {openChannels.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">⚡</div>
          <p className="text-neutral-500 text-sm">Sin canales abiertos</p>
          <p className="text-neutral-600 text-xs mt-1">Conéctate en modo P2P para abrir un canal</p>
        </div>
      ) : (
        <div className="space-y-4">
          {openChannels.map((ch) => {
            const localPct = ch.capacity > 0 ? (ch.localBalance / ch.capacity) * 100 : 0;
            const remotePct = 100 - localPct;
            return (
              <div key={ch.id} className="bg-neutral-800 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-neutral-400 text-xs font-mono truncate max-w-[60%]">
                    {ch.peerNodeId}
                  </span>
                  <span className={`text-xs font-semibold ${statusColor(ch.status)}`}>
                    {statusLabel(ch.status)}
                  </span>
                </div>

                {/* Barra de liquidez */}
                <div className="flex h-3 rounded-full overflow-hidden mb-2 bg-neutral-700">
                  <div
                    className="bg-yellow-400 transition-all duration-500"
                    style={{ width: `${localPct}%` }}
                  />
                  <div
                    className="bg-blue-500 transition-all duration-500"
                    style={{ width: `${remotePct}%` }}
                  />
                </div>

                <div className="flex justify-between text-xs">
                  <span className="text-yellow-400">
                    ↑ {ch.localBalance.toLocaleString()} sats (tuyo)
                  </span>
                  <span className="text-blue-400">
                    ↓ {ch.remoteBalance.toLocaleString()} sats (peer)
                  </span>
                </div>
                <p className="text-neutral-600 text-xs mt-1 text-center">
                  Capacidad total: {ch.capacity.toLocaleString()} sats
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
