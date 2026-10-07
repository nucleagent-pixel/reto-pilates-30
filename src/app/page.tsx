"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Protegido from "@/components/Protegido";
import AnilloProgreso from "@/components/AnilloProgreso";
import { useAuth } from "@/components/AuthProvider";
import { obtenerRutinas } from "@/lib/datos";
import { calcularRacha, diaActual, fechaISO, idReto } from "@/lib/progreso";
import { MARCA } from "@/lib/marca";
import type { Rutina } from "@/lib/tipos";

export default function Inicio() {
  return (
    <Protegido>
      <Contenido />
    </Protegido>
  );
}

function Contenido() {
  const { perfil, user } = useAuth();
  const [rutinas, setRutinas] = useState<Rutina[]>([]);

  useEffect(() => {
    obtenerRutinas("reto").then(setRutinas).catch(console.error);
  }, []);

  const total = rutinas.length || MARCA.totalDias;
  const completados = perfil?.completados ?? {};
  const hechos = Object.keys(completados).length;
  const racha = calcularRacha(perfil?.diasActivos ?? []);
  const entrenoHoy = perfil?.diasActivos.includes(fechaISO()) ?? false;
  const siguiente = diaActual(completados, total);
  const rutinaSiguiente = siguiente ? rutinas.find((r) => r.orden === siguiente) : undefined;
  const nombre = (perfil?.nombre || user?.displayName || "").split(" ")[0];

  return (
    <div className="space-y-5">
      <header>
        <p className="text-sm text-tinta/60">{MARCA.nombre}</p>
        <h1 className="text-3xl">Hola{nombre ? `, ${nombre}` : ""} 👋</h1>
      </header>

      <section className="tarjeta flex items-center gap-5">
        <AnilloProgreso valor={hechos} total={total} />
        <div className="space-y-3">
          <div>
            <p className="text-sm text-tinta/60">Racha</p>
            <p className="font-titulo text-2xl">
              {racha} {racha === 1 ? "día" : "días"} {racha > 0 ? "🔥" : ""}
            </p>
          </div>
          <p className="text-sm text-tinta/70">
            {entrenoHoy
              ? "¡Ya entrenaste hoy! Tu cuerpo te lo agradece."
              : racha > 0
                ? "Entrena hoy para no perder tu racha."
                : "Hoy es un gran día para empezar."}
          </p>
        </div>
      </section>

      {siguiente ? (
        <Link
          href={`/clase/?id=${idReto(siguiente)}`}
          className="block rounded-3xl bg-terracota p-6 text-white shadow-md transition hover:brightness-95"
        >
          <p className="text-sm text-white/80">Tu próxima clase</p>
          <p className="mt-1 font-titulo text-3xl">Día {siguiente}</p>
          {rutinaSiguiente?.titulo && rutinaSiguiente.titulo !== `Día ${siguiente}` && (
            <p className="mt-1 text-white/90">{rutinaSiguiente.titulo}</p>
          )}
          <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-medium">
            {hechos === 0 ? "Empezar el reto" : "Continuar"} →
          </p>
        </Link>
      ) : (
        <section className="rounded-3xl bg-salvia p-6 text-white">
          <p className="font-titulo text-2xl">¡Completaste el reto! 🎉</p>
          <p className="mt-2 text-white/90">
            Terminaste los {total} días. Registra tus medidas finales para ver todo lo que lograste.
          </p>
          <Link href="/progreso/" className="mt-4 inline-flex rounded-full bg-white/20 px-4 py-2 text-sm font-medium">
            Ver mi progreso →
          </Link>
        </section>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Link href="/rapidas/" className="tarjeta transition hover:ring-terracota/40">
          <p className="text-2xl">⚡</p>
          <p className="mt-2 font-medium">Rutinas rápidas</p>
          <p className="text-sm text-tinta/60">Para días con poco tiempo</p>
        </Link>
        <Link href="/progreso/" className="tarjeta transition hover:ring-terracota/40">
          <p className="text-2xl">📈</p>
          <p className="mt-2 font-medium">Mi progreso</p>
          <p className="text-sm text-tinta/60">Peso, medidas y cómo te sientes</p>
        </Link>
      </div>
    </div>
  );
}
