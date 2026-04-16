import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://kirchenki.com",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-upsert, x-requested-with, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
  "Access-Control-Max-Age": "86400",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const n8nWebhookUrl =
      Deno.env.get("N8N_WEBHOOK_URL") || "https://kirchenki.app.n8n.cloud/webhook/kirchenki-request";

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ success: false, error: "Supabase env fehlt" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      try {
        await req.json();
      } catch {
        return new Response(JSON.stringify({ success: false, error: "Leerer/ungültiger JSON-Body" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(
        JSON.stringify({
          success: false,
          error: "JSON-Body wird nicht unterstützt. Bitte multipart/form-data senden.",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!contentType.includes("multipart/form-data") && !contentType.includes("application/x-www-form-urlencoded")) {
      return new Response(JSON.stringify({ success: false, error: "Content-Type nicht unterstützt" }), {
        status: 415,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const formData = await req.formData();
    const userId = (formData.get("user_id") as string) || "";
    const title = (formData.get("title") as string) || "Unbenannte Predigt";
    const file = formData.get("file") as File | null;

    if (!userId || !file) {
      return new Response(JSON.stringify({ success: false, error: "user_id oder file fehlt" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const originalFileName = (formData.get("original_file_name") as string) || file.name;

    const { data: existingSermon, error: existingSermonError } = await supabase
      .from("sermons")
      .select("id, file_path")
      .eq("user_id", userId)
      .eq("title", title)
      .eq("original_file_name", originalFileName)
      .maybeSingle();

    if (existingSermonError) throw existingSermonError;

    let sermonId: string;
    let sermonFilePath: string;

    if (existingSermon) {
      sermonId = existingSermon.id;
      sermonFilePath = existingSermon.file_path;
    } else {
      const safeName = file.name?.replace(/\s+/g, "_") || "predigt";
      const filePath = `${userId}/${crypto.randomUUID()}-${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from("sermons")
        .upload(filePath, file, { contentType: file.type, upsert: true });

      if (uploadError) throw uploadError;

      const { data: sermon, error: sermonError } = await supabase
        .from("sermons")
        .insert({
          user_id: userId,
          title,
          original_file_name: originalFileName,
          file_path: filePath,
          status: "processing",
        })
        .select()
        .single();

      if (sermonError) {
        // Race-safe fallback: unique constraint hit -> fetch existing row and continue.
        if ((sermonError as { code?: string }).code === "23505") {
          const { data: duplicateSermon, error: duplicateLookupError } = await supabase
            .from("sermons")
            .select("id, file_path")
            .eq("user_id", userId)
            .eq("title", title)
            .eq("original_file_name", originalFileName)
            .maybeSingle();

          if (duplicateLookupError || !duplicateSermon) {
            throw duplicateLookupError || sermonError;
          }

          sermonId = duplicateSermon.id;
          sermonFilePath = duplicateSermon.file_path;
        } else {
          throw sermonError;
        }
      } else {
        sermonId = sermon.id;
        sermonFilePath = filePath;
      }
    }

    const n8nData = new FormData();
    formData.forEach((value, key) => n8nData.append(key, value));
    n8nData.set("sermon_id", sermonId);
    n8nData.set("sermon_file_path", sermonFilePath);
    n8nData.set("user_id", userId);
    n8nData.set("title", title);

    await fetch(n8nWebhookUrl, { method: "POST", body: n8nData });

    return new Response(
      JSON.stringify({ success: true, sermon_id: sermonId, file_path: sermonFilePath }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    const message = error instanceof Error ? error.message : "Unbekannter Fehler";
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});