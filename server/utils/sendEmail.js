import nodemailer from 'nodemailer';

/**
 * Create nodemailer transporter
 */
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    service: process.env.SMTP_SERVICE,
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

/**
 * Send email using nodemailer
 * @param {Object} options - Email options
 */
export const sendEmail = async (options) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `${process.env.SMTP_FROM_NAME || 'NexusMart'} <${process.env.SMTP_MAIL}>`,
    to: options.email,
    subject: options.subject,
    html: options.message,
  };

  await transporter.sendMail(mailOptions);
};

/**
 * Email templates
 */

// Welcome email template
export const getWelcomeEmailTemplate = (name) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to NexusMart! 🎉</h1>
        </div>
        <div class="content">
          <h2>Hello ${name}!</h2>
          <p>Thank you for joining NexusMart - your AI-powered shopping destination.</p>
          <p>We're excited to have you on board! Here's what you can do:</p>
          <ul>
            <li>🛍️ Browse thousands of products with AI recommendations</li>
            <li>🎯 Try AR virtual try-on features</li>
            <li>💰 Earn loyalty points on every purchase</li>
            <li>🎁 Get exclusive deals and offers</li>
          </ul>
          <a href="${process.env.CLIENT_URL}/products" class="button">Start Shopping</a>
          <p>If you have any questions, feel free to reach out to our support team.</p>
          <p>Happy Shopping!</p>
          <p><strong>The NexusMart Team</strong></p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} NexusMart. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Email verification template
export const getVerificationEmailTemplate = (name, verificationUrl) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        .warning { background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Verify Your Email 📧</h1>
        </div>
        <div class="content">
          <h2>Hello ${name}!</h2>
          <p>Thank you for registering with NexusMart. Please verify your email address to activate your account.</p>
          <a href="${verificationUrl}" class="button">Verify Email</a>
          <p>Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
          <div class="warning">
            <strong>⚠️ Note:</strong> This verification link will expire in 24 hours.
          </div>
          <p>If you didn't create an account with NexusMart, please ignore this email.</p>
          <p><strong>The NexusMart Team</strong></p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} NexusMart. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Password reset template
export const getPasswordResetTemplate = (name, resetUrl) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: #dc3545; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        .warning { background: #f8d7da; padding: 15px; border-left: 4px solid #dc3545; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Reset Your Password 🔐</h1>
        </div>
        <div class="content">
          <h2>Hello ${name}!</h2>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <a href="${resetUrl}" class="button">Reset Password</a>
          <p>Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all; color: #dc3545;">${resetUrl}</p>
          <div class="warning">
            <strong>⚠️ Security Alert:</strong> This reset link will expire in 15 minutes for security reasons.
          </div>
          <p>If you didn't request a password reset, please ignore this email and your password will remain unchanged.</p>
          <p><strong>The NexusMart Team</strong></p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} NexusMart. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Order confirmation template
export const getOrderConfirmationTemplate = (name, orderNumber, orderDetails) => {
  const {
    items,
    shippingInfo,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
    discountPrice = 0,
    paymentMethod,
    orderDate
  } = orderDetails;

  // Generate items HTML
  const itemsHtml = items.map(item => `
    <div class="product-item">
      <div>
        <strong>${item.name}</strong><br/>
        <span style="color: #666; font-size: 14px;">Quantity: ${item.quantity} × $${item.price.toFixed(2)}</span>
      </div>
      <div style="text-align: right;">
        <strong style="color: #28a745;">$${(item.quantity * item.price).toFixed(2)}</strong>
      </div>
    </div>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: #28a745; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e0e0e0; }
        .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0f0f0; }
        .product-item { padding: 15px; border-bottom: 1px solid #f0f0f0; display: flex; justify-content: space-between; align-items: center; }
        .product-item:last-child { border-bottom: none; }
        .shipping-info { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .price-summary { background: #fff; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .total-row { font-size: 18px; font-weight: bold; color: #28a745; padding-top: 10px; border-top: 2px solid #28a745; margin-top: 10px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; padding: 20px; }
        .highlight { color: #667eea; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Order Confirmed!</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">Thank you for shopping with NexusMart</p>
        </div>
        <div class="content">
          <h2>Hello ${name}!</h2>
          <p>Your order has been confirmed and is being processed. We'll send you a shipping confirmation email as soon as your order ships.</p>
          
          <div class="order-details">
            <h3 style="margin-top: 0; color: #667eea;">📦 Order Summary</h3>
            <div class="info-row">
              <span><strong>Order Number:</strong></span>
              <span class="highlight">#${orderNumber}</span>
            </div>
            <div class="info-row">
              <span><strong>Order Date:</strong></span>
              <span>${orderDate}</span>
            </div>
            <div class="info-row" style="border-bottom: none;">
              <span><strong>Payment Method:</strong></span>
              <span>${paymentMethod}</span>
            </div>
          </div>

          <div class="order-details">
            <h3 style="margin-top: 0; color: #667eea;">🛍️ Items Ordered</h3>
            ${itemsHtml}
          </div>

          <div class="shipping-info">
            <h3 style="margin-top: 0; color: #667eea;">📍 Shipping Address</h3>
            <p style="margin: 5px 0;"><strong>${shippingInfo.name}</strong></p>
            <p style="margin: 5px 0;">${shippingInfo.address}</p>
            <p style="margin: 5px 0;">${shippingInfo.city}, ${shippingInfo.state} ${shippingInfo.postalCode}</p>
            <p style="margin: 5px 0;">${shippingInfo.country}</p>
            <p style="margin: 5px 0;"><strong>Phone:</strong> ${shippingInfo.phone}</p>
          </div>

          <div class="price-summary">
            <h3 style="margin-top: 0; color: #667eea;">💰 Payment Summary</h3>
            <div class="info-row">
              <span>Subtotal:</span>
              <span>$${itemsPrice.toFixed(2)}</span>
            </div>
            <div class="info-row">
              <span>Shipping:</span>
              <span>$${shippingPrice.toFixed(2)}</span>
            </div>
            <div class="info-row">
              <span>Tax:</span>
              <span>$${taxPrice.toFixed(2)}</span>
            </div>
            ${discountPrice > 0 ? `
            <div class="info-row" style="color: #28a745;">
              <span>Discount:</span>
              <span>-$${discountPrice.toFixed(2)}</span>
            </div>
            ` : ''}
            <div class="info-row total-row" style="border-bottom: none;">
              <span>Total Amount:</span>
              <span>$${totalPrice.toFixed(2)}</span>
            </div>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL || 'http://localhost:5174'}/dashboard/orders" class="button">View Order Details</a>
          </div>

          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            <strong>What's Next?</strong><br/>
            • We'll send you an email when your order ships<br/>
            • You can track your order status in your account dashboard<br/>
            • Estimated delivery: 3-5 business days
          </p>

          <p style="margin-top: 30px;">
            If you have any questions, feel free to contact our support team.<br/>
            <strong>The NexusMart Team</strong>
          </p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} NexusMart. All rights reserved.</p>
          <p>This is an automated email. Please do not reply to this message.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
