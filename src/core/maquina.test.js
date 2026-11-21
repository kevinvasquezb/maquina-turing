import { describe, it, expect } from 'vitest';
import { MaquinaTuring, validarEntrada, delta, retroceder } from './maquina.js';
import { ejecutarPruebas, oraculoCesarMenos3 } from './pruebas.js';

const TABLA_GUIA = [
  ['q0','X','W','R','q1','WWHSVD□'], ['q1','W','W','L','q2','WWHSVD□'], ['q2','W','U','R','q0','UWHSVD□'],
  ['q0','W','V','R','q1','UVHSVD□'], ['q1','H','H','L','q2','UVHSVD□'], ['q2','V','T','R','q0','UTHSVD□'],
  ['q0','H','G','R','q1','UTGSVD□'], ['q1','S','S','L','q2','UTGSVD□'], ['q2','G','E','R','q0','UTESVD□'],
  ['q0','S','R','R','q1','UTERVD□'], ['q1','V','V','L','q2','UTERVD□'], ['q2','R','P','R','q0','UTEPVD□'],
  ['q0','V','U','R','q1','UTEPUD□'], ['q1','D','D','L','q2','UTEPUD□'], ['q2','U','S','R','q0','UTEPSD□'],
  ['q0','D','C','R','q1','UTEPSC□'], ['q1','□','□','L','q2','UTEPSC□'], ['q2','C','A','R','q0','UTEPSA□'],
  ['q0','□','□','S','qf','UTEPSA□'],
];

describe('Máquina de Turing César −3', () => {
  it('reproduce EXACTAMENTE la tabla de 19 transiciones del docente (XWHSVD → UTEPSA)', () => {
    const m = new MaquinaTuring('XWHSVD');
    m.ejecutarTodo();
    expect(m.historial.map((h) => [h.estado, h.lee, h.escribe, h.mueve, h.siguiente, h.cinta])).toEqual(TABLA_GUIA);
    expect(m.resultado()).toBe('UTEPSA');
    expect(m.estado).toBe('qf');
  });
  it('alfabeto circular', () => {
    expect(retroceder('A', 1)).toBe('Z');
    expect(retroceder('B', 2)).toBe('Z');
    expect(new MaquinaTuring('AAAAA').ejecutarTodo() && true).toBe(true);
  });
  it('δ no tiene regla para q2 leyendo □', () => {
    expect(delta('q2', '□')).toBeNull();
  });
  it('rechaza entradas inválidas', () => {
    for (const w of ['ABCD', 'ABCDEFGHI', 'ABC DE', 'ABC12', 'ÑANDUS', 'ÁRBOL', 'xwhsvd', 'HOLA#', ''])
      expect(validarEntrada(w).valida).toBe(false);
  });
  it('coincide con el oráculo en todas las palabras de prueba', () => {
    for (const w of ['KHOOR', 'AAAAA', 'ZZZZZZZZ', 'ABCDEFGH']) {
      const m = new MaquinaTuring(w); const n = m.ejecutarTodo();
      expect(m.resultado()).toBe(oraculoCesarMenos3(w));
      expect(n).toBe(3 * w.length + 1);
    }
  });
  it('todo el plan de pruebas de la app pasa', () => {
    expect(ejecutarPruebas().every((r) => r.ok)).toBe(true);
  });
});
