import { resolverVideo } from "@/lib/video";

/** Link para abrir el video directamente en Google Drive (se ve mejor en el celular). */
function linkDrive(url?: string) {
  const id = url?.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=\w+&)?id=)([\w-]+)/)?.[1];
  return id ? `https://drive.google.com/file/d/${id}/view` : null;
}

export default function VideoPlayer({ url, titulo }: { url?: string; titulo: string }) {
  const video = resolverVideo(url);
  const enDrive = linkDrive(url);

  if (!video) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-[1.75rem] bg-niebla text-center text-sm text-carbon/60">
        <p className="px-6">El video de esta clase estará disponible muy pronto.</p>
      </div>
    );
  }

  if (video.tipo === "archivo") {
    return (
      <video
        src={video.src}
        controls
        playsInline
        controlsList="nodownload"
        className="-mx-5 aspect-video w-[calc(100%+2.5rem)] max-w-none bg-black sm:mx-0 sm:w-full sm:rounded-[1.75rem]"
      />
    );
  }

  return (
    <div className="space-y-3">
      {/* En el celular el video va de borde a borde para que se vea más grande y no se recorten los controles. */}
      <div className="relative -mx-5 aspect-video overflow-hidden bg-black sm:mx-0 sm:rounded-[1.75rem]">
        <iframe
          src={video.src}
          title={titulo}
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>
      {enDrive && (
        <a href={enDrive} target="_blank" rel="noreferrer" className="boton-sec w-full">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
            <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Ver en pantalla completa
        </a>
      )}
    </div>
  );
}
