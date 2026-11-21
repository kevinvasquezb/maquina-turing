import { motion } from 'framer-motion';

const VISTAS = [
  { id: 'inicio', texto: 'Inicio' },
  { id: 'simulacion', texto: 'Simulación' },
  { id: 'pruebas', texto: 'Pruebas' },
  { id: 'teoria', texto: '¿Cómo funciona?' },
];

function pantallaCompleta() {
  if (document.fullscreenElement) document.exitFullscreen?.();
  else document.documentElement.requestFullscreen?.().catch(() => {});
}

export default function Cabecera({ vista, setVista, sonidoOn, setSonidoOn }) {
  return (
    <header className="flex h-[64px] shrink-0 items-center justify-between gap-4 bg-noche px-5 text-white">
      <button onClick={() => setVista('inicio')} className="flex items-center gap-3 text-left">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-activo font-serif text-[28px] font-bold text-noche">δ</span>
        <span className="leading-tight">
          <span className="block text-[clamp(16px,1.5vw,22px)] font-bold">Máquina de Turing</span>
          <span className="block text-[13px] font-medium text-slate-300">Descifrador César −3 · UTEPSA</span>
        </span>
      </button>

      <nav className="relative flex gap-1 rounded-2xl bg-white/10 p-1">
        {VISTAS.map((v) => (
          <button key={v.id} onClick={() => setVista(v.id)}
            className={`relative z-10 rounded-xl px-[clamp(10px,1.2vw,20px)] py-2 text-[clamp(14px,1.15vw,18px)] font-bold transition-colors ${vista === v.id ? 'text-noche' : 'text-slate-200 hover:text-white'}`}>
            {vista === v.id && (
              <motion.span layoutId="pestana" className="absolute inset-0 -z-10 rounded-xl bg-white"
                transition={{ type: 'spring', stiffness: 420, damping: 34 }} />
            )}
            {v.texto}
          </button>
        ))}
      </nav>

      <div className="flex gap-2">
        <button onClick={() => setSonidoOn(!sonidoOn)} title="Sonido"
          className="rounded-xl bg-white/10 px-3 py-2 text-xl hover:bg-white/20">{sonidoOn ? '🔊' : '🔇'}</button>
        <button onClick={pantallaCompleta} title="Pantalla completa (ideal para el proyector)"
          className="rounded-xl bg-white/10 px-3 py-2 text-xl hover:bg-white/20">⛶</button>
      </div>
    </header>
  );
}
