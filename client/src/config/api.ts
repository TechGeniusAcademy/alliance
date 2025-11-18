// Определяем базовый URL API
// В разработке можно изменить на IP вашего компьютера для тестирования по локальной сети
// Например: 'http://192.168.1.100:5000'
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// WebSocket URL (обычно совпадает с API URL)
export const WS_URL = API_BASE_URL;
