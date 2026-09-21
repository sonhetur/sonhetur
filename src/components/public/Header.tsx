import { useState } from 'react';
import { Menu, X, Phone, Compass, Shield } from 'lucide-react';
import type { SiteSettings } from '../../types/index.ts';
import { getWhatsAppLink } from '../../utils/formatters.ts';

interface HeaderProps {
  settings: SiteSettings;
  activeSection: string;
  onNavigate: (section: string) => void;
  onOpenAdmin: () => void;
}

export default function Header({ settings, activeSection, onNavigate, onOpenAdmin }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'inicio', label: 'Início' },
    { id: 'viagens', label: 'Viagens' },
    { id: 'sobre', label: 'Sobre' },
    { id: 'contato', label: 'Contato' },
  ];

  const handleNavClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  const whatsappHref = getWhatsAppLink(
    settings.whatsapp || '(31) 9912-6011',
    'Olá, SonheTur! Gostaria de falar com a equipe sobre opções de viagens e turismo.'
  );

  return (
    <header className="sticky top-0 z-40 bg-[#071A33]/95 backdrop-blur-md border-b border-[#123B63]/60 text-white shadow-lg transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <button
            onClick={() => handleNavClick('inicio')}
            className="flex items-center gap-3 text-left group focus:outline-none focus:ring-2 focus:ring-[#38BDF8] rounded-lg p-1"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#123B63] to-[#071A33] border border-[#2D6FA3]/50 flex items-center justify-center shadow-md group-hover:border-[#38BDF8] transition-colors">
              <Compass className="w-6 h-6 text-[#38BDF8] group-hover:rotate-45 transition-transform duration-500" />
            </div>
            <div>
              <span className="text-2xl font-extrabold tracking-wider font-['Playfair_Display',serif] text-white">
                SONHE<span className="text-[#38BDF8]">TUR</span>
              </span>
              <p className="text-[10px] tracking-widest uppercase text-slate-300 font-medium">
                Viagens & Turismo
              </p>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    isActive
                      ? 'text-[#38BDF8] bg-[#0B2545] font-semibold border-b-2 border-[#38BDF8]'
                      : 'text-slate-200 hover:text-white hover:bg-[#0B2545]/60'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#2D6FA3] hover:bg-[#1b4b7c] text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all border border-[#2D6FA3]/60 focus:outline-none focus:ring-2 focus:ring-[#38BDF8]"
            >
              <Phone className="w-4 h-4 text-[#38BDF8]" />
              <span>Falar conosco</span>
            </a>

            <button
              onClick={onOpenAdmin}
              title="Acesso Administrativo"
              className="p-2 rounded-lg text-slate-400 hover:text-[#38BDF8] hover:bg-[#0B2545] transition-colors"
            >
              <Shield className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-lg text-slate-200 hover:text-white hover:bg-[#0B2545] focus:outline-none focus:ring-2 focus:ring-[#38BDF8]"
              aria-label="Abrir menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#071A33] border-b border-[#123B63] px-4 pt-2 pb-6 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-1">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center justify-between w-full px-4 py-3 rounded-lg text-base font-medium text-left transition-colors ${
                    isActive
                      ? 'bg-[#0B2545] text-[#38BDF8] font-semibold border-l-4 border-[#38BDF8]'
                      : 'text-slate-200 hover:bg-[#0B2545]/60 hover:text-white'
                  }`}
                >
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-[#123B63] flex flex-col gap-2">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-[#2D6FA3] text-white font-semibold text-center text-sm shadow"
            >
              <Phone className="w-4 h-4 text-[#38BDF8]" />
              <span>Falar conosco via WhatsApp</span>
            </a>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdmin();
              }}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-[#0B2545] text-slate-300 hover:text-white text-xs"
            >
              <Shield className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>Painel Administrativo (/admin)</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
