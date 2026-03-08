export default function LiquidityBar({ localBalance, remoteBalance, capacity }) {
  const localPct = capacity > 0 ? (localBalance / capacity) * 100 : 0;
  const remotePct = 100 - localPct;

  return (
    <div>
      <div className="flex h-3 rounded-full overflow-hidden mb-2 bg-neutral-800">
        <div
          className="bg-green-400 transition-all duration-500"
          style={{ width: `${localPct}%` }}
        />
        <div
          className="bg-blue-500 transition-all duration-500"
          style={{ width: `${remotePct}%` }}
        />
      </div>
      <div className="flex justify-between text-xs">
        <span className="text-green-400">↑ {localBalance.toLocaleString()} sats (tuyo)</span>
        <span className="text-blue-400">↓ {remoteBalance.toLocaleString()} sats (peer)</span>
      </div>
    </div>
  );
}
