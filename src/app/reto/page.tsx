"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Protegido from "@/components/Protegido";
import Cargando from "@/components/Cargando";
import { useAuth } from "@/components/AuthProvider";
import { obtenerRutinas } from "@/lib/datos";
import { diaActual, diaDesbloqueado, estaCompletado } from "@/lib/progreso";
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

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-3xl">Tu reto</h1>
        <p className="mt-1 text-tinta/60">Cada día se desbloquea cuando completas el anterior.</p>
      </header>

      {rutinas.length === 0 && (
        <p className="tarjeta text-center text-tinta/60">Las clases se están preparando. Vuelve pronto.</p>
      )}

      <ul className="space-y-3">
        {rutinas.map((r) => {
          const hecho = estaCompletado(r.orden, completados);
          const abierto = diaDesbloqueado(r.orden, completados);
          const esActual = r.orden === actual;
          const contenido = (
            <div
              className={`flex items-center gap-4 rounded-3xl p-4 ring-1 transition ${
                esActual
                  ? "bg-terracota text-white ring-terracota shadow-md"
                  : hecho
                    ? "bg-white/80 ring-arena"
                    : abierto
                      ? "bg-white/80 ring-arena hover:ring-terracota/40"
                      : "bg-arena/40 text-tinta/40 ring-transparent"
              }`}
            >
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl font-titulo text-lg ${
                  esActual ? "bg-white/20" : hecho ? "bg-salvia text-white" : "bg-arena"
                }`}
              >
                {hecho ? "✓" : abierto ? r.orden : "🔒"}
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-xs ${esActual ? "text-white/80" : "text-tinta/50"}`}>Día {r.orden}</p>
                <p className="truncate font-medium">{r.titulo}</p>
                {(r.duracion || r.zona) && (
                  <p className={`truncate text-sm ${esActual ? "text-white/80" : "text-tinta/60"}`}>
                    {[r.duracion, r.zona].filter(Boolean).join(" · ")}
                  </p>
                )}
              </div>
              {abierto && <span className="text-lg">→</span>}
            </div>
          );
          return (
            <li key={r.id}>
              {abierto ? <Link href={`/clase/?id=${r.id}`}>{contenido}</Link> : contenido}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
