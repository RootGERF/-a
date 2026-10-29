'use strict';

/* ============================================================
   КОФЕЙНЯ «ГАЛОЧКА» — script.js (полная версия с нуля)
   ============================================================ */

/* ---------- 1. Утилиты ---------- */
const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));
const rub = (n) => n.toLocaleString('ru-RU') + ' ₽';

// Фолбэк: если картинка не загрузилась — показываем красивую плашку
window.imgFail = function (img) {
  img.style.display = 'none';
  const parent = img.parentElement;
  if (parent) {
    parent.style.background = 'linear-gradient(135deg, var(--accent-dark), var(--accent))';
    if (!parent.querySelector('.menu-card__emoji')) {
      const ph = document.createElement('span');
      ph.textContent = '☕';
      ph.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:60px;';
      parent.appendChild(ph);
    }
  }
};

// Тихий звуковой сигнал
let audioCtx = null;
function beep(freq = 660, dur = 0.08, vol = 0.05) {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + dur);
  } catch (e) { /* звук не критичен */ }
}

// Всплывающее уведомление
function toast(msg) {
  const t = $('#toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._tm);
  t._tm = setTimeout(() => t.classList.remove('show'), 2400);
}

/* ---------- 2. Данные ---------- */
const MENU = [
  { id: 1,  cat: 'coffee',  name: 'Эспрессо',              desc: 'Классика: двойная порция нашей обжарки', price: 150, img: 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=600&q=80', hit: true },
  { id: 2,  cat: 'coffee',  name: 'Американо',             desc: 'Мягкий и насыщенный, с нотами какао', price: 180, img: 'https://images.unsplash.com/photo-1551030143-ed1e31814e7f?w=600&q=80' },
  { id: 3,  cat: 'coffee',  name: 'Капучино',              desc: 'Плотная молочная пенка и бархатный эспрессо', price: 230, img: 'https://images.unsplash.com/photo-1572442381542-4ed458e21d82?w=600&q=80', hit: true },
  { id: 4,  cat: 'coffee',  name: 'Латте',                 desc: 'Нежный, с латте-арт от нашего бариста', price: 250, img: 'https://images.unsplash.com/photo-1561882468-911a03bb31e2?w=600&q=80' },
  { id: 5,  cat: 'coffee',  name: 'Флэт уайт',             desc: 'Для тех, кто любит покрепче', price: 260, img: 'https://images.unsplash.com/photo-1518441900069-ecceb26bb163?w=600&q=80' },
  { id: 6,  cat: 'coffee',  name: 'Раф «Галочка»',         desc: 'Сливочный, с ванилью и соленой карамелью', price: 300, img: 'https://images.unsplash.com/photo-1461023058943-3fc2772b4b6c?w=600&q=80', hit: true },
  { id: 7,  cat: 'coffee',  name: 'Мокко',                 desc: 'Эспрессо, шоколад и молоко — десертный кофе', price: 290, img: 'https://images.unsplash.com/photo-1578314675759-789c8a1b00b6?w=600&q=80' },
  { id: 8,  cat: 'author',  name: 'Какао с зефиром',       desc: 'Густое какао на молоке с домашним зефиром', price: 270, img: 'https://images.unsplash.com/photo-1542990253-a4e154408785?w=600&q=80' },
  { id: 9,  cat: 'author',  name: 'Матча-латте',           desc: 'Церемониальная матча, овсяное молоко', price: 320, img: 'https://images.unsplash.com/photo-1515830458621-17e0f1b17dd5?w=600&q=80', hit: true },
  { id: 10, cat: 'author',  name: 'Облепиховый чай',       desc: 'Горячий, с медом, апельсином и травами', price: 240, img: 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=600&q=80' },
  { id: 11, cat: 'dessert', name: 'Круассан классический', desc: 'Из собственной пекарни, к 8:00 утра', price: 160, img: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&q=80' },
  { id: 12, cat: 'dessert', name: 'Чизкейк',               desc: 'Нью-Йорк классик с соленой карамелью', price: 290, img: 'https://images.unsplash.com/photo-1524351199678-941a58a3df50?w=600&q=80', hit: true },
  { id: 13, cat: 'dessert', name: 'Тирамису',              desc: 'По рецепту шеф-кондитера', price: 320, img: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&q=80' },
  { id: 14, cat: 'dessert', name: 'Синнабон',              desc: 'С корицей и сливочной глазурью', price: 220, img: 'https://images.unsplash.com/photo-1509365465985-25d11c17e812?w=600&q=80' },
  { id: 15, cat: 'dessert', name: 'Морковный торт',        desc: 'Влажный, с грецким орехом и крем-чизом', price: 260, img: 'https://images.unsplash.com/photo-1587668178277-295011b85961?w=600&q=80', isNew: true },
  { id: 16, cat: 'cold',    name: 'Айс-латте',             desc: 'Холодный, с молоком на выбор', price: 270, img: 'https://images.unsplash.com/photo-1461023058943-3fc2772b4b6c?w=600&q=80' },
  { id: 17, cat: 'cold',    name: 'Колд брю',              desc: '12 часов холодной экстракции', price: 290, img: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600&q=80', hit: true },
  { id: 18, cat: 'cold',    name: 'Коктейль «Тирамису»',   desc: 'Наш хит-десерт в виде напитка', price: 310, img: 'https://images.unsplash.com/photo-1553787490-1a21b8d0ca08?w=600&q=80', isNew: true },
  { id: 19, cat: 'cold',    name: 'Лимонад «Клубника-базилик»', desc: 'Свежий, домашний, без сахара-порошков', price: 230, img: 'https://images.unsplash.com/photo-1564171123747-ff7d3d5c9a0c?w=600&q=80' },
];

const GALLERY = [
  { src: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&q=80', cap: 'Зона у окна — любимое место студентов' },
  { src: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&q=80', cap: 'Латте-арт каждый день' },
  { src: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200&q=80', cap: 'Уютный зал на втором этаже' },
  { src: 'https://images.unsplash.com/photo-1453614512568-c4024e13b887?w=1200&q=80', cap: 'Ручная работа наших бариста' },
  { src: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1200&q=80', cap: 'Свежая обжарка каждую неделю' },
  { src: 'https://images.unsplash.com/photo-1524350876685-440bd5e8b0b3?w=1200&q=80', cap: 'Столики с видом на бульвар' },
  { src: 'https://images.unsplash.com/photo-1521017432531-fbd199d84bca?w=1200&q=80', cap: 'Бариста за работой' },
  { src: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=1200&q=80', cap: 'Свежая выпечка каждое утро' },
  { src: 'https://images.unsplash.com/photo-1461023058943-3fc2772b4b6c?w=1200&q=80', cap: 'Айс-кофе для жарких дней' },
];

const REVIEWS = [
  { stars: 5, text: 'Лучший капучино в городе, без преувеличения. Хожу каждое утро перед работой — через месяц мне стали готовить «как обычно, но поменьше сахара».', author: 'Мария К.', role: 'постоянный гость' },
  { stars: 5, text: 'Уютно, красиво, вкусно. Второй этаж с книгами — спасение в дождливые выходные. А раф «Галочка» — это отдельный вид искусства.', author: 'Дмитрий С.', role: 'фрилансер' },
  { stars: 4, text: 'Отличное место для работы: розетки, Wi-Fi, тихая музыка после 19:00. По выходным у окна иногда сложно найти место 😅', author: 'Анна В.', role: 'студентка' },
  { stars: 5, text: 'Пришли компанией из 8 человек без брони — нас приняли тепло, подарили десерт имениннику. Сервис на высоте!', author: 'Игорь Л.', role: 'гость' },
  { stars: 5, text: 'Заказывала кофе-кейтеринг на корпоратив — привезли вовремя, гости в восторге. Наша официальная кофейня офиса.', author: 'Елена Т.', role: 'HR-менеджер' },
];

/* ---------- 3. Навигация по страницам ---------- */
const PAGES = ['home', 'about', 'menu', 'gallery', 'booking', 'contacts'];

function showPage(name) {
  if (!PAGES.includes(name)) name = 'home';
  $$('.page').forEach((p) => p.classList.remove('active'));
  const page = $('#page-' + name);
  if (page) page.classList.add('active');
  $$('.nav__link').forEach((a) => a.classList.toggle('active', a.dataset.page === name));
  history.replaceState(null, '', name === 'home' ? '#' : '#' + name);
  window.scrollTo({ top: 0 });
}

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-page]');
  if (el) {
    showPage(el.dataset.page);
    closeNav();
  }
});

window.addEventListener('hashchange', () => showPage(location.hash.slice(1) || 'home'));

/* ---------- 4. Меню ---------- */
function menuCardHTML(m, i) {
  const badge = m.hit
    ? '<span class="menu-card__badge">★ ХИТ</span>'
    : m.isNew ? '<span class="menu-card__badge menu-card__badge--new">NEW</span>' : '';
  return `
  <article class="menu-card" style="animation-delay:${i * 0.05}s">
    <div class="menu-card__img">
      <img src="${m.img}" alt="${m.name}" loading="lazy" onerror="imgFail(this)">
      ${badge}
    </div>
    <div class="menu-card__body">
      <h3 class="menu-card__name">${m.name}</h3>
      <p class="menu-card__desc">${m.desc}</p>
      <div class="menu-card__bottom">
        <span class="menu-card__price">${m.price} ₽</span>
        <button class="menu-card__add" data-add="${m.id}">В корзину</button>
      </div>
    </div>
  </article>`;
}

function renderMenu(filter = 'all') {
  const grid = $('#menuGrid');
  if (!grid) return;
  const items = MENU.filter((m) => filter === 'all' || m.cat === filter);
  grid.innerHTML = items.map(menuCardHTML).join('');
}

function renderPopular() {
  const grid = $('#popularGrid');
  if (!grid) return;
  grid.innerHTML = MENU.filter((m) => m.hit).slice(0, 4).map(menuCardHTML).join('');
}

$$('.filter-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    $$('.filter-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    renderMenu(btn.dataset.filter);
    beep(600);
  });
});

/* ---------- 5. Корзина ---------- */
let cart = [];
let promoApplied = false;
const PROMO_CODE = 'GALOCHKA';

function saveCart() {
  localStorage.setItem('g_cart', JSON.stringify(cart));
  localStorage.setItem('g_promo', promoApplied ? '1' : '0');
}

function loadCart() {
  try {
    cart = JSON.parse(localStorage.getItem('g_cart')) || [];
    promoApplied = localStorage.getItem('g_promo') === '1';
  } catch (e) {
    cart = [];
  }
}

function cartTotal() {
  const sum = cart.reduce((a, i) => a + i.price * i.qty, 0);
  return promoApplied ? Math.round(sum * 0.7) : sum;
}

function renderCart() {
  const box = $('#cartItems');
  const foot = $('#cartFoot');
  const count = $('#cartCount');
  if (!box || !count) return;
  count.textContent = cart.reduce((a, i) => a + i.qty, 0);
  box.innerHTML = '';

  if (!cart.length) {
    box.innerHTML = '<p class="cart__empty">Пока пусто… Самое время это исправить ☕</p>';
    if (foot) foot.hidden = true;
  } else {
    cart.forEach((item) => {
      const el = document.createElement('div');
      el.className = 'cart-item';
      el.innerHTML = `
        <div class="cart-item__info">
          <b>${item.name}</b>
          <small>${rub(item.price)} × ${item.qty}</small>
        </div>
        <div class="cart-item__qty">
          <button data-act="minus" data-id="${item.id}">−</button>
          <span>${item.qty}</span>
          <button data-act="plus" data-id="${item.id}">+</button>
        </div>
        <div class="cart-item__price">${rub(item.price * item.qty)}</div>
        <button class="cart-item__del" data-act="del" data-id="${item.id}">🗑</button>`;
      box.appendChild(el);
    });
    if (foot) foot.hidden = false;
    const total = $('#cartTotal');
    if (total) total.textContent = rub(cartTotal());
  }
  saveCart();
}

function addToCart(id) {
  const item = MENU.find((m) => m.id === id);
  if (!item) return;
  const existing = cart.find((c) => c.id === id);
  if (existing) existing.qty++;
  else cart.push({ id: item.id, name: item.name, price: item.price, qty: 1 });
  renderCart();
  beep(740);
  toast(`«${item.name}» добавлен в корзину ☕`);
}

// Делегирование: добавление в корзину и изменение количества
document.addEventListener('click', (e) => {
  const addBtn = e.target.closest('[data-add]');
  if (addBtn) {
    addToCart(Number(addBtn.dataset.add));
    return;
  }
  const btn = e.target.closest('[data-act]');
  if (!btn) return;
  const id = Number(btn.dataset.id);
  const act = btn.dataset.act;
  const item = cart.find((c) => c.id === id);
  if (!item) return;

  if (act === 'plus') item.qty++;
  if (act === 'minus') {
    item.qty--;
    if (item.qty <= 0) cart = cart.filter((c) => c.id !== id);
  }
  if (act === 'del') cart = cart.filter((c) => c.id !== id);

  beep(act === 'del' ? 380 : act === 'plus' ? 740 : 500);
  renderCart();
});

// Открытие / закрытие корзины
function openCart() {
  $('#cart').classList.add('open');
  $('#cartOverlay').classList.add('show');
}

function closeCart() {
  $('#cart').classList.remove('open');
  $('#cartOverlay').classList.remove('show');
}

$('#cartBtn').addEventListener('click', () => {
  openCart();
  beep(620);
});
$('#cartClose').addEventListener('click', closeCart);
$('#cartOverlay').addEventListener('click', closeCart);

$('#promoApply').addEventListener('click', () => {
  const val = $('#promoInput').value.trim().toUpperCase();
  const msg = $('#promoMsg');
  if (val === PROMO_CODE) {
    promoApplied = true;
    msg.textContent = '🎉 Промокод применён: скидка 30%!';
    msg.className = 'cart__promo-msg ok';
    toast('Промокод применён — скидка 30%!');
  } else {
    promoApplied = false;
    msg.textContent = 'Промокод не найден 😢';
    msg.className = 'cart__promo-msg bad';
    beep(300);
  }
  renderCart();
});

$('#orderBtn').addEventListener('click', () => {
  if (!cart.length) return;
  const sum = rub(cartTotal());
  cart = [];
  promoApplied = false;
  renderCart();
  closeCart();
  $('#promoMsg').textContent = '';
  beep(880, 0.15);
  toast(`Заказ оформлен! Сумма: ${sum}. Ждём вас за кофе ☕`);
});

/* ---------- 6. Отзывы-слайдер ---------- */
let revIndex = 0;

function renderReviews() {
  const track = $('#reviewsTrack');
  if (!track) return;
  track.innerHTML = REVIEWS.map((r) => `
    <div class="review-card">
      <div class="review-card__stars">${'★'.repeat(r.stars)}${'☆'.repeat(5 - r.stars)}</div>
      <p class="review-card__text">«${r.text}»</p>
      <div class="review-card__author"><b>${r.author}</b><small>${r.role}</small></div>
    </div>`).join('');
  $('#revDots').innerHTML = REVIEWS.map((_, i) =>
    `<span data-i="${i}" class="${i === 0 ? 'active' : ''}"></span>`).join('');
}

function goReview(i) {
  const track = $('#reviewsTrack');
  if (!track) return;
  revIndex = (i + REVIEWS.length) % REVIEWS.length;
  track.style.transform = `translateX(-${revIndex * 100}%)`;
  $$('#revDots span').forEach((d, di) => d.classList.toggle('active', di === revIndex));
  beep(560);
}

$('#revPrev').addEventListener('click', () => goReview(revIndex - 1));
$('#revNext').addEventListener('click', () => goReview(revIndex + 1));
$('#revDots').addEventListener('click', (e) => {
  const dot = e.target.closest('span');
  if (dot) goReview(Number(dot.dataset.i));
});
setInterval(() => goReview(revIndex + 1), 7000);

/* ---------- 7. Галерея + лайтбокс ---------- */
let lbIndex = 0;
const galleryGrid = $('#galleryGrid');
const homeGallery = $('#homeGallery');

function galleryItemHTML(g, i) {
  return `
  <figure class="gallery__item" data-i="${i}">
    <img src="${g.src}" alt="${g.cap}" loading="lazy" onerror="imgFail(this)">
    <figcaption>${g.cap}</figcaption>
  </figure>`;
}

if (galleryGrid) {
  galleryGrid.innerHTML = GALLERY.map(galleryItemHTML).join('');
}
if (homeGallery) {
  homeGallery.innerHTML = GALLERY.slice(0, 4).map(galleryItemHTML).join('');
}

function openLB(i) {
  lbIndex = (i + GALLERY.length) % GALLERY.length;
  $('#lightboxImg').src = GALLERY[lbIndex].src;
  $('#lightboxCaption').textContent = GALLERY[lbIndex].cap;
  $('#lightbox').classList.add('open');
  beep(660);
}

function closeLB() {
  $('#lightbox').classList.remove('open');
}

[galleryGrid, homeGallery].forEach((grid) => {
  if (!grid) return;
  grid.addEventListener('click', (e) => {
    const item = e.target.closest('.gallery__item');
    if (item) openLB(Number(item.dataset.i));
  });
});
$('#lightboxClose').addEventListener('click', closeLB);
$('#lightbox').addEventListener('click', (e) => {
  if (e.target === $('#lightbox')) closeLB();
});
$('#lightboxPrev').addEventListener('click', () => openLB(lbIndex - 1));
$('#lightboxNext').addEventListener('click', () => openLB(lbIndex + 1));

document.addEventListener('keydown', (e) => {
  const lbOpen = $('#lightbox').classList.contains('open');
  if (e.key === 'Escape') {
    closeCart();
    closeLB();
    closeNav();
  }
  if (lbOpen && e.key === 'ArrowRight') openLB(lbIndex + 1);
  if (lbOpen && e.key === 'ArrowLeft') openLB(lbIndex - 1);
});

/* ---------- 8. Бронирование ---------- */
let guests = 2;
$('#gMinus').addEventListener('click', () => {
  guests = Math.max(1, guests - 1);
  $('#gCount').textContent = guests;
});
$('#gPlus').addEventListener('click', () => {
  guests = Math.min(20, guests + 1);
  $('#gCount').textContent = guests;
});

function setError(input, msg) {
  const field = input.closest('.form-field');
  field.classList.toggle('error', !!msg);
  field.querySelector('.form-error').textContent = msg || '';
  return !msg;
}

$('#bookingForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const name = $('#bName');
  const phone = $('#bPhone');
  const date = $('#bDate');
  const time = $('#bTime');
  let ok = true;
  ok = setError(name, name.value.trim().length >= 2 ? '' : 'Введите имя (мин. 2 символа)') && ok;
  ok = setError(phone, /^[\d\s+()-]{10,}$/.test(phone.value.trim()) ? '' : 'Введите корректный телефон') && ok;
  ok = setError(date, date.value ? '' : 'Выберите дату') && ok;
  ok = setError(time, time.value ? '' : 'Выберите время') && ok;
  if (!ok) {
    beep(300);
    return;
  }
  $('#bookingSuccess').hidden = false;
  beep(880, 0.2);
  toast(`Столик на ${guests} гостя(ей) забронирован! 🎉`);
  e.target.reset();
  guests = 2;
  $('#gCount').textContent = guests;
  setTimeout(() => { $('#bookingSuccess').hidden = true; }, 6000);
});
$('#bDate').min = new Date().toISOString().split('T')[0];

/* ---------- 9. Форма подписки ---------- */
$('#subscribeForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const email = $('#subEmail').value.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    toast('Введите корректный email 📧');
    beep(300);
    return;
  }
  $('#subMsg').hidden = false;
  $('#subEmail').value = '';
  beep(880);
  toast('Подписка оформлена! 🎉');
});

/* ---------- 10. Скролл: шапка, прогресс, наверх ---------- */
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  $('#header').classList.toggle('scrolled', y > 40);
  $('#toTop').classList.toggle('show', y > 500);
  const h = document.documentElement.scrollHeight - window.innerHeight;
  $('#progressBar').style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
});

$('#toTop').addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* ---------- 11. Мобильное меню ---------- */
function closeNav() {
  $('#burger').classList.remove('open');
  $('#nav').classList.remove('open');
}

$('#burger').addEventListener('click', () => {
  $('#burger').classList.toggle('open');
  $('#nav').classList.toggle('open');
});

/* ---------- 12. Тема ---------- */
$('#themeToggle').addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
  document.documentElement.dataset.theme = next;
  localStorage.setItem('g_theme', next);
  $('#themeToggle').textContent = next === 'light' ? '☀️' : '🌙';
  beep(next === 'light' ? 800 : 500);
});

if (localStorage.getItem('g_theme') === 'light') {
  document.documentElement.dataset.theme = 'light';
  $('#themeToggle').textContent = '☀️';
}

/* ---------- 13. Reveal-анимации при скролле ---------- */
const io = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (en.isIntersecting) {
      en.target.classList.add('visible');
      io.unobserve(en.target);
    }
  });
}, { threshold: 0.12 });
$$('.reveal').forEach((el) => io.observe(el));

/* ---------- 14. Счётчики статистики ---------- */
const statIO = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (!en.isIntersecting) return;
    statIO.unobserve(en.target);
    const target = Number(en.target.dataset.count);
    const dur = 1600;
    const start = performance.now();
    (function tick(now) {
      const p = Math.min((now - start) / dur, 1);
      en.target.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))).toLocaleString('ru-RU');
      if (p < 1) requestAnimationFrame(tick);
    })(start);
  });
}, { threshold: 0.5 });
$$('.stat b').forEach((el) => statIO.observe(el));

/* ---------- 15. Часы в подвале ---------- */
function tickClock() {
  const el = $('#currentTime');
  if (!el) return;
  el.textContent = new Date().toLocaleString('ru-RU', {
    weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
  });
}
setInterval(tickClock, 10000);
tickClock();

/* ---------- 16. Прелоадер ---------- */
(function preload() {
  const pre = $('#preloader');
  if (!pre) return;
  let p = 0;
  const bar = $('#preloadBar');
  const tm = setInterval(() => {
    p = Math.min(p + Math.random() * 20, 100);
    bar.style.width = p + '%';
    if (p >= 100) {
      clearInterval(tm);
      setTimeout(() => pre.classList.add('done'), 300);
    }
  }, 120);
})();

/* ---------- 17. Запуск ---------- */
renderMenu();
renderPopular();
renderReviews();
loadCart();
renderCart();
showPage(location.hash.slice(1) || 'home');