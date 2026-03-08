import { useState, useEffect, useRef } from "react";

import { QRCodeSVG } from "qrcode.react";
import { useNavigate } from "react-router-dom";

import socket from "../lib/socket";
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

        <div className="w-full bg-neutral-900 rounded-xl p-4 mb-6 text-left">
          <div className="flex h-3 rounded-full overflow-hidden mb-3 bg-neutral-800">
            <div
              className="bg-green-400 transition-all duration-500"
              style={{ width: `${p2pChannel.capacity > 0 ? (p2pChannel.localBalance / p2pChannel.capacity) * 100 : 0}%` }}
            />
            <div
              className="bg-blue-500 transition-all duration-500"
              style={{ width: `${p2pChannel.capacity > 0 ? (p2pChannel.remoteBalance / p2pChannel.capacity) * 100 : 0}%` }}
            />
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-green-400">↑ {p2pChannel.localBalance.toLocaleString()} sats (tuyo)</span>
            <span className="text-blue-400">↓ {p2pChannel.remoteBalance.toLocaleString()} sats (peer)</span>
          </div>
        </div>

        <button
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

        <label className="text-neutral-500 text-xs mb-1">
          Capacidad (sats) — disponible: {onChainBalance.toLocaleString()}
        </label>
        <input
          type="number"
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
          placeholder="Ej. 50000"
          max={onChainBalance}
          className="bg-neutral-900 text-white rounded-xl px-4 py-3 mb-6 outline-none focus:ring-2 focus:ring-green-400 text-base"
        />

        <button
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
          <div className="bg-red-900/40 border border-red-600/40 rounded-xl px-4 py-3 mt-4 text-red-300 text-sm">
            {peerDisconnectedMsg}
          </div>
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

        {joinError && <p className="text-red-400 text-sm mb-4">{joinError}</p>}

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

  return (
    <div className="flex flex-col min-h-screen bg-black p-6 pb-24">
      <div className="flex items-center mb-8">
        <button
          onClick={() => navigate("/home")}
          className="text-green-400 text-sm font-semibold flex items-center gap-1"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Inicio
        </button>
        <h2 className="text-white font-bold text-base flex-1 text-center">Modo P2P</h2>
        <div className="w-16" />
      </div>

      <p className="text-neutral-400 text-sm mb-8">
        Conecta con otra persona para abrir un canal Lightning real y hacerse pagos mutuos.
      </p>

      <button
        onClick={handleCreateRoom}
        className="w-full bg-green-500 text-black font-bold py-4 rounded-xl hover:bg-green-400 transition-colors mb-4 text-base"
      >
        ⚡ Crear room
      </button>

      <button
        onClick={() => setLocalStep("joining")}
        className="w-full bg-neutral-800 text-white font-bold py-4 rounded-xl hover:bg-neutral-700 transition-colors text-base"
      >
        🔗 Unirme con código
      </button>
    </div>
  );
}
