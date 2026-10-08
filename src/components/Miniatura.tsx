"use client";

import { useState } from "react";
import type { Categoria } from "@/lib/tipos";

// Fondo de respaldo por categoría si no hay portada disponible.
const FONDO: Record<Categoria, string> = {
  cuerpo: "bg-salvia",
  piernas: "bg-madera",
  abdomen: "bg-carbon",
  movilidad: "bg-salvia-claro",
  brazos: "bg-[#7A8A6F]",
  pie: "bg-miel",
  estiramiento: "bg-[#B9A58C]",
};

/** Saca el ID de un link de Google Drive. */
export function idDrive(url?: string) {
  return url?.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=\w+&)?id=)([\w-]+)/)?.[1] ?? null;
}

/** Portada que Drive genera para el video (la misma que ves en Drive). */
export function portadaDrive(url?: string, ancho = 800) {
  const id = idDrive(url);
  return id ? `https://drive.google.com/thumbnail?id=${id}&sz=w${ancho}` : null;
}

/**
 * Imagen de la clase. Intenta, en orden: portada del video en Drive,
 * imagen de la categoría (public/clases/<categoria>.jpg) y, si no hay ninguna, un color.
 */
export default function Miniatura({
  categoria,
  videoUrl,
  texto,
  tam = "h-16 w-16",
  apagada = false,
  redondeo = "rounded-2xl",
  ancho = 400,
}: {
  categoria?: Categoria;
  videoUrl?: string;
  texto?: string;
  tam?: string;
  apagada?: boolean;
  redondeo?: string;
  ancho?: number;
}) {
  const fuentes = [portadaDrive(videoUrl, ancho), categoria ? `/clases/${categoria}.jpg` : null].filter(Boolean) as string[];
  const [intento, setIntento] = useState(0);
  const src = fuentes[intento];
  const fondo = categoria ? FONDO[categoria] : "bg-salvia";

  return (
    <div className={`relative ${tam} shrink-0 overflow-hidden ${redondeo} ${fondo} ${apagada ? "opacity-40 grayscale" : ""}`}>
      {src && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={src}
          src={src}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setIntento((i) => i + 1)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      {texto && (
        <span
          className={`absolute inset-0 flex items-center justify-center font-titulo text-xl font-bold text-white ${
            src ? "bg-carbon/35" : ""
          }`}
        >
          {texto}
        </span>
      )}
    </div>
  );
}
