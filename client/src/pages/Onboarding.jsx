import { useState } from "react";

import { useNavigate } from "react-router-dom";

import useWalletStore from "../store/useWalletStore";

export default function Onboarding() {
  const { generateWallet, seedPhrase, addOnChainBalance } = useWalletStore();
  const [step, setStep] = useState("start"); // 'start' | 'seed' | 'confirm'
  const navigate = useNavigate();

  function handleGenerate() {
    generateWallet();
    setStep("seed");
  }

  function handleContinue() {
    // Faucet inicial: 200,000 sats simulados
    addOnChainBalance(200_000);
    navigate("/home");
  }

  if (step === "start") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-900 p-6 text-center">
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
          className="w-full max-w-xs bg-yellow-400 text-neutral-900 font-bold py-3 rounded-xl text-base hover:bg-yellow-300 transition-colors"
        >
          Crear mi wallet
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-neutral-900 p-6">
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
            className="bg-neutral-800 rounded-lg px-3 py-2 flex items-center gap-2"
          >
            <span className="text-neutral-500 text-xs w-4">{i + 1}.</span>
            <span className="text-white text-sm font-mono">{word}</span>
          </div>
        ))}
      </div>

      <div className="bg-yellow-900/30 border border-yellow-600/40 rounded-xl p-4 mb-6">
        <p className="text-yellow-400 text-xs">
          ⚠️ En una wallet real, nunca compartas estas palabras con nadie. Quien las tenga, controla tus fondos.
        </p>
      </div>

      <button
        onClick={handleContinue}
        className="w-full bg-yellow-400 text-neutral-900 font-bold py-3 rounded-xl text-base hover:bg-yellow-300 transition-colors mt-auto"
      >
        Entendido, ir a mi wallet
      </button>
    </div>
  );
}
