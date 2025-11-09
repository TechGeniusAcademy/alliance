import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export interface MasterPublicProfile {
  id: number;
  name: string;
  specialty?: string;
  experience?: number;
  rating?: number;
  completedOrders?: number;
  profilePicture?: string;
  verified?: boolean;
  skills?: string[];
  bio?: string;
}

export interface PortfolioItem {
  id?: number;
  master_id?: number;
  title: string;
  description?: string;
  category?: string;
  images?: string[];
  execution_time?: string; // Срок выполнения (например: "2 недели", "1 месяц")
  materials?: string; // Используемые материалы
  dimensions?: string; // Размеры (например: "200x150x80 см")
  furniture_type?: string; // Тип мебели (шкаф, стол, кухня и т.д.)
  style?: string; // Стиль (современный, классический и т.д.)
  color?: string; // Цвет/отделка
  client_name?: string;
  location?: string; // Город/район установки
  price?: number;
  is_public?: boolean;
  warranty_period?: string; // Гарантийный срок
  assembly_included?: boolean; // Включена ли сборка
  delivery_included?: boolean; // Включена ли доставка
  created_at?: string;
  updated_at?: string;
  // Данные мастера (для публичного просмотра)
  master_name?: string;
  master_phone?: string;
}

class MasterService {
  private getAuthHeader() {
    const token = localStorage.getItem('token');
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }

  // Получить все работы портфолио
  async getPortfolio(): Promise<PortfolioItem[]> {
    const response = await axios.get(`${API_URL}/master/portfolio`, this.getAuthHeader());
    return response.data;
  }

  // Получить одну работу по ID
  async getPortfolioItem(id: number): Promise<PortfolioItem> {
    const response = await axios.get(`${API_URL}/master/portfolio/${id}`, this.getAuthHeader());
    return response.data;
  }

  // Создать новую работу
  async createPortfolioItem(item: PortfolioItem): Promise<PortfolioItem> {
    const response = await axios.post(`${API_URL}/master/portfolio`, item, this.getAuthHeader());
    return response.data;
  }

  // Обновить работу
  async updatePortfolioItem(id: number, item: PortfolioItem): Promise<PortfolioItem> {
    const response = await axios.put(`${API_URL}/master/portfolio/${id}`, item, this.getAuthHeader());
    return response.data;
  }

  // Удалить работу
  async deletePortfolioItem(id: number): Promise<void> {
    await axios.delete(`${API_URL}/master/portfolio/${id}`, this.getAuthHeader());
  }

  // Получить публичное портфолио мастера (для клиентов)
  async getPublicPortfolio(masterId: number): Promise<PortfolioItem[]> {
    const response = await axios.get(`${API_URL}/master/public/portfolio/${masterId}`);
    return response.data;
  }

  // Получить все публичные работы всех мастеров
  async getAllPublicPortfolio(): Promise<PortfolioItem[]> {
    const response = await axios.get(`${API_URL}/master/public/portfolio`);
    return response.data;
  }

  // Получить всех мастеров (публичная информация, без контактов)
  async getAllMasters(): Promise<MasterPublicProfile[]> {
    const response = await axios.get(`${API_URL}/masters/public`);
    return response.data;
  }

  // Получить профиль мастера (публичная информация)
  async getMasterProfile(masterId: number): Promise<MasterPublicProfile> {
    const response = await axios.get(`${API_URL}/masters/public/${masterId}`);
    return response.data;
  }
}

const masterService = new MasterService();

export { masterService };
