# Contribuir al proyecto

¡Gracias por tu interés en contribuir! Este proyecto es educativo y cualquier mejora que ayude a otros a aprender Bitcoin y Lightning Network es bienvenida.

## Requisitos previos

- Node.js 18+
- npm 9+
- Git

## Configuración del entorno

```bash
# Clonar el repositorio
git clone https://github.com/Sharmaz/lightningWalletSimulator.git
cd lightningWalletSimulator

# Instalar dependencias del frontend
cd client
npm install

# Instalar dependencias del backend
cd ../server
npm install
```

## Correr el proyecto en desarrollo

```bash
# Terminal 1 — Backend
cd server
npm run dev

# Terminal 2 — Frontend
cd client
npm run dev
```

El frontend estará disponible en `http://localhost:5173` y el backend en `http://localhost:3000`.

## Tests

```bash
cd client

# Correr todos los tests
npm test

# Correr tests con reporte de cobertura
npm run coverage

# Correr tests en modo watch
npm test -- --watch
```

Todos los tests deben pasar antes de abrir un Pull Request. No se aceptarán PRs que rompan tests existentes.

## Convenciones de código

### General
- Usa **español** para textos de UI, nombres de variables de dominio (ej. `monto`, `canal`) y comentarios de negocio
- Usa **inglés** para nombres técnicos estándar (ej. `handleSubmit`, `isLoading`, `channelId`)
- Sin comentarios obvios — el código debe ser autoexplicativo

### JavaScript / JSX
- Componentes React en PascalCase: `PageHeader.jsx`
- Hooks y utilidades en camelCase: `useWalletStore.js`
- Preferir funciones flecha para componentes y handlers
- No usar `var`, preferir `const` sobre `let`

### Estilos
- Solo Tailwind CSS, sin CSS personalizado salvo casos excepcionales
- Mobile-first: diseña para pantallas pequeñas primero
- Paleta del proyecto: fondo `bg-black`, tarjetas `bg-neutral-900`, acento `green-400`/`green-500`

### Estructura de archivos
```
client/src/
├── components/   — Componentes reutilizables
├── pages/        — Vistas principales (una por ruta)
└── store/        — Estado global con Zustand
```

Los componentes nuevos van en `components/`. No crear lógica de negocio en componentes de UI.

## Flujo de trabajo con Git

```bash
# Crear rama desde main
git checkout main
git pull origin main
git checkout -b tipo/descripcion-corta

# Tipos de rama
feature/   — nueva funcionalidad
fix/       — corrección de bug
chore/     — tareas de mantenimiento, docs, refactor
```

### Commits

Usa mensajes en inglés, en imperativo, descriptivos:

```bash
# Bien
git commit -m "add invoice expiry validation"
git commit -m "fix liquidity bar not updating after payment"

# Evitar
git commit -m "changes"
git commit -m "fixed stuff"
```

## Abrir un Pull Request

1. Asegúrate de que todos los tests pasen (`npm test`)
2. Corre el linter (`npm run lint`)
3. Haz push de tu rama y abre un PR hacia `main`
4. Describe qué cambiaste y por qué
5. Si es un cambio visual, incluye capturas de pantalla

## Reportar bugs

Abre un issue en GitHub con:
- Descripción del problema
- Pasos para reproducirlo
- Comportamiento esperado vs comportamiento actual
- Capturas de pantalla si aplica

## Qué tipos de contribuciones son bienvenidas

- Mejoras al contenido educativo (nuevos conceptos, mejor explicación)
- Nuevos escenarios de práctica para el bot en Modalidad Solo
- Mejoras de accesibilidad (a11y)
- Correcciones de bugs
- Mejoras a los tests
- Traducciones de `docs/CONCEPTS.md` a otros idiomas

## Licencia

Al contribuir aceptas que tu código se publique bajo la licencia [MIT](./LICENSE).
