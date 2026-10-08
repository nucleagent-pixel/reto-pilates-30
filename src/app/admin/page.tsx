"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Protegido from "@/components/Protegido";
import Cargando from "@/components/Cargando";
import { cambiarBloqueo, crearRutinasBase, guardarRutina, listarBloqueados, listarUsuarios, obtenerRutinas } from "@/lib/datos";
import { fechaISO } from "@/lib/progreso";
import { resolverVideo } from "@/lib/video";
import { MARCA } from "@/lib/marca";
import type { Rutina, UsuarioAdmin } from "@/lib/tipos";

export default function Admin() {
  const [pestana, setPestana] = useState<"accesos" | "clases">("accesos");
  return (
    <Protegido soloAdmin ancho="max-w-3xl">
      <div className="space-y-5">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm text-tinta/60">{MARCA.nombre}</p>
            <h1 className="text-3xl">Administración</h1>
          </div>
          <div className="grid grid-cols-2 rounded-full bg-arena/60 p-1 text-sm font-medium">
            {(["accesos", "clases"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPestana(p)}
                className={`rounded-full px-4 py-2 transition ${pestana === p ? "bg-white shadow-sm" : "text-tinta/60"}`}
              >
                {p === "accesos" ? "Clientas" : "Clases"}
              </button>
            ))}
          </div>
        </header>
        {pestana === "accesos" ? <Clientas /> : <Clases />}
      </div>
    </Protegido>
  );
}

// ---------------- Clientas ----------------

function mensajeBienvenida() {
  const url = typeof window !== "undefined" ? window.location.origin : "";
  return `¡Hola! 🎉 Ya tienes tu acceso al ${MARCA.nombre}.

1. Entra aquí: ${url}/login/
2. Toca "Crear cuenta" con tu correo y crea tu contraseña.
3. ¡Empieza con el Día 1!

Cualquier duda, escríbenos por aquí 💛`;
}

function ultimaActividad(dias: string[]) {
  if (!dias.length) return "Sin actividad";
  const ultima = [...dias].sort().pop()!;
  const [a, m, d] = ultima.split("-").map(Number);
  return "Última vez: " + new Date(a, m - 1, d).toLocaleDateString("es", { day: "numeric", month: "short" });
}

function Clientas() {
  const [lista, setLista] = useState<UsuarioAdmin[] | null>(null);
  const [bloqueadas, setBloqueadas] = useState<Set<string>>(new Set());
  const [busqueda, setBusqueda] = useState("");
  const [copiado, setCopiado] = useState(false);

  const cargar = useCallback(async () => {
    const [usuarios, bloq] = await Promise.all([
      listarUsuarios().catch(() => []),
      listarBloqueados().catch(() => [] as string[]),
    ]);
    setLista(usuarios);
    setBloqueadas(new Set(bloq));
  }, []);
  useEffect(() => {
    cargar();
  }, [cargar]);

  async function copiar() {
    await navigator.clipboard.writeText(mensajeBienvenida());
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1800);
  }

  const filtradas = (lista ?? []).filter((u) =>
    [u.email, u.nombre].join(" ").toLowerCase().includes(busqueda.toLowerCase()),
  );
  const activasHoy = (lista ?? []).filter((u) => u.diasActivos.includes(fechaISO())).length;

  return (
    <div className="space-y-5">
      <div className="tarjeta space-y-3">
        <p className="font-titulo text-xl">Mensaje de bienvenida</p>
        <p className="text-sm text-tinta/60">Envíalo por WhatsApp después de la compra. Con el link, cualquier persona crea su cuenta y entra.</p>
        <pre className="whitespace-pre-wrap rounded-2xl bg-arena/40 p-4 font-cuerpo text-sm text-tinta/80">{mensajeBienvenida()}</pre>
        <button type="button" className="boton" onClick={copiar}>
          {copiado ? "¡Copiado! ✓" : "Copiar mensaje"}
        </button>
      </div>

      {lista && (
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="tarjeta py-4">
            <p className="text-xs text-tinta/60">Registradas</p>
            <p className="font-titulo text-2xl">{lista.length}</p>
          </div>
          <div className="tarjeta py-4">
            <p className="text-xs text-tinta/60">Entrenaron hoy</p>
            <p className="font-titulo text-2xl">{activasHoy}</p>
          </div>
        </div>
      )}

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-titulo text-xl">Clientas</p>
          <input className="input max-w-xs py-2" placeholder="Buscar…" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
        </div>
        {!lista ? (
          <Cargando />
        ) : filtradas.length === 0 ? (
          <p className="tarjeta text-center text-sm text-tinta/60">Todavía no hay clientas registradas.</p>
        ) : (
          <ul className="space-y-2">
            {filtradas.map((u) => {
              const bloqueada = bloqueadas.has(u.email);
              const hechos = Object.keys(u.completados).length;
              return (
                <li key={u.uid} className="flex flex-wrap items-center gap-3 rounded-2xl bg-white/80 px-4 py-3 ring-1 ring-arena">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{u.nombre || u.email}</p>
                    <p className="truncate text-sm text-tinta/60">
                      {[u.nombre ? u.email : null, ultimaActividad(u.diasActivos)].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <span className="chip">
                    Día {hechos}/{MARCA.totalDias}
                  </span>
                  <button
                    onClick={async () => {
                      if (!bloqueada && !confirm(`¿Bloquear a ${u.email}? No podrá entrar a la web.`)) return;
                      await cambiarBloqueo(u.email, !bloqueada);
                      await cargar();
                    }}
                    className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                      bloqueada ? "bg-red-100 text-red-700" : "bg-salvia/20 text-salvia"
                    }`}
                    title="Tocar para cambiar"
                  >
                    {bloqueada ? "Bloqueada" : "Activa"}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

// ---------------- Clases ----------------

function Clases() {
  const [rutinas, setRutinas] = useState<Rutina[] | null>(null);
  const [creando, setCreando] = useState(false);

  const cargar = useCallback(async () => {
    setRutinas(await obtenerRutinas().catch(() => []));
  }, []);
  useEffect(() => {
    cargar();
  }, [cargar]);

  if (!rutinas) return <Cargando />;

  const faltan = MARCA.totalDias + MARCA.totalRapidas - rutinas.length;
  const sinVideo = rutinas.filter((r) => !resolverVideo(r.videoUrl)).length;

  return (
    <div className="space-y-5">
      {faltan > 0 && (
        <div className="tarjeta space-y-3">
          <p className="font-medium">Faltan {faltan} clases por crear</p>
          <p className="text-sm text-tinta/60">
            Crea las {MARCA.totalDias} clases del reto y las {MARCA.totalRapidas} rutinas rápidas. Después solo pegas el link de cada video.
          </p>
          <button
            className="boton"
            disabled={creando}
            onClick={async () => {
              setCreando(true);
              await crearRutinasBase().catch(console.error);
              await cargar();
              setCreando(false);
            }}
          >
            {creando ? "Creando…" : "Crear clases base"}
          </button>
        </div>
      )}

      {rutinas.length > 0 && (
        <p className="text-sm text-tinta/60">
          {sinVideo === 0 ? "✓ Todas las clases tienen video." : `${sinVideo} clases aún no tienen video.`} Pega el link de Google Drive (compartido como "Cualquier persona con el enlace"). También acepta YouTube,
          Vimeo o Bunny.
        </p>
      )}

      {(["reto", "rapida"] as const).map((tipo) => {
        const grupo = rutinas.filter((r) => r.tipo === tipo);
        if (!grupo.length) return null;
        return (
          <section key={tipo} className="space-y-2">
            <p className="font-titulo text-xl">{tipo === "reto" ? "Clases del reto" : "Rutinas rápidas"}</p>
            {grupo.map((r) => (
              <EditorRutina key={r.id} rutina={r} />
            ))}
          </section>
        );
      })}
    </div>
  );
}

function EditorRutina({ rutina }: { rutina: Rutina }) {
  const [abierto, setAbierto] = useState(false);
  const [r, setR] = useState(rutina);
  const [estado, setEstado] = useState<"" | "guardando" | "ok" | "error">("");
  const tieneVideo = !!resolverVideo(r.videoUrl);
  const cambiado = JSON.stringify(r) !== JSON.stringify(rutina);

  async function guardar(e: FormEvent) {
    e.preventDefault();
    setEstado("guardando");
    try {
      await guardarRutina({ ...r, pdfUrl: r.pdfUrl?.trim() || undefined, videoUrl: r.videoUrl.trim() });
      setEstado("ok");
      setTimeout(() => setEstado(""), 1800);
    } catch {
      setEstado("error");
    }
  }

  const campo = (k: keyof Rutina, etiqueta: string, ph = "") => (
    <div>
      <label className="etiqueta" htmlFor={`${r.id}-${k}`}>{etiqueta}</label>
      <input
        id={`${r.id}-${k}`}
        className="input py-2"
        placeholder={ph}
        value={(r[k] as string) ?? ""}
        onChange={(e) => setR({ ...r, [k]: e.target.value })}
      />
    </div>
  );

  return (
    <div className="rounded-2xl bg-white/80 ring-1 ring-arena">
      <button onClick={() => setAbierto(!abierto)} className="flex w-full items-center gap-3 px-4 py-3 text-left">
        <span className="w-8 font-titulo text-lg text-tinta/50">{r.orden}</span>
        <span className="min-w-0 flex-1 truncate font-medium">{r.titulo}</span>
        <span className={`text-xs ${tieneVideo ? "text-salvia" : "text-terracota"}`}>{tieneVideo ? "● Video" : "○ Sin video"}</span>
        <span className="text-tinta/40">{abierto ? "▴" : "▾"}</span>
      </button>
      {abierto && (
        <form onSubmit={guardar} className="space-y-3 border-t border-arena px-4 py-4">
          {campo("titulo", "Título")}
          {campo("videoUrl", "Link del video (Drive)", "https://drive.google.com/file/d/…")}
          <div className="grid gap-3 sm:grid-cols-2">
            {campo("duracion", "Duración", "Ej: 25 min")}
            {campo("zona", "Zona que trabaja", "Ej: Abdomen y glúteos")}
          </div>
          <div>
            <label className="etiqueta" htmlFor={`${r.id}-desc`}>Descripción</label>
            <textarea
              id={`${r.id}-desc`}
              rows={3}
              className="input"
              value={r.descripcion}
              onChange={(e) => setR({ ...r, descripcion: e.target.value })}
            />
          </div>
          {campo("pdfUrl", "Link del PDF (opcional)", "https://drive.google.com/…")}
          <div className="flex items-center gap-3">
            <button className="boton py-2" disabled={!cambiado || estado === "guardando"}>
              {estado === "guardando" ? "Guardando…" : estado === "ok" ? "Guardado ✓" : "Guardar"}
            </button>
            <a href={`/clase/?id=${r.id}`} target="_blank" rel="noreferrer" className="text-sm text-tinta/60 hover:underline">
              Ver como clienta ↗
            </a>
            {estado === "error" && <span className="text-sm text-red-700">No se pudo guardar.</span>}
          </div>
        </form>
      )}
    </div>
  );
}
