import { useState } from 'react';
import { PlusCircle, Image as ImageIcon, Edit, Trash2, X, Upload, CheckCircle2, XCircle } from 'lucide-react';
import type { Banner } from '../../types/index.ts';

interface BannersManagerProps {
  banners: Banner[];
  onCreateBanner: (data: Partial<Banner>) => Promise<void>;
  onUpdateBanner: (id: string, data: Partial<Banner>) => Promise<void>;
  onDeleteBanner: (id: string) => Promise<void>;
}

export default function BannersManager({
  banners,
  onCreateBanner,
  onUpdateBanner,
  onDeleteBanner,
}: BannersManagerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [image, setImage] = useState('');
  const [buttonText, setButtonText] = useState('Ver viagens');
  const [buttonLink, setButtonLink] = useState('#viagens');
  const [order, setOrder] = useState<number>(0);
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openCreateModal = () => {
    setEditingBanner(null);
    setTitle('');
    setSubtitle('');
    setImage('');
    setButtonText('Ver viagens');
    setButtonLink('#viagens');
    setOrder(banners.length + 1);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (b: Banner) => {
    setEditingBanner(b);
    setTitle(b.title);
    setSubtitle(b.subtitle || '');
    setImage(b.image || '');
    setButtonText(b.buttonText || '');
    setButtonLink(b.buttonLink || b.link || '');
    setOrder(b.order || 0);
    const isAct = b.isActive !== undefined ? b.isActive : b.active;
    setIsActive(Boolean(isAct));
    setIsModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Título do banner é obrigatório.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: Partial<Banner> = {
        title: title.trim(),
        subtitle: subtitle.trim(),
        image: image.trim() || undefined,
        buttonText: buttonText.trim(),
        buttonLink: buttonLink.trim(),
        link: buttonLink.trim(),
        order: Number(order) || 0,
        active: isActive,
        isActive: isActive,
      };

      if (editingBanner) {
        await onUpdateBanner(editingBanner.id, payload);
      } else {
        await onCreateBanner(payload);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar banner.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (banner: Banner) => {
    const currentActive = banner.isActive !== undefined ? banner.isActive : banner.active;
    try {
      await onUpdateBanner(banner.id, { active: !currentActive, isActive: !currentActive });
    } catch (err: any) {
      alert(err.message || 'Erro ao alterar status do banner.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir este banner?')) return;
    try {
      await onDeleteBanner(id);
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir banner.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-[#071A33] font-['Playfair_Display',serif]">
            Banners da Página Inicial
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Personalize os destaques principais que aparecem no topo do site da SonheTur.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#2D6FA3] hover:bg-[#1b4b7c] text-white font-bold text-sm shadow transition-all"
        >
          <PlusCircle className="w-4 h-4 text-[#93C5FD]" />
          <span>+ Novo Banner</span>
        </button>
      </div>

      {banners.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#071A33]/5 flex items-center justify-center mb-4">
            <ImageIcon className="w-8 h-8 text-[#2D6FA3]" />
          </div>
          <h3 className="text-lg font-bold text-[#071A33] font-['Playfair_Display',serif]">
            Nenhum banner personalizado cadastrado
          </h3>
          <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
            Por padrão, a home exibe o elegante banner institucional azul-marinho da SonheTur com o slogan "Viagens e experiências".
          </p>
          <button
            onClick={openCreateModal}
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#071A33] hover:bg-[#2D6FA3] text-white text-xs font-bold transition-all shadow"
          >
            <PlusCircle className="w-4 h-4 text-[#38BDF8]" />
            <span>Adicionar Banner Personalizado</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {banners.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="h-44 bg-[#071A33] relative overflow-hidden flex items-center justify-center">
                  {b.image ? (
                    <img src={b.image} alt={b.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-4">
                      <ImageIcon className="w-10 h-10 text-[#38BDF8] mx-auto mb-1" />
                      <span className="text-xs uppercase tracking-wider text-slate-300 font-semibold">
                        Banner SonheTur
                      </span>
                    </div>
                  )}

                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#071A33]/90 text-white border border-[#2D6FA3]/40">
                      Ordem: #{b.order}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        (b.isActive ?? b.active) ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {(b.isActive ?? b.active) ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-lg font-bold text-[#071A33] font-['Playfair_Display',serif]">
                    {b.title}
                  </h3>
                  {b.subtitle && (
                    <p className="mt-2 text-xs text-slate-600 leading-relaxed">{b.subtitle}</p>
                  )}
                  {b.buttonText && (
                    <p className="mt-3 text-xs text-[#2D6FA3] font-semibold">
                      Botão: "{b.buttonText}" → {b.buttonLink || b.link || '#viagens'}
                    </p>
                  )}
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => handleToggleActive(b)}
                  className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg inline-flex items-center gap-1.5 ${
                    (b.isActive ?? b.active) ? 'text-amber-700 bg-amber-50 hover:bg-amber-100' : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                  }`}
                >
                  {(b.isActive ?? b.active) ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>{(b.isActive ?? b.active) ? 'Desativar' : 'Ativar'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(b)}
                    className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 text-xs font-semibold inline-flex items-center gap-1"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Editar</span>
                  </button>

                  <button
                    onClick={() => handleDelete(b.id)}
                    className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 text-xs font-semibold inline-flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Excluir</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-[#071A33] font-['Playfair_Display',serif]">
                {editingBanner ? 'Editar Banner' : 'Cadastrar Novo Banner'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Título do Banner *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Próximas Excursões SonheTur"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-[#2D6FA3] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Subtítulo / Texto
                </label>
                <textarea
                  rows={2}
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Ex: Viagens planejadas com conforto, pontualidade e segurança saindo do Vale do Aço."
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm focus:border-[#2D6FA3] outline-none resize-y"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Foto de Fundo
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="URL da imagem ou faça upload"
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none"
                  />
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#071A33] text-white text-xs font-bold">
                    <Upload className="w-3.5 h-3.5 text-[#38BDF8]" />
                    <span>Upload</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Texto do Botão
                  </label>
                  <input
                    type="text"
                    value={buttonText}
                    onChange={(e) => setButtonText(e.target.value)}
                    placeholder="Ver viagens"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Link do Botão
                  </label>
                  <input
                    type="text"
                    value={buttonLink}
                    onChange={(e) => setButtonLink(e.target.value)}
                    placeholder="#viagens"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Ordem de Exibição
                  </label>
                  <input
                    type="number"
                    value={order}
                    onChange={(e) => setOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none"
                  />
                </div>

                <div className="pt-5">
                  <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="w-4 h-4 rounded text-[#2D6FA3]"
                    />
                    <span>Banner Ativo no site</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#2D6FA3] hover:bg-[#1b4b7c] text-white text-xs font-bold shadow"
                >
                  {isSubmitting ? 'Salvando...' : 'Salvar Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
