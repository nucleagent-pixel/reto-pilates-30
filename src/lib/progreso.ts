import type { Timestamp } from "firebase/firestore";

/** Fecha local en formato AAAA-MM-DD. */
export function fechaISO(d: Date = new Date()) {
  const a = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${a}-${m}-${dia}`;
}

/** Días seguidos con actividad, contando hasta hoy (o hasta ayer si hoy aún no entrena). */
export function calcularRacha(dias: string[]): number {
  const set = new Set(dias);
  const d = new Date();
  if (!set.has(fechaISO(d))) {
    d.setDate(d.getDate() - 1);
    if (!set.has(fechaISO(d))) return 0;
  }
  let n = 0;
  while (set.has(fechaISO(d))) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

type Completados = Record<string, Timestamp | null>;

export function estaCompletado(dia: number, completados: Completados) {
  return String(dia) in completados;
}

/** Un día se desbloquea al completar el anterior. */
export function diaDesbloqueado(dia: number, completados: Completados) {
  return dia === 1 || estaCompletado(dia - 1, completados);
}

/** Primer día sin completar, o null si terminó el reto. */
export function diaActual(completados: Completados, total: number): number | null {
  for (let i = 1; i <= total; i++) if (!estaCompletado(i, completados)) return i;
  return null;
}

export function idReto(dia: number) {
  return `reto-${String(dia).padStart(2, "0")}`;
}
export function idRapida(n: number) {
  return `rapida-${String(n).padStart(2, "0")}`;
}

export function formatoFecha(ts: Timestamp | null | undefined, conHora = false) {
  if (!ts) return "Ahora";
  return ts.toDate().toLocaleDateString("es", {
    day: "numeric",
    month: "short",
    ...(conHora ? { hour: "numeric", minute: "2-digit" } : {}),
  });
}
