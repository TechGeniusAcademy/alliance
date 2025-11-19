import { Request, Response } from 'express';
import pool from '../config/database';
import PdfPrinter from 'pdfmake';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import * as path from 'path';

// Получить данные о доходах мастера
export const getMasterIncome = async (req: Request, res: Response) => {
  try {
    const masterId = req.userId;
    const { period } = req.query;

    if (!masterId) {
      return res.status(401).json({ message: 'Не авторизован' });
    }

    // Определяем диапазон дат в зависимости от периода
    let dateFilter = '';
    const now = new Date();

    switch (period) {
      case 'today':
        dateFilter = `AND DATE(o.updated_at) = CURRENT_DATE`;
        break;
      case 'week':
        dateFilter = `AND o.updated_at >= NOW() - INTERVAL '7 days'`;
        break;
      case 'month':
        dateFilter = `AND DATE_TRUNC('month', o.updated_at) = DATE_TRUNC('month', CURRENT_DATE)`;
        break;
      case 'quarter':
        dateFilter = `AND DATE_TRUNC('quarter', o.updated_at) = DATE_TRUNC('quarter', CURRENT_DATE)`;
        break;
      case 'year':
        dateFilter = `AND DATE_TRUNC('year', o.updated_at) = DATE_TRUNC('year', CURRENT_DATE)`;
        break;
      default:
        dateFilter = ''; // Все время
    }

    // Получаем завершенные заказы с расчетом комиссии
    const ordersResult = await pool.query(
      `SELECT 
        o.id as order_id,
        o.title as order_title,
        o.final_price as order_amount,
        o.updated_at as completed_date,
        u.name as customer_name,
        ct.commission_rate,
        ct.commission_amount,
        ct.status as payment_status,
        (o.final_price - COALESCE(ct.commission_amount, 0)) as net_income,
        CASE WHEN o.id IS NOT NULL THEN true ELSE false END as invoice_generated,
        CASE WHEN o.id IS NOT NULL THEN true ELSE false END as act_generated
       FROM orders o
       JOIN users u ON o.customer_id = u.id
       LEFT JOIN commission_transactions ct ON ct.order_id = o.id AND ct.master_id = $1
       WHERE o.assigned_master_id = $1 
         AND o.status = 'completed'
         AND o.final_price IS NOT NULL
         ${dateFilter}
       ORDER BY o.updated_at DESC`,
      [masterId]
    );

    // Рассчитываем общую статистику
    const totalIncome = ordersResult.rows.reduce((sum, row) => sum + parseFloat(row.order_amount || 0), 0);
    const totalCommission = ordersResult.rows.reduce((sum, row) => sum + parseFloat(row.commission_amount || 0), 0);
    const netIncome = totalIncome - totalCommission;

    // Доход за этот месяц
    const thisMonthResult = await pool.query(
      `SELECT COALESCE(SUM(o.final_price - COALESCE(ct.commission_amount, 0)), 0) as income
       FROM orders o
       LEFT JOIN commission_transactions ct ON ct.order_id = o.id AND ct.master_id = $1
       WHERE o.assigned_master_id = $1 
         AND o.status = 'completed'
         AND DATE_TRUNC('month', o.updated_at) = DATE_TRUNC('month', CURRENT_DATE)`,
      [masterId]
    );

    // Доход за прошлый месяц
    const lastMonthResult = await pool.query(
      `SELECT COALESCE(SUM(o.final_price - COALESCE(ct.commission_amount, 0)), 0) as income
       FROM orders o
       LEFT JOIN commission_transactions ct ON ct.order_id = o.id AND ct.master_id = $1
       WHERE o.assigned_master_id = $1 
         AND o.status = 'completed'
         AND DATE_TRUNC('month', o.updated_at) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')`,
      [masterId]
    );

    const summary = {
      totalIncome,
      totalCommission,
      netIncome,
      ordersCount: ordersResult.rows.length,
      averageOrder: ordersResult.rows.length > 0 ? totalIncome / ordersResult.rows.length : 0,
      thisMonthIncome: parseFloat(thisMonthResult.rows[0]?.income || 0),
      lastMonthIncome: parseFloat(lastMonthResult.rows[0]?.income || 0)
    };

    res.json({
      orders: ordersResult.rows,
      summary
    });
  } catch (error) {
    console.error('Get master income error:', error);
    res.status(500).json({ message: 'Ошибка при получении данных о доходах' });
  }
};

// Сгенерировать и скачать счет
export const downloadInvoice = async (req: Request, res: Response) => {
  try {
    const masterId = req.userId;
    const { orderId } = req.params;

    // Получаем данные заказа
    const orderResult = await pool.query(
      `SELECT 
        o.*,
        u.name as customer_name,
        u.email as customer_email,
        u.phone as customer_phone,
        m.name as master_name,
        ct.commission_rate,
        ct.commission_amount
       FROM orders o
       JOIN users u ON o.customer_id = u.id
       JOIN users m ON o.assigned_master_id = m.id
       LEFT JOIN commission_transactions ct ON ct.order_id = o.id
       WHERE o.id = $1 AND o.assigned_master_id = $2`,
      [orderId, masterId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ message: 'Заказ не найден' });
    }

    const order = orderResult.rows[0];

    // Определяем шрифты с поддержкой кириллицы
    const fontsPath = path.join(__dirname, '../../node_modules/roboto-font/fonts/Roboto');
    const fonts = {
      Roboto: {
        normal: path.join(fontsPath, 'roboto-regular-webfont.ttf'),
        bold: path.join(fontsPath, 'roboto-bold-webfont.ttf'),
        italics: path.join(fontsPath, 'roboto-italic-webfont.ttf'),
        bolditalics: path.join(fontsPath, 'roboto-bolditalic-webfont.ttf')
      }
    };

    const printer = new PdfPrinter(fonts);

    // Определяем структуру документа с кириллицей
    const docDefinition: TDocumentDefinitions = {
      content: [
        { text: 'СЧЕТ НА ОПЛАТУ', style: 'header', alignment: 'center' },
        { text: `№ ${orderId} от ${new Date(order.created_at).toLocaleDateString('ru-RU')}`, style: 'subheader', alignment: 'center', margin: [0, 10, 0, 20] },
        
        { text: 'Исполнитель:', style: 'sectionHeader' },
        { text: order.master_name, margin: [0, 5, 0, 15] },
        
        { text: 'Заказчик:', style: 'sectionHeader' },
        { text: order.customer_name, margin: [0, 5, 0, 5] },
        { text: `Email: ${order.customer_email || '-'}`, margin: [0, 0, 0, 5] },
        { text: `Телефон: ${order.customer_phone || '-'}`, margin: [0, 0, 0, 20] },
        
        { text: 'Наименование работ/услуг:', style: 'sectionHeader', margin: [0, 0, 0, 10] },
        
        {
          table: {
            headerRows: 1,
            widths: ['*', 100],
            body: [
              [{ text: 'Наименование', style: 'tableHeader' }, { text: 'Сумма', style: 'tableHeader' }],
              [order.title, { text: `${order.final_price.toLocaleString('ru-RU')} ₸`, alignment: 'right' }]
            ]
          },
          layout: 'lightHorizontalLines'
        },
        
        { text: `ИТОГО К ОПЛАТЕ: ${order.final_price.toLocaleString('ru-RU')} ₸`, style: 'total', alignment: 'right', margin: [0, 20, 0, 0] }
      ],
      styles: {
        header: { fontSize: 20, bold: true },
        subheader: { fontSize: 12 },
        sectionHeader: { fontSize: 14, bold: true },
        tableHeader: { bold: true, fontSize: 11, fillColor: '#eeeeee' },
        total: { fontSize: 14, bold: true }
      },
      defaultStyle: { fontSize: 11 }
    };

    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice_${orderId}.pdf`);
    
    pdfDoc.pipe(res);
    pdfDoc.end();
  } catch (error) {
    console.error('Download invoice error:', error);
    res.status(500).json({ message: 'Ошибка при генерации счета' });
  }
};

// Сгенерировать и скачать акт выполненных работ
export const downloadAct = async (req: Request, res: Response) => {
  try {
    const masterId = req.userId;
    const { orderId } = req.params;

    // Получаем данные заказа
    const orderResult = await pool.query(
      `SELECT 
        o.*,
        u.name as customer_name,
        u.email as customer_email,
        u.phone as customer_phone,
        m.name as master_name,
        ct.commission_rate,
        ct.commission_amount
       FROM orders o
       JOIN users u ON o.customer_id = u.id
       JOIN users m ON o.assigned_master_id = m.id
       LEFT JOIN commission_transactions ct ON ct.order_id = o.id
       WHERE o.id = $1 AND o.assigned_master_id = $2 AND o.status = 'completed'`,
      [orderId, masterId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ message: 'Заказ не найден или не завершен' });
    }

    const order = orderResult.rows[0];

    // Определяем шрифты с поддержкой кириллицы
    const fontsPath = path.join(__dirname, '../../node_modules/roboto-font/fonts/Roboto');
    const fonts = {
      Roboto: {
        normal: path.join(fontsPath, 'roboto-regular-webfont.ttf'),
        bold: path.join(fontsPath, 'roboto-bold-webfont.ttf'),
        italics: path.join(fontsPath, 'roboto-italic-webfont.ttf'),
        bolditalics: path.join(fontsPath, 'roboto-bolditalic-webfont.ttf')
      }
    };

    const printer = new PdfPrinter(fonts);

    // Определяем структуру документа с кириллицей
    const docDefinition: TDocumentDefinitions = {
      content: [
        { text: 'АКТ ВЫПОЛНЕННЫХ РАБОТ', style: 'header', alignment: 'center' },
        { text: `№ ${orderId} от ${new Date(order.updated_at).toLocaleDateString('ru-RU')}`, style: 'subheader', alignment: 'center', margin: [0, 10, 0, 20] },
        
        { text: 'Исполнитель:', style: 'sectionHeader' },
        { text: order.master_name, margin: [0, 5, 0, 15] },
        
        { text: 'Заказчик:', style: 'sectionHeader' },
        { text: order.customer_name, margin: [0, 5, 0, 5] },
        { text: `Email: ${order.customer_email || '-'}`, margin: [0, 0, 0, 5] },
        { text: `Телефон: ${order.customer_phone || '-'}`, margin: [0, 0, 0, 20] },
        
        { text: 'Выполненные работы:', style: 'sectionHeader', margin: [0, 0, 0, 10] },
        
        {
          table: {
            headerRows: 1,
            widths: [30, '*', 100],
            body: [
              [
                { text: '№', style: 'tableHeader' },
                { text: 'Наименование работ', style: 'tableHeader' },
                { text: 'Сумма', style: 'tableHeader' }
              ],
              [
                '1',
                order.title + (order.description ? `\n${order.description}` : ''),
                { text: `${order.final_price.toLocaleString('ru-RU')} ₸`, alignment: 'right' }
              ]
            ]
          },
          layout: 'lightHorizontalLines'
        },
        
        { text: `ИТОГО: ${order.final_price.toLocaleString('ru-RU')} ₸`, style: 'total', alignment: 'right', margin: [0, 20, 0, 40] },
        
        {
          columns: [
            { text: 'Исполнитель: _________________', width: '50%' },
            { text: 'Заказчик: _________________', width: '50%' }
          ],
          margin: [0, 0, 0, 20]
        },
        
        { text: `Дата: ${new Date().toLocaleDateString('ru-RU')}`, fontSize: 10 }
      ],
      styles: {
        header: { fontSize: 20, bold: true },
        subheader: { fontSize: 12 },
        sectionHeader: { fontSize: 14, bold: true },
        tableHeader: { bold: true, fontSize: 11, fillColor: '#eeeeee' },
        total: { fontSize: 14, bold: true }
      },
      defaultStyle: { fontSize: 11 }
    };

    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=act_${orderId}.pdf`);
    
    pdfDoc.pipe(res);
    pdfDoc.end();
  } catch (error) {
    console.error('Download act error:', error);
    res.status(500).json({ message: 'Ошибка при генерации акта' });
  }
};
