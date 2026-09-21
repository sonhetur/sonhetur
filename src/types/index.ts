export type TravelStatus = 'Rascunho' | 'Publicada' | 'Encerrada';

export interface Travel {
  id: string;
  title: string;
  destination: string;
  shortDescription: string;
  fullDescription: string;
  mainImage?: string;
  gallery?: string[];
  departureDate: string;
  returnDate: string;
  duration: string;
  boardingLocation: string;
  price: number;
  vacancies: number;
  itinerary?: string;
  included: string[];
  notIncluded: string[];
  importantInfo?: string;
  paymentMethods?: string;
  observations?: string;
  status: TravelStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Destination {
  id: string;
  name: string;
  description?: string;
  image?: string;
  createdAt: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  buttonText?: string;
  link?: string;
  buttonLink?: string;
  image?: string;
  order: number;
  active: boolean;
  isActive?: boolean;
  createdAt: string;
}

export interface SiteSettings {
  companyName: string;
  email: string;
  phone: string;
  whatsapp: string;
  region: string;
  instagram?: string;
  facebook?: string;
  address?: string;
  businessHours?: string;
  logo?: string;
  favicon?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export interface InstitutionalContent {
  slogan: string;
  homeMainText: string;
  aboutText: string;
  mission?: string;
  vision?: string;
  values?: string;
  differentials?: string;
  teamPhotos?: string[];
}

export type ContactRequestStatus = 'nova' | 'lida' | 'respondida';

export interface ContactRequest {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  travelId?: string;
  travelTitle?: string;
  status: ContactRequestStatus;
  createdAt: string;
}

export interface AdminUser {
  email: string;
  role: string;
}

export interface DashboardStats {
  publishedCount: number;
  draftCount: number;
  closedCount: number;
  contactRequestsCount: number;
}

export interface PublicDataResponse {
  travels: Travel[];
  destinations: Destination[];
  banners: Banner[];
  settings: SiteSettings;
  content: InstitutionalContent;
}

export interface AdminDataResponse {
  travels: Travel[];
  destinations: Destination[];
  banners: Banner[];
  settings: SiteSettings;
  content: InstitutionalContent;
  contacts: ContactRequest[];
  contactRequests?: ContactRequest[];
  stats: DashboardStats;
}

export type PublicData = PublicDataResponse;
export type AdminData = AdminDataResponse;
