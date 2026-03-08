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

function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  if (["/", "/onboarding", "/send"].includes(location.pathname)) return null;

  const active = (path) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-10 bg-black border-t border-neutral-800">
      <div className="max-w-md mx-auto flex">
        <button
          onClick={() => navigate("/receive")}
          className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-colors ${
            active("/receive") ? "text-green-400" : "text-neutral-500 hover:text-white"
          }`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 3v12M7 12l5 5 5-5M5 20h14" />
          </svg>
          Recibir
        </button>
        <div className="w-px bg-neutral-800 my-3" />
        <button
          onClick={() => navigate("/send")}
          className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-colors ${
            active("/send") ? "text-green-400" : "text-neutral-500 hover:text-white"
          }`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" />
          </svg>
          Enviar
        </button>
      </div>
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
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
          <p className="text-red-400 font-bold mb-2">Error</p>
          <p className="text-neutral-400 text-sm font-mono break-all">{this.state.error}</p>
          <button
            className="mt-6 bg-green-500 text-black font-bold py-2 px-6 rounded-xl"
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
    <div className="max-w-md mx-auto min-h-screen bg-black relative">
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
