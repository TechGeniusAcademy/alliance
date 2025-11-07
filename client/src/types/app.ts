export interface Payment {
  id: number;
  orderId: number;
  orderTitle: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  method: 'card' | 'cash' | 'bank_transfer' | 'kaspi';
  cardLast4?: string;
  createdAt: string;
  completedAt?: string;
  description?: string;
}

export interface Invoice {
  id: number;
  orderId: number;
  orderTitle: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  issuedAt: string;
  dueDate: string;
  paidAt?: string;
  items: InvoiceItem[];
  notes?: string;
}

export interface InvoiceItem {
  id: number;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Delivery {
  id: number;
  orderId: number;
  orderTitle: string;
  status: 'pending' | 'scheduled' | 'in_transit' | 'delivered' | 'cancelled';
  address: string;
  city: string;
  trackingNumber?: string;
  scheduledDate?: string;
  deliveredAt?: string;
  courier?: string;
  courierPhone?: string;
  notes?: string;
}

export interface PromoCode {
  id: number;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  validFrom: string;
  validUntil: string;
  usageLimit: number;
  usageCount: number;
  status: 'active' | 'expired' | 'used';
  isActive: boolean;
}

export interface Chat {
  id: number;
  participantId: number;
  participantName: string;
  participantAvatar?: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  orderId?: number;
  orderTitle?: string;
  isOnline: boolean;
}

export interface Message {
  id: number;
  chatId: number;
  senderId: number;
  senderName: string;
  content: string;
  type: 'text' | 'image' | 'file';
  fileUrl?: string;
  fileName?: string;
  createdAt: string;
  isRead: boolean;
}

export interface Notification {
  id: number;
  type: 'order' | 'payment' | 'delivery' | 'message' | 'system' | 'promo';
  title: string;
  message: string;
  icon?: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
  orderId?: number;
}

export interface Review {
  id: number;
  orderId: number;
  orderTitle: string;
  sellerId: number;
  sellerName: string;
  rating: number;
  comment: string;
  pros?: string[];
  cons?: string[];
  images?: string[];
  createdAt: string;
  isEditable: boolean;
  sellerResponse?: string;
  sellerResponseAt?: string;
}

export interface SpecialOffer {
  id: number;
  title: string;
  description: string;
  image: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  furnitureTypes?: string[];
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  promoCode?: string;
  termsAndConditions?: string[];
}

export interface UserSettings {
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    orderUpdates: boolean;
    promotions: boolean;
    messages: boolean;
  };
  privacy: {
    showProfile: boolean;
    showOrders: boolean;
    showReviews: boolean;
  };
  language: 'ru' | 'kk' | 'en';
  theme: 'light' | 'dark' | 'auto';
}

export interface FAQItem {
  id: number;
  category: string;
  question: string;
  answer: string;
  isExpanded?: boolean;
}

export interface SupportTicket {
  id: number;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
  messages: SupportMessage[];
}

export interface SupportMessage {
  id: number;
  ticketId: number;
  senderId: number;
  senderName: string;
  senderType: 'user' | 'support';
  message: string;
  createdAt: string;
}
