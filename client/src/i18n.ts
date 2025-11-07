import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  ru: {
    translation: {
      nav: {
        home: 'Главная',
        about: 'О нас',
        services: 'Услуги',
        contact: 'Контакты',
      },
      auth: {
        login: 'Вход',
        email: 'Email',
        password: 'Пароль',
        submit: 'Войти',
        noAccount: 'Нет аккаунта?',
        register: 'Регистрация',
        name: 'Имя',
        registerSubmit: 'Зарегистрироваться',
        haveAccount: 'Уже есть аккаунт?',
        loginLink: 'Войти',
      },
      sidebar: {
        // Categories
        main: 'Основное',
        orders: 'Заказы',
        financial: 'Финансы',
        communication: 'Общение',
        account: 'Аккаунт',
        
        // Main section
        dashboard: 'Главная',
        createOrder: 'Создать заказ',
        aiDesigner: 'AI Дизайнер',
        
        // Orders section
        myOrders: 'Мои заказы',
        activeOrders: 'Активные заказы',
        orderHistory: 'История заказов',
        favorites: 'Избранное',
        
        // Financial section
        payments: 'Платежи',
        invoices: 'Счета',
        delivery: 'Доставка',
        promocodes: 'Промокоды',
        
        // Communication section
        chats: 'Чаты',
        notifications: 'Уведомления',
        reviews: 'Отзывы',
        specialOffers: 'Спецпредложения',
        
        // Account section
        profile: 'Профиль',
        settings: 'Настройки',
        help: 'Помощь',
        logout: 'Выход',
      },
      settings: {
        title: 'Настройки',
        saveButton: 'Сохранить изменения',
        saving: 'Сохранение...',
        saved: 'Настройки сохранены!',
        error: 'Ошибка при сохранении настроек',
        
        // Notifications section
        notificationsTitle: 'Уведомления',
        emailNotifications: 'Email уведомления',
        emailNotificationsDesc: 'Получать уведомления на электронную почту',
        pushNotifications: 'Push-уведомления',
        pushNotificationsDesc: 'Показывать всплывающие уведомления в браузере',
        smsNotifications: 'SMS уведомления',
        smsNotificationsDesc: 'Получать уведомления по SMS',
        orderUpdates: 'Обновления заказов',
        orderUpdatesDesc: 'Уведомления о статусе заказов',
        promotions: 'Акции и предложения',
        promotionsDesc: 'Информация о скидках и специальных предложениях',
        messages: 'Новые сообщения',
        messagesDesc: 'Уведомления о новых сообщениях в чате',
        
        // Privacy section
        privacyTitle: 'Приватность',
        showProfile: 'Показывать профиль',
        showProfileDesc: 'Ваш профиль будет виден другим пользователям',
        showOrders: 'Показывать заказы',
        showOrdersDesc: 'Ваши заказы будут видны в публичном профиле',
        showReviews: 'Показывать отзывы',
        showReviewsDesc: 'Ваши отзывы будут видны всем',
        
        // Language section
        languageTitle: 'Язык',
        languageInterface: 'Язык интерфейса',
        languageInterfaceDesc: 'Выберите предпочитаемый язык (применяется мгновенно)',
        russian: 'Русский',
        kazakh: 'Қазақша',
        english: 'English',
        
        // Theme section
        themeTitle: 'Тема',
        themeInterface: 'Оформление',
        themeInterfaceDesc: 'Выберите тему оформления',
        light: 'Светлая',
        dark: 'Темная',
        auto: 'Авто (системная)',
      },
      admin: {
        title: 'Админ панель',
        appTitle: 'Furniture Auction Admin',
        adminRole: 'Администратор',
        users: 'Пользователи',
        auctions: 'Аукционы',
        ratings: 'Рейтинг продавцов',
        statistics: 'Статистика',
        notifications: 'Уведомления',
        totalUsers: 'Всего пользователей',
        activeUsers: 'Активные',
        bannedUsers: 'Заблокированные',
        newUsers: 'Новых за месяц',
        name: 'Имя',
        email: 'Email',
        role: 'Роль',
        status: 'Статус',
        actions: 'Действия',
        active: 'Активен',
        banned: 'Заблокирован',
        block: 'Заблокировать',
        unblock: 'Разблокировать',
        createUser: 'Создать пользователя',
        edit: 'Редактировать',
        delete: 'Удалить',
        save: 'Сохранить',
        create: 'Создать',
        cancel: 'Отмена',
        customer: 'Заказчик',
        master: 'Мебельщик',
        admin: 'Администратор',
        registeredAt: 'Дата регистрации',
        password: 'Пароль',
        newPassword: 'Новый пароль',
        phone: 'Телефон',
        address: 'Адрес',
        totalAuctions: 'Всего аукционов',
        activeAuctions: 'Активные',
        completedAuctions: 'Завершённые',
        cancelledAuctions: 'Отменённые',
        pending: 'В ожидании',
        inProgress: 'В процессе',
        completed: 'Завершён',
        cancelled: 'Отменён',
        client: 'Клиент',
        furniture: 'Мебель',
        price: 'Цена',
        bidsCount: 'Ставок',
        viewDetails: 'Подробнее',
        seller: 'Продавец',
        rating: 'Рейтинг',
        completedOrders: 'Выполнено заказов',
        avgPrice: 'Средняя цена',
        totalRevenue: 'Общая выручка',
        avgOrderValue: 'Средний чек',
        conversionRate: 'Конверсия',
        unreadNotifications: 'Непрочитанные уведомления',
        markAllRead: 'Отметить все как прочитанные',
        newUser: 'Новый пользователь',
        newAuction: 'Новый аукцион',
        newBid: 'Новая ставка',
        systemAlert: 'Системное уведомление',
        agoMinutes: 'мин назад',
        agoHours: 'ч назад',
      },
      masterSidebar: {
        title: 'Мебельщик',
        subtitle: 'Личный кабинет',
        
        // Разделы
        mainSection: 'Главное',
        ordersSection: 'Работа',
        financeSection: 'Финансы',
        communicationSection: 'Общение',
        reputationSection: 'Репутация',
        settingsSection: 'Настройки',
        
        // Главное
        dashboard: 'Главная',
        
        // Работа с заказами
        auctions: 'Аукционы',
        activeOrders: 'Активные заказы',
        allOrders: 'Все заказы',
        orders: 'Все заказы',
        history: 'История',
        schedule: 'Расписание',
        
        // Финансы
        earnings: 'Доходы',
        invoices: 'Счета',
        statistics: 'Статистика',
        
        // Коммуникация
        chats: 'Чаты',
        notifications: 'Уведомления',
        
        // Репутация
        ratings: 'Рейтинг и отзывы',
        portfolio: 'Портфолио',
        clients: 'Клиенты',
        
        // Настройки
        profile: 'Профиль',
        settings: 'Настройки',
        help: 'Помощь',
        
        logout: 'Выход',
        masterRole: 'Мастер',
        
        // Старые (для обратной совместимости)
        auctionHistory: 'История аукционов',
      },
      masterDashboard: {
        title: 'Добро пожаловать!',
        subtitle: 'Обзор вашей деятельности',
        activeOrders: 'Активные заказы',
        completedOrders: 'Выполнено заказов',
        rating: 'Рейтинг',
        earnings: 'Заработано',
        pendingBids: 'Ожидающие ставки',
        growth: 'Рост',
        recentActivity: 'Последняя активность',
        newOrder: 'Новый заказ',
        orderCompleted: 'Заказ выполнен',
        newReview: 'Новый отзыв',
      },
    },
  },
  kk: {
    translation: {
      nav: {
        home: 'Басты бет',
        about: 'Біз туралы',
        services: 'Қызметтер',
        contact: 'Байланыс',
      },
      auth: {
        login: 'Кіру',
        email: 'Email',
        password: 'Құпия сөз',
        submit: 'Кіру',
        noAccount: 'Аккаунт жоқ па?',
        register: 'Тіркелу',
        name: 'Аты',
        registerSubmit: 'Тіркелу',
        haveAccount: 'Аккаунт бар ма?',
        loginLink: 'Кіру',
      },
      sidebar: {
        // Categories
        main: 'Негізгі',
        orders: 'Тапсырыстар',
        financial: 'Қаржы',
        communication: 'Қарым-қатынас',
        account: 'Аккаунт',
        
        // Main section
        dashboard: 'Басты бет',
        createOrder: 'Тапсырыс жасау',
        aiDesigner: 'AI Дизайнер',
        
        // Orders section
        myOrders: 'Менің тапсырыстарым',
        activeOrders: 'Белсенді тапсырыстар',
        orderHistory: 'Тапсырыстар тарихы',
        favorites: 'Таңдаулылар',
        
        // Financial section
        payments: 'Төлемдер',
        invoices: 'Шоттар',
        delivery: 'Жеткізу',
        promocodes: 'Промокодтар',
        
        // Communication section
        chats: 'Чаттар',
        notifications: 'Хабарламалар',
        reviews: 'Пікірлер',
        specialOffers: 'Арнайы ұсыныстар',
        
        // Account section
        profile: 'Профиль',
        settings: 'Баптаулар',
        help: 'Көмек',
        logout: 'Шығу',
      },
      settings: {
        title: 'Баптаулар',
        saveButton: 'Өзгерістерді сақтау',
        saving: 'Сақталуда...',
        saved: 'Баптаулар сақталды!',
        error: 'Баптауларды сақтау кезінде қате',
        
        // Notifications section
        notificationsTitle: 'Хабарламалар',
        emailNotifications: 'Email хабарламалары',
        emailNotificationsDesc: 'Электрондық поштаға хабарламалар алу',
        pushNotifications: 'Push-хабарламалар',
        pushNotificationsDesc: 'Браузерде қалқымалы хабарламаларды көрсету',
        smsNotifications: 'SMS хабарламалары',
        smsNotificationsDesc: 'SMS арқылы хабарламалар алу',
        orderUpdates: 'Тапсырыстар жаңартулары',
        orderUpdatesDesc: 'Тапсырыстар мәртебесі туралы хабарламалар',
        promotions: 'Акциялар мен ұсыныстар',
        promotionsDesc: 'Жеңілдіктер мен арнайы ұсыныстар туралы ақпарат',
        messages: 'Жаңа хабарламалар',
        messagesDesc: 'Чаттағы жаңа хабарламалар туралы хабарландырулар',
        
        // Privacy section
        privacyTitle: 'Құпиялық',
        showProfile: 'Профильді көрсету',
        showProfileDesc: 'Сіздің профиліңіз басқа пайдаланушыларға көрінетін болады',
        showOrders: 'Тапсырыстарды көрсету',
        showOrdersDesc: 'Сіздің тапсырыстарыңыз публикалық профильде көрінетін болады',
        showReviews: 'Пікірлерді көрсету',
        showReviewsDesc: 'Сіздің пікірлеріңіз барлығына көрінетін болады',
        
        // Language section
        languageTitle: 'Тіл',
        languageInterface: 'Интерфейс тілі',
        languageInterfaceDesc: 'Қалаған тілді таңдаңыз (лезде қолданылады)',
        russian: 'Русский',
        kazakh: 'Қазақша',
        english: 'English',
        
        // Theme section
        themeTitle: 'Тақырып',
        themeInterface: 'Безендіру',
        themeInterfaceDesc: 'Безендіру тақырыбын таңдаңыз',
        light: 'Ашық',
        dark: 'Қараңғы',
        auto: 'Авто (жүйелік)',
      },
      admin: {
        title: 'Админ панелі',
        appTitle: 'Furniture Auction Admin',
        adminRole: 'Әкімші',
        users: 'Пайдаланушылар',
        auctions: 'Аукциондар',
        ratings: 'Сатушылардың рейтингі',
        statistics: 'Статистика',
        notifications: 'Хабарламалар',
        totalUsers: 'Барлық пайдаланушылар',
        activeUsers: 'Белсенді',
        bannedUsers: 'Бұғатталған',
        newUsers: 'Жаңа ай ішінде',
        name: 'Аты',
        email: 'Email',
        role: 'Рөл',
        status: 'Мәртебе',
        actions: 'Әрекеттер',
        active: 'Белсенді',
        banned: 'Бұғатталған',
        block: 'Бұғаттау',
        unblock: 'Бұғаттан шығару',
        createUser: 'Пайдаланушы жасау',
        edit: 'Өзгерту',
        delete: 'Жою',
        save: 'Сақтау',
        create: 'Жасау',
        cancel: 'Болдырмау',
        customer: 'Тапсырыс беруші',
        master: 'Жиһазшы',
        admin: 'Әкімші',
        registeredAt: 'Тіркелген күні',
        password: 'Құпия сөз',
        newPassword: 'Жаңа құпия сөз',
        phone: 'Телефон',
        address: 'Мекен-жай',
        totalAuctions: 'Барлық аукциондар',
        activeAuctions: 'Белсенді',
        completedAuctions: 'Аяқталған',
        cancelledAuctions: 'Болдырылмаған',
        pending: 'Күтуде',
        inProgress: 'Процесте',
        completed: 'Аяқталды',
        cancelled: 'Болдырылмады',
        client: 'Клиент',
        furniture: 'Жиһаз',
        price: 'Баға',
        bidsCount: 'Ставкалар',
        viewDetails: 'Толығырақ',
        seller: 'Сатушы',
        rating: 'Рейтинг',
        completedOrders: 'Орындалған тапсырыстар',
        avgPrice: 'Орташа баға',
        totalRevenue: 'Жалпы түсім',
        avgOrderValue: 'Орташа чек',
        conversionRate: 'Конверсия',
        unreadNotifications: 'Оқылмаған хабарламалар',
        markAllRead: 'Барлығын оқылған деп белгілеу',
        newUser: 'Жаңа пайдаланушы',
        newAuction: 'Жаңа аукцион',
        newBid: 'Жаңа ставка',
        systemAlert: 'Жүйелік хабарлама',
        agoMinutes: 'мин бұрын',
        agoHours: 'сағ бұрын',
      },
      masterSidebar: {
        title: 'Жиһазшы',
        subtitle: 'Жеке кабинет',
        
        // Разделы
        mainSection: 'Басты',
        ordersSection: 'Жұмыс',
        financeSection: 'Қаржы',
        communicationSection: 'Байланыс',
        reputationSection: 'Беделі',
        settingsSection: 'Баптаулар',
        
        // Главное
        dashboard: 'Басты бет',
        
        // Работа с заказами
        auctions: 'Аукциондар',
        activeOrders: 'Белсенді тапсырыстар',
        allOrders: 'Барлық тапсырыстар',
        orders: 'Барлық тапсырыстар',
        history: 'Тарих',
        schedule: 'Кесте',
        
        // Финансы
        earnings: 'Табыс',
        invoices: 'Шоттар',
        statistics: 'Статистика',
        
        // Коммуникация
        chats: 'Чаттар',
        notifications: 'Хабарламалар',
        
        // Репутация
        ratings: 'Рейтинг және пікірлер',
        portfolio: 'Портфолио',
        clients: 'Клиенттер',
        
        // Настройки
        profile: 'Профиль',
        settings: 'Баптаулар',
        help: 'Көмек',
        
        logout: 'Шығу',
        masterRole: 'Шебер',
        
        // Старые (для обратной совместимости)
        auctionHistory: 'Аукциондар тарихы',
      },
      masterDashboard: {
        title: 'Қош келдіңіз!',
        subtitle: 'Қызметіңіздің шолуы',
        activeOrders: 'Белсенді тапсырыстар',
        completedOrders: 'Орындалған тапсырыстар',
        rating: 'Рейтинг',
        earnings: 'Табыс',
        pendingBids: 'Күтудегі ставкалар',
        growth: 'Өсім',
        recentActivity: 'Соңғы белсенділік',
        newOrder: 'Жаңа тапсырыс',
        orderCompleted: 'Тапсырыс орындалды',
        newReview: 'Жаңа пікір',
      },
    },
  },
  en: {
    translation: {
      nav: {
        home: 'Home',
        about: 'About',
        services: 'Services',
        contact: 'Contact',
      },
      auth: {
        login: 'Login',
        email: 'Email',
        password: 'Password',
        submit: 'Sign In',
        noAccount: "Don't have an account?",
        register: 'Register',
        name: 'Name',
        registerSubmit: 'Sign Up',
        haveAccount: 'Already have an account?',
        loginLink: 'Login',
      },
      sidebar: {
        // Categories
        main: 'Main',
        orders: 'Orders',
        financial: 'Financial',
        communication: 'Communication',
        account: 'Account',
        
        // Main section
        dashboard: 'Dashboard',
        createOrder: 'Create Order',
        aiDesigner: 'AI Designer',
        
        // Orders section
        myOrders: 'My Orders',
        activeOrders: 'Active Orders',
        orderHistory: 'Order History',
        favorites: 'Favorites',
        
        // Financial section
        payments: 'Payments',
        invoices: 'Invoices',
        delivery: 'Delivery',
        promocodes: 'Promo Codes',
        
        // Communication section
        chats: 'Chats',
        notifications: 'Notifications',
        reviews: 'Reviews',
        specialOffers: 'Special Offers',
        
        // Account section
        profile: 'Profile',
        settings: 'Settings',
        help: 'Help',
        logout: 'Logout',
      },
      settings: {
        title: 'Settings',
        saveButton: 'Save Changes',
        saving: 'Saving...',
        saved: 'Settings saved!',
        error: 'Error saving settings',
        
        // Notifications section
        notificationsTitle: 'Notifications',
        emailNotifications: 'Email notifications',
        emailNotificationsDesc: 'Receive notifications via email',
        pushNotifications: 'Push notifications',
        pushNotificationsDesc: 'Show pop-up notifications in browser',
        smsNotifications: 'SMS notifications',
        smsNotificationsDesc: 'Receive notifications via SMS',
        orderUpdates: 'Order updates',
        orderUpdatesDesc: 'Notifications about order status',
        promotions: 'Promotions and offers',
        promotionsDesc: 'Information about discounts and special offers',
        messages: 'New messages',
        messagesDesc: 'Notifications about new chat messages',
        
        // Privacy section
        privacyTitle: 'Privacy',
        showProfile: 'Show profile',
        showProfileDesc: 'Your profile will be visible to other users',
        showOrders: 'Show orders',
        showOrdersDesc: 'Your orders will be visible in public profile',
        showReviews: 'Show reviews',
        showReviewsDesc: 'Your reviews will be visible to everyone',
        
        // Language section
        languageTitle: 'Language',
        languageInterface: 'Interface language',
        languageInterfaceDesc: 'Select preferred language (applies immediately)',
        russian: 'Русский',
        kazakh: 'Қазақша',
        english: 'English',
        
        // Theme section
        themeTitle: 'Theme',
        themeInterface: 'Appearance',
        themeInterfaceDesc: 'Select appearance theme',
        light: 'Light',
        dark: 'Dark',
        auto: 'Auto (system)',
      },
      admin: {
        title: 'Admin Panel',
        appTitle: 'Furniture Auction Admin',
        adminRole: 'Administrator',
        users: 'Users',
        auctions: 'Auctions',
        ratings: 'Seller Ratings',
        statistics: 'Statistics',
        notifications: 'Notifications',
        totalUsers: 'Total Users',
        activeUsers: 'Active',
        bannedUsers: 'Banned',
        newUsers: 'New this Month',
        name: 'Name',
        email: 'Email',
        role: 'Role',
        status: 'Status',
        actions: 'Actions',
        active: 'Active',
        banned: 'Banned',
        block: 'Block',
        unblock: 'Unblock',
        createUser: 'Create User',
        edit: 'Edit',
        delete: 'Delete',
        save: 'Save',
        create: 'Create',
        cancel: 'Cancel',
        customer: 'Customer',
        master: 'Furniture Maker',
        admin: 'Administrator',
        registeredAt: 'Registered',
        password: 'Password',
        newPassword: 'New Password',
        phone: 'Phone',
        address: 'Address',
        totalAuctions: 'Total Auctions',
        activeAuctions: 'Active',
        completedAuctions: 'Completed',
        cancelledAuctions: 'Cancelled',
        pending: 'Pending',
        inProgress: 'In Progress',
        completed: 'Completed',
        cancelled: 'Cancelled',
        client: 'Client',
        furniture: 'Furniture',
        price: 'Price',
        bidsCount: 'Bids',
        viewDetails: 'View Details',
        seller: 'Seller',
        rating: 'Rating',
        completedOrders: 'Completed Orders',
        avgPrice: 'Average Price',
        totalRevenue: 'Total Revenue',
        avgOrderValue: 'Avg Order Value',
        conversionRate: 'Conversion Rate',
        unreadNotifications: 'Unread Notifications',
        markAllRead: 'Mark All as Read',
        newUser: 'New User',
        newAuction: 'New Auction',
        newBid: 'New Bid',
        systemAlert: 'System Alert',
        agoMinutes: 'min ago',
        agoHours: 'h ago',
      },
      masterSidebar: {
        title: 'Furniture Master',
        subtitle: 'Personal Cabinet',
        
        // Sections
        mainSection: 'Main',
        ordersSection: 'Work',
        financeSection: 'Finance',
        communicationSection: 'Communication',
        reputationSection: 'Reputation',
        settingsSection: 'Settings',
        
        // Main
        dashboard: 'Dashboard',
        
        // Work with orders
        auctions: 'Auctions',
        activeOrders: 'Active Orders',
        allOrders: 'All Orders',
        orders: 'All Orders',
        history: 'History',
        schedule: 'Schedule',
        
        // Finance
        earnings: 'Earnings',
        invoices: 'Invoices',
        statistics: 'Statistics',
        
        // Communication
        chats: 'Chats',
        notifications: 'Notifications',
        
        // Reputation
        ratings: 'Ratings & Reviews',
        portfolio: 'Portfolio',
        clients: 'Clients',
        
        // Settings
        profile: 'Profile',
        settings: 'Settings',
        help: 'Help',
        
        logout: 'Logout',
        masterRole: 'Master',
        
        // Old (for backward compatibility)
        auctionHistory: 'Auction History',
      },
      masterDashboard: {
        title: 'Welcome!',
        subtitle: 'Overview of your activity',
        activeOrders: 'Active Orders',
        completedOrders: 'Completed Orders',
        rating: 'Rating',
        earnings: 'Earnings',
        pendingBids: 'Pending Bids',
        growth: 'Growth',
        recentActivity: 'Recent Activity',
        newOrder: 'New Order',
        orderCompleted: 'Order Completed',
        newReview: 'New Review',
      },
    },
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
