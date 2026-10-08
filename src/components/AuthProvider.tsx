"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { fb } from "@/lib/firebase";
import { asegurarPerfil, obtenerPerfil } from "@/lib/datos";
import type { PerfilUsuario } from "@/lib/tipos";

interface EstadoAuth {
  user: User | null;
  cargando: boolean;
  tieneAcceso: boolean;
  esAdmin: boolean;
  diagnostico: string;
  perfil: PerfilUsuario | null;
  refrescarPerfil: () => Promise<void>;
  cerrarSesion: () => Promise<void>;
}

const Contexto = createContext<EstadoAuth | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [cargando, setCargando] = useState(true);
  const [tieneAcceso, setTieneAcceso] = useState(false);
  const [esAdmin, setEsAdmin] = useState(false);
  const [diagnostico, setDiagnostico] = useState("");
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);

  useEffect(() => {
    const { auth, db } = fb();
    return onAuthStateChanged(auth, async (u) => {
      setCargando(true);
      setUser(u);
      if (!u?.email) {
        setTieneAcceso(false);
        setEsAdmin(false);
        setPerfil(null);
        setCargando(false);
        return;
      }
      const email = u.email.toLowerCase();
      // Cualquier persona con cuenta entra, salvo que la hayas bloqueado desde el panel.
      let errorAdmin = "";
      const [adm, bloq] = await Promise.all([
        getDoc(doc(db, "admins", email)).catch((e) => {
          errorAdmin = (e as { code?: string }).code ?? String(e);
          return null;
        }),
        getDoc(doc(db, "bloqueados", email)).catch(() => null),
      ]);
      setDiagnostico(
        `Proyecto: ${db.app.options.projectId ?? "sin configurar"} · Correo: ${email} · Admin: ${
          adm?.exists() ? "sí" : errorAdmin ? `error (${errorAdmin})` : "no encontrado en admins"
        }`,
      );
      const admin = !!adm?.exists();
      const acceso = admin || !bloq?.exists();
      setEsAdmin(admin);
      setTieneAcceso(acceso);
      if (acceso) {
        try {
          setPerfil(await asegurarPerfil(u));
        } catch (e) {
          console.error("No se pudo cargar el perfil", e);
        }
      } else {
        setPerfil(null);
      }
      setCargando(false);
    });
  }, []);

  const refrescarPerfil = useCallback(async () => {
    if (user) setPerfil(await obtenerPerfil(user.uid));
  }, [user]);

  const cerrarSesion = useCallback(async () => {
    await signOut(fb().auth);
  }, []);

  return (
    <Contexto.Provider
      value={{ user, cargando, tieneAcceso, esAdmin, diagnostico, perfil, refrescarPerfil, cerrarSesion }}
    >
      {children}
    </Contexto.Provider>
  );
}

export function useAuth() {
  const c = useContext(Contexto);
  if (!c) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return c;
}
