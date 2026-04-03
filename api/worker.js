/**
 * ElektroGenius Coaching – Cloudflare Worker
 *
 * Deploy:
 *   npm install -g wrangler
 *   wrangler login
 *   wrangler secret put STRIPE_SECRET_KEY   ← Stripe Secret Key einfügen
 *   wrangler deploy
 *
 * Routen:
 *   POST /checkout          { product: "cv"|"bewerbung"|"ausbildung"|"call" }
 *                           → { url: "https://checkout.stripe.com/..." }
 *
 *   GET  /session?id=cs_xxx → { orderNum, productName, email, status }
 */

const ALLOWED_ORIGIN = 'https://coaching.elektrogenius.de';
const SUCCESS_URL     = `${ALLOWED_ORIGIN}/success.html?session_id={CHECKOUT_SESSION_ID}`;
const CANCEL_URL      = ALLOWED_ORIGIN + '/';

const PRODUCTS = {
  cv: {
    name:   'Lebenslauf-Check',
    amount: 1900,   // Cent
    label:  'Lebenslauf-Check — 19€',
  },
  bewerbung: {
    name:   'Bewerbungspaket',
    amount: 3900,
    label:  'Bewerbungspaket — 39€',
  },
  ausbildung: {
    name:   'Ausbildungsplatz finden',
    amount: 2900,
    label:  'Ausbildungsplatz finden — 29€',
  },
  call: {
    name:   '1:1 Beratung (Zoom)',
    amount: 2500,
    label:  '1:1 Beratung (Zoom) — 25€',
  },
};

// ─── CORS ────────────────────────────────────────────────────────────────────

function corsHeaders(origin) {
  const allow =
    origin === ALLOWED_ORIGIN || (origin && origin.includes('localhost'))
      ? origin
      : ALLOWED_ORIGIN;
  return {
    'Access-Control-Allow-Origin':  allow,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...extra },
  });
}

// ─── Stripe Helper ────────────────────────────────────────────────────────────

async function stripe(path, secretKey, method = 'GET', body = null) {
  const res = await fetch(`https://api.stripe.com/v1${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body || undefined,
  });
  return res.json();
}

// ─── Order Number ─────────────────────────────────────────────────────────────

function makeOrderNum() {
  return 'EG-2026-' + String(Math.floor(1000 + Math.random() * 9000));
}

// ─── Main Handler ─────────────────────────────────────────────────────────────

export default {
  async fetch(request, env) {
    const url    = new URL(request.url);
    const origin = request.headers.get('Origin') || '';
    const cors   = corsHeaders(origin);
    const headers = { ...cors, 'Content-Type': 'application/json' };

    // Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    // ── POST /checkout ────────────────────────────────────────────────────────
    if (request.method === 'POST' && url.pathname === '/checkout') {
      let product;
      try {
        ({ product } = await request.json());
      } catch {
        return json({ error: 'Ungültiger Request-Body' }, 400, cors);
      }

      const prod = PRODUCTS[product];
      if (!prod) return json({ error: 'Ungültiges Produkt: ' + product }, 400, cors);

      const orderNum = makeOrderNum();

      const params = new URLSearchParams({
        'payment_method_types[]':                        'card',
        'line_items[0][quantity]':                        '1',
        'line_items[0][price_data][currency]':            'eur',
        'line_items[0][price_data][unit_amount]':         String(prod.amount),
        'line_items[0][price_data][product_data][name]':  prod.name,
        'mode':                                           'payment',
        'success_url':                                    SUCCESS_URL,
        'cancel_url':                                     CANCEL_URL,
        'metadata[product]':                              product,
        'metadata[product_name]':                         prod.name,
        'metadata[order_num]':                            orderNum,
      });

      const session = await stripe(
        '/checkout/sessions',
        env.STRIPE_SECRET_KEY,
        'POST',
        params.toString(),
      );

      if (session.error) {
        return json({ error: session.error.message }, 400, cors);
      }

      return json({ url: session.url }, 200, cors);
    }

    // ── GET /session?id=cs_xxx ────────────────────────────────────────────────
    if (request.method === 'GET' && url.pathname === '/session') {
      const id = url.searchParams.get('id');
      if (!id || !id.startsWith('cs_')) {
        return json({ error: 'Ungültige Session-ID' }, 400, cors);
      }

      const session = await stripe(
        `/checkout/sessions/${id}?expand[]=customer_details`,
        env.STRIPE_SECRET_KEY,
      );

      if (session.error) {
        return json({ error: 'Session nicht gefunden' }, 404, cors);
      }

      const product     = session.metadata?.product || '';
      const productName = session.metadata?.product_name
                          || PRODUCTS[product]?.name
                          || 'Coaching-Paket';
      const orderNum    = session.metadata?.order_num || makeOrderNum();
      const email       = session.customer_details?.email || '';
      const label       = PRODUCTS[product]?.label || productName;

      return json({ orderNum, productName, label, email, status: session.payment_status }, 200, cors);
    }

    return json({ error: 'Not found' }, 404, cors);
  },
};
