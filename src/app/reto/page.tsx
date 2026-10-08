"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Protegido from "@/components/Protegido";
import Cargando from "@/components/Cargando";
import Miniatura from "@/components/Miniatura";
import { useAuth } from "@/components/AuthProvider";
import { obtenerRutinas } from "@/lib/datos";
import { contarRapidas, diaActual, diaDesbloqueado, estaCompletado } from "@/lib/progreso";
import { MARCA } from "@/lib/marca";
import type { Rutina } from "@/lib/tipos";

export default function Reto() {
  return (
    <Protegido>
      <Lista />
    </Protegido>
  );
}

function Lista() {
  const { perfil } = useAuth();
  const [rutinas, setRutinas] = useState<Rutina[] | null>(null);

  useEffect(() => {
    obtenerRutinas("reto").then(setRutinas).catch(() => setRutinas([]));
  }, []);

  if (!rutinas) return <Cargando />;

  const completados = perfil?.completados ?? {};
  const actual = diaActual(completados, rutinas.length);
  const rapidas = contarRapidas(completados);

  return (
    <div className="space-y-5">
      <header>
        <h1 className="titular">Tu reto</h1>
        <p className="mt-2 text-carbon/70">
          {MARCA.totalDias} clases que se desbloquean una tras otra, más {MARCA.totalRapidas} rutinas rápidas que haces
          cuando quieras. Juntas suman tus {MARCA.totalReto} días.
        </p>
      </header>

      {rutinas.length === 0 && (
        <p className="tarjeta text-center text-carbon/70">Las clases se están preparando. Vuelve pronto.</p>
      )}

      <ul className="space-y-2.5">
        {rutinas.map((r) => {
          const hecho = estaCompletado(r.orden, completados);
          const abierto = diaDesbloqueado(r.orden, completados);
          const esActual = r.orden === actual;
          const contenido = (
            <div
              className={`flex items-center gap-4 rounded-[1.5rem] p-2.5 pr-4 ring-1 transition-colors ${
                esActual
                  ? "bg-salvia text-white ring-salvia"
                  : abierto
                    ? "bg-white ring-niebla hover:ring-salvia/50"
                    : "bg-transparent text-carbon/50 ring-niebla"
              }`}
            >
              <Miniatura categoria={r.categoria} videoUrl={r.videoUrl} texto={hecho ? "✓" : String(r.orden)} apagada={!abierto} tam="h-16 w-24" />
              <div className="min-w-0 flex-1">
                <p className={`text-sm ${esActual ? "text-white/80" : "text-carbon/60"}`}>
                  Día {r.orden}
                  {esActual ? " · te toca hoy" : hecho ? " · hecho" : !abierto ? " · bloqueado" : ""}
                </p>
                <p className="truncate font-semibold">{r.titulo}</p>
                {r.duracion && <p className={`text-sm ${esActual ? "text-white/80" : "text-carbon/60"}`}>{r.duracion}</p>}
              </div>
            </div>
          );
          return (
            <li key={r.id}>
              {abierto ? <Link href={`/clase/?id=${r.id}`}>{contenido}</Link> : contenido}
            </li>
          );
        })}
      </ul>

      <Link
        href="/rapidas/"
        className="flex items-center justify-between gap-4 rounded-[1.5rem] bg-salvia-fondo px-5 py-4 transition-colors hover:bg-niebla"
      >
        <span>
          <span className="block font-semibold">Rutinas rápidas</span>
          <span className="block text-sm text-carbon/70">
            {rapidas} de {MARCA.totalRapidas} hechas
          </span>
        </span>
        <span className="font-titulo text-2xl font-bold text-salvia">
          {rapidas}/{MARCA.totalRapidas}
        </span>
      </Link>
    </div>
  );
}
