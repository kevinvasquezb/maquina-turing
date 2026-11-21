/* =====================================================================
   PLAN DE PRUEBAS (se usa en la pestaña "Pruebas" y en Vitest)
   Cada caso ejecuta una máquina NUEVA transición por transición.
   El oráculo solo VERIFICA; la máquina no lo usa.
   ===================================================================== */
import { MaquinaTuring, validarEntrada, ALFABETO, retroceder } from './maquina.js';

export function oraculoCesarMenos3(palabra) {
  return [...palabra].map((c) => String.fromCharCode(((c.charCodeAt(0) - 65 - 3 + 26) % 26) + 65)).join('');
}
export function cifrarMas3(palabra) {
  return [...palabra].map((c) => retroceder(c, -3)).join('');
}
export function palabraAleatoria() {
  const n = 5 + Math.floor(Math.random() * 4);
  let w = '';
  for (let i = 0; i < n; i++) w += ALFABETO[Math.floor(Math.random() * 26)];
  return w;
}

export const CASOS = [
  { tipo: 'Normal (ejemplo guía)', entrada: 'XWHSVD', esperado: 'UTEPSA' },
  { tipo: 'Válida de 5 letras', entrada: 'KHOOR', esperado: 'HELLO' },
  { tipo: 'Circularidad', entrada: 'AAAAA', esperado: 'XXXXX' },
  { tipo: 'Circularidad A, B, C', entrada: 'ABCABC', esperado: 'XYZXYZ' },
  { tipo: 'Longitud máxima (8)', entrada: 'ABCDEFGH', esperado: 'XYZABCDE' },
  { tipo: 'Longitud: 4 letras', entrada: 'ABCD', esperado: null },
  { tipo: 'Longitud: 9 letras', entrada: 'ABCDEFGHI', esperado: null },
  { tipo: 'Espacios', entrada: 'ABC DE', esperado: null },
  { tipo: 'Números', entrada: 'ABC12', esperado: null },
  { tipo: 'Ñ', entrada: 'ÑANDUS', esperado: null },
  { tipo: 'Tildes', entrada: 'ÁRBOL', esperado: null },
  { tipo: 'Minúsculas', entrada: 'xwhsvd', esperado: null },
  { tipo: 'Símbolos', entrada: 'HOLA#', esperado: null },
];

export function ejecutarPruebas() {
  const res = [];
  for (const c of CASOS) {
    const v = validarEntrada(c.entrada);
    if (c.esperado === null) {
      res.push({ ...c, esperadoTxt: 'Rechazada', obtenido: v.valida ? 'Aceptada' : v.errores.join(' '),
        transiciones: '—', ok: !v.valida, cargable: false });
    } else {
      const m = new MaquinaTuring(c.entrada);
      const n = m.ejecutarTodo();
      const esp = 3 * c.entrada.length + 1;
      const ok = m.resultado() === c.esperado && m.estado === 'qf' && n === esp && m.leer() === '□';
      res.push({ ...c, esperadoTxt: c.esperado, obtenido: `${m.resultado()} (${m.estado})`,
        transiciones: `${n} = 3·${c.entrada.length}+1`, ok, cargable: true });
    }
  }
  {
    const a = new MaquinaTuring('XWHSVD'); for (let i = 0; i < 7; i++) a.paso(); a.anterior();
    const b = new MaquinaTuring('XWHSVD'); for (let i = 0; i < 6; i++) b.paso();
    const ok = JSON.stringify(a.configuracion()) === JSON.stringify(b.configuracion());
    res.push({ tipo: 'Botón «Anterior»', entrada: 'XWHSVD', esperadoTxt: '7 pasos − 1 = 6 pasos',
      obtenido: `${a.estado} · cabezal ${a.cabezal} · ${a.cinta.join('')}`, transiciones: a.historial.length, ok });
  }
  {
    const m = new MaquinaTuring('KHOOR'); m.ejecutarTodo(); m.reiniciar();
    const ok = m.estado === 'q0' && m.cabezal === 0 && m.cinta.join('') === 'KHOOR□' && m.historial.length === 0;
    res.push({ tipo: 'Botón «Reiniciar»', entrada: 'KHOOR', esperadoTxt: 'q0 · cabezal 0 · KHOOR□',
      obtenido: `${m.estado} · cabezal ${m.cabezal} · ${m.cinta.join('')}`, transiciones: m.historial.length, ok });
  }
  {
    let fallos = 0; const N = 200;
    for (let i = 0; i < N; i++) {
      const w = palabraAleatoria(); const m = new MaquinaTuring(w); const n = m.ejecutarTodo();
      if (m.resultado() !== oraculoCesarMenos3(w) || n !== 3 * w.length + 1 || m.estado !== 'qf') fallos++;
    }
    res.push({ tipo: '200 palabras aleatorias', entrada: 'al azar', esperadoTxt: '0 fallos vs oráculo',
      obtenido: `${fallos} fallos`, transiciones: '3·n+1', ok: fallos === 0 });
  }
  return res;
}
