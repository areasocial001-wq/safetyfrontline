import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface CertificateNotificationRequest {
  employeeEmail: string;
  employeeName: string;
  moduleName: string;
  score: number;
  maxScore: number;
  percentage: number;
  certificateUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const {
      employeeEmail,
      employeeName,
      moduleName,
      score,
      maxScore,
      percentage,
      certificateUrl,
    }: CertificateNotificationRequest = await req.json();

    console.log("Sending certificate notification to:", employeeEmail);

    const performanceMessage = percentage >= 90 
      ? "🏆 Eccellente! Hai dimostrato una conoscenza esperta della sicurezza sul lavoro!"
      : "👍 Ottimo lavoro! Hai raggiunto la qualifica per il certificato!";

    const emailResponse = await resend.emails.send({
      from: "SicurAzienda <onboarding@resend.dev>",
      to: [employeeEmail],
      subject: `🎓 Certificato Ottenuto - ${moduleName}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
                line-height: 1.6;
                color: #333;
                margin: 0;
                padding: 0;
                background-color: #f4f4f4;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #0066cc 0%, #0052a3 100%);
                color: white;
                padding: 30px 20px;
                text-align: center;
                border-radius: 8px 8px 0 0;
              }
              .header h1 {
                margin: 0;
                font-size: 28px;
              }
              .content {
                padding: 30px 20px;
              }
              .performance-badge {
                background: #f0f9ff;
                border-left: 4px solid #0066cc;
                padding: 15px;
                margin: 20px 0;
                border-radius: 4px;
              }
              .stats-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 15px;
                margin: 25px 0;
              }
              .stat-card {
                background: #f8f9fa;
                padding: 15px;
                border-radius: 8px;
                text-align: center;
              }
              .stat-value {
                font-size: 32px;
                font-weight: bold;
                color: #0066cc;
                margin: 5px 0;
              }
              .stat-label {
                font-size: 14px;
                color: #666;
              }
              .cta-button {
                display: inline-block;
                background: #0066cc;
                color: white;
                padding: 15px 30px;
                text-decoration: none;
                border-radius: 8px;
                font-weight: bold;
                margin: 20px 0;
              }
              .footer {
                text-align: center;
                padding: 20px;
                color: #666;
                font-size: 12px;
                border-top: 1px solid #eee;
                margin-top: 30px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎓 Complimenti, ${employeeName}!</h1>
                <p style="margin: 10px 0 0 0; font-size: 16px;">Hai ottenuto il certificato di completamento</p>
              </div>
              
              <div class="content">
                <div class="performance-badge">
                  <strong style="font-size: 18px;">${performanceMessage}</strong>
                </div>
                
                <p>Sei qualificato per ricevere il certificato ufficiale per il modulo:</p>
                <h2 style="color: #0066cc; margin: 10px 0;">${moduleName}</h2>
                
                <div class="stats-grid">
                  <div class="stat-card">
                    <div class="stat-label">Punteggio</div>
                    <div class="stat-value">${score}/${maxScore}</div>
                  </div>
                  <div class="stat-card">
                    <div class="stat-label">Accuratezza</div>
                    <div class="stat-value">${percentage}%</div>
                  </div>
                </div>
                
                <p style="margin-top: 30px;">Il tuo certificato è ora disponibile per il download. Puoi scaricarlo dalla tua area riservata o cliccando sul pulsante qui sotto:</p>
                
                <div style="text-align: center;">
                  <a href="${certificateUrl}" class="cta-button">
                    📥 Scarica il tuo Certificato
                  </a>
                </div>
                
                <p style="margin-top: 30px; padding: 15px; background: #fff3cd; border-radius: 8px; font-size: 14px;">
                  <strong>💡 Nota:</strong> Il certificato include un codice QR univoco per la verifica digitale e può essere utilizzato per documentare la formazione obbligatoria in materia di sicurezza sul lavoro.
                </p>
              </div>
              
              <div class="footer">
                <p>Questa email è stata generata automaticamente da <strong>SicurAzienda</strong></p>
                <p>Piattaforma di formazione gamificata sulla sicurezza sul lavoro</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending certificate notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
