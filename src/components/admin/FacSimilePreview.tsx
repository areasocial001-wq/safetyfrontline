import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Award, Download, ExternalLink } from "lucide-react";

const SAMPLES = [
  {
    id: "test",
    title: "Fac-simile Test Finale",
    description:
      "Esempio di test di valutazione: 10 quesiti a risposta multipla, soglia di superamento 80%, sezione esito e soluzioni riservate al docente.",
    file: "/samples/facsimile-test-finale.pdf",
    icon: FileText,
    badge: "10 quesiti",
    color: "from-blue-500/15 to-indigo-500/10",
  },
  {
    id: "cert",
    title: "Fac-simile Certificato",
    description:
      "Esempio di attestato di completamento: dati del discente, modulo svolto, codice univoco, hash di verifica e QR code per la validazione online.",
    file: "/samples/facsimile-certificato.pdf",
    icon: Award,
    badge: "Conforme D.Lgs. 81/08",
    color: "from-emerald-500/15 to-teal-500/10",
  },
];

export const FacSimilePreview = () => {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-2">
          <FileText className="w-6 h-6 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">Fac-simile Test e Certificato</h2>
            <p className="text-sm text-muted-foreground">
              Esempi dimostrativi da mostrare ai clienti o ai discenti prima dell'erogazione del corso
            </p>
          </div>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {SAMPLES.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.id} className="overflow-hidden border-2 hover:shadow-lg transition-shadow">
              <div className={`bg-gradient-to-br ${s.color} p-6 border-b`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="p-3 bg-background rounded-xl shadow-sm">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  <Badge variant="secondary">{s.badge}</Badge>
                </div>
                <h3 className="text-xl font-bold mb-1">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.description}</p>
              </div>

              {/* PDF preview */}
              <div className="bg-muted/30 border-b">
                <iframe
                  src={`${s.file}#view=FitH&toolbar=0`}
                  title={s.title}
                  className="w-full h-[420px] bg-white"
                />
              </div>

              <div className="p-4 flex flex-wrap gap-2">
                <a href={s.file} download>
                  <Button variant="professional">
                    <Download className="w-4 h-4 mr-2" />
                    Scarica PDF
                  </Button>
                </a>
                <a href={s.file} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Apri in nuova scheda
                  </Button>
                </a>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="p-4 bg-muted/30 border-dashed">
        <p className="text-xs text-muted-foreground">
          <strong>Nota:</strong> i documenti sono fac-simile dimostrativi. I test e i certificati
          reali vengono generati automaticamente dalla piattaforma con dati personalizzati,
          tracciamento dei tempi, codice univoco e hash di verifica.
        </p>
      </Card>
    </div>
  );
};
