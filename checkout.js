const WORKER_URL = 'https://fragrant-grass-046e.safindeler10.workers.dev';

async function egCheckout(product, amount) {
  const res = await fetch(WORKER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ product, amount }),
  });

  const data = await res.json();

  if (!data.url) {
    alert('Fehler bei Zahlung');
    return;
  }

  window.location.href = data.url;
}
