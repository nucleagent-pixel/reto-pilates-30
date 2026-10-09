"use client";

import { useState } from "react";
import { MARCA } from "@/lib/marca";

/** Símbolo provisional: un aro de pilates con la curva de una columna en "roll up". */
export function Simbolo({ tam = 36, claro = false }: { tam?: number; claro?: boolean }) {
  const trazo = claro ? "#FFFFFF" : "#55684F";
  return (
    <svg width={tam} height={tam} viewBox="0 0 48 48" aria-hidden className="shrink-0">
      <circle cx="24" cy="24" r="20" fill="none" stroke={trazo} strokeWidth="3.5" />
      <path d="M14 33c3-1 6-3.5 8-7.5S25.5 16 31 14" fill="none" stroke={claro ? "#F1F0EB" : "#A87C55"} strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="33.5" cy="12.8" r="2.6" fill={claro ? "#F1F0EB" : "#A87C55"} />
    </svg>
  );
}

/**
 * Logo de la app. Si subes tu logo a public/marca/logo-nuclea.png (fondo transparente),
 * se usa automáticamente; mientras tanto se muestra el símbolo con el nombre en texto.
 */
export default function Marca({ claro = false, grande = false }: { claro?: boolean; grande?: boolean }) {
  const [sinLogo, setSinLogo] = useState(false);
  const archivo = claro ? "/marca/logo-nuclea-blanco.png" : "/marca/logo-nuclea.png";

  if (!sinLogo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={archivo}
        alt={MARCA.marca}
        className={grande ? "h-20 w-auto" : "h-10 w-auto"}
        onError={() => setSinLogo(true)}
      />
    );
  }

  return (
    <div className={`flex items-center gap-2.5 font-titulo leading-none ${claro ? "text-white" : "text-carbon"}`}>
      <Simbolo tam={grande ? 56 : 34} claro={claro} />
      <div>
        <p className={`${grande ? "text-5xl" : "text-2xl"} font-bold tracking-tight`}>{MARCA.marca.toLowerCase()}</p>
        <p className={`${grande ? "text-2xl" : "text-sm"} font-light tracking-[0.3em] ${claro ? "text-white/85" : "text-salvia"}`}>
          reto pilates
        </p>
      </div>
    </div>
  );
}

export function AvatarLaura({ tam = 48 }: { tam?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={MARCA.avatar}
      alt={MARCA.instructora}
      width={tam}
      height={tam}
      className="shrink-0 rounded-full object-cover ring-2 ring-white"
      style={{ width: tam, height: tam }}
    />
  );
}
