import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// All available training modules
const ALL_MODULES = [
  { id: "office", name: "Office Hazard Quest - Sicurezza in Ufficio" },
  { id: "warehouse", name: "Magazzino 2.5D - Movimentazione Merci" },
  { id: "general", name: "Safety Run - Rischi Generali" },
];

interface EmployeeWithMissing {
  userId: string;
  email: string;
  fullName: string;
  companyName: string | null;
  missingModules: Array<{ id: string; name: string }>;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth check - require admin role
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const authSupabase = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await authSupabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    console.log("Starting training reminders job...");
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all employees (users with 'employee' role)
    const { data: employeeRoles, error: rolesError } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "employee");

    if (rolesError) {
      console.error("Error fetching employee roles:", rolesError);
      throw rolesError;
    }

    console.log(`Found ${employeeRoles?.length || 0} employees`);

    if (!employeeRoles || employeeRoles.length === 0) {
      return new Response(
        JSON.stringify({ message: "No employees found", sent: 0 }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const employeeIds = employeeRoles.map((r) => r.user_id);

    // Get profiles for all employees
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, email, full_name, company_name")
      .in("id", employeeIds);

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      throw profilesError;
    }

    console.log(`Found ${profiles?.length || 0} employee profiles`);

    // Get all completed sessions for these employees
    const { data: completedSessions, error: sessionsError } = await supabase
      .from("demo_sessions")
      .select("user_id, scenario")
      .in("user_id", employeeIds)
      .eq("completed", true);

    if (sessionsError) {
      console.error("Error fetching sessions:", sessionsError);
      throw sessionsError;
    }

    console.log(`Found ${completedSessions?.length || 0} completed sessions`);

    // Build map of completed modules per employee
    const completedMap = new Map<string, Set<string>>();
    completedSessions?.forEach((session) => {
      if (!completedMap.has(session.user_id)) {
        completedMap.set(session.user_id, new Set());
      }
      completedMap.get(session.user_id)!.add(session.scenario);
    });

    // Find employees with missing modules
    const employeesWithMissing: EmployeeWithMissing[] = [];
    
    profiles?.forEach((profile) => {
      const completedModules = completedMap.get(profile.id) || new Set();
      const missingModules = ALL_MODULES.filter(
        (module) => !completedModules.has(module.id)
      );

      if (missingModules.length > 0) {
        employeesWithMissing.push({
          userId: profile.id,
          email: profile.email,
          fullName: profile.full_name || "Dipendente",
          companyName: profile.company_name,
          missingModules: missingModules,
        });
      }
    });

    console.log(
      `Found ${employeesWithMissing.length} employees with missing modules`
    );

    // Send reminder emails
    let sentCount = 0;
    const errors: Array<{ email: string; error: string }> = [];

    for (const employee of employeesWithMissing) {
      try {
        const modulesList = employee.missingModules
          .map((m) => `<li><strong>${m.name}</strong></li>`)
          .join("");

        const emailResponse = await resend.emails.send({
          from: "SicurAzienda <onboarding@resend.dev>",
          to: [employee.email],
          subject: "📚 Promemoria: Moduli di Formazione Incompleti",
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
                    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
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
                  .alert-box {
                    background: #fef3c7;
                    border-left: 4px solid #f59e0b;
                    padding: 15px;
                    margin: 20px 0;
                    border-radius: 4px;
                  }
                  .modules-list {
                    background: #f8f9fa;
                    padding: 20px;
                    border-radius: 8px;
                    margin: 20px 0;
                  }
                  .modules-list ul {
                    margin: 10px 0;
                    padding-left: 20px;
                  }
                  .modules-list li {
                    margin: 8px 0;
                    color: #333;
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
                  .stats {
                    display: inline-block;
                    background: #fee2e2;
                    color: #991b1b;
                    padding: 10px 20px;
                    border-radius: 8px;
                    font-weight: bold;
                    margin: 15px 0;
                  }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h1>📚 Promemoria Formazione</h1>
                    <p style="margin: 10px 0 0 0; font-size: 16px;">Moduli di sicurezza da completare</p>
                  </div>
                  
                  <div class="content">
                    <p>Ciao <strong>${employee.fullName}</strong>,</p>
                    
                    <div class="alert-box">
                      <strong>⚠️ Attenzione:</strong> Hai ancora dei moduli di formazione obbligatoria sulla sicurezza che devono essere completati.
                    </div>
                    
                    <p>La formazione in materia di sicurezza sul lavoro è <strong>obbligatoria per legge</strong> e deve essere completata regolarmente.</p>
                    
                    <div class="stats">
                      ${employee.missingModules.length} modulo${employee.missingModules.length > 1 ? "i" : ""} da completare
                    </div>
                    
                    <div class="modules-list">
                      <h3 style="margin-top: 0; color: #0066cc;">📋 Moduli Incompleti:</h3>
                      <ul>
                        ${modulesList}
                      </ul>
                    </div>
                    
                    <p><strong>Come completare la formazione:</strong></p>
                    <ol>
                      <li>Accedi alla tua area riservata su SicurAzienda</li>
                      <li>Seleziona i moduli da completare</li>
                      <li>Completa il training interattivo</li>
                      <li>Ottieni il certificato di completamento</li>
                    </ol>
                    
                    <div style="text-align: center;">
                      <a href="${supabaseUrl.replace("https://", "https://app.")}/employee" class="cta-button">
                        🎮 Accedi e Inizia il Training
                      </a>
                    </div>
                    
                    <p style="margin-top: 30px; padding: 15px; background: #e0f2fe; border-radius: 8px; font-size: 14px;">
                      <strong>💡 Ricorda:</strong> Completare i moduli di formazione non solo è un obbligo normativo, ma contribuisce a creare un ambiente di lavoro più sicuro per tutti.
                    </p>
                  </div>
                  
                  <div class="footer">
                    <p>Questa email è stata generata automaticamente da <strong>SicurAzienda</strong></p>
                    <p>Piattaforma di formazione gamificata sulla sicurezza sul lavoro</p>
                    ${employee.companyName ? `<p>Azienda: ${employee.companyName}</p>` : ""}
                  </div>
                </div>
              </body>
            </html>
          `,
        });

        console.log(`Email sent to ${employee.email}:`, emailResponse);
        sentCount++;
      } catch (emailError: any) {
        console.error(`Failed to send email to ${employee.email}:`, emailError);
        errors.push({
          email: employee.email,
          error: emailError.message,
        });
      }
    }

    console.log(`Training reminders completed. Sent: ${sentCount}, Errors: ${errors.length}`);

    return new Response(
      JSON.stringify({
        success: true,
        sent: sentCount,
        totalEmployees: employeeRoles.length,
        employeesWithMissing: employeesWithMissing.length,
        errors: errors.length > 0 ? errors : undefined,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-training-reminders function:", error);
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
