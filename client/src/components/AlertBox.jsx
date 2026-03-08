const VARIANTS = {
  warning: {
    wrapper: "bg-amber-900/30 border border-amber-600/40",
    text: "text-amber-400",
  },
  error: {
    wrapper: "bg-red-900/40 border border-red-600/40",
    text: "text-red-300",
  },
  info: {
    wrapper: "bg-neutral-900 border border-neutral-700",
    text: "text-neutral-400",
  },
};

export default function AlertBox({ children, variant = "warning", className = "" }) {
  const { wrapper, text } = VARIANTS[variant] ?? VARIANTS.warning;
  return (
    <div className={`${wrapper} rounded-xl px-4 py-3 ${className}`}>
      <p className={`${text} text-xs`}>{children}</p>
    </div>
  );
}
