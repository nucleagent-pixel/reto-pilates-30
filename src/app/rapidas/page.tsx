"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Protegido from "@/components/Protegido";
import Cargando from "@/components/Cargando";
import Miniatura from "@/components/Miniatura";
import { useAuth } from "@/components/AuthProvider";
import { obtenerRutinas } from "@/lib/datos";
import { contarRapidas, rapidaCompletada } from "@/lib/progreso";
import { MARCA } from "@/lib/marca";
import type { Rutina } from "@/lib/tipos";

export default function Rapidas() {
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
    obtenerRutinas("rapida").then(setRutinas).catch(() => setRutinas([]));
  }, []);

  if (!rutinas) return <Cargando />;

  const completados = perfil?.completados ?? {};
  const hechas = contarRapidas(completados);

  return (
    <div className="space-y-5">
      <header>
        <h1 className="titular">Rutinas rápidas</h1>
        <p className="mt-2 text-carbon/70">
          Entre 8 y 12 minutos, siempre disponibles. Cada una que completes suma un día a tu reto de {MARCA.totalReto}.
        </p>
        <p className="mt-3 font-titulo text-2xl font-semibold">
          {hechas} de {MARCA.totalRapidas} hechas
        </p>
      </header>

      <ul className="grid grid-cols-2 gap-3">
        {rutinas.map((r) => {
          const hecha = rapidaCompletada(r.orden, completados);
          return (
            <li key={r.id}>
              <Link
                href={`/clase/?id=${r.id}`}
                className="block h-full rounded-[1.5rem] bg-white p-2.5 ring-1 ring-niebla transition-colors hover:ring-salvia/50"
              >
                <Miniatura categoria={r.categoria} texto={hecha ? "✓" : ""} tam="aspect-square w-full" />
                <div className="px-1.5 pb-1 pt-2.5">
                  <p className="font-semibold leading-tight">{r.titulo}</p>
                  <p className="mt-0.5 text-sm text-carbon/60">
                    {r.duracion || "Rutina rápida"}
                    {hecha ? " · hecha" : ""}
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
