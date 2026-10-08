import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { MARCA } from "@/lib/marca";

export const metadata: Metadata = {
  title: `${MARCA.nombre} · ${MARCA.marca} Pilates`,
  description: `${MARCA.eslogan} Tus clases y tu progreso del reto con ${MARCA.instructora}.`,
  robots: { index: false, follow: false },
  icons: { icon: MARCA.avatar, apple: MARCA.avatar },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#F1F0EB",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600&family=Barlow+Condensed:wght@300;500;600;700&display=swap"
        />
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
