"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import Cargando from "@/components/Cargando";
import { MARCA, linkWhatsapp } from "@/lib/marca";

export default function SinAcceso() {
  const { user, cargando, tieneAcceso, cerrarSesion } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (cargando) return;
    if (!user) router.replace("/login/");
    else if (tieneAcceso) router.replace("/");
  }, [cargando, user, tieneAcceso, router]);

  if (cargando || !user || tieneAcceso) return <Cargando />;

  const mensaje = `Hola, no puedo entrar a la web del ${MARCA.nombre} con el correo ${user.email}.`;

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5 py-10 text-center">
      <p className="text-5xl">🔒</p>
      <h1 className="mt-4 text-3xl">Tu acceso está desactivado</h1>
      <p className="mt-3 text-tinta/70">
        La cuenta <strong>{user.email}</strong> no tiene acceso en este momento. Escríbenos por WhatsApp y te ayudamos.
      </p>

      <div className="mt-8 flex flex-col gap-3">
        <a href={linkWhatsapp(mensaje)} target="_blank" rel="noreferrer" className="boton">
          Escribir por WhatsApp
        </a>
        <button className="boton-sec" onClick={() => window.location.reload()}>
          Revisar de nuevo
        </button>
        <button className="text-sm text-tinta/60 underline-offset-4 hover:underline" onClick={cerrarSesion}>
          Cerrar sesión
        </button>
      </div>
    </main>
  );
}
