import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileDown, FileSpreadsheet, AlertCircle, CheckCircle2, Clock, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface ComplianceData {
  companyId: string;
  companyName: string;
  totalEmployees: number;
  mandatoryModules: Array<{
    moduleId: string;
    moduleName: string;
    deadline: string | null;
    gracePeriod: number;
  }>;
  completionStats: {
    moduleId: string;
    moduleName: string;
    completedCount: number;
    pendingCount: number;
    overdueCount: number;
    completionPercentage: number;
  }[];
  nonCompliantEmployees: Array<{
    employeeId: string;
    employeeName: string;
    email: string;
    missingModules: string[];
    overdueModules: string[];
  }>;
}

const ALL_MODULES: Record<string, string> = {
  office: "Office Hazard Quest",
  warehouse: "Magazzino 2.5D",
  general: "Safety Run",
};

const COLORS = ["#0066cc", "#10b981", "#f59e0b", "#ef4444"];

export const ComplianceReport = ({ companyId }: { companyId: string }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [complianceData, setComplianceData] = useState<ComplianceData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("30");

  useEffect(() => {
    if (companyId) {
      fetchComplianceData();
    }
  }, [companyId, selectedPeriod]);

  const fetchComplianceData = async () => {
    setIsLoading(true);
    try {
      // Get company info
      const { data: company, error: companyError } = await supabase
        .from("companies")
        .select("id, name")
        .eq("id", companyId)
        .single();

      if (companyError) throw companyError;

      // Get mandatory modules for this company
      const { data: mandatoryModules, error: modulesError } = await supabase
        .from("company_mandatory_modules")
        .select("module_id, deadline_date, grace_period_days, is_mandatory")
        .eq("company_id", companyId)
        .eq("is_mandatory", true);

      if (modulesError) throw modulesError;

      // Get all employees for this company
      const { data: companyUsers, error: usersError } = await supabase
        .from("company_users")
        .select("user_id")
        .eq("company_id", companyId);

      if (usersError) throw usersError;

      const employeeIds = companyUsers?.map((cu) => cu.user_id) || [];

      // Get profiles for employees
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", employeeIds);

      if (profilesError) throw profilesError;

      // Get completed sessions for these employees
      const { data: sessions, error: sessionsError } = await supabase
        .from("demo_sessions")
        .select("user_id, scenario, completed, created_at")
        .in("user_id", employeeIds)
        .eq("completed", true);

      if (sessionsError) throw sessionsError;

      // Build completion map
      const completionMap = new Map<string, Set<string>>();
      sessions?.forEach((session) => {
        if (!completionMap.has(session.user_id)) {
          completionMap.set(session.user_id, new Set());
        }
        completionMap.get(session.user_id)!.add(session.scenario);
      });

      // Calculate statistics per module
      const completionStats = mandatoryModules?.map((mandatoryModule) => {
        const completed = employeeIds.filter((empId) =>
          completionMap.get(empId)?.has(mandatoryModule.module_id)
        ).length;
        const pending = employeeIds.length - completed;

        // Calculate overdue (if deadline exists)
        let overdueCount = 0;
        if (mandatoryModule.deadline_date) {
          const deadline = new Date(mandatoryModule.deadline_date);
          const now = new Date();
          if (now > deadline) {
            overdueCount = pending;
          }
        }

        return {
          moduleId: mandatoryModule.module_id,
          moduleName: ALL_MODULES[mandatoryModule.module_id] || mandatoryModule.module_id,
          completedCount: completed,
          pendingCount: pending - overdueCount,
          overdueCount: overdueCount,
          completionPercentage: Math.round((completed / employeeIds.length) * 100) || 0,
        };
      }) || [];

      // Find non-compliant employees
      const nonCompliantEmployees = profiles
        ?.map((profile) => {
          const completedModules = completionMap.get(profile.id) || new Set();
          const missingModules: string[] = [];
          const overdueModules: string[] = [];

          mandatoryModules?.forEach((mandatoryModule) => {
            if (!completedModules.has(mandatoryModule.module_id)) {
              missingModules.push(ALL_MODULES[mandatoryModule.module_id]);

              // Check if overdue
              if (mandatoryModule.deadline_date) {
                const deadline = new Date(mandatoryModule.deadline_date);
                const now = new Date();
                if (now > deadline) {
                  overdueModules.push(ALL_MODULES[mandatoryModule.module_id]);
                }
              }
            }
          });

          return {
            employeeId: profile.id,
            employeeName: profile.full_name || "Nome non disponibile",
            email: profile.email,
            missingModules,
            overdueModules,
          };
        })
        .filter((emp) => emp.missingModules.length > 0) || [];

      setComplianceData({
        companyId: company.id,
        companyName: company.name,
        totalEmployees: employeeIds.length,
        mandatoryModules: mandatoryModules?.map((m) => ({
          moduleId: m.module_id,
          moduleName: ALL_MODULES[m.module_id] || m.module_id,
          deadline: m.deadline_date,
          gracePeriod: m.grace_period_days,
        })) || [],
        completionStats,
        nonCompliantEmployees,
      });
    } catch (error) {
      console.error("Error fetching compliance data:", error);
      toast.error("Errore nel caricamento dei dati di compliance");
    } finally {
      setIsLoading(false);
    }
  };

  const generatePDFReport = () => {
    if (!complianceData) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;

    // Header
    doc.setFontSize(20);
    doc.setTextColor(0, 102, 204);
    doc.text("Report di Compliance Training", pageWidth / 2, yPos, { align: "center" });
    
    yPos += 15;
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Azienda: ${complianceData.companyName}`, 20, yPos);
    
    yPos += 8;
    doc.text(`Data Report: ${new Date().toLocaleDateString("it-IT")}`, 20, yPos);
    
    yPos += 8;
    doc.text(`Dipendenti Totali: ${complianceData.totalEmployees}`, 20, yPos);

    // Overall statistics
    yPos += 15;
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("Riepilogo Generale", 20, yPos);
    
    yPos += 10;
    doc.setFontSize(10);
    const overallCompletion = complianceData.completionStats.reduce(
      (sum, stat) => sum + stat.completionPercentage,
      0
    ) / complianceData.completionStats.length || 0;
    
    doc.text(`Completamento Medio: ${Math.round(overallCompletion)}%`, 30, yPos);
    yPos += 6;
    doc.text(
      `Dipendenti Non Conformi: ${complianceData.nonCompliantEmployees.length}`,
      30,
      yPos
    );

    // Module-by-module statistics
    yPos += 15;
    doc.setFontSize(14);
    doc.text("Statistiche per Modulo", 20, yPos);
    
    yPos += 10;
    doc.setFontSize(10);
    complianceData.completionStats.forEach((stat) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFont("helvetica", "bold");
      doc.text(`${stat.moduleName}:`, 30, yPos);
      doc.setFont("helvetica", "normal");
      yPos += 6;
      doc.text(`  Completati: ${stat.completedCount}`, 35, yPos);
      yPos += 6;
      doc.text(`  In Sospeso: ${stat.pendingCount}`, 35, yPos);
      yPos += 6;
      doc.text(`  In Ritardo: ${stat.overdueCount}`, 35, yPos);
      yPos += 6;
      doc.text(`  Percentuale: ${stat.completionPercentage}%`, 35, yPos);
      yPos += 10;
    });

    // Non-compliant employees
    if (complianceData.nonCompliantEmployees.length > 0) {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      yPos += 10;
      doc.setFontSize(14);
      doc.text("Dipendenti Non Conformi", 20, yPos);
      
      yPos += 10;
      doc.setFontSize(9);
      complianceData.nonCompliantEmployees.forEach((employee, index) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFont("helvetica", "bold");
        doc.text(`${index + 1}. ${employee.employeeName}`, 30, yPos);
        doc.setFont("helvetica", "normal");
        yPos += 5;
        doc.text(`   Email: ${employee.email}`, 35, yPos);
        yPos += 5;
        doc.text(`   Moduli Mancanti: ${employee.missingModules.join(", ")}`, 35, yPos);
        if (employee.overdueModules.length > 0) {
          yPos += 5;
          doc.setTextColor(220, 38, 38);
          doc.text(`   ⚠️ In Ritardo: ${employee.overdueModules.join(", ")}`, 35, yPos);
          doc.setTextColor(0, 0, 0);
        }
        yPos += 10;
      });
    }

    // Footer
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `SicurAzienda - Report di Compliance | Pagina ${i} di ${totalPages}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: "center" }
      );
    }

    doc.save(`compliance-report-${complianceData.companyName}-${Date.now()}.pdf`);
    toast.success("📄 Report PDF generato con successo!");
  };

  const generateExcelReport = () => {
    if (!complianceData) return;

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Sheet 1: Overview
    const overviewData = [
      ["Report di Compliance Training"],
      [""],
      ["Azienda", complianceData.companyName],
      ["Data Report", new Date().toLocaleDateString("it-IT")],
      ["Dipendenti Totali", complianceData.totalEmployees],
      ["Dipendenti Non Conformi", complianceData.nonCompliantEmployees.length],
      [""],
      ["Modulo", "Completati", "In Sospeso", "In Ritardo", "% Completamento"],
    ];

    complianceData.completionStats.forEach((stat) => {
      overviewData.push([
        stat.moduleName,
        stat.completedCount,
        stat.pendingCount,
        stat.overdueCount,
        `${stat.completionPercentage}%`,
      ]);
    });

    const ws1 = XLSX.utils.aoa_to_sheet(overviewData);
    XLSX.utils.book_append_sheet(wb, ws1, "Riepilogo");

    // Sheet 2: Non-compliant employees
    const employeesData = [
      ["Dipendenti Non Conformi"],
      [""],
      ["Nome", "Email", "Moduli Mancanti", "Moduli In Ritardo"],
    ];

    complianceData.nonCompliantEmployees.forEach((employee) => {
      employeesData.push([
        employee.employeeName,
        employee.email,
        employee.missingModules.join(", "),
        employee.overdueModules.join(", "),
      ]);
    });

    const ws2 = XLSX.utils.aoa_to_sheet(employeesData);
    XLSX.utils.book_append_sheet(wb, ws2, "Dipendenti Non Conformi");

    // Save file
    XLSX.writeFile(
      wb,
      `compliance-report-${complianceData.companyName}-${Date.now()}.xlsx`
    );
    toast.success("📊 Report Excel generato con successo!");
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <Clock className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Caricamento dati di compliance...</p>
        </div>
      </Card>
    );
  }

  if (!complianceData) {
    return (
      <Card className="p-6">
        <div className="text-center py-8 text-muted-foreground">
          <AlertCircle className="w-8 h-8 mx-auto mb-4" />
          <p>Nessun dato di compliance disponibile</p>
        </div>
      </Card>
    );
  }

  const overallCompletion =
    complianceData.completionStats.reduce(
      (sum, stat) => sum + stat.completionPercentage,
      0
    ) / complianceData.completionStats.length || 0;

  const pieChartData = complianceData.completionStats.map((stat) => ({
    name: stat.moduleName,
    value: stat.completionPercentage,
  }));

  return (
    <div className="space-y-6">
      {/* Header with Export Buttons */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Report di Compliance</h2>
            <p className="text-sm text-muted-foreground">
              Stato completamento moduli obbligatori - {complianceData.companyName}
            </p>
          </div>
          <div className="flex gap-3">
            <Button onClick={generatePDFReport} variant="professional">
              <FileDown className="w-4 h-4" />
              Scarica PDF
            </Button>
            <Button onClick={generateExcelReport} variant="outline">
              <FileSpreadsheet className="w-4 h-4" />
              Scarica Excel
            </Button>
          </div>
        </div>
      </Card>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Dipendenti Totali</p>
              <p className="text-3xl font-bold">{complianceData.totalEmployees}</p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-primary" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Completamento Medio</p>
              <p className="text-3xl font-bold">{Math.round(overallCompletion)}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Non Conformi</p>
              <p className="text-3xl font-bold text-amber-600">
                {complianceData.nonCompliantEmployees.length}
              </p>
            </div>
            <AlertCircle className="w-8 h-8 text-amber-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Moduli Obbligatori</p>
              <p className="text-3xl font-bold">{complianceData.mandatoryModules.length}</p>
            </div>
            <Clock className="w-8 h-8 text-secondary" />
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Completamento per Modulo</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={complianceData.completionStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="moduleName" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="completedCount" name="Completati" fill="#10b981" />
              <Bar dataKey="pendingCount" name="In Sospeso" fill="#f59e0b" />
              <Bar dataKey="overdueCount" name="In Ritardo" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Pie Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Distribuzione Completamento</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Module Details */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Dettaglio Moduli Obbligatori</h3>
        <div className="space-y-4">
          {complianceData.completionStats.map((stat) => (
            <div key={stat.moduleId} className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{stat.moduleName}</p>
                  <p className="text-sm text-muted-foreground">
                    {stat.completedCount} di {complianceData.totalEmployees} completati
                  </p>
                </div>
                <Badge variant={stat.completionPercentage >= 80 ? "default" : "secondary"}>
                  {stat.completionPercentage}%
                </Badge>
              </div>
              <Progress value={stat.completionPercentage} className="h-2" />
              {stat.overdueCount > 0 && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {stat.overdueCount} dipendenti in ritardo
                </p>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Non-Compliant Employees */}
      {complianceData.nonCompliantEmployees.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            Dipendenti Non Conformi ({complianceData.nonCompliantEmployees.length})
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {complianceData.nonCompliantEmployees.map((employee) => (
              <Card key={employee.employeeId} className="p-4 border-l-4 border-l-amber-500">
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold">{employee.employeeName}</p>
                      <p className="text-sm text-muted-foreground">{employee.email}</p>
                    </div>
                    <Badge variant="secondary">
                      {employee.missingModules.length} moduli mancanti
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Moduli da completare:</p>
                    <ul className="text-sm text-muted-foreground list-disc list-inside">
                      {employee.missingModules.map((module, idx) => (
                        <li key={idx} className={employee.overdueModules.includes(module) ? "text-destructive font-medium" : ""}>
                          {module}
                          {employee.overdueModules.includes(module) && " (IN RITARDO)"}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
