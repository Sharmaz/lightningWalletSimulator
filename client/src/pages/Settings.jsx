import { useState } from "react";

import useWalletStore from "../store/useWalletStore";

export default function Settings() {
  const { seedPhrase, nodeId } = useWalletStore();
  const [seedVisible, setSeedVisible] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-neutral-900 p-6 pb-24">
      <h2 className="text-white font-bold text-lg mb-6">Ajustes</h2>

      <div className="space-y-4">
        {/* Node ID */}
        <div className="bg-neutral-800 rounded-xl p-4">
          <p className="text-neutral-400 text-xs mb-1">Node ID</p>
          <p className="text-white text-sm font-mono break-all">{nodeId}</p>
        </div>

        {/* Seed Phrase */}
        <div className="bg-neutral-800 rounded-xl p-4">
          <div className="flex justify-between items-center mb-3">
            <p className="text-neutral-400 text-xs">Seed Phrase</p>
            <button
              onClick={() => setSeedVisible((v) => !v)}
              className="text-yellow-400 text-xs font-semibold"
            >
              {seedVisible ? "Ocultar" : "Mostrar"}
            </button>
          </div>
          {seedVisible ? (
            <div className="grid grid-cols-3 gap-2">
              {seedPhrase.map((word, i) => (
                <div key={i} className="bg-neutral-700 rounded-lg px-2 py-1.5 flex items-center gap-1">
                  <span className="text-neutral-500 text-xs">{i + 1}.</span>
                  <span className="text-white text-xs font-mono">{word}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {seedPhrase.map((_, i) => (
                <div key={i} className="bg-neutral-700 rounded-lg px-2 py-1.5 h-8 flex items-center">
                  <div className="h-2 bg-neutral-600 rounded w-full" />
                </div>
              ))}
            </div>
          )}
          <p className="text-yellow-600 text-xs mt-3">
            ⚠️ En una wallet real, nunca compartas estas palabras.
          </p>
        </div>

        {/* Info */}
        <div className="bg-neutral-800 rounded-xl p-4">
          <p className="text-neutral-400 text-xs mb-1">Sobre este simulador</p>
          <p className="text-neutral-500 text-xs leading-relaxed">
            Lightning Wallet Simulator es una herramienta educativa. No usa bitcoin real ni se conecta a la red Lightning real. Todos los sats son simulados.
          </p>
        </div>
      </div>
    </div>
  );
}
