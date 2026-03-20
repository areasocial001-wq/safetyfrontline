import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Auth check - require authenticated admin user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const authSupabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await authSupabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const callerId = claimsData.claims.sub as string;

    // Verify caller is admin
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", callerId)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Forbidden: admin role required" }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Get mandatory modules with deadlines approaching (within 7 days)
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const { data: mandatoryModules } = await supabase
      .from("company_mandatory_modules")
      .select("company_id, module_id, deadline_date")
      .eq("is_mandatory", true)
      .not("deadline_date", "is", null)
      .lte("deadline_date", sevenDaysFromNow.toISOString());

    if (!mandatoryModules || mandatoryModules.length === 0) {
      return new Response(JSON.stringify({ success: true, reminders: 0 }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Get module titles
    const moduleIds = [...new Set(mandatoryModules.map(m => m.module_id))];
    const { data: modules } = await supabase
      .from("training_modules")
      .select("id, title")
      .in("id", moduleIds);

    const moduleTitleMap: Record<string, string> = {};
    modules?.forEach(m => { moduleTitleMap[m.id] = m.title; });

    let remindersSent = 0;

    for (const mm of mandatoryModules) {
      const { data: companyEmployees } = await supabase
        .from("company_users")
        .select("user_id")
        .eq("company_id", mm.company_id)
        .eq("is_admin", false);

      if (!companyEmployees) continue;

      for (const emp of companyEmployees) {
        const { data: progress } = await supabase
          .from("training_progress")
          .select("status")
          .eq("user_id", emp.user_id)
          .eq("module_id", mm.module_id)
          .maybeSingle();

        if (progress?.status === "completed") continue;

        const today = new Date().toISOString().split("T")[0];
        const { count } = await supabase
          .from("employee_notifications")
          .select("*", { count: "exact", head: true })
          .eq("user_id", emp.user_id)
          .eq("type", "deadline_reminder")
          .gte("created_at", today);

        if (count && count > 0) continue;

        const deadlineDate = new Date(mm.deadline_date!);
        const daysLeft = Math.ceil((deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        const moduleTitle = moduleTitleMap[mm.module_id] || mm.module_id;

        await supabase.from("employee_notifications").insert({
          user_id: emp.user_id,
          type: "deadline_reminder",
          title: `⏰ Scadenza modulo: ${moduleTitle}`,
          message: daysLeft <= 0
            ? `Il modulo "${moduleTitle}" è scaduto! Completalo il prima possibile.`
            : `Mancano ${daysLeft} giorni alla scadenza del modulo "${moduleTitle}". Completalo entro il ${deadlineDate.toLocaleDateString("it-IT")}.`,
          metadata: { module_id: mm.module_id, deadline: mm.deadline_date, days_left: daysLeft },
        });

        remindersSent++;
      }
    }

    console.log(`Sent ${remindersSent} deadline reminders`);
    return new Response(JSON.stringify({ success: true, reminders: remindersSent }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-deadline-reminders:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
