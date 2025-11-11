const vias = ['Calle', 'Carrera', 'Avenida', 'Transversal', 'Diagonal'];
const letras = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const complementos = ['Norte', 'Sur', 'Oriente', 'Occidente'];

const ciudades = [
  'Bogotá',
  'Medellín',
  'Cali',
  'Barranquilla',
  'Cartagena',
  'Bucaramanga',
  'Pereira',
  'Manizales',
  'Cúcuta',
  'Santa Marta',
];

const etiquetasFalsas = ['Casa', 'Oficina', 'Apartamento', 'Trabajo', 'Hotel', 'Centro comercial'];
const ejemplosDetalles = [
  'Torre 23, Apto 123',
  'Bloque B, Piso 2',
  'Portería 1',
  'Interior 4',
  'Apto 5A',
  'Local 10',
];

function generarDireccionFake() {
  const via = vias[Math.floor(Math.random() * vias.length)];
  const num1 = Math.floor(Math.random() * 150) + 1;
  const letra = letras[Math.floor(Math.random() * letras.length)];
  const num2 = Math.floor(Math.random() * 200) + 1;
  const num3 = Math.floor(Math.random() * 90) + 1;
  const complemento = complementos[Math.floor(Math.random() * complementos.length)];

  return `${via} ${num1}${letra} # ${num2} - ${num3} ${complemento}`;
}

export function generarDireccionesFalsas(cantidad = 3) {
  return Array.from({ length: cantidad }).map((_, idx) => {
    const etiqueta = etiquetasFalsas[Math.floor(Math.random() * etiquetasFalsas.length)];

    const incluirDetalles = Math.random() < 0.5;
    const detallesExtra = incluirDetalles
      ? ejemplosDetalles[Math.floor(Math.random() * ejemplosDetalles.length)]
      : '';

    const direccionBase = generarDireccionFake();
    const direccionFinal = detallesExtra
      ? `${direccionBase}, ${detallesExtra}`
      : direccionBase;

    return {
      id: `fake-${idx}`,
      etiqueta,
      direccion: direccionFinal, 
      ciudad: ciudades[Math.floor(Math.random() * ciudades.length)],
    };
  });
}
