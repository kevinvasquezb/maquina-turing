import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { validarEntrada } from './core/maquina.js';
import { useMaquina } from './core/useMaquina.js';
import Cabecera from './components/Cabecera.jsx';
import Inicio from './components/Inicio.jsx';
import Simulacion from './components/Simulacion.jsx';
import Pruebas from './components/Pruebas.jsx';
import Teoria from './components/Teoria.jsx';

const params = new URLSearchParams(location.search);
const wInicial = params.get('w');
const entradaInicial = wInicial && validarEntrada(wInicial).valida ? wInicial : 'XWHSVD';

export default function App() {
  const [vista, setVista] = useState(params.get('vista') || (wInicial ? 'simulacion' : 'inicio'));
  const [entrada, setEntrada] = useState(entradaInicial);
  const [sonidoOn, setSonidoOn] = useState(false);
  const maquina = useMaquina(entrada);

  // ?paso=N para abrir directo en un paso (útil para capturas del informe)
  const [pasoInicial] = useState(() => Number(params.get('paso')) || 0);

  const iniciar = (w) => { setEntrada(w); setVista('simulacion'); };

  return (
    <div className="flex h-full flex-col">
      <Cabecera vista={vista} setVista={setVista} sonidoOn={sonidoOn} setSonidoOn={setSonidoOn} />
      <AnimatePresence mode="wait">
        <motion.main
          key={vista}
          className="min-h-0 flex-1"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
        >
          {vista === 'inicio' && <Inicio inicial={entrada} onIniciar={iniciar} />}
          {vista === 'simulacion' && (
            <Simulacion maquina={maquina} sonidoOn={sonidoOn} pasoInicial={pasoInicial}
              onCambiarPalabra={() => setVista('inicio')} />
          )}
          {vista === 'pruebas' && <Pruebas onAbrir={iniciar} autoEjecutar={params.get('vista') === 'pruebas'} />}
          {vista === 'teoria' && <Teoria />}
        </motion.main>
      </AnimatePresence>
    </div>
  );
}
