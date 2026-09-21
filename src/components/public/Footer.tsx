import { Compass, Mail, Phone, MapPin, Instagram, Facebook, Shield } from 'lucide-react';
import type { SiteSettings } from '../../types/index.ts';

interface FooterProps {
  settings: SiteSettings;
  onNavigate: (section: string) => void;
  onOpenAdmin: () => void;
}

export default function Footer({ settings, onNavigate, onOpenAdmin }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#071A33] text-white border-t border-[#123B63]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#0B2545] border border-[#2D6FA3]/60 flex items-center justify-center">
                <Compass className="w-5 h-5 text-[#38BDF8]" />
              </div>
              <span className="text-2xl font-bold tracking-wider font-['Playfair_Display',serif] text-white">
                SONHE<span className="text-[#38BDF8]">TUR</span>
              </span>
            </div>
            <p className="text-slate-300 text-sm italic font-['Playfair_Display',serif]">
              "Viagens e experiências."
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Agência de viagens e turismo com atuação na região do Vale do Aço, Minas Gerais.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#38BDF8]">
              Navegação
            </h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>
                <button
                  onClick={() => onNavigate('inicio')}
                  className="hover:text-[#38BDF8] transition-colors"
                >
                  Início
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('viagens')}
                  className="hover:text-[#38BDF8] transition-colors"
                >
                  Viagens
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('sobre')}
                  className="hover:text-[#38BDF8] transition-colors"
                >
                  Sobre
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contato')}
                  className="hover:text-[#38BDF8] transition-colors"
                >
                  Contato
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#38BDF8]">
              Contato Oficial
            </h4>
            <div className="space-y-2 text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#2D6FA3] shrink-0" />
                <a href={`mailto:${settings.email}`} className="hover:text-white transition-colors break-all">
                  {settings.email || 'sonhetur@gmail.com'}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#2D6FA3] shrink-0" />
                <a href={`tel:${settings.phone}`} className="hover:text-white transition-colors">
                  {settings.phone || '(31) 9912-6011'}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#2D6FA3] shrink-0" />
                <span className="text-xs text-slate-400">
                  {settings.region || 'Vale do Aço, Minas Gerais'}
                </span>
              </div>
            </div>

            {/* Social media only if configured */}
            {(settings.instagram || settings.facebook) && (
              <div className="pt-2 flex items-center gap-3">
                {settings.instagram && (
                  <a
                    href={settings.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-[#0B2545] text-slate-300 hover:text-[#38BDF8] transition-colors"
                    title="Instagram"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                )}
                {settings.facebook && (
                  <a
                    href={settings.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-[#0B2545] text-slate-300 hover:text-[#38BDF8] transition-colors"
                    title="Facebook"
                  >
                    <Facebook className="w-4 h-4" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Security & Admin link */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#38BDF8]">
              Acesso Restrito
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Painel exclusivo para gerenciamento de excursões, roteiros e solicitações de atendimento.
            </p>
            <button
              onClick={onOpenAdmin}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#0B2545] hover:bg-[#123B63] text-xs font-medium text-slate-200 hover:text-white border border-[#2D6FA3]/40 transition-colors"
            >
              <Shield className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>Acesso Administrativo</span>
            </button>
          </div>
        </div>

        {/* Copyright notice */}
        <div className="mt-12 pt-8 border-t border-[#123B63]/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {currentYear} SonheTur. Todos os direitos reservados.</p>
          <p className="text-slate-500">
            Agência de Viagens e Turismo • Vale do Aço - MG
          </p>
        </div>
      </div>
    </footer>
  );
}
