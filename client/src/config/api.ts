// Определяем базовый URL API
// Если пользователь зашёл через публичный IP - используем его, иначе localhost
const getApiUrl = () => {
  // Если задана переменная окружения - используем её
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Автоматическое определение: если зашли по IP - используем тот же IP для API
  const hostname = window.location.hostname;
  
  // Если это localhost или 127.0.0.1 - используем localhost
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:5000';
  }
  
  // Иначе используем тот же хост (публичный IP или локальный IP сети)
  return `http://${hostname}:5000`;
};

export const API_BASE_URL = getApiUrl();

// WebSocket URL (можно переопределить отдельно)
export const WS_URL = import.meta.env.VITE_WS_URL || API_BASE_URL;
