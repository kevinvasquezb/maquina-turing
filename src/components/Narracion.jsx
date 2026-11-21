import { AnimatePresence, motion } from 'framer-motion';
import { ALFABETO, retroceder } from '../core/maquina.js';

const idx = (l) => ALFABETO.indexOf(l);

/* Indicador del ciclo de 3 transiciones de la letra actual:  X −1→ W ↩ W −2→ U */
function Ciclo({ m }) {
  const n = m.historial.length;
  const len = m.entrada.length;
  const k = n === 0 ? 0 : Math.floor((n - 1) / 3);
  if (k >= len) return null;
  const hecho = n === 0 ? 0 : ((n - 1) % 3) + 1;
  const orig = m.entrada[k];
  const v1 = retroceder(orig, 1);
  const v3 = retroceder(orig, 3);
  const vecino = hecho >= 2 ? m.historial[3 * k + 1].lee : '?';

  const pasos = [
    { est: 'q0', op: '−1 · R', val: v1 },
    { est: 'q1', op: 'lee ' + vecino + ' · L', val: v1, regreso: true },
    { est: 'q2', op: '−2 · R', val: v3 },
  ];
  const caja = (letra, on, color) => (
    <span className={`grid h-[clamp(36px,5vh,56px)] w-[clamp(36px,5vh,56px)] place-items-center rounded-xl border-[3px] font-mono text-[clamp(20px,3vh,32px)] font-extrabold transition-colors
      ${on ? color : 'border-slate-300 bg-slate-50 text-slate-400'}`}>{letra}</span>
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 rounded-lg bg-noche px-2.5 py-1 text-[clamp(13px,1vw,16px)] font-bold text-white">Letra {k + 1}/{len}</span>
      {caja(orig, true, 'border-tinta bg-white text-tinta')}
      {pasos.map((p, i) => {
        const on = hecho > i;
        const actual = hecho === i + 1;
        return (
          <span key={i} className="flex items-center gap-2">
            <motion.span animate={{ scale: actual ? 1.08 : 1 }}
              className={`flex flex-col items-center rounded-lg px-2 py-0.5 text-center font-mono text-[clamp(12px,1.6vh,16px)] font-bold leading-tight
                ${on ? (actual ? 'bg-escritura text-white' : 'bg-slate-800 text-white') : 'bg-slate-200 text-slate-500'}`}>
              <span>{p.est}</span><span>{p.regreso ? '↩ ' : ''}{p.op}</span>
            </motion.span>
            {caja(p.val, on, i === 2 ? 'border-listo bg-listo-claro text-[#0b4d24]' : 'border-escritura bg-escritura-claro text-[#8a3200]')}
          </span>
        );
      })}
      <span className={`ml-1 font-mono text-[clamp(14px,2vh,20px)] font-bold ${hecho === 3 ? 'text-listo' : 'text-slate-400'}`}>
        {orig} − 3 = {v3} {hecho === 3 ? '✓' : ''}
      </span>
    </div>
  );
}

function aritmetica(a, k, b) {
  const vuelta = idx(a) - k < 0;
  return (
    <>
      <b>{a}({idx(a)}) − {k} = {b}({idx(b)})</b>
      {vuelta && <span className="ml-2 rounded-md bg-amber-200 px-2 font-bold text-amber-900">↺ da la vuelta: ({idx(a)} − {k}) mod 26 = {idx(b)}</span>}
    </>
  );
}

export default function Narracion({ m, ultimo }) {
  const proxima = m.proximaRegla();

  if (m.aceptada) {
    const salida = m.resultado();
    return (
      <div className="flex h-full flex-col justify-center gap-1.5">
        <span className="titulo-tarjeta"><span className="chip-num">3</span>¿Qué hizo la máquina?</span>
        <div className="flex items-center gap-3 text-[clamp(16px,2.2vh,24px)] font-bold text-listo">
          <motion.span initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 300 }}
            className="grid h-[1.8em] w-[1.8em] place-items-center rounded-full bg-listo text-white">✓</motion.span>
          ¡Mensaje descifrado! La máquina se detuvo en qf
        </div>
        <div className="flex flex-wrap items-center gap-3 font-mono text-[clamp(28px,5vh,60px)] font-extrabold tracking-[.12em]">
          <span className="text-slate-500">{m.entrada}</span>
          <span className="text-slate-400">→</span>
          <span className="flex">
            {[...salida].map((l, i) => (
              <motion.span key={i} initial={{ rotateY: 90, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }}
                transition={{ delay: .25 + i * .12, type: 'spring', stiffness: 260, damping: 18 }}
                className="inline-block text-listo">{l}</motion.span>
            ))}
          </span>
        </div>
        <div className="text-[clamp(14px,1.9vh,20px)] font-semibold text-gris">
          {m.historial.length} transiciones = 3 × {m.entrada.length} letras + 1 lectura de □ · δ(q0, □) = (qf, □, S)
        </div>
      </div>
    );
  }

  let principal, formula = null, detalle;
  if (!ultimo) {
    principal = <>Inicio: <b className="text-cabezal">q0</b> está sobre <b>{m.leer()}</b>. La cinta todavía no cambia.</>;
    detalle = <>Presiona <b>Siguiente ▶</b> (o la tecla →) para ejecutar la primera transición.</>;
  } else {
    const u = ultimo;
    principal = (
      <>
        <b className="text-cabezal">{u.estado}</b> lee <b>{u.lee}</b> → escribe <b className="text-escritura">{u.escribe}</b> → mueve <b>{u.mueve}</b> → pasa a <b className="text-cabezal">{u.siguiente}</b>
      </>
    );
    formula = `δ(${u.estado}, ${u.lee}) = (${u.siguiente}, ${u.escribe}, ${u.mueve})`;
    if (u.regla === 'R1') detalle = <>Primer descuento: {aritmetica(u.lee, 1, u.escribe)}. Avanza a la derecha.</>;
    else if (u.regla === 'R2') detalle = <>q1 <b>no modifica</b> «{u.lee}»: solo regresa el cabezal (L) a la letra que q0 acaba de cambiar.</>;
    else if (u.regla === 'R3') detalle = <>Segundo descuento: {aritmetica(u.lee, 2, u.escribe)}. Total: <b className="text-listo">{m.entrada[u.posicion]} − 3 = {u.escribe} ✓</b></>;
  }

  return (
    <div className="flex h-full flex-col gap-[1vh]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="titulo-tarjeta"><span className="chip-num">3</span>¿Qué hizo la máquina?</span>
        {proxima && (
          <span className="rounded-lg border-l-[5px] border-cabezal bg-cabezal-claro px-2.5 py-0.5 font-mono text-[clamp(13px,1.8vh,19px)] font-bold text-cabezal">
            siguiente: δ({m.estado}, {m.leer()}) = ({proxima.siguiente}, {proxima.escribir(m.leer())}, {proxima.mueve})
          </span>
        )}
      </div>
      <Ciclo m={m} />
      <AnimatePresence mode="wait">
        <motion.div key={m.historial.length} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
          transition={{ duration: .18 }} className="flex flex-col gap-1">
          <div className="text-[clamp(19px,2.9vh,32px)] font-semibold leading-tight">{principal}</div>
          {formula && <div className="font-mono text-[clamp(16px,2.4vh,26px)] font-bold text-escritura">{formula}</div>}
          <div className="text-[clamp(15px,2vh,21px)] font-medium text-gris">{detalle}</div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
