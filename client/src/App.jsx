import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";

import Channels from "./pages/Channels";
import Home from "./pages/Home";
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

function ProtectedRoute({ children }) {
  const isInitialized = useWalletStore((s) => s.isInitialized);
  return isInitialized ? children : <Navigate to="/onboarding" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="max-w-md mx-auto min-h-screen bg-neutral-900 relative">
        <Routes>
          <Route path="/" element={<Navigate to="/onboarding" replace />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/receive" element={<ProtectedRoute><Receive /></ProtectedRoute>} />
          <Route path="/send" element={<ProtectedRoute><Send /></ProtectedRoute>} />
          <Route path="/channels" element={<ProtectedRoute><Channels /></ProtectedRoute>} />
          <Route path="/p2p" element={<ProtectedRoute><P2P /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        </Routes>
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}
