import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

/* Grafo oficial: q0 → q1 → q2 → q0, y q0 → qf con □. */
const NODOS = [
  { id: 'q0', x: 140, y: 140 },
  { id: 'q1', x: 360, y: 140 },
  { id: 'q2', x: 580, y: 140 },
  { id: 'qf', x: 742, y: 140 },
];
const ARISTAS = [
  { id: 'R1', d: 'M178,140 L320,140', lx: 249, ly: 123, texto: 'Letra: −1, R' },
  { id: 'R2', d: 'M398,140 L540,140', lx: 469, ly: 186, texto: 'Letra/□: igual, L' },
  { id: 'R3', d: 'M580,178 C580,246 140,246 140,182', lx: 360, ly: 256, texto: 'Letra: −2, R' },
  { id: 'R4', d: 'M140,102 C140,40 742,40 742,98', lx: 441, ly: 46, texto: '□: igual, S' },
];

export default function Grafo({ estado, ultimaRegla, proximaRegla, pulso, aceptada }) {
  const token = useRef(null);
  const rutas = useRef({});

  // "bolita" que viaja por la flecha de la transición que se acaba de ejecutar
  useEffect(() => {
    if (!pulso || !ultimaRegla) return;
    const path = rutas.current[ultimaRegla];
    const t = token.current;
    if (!path || !t) return;
    const L = path.getTotalLength();
    const t0 = performance.now();
    const dur = 520;
    let raf;
    t.style.opacity = 1;
    const cuadro = (ahora) => {
      const k = Math.min(1, (ahora - t0) / dur);
      const e = k < .5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2;
      const p = path.getPointAtLength(L * e);
      t.setAttribute('cx', p.x); t.setAttribute('cy', p.y);
      if (k < 1) raf = requestAnimationFrame(cuadro); else t.style.opacity = 0;
    };
    raf = requestAnimationFrame(cuadro);
    return () => cancelAnimationFrame(raf);
  }, [pulso, ultimaRegla]);

  return (
    <svg viewBox="38 22 754 242" className="h-full w-full" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Grafo de estados">
      <defs>
        <marker id="pt" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="12" markerHeight="12" markerUnits="userSpaceOnUse" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill="#475569" />
        </marker>
        <marker id="pt-act" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="15" markerHeight="15" markerUnits="userSpaceOnUse" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill="#ea580c" />
        </marker>
        <marker id="pt-prox" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="13" markerHeight="13" markerUnits="userSpaceOnUse" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill="#1d4ed8" />
        </marker>
        <filter id="brillo" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
      </defs>

      {/* inicio */}
      <path d="M52,140 L100,140" stroke="#475569" strokeWidth="3" markerEnd="url(#pt)" />
      <text x="48" y="124" fontSize="17" fontWeight="700" fill="#475569">inicio</text>

      {ARISTAS.map((a) => {
        const activa = a.id === ultimaRegla;
        const proxima = !activa && a.id === proximaRegla;
        const color = activa ? '#ea580c' : proxima ? '#1d4ed8' : '#475569';
        return (
          <g key={a.id}>
            <path ref={(el) => (rutas.current[a.id] = el)} d={a.d} fill="none" stroke={color}
              strokeWidth={activa ? 3 : proxima ? 3.5 : 3} strokeDasharray={proxima ? '9 7' : undefined}
              markerEnd={`url(#${activa ? 'pt-act' : proxima ? 'pt-prox' : 'pt'})`} />
            {activa && (
              <motion.path key={pulso} d={a.d} fill="none" stroke="#ea580c" strokeWidth="7" strokeLinecap="round"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: .45, ease: 'easeOut' }} />
            )}
            <text x={a.lx} y={a.ly} textAnchor="middle" fontSize="19" fontWeight="800" fill={color}
              stroke="#fff" strokeWidth="6" paintOrder="stroke">{a.texto}</text>
          </g>
        );
      })}

      {NODOS.map((n) => {
        const activo = n.id === estado;
        const final = n.id === 'qf';
        const relleno = activo ? (final && aceptada ? '#bbf7d0' : '#fde047') : '#f1f5f9';
        const borde = activo ? (final ? '#15803d' : '#a16207') : final ? '#15803d' : '#334155';
        return (
          <g key={n.id}>
            {activo && (
              <motion.circle cx={n.x} cy={n.y} r="44" fill={final ? '#22c55e' : '#facc15'} filter="url(#brillo)"
                animate={{ opacity: [.45, .95, .45] }} transition={{ duration: 1.6, repeat: Infinity }} />
            )}
            <motion.g animate={{ scale: activo ? 1.12 : 1 }} transition={{ type: 'spring', stiffness: 380, damping: 18 }}
              style={{ transformOrigin: `${n.x}px ${n.y}px` }}>
              <circle cx={n.x} cy={n.y} r="37" fill={relleno} stroke={borde} strokeWidth={activo ? 5 : 3.5} />
              {final && <circle cx={n.x} cy={n.y} r="30" fill="none" stroke={borde} strokeWidth="3" />}
              <text x={n.x} y={n.y + 10} textAnchor="middle" fontSize="29" fontWeight="800"
                fontFamily="JetBrains Mono Variable, monospace" fill="#0b1220">{n.id}</text>
            </motion.g>
          </g>
        );
      })}

      <circle ref={token} r="10" fill="#ea580c" stroke="#fff" strokeWidth="3" style={{ opacity: 0 }} />
    </svg>
  );
}
