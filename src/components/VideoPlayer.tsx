import { resolverVideo } from "@/lib/video";

export default function VideoPlayer({ url, titulo }: { url?: string; titulo: string }) {
  const video = resolverVideo(url);

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
        className="aspect-video w-full rounded-[1.75rem] bg-black"
      />
    );
  }

  return (
    <div className="relative aspect-video overflow-hidden rounded-[1.75rem] bg-black">
      <iframe
        src={video.src}
        title={titulo}
        allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
        allowFullScreen
        className="absolute inset-0 h-full w-full"
      />
    </div>
  );
}
