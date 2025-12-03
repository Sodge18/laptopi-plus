export default {
  async fetch(request, env) {
    const key = "products";

    if (request.method === "GET") {
      // овде користиш binding који си дефинисао
      const products = await env.PRODUCTS.get(key);
      return new Response(products || "[]", { headers: { "Content-Type": "application/json" } });
    }

    if (request.method === "POST") {
      const body = await request.json();
      await env.PRODUCTS.put(key, JSON.stringify(body, null, 2));
      return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
    }

    return new Response("Method not allowed", { status: 405 });
  }
};
