import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface ScheduleItem {
  id: number;
  master_id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  type: 'deadline' | 'reminder' | 'meeting' | 'other';
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed' | 'overdue';
  order_id?: number;
  order_title?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateScheduleItemDTO {
  title: string;
  description?: string;
  date: string;
  time: string;
  type: 'deadline' | 'reminder' | 'meeting' | 'other';
  priority: 'low' | 'medium' | 'high';
  order_id?: number;
}

class ScheduleService {
  private getAuthHeader() {
    const token = localStorage.getItem('token');
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }

  async getScheduleItems(): Promise<ScheduleItem[]> {
    const response = await axios.get(`${API_URL}/schedule`, this.getAuthHeader());
    return response.data.items;
  }

  async createScheduleItem(data: CreateScheduleItemDTO): Promise<ScheduleItem> {
    const response = await axios.post(`${API_URL}/schedule`, data, this.getAuthHeader());
    return response.data.item;
  }

  async updateScheduleItem(id: number, data: Partial<CreateScheduleItemDTO> & { status?: string }): Promise<ScheduleItem> {
    const response = await axios.put(`${API_URL}/schedule/${id}`, data, this.getAuthHeader());
    return response.data.item;
  }

  async deleteScheduleItem(id: number): Promise<void> {
    await axios.delete(`${API_URL}/schedule/${id}`, this.getAuthHeader());
  }

  async toggleStatus(id: number, status: 'pending' | 'completed'): Promise<ScheduleItem> {
    const response = await axios.patch(
      `${API_URL}/schedule/${id}/status`,
      { status },
      this.getAuthHeader()
    );
    return response.data.item;
  }
}

export default new ScheduleService();
