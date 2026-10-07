# Reto Pilates 30D — Web de clases y progreso

Web donde cada clienta ve sus clases del reto, desbloquea los días al completarlos, hace las rutinas rápidas y registra su progreso (peso, medidas, cómo se siente y molestias). Incluye un panel de administración para activar clientas y cargar los links de los videos.

**Tecnología:** Next.js 14 + Tailwind + Firebase (Auth y Firestore), exportada como web estática para Netlify. No necesita servidor ni funciones de pago.

---

## Cómo funciona el acceso

1. La clienta paga por WhatsApp (Leona Bot / banco local).
2. Tú entras al **panel de admin** (`/admin`) y agregas su correo → queda activa.
3. Copias el mensaje de bienvenida que genera el panel y se lo envías por WhatsApp.
4. Ella entra a la web, toca **Crear cuenta** con ese mismo correo y crea su contraseña.
5. Si se registra con un correo que no está activado, ve una pantalla con botón a WhatsApp para pedir ayuda.

Puedes **desactivar** a una clienta en cualquier momento desde el panel (por ejemplo, si hay un reembolso).

---

## Instalación paso a paso

### 1. Firebase

1. Ve a [console.firebase.google.com](https://console.firebase.google.com) y crea un proyecto nuevo (ej. `reto-pilates`).
2. **Authentication** → Comenzar → activa **Correo electrónico/contraseña**.
3. **Firestore Database** → Crear base de datos → modo **producción** → región `southamerica-east1` (São Paulo) o la más cercana.
4. **Firestore → Reglas**: borra lo que hay, pega el contenido del archivo `firestore.rules` y toca **Publicar**.
5. **Configuración del proyecto (⚙️) → Tus apps → Web (`</>`)**: registra la app y copia los datos de configuración.
6. **Créate como administradora**: en Firestore → **Iniciar colección** → ID de colección `admins` → ID del documento: **tu correo en minúsculas** (ej. `nucleagent@gmail.com`) → agrega cualquier campo, por ejemplo `nombre: Nicole` → Guardar.
   Repite con el correo de cualquier otra persona que deba administrar.

### 2. Probar en tu computador (opcional)

Necesitas Node.js 20 o superior.

```bash
cp .env.example .env.local   # y pega los datos de Firebase
npm install
npm run dev                  # abre http://localhost:3000
```

### 3. Subir a Netlify

1. Sube esta carpeta a un repositorio de GitHub.
2. En Netlify: **Add new site → Import from Git** → elige el repositorio. Netlify detecta la configuración (`netlify.toml`) solo.
3. **Site settings → Environment variables**: agrega las 6 variables `NEXT_PUBLIC_FIREBASE_...` con los valores de Firebase.
4. Despliega (Deploys → Trigger deploy).
5. **Importante:** en Firebase → Authentication → **Configuración → Dominios autorizados**, agrega el dominio de Netlify (ej. `reto-pilates.netlify.app`) y tu dominio propio si lo conectas. Sin esto, el login no funciona.

### 4. Cargar las clases

1. Entra a la web con tu correo de admin (créate la cuenta en "Crear cuenta").
2. Ve a **Perfil → Panel de administración → Clases** y toca **Crear clases base**: se crean los 21 días y las 10 rutinas rápidas vacías.
3. Abre cada una y pega el link del video de **Google Drive**, título, duración, zona y descripción.
   - En Drive, cada video debe estar compartido como **"Cualquier persona con el enlace" → Lector**.
   - Para que no aparezca la opción de descargar: en Compartir → ⚙️, desmarca **"Los lectores y comentadores pueden ver la opción para descargar, imprimir y copiar"**.
   - Si Drive bloquea un video por exceso de reproducciones ("se superó la cuota"), haz una copia del archivo en Drive y pega el link nuevo en el panel.
   - La web también acepta YouTube, Vimeo o Bunny Stream: si más adelante cambias de plataforma, solo reemplazas los links.

---

## Personalizar

| Qué | Dónde |
|---|---|
| Nombre, eslogan, WhatsApp de soporte, número de días | `src/lib/marca.ts` |
| Zonas de medidas, zonas de dolor, emociones, aviso de salud | `src/lib/marca.ts` |
| Colores y tipografías | `tailwind.config.ts` |

> Cambia el número de `whatsapp` en `src/lib/marca.ts` antes de publicar (formato: código de país + número, sin `+` ni espacios).

---

## Estructura de datos (Firestore)

| Colección | Qué guarda |
|---|---|
| `admins/{correo}` | Quién puede entrar al panel (se crea a mano). |
| `accesos/{correo}` | Clientas autorizadas: nombre, WhatsApp, país, `activo`. |
| `rutinas/{id}` | `reto-01`…`reto-21` y `rapida-01`…`rapida-10`: título, video, duración, zona, descripción, PDF. |
| `usuarios/{uid}` | Perfil de la clienta, días completados y días con actividad (racha). |
| `usuarios/{uid}/registros` | Peso, medidas, ánimo y molestias, con fecha. |

Los datos de progreso son privados: cada clienta solo ve los suyos (lo garantizan las reglas de Firestore).

---

## Pendientes para próximas versiones

- Fotos de antes/después (requiere activar Storage en el plan Blaze de Firebase).
- Política de privacidad y términos (se guardan datos de salud: peso, medidas, molestias).
- Instalar como app en el celular (PWA con ícono de la marca).
- Activación automática desde Leona Bot.
- Exportar lista de clientas y ver el avance de cada una desde el panel.
