export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // Preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders, status: 204 });
    }

    const KV = env.KV_BINDING;
    const KEY = "products"; // jedan ključ gde čuvamo ceo niz

    // 1. GET svi proizvodi
    if (request.method === "GET" && url.pathname === "/") {
      let raw = await KV.get(KEY);
      if (!raw) raw = "[]";
      let productsArray = [];
      try {
        productsArray = JSON.parse(raw);
        if (!Array.isArray(productsArray)) productsArray = [];
      } catch (e) {
        productsArray = [];
      }
      return new Response(JSON.stringify({ products: productsArray }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. POST – dodavanje/izmena jednog proizvoda (admin panel koristi ovo)
    if (request.method === "POST") {
      const body = await request.json();

      // Učitaj trenutne proizvode
      let products = [];
      let raw = await KV.get(KEY);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          products = Array.isArray(parsed) ? parsed : [];
        } catch (e) { /* ignore */ }
      }

      // Ako ima ?id=xxx → izmena postojećeg
      const urlId = url.searchParams.get("id");
      if (urlId) {
        const index = products.findIndex(p => p.id === urlId);
        if (index !== -1) {
          products[index] = { ...products[index], ...body }; // merge
        } else {
          body.id = urlId; // osiguraj ID
          products.push(body);
        }
      } else {
        // Dodavanje novog (admin panel ga šalje bez id parametra)
        if (!body.id) body.id = crypto.randomUUID();
        products.push(body);
      }

      await KV.put(KEY, JSON.stringify(products, null, 2));
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. DELETE – brisanje po id
    if (request.method === "DELETE") {
      const idToDelete = url.searchParams.get("id");
      if (!idToDelete) return new Response("Missing id", { status: 400 });

      let products = [];
      let raw = await KV.get(KEY);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          products = Array.isArray(parsed) ? parsed : [];
        } catch (e) { /* ignore */ }
      }

      const filtered = products.filter(p => p.id !== idToDelete);
      await KV.put(KEY, JSON.stringify(filtered, null, 2));

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response("Not found", { status: 404 });
  }
};
