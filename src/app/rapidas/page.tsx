"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Protegido from "@/components/Protegido";
import Cargando from "@/components/Cargando";
import { obtenerRutinas } from "@/lib/datos";
import type { Rutina } from "@/lib/tipos";

export default function Rapidas() {
  return (
    <Protegido>
      <Lista />
    </Protegido>
  );
}

function Lista() {
  const [rutinas, setRutinas] = useState<Rutina[] | null>(null);

  useEffect(() => {
    obtenerRutinas("rapida").then(setRutinas).catch(() => setRutinas([]));
  }, []);

  if (!rutinas) return <Cargando />;

  return (
    <div className="space-y-5">
      <header>
        <h1 className="titular">Rutinas rápidas</h1>
        <p className="mt-1 text-carbon/60">Siempre disponibles, para cuando tienes poco tiempo. También suman a tu racha.</p>
      </header>

      <ul className="grid gap-3 sm:grid-cols-2">
        {rutinas.map((r) => (
          <li key={r.id}>
            <Link
              href={`/clase/?id=${r.id}`}
              className="tarjeta flex h-full items-center gap-4 transition hover:ring-salvia/40"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-miel/40 font-titulo text-lg">
                {r.orden}
              </div>
              <div className="min-w-0">
                <p className="truncate font-medium">{r.titulo}</p>
                <p className="truncate text-sm text-carbon/60">
                  {[r.duracion, r.zona].filter(Boolean).join(" · ") || "Rutina rápida"}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
