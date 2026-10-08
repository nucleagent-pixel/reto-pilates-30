"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import Protegido from "@/components/Protegido";
import Miniatura from "@/components/Miniatura";
import { AvatarLaura } from "@/components/Marca";
import { useAuth } from "@/components/AuthProvider";
import { obtenerRutinas } from "@/lib/datos";
import {
  calcularRacha,
  contarHechos,
  contarRapidas,
  diaActual,
  estaCompletado,
  fechaISO,
  idReto,
  rapidaCompletada,
} from "@/lib/progreso";
import { MARCA, notaDelDia } from "@/lib/marca";
import type { Rutina } from "@/lib/tipos";

export default function Inicio() {
  return (
    <Protegido>
      <Contenido />
    </Protegido>
  );
}

const LETRAS = ["L", "M", "M", "J", "V", "S", "D"];

function Contenido() {
  const { perfil, user } = useAuth();
  const [rutinas, setRutinas] = useState<Rutina[]>([]);

  useEffect(() => {
    obtenerRutinas().then(setRutinas).catch(console.error);
  }, []);

  const reto = rutinas.filter((r) => r.tipo === "reto");
  const rapidas = rutinas.filter((r) => r.tipo === "rapida");
  const completados = perfil?.completados ?? {};
  const activos = new Set(perfil?.diasActivos ?? []);
  const hechos = contarHechos(completados);
  const rapidasHechas = contarRapidas(completados);
  const faltanRapidas = MARCA.totalRapidas - rapidasHechas;
  const retoCompleto = hechos >= MARCA.totalReto;
  const racha = calcularRacha(perfil?.diasActivos ?? []);
  const siguiente = diaActual(completados, MARCA.totalDias);
  const clase = siguiente ? reto.find((r) => r.orden === siguiente) : undefined;
  const nombre = (perfil?.nombre || user?.displayName || "").split(" ")[0];
  const hoy = new Date();

  // Semana actual, de lunes a domingo.
  const lunes = new Date(hoy);
  lunes.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7));
  const semana = LETRAS.map((letra, i) => {
    const d = new Date(lunes);
    d.setDate(lunes.getDate() + i);
    const f = fechaISO(d);
    return { letra, num: d.getDate(), hecho: activos.has(f), esHoy: f === fechaISO(hoy), futuro: d > hoy };
  });
  const entrenosSemana = semana.filter((d) => d.hecho).length;

  return (
    <div className="space-y-8">
      {/* Saludo */}
      <header className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm capitalize text-carbon/60">
            {hoy.toLocaleDateString("es", { weekday: "long", day: "numeric", month: "long" })}
          </p>
          <h1 className="titular">Hola{nombre ? `, ${nombre}` : ""}</h1>
        </div>
        <div className="text-right">
          <p className="font-titulo text-4xl font-bold leading-none text-salvia">{racha}</p>
          <p className="text-xs text-carbon/60">{racha === 1 ? "día seguido" : "días seguidos"}</p>
        </div>
      </header>

      {/* La clase de hoy: la pieza principal */}
      {siguiente && !retoCompleto ? (
        <Link
          href={`/clase/?id=${idReto(siguiente)}`}
          className="group relative block overflow-hidden rounded-[2rem] bg-carbon text-white"
          aria-label={`Ir a la clase del día ${siguiente}`}
        >
          <Miniatura
            categoria={clase?.categoria}
            videoUrl={clase?.videoUrl}
            tam="aspect-[4/5] w-full sm:aspect-video"
            redondeo="rounded-none"
            ancho={1000}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-carbon via-carbon/40 to-carbon/0" />
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-5">
            <span className="rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-carbon">
              {hechos === 0 ? "Empiezas hoy" : "Tu clase de hoy"}
            </span>
            {clase?.duracion && <span className="rounded-full bg-carbon/50 px-3 py-1 text-sm">{clase.duracion}</span>}
          </div>
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6">
            <div>
              <p className="font-titulo text-[5.5rem] font-bold leading-[0.8] tracking-tight">Día {siguiente}</p>
              {clase && <p className="mt-3 text-lg font-medium leading-snug">{clase.titulo}</p>}
            </div>
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white text-salvia transition-transform group-hover:scale-105">
              <svg viewBox="0 0 24 24" className="ml-1 h-7 w-7" fill="currentColor" aria-hidden>
                <path d="M7 4.5v15l13-7.5z" />
              </svg>
            </span>
          </div>
        </Link>
      ) : !retoCompleto ? (
        <Link href="/rapidas/" className="block rounded-[2rem] bg-madera p-6 text-white">
          <p className="text-white/85">Terminaste las {MARCA.totalDias} clases</p>
          <p className="font-titulo text-6xl font-bold leading-[0.9]">
            Te {faltanRapidas === 1 ? "falta" : "faltan"} {faltanRapidas}
          </p>
          <p className="mt-2 text-white/90">
            {faltanRapidas === 1 ? "rutina rápida" : "rutinas rápidas"} para completar tus {MARCA.totalReto} días.
          </p>
        </Link>
      ) : (
        <ImagenSeccion src="/inicio/reto-completo.jpg" className="rounded-[2rem] bg-madera p-6 text-white">
          <p className="font-titulo text-6xl font-bold leading-[0.9]">Reto completado</p>
          <p className="mt-3 max-w-xs text-white/90">
            Terminaste los {MARCA.totalReto} días. Mira todo lo que cambiaste desde el inicio.
          </p>
          <Link href="/progreso/?s=avance" className="mt-5 inline-flex rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-carbon">
            Ver mi avance
          </Link>
        </ImagenSeccion>
      )}

      {/* Nota de Laura */}
      <div className="flex items-start gap-3">
        <AvatarLaura tam={48} />
        <div className="rounded-2xl rounded-tl-md bg-white px-4 py-3 ring-1 ring-niebla">
          <p className="leading-snug">{notaDelDia()}</p>
          <p className="mt-1 text-xs font-semibold text-salvia">{MARCA.instructora}</p>
        </div>
      </div>

      {/* Semana y avance */}
      <section className="tarjeta space-y-5" aria-label="Tu avance">
        <div>
          <div className="mb-3 flex items-baseline justify-between">
            <p className="font-titulo text-2xl font-semibold">Esta semana</p>
            <p className="text-sm text-carbon/70">
              {entrenosSemana} {entrenosSemana === 1 ? "entrenamiento" : "entrenamientos"}
            </p>
          </div>
          <ol className="grid grid-cols-7 gap-1.5 text-center">
            {semana.map((d, i) => (
              <li key={i} className="flex flex-col items-center gap-1">
                <span className="text-xs font-semibold text-carbon/50">{d.letra}</span>
                <span
                  className={`flex aspect-square w-full max-w-[2.6rem] items-center justify-center rounded-full text-sm font-semibold ${
                    d.hecho
                      ? "bg-salvia text-white"
                      : d.esHoy
                        ? "ring-2 ring-salvia"
                        : d.futuro
                          ? "text-carbon/30"
                          : "bg-lino text-carbon/50"
                  }`}
                  aria-label={`${d.num}${d.hecho ? ", entrenaste" : ""}`}
                >
                  {d.hecho ? "✓" : d.num}
                </span>
              </li>
            ))}
          </ol>
        </div>

        <div>
          <div className="mb-2 flex items-baseline justify-between">
            <p className="font-titulo text-2xl font-semibold">
              {hechos} de {MARCA.totalReto} días
            </p>
            <p className="text-sm text-carbon/70">{Math.round((hechos / MARCA.totalReto) * 100)}%</p>
          </div>
          <div className="flex gap-1">
            {Array.from({ length: MARCA.totalDias }, (_, i) => i + 1).map((d) => (
              <span
                key={d}
                className={`h-2.5 flex-1 rounded-full ${
                  estaCompletado(d, completados) ? "bg-salvia" : d === siguiente ? "bg-salvia-claro" : "bg-niebla"
                }`}
              />
            ))}
            <span className="w-1.5 shrink-0" aria-hidden />
            {Array.from({ length: MARCA.totalRapidas }, (_, i) => i + 1).map((n) => (
              <span key={`r${n}`} className={`h-2.5 flex-1 rounded-full ${n <= rapidasHechas ? "bg-madera" : "bg-miel/40"}`} />
            ))}
          </div>
          <div className="mt-1.5 flex justify-between text-xs text-carbon/60">
            <span>Clases del reto</span>
            <span>Rápidas</span>
          </div>
        </div>
      </section>

      {/* Rutinas rápidas en carrusel */}
      {rapidas.length > 0 && (
        <section aria-label="Rutinas rápidas">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="font-titulo text-3xl font-semibold">Rutinas rápidas</h2>
            <Link href="/rapidas/" className="text-sm font-semibold text-salvia hover:underline">
              Ver todas
            </Link>
          </div>
          <p className="-mt-2 mb-3 text-sm text-carbon/70">Cada una que completes suma un día al reto.</p>
          <ul className="-mx-5 flex snap-x gap-3 overflow-x-auto px-5 pb-2">
            {rapidas.map((r) => {
              const hecha = rapidaCompletada(r.orden, completados);
              return (
                <li key={r.id} className="w-44 shrink-0 snap-start">
                  <Link href={`/clase/?id=${r.id}`} className="block">
                    <div className="relative">
                      <Miniatura categoria={r.categoria} videoUrl={r.videoUrl} tam="aspect-[4/5] w-full" redondeo="rounded-[1.5rem]" />
                      {r.duracion && (
                        <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-semibold">
                          {r.duracion}
                        </span>
                      )}
                      {hecha && (
                        <span className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-salvia text-sm font-bold text-white">
                          ✓
                        </span>
                      )}
                    </div>
                    <p className="mt-2 font-semibold leading-tight">{r.titulo}</p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Mi proceso */}
      <section aria-label="Mi proceso">
        <h2 className="mb-3 font-titulo text-3xl font-semibold">Mi proceso</h2>
        <div className="grid grid-cols-2 gap-3">
          <Atajo href="/progreso/?s=calendario" titulo="Calendario" texto="Tus días entrenados" imagen="/inicio/calendario.jpg" color="bg-salvia" />
          <Atajo href="/progreso/?s=objetivos" titulo="Objetivos" texto="Lo que quieres lograr" imagen="/inicio/objetivos.jpg" color="bg-madera" />
          <Atajo href="/progreso/?s=medidas" titulo="Medidas" texto="Peso y centímetros" imagen="/inicio/medidas.jpg" color="bg-[#7A8A6F]" />
          <Atajo href="/progreso/?s=diario" titulo="Diario" texto="Cómo lo estás viviendo" imagen="/inicio/diario.jpg" color="bg-carbon" />
        </div>
      </section>
    </div>
  );
}

/** Tarjeta con imagen de fondo opcional (public/inicio/...). Si la imagen no existe, queda el color. */
function ImagenSeccion({ src, className, children }: { src: string; className: string; children: ReactNode }) {
  const [ok, setOk] = useState(true);
  return (
    <section className={`relative overflow-hidden ${className}`}>
      {ok && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" onError={() => setOk(false)} className="absolute inset-0 h-full w-full object-cover" />
      )}
      {ok && <div className="absolute inset-0 bg-gradient-to-t from-carbon/80 to-carbon/10" />}
      <div className="relative">{children}</div>
    </section>
  );
}

function Atajo({ href, titulo, texto, imagen, color }: { href: string; titulo: string; texto: string; imagen: string; color: string }) {
  const [ok, setOk] = useState(true);
  return (
    <Link href={href} className={`group relative flex aspect-[5/4] flex-col justify-end overflow-hidden rounded-[1.5rem] p-4 text-white ${color}`}>
      {ok && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imagen}
          alt=""
          loading="lazy"
          onError={() => setOk(false)}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      )}
      {ok && <div className="absolute inset-0 bg-gradient-to-t from-carbon/75 via-carbon/20 to-transparent" />}
      <div className="relative">
        <p className="font-titulo text-2xl font-semibold leading-none">{titulo}</p>
        <p className="mt-1 text-sm text-white/85">{texto}</p>
      </div>
    </Link>
  );
}
