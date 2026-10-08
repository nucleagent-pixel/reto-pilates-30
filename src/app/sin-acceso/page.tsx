"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import Cargando from "@/components/Cargando";

export default function SinAcceso() {
  const { user, cargando, tieneAcceso, cerrarSesion } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (cargando) return;
    if (!user) router.replace("/login/");
    else if (tieneAcceso) router.replace("/");
  }, [cargando, user, tieneAcceso, router]);

  if (cargando || !user || tieneAcceso) return <Cargando />;

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5 py-10 text-center">
      <p className="text-5xl">🔒</p>
      <h1 className="titular mt-4">Tu acceso está desactivado</h1>
      <p className="mt-3 text-carbon/70">
        La cuenta <strong>{user.email}</strong> no tiene acceso en este momento. Escríbele a la persona que te vendió el reto y te ayudará.
      </p>

      <div className="mt-8 flex flex-col gap-3">
        <button className="boton" onClick={() => window.location.reload()}>
          Revisar de nuevo
        </button>
        <button className="text-sm text-carbon/60 underline-offset-4 hover:underline" onClick={cerrarSesion}>
          Cerrar sesión
        </button>
      </div>
    </main>
  );
}
