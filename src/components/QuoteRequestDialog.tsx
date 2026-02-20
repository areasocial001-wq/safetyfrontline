import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface QuoteRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const QuoteRequestDialog = ({ open, onOpenChange }: QuoteRequestDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    company_name: "",
    employees_count: "",
    training_type: "",
    modules: [] as string[],
    message: "",
  });

  const modules = [
    "Safety Run - Rischi Generali",
    "Office Hazard Quest - Uffici & VDT",
    "Magazzino 2.5D - Carrelli & Movimentazione",
    "Emergenza! - Vie di fuga",
    "Personalizzazioni Aziendali",
  ];

  const handleModuleToggle = (module: string) => {
    setFormData((prev) => ({
      ...prev,
      modules: prev.modules.includes(module)
        ? prev.modules.filter((m) => m !== module)
        : [...prev.modules, module],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("quote_requests").insert({
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone || null,
        company_name: formData.company_name,
        employees_count: formData.employees_count || null,
        training_type: formData.training_type || null,
        modules: formData.modules.length > 0 ? formData.modules : null,
        message: formData.message || null,
        status: "nuovo",
      });

      if (error) throw error;

      toast.success("Richiesta inviata con successo! Ti contatteremo presto.");
      onOpenChange(false);
      setFormData({
        full_name: "",
        email: "",
        phone: "",
        company_name: "",
        employees_count: "",
        training_type: "",
        modules: [],
        message: "",
      });
    } catch (error) {
      console.error("Error submitting quote request:", error);
      toast.error("Errore nell'invio della richiesta. Riprova.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Richiedi Preventivo</DialogTitle>
          <DialogDescription>
            Compila il form e ti contatteremo entro 24 ore con un preventivo personalizzato.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Info */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">
                Nome e Cognome <span className="text-destructive">*</span>
              </Label>
              <Input
                id="full_name"
                required
                value={formData.full_name}
                onChange={(e) =>
                  setFormData({ ...formData, full_name: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
          </div>

          {/* Company Info */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company_name">
                Azienda <span className="text-destructive">*</span>
              </Label>
              <Input
                id="company_name"
                required
                value={formData.company_name}
                onChange={(e) =>
                  setFormData({ ...formData, company_name: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefono</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>
          </div>

          {/* Training Details */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employees_count">Numero Dipendenti</Label>
              <Select
                value={formData.employees_count}
                onValueChange={(value) =>
                  setFormData({ ...formData, employees_count: value })
                }
              >
                <SelectTrigger id="employees_count">
                  <SelectValue placeholder="Seleziona range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-10">1-10</SelectItem>
                  <SelectItem value="11-50">11-50</SelectItem>
                  <SelectItem value="51-100">51-100</SelectItem>
                  <SelectItem value="100+">100+</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="training_type">Modalità di Interesse</Label>
              <Select
                value={formData.training_type}
                onValueChange={(value) =>
                  setFormData({ ...formData, training_type: value })
                }
              >
                <SelectTrigger id="training_type">
                  <SelectValue placeholder="Seleziona modalità" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="classroom">Versione Aula</SelectItem>
                  <SelectItem value="individual">Versione Individuale</SelectItem>
                  <SelectItem value="both">Entrambe</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Modules */}
          <div className="space-y-3">
            <Label>Moduli di Interesse</Label>
            <div className="space-y-2">
              {modules.map((module) => (
                <div key={module} className="flex items-center space-x-2">
                  <Checkbox
                    id={module}
                    checked={formData.modules.includes(module)}
                    onCheckedChange={() => handleModuleToggle(module)}
                  />
                  <label
                    htmlFor={module}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {module}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Messaggio (opzionale)</Label>
            <Textarea
              id="message"
              rows={4}
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              placeholder="Raccontaci di più sulle tue esigenze formative..."
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Annulla
            </Button>
            <Button type="submit" variant="hero" disabled={loading}>
              {loading ? "Invio in corso..." : "Invia Richiesta"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
