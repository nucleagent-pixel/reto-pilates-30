"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Protegido from "@/components/Protegido";
import { AvatarLaura } from "@/components/Marca";
import { useAuth } from "@/components/AuthProvider";
import { obtenerRutinas } from "@/lib/datos";
import { calcularRacha, diaActual, estaCompletado, fechaISO, idReto } from "@/lib/progreso";
import { MARCA, notaDelDia } from "@/lib/marca";
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
  const tituloSiguiente =
    rutinaSiguiente?.titulo && rutinaSiguiente.titulo !== `Día ${siguiente}` ? rutinaSiguiente.titulo : null;

  return (
    <div className="space-y-7">
      {/* Saludo con la nota del día de Laura */}
      <header className="space-y-4">
        <h1 className="titular">Hola{nombre ? `, ${nombre}` : ""}</h1>
        <div className="flex items-start gap-3">
          <AvatarLaura tam={44} />
          <div className="rounded-2xl rounded-tl-md bg-white px-4 py-3 ring-1 ring-niebla">
            <p className="text-[15px] leading-snug">{notaDelDia()}</p>
            <p className="mt-1 text-xs font-semibold text-salvia">{MARCA.instructora}</p>
          </div>
        </div>
      </header>

      {/* Próxima clase: la pieza principal de la pantalla */}
      {siguiente ? (
        <Link
          href={`/clase/?id=${idReto(siguiente)}`}
          className="group relative block overflow-hidden rounded-[2rem] bg-salvia text-white"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={MARCA.foto}
            alt=""
            className="absolute inset-y-0 right-0 h-full w-[58%] object-cover object-[55%_20%] opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-salvia via-salvia/85 to-transparent" />
          <div className="relative flex min-h-[15rem] flex-col justify-between p-6">
            <div>
              <p className="text-sm text-white/80">{hechos === 0 ? "Empiezas con" : "Te toca hoy"}</p>
              <p className="font-titulo text-[5.5rem] font-bold leading-[0.85] tracking-tight">Día {siguiente}</p>
              {tituloSiguiente && <p className="mt-2 max-w-[55%] font-medium leading-snug">{tituloSiguiente}</p>}
            </div>
            <span className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-carbon transition-colors group-hover:bg-lino">
              {hechos === 0 ? "Empezar el reto" : "Ir a la clase"}
            </span>
          </div>
        </Link>
      ) : (
        <section className="rounded-[2rem] bg-madera p-6 text-white">
          <p className="font-titulo text-5xl font-bold leading-none">Reto completado</p>
          <p className="mt-3 text-white/90">
            Terminaste los {total} días. Registra tus medidas finales y compara con las del inicio.
          </p>
          <Link href="/progreso/" className="mt-5 inline-flex rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-carbon">
            Ver mi progreso
          </Link>
        </section>
      )}

      {/* Avance: una barra de 21 segmentos, uno por día del reto */}
      <section aria-label="Tu avance en el reto">
        <div className="mb-3 flex items-baseline justify-between">
          <p className="font-titulo text-2xl font-semibold">
            {hechos} de {total} días
          </p>
          <p className="text-sm text-carbon/70">
            {racha > 0 ? `Racha de ${racha} ${racha === 1 ? "día" : "días"}` : "Sin racha todavía"}
          </p>
        </div>
        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }}>
          {Array.from({ length: total }, (_, i) => i + 1).map((d) => (
            <span
              key={d}
              title={`Día ${d}`}
              className={`h-3 rounded-full ${
                estaCompletado(d, completados) ? "bg-salvia" : d === siguiente ? "bg-miel" : "bg-niebla"
              }`}
            />
          ))}
        </div>
        <p className="mt-3 text-sm text-carbon/70">
          {entrenoHoy
            ? "Ya entrenaste hoy. Descansa bien."
            : racha > 0
              ? "Entrena hoy para mantener tu racha."
              : "Tu racha empieza con la primera clase."}
        </p>
      </section>

      {/* Accesos secundarios */}
      <nav className="divide-y divide-niebla overflow-hidden rounded-[1.75rem] bg-white ring-1 ring-niebla">
        <Link href="/rapidas/" className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-salvia-fondo">
          <span>
            <span className="block font-semibold">Rutinas rápidas</span>
            <span className="block text-sm text-carbon/70">Para los días con poco tiempo</span>
          </span>
          <Flecha />
        </Link>
        <Link href="/progreso/" className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-salvia-fondo">
          <span>
            <span className="block font-semibold">Registrar mi progreso</span>
            <span className="block text-sm text-carbon/70">Peso, medidas y cómo te sientes</span>
          </span>
          <Flecha />
        </Link>
      </nav>
    </div>
  );
}

function Flecha() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-salvia" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
