import type {
  Travel,
  Destination,
  Banner,
  SiteSettings,
  InstitutionalContent,
  ContactRequest,
  ContactRequestStatus,
  AdminUser,
  PublicDataResponse,
  AdminDataResponse,
  DashboardStats,
} from '../types/index.ts';

const TOKEN_KEY = 'sonhetur_admin_token';
const OFFLINE_STORE_KEY = 'sonhetur_client_store_v1';

const defaultClientSettings: SiteSettings = {
  companyName: 'SonheTur',
  email: 'sonhetur@gmail.com',
  phone: '(31) 9912-6011',
  whatsapp: '(31) 9912-6011',
  region: 'Vale do Aço, Minas Gerais',
  instagram: '',
  facebook: '',
  address: '',
  businessHours: '',
};

const defaultClientContent: InstitutionalContent = {
  slogan: 'Viagens e experiências.',
  homeMainText:
    'Conectamos você aos melhores roteiros, praias e experiências turísticas com saída organizada da região do Vale do Aço, Minas Gerais.',
  aboutText:
    'A SonheTur atua no segmento de agência de viagens e turismo na região do Vale do Aço, Minas Gerais, com foco em excursões e experiências de viagem planejadas com organização e segurança.',
  mission: '',
  vision: '',
  values: '',
  differentials: '',
};

interface LocalClientStore {
  travels: Travel[];
  destinations: Destination[];
  banners: Banner[];
  settings: SiteSettings;
  content: InstitutionalContent;
  contacts: ContactRequest[];
  adminConfigured?: boolean;
  adminPasswordHash?: string;
}

function computeStats(travels: Travel[], contacts: ContactRequest[]): DashboardStats {
  return {
    publishedCount: travels.filter((t) => t.status === 'Publicada').length,
    draftCount: travels.filter((t) => t.status === 'Rascunho').length,
    closedCount: travels.filter((t) => t.status === 'Encerrada').length,
    contactRequestsCount: contacts.length,
  };
}

function getLocalStore(): LocalClientStore {
  try {
    const raw = localStorage.getItem(OFFLINE_STORE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        travels: Array.isArray(parsed.travels) ? parsed.travels : [],
        destinations: Array.isArray(parsed.destinations) ? parsed.destinations : [],
        banners: Array.isArray(parsed.banners) ? parsed.banners : [],
        settings: { ...defaultClientSettings, ...(parsed.settings || {}) },
        content: { ...defaultClientContent, ...(parsed.content || {}) },
        contacts: Array.isArray(parsed.contacts) ? parsed.contacts : [],
        adminConfigured: Boolean(parsed.adminConfigured),
        adminPasswordHash: parsed.adminPasswordHash || '',
      };
    }
  } catch {
    // fallback
  }
  return {
    travels: [],
    destinations: [],
    banners: [],
    settings: { ...defaultClientSettings },
    content: { ...defaultClientContent },
    contacts: [],
    adminConfigured: false,
    adminPasswordHash: '',
  };
}

function saveLocalStore(store: LocalClientStore): void {
  try {
    localStorage.setItem(OFFLINE_STORE_KEY, JSON.stringify(store));
  } catch {
    // ignore
  }
}

/**
 * Standard client-side SHA-256 hash for secure local admin authentication
 */
async function hashPasswordClient(password: string): Promise<string> {
  const salt = 'sonhetur_vale_do_aco_2026';
  try {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      const encoder = new TextEncoder();
      const data = encoder.encode(password + ':' + salt);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    }
  } catch {
    // subtle crypto fallback
  }
  let h = 0x811c9dc5;
  const str = password + ':' + salt;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return ('0000000' + (h >>> 0).toString(16)).slice(-8);
}

/**
 * Safe fetch helper that strictly checks for JSON response content-type
 * before attempting to parse. Prevents DOMException / SyntaxError:
 * "The string did not match the expected pattern" when hosted statically on GitHub Pages.
 */
async function safeFetchJson(url: string, options?: RequestInit): Promise<{ ok: boolean; status: number; data: any }> {
  try {
    const res = await fetch(url, options);
    const contentType = (res.headers.get('content-type') || '').toLowerCase();
    if (!contentType.includes('application/json')) {
      return { ok: false, status: res.status, data: null };
    }
    const text = await res.text();
    const trimmed = text.trim();
    if (!trimmed || (!trimmed.startsWith('{') && !trimmed.startsWith('['))) {
      return { ok: false, status: res.status, data: null };
    }
    const data = JSON.parse(trimmed);
    return { ok: res.ok, status: res.status, data };
  } catch {
    return { ok: false, status: 0, data: null };
  }
}

export interface IDataProvider {
  getPublicData(): Promise<PublicDataResponse>;
  sendContactRequest(req: {
    name: string;
    email: string;
    phone?: string;
    subject?: string;
    message: string;
    travelId?: string;
    travelTitle?: string;
  }): Promise<{ success: boolean; message: string }>;
  checkAuthStatus(): Promise<{ configured: boolean; email: string }>;
  setupInitialPassword(password: string): Promise<{ success: boolean; token: string; user: AdminUser }>;
  login(email: string, password: string): Promise<{ success: boolean; token: string; user: AdminUser }>;
  validateSession(): Promise<{ authenticated: boolean; user: AdminUser }>;
  getCurrentUser(): Promise<AdminUser | null>;
  logout(): Promise<void>;
  getAdminData(): Promise<AdminDataResponse>;
  createTravel(data: Partial<Travel>): Promise<Travel>;
  updateTravel(id: string, data: Partial<Travel>): Promise<Travel>;
  deleteTravel(id: string): Promise<void>;
  createDestination(data: Partial<Destination>): Promise<Destination>;
  updateDestination(id: string, data: Partial<Destination>): Promise<Destination>;
  deleteDestination(id: string): Promise<void>;
  createBanner(data: Partial<Banner>): Promise<Banner>;
  updateBanner(id: string, data: Partial<Banner>): Promise<Banner>;
  deleteBanner(id: string): Promise<void>;
  updateSettings(data: Partial<SiteSettings>): Promise<SiteSettings>;
  updateContent(data: Partial<InstitutionalContent>): Promise<InstitutionalContent>;
  updateContactStatus(id: string, status: ContactRequestStatus): Promise<ContactRequest>;
  deleteContact(id: string): Promise<void>;
  updatePassword(newPassword: string): Promise<void>;
  changePassword(currentPassword: string, newPassword: string): Promise<void>;
}

class RestApiDataProvider implements IDataProvider {
  private getAuthHeader(): Record<string, string> {
    const token = sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async getPublicData(): Promise<PublicDataResponse> {
    const apiRes = await safeFetchJson('/api/public/data');
    if (apiRes.ok && apiRes.data) {
      const store = getLocalStore();
      store.travels = apiRes.data.travels || store.travels;
      store.destinations = apiRes.data.destinations || store.destinations;
      store.banners = apiRes.data.banners || store.banners;
      store.settings = { ...store.settings, ...(apiRes.data.settings || {}) };
      store.content = { ...store.content, ...(apiRes.data.content || {}) };
      saveLocalStore(store);
      return apiRes.data;
    }

    // Static hosting fallback (e.g. GitHub Pages)
    const store = getLocalStore();
    return {
      travels: store.travels.filter((t) => t.status === 'Publicada'),
      destinations: store.destinations,
      banners: store.banners.filter((b) => b.active),
      settings: store.settings,
      content: store.content,
    };
  }

  async sendContactRequest(req: {
    name: string;
    email: string;
    phone?: string;
    subject?: string;
    message: string;
    travelId?: string;
    travelTitle?: string;
  }): Promise<{ success: boolean; message: string }> {
    const apiRes = await safeFetchJson('/api/public/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    if (apiRes.ok && apiRes.data) {
      return apiRes.data;
    }

    // Static hosting fallback
    const store = getLocalStore();
    const newContact: ContactRequest = {
      id: 'contact_' + Date.now(),
      name: req.name,
      email: req.email,
      phone: req.phone || '',
      subject: req.subject || 'Mensagem do Site',
      message: req.message,
      travelId: req.travelId,
      travelTitle: req.travelTitle,
      status: 'nova',
      createdAt: new Date().toISOString(),
    };
    store.contacts.unshift(newContact);
    saveLocalStore(store);

    return {
      success: true,
      message: 'Mensagem recebida com sucesso! Nossa equipe entrará em contato em breve.',
    };
  }

  async checkAuthStatus(): Promise<{ configured: boolean; email: string }> {
    const apiRes = await safeFetchJson('/api/auth/status');
    if (apiRes.ok && apiRes.data) {
      return apiRes.data;
    }

    // Static hosting check
    const store = getLocalStore();
    const hasPassword = Boolean(store.adminConfigured && store.adminPasswordHash);
    return {
      configured: hasPassword,
      email: 'sonhetur@gmail.com',
    };
  }

  async setupInitialPassword(password: string): Promise<{ success: boolean; token: string; user: AdminUser }> {
    const apiRes = await safeFetchJson('/api/auth/setup-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (apiRes.ok && apiRes.data && apiRes.data.token) {
      sessionStorage.setItem(TOKEN_KEY, apiRes.data.token);
      return apiRes.data;
    }
    if (apiRes.data && apiRes.data.error) {
      throw new Error(apiRes.data.error);
    }

    // Client-side initialization for static hosting
    const hash = await hashPasswordClient(password);
    const store = getLocalStore();
    store.adminConfigured = true;
    store.adminPasswordHash = hash;
    saveLocalStore(store);

    const token = 'client_token_' + Date.now();
    sessionStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(TOKEN_KEY, token);

    return {
      success: true,
      token,
      user: { email: 'sonhetur@gmail.com', role: 'admin' },
    };
  }

  async login(email: string, password: string): Promise<{ success: boolean; token: string; user: AdminUser }> {
    const apiRes = await safeFetchJson('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (apiRes.ok && apiRes.data && apiRes.data.token) {
      sessionStorage.setItem(TOKEN_KEY, apiRes.data.token);
      return apiRes.data;
    }
    if (apiRes.data && apiRes.data.error) {
      throw new Error(apiRes.data.error);
    }

    // Client-side authentication fallback (GitHub Pages)
    const store = getLocalStore();
    if (!store.adminConfigured || !store.adminPasswordHash) {
      throw new Error('Senha administrativa ainda não configurada no site. Por favor, crie sua senha de primeiro acesso.');
    }

    if (email.trim().toLowerCase() !== 'sonhetur@gmail.com') {
      throw new Error('E-mail administrativo não autorizado. Utilize sonhetur@gmail.com');
    }

    const calculatedHash = await hashPasswordClient(password);
    if (calculatedHash !== store.adminPasswordHash) {
      throw new Error('Senha incorreta. Verifique sua senha e tente novamente.');
    }

    const token = 'client_token_' + Date.now();
    sessionStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(TOKEN_KEY, token);

    return {
      success: true,
      token,
      user: { email: 'sonhetur@gmail.com', role: 'admin' },
    };
  }

  async validateSession(): Promise<{ authenticated: boolean; user: AdminUser }> {
    const token = sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
    if (!token) {
      return { authenticated: false, user: { email: '', role: '' } };
    }

    const apiRes = await safeFetchJson('/api/auth/me', {
      headers: this.getAuthHeader(),
    });
    if (apiRes.ok && apiRes.data && apiRes.data.user) {
      return { authenticated: true, user: apiRes.data.user };
    }

    if (token.startsWith('client_token_')) {
      const store = getLocalStore();
      if (store.adminConfigured) {
        return { authenticated: true, user: { email: 'sonhetur@gmail.com', role: 'admin' } };
      }
    }

    return { authenticated: false, user: { email: '', role: '' } };
  }

  async getCurrentUser(): Promise<AdminUser | null> {
    const res = await this.validateSession();
    return res.authenticated ? res.user : null;
  }

  async logout(): Promise<void> {
    try {
      await safeFetchJson('/api/auth/logout', {
        method: 'POST',
        headers: this.getAuthHeader(),
      });
    } catch {
      // ignore
    } finally {
      sessionStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(TOKEN_KEY);
    }
  }

  async getAdminData(): Promise<AdminDataResponse> {
    const apiRes = await safeFetchJson('/api/admin/data', {
      headers: this.getAuthHeader(),
    });
    if (apiRes.ok && apiRes.data) {
      const serverContacts = apiRes.data.contacts || apiRes.data.contactRequests || [];
      const stats = apiRes.data.stats || computeStats(apiRes.data.travels || [], serverContacts);
      const serverData: AdminDataResponse = {
        travels: apiRes.data.travels || [],
        destinations: apiRes.data.destinations || [],
        banners: apiRes.data.banners || [],
        settings: apiRes.data.settings || defaultClientSettings,
        content: apiRes.data.content || defaultClientContent,
        contacts: serverContacts,
        contactRequests: serverContacts,
        stats,
      };
      const store = getLocalStore();
      store.travels = serverData.travels || store.travels;
      store.destinations = serverData.destinations || store.destinations;
      store.banners = serverData.banners || store.banners;
      store.settings = { ...store.settings, ...(serverData.settings || {}) };
      store.content = { ...store.content, ...(serverData.content || {}) };
      store.contacts = serverData.contacts || store.contacts;
      saveLocalStore(store);
      return serverData;
    }

    if (apiRes.status === 401) {
      sessionStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(TOKEN_KEY);
      throw new Error('UNAUTHORIZED');
    }

    // Static hosting store
    const store = getLocalStore();
    const stats = computeStats(store.travels, store.contacts);
    return {
      travels: store.travels,
      destinations: store.destinations,
      banners: store.banners,
      settings: store.settings,
      content: store.content,
      contacts: store.contacts || [],
      contactRequests: store.contacts || [],
      stats,
    };
  }

  async createTravel(data: Partial<Travel>): Promise<Travel> {
    const apiRes = await safeFetchJson('/api/admin/travels', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    if (apiRes.ok && apiRes.data && apiRes.data.travel) {
      const store = getLocalStore();
      store.travels.unshift(apiRes.data.travel);
      saveLocalStore(store);
      return apiRes.data.travel;
    }
    if (apiRes.data && apiRes.data.error) {
      throw new Error(apiRes.data.error);
    }

    const store = getLocalStore();
    const newTravel: Travel = {
      id: 'travel_' + Date.now(),
      title: data.title || 'Nova Viagem',
      destination: data.destination || '',
      shortDescription: data.shortDescription || '',
      fullDescription: data.fullDescription || '',
      mainImage: data.mainImage || '',
      gallery: data.gallery || [],
      departureDate: data.departureDate || '',
      returnDate: data.returnDate || '',
      duration: data.duration || '',
      boardingLocation: data.boardingLocation || '',
      price: data.price || 0,
      vacancies: data.vacancies || 0,
      itinerary: data.itinerary || '',
      included: data.included || [],
      notIncluded: data.notIncluded || [],
      importantInfo: data.importantInfo || '',
      paymentMethods: data.paymentMethods || '',
      observations: data.observations || '',
      status: data.status || 'Rascunho',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.travels.unshift(newTravel);
    saveLocalStore(store);
    return newTravel;
  }

  async updateTravel(id: string, data: Partial<Travel>): Promise<Travel> {
    const apiRes = await safeFetchJson(`/api/admin/travels/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    if (apiRes.ok && apiRes.data && apiRes.data.travel) {
      const store = getLocalStore();
      store.travels = store.travels.map((t) => (t.id === id ? apiRes.data.travel : t));
      saveLocalStore(store);
      return apiRes.data.travel;
    }
    if (apiRes.data && apiRes.data.error) {
      throw new Error(apiRes.data.error);
    }

    const store = getLocalStore();
    const index = store.travels.findIndex((t) => t.id === id);
    if (index === -1) {
      throw new Error('Viagem não encontrada.');
    }
    const updated: Travel = {
      ...store.travels[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    store.travels[index] = updated;
    saveLocalStore(store);
    return updated;
  }

  async deleteTravel(id: string): Promise<void> {
    const apiRes = await safeFetchJson(`/api/admin/travels/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeader(),
    });
    if (apiRes.data && apiRes.data.error && !apiRes.ok) {
      throw new Error(apiRes.data.error);
    }
    const store = getLocalStore();
    store.travels = store.travels.filter((t) => t.id !== id);
    saveLocalStore(store);
  }

  async createDestination(data: Partial<Destination>): Promise<Destination> {
    const apiRes = await safeFetchJson('/api/admin/destinations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    if (apiRes.ok && apiRes.data && apiRes.data.destination) {
      const store = getLocalStore();
      store.destinations.unshift(apiRes.data.destination);
      saveLocalStore(store);
      return apiRes.data.destination;
    }
    if (apiRes.data && apiRes.data.error) {
      throw new Error(apiRes.data.error);
    }

    const store = getLocalStore();
    const newDest: Destination = {
      id: 'dest_' + Date.now(),
      name: data.name || '',
      description: data.description || '',
      image: data.image || '',
      createdAt: new Date().toISOString(),
    };
    store.destinations.unshift(newDest);
    saveLocalStore(store);
    return newDest;
  }

  async updateDestination(id: string, data: Partial<Destination>): Promise<Destination> {
    const apiRes = await safeFetchJson(`/api/admin/destinations/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    if (apiRes.ok && apiRes.data && apiRes.data.destination) {
      const store = getLocalStore();
      store.destinations = store.destinations.map((d) => (d.id === id ? apiRes.data.destination : d));
      saveLocalStore(store);
      return apiRes.data.destination;
    }
    if (apiRes.data && apiRes.data.error) {
      throw new Error(apiRes.data.error);
    }

    const store = getLocalStore();
    const index = store.destinations.findIndex((d) => d.id === id);
    if (index === -1) {
      throw new Error('Destino não encontrado.');
    }
    const updated: Destination = { ...store.destinations[index], ...data };
    store.destinations[index] = updated;
    saveLocalStore(store);
    return updated;
  }

  async deleteDestination(id: string): Promise<void> {
    const apiRes = await safeFetchJson(`/api/admin/destinations/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeader(),
    });
    if (apiRes.data && apiRes.data.error && !apiRes.ok) {
      throw new Error(apiRes.data.error);
    }
    const store = getLocalStore();
    store.destinations = store.destinations.filter((d) => d.id !== id);
    saveLocalStore(store);
  }

  async createBanner(data: Partial<Banner>): Promise<Banner> {
    const apiRes = await safeFetchJson('/api/admin/banners', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    if (apiRes.ok && apiRes.data && apiRes.data.banner) {
      const store = getLocalStore();
      store.banners.unshift(apiRes.data.banner);
      saveLocalStore(store);
      return apiRes.data.banner;
    }
    if (apiRes.data && apiRes.data.error) {
      throw new Error(apiRes.data.error);
    }

    const store = getLocalStore();
    const newBanner: Banner = {
      id: 'banner_' + Date.now(),
      title: data.title || '',
      subtitle: data.subtitle || '',
      image: data.image || '',
      buttonText: data.buttonText || '',
      buttonLink: data.buttonLink || '',
      active: data.active !== undefined ? data.active : true,
      order: data.order || store.banners.length + 1,
      createdAt: new Date().toISOString(),
    };
    store.banners.unshift(newBanner);
    saveLocalStore(store);
    return newBanner;
  }

  async updateBanner(id: string, data: Partial<Banner>): Promise<Banner> {
    const apiRes = await safeFetchJson(`/api/admin/banners/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    if (apiRes.ok && apiRes.data && apiRes.data.banner) {
      const store = getLocalStore();
      store.banners = store.banners.map((b) => (b.id === id ? apiRes.data.banner : b));
      saveLocalStore(store);
      return apiRes.data.banner;
    }
    if (apiRes.data && apiRes.data.error) {
      throw new Error(apiRes.data.error);
    }

    const store = getLocalStore();
    const index = store.banners.findIndex((b) => b.id === id);
    if (index === -1) throw new Error('Banner não encontrado.');
    const updated: Banner = { ...store.banners[index], ...data };
    store.banners[index] = updated;
    saveLocalStore(store);
    return updated;
  }

  async deleteBanner(id: string): Promise<void> {
    const apiRes = await safeFetchJson(`/api/admin/banners/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeader(),
    });
    if (apiRes.data && apiRes.data.error && !apiRes.ok) {
      throw new Error(apiRes.data.error);
    }
    const store = getLocalStore();
    store.banners = store.banners.filter((b) => b.id !== id);
    saveLocalStore(store);
  }

  async updateSettings(data: Partial<SiteSettings>): Promise<SiteSettings> {
    const apiRes = await safeFetchJson('/api/admin/settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    if (apiRes.ok && apiRes.data && apiRes.data.settings) {
      const store = getLocalStore();
      store.settings = apiRes.data.settings;
      saveLocalStore(store);
      return apiRes.data.settings;
    }
    if (apiRes.data && apiRes.data.error) {
      throw new Error(apiRes.data.error);
    }

    const store = getLocalStore();
    store.settings = { ...store.settings, ...data };
    saveLocalStore(store);
    return store.settings;
  }

  async updateContent(data: Partial<InstitutionalContent>): Promise<InstitutionalContent> {
    const apiRes = await safeFetchJson('/api/admin/content', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    if (apiRes.ok && apiRes.data && apiRes.data.content) {
      const store = getLocalStore();
      store.content = apiRes.data.content;
      saveLocalStore(store);
      return apiRes.data.content;
    }
    if (apiRes.data && apiRes.data.error) {
      throw new Error(apiRes.data.error);
    }

    const store = getLocalStore();
    store.content = { ...store.content, ...data };
    saveLocalStore(store);
    return store.content;
  }

  async updateContactStatus(id: string, status: ContactRequestStatus): Promise<ContactRequest> {
    const apiRes = await safeFetchJson(`/api/admin/contacts/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
      body: JSON.stringify({ status }),
    });
    if (apiRes.ok && apiRes.data && apiRes.data.contact) {
      const store = getLocalStore();
      store.contacts = store.contacts.map((c) => (c.id === id ? apiRes.data.contact : c));
      saveLocalStore(store);
      return apiRes.data.contact;
    }
    if (apiRes.data && apiRes.data.error) {
      throw new Error(apiRes.data.error);
    }

    const store = getLocalStore();
    const index = store.contacts.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('Contato não encontrado.');
    const updated: ContactRequest = { ...store.contacts[index], status };
    store.contacts[index] = updated;
    saveLocalStore(store);
    return updated;
  }

  async deleteContact(id: string): Promise<void> {
    const apiRes = await safeFetchJson(`/api/admin/contacts/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeader(),
    });
    if (apiRes.data && apiRes.data.error && !apiRes.ok) {
      throw new Error(apiRes.data.error);
    }
    const store = getLocalStore();
    store.contacts = store.contacts.filter((c) => c.id !== id);
    saveLocalStore(store);
  }

  async updatePassword(newPassword: string): Promise<void> {
    const apiRes = await safeFetchJson('/api/admin/password', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
      body: JSON.stringify({ newPassword }),
    });
    if (apiRes.ok) return;
    if (apiRes.data && apiRes.data.error) throw new Error(apiRes.data.error);

    const store = getLocalStore();
    store.adminPasswordHash = await hashPasswordClient(newPassword);
    store.adminConfigured = true;
    saveLocalStore(store);
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const apiRes = await safeFetchJson('/api/admin/password', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    if (apiRes.ok) return;
    if (apiRes.data && apiRes.data.error) throw new Error(apiRes.data.error);

    const store = getLocalStore();
    if (store.adminPasswordHash) {
      const currentHash = await hashPasswordClient(currentPassword);
      if (currentHash !== store.adminPasswordHash) {
        throw new Error('Senha atual incorreta.');
      }
    }
    store.adminPasswordHash = await hashPasswordClient(newPassword);
    store.adminConfigured = true;
    saveLocalStore(store);
  }
}

export const dataProvider: IDataProvider = new RestApiDataProvider();
