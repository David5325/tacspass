

const servicios = ['Gmail', 'Facebook', 'Instagram', 'Twitter', 'Netflix', 'TikTok', 'Outlook', 'Amazon', 'Spotify', 'Snapchat'];

function generarCorreoFake() {
  const nombres = ['andres', 'luisa', 'carlos', 'sofia', 'david', 'camila', 'jose', 'valeria'];
  const dominios = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com'];

  const nombre = nombres[Math.floor(Math.random() * nombres.length)];
  const numero = Math.floor(Math.random() * 9000 + 1000);
  const dominio = dominios[Math.floor(Math.random() * dominios.length)];

  return `${nombre}${numero}@${dominio}`;
}

function generarClaveFake() {
  const palabras = ['perro', 'gato', 'rojo', 'verde', 'azul', '123', '2025', 'banana', 'clave', 'luz'];
  const palabra1 = palabras[Math.floor(Math.random() * palabras.length)];
  const palabra2 = palabras[Math.floor(Math.random() * palabras.length)];
  const numero = Math.floor(Math.random() * 9000 + 1000);
  return `${palabra1}${palabra2}${numero}`;
}

export function generarDatosFalsos() {
  return servicios.map((servicio) => ({
  nombre: servicio, 
  correo: generarCorreoFake(),
  clave: generarClaveFake(),
}));

}
