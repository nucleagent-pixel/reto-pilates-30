"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { fb } from "@/lib/firebase";
import { useAuth } from "@/components/AuthProvider";
import { MARCA } from "@/lib/marca";
import Marca from "@/components/Marca";

type Modo = "entrar" | "crear" | "recuperar";

const ERRORES: Record<string, string> = {
  "auth/invalid-credential": "Correo o contraseña incorrectos.",
  "auth/wrong-password": "Correo o contraseña incorrectos.",
  "auth/user-not-found": "No existe una cuenta con ese correo. Crea tu cuenta primero.",
  "auth/email-already-in-use": "Ya existe una cuenta con ese correo. Inicia sesión.",
  "auth/weak-password": "La contraseña debe tener al menos 6 caracteres.",
  "auth/invalid-email": "El correo no es válido.",
  "auth/too-many-requests": "Demasiados intentos. Espera unos minutos e inténtalo de nuevo.",
  "auth/network-request-failed": "Sin conexión. Revisa tu internet.",
};

export default function Login() {
  const { user, cargando, tieneAcceso } = useAuth();
  const router = useRouter();
  const [modo, setModo] = useState<Modo>("entrar");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [clave, setClave] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    if (cargando || !user) return;
    router.replace(tieneAcceso ? "/" : "/sin-acceso/");
  }, [cargando, user, tieneAcceso, router]);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setError("");
    setAviso("");
    setEnviando(true);
    const { auth } = fb();
    const correo = email.trim().toLowerCase();
    try {
      if (modo === "entrar") {
        await signInWithEmailAndPassword(auth, correo, clave);
      } else if (modo === "crear") {
        const cred = await createUserWithEmailAndPassword(auth, correo, clave);
        if (nombre.trim()) await updateProfile(cred.user, { displayName: nombre.trim() });
      } else {
        await sendPasswordResetEmail(auth, correo);
        setAviso("Te enviamos un correo para crear una nueva contraseña. Revisa también la carpeta de spam.");
      }
    } catch (err) {
      const codigo = (err as { code?: string }).code ?? "";
      setError(ERRORES[codigo] ?? "Algo salió mal. Inténtalo de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="min-h-dvh lg:grid lg:grid-cols-[1.1fr_1fr]">
      {/* Foto de Laura: la protagonista de la marca. */}
      <div className="relative h-[46dvh] overflow-hidden rounded-b-[2.5rem] lg:sticky lg:top-0 lg:h-dvh lg:rounded-none">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={MARCA.foto} alt={`${MARCA.instructora}, tu instructora`} className="h-full w-full object-cover object-[60%_25%]" />
        <div className="absolute inset-0 bg-gradient-to-t from-carbon/70 via-carbon/10 to-transparent" />
        <div className="absolute bottom-6 left-5 right-5 lg:bottom-12 lg:left-12">
          <Marca claro grande />
        </div>
      </div>

      <div className="mx-auto flex max-w-md flex-col justify-center px-5 pb-12 pt-8 lg:min-h-dvh lg:py-12">
        <h1 className="titular">{MARCA.nombre}</h1>
        <p className="mb-7 mt-2 text-carbon/70">
          {modo === "crear"
            ? `Crea tu cuenta y empieza hoy con ${MARCA.instructora}. Tu progreso queda guardado.`
            : modo === "recuperar"
              ? "Escribe tu correo y te enviamos un enlace para crear una contraseña nueva."
              : `Entra para seguir tu reto con ${MARCA.instructora}.`}
        </p>

      <div>
        {modo !== "recuperar" && (
          <div className="mb-6 grid grid-cols-2 rounded-full bg-salvia-fondo p-1 text-sm font-semibold">
            {(["entrar", "crear"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setModo(m);
                  setError("");
                }}
                className={`rounded-full py-2 transition ${modo === m ? "bg-white shadow-sm" : "text-carbon/60"}`}
              >
                {m === "entrar" ? "Iniciar sesión" : "Crear cuenta"}
              </button>
            ))}
          </div>
        )}


        <form onSubmit={enviar} className="space-y-4">
          {modo === "crear" && (
            <div>
              <label className="etiqueta" htmlFor="nombre">Tu nombre</label>
              <input id="nombre" className="input" value={nombre} onChange={(e) => setNombre(e.target.value)} autoComplete="name" />
            </div>
          )}
          <div>
            <label className="etiqueta" htmlFor="email">Correo</label>
            <input
              id="email"
              type="email"
              required
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          {modo !== "recuperar" && (
            <div>
              <label className="etiqueta" htmlFor="clave">Contraseña</label>
              <input
                id="clave"
                type="password"
                required
                minLength={6}
                className="input"
                value={clave}
                onChange={(e) => setClave(e.target.value)}
                autoComplete={modo === "crear" ? "new-password" : "current-password"}
              />
            </div>
          )}

          {error && <p className="text-sm text-red-700">{error}</p>}
          {aviso && <p className="text-sm text-madera">{aviso}</p>}

          <button className="boton w-full" disabled={enviando}>
            {enviando
              ? "Un momento…"
              : modo === "entrar"
                ? "Entrar"
                : modo === "crear"
                  ? "Crear mi cuenta"
                  : "Enviar correo"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setModo(modo === "recuperar" ? "entrar" : "recuperar");
            setError("");
            setAviso("");
          }}
          className="mt-4 w-full text-center text-sm text-carbon/60 underline-offset-4 hover:underline"
        >
          {modo === "recuperar" ? "← Volver a iniciar sesión" : "Olvidé mi contraseña"}
        </button>
      </div>
      </div>
    </main>
  );
}
