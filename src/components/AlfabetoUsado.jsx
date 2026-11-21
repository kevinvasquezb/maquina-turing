import { Fragment } from 'react';
import { motion } from 'framer-motion';
import { ALFABETO, retroceder } from '../core/maquina.js';

/* Muestra SOLO las letras del alfabeto que entran en juego para descifrar:
   por cada letra cifrada x, su "ventana" x, x−1, x−2, x−3 (circular).
   Resalta la operación actual (lee → escribe) y las letras ya descifradas. */
export default function AlfabetoUsado({ m, ultimo }) {
  const usadas = new Set();
  for (const c of m.entrada) for (let k = 0; k <= 3; k++) usadas.add(retroceder(c, k));
  const lista = [...ALFABETO].filter((l) => usadas.has(l));

  const cifradas = new Set(m.entrada);
  const descifradas = new Set(m.historial.filter((h) => h.regla === 'R3').map((h) => h.escribe));
  const opera = ultimo && (ultimo.regla === 'R1' || ultimo.regla === 'R3');
  const desde = opera ? ultimo.lee : null;
  const hasta = opera ? ultimo.escribe : null;

  return (
    <div className="flex min-w-0 flex-1 items-center gap-[clamp(3px,.45vw,8px)]">
      {lista.map((l, i) => {
        const idx = ALFABETO.indexOf(l);
        const salto = i > 0 && idx - ALFABETO.indexOf(lista[i - 1]) > 1;
        let cls = 'border-slate-300 bg-white text-slate-500';
        if (cifradas.has(l)) cls = 'border-tinta bg-white text-tinta';
        if (descifradas.has(l)) cls = 'border-listo bg-listo-claro text-[#0b4d24]';
        if (l === desde) cls = 'border-escritura bg-white text-escritura ring-4 ring-escritura-claro';
        if (l === hasta) cls = 'border-escritura bg-escritura text-white';
        return (
          <Fragment key={l}>
            {salto && <span className="shrink-0 px-1 font-mono text-[clamp(20px,3vh,32px)] font-extrabold text-slate-500">…</span>}
            <motion.span
              animate={{ y: l === hasta ? -4 : 0, scale: l === hasta ? 1.12 : 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className={`flex h-[clamp(38px,5.6vh,60px)] min-w-[24px] max-w-[64px] flex-1 flex-col items-center justify-center rounded-lg border-[3px] font-mono leading-none transition-colors ${cls}`}>
              <span className="text-[clamp(19px,3vh,32px)] font-extrabold">{l}</span>
              <span className="text-[clamp(10px,1.4vh,14px)] font-bold opacity-80">{idx}</span>
            </motion.span>
          </Fragment>
        );
      })}
    </div>
  );
}
