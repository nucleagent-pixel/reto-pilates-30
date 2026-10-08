"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Protegido from "@/components/Protegido";
import Cargando from "@/components/Cargando";
import VideoPlayer from "@/components/VideoPlayer";
import CheckIn, { type DatosCheckIn } from "@/components/CheckIn";
import { useAuth } from "@/components/AuthProvider";
import { agregarRegistro, completarClase, obtenerRutina, registrarActividad } from "@/lib/datos";
import { claveRapida, contarHechos, diaActual, diaDesbloqueado, estaCompletado, idReto, rapidaCompletada } from "@/lib/progreso";
import { MARCA } from "@/lib/marca";
import { AvatarLaura } from "@/components/Marca";
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
  const [sumado, setSumado] = useState(false);

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
  const yaHecho = esReto ? estaCompletado(rutina.orden, completados) : rapidaCompletada(rutina.orden, completados);
  const clave = esReto ? String(rutina.orden) : claveRapida(rutina.orden);

  // Las administradoras pueden ver todas las clases para revisarlas.
  if (esReto && !esAdmin && !diaDesbloqueado(rutina.orden, completados)) {
    const actual = diaActual(completados, MARCA.totalDias);
    return (
      <div className="tarjeta space-y-3 text-center">
        <h1 className="font-titulo text-3xl font-semibold">El día {rutina.orden} aún está bloqueado</h1>
        <p className="text-carbon/70">Completa el día anterior para desbloquearlo.</p>
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
    if (!yaHecho) await completarClase(user.uid, clave);
    else await registrarActividad(user.uid);
    if (d.animo) await agregarRegistro(user.uid, { tipo: "animo", animo: d.animo, nota: d.nota, dia });
    if (d.dolores.length) await agregarRegistro(user.uid, { tipo: "dolor", dolores: d.dolores, dia });
    await refrescarPerfil();
    setSumado(!yaHecho);
    setPaso("hecho");
  }

  const siguiente = esReto && rutina.orden < MARCA.totalDias ? rutina.orden + 1 : null;
  const hechos = contarHechos(completados);

  return (
    <div className="space-y-5">
      <Link href={esReto ? "/reto/" : "/rapidas/"} className="text-sm text-carbon/60 hover:text-carbon">
        ← {esReto ? "Volver al reto" : "Rutinas rápidas"}
      </Link>

      <VideoPlayer url={rutina.videoUrl} titulo={rutina.titulo} />

      <header>
        <p className="text-sm font-medium text-salvia">
          {esReto ? `Día ${rutina.orden} del reto` : `Rutina rápida${rutina.duracion ? ` · ${rutina.duracion}` : ""}`}
        </p>
        <h1 className="titular mt-1">{rutina.titulo}</h1>
        {(rutina.duracion || rutina.zona) && (
          <div className="mt-3 flex flex-wrap gap-2">
            {rutina.duracion && <span className="chip">{rutina.duracion}</span>}
            {rutina.zona && <span className="chip">{rutina.zona}</span>}
          </div>
        )}
        {rutina.descripcion && <p className="mt-4 whitespace-pre-line text-carbon/80">{rutina.descripcion}</p>}
        {rutina.pdfUrl && (
          <a href={rutina.pdfUrl} target="_blank" rel="noreferrer" className="boton-sec mt-4">
            Abrir la guía en PDF
          </a>
        )}
      </header>

      {paso === "ver" && (
        <div className="tarjeta">
          {yaHecho ? (
            <p className="mb-3 text-sm text-carbon/70">Ya la completaste. Puedes repetirla cuando quieras.</p>
          ) : (
            !esReto && <p className="mb-3 text-sm text-carbon/70">Al terminarla suma un día a tu reto de {MARCA.totalReto}.</p>
          )}
          <button className="boton w-full" onClick={() => setPaso("checkin")}>
            {yaHecho ? "La hice otra vez" : "Terminé la clase"}
          </button>
        </div>
      )}

      {paso === "checkin" && (
        <div className="tarjeta">
          <CheckIn
            titulo="¿Cómo te sentiste en la clase?"
            textoBoton="Guardar y terminar"
            permitirOmitir
            onGuardar={guardar}
          />
        </div>
      )}

      {paso === "hecho" && (
        <div className="rounded-[1.75rem] bg-salvia p-6 text-white">
          <p className="font-titulo text-5xl font-bold leading-none">
            {esReto ? `Día ${rutina.orden} listo` : "Rutina lista"}
          </p>
          <p className="mt-2 text-white/85">
            {sumado
              ? `Llevas ${hechos} de ${MARCA.totalReto} días del reto.`
              : "Ya contaba en tu reto, pero repetirla también suma a tu racha."}
          </p>
          <div className="mt-5 flex items-start gap-3">
            <AvatarLaura tam={40} />
            <p className="rounded-2xl rounded-tl-md bg-white/15 px-4 py-3 leading-snug">
              {hechos >= MARCA.totalReto
                ? "Completaste los 30 días. Estoy muy orgullosa de ti."
                : siguiente
                  ? `Muy bien. Mañana te espero en el día ${siguiente}.`
                  : esReto
                    ? "Terminaste las 21 clases. Te faltan algunas rutinas rápidas para cerrar los 30 días."
                    : "Cada minuto en el mat suma. Nos vemos pronto."}
            </p>
          </div>
          <div className="mt-5 flex flex-col gap-2">
            {siguiente && (
              <Link href={`/clase/?id=${idReto(siguiente)}`} className="rounded-full bg-white px-5 py-3 font-medium text-carbon">
                Ver el día {siguiente}
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
