"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Protegido from "@/components/Protegido";
import Cargando from "@/components/Cargando";
import CheckIn, { type DatosCheckIn } from "@/components/CheckIn";
import { useAuth } from "@/components/AuthProvider";
import { agregarRegistro, obtenerRegistros } from "@/lib/datos";
import { calcularRacha, formatoFecha } from "@/lib/progreso";
import { ANIMOS, MARCA, NIVELES_DOLOR, ZONAS_MEDIDAS } from "@/lib/marca";
import type { Registro } from "@/lib/tipos";

export default function Progreso() {
  return (
    <Protegido>
      <Contenido />
    </Protegido>
  );
}

type Pestana = "peso" | "medidas" | "animo";

function Contenido() {
  const { user, perfil } = useAuth();
  const [registros, setRegistros] = useState<Registro[] | null>(null);
  const [pestana, setPestana] = useState<Pestana>("peso");

  const cargar = useCallback(async () => {
    if (!user) return;
    setRegistros(await obtenerRegistros(user.uid).catch(() => []));
  }, [user]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  if (!registros || !user) return <Cargando />;

  const pesos = registros.filter((r) => r.tipo === "peso" && r.peso).reverse();
  const pesoInicial = pesos[0]?.peso;
  const pesoActual = pesos[pesos.length - 1]?.peso;
  const diferencia = pesoInicial && pesoActual ? +(pesoActual - pesoInicial).toFixed(1) : null;
  const hechos = Object.keys(perfil?.completados ?? {}).length;
  const racha = calcularRacha(perfil?.diasActivos ?? []);

  async function guardar(datos: Omit<Registro, "id" | "fecha">) {
    await agregarRegistro(user!.uid, datos);
    await cargar();
  }

  return (
    <div className="space-y-5">
      <h1 className="text-3xl">Mi progreso</h1>

      <section className="grid grid-cols-3 gap-3 text-center">
        <Dato titulo="Días" valor={`${hechos}/${MARCA.totalDias}`} />
        <Dato titulo="Racha" valor={`${racha} 🔥`} />
        <Dato
          titulo="Peso"
          valor={pesoActual ? `${pesoActual} kg` : "—"}
          detalle={diferencia !== null && pesos.length > 1 ? `${diferencia > 0 ? "+" : ""}${diferencia} kg` : undefined}
        />
      </section>

      {pesos.length > 1 && <GraficoPeso registros={pesos} />}

      <section className="tarjeta">
        <p className="mb-4 font-titulo text-xl">Registrar</p>
        <div className="mb-5 grid grid-cols-3 rounded-full bg-arena/60 p-1 text-sm font-medium">
          {(
            [
              ["peso", "Peso"],
              ["medidas", "Medidas"],
              ["animo", "Cómo me siento"],
            ] as const
          ).map(([k, t]) => (
            <button
              key={k}
              onClick={() => setPestana(k)}
              className={`rounded-full px-2 py-2 transition ${pestana === k ? "bg-white shadow-sm" : "text-tinta/60"}`}
            >
              {t}
            </button>
          ))}
        </div>
        {pestana === "peso" && <FormPeso onGuardar={(peso) => guardar({ tipo: "peso", peso })} />}
        {pestana === "medidas" && <FormMedidas onGuardar={(medidas) => guardar({ tipo: "medidas", medidas })} />}
        {pestana === "animo" && (
          <CheckIn
            titulo="¿Cómo te sientes hoy?"
            onGuardar={async (d: DatosCheckIn) => {
              if (d.animo) await agregarRegistro(user.uid, { tipo: "animo", animo: d.animo, nota: d.nota });
              if (d.dolores.length) await agregarRegistro(user.uid, { tipo: "dolor", dolores: d.dolores });
              await cargar();
            }}
          />
        )}
      </section>

      <section>
        <p className="mb-3 font-titulo text-xl">Historial</p>
        {registros.length === 0 ? (
          <p className="tarjeta text-center text-sm text-tinta/60">
            Aún no tienes registros. Empieza anotando tu peso y medidas de hoy para comparar al final del reto.
          </p>
        ) : (
          <ul className="space-y-2">
            {registros.map((r) => (
              <li key={r.id} className="flex gap-3 rounded-2xl bg-white/80 px-4 py-3 ring-1 ring-arena">
                <span className="text-xl">{icono(r)}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{resumen(r)}</p>
                  {r.nota && <p className="text-sm text-tinta/60">“{r.nota}”</p>}
                </div>
                <span className="shrink-0 text-xs text-tinta/50">
                  {formatoFecha(r.fecha)}
                  {r.dia ? ` · Día ${r.dia}` : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Dato({ titulo, valor, detalle }: { titulo: string; valor: string; detalle?: string }) {
  return (
    <div className="tarjeta px-2 py-4">
      <p className="text-xs text-tinta/60">{titulo}</p>
      <p className="mt-1 font-titulo text-xl">{valor}</p>
      {detalle && <p className="text-xs text-tinta/60">{detalle}</p>}
    </div>
  );
}

function FormPeso({ onGuardar }: { onGuardar: (peso: number) => Promise<void> }) {
  const [valor, setValor] = useState("");
  const [guardando, setGuardando] = useState(false);
  async function enviar(e: FormEvent) {
    e.preventDefault();
    const n = parseFloat(valor.replace(",", "."));
    if (!n || n < 20 || n > 300) return;
    setGuardando(true);
    await onGuardar(+n.toFixed(1)).finally(() => setGuardando(false));
    setValor("");
  }
  return (
    <form onSubmit={enviar} className="flex gap-2">
      <div className="relative flex-1">
        <input
          inputMode="decimal"
          className="input pr-12"
          placeholder="Ej: 62,5"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          aria-label="Peso en kilos"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-tinta/50">kg</span>
      </div>
      <button className="boton" disabled={guardando || !valor}>
        {guardando ? "…" : "Guardar"}
      </button>
    </form>
  );
}

function FormMedidas({ onGuardar }: { onGuardar: (m: Record<string, number>) => Promise<void> }) {
  const [valores, setValores] = useState<Record<string, string>>({});
  const [guardando, setGuardando] = useState(false);
  const medidas = Object.fromEntries(
    Object.entries(valores)
      .map(([k, v]) => [k, parseFloat(v.replace(",", "."))] as const)
      .filter(([, n]) => n > 0 && n < 300),
  );
  async function enviar(e: FormEvent) {
    e.preventDefault();
    if (!Object.keys(medidas).length) return;
    setGuardando(true);
    await onGuardar(medidas).finally(() => setGuardando(false));
    setValores({});
  }
  return (
    <form onSubmit={enviar} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {ZONAS_MEDIDAS.map((z) => (
          <div key={z}>
            <label className="etiqueta" htmlFor={`m-${z}`}>{z} (cm)</label>
            <input
              id={`m-${z}`}
              inputMode="decimal"
              className="input"
              value={valores[z] ?? ""}
              onChange={(e) => setValores((v) => ({ ...v, [z]: e.target.value }))}
            />
          </div>
        ))}
      </div>
      <p className="text-xs text-tinta/60">Llena solo las que quieras. Mídete siempre en el mismo lugar y a la misma hora.</p>
      <button className="boton w-full" disabled={guardando || !Object.keys(medidas).length}>
        {guardando ? "Guardando…" : "Guardar medidas"}
      </button>
    </form>
  );
}

function GraficoPeso({ registros }: { registros: Registro[] }) {
  const datos = registros.slice(-20);
  const valores = datos.map((r) => r.peso!);
  const min = Math.min(...valores) - 0.5;
  const max = Math.max(...valores) + 0.5;
  const ancho = 300;
  const alto = 100;
  const puntos = valores.map((v, i) => {
    const x = datos.length === 1 ? ancho / 2 : (i / (datos.length - 1)) * ancho;
    const y = alto - ((v - min) / (max - min)) * alto;
    return [x, y] as const;
  });
  const linea = puntos.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  return (
    <section className="tarjeta">
      <div className="mb-3 flex items-baseline justify-between">
        <p className="font-medium">Tu peso</p>
        <p className="text-xs text-tinta/50">
          {formatoFecha(datos[0].fecha)} – {formatoFecha(datos[datos.length - 1].fecha)}
        </p>
      </div>
      <svg viewBox={`-6 -10 ${ancho + 12} ${alto + 20}`} className="h-32 w-full overflow-visible">
        <path d={`${linea} L${ancho},${alto + 10} L0,${alto + 10} Z`} fill="#E9B9AA" opacity="0.25" />
        <path d={linea} fill="none" stroke="#C2705A" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {puntos.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="3.5" fill="#fff" stroke="#C2705A" strokeWidth="2" />
        ))}
      </svg>
    </section>
  );
}

function icono(r: Registro) {
  if (r.tipo === "peso") return "⚖️";
  if (r.tipo === "medidas") return "📏";
  if (r.tipo === "dolor") return "🩹";
  return ANIMOS.find((a) => a.valor === r.animo)?.emoji ?? "💭";
}

function resumen(r: Registro) {
  if (r.tipo === "peso") return `${r.peso} kg`;
  if (r.tipo === "medidas")
    return Object.entries(r.medidas ?? {})
      .map(([k, v]) => `${k} ${v} cm`)
      .join(" · ");
  if (r.tipo === "dolor")
    return (
      "Molestia: " +
      (r.dolores ?? [])
        .map((d) => `${d.zona} (${NIVELES_DOLOR.find((n) => n.valor === d.nivel)?.texto.toLowerCase()})`)
        .join(", ")
    );
  return `Me sentí: ${ANIMOS.find((a) => a.valor === r.animo)?.texto ?? ""}`;
}
