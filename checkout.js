/**
 * ElektroGenius Coaching – Checkout Helper
 *
 * WORKER_URL nach dem Cloudflare-Deploy eintragen:
 *   z.B. https://elektrogenius-coaching-api.DEINNAME.workers.dev
 */
const WORKER_URL = 'https://fragrant-grass-046e.safindeler10.workers.dev';

window.egCheckout = async function egCheckout(event, product) {
  event.preventDefault();

  const btn = event.currentTarget;
  const original = btn.textContent;
  btn.textContent = 'Wird geladen …';
  btn.style.opacity = '0.7';
  btn.style.pointerEvents = 'none';

  try {
    const res = await fetch(WORKER_URL, {
      method: 'POST',
    });

    const data = await res.json();

    if (!data.url) {
      alert('Fehler bei Zahlung');
      btn.textContent = original;
      btn.style.opacity = '';
      btn.style.pointerEvents = '';
      return;
    }

    window.location.href = data.url;
  } catch (e) {
    console.error('[egCheckout]', e);
    btn.textContent = original;
    btn.style.opacity = '';
    btn.style.pointerEvents = '';
    alert('Fehler beim Laden der Zahlungsseite. Bitte versuche es erneut oder kontaktiere uns.');
  }
};
