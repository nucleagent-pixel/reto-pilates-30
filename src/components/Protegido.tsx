"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import Cargando from "./Cargando";
import NavInferior from "./NavInferior";
import Marca from "./Marca";

/** Envuelve las páginas privadas: exige sesión y acceso activo (o admin). */
export default function Protegido({
  children,
  soloAdmin = false,
  ancho = "max-w-xl",
}: {
  children: ReactNode;
  soloAdmin?: boolean;
  ancho?: string;
}) {
  const { user, cargando, tieneAcceso, esAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (cargando) return;
    if (!user) router.replace("/login/");
    else if (!tieneAcceso) router.replace("/sin-acceso/");
    else if (soloAdmin && !esAdmin) router.replace("/");
  }, [cargando, user, tieneAcceso, esAdmin, soloAdmin, router]);

  if (cargando || !user || !tieneAcceso || (soloAdmin && !esAdmin)) {
    return <Cargando />;
  }

  return (
    <div className="min-h-dvh pb-28">
      <main className={`mx-auto ${ancho} px-5 pt-5`}>
        <div className="mb-6">
          <Marca />
        </div>
        {children}
      </main>
      <NavInferior />
    </div>
  );
}
