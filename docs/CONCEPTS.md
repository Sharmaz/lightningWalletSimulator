# Conceptos de Lightning Network

Glosario de términos clave para entender el simulador y la Lightning Network real.

---

## Bitcoin y la cadena base

### Bitcoin (BTC / sats)
Bitcoin es una moneda digital descentralizada. La unidad mínima es el **satoshi (sat)**: 1 BTC = 100,000,000 sats. En este simulador todo se expresa en sats.

### Blockchain
Registro público e inmutable de todas las transacciones de Bitcoin. Cada bloque tarda ~10 minutos en confirmarse. Esta lentitud es uno de los motivos por los que existe Lightning Network.

### Transacción on-chain
Transacción registrada directamente en la blockchain de Bitcoin. Es segura pero lenta (minutos u horas) y tiene comisiones variables según la congestión de la red.

---

## Lightning Network

### Lightning Network
Protocolo de segunda capa sobre Bitcoin que permite pagos instantáneos y de bajo costo. Los pagos ocurren fuera de la cadena (off-chain) entre nodos conectados por canales de pago.

### Nodo (Node)
Participante de la red Lightning. Cada usuario tiene un nodo identificado por un **Node ID** (clave pública). En este simulador, tu Node ID se deriva de tu seed phrase.

### Node ID
Identificador único de tu nodo en la red. En Lightning real es una clave pública de 33 bytes (66 caracteres hexadecimales). En el simulador es una cadena simulada derivada de tu seed phrase.

---

## Canales

### Canal de pago (Payment Channel)
Conexión directa entre dos nodos que permite intercambiar sats de forma instantánea. Para abrirlo se hace una transacción on-chain; para cerrarlo, otra. Todos los pagos intermedios son off-chain.

### Capacidad del canal (Capacity)
Total de sats bloqueados en el canal. La suma de liquidez local + remota siempre es igual a la capacidad. Ejemplo: un canal de 100,000 sats tiene 100,000 sats totales distribuidos entre ambas partes.

### Liquidez local (Local Balance / Outbound)
Sats que **tú puedes enviar**. Cuando pagas una factura, tu liquidez local disminuye y la remota aumenta.

### Liquidez remota (Remote Balance / Inbound)
Sats que **puedes recibir**. Para recibir pagos necesitas liquidez remota. Si no tienes, el pago no puede llegar a ti.

### Barra de liquidez
Representación visual del balance del canal. La parte verde es tu liquidez local (puedes enviar), la parte azul es la remota (puedes recibir).

```
[====verde====|====azul====]
 Local (enviar)  Remoto (recibir)
```

### Estados de un canal
| Estado | Descripción |
|--------|-------------|
| `opening` | El canal está siendo negociado/abierto |
| `open` | Canal activo, listo para pagos |
| `closing` | Se está cerrando (transacción on-chain pendiente) |
| `closed` | Canal cerrado, fondos devueltos on-chain |

---

## Facturas y pagos

### Factura (Invoice)
Solicitud de pago generada por el receptor. Contiene el monto, descripción y datos del nodo destino. En Lightning real se usa el formato **BOLT11**.

### BOLT11
Estándar de codificación para facturas Lightning. Las facturas reales comienzan con `lnbc` (mainnet) o `lntb` (testnet). En este simulador usan el prefijo `lnsim1_`.

### Formato simulado de factura
```
lnsim1_[monto]_[descripción_base64]_[nodeId]_[invoiceId]_[timestamp]_[expiry]
```

### Expiración de factura
Las facturas tienen un tiempo de vida (por defecto 1 hora en Lightning real). Una factura expirada no puede pagarse. El simulador respeta este comportamiento.

### Pago instantáneo
En Lightning, los pagos se liquidan en milisegundos sin necesidad de esperar confirmaciones de bloque. Esto es posible porque los canales ya están abiertos on-chain.

---

## Seed Phrase y seguridad

### Seed Phrase (Frase de recuperación)
Conjunto de 12 o 24 palabras del estándar **BIP39** que representan la clave maestra de tu wallet. Con esta frase puedes recuperar todos tus fondos. **Nunca la compartas con nadie.**

### BIP39
Estándar que define una lista de 2048 palabras en inglés para generar seeds de wallets deterministas. Las 12 palabras de tu seed representan un número de 128 bits de entropía.

### Wallet determinista (HD Wallet)
A partir de una seed phrase se pueden derivar de forma determinista todas las claves de la wallet. Esto significa que si pierdes el dispositivo pero tienes las 12 palabras, puedes recuperar todo.

---

## Modalidades del simulador

### Modalidad Solo
Un solo usuario interactúa con un **bot** que actúa como peer. El bot abre un canal automáticamente, paga las facturas que generas y crea nuevas facturas para que practiques los envíos. Ideal para aprender los conceptos básicos sin necesitar otro usuario.

### Modalidad P2P
Dos usuarios reales se conectan en la misma red local usando un **código de sala**. Pueden abrir canales entre sí y enviarse pagos en tiempo real a través del servidor. Simula una experiencia más cercana a Lightning real.

### Bot peer
En Modalidad Solo, el bot es un nodo simulado que:
1. Abre un canal de 100,000 sats (50,000 local / 50,000 remoto) al inicio
2. Paga automáticamente cualquier factura que generes (~3 segundos)
3. Genera nuevas facturas para que puedas practicar envíos

---

## Preguntas frecuentes

**¿Por qué necesito abrir un canal antes de pagar?**
En Lightning, los pagos viajan por canales. Sin un canal abierto no hay ruta para enviar o recibir sats.

**¿Por qué no puedo recibir si no tengo liquidez remota?**
La liquidez remota representa la capacidad de tu peer para enviarte sats. Si está en cero, no hay fondos del otro lado para empujarte.

**¿Qué pasa si cierro un canal?**
Los fondos regresan on-chain. En Bitcoin real esto tarda ~10 minutos (1 confirmación de bloque). En el simulador es instantáneo.

**¿Este simulador usa bitcoin real?**
No. Todo es simulado. No hay riesgo de perder fondos reales. El objetivo es aprender cómo funciona Lightning de forma práctica.
