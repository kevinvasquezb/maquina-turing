import { motion } from 'framer-motion';
import { REGLAS } from '../core/maquina.js';

const Tarjeta = ({ titulo, children, i }) => (
  <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * .08 }}
    className="tarjeta p-5 text-[clamp(17px,1.4vw,22px)] leading-relaxed">
    <h2 className="mb-2 text-[clamp(20px,1.8vw,28px)] font-bold">{titulo}</h2>
    {children}
  </motion.section>
);
const Formula = ({ children }) => (
  <div className="my-2 inline-block rounded-xl bg-noche px-4 py-2 font-mono text-[clamp(18px,1.6vw,26px)] font-bold text-activo">{children}</div>
);

export default function Teoria() {
  return (
    <div className="h-full overflow-auto p-[clamp(10px,2vh,24px)]">
      <div className="mx-auto grid max-w-[1400px] gap-4 md:grid-cols-2">
        <Tarjeta titulo="Función de transición δ" i={0}>
          <table className="tabla">
            <thead><tr><th>Regla</th><th>Estado</th><th>Lee</th><th>Escribe</th><th>Mueve</th><th>Siguiente</th></tr></thead>
            <tbody>{REGLAS.map((r) => (
              <tr key={r.id}><td>{r.id}</td><td>{r.estado}</td><td>{r.lee}</td><td>{r.escribe}</td><td>{r.mueve}</td><td>{r.siguiente}</td></tr>
            ))}</tbody>
          </table>
          <p className="mt-2 text-gris">prev(x) = letra anterior en el alfabeto circular · prev²(x) = dos anteriores</p>
        </Tarjeta>
        <Tarjeta titulo="Definición formal" i={0}>
          <Formula>M = (Q, Σ, Γ, δ, q0, □, F)</Formula>
          <ul className="list-disc pl-6">
            <li><b>Q</b> = {'{'} q0, q1, q2, qf {'}'} — estados</li>
            <li><b>Σ</b> = {'{'} A … Z {'}'} — alfabeto de entrada</li>
            <li><b>Γ</b> = Σ ∪ {'{'} □ {'}'} — alfabeto de la cinta</li>
            <li><b>q0</b> inicial · <b>F</b> = {'{'} qf {'}'} final</li>
            <li><b>δ</b>: Q × Γ → Q × Γ × {'{'} L, R, S {'}'}</li>
          </ul>
        </Tarjeta>
        <Tarjeta titulo="¿Por qué −1 y después −2?" i={1}>
          <p>La máquina no resta 3 de golpe. <b>q0</b> resta 1 y avanza; <b>q1</b> no cambia nada, solo regresa el cabezal; <b>q2</b> resta 2 más en la misma casilla.</p>
          <Formula>−1 −2 = −3 · transiciones = 3·n + 1</Formula>
          <p>Para 6 letras: 3·6 + 1 = <b>19</b>.</p>
        </Tarjeta>
        <Tarjeta titulo="Una letra: X → U" i={2}>
          <ol className="list-decimal pl-6 font-mono font-semibold">
            <li>δ(q0, X) = (q1, W, R)</li>
            <li>δ(q1, W) = (q2, W, L)</li>
            <li>δ(q2, W) = (q0, U, R)</li>
          </ol>
          <p className="mt-2">Al final: δ(q0, □) = (qf, □, S) → la máquina se detiene.</p>
        </Tarjeta>
        <Tarjeta titulo="Alfabeto circular" i={3}>
          <p>Si al retroceder se pasa de la A, vuelve a la Z:</p>
          <Formula>nueva = (i − k) mod 26</Formula>
          <p>A − 1 = Z · B − 2 = Z · A − 3 = X → por eso <b>AAAAA → XXXXX</b>.</p>
          <p className="mt-1 text-gris">R = derecha · L = izquierda · S = permanecer · □ = blanco</p>
        </Tarjeta>
      </div>
    </div>
  );
}
