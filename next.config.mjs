/** @type {import('next').NextConfig} */
const nextConfig = {
  // Exporta la web como archivos estáticos (carpeta "out") para subirla a Netlify.
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
