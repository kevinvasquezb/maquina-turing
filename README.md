# Máquina de Turing · Descifrador César −3

Simulador interactivo de una **Máquina de Turing determinista** de 4 estados (q0, q1, q2, qf) que descifra palabras de 5 a 8 letras (A–Z) aplicando César −3 **transición por transición**.

Proyecto final · UTEPSA

## Stack

| Herramienta | Para qué |
|---|---|
| **React 19** | Interfaz por componentes |
| **Vite** | Servidor de desarrollo y build |
| **Tailwind CSS 4** | Estilos |
| **Framer Motion** | Animaciones (cabezal, letras que giran, transiciones de pantalla) |
| **canvas-confetti** | Celebración al llegar a qf |
| **Vitest** | Pruebas unitarias del motor |
| **vite-plugin-singlefile** | El build sale en UN solo `index.html` que funciona sin internet |
| **GitHub Actions + Pages** | Publicación automática |

## Estructura

```
src/
├── core/                  ← lógica (no depende de React)
│   ├── maquina.js         ← motor: estados, δ, cinta, cabezal, historial, validación
│   ├── pruebas.js         ← plan de pruebas + oráculo independiente
│   ├── maquina.test.js    ← tests Vitest (incluye la tabla de 19 pasos del docente)
│   ├── useMaquina.js      ← hook que conecta el motor con React
│   └── sonido.js          ← efectos con Web Audio
└── components/            ← interfaz
    ├── Inicio.jsx         ← bienvenida + restricciones de entrada
    ├── Simulacion.jsx     ← pantalla principal y controles
    ├── Grafo.jsx          ← grafo SVG con estado y transición activa
    ├── Cinta.jsx          ← cinta original, cinta de trabajo y cabezal
    ├── Narracion.jsx      ← "¿qué hizo la máquina?" + ciclo de cada letra
    ├── Historial.jsx      ← tabla δ e historial
    ├── Pruebas.jsx        ← pestaña de pruebas automáticas
    └── Teoria.jsx         ← pestaña "¿Cómo funciona?"
```

## Ejecutar

```bash
npm install
npm run dev      # desarrollo en http://localhost:5173
npm test         # pruebas unitarias
npm run build    # genera dist/index.html (un solo archivo)
```

**Sin internet:** abre `dist/index.html` con doble clic.

## Publicar en GitHub Pages

1. Crea el repositorio y sube el código a la rama `main`.
2. En GitHub: **Settings → Pages → Source: GitHub Actions**.
3. Cada `push` a `main` ejecuta los tests, construye y publica (`.github/workflows/deploy.yml`).

## Uso

- **Teclado:** `→` siguiente · `←` anterior · `Espacio` ejecutar/pausar · `R` reiniciar · `F` final.
- Clic en una fila del historial para ir a ese paso.
- `⛶` pantalla completa para el proyector.
- URL directa a un paso: `?w=XWHSVD&paso=3`.
