// Carta de Aminta. Para cambiar un precio o sumar un producto, editá este archivo.
// Precios en pesos. `capas` va de abajo hacia arriba: [ingrediente, proporción de la taza].

const INGREDIENTES = {
  espresso:  { nombre: 'Espresso', color: '#3a1d17' },
  leche:     { nombre: 'Leche', color: '#ebe3d5' },
  espuma:    { nombre: 'Espuma de leche', color: '#ffffff' },
  agua:      { nombre: 'Agua', color: '#93b7ba' },
  chocolate: { nombre: 'Chocolate', color: '#1c0f0c' },
  vainilla:  { nombre: 'Vainilla', color: '#f1dfa0' },
  caramelo:  { nombre: 'Caramelo', color: '#c27a3e' },
  matcha:    { nombre: 'Matcha', color: '#6f9a4a' },
  tonica:    { nombre: 'Tónica', color: '#bcd8da' },
  coldbrew:  { nombre: 'Cold brew con frutos rojos', color: '#4a121c' },
};

const NOTA_LECHES = {
  titulo: '¿Otra leche?',
  texto: 'Descremada, deslactosada y vegetal (avena Naveia y almendras Pampa Vida).',
};

const CARTA = [
  {
    id: 'cafe',
    nombre: 'Café',
    taza: true,
    nota: NOTA_LECHES,
    items: [
      { nombre: 'Espresso', precio: 3600, ml: 80, capas: [['espresso', 0.5]] },
      { nombre: 'Doppio', precio: 4400, ml: 80, capas: [['espresso', 0.78]] },
      { nombre: 'Lungo', precio: 4200, ml: 80, capas: [['espresso', 0.5], ['agua', 0.36]] },
      { nombre: 'Americano', precio: 4500, ml: 200, capas: [['espresso', 0.4], ['agua', 0.5]] },
      { nombre: 'Magic', precio: 4400, ml: 200, capas: [['espresso', 0.42], ['leche', 0.3]] },
      { nombre: 'Cortado', precio: 4200, ml: 80, capas: [['espresso', 0.5], ['leche', 0.4]] },
      { nombre: 'Macchiato', precio: 4400, ml: 200, capas: [['espresso', 0.5], ['espuma', 0.26]] },
      { nombre: 'Flat white', precio: 5400, ml: 200, capas: [['espresso', 0.46], ['leche', 0.46]] },
      { nombre: 'Capuccino', precio: 5100, ml: 200, capas: [['espresso', 0.3], ['leche', 0.62]] },
      { nombre: 'Mocaccino', precio: 5800, ml: 200, capas: [['chocolate', 0.1], ['espresso', 0.3], ['leche', 0.52]] },
      { nombre: 'Latte', precio: 5400, ml: 280, capas: [['espresso', 0.16], ['leche', 0.78]] },
      { nombre: 'Vainilla latte', precio: 5900, ml: 280, capas: [['vainilla', 0.08], ['espresso', 0.13], ['leche', 0.73]] },
      { nombre: 'Caramel latte', precio: 5900, ml: 280, capas: [['caramelo', 0.08], ['espresso', 0.13], ['leche', 0.73]] },
      { nombre: 'Matcha latte', precio: 6000, ml: 280, capas: [['matcha', 0.3], ['leche', 0.64]] },
    ],
  },
  {
    id: 'frios',
    nombre: 'Fríos',
    taza: true,
    hielo: true,
    nota: NOTA_LECHES,
    items: [
      { nombre: 'Iced americano', precio: 5900, capas: [['espresso', 0.3], ['agua', 0.62]] },
      { nombre: 'Iced latte', precio: 6000, capas: [['espresso', 0.16], ['leche', 0.76]] },
      { nombre: 'Iced latte vainilla', precio: 6200, capas: [['vainilla', 0.08], ['espresso', 0.13], ['leche', 0.71]] },
      { nombre: 'Iced latte caramel', precio: 6200, capas: [['caramelo', 0.08], ['espresso', 0.13], ['leche', 0.71]] },
      { nombre: 'Iced flat', precio: 6200, capas: [['espresso', 0.3], ['leche', 0.62]] },
      { nombre: 'Iced mocaccino', precio: 6200, capas: [['chocolate', 0.1], ['espresso', 0.2], ['leche', 0.62]] },
      { nombre: 'Iced matcha', precio: 6500, capas: [['matcha', 0.3], ['leche', 0.62]] },
      { nombre: 'Espresso tonic', precio: 6200, capas: [['espresso', 0.3], ['tonica', 0.62]] },
      { nombre: 'Cold brew frutos rojos', precio: 6200, capas: [['coldbrew', 0.92]] },
    ],
  },
  {
    id: 'filtrados-te',
    nombre: 'Filtrados y té',
    grupos: [
      {
        titulo: 'Filtrados',
        items: [
          { nombre: 'V60', precio: 7000 },
          { nombre: 'Chemex', precio: 7100 },
          { nombre: 'Aeropress', precio: 7400 },
        ],
      },
      {
        titulo: 'Infusiones',
        items: [
          { nombre: 'Greek Summer', precio: 4400, detalle: 'Té verde con flores de azahar, cáscara de naranja, salvia, flores de aciano y miel' },
          { nombre: 'Golden Chai', precio: 4400, detalle: 'Té negro, escamas de cúrcuma, jengibre y cardamomo' },
          { nombre: 'Happy Birthday', precio: 4400, detalle: 'Té negro con caléndula, flores de cártamo, flores de aciano, cacao y caramelo natural' },
          { nombre: 'Días de Sol', precio: 4400, detalle: 'Té oolong de jade, flores de azahar, jazmines y mango' },
          { nombre: 'Flower Tea', precio: 5500, detalle: 'Té blanco con lavanda y manzanilla. Para 2 personas' },
        ],
      },
    ],
  },
  {
    id: 'bebidas',
    nombre: 'Bebidas',
    nota: { titulo: 'Consultá por nuestras bebidas de temporada', texto: 'Siempre tenemos nuevas opciones.' },
    grupos: [
      {
        titulo: 'Bebidas',
        items: [
          { nombre: 'Exprimido de naranja', precio: 4800 },
          { nombre: 'Limonada con menta y jengibre', precio: 4800 },
          { nombre: 'Pomelada con romero', precio: 4800 },
          { nombre: 'Naranja, zanahoria y cúrcuma', precio: 5100 },
          { nombre: 'Detox verde', precio: 5100 },
          { nombre: 'Gaseosa', precio: 3500 },
          { nombre: 'Agua saborizada', precio: 3500 },
          { nombre: 'Agua', precio: 3200 },
        ],
      },
    ],
  },
  {
    id: 'panaderia',
    nombre: 'Panadería',
    grupos: [
      {
        titulo: 'Panadería',
        items: [
          { nombre: 'Medialuna', precio: 2100 },
          { nombre: 'Pan de chocolate', precio: 5200 },
          { nombre: 'Roll de canela', precio: 5200 },
          { nombre: 'Croissant', precio: 5200 },
          { nombre: 'Scon de queso', precio: 4000 },
          { nombre: 'Chipá', precio: 4300 },
          { nombre: 'Chipá relleno', precio: 9100 },
        ],
      },
      {
        titulo: 'Budines',
        items: [
          { nombre: 'Naranja y chocolate', precio: 4900 },
          { nombre: 'Limón y amapola', precio: 4900 },
          { nombre: 'Manzana', precio: 4900 },
          { nombre: 'Limón y frutos rojos', precio: 4200 },
          { nombre: 'Banana y nuez', precio: 4200 },
        ],
      },
      {
        titulo: 'Cookies',
        items: [
          { nombre: 'Vainilla y chocolate', precio: 5200 },
          { nombre: 'Avellanas y chocolate', precio: 5100, vegano: true },
          { nombre: 'Red velvet', precio: 5200 },
          { nombre: 'Pistacho y choco blanco', precio: 5400 },
          { nombre: 'Doble chocolate', precio: 5200 },
        ],
      },
      {
        titulo: 'Alfajores',
        items: [
          { nombre: 'Pistacho y choco blanco', precio: 6200 },
          { nombre: 'Marplatense negro', precio: 5400, sinTacc: true },
          { nombre: 'Marplatense blanco', precio: 5400, sinTacc: true },
          { nombre: 'Nuez XL', precio: 6900 },
          { nombre: 'Coco', precio: 4900 },
          { nombre: 'Chocolate y frutos rojos', precio: 5600 },
          { nombre: 'Maicena', precio: 5400 },
        ],
      },
    ],
  },
  {
    id: 'postres',
    nombre: 'Postres',
    nota: { titulo: '¿Querés una torta entera?', texto: 'Pedila con 48 h de anticipación. Tamaño: 8 porciones. Consultá por sabores disponibles.' },
    grupos: [
      {
        titulo: 'Postres',
        columnas: true,
        items: [
          { nombre: 'Chocotorta', precio: 8900 },
          { nombre: 'Key lime pie', precio: 8900 },
          { nombre: 'Carrot cake', precio: 8900 },
          { nombre: 'Red velvet', precio: 8900 },
          { nombre: 'Torta vasca', precio: 9200 },
          { nombre: 'Tiramisú', precio: 9200 },
          { nombre: 'Marquise de chocolate', precio: 9200 },
          { nombre: 'Cheesecake de frutos rojos', precio: 9200 },
          { nombre: 'Cheesecake de pistacho', precio: 9200 },
          { nombre: 'Cheesecake de maracuyá', precio: 9200 },
          { nombre: 'Matilda', precio: 8900, vegano: true },
          { nombre: 'Tartaleta de frutilla', precio: 9200 },
          { nombre: 'Apple crumble', precio: 8900 },
          { nombre: 'Chocotorta Dubai', precio: 9200 },
          { nombre: 'Chocotorta Nutella', precio: 9200 },
          { nombre: 'Lemon pie', precio: 9200 },
          { nombre: 'Brownie', precio: 6500, sinTacc: true },
          { nombre: 'Lemonie', precio: 6500, sinTacc: true },
          { nombre: 'Carrot', precio: 6500, sinTacc: true },
        ],
      },
    ],
  },
];
