export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders, status: 204 });
    }

    const KV = env.KV_BINDING;
    const KEY = "products";

    // GET – vraća { products: [...] }
    if (request.method === "GET") {
      let raw = await KV.get(KEY) || "[]";
      let arr = [];
      try { arr = JSON.parse(raw); } catch(e) {}
      if (!Array.isArray(arr)) arr = [];

      return new Response(JSON.stringify({ products: arr }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // POST – dodavanje ili izmena proizvoda
    if (request.method === "POST") {
      const body = await request.json().catch(() => ({}));

      if (body.clear === true) {
        await KV.put(KEY, "[]");
        return new Response(JSON.stringify({ success: true, cleared: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      let arr = [];
      let raw = await KV.get(KEY);
      if (raw) {
        try { arr = JSON.parse(raw); } catch(e) {}
        if (!Array.isArray(arr)) arr = [];
      }

      if (body && body.products && Array.isArray(body.products)) {
        // Zameni sve proizvode (bulk update)
        arr = body.products.map(p => ({
          ...p,
          added: p.added || new Date().toISOString(),
          modified: p.modified || null
        }));
      } else {
        const id = url.searchParams.get("id") || (body.id || crypto.randomUUID());
        const index = arr.findIndex(p => p.id === id);

        if (index > -1) {
          // Update proizvoda → postavi modified timestamp
          arr[index] = { 
            ...arr[index], 
            ...body, 
            id, 
            modified: new Date().toISOString(),
            added: arr[index].added || new Date().toISOString()
          };
        } else {
          // Novi proizvod → postavi added timestamp
          arr.push({ ...body, id, added: new Date().toISOString(), modified: null });
        }
      }

      await KV.put(KEY, JSON.stringify(arr));
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // DELETE po ID
    if (request.method === "DELETE") {
      const id = url.searchParams.get("id");
      if (!id) return new Response("no id", { status: 400 });

      let arr = [];
      let raw = await KV.get(KEY);
      if (raw) {
        try { arr = JSON.parse(raw); } catch(e) {}
        if (!Array.isArray(arr)) arr = [];
      }

      arr = arr.filter(p => p.id !== id);
      await KV.put(KEY, JSON.stringify(arr));
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    return new Response("Not found", { status: 404 });
  }
};
