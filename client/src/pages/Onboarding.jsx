import { useState } from "react";

import { useNavigate } from "react-router-dom";

import useWalletStore from "../store/useWalletStore";

export default function Onboarding() {
  const { generateWallet, seedPhrase, initSoloMode, addOnChainBalance } = useWalletStore();
  const [step, setStep] = useState("start");
  const navigate = useNavigate();

  function handleGenerate() {
    generateWallet();
    setStep("seed");
  }

  function handleSoloMode() {
    initSoloMode();
    navigate("/home");
  }

  function handleP2PMode() {
    addOnChainBalance(100_000);
    navigate("/p2p");
  }

  if (step === "start") return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black p-6 text-center">
      <div className="mb-8">
        <div className="text-5xl mb-4">⚡</div>
        <h1 className="text-2xl font-bold text-white mb-2">Lightning Wallet</h1>
        <p className="text-neutral-400 text-sm">
          Simulador educativo de Lightning Network.<br />
          Sin bitcoin real — aprende cómo funciona.
        </p>
      </div>
      <button
        onClick={handleGenerate}
        className="w-full max-w-xs bg-green-500 text-black font-bold py-3 rounded-xl text-base hover:bg-green-400 transition-colors"
      >
        Crear mi wallet
      </button>
    </div>
  );

  if (step === "mode") return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black p-6 text-center">
      <div className="text-4xl mb-4">⚡</div>
      <h2 className="text-white font-bold text-xl mb-2">Elige tu modalidad</h2>
      <p className="text-neutral-400 text-sm mb-8">
        ¿Quieres explorar solo o conectarte con alguien más?
      </p>

      <button
        onClick={handleP2PMode}
        className="w-full max-w-xs bg-green-500 text-black font-bold py-4 rounded-xl hover:bg-green-400 transition-colors mb-4 text-base"
      >
        👥 Modalidad P2P
        <span className="block text-xs font-normal mt-0.5 opacity-70">Conecta con otra persona</span>
      </button>

      <button
        onClick={handleSoloMode}
        className="w-full max-w-xs bg-neutral-800 text-white font-bold py-4 rounded-xl hover:bg-neutral-700 transition-colors text-base"
      >
        🤖 Modalidad Solo
        <span className="block text-xs font-normal mt-0.5 opacity-70">Un bot simula los pagos</span>
      </button>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-black p-6">
      <div className="mb-6 text-center">
        <div className="text-4xl mb-3">🔑</div>
        <h2 className="text-xl font-bold text-white">Tu seed phrase</h2>
        <p className="text-neutral-400 text-sm mt-1">
          Estas 12 palabras son las llaves de tu wallet. En una wallet real, deberías guardarlas offline.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-6">
        {seedPhrase.map((word, i) => (
          <div
            key={i}
            className="bg-neutral-900 rounded-lg px-3 py-2 flex items-center gap-2"
          >
            <span className="text-neutral-500 text-xs w-4">{i + 1}.</span>
            <span className="text-white text-sm font-mono">{word}</span>
          </div>
        ))}
      </div>

      <div className="bg-amber-900/30 border border-amber-600/40 rounded-xl p-4 mb-6">
        <p className="text-amber-400 text-xs">
          ⚠️ En una wallet real, nunca compartas estas palabras con nadie. Quien las tenga, controla tus fondos.
        </p>
      </div>

      <button
        onClick={() => setStep("mode")}
        className="w-full bg-green-500 text-black font-bold py-3 rounded-xl text-base hover:bg-green-400 transition-colors mt-auto"
      >
        Entendido
      </button>
    </div>
  );
}
