import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle2, XCircle, RefreshCw, ShieldCheck, ShieldOff } from "lucide-react";
import { toast } from "sonner";

type ProbeResult = { table: string; op: "SELECT" | "INSERT" | "UPDATE" | "DELETE"; allowed: boolean; error?: string };

const TABLES_TO_PROBE: string[] = [
  "profiles",
  "user_roles",
  "companies",
  "company_users",
  "certificates",
  "training_progress",
  "training_modules",
  "training_packages",
  "admin_notifications",
  "employee_notifications",
  "demo_sessions",
  "quote_requests",
  "user_xp",
  "platform_settings",
];

export default function DebugRole() {
  const { user, session, loading: authLoading } = useAuth();
  const { role, loading: roleLoading, isAdmin, refresh } = useUserRole();
  const [probes, setProbes] = useState<ProbeResult[]>([]);
  const [probing, setProbing] = useState(false);
  const [allRoles, setAllRoles] = useState<{ role: string }[]>([]);
  const [hasRoleAdmin, setHasRoleAdmin] = useState<boolean | null>(null);
  const [hasRoleError, setHasRoleError] = useState<string | null>(null);

  const runProbes = async () => {
    if (!user) return;
    setProbing(true);
    const results: ProbeResult[] = [];
    for (const t of TABLES_TO_PROBE) {
      const { error } = await (supabase as any).from(t).select("*", { count: "exact", head: true }).limit(1);
      results.push({
        table: t,
        op: "SELECT",
        allowed: !error,
        error: error?.message,
      });
    }
    setProbes(results);

    // user_roles own rows
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
    setAllRoles((roles as any) || []);

    // has_role RPC test
    const { data: hr, error: hrErr } = await (supabase as any).rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });
    if (hrErr) {
      setHasRoleAdmin(null);
      setHasRoleError(hrErr.message);
    } else {
      setHasRoleAdmin(!!hr);
      setHasRoleError(null);
    }
    setProbing(false);
  };

  useEffect(() => {
    if (!authLoading && user) runProbes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user?.id]);

  const handleRefresh = async () => {
    await refresh();
    await runProbes();
    toast.success("Stato aggiornato");
  };

  const jwt = session?.access_token;
  let jwtClaims: any = null;
  if (jwt) {
    try {
      jwtClaims = JSON.parse(atob(jwt.split(".")[1]));
    } catch {
      // ignore
    }
  }

  if (authLoading) return <div className="p-8">Caricamento…</div>;
  if (!user) return <div className="p-8">Devi essere autenticato.</div>;

  return (
    <div className="container max-w-5xl py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Debug: Ruolo & Policy</h1>
        <Button onClick={handleRefresh} disabled={probing}>
          <RefreshCw className={`w-4 h-4 mr-2 ${probing ? "animate-spin" : ""}`} />
          Ricarica
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isAdmin ? <ShieldCheck className="w-5 h-5 text-green-500" /> : <ShieldOff className="w-5 h-5 text-muted-foreground" />}
            Identità
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div><span className="text-muted-foreground">Email:</span> {user.email}</div>
          <div><span className="text-muted-foreground">User ID:</span> <code className="text-xs">{user.id}</code></div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Ruolo (client):</span>
            {roleLoading ? "…" : <Badge variant={isAdmin ? "default" : "secondary"}>{role || "nessuno"}</Badge>}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Ruoli in user_roles:</span>
            {allRoles.length === 0 ? <Badge variant="outline">nessuno</Badge> : allRoles.map((r, i) => <Badge key={i}>{r.role}</Badge>)}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">has_role(uid, 'admin'):</span>
            {hasRoleError ? (
              <Badge variant="destructive">errore: {hasRoleError}</Badge>
            ) : hasRoleAdmin === null ? (
              "…"
            ) : hasRoleAdmin ? (
              <Badge className="bg-green-600">true</Badge>
            ) : (
              <Badge variant="secondary">false</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>JWT Claims</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-64">
{JSON.stringify(jwtClaims, null, 2)}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Accessi RLS (SELECT su tabelle chiave)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tabella</TableHead>
                <TableHead>Operazione</TableHead>
                <TableHead>Esito</TableHead>
                <TableHead>Dettaglio</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {probes.map((p, i) => (
                <TableRow key={i}>
                  <TableCell><code className="text-xs">{p.table}</code></TableCell>
                  <TableCell>{p.op}</TableCell>
                  <TableCell>
                    {p.allowed ? (
                      <span className="inline-flex items-center gap-1 text-green-600"><CheckCircle2 className="w-4 h-4" /> permesso</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-destructive"><XCircle className="w-4 h-4" /> negato</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-md truncate">{p.error || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <p className="text-xs text-muted-foreground mt-3">
            Nota: i probe usano HEAD/SELECT a vuoto. Il risultato riflette le policy RLS effettive sul tuo JWT corrente.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
