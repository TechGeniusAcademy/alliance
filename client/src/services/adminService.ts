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

const API_BASE = (import.meta.env.VITE_API_BASE as string) || 'http://localhost:5000';

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

const adminService = {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  toggleBlock,
  changeRole
};

export default adminService;
