import { useMemo, useRef, useState, useCallback } from 'react';
import { MaquinaTuring } from './maquina.js';

/* Conecta el motor (clase MaquinaTuring) con React.
   La máquina vive en un ref; cada acción la muta y pide re-dibujar. */
export function useMaquina(entrada) {
  const ref = useRef(null);
  if (!ref.current || ref.current.entrada !== entrada) ref.current = new MaquinaTuring(entrada);
  const m = ref.current;
  const [, setVersion] = useState(0);
  const [pulso, setPulso] = useState(0); // aumenta solo al AVANZAR (para animaciones)
  const redibujar = () => setVersion((v) => v + 1);

  const total = useMemo(() => {
    const c = new MaquinaTuring(entrada);
    c.ejecutarTodo();
    return c.historial.length;
  }, [entrada]);

  const siguiente = useCallback(() => { const r = m.paso(); if (r) setPulso((p) => p + 1); redibujar(); return r; }, [m]);
  const anterior = useCallback(() => { const ok = m.anterior(); redibujar(); return ok; }, [m]);
  const reiniciar = useCallback(() => { m.reiniciar(); redibujar(); }, [m]);
  const alFinal = useCallback(() => { m.ejecutarTodo(); redibujar(); }, [m]);
  const irA = useCallback((n) => { m.reiniciar(); for (let i = 0; i < n; i++) m.paso(); redibujar(); }, [m]);

  return { m, total, pulso, siguiente, anterior, reiniciar, alFinal, irA };
}
