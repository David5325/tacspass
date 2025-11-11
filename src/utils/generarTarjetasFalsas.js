const bancos = [
  'Bancolombia',
  'Davivienda',
  'BBVA',
  'Scotibank',
  'AV Villas',
  'Banco de Bogotá',
  'Colpatria',
];

function rnd(min = 0, max = 9) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generarNumeroTarjeta() {
  let num = '';
  for (let i = 0; i < 16; i++) num += rnd();
  return num;
}

function generarCVV() {
  return String(100 + Math.floor(Math.random() * 900)); 
}

function generarFecha() {
  const mes = String(1 + Math.floor(Math.random() * 12)).padStart(2, '0');
  const anio = 25 + Math.floor(Math.random() * 6); 
  return `${mes}/${String(anio).slice(-2)}`;
}


export function generarTarjetasFalsas(cantidad = 3) {
  const ts = Array.from({ length: cantidad }).map((_, i) => ({
    id: `falsa-${Date.now().toString(36)}-${i}`,
    banco: bancos[Math.floor(Math.random() * bancos.length)],
    numero: generarNumeroTarjeta(),
    cvv: generarCVV(),
    fecha: generarFecha(),
  }));
  return ts;
}
