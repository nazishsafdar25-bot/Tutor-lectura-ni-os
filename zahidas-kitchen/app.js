// Numero de WhatsApp del negocio para recibir pedidos (formato internacional, solo digitos, sin '+').
// TODO: cambia esto por el numero real de Zahida's Kitchen antes de publicar el sitio.
const WHATSAPP_NUMBER = '34600000000';

// Menu semanal: un plato saludable distinto cada dia.
const WEEK_MENU = [
  {
    day: 'domingo',
    label: 'Domingo',
    dish: 'Pasta integral con pesto casero y tomates cherry',
    description: 'Pasta integral, pesto de albahaca casero, tomates cherry asados y un toque de parmesano.',
    kcal: 520,
    price: 9.5
  },
  {
    day: 'lunes',
    label: 'Lunes',
    dish: 'Bowl de quinoa, pollo a la plancha y vegetales asados',
    description: 'Quinoa, pechuga de pollo a la plancha, calabacín, pimiento y zanahoria asados, aderezo de limón.',
    kcal: 480,
    price: 9.5
  },
  {
    day: 'martes',
    label: 'Martes',
    dish: 'Ensalada mediterránea con garbanzos y queso feta',
    description: 'Garbanzos, pepino, tomate, aceitunas, queso feta y aliño de aceite de oliva y orégano.',
    kcal: 420,
    price: 8.5
  },
  {
    day: 'miércoles',
    label: 'Miércoles',
    dish: 'Salmón al horno con puré de camote y brócoli',
    description: 'Salmón horneado con hierbas, puré de camote y brócoli al vapor.',
    kcal: 540,
    price: 11.5
  },
  {
    day: 'jueves',
    label: 'Jueves',
    dish: 'Wrap integral de pavo, aguacate y espinaca',
    description: 'Tortilla integral rellena de pechuga de pavo, aguacate, espinaca fresca y yogur natural.',
    kcal: 460,
    price: 8.9
  },
  {
    day: 'viernes',
    label: 'Viernes',
    dish: 'Curry de lentejas con arroz integral y vegetales',
    description: 'Lentejas en curry suave de leche de coco, arroz integral y vegetales de temporada.',
    kcal: 500,
    price: 8.9
  },
  {
    day: 'sábado',
    label: 'Sábado',
    dish: 'Poke bowl de atún con edamame y pepino',
    description: 'Atún fresco marinado, arroz de sushi, edamame, pepino, zanahoria y salsa de soja ligera.',
    kcal: 510,
    price: 10.9
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
      <span class="today-day">${today.label}</span>
      <h3>${today.dish}</h3>
      <p>${today.description}</p>
      <div class="dish-meta">
        <span>🔥 ${today.kcal} kcal</span>
        <span>🌿 Saludable</span>
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
        <h3>${item.dish}</h3>
        <p>${item.description}</p>
        <div class="dish-meta">
          <span>🔥 ${item.kcal} kcal</span>
          <span class="dish-price">${formatPrice(item.price)}</span>
        </div>
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
