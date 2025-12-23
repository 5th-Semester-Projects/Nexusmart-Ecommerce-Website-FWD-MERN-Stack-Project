import CryptoPayment from '../models/CryptoPayment.js';
import { Order } from '../models/Order.js';
import { catchAsyncErrors } from '../middleware/catchAsyncErrors.js';
import ErrorHandler from '../utils/errorHandler.js';

// Initiate crypto payment
export const initiateCryptoPayment = catchAsyncErrors(async (req, res, next) => {
  const { orderId, cryptocurrency } = req.body;

  const order = await Order.findById(orderId);
  if (!order) {
    return next(new ErrorHandler('Order not found', 404));
  }

  if (order.user.toString() !== req.user.id) {
    return next(new ErrorHandler('Unauthorized', 403));
  }

  // Get current exchange rate
  const exchangeRate = await getCryptoExchangeRate(cryptocurrency, order.totalPrice.currency);

  // Calculate crypto amount
  const cryptoAmount = calculateCryptoAmount(order.totalPrice.total, exchangeRate);

  // Generate wallet address for receiving payment
  const receiverAddress = await generateWalletAddress(cryptocurrency);

  // Generate QR code
  const qrCode = await generatePaymentQRCode(receiverAddress, cryptoAmount, cryptocurrency);

  // Create crypto payment record
  const cryptoPayment = await CryptoPayment.create({
    order: orderId,
    user: req.user.id,
    cryptocurrency,
    amount: {
      fiat: {
        value: order.totalPrice.total,
        currency: order.totalPrice.currency
      },
      crypto: {
        value: cryptoAmount,
        decimals: 8
      }
    },
    exchangeRate: {
      rate: exchangeRate.rate,
      source: exchangeRate.source,
      timestamp: Date.now()
    },
    walletAddress: {
      sender: req.body.senderAddress || '',
      receiver: receiverAddress
    },
    blockchain: {
      network: getBlockchainNetwork(cryptocurrency),
      requiredConfirmations: 3
    },
    paymentWindow: {
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
      warningAt: new Date(Date.now() + 25 * 60 * 1000)
    },
    qrCode,
    fees: {
      platform: order.totalPrice.total * 0.01, // 1% platform fee
      network: 0,
      total: order.totalPrice.total * 0.01
    }
  });

  // Start monitoring blockchain for payment
  monitorCryptoPayment(cryptoPayment._id, receiverAddress, cryptoAmount);

  res.status(201).json({
    success: true,
    payment: cryptoPayment,
    instructions: {
      address: receiverAddress,
      amount: cryptoAmount,
      cryptocurrency,
      qrCode,
      expiresIn: 1800 // seconds
    }
  });
});

// Check payment status
export const checkPaymentStatus = catchAsyncErrors(async (req, res, next) => {
  const { paymentId } = req.params;

  const payment = await CryptoPayment.findById(paymentId);
  if (!payment) {
    return next(new ErrorHandler('Payment not found', 404));
  }

  // Check blockchain for transaction updates
  if (payment.transactionHash) {
    const blockchainStatus = await checkBlockchainTransaction(
      payment.transactionHash,
      payment.cryptocurrency
    );

    if (blockchainStatus.confirmations !== payment.blockchain.confirmations) {
      payment.blockchain.confirmations = blockchainStatus.confirmations;

      if (blockchainStatus.confirmations >= payment.blockchain.requiredConfirmations) {
        payment.status = 'confirmed';

        // Update order status
        await Order.findByIdAndUpdate(payment.order, {
          'payment.status': 'completed',
          orderStatus: 'processing'
        });
      }

      await payment.save();
    }
  }

  res.status(200).json({
    success: true,
    payment,
    blockchainExplorer: getBlockchainExplorerUrl(payment.transactionHash, payment.cryptocurrency)
  });
});

// Webhook for blockchain events
export const blockchainWebhook = catchAsyncErrors(async (req, res, next) => {
  const { transactionHash, confirmations, status } = req.body;

  const payment = await CryptoPayment.findOne({ transactionHash });
  if (!payment) {
    return res.status(404).json({ success: false });
  }

  payment.blockchain.confirmations = confirmations;

  if (confirmations >= payment.blockchain.requiredConfirmations) {
    payment.status = 'confirmed';

    // Update order
    await Order.findByIdAndUpdate(payment.order, {
      'payment.status': 'completed',
      orderStatus: 'processing'
    });
  }

  await payment.save();

  res.status(200).json({ success: true });
});

// Refund crypto payment
export const refundCryptoPayment = catchAsyncErrors(async (req, res, next) => {
  const { paymentId, refundAddress } = req.body;

  const payment = await CryptoPayment.findById(paymentId);
  if (!payment) {
    return next(new ErrorHandler('Payment not found', 404));
  }

  if (payment.status !== 'confirmed') {
    return next(new ErrorHandler('Cannot refund unconfirmed payment', 400));
  }

  // Initiate refund transaction
  const refundTx = await initiateRefundTransaction(
    payment.cryptocurrency,
    refundAddress,
    payment.amount.crypto.value
  );

  payment.refund = {
    initiated: true,
    transactionHash: refundTx.hash,
    completedAt: null,
    amount: payment.amount.crypto.value
  };
  payment.status = 'refunded';

  await payment.save();

  res.status(200).json({
    success: true,
    message: 'Refund initiated',
    refundTransactionHash: refundTx.hash
  });
});

// Get supported cryptocurrencies
export const getSupportedCryptos = catchAsyncErrors(async (req, res, next) => {
  const cryptos = [
    { symbol: 'BTC', name: 'Bitcoin', network: 'Bitcoin', fee: '0.0001 BTC' },
    { symbol: 'ETH', name: 'Ethereum', network: 'Ethereum', fee: '0.001 ETH' },
    { symbol: 'USDT', name: 'Tether', network: 'Ethereum/Tron', fee: '1 USDT' },
    { symbol: 'USDC', name: 'USD Coin', network: 'Ethereum', fee: '1 USDC' },
    { symbol: 'BNB', name: 'Binance Coin', network: 'BSC', fee: '0.001 BNB' },
    { symbol: 'MATIC', name: 'Polygon', network: 'Polygon', fee: '0.01 MATIC' }
  ];

  // Get current exchange rates
  for (let crypto of cryptos) {
    crypto.exchangeRate = await getCryptoExchangeRate(crypto.symbol, 'USD');
  }

  res.status(200).json({
    success: true,
    cryptocurrencies: cryptos
  });
});

// Helper Functions
async function getCryptoExchangeRate(crypto, fiatCurrency) {
  // Mock - integrate with CoinGecko, CoinMarketCap, or Binance API
  const mockRates = {
    BTC: 45000,
    ETH: 3000,
    USDT: 1,
    USDC: 1,
    BNB: 300,
    MATIC: 0.8
  };

  return {
    rate: mockRates[crypto] || 1,
    source: 'CoinGecko',
    timestamp: Date.now()
  };
}

function calculateCryptoAmount(fiatAmount, exchangeRate) {
  return (fiatAmount / exchangeRate.rate).toFixed(8);
}

async function generateWalletAddress(cryptocurrency) {
  // Mock - implement actual wallet generation
  const addresses = {
    BTC: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    ETH: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    USDT: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'
  };
  return addresses[cryptocurrency] || addresses.ETH;
}

async function generatePaymentQRCode(address, amount, crypto) {
  // Mock - implement actual QR code generation with qrcode library
  return `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==`;
}

function getBlockchainNetwork(cryptocurrency) {
  const networks = {
    BTC: 'Bitcoin Mainnet',
    ETH: 'Ethereum Mainnet',
    USDT: 'Ethereum Mainnet',
    USDC: 'Ethereum Mainnet',
    BNB: 'Binance Smart Chain',
    MATIC: 'Polygon Mainnet'
  };
  return networks[cryptocurrency] || 'Unknown';
}

async function monitorCryptoPayment(paymentId, address, expectedAmount) {
  // Mock - implement actual blockchain monitoring
  console.log(`Monitoring payment ${paymentId} on address ${address}`);
  // Would use blockchain APIs or websockets to monitor transactions
}

async function checkBlockchainTransaction(txHash, cryptocurrency) {
  // Mock - implement actual blockchain query
  return {
    confirmations: Math.floor(Math.random() * 6),
    status: 'confirmed',
    blockNumber: 123456
  };
}

function getBlockchainExplorerUrl(txHash, cryptocurrency) {
  const explorers = {
    BTC: `https://blockchain.com/btc/tx/${txHash}`,
    ETH: `https://etherscan.io/tx/${txHash}`,
    BNB: `https://bscscan.com/tx/${txHash}`,
    MATIC: `https://polygonscan.com/tx/${txHash}`
  };
  return explorers[cryptocurrency] || `#${txHash}`;
}

async function initiateRefundTransaction(crypto, address, amount) {
  // Mock - implement actual refund transaction
  return {
    hash: '0x' + Math.random().toString(16).substring(2, 66),
    status: 'pending'
  };
}
