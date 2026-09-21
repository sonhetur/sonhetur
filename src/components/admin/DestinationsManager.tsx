import { useState } from 'react';
import { PlusCircle, MapPin, Edit, Trash2, X, Upload } from 'lucide-react';
import type { Destination, Travel } from '../../types/index.ts';

interface DestinationsManagerProps {
  destinations: Destination[];
  travels: Travel[];
  onCreateDestination: (data: Partial<Destination>) => Promise<void>;
  onUpdateDestination: (id: string, data: Partial<Destination>) => Promise<void>;
  onDeleteDestination: (id: string) => Promise<void>;
}

export default function DestinationsManager({
  destinations,
  travels,
  onCreateDestination,
  onUpdateDestination,
  onDeleteDestination,
}: DestinationsManagerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDest, setEditingDest] = useState<Destination | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openCreateModal = () => {
    setEditingDest(null);
    setName('');
    setDescription('');
    setImage('');
    setIsModalOpen(true);
  };

  const openEditModal = (dest: Destination) => {
    setEditingDest(dest);
    setName(dest.name);
    setDescription(dest.description || '');
    setImage(dest.image || '');
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
    if (!name.trim()) {
      alert('Nome do destino é obrigatório.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingDest) {
        await onUpdateDestination(editingDest.id, {
          name: name.trim(),
          description: description.trim(),
          image: image.trim() || undefined,
        });
      } else {
        await onCreateDestination({
          name: name.trim(),
          description: description.trim(),
          image: image.trim() || undefined,
        });
      }
      setIsModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar destino.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, destName: string) => {
    const relatedCount = travels.filter(t => t.destination.toLowerCase() === destName.toLowerCase()).length;
    if (relatedCount > 0) {
      if (!confirm(`Existem ${relatedCount} viagens relacionadas a este destino. Deseja realmente excluir?`)) {
        return;
      }
    } else {
      if (!confirm('Deseja excluir este destino?')) return;
    }

    try {
      await onDeleteDestination(id);
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir destino.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-[#071A33] font-['Playfair_Display',serif]">
            Destinos Turísticos
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Cadastre os destinos atendidos pela SonheTur e relacione com os pacotes de viagem.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#2D6FA3] hover:bg-[#1b4b7c] text-white font-bold text-sm shadow transition-all"
        >
          <PlusCircle className="w-4 h-4 text-[#93C5FD]" />
          <span>+ Novo Destino</span>
        </button>
      </div>

      {/* Grid of Destinations */}
      {destinations.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#071A33]/5 flex items-center justify-center mb-4">
            <MapPin className="w-8 h-8 text-[#2D6FA3]" />
          </div>
          <h3 className="text-lg font-bold text-[#071A33] font-['Playfair_Display',serif]">
            Nenhum destino cadastrado ainda
          </h3>
          <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
            Os destinos cadastrados ajudam a categorizar as viagens e facilitam a busca dos clientes.
          </p>
          <button
            onClick={openCreateModal}
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#071A33] hover:bg-[#2D6FA3] text-white text-xs font-bold transition-all shadow"
          >
            <PlusCircle className="w-4 h-4 text-[#38BDF8]" />
            <span>Cadastrar Primeiro Destino</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((dest) => {
            const relatedTrips = travels.filter(
              (t) => t.destination.toLowerCase() === dest.name.toLowerCase()
            );

            return (
              <div
                key={dest.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="h-40 bg-[#071A33] relative flex items-center justify-center overflow-hidden">
                    {dest.image ? (
                      <img src={dest.image} alt={dest.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-4">
                        <MapPin className="w-10 h-10 text-[#38BDF8] mx-auto mb-1" />
                        <span className="text-xs uppercase tracking-wider text-slate-300 font-semibold">
                          SonheTur Destino
                        </span>
                      </div>
                    )}

                    <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#071A33]/90 text-white border border-[#2D6FA3]/40">
                      {relatedTrips.length} {relatedTrips.length === 1 ? 'viagem' : 'viagens'}
                    </span>
                  </div>

                  <div className="p-6">
                    <h3 className="text-lg font-bold text-[#071A33] font-['Playfair_Display',serif]">
                      {dest.name}
                    </h3>
                    {dest.description && (
                      <p className="mt-2 text-xs text-slate-600 line-clamp-3 leading-relaxed">
                        {dest.description}
                      </p>
                    )}

                    {relatedTrips.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-slate-100">
                        <span className="text-[11px] font-bold text-slate-400 uppercase block mb-1">
                          Viagens vinculadas:
                        </span>
                        <ul className="text-xs text-[#2D6FA3] space-y-0.5">
                          {relatedTrips.slice(0, 2).map((t) => (
                            <li key={t.id} className="truncate">• {t.title}</li>
                          ))}
                          {relatedTrips.length > 2 && (
                            <li className="text-slate-400">+{relatedTrips.length - 2} outras</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => openEditModal(dest)}
                    className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 text-xs font-semibold inline-flex items-center gap-1"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Editar</span>
                  </button>

                  <button
                    onClick={() => handleDelete(dest.id, dest.name)}
                    className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 text-xs font-semibold inline-flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Excluir</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-[#071A33] font-['Playfair_Display',serif]">
                {editingDest ? 'Editar Destino' : 'Cadastrar Novo Destino'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nome do Destino *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Rio de Janeiro - RJ"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-[#2D6FA3] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Descrição do Destino
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Destaques turísticos, atrações e clima..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-[#2D6FA3] outline-none resize-y"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Foto do Destino
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="URL da foto ou upload"
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none"
                  />
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#071A33] text-white text-xs font-bold">
                    <Upload className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Upload</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
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
                  {isSubmitting ? 'Salvando...' : 'Salvar Destino'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
