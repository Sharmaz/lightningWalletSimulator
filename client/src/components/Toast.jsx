import { useEffect, useState } from "react";

export default function Toast({ message, onDone }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDone, 300);
    }, 3000);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div
      className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white font-bold px-5 py-3 rounded-2xl shadow-lg text-sm transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
      }`}
    >
      {message}
    </div>
  );
}
