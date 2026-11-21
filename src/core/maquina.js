/* =====================================================================
   MOTOR DE LA MÁQUINA DE TURING — Descifrado César −3
   ---------------------------------------------------------------------
   Este archivo NO sabe nada de la interfaz (HTML). Solo modela la
   máquina formal:  M = (Q, Σ, Γ, δ, q0, □, F)

     Q  = { q0, q1, q2, qf }        estados
     Σ  = { A … Z }                 alfabeto de entrada
     Γ  = Σ ∪ { □ }                 alfabeto de la cinta
     q0 = estado inicial,  F = { qf }

   La palabra NUNCA se descifra de golpe: cada llamada a paso() lee UN
   símbolo, busca UNA regla en δ, escribe, mueve el cabezal y cambia de
   estado. El resultado aparece en la cinta como consecuencia de eso.
   ===================================================================== */
const BLANCO = '□';
const ALFABETO = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const ESTADO_INICIAL = 'q0';
const ESTADO_FINAL = 'qf';
const MOVIMIENTO = { R: +1, L: -1, S: 0 };   // derecha, izquierda, permanecer

const esLetra = (s) => typeof s === 'string' && s.length === 1 && ALFABETO.includes(s);

/* Retrocede k posiciones en el alfabeto CIRCULAR (A − 1 = Z). */
function retroceder(letra, k) {
  const i = ALFABETO.indexOf(letra);
  return ALFABETO[(((i - k) % 26) + 26) % 26];
}

/* -------------------------------------------------------------------
   FUNCIÓN DE TRANSICIÓN δ  (las 4 familias de reglas oficiales)
   Cada regla: si estoy en `estado` y el símbolo leído cumple `acepta`,
   escribo `escribir(símbolo)`, muevo `mueve` y paso a `siguiente`.
   ------------------------------------------------------------------- */
const REGLAS = [
  { id: 'R1', estado: 'q0', lee: 'x ∈ A–Z',     escribe: 'prev(x)',  mueve: 'R', siguiente: 'q1',
    acepta: (s) => esLetra(s),                 escribir: (s) => retroceder(s, 1),
    etiqueta: 'Letra: −1, R' },
  { id: 'R2', estado: 'q1', lee: 'x ∈ A–Z o □', escribe: 'x', mueve: 'L', siguiente: 'q2',
    acepta: (s) => esLetra(s) || s === BLANCO, escribir: (s) => s,
    etiqueta: 'Letra/□: igual, L' },
  { id: 'R3', estado: 'q2', lee: 'x ∈ A–Z',     escribe: 'prev²(x)', mueve: 'R', siguiente: 'q0',
    acepta: (s) => esLetra(s),                 escribir: (s) => retroceder(s, 2),
    etiqueta: 'Letra: −2, R' },
  { id: 'R4', estado: 'q0', lee: '□',           escribe: '□',        mueve: 'S', siguiente: 'qf',
    acepta: (s) => s === BLANCO,               escribir: (s) => s,
    etiqueta: '□: igual, S' },
];

/* δ(estado, símbolo) → regla aplicable, o null si la máquina no tiene regla. */
function delta(estado, simbolo) {
  return REGLAS.find((r) => r.estado === estado && r.acepta(simbolo)) || null;
}

/* -------------------------------------------------------------------
   VALIDACIÓN DE ENTRADA: 5 a 8 letras A–Z mayúsculas.
   Devuelve todos los motivos de rechazo (no solo el primero).
   ------------------------------------------------------------------- */
function validarEntrada(texto) {
  const errores = [];
  const t = String(texto ?? '');
  if (t.length === 0) return { valida: false, errores: ['Escribe una palabra.'] };

  const sinEnie = t.replace(/[ñÑ]/g, '');
  const base = t.normalize('NFD').replace(/[̀-ͯ]/g, '');

  if (/\s/.test(t)) errores.push('Contiene espacios.');
  if (/\d/.test(t)) errores.push('Contiene números.');
  if (/[ñÑ]/.test(t)) errores.push('Contiene Ñ.');
  if (/[̀-ͯ]/.test(sinEnie.normalize('NFD'))) errores.push('Contiene tildes o diéresis.');
  if (/[a-z]/.test(base.replace(/ñ/g, ''))) errores.push('Contiene minúsculas (solo MAYÚSCULAS).');
  if (/[^A-Za-z0-9\s]/.test(base)) errores.push('Contiene símbolos especiales.');

  const n = [...t].length;
  if (n < 5) errores.push(`Muy corta: ${n} caracteres (mínimo 5).`);
  if (n > 8) errores.push(`Muy larga: ${n} caracteres (máximo 8).`);

  if (errores.length === 0 && !/^[A-Z]{5,8}$/.test(t)) errores.push('Entrada no válida.');
  return { valida: errores.length === 0, errores };
}

/* -------------------------------------------------------------------
   LA MÁQUINA
   Configuración = (cinta, posición del cabezal, estado).
   ------------------------------------------------------------------- */
class MaquinaTuring {
  constructor(entrada) {
    const v = validarEntrada(entrada);
    if (!v.valida) throw new Error(v.errores.join(' '));
    this.entrada = entrada;
    this.reiniciar();
  }

  /* Vuelve a la configuración inicial: cinta = entrada + □, cabezal en 0, estado q0. */
  reiniciar() {
    this.cinta = [...this.entrada, BLANCO];
    this.cabezal = 0;
    this.estado = ESTADO_INICIAL;
    this.historial = [];   // transiciones ejecutadas (para la tabla)
    this.pila = [];        // configuraciones anteriores (para «Anterior»)
    this.error = null;
  }

  get detenida() { return this.estado === ESTADO_FINAL || this.error !== null; }
  get aceptada() { return this.estado === ESTADO_FINAL; }

  leer() { return this.cinta[this.cabezal] ?? BLANCO; }

  /* Regla que se aplicaría ahora (sin ejecutarla). */
  proximaRegla() { return this.detenida ? null : delta(this.estado, this.leer()); }

  /* Ejecuta EXACTAMENTE una transición. Devuelve el registro o null. */
  paso() {
    if (this.detenida) return null;

    const lee = this.leer();
    const regla = delta(this.estado, lee);
    if (!regla) { this.error = `No existe δ(${this.estado}, ${lee}).`; return null; }

    const nuevaPos = this.cabezal + MOVIMIENTO[regla.mueve];
    if (nuevaPos < 0) { this.error = 'El cabezal intentó salir por la izquierda de la cinta.'; return null; }

    // Guardar configuración actual para poder retroceder.
    this.pila.push({ cinta: this.cinta.slice(), cabezal: this.cabezal, estado: this.estado });

    const posicion = this.cabezal;
    const estadoAntes = this.estado;
    const escribe = regla.escribir(lee);

    this.cinta[posicion] = escribe;                       // 1) escribir
    this.cabezal = nuevaPos;                              // 2) mover
    if (this.cabezal >= this.cinta.length) this.cinta.push(BLANCO); // cinta infinita a la derecha
    this.estado = regla.siguiente;                        // 3) cambiar de estado

    const registro = {
      paso: this.historial.length + 1,
      estado: estadoAntes, lee, escribe,
      mueve: regla.mueve, siguiente: regla.siguiente,
      regla: regla.id, posicion, cabezalDespues: this.cabezal,
      cinta: this.cinta.join(''),
    };
    this.historial.push(registro);
    return registro;
  }

  /* Restaura la configuración anterior (deshace una transición). */
  anterior() {
    if (this.pila.length === 0) return false;
    const c = this.pila.pop();
    this.cinta = c.cinta; this.cabezal = c.cabezal; this.estado = c.estado;
    this.error = null;
    this.historial.pop();
    return true;
  }

  /* Ejecuta hasta llegar a qf (con un límite de seguridad). */
  ejecutarTodo(limite = 10000) {
    let n = 0;
    while (!this.detenida && n < limite) { this.paso(); n++; }
    return n;
  }

  /* Palabra en la cinta sin los blancos. */
  resultado() { return this.cinta.filter((s) => s !== BLANCO).join(''); }

  configuracion() {
    return { cinta: this.cinta.join(''), cabezal: this.cabezal, estado: this.estado, pasos: this.historial.length };
  }
}


export {
  BLANCO, ALFABETO, ESTADO_INICIAL, ESTADO_FINAL, MOVIMIENTO,
  REGLAS, delta, retroceder, esLetra, validarEntrada, MaquinaTuring,
};

/* Checklist de restricciones para la pantalla de bienvenida (cada una por separado). */
export function revisarRestricciones(texto) {
  const t = String(texto ?? '');
  const n = [...t].length;
  const base = t.normalize('NFD').replace(/[̀-ͯ]/g, '');
  return [
    { id: 'largo', texto: 'Entre 5 y 8 caracteres', ok: n >= 5 && n <= 8, detalle: `${n}` },
    { id: 'mayus', texto: 'Solo mayúsculas A–Z', ok: n > 0 && !/[a-z]/.test(base) },
    { id: 'espacios', texto: 'Sin espacios', ok: !/\s/.test(t) },
    { id: 'numeros', texto: 'Sin números', ok: !/\d/.test(t) },
    { id: 'enie', texto: 'Sin Ñ ni tildes', ok: !/[ñÑ]/.test(t) && !/[̀-ͯ]/.test(t.normalize('NFD')) },
    { id: 'simbolos', texto: 'Sin símbolos (#, -, ., …)', ok: !/[^A-Za-z0-9\s]/.test(base) },
  ];
}
