import { AnimatePresence, motion } from 'framer-motion';
export default function Narracion({ m, ultimo }) {
  if (m.aceptada) {
    const salida = m.resultado();
    return (
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1">
        <div className="flex items-center gap-4">
          <motion.span initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 300 }}
            className="grid h-[clamp(36px,5vh,52px)] w-[clamp(36px,5vh,52px)] shrink-0 place-items-center rounded-full bg-listo text-[clamp(20px,3vh,30px)] font-bold text-white">✓</motion.span>
          <div className="flex items-center gap-3 font-mono text-[clamp(26px,4.4vh,52px)] font-extrabold leading-none tracking-[.1em]">
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
        </div>
        <div className="text-right text-[clamp(14px,2vh,20px)] font-bold leading-tight text-listo">
          ¡Descifrado! Se detuvo en qf<br />
          <span className="text-gris">{m.historial.length} transiciones = 3 × {m.entrada.length} + 1</span>
        </div>
      </div>
    );
  }

  let principal, formula = null;
  if (!ultimo) {
    principal = <>Inicio: <b className="text-cabezal">q0</b> está sobre <b>{m.leer()}</b>. Presiona <b>Siguiente ▶</b></>;
  } else {
    const u = ultimo;
    principal = (
      <>
        <b className="text-cabezal">{u.estado}</b> lee <b>{u.lee}</b> → escribe <b className="text-escritura">{u.escribe}</b> → mueve <b>{u.mueve}</b> → pasa a <b className="text-cabezal">{u.siguiente}</b>
      </>
    );
    formula = `δ(${u.estado}, ${u.lee}) = (${u.siguiente}, ${u.escribe}, ${u.mueve})`;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div key={m.historial.length} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
        transition={{ duration: .18 }} className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <div className="text-[clamp(20px,3.2vh,34px)] font-semibold leading-tight">{principal}</div>
        {formula && <div className="font-mono text-[clamp(18px,2.8vh,30px)] font-bold text-escritura">{formula}</div>}
      </motion.div>
    </AnimatePresence>
  );
}
