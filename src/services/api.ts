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
  slogan: 'Seu próximo destino começa aqui.',
  homeMainText: 'Descubra novas experiências e encontre sua próxima viagem com a SonheTur.',
  aboutText: 'A SonheTur atua no segmento de agência de viagens e turismo na região do Vale do Aço, Minas Gerais, com foco em excursões e experiências de viagem planejadas com organização e segurança.',
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
}

function getLocalStore(): LocalClientStore {
  try {
    const raw = localStorage.getItem(OFFLINE_STORE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        travels: parsed.travels || [],
        destinations: parsed.destinations || [],
        banners: parsed.banners || [],
        settings: { ...defaultClientSettings, ...(parsed.settings || {}) },
        content: { ...defaultClientContent, ...(parsed.content || {}) },
        contacts: parsed.contacts || [],
        adminConfigured: parsed.adminConfigured ?? false,
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
  };
}

function saveLocalStore(store: LocalClientStore): void {
  try {
    localStorage.setItem(OFFLINE_STORE_KEY, JSON.stringify(store));
  } catch {
    // ignore
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
    try {
      const res = await fetch('/api/public/data');
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback to local offline store when hosted statically (e.g. GitHub Pages)
    }

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
    try {
      const res = await fetch('/api/public/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback for static deployment
    }

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
    const res = await fetch('/api/auth/status');
    if (!res.ok) {
      throw new Error('Falha ao verificar status de autenticação.');
    }
    return res.json();
  }

  async setupInitialPassword(password: string): Promise<{ success: boolean; token: string; user: AdminUser }> {
    const res = await fetch('/api/auth/setup-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Erro ao configurar senha.');
    }
    sessionStorage.setItem(TOKEN_KEY, data.token);
    return data;
  }

  async login(email: string, password: string): Promise<{ success: boolean; token: string; user: AdminUser }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Falha ao realizar login.');
    }
    sessionStorage.setItem(TOKEN_KEY, data.token);
    return data;
  }

  async validateSession(): Promise<{ authenticated: boolean; user: AdminUser }> {
    const token = sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
    if (!token) {
      return { authenticated: false, user: { email: '', role: '' } };
    }
    try {
      const res = await fetch('/api/auth/me', {
        headers: this.getAuthHeader(),
      });
      if (!res.ok) {
        sessionStorage.removeItem(TOKEN_KEY);
        return { authenticated: false, user: { email: '', role: '' } };
      }
      const data = await res.json();
      return { authenticated: true, user: data.user };
    } catch {
      return { authenticated: false, user: { email: '', role: '' } };
    }
  }

  async getCurrentUser(): Promise<AdminUser | null> {
    const res = await this.validateSession();
    return res.authenticated ? res.user : null;
  }

  async logout(): Promise<void> {
    try {
      await fetch('/api/auth/logout', {
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
    const res = await fetch('/api/admin/data', {
      headers: this.getAuthHeader(),
    });
    if (!res.ok) {
      if (res.status === 401) {
        sessionStorage.removeItem(TOKEN_KEY);
        throw new Error('UNAUTHORIZED');
      }
      throw new Error('Falha ao carregar painel administrativo.');
    }
    const data = await res.json();
    return {
      ...data,
      contactRequests: data.contacts || [],
    };
  }

  async createTravel(data: Partial<Travel>): Promise<Travel> {
    const res = await fetch('/api/admin/travels', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Erro ao criar viagem.');
    return result.travel;
  }

  async updateTravel(id: string, data: Partial<Travel>): Promise<Travel> {
    const res = await fetch(`/api/admin/travels/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Erro ao atualizar viagem.');
    return result.travel;
  }

  async deleteTravel(id: string): Promise<void> {
    const res = await fetch(`/api/admin/travels/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeader(),
    });
    if (!res.ok) {
      const result = await res.json();
      throw new Error(result.error || 'Erro ao excluir viagem.');
    }
  }

  async createDestination(data: Partial<Destination>): Promise<Destination> {
    const res = await fetch('/api/admin/destinations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Erro ao criar destino.');
    return result.destination;
  }

  async updateDestination(id: string, data: Partial<Destination>): Promise<Destination> {
    const res = await fetch(`/api/admin/destinations/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Erro ao atualizar destino.');
    return result.destination;
  }

  async deleteDestination(id: string): Promise<void> {
    const res = await fetch(`/api/admin/destinations/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeader(),
    });
    if (!res.ok) {
      const result = await res.json();
      throw new Error(result.error || 'Erro ao excluir destino.');
    }
  }

  async createBanner(data: Partial<Banner>): Promise<Banner> {
    const res = await fetch('/api/admin/banners', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Erro ao criar banner.');
    return result.banner;
  }

  async updateBanner(id: string, data: Partial<Banner>): Promise<Banner> {
    const res = await fetch(`/api/admin/banners/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Erro ao atualizar banner.');
    return result.banner;
  }

  async deleteBanner(id: string): Promise<void> {
    const res = await fetch(`/api/admin/banners/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeader(),
    });
    if (!res.ok) {
      const result = await res.json();
      throw new Error(result.error || 'Erro ao excluir banner.');
    }
  }

  async updateSettings(data: Partial<SiteSettings>): Promise<SiteSettings> {
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Erro ao atualizar configurações.');
    return result.settings;
  }

  async updateContent(data: Partial<InstitutionalContent>): Promise<InstitutionalContent> {
    const res = await fetch('/api/admin/content', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Erro ao atualizar conteúdo.');
    return result.content;
  }

  async updateContactStatus(id: string, status: ContactRequestStatus): Promise<ContactRequest> {
    const res = await fetch(`/api/admin/contacts/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
      body: JSON.stringify({ status }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Erro ao atualizar contato.');
    return result.contact;
  }

  async deleteContact(id: string): Promise<void> {
    const res = await fetch(`/api/admin/contacts/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeader(),
    });
    if (!res.ok) {
      const result = await res.json();
      throw new Error(result.error || 'Erro ao excluir contato.');
    }
  }

  async updatePassword(newPassword: string): Promise<void> {
    const res = await fetch('/api/admin/password', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
      body: JSON.stringify({ newPassword }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Erro ao alterar senha.');
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const res = await fetch('/api/admin/password', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Erro ao alterar senha.');
  }
}

export const dataProvider: IDataProvider = new RestApiDataProvider();
