import sgMail from '@sendgrid/mail';
import { NotificationPayload, EmailTemplate } from './types';
import { formatCurrency, formatDate } from './utils';

/**
 * Send Discord notification
 */
export async function sendDiscordNotification(payload: NotificationPayload): Promise<void> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    console.warn('Discord webhook URL not configured, skipping notification');
    return;
  }

  try {
    const embed = {
      title: payload.title,
      description: payload.message,
      color: payload.type === 'sale' ? 0x00ff00 : payload.type === 'refund' ? 0xff0000 : 0x0099ff,
      fields: Object.entries(payload.data || {}).map(([key, value]) => ({
        name: key,
        value: String(value),
        inline: true,
      })),
      timestamp: new Date().toISOString(),
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        embeds: [embed],
      }),
    });

    if (!response.ok) {
      throw new Error(`Discord API error: ${response.statusText}`);
    }

    console.log('Discord notification sent successfully');
  } catch (error) {
    console.error('Error sending Discord notification:', error);
    // Don't throw - notifications are non-critical
  }
}

/**
 * Send email notification via SendGrid
 */
export async function sendEmailNotification(
  to: string,
  subject: string,
  template: EmailTemplate
): Promise<void> {
  const apiKey = process.env.SENDGRID_API_KEY;

  if (!apiKey) {
    console.warn('SendGrid API key not configured, skipping email notification');
    return;
  }

  try {
    sgMail.setApiKey(apiKey);

    const msg = {
      to,
      from: process.env.NOTIFICATION_EMAIL || 'noreply@digistore24.com',
      subject,
      text: template.text,
      html: template.html,
    };

    await sgMail.send(msg);
    console.log('Email notification sent successfully');
  } catch (error) {
    console.error('Error sending email notification:', error);
    // Don't throw - notifications are non-critical
  }
}

/**
 * Notify on new sale
 */
export async function notifyNewSale(saleData: {
  order_id: string;
  product_name: string;
  amount: number;
  buyer_name: string;
  buyer_email: string;
}): Promise<void> {
  const payload: NotificationPayload = {
    type: 'sale',
    title: '🎉 New Sale!',
    message: `New purchase of ${saleData.product_name}`,
    data: {
      'Order ID': saleData.order_id,
      Product: saleData.product_name,
      Amount: formatCurrency(saleData.amount),
      Customer: saleData.buyer_name,
    },
  };

  // Send Discord notification
  await sendDiscordNotification(payload);

  // Send email notification if configured
  const notificationEmail = process.env.NOTIFICATION_EMAIL;
  if (notificationEmail) {
    const emailTemplate: EmailTemplate = {
      subject: `New Sale: ${saleData.product_name}`,
      text: `
        New sale received!
        
        Order ID: ${saleData.order_id}
        Product: ${saleData.product_name}
        Amount: ${formatCurrency(saleData.amount)}
        Customer: ${saleData.buyer_name}
        Email: ${saleData.buyer_email}
      `,
      html: `
        <h2>🎉 New Sale!</h2>
        <p>You've received a new purchase.</p>
        <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Order ID:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${saleData.order_id}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Product:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${saleData.product_name}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Amount:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${formatCurrency(saleData.amount)}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Customer:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${saleData.buyer_name}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Email:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${saleData.buyer_email}</td>
          </tr>
        </table>
      `,
    };

    await sendEmailNotification(notificationEmail, emailTemplate.subject, emailTemplate);
  }
}

/**
 * Notify on refund
 */
export async function notifyRefund(refundData: {
  order_id: string;
  product_name: string;
  amount: number;
}): Promise<void> {
  const payload: NotificationPayload = {
    type: 'refund',
    title: '⚠️ Refund Processed',
    message: `Refund for ${refundData.product_name}`,
    data: {
      'Order ID': refundData.order_id,
      Product: refundData.product_name,
      Amount: formatCurrency(refundData.amount),
    },
  };

  await sendDiscordNotification(payload);
}

/**
 * Send daily sales report
 */
export async function sendDailySalesReport(reportData: {
  date: string;
  totalSales: number;
  totalRevenue: number;
  sales: any[];
}): Promise<void> {
  const notificationEmail = process.env.NOTIFICATION_EMAIL;

  if (!notificationEmail) {
    console.warn('Notification email not configured, skipping daily report');
    return;
  }

  const salesList = reportData.sales
    .slice(0, 10)
    .map(
      (sale) => `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">${sale.order_id}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${sale.product_name}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${formatCurrency(sale.amount)}</td>
      </tr>
    `
    )
    .join('');

  const emailTemplate: EmailTemplate = {
    subject: `Daily Sales Report - ${reportData.date}`,
    text: `
      Daily Sales Report
      Date: ${reportData.date}
      
      Total Sales: ${reportData.totalSales}
      Total Revenue: ${formatCurrency(reportData.totalRevenue)}
    `,
    html: `
      <h2>📊 Daily Sales Report</h2>
      <p><strong>Date:</strong> ${reportData.date}</p>
      
      <div style="margin: 20px 0;">
        <p><strong>Total Sales:</strong> ${reportData.totalSales}</p>
        <p><strong>Total Revenue:</strong> ${formatCurrency(reportData.totalRevenue)}</p>
      </div>
      
      ${
        reportData.sales.length > 0
          ? `
        <h3>Recent Sales</h3>
        <table style="border-collapse: collapse; width: 100%; max-width: 800px;">
          <thead>
            <tr style="background-color: #f4f4f4;">
              <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Order ID</th>
              <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Product</th>
              <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${salesList}
          </tbody>
        </table>
      `
          : '<p>No sales recorded for this period.</p>'
      }
    `,
  };

  await sendEmailNotification(notificationEmail, emailTemplate.subject, emailTemplate);
}
