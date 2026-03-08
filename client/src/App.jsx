import { Component } from "react";

import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";

import { BASE_URL } from "./lib/env";
import Channels from "./pages/Channels";
import Home from "./pages/Home";
import Landing from "./pages/Landing";
import Onboarding from "./pages/Onboarding";
import P2P from "./pages/P2P";
import Receive from "./pages/Receive";
import Send from "./pages/Send";
import Settings from "./pages/Settings";
import useWalletStore from "./store/useWalletStore";

const NAV_ITEMS = [
  { path: "/home", label: "Inicio", icon: "🏠" },
  { path: "/channels", label: "Canales", icon: "⚡" },
  { path: "/receive", label: "Recibir", icon: "↓" },
  { path: "/send", label: "Enviar", icon: "↑" },
  { path: "/settings", label: "Ajustes", icon: "⚙️" },
];

function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  if (location.pathname === "/" || location.pathname === "/onboarding") return null;

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-neutral-800 border-t border-neutral-700 flex">
      {NAV_ITEMS.map((item) => {
        const active = location.pathname === item.path;
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex-1 flex flex-col items-center py-2 text-xs transition-colors ${
              active ? "text-yellow-400" : "text-neutral-500 hover:text-neutral-300"
            }`}
          >
            <span className="text-lg leading-none mb-0.5">{item.icon}</span>
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error: error.message || String(error) };
  }
  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center p-6 text-center">
          <p className="text-red-400 font-bold mb-2">Error</p>
          <p className="text-neutral-400 text-sm font-mono break-all">{this.state.error}</p>
          <button
            className="mt-6 bg-yellow-400 text-neutral-900 font-bold py-2 px-6 rounded-xl"
            onClick={() => { this.setState({ error: null }); window.location.href = "/home"; }}
          >
            Reintentar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function ProtectedRoute({ children }) {
  const isInitialized = useWalletStore((s) => s.isInitialized);
  return isInitialized ? children : <Navigate to="/onboarding" replace />;
}

function WalletShell({ children }) {
  return (
    <div className="max-w-md mx-auto min-h-screen bg-neutral-900 relative">
      {children}
      <BottomNav />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter basename={BASE_URL}>
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/onboarding" element={<WalletShell><Onboarding /></WalletShell>} />
          <Route path="/home" element={<WalletShell><ProtectedRoute><Home /></ProtectedRoute></WalletShell>} />
          <Route path="/receive" element={<WalletShell><ProtectedRoute><Receive /></ProtectedRoute></WalletShell>} />
          <Route path="/send" element={<WalletShell><ProtectedRoute><Send /></ProtectedRoute></WalletShell>} />
          <Route path="/channels" element={<WalletShell><ProtectedRoute><Channels /></ProtectedRoute></WalletShell>} />
          <Route path="/p2p" element={<WalletShell><ProtectedRoute><P2P /></ProtectedRoute></WalletShell>} />
          <Route path="/settings" element={<WalletShell><ProtectedRoute><Settings /></ProtectedRoute></WalletShell>} />
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
