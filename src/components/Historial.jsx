import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function Historial({ m, total, onIr }) {
  const caja = useRef(null);
  const h = m.historial;
  useEffect(() => {
    const c = caja.current;
    if (c) c.scrollTo({ top: c.scrollHeight, behavior: 'smooth' });
  }, [h.length]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-2 flex items-center justify-between">
        <span className="titulo-tarjeta">Historial</span>
      </div>
      <div ref={caja} className="min-h-0 flex-1 overflow-auto rounded-xl border-2 border-slate-200">
        <table className="tabla text-[clamp(14px,min(2.4vh,1.45vw),24px)]">
          <thead><tr><th>#</th><th>Est<span className="max-[1200px]:hidden">ado</span></th><th>Lee</th><th>Esc<span className="max-[1200px]:hidden">ribe</span></th><th>Mov</th><th>Nuevo</th></tr></thead>
          <tbody>
            {h.map((r, i) => {
              const ult = i === h.length - 1;
              return (
                <motion.tr key={r.paso} initial={{ opacity: 0, x: 30, backgroundColor: '#fed7aa' }}
                  animate={{ opacity: 1, x: 0, backgroundColor: ult ? '#ffedd5' : '#ffffff' }}
                  transition={{ duration: .3 }} onClick={() => onIr(r.paso)} className="cursor-pointer hover:!bg-slate-100">
                  <td className="text-slate-500">{r.paso}</td>
                  <td>{r.estado}</td><td>{r.lee}</td>
                  <td className={r.lee !== r.escribe ? 'font-extrabold text-escritura' : ''}>{r.escribe}</td>
                  <td>{r.mueve}</td><td>{r.siguiente}</td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
        {!h.length && <div className="p-6 text-center text-lg font-semibold text-gris">Aún no hay transiciones.<br />Presiona <b>Siguiente ▶</b></div>}
      </div>
      <div className="mt-2 text-[clamp(13px,1.8vh,17px)] font-bold text-gris">
        {h.length < total ? `${total - h.length} transiciones por registrar` : `${h.length} transiciones registradas ✓`}
      </div>
    </div>
  );
}
