import axios from 'axios';

const API_URL = 'http://localhost:5000/api/bids';

export interface Bid {
  id: number;
  order_id: number;
  master_id: number;
  proposed_price: number;
  estimated_days: number;
  comment?: string;
  status: string;
  created_at: string;
  updated_at: string;
  order_title?: string;
  order_description?: string;
  budget_min?: number;
  budget_max?: number;
  deadline?: string;
  order_status?: string;
  customer_name?: string;
}

export interface BidCompetition {
  bids_count: number;
  min_bid: number;
  max_bid: number;
  avg_bid: number;
}

export interface CreateBidData {
  proposed_price: number;
  estimated_days: number;
  comment?: string;
}

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

const bidService = {
  // Создать/обновить ставку
  createBid: async (orderId: number, bidData: CreateBidData): Promise<Bid> => {
    const response = await axios.post(`${API_URL}/${orderId}`, bidData, {
      headers: getAuthHeader(),
    });
    return response.data.bid;
  },

  // Получить все свои ставки
  getMyBids: async (): Promise<Bid[]> => {
    const response = await axios.get(`${API_URL}/my-bids`, {
      headers: getAuthHeader(),
    });
    return response.data.bids;
  },

  // Получить свою ставку на конкретный заказ
  getMyBidForOrder: async (orderId: number): Promise<Bid | null> => {
    const response = await axios.get(`${API_URL}/my-bid/${orderId}`, {
      headers: getAuthHeader(),
    });
    return response.data.bid; // Теперь бэкенд возвращает null вместо 404
  },

  // Получить информацию о конкуренции
  getCompetition: async (orderId: number): Promise<BidCompetition> => {
    const response = await axios.get(`${API_URL}/competition/${orderId}`, {
      headers: getAuthHeader(),
    });
    return response.data.competition;
  },

  // Удалить свою ставку
  deleteBid: async (bidId: number): Promise<void> => {
    await axios.delete(`${API_URL}/${bidId}`, {
      headers: getAuthHeader(),
    });
  },
};

export default bidService;
