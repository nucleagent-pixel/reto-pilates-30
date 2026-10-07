"use client";

import { useState } from "react";
import { ANIMOS, NIVELES_DOLOR, ZONAS_DOLOR } from "@/lib/marca";
import type { Dolor } from "@/lib/tipos";

export interface DatosCheckIn {
  animo?: number;
  dolores: Dolor[];
  nota?: string;
}

/** Registro rápido de cómo se siente y si hay dolores. */
export default function CheckIn({
  titulo = "¿Cómo te sentiste?",
  textoBoton = "Guardar",
  permitirOmitir = false,
  onGuardar,
}: {
  titulo?: string;
  textoBoton?: string;
  permitirOmitir?: boolean;
  onGuardar: (d: DatosCheckIn) => Promise<void>;
}) {
  const [animo, setAnimo] = useState<number | undefined>();
  const [dolores, setDolores] = useState<Record<string, number>>({});
  const [nota, setNota] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const alternarZona = (zona: string) =>
    setDolores((d) => {
      const copia = { ...d };
      if (zona in copia) delete copia[zona];
      else copia[zona] = 1;
      return copia;
    });

  async function enviar(omitir = false) {
    setGuardando(true);
    setError("");
    try {
      await onGuardar(
        omitir
          ? { dolores: [] }
          : {
              animo,
              dolores: Object.entries(dolores).map(([zona, nivel]) => ({ zona, nivel })),
              nota: nota.trim() || undefined,
            },
      );
      setAnimo(undefined);
      setDolores({});
      setNota("");
    } catch (e) {
      console.error(e);
      setError("No pudimos guardar. Revisa tu conexión e inténtalo de nuevo.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="mb-3 font-titulo text-lg">{titulo}</p>
        <div className="grid grid-cols-5 gap-2">
          {ANIMOS.map((a) => (
            <button
              key={a.valor}
              type="button"
              onClick={() => setAnimo(a.valor)}
              className={`flex flex-col items-center gap-1 rounded-2xl py-3 text-[11px] transition ${
                animo === a.valor ? "bg-terracota text-white" : "bg-arena/60 hover:bg-arena"
              }`}
            >
              <span className="text-2xl">{a.emoji}</span>
              {a.texto}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-tinta/70">¿Sentiste alguna molestia? (opcional)</p>
        <div className="flex flex-wrap gap-2">
          {ZONAS_DOLOR.map((z) => (
            <button
              key={z}
              type="button"
              onClick={() => alternarZona(z)}
              className={`chip ${z in dolores ? "chip-activo" : ""}`}
            >
              {z}
            </button>
          ))}
        </div>
        {Object.keys(dolores).length > 0 && (
          <div className="mt-3 space-y-2">
            {Object.entries(dolores).map(([zona, nivel]) => (
              <div key={zona} className="flex items-center justify-between gap-2 rounded-2xl bg-white px-3 py-2 ring-1 ring-arena">
                <span className="text-sm">{zona}</span>
                <div className="flex gap-1">
                  {NIVELES_DOLOR.map((n) => (
                    <button
                      key={n.valor}
                      type="button"
                      onClick={() => setDolores((d) => ({ ...d, [zona]: n.valor }))}
                      className={`rounded-full px-3 py-1 text-xs transition ${
                        nivel === n.valor ? "bg-tinta text-white" : "bg-arena/70"
                      }`}
                    >
                      {n.texto}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {Object.values(dolores).some((n) => n === 3) && (
              <p className="rounded-2xl bg-rosa/30 px-3 py-2 text-xs text-tinta/80">
                Si el dolor es fuerte o no se va, descansa y consulta a un profesional de la salud antes de seguir.
              </p>
            )}
          </div>
        )}
      </div>

      <div>
        <label className="etiqueta" htmlFor="nota">Nota (opcional)</label>
        <textarea
          id="nota"
          rows={2}
          value={nota}
          onChange={(e) => setNota(e.target.value)}
          placeholder="Ej: hoy me costó la plancha pero la terminé 💪"
          className="input resize-none"
        />
      </div>

      {error && <p className="text-sm text-red-700">{error}</p>}

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          className="boton flex-1"
          disabled={guardando || (!permitirOmitir && !animo && Object.keys(dolores).length === 0)}
          onClick={() => enviar()}
        >
          {guardando ? "Guardando…" : textoBoton}
        </button>
        {permitirOmitir && (
          <button type="button" className="boton-sec" disabled={guardando} onClick={() => enviar(true)}>
            Omitir
          </button>
        )}
      </div>
    </div>
  );
}
