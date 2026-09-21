import { useState } from 'react';
import { Save, CheckCircle2, FileText, Compass, ShieldCheck } from 'lucide-react';
import type { InstitutionalContent } from '../../types/index.ts';

interface ContentManagerProps {
  content: InstitutionalContent;
  onSaveContent: (data: InstitutionalContent) => Promise<void>;
}

export default function ContentManager({ content, onSaveContent }: ContentManagerProps) {
  const [slogan, setSlogan] = useState(content.slogan || 'Viagens e experiências.');
  const [homeMainText, setHomeMainText] = useState(
    content.homeMainText ||
      'Conectamos você aos melhores roteiros, praias e experiências turísticas com saída organizada da região do Vale do Aço, Minas Gerais.'
  );
  const [aboutText, setAboutText] = useState(
    content.aboutText ||
      'A SonheTur atua no segmento de agência de viagens e turismo na região do Vale do Aço, Minas Gerais, com foco em excursões e experiências de viagem planejadas com organização e segurança.'
  );
  const [mission, setMission] = useState(content.mission || '');
  const [vision, setVision] = useState(content.vision || '');
  const [values, setValues] = useState(content.values || '');
  const [differentials, setDifferentials] = useState(content.differentials || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSavedSuccess(false);

    try {
      await onSaveContent({
        slogan: slogan.trim(),
        homeMainText: homeMainText.trim(),
        aboutText: aboutText.trim(),
        mission: mission.trim() || undefined,
        vision: vision.trim() || undefined,
        values: values.trim() || undefined,
        differentials: differentials.trim() || undefined,
        teamPhotos: content.teamPhotos || [],
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar conteúdos.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-[#071A33] font-['Playfair_Display',serif]">
            Gerenciamento de Conteúdo Institucional
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Edite textos do site, pilares institucionais e mensagens sem precisar alterar o código.
          </p>
        </div>

        {savedSuccess && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Conteúdo salvo com sucesso!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Home & General Texts */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-[#071A33] font-['Playfair_Display',serif] flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#2D6FA3]" />
            <span>Textos da Página Inicial</span>
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Slogan Oficial da SonheTur
            </label>
            <input
              type="text"
              value={slogan}
              onChange={(e) => setSlogan(e.target.value)}
              placeholder="Ex: Viagens e experiências."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-[#2D6FA3] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Texto Principal da Home
            </label>
            <textarea
              rows={3}
              value={homeMainText}
              onChange={(e) => setHomeMainText(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-[#2D6FA3] outline-none resize-y"
            />
          </div>
        </div>

        {/* About Section Texts */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-[#071A33] font-['Playfair_Display',serif] flex items-center gap-2">
            <Compass className="w-5 h-5 text-[#2D6FA3]" />
            <span>Apresentação Institucional (Página Sobre)</span>
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Texto Sobre a Empresa
            </label>
            <textarea
              rows={4}
              value={aboutText}
              onChange={(e) => setAboutText(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-[#2D6FA3] outline-none resize-y"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Missão
              </label>
              <textarea
                rows={3}
                value={mission}
                onChange={(e) => setMission(e.target.value)}
                placeholder="Insira a missão oficial da SonheTur..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-[#2D6FA3] outline-none resize-y"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Visão
              </label>
              <textarea
                rows={3}
                value={vision}
                onChange={(e) => setVision(e.target.value)}
                placeholder="Insira a visão da SonheTur..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-[#2D6FA3] outline-none resize-y"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Valores
              </label>
              <textarea
                rows={3}
                value={values}
                onChange={(e) => setValues(e.target.value)}
                placeholder="Ex: Segurança, pontualidade, transparência..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-[#2D6FA3] outline-none resize-y"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Diferenciais
              </label>
              <textarea
                rows={3}
                value={differentials}
                onChange={(e) => setDifferentials(e.target.value)}
                placeholder="Ex: Embarque pontual no Vale do Aço, suporte pelo WhatsApp..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-[#2D6FA3] outline-none resize-y"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#071A33] hover:bg-[#2D6FA3] text-white font-bold text-sm shadow transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-[#38BDF8]" />
            <span>{isSubmitting ? 'Salvando...' : 'Salvar Alterações de Conteúdo'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
