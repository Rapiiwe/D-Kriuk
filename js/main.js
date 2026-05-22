

'use strict';


const WA_NUMBER = '6285198040164';
const WA_DEFAULT_TEXT = "Halo D'Kriuk Kayola, saya ingin memesan...";


const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });


const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  navToggle.classList.toggle('open', isOpen);
  navToggle.setAttribute('aria-expanded', String(isOpen));
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
});

document.addEventListener('click', (e) => {
  if (!navbar.contains(e.target) && navLinks.classList.contains('open')) {
    navLinks.classList.remove('open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
});


const serviceSelect = document.getElementById('service');
const addressGroup  = document.getElementById('addressGroup');
const addressField  = document.getElementById('address');

serviceSelect.addEventListener('change', () => {
  const isDelivery = serviceSelect.value === 'delivery';
  addressGroup.style.display = isDelivery ? 'flex' : 'none';
  addressField.required = isDelivery;
  if (!isDelivery) { addressField.value = ''; clearError('address'); }
});


const toast = document.getElementById('toast');
let toastTimer;

function showToast(message, type = 'default') {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.className = `toast ${type}`;
  void toast.offsetWidth;
  toast.classList.add('show');
  toastTimer = setTimeout(() => toast.classList.remove('show'), 4000);
}


function setError(fieldId, message) {
  const field = document.getElementById(fieldId);
  const error = document.getElementById(fieldId + 'Error');
  if (field) field.classList.add('error');
  if (error) error.textContent = message;
}

function clearError(fieldId) {
  const field = document.getElementById(fieldId);
  const error = document.getElementById(fieldId + 'Error');
  if (field) field.classList.remove('error');
  if (error) error.textContent = '';
}

function validatePhone(value) {
  return /^(\+62|62|0)[0-9]{8,13}$/.test(value.replace(/\s/g, ''));
}




function formatRupiah(amount) {
  return 'IDR ' + amount.toLocaleString('id-ID');
}


function getOrderItems() {
  const items = [];
  document.querySelectorAll('#orderBuilder .order-item').forEach(row => {
    const qty = parseInt(row.querySelector('.qty-input').value, 10) || 0;
    if (qty > 0) {
      items.push({
        name    : row.dataset.name,
        price   : parseInt(row.dataset.price, 10),
        qty,
        subtotal: parseInt(row.dataset.price, 10) * qty
      });
    }
  });
  return items;
}


function getSauceItems() {
  const sauces = [];
  document.querySelectorAll('input[name="sauce"]:checked').forEach(cb => {
    const price = parseInt(cb.dataset.price, 10) || 0;
    sauces.push({
      name    : cb.value,
      price,
      qty     : 1,
      subtotal: price
    });
  });
  return sauces;
}


function calcTotal(items, sauces = []) {
  const menuTotal  = items.reduce((sum, item) => sum + item.subtotal, 0);
  const sauceTotal = sauces.reduce((sum, s) => sum + s.subtotal, 0);
  return menuTotal + sauceTotal;
}


function renderSummary() {
  const items        = getOrderItems();
  const sauces       = getSauceItems();
  const summaryBox   = document.getElementById('orderSummary');
  const summaryLines = document.getElementById('summaryLines');
  const summaryTotal = document.getElementById('summaryTotal');
  const sauceGroup   = document.getElementById('sauceGroup');

  if (items.length === 0) {
    summaryBox.style.display = 'none';
    sauceGroup.style.display = 'none';
    return;
  }
  summaryBox.style.display = 'block';
  sauceGroup.style.display = 'flex';

  const lineHtml = (entry) => `
    <div class="summary-line">
      <span class="summary-line-name">${entry.name}</span>
      <span class="summary-line-qty">× ${entry.qty}</span>
      <span class="summary-line-subtotal">${formatRupiah(entry.subtotal)}</span>
    </div>
  `;
  summaryLines.innerHTML = [
    ...items.map(lineHtml),
    ...sauces.map(lineHtml)
  ].join('');
  summaryTotal.textContent = formatRupiah(calcTotal(items, sauces));
  document.querySelectorAll('#orderBuilder .order-item').forEach(row => {
    const qty = parseInt(row.querySelector('.qty-input').value, 10) || 0;
    row.classList.toggle('has-qty', qty > 0);
  });
  clearError('order');
}


function initOrderBuilder() {
  document.querySelectorAll('#orderBuilder .order-item').forEach(row => {
    const minusBtn = row.querySelector('.qty-minus');
    const plusBtn  = row.querySelector('.qty-plus');
    const input    = row.querySelector('.qty-input');

    plusBtn.addEventListener('click', () => {
      const current = parseInt(input.value, 10) || 0;
      if (current < 99) {
        input.value = current + 1;
        input.classList.add('bump');
        setTimeout(() => input.classList.remove('bump'), 200);
        renderSummary();
      }
    });

    minusBtn.addEventListener('click', () => {
      const current = parseInt(input.value, 10) || 0;
      if (current > 0) {
        input.value = current - 1;
        renderSummary();
      }
    });
  });

  document.querySelectorAll('input[name="sauce"]').forEach(cb => {
    cb.addEventListener('change', renderSummary);
  });
}


const orderForm = document.getElementById('orderForm');

orderForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const name    = document.getElementById('name').value.trim();
  const phone   = document.getElementById('phone').value.trim();
  const service = document.getElementById('service').value;
  const address = document.getElementById('address').value.trim();
  const payment = document.getElementById('payment').value;
  const note    = (document.getElementById('orderNote').value || '').trim();
  const items  = getOrderItems();
  const sauces = getSauceItems();
  const total  = calcTotal(items, sauces);
  ['name','phone','service','address','order','payment'].forEach(clearError);

  let valid = true;

  if (!name) {
    setError('name', 'Nama lengkap wajib diisi.');
    valid = false;
  }
  if (!phone) {
    setError('phone', 'Nomor WhatsApp wajib diisi.');
    valid = false;
  } else if (!validatePhone(phone)) {
    setError('phone', 'Format nomor tidak valid. Contoh: 08123456789');
    valid = false;
  }
  if (!service) {
    setError('service', 'Pilih jenis layanan terlebih dahulu.');
    valid = false;
  }
  if (service === 'delivery' && !address) {
    setError('address', 'Alamat pengiriman wajib diisi untuk delivery.');
    valid = false;
  }
  if (items.length === 0) {
    setError('order', 'Pilih minimal 1 menu terlebih dahulu.');
    document.getElementById('orderBuilder').scrollIntoView({ behavior: 'smooth', block: 'center' });
    valid = false;
  }
  if (!payment) {
    setError('payment', 'Pilih metode pembayaran.');
    valid = false;
  }

  if (!valid) {
    showToast('⚠️ Mohon lengkapi semua field yang wajib diisi.', 'default');
    const firstError = orderForm.querySelector('.error');
    if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }
  const paymentLabels = {
    cash: 'Cash (COD)', bca: 'Transfer BCA', mandiri: 'Transfer Mandiri',
    bri: 'Transfer BRI', gopay: 'GoPay', ovo: 'OVO', dana: 'Dana', shopeepay: 'ShopeePay'
  };
  const serviceLabel = service === 'delivery' ? 'Delivery 🛵' : 'Takeaway 🛍️';

  let msg = `Halo D'Kriuk Kayola! 🍗\n\n`;
  msg += `*PESANAN BARU*\n`;
  msg += `━━━━━━━━━━━━━━━━━━\n`;
  msg += `👤 Nama      : ${name}\n`;
  msg += `📱 WhatsApp  : ${phone}\n`;
  msg += `🛍️ Layanan   : ${serviceLabel}\n`;
  if (service === 'delivery') {
    msg += `📍 Alamat    : ${address}\n`;
  }
  msg += `\n🍗 *Detail Pesanan:*\n`;

  items.forEach(item => {
    msg += `  • ${item.name} × ${item.qty}  →  ${formatRupiah(item.subtotal)}\n`;
  });

  if (sauces.length > 0) {
    sauces.forEach(s => {
      msg += `  • ${s.name}  →  ${formatRupiah(s.subtotal)}\n`;
    });
  }
  if (note) {
    msg += `📝 Catatan   : ${note}\n`;
  }

  msg += `\n━━━━━━━━━━━━━━━━━━\n`;
  msg += `💰 *TOTAL    : ${formatRupiah(total)}*\n`;
  msg += `💳 Bayar via : ${paymentLabels[payment] || payment}\n`;
  msg += `━━━━━━━━━━━━━━━━━━\n`;
  msg += `Mohon konfirmasi pesanan saya. Terima kasih! 🙏`;

  const encoded = encodeURIComponent(msg);
  const waUrl = `https://wa.me/${WA_NUMBER}?text=${encoded}`;

  showToast('✅ Pesanan dikirim! Mengarahkan ke WhatsApp...', 'success');

  setTimeout(() => {
    window.open(waUrl, '_blank', 'noopener,noreferrer');
    orderForm.reset();
    addressGroup.style.display = 'none';
    addressField.required = false;
    document.getElementById('orderSummary').style.display = 'none';
    document.getElementById('sauceGroup').style.display = 'none';
    document.querySelectorAll('#orderBuilder .order-item').forEach(row => {
      row.querySelector('.qty-input').value = 0;
      row.classList.remove('has-qty');
    });
  }, 1200);
});
['name','phone','service','payment'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('blur', () => { if (el.value.trim()) clearError(id); });
});


function initScrollReveal() {
  const elements = document.querySelectorAll(
    '.menu-card, .menu-category-title, .service-card, .testi-card, .info-card, ' +
    '.about-feat, .payment-group, .section-header'
  );

  elements.forEach(el => {
    el.classList.add('reveal');
    const siblings = el.parentElement.querySelectorAll('.reveal');
    const idx = Array.from(siblings).indexOf(el);
    if (idx === 1) el.classList.add('reveal-delay-1');
    if (idx === 2) el.classList.add('reveal-delay-2');
    if (idx === 3) el.classList.add('reveal-delay-3');
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}


function initActiveNav() {
  const sections   = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navAnchors.forEach(a => {
          a.style.color = a.getAttribute('href') === `#${entry.target.id}`
            ? 'var(--yellow)' : '';
        });
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => observer.observe(s));
}


document.querySelectorAll('.sauce-chip').forEach(chip => {
  chip.addEventListener('mouseenter', () => { chip.style.transform = 'translateY(-4px) scale(1.05)'; });
  chip.addEventListener('mouseleave', () => { chip.style.transform = ''; });
});


document.addEventListener('DOMContentLoaded', () => {
  initOrderBuilder();
  initScrollReveal();
  initActiveNav();

  const waFloat = document.querySelector('.whatsapp-float');
  if (waFloat) {
    waFloat.href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(WA_DEFAULT_TEXT)}`;
  }
});