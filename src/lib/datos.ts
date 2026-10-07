import {
  addDoc,
  arrayUnion,
  collection,
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
import { fechaISO, idRapida, idReto } from "./progreso";
import { MARCA } from "./marca";
import type { Acceso, PerfilUsuario, Registro, Rutina, TipoRutina } from "./tipos";

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

export async function asegurarPerfil(u: User, nombreAcceso?: string) {
  const ref = doc(fb().db, "usuarios", u.uid);
  const s = await getDoc(ref);
  if (s.exists()) return aPerfil(s.data());
  const nuevo = {
    email: (u.email ?? "").toLowerCase(),
    nombre: u.displayName || nombreAcceso || "",
    completados: {},
    diasActivos: [],
  };
  await setDoc(ref, { ...nuevo, creado: serverTimestamp() });
  return aPerfil(nuevo);
}

export async function actualizarNombre(uid: string, nombre: string) {
  await updateDoc(doc(fb().db, "usuarios", uid), { nombre });
}

export async function completarDia(uid: string, dia: number) {
  await updateDoc(
    doc(fb().db, "usuarios", uid),
    new FieldPath("completados", String(dia)),
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

export async function obtenerRutinas(tipo?: TipoRutina): Promise<Rutina[]> {
  const ref = collection(fb().db, "rutinas");
  const s = await getDocs(tipo ? query(ref, where("tipo", "==", tipo)) : ref);
  return s.docs
    .map((d) => ({ id: d.id, ...d.data() }) as Rutina)
    .sort((a, b) => (a.tipo === b.tipo ? a.orden - b.orden : a.tipo === "reto" ? -1 : 1));
}

export async function obtenerRutina(id: string): Promise<Rutina | null> {
  if (!id) return null;
  const s = await getDoc(doc(fb().db, "rutinas", id));
  return s.exists() ? ({ id: s.id, ...s.data() } as Rutina) : null;
}

export async function guardarRutina(r: Rutina) {
  const { id, ...resto } = r;
  await setDoc(doc(fb().db, "rutinas", id), limpiar(resto), { merge: true });
}

/** Crea las clases base que falten (sin sobreescribir las existentes). */
export async function crearRutinasBase() {
  const { db } = fb();
  const existentes = new Set((await getDocs(collection(db, "rutinas"))).docs.map((d) => d.id));
  const lote = writeBatch(db);
  let creadas = 0;
  for (let i = 1; i <= MARCA.totalDias; i++) {
    const id = idReto(i);
    if (existentes.has(id)) continue;
    lote.set(doc(db, "rutinas", id), {
      tipo: "reto",
      orden: i,
      titulo: `Día ${i}`,
      duracion: "",
      zona: "",
      descripcion: "",
      videoUrl: "",
    });
    creadas++;
  }
  for (let i = 1; i <= MARCA.totalRapidas; i++) {
    const id = idRapida(i);
    if (existentes.has(id)) continue;
    lote.set(doc(db, "rutinas", id), {
      tipo: "rapida",
      orden: i,
      titulo: `Rutina rápida ${i}`,
      duracion: "",
      zona: "",
      descripcion: "",
      videoUrl: "",
    });
    creadas++;
  }
  if (creadas) await lote.commit();
  return creadas;
}

// ---------- Accesos (panel de admin) ----------

export async function listarAccesos(): Promise<Acceso[]> {
  const s = await getDocs(collection(fb().db, "accesos"));
  return s.docs
    .map((d) => d.data() as Acceso)
    .sort((a, b) => (b.creado?.toMillis() ?? 0) - (a.creado?.toMillis() ?? 0));
}

export async function guardarAcceso(datos: Omit<Acceso, "activo" | "creado">) {
  const email = datos.email.trim().toLowerCase();
  const ref = doc(fb().db, "accesos", email);
  const existe = (await getDoc(ref)).exists();
  await setDoc(
    ref,
    limpiar({
      ...datos,
      email,
      activo: true,
      ...(existe ? {} : { creado: serverTimestamp() }),
    }),
    { merge: true },
  );
  return email;
}

export async function cambiarActivo(email: string, activo: boolean) {
  await updateDoc(doc(fb().db, "accesos", email), { activo });
}
