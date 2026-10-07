import type { Config } from "tailwindcss";

// Colores de la marca. Cámbialos aquí cuando esté lista la identidad de Laura.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        crema: "#FBF6F1",
        arena: "#EFE3D6",
        terracota: "#C2705A",
        rosa: "#E9B9AA",
        salvia: "#8DA38B",
        tinta: "#3A2E29",
      },
      fontFamily: {
        titulo: ["Fraunces", "Georgia", "serif"],
        cuerpo: ["'DM Sans'", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
