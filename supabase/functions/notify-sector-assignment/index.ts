import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SECTOR_LABELS: Record<string, { label: string; hours: number; description: string }> = {
  basso: { label: "Rischio Basso", hours: 4, description: "Uffici, commercio, turismo, servizi, artigianato" },
  medio: { label: "Rischio Medio", hours: 8, description: "Agricoltura, pesca, PA, trasporti, magazzinaggio" },
  alto: { label: "Rischio Alto", hours: 12, description: "Costruzioni, industria, chimica, sanità, rifiuti" },
};

interface NotifyRequest {
  employeeUserId: string;
  sector: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify caller
    const authSupabase = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: caller }, error: authError } = await authSupabase.auth.getUser();
    if (authError || !caller) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { employeeUserId, sector }: NotifyRequest = await req.json();
    const sectorInfo = SECTOR_LABELS[sector];
    if (!sectorInfo) {
      return new Response(JSON.stringify({ error: "Invalid sector" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get employee profile
    const { data: employee } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", employeeUserId)
      .single();

    if (!employee?.email) {
      return new Response(JSON.stringify({ success: false, error: "Employee not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get admin name
    const { data: adminProfile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", caller.id)
      .single();

    const adminName = adminProfile?.full_name || "L'amministratore aziendale";
    const employeeName = employee.full_name || "Dipendente";

    // Send email to employee
    const emailResponse = await resend.emails.send({
      from: "SicurAzienda <onboarding@resend.dev>",
      to: [employee.email],
      subject: `🛡️ Settore di rischio assegnato: ${sectorInfo.label}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f4f4f4; }
              .container { max-width: 600px; margin: 0 auto; background: #fff; }
              .header { background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .header h1 { margin: 0; font-size: 22px; }
              .content { padding: 30px 20px; }
              .sector-card { background: #EFF6FF; border-left: 4px solid #3B82F6; padding: 20px; margin: 20px 0; border-radius: 4px; }
              .sector-label { font-size: 20px; font-weight: bold; color: #1D4ED8; margin: 0; }
              .sector-desc { font-size: 14px; color: #666; margin: 8px 0 0; }
              .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin: 20px 0; }
              .info-card { background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center; }
              .info-value { font-size: 24px; font-weight: bold; color: #3B82F6; }
              .info-label { font-size: 13px; color: #666; }
              .cta { text-align: center; margin: 25px 0; }
              .cta a { display: inline-block; background: #3B82F6; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; border-top: 1px solid #eee; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🛡️ Settore di Rischio Assegnato</h1>
                <p style="margin: 8px 0 0; opacity: 0.9;">Formazione Specifica</p>
              </div>
              <div class="content">
                <p>Ciao <strong>${employeeName}</strong>,</p>
                <p>${adminName} ti ha assegnato al seguente settore di formazione specifica:</p>
                
                <div class="sector-card">
                  <p class="sector-label">🏷️ ${sectorInfo.label}</p>
                  <p class="sector-desc">${sectorInfo.description}</p>
                </div>

                <div class="info-grid">
                  <div class="info-card">
                    <div class="info-value">${sectorInfo.hours}h</div>
                    <div class="info-label">Ore di formazione</div>
                  </div>
                  <div class="info-card">
                    <div class="info-value">${sector === 'basso' ? 4 : sector === 'medio' ? 8 : 12}</div>
                    <div class="info-label">Moduli da completare</div>
                  </div>
                </div>

                <p style="font-size: 14px; color: #666;">Accedi alla piattaforma per visualizzare i tuoi moduli di formazione specifica e iniziare il percorso.</p>

                <div class="cta">
                  <a href="${Deno.env.get("SITE_URL") || "https://safetyfrontline.lovable.app"}/formazione">Vai alla Formazione →</a>
                </div>
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

    console.log("Sector assignment notification sent to:", employee.email, emailResponse);

    return new Response(JSON.stringify({ success: true, sentTo: employee.email }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in notify-sector-assignment:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
