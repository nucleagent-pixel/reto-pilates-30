"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { updateProfile } from "firebase/auth";
import Protegido from "@/components/Protegido";
import { useAuth } from "@/components/AuthProvider";
import { actualizarNombre } from "@/lib/datos";

export default function Perfil() {
  return (
    <Protegido>
      <Contenido />
    </Protegido>
  );
}

function Contenido() {
  const { user, perfil, esAdmin, diagnostico, refrescarPerfil, cerrarSesion } = useAuth();
  const [nombre, setNombre] = useState(perfil?.nombre ?? "");
  const [guardado, setGuardado] = useState(false);

  async function guardar(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    await actualizarNombre(user.uid, nombre.trim());
    await updateProfile(user, { displayName: nombre.trim() }).catch(() => undefined);
    await refrescarPerfil();
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2000);
  }

  return (
    <div className="space-y-5">
      <h1 className="titular">Mi perfil</h1>

      <form onSubmit={guardar} className="tarjeta space-y-4">
        <div>
          <label className="etiqueta" htmlFor="nombre">Nombre</label>
          <input id="nombre" className="input" value={nombre} onChange={(e) => setNombre(e.target.value)} />
        </div>
        <div>
          <p className="etiqueta">Correo</p>
          <p className="px-1">{user?.email}</p>
        </div>
        <button className="boton w-full">{guardado ? "¡Guardado! ✓" : "Guardar cambios"}</button>
      </form>

      <div className="flex flex-col gap-3">
        {esAdmin && (
          <Link href="/admin/" className="boton-sec">
            ⚙️ Panel de administración
          </Link>
        )}
        <button onClick={cerrarSesion} className="py-2 text-sm text-carbon/60 underline-offset-4 hover:underline">
          Cerrar sesión
        </button>
        <p className="break-all text-center text-xs text-carbon/40">{diagnostico}</p>
      </div>
    </div>
  );
}
