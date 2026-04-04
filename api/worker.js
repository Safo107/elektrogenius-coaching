const ALLOWED_ORIGIN = "https://coaching.elektrogenius.de";

export default {
  async fetch(request, env) {

    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    // Origin-Check: nur Requests von der eigenen Domain erlaubt
    const origin = request.headers.get("Origin");
    if (origin !== ALLOWED_ORIGIN) {
      console.error(`[worker] Blocked request from unauthorized origin: ${origin}`);
      return new Response("Forbidden", {
        status: 403,
        headers: { "Access-Control-Allow-Origin": ALLOWED_ORIGIN },
      });
    }

    try {
      const body = await request.json();

      const product = body.product;
      const amount  = body.amount;

      const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          mode: "payment",
          "line_items[0][price_data][currency]": "eur",
          "line_items[0][price_data][product_data][name]": product,
          "line_items[0][price_data][unit_amount]": String(amount),
          "line_items[0][quantity]": "1",
          success_url: "https://coaching.elektrogenius.de/success.html",
          cancel_url: "https://coaching.elektrogenius.de",
        }).toString(),
      });

      const data = await stripeRes.json();

      if (data.error) {
        console.error("[worker] Stripe API Fehler:", data.error);
        return new Response(JSON.stringify({ error: data.error.message || "Stripe Fehler" }), {
          status: 502,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
          },
        });
      }

      return new Response(JSON.stringify({ url: data.url }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
        },
      });

    } catch (err) {
      console.error("[worker] Unerwarteter Fehler:", err);
      return new Response(JSON.stringify({ error: "Interner Fehler" }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
        },
      });
    }
  },
};
