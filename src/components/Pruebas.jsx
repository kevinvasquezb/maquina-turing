import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ejecutarPruebas } from '../core/pruebas.js';

export default function Pruebas({ onAbrir, autoEjecutar }) {
  const [res, setRes] = useState(null);
  const [corrida, setCorrida] = useState(0);
  const correr = () => { setRes(ejecutarPruebas()); setCorrida((c) => c + 1); };
  useEffect(() => { if (autoEjecutar) correr(); }, []); // eslint-disable-line
  const ok = res?.filter((r) => r.ok).length ?? 0;

  return (
    <div className="h-full overflow-auto p-[clamp(10px,2vh,24px)]">
      <div className="tarjeta mx-auto max-w-[1400px] p-5">
        <div className="flex flex-wrap items-center gap-4">
          <h2 className="text-[clamp(24px,2.4vw,36px)] font-bold">Plan de pruebas automáticas</h2>
          {res && (
            <motion.span key={corrida} initial={{ scale: .5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className={`rounded-full px-4 py-1 text-[clamp(18px,1.6vw,24px)] font-bold text-white ${ok === res.length ? 'bg-listo' : 'bg-red-600'}`}>
              {ok} / {res.length} correctas
            </motion.span>
          )}
          <button onClick={correr} className="btn btn-primario ml-auto">▶ Ejecutar pruebas</button>
        </div>
        <p className="mt-2 text-[clamp(15px,1.25vw,19px)] font-medium text-gris">
          Cada caso crea una máquina nueva y la ejecuta transición por transición. El resultado se compara con un <b>oráculo</b> independiente
          (aritmética de códigos de letra) que la máquina NO usa. Clic en un caso válido para verlo en el simulador.
        </p>
        {res && (
          <table className="tabla mt-4 text-[clamp(14px,1.25vw,19px)]">
            <thead><tr><th>#</th><th>Tipo</th><th>Entrada</th><th>Esperado</th><th>Obtenido</th><th>Transiciones</th><th>Resultado</th></tr></thead>
            <tbody>
              {res.map((r, i) => (
                <motion.tr key={`${corrida}-${i}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * .04 }}
                  onClick={() => r.cargable && onAbrir(r.entrada)} className={r.cargable ? 'cursor-pointer hover:bg-slate-100' : ''}>
                  <td>{i + 1}</td>
                  <td className="!font-sans">{r.tipo}</td>
                  <td>{r.entrada}</td><td>{r.esperadoTxt}</td>
                  <td className="!font-sans">{r.obtenido}</td><td>{r.transiciones}</td>
                  <td><span className={`rounded-full px-3 py-0.5 font-sans font-bold text-white ${r.ok ? 'bg-listo' : 'bg-red-600'}`}>{r.ok ? '✓ Correcto' : '✕ Falló'}</span></td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
