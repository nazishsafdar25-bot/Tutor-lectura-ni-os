// Numero de WhatsApp del negocio para recibir pedidos (formato internacional, solo digitos, sin '+').
// TODO: cambia esto por el numero real de Zahida's Kitchen antes de publicar el sitio.
const WHATSAPP_NUMBER = '34600000000';

// Menu semanal: comida casera, un tema distinto cada dia. Todos los platos incluyen ensalada de acompañamiento.
const WEEK_MENU = [
  {
    day: 'domingo',
    label: 'Domingo',
    theme: 'Plato de cuchara',
    dish: 'Cocido casero de la abuela',
    description: 'Cocido tradicional con garbanzos, verduras y carne, cocinado a fuego lento como en casa. Incluye ensalada de acompañamiento.',
    kcal: 560,
    price: 10.9
  },
  {
    day: 'lunes',
    label: 'Lunes',
    theme: 'Día de verduras',
    dish: 'Menestra de verduras de temporada',
    description: 'Judías verdes, zanahoria, guisantes y alcachofa salteados con un toque de jamón, al estilo casero. Incluye ensalada de acompañamiento.',
    kcal: 360,
    price: 8.5
  },
  {
    day: 'martes',
    label: 'Martes',
    theme: 'Día de carne',
    dish: 'Pollo al horno con patatas y verduras asadas',
    description: 'Pollo al horno con hierbas, patatas y verduras de temporada asadas, como el de casa de la abuela. Incluye ensalada de acompañamiento.',
    kcal: 530,
    price: 9.9
  },
  {
    day: 'miércoles',
    label: 'Miércoles',
    theme: 'Día de pescado',
    dish: 'Merluza a la plancha con patata cocida',
    description: 'Merluza fresca a la plancha y patata cocida con un chorrito de aceite de oliva. Incluye ensalada de acompañamiento.',
    kcal: 420,
    price: 10.9
  },
  {
    day: 'jueves',
    label: 'Jueves',
    theme: 'Día de arroz',
    dish: 'Arroz con carne de vaca y verduras',
    description: 'Arroz cocinado con carne de vaca, pimiento, guisantes y zanahoria, al estilo casero. Incluye ensalada de acompañamiento.',
    kcal: 520,
    price: 10.5
  },
  {
    day: 'viernes',
    label: 'Viernes',
    theme: 'Día de pasta',
    dish: 'Pasta integral con salsa boloñesa casera',
    description: 'Pasta integral con salsa boloñesa hecha en casa, carne picada, tomate natural y verduras. Incluye ensalada de acompañamiento.',
    kcal: 510,
    price: 8.9
  },
  {
    day: 'sábado',
    label: 'Sábado',
    theme: 'Día de comida asiática',
    dish: 'Wok de pollo, verduras y fideos',
    description: 'Fideos salteados al wok con pollo, brócoli, zanahoria y salsa de soja, al estilo asiático casero. Incluye ensalada de acompañamiento.',
    kcal: 500,
    price: 9.9
  }
];

function getTodayIndex() {
  return new Date().getDay(); // 0 = domingo ... 6 = sabado, coincide con el orden de WEEK_MENU
}

function formatPrice(price) {
  return price.toFixed(2).replace('.', ',') + ' €';
}

function renderTodayCard() {
  const todayCard = document.getElementById('todayCard');
  const today = WEEK_MENU[getTodayIndex()];
  todayCard.innerHTML = `
    <div class="today-card-left">
      <span class="today-day">${today.label} · ${today.theme}</span>
      <h3>${today.dish}</h3>
      <p>${today.description}</p>
      <div class="dish-meta">
        <span>🔥 ${today.kcal} kcal</span>
        <span>🥗 Con ensalada</span>
      </div>
    </div>
    <div class="dish-price">${formatPrice(today.price)}</div>
  `;
}

function renderWeekGrid() {
  const grid = document.getElementById('weekGrid');
  const todayIndex = getTodayIndex();
  // Mostrar la semana empezando en lunes para que se lea de forma natural.
  const order = [1, 2, 3, 4, 5, 6, 0];
  grid.innerHTML = order.map((i) => {
    const item = WEEK_MENU[i];
    const isToday = i === todayIndex;
    return `
      <div class="day-card ${isToday ? 'is-today' : ''}">
        <span class="day-name">${item.label}${isToday ? '<span class="today-badge">HOY</span>' : ''}</span>
        <span class="day-theme">${item.theme}</span>
        <h3>${item.dish}</h3>
        <p>${item.description}</p>
        <div class="dish-meta">
          <span>🔥 ${item.kcal} kcal</span>
          <span>🥗 Con ensalada</span>
        </div>
        <div class="dish-price">${formatPrice(item.price)}</div>
      </div>
    `;
  }).join('');
}

function populateOrderForm() {
  const daySelect = document.getElementById('ofDay');
  const dishSelect = document.getElementById('ofDish');
  const todayIndex = getTodayIndex();
  const order = [1, 2, 3, 4, 5, 6, 0];

  daySelect.innerHTML = order.map((i) => {
    const item = WEEK_MENU[i];
    const selected = i === todayIndex ? 'selected' : '';
    return `<option value="${i}" ${selected}>${item.label}${i === todayIndex ? ' (hoy)' : ''}</option>`;
  }).join('');

  function updateDishOptions() {
    const selectedIndex = Number(daySelect.value);
    const item = WEEK_MENU[selectedIndex];
    dishSelect.innerHTML = `<option value="${item.dish}">${item.dish} — ${formatPrice(item.price)}</option>`;
  }

  daySelect.addEventListener('change', updateDishOptions);
  updateDishOptions();
}

function setupWhatsappLink() {
  const link = document.getElementById('whatsappLink');
  const mensaje = 'Hola, quisiera hacer un pedido en Zahida\'s Kitchen 🙂';
  link.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensaje)}`;
  link.target = '_blank';
  link.rel = 'noopener';
}

function setupOrderForm() {
  const form = document.getElementById('orderForm');
  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const dayIndex = Number(document.getElementById('ofDay').value);
    const dish = document.getElementById('ofDish').value;
    const qty = document.getElementById('ofQty').value;
    const name = document.getElementById('ofName').value.trim();
    const phone = document.getElementById('ofPhone').value.trim();
    const address = document.getElementById('ofAddress').value.trim();
    const notes = document.getElementById('ofNotes').value.trim();
    const dayLabel = WEEK_MENU[dayIndex].label;

    const lines = [
      `¡Hola Zahida's Kitchen! Quiero hacer un pedido a domicilio 🥗`,
      ``,
      `Día: ${dayLabel}`,
      `Plato: ${dish}`,
      `Cantidad: ${qty}`,
      `Nombre: ${name}`,
      `Teléfono: ${phone}`,
      `Dirección: ${address}`
    ];
    if (notes) lines.push(`Notas: ${notes}`);

    const mensaje = lines.join('\n');
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank', 'noopener');
  });
}

function setupNav() {
  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('mainNav');
  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });
  nav.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderTodayCard();
  renderWeekGrid();
  populateOrderForm();
  setupWhatsappLink();
  setupOrderForm();
  setupNav();
});
