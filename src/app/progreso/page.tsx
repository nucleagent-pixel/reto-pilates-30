"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import Protegido from "@/components/Protegido";
import Cargando from "@/components/Cargando";
import { AvatarLaura } from "@/components/Marca";
import { useAuth } from "@/components/AuthProvider";
import { agregarRegistro, guardarObjetivos, marcarDiaCalendario, obtenerRegistros } from "@/lib/datos";
import { calcularRacha, contarHechos, fechaISO, formatoFecha, mejorRacha } from "@/lib/progreso";
import { CLASES } from "@/lib/clases";
import { ANIMOS, MARCA, NIVELES_DOLOR, ZONAS_MEDIDAS } from "@/lib/marca";
import type { Objetivo, PerfilUsuario, Registro } from "@/lib/tipos";

export default function MiProceso() {
  return (
    <Protegido>
      <Contenido />
    </Protegido>
  );
}

const SECCIONES = [
  { id: "calendario", texto: "Calendario" },
  { id: "objetivos", texto: "Objetivos" },
  { id: "medidas", texto: "Medidas" },
  { id: "diario", texto: "Diario" },
  { id: "avance", texto: "Mi avance" },
] as const;
type Seccion = (typeof SECCIONES)[number]["id"];

function Contenido() {
  const { user, perfil, refrescarPerfil } = useAuth();
  const [registros, setRegistros] = useState<Registro[] | null>(null);
  const [seccion, setSeccion] = useState<Seccion>("calendario");

  const cargar = useCallback(async () => {
    if (!user) return;
    setRegistros(await obtenerRegistros(user.uid).catch(() => []));
  }, [user]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  if (!registros || !user || !perfil) return <Cargando />;

  async function nuevoRegistro(datos: Omit<Registro, "id" | "fecha">) {
    await agregarRegistro(user!.uid, datos);
    await cargar();
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="titular">Mi proceso</h1>
        <p className="mt-2 text-carbon/70">Tu espacio personal para registrar tu transformación desde el día uno.</p>
      </header>

      <nav aria-label="Secciones de mi proceso" className="-mx-5 overflow-x-auto px-5">
        <div className="flex w-max gap-2">
          {SECCIONES.map((s) => (
            <button
              key={s.id}
              onClick={() => setSeccion(s.id)}
              aria-pressed={seccion === s.id}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                seccion === s.id ? "bg-carbon text-white" : "bg-white text-carbon ring-1 ring-niebla hover:bg-salvia-fondo"
              }`}
            >
              {s.texto}
            </button>
          ))}
        </div>
      </nav>

      {seccion === "calendario" && (
        <Calendario
          perfil={perfil}
          onMarcar={async (fecha, marcar) => {
            await marcarDiaCalendario(user.uid, fecha, marcar);
            await refrescarPerfil();
          }}
        />
      )}
      {seccion === "objetivos" && (
        <Objetivos
          perfil={perfil}
          onGuardar={async (objetivos, motivo) => {
            await guardarObjetivos(user.uid, objetivos, motivo);
            await refrescarPerfil();
          }}
        />
      )}
      {seccion === "medidas" && <Medidas registros={registros} onGuardar={nuevoRegistro} />}
      {seccion === "diario" && <Diario registros={registros} onGuardar={nuevoRegistro} />}
      {seccion === "avance" && <Avance perfil={perfil} registros={registros} />}
    </div>
  );
}

/* ---------------------------------------------------------------- Calendario */

const DIAS_SEMANA = ["L", "M", "M", "J", "V", "S", "D"];

function clasesPorFecha(perfil: PerfilUsuario) {
  const mapa: Record<string, string[]> = {};
  for (const [clave, ts] of Object.entries(perfil.completados)) {
    if (!ts) continue;
    const fecha = fechaISO(ts.toDate());
    const rapida = clave.startsWith("r");
    const n = Number(rapida ? clave.slice(1) : clave);
    const clase = CLASES.find((c) => c.tipo === (rapida ? "rapida" : "reto") && c.orden === n);
    const nombre = rapida ? `Rápida: ${clase?.titulo ?? n}` : `Día ${n}${clase ? `: ${clase.titulo}` : ""}`;
    (mapa[fecha] ??= []).push(nombre);
  }
  return mapa;
}

function Calendario({
  perfil,
  onMarcar,
}: {
  perfil: PerfilUsuario;
  onMarcar: (fecha: string, marcar: boolean) => Promise<void>;
}) {
  const hoy = new Date();
  const [mes, setMes] = useState(new Date(hoy.getFullYear(), hoy.getMonth(), 1));
  const [elegido, setElegido] = useState(fechaISO(hoy));
  const [guardando, setGuardando] = useState(false);

  const activos = useMemo(() => new Set(perfil.diasActivos), [perfil.diasActivos]);
  const clases = useMemo(() => clasesPorFecha(perfil), [perfil]);

  const primerDia = (mes.getDay() + 6) % 7; // lunes = 0
  const diasMes = new Date(mes.getFullYear(), mes.getMonth() + 1, 0).getDate();
  const celdas = [...Array(primerDia).fill(null), ...Array.from({ length: diasMes }, (_, i) => i + 1)];
  const entrenadosMes = perfil.diasActivos.filter((f) => f.startsWith(fechaISO(mes).slice(0, 7))).length;
  const esFuturo = (f: string) => f > fechaISO(hoy);
  const clasesElegido = clases[elegido] ?? [];
  const elegidoActivo = activos.has(elegido);

  return (
    <section className="space-y-4">
      <div className="tarjeta">
        <div className="mb-4 flex items-center justify-between">
          <button
            className="rounded-full p-2 hover:bg-salvia-fondo"
            aria-label="Mes anterior"
            onClick={() => setMes(new Date(mes.getFullYear(), mes.getMonth() - 1, 1))}
          >
            <Chevron izquierda />
          </button>
          <p className="font-titulo text-2xl font-semibold capitalize">
            {mes.toLocaleDateString("es", { month: "long", year: "numeric" })}
          </p>
          <button
            className="rounded-full p-2 hover:bg-salvia-fondo"
            aria-label="Mes siguiente"
            onClick={() => setMes(new Date(mes.getFullYear(), mes.getMonth() + 1, 1))}
          >
            <Chevron />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center">
          {DIAS_SEMANA.map((d, i) => (
            <span key={i} className="pb-1 text-xs font-semibold text-carbon/50">
              {d}
            </span>
          ))}
          {celdas.map((dia, i) => {
            if (!dia) return <span key={`v${i}`} />;
            const f = fechaISO(new Date(mes.getFullYear(), mes.getMonth(), dia));
            const activo = activos.has(f);
            const conClase = !!clases[f];
            const esHoy = f === fechaISO(hoy);
            return (
              <button
                key={f}
                onClick={() => setElegido(f)}
                disabled={esFuturo(f)}
                aria-label={`${dia}${activo ? ", entrenaste" : ""}`}
                className={`relative mx-auto flex aspect-square w-full max-w-[2.75rem] items-center justify-center rounded-full text-sm transition-colors disabled:text-carbon/25 ${
                  activo ? "bg-salvia font-semibold text-white" : "hover:bg-salvia-fondo"
                } ${esHoy && !activo ? "ring-2 ring-salvia" : ""} ${elegido === f ? "outline outline-2 outline-offset-2 outline-carbon" : ""}`}
              >
                {dia}
                {conClase && <span className="absolute bottom-1 h-1 w-1 rounded-full bg-miel" />}
              </button>
            );
          })}
        </div>

        <p className="mt-4 text-sm text-carbon/70">
          {entrenadosMes} {entrenadosMes === 1 ? "día entrenado" : "días entrenados"} este mes
        </p>
      </div>

      <div className="tarjeta space-y-3">
        <p className="font-semibold capitalize">
          {new Date(`${elegido}T12:00:00`).toLocaleDateString("es", { weekday: "long", day: "numeric", month: "long" })}
        </p>
        {clasesElegido.length > 0 ? (
          <ul className="space-y-1 text-sm">
            {clasesElegido.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-carbon/70">
            {elegidoActivo ? "Marcaste este día como entrenado." : "Aún no hay entrenamiento registrado este día."}
          </p>
        )}
        {clasesElegido.length === 0 && !esFuturo(elegido) && (
          <button
            className={elegidoActivo ? "boton-sec" : "boton"}
            disabled={guardando}
            onClick={async () => {
              setGuardando(true);
              await onMarcar(elegido, !elegidoActivo).catch(console.error);
              setGuardando(false);
            }}
          >
            {guardando ? "Guardando…" : elegidoActivo ? "Desmarcar este día" : "Marcar como entrenado"}
          </button>
        )}
        <p className="text-xs text-carbon/60">
          Los días se marcan solos cuando terminas una clase. Si entrenaste por tu cuenta, márcalo aquí.
        </p>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------- Objetivos */

const SUGERENCIAS = [
  "Tonificar abdomen",
  "Mejorar mi postura",
  "Ganar flexibilidad",
  "Reducir medidas",
  "Crear el hábito de entrenar",
  "Aliviar el dolor de espalda",
  "Tener más energía",
  "Sentirme bien con mi cuerpo",
];

function Objetivos({
  perfil,
  onGuardar,
}: {
  perfil: PerfilUsuario;
  onGuardar: (objetivos: Objetivo[], motivo: string) => Promise<void>;
}) {
  const [motivo, setMotivo] = useState(perfil.motivo);
  const [nuevo, setNuevo] = useState("");
  const [estado, setEstado] = useState("");
  const objetivos = perfil.objetivos;

  async function guardar(lista: Objetivo[], m = perfil.motivo) {
    setEstado("Guardando…");
    try {
      await onGuardar(lista, m);
      setEstado("Guardado");
      setTimeout(() => setEstado(""), 1500);
    } catch {
      setEstado("No se pudo guardar. Revisa tu conexión.");
    }
  }

  function agregar(texto: string) {
    const t = texto.trim();
    if (!t || objetivos.some((o) => o.texto.toLowerCase() === t.toLowerCase())) return;
    guardar([...objetivos, { texto: t, logrado: false }]);
    setNuevo("");
  }

  const logrados = objetivos.filter((o) => o.logrado).length;

  return (
    <section className="space-y-4">
      <div className="tarjeta space-y-3">
        <label htmlFor="motivo" className="font-titulo text-2xl font-semibold">
          ¿Por qué empiezas este reto?
        </label>
        <p className="text-sm text-carbon/70">Escríbelo para ti. Vuelve a leerlo los días que te cueste.</p>
        <textarea
          id="motivo"
          rows={3}
          className="input resize-none"
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          placeholder="Ej: Quiero volver a sentirme fuerte y tener tiempo para mí."
        />
        <button className="boton-sec" disabled={motivo === perfil.motivo} onClick={() => guardar(objetivos, motivo)}>
          Guardar
        </button>
      </div>

      <div className="tarjeta space-y-4">
        <div className="flex items-baseline justify-between">
          <p className="font-titulo text-2xl font-semibold">Mis objetivos</p>
          {objetivos.length > 0 && (
            <p className="text-sm text-carbon/70">
              {logrados} de {objetivos.length} logrados
            </p>
          )}
        </div>

        {objetivos.length === 0 && (
          <p className="text-sm text-carbon/70">¿Qué quieres lograr en estos {MARCA.totalReto} días? Agrega uno o elige una idea.</p>
        )}

        <ul className="space-y-2">
          {objetivos.map((o, i) => (
            <li key={o.texto} className="flex items-center gap-3 rounded-2xl bg-lino px-3 py-2.5">
              <button
                role="checkbox"
                aria-checked={o.logrado}
                aria-label={`Marcar "${o.texto}" como logrado`}
                onClick={() => guardar(objetivos.map((x, j) => (j === i ? { ...x, logrado: !x.logrado } : x)))}
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                  o.logrado ? "border-salvia bg-salvia text-white" : "border-carbon/30 bg-white"
                }`}
              >
                {o.logrado && <Check />}
              </button>
              <span className={`flex-1 ${o.logrado ? "text-carbon/50 line-through" : ""}`}>{o.texto}</span>
              <button
                className="rounded-full px-2 text-sm text-carbon/50 hover:text-carbon"
                aria-label={`Quitar "${o.texto}"`}
                onClick={() => guardar(objetivos.filter((_, j) => j !== i))}
              >
                Quitar
              </button>
            </li>
          ))}
        </ul>

        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            agregar(nuevo);
          }}
        >
          <input
            className="input"
            value={nuevo}
            onChange={(e) => setNuevo(e.target.value)}
            placeholder="Escribe un objetivo"
            aria-label="Nuevo objetivo"
          />
          <button className="boton" disabled={!nuevo.trim()}>
            Agregar
          </button>
        </form>

        <div className="flex flex-wrap gap-2">
          {SUGERENCIAS.filter((s) => !objetivos.some((o) => o.texto === s)).map((s) => (
            <button key={s} className="chip" onClick={() => agregar(s)}>
              + {s}
            </button>
          ))}
        </div>
        {estado && <p className="text-sm text-salvia">{estado}</p>}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------- Medidas */

type GuardarRegistro = (datos: Omit<Registro, "id" | "fecha">) => Promise<void>;

function Medidas({ registros, onGuardar }: { registros: Registro[]; onGuardar: GuardarRegistro }) {
  const historial = registros.filter((r) => r.tipo === "peso" || r.tipo === "medidas");
  return (
    <section className="space-y-4">
      <div className="tarjeta space-y-3">
        <p className="font-titulo text-2xl font-semibold">Peso</p>
        <FormPeso onGuardar={(peso) => onGuardar({ tipo: "peso", peso })} />
      </div>
      <div className="tarjeta space-y-3">
        <p className="font-titulo text-2xl font-semibold">Medidas</p>
        <p className="text-sm text-carbon/70">
          Lo ideal es medirte el día 1, el 15 y el 30, siempre en el mismo lugar y a la misma hora.
        </p>
        <FormMedidas onGuardar={(medidas) => onGuardar({ tipo: "medidas", medidas })} />
      </div>
      {historial.length > 0 && (
        <div>
          <p className="mb-2 font-titulo text-xl font-semibold">Registros anteriores</p>
          <ul className="divide-y divide-niebla overflow-hidden rounded-[1.5rem] bg-white ring-1 ring-niebla">
            {historial.map((r) => (
              <li key={r.id} className="flex items-baseline justify-between gap-3 px-4 py-3">
                <span className="text-sm">{resumen(r)}</span>
                <span className="shrink-0 text-xs text-carbon/60">{formatoFecha(r.fecha)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
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
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-carbon/50">kg</span>
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
            <label className="etiqueta" htmlFor={`m-${z}`}>
              {z} (cm)
            </label>
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
      <button className="boton w-full" disabled={guardando || !Object.keys(medidas).length}>
        {guardando ? "Guardando…" : "Guardar medidas"}
      </button>
    </form>
  );
}

/* -------------------------------------------------------------------- Diario */

const PREGUNTAS = [
  "¿Cómo te sentiste hoy en tu cuerpo?",
  "¿Qué cambio pequeño notaste esta semana?",
  "¿Qué fue lo más difícil hoy y cómo lo superaste?",
  "¿Qué te dirías si hoy no tuvieras ganas de entrenar?",
  "¿De qué te sientes orgullosa hoy?",
  "¿Cómo dormiste y cómo está tu energía?",
  "¿Qué le agradeces hoy a tu cuerpo?",
];

function Diario({ registros, onGuardar }: { registros: Registro[]; onGuardar: GuardarRegistro }) {
  const pregunta = PREGUNTAS[new Date().getDate() % PREGUNTAS.length];
  const [texto, setTexto] = useState("");
  const [animo, setAnimo] = useState<number | undefined>();
  const [guardando, setGuardando] = useState(false);
  const entradas = registros.filter((r) => r.tipo === "diario" || r.tipo === "animo" || r.tipo === "dolor");

  async function guardar(e: FormEvent) {
    e.preventDefault();
    if (!texto.trim()) return;
    setGuardando(true);
    try {
      await onGuardar({ tipo: "diario", texto: texto.trim(), animo });
      setTexto("");
      setAnimo(undefined);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <section className="space-y-4">
      <form onSubmit={guardar} className="tarjeta space-y-4">
        <div className="flex items-start gap-3">
          <AvatarLaura tam={40} />
          <p className="rounded-2xl rounded-tl-md bg-salvia-fondo px-4 py-3 leading-snug">{pregunta}</p>
        </div>
        <textarea
          rows={5}
          className="input"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Escribe con tus palabras. Solo tú puedes leer esto."
          aria-label="Entrada del diario"
        />
        <div>
          <p className="etiqueta">¿Cómo te sientes? (opcional)</p>
          <div className="flex gap-2">
            {ANIMOS.map((a) => (
              <button
                key={a.valor}
                type="button"
                onClick={() => setAnimo(animo === a.valor ? undefined : a.valor)}
                aria-pressed={animo === a.valor}
                aria-label={a.texto}
                className={`flex h-11 w-11 items-center justify-center rounded-full text-xl transition-colors ${
                  animo === a.valor ? "bg-salvia" : "bg-lino hover:bg-salvia-fondo"
                }`}
              >
                {a.emoji}
              </button>
            ))}
          </div>
        </div>
        <button className="boton w-full" disabled={guardando || !texto.trim()}>
          {guardando ? "Guardando…" : "Guardar en mi diario"}
        </button>
      </form>

      {entradas.length === 0 ? (
        <p className="text-center text-sm text-carbon/70">Tu diario está vacío. La primera entrada es la más valiosa al final del reto.</p>
      ) : (
        <ol className="space-y-3">
          {entradas.map((r) => (
            <li key={r.id} className="rounded-[1.5rem] bg-white p-4 ring-1 ring-niebla">
              <div className="mb-1 flex items-center justify-between gap-2">
                <p className="text-sm font-semibold capitalize">
                  {r.fecha ? r.fecha.toDate().toLocaleDateString("es", { weekday: "long", day: "numeric", month: "long" }) : "Hoy"}
                </p>
                {r.animo && <span className="text-lg">{ANIMOS.find((a) => a.valor === r.animo)?.emoji}</span>}
              </div>
              {r.tipo === "diario" ? (
                <p className="whitespace-pre-line leading-relaxed">{r.texto}</p>
              ) : (
                <p className="text-sm text-carbon/80">
                  {resumen(r)}
                  {r.nota ? `. “${r.nota}”` : ""}
                  {r.dia ? ` (después del día ${r.dia})` : ""}
                </p>
              )}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

/* --------------------------------------------------------------------- Avance */

function Avance({ perfil, registros }: { perfil: PerfilUsuario; registros: Registro[] }) {
  const hechos = contarHechos(perfil.completados);
  const racha = calcularRacha(perfil.diasActivos);
  const mejor = mejorRacha(perfil.diasActivos);
  const pesos = registros.filter((r) => r.tipo === "peso" && r.peso).reverse();
  const medidas = registros.filter((r) => r.tipo === "medidas").reverse();
  const diario = registros.filter((r) => r.tipo === "diario").reverse();
  const logrados = perfil.objetivos.filter((o) => o.logrado).length;

  // Primer y último valor de cada medida.
  const comparacion = ZONAS_MEDIDAS.map((z) => {
    const con = medidas.filter((m) => m.medidas?.[z]);
    if (con.length < 2) return null;
    const inicio = con[0].medidas![z];
    const ahora = con[con.length - 1].medidas![z];
    return { zona: z, inicio, ahora, dif: +(ahora - inicio).toFixed(1) };
  }).filter(Boolean) as { zona: string; inicio: number; ahora: number; dif: number }[];

  const pesoInicio = pesos[0]?.peso;
  const pesoAhora = pesos[pesos.length - 1]?.peso;

  return (
    <section className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Dato titulo="Días del reto" valor={`${hechos} de ${MARCA.totalReto}`} />
        <Dato titulo="Días entrenados" valor={String(new Set(perfil.diasActivos).size)} />
        <Dato titulo="Racha actual" valor={`${racha} ${racha === 1 ? "día" : "días"}`} />
        <Dato titulo="Mejor racha" valor={`${mejor} ${mejor === 1 ? "día" : "días"}`} />
      </div>

      <div className="tarjeta">
        <p className="mb-3 font-titulo text-2xl font-semibold">Inicio y hoy</p>
        {pesos.length < 2 && comparacion.length === 0 ? (
          <p className="text-sm text-carbon/70">
            Registra tu peso o tus medidas al menos dos veces y aquí verás cuánto has cambiado desde el inicio.
          </p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-carbon/60">
                <th className="pb-2 font-medium" scope="col"></th>
                <th className="pb-2 text-right font-medium" scope="col">Inicio</th>
                <th className="pb-2 text-right font-medium" scope="col">Hoy</th>
                <th className="pb-2 text-right font-medium" scope="col">Cambio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-niebla">
              {pesos.length >= 2 && pesoInicio && pesoAhora && (
                <Fila zona="Peso" inicio={pesoInicio} ahora={pesoAhora} unidad="kg" />
              )}
              {comparacion.map((c) => (
                <Fila key={c.zona} zona={c.zona} inicio={c.inicio} ahora={c.ahora} unidad="cm" />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {pesos.length > 1 && <GraficoPeso registros={pesos} />}

      {perfil.objetivos.length > 0 && (
        <div className="tarjeta">
          <p className="font-titulo text-2xl font-semibold">
            {logrados} de {perfil.objetivos.length} objetivos logrados
          </p>
          <ul className="mt-2 space-y-1 text-sm">
            {perfil.objetivos.map((o) => (
              <li key={o.texto} className={o.logrado ? "text-salvia" : "text-carbon/70"}>
                {o.logrado ? "✓ " : "○ "}
                {o.texto}
              </li>
            ))}
          </ul>
        </div>
      )}

      {diario.length > 0 && (
        <div className="tarjeta space-y-3">
          <p className="font-titulo text-2xl font-semibold">Cómo empezaste</p>
          <blockquote className="border-l-4 border-miel pl-4 italic leading-relaxed">“{diario[0].texto}”</blockquote>
          <p className="text-xs text-carbon/60">Tu primera entrada del diario, {formatoFecha(diario[0].fecha)}</p>
          {perfil.motivo && (
            <>
              <p className="pt-2 font-semibold">Tu motivo</p>
              <p className="leading-relaxed text-carbon/80">{perfil.motivo}</p>
            </>
          )}
        </div>
      )}
    </section>
  );
}

function Fila({ zona, inicio, ahora, unidad }: { zona: string; inicio: number; ahora: number; unidad: string }) {
  const dif = +(ahora - inicio).toFixed(1);
  return (
    <tr>
      <th scope="row" className="py-2 font-medium">
        {zona}
      </th>
      <td className="py-2 text-right tabular-nums">
        {inicio} {unidad}
      </td>
      <td className="py-2 text-right tabular-nums">
        {ahora} {unidad}
      </td>
      <td className={`py-2 text-right font-semibold tabular-nums ${dif < 0 ? "text-salvia" : "text-carbon/70"}`}>
        {dif > 0 ? "+" : ""}
        {dif} {unidad}
      </td>
    </tr>
  );
}

function Dato({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div className="tarjeta py-4">
      <p className="text-sm text-carbon/70">{titulo}</p>
      <p className="mt-1 font-titulo text-3xl font-semibold leading-none">{valor}</p>
    </div>
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
    <div className="tarjeta">
      <div className="mb-3 flex items-baseline justify-between">
        <p className="font-semibold">Tu peso</p>
        <p className="text-xs text-carbon/60">
          {formatoFecha(datos[0].fecha)} – {formatoFecha(datos[datos.length - 1].fecha)}
        </p>
      </div>
      <svg viewBox={`-6 -10 ${ancho + 12} ${alto + 20}`} className="h-32 w-full overflow-visible" role="img" aria-label="Gráfico de tu peso">
        <path d={`${linea} L${ancho},${alto + 10} L0,${alto + 10} Z`} fill="#D9B88F" opacity="0.25" />
        <path d={linea} fill="none" stroke="#55684F" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {puntos.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="3.5" fill="#fff" stroke="#55684F" strokeWidth="2" />
        ))}
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ Utilidades */

function resumen(r: Registro) {
  if (r.tipo === "peso") return `${r.peso} kg`;
  if (r.tipo === "medidas")
    return Object.entries(r.medidas ?? {})
      .map(([k, v]) => `${k} ${v} cm`)
      .join(", ");
  if (r.tipo === "dolor")
    return (
      "Molestia en " +
      (r.dolores ?? [])
        .map((d) => `${d.zona.toLowerCase()} (${NIVELES_DOLOR.find((n) => n.valor === d.nivel)?.texto.toLowerCase()})`)
        .join(", ")
    );
  if (r.tipo === "diario") return r.texto ?? "";
  return `Me sentí ${ANIMOS.find((a) => a.valor === r.animo)?.texto.toLowerCase() ?? ""}`;
}

function Chevron({ izquierda = false }: { izquierda?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path d={izquierda ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Check() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={3} aria-hidden>
      <path d="M5 12l5 5 9-10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
