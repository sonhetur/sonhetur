import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import type {
  Travel,
  Destination,
  Banner,
  SiteSettings,
  InstitutionalContent,
  ContactRequest,
} from './src/types/index.ts';

dotenv.config();

const PORT = 3000;
const DATA_DIR = path.join(process.cwd(), 'data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');

// Interface for persistent store
interface StoreData {
  travels: Travel[];
  destinations: Destination[];
  banners: Banner[];
  settings: SiteSettings;
  content: InstitutionalContent;
  contacts: ContactRequest[];
  adminHashedPassword?: string;
  adminSalt?: string;
}

// Initial defaults adhering strictly to user requirements:
// NO fake trips, NO fake destinations, NO fake reviews, NO fake dates/prices.
const defaultStore: StoreData = {
  travels: [],
  destinations: [],
  banners: [],
  settings: {
    companyName: 'SonheTur',
    email: 'sonhetur@gmail.com',
    phone: '(31) 9912-6011',
    whatsapp: '(31) 9912-6011',
    region: 'Vale do Aço, Minas Gerais',
    instagram: '',
    facebook: '',
    address: '',
    businessHours: '',
  },
  content: {
    slogan: 'Seu próximo destino começa aqui.',
    homeMainText: 'Descubra novas experiências e encontre sua próxima viagem com a SonheTur.',
    aboutText: 'A SonheTur atua no segmento de agência de viagens e turismo na região do Vale do Aço, Minas Gerais, com foco em excursões e experiências de viagem planejadas com organização e segurança.',
    mission: '',
    vision: '',
    values: '',
    differentials: '',
  },
  contacts: [],
};

// Ensure data folder and store file exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadStore(): StoreData {
  try {
    if (fs.existsSync(STORE_FILE)) {
      const content = fs.readFileSync(STORE_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      return {
        ...defaultStore,
        ...parsed,
        settings: { ...defaultStore.settings, ...(parsed.settings || {}) },
        content: { ...defaultStore.content, ...(parsed.content || {}) },
      };
    }
  } catch (err) {
    console.error('Error reading store file, using defaults:', err);
  }
  saveStore(defaultStore);
  return defaultStore;
}

function saveStore(data: StoreData): void {
  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving store:', err);
  }
}

// Security: Password hashing with SHA-256 + salt
function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

// Active sessions in memory
const activeSessions = new Set<string>();
const JWT_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');

function generateSessionToken(email: string): string {
  const payload = `${email}:${Date.now()}:${crypto.randomBytes(16).toString('hex')}`;
  const hmac = crypto.createHmac('sha256', JWT_SECRET).update(payload).digest('hex');
  const token = Buffer.from(`${payload}:${hmac}`).toString('base64');
  activeSessions.add(token);
  return token;
}

function verifySessionToken(token: string): boolean {
  if (!token || !activeSessions.has(token)) return false;
  try {
    const raw = Buffer.from(token, 'base64').toString('utf-8');
    const parts = raw.split(':');
    if (parts.length < 4) return false;
    const [email, timestamp, randomHex, receivedHmac] = parts;
    const payload = `${email}:${timestamp}:${randomHex}`;
    const expectedHmac = crypto.createHmac('sha256', JWT_SECRET).update(payload).digest('hex');
    return expectedHmac === receivedHmac;
  } catch {
    return false;
  }
}

// Middleware to authenticate admin requests
function requireAdminAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Acesso não autorizado. Faça login como administrador.' });
    return;
  }
  const token = authHeader.substring(7);
  if (!verifySessionToken(token)) {
    res.status(401).json({ error: 'Sessão inválida ou expirada. Faça login novamente.' });
    return;
  }
  next();
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  // ==========================================
  // AUTH ROUTES
  // ==========================================

  // Check auth configuration status
  app.get('/api/auth/status', (req, res) => {
    const store = loadStore();
    const envPassword = process.env.ADMIN_PASSWORD;
    const hasConfiguredPassword = Boolean(envPassword || (store.adminHashedPassword && store.adminSalt));
    res.json({
      configured: hasConfiguredPassword,
      email: 'sonhetur@gmail.com',
      source: envPassword ? 'env' : store.adminHashedPassword ? 'saved' : 'unconfigured',
    });
  });

  // Login endpoint
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
      return;
    }

    if (email.trim().toLowerCase() !== 'sonhetur@gmail.com') {
      res.status(401).json({ error: 'E-mail administrativo não autorizado.' });
      return;
    }

    const envPassword = process.env.ADMIN_PASSWORD;
    const store = loadStore();

    let isValid = false;

    // Check environment variable first
    if (envPassword && envPassword.length > 0) {
      isValid = password === envPassword;
    } else if (store.adminHashedPassword && store.adminSalt) {
      // Check saved hashed password
      const calculatedHash = hashPassword(password, store.adminSalt);
      isValid = calculatedHash === store.adminHashedPassword;
    } else {
      res.status(400).json({
        error: 'Senha administrativa ainda não configurada no servidor. Defina a variável ADMIN_PASSWORD no .env ou realize a configuração inicial.',
        needsSetup: true,
      });
      return;
    }

    if (!isValid) {
      res.status(401).json({ error: 'Senha incorreta.' });
      return;
    }

    const token = generateSessionToken(email);
    res.json({
      success: true,
      token,
      user: {
        email: 'sonhetur@gmail.com',
        role: 'admin',
      },
    });
  });

  // First time setup or password setup if unconfigured
  app.post('/api/auth/setup-password', (req, res) => {
    const { password } = req.body;
    if (!password || password.length < 6) {
      res.status(400).json({ error: 'A senha deve conter no mínimo 6 caracteres.' });
      return;
    }

    const store = loadStore();
    const envPassword = process.env.ADMIN_PASSWORD;

    // If already configured and has no auth token, block
    if (envPassword || (store.adminHashedPassword && store.adminSalt)) {
      res.status(403).json({ error: 'A senha administrativa já está configurada.' });
      return;
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const hash = hashPassword(password, salt);

    store.adminHashedPassword = hash;
    store.adminSalt = salt;
    saveStore(store);

    const token = generateSessionToken('sonhetur@gmail.com');
    res.json({
      success: true,
      message: 'Senha administrativa configurada com sucesso.',
      token,
      user: { email: 'sonhetur@gmail.com', role: 'admin' },
    });
  });

  // Validate active token
  app.get('/api/auth/me', requireAdminAuth, (req, res) => {
    res.json({
      authenticated: true,
      user: {
        email: 'sonhetur@gmail.com',
        role: 'admin',
      },
    });
  });

  // Logout
  app.post('/api/auth/logout', (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      activeSessions.delete(token);
    }
    res.json({ success: true });
  });

  // Change password (protected)
  app.put('/api/admin/password', requireAdminAuth, (req, res) => {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      res.status(400).json({ error: 'A nova senha deve ter no mínimo 6 caracteres.' });
      return;
    }

    const store = loadStore();
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = hashPassword(newPassword, salt);

    store.adminHashedPassword = hash;
    store.adminSalt = salt;
    saveStore(store);

    res.json({ success: true, message: 'Senha administrativa atualizada com sucesso.' });
  });

  // ==========================================
  // PUBLIC ROUTES
  // ==========================================

  // Public data: Only returns published travels, active banners, public settings & content
  app.get('/api/public/data', (req, res) => {
    const store = loadStore();
    const publishedTravels = store.travels.filter(t => t.status === 'Publicada');
    const activeBanners = store.banners
      .filter(b => b.active)
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    res.json({
      travels: publishedTravels,
      destinations: store.destinations,
      banners: activeBanners,
      settings: store.settings,
      content: store.content,
    });
  });

  // Public contact submission
  app.post('/api/public/contact', (req, res) => {
    const { name, email, phone, subject, message, travelId, travelTitle } = req.body;
    if (!name || !email || !message) {
      res.status(400).json({ error: 'Nome, e-mail e mensagem são obrigatórios.' });
      return;
    }

    const store = loadStore();
    const newContact: ContactRequest = {
      id: crypto.randomUUID(),
      name: String(name).trim(),
      email: String(email).trim(),
      phone: phone ? String(phone).trim() : undefined,
      subject: subject ? String(subject).trim() : undefined,
      message: String(message).trim(),
      travelId: travelId ? String(travelId) : undefined,
      travelTitle: travelTitle ? String(travelTitle) : undefined,
      status: 'nova',
      createdAt: new Date().toISOString(),
    };

    store.contacts.unshift(newContact);
    saveStore(store);

    res.status(201).json({ success: true, message: 'Mensagem enviada com sucesso!' });
  });

  // ==========================================
  // PROTECTED ADMIN ROUTES
  // ==========================================

  // Full administrative data bundle
  app.get('/api/admin/data', requireAdminAuth, (req, res) => {
    const store = loadStore();
    const publishedCount = store.travels.filter(t => t.status === 'Publicada').length;
    const draftCount = store.travels.filter(t => t.status === 'Rascunho').length;
    const closedCount = store.travels.filter(t => t.status === 'Encerrada').length;
    const contactRequestsCount = store.contacts.length;

    res.json({
      travels: store.travels,
      destinations: store.destinations,
      banners: store.banners,
      settings: store.settings,
      content: store.content,
      contacts: store.contacts,
      stats: {
        publishedCount,
        draftCount,
        closedCount,
        contactRequestsCount,
      },
    });
  });

  // --- Travels CRUD ---
  app.post('/api/admin/travels', requireAdminAuth, (req, res) => {
    const body = req.body;
    if (!body.title || !body.destination) {
      res.status(400).json({ error: 'Título e destino são obrigatórios.' });
      return;
    }

    const store = loadStore();
    const now = new Date().toISOString();
    const newTravel: Travel = {
      id: crypto.randomUUID(),
      title: body.title.trim(),
      destination: body.destination.trim(),
      shortDescription: body.shortDescription || '',
      fullDescription: body.fullDescription || '',
      mainImage: body.mainImage || undefined,
      gallery: Array.isArray(body.gallery) ? body.gallery : [],
      departureDate: body.departureDate || '',
      returnDate: body.returnDate || '',
      duration: body.duration || '',
      boardingLocation: body.boardingLocation || 'Vale do Aço - MG',
      price: Number(body.price) || 0,
      vacancies: Number(body.vacancies) || 0,
      itinerary: body.itinerary || '',
      included: Array.isArray(body.included) ? body.included : [],
      notIncluded: Array.isArray(body.notIncluded) ? body.notIncluded : [],
      importantInfo: body.importantInfo || '',
      paymentMethods: body.paymentMethods || '',
      observations: body.observations || '',
      status: body.status || 'Rascunho',
      createdAt: now,
      updatedAt: now,
    };

    store.travels.unshift(newTravel);
    saveStore(store);

    res.status(201).json({ success: true, travel: newTravel });
  });

  app.put('/api/admin/travels/:id', requireAdminAuth, (req, res) => {
    const { id } = req.params;
    const body = req.body;
    const store = loadStore();
    const index = store.travels.findIndex(t => t.id === id);

    if (index === -1) {
      res.status(404).json({ error: 'Viagem não encontrada.' });
      return;
    }

    const current = store.travels[index];
    const updated: Travel = {
      ...current,
      title: body.title !== undefined ? body.title.trim() : current.title,
      destination: body.destination !== undefined ? body.destination.trim() : current.destination,
      shortDescription: body.shortDescription !== undefined ? body.shortDescription : current.shortDescription,
      fullDescription: body.fullDescription !== undefined ? body.fullDescription : current.fullDescription,
      mainImage: body.mainImage !== undefined ? body.mainImage : current.mainImage,
      gallery: Array.isArray(body.gallery) ? body.gallery : current.gallery,
      departureDate: body.departureDate !== undefined ? body.departureDate : current.departureDate,
      returnDate: body.returnDate !== undefined ? body.returnDate : current.returnDate,
      duration: body.duration !== undefined ? body.duration : current.duration,
      boardingLocation: body.boardingLocation !== undefined ? body.boardingLocation : current.boardingLocation,
      price: body.price !== undefined ? Number(body.price) : current.price,
      vacancies: body.vacancies !== undefined ? Number(body.vacancies) : current.vacancies,
      itinerary: body.itinerary !== undefined ? body.itinerary : current.itinerary,
      included: Array.isArray(body.included) ? body.included : current.included,
      notIncluded: Array.isArray(body.notIncluded) ? body.notIncluded : current.notIncluded,
      importantInfo: body.importantInfo !== undefined ? body.importantInfo : current.importantInfo,
      paymentMethods: body.paymentMethods !== undefined ? body.paymentMethods : current.paymentMethods,
      observations: body.observations !== undefined ? body.observations : current.observations,
      status: body.status !== undefined ? body.status : current.status,
      updatedAt: new Date().toISOString(),
    };

    store.travels[index] = updated;
    saveStore(store);

    res.json({ success: true, travel: updated });
  });

  app.delete('/api/admin/travels/:id', requireAdminAuth, (req, res) => {
    const { id } = req.params;
    const store = loadStore();
    const index = store.travels.findIndex(t => t.id === id);
    if (index === -1) {
      res.status(404).json({ error: 'Viagem não encontrada.' });
      return;
    }

    store.travels.splice(index, 1);
    saveStore(store);

    res.json({ success: true, message: 'Viagem excluída com sucesso.' });
  });

  // --- Destinations CRUD ---
  app.post('/api/admin/destinations', requireAdminAuth, (req, res) => {
    const { name, description, image } = req.body;
    if (!name) {
      res.status(400).json({ error: 'Nome do destino é obrigatório.' });
      return;
    }

    const store = loadStore();
    const newDest: Destination = {
      id: crypto.randomUUID(),
      name: name.trim(),
      description: description || '',
      image: image || undefined,
      createdAt: new Date().toISOString(),
    };

    store.destinations.push(newDest);
    saveStore(store);

    res.status(201).json({ success: true, destination: newDest });
  });

  app.put('/api/admin/destinations/:id', requireAdminAuth, (req, res) => {
    const { id } = req.params;
    const { name, description, image } = req.body;
    const store = loadStore();
    const dest = store.destinations.find(d => d.id === id);

    if (!dest) {
      res.status(404).json({ error: 'Destino não encontrado.' });
      return;
    }

    if (name !== undefined) dest.name = name.trim();
    if (description !== undefined) dest.description = description;
    if (image !== undefined) dest.image = image;

    saveStore(store);
    res.json({ success: true, destination: dest });
  });

  app.delete('/api/admin/destinations/:id', requireAdminAuth, (req, res) => {
    const { id } = req.params;
    const store = loadStore();
    const index = store.destinations.findIndex(d => d.id === id);

    if (index === -1) {
      res.status(404).json({ error: 'Destino não encontrado.' });
      return;
    }

    store.destinations.splice(index, 1);
    saveStore(store);
    res.json({ success: true, message: 'Destino excluído com sucesso.' });
  });

  // --- Banners CRUD ---
  app.post('/api/admin/banners', requireAdminAuth, (req, res) => {
    const { title, subtitle, buttonText, link, image, order, active } = req.body;
    if (!title) {
      res.status(400).json({ error: 'Título do banner é obrigatório.' });
      return;
    }

    const store = loadStore();
    const newBanner: Banner = {
      id: crypto.randomUUID(),
      title: title.trim(),
      subtitle: subtitle || '',
      buttonText: buttonText || '',
      link: link || '',
      image: image || undefined,
      order: Number(order) || (store.banners.length + 1),
      active: active !== undefined ? Boolean(active) : true,
      createdAt: new Date().toISOString(),
    };

    store.banners.push(newBanner);
    saveStore(store);

    res.status(201).json({ success: true, banner: newBanner });
  });

  app.put('/api/admin/banners/:id', requireAdminAuth, (req, res) => {
    const { id } = req.params;
    const body = req.body;
    const store = loadStore();
    const banner = store.banners.find(b => b.id === id);

    if (!banner) {
      res.status(404).json({ error: 'Banner não encontrado.' });
      return;
    }

    if (body.title !== undefined) banner.title = body.title.trim();
    if (body.subtitle !== undefined) banner.subtitle = body.subtitle;
    if (body.buttonText !== undefined) banner.buttonText = body.buttonText;
    if (body.link !== undefined) banner.link = body.link;
    if (body.image !== undefined) banner.image = body.image;
    if (body.order !== undefined) banner.order = Number(body.order);
    if (body.active !== undefined) banner.active = Boolean(body.active);

    saveStore(store);
    res.json({ success: true, banner });
  });

  app.delete('/api/admin/banners/:id', requireAdminAuth, (req, res) => {
    const { id } = req.params;
    const store = loadStore();
    const index = store.banners.findIndex(b => b.id === id);

    if (index === -1) {
      res.status(404).json({ error: 'Banner não encontrado.' });
      return;
    }

    store.banners.splice(index, 1);
    saveStore(store);
    res.json({ success: true, message: 'Banner excluído com sucesso.' });
  });

  // --- Settings ---
  app.put('/api/admin/settings', requireAdminAuth, (req, res) => {
    const body = req.body;
    const store = loadStore();

    store.settings = {
      ...store.settings,
      ...body,
      // Keep required base properties
      companyName: body.companyName || 'SonheTur',
      email: body.email || 'sonhetur@gmail.com',
      phone: body.phone || '(31) 9912-6011',
      whatsapp: body.whatsapp || '(31) 9912-6011',
      region: body.region || 'Vale do Aço, Minas Gerais',
    };

    saveStore(store);
    res.json({ success: true, settings: store.settings });
  });

  // --- Content ---
  app.put('/api/admin/content', requireAdminAuth, (req, res) => {
    const body = req.body;
    const store = loadStore();

    store.content = {
      ...store.content,
      ...body,
      slogan: body.slogan || store.content.slogan,
      homeMainText: body.homeMainText || store.content.homeMainText,
      aboutText: body.aboutText || store.content.aboutText,
    };

    saveStore(store);
    res.json({ success: true, content: store.content });
  });

  // --- Contacts management ---
  app.patch('/api/admin/contacts/:id', requireAdminAuth, (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const store = loadStore();
    const contact = store.contacts.find(c => c.id === id);

    if (!contact) {
      res.status(404).json({ error: 'Solicitação de contato não encontrada.' });
      return;
    }

    if (['nova', 'lida', 'respondida'].includes(status)) {
      contact.status = status;
      saveStore(store);
      res.json({ success: true, contact });
    } else {
      res.status(400).json({ error: 'Status inválido.' });
    }
  });

  app.delete('/api/admin/contacts/:id', requireAdminAuth, (req, res) => {
    const { id } = req.params;
    const store = loadStore();
    const index = store.contacts.findIndex(c => c.id === id);

    if (index === -1) {
      res.status(404).json({ error: 'Solicitação de contato não encontrada.' });
      return;
    }

    store.contacts.splice(index, 1);
    saveStore(store);
    res.json({ success: true, message: 'Contato excluído com sucesso.' });
  });

  // ==========================================
  // VITE / STATIC SERVING
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SonheTur Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
