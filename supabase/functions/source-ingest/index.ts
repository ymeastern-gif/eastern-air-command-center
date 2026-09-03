import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const cors = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "authorization, x-client-info, apikey, content-type",
  "access-control-allow-methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...cors, "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
});

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "POST required" }, 405);

  const url = Deno.env.get("SUPABASE_URL")!;
  const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
  const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const auth = req.headers.get("authorization") || "";
  if (!auth.toLowerCase().startsWith("bearer ")) return json({ error: "Authorization required" }, 401);

  const userClient = createClient(url, anon, { global: { headers: { Authorization: auth } } });
  const serviceClient = createClient(url, service, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData.user) return json({ error: "Invalid user" }, 401);

  let payload: any;
  try { payload = await req.json(); } catch { return json({ error: "Invalid JSON" }, 400); }
  const connectionId = String(payload?.connection_id || "");
  if (!connectionId || !Array.isArray(payload?.records)) return json({ error: "connection_id and records[] are required" }, 400);
  if (payload.records.length > 500) return json({ error: "Maximum 500 records per batch" }, 413);

  const { data: connection, error: connError } = await serviceClient
    .from("source_connections").select("id,workspace_id,project_id,source_system,status").eq("id", connectionId).maybeSingle();
  if (connError || !connection) return json({ error: "Connection not found" }, 404);

  const { data: membership } = await serviceClient.from("workspace_members")
    .select("role,active").eq("workspace_id", connection.workspace_id).eq("user_id", userData.user.id).eq("active", true).maybeSingle();
  if (!membership || !["admin", "manager"].includes(membership.role)) return json({ error: "Manager or admin access required" }, 403);

  // Inbound only. This endpoint never mutates the originating source system.
  const { data, error } = await serviceClient.rpc("ingest_source_batch", {
    p_connection_id: connectionId,
    p_records: payload.records,
    p_cursor_after: payload.cursor_after || {},
    p_metadata: { ...(payload.metadata || {}), submitted_by: userData.user.id, endpoint: "source-ingest" },
  });
  if (error) return json({ error: error.message }, 400);
  return json({ ok: true, connection: { id: connection.id, source_system: connection.source_system, project_id: connection.project_id }, result: data });
});
