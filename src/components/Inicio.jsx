import { useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { revisarRestricciones, validarEntrada } from '../core/maquina.js';
import { cifrarMas3, palabraAleatoria } from '../core/pruebas.js';

const EJEMPLOS = ['XWHSVD', 'KHOOR', 'AAAAA'];

/* Cinta decorativa que corre al fondo. */
function CintaFondo() {
  const letras = useMemo(() => Array.from({ length: 40 }, () => String.fromCharCode(65 + Math.floor(Math.random() * 26))), []);
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-4 overflow-hidden opacity-60" aria-hidden>
      <div className="cinta-corre flex w-max gap-2">
        {[...letras, ...letras].map((l, i) => (
          <span key={i} className="grid h-14 w-14 place-items-center rounded-lg border-2 border-slate-300 bg-white/70 font-mono text-2xl font-bold text-slate-400">{l}</span>
        ))}
      </div>
    </div>
  );
}

export default function Inicio({ inicial, onIniciar }) {
  const [texto, setTexto] = useState(inicial ?? '');
  const [foco, setFoco] = useState(true);
  const [claro, setClaro] = useState('');
  const [verCifrar, setVerCifrar] = useState(false);
  const input = useRef(null);

  const chars = [...texto];
  const checks = revisarRestricciones(texto);
  const valida = validarEntrada(texto).valida;
  const claroValido = validarEntrada(claro).valida;
  const casillas = Math.max(8, chars.length + (chars.length < 12 ? 1 : 0));

  const usar = (w) => { setTexto(w); input.current?.focus(); };
  const iniciar = () => valida && onIniciar(texto);

  return (
    <div className="relative flex h-full flex-col items-center overflow-y-auto px-6 pb-28 pt-[clamp(16px,4vh,48px)]">
      <CintaFondo />

      <motion.div initial={{ opacity: 0, scale: .9 }} animate={{ opacity: 1, scale: 1 }}
        className="mb-3 rounded-full bg-noche px-4 py-1.5 text-[clamp(13px,1.1vw,17px)] font-bold tracking-wide text-activo">
        🔐 MENSAJE INTERCEPTADO
      </motion.div>

      <h1 className="text-center text-[clamp(32px,4.4vw,68px)] font-bold leading-[1.02] tracking-tight">
        Bienvenido a la <span className="text-cabezal">Máquina de Turing</span>
      </h1>
      <p className="mt-2 text-center text-[clamp(18px,1.7vw,28px)] font-medium text-gris">
        ¿Cuál es la palabra a descifrar con <b className="text-escritura">César −3</b>?
      </p>

      {/* Casillas tipo cinta */}
      <div className="relative mt-[clamp(14px,3vh,36px)] cursor-text" onClick={() => input.current?.focus()}>
        <input
          ref={input} value={texto} autoFocus maxLength={12} spellCheck={false} autoComplete="off"
          aria-label="Palabra cifrada"
          onChange={(e) => setTexto(e.target.value)}
          onFocus={() => setFoco(true)} onBlur={() => setFoco(false)}
          onKeyDown={(e) => e.key === 'Enter' && iniciar()}
          className="absolute inset-0 z-10 h-full w-full cursor-text opacity-0"
        />
        <div className="perforada flex gap-[clamp(6px,.8vw,12px)] rounded-2xl bg-white px-4 shadow-[0_2px_0_#c3cddb] ring-2 ring-[#c3cddb]"
          style={{ '--c': 'clamp(54px, 7.2vw, 104px)' }}>
          {Array.from({ length: casillas }, (_, i) => {
            const ch = chars[i];
            const mala = ch !== undefined && (!/[A-Z]/.test(ch) || i >= 8);
            const opcional = i >= 5 && i < 8;
            return (
              <div key={i}
                className={`celda ${ch === undefined ? '' : ''} ${mala ? '!border-red-600 !bg-red-100 !text-red-700' : ch ? '!border-tinta' : ''} ${ch === undefined && opcional ? '!border-dashed' : ''} ${i >= 8 && ch === undefined ? 'hidden' : ''}`}>
                <AnimatePresence mode="popLayout">
                  {ch !== undefined && (
                    <motion.span key={ch + i} initial={{ y: -24, opacity: 0, rotateX: 80 }} animate={{ y: 0, opacity: 1, rotateX: 0 }}
                      exit={{ opacity: 0, scale: .6 }} transition={{ type: 'spring', stiffness: 500, damping: 26 }}>
                      {ch === ' ' ? '␣' : ch}
                    </motion.span>
                  )}
                </AnimatePresence>
                {ch === undefined && i === chars.length && foco && (
                  <span className="caret absolute bottom-[18%] h-[8%] w-[45%] rounded bg-cabezal" />
                )}
                <span className="idx">{i + 1}</span>
              </div>
            );
          })}
        </div>
        <div className="mt-2 flex justify-between px-2 text-[clamp(12px,1vw,15px)] font-semibold text-linea">
          <span>casillas 1–5 obligatorias</span><span>6–8 opcionales</span>
        </div>
      </div>

      {/* Checklist de restricciones */}
      <div className="mt-[clamp(10px,2.4vh,28px)] grid w-full max-w-[1240px] grid-cols-2 gap-x-6 gap-y-2 lg:grid-cols-3">
        {checks.map((c) => {
          const vacio = texto.length === 0;
          return (
            <motion.div key={c.id} layout
              animate={{ backgroundColor: vacio ? '#ffffff' : c.ok ? '#d1fadf' : '#fee2e2', borderColor: vacio ? '#c3cddb' : c.ok ? '#15803d' : '#dc2626' }}
              className="flex items-center gap-3 rounded-xl border-2 px-3 py-2 text-[clamp(15px,1.3vw,21px)] font-semibold">
              <motion.span key={vacio ? 'n' : c.ok ? 's' : 'x'} initial={{ scale: 0 }} animate={{ scale: 1 }}
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-lg font-bold text-white ${vacio ? 'bg-slate-400' : c.ok ? 'bg-listo' : 'bg-red-600'}`}>
                {vacio ? '•' : c.ok ? '✓' : '✕'}
              </motion.span>
              <span>{c.texto}{c.detalle && !vacio ? <span className="ml-1 font-mono text-gris">({c.detalle})</span> : null}</span>
            </motion.div>
          );
        })}
      </div>

      {/* Acciones */}
      <div className="mt-[clamp(14px,3vh,32px)] flex flex-wrap items-center justify-center gap-3">
        <motion.button whileHover={{ scale: valida ? 1.04 : 1 }} onClick={iniciar} disabled={!valida}
          className="btn btn-exito !px-8 !text-[clamp(20px,1.8vw,30px)]">
          Descifrar ▶
        </motion.button>
        <span className="mx-1 font-semibold text-gris">o prueba:</span>
        {EJEMPLOS.map((w) => (
          <button key={w} onClick={() => usar(w)} className="btn font-mono">{w}</button>
        ))}
        <button onClick={() => usar(palabraAleatoria())} className="btn">🎲 Aleatoria</button>
        <button onClick={() => setVerCifrar(!verCifrar)} className="btn">🔒 Cifrar mi palabra</button>
      </div>

      <AnimatePresence>
        {verCifrar && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="mt-4 overflow-hidden">
            <div className="tarjeta flex flex-wrap items-center gap-3 px-5 py-3 text-[clamp(16px,1.3vw,20px)]">
              <span className="font-semibold">Palabra en claro:</span>
              <input value={claro} onChange={(e) => setClaro(e.target.value)} maxLength={12} placeholder="HOLAS"
                className="w-[200px] rounded-xl border-2 border-tinta px-3 py-1.5 font-mono text-2xl font-bold tracking-[.2em] outline-none" />
              {claroValido ? (
                <>
                  <span className="font-mono text-2xl font-bold">→ César +3 → <span className="text-escritura">{cifrarMas3(claro)}</span></span>
                  <button className="btn btn-naranja" onClick={() => { usar(cifrarMas3(claro)); setVerCifrar(false); }}>Usar</button>
                </>
              ) : <span className="text-gris">5 a 8 letras A–Z</span>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
