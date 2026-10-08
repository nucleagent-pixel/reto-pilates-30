"use client";

import { useState } from "react";
import type { Categoria } from "@/lib/tipos";

// Fondo de respaldo por categoría, mientras no subas la imagen a public/clases/<categoria>.jpg
const FONDO: Record<Categoria, string> = {
  cuerpo: "bg-salvia",
  piernas: "bg-madera",
  abdomen: "bg-carbon",
  movilidad: "bg-salvia-claro",
  brazos: "bg-[#7A8A6F]",
  pie: "bg-miel",
  estiramiento: "bg-[#B9A58C]",
};

/** Imagen cuadrada de la clase según su categoría. */
export default function Miniatura({
  categoria,
  texto,
  tam = "h-16 w-16",
  apagada = false,
}: {
  categoria?: Categoria;
  texto: string;
  tam?: string;
  apagada?: boolean;
}) {
  const [falla, setFalla] = useState(false);
  const fondo = categoria ? FONDO[categoria] : "bg-salvia";
  return (
    <div className={`relative ${tam} shrink-0 overflow-hidden rounded-2xl ${fondo} ${apagada ? "opacity-40 grayscale" : ""}`}>
      {categoria && !falla && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`/clases/${categoria}.jpg`}
          alt=""
          loading="lazy"
          onError={() => setFalla(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      <span
        className={`absolute inset-0 flex items-center justify-center font-titulo text-xl font-bold text-white ${
          categoria && !falla ? "bg-carbon/30" : ""
        }`}
      >
        {texto}
      </span>
    </div>
  );
}
