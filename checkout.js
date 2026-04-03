/**
 * ElektroGenius Coaching – Checkout Helper
 *
 * WORKER_URL nach dem Cloudflare-Deploy eintragen:
 *   z.B. https://elektrogenius-coaching-api.DEINNAME.workers.dev
 */
const WORKER_URL = 'https://elektrogenius-coaching-api.DEINNAME.workers.dev';

window.egCheckout = async function egCheckout(event, product) {
  event.preventDefault();

  const btn = event.currentTarget;
  const original = btn.textContent;
  btn.textContent = 'Wird geladen …';
  btn.style.opacity = '0.7';
  btn.style.pointerEvents = 'none';

  try {
    const res = await fetch(WORKER_URL + '/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product }),
    });

    const data = await res.json();

    if (!res.ok || !data.url) {
      throw new Error(data.error || 'Unbekannter Fehler');
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
