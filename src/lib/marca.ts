// Textos y datos de la marca. Edita aquí sin tocar el resto del código.
export const MARCA = {
  nombre: "Reto Pilates 30D",
  instructora: "Laura",
  eslogan: "Tu cuerpo, tu ritmo, tu reto.",
  totalDias: 21,
  totalRapidas: 10,
  // Número de WhatsApp de soporte/ventas, con código de país y sin "+" ni espacios.
  whatsapp: "570000000000",
};

export function linkWhatsapp(mensaje: string) {
  return `https://wa.me/${MARCA.whatsapp}?text=${encodeURIComponent(mensaje)}`;
}

export const ZONAS_MEDIDAS = ["Cintura", "Cadera", "Abdomen", "Brazo", "Pierna"];

export const ZONAS_DOLOR = [
  "Cuello",
  "Hombros",
  "Espalda alta",
  "Espalda baja",
  "Cadera",
  "Rodillas",
  "Muñecas",
  "Tobillos",
];

export const NIVELES_DOLOR = [
  { valor: 1, texto: "Leve" },
  { valor: 2, texto: "Moderado" },
  { valor: 3, texto: "Fuerte" },
];

export const ANIMOS = [
  { valor: 1, emoji: "😣", texto: "Muy mal" },
  { valor: 2, emoji: "😕", texto: "Regular" },
  { valor: 3, emoji: "😌", texto: "Bien" },
  { valor: 4, emoji: "😊", texto: "Muy bien" },
  { valor: 5, emoji: "🤩", texto: "¡Increíble!" },
];

export const AVISO_SALUD =
  "Las rutinas son de carácter general y no reemplazan la valoración de un profesional de la salud. Si tienes lesiones, dolor persistente, estás embarazada o tienes alguna condición médica, consulta a tu médico antes de empezar. Si sientes dolor fuerte durante un ejercicio, detente.";
