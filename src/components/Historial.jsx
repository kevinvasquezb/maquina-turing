import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { REGLAS } from '../core/maquina.js';

const LEE = { R1: 'A–Z', R2: 'A–Z/□', R3: 'A–Z', R4: '□' };

export function TablaDelta({ m, ultimo }) {
  const proxima = m.proximaRegla();
  return (
    <table className="tabla text-[clamp(14px,min(1.9vh,1.4vw),19px)]">
      <thead><tr><th>δ</th><th>Est.</th><th>Lee</th><th>Escribe</th><th>Mov</th><th>Sig.</th></tr></thead>
      <tbody>
        {REGLAS.map((r) => {
          const activa = ultimo?.regla === r.id;
          const prox = proxima?.id === r.id;
          return (
            <tr key={r.id} className={activa ? 'bg-escritura-claro' : prox ? 'bg-cabezal-claro' : ''}>
              <td className={activa ? 'text-escritura' : prox ? 'text-cabezal' : ''}>{r.id}</td>
              <td>{r.estado}</td><td className="whitespace-nowrap">{LEE[r.id]}</td><td className="whitespace-nowrap">{r.escribe}</td><td>{r.mueve}</td><td>{r.siguiente}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default function Historial({ m, total, onIr }) {
  const caja = useRef(null);
  const h = m.historial;
  useEffect(() => {
    const c = caja.current;
    if (c) c.scrollTo({ top: c.scrollHeight, behavior: 'smooth' });
  }, [h.length]);

  const descargar = () => {
    const filas = [['Paso', 'Estado', 'Lee', 'Escribe', 'Mueve', 'Nuevo', 'Cinta despues'],
      ...h.map((r) => [r.paso, r.estado, r.lee, r.escribe, r.mueve, r.siguiente, r.cinta])];
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['﻿' + filas.map((f) => f.join(';')).join('\n')], { type: 'text/csv' }));
    a.download = `historial_${m.entrada}.csv`;
    a.click();
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-2 flex items-center justify-between">
        <span className="titulo-tarjeta"><span className="chip-num">4</span>Historial</span>
        <button onClick={descargar} disabled={!h.length} className="rounded-lg border-2 border-tinta px-2 py-0.5 text-sm font-bold">⬇ CSV</button>
      </div>
      <div ref={caja} className="min-h-0 flex-1 overflow-auto rounded-xl border-2 border-slate-200">
        <table className="tabla text-[clamp(15px,2.1vh,21px)]">
          <thead><tr><th>#</th><th>Est.</th><th>Lee</th><th>Esc.</th><th>Mov</th><th>Nuevo</th><th className="max-[1400px]:hidden">Cinta</th></tr></thead>
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
                  <td className="max-[1400px]:hidden">{r.cinta}</td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
        {!h.length && <div className="p-6 text-center text-lg font-semibold text-gris">Aún no hay transiciones.<br />Presiona <b>Siguiente ▶</b></div>}
      </div>
      <div className="mt-2 text-[clamp(13px,1.8vh,17px)] font-bold text-gris">
        {h.length < total ? `${total - h.length} transiciones por registrar` : `${h.length} transiciones registradas ✓`}
        <span className="ml-2 font-medium max-[1300px]:hidden">· clic en fila = ir al paso</span>
      </div>
    </div>
  );
}
