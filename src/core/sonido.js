/* Efectos de sonido sintetizados con Web Audio (sin archivos de audio). */
let ctx = null;
function beep(freq, dur = 0.07, type = 'square', vol = 0.045) {
  try {
    ctx ??= new (window.AudioContext || window.webkitAudioContext)();
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(ctx.destination);
    o.start(t); o.stop(t + dur);
  } catch { /* sin audio: no pasa nada */ }
}
const TONO = { q0: 523, q1: 392, q2: 659, qf: 880 };
export const sonido = {
  paso: (estado) => beep(TONO[estado] ?? 440),
  atras: () => beep(300, 0.05, 'triangle'),
  final: () => [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => beep(f, 0.22, 'triangle', 0.07), i * 120)),
};
