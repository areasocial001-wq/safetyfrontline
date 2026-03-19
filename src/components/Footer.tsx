import { Shield, Mail, Phone, MapPin } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-16">
      <div className="container px-4 mx-auto">
        <div className="max-w-6xl mx-auto">
          {/* Main Footer Content */}
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {/* Brand Column */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-8 h-8 text-primary" />
                <div>
                  <h3 className="text-xl font-bold">SicurAzienda</h3>
                  <p className="text-sm opacity-80">Safety Frontline</p>
                </div>
              </div>
              <p className="text-sm opacity-80 leading-relaxed mb-4">
                La piattaforma di gamification per la formazione sulla sicurezza sul lavoro. 
                Perfettamente allineata al D.Lgs. 81/08 e all'Accordo Stato-Regioni 2025.
              </p>
              <div className="flex gap-4">
                <a 
                  href="#" 
                  className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors"
                  aria-label="LinkedIn"
                >
                  <span className="text-lg">in</span>
                </a>
                <a 
                  href="#" 
                  className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors"
                  aria-label="YouTube"
                >
                  <span className="text-lg">▶</span>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4">Link Veloci</h4>
              <ul className="space-y-2 text-sm opacity-80">
                <li><a href="/guida" className="hover:text-primary transition-colors">📖 Guida Completa</a></li>
                <li><a href="/scheda-tecnica" className="hover:text-primary transition-colors">📄 Scheda Tecnica</a></li>
                <li><a href="#moduli" className="hover:text-primary transition-colors">I Moduli</a></li>
                <li><a href="#come-funziona" className="hover:text-primary transition-colors">Come Funziona</a></li>
                <li><a href="#normativa" className="hover:text-primary transition-colors">Conformità</a></li>
                <li><a href="#pricing" className="hover:text-primary transition-colors">Piani</a></li>
                <li><a href="#contatti" className="hover:text-primary transition-colors">Contatti</a></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="font-semibold mb-4">Contatti</h4>
              <ul className="space-y-3 text-sm opacity-80">
                <li className="flex items-start gap-2">
                  <Mail className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                  <a href="mailto:info@sicurazienda.it" className="hover:text-primary transition-colors">
                    info@sicurazienda.it
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <Phone className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                  <a href="tel:+390123456789" className="hover:text-primary transition-colors">
                    +39 012 345 6789
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                  <span>Italia</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-background/10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm opacity-80">
              <p>&copy; 2025 SicurAzienda. Tutti i diritti riservati.</p>
              <div className="flex gap-6">
                <a href="#privacy" className="hover:text-primary transition-colors">Privacy Policy</a>
                <a href="#terms" className="hover:text-primary transition-colors">Termini di Servizio</a>
                <a href="#cookies" className="hover:text-primary transition-colors">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
