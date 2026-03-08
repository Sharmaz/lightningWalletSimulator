import { useNavigate } from "react-router-dom";

export default function PageHeader({ title, backTo = "/home", right = null }) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center mb-6">
      <button
        onClick={() => navigate(backTo)}
        className="w-16 text-green-400 text-sm font-semibold flex items-center gap-1 shrink-0"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Inicio
      </button>
      <h2 className="text-white font-bold text-base flex-1 text-center">{title}</h2>
      <div className="w-16 flex justify-end shrink-0">{right}</div>
    </div>
  );
}
