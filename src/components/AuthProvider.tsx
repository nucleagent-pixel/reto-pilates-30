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
      const [adm, acc] = await Promise.all([
        getDoc(doc(db, "admins", email)).catch(() => null),
        getDoc(doc(db, "accesos", email)).catch(() => null),
      ]);
      const admin = !!adm?.exists();
      const datosAcceso = acc?.exists() ? acc.data() : null;
      const acceso = admin || datosAcceso?.activo === true;
      setEsAdmin(admin);
      setTieneAcceso(acceso);
      if (acceso) {
        try {
          setPerfil(await asegurarPerfil(u, datosAcceso?.nombre));
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
      value={{ user, cargando, tieneAcceso, esAdmin, perfil, refrescarPerfil, cerrarSesion }}
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
