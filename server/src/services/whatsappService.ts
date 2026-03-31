import { Client, LocalAuth } from 'whatsapp-web.js';
// @ts-ignore
import qrcode from 'qrcode-terminal';

class WhatsAppService {
  private client: Client | null = null;
  private isReady: boolean = false;

  constructor() {
    this.initializeClient();
  }

  private initializeClient() {
    console.log('🔄 Инициализация WhatsApp клиента...');

    this.client = new Client({
      authStrategy: new LocalAuth({
        dataPath: './whatsapp-session'
      }),
      puppeteer: {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      }
    });

    // Генерация QR кода для первого входа
    this.client.on('qr', (qr) => {
      console.log('📱 Отсканируйте QR код в WhatsApp:');
      qrcode.generate(qr, { small: true });
      console.log('\nОткройте WhatsApp > Настройки > Связанные устройства > Связать устройство');
    });

    // Клиент готов
    this.client.on('ready', () => {
      console.log('✅ WhatsApp клиент готов к работе!');
      this.isReady = true;
    });

    // Аутентификация
    this.client.on('authenticated', () => {
      console.log('🔐 WhatsApp аутентификация успешна');
    });

    // Ошибка аутентификации
    this.client.on('auth_failure', (msg) => {
      console.error('❌ Ошибка аутентификации WhatsApp:', msg);
      this.isReady = false;
    });

    // Отключение
    this.client.on('disconnected', (reason) => {
      console.log(' WhatsApp клиент отключен:', reason);
      this.isReady = false;
    });

    // Запускаем клиент
    this.client.initialize().catch((err) => {
      console.error('❌ Ошибка инициализации WhatsApp:', err);
    });
  }

  /**
   * Отправить уведомление мастеру о новом заказе
   */
  async sendNewOrderNotification(
    phoneNumber: string,
    orderData: {
      id: number;
      title: string;
      category: string;
      description: string;
      budgetMin: number;
      budgetMax: number;
      deadline: string;
      deliveryAddress: string;
    }
  ): Promise<boolean> {
    if (!this.isReady || !this.client) {
      console.error(' WhatsApp клиент не готов');
      return false;
    }

    try {
      // Форматируем номер телефона (убираем все кроме цифр и добавляем код страны)
      let formattedPhone = phoneNumber.replace(/\D/g, '');
      
      // Если номер начинается с 8, заменяем на 7 (для России/Казахстана)
      if (formattedPhone.startsWith('8')) {
        formattedPhone = '7' + formattedPhone.substring(1);
      }
      
      // Если номер не начинается с кода страны, добавляем 7
      if (!formattedPhone.startsWith('7') && formattedPhone.length === 10) {
        formattedPhone = '7' + formattedPhone;
      }

      const chatId = formattedPhone + '@c.us';

      // Проверяем, существует ли номер в WhatsApp
      const numberExists = await this.client.isRegisteredUser(chatId);
      if (!numberExists) {
        console.warn(` Номер ${phoneNumber} не зарегистрирован в WhatsApp`);
        return false;
      }

      // Формируем сообщение
      const message = this.formatNewOrderMessage(orderData);

      // Отправляем сообщение
      await this.client.sendMessage(chatId, message);
      console.log(`✅ Уведомление отправлено мастеру: ${phoneNumber}`);
      return true;
    } catch (error) {
      console.error('❌ Ошибка отправки сообщения WhatsApp:', error);
      return false;
    }
  }

  /**
   * Форматирование сообщения о новом заказе
   */
  private formatNewOrderMessage(orderData: {
    id: number;
    title: string;
    category: string;
    description: string;
    budgetMin: number;
    budgetMax: number;
    deadline: string;
    deliveryAddress: string;
  }): string {
    const budget = orderData.budgetMax 
      ? `${orderData.budgetMin.toLocaleString('ru-RU')} - ${orderData.budgetMax.toLocaleString('ru-RU')} ₸`
      : `от ${orderData.budgetMin.toLocaleString('ru-RU')} ₸`;

    return `🔔 *Новый заказ на аукционе!*

 *Заказ #${orderData.id}*
${orderData.title}

📂 *Категория:* ${this.translateCategory(orderData.category)}

📝 *Описание:*
${orderData.description}

💰 *Бюджет:* ${budget}

📅 *Срок выполнения:* ${new Date(orderData.deadline).toLocaleDateString('ru-RU')}

📍 *Адрес доставки:* ${orderData.deliveryAddress}

🔗 *Сделайте ставку:* http://localhost:5173/master/commissions

_Не упустите возможность получить новый заказ!_ ⚡`;
  }

  /**
   * Отправить уведомление о принятой ставке
   */
  async sendBidAcceptedNotification(
    phoneNumber: string,
    orderData: {
      id: number;
      title: string;
      acceptedPrice: number;
      customerName: string;
    }
  ): Promise<boolean> {
    if (!this.isReady || !this.client) {
      console.error(' WhatsApp клиент не готов');
      return false;
    }

    try {
      let formattedPhone = phoneNumber.replace(/\D/g, '');
      if (formattedPhone.startsWith('8')) {
        formattedPhone = '7' + formattedPhone.substring(1);
      }
      if (!formattedPhone.startsWith('7') && formattedPhone.length === 10) {
        formattedPhone = '7' + formattedPhone;
      }

      const chatId = formattedPhone + '@c.us';

      const message = `🎉 *Поздравляем! Ваша ставка принята!*

 *Заказ #${orderData.id}*
${orderData.title}

💰 *Сумма:* ${orderData.acceptedPrice.toLocaleString('ru-RU')} ₸

👤 *Заказчик:* ${orderData.customerName}

🔗 *Перейти к заказу:* http://localhost:5173/master/orders/${orderData.id}

_Начинайте работу над проектом!_ 🚀`;

      await this.client.sendMessage(chatId, message);
      console.log(`✅ Уведомление о принятой ставке отправлено: ${phoneNumber}`);
      return true;
    } catch (error) {
      console.error('❌ Ошибка отправки уведомления о ставке:', error);
      return false;
    }
  }

  /**
   * Отправить уведомление клиенту о новой ставке на его заказ
   */
  async sendNewBidNotification(
    phoneNumber: string,
    bidData: {
      orderId: number;
      orderTitle: string;
      masterName: string;
      masterRating: number;
      proposedPrice: number;
      estimatedDays: number;
      comment: string;
      completedProjectsCount: number;
    }
  ): Promise<boolean> {
    if (!this.isReady || !this.client) {
      console.error('⚠️ WhatsApp клиент не готов');
      return false;
    }

    try {
      // Форматируем номер телефона
      let formattedPhone = phoneNumber.replace(/\D/g, '');
      if (formattedPhone.startsWith('8')) {
        formattedPhone = '7' + formattedPhone.substring(1);
      }
      if (!formattedPhone.startsWith('7') && formattedPhone.length === 10) {
        formattedPhone = '7' + formattedPhone;
      }

      const chatId = formattedPhone + '@c.us';

      // Проверяем, существует ли номер в WhatsApp
      const numberExists = await this.client.isRegisteredUser(chatId);
      if (!numberExists) {
        console.warn(`⚠️ Номер ${phoneNumber} не зарегистрирован в WhatsApp`);
        return false;
      }

      // Формируем сообщение
      const ratingStars = '⭐'.repeat(Math.round(bidData.masterRating));
      const message = `🔔 *Новый отклик на ваш заказ!*

📋 *Заказ #${bidData.orderId}*
${bidData.orderTitle}

👨‍🔧 *Мебельщик:* ${bidData.masterName}
${ratingStars} *${bidData.masterRating.toFixed(1)}* (${bidData.completedProjectsCount} выполненных заказов)

💰 *Предложенная цена:* ${bidData.proposedPrice.toLocaleString('ru-RU')} ₸
⏱ *Срок выполнения:* ${bidData.estimatedDays} ${this.getDaysWord(bidData.estimatedDays)}

${bidData.comment ? `💬 *Комментарий мебельщика:*\n"${bidData.comment}"\n` : ''}
🔗 *Смотреть все отклики:* http://localhost:5173/orders/${bidData.orderId}/bids

_Выберите лучшее предложение!_ ✨`;

      await this.client.sendMessage(chatId, message);
      console.log(`✅ Уведомление о новой ставке отправлено клиенту: ${phoneNumber}`);
      return true;
    } catch (error) {
      console.error('❌ Ошибка отправки уведомления о ставке клиенту:', error);
      return false;
    }
  }

  /**
   * Вспомогательная функция для склонения слова "день"
   */
  private getDaysWord(days: number): string {
    if (days % 10 === 1 && days % 100 !== 11) {
      return 'день';
    } else if ([2, 3, 4].includes(days % 10) && ![12, 13, 14].includes(days % 100)) {
      return 'дня';
    } else {
      return 'дней';
    }
  }

  /**
   * Отправить массовое уведомление всем мастерам
   */
  async sendBulkNotifications(
    masters: Array<{ phone: string; orderData: any }>,
    delay: number = 2000
  ): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const master of masters) {
      const sent = await this.sendNewOrderNotification(master.phone, master.orderData);
      if (sent) {
        success++;
      } else {
        failed++;
      }

      // Задержка между отправками, чтобы избежать блокировки
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    console.log(`Результаты массовой рассылки: успешно ${success}, ошибок ${failed}`);
    return { success, failed };
  }

  /**
   * Отправить уведомление клиенту о завершении этапа работы
   */
  async sendWorkStageNotification(
    phoneNumber: string,
    orderData: {
      id: number;
      title: string;
      stage: string;
      stageName: string;
      masterName: string;
    }
  ): Promise<boolean> {
    if (!this.isReady || !this.client) {
      console.error(' WhatsApp клиент не готов');
      return false;
    }

    try {
      let formattedPhone = phoneNumber.replace(/\D/g, '');
      if (formattedPhone.startsWith('8')) {
        formattedPhone = '7' + formattedPhone.substring(1);
      }
      if (!formattedPhone.startsWith('7') && formattedPhone.length === 10) {
        formattedPhone = '7' + formattedPhone;
      }

      const chatId = formattedPhone + '@c.us';

      const numberExists = await this.client.isRegisteredUser(chatId);
      if (!numberExists) {
        console.warn(` Номер ${phoneNumber} не зарегистрирован в WhatsApp`);
        return false;
      }

      const stageEmojis: { [key: string]: string } = {
        'design': '📐',
        'materials': '🛒',
        'production': '🔨',
        'assembly': '🔧',
        'quality_check': '✅',
        'packaging': '📦',
        'ready_for_delivery': '🚚'
      };

      const emoji = stageEmojis[orderData.stage] || '✔️';

      const message = `${emoji} *Обновление по заказу!*

 *Заказ #${orderData.id}*
${orderData.title}

📋 *Этап:* ${orderData.stageName}

👨‍🔧 *Мастер:* ${orderData.masterName}

_Работа продвигается по плану!_ 🎯

🔗 *Подробнее:* http://localhost:5173/dashboard/active-orders`;

      await this.client.sendMessage(chatId, message);
      console.log(`✅ Уведомление об этапе "${orderData.stage}" отправлено: ${phoneNumber}`);
      return true;
    } catch (error) {
      console.error('❌ Ошибка отправки уведомления об этапе:', error);
      return false;
    }
  }

  /**
   * Перевод категорий на русский
   */
  private translateCategory(category: string): string {
    const translations: { [key: string]: string } = {
      'kitchen': 'Кухня',
      'bedroom': 'Спальня',
      'living-room': 'Гостиная',
      'office': 'Офисная мебель',
      'wardrobe': 'Шкафы и гардеробы',
      'children': 'Детская мебель',
      'bathroom': 'Ванная комната',
      'other': 'Другое'
    };
    return translations[category] || category;
  }

  /**
   * Проверка готовности клиента
   */
  isClientReady(): boolean {
    return this.isReady;
  }

  /**
   * Отключение клиента
   */
  async disconnect() {
    if (this.client) {
      await this.client.destroy();
      this.isReady = false;
      console.log('WhatsApp клиент отключен');
    }
  }
}

// Создаем единственный экземпляр сервиса
const whatsappService = new WhatsAppService();

export default whatsappService;
