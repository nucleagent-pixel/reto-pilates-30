"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Protegido from "@/components/Protegido";
import Cargando from "@/components/Cargando";
import VideoPlayer from "@/components/VideoPlayer";
import CheckIn, { type DatosCheckIn } from "@/components/CheckIn";
import { useAuth } from "@/components/AuthProvider";
import { agregarRegistro, completarDia, obtenerRutina, registrarActividad } from "@/lib/datos";
import { diaActual, diaDesbloqueado, estaCompletado, idReto } from "@/lib/progreso";
import { MARCA } from "@/lib/marca";
import type { Rutina } from "@/lib/tipos";

export default function ClasePagina() {
  return (
    <Protegido>
      <Suspense fallback={<Cargando />}>
        <Clase />
      </Suspense>
    </Protegido>
  );
}

function Clase() {
  const id = useSearchParams().get("id") ?? "";
  const { user, perfil, esAdmin, refrescarPerfil } = useAuth();
  const [rutina, setRutina] = useState<Rutina | null | undefined>(undefined);
  const [paso, setPaso] = useState<"ver" | "checkin" | "hecho">("ver");

  useEffect(() => {
    setRutina(undefined);
    setPaso("ver");
    obtenerRutina(id).then(setRutina).catch(() => setRutina(null));
  }, [id]);

  if (rutina === undefined) return <Cargando />;
  if (!rutina) {
    return (
      <div className="tarjeta text-center">
        <p>No encontramos esta clase.</p>
        <Link href="/reto/" className="boton mt-4">Volver al reto</Link>
      </div>
    );
  }

  const esReto = rutina.tipo === "reto";
  const completados = perfil?.completados ?? {};
  const yaHecho = esReto && estaCompletado(rutina.orden, completados);

  // Las administradoras pueden ver todas las clases para revisarlas.
  if (esReto && !esAdmin && !diaDesbloqueado(rutina.orden, completados)) {
    const actual = diaActual(completados, MARCA.totalDias);
    return (
      <div className="tarjeta space-y-3 text-center">
        <p className="text-5xl">🔒</p>
        <h1 className="text-2xl">El día {rutina.orden} aún está bloqueado</h1>
        <p className="text-tinta/70">Completa el día anterior para desbloquearlo.</p>
        {actual && (
          <Link href={`/clase/?id=${idReto(actual)}`} className="boton">
            Ir al día {actual}
          </Link>
        )}
      </div>
    );
  }

  async function guardar(d: DatosCheckIn) {
    if (!user || !rutina) return;
    const dia = esReto ? rutina.orden : undefined;
    if (esReto && !yaHecho) await completarDia(user.uid, rutina.orden);
    else await registrarActividad(user.uid);
    if (d.animo) await agregarRegistro(user.uid, { tipo: "animo", animo: d.animo, nota: d.nota, dia });
    if (d.dolores.length) await agregarRegistro(user.uid, { tipo: "dolor", dolores: d.dolores, dia });
    await refrescarPerfil();
    setPaso("hecho");
  }

  const siguiente = esReto && rutina.orden < MARCA.totalDias ? rutina.orden + 1 : null;

  return (
    <div className="space-y-5">
      <Link href={esReto ? "/reto/" : "/rapidas/"} className="text-sm text-tinta/60 hover:text-tinta">
        ← {esReto ? "Volver al reto" : "Rutinas rápidas"}
      </Link>

      <VideoPlayer url={rutina.videoUrl} titulo={rutina.titulo} />

      <header>
        <p className="text-sm font-medium text-terracota">
          {esReto ? `Día ${rutina.orden} de ${MARCA.totalDias}` : "Rutina rápida"}
        </p>
        <h1 className="mt-1 text-3xl">{rutina.titulo}</h1>
        {(rutina.duracion || rutina.zona) && (
          <div className="mt-3 flex flex-wrap gap-2">
            {rutina.duracion && <span className="chip">⏱ {rutina.duracion}</span>}
            {rutina.zona && <span className="chip">🎯 {rutina.zona}</span>}
          </div>
        )}
        {rutina.descripcion && <p className="mt-4 whitespace-pre-line text-tinta/80">{rutina.descripcion}</p>}
        {rutina.pdfUrl && (
          <a href={rutina.pdfUrl} target="_blank" rel="noreferrer" className="boton-sec mt-4">
            📄 Ver guía en PDF
          </a>
        )}
      </header>

      {paso === "ver" && (
        <div className="tarjeta">
          {yaHecho && <p className="mb-3 text-sm text-salvia">✓ Ya completaste este día. Puedes repetirlo cuando quieras.</p>}
          <button className="boton w-full" onClick={() => setPaso("checkin")}>
            {esReto && !yaHecho ? "Terminé esta clase ✓" : "La hice hoy ✓"}
          </button>
        </div>
      )}

      {paso === "checkin" && (
        <div className="tarjeta">
          <CheckIn
            titulo="¡Bien hecho! ¿Cómo te sentiste?"
            textoBoton="Guardar y terminar"
            permitirOmitir
            onGuardar={guardar}
          />
        </div>
      )}

      {paso === "hecho" && (
        <div className="rounded-3xl bg-salvia p-6 text-center text-white">
          <p className="text-4xl">🎉</p>
          <p className="mt-2 font-titulo text-2xl">
            {esReto ? `¡Día ${rutina.orden} completado!` : "¡Rutina completada!"}
          </p>
          <p className="mt-1 text-white/90">Cada clase cuenta. Nos vemos en la próxima.</p>
          <div className="mt-5 flex flex-col gap-2">
            {siguiente && (
              <Link href={`/clase/?id=${idReto(siguiente)}`} className="rounded-full bg-white px-5 py-3 font-medium text-tinta">
                Ver el día {siguiente} →
              </Link>
            )}
            <Link href="/" className="rounded-full bg-white/20 px-5 py-3 font-medium">
              Ir al inicio
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
