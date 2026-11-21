import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import Grafo from './Grafo.jsx';
import Cinta, { Leyenda } from './Cinta.jsx';
import Narracion from './Narracion.jsx';
import Historial, { TablaDelta } from './Historial.jsx';
import { sonido } from '../core/sonido.js';

const VELOCIDADES = [1500, 1000, 650, 380, 180];

export default function Simulacion({ maquina, sonidoOn, pasoInicial, onCambiarPalabra }) {
  const { m, total, pulso, siguiente, anterior, reiniciar, alFinal, irA } = maquina;
  const [modo, setModo] = useState('paso');        // 'paso' | 'fluido'
  const [reproduciendo, setReproduciendo] = useState(false);
  const [vel, setVel] = useState(3);
  const ultimo = m.historial[m.historial.length - 1] || null;
  const yaCelebrado = useRef(false);

  useEffect(() => { if (pasoInicial) irA(Math.min(pasoInicial, total)); }, []); // eslint-disable-line

  const avanzar = () => {
    const r = siguiente();
    if (r && sonidoOn) sonido.paso(r.siguiente);
    return r;
  };

  // Modo fluido: una transición cada X ms
  useEffect(() => {
    if (!reproduciendo) return;
    const id = setInterval(() => {
      if (m.detenida) { setReproduciendo(false); return; }
      avanzar();
    }, VELOCIDADES[vel - 1]);
    return () => clearInterval(id);
  }, [reproduciendo, vel, m, sonidoOn]); // eslint-disable-line

  // Celebración al llegar a qf
  useEffect(() => {
    if (m.aceptada && !yaCelebrado.current) {
      yaCelebrado.current = true;
      setReproduciendo(false);
      if (sonidoOn) sonido.final();
      const colores = ['#15803d', '#1d4ed8', '#ea580c', '#facc15'];
      confetti({ particleCount: 140, spread: 80, origin: { y: .55 }, colors: colores });
      setTimeout(() => confetti({ particleCount: 80, angle: 60, spread: 60, origin: { x: 0, y: .7 }, colors: colores }), 250);
      setTimeout(() => confetti({ particleCount: 80, angle: 120, spread: 60, origin: { x: 1, y: .7 }, colors: colores }), 400);
    }
    if (!m.aceptada) yaCelebrado.current = false;
  });

  // Atajos de teclado
  useEffect(() => {
    const tecla = (e) => {
      if (e.target.closest('input')) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); setReproduciendo(false); avanzar(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); setReproduciendo(false); anterior(); }
      else if (e.key === ' ') { e.preventDefault(); setModo('fluido'); setReproduciendo((r) => { if (!r && m.detenida) reiniciar(); return !r; }); }
      else if (e.key.toLowerCase() === 'r') { setReproduciendo(false); reiniciar(); }
      else if (e.key.toLowerCase() === 'f') { setReproduciendo(false); alFinal(); }
    };
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  });

  const play = () => {
    if (reproduciendo) return setReproduciendo(false);
    if (m.detenida) reiniciar();
    setReproduciendo(true);
  };

  const n = m.historial.length;

  return (
    <div className="grid h-full grid-rows-[auto_minmax(0,1fr)] gap-[1.4vh] p-[clamp(8px,1.4vh,18px)]">
      {/* ===== Barra superior ===== */}
      <div className="tarjeta flex flex-wrap items-center gap-x-[clamp(8px,1.4vw,20px)] gap-y-2 px-4 py-2">
        <div className="flex items-center gap-3">
          <div>
            <div className="text-[11px] font-bold uppercase leading-none tracking-wide text-gris">Palabra cifrada</div>
            <div className="font-mono text-[clamp(22px,3.4vh,36px)] font-extrabold leading-none tracking-[.12em]">
              {m.entrada}{m.aceptada && <span className="text-listo"> → {m.resultado()}</span>}
            </div>
          </div>
          <button onClick={onCambiarPalabra} title="Cambiar palabra" className="rounded-lg border-2 border-slate-400 px-2 py-1 text-sm font-bold text-gris hover:border-tinta hover:text-tinta">✎<span className="max-[1250px]:hidden"> cambiar</span></button>
        </div>

        <div className="min-w-[90px] flex-1">
          <div className="flex items-baseline justify-between font-mono font-extrabold">
            <span className="text-[12px] uppercase tracking-wide text-gris">Paso</span>
            <span className="text-[clamp(20px,3vh,30px)] text-cabezal">{String(n).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>
          </div>
          <div className="mt-1 h-3 overflow-hidden rounded-full bg-slate-200">
            <motion.div className="h-full rounded-full bg-gradient-to-r from-cabezal to-listo"
              animate={{ width: `${(100 * n) / total}%` }} transition={{ type: 'spring', stiffness: 120, damping: 20 }} />
          </div>
        </div>

        {/* selector de modo */}
        <div className="relative flex rounded-2xl border-2 border-tinta bg-white p-1">
          {[['paso', 'Paso a paso'], ['fluido', 'Fluido']].map(([id, txt]) => (
            <button key={id} onClick={() => { setModo(id); if (id === 'paso') setReproduciendo(false); }}
              className={`relative z-10 rounded-xl px-3 py-1.5 text-[clamp(14px,1.2vw,18px)] font-bold ${modo === id ? 'text-white' : 'text-tinta'}`}>
              {modo === id && <motion.span layoutId="modo" className="absolute inset-0 -z-10 rounded-xl bg-tinta" />}
              {txt}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button className="btn btn-icono" onClick={() => { setReproduciendo(false); reiniciar(); }} disabled={!n} title="Reiniciar (R)">⟲</button>
          {modo === 'paso' ? (
            <>
              <button className="btn" onClick={() => { if (anterior() && sonidoOn) sonido.atras(); }} disabled={!n} title="Anterior (←)">◀<span className="max-[1250px]:hidden"> Anterior</span></button>
              <button className="btn btn-primario" onClick={avanzar} disabled={m.detenida} title="Siguiente (→)">Siguiente ▶</button>
            </>
          ) : (
            <>
              <button className={`btn ${reproduciendo ? 'btn-naranja' : 'btn-primario'} min-w-[8em]`} onClick={play} title="Espacio">
                {reproduciendo ? '❚❚ Pausar' : m.detenida ? '⟲ Repetir' : '▶ Ejecutar'}
              </button>
              <label className="flex items-center gap-1 text-xl" title="Velocidad">
                🐢<input type="range" min="1" max="5" value={vel} onChange={(e) => setVel(+e.target.value)} className="w-[90px] accent-cabezal" />🐇
              </label>
            </>
          )}
          <button className="btn btn-icono" onClick={() => { setReproduciendo(false); alFinal(); }} disabled={m.detenida} title="Ir al final (F)">⏭</button>
        </div>
      </div>

      {/* ===== Cuerpo ===== */}
      <div className="grid min-h-0 grid-cols-[minmax(0,1fr)_clamp(330px,31vw,560px)] gap-[1.4vh]">
        <div className="grid min-h-0 grid-rows-[minmax(170px,1fr)_auto_auto] gap-[1.4vh]">
          <section className="tarjeta flex min-h-0 flex-col px-4 pb-1 pt-2">
            <span className="titulo-tarjeta"><span className="chip-num">1</span>Grafo · estado y transición activa</span>
            <div className="min-h-0 flex-1">
              <Grafo estado={m.estado} ultimaRegla={ultimo?.regla} proximaRegla={m.proximaRegla()?.id} pulso={pulso} aceptada={m.aceptada} />
            </div>
          </section>

          <section className="tarjeta px-4 pb-2.5 pt-2.5">
            <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
              <span className="titulo-tarjeta"><span className="chip-num">2</span>Cintas y cabezal</span>
              <Leyenda />
            </div>
            <Cinta m={m} ultimo={ultimo} />
          </section>

          <section className={`tarjeta px-4 py-2.5 transition-colors ${m.aceptada ? '!border-listo !bg-[#f0fdf4]' : ''}`}>
            <Narracion m={m} ultimo={ultimo} />
          </section>
        </div>

        <aside className="tarjeta flex min-h-0 flex-col gap-3 px-3.5 py-3">
          <div>
            <span className="titulo-tarjeta mb-2"><span className="chip-num">δ</span>Función de transición</span>
            <TablaDelta m={m} ultimo={ultimo} />
          </div>
          <Historial m={m} total={total} onIr={(p) => { setReproduciendo(false); irA(p); }} />
        </aside>
      </div>
    </div>
  );
}
