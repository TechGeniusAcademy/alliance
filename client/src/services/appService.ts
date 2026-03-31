import type {
  Payment,
  Invoice,
  Delivery,
  PromoCode,
  Chat,
  Message,
  Notification,
  Review,
  SpecialOffer,
  UserSettings,
  FAQItem,
  SupportTicket
} from '../types/app';
import { API_BASE_URL } from '../config/api';

// Mock Payments
const mockPayments: Payment[] = [
  {
    id: 1,
    orderId: 1,
    orderTitle: 'Кровать из массива дуба',
    amount: 250000,
    currency: '₸',
    status: 'completed',
    method: 'card',
    cardLast4: '4242',
    createdAt: '2024-10-20T14:30:00Z',
    completedAt: '2024-10-20T14:31:00Z',
    description: 'Оплата заказа #1'
  },
  {
    id: 2,
    orderId: 2,
    orderTitle: 'Шкаф-купе в прихожую',
    amount: 280000,
    currency: '₸',
    status: 'completed',
    method: 'kaspi',
    createdAt: '2024-10-15T10:00:00Z',
    completedAt: '2024-10-15T10:05:00Z',
    description: 'Оплата через Kaspi Pay'
  },
  {
    id: 3,
    orderId: 3,
    orderTitle: 'Обеденный стол на 6 персон',
    amount: 95000,
    currency: '₸',
    status: 'completed',
    method: 'bank_transfer',
    createdAt: '2024-09-10T16:00:00Z',
    completedAt: '2024-09-11T09:00:00Z',
    description: 'Банковский перевод'
  },
  {
    id: 4,
    orderId: 5,
    orderTitle: 'Письменный стол для домашнего офиса',
    amount: 80000,
    currency: '₸',
    status: 'pending',
    method: 'card',
    cardLast4: '5555',
    createdAt: '2024-11-03T12:00:00Z',
    description: 'Ожидает подтверждения'
  }
];

// Mock Invoices
const mockInvoices: Invoice[] = [
  {
    id: 1,
    orderId: 2,
    orderTitle: 'Шкаф-купе в прихожую',
    invoiceNumber: 'INV-2024-001',
    amount: 280000,
    currency: '₸',
    status: 'paid',
    issuedAt: '2024-10-14T10:00:00Z',
    dueDate: '2024-10-21T23:59:59Z',
    paidAt: '2024-10-15T10:05:00Z',
    items: [
      { id: 1, description: 'Шкаф-купе 250x240x60 см', quantity: 1, unitPrice: 250000, total: 250000 },
      { id: 2, description: 'Доставка', quantity: 1, unitPrice: 20000, total: 20000 },
      { id: 3, description: 'Сборка', quantity: 1, unitPrice: 10000, total: 10000 }
    ]
  },
  {
    id: 2,
    orderId: 7,
    orderTitle: 'Кухонный гарнитур',
    invoiceNumber: 'INV-2024-002',
    amount: 650000,
    currency: '₸',
    status: 'sent',
    issuedAt: '2024-10-20T14:00:00Z',
    dueDate: '2024-11-20T23:59:59Z',
    items: [
      { id: 1, description: 'Кухонный гарнитур П-образный', quantity: 1, unitPrice: 580000, total: 580000 },
      { id: 2, description: 'Столешница кварцевая', quantity: 3.5, unitPrice: 15000, total: 52500 },
      { id: 3, description: 'Монтаж', quantity: 1, unitPrice: 17500, total: 17500 }
    ],
    notes: 'Предоплата 50% при подписании договора'
  }
];

// Mock Deliveries
const mockDeliveries: Delivery[] = [
  {
    id: 1,
    orderId: 2,
    orderTitle: 'Шкаф-купе в прихожую',
    status: 'delivered',
    address: 'ул. Сатпаева 90/21, кв. 45',
    city: 'Алматы',
    trackingNumber: 'TRK123456789',
    scheduledDate: '2024-10-25T10:00:00Z',
    deliveredAt: '2024-10-25T11:30:00Z',
    courier: 'Асан Асанов',
    courierPhone: '+7 (777) 123-45-67'
  },
  {
    id: 2,
    orderId: 7,
    orderTitle: 'Кухонный гарнитур',
    status: 'scheduled',
    address: 'мкр. Самал-2, д. 111, кв. 89',
    city: 'Алматы',
    trackingNumber: 'TRK987654321',
    scheduledDate: '2024-11-25T14:00:00Z',
    courier: 'Марат Маратов',
    courierPhone: '+7 (701) 234-56-78',
    notes: 'Позвонить за 30 минут до доставки'
  },
  {
    id: 3,
    orderId: 1,
    orderTitle: 'Кровать из массива дуба',
    status: 'in_transit',
    address: 'ул. Абая 150, кв. 12',
    city: 'Алматы',
    trackingNumber: 'TRK456789123',
    scheduledDate: '2024-11-18T15:00:00Z',
    courier: 'Ерлан Ерланов',
    courierPhone: '+7 (702) 345-67-89'
  }
];

// Mock Promo Codes
const mockPromoCodes: PromoCode[] = [
  {
    id: 1,
    code: 'WELCOME2024',
    description: 'Скидка 10% на первый заказ',
    discountType: 'percentage',
    discountValue: 10,
    minOrderAmount: 50000,
    validFrom: '2024-01-01T00:00:00Z',
    validUntil: '2024-12-31T23:59:59Z',
    usageLimit: 1,
    usageCount: 0,
    status: 'active',
    isActive: true
  },
  {
    id: 2,
    code: 'SAVE20000',
    description: 'Скидка 20 000₸ на заказ от 200 000₸',
    discountType: 'fixed',
    discountValue: 20000,
    minOrderAmount: 200000,
    validFrom: '2024-11-01T00:00:00Z',
    validUntil: '2024-11-30T23:59:59Z',
    usageLimit: 1,
    usageCount: 0,
    status: 'active',
    isActive: true
  },
  {
    id: 3,
    code: 'SUMMER2024',
    description: 'Летняя распродажа - 15% скидка',
    discountType: 'percentage',
    discountValue: 15,
    minOrderAmount: 100000,
    maxDiscount: 50000,
    validFrom: '2024-06-01T00:00:00Z',
    validUntil: '2024-08-31T23:59:59Z',
    usageLimit: 1,
    usageCount: 1,
    status: 'used',
    isActive: false
  }
];

// Mock Chats
const mockChats: Chat[] = [
  {
    id: 1,
    participantId: 5,
    participantName: 'Мастерская "Уют"',
    participantAvatar: 'https://ui-avatars.com/api/?name=Уют&background=3b82f6&color=fff',
    lastMessage: 'Отлично, тогда приступаем к работе!',
    lastMessageAt: '2024-11-04T15:30:00Z',
    unreadCount: 2,
    orderId: 2,
    orderTitle: 'Шкаф-купе в прихожую',
    isOnline: true
  },
  {
    id: 2,
    participantId: 7,
    participantName: 'КухниПро',
    participantAvatar: 'https://ui-avatars.com/api/?name=КухниПро&background=8b5cf6&color=fff',
    lastMessage: 'Когда удобно подъехать для замеров?',
    lastMessageAt: '2024-11-03T12:00:00Z',
    unreadCount: 0,
    orderId: 7,
    orderTitle: 'Кухонный гарнитур',
    isOnline: false
  },
  {
    id: 3,
    participantId: 100,
    participantName: 'Служба поддержки',
    participantAvatar: 'https://ui-avatars.com/api/?name=Support&background=10b981&color=fff',
    lastMessage: 'Спасибо за обращение! Ваш вопрос решен.',
    lastMessageAt: '2024-11-01T10:00:00Z',
    unreadCount: 0,
    isOnline: true
  }
];

// Mock Notifications
const mockNotifications: Notification[] = [
  {
    id: 1,
    type: 'order',
    title: 'Новая заявка на ваш заказ',
    message: 'Мастерская "Уют" оставила заявку на ваш заказ "Шкаф-купе"',
    icon: '🛠️',
    isRead: false,
    createdAt: '2024-11-05T10:30:00Z',
    orderId: 2
  },
  {
    id: 2,
    type: 'message',
    title: 'Новое сообщение',
    message: 'КухниПро отправил вам сообщение',
    icon: '💬',
    isRead: false,
    createdAt: '2024-11-05T09:15:00Z',
    actionUrl: '/dashboard/chats'
  },
  {
    id: 3,
    type: 'delivery',
    title: 'Заказ в пути',
    message: 'Ваш заказ "Кровать из дуба" отправлен и скоро будет доставлен',
    icon: '🚚',
    isRead: true,
    createdAt: '2024-11-04T14:00:00Z',
    orderId: 1
  },
  {
    id: 4,
    type: 'payment',
    title: 'Платеж подтвержден',
    message: 'Оплата 280 000₸ успешно получена',
    icon: '✅',
    isRead: true,
    createdAt: '2024-11-03T10:05:00Z'
  },
  {
    id: 5,
    type: 'promo',
    title: 'Специальное предложение!',
    message: 'Скидка 20% на кухонную мебель до конца месяца',
    icon: '🎁',
    isRead: true,
    createdAt: '2024-11-01T08:00:00Z',
    actionUrl: '/dashboard/offers'
  }
];

// Mock Reviews
const mockReviews: Review[] = [
  {
    id: 1,
    orderId: 3,
    orderTitle: 'Обеденный стол на 6 персон',
    sellerId: 3,
    sellerName: 'Столярная мастерская',
    rating: 5,
    comment: 'Отличная работа! Стол получился именно таким, как я хотел. Качество на высоте, все сроки соблюдены.',
    pros: ['Качественная работа', 'Точно в срок', 'Красивый дизайн'],
    cons: [],
    images: ['https://placehold.co/400x300/8B4513/FFFFFF?text=Table+Photo'],
    createdAt: '2024-10-12T15:00:00Z',
    isEditable: false,
    sellerResponse: 'Спасибо за отзыв! Было приятно работать с вами!',
    sellerResponseAt: '2024-10-13T09:00:00Z'
  },
  {
    id: 2,
    orderId: 8,
    orderTitle: 'Набор садовой мебели',
    sellerId: 4,
    sellerName: 'Садовая мебель',
    rating: 4,
    comment: 'Хорошая мебель, но доставка задержалась на 2 дня.',
    pros: ['Качественные материалы', 'Красивый внешний вид'],
    cons: ['Задержка доставки'],
    createdAt: '2024-09-05T12:00:00Z',
    isEditable: false
  }
];

// Mock Special Offers
const mockSpecialOffers: SpecialOffer[] = [
  {
    id: 1,
    title: 'Скидка 20% на кухонную мебель',
    description: 'Специальное предложение на заказ кухонных гарнитуров. Закажите сейчас и получите скидку!',
    image: 'https://placehold.co/800x400/F5F5DC/000000?text=Kitchen+Sale',
    discountType: 'percentage',
    discountValue: 20,
    furnitureTypes: ['kitchen'],
    validFrom: '2024-11-01T00:00:00Z',
    validUntil: '2024-11-30T23:59:59Z',
    isActive: true,
    promoCode: 'KITCHEN20',
    termsAndConditions: [
      'Минимальная сумма заказа 300 000₸',
      'Скидка не суммируется с другими акциями',
      'Действует до конца ноября 2024'
    ]
  },
  {
    id: 2,
    title: 'Бесплатная доставка',
    description: 'При заказе от 150 000₸ доставка совершенно бесплатно по всему Алматы!',
    image: 'https://placehold.co/800x400/4169E1/FFFFFF?text=Free+Delivery',
    discountType: 'fixed',
    discountValue: 0,
    validFrom: '2024-11-01T00:00:00Z',
    validUntil: '2024-12-31T23:59:59Z',
    isActive: true,
    termsAndConditions: [
      'Только для заказов от 150 000₸',
      'Действует по г. Алматы',
      'В пределах города'
    ]
  },
  {
    id: 3,
    title: 'Спальная мебель по супер-цене',
    description: 'Кровати, шкафы, комоды - все для спальни со скидкой до 25%',
    image: 'https://placehold.co/800x400/8B4513/FFFFFF?text=Bedroom+Sale',
    discountType: 'percentage',
    discountValue: 25,
    furnitureTypes: ['bed', 'wardrobe', 'dresser'],
    validFrom: '2024-11-15T00:00:00Z',
    validUntil: '2024-11-25T23:59:59Z',
    isActive: true,
    promoCode: 'BEDROOM25'
  }
];

// Mock FAQs
const mockFAQs: FAQItem[] = [
  {
    id: 1,
    category: 'Заказы',
    question: 'Как создать заказ на мебель?',
    answer: 'Перейдите в раздел "Создать заказ", выберите тип мебели, укажите размеры, материалы и другие параметры. После этого ваш заказ будет отправлен на аукцион, где мастера смогут оставить свои предложения.'
  },
  {
    id: 2,
    category: 'Заказы',
    question: 'Сколько времени занимает изготовление мебели?',
    answer: 'Сроки изготовления зависят от сложности заказа и загруженности мастера. Обычно это занимает от 2 до 6 недель. Точные сроки обсуждаются индивидуально с выбранным мастером.'
  },
  {
    id: 3,
    category: 'Оплата',
    question: 'Какие способы оплаты доступны?',
    answer: 'Мы принимаем оплату банковскими картами, через Kaspi Pay, банковским переводом или наличными при получении (по согласованию с мастером).'
  },
  {
    id: 4,
    category: 'Оплата',
    question: 'Нужно ли вносить предоплату?',
    answer: 'Обычно требуется предоплата 30-50% от стоимости заказа. Точные условия обсуждаются с мастером перед началом работы.'
  },
  {
    id: 5,
    category: 'Доставка',
    question: 'Входит ли доставка в стоимость?',
    answer: 'Доставка обычно оплачивается отдельно. Стоимость зависит от габаритов мебели и адреса доставки. При заказе от 150 000₸ доставка по Алматы бесплатная.'
  },
  {
    id: 6,
    category: 'Доставка',
    question: 'Могу ли я забрать заказ самостоятельно?',
    answer: 'Да, вы можете забрать мебель самостоятельно из мастерской. Адрес мастерской уточняйте у исполнителя.'
  },
  {
    id: 7,
    category: 'Гарантия',
    question: 'Есть ли гарантия на мебель?',
    answer: 'Да, на всю мебель предоставляется гарантия от 6 месяцев до 2 лет, в зависимости от типа изделия и условий эксплуатации.'
  },
  {
    id: 8,
    category: 'Аккаунт',
    question: 'Как изменить данные профиля?',
    answer: 'Перейдите в раздел "Профиль" и нажмите кнопку "Редактировать". Внесите необходимые изменения и сохраните.'
  }
];

class AppService {
  private baseURL = `${API_BASE_URL}/api`;
  private useMockData = false;

  // PAYMENTS
  async getPayments(): Promise<Payment[]> {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${this.baseURL}/transactions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }
      
      const data = await response.json();
      
      // Преобразуем транзакции в формат Payment
      interface TransactionFromDB {
        id: number;
        order_id: number;
        order_title: string;
        amount: string;
        status: string;
        created_at: string;
        description: string;
      }
      
      return data.transactions.map((t: TransactionFromDB) => ({
        id: t.id,
        orderId: t.order_id,
        orderTitle: t.order_title,
        amount: parseFloat(t.amount),
        currency: '₸',
        status: t.status,
        method: 'card', // По умолчанию, можно расширить
        createdAt: t.created_at,
        completedAt: t.status === 'completed' ? t.created_at : undefined,
        description: t.description
      }));
    } catch (error) {
      console.error('Get payments error:', error);
      return mockPayments; // Fallback to mock data
    }
  }

  // INVOICES
  async getInvoices(): Promise<Invoice[]> {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${this.baseURL}/transactions/invoices`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch invoices');
      }
      
      const data = await response.json();
      return data.invoices;
    } catch (error) {
      console.error('Get invoices error:', error);
      return mockInvoices; // Fallback to mock data
    }
  }

  // DELIVERIES
  async getDeliveries(): Promise<Delivery[]> {
    if (this.useMockData) {
      return mockDeliveries;
    }

    const token = localStorage.getItem('token');
    const response = await fetch(`${this.baseURL}/deliveries`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  }

  // PROMO CODES
  async getPromoCodes(): Promise<PromoCode[]> {
    if (this.useMockData) {
      return mockPromoCodes;
    }

    const token = localStorage.getItem('token');
    const response = await fetch(`${this.baseURL}/promocodes`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  }

  async applyPromoCode(code: string): Promise<{ success: boolean; discount: number; message: string }> {
    if (this.useMockData) {
      const promo = mockPromoCodes.find(p => p.code === code && p.isActive);
      if (!promo) {
        return { success: false, discount: 0, message: 'Промокод не найден или недействителен' };
      }
      return { success: true, discount: promo.discountValue, message: 'Промокод успешно применен!' };
    }

    const token = localStorage.getItem('token');
    const response = await fetch(`${this.baseURL}/promocodes/apply`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ code })
    });
    return response.json();
  }

  // CHATS
  async getChats(): Promise<Chat[]> {
    if (this.useMockData) {
      return mockChats;
    }

    const token = localStorage.getItem('token');
    const response = await fetch(`${this.baseURL}/chats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  }

  async getMessages(chatId: number): Promise<Message[]> {
    if (this.useMockData) {
      // Return mock messages for specific chat
      return [];
    }

    const token = localStorage.getItem('token');
    const response = await fetch(`${this.baseURL}/chats/${chatId}/messages`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  }

  // NOTIFICATIONS
  async getNotifications(): Promise<Notification[]> {
    if (this.useMockData) {
      return mockNotifications;
    }

    const token = localStorage.getItem('token');
    const response = await fetch(`${this.baseURL}/notifications`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch notifications');
    }

    // API возвращает массив напрямую
    return response.json();
  }

  async markNotificationAsRead(id: number): Promise<void> {
    if (this.useMockData) {
      const notification = mockNotifications.find(n => n.id === id);
      if (notification) notification.isRead = true;
      return;
    }

    const token = localStorage.getItem('token');
    await fetch(`${this.baseURL}/notifications/${id}/read`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }

  async markAllNotificationsAsRead(): Promise<void> {
    if (this.useMockData) {
      mockNotifications.forEach(n => n.isRead = true);
      return;
    }

    const token = localStorage.getItem('token');
    await fetch(`${this.baseURL}/notifications/read-all`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }

  // REVIEWS
  async getReviews(): Promise<Review[]> {
    if (this.useMockData) {
      return mockReviews;
    }

    const token = localStorage.getItem('token');
    const response = await fetch(`${this.baseURL}/reviews`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch reviews');
    }

    const data = await response.json();
    return data.reviews || [];
  }

  async createReview(review: Partial<Review>): Promise<Review> {
    if (this.useMockData) {
      const newReview: Review = {
        id: mockReviews.length + 1,
        orderId: review.orderId!,
        orderTitle: review.orderTitle!,
        sellerId: review.sellerId!,
        sellerName: review.sellerName!,
        rating: review.rating!,
        comment: review.comment!,
        pros: review.pros,
        cons: review.cons,
        images: review.images,
        createdAt: new Date().toISOString(),
        isEditable: true
      };
      mockReviews.push(newReview);
      return newReview;
    }

    const token = localStorage.getItem('token');
    const response = await fetch(`${this.baseURL}/reviews`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(review)
    });
    return response.json();
  }

  // SPECIAL OFFERS
  async getSpecialOffers(): Promise<SpecialOffer[]> {
    // Временно используем моковые данные, пока не создан API endpoint
    return mockSpecialOffers.filter(offer => offer.isActive);
    
    /* TODO: Создать API endpoint
    if (this.useMockData) {
      return mockSpecialOffers.filter(offer => offer.isActive);
    }

    const response = await fetch(`${this.baseURL}/offers`);
    return response.json();
    */
  }

  // SETTINGS
  async getSettings(): Promise<UserSettings> {
    // Временно используем моковые данные для клиентов, пока не создан API endpoint
    // Читаем язык из localStorage (синхронизация с Header)
    const savedLanguage = localStorage.getItem('language') as 'ru' | 'kk' | 'en' | null;
    
    return {
      notifications: {
        email: true,
        push: true,
        sms: false,
        orderUpdates: true,
        promotions: true,
        messages: true
      },
      privacy: {
        showProfile: true,
        showOrders: false,
        showReviews: true
      },
      language: savedLanguage || 'ru',
      theme: 'light'
    };
    
    /* TODO: Создать API endpoint для настроек клиента
    if (this.useMockData) {
      const savedLanguage = localStorage.getItem('language') as 'ru' | 'kk' | 'en' | null;
      
      return {
        notifications: {
          email: true,
          push: true,
          sms: false,
          orderUpdates: true,
          promotions: true,
          messages: true
        },
        privacy: {
          showProfile: true,
          showOrders: false,
          showReviews: true
        },
        language: savedLanguage || 'ru',
        theme: 'light'
      };
    }

    const token = localStorage.getItem('token');
    const response = await fetch(`${this.baseURL}/settings`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
    */
  }

  async updateSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
    // Временно используем localStorage, пока не создан API endpoint
    // Сохраняем язык в localStorage для синхронизации с Header
    if (settings.language) {
      localStorage.setItem('language', settings.language);
    }
    return { ...await this.getSettings(), ...settings };
    
    /* TODO: Создать API endpoint для обновления настроек клиента
    if (this.useMockData) {
      if (settings.language) {
        localStorage.setItem('language', settings.language);
      }
      return { ...await this.getSettings(), ...settings };
    }

    const token = localStorage.getItem('token');
    const response = await fetch(`${this.baseURL}/settings`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(settings)
    });
    return response.json();
    */
    return { ...await this.getSettings(), ...settings };
  }

  // FAQ
  async getFAQs(): Promise<FAQItem[]> {
    if (this.useMockData) {
      return mockFAQs;
    }

    const response = await fetch(`${this.baseURL}/faq`);
    return response.json();
  }

  // SUPPORT TICKETS
  async createSupportTicket(ticket: Partial<SupportTicket>): Promise<SupportTicket> {
    if (this.useMockData) {
      const newTicket: SupportTicket = {
        id: Date.now(),
        subject: ticket.subject!,
        description: ticket.description!,
        status: 'open',
        priority: ticket.priority || 'medium',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: []
      };
      return newTicket;
    }

    const token = localStorage.getItem('token');
    const response = await fetch(`${this.baseURL}/support/tickets`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(ticket)
    });
    return response.json();
  }
}

export const appService = new AppService();
