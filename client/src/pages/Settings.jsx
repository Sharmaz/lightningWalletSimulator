import { useState } from "react";

import { useNavigate } from "react-router-dom";

import useWalletStore from "../store/useWalletStore";

export default function Settings() {
  const { seedPhrase, nodeId } = useWalletStore();
  const navigate = useNavigate();
  const [seedVisible, setSeedVisible] = useState(false);

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
        <h2 className="text-white font-bold text-base flex-1 text-center">Configuración</h2>
        <div className="w-16" />
      </div>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center text-green-400 font-bold text-lg shrink-0">
          {nodeId ? nodeId.slice(0, 2).toUpperCase() : "W"}
        </div>
        <div className="min-w-0">
          <p className="text-white font-semibold">Wallet</p>
          <p className="text-neutral-500 text-xs font-mono truncate">{nodeId}</p>
        </div>
      </div>

      <p className="text-green-400 text-xs uppercase tracking-widest font-semibold mb-2">General</p>
      <div className="bg-neutral-900 rounded-xl mb-6 overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3.5">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <div className="flex-1">
            <p className="text-white text-sm">Información</p>
            <p className="text-neutral-500 text-xs">Lightning Wallet Simulator — educativo</p>
          </div>
        </div>
        <div className="border-t border-black" />
        <div className="flex items-center gap-3 px-4 py-3.5">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm">Node ID</p>
            <p className="text-neutral-500 text-xs font-mono truncate">{nodeId}</p>
          </div>
        </div>
      </div>

      <p className="text-green-400 text-xs uppercase tracking-widest font-semibold mb-2">Privacidad y Seguridad</p>
      <div className="bg-neutral-900 rounded-xl overflow-hidden">
        <div className="px-4 py-3.5">
          <div className="flex items-center gap-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            </svg>
            <p className="text-white text-sm flex-1">Frase de recuperación</p>
            <button
              onClick={() => setSeedVisible((v) => !v)}
              className="text-green-400 text-xs font-semibold"
            >
              {seedVisible ? "Ocultar" : "Mostrar"}
            </button>
          </div>

          {seedVisible ? (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {seedPhrase.map((word, i) => (
                <div key={i} className="bg-neutral-800 rounded-lg px-2 py-1.5 flex items-center gap-1">
                  <span className="text-neutral-600 text-xs">{i + 1}.</span>
                  <span className="text-white text-xs font-mono">{word}</span>
                </div>
              ))}
              <p className="col-span-3 text-amber-500 text-xs mt-2">
                ⚠️ En una wallet real, nunca compartas estas palabras.
              </p>
            </div>
          ) : (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {seedPhrase.map((_, i) => (
                <div key={i} className="bg-neutral-800 rounded-lg px-2 py-1.5 h-8 flex items-center">
                  <div className="h-2 bg-neutral-700 rounded w-full" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
