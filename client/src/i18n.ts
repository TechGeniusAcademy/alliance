import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Импортируем переводы из отдельных файлов
import ru from './locales/ru.json';
import kk from './locales/kk.json';
import en from './locales/en.json';

const resources = {
  ru: {
    translation: ru,
  },
  kk: {
    translation: kk,
  },
  en: {
    translation: en,
  },
};


i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'ru',
    fallbackLng: 'ru',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
