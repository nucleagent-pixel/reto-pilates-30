import {
  addDoc,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  FieldPath,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import type { User } from "firebase/auth";
import { fb } from "./firebase";
import { fechaISO } from "./progreso";
import { CLASES } from "./clases";
import type { PerfilUsuario, Registro, Rutina, TipoRutina, UsuarioAdmin } from "./tipos";

/** Firestore no acepta campos "undefined": los quitamos. */
function limpiar<T extends object>(obj: T): T {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as T;
}

// ---------- Perfil ----------

function aPerfil(d: Record<string, unknown>): PerfilUsuario {
  return {
    email: (d.email as string) ?? "",
    nombre: (d.nombre as string) ?? "",
    completados: (d.completados as PerfilUsuario["completados"]) ?? {},
    diasActivos: (d.diasActivos as string[]) ?? [],
  };
}

export async function obtenerPerfil(uid: string) {
  const s = await getDoc(doc(fb().db, "usuarios", uid));
  return s.exists() ? aPerfil(s.data()) : null;
}

export async function asegurarPerfil(u: User) {
  const ref = doc(fb().db, "usuarios", u.uid);
  const s = await getDoc(ref);
  if (s.exists()) return aPerfil(s.data());
  const nuevo = {
    email: (u.email ?? "").toLowerCase(),
    nombre: u.displayName || "",
    completados: {},
    diasActivos: [],
  };
  await setDoc(ref, { ...nuevo, creado: serverTimestamp() });
  return aPerfil(nuevo);
}

export async function actualizarNombre(uid: string, nombre: string) {
  await updateDoc(doc(fb().db, "usuarios", uid), { nombre });
}

/** Marca como hecha una clase del reto ("1".."21") o una rutina rápida ("r1".."r9"). */
export async function completarClase(uid: string, clave: string) {
  await updateDoc(
    doc(fb().db, "usuarios", uid),
    new FieldPath("completados", clave),
    serverTimestamp(),
    "diasActivos",
    arrayUnion(fechaISO()),
  );
}

export async function registrarActividad(uid: string) {
  await updateDoc(doc(fb().db, "usuarios", uid), { diasActivos: arrayUnion(fechaISO()) });
}

// ---------- Registros (peso, medidas, ánimo, dolor) ----------

export async function agregarRegistro(uid: string, datos: Omit<Registro, "id" | "fecha">) {
  await addDoc(collection(fb().db, "usuarios", uid, "registros"), {
    ...limpiar(datos),
    fecha: serverTimestamp(),
  });
}

export async function obtenerRegistros(uid: string): Promise<Registro[]> {
  const s = await getDocs(
    query(collection(fb().db, "usuarios", uid, "registros"), orderBy("fecha", "desc"), limit(300)),
  );
  return s.docs.map((d) => ({ id: d.id, ...d.data() }) as Registro);
}

// ---------- Rutinas ----------

/**
 * Las 30 clases vienen incluidas en la app (lib/clases.ts).
 * Si editaste alguna desde el panel, lo guardado en la base de datos tiene prioridad.
 * Si la base de datos falla o está vacía, igual se muestran las clases incluidas.
 */
export async function obtenerRutinas(tipo?: TipoRutina): Promise<Rutina[]> {
  const base = new Map(CLASES.filter((c) => !tipo || c.tipo === tipo).map((c) => [c.id, c]));
  try {
    const ref = collection(fb().db, "rutinas");
    const s = await getDocs(tipo ? query(ref, where("tipo", "==", tipo)) : ref);
    for (const d of s.docs) {
      const guardada = { id: d.id, ...d.data() } as Rutina;
      base.set(d.id, { ...(base.get(d.id) ?? {}), ...guardada });
    }
  } catch (e) {
    console.warn("No se pudieron leer las clases guardadas; se usan las incluidas.", e);
  }
  return [...base.values()].sort((a, b) => (a.tipo === b.tipo ? a.orden - b.orden : a.tipo === "reto" ? -1 : 1));
}

export async function obtenerRutina(id: string): Promise<Rutina | null> {
  if (!id) return null;
  const incluida = CLASES.find((c) => c.id === id) ?? null;
  try {
    const s = await getDoc(doc(fb().db, "rutinas", id));
    if (s.exists()) return { ...(incluida ?? {}), id: s.id, ...s.data() } as Rutina;
  } catch (e) {
    console.warn("No se pudo leer la clase guardada; se usa la incluida.", e);
  }
  return incluida;
}

export async function guardarRutina(r: Rutina) {
  const { id, ...resto } = r;
  await setDoc(doc(fb().db, "rutinas", id), limpiar(resto), { merge: true });
}

/** Actualiza solo los campos que vienen (no borra lo que ya estaba escrito). */
export async function guardarRutinaParcial(r: Partial<Rutina> & { id: string }) {
  const { id, ...resto } = r;
  await setDoc(doc(fb().db, "rutinas", id), limpiar(resto), { merge: true });
}

/** Guarda las 30 clases (títulos, links, categorías). Conserva las descripciones y PDFs que ya escribiste. */
export async function cargarClases() {
  const { db } = fb();
  const lote = writeBatch(db);
  for (const c of CLASES) {
    const { id, descripcion: _d, ...resto } = c;
    lote.set(doc(db, "rutinas", id), limpiar(resto), { merge: true });
  }
  await lote.commit();
  return CLASES.length;
}

// ---------- Clientas (panel de admin) ----------

export async function listarUsuarios(): Promise<UsuarioAdmin[]> {
  const s = await getDocs(collection(fb().db, "usuarios"));
  return s.docs
    .map((d) => ({ ...aPerfil(d.data()), uid: d.id, creado: (d.data().creado as UsuarioAdmin["creado"]) ?? null }))
    .sort((a, b) => (b.creado?.toMillis() ?? 0) - (a.creado?.toMillis() ?? 0));
}

export async function listarBloqueados(): Promise<string[]> {
  const s = await getDocs(collection(fb().db, "bloqueados"));
  return s.docs.map((d) => d.id);
}

export async function cambiarBloqueo(email: string, bloquear: boolean) {
  const ref = doc(fb().db, "bloqueados", email.toLowerCase());
  if (bloquear) await setDoc(ref, { email: email.toLowerCase(), fecha: serverTimestamp() });
  else await deleteDoc(ref);
}
