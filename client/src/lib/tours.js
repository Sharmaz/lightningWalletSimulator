import { driver } from "driver.js";
import "driver.js/dist/driver.css";

const BASE_CONFIG = {
  showProgress: true,
  nextBtnText: "Siguiente →",
  prevBtnText: "← Atrás",
  doneBtnText: "Entendido",
  progressText: "{{current}} de {{total}}",
};

export function createHomeTour() {
  return driver({
    ...BASE_CONFIG,
    steps: [
      {
        element: "#tour-home-balance",
        popover: {
          title: "Tu balance Lightning",
          description: "El saldo está oculto por privacidad. Toca para revelarlo. Solo muestra lo que tienes disponible en canales abiertos — no incluye fondos on-chain.",
          side: "bottom",
          align: "center",
        },
      },
      {
        element: "#tour-home-liquidity",
        popover: {
          title: "Estado del canal",
          description: "Esta barra muestra qué parte de tu canal puedes usar para enviar (verde). Si no hay canales abiertos, aquí aparece el botón para añadir liquidez.",
          side: "bottom",
          align: "center",
        },
      },
      {
        element: "#tour-home-help",
        popover: {
          title: "? Ayuda",
          description: "Este botón relanza el tour explicativo en cualquier momento. Todas las pantallas tienen uno — úsalo cuando quieras repasar cómo funciona algo.",
          side: "bottom",
          align: "end",
        },
      },
      {
        element: "#tour-home-settings",
        popover: {
          title: "⚙️ Configuración",
          description: "Accede a la información de tu nodo y tu seed phrase. Guárdala bien — es la única forma de recuperar tu wallet.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-home-channels",
        popover: {
          title: "☰ Canales",
          description: "Ve el estado de tus canales Lightning, cuánta liquidez tienes disponible y conéctate en modo P2P.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-home-p2p",
        popover: {
          title: "⚡ Modo P2P",
          description: "Conéctate con otra persona en tiempo real para abrir un canal y hacerse pagos mutuos.",
          side: "bottom",
          align: "end",
        },
      },
      {
        element: "#tour-home-transactions",
        popover: {
          title: "Historial de transacciones",
          description: "Aquí aparecen todos tus pagos enviados, recibidos y canales abiertos. Los montos están ocultos por privacidad.",
          side: "top",
          align: "center",
        },
      },
    ],
  });
}

export function createSeedTour() {
  return driver({
    ...BASE_CONFIG,
    steps: [
      {
        element: "#tour-seed-header",
        popover: {
          title: "🔑 Tu seed phrase",
          description: "Con ellas se puede recuperar todo — en cualquier dispositivo, en cualquier momento.",
          side: "bottom",
          align: "center",
        },
      },
      {
        element: "#tour-seed-grid",
        popover: {
          title: "12 palabras BIP39",
          description: "Vienen de una lista fija de 2,048 palabras en inglés. El orden importa — estas 12 palabras en este orden exacto son las únicas que pueden recuperar tu wallet.",
          side: "bottom",
          align: "center",
        },
      },
    ],
  });
}

export function createReceiveTour() {
  return driver({
    ...BASE_CONFIG,
    steps: [
      {
        popover: {
          title: "🧾 ¿Qué es un invoice?",
          description: "Un invoice (factura) es una solicitud de pago. Tú la generas y se la envías a quien te va a pagar — como un código QR de cobro.",
        },
      },
      {
        element: "#tour-receive-amount",
        popover: {
          title: "Monto exacto",
          description: "En Lightning el monto va incluido en el invoice. El pagador no puede enviarte una cantidad diferente a la que pediste.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-receive-description",
        popover: {
          title: "Descripción (opcional)",
          description: "Agrega contexto al pago — por ejemplo 'Café' o 'Renta'. Ambas partes lo verán en su historial de transacciones.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-receive-generate",
        popover: {
          title: "Genera tu invoice",
          description: "Al generarlo obtienes un QR y una cadena de texto (BOLT11). Cualquiera de los dos sirve para que alguien te pague.",
          side: "top",
          align: "center",
        },
      },
    ],
  });
}

export function createSendTour() {
  return driver({
    ...BASE_CONFIG,
    steps: [
      {
        popover: {
          title: "💸 Enviar un pago",
          description: "Para pagar en Lightning necesitas el invoice de quien recibirá el pago. Puedes escanearlo con la cámara o pegarlo como texto.",
        },
      },
      {
        element: "#tour-send-input",
        popover: {
          title: "Invoice BOLT11",
          description: "Los invoices de este simulador empiezan con 'lnsim1_'. En Lightning real empezarían con 'lnbc' (mainnet) o 'lntb' (testnet).",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-send-actions",
        popover: {
          title: "Pegar o escanear",
          description: "Si tienes el invoice en el portapapeles usa 'pegar'. Si tienes el QR delante usa 'escanear QR' para capturarlo con la cámara.",
          side: "top",
          align: "center",
        },
      },
      {
        popover: {
          title: "⚡ Pago instantáneo",
          description: "Cuando confirmas el pago se liquida en milisegundos. Sin minería, sin esperar bloques — esa es la diferencia entre on-chain y Lightning.",
        },
      },
    ],
  });
}

export function createP2PTour() {
  return driver({
    ...BASE_CONFIG,
    steps: [
      {
        popover: {
          title: "👥 Modo P2P",
          description: "En este modo dos personas reales se conectan desde la misma red y abren un canal Lightning entre sí. Es la experiencia más cercana a cómo funciona Lightning en el mundo real.",
        },
      },
      {
        element: "#tour-p2p-create",
        popover: {
          title: "Crear una room",
          description: "Generas un código único de 6 caracteres. Compártelo con la otra persona — por mensaje, QR o en persona. Solo pueden entrar 2 nodos por room.",
          side: "bottom",
          align: "center",
        },
      },
      {
        element: "#tour-p2p-join",
        popover: {
          title: "Unirme con código",
          description: "Si la otra persona ya creó la room, ingresa su código aquí. En segundos ambos nodos quedan conectados.",
          side: "top",
          align: "center",
        },
      },
    ],
  });
}

export function createP2PChannelTour() {
  return driver({
    ...BASE_CONFIG,
    steps: [
      {
        popover: {
          title: "⚡ Peer conectado",
          description: "Ambos nodos están en la misma room. Ahora uno de los dos puede proponer abrir un canal Lightning.",
        },
      },
      {
        element: "#tour-p2p-capacity",
        popover: {
          title: "Capacidad del canal",
          description: "Los sats que pongas aquí se bloquean en el canal. Serán tu liquidez local — lo que puedes enviar. El peer empieza con 0 de salida.",
          side: "bottom",
          align: "center",
        },
      },
      {
        element: "#tour-p2p-open-btn",
        popover: {
          title: "Abrir el canal",
          description: "Al confirmar, se registra el canal en el servidor y ambos nodos quedan listos para hacerse pagos instantáneos.",
          side: "top",
          align: "center",
        },
      },
    ],
  });
}

export function createP2PReadyTour(isOpener) {
  return driver({
    ...BASE_CONFIG,
    steps: [
      {
        element: "#tour-p2p-liquidity",
        popover: {
          title: "Tu canal está abierto",
          description: isOpener
            ? "La barra muestra cómo están distribuidos los sats. Todo verde porque tú pusiste el dinero — tienes 100% de liquidez local para enviar."
            : "La barra muestra cómo están distribuidos los sats. Todo azul porque el peer puso el dinero — él tiene 100% de liquidez local para enviarte.",
          side: "bottom",
          align: "center",
        },
      },
      {
        popover: {
          title: isOpener ? "¿Por qué el peer tiene 0?" : "¿Por qué tú tienes 0?",
          description: isOpener
            ? "El peer no puso sats al abrir el canal, así que empieza sin liquidez de salida. Solo podrá enviarte cuando tú le hayas enviado algo primero."
            : "No pusiste sats al abrir el canal, así que empiezas sin liquidez de salida. Podrás enviar cuando el peer te haya enviado algo primero.",
        },
      },
      {
        element: "#tour-p2p-home-btn",
        popover: {
          title: "¡Listo!",
          description: isOpener
            ? "Ve al inicio y empieza enviando sats al peer. Cada pago moverá la liquidez de tu lado al suyo en tiempo real."
            : "Ve al inicio y espera a que el peer te envíe sats. Una vez que recibas, podrás enviarte pagos mutuamente.",
          side: "top",
          align: "center",
        },
      },
    ],
  });
}

export function createChannelsTour() {
  return driver({
    ...BASE_CONFIG,
    steps: [
      {
        popover: {
          title: "⚡ Canales de pago",
          description: "Un canal es una conexión directa entre dos nodos Lightning. Sin canal abierto no puedes enviar ni recibir pagos.",
        },
      },
      {
        popover: {
          title: "¿Por qué canales?",
          description: "Bitcoin on-chain tarda ~10 minutos por transacción. Los canales permiten pagos instantáneos sin tocar la blockchain en cada intercambio.",
        },
      },
      {
        element: "#tour-channels-open-btn",
        popover: {
          title: "Abrir un canal",
          description: "Abrir un canal requiere una transacción on-chain para bloquear los sats. Después, todos los pagos dentro del canal son instantáneos.",
          side: "bottom",
          align: "center",
        },
      },
    ],
  });
}

export function createLiquidityTour() {
  return driver({
    ...BASE_CONFIG,
    steps: [
      {
        popover: {
          title: "💧 ¿Qué es la liquidez?",
          description: "La liquidez de un canal determina cuánto puedes enviar y cuánto puedes recibir. Cambia con cada pago — es un recurso que fluye entre los dos lados.",
        },
      },
      {
        element: "#tour-liquidity-bar",
        popover: {
          title: "Barra de liquidez",
          description: "La parte verde es tu liquidez local — puedes ENVIAR ese monto. La parte azul es la remota — puedes RECIBIR ese monto. Siempre suman la capacidad total.",
          side: "bottom",
          align: "center",
        },
      },
      {
        popover: {
          title: "📤 Liquidez local (outbound)",
          description: "Cada vez que envías un pago, tu liquidez local baja y la remota sube. Es como agua que fluye de tu lado al otro lado del canal.",
        },
      },
      {
        popover: {
          title: "📥 Liquidez remota (inbound)",
          description: "Para recibir pagos necesitas liquidez remota. Si está en cero, nadie puede enviarte sats por ese canal aunque tengas capacidad.",
        },
      },
      {
        popover: {
          title: "¿Por qué el otro lado empieza en 0?",
          description: "Quien abre el canal pone todos los sats — el otro lado empieza sin nada. El peer no puede enviarte hasta que tú le envíes algo primero, o hasta que él abra su propio canal contigo.",
        },
      },
      {
        popover: {
          title: "💡 El problema del inbound",
          description: "En Lightning real esto es un desafío común: recibir pagos requiere que alguien ya te haya abierto liquidez. Wallets como Phoenix lo resuelven automáticamente abriendo canales con liquidez entrante desde el inicio.",
        },
      },
    ],
  });
}
