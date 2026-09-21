import { Compass, ShieldCheck, HeartHandshake, Award, Users } from 'lucide-react';
import type { InstitutionalContent, SiteSettings } from '../../types/index.ts';

interface AboutSectionProps {
  content: InstitutionalContent;
  settings: SiteSettings;
  onContactClick: () => void;
}

export default function AboutSection({ content, settings, onContactClick }: AboutSectionProps) {
  const aboutText = content?.aboutText ||
    'A SonheTur atua no segmento de agência de viagens e turismo na região do Vale do Aço, Minas Gerais, com foco em excursões e experiências de viagem planejadas com organização e segurança.';

  const hasPillars = Boolean(content?.mission || content?.vision || content?.values || content?.differentials);

  return (
    <section id="sobre" className="py-20 bg-white text-[#071A33] border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#071A33]/5 text-[#071A33] text-xs font-semibold uppercase tracking-wider mb-3">
            <Compass className="w-3.5 h-3.5 text-[#2D6FA3]" />
            <span>Institucional</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#071A33] font-['Playfair_Display',serif]">
            Sobre a SonheTur
          </h2>
          <div className="w-20 h-1 bg-[#2D6FA3] mx-auto mt-4 rounded-full" />
        </div>

        {/* Main Presentation */}
        <div className="bg-[#F5F7FA] rounded-2xl p-8 sm:p-12 border border-slate-200 mb-12">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h3 className="text-2xl font-bold text-[#071A33] font-['Playfair_Display',serif]">
              Turismo e Viagens no Vale do Aço
            </h3>
            <p className="text-base sm:text-lg text-slate-700 leading-relaxed">
              {aboutText}
            </p>
            <p className="text-sm text-slate-500">
              Atuação dedicada a conectar viajantes a momentos especiais com tranquilidade, suporte e roteiros elaborados com carinho.
            </p>
          </div>
        </div>

        {/* Pillars / Institutional Cards (Loaded from content or neutral placeholders ready for admin) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Missão */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-[#071A33]/5 flex items-center justify-center mb-4">
                <Compass className="w-5 h-5 text-[#2D6FA3]" />
              </div>
              <h4 className="text-lg font-bold text-[#071A33] mb-2 font-['Playfair_Display',serif]">
                Missão
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                {content?.mission || 'Proporcionar experiências de viagem e excursões seguras, confortáveis e memoráveis para nossos clientes.'}
              </p>
            </div>
            {!content?.mission && (
              <span className="text-[10px] text-slate-400 mt-4 block">Campo configurável no painel administrativo</span>
            )}
          </div>

          {/* Visão */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-[#071A33]/5 flex items-center justify-center mb-4">
                <Award className="w-5 h-5 text-[#2D6FA3]" />
              </div>
              <h4 className="text-lg font-bold text-[#071A33] mb-2 font-['Playfair_Display',serif]">
                Visão
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                {content?.vision || 'Ser referência de confiabilidade e qualidade em turismo e excursões na região do Vale do Aço.'}
              </p>
            </div>
            {!content?.vision && (
              <span className="text-[10px] text-slate-400 mt-4 block">Campo configurável no painel administrativo</span>
            )}
          </div>

          {/* Valores */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-[#071A33]/5 flex items-center justify-center mb-4">
                <HeartHandshake className="w-5 h-5 text-[#2D6FA3]" />
              </div>
              <h4 className="text-lg font-bold text-[#071A33] mb-2 font-['Playfair_Display',serif]">
                Valores
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                {content?.values || 'Segurança, pontualidade, transparência, respeito aos viajantes e dedicação em cada detalhe.'}
              </p>
            </div>
            {!content?.values && (
              <span className="text-[10px] text-slate-400 mt-4 block">Campo configurável no painel administrativo</span>
            )}
          </div>

          {/* Diferenciais */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-[#071A33]/5 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <h4 className="text-lg font-bold text-[#071A33] mb-2 font-['Playfair_Display',serif]">
                Diferenciais
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                {content?.differentials || 'Acompanhamento dedicado, roteiros organizados e atendimento direto pelo WhatsApp ou telefone.'}
              </p>
            </div>
            {!content?.differentials && (
              <span className="text-[10px] text-slate-400 mt-4 block">Campo configurável no painel administrativo</span>
            )}
          </div>
        </div>

        {/* Team Photos (if uploaded by admin) */}
        {content?.teamPhotos && content.teamPhotos.length > 0 && (
          <div className="mt-16">
            <h3 className="text-2xl font-bold text-center text-[#071A33] font-['Playfair_Display',serif] mb-8">
              Nossa Equipe
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {content.teamPhotos.map((photo, i) => (
                <div key={i} className="rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                  <img src={photo} alt="Equipe SonheTur" className="w-full h-64 object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Call to contact */}
        <div className="mt-16 text-center">
          <button
            onClick={onContactClick}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#071A33] hover:bg-[#2D6FA3] text-white font-semibold text-sm shadow transition-colors"
          >
            <span>Fale com a SonheTur</span>
          </button>
        </div>
      </div>
    </section>
  );
}
