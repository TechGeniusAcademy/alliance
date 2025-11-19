import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const API_URL = `${API_BASE_URL}/api`;

export interface Chat {
  id: number;
  order_id: number;
  customer_id: number;
  master_id: number;
  status: string;
  customer_accepted_rules: boolean;
  master_accepted_rules: boolean;
  created_at: string;
  updated_at: string;
  order_title: string;
  order_status: string;
  customer_name: string;
  customer_photo: string | null;
  master_name: string;
  master_photo: string | null;
  unread_count: number;
  last_message: string | null;
  last_message_time: string | null;
}

export interface Message {
  id: number;
  chat_id: number;
  sender_id: number;
  message: string;
  is_read: boolean;
  created_at: string;
  sender_name: string;
  sender_photo: string | null;
}

export interface WorkAct {
  id: number;
  title: string;
  description: string;
  final_price: number;
  created_at: string;
  updated_at: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  master_name: string;
  master_email: string;
  master_phone: string;
}

class ChatService {
  private getAuthHeader() {
    const token = localStorage.getItem('token');
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }

  async getMyChats(): Promise<Chat[]> {
    const response = await axios.get(`${API_URL}/chats`, this.getAuthHeader());
    return response.data.chats;
  }

  async getOrCreateChat(orderId: number): Promise<Chat> {
    const response = await axios.get(
      `${API_URL}/chats/order/${orderId}`,
      this.getAuthHeader()
    );
    return response.data.chat;
  }

  async getChatMessages(chatId: number): Promise<Message[]> {
    const response = await axios.get(
      `${API_URL}/chats/${chatId}/messages`,
      this.getAuthHeader()
    );
    return response.data.messages;
  }

  async markMessagesAsRead(chatId: number): Promise<void> {
    await axios.post(
      `${API_URL}/chats/${chatId}/mark-read`,
      {},
      this.getAuthHeader()
    );
  }

  async sendMessage(chatId: number, message: string): Promise<Message> {
    const response = await axios.post(
      `${API_URL}/chats/${chatId}/messages`,
      { message },
      this.getAuthHeader()
    );
    return response.data.message;
  }

  async submitForReview(orderId: number): Promise<void> {
    await axios.post(
      `${API_URL}/chats/order/${orderId}/submit`,
      {},
      this.getAuthHeader()
    );
  }

  async acceptWork(orderId: number, rating?: number, review?: string): Promise<void> {
    await axios.post(
      `${API_URL}/chats/order/${orderId}/accept`,
      { rating, review },
      this.getAuthHeader()
    );
  }

  async getWorkAct(orderId: number): Promise<WorkAct> {
    const response = await axios.get(
      `${API_URL}/chats/order/${orderId}/act`,
      this.getAuthHeader()
    );
    return response.data.act;
  }

  async acceptChatRules(chatId: number): Promise<{ customer_accepted_rules: boolean; master_accepted_rules: boolean }> {
    const response = await axios.post(
      `${API_URL}/chats/accept-rules`,
      { chatId },
      this.getAuthHeader()
    );
    return response.data.chat;
  }
}

export default new ChatService();
