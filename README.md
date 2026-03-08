# Lightning Wallet Simulator

Simulador educativo de una wallet Lightning Network inspirado en Phoenix Wallet (ACINQ). Enseña conceptos de Bitcoin y Lightning Network sin usar bitcoin real.

## Características

- **Modalidad Solo** — usuario único con un bot como peer. El bot abre un canal automáticamente, paga facturas generadas y genera nuevas facturas para practicar envíos.
- **Modalidad P2P** — dos usuarios reales en la misma red comparten una sala vía WebSocket. El servidor valida todos los pagos y sincroniza el estado.
- Generación de seed phrase BIP39 (12 palabras)
- Facturas Lightning simuladas (formato BOLT11 simplificado)
- Escaneo y generación de QR
- Historial de transacciones
- UI en español, mobile-first

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | React + Vite + Tailwind CSS |
| Estado | Zustand |
| Routing | React Router |
| WebSocket | Socket.io |
| Backend | Node.js + Express |
| QR | qrcode.react + html5-qrcode |
| Tests | Jest + Testing Library |

## Estructura

```
/
├── client/   — Frontend React (mobile-first)
└── server/   — Backend Node.js + Socket.io
```

## Instalación

```bash
# Frontend
cd client
npm install
npm run dev

# Backend (en otra terminal)
cd server
npm install
npm run dev
```

## Scripts

### client/
| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo Vite |
| `npm run build` | Build de producción |
| `npm run lint` | Linter ESLint |
| `npm test` | Tests unitarios |
| `npm run coverage` | Reporte de cobertura |

### server/
| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor con nodemon |
| `npm start` | Servidor producción |

## Flujo de Modalidad P2P

```
1. Usuario A crea sala → obtiene código
2. Usuario B ingresa el código → sala conectada
3. Cualquiera puede proponer abrir un canal
4. El otro acepta → canal abierto
5. Se generan y pagan facturas entre peers
```

## Despliegue

- **Frontend**: Vercel
- **Backend**: Railway o Render (requiere WebSocket / WSS)

## Licencia

MIT — ver [LICENSE](./LICENSE)
