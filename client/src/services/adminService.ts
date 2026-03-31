import { API_BASE_URL } from '../config/api';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  role: 'customer' | 'master' | 'admin' | string;
  active: boolean;
  createdAt?: string;
}

export interface Auction {
  id: number;
  title: string;
  description: string;
  category: string;
  furniture_type?: string;
  style?: string;
  materials?: any;
  dimensions?: any;
  budget_min: number;
  budget_max?: number;
  deadline: string;
  delivery_address?: string;
  delivery_required: boolean;
  assembly_required: boolean;
  photos?: any;
  status: string;
  customer_id: number;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  customer_address?: string;
  assigned_master_id?: number;
  assigned_master_name?: string;
  assigned_master_email?: string;
  assigned_master_phone?: string;
  bids_count: number;
  pending_bids_count: number;
  avg_bid_price?: number;
  min_bid_price?: number;
  max_bid_price?: number;
  created_at: string;
  updated_at?: string;
}

const API_BASE = API_BASE_URL;

async function handleResp(res: Response) {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.json();
}

export async function getUsers(): Promise<User[]> {
  const res = await fetch(`${API_BASE}/api/users`);
  return handleResp(res);
}

export async function createUser(payload: { name: string; email: string; password: string; phone?: string; address?: string; role: string; }): Promise<User> {
  const res = await fetch(`${API_BASE}/api/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return handleResp(res);
}

export async function updateUser(id: string, payload: { name?: string; email?: string; password?: string; phone?: string; address?: string; role?: string; }): Promise<User> {
  const res = await fetch(`${API_BASE}/api/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return handleResp(res);
}

export async function deleteUser(id: string): Promise<User> {
  const res = await fetch(`${API_BASE}/api/users/${id}`, { method: 'DELETE' });
  return handleResp(res);
}

export async function toggleBlock(id: string): Promise<User> {
  const res = await fetch(`${API_BASE}/api/users/${id}/block`, { method: 'PATCH' });
  return handleResp(res);
}

export async function changeRole(id: string, role: string): Promise<User> {
  const res = await fetch(`${API_BASE}/api/users/${id}/role`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role })
  });
  return handleResp(res);
}

export async function getAuctions(status?: string): Promise<Auction[]> {
  const token = localStorage.getItem('token');
  const url = status && status !== 'all' 
    ? `${API_BASE}/api/orders/admin/auctions?status=${status}`
    : `${API_BASE}/api/orders/admin/auctions`;
  
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  const data = await handleResp(res);
  return data.auctions || [];
}

const adminService = {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  toggleBlock,
  changeRole,
  getAuctions
};

export default adminService;
