export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*', // Change to your site's origin for security, e.g., 'https://your-site.com'
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle preflight OPTIONS request
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: corsHeaders,
        status: 204,
      });
    }

    const key = "products";

    if (request.method === "GET") {
      const products = await env.PRODUCTS.get(key); // Reading from KV
      return new Response(products || "[]", {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (request.method === "POST") {
      const body = await request.json();
      await env.PRODUCTS.put(key, JSON.stringify(body, null, 2)); // Writing to KV
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response("Method not allowed", { status: 405 });
  }
};
