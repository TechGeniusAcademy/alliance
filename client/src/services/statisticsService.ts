import axios from 'axios';
import { API_BASE_URL } from '../config/api';

export interface MasterStatistics {
  totalOrders: number;
  completedOrders: number;
  activeOrders: number;
  totalIncome: number;
  averageRating: number;
  totalClients: number;
  completionRate: number;
  responseTime: number;
  monthlyData: Array<{
    month: string;
    orders: number;
    income: number;
  }>;
  topCategories: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
  recentActivity: Array<{
    date: string;
    ordersCompleted: number;
    income: number;
  }>;
  performanceMetrics: {
    onTimeDelivery: number;
    customerSatisfaction: number;
    repeatClients: number;
    averageOrderValue: number;
  };
}

export interface Activity {
  id: string | number;
  type: string;
  title: string;
  description: string;
  customerName?: string;
  timestamp: string;
  status?: string;
  category?: string;
  comment?: string;
  rating?: number;
  orderId?: number;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const getMasterStatistics = async (period: string = 'month'): Promise<MasterStatistics> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/statistics/master?period=${period}`,
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error('Ошибка получения статистики мастера:', error);
    throw error;
  }
};

export const getMasterActivity = async (limit: number = 10): Promise<Activity[]> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/statistics/master/activity?limit=${limit}`,
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error('Ошибка получения активности мастера:', error);
    throw error;
  }
};
