import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface NotifyRequest {
  userId: string;
  moduleId: string;
  moduleTitle: string;
  score: number;
  maxScore: number;
  xpEarned: number;
  timeSpentMinutes: number;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const authSupabase = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await authSupabase.auth.getUser(token);
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const callerId = userData.user.id;
    const { userId, moduleId, moduleTitle, score, maxScore, xpEarned, timeSpentMinutes }: NotifyRequest = await req.json();

    // Verify the caller is the same user as the userId in the request
    if (userId !== callerId) {
      return new Response(JSON.stringify({ error: "Forbidden: cannot notify on behalf of another user" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get employee profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, email, company_name")
      .eq("id", userId)
      .single();

    if (!profile) {
      return new Response(JSON.stringify({ success: false, error: "Profile not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Find the company admin(s) for this employee
    const { data: companyUser } = await supabase
      .from("company_users")
      .select("company_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (!companyUser) {
      console.log("User not linked to any company, skipping admin notification");
      return new Response(JSON.stringify({ success: true, skipped: true, reason: "no_company" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Get company admin users
    const { data: adminUsers } = await supabase
      .from("company_users")
      .select("user_id")
      .eq("company_id", companyUser.company_id)
      .eq("is_admin", true);

    if (!adminUsers || adminUsers.length === 0) {
      console.log("No admin users found for company");
      return new Response(JSON.stringify({ success: true, skipped: true, reason: "no_admins" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Get admin emails
    const adminIds = adminUsers.map(a => a.user_id);
    const { data: adminProfiles } = await supabase
      .from("profiles")
      .select("email, full_name")
      .in("id", adminIds);

    if (!adminProfiles || adminProfiles.length === 0) {
      return new Response(JSON.stringify({ success: true, skipped: true, reason: "no_admin_emails" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
    const employeeName = profile.full_name || profile.email;
    const adminEmails = adminProfiles.map(p => p.email);

    // Count completed modules for this user
    const { count: completedCount } = await supabase
      .from("training_progress")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "completed");

    // Insert in-app notification record
    await supabase
      .from("admin_notifications")
      .insert({
        company_id: companyUser.company_id,
        employee_user_id: userId,
        employee_name: employeeName,
        module_id: moduleId,
        module_title: moduleTitle,
        score,
        max_score: maxScore,
        xp_earned: xpEarned,
        time_spent_minutes: timeSpentMinutes,
      });

    const emailResponse = await resend.emails.send({
      from: "SicurAzienda <onboarding@resend.dev>",
      to: adminEmails,
      subject: `📊 ${employeeName} ha completato: ${moduleTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f4f4f4; }
              .container { max-width: 600px; margin: 0 auto; background: #fff; }
              .header { background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .header h1 { margin: 0; font-size: 22px; }
              .content { padding: 30px 20px; }
              .employee-card { background: #f0fdf4; border-left: 4px solid #059669; padding: 15px; margin: 20px 0; border-radius: 4px; }
              .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin: 20px 0; }
              .stat-card { background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center; }
              .stat-value { font-size: 28px; font-weight: bold; color: #059669; }
              .stat-label { font-size: 13px; color: #666; }
              .progress-bar { background: #e5e7eb; border-radius: 999px; height: 8px; margin: 10px 0; }
              .progress-fill { background: #059669; height: 8px; border-radius: 999px; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; border-top: 1px solid #eee; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>📊 Aggiornamento Formazione</h1>
                <p style="margin: 8px 0 0; opacity: 0.9;">Un dipendente ha completato un modulo</p>
              </div>
              <div class="content">
                <div class="employee-card">
                  <strong style="font-size: 16px;">👤 ${employeeName}</strong>
                  <p style="margin: 5px 0 0; font-size: 14px; color: #666;">ha completato il modulo <strong>${moduleTitle}</strong></p>
                </div>

                <div class="stats-grid">
                  <div class="stat-card">
                    <div class="stat-label">Punteggio</div>
                    <div class="stat-value">${percentage}%</div>
                    <div class="stat-label">${score}/${maxScore}</div>
                  </div>
                  <div class="stat-card">
                    <div class="stat-label">Tempo</div>
                    <div class="stat-value">${timeSpentMinutes}</div>
                    <div class="stat-label">minuti</div>
                  </div>
                  <div class="stat-card">
                    <div class="stat-label">XP Guadagnati</div>
                    <div class="stat-value">${xpEarned}</div>
                    <div class="stat-label">punti</div>
                  </div>
                  <div class="stat-card">
                    <div class="stat-label">Moduli Completati</div>
                    <div class="stat-value">${completedCount || 0}/4</div>
                    <div class="stat-label">totale</div>
                  </div>
                </div>

                <div>
                  <p style="font-size: 14px; color: #666; margin-bottom: 5px;">Progresso complessivo</p>
                  <div class="progress-bar">
                    <div class="progress-fill" style="width: ${((completedCount || 0) / 4) * 100}%"></div>
                  </div>
                  <p style="font-size: 12px; color: #999; text-align: right;">${completedCount || 0} di 4 moduli completati</p>
                </div>

                ${(completedCount || 0) >= 4 ? `
                  <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin-top: 20px; text-align: center;">
                    <strong>🎉 Formazione Completata!</strong>
                    <p style="margin: 5px 0 0; font-size: 14px;">Questo dipendente ha completato tutti i moduli ed è idoneo per l'attestato.</p>
                  </div>
                ` : ""}
              </div>
              <div class="footer">
                <p>Email generata da <strong>SicurAzienda</strong></p>
                <p>Piattaforma di formazione sulla sicurezza sul lavoro</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Admin notification sent to:", adminEmails, emailResponse);

    return new Response(JSON.stringify({ success: true, sentTo: adminEmails.length }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in notify-module-completion:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
