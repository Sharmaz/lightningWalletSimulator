import { useNavigate } from "react-router-dom";

const LEARN_ITEMS = [
  { icon: "🔑", title: "Seed Phrase", desc: "Cómo 12 palabras protegen todos tus fondos" },
  { icon: "⚡", title: "Canales de Pago", desc: "Qué es un canal y cómo fluye la liquidez" },
  { icon: "🧾", title: "Invoices", desc: "Cómo funciona una factura Lightning" },
  { icon: "💸", title: "Pagos Instantáneos", desc: "Por qué Lightning es más rápido que on-chain" },
];

const HOW_STEPS = [
  { step: "1", title: "Crea tu wallet", desc: "Genera tu seed phrase y obtén tu nodo simulado" },
  { step: "2", title: "Abre un canal", desc: "Conecta con el bot o con otra persona y deposita sats" },
  { step: "3", title: "Envía y recibe", desc: "Genera invoices con QR y paga en segundos" },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-lg">
          <span>⚡</span>
          <span>Lightning Sim</span>
        </div>
        <button
          onClick={() => navigate("/onboarding")}
          className="bg-green-500 text-black font-bold px-5 py-2 rounded-xl text-sm hover:bg-green-400 transition-colors"
        >
          Probar ahora
        </button>
      </header>

      <section className="max-w-5xl mx-auto px-6 pt-12 pb-20 text-center">
        <div className="text-7xl mb-8">⚡</div>
        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
          Aprende Lightning Network<br className="hidden md:block" /> sin riesgo
        </h1>
        <p className="text-neutral-400 text-base md:text-lg mb-10 max-w-xl mx-auto leading-relaxed">
          Simulador educativo de Lightning Wallet. Sin bitcoin real — experimenta cómo funcionan los canales de pago, invoices y pagos instantáneos.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate("/onboarding")}
            className="bg-green-500 text-black font-bold py-4 px-8 rounded-xl text-base hover:bg-green-400 transition-colors"
          >
            Probar el simulador
          </button>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-20">
        <h2 className="text-neutral-400 text-xs uppercase tracking-wider text-center mb-6">Elige cómo explorar</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
          <button
            onClick={() => navigate("/onboarding")}
            className="bg-neutral-900 rounded-xl p-6 text-left hover:bg-neutral-800 transition-colors border border-neutral-800"
          >
            <div className="text-3xl mb-3">👥</div>
            <p className="font-bold text-base mb-1">Modalidad P2P</p>
            <p className="text-neutral-400 text-sm">Conecta con otra persona en tiempo real y haz pagos de verdad.</p>
          </button>
          <button
            onClick={() => navigate("/onboarding")}
            className="bg-neutral-900 rounded-xl p-6 text-left hover:bg-neutral-800 transition-colors border border-neutral-800"
          >
            <div className="text-3xl mb-3">🤖</div>
            <p className="font-bold text-base mb-1">Modalidad Solo</p>
            <p className="text-neutral-400 text-sm">Un bot simula los pagos contigo. Perfecto para explorar a tu propio ritmo.</p>
          </button>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-20">
        <h2 className="text-white font-bold text-2xl mb-8 text-center">¿Qué vas a aprender?</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {LEARN_ITEMS.map((item) => (
            <div key={item.title} className="bg-neutral-900 rounded-xl p-5">
              <div className="text-3xl mb-3">{item.icon}</div>
              <p className="font-bold text-sm mb-2">{item.title}</p>
              <p className="text-neutral-400 text-xs leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-20">
        <h2 className="text-white font-bold text-2xl mb-8 text-center">¿Cómo funciona?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {HOW_STEPS.map((s) => (
            <div key={s.step} className="flex md:flex-col items-start gap-4 bg-neutral-900 rounded-xl p-6">
              <div className="w-10 h-10 rounded-full bg-green-500 text-black font-bold flex items-center justify-center text-base shrink-0">
                {s.step}
              </div>
              <div>
                <p className="font-bold text-base mb-1">{s.title}</p>
                <p className="text-neutral-400 text-sm">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-8 text-center">
        <h2 className="text-white font-bold text-2xl mb-3">¿Listo para empezar?</h2>
        <p className="text-neutral-400 text-sm mb-8">Gratis, sin registro, sin bitcoin real.</p>
        <button
          onClick={() => navigate("/onboarding")}
          className="bg-green-500 text-black font-bold py-4 px-10 rounded-xl text-base hover:bg-green-400 transition-colors"
        >
          Empezar ahora
        </button>
      </section>

      <footer className="max-w-5xl mx-auto px-6 py-10 text-center border-t border-neutral-800 mt-8">
        <p className="text-neutral-600 text-xs">
          Simulador educativo · Sin bitcoin real · Open source
        </p>
      </footer>
    </div>
  );
}
