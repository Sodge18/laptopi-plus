export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",           // ← change to your domain later if you want
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // Handle preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders, status: 204 });
    }

    const key = "products";

    // ←←← ONLY THESE TWO LINES CHANGED ←←←
    if (request.method === "GET") {
      const products = await env.KV_BINDING.get(key);
      return new Response(products || "[]", {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (request.method === "POST") {
      const body = await request.json();
      await env.KV_BINDING.put(key, JSON.stringify(body, null, 2));
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // FORMA
    if (url.pathname === "/send" && request.method === "POST") {
      const formData = await request.formData();
  
      const ime = formData.get("ime");
      const prezime = formData.get("prezime");
      const email = formData.get("email");
      const broj = formData.get("kontakt-broj");
      const laptop = formData.get("laptop");
      const poruka = formData.get("poruka");
      
      const message = `
      Nova poruka sa sajta:
      
      Ime: ${ime}
      Prezime: ${prezime}
      Email: ${email}
      Kontakt broj: ${broj}
      Laptop: ${laptop}
      Poruka: ${poruka}
          `;
      
          const mail = await fetch("https://api.mailchannels.net/tx/v1/send", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({
                  personalizations: [{
                      to: [{ email: "TVOJ-MEJL@GMAIL.COM" }]
                  }],
                  from: {
                      email: "no-reply@laptopiplus.rs",
                      name: "Laptopi Plus"
                  },
                  subject: "Nova poruka sa sajta",
                  content: [{ type: "text/plain", value: message }]
              })
          });
      
          return new Response("OK", { status: 200 });
      }

    return new Response("Method not allowed", { status: 405 });
  }
};
