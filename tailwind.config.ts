import type { Config } from "tailwindcss";

// Identidad Laura Gómez Pilates: sacada de su estudio en casa.
// Salvia (su top), lino (las paredes), niebla (bordes suaves), madera y miel (estantería y canastos), carbón (los mats).
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        salvia: { DEFAULT: "#55684F", claro: "#8C9C84", fondo: "#E4E9DF" },
        lino: "#F1F0EB",
        niebla: "#DCE0D6",
        madera: "#A87C55",
        miel: "#D9B88F",
        carbon: "#232724",
      },
      fontFamily: {
        titulo: ["'Barlow Condensed'", "'Arial Narrow'", "sans-serif"],
        cuerpo: ["Barlow", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
