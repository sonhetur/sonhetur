import { useState } from 'react';
import {
  PlusCircle,
  Edit,
  Trash2,
  Eye,
  Check,
  X,
  MapPin,
  Calendar,
  Users,
  Clock,
  Upload,
  AlertTriangle,
  FileCheck,
  Search,
} from 'lucide-react';
import type { Travel, Destination, TravelStatus } from '../../types/index.ts';
import { formatCurrency, formatDate } from '../../utils/formatters.ts';

interface TravelsManagerProps {
  travels: Travel[];
  destinations: Destination[];
  onCreateTravel: (travel: Partial<Travel>) => Promise<void>;
  onUpdateTravel: (id: string, travel: Partial<Travel>) => Promise<void>;
  onDeleteTravel: (id: string) => Promise<void>;
  onPreviewTravel: (travel: Travel) => void;
}

export default function TravelsManager({
  travels,
  destinations,
  onCreateTravel,
  onUpdateTravel,
  onDeleteTravel,
  onPreviewTravel,
}: TravelsManagerProps) {
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTravel, setEditingTravel] = useState<Travel | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [mainImage, setMainImage] = useState('');
  const [gallery, setGallery] = useState<string[]>([]);
  const [newGalleryUrl, setNewGalleryUrl] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [duration, setDuration] = useState('');
  const [boardingLocation, setBoardingLocation] = useState('Vale do Aço - MG');
  const [price, setPrice] = useState<number | string>('');
  const [vacancies, setVacancies] = useState<number | string>('');
  const [itinerary, setItinerary] = useState('');
  const [included, setIncluded] = useState<string[]>([]);
  const [newIncludedItem, setNewIncludedItem] = useState('');
  const [notIncluded, setNotIncluded] = useState<string[]>([]);
  const [newNotIncludedItem, setNewNotIncludedItem] = useState('');
  const [importantInfo, setImportantInfo] = useState('');
  const [paymentMethods, setPaymentMethods] = useState('');
  const [observations, setObservations] = useState('');
  const [status, setStatus] = useState<TravelStatus>('Rascunho');

  const openCreateModal = () => {
    setEditingTravel(null);
    setTitle('');
    setDestination(destinations.length > 0 ? destinations[0].name : '');
    setShortDescription('');
    setFullDescription('');
    setMainImage('');
    setGallery([]);
    setDepartureDate('');
    setReturnDate('');
    setDuration('');
    setBoardingLocation('Vale do Aço - MG');
    setPrice('');
    setVacancies('');
    setItinerary('');
    setIncluded([]);
    setNotIncluded([]);
    setImportantInfo('');
    setPaymentMethods('PIX, cartão de crédito parcelado ou boleto');
    setObservations('');
    setStatus('Rascunho');
    setIsModalOpen(true);
  };

  const openEditModal = (t: Travel) => {
    setEditingTravel(t);
    setTitle(t.title);
    setDestination(t.destination);
    setShortDescription(t.shortDescription || '');
    setFullDescription(t.fullDescription || '');
    setMainImage(t.mainImage || '');
    setGallery(t.gallery || []);
    setDepartureDate(t.departureDate || '');
    setReturnDate(t.returnDate || '');
    setDuration(t.duration || '');
    setBoardingLocation(t.boardingLocation || 'Vale do Aço - MG');
    setPrice(t.price || '');
    setVacancies(t.vacancies || '');
    setItinerary(t.itinerary || '');
    setIncluded(t.included || []);
    setNotIncluded(t.notIncluded || []);
    setImportantInfo(t.importantInfo || '');
    setPaymentMethods(t.paymentMethods || '');
    setObservations(t.observations || '');
    setStatus(t.status);
    setIsModalOpen(true);
  };

  // Image upload handler converting to base64 for ease of use
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isGallery = false) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (isGallery) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            setGallery(prev => [...prev, reader.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    } else {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setMainImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddIncluded = () => {
    if (!newIncludedItem.trim()) return;
    setIncluded([...included, newIncludedItem.trim()]);
    setNewIncludedItem('');
  };

  const handleRemoveIncluded = (index: number) => {
    setIncluded(included.filter((_, i) => i !== index));
  };

  const handleAddNotIncluded = () => {
    if (!newNotIncludedItem.trim()) return;
    setNotIncluded([...notIncluded, newNotIncludedItem.trim()]);
    setNewNotIncludedItem('');
  };

  const handleRemoveNotIncluded = (index: number) => {
    setNotIncluded(notIncluded.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !destination.trim()) {
      alert('Por favor, informe ao menos o título e o destino da viagem.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: Partial<Travel> = {
        title: title.trim(),
        destination: destination.trim(),
        shortDescription: shortDescription.trim(),
        fullDescription: fullDescription.trim(),
        mainImage: mainImage.trim() || undefined,
        gallery,
        departureDate,
        returnDate,
        duration: duration.trim(),
        boardingLocation: boardingLocation.trim(),
        price: Number(price) || 0,
        vacancies: Number(vacancies) || 0,
        itinerary: itinerary.trim(),
        included,
        notIncluded,
        importantInfo: importantInfo.trim(),
        paymentMethods: paymentMethods.trim(),
        observations: observations.trim(),
        status,
      };

      if (editingTravel) {
        await onUpdateTravel(editingTravel.id, payload);
      } else {
        await onCreateTravel(payload);
      }

      setIsModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar viagem.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickStatusChange = async (travel: Travel, newStatus: TravelStatus) => {
    try {
      await onUpdateTravel(travel.id, { status: newStatus });
    } catch (err: any) {
      alert(err.message || 'Erro ao alterar status.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await onDeleteTravel(id);
      setDeleteConfirmId(null);
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir viagem.');
    }
  };

  // Filtered travels
  const filtered = travels.filter((t) => {
    const matchesStatus = filterStatus === 'todos' || t.status === filterStatus;
    const matchesSearch =
      searchQuery === '' ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.destination.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-[#071A33] font-['Playfair_Display',serif]">
            Gerenciamento de Viagens
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Cadastre, edite, publique ou encerre viagens e excursões da SonheTur.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#2D6FA3] hover:bg-[#1b4b7c] text-white font-bold text-sm shadow transition-all"
        >
          <PlusCircle className="w-4 h-4 text-[#93C5FD]" />
          <span>+ Nova Viagem</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {['todos', 'Publicada', 'Rascunho', 'Encerrada'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                filterStatus === st
                  ? 'bg-[#071A33] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'todos' ? 'Todas as viagens' : st}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por título ou destino..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:border-[#2D6FA3] outline-none"
          />
        </div>
      </div>

      {/* Travels Table / List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {travels.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#071A33]/5 flex items-center justify-center mb-4">
              <Calendar className="w-8 h-8 text-[#2D6FA3]" />
            </div>
            <h3 className="text-lg font-bold text-[#071A33] font-['Playfair_Display',serif]">
              Nenhuma viagem cadastrada ainda
            </h3>
            <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
              Como regra de integridade, o sistema não contém viagens fictícias.
              Clique no botão abaixo para cadastrar a primeira viagem oficial da SonheTur.
            </p>
            <button
              onClick={openCreateModal}
              className="mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#071A33] hover:bg-[#2D6FA3] text-white text-xs font-bold transition-all shadow"
            >
              <PlusCircle className="w-4 h-4 text-[#38BDF8]" />
              <span>Cadastrar Viagem</span>
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-500">
            Nenhuma viagem corresponde aos filtros aplicados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#071A33] text-white text-xs uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-4 px-6">Viagem & Destino</th>
                  <th className="py-4 px-4">Datas</th>
                  <th className="py-4 px-4">Valor</th>
                  <th className="py-4 px-4">Vagas</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-6 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-[#071A33] overflow-hidden shrink-0 flex items-center justify-center">
                          {t.mainImage ? (
                            <img src={t.mainImage} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <MapPin className="w-5 h-5 text-[#38BDF8]" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-[#071A33] leading-snug">{t.title}</p>
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-[#2D6FA3]" />
                            <span>{t.destination}</span>
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-xs text-slate-600">
                      {t.departureDate ? (
                        <>
                          <span className="font-semibold block">{formatDate(t.departureDate)}</span>
                          {t.returnDate && <span className="text-slate-400">até {formatDate(t.returnDate)}</span>}
                        </>
                      ) : (
                        <span className="text-slate-400 italic">A definir</span>
                      )}
                    </td>

                    <td className="py-4 px-4 font-bold text-[#071A33] text-xs">
                      {t.price > 0 ? formatCurrency(t.price) : 'Consulte'}
                    </td>

                    <td className="py-4 px-4 text-xs">
                      <span className="font-semibold text-slate-700">{t.vacancies}</span>
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                          t.status === 'Publicada'
                            ? 'bg-emerald-100 text-emerald-800'
                            : t.status === 'Rascunho'
                            ? 'bg-sky-100 text-sky-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Status switcher */}
                        {t.status !== 'Publicada' ? (
                          <button
                            onClick={() => handleQuickStatusChange(t, 'Publicada')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold"
                            title="Publicar no site"
                          >
                            Publicar
                          </button>
                        ) : (
                          <button
                            onClick={() => handleQuickStatusChange(t, 'Rascunho')}
                            className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-[#2D6FA3] text-xs font-semibold"
                            title="Despublicar / Rascunho"
                          >
                            Rascunho
                          </button>
                        )}

                        <button
                          onClick={() => onPreviewTravel(t)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-[#071A33] hover:bg-slate-100"
                          title="Visualizar detalhes"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => openEditModal(t)}
                          className="p-1.5 rounded-lg text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setDeleteConfirmId(t.id)}
                          className="p-1.5 rounded-lg text-rose-600 hover:text-rose-800 hover:bg-rose-50"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#071A33] font-['Playfair_Display',serif]">
              Confirmar exclusão de viagem
            </h3>
            <p className="text-sm text-slate-600">
              Tem certeza de que deseja excluir permanentemente esta viagem? Esta ação não pode ser desfeita.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow"
              >
                Excluir Viagem
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Travel Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-4xl w-full border border-slate-200 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-xl font-bold text-[#071A33] font-['Playfair_Display',serif]">
                {editingTravel ? 'Editar Viagem' : 'Cadastrar Nova Viagem'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
              {/* Row 1: Title & Destination */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Título da Viagem *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Excursão Cabo Frio & Arraial do Cabo"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-[#2D6FA3] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Destino *
                  </label>
                  <input
                    type="text"
                    required
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="Ex: Cabo Frio - RJ"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-[#2D6FA3] outline-none"
                    list="destinations-datalist"
                  />
                  {destinations.length > 0 && (
                    <datalist id="destinations-datalist">
                      {destinations.map((d) => (
                        <option key={d.id} value={d.name} />
                      ))}
                    </datalist>
                  )}
                </div>
              </div>

              {/* Row 2: Short Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Descrição Curta (para o Card)
                </label>
                <input
                  type="text"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="Resumo em 1 ou 2 frases da viagem"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-[#2D6FA3] outline-none"
                />
              </div>

              {/* Row 3: Main Image & Upload */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Foto Principal da Viagem
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <input
                    type="text"
                    value={mainImage}
                    onChange={(e) => setMainImage(e.target.value)}
                    placeholder="Cole a URL da foto ou faça upload ao lado"
                    className="flex-1 px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm outline-none"
                  />
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#071A33] hover:bg-[#2D6FA3] text-white text-xs font-bold transition-colors">
                    <Upload className="w-3.5 h-3.5 text-[#38BDF8]" />
                    <span>Upload Foto</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e, false)}
                    />
                  </label>
                </div>
                {mainImage && (
                  <div className="w-32 h-20 rounded-lg overflow-hidden border border-slate-200">
                    <img src={mainImage} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Row 4: Dates, Duration, Boarding Location */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Data de Saída
                  </label>
                  <input
                    type="date"
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Data de Retorno
                  </label>
                  <input
                    type="date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Duração
                  </label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="Ex: 3 dias e 2 noites"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Local de Embarque
                  </label>
                  <input
                    type="text"
                    value={boardingLocation}
                    onChange={(e) => setBoardingLocation(e.target.value)}
                    placeholder="Ex: Ipatinga, Cel. Fabriciano"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none"
                  />
                </div>
              </div>

              {/* Row 5: Price, Vacancies, Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Preço por Pessoa (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Ex: 650.00"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Número de Vagas
                  </label>
                  <input
                    type="number"
                    value={vacancies}
                    onChange={(e) => setVacancies(e.target.value)}
                    placeholder="Ex: 40"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Status da Viagem *
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as TravelStatus)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none bg-white font-semibold"
                  >
                    <option value="Rascunho">Rascunho (Não visível no site)</option>
                    <option value="Publicada">Publicada (Visível no site)</option>
                    <option value="Encerrada">Encerrada</option>
                  </select>
                </div>
              </div>

              {/* Row 6: Full Description & Itinerary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Descrição Completa da Viagem
                  </label>
                  <textarea
                    rows={4}
                    value={fullDescription}
                    onChange={(e) => setFullDescription(e.target.value)}
                    placeholder="Detalhes sobre a hospedagem, atrações, pontos turísticos..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none resize-y"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Roteiro / Programação
                  </label>
                  <textarea
                    rows={4}
                    value={itinerary}
                    onChange={(e) => setItinerary(e.target.value)}
                    placeholder="Dia 1: Saída do Vale do Aço...&#10;Dia 2: Passeio de escuna..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none resize-y"
                  />
                </div>
              </div>

              {/* Row 7: Included & Not Included Dynamic Lists */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* O que está incluso */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="block text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">
                    O que está incluso
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      placeholder="Ex: Transporte rodoviário em ônibus leito"
                      value={newIncludedItem}
                      onChange={(e) => setNewIncludedItem(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddIncluded();
                        }
                      }}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddIncluded}
                      className="px-3 py-1.5 rounded-lg bg-emerald-700 text-white text-xs font-semibold"
                    >
                      Adicionar
                    </button>
                  </div>

                  <ul className="space-y-1.5 max-h-32 overflow-y-auto text-xs">
                    {included.map((item, idx) => (
                      <li key={idx} className="flex items-center justify-between p-1.5 bg-white rounded border border-slate-100">
                        <span className="truncate pr-2">✓ {item}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveIncluded(idx)}
                          className="text-rose-500 hover:text-rose-700"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* O que não está incluso */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="block text-xs font-bold text-rose-800 uppercase tracking-wider mb-2">
                    O que NÃO está incluso
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      placeholder="Ex: Bebidas e despesas extras"
                      value={newNotIncludedItem}
                      onChange={(e) => setNewNotIncludedItem(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddNotIncluded();
                        }
                      }}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddNotIncluded}
                      className="px-3 py-1.5 rounded-lg bg-rose-700 text-white text-xs font-semibold"
                    >
                      Adicionar
                    </button>
                  </div>

                  <ul className="space-y-1.5 max-h-32 overflow-y-auto text-xs">
                    {notIncluded.map((item, idx) => (
                      <li key={idx} className="flex items-center justify-between p-1.5 bg-white rounded border border-slate-100">
                        <span className="truncate pr-2">✕ {item}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveNotIncluded(idx)}
                          className="text-rose-500 hover:text-rose-700"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Row 8: Important Info & Payment Methods */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Informações Importantes & Observações
                  </label>
                  <textarea
                    rows={3}
                    value={importantInfo}
                    onChange={(e) => setImportantInfo(e.target.value)}
                    placeholder="Documentos obrigatórios para viagem, bagagem, horários..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none resize-y"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Formas de Pagamento
                  </label>
                  <textarea
                    rows={3}
                    value={paymentMethods}
                    onChange={(e) => setPaymentMethods(e.target.value)}
                    placeholder="Ex: Entrada de 30% + saldo no cartão em até 10x sem juros ou via PIX..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none resize-y"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#2D6FA3] hover:bg-[#1b4b7c] text-white font-bold text-xs shadow"
                >
                  <FileCheck className="w-4 h-4 text-[#93C5FD]" />
                  <span>{isSubmitting ? 'Salvando...' : 'Salvar Viagem'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
