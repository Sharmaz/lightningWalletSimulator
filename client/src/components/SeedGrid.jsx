export default function SeedGrid({ words, visible = true }) {
  if (!visible) {
    return (
      <div className="grid grid-cols-3 gap-2">
        {words.map((_, i) => (
          <div key={i} className="bg-neutral-800 rounded-lg px-2 py-1.5 h-8 flex items-center">
            <div className="h-2 bg-neutral-700 rounded w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {words.map((word, i) => (
        <div key={i} className="bg-neutral-800 rounded-lg px-2 py-1.5 flex items-center gap-1">
          <span className="text-neutral-500 text-xs">{i + 1}.</span>
          <span className="text-white text-xs font-mono">{word}</span>
        </div>
      ))}
    </div>
  );
}
