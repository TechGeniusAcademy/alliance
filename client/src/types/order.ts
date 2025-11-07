export interface Order {
  id: number;
  title: string;
  furnitureType: string;
  description: string;
  status: 'pending' | 'active' | 'auction' | 'in_progress' | 'completed' | 'cancelled';
  price: {
    min: number;
    max: number;
    final?: number;
  };
  createdAt: string;
  deadline: string;
  bidsCount: number;
  clientId: number;
  sellerId?: number;
  sellerName?: string;
  images?: string[];
  materials?: string[];
  dimensions?: {
    width: number;
    height: number;
    depth: number;
  };
  deliveryAddress?: string;
  notes?: string;
}

export interface Favorite {
  id: number;
  orderId: number;
  userId: number;
  order: Order;
  addedAt: string;
}

export interface OrderFilters {
  status?: Order['status'][];
  furnitureType?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  dateRange?: {
    from: string;
    to: string;
  };
}
