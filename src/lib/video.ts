export type VideoResuelto = { tipo: "iframe" | "archivo"; src: string };

/**
 * Convierte un link de YouTube, Google Drive, Vimeo o Bunny en un reproductor.
 * Así se pueden cambiar los videos de plataforma solo pegando el nuevo link.
 */
export function resolverVideo(url?: string): VideoResuelto | null {
  const u = (url ?? "").trim();
  if (!u) return null;

  const yt =
    u.match(/youtu\.be\/([\w-]{11})/) ||
    u.match(/youtube\.com\/(?:embed|shorts|live)\/([\w-]{11})/) ||
    (u.includes("youtube.com") ? u.match(/[?&]v=([\w-]{11})/) : null);
  if (yt) {
    return {
      tipo: "iframe",
      src: `https://www.youtube-nocookie.com/embed/${yt[1]}?rel=0&modestbranding=1&playsinline=1`,
    };
  }

  const drive = u.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=\w+&)?id=)([\w-]+)/);
  if (drive) return { tipo: "iframe", src: `https://drive.google.com/file/d/${drive[1]}/preview` };

  const vimeo = u.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) return { tipo: "iframe", src: `https://player.vimeo.com/video/${vimeo[1]}` };

  if (/\.(mp4|webm)(\?|$)/i.test(u)) return { tipo: "archivo", src: u };

  // Bunny Stream u otro reproductor embebible: se usa el link tal cual.
  if (u.startsWith("https://")) return { tipo: "iframe", src: u };

  return null;
}
