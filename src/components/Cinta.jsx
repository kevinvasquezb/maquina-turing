import { useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BLANCO } from '../core/maquina.js';

/* Una letra que "gira" cuando cambia (efecto de escritura en la cinta). */
function Simbolo({ s }) {
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span key={s} initial={{ rotateX: -95, opacity: 0, y: -8 }} animate={{ rotateX: 0, opacity: 1, y: 0 }}
        exit={{ rotateX: 95, opacity: 0, y: 8 }} transition={{ duration: .32, ease: 'easeOut' }} style={{ display: 'inline-block' }}>
        {s}
      </motion.span>
    </AnimatePresence>
  );
}

export default function Cinta({ m, ultimo }) {
  const fila = useRef(null);
  const [x, setX] = useState(0);
  const [w, setW] = useState(0);

  const original = [...m.entrada, BLANCO];
  while (original.length < m.cinta.length) original.push(BLANCO);
  const terminadas = new Set(m.historial.filter((h) => h.regla === 'R3').map((h) => h.posicion));

  // Medir la celda donde está el cabezal para deslizar el "carro".
  useLayoutEffect(() => {
    const medir = () => {
      const c = fila.current?.children[m.cabezal];
      if (c) { setX(c.offsetLeft); setW(c.offsetWidth); }
    };
    medir();
    const ro = new ResizeObserver(medir);
    if (fila.current) ro.observe(fila.current);
    return () => ro.disconnect();
  }, [m.cabezal, m.cinta.length]);

  const filaCls = 'flex justify-center gap-[1.1cqw]';
  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-[1vh]">
      <div className="text-right leading-tight">
        <div className="text-[clamp(14px,1.15vw,18px)] font-extrabold uppercase text-gris">Original</div>
        <div className="text-[clamp(12px,.95vw,15px)] font-semibold text-linea">no cambia</div>
      </div>
      <div className="@container">
        <div className={filaCls}>
          {original.map((s, i) => (
            <div key={i} className={`celda original ${s === BLANCO ? 'blanco' : ''} ${i === m.cabezal ? 'foco' : ''}`}
              style={{ '--c': 'min(9.4cqw, 7.6vh, 112px)', height: 'min(5vh, 60px)', fontSize: 'min(3.6vh, 40px)' }}>{s}</div>
          ))}
        </div>
      </div>

      <div className="self-start pt-[2vh] text-right leading-tight">
        <div className="text-[clamp(14px,1.15vw,18px)] font-extrabold uppercase text-gris">Trabajo</div>
        <div className="font-mono text-[clamp(12px,.95vw,15px)] font-bold text-cabezal">pos {m.cabezal}<br />lee «{m.leer()}»</div>
      </div>
      <div className="@container">
        <div className="relative mx-auto w-max pb-[clamp(16px,2.4vh,24px)]" style={{ '--c': 'min(9.4cqw, 7.6vh, 112px)' }}>
          <div ref={fila} className={filaCls}>
            {m.cinta.map((s, i) => {
              const c = ['celda'];
              if (s === BLANCO) c.push('blanco');
              if (terminadas.has(i)) c.push('terminada');
              if (ultimo && ultimo.posicion === i) c.push(ultimo.lee !== ultimo.escribe ? 'escrita' : 'leida');
              const final = m.aceptada && s !== BLANCO;
              return (
                <motion.div key={i} className={c.join(' ')}
                  animate={final ? { y: [0, -14, 0] } : { y: 0 }}
                  transition={final ? { delay: i * .07, duration: .5 } : { duration: .2 }}>
                  <Simbolo s={s} />
                  <span className="idx">{i}</span>
                </motion.div>
              );
            })}
          </div>

          {/* El cabezal: un marco azul que se desliza + etiqueta con el estado */}
          <motion.div className="pointer-events-none absolute top-0 left-0"
            animate={{ x, width: w }} transition={{ type: 'spring', stiffness: 260, damping: 26 }}>
            <div className="rounded-[18%] border-[5px] border-cabezal shadow-[0_0_0_4px_#dbe6ff,0_0_24px_rgba(29,78,216,.55)]"
              style={{ height: w + 12, margin: '-6px', width: 'calc(100% + 12px)' }} />
            <div className="-mt-[10px] flex justify-center">
              <span className="whitespace-nowrap rounded-md border-2 border-white bg-cabezal px-2 py-[1px] font-mono text-[clamp(12px,1.7vh,19px)] font-bold text-white">
                ▲ {m.estado}
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export function Leyenda() {
  const it = (cls, txt) => (
    <span className="flex items-center gap-1.5"><i className={`inline-block h-4 w-4 rounded border-[3px] ${cls}`} />{txt}</span>
  );
  return (
    <div className="flex flex-wrap justify-end gap-x-4 gap-y-1 text-[clamp(12px,1vw,16px)] font-bold normal-case tracking-normal text-gris">
      {it('border-escritura bg-escritura-claro', 'Escritura')}
      {it('border-cabezal', 'Cabezal')}
      {it('border-listo bg-listo-claro', 'Terminada')}
      {it('border-indigo-400 bg-indigo-50', 'Leída')}
    </div>
  );
}
