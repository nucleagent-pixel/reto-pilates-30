"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Protegido from "@/components/Protegido";
import Cargando from "@/components/Cargando";
import { cambiarActivo, crearRutinasBase, guardarAcceso, guardarRutina, listarAccesos, obtenerRutinas } from "@/lib/datos";
import { formatoFecha } from "@/lib/progreso";
import { resolverVideo } from "@/lib/video";
import { MARCA } from "@/lib/marca";
import type { Acceso, Rutina } from "@/lib/tipos";

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
        {pestana === "accesos" ? <Accesos /> : <Clases />}
      </div>
    </Protegido>
  );
}

// ---------------- Clientas ----------------

function mensajeBienvenida(a: { nombre?: string; email: string }) {
  const url = typeof window !== "undefined" ? window.location.origin : "";
  return `¡Hola${a.nombre ? ` ${a.nombre.split(" ")[0]}` : ""}! 🎉 Ya tienes acceso al ${MARCA.nombre}.

1. Entra aquí: ${url}/login/
2. Toca "Crear cuenta" y usa este correo: ${a.email}
3. Crea tu contraseña y ¡empieza con el Día 1!

Cualquier duda, escríbenos por aquí 💛`;
}

function Accesos() {
  const [lista, setLista] = useState<Acceso[] | null>(null);
  const [form, setForm] = useState({ email: "", nombre: "", whatsapp: "", pais: "" });
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [copiado, setCopiado] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [error, setError] = useState("");

  const cargar = useCallback(async () => {
    setLista(await listarAccesos().catch(() => []));
  }, []);
  useEffect(() => {
    cargar();
  }, [cargar]);

  async function agregar(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      setError("Revisa el correo.");
      return;
    }
    setGuardando(true);
    try {
      const email = await guardarAcceso({
        email: form.email,
        nombre: form.nombre.trim() || undefined,
        whatsapp: form.whatsapp.trim() || undefined,
        pais: form.pais || undefined,
      });
      setMensaje(mensajeBienvenida({ nombre: form.nombre, email }));
      setForm({ email: "", nombre: "", whatsapp: "", pais: "" });
      await cargar();
    } catch (err) {
      console.error(err);
      setError("No se pudo guardar. ¿Tu correo está en la colección admins?");
    } finally {
      setGuardando(false);
    }
  }

  async function copiar(texto: string, clave: string) {
    await navigator.clipboard.writeText(texto);
    setCopiado(clave);
    setTimeout(() => setCopiado(""), 1800);
  }

  const filtradas = (lista ?? []).filter((a) =>
    [a.email, a.nombre, a.whatsapp, a.pais].join(" ").toLowerCase().includes(busqueda.toLowerCase()),
  );

  return (
    <div className="space-y-5">
      <form onSubmit={agregar} className="tarjeta space-y-4">
        <div>
          <p className="font-titulo text-xl">Activar clienta</p>
          <p className="text-sm text-tinta/60">Cuando confirmes el pago, agrega su correo. Ella crea su cuenta con ese mismo correo.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="etiqueta" htmlFor="a-email">Correo *</label>
            <input id="a-email" type="email" required className="input" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="etiqueta" htmlFor="a-nombre">Nombre</label>
            <input id="a-nombre" className="input" value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
          </div>
          <div>
            <label className="etiqueta" htmlFor="a-wa">WhatsApp</label>
            <input id="a-wa" inputMode="tel" className="input" placeholder="+57 300…" value={form.whatsapp}
              onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} />
          </div>
          <div>
            <label className="etiqueta" htmlFor="a-pais">País</label>
            <select id="a-pais" className="input" value={form.pais} onChange={(e) => setForm({ ...form, pais: e.target.value })}>
              <option value="">—</option>
              {["Colombia", "Venezuela", "Chile", "Bolivia", "Perú", "Ecuador", "México", "Argentina", "Otro"].map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>
        {error && <p className="text-sm text-red-700">{error}</p>}
        <button className="boton w-full sm:w-auto" disabled={guardando}>
          {guardando ? "Activando…" : "Activar acceso"}
        </button>

        {mensaje && (
          <div className="rounded-2xl bg-salvia/15 p-4 ring-1 ring-salvia/40">
            <p className="mb-2 text-sm font-medium">✓ Acceso activado. Envíale este mensaje:</p>
            <pre className="whitespace-pre-wrap font-cuerpo text-sm text-tinta/80">{mensaje}</pre>
            <button type="button" className="boton-sec mt-3" onClick={() => copiar(mensaje, "nuevo")}>
              {copiado === "nuevo" ? "¡Copiado! ✓" : "Copiar mensaje"}
            </button>
          </div>
        )}
      </form>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-titulo text-xl">
            Clientas {lista && <span className="text-base text-tinta/50">({lista.filter((a) => a.activo).length} activas)</span>}
          </p>
          <input className="input max-w-xs py-2" placeholder="Buscar…" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
        </div>
        {!lista ? (
          <Cargando />
        ) : filtradas.length === 0 ? (
          <p className="tarjeta text-center text-sm text-tinta/60">No hay clientas todavía.</p>
        ) : (
          <ul className="space-y-2">
            {filtradas.map((a) => (
              <li key={a.email} className="flex flex-wrap items-center gap-3 rounded-2xl bg-white/80 px-4 py-3 ring-1 ring-arena">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{a.nombre || a.email}</p>
                  <p className="truncate text-sm text-tinta/60">
                    {[a.nombre ? a.email : null, a.whatsapp, a.pais, a.creado ? formatoFecha(a.creado) : null]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <button className="chip" onClick={() => copiar(mensajeBienvenida(a), a.email)}>
                  {copiado === a.email ? "Copiado ✓" : "Copiar mensaje"}
                </button>
                <button
                  onClick={async () => {
                    await cambiarActivo(a.email, !a.activo);
                    await cargar();
                  }}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                    a.activo ? "bg-salvia/20 text-salvia" : "bg-red-100 text-red-700"
                  }`}
                  title="Tocar para cambiar"
                >
                  {a.activo ? "Activa" : "Desactivada"}
                </button>
              </li>
            ))}
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
