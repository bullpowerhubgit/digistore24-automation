// Discord webhook integration for notifications

export async function sendDiscordNotification(message: string, data?: any) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    console.log('Discord webhook URL not configured');
    return;
  }

  try {
    const embed = {
      title: '🎉 New Sale Notification',
      description: message,
      color: 0x00ff00,
      fields: data ? [
        {
          name: 'Order ID',
          value: data.order_id || 'N/A',
          inline: true,
        },
        {
          name: 'Amount',
          value: data.amount ? `$${data.amount}` : 'N/A',
          inline: true,
        },
        {
          name: 'Product',
          value: data.product_name || 'N/A',
          inline: false,
        },
        {
          name: 'Customer',
          value: data.buyer_name || 'N/A',
          inline: true,
        },
      ] : [],
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
      console.error('Failed to send Discord notification:', await response.text());
    }
  } catch (error) {
    console.error('Error sending Discord notification:', error);
  }
}

export async function sendRefundNotification(data: any) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    console.log('Discord webhook URL not configured');
    return;
  }

  try {
    const embed = {
      title: '⚠️ Refund Alert',
      description: 'A refund has been processed',
      color: 0xff0000,
      fields: [
        {
          name: 'Order ID',
          value: data.order_id || 'N/A',
          inline: true,
        },
        {
          name: 'Refund Amount',
          value: data.refund_amount ? `$${data.refund_amount}` : 'N/A',
          inline: true,
        },
        {
          name: 'Reason',
          value: data.reason || 'Not specified',
          inline: false,
        },
      ],
      timestamp: new Date().toISOString(),
    };

    await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        embeds: [embed],
      }),
    });
  } catch (error) {
    console.error('Error sending refund notification:', error);
  }
}

export async function sendAffiliateNotification(data: any) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    console.log('Discord webhook URL not configured');
    return;
  }

  try {
    const embed = {
      title: '👥 New Affiliate Approved',
      description: 'A new affiliate has been approved',
      color: 0x0099ff,
      fields: [
        {
          name: 'Affiliate ID',
          value: data.affiliate_id || 'N/A',
          inline: true,
        },
        {
          name: 'Name',
          value: data.name || 'N/A',
          inline: true,
        },
        {
          name: 'Email',
          value: data.email || 'N/A',
          inline: false,
        },
      ],
      timestamp: new Date().toISOString(),
    };

    await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        embeds: [embed],
      }),
    });
  } catch (error) {
    console.error('Error sending affiliate notification:', error);
  }
}
