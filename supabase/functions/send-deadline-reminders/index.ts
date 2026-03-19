import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
      // Get employees of this company
      const { data: companyEmployees } = await supabase
        .from("company_users")
        .select("user_id")
        .eq("company_id", mm.company_id)
        .eq("is_admin", false);

      if (!companyEmployees) continue;

      for (const emp of companyEmployees) {
        // Check if employee already completed this module
        const { data: progress } = await supabase
          .from("training_progress")
          .select("status")
          .eq("user_id", emp.user_id)
          .eq("module_id", mm.module_id)
          .maybeSingle();

        if (progress?.status === "completed") continue;

        // Check if we already sent a reminder today
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
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
