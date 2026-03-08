import { useState, useEffect, useRef } from "react";

import { QRCodeSVG } from "qrcode.react";
import { useNavigate } from "react-router-dom";

import AlertBox from "../components/AlertBox";
import FormField from "../components/FormField";
import LiquidityBar from "../components/LiquidityBar";
import PageHeader from "../components/PageHeader";
import useTour from "../hooks/useTour";
import socket from "../lib/socket";
import { createP2PTour, createP2PChannelTour, createP2PReadyTour } from "../lib/tours";
import useWalletStore from "../store/useWalletStore";

export default function P2P() {
  const navigate = useNavigate();
  const {
    roomCode, peerId, peerNodeId, channels,
    onChainBalance, createRoom, joinRoom, openChannelP2P, leaveP2P,
  } = useWalletStore();

  const [localStep, setLocalStep] = useState("idle");
  const [codeInput, setCodeInput] = useState("");
  const [capacity, setCapacity] = useState("");
  const [openingChannel, setOpeningChannel] = useState(false);
  const [joinError, setJoinError] = useState("");
  const [peerDisconnectedMsg, setPeerDisconnectedMsg] = useState("");
  const prevPeerIdRef = useRef(peerId);
  const { hasSeenTour, startTour } = useTour("p2p");
  const { hasSeenTour: hasSeenP2PChannel, startTour: startP2PChannelTour } = useTour("p2pChannel");
  const { hasSeenTour: hasSeenP2PReady, startTour: startP2PReadyTour } = useTour("p2pReady");

  useEffect(() => {
    if (!hasSeenTour()) setTimeout(() => startTour(createP2PTour), 400);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const p2pChannel = channels.find(
    (c) => c.peerNodeId === peerNodeId && c.status === "open",
  );

  useEffect(() => {
    const prev = prevPeerIdRef.current;
    prevPeerIdRef.current = peerId;
    if (prev && !peerId && !p2pChannel) {
      setPeerDisconnectedMsg("El peer se desconectó. Puedes esperar a que vuelva o crear una nueva room.");
    }
  }, [peerId, p2pChannel]);

  let step;
  if (p2pChannel) step = "ready";
  else if (peerId) step = "connected";
  else if (roomCode) step = "waiting";
  else step = localStep;

  useEffect(() => {
    if (step === "connected" && !hasSeenP2PChannel()) {
      setTimeout(() => startP2PChannelTour(createP2PChannelTour), 400);
    } else if (step === "ready" && !hasSeenP2PReady()) {
      const isOpener = p2pChannel?.localBalance > 0;
      setTimeout(() => startP2PReadyTour(() => createP2PReadyTour(isOpener)), 400);
    }
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleCreateRoom() {
    createRoom();
    setLocalStep("waiting");
  }

  function handleJoinRoom() {
    if (!codeInput.trim()) return;
    setJoinError("");

    socket.once("room_error", ({ reason }) => {
      setJoinError(reason);
      setLocalStep("joining");
    });

    joinRoom(codeInput.trim().toUpperCase());
    setLocalStep("waiting");
  }

  function handleOpenChannel() {
    const cap = Number(capacity);
    if (!cap || cap <= 0 || cap > onChainBalance) return;
    setOpeningChannel(true);
    openChannelP2P(cap);
  }

  function handleLeave() {
    leaveP2P();
    setLocalStep("idle");
    setCodeInput("");
    setCapacity("");
    setOpeningChannel(false);
    setJoinError("");
  }

  if (step === "ready") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black p-6 pb-24 text-center">
        <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mb-4">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
        </div>
        <h2 className="text-white font-bold text-xl mb-1">Canal abierto</h2>
        <p className="text-neutral-400 text-sm mb-6">
          Conectado con <span className="text-green-400 font-mono">{peerNodeId}</span>
        </p>

        <div id="tour-p2p-liquidity" className="w-full bg-neutral-900 rounded-xl p-4 mb-6 text-left">
          <LiquidityBar
            localBalance={p2pChannel.localBalance}
            remoteBalance={p2pChannel.remoteBalance}
            capacity={p2pChannel.capacity}
          />
        </div>

        <button
          id="tour-p2p-home-btn"
          onClick={() => navigate("/home")}
          className="w-full bg-green-500 text-black font-bold py-3 rounded-xl hover:bg-green-400 transition-colors mb-3"
        >
          Ir al inicio
        </button>
        <button onClick={handleLeave} className="text-neutral-500 text-sm py-2">
          Salir del modo P2P
        </button>
      </div>
    );
  }

  if (step === "connected") {
    return (
      <div className="flex flex-col min-h-screen bg-black p-6 pb-24">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <p className="text-green-400 text-sm font-semibold">Peer conectado</p>
        </div>
        <p className="text-neutral-500 text-xs font-mono mb-8 break-all">{peerNodeId}</p>

        <h2 className="text-white font-bold text-lg mb-1">Abrir canal Lightning</h2>
        <p className="text-neutral-400 text-sm mb-6">
          Define cuántos sats quieres poner en el canal. Serán tu liquidez de salida.
        </p>

        <FormField
          id="tour-p2p-capacity"
          label={`Capacidad (sats) — disponible: ${onChainBalance.toLocaleString()}`}
          type="text"
          inputMode="numeric"
          value={capacity}
          onChange={(e) => setCapacity(e.target.value.replace(/\D/g, ""))}
          placeholder="Ej. 50000"
          max={onChainBalance}
          className="mb-6"
          inputClassName=""
        />

        <button
          id="tour-p2p-open-btn"
          onClick={handleOpenChannel}
          disabled={openingChannel || !capacity || Number(capacity) <= 0 || Number(capacity) > onChainBalance}
          className="w-full bg-green-500 text-black font-bold py-3 rounded-xl hover:bg-green-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed mb-3"
        >
          {openingChannel ? "Abriendo canal..." : "Abrir canal"}
        </button>
        <button onClick={handleLeave} className="text-neutral-500 text-sm py-2">
          Cancelar
        </button>
      </div>
    );
  }

  if (step === "waiting") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black p-6 pb-24 text-center">
        {roomCode ? (
          <>
            <h2 className="text-white font-bold text-xl mb-2">Esperando al peer...</h2>
            <p className="text-neutral-400 text-sm mb-6">
              Comparte este código con la otra persona
            </p>
            <div className="bg-white p-4 rounded-2xl mb-6">
              <QRCodeSVG value={roomCode} size={180} />
            </div>
            <div className="bg-neutral-900 rounded-xl px-8 py-4 mb-6">
              <p className="text-green-400 font-mono font-bold text-4xl tracking-widest">{roomCode}</p>
            </div>
          </>
        ) : (
          <>
            <div className="text-4xl mb-4">⏳</div>
            <h2 className="text-white font-bold text-xl mb-2">Conectando...</h2>
            <p className="text-neutral-400 text-sm">Uniéndose a la room</p>
          </>
        )}
        {peerDisconnectedMsg && (
          <AlertBox variant="error" className="mt-4">{peerDisconnectedMsg}</AlertBox>
        )}
        <button onClick={handleLeave} className="text-neutral-500 text-sm py-2 mt-4">
          Cancelar
        </button>
      </div>
    );
  }

  if (step === "joining") {
    return (
      <div className="flex flex-col min-h-screen bg-black p-6 pb-24">
        <button
          onClick={() => setLocalStep("idle")}
          className="text-green-400 text-sm mb-6 text-left flex items-center gap-1"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Volver
        </button>
        <h2 className="text-white font-bold text-lg mb-1">Unirse a una room</h2>
        <p className="text-neutral-400 text-sm mb-6">
          Ingresa el código de 6 caracteres que te compartió el otro usuario
        </p>

        <label className="text-neutral-500 text-xs mb-1">Código de room</label>
        <input
          type="text"
          value={codeInput}
          onChange={(e) => { setCodeInput(e.target.value.toUpperCase()); setJoinError(""); }}
          placeholder="Ej. AB12CD"
          maxLength={6}
          className="bg-neutral-900 text-white rounded-xl px-4 py-3 mb-4 outline-none focus:ring-2 focus:ring-green-400 text-base font-mono tracking-widest text-center uppercase"
        />

        {joinError && <AlertBox variant="error" className="mb-4">{joinError}</AlertBox>}

        <button
          onClick={handleJoinRoom}
          disabled={codeInput.trim().length !== 6}
          className="w-full bg-green-500 text-black font-bold py-3 rounded-xl hover:bg-green-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Unirme
        </button>
      </div>
    );
  }

  const tourBtn = (
    <button
      onClick={() => startTour(createP2PTour)}
      className="w-7 h-7 rounded-full bg-neutral-800 text-neutral-400 text-xs font-bold hover:bg-neutral-700 hover:text-white transition-colors"
      aria-label="Ver tour explicativo"
    >
      ?
    </button>
  );

  return (
    <div className="flex flex-col min-h-screen bg-black p-6 pb-24">
      <PageHeader title="Modo P2P" right={tourBtn} />

      <p className="text-neutral-400 text-sm mb-8">
        Conecta con otra persona para abrir un canal Lightning real y hacerse pagos mutuos.
      </p>

      <button
        id="tour-p2p-create"
        onClick={handleCreateRoom}
        className="w-full bg-green-500 text-black font-bold py-4 rounded-xl hover:bg-green-400 transition-colors mb-4 text-base"
      >
        ⚡ Crear room
      </button>

      <button
        id="tour-p2p-join"
        onClick={() => setLocalStep("joining")}
        className="w-full bg-neutral-800 text-white font-bold py-4 rounded-xl hover:bg-neutral-700 transition-colors text-base"
      >
        🔗 Unirme con código
      </button>
    </div>
  );
}
