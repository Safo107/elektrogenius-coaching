export default {
  async fetch(request, env) {

    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "*",
        },
      });
    }

    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    try {
      const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          mode: "payment",
          "line_items[0][price_data][currency]": "eur",
          "line_items[0][price_data][product_data][name]": "Coaching 60min",
          "line_items[0][price_data][unit_amount]": "2500",
          "line_items[0][quantity]": "1",
          success_url: "https://coaching.elektrogenius.de/success",
          cancel_url: "https://coaching.elektrogenius.de",
        }).toString(),
      });

      const data = await stripeRes.json();

      return new Response(JSON.stringify({ url: data.url }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });

    } catch (err) {
      return new Response("Stripe error", {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      });
    }
  },
};
