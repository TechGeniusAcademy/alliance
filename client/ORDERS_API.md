# Orders API Integration Guide

## Overview
Все компоненты заказов готовы для интеграции с бэкендом. Сейчас используются моковые данные, но переключение на реальное API занимает одну строчку кода.

## Переключение на реальное API

В файле `client/src/services/orderService.ts` найдите:

```typescript
private useMockData = true; // Переключатель для использования моковых данных
```

Измените на:

```typescript
private useMockData = false; // Использовать реальное API
```

## Backend API Endpoints

### Orders

#### GET /api/orders
Получить все заказы (с фильтрацией)
```
Query params:
- status: string (comma-separated: 'pending,active,in_progress,completed,cancelled')
- furnitureType: string (comma-separated)
- priceMin: number
- priceMax: number
```

#### GET /api/orders/my
Получить мои заказы (требуется авторизация)
```
Headers:
- Authorization: Bearer <token>
```

#### GET /api/orders/:id
Получить заказ по ID
```
Headers:
- Authorization: Bearer <token>
```

#### POST /api/orders
Создать новый заказ
```
Headers:
- Authorization: Bearer <token>
- Content-Type: application/json

Body:
{
  "title": string,
  "furnitureType": string,
  "description": string,
  "price": {
    "min": number,
    "max": number
  },
  "deadline": string (ISO date),
  "materials": string[],
  "dimensions": {
    "width": number,
    "height": number,
    "depth": number
  },
  "deliveryAddress": string,
  "notes": string
}
```

#### PUT /api/orders/:id
Обновить заказ
```
Headers:
- Authorization: Bearer <token>
- Content-Type: application/json

Body: (partial Order object)
```

#### DELETE /api/orders/:id
Удалить заказ
```
Headers:
- Authorization: Bearer <token>
```

### Favorites

#### GET /api/favorites
Получить избранное пользователя
```
Headers:
- Authorization: Bearer <token>
```

#### POST /api/favorites
Добавить в избранное
```
Headers:
- Authorization: Bearer <token>
- Content-Type: application/json

Body:
{
  "orderId": number
}
```

#### DELETE /api/favorites/:orderId
Удалить из избранного
```
Headers:
- Authorization: Bearer <token>
```

## Data Types

### Order
```typescript
interface Order {
  id: number;
  title: string;
  furnitureType: string;
  description: string;
  status: 'pending' | 'active' | 'in_progress' | 'completed' | 'cancelled';
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
```

### Favorite
```typescript
interface Favorite {
  id: number;
  orderId: number;
  userId: number;
  order: Order;
  addedAt: string;
}
```

## Components

### Pages
- `MyOrders.tsx` - Все заказы пользователя
- `ActiveOrders.tsx` - Активные заказы (active + in_progress)
- `OrderHistory.tsx` - История (completed + cancelled)
- `Favorites.tsx` - Избранное

### Components
- `OrderCard.tsx` - Карточка заказа (универсальная)

### Services
- `orderService.ts` - Сервис для работы с API

## Features

✅ Поиск по заказам
✅ Фильтрация по статусу
✅ Добавление/удаление из избранного
✅ Статистика по заказам
✅ Responsive design
✅ Loading states
✅ Empty states
✅ Error handling готов
✅ TypeScript типизация

## Mock Data
8 заказов с разными статусами и 3 избранных для тестирования UI
