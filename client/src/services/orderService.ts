import type { Order, Favorite, OrderFilters } from '../types/order';

// Интерфейс для 3D конфигурации мебели
export interface FurnitureConfig {
  type: string;
  width: number;
  height: number;
  depth: number;
  color: string;
  material: string;
  woodType?: string;
  finish: string;
  hardware: string;
  extras: string[];
}

// Интерфейс для заказов из аукциона (API формат)
export interface AuctionOrder {
  id: number;
  customer_id: number;
  title: string;
  description: string;
  category: string;
  furniture_type?: string;
  style?: string;
  materials?: string;
  dimensions?: string;
  budget_min?: number;
  budget_max?: number;
  deadline?: string;
  delivery_address?: string;
  delivery_required: boolean;
  assembly_required: boolean;
  photos?: string[];
  status: string;
  created_at: string;
  updated_at?: string;
  customer_name?: string;
  customer_address?: string;
  bids_count?: number;
  furniture_config?: FurnitureConfig;
}

// Mock data
const mockOrders: Order[] = [
  {
    id: 1,
    title: 'Кровать из массива дуба',
    furnitureType: 'bed',
    description: 'Двуспальная кровать из натурального дуба с резными элементами. Размер 180x200 см.',
    status: 'active',
    price: { min: 150000, max: 250000 },
    createdAt: '2024-10-15T10:30:00Z',
    deadline: '2024-11-20T23:59:59Z',
    bidsCount: 8,
    clientId: 1,
    images: ['https://placehold.co/400x300/8B4513/FFFFFF?text=Oak+Bed'],
    materials: ['Дуб', 'Металлическая фурнитура'],
    dimensions: { width: 200, height: 120, depth: 220 },
    deliveryAddress: 'г. Алматы, ул. Абая 150',
    notes: 'Необходима доставка и сборка'
  },
  {
    id: 2,
    title: 'Шкаф-купе в прихожую',
    furnitureType: 'wardrobe',
    description: 'Встроенный шкаф-купе с зеркальными дверями. Внутреннее наполнение: полки, штанги, ящики.',
    status: 'in_progress',
    price: { min: 200000, max: 350000, final: 280000 },
    createdAt: '2024-10-10T14:20:00Z',
    deadline: '2024-11-15T23:59:59Z',
    bidsCount: 12,
    clientId: 1,
    sellerId: 5,
    sellerName: 'Мастерская "Уют"',
    images: ['https://placehold.co/400x300/4B0082/FFFFFF?text=Wardrobe'],
    materials: ['ЛДСП', 'Зеркало', 'Алюминиевый профиль'],
    dimensions: { width: 250, height: 240, depth: 60 },
    deliveryAddress: 'г. Алматы, ул. Сатпаева 90/21',
  },
  {
    id: 3,
    title: 'Обеденный стол на 6 персон',
    furnitureType: 'table',
    description: 'Круглый обеденный стол из ореха с возможностью раскладывания',
    status: 'completed',
    price: { min: 80000, max: 120000, final: 95000 },
    createdAt: '2024-09-05T09:15:00Z',
    deadline: '2024-10-10T23:59:59Z',
    bidsCount: 15,
    clientId: 1,
    sellerId: 3,
    sellerName: 'Столярная мастерская',
    images: ['https://placehold.co/400x300/8B4513/FFFFFF?text=Dining+Table'],
    materials: ['Орех', 'Лак матовый'],
    dimensions: { width: 140, height: 75, depth: 140 },
  },
  {
    id: 4,
    title: 'Диван угловой в гостиную',
    furnitureType: 'sofa',
    description: 'Современный угловой диван с механизмом трансформации. Обивка - велюр.',
    status: 'cancelled',
    price: { min: 300000, max: 500000 },
    createdAt: '2024-08-20T16:45:00Z',
    deadline: '2024-09-30T23:59:59Z',
    bidsCount: 5,
    clientId: 1,
    images: ['https://placehold.co/400x300/4169E1/FFFFFF?text=Corner+Sofa'],
    materials: ['Велюр', 'Пружинный блок', 'Массив березы'],
    notes: 'Заказ отменен по просьбе клиента'
  },
  {
    id: 5,
    title: 'Письменный стол для домашнего офиса',
    furnitureType: 'table',
    description: 'Стол с ящиками и надстройкой. Стиль лофт.',
    status: 'pending',
    price: { min: 60000, max: 100000 },
    createdAt: '2024-11-01T11:00:00Z',
    deadline: '2024-11-25T23:59:59Z',
    bidsCount: 3,
    clientId: 1,
    images: ['https://placehold.co/400x300/708090/FFFFFF?text=Desk'],
    materials: ['Массив сосны', 'Металл'],
    dimensions: { width: 140, height: 75, depth: 70 },
    deliveryAddress: 'г. Астана, пр. Кабанбай батыра 11'
  },
  {
    id: 6,
    title: 'Комод в спальню',
    furnitureType: 'dresser',
    description: 'Комод с 5 выдвижными ящиками. Классический стиль.',
    status: 'active',
    price: { min: 70000, max: 110000 },
    createdAt: '2024-10-28T13:30:00Z',
    deadline: '2024-12-05T23:59:59Z',
    bidsCount: 6,
    clientId: 1,
    images: ['https://placehold.co/400x300/8B4513/FFFFFF?text=Dresser'],
    materials: ['МДФ', 'Шпон дуба'],
    dimensions: { width: 100, height: 110, depth: 45 },
  },
  {
    id: 7,
    title: 'Кухонный гарнитур',
    furnitureType: 'other',
    description: 'Кухонный гарнитур П-образной формы с встроенной техникой',
    status: 'in_progress',
    price: { min: 500000, max: 800000, final: 650000 },
    createdAt: '2024-09-15T10:00:00Z',
    deadline: '2024-11-30T23:59:59Z',
    bidsCount: 10,
    clientId: 1,
    sellerId: 7,
    sellerName: 'КухниПро',
    images: ['https://placehold.co/400x300/F5F5DC/000000?text=Kitchen'],
    materials: ['МДФ', 'Пластик', 'Кварцевая столешница'],
    deliveryAddress: 'г. Алматы, мкр. Самал-2, д. 111'
  },
  {
    id: 8,
    title: 'Набор садовой мебели',
    furnitureType: 'other',
    description: 'Стол и 4 стула для террасы из влагостойких материалов',
    status: 'completed',
    price: { min: 120000, max: 180000, final: 155000 },
    createdAt: '2024-08-01T08:00:00Z',
    deadline: '2024-09-01T23:59:59Z',
    bidsCount: 7,
    clientId: 1,
    sellerId: 4,
    sellerName: 'Садовая мебель',
    images: ['https://placehold.co/400x300/228B22/FFFFFF?text=Garden+Set'],
    materials: ['Лиственница', 'Влагостойкое покрытие'],
  }
];

const mockFavorites: Favorite[] = [
  {
    id: 1,
    orderId: 1,
    userId: 1,
    order: mockOrders[0],
    addedAt: '2024-10-16T12:00:00Z'
  },
  {
    id: 2,
    orderId: 6,
    userId: 1,
    order: mockOrders[5],
    addedAt: '2024-10-29T15:30:00Z'
  },
  {
    id: 3,
    orderId: 5,
    userId: 1,
    order: mockOrders[4],
    addedAt: '2024-11-02T09:15:00Z'
  }
];

// Функция преобразования данных API в формат Order
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const transformApiOrder = (apiOrder: any): Order => {
  return {
    id: apiOrder.id,
    title: apiOrder.title,
    furnitureType: apiOrder.category || apiOrder.furniture_type || 'other',
    description: apiOrder.description,
    status: apiOrder.status, // Сохраняем статус как есть
    price: {
      min: apiOrder.budget_min || 0,
      max: apiOrder.budget_max || 0,
      final: apiOrder.final_price,
    },
    createdAt: apiOrder.created_at,
    deadline: apiOrder.deadline || '',
    bidsCount: apiOrder.bids_count || 0,
    clientId: apiOrder.customer_id,
    sellerId: apiOrder.assigned_master_id,
    sellerName: apiOrder.assigned_master_name,
    images: apiOrder.photos || [],
    materials: apiOrder.materials ? apiOrder.materials.split(',').map((m: string) => m.trim()) : [],
    dimensions: apiOrder.dimensions ? (() => {
      const parts = apiOrder.dimensions.split('x');
      return {
        width: parseFloat(parts[0]) || 0,
        height: parseFloat(parts[2]) || 0,
        depth: parseFloat(parts[1]) || 0,
      };
    })() : undefined,
    deliveryAddress: apiOrder.delivery_address,
    notes: apiOrder.notes,
  };
};

class OrderService {
  private baseURL = 'http://localhost:5000/api';
  private useMockData = false; // Переключатель для использования моковых данных

  // GET all orders
  async getOrders(filters?: OrderFilters): Promise<Order[]> {
    if (this.useMockData) {
      // Mock implementation
      let filteredOrders = [...mockOrders];

      if (filters?.status && filters.status.length > 0) {
        filteredOrders = filteredOrders.filter(order => 
          filters.status!.includes(order.status)
        );
      }

      if (filters?.furnitureType && filters.furnitureType.length > 0) {
        filteredOrders = filteredOrders.filter(order =>
          filters.furnitureType!.includes(order.furnitureType)
        );
      }

      if (filters?.priceRange) {
        filteredOrders = filteredOrders.filter(order =>
          order.price.min >= filters.priceRange!.min &&
          order.price.max <= filters.priceRange!.max
        );
      }

      return filteredOrders;
    }

    // Real API call
    const token = localStorage.getItem('token');
    const queryParams = new URLSearchParams();
    
    if (filters?.status) {
      queryParams.append('status', filters.status.join(','));
    }
    
    const response = await fetch(`${this.baseURL}/orders?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch orders');
    }

    return response.json();
  }

  // GET order by ID
  async getOrderById(id: number): Promise<Order> {
    if (this.useMockData) {
      const order = mockOrders.find(o => o.id === id);
      if (!order) {
        throw new Error('Order not found');
      }
      return order;
    }

    const token = localStorage.getItem('token');
    const response = await fetch(`${this.baseURL}/orders/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch order');
    }

    const data = await response.json();
    return transformApiOrder(data.order);
  }

  // GET my orders
  async getMyOrders(): Promise<Order[]> {
    if (this.useMockData) {
      return mockOrders.filter(order => order.clientId === 1);
    }

    const token = localStorage.getItem('token');
    const response = await fetch(`${this.baseURL}/orders/my-orders`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch my orders');
    }

    const data = await response.json();
    return data.orders.map(transformApiOrder);
  }

  // GET active orders
  async getActiveOrders(): Promise<Order[]> {
    if (this.useMockData) {
      return this.getOrders({ status: ['active', 'in_progress'] });
    }

    // Получаем все заказы клиента и фильтруем активные
    const allOrders = await this.getMyOrders();
    return allOrders.filter(order => 
      order.status === 'active' || 
      order.status === 'in_progress' || 
      order.status === 'auction' ||
      order.status === 'pending'
    );
  }

  // GET order history
  async getOrderHistory(): Promise<Order[]> {
    if (this.useMockData) {
      return this.getOrders({ status: ['completed', 'cancelled'] });
    }

    // Получаем все заказы клиента и фильтруем завершенные
    const allOrders = await this.getMyOrders();
    return allOrders.filter(order => 
      order.status === 'completed' || 
      order.status === 'cancelled'
    );
  }

  // GET auction orders (для мастеров)
  async getAuctionOrders(): Promise<AuctionOrder[]> {
    if (this.useMockData) {
      // Преобразуем моковые данные в формат API
      return mockOrders
        .filter(order => order.status === 'active' || order.status === 'pending')
        .map(order => ({
          id: order.id,
          customer_id: order.clientId,
          title: order.title,
          description: order.description,
          category: order.furnitureType,
          furniture_type: order.furnitureType,
          materials: order.materials?.join(', '),
          dimensions: order.dimensions ? `${order.dimensions.width}x${order.dimensions.depth}x${order.dimensions.height}` : undefined,
          budget_min: order.price.min,
          budget_max: order.price.max,
          deadline: order.deadline,
          delivery_address: order.deliveryAddress,
          delivery_required: false,
          assembly_required: false,
          photos: order.images,
          status: 'auction',
          created_at: order.createdAt,
          bids_count: order.bidsCount || 0,
        }));
    }

    const token = localStorage.getItem('token');
    console.log('Token:', token ? 'exists' : 'missing');
    console.log('Fetching from:', `${this.baseURL}/orders/auction`);
    
    const response = await fetch(`${this.baseURL}/orders/auction`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error('Failed to fetch auction orders');
    }

    const data = await response.json();
    console.log('Auction data received:', data);
    // Возвращаем данные как есть, без трансформации
    return data.orders;
  }

  // GET favorites
  async getFavorites(): Promise<Favorite[]> {
    if (this.useMockData) {
      return mockFavorites;
    }

    const token = localStorage.getItem('token');
    const response = await fetch(`${this.baseURL}/favorites`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch favorites');
    }

    return response.json();
  }

  // POST add to favorites
  async addToFavorites(orderId: number): Promise<Favorite> {
    if (this.useMockData) {
      const order = mockOrders.find(o => o.id === orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      const newFavorite: Favorite = {
        id: mockFavorites.length + 1,
        orderId,
        userId: 1,
        order,
        addedAt: new Date().toISOString()
      };

      mockFavorites.push(newFavorite);
      return newFavorite;
    }

    const token = localStorage.getItem('token');
    const response = await fetch(`${this.baseURL}/favorites`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ orderId }),
    });

    if (!response.ok) {
      throw new Error('Failed to add to favorites');
    }

    return response.json();
  }

  // DELETE remove from favorites
  async removeFromFavorites(orderId: number): Promise<void> {
    if (this.useMockData) {
      const index = mockFavorites.findIndex(f => f.orderId === orderId);
      if (index > -1) {
        mockFavorites.splice(index, 1);
      }
      return;
    }

    const token = localStorage.getItem('token');
    const response = await fetch(`${this.baseURL}/favorites/${orderId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to remove from favorites');
    }
  }

  // POST create order
  async createOrder(orderData: Partial<Order>): Promise<Order> {
    if (this.useMockData) {
      const newOrder: Order = {
        id: mockOrders.length + 1,
        title: orderData.title || '',
        furnitureType: orderData.furnitureType || 'other',
        description: orderData.description || '',
        status: 'pending',
        price: orderData.price || { min: 0, max: 0 },
        createdAt: new Date().toISOString(),
        deadline: orderData.deadline || '',
        bidsCount: 0,
        clientId: 1,
        ...orderData
      } as Order;

      mockOrders.push(newOrder);
      return newOrder;
    }

    const token = localStorage.getItem('token');
    
    // Преобразуем данные в формат API
    const apiData = {
      title: orderData.title,
      description: orderData.description,
      category: orderData.furnitureType || 'other',
      furniture_type: orderData.furnitureType,
      materials: orderData.materials?.join ? orderData.materials.join(', ') : orderData.materials,
      dimensions: orderData.dimensions ? `${orderData.dimensions.width}x${orderData.dimensions.depth}x${orderData.dimensions.height}` : undefined,
      budget_min: orderData.price?.min,
      budget_max: orderData.price?.max,
      deadline: orderData.deadline,
      delivery_address: orderData.deliveryAddress,
      delivery_required: false,
      assembly_required: false,
      photos: orderData.images || [],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      furniture_config: (orderData as any).furnitureConfig || null,
    };

    const response = await fetch(`${this.baseURL}/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apiData),
    });

    if (!response.ok) {
      throw new Error('Failed to create order');
    }

    const data = await response.json();
    return data.order;
  }

  // PUT update order
  async updateOrder(id: number, orderData: Partial<Order>): Promise<Order> {
    if (this.useMockData) {
      const index = mockOrders.findIndex(o => o.id === id);
      if (index === -1) {
        throw new Error('Order not found');
      }

      mockOrders[index] = { ...mockOrders[index], ...orderData };
      return mockOrders[index];
    }

    const token = localStorage.getItem('token');
    const response = await fetch(`${this.baseURL}/orders/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      throw new Error('Failed to update order');
    }

    return response.json();
  }

  // DELETE order
  async deleteOrder(id: number): Promise<void> {
    if (this.useMockData) {
      const index = mockOrders.findIndex(o => o.id === id);
      if (index > -1) {
        mockOrders.splice(index, 1);
      }
      return;
    }

    const token = localStorage.getItem('token');
    const response = await fetch(`${this.baseURL}/orders/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete order');
    }
  }

  // POST mark order as shipped (for master)
  async markAsShipped(orderId: number, data: { tracking_number?: string; delivery_notes?: string }): Promise<void> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${this.baseURL}/orders/${orderId}/ship`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to mark order as shipped');
    }
  }

  // POST confirm delivery (for customer)
  async confirmDelivery(orderId: number): Promise<void> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${this.baseURL}/orders/${orderId}/confirm-delivery`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to confirm delivery');
    }
  }

  // GET order delivery info
  async getOrderDelivery(orderId: number): Promise<{
    delivery_status: string;
    shipped_at: string | null;
    delivered_at: string | null;
    tracking_number: string | null;
    delivery_notes: string | null;
    customer_name: string;
    customer_phone: string | null;
    master_name: string;
    master_phone: string | null;
  }> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${this.baseURL}/orders/${orderId}/delivery`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch delivery info');
    }

    return response.json();
  }

  // GET active orders for master
  async getMasterActiveOrders(): Promise<Order[]> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${this.baseURL}/orders/master/active`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch master active orders');
    }

    const data = await response.json();
    return data.orders.map(transformApiOrder);
  }
}

export const orderService = new OrderService();
