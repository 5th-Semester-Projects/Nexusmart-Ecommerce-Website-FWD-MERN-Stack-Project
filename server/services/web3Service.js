import { ethers } from 'ethers';
import crypto from 'crypto';

/**
 * Web3 Blockchain Service
 * Handles cryptocurrency payments, NFT receipts, and supply chain tracking
 */
class Web3Service {
  constructor() {
    this.provider = null;
    this.networkConfigs = {
      ethereum: {
        chainId: 1,
        name: 'Ethereum Mainnet',
        rpcUrl: process.env.ETH_RPC_URL || 'https://mainnet.infura.io/v3/your-project-id',
        currency: 'ETH',
        explorer: 'https://etherscan.io'
      },
      polygon: {
        chainId: 137,
        name: 'Polygon Mainnet',
        rpcUrl: process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com',
        currency: 'MATIC',
        explorer: 'https://polygonscan.com'
      },
      bsc: {
        chainId: 56,
        name: 'Binance Smart Chain',
        rpcUrl: process.env.BSC_RPC_URL || 'https://bsc-dataseed.binance.org',
        currency: 'BNB',
        explorer: 'https://bscscan.com'
      },
      sepolia: {
        chainId: 11155111,
        name: 'Sepolia Testnet',
        rpcUrl: process.env.SEPOLIA_RPC_URL || 'https://sepolia.infura.io/v3/your-project-id',
        currency: 'ETH',
        explorer: 'https://sepolia.etherscan.io'
      }
    };

    // Supported cryptocurrencies with exchange rates (mock - use real API in production)
    this.cryptoCurrencies = {
      ETH: { name: 'Ethereum', symbol: 'ETH', decimals: 18, rate: 2000 },
      BTC: { name: 'Bitcoin', symbol: 'BTC', decimals: 8, rate: 43000 },
      USDT: { name: 'Tether', symbol: 'USDT', decimals: 6, rate: 1 },
      USDC: { name: 'USD Coin', symbol: 'USDC', decimals: 6, rate: 1 },
      MATIC: { name: 'Polygon', symbol: 'MATIC', decimals: 18, rate: 0.85 },
      BNB: { name: 'Binance Coin', symbol: 'BNB', decimals: 18, rate: 310 }
    };

    // NFT Contract ABI (simplified ERC721)
    this.nftContractABI = [
      'function mint(address to, string memory tokenURI) public returns (uint256)',
      'function ownerOf(uint256 tokenId) public view returns (address)',
      'function tokenURI(uint256 tokenId) public view returns (string memory)',
      'function transferFrom(address from, address to, uint256 tokenId) public',
      'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)'
    ];

    // Supply Chain Contract ABI
    this.supplyChainABI = [
      'function addProduct(bytes32 productId, string memory origin, uint256 timestamp) public',
      'function updateLocation(bytes32 productId, string memory location, uint256 timestamp) public',
      'function getProductHistory(bytes32 productId) public view returns (tuple(string location, uint256 timestamp, address updatedBy)[])',
      'function verifyAuthenticity(bytes32 productId) public view returns (bool)',
      'event ProductAdded(bytes32 indexed productId, string origin, uint256 timestamp)',
      'event LocationUpdated(bytes32 indexed productId, string location, uint256 timestamp)'
    ];
  }

  /**
   * Initialize Web3 provider for a specific network
   */
  initProvider(network = 'ethereum') {
    const config = this.networkConfigs[network];
    if (!config) throw new Error(`Unknown network: ${network}`);

    this.provider = new ethers.JsonRpcProvider(config.rpcUrl);
    return this.provider;
  }

  /**
   * Verify wallet signature for authentication
   */
  async verifyWalletSignature(message, signature, expectedAddress) {
    try {
      const recoveredAddress = ethers.verifyMessage(message, signature);
      return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
    } catch (error) {
      console.error('Signature verification failed:', error);
      return false;
    }
  }

  /**
   * Generate authentication message for wallet login
   */
  generateAuthMessage(address, nonce) {
    return `Welcome to NexusMart!\n\nSign this message to authenticate.\n\nWallet: ${address}\nNonce: ${nonce}\nTimestamp: ${new Date().toISOString()}`;
  }

  /**
   * Get current exchange rates (in production, use CoinGecko/CoinMarketCap API)
   */
  async getExchangeRates() {
    try {
      // In production, fetch from real API
      // const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=ethereum,bitcoin,tether,usd-coin,matic-network,binancecoin&vs_currencies=usd');

      // Mock rates for demo
      return this.cryptoCurrencies;
    } catch (error) {
      console.error('Failed to fetch exchange rates:', error);
      return this.cryptoCurrencies;
    }
  }

  /**
   * Convert USD to cryptocurrency amount
   */
  async convertUSDToCrypto(usdAmount, cryptoSymbol) {
    const rates = await this.getExchangeRates();
    const crypto = rates[cryptoSymbol];

    if (!crypto) throw new Error(`Unsupported cryptocurrency: ${cryptoSymbol}`);

    const cryptoAmount = usdAmount / crypto.rate;
    return {
      usdAmount,
      cryptoAmount: cryptoAmount.toFixed(crypto.decimals > 8 ? 8 : crypto.decimals),
      cryptoSymbol,
      rate: crypto.rate,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Verify transaction on blockchain
   */
  async verifyTransaction(txHash, network = 'ethereum') {
    try {
      this.initProvider(network);
      const tx = await this.provider.getTransaction(txHash);

      if (!tx) {
        return { verified: false, error: 'Transaction not found' };
      }

      const receipt = await this.provider.getTransactionReceipt(txHash);

      return {
        verified: receipt && receipt.status === 1,
        transaction: {
          hash: tx.hash,
          from: tx.from,
          to: tx.to,
          value: ethers.formatEther(tx.value),
          gasUsed: receipt ? receipt.gasUsed.toString() : null,
          blockNumber: receipt ? receipt.blockNumber : null,
          status: receipt ? (receipt.status === 1 ? 'confirmed' : 'failed') : 'pending'
        }
      };
    } catch (error) {
      console.error('Transaction verification failed:', error);
      return { verified: false, error: error.message };
    }
  }

  /**
   * Create crypto payment request
   */
  async createPaymentRequest(orderId, amount, cryptoSymbol, merchantAddress) {
    const conversion = await this.convertUSDToCrypto(amount, cryptoSymbol);

    const paymentId = crypto.randomBytes(16).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    return {
      paymentId,
      orderId,
      merchantAddress,
      amount: conversion.cryptoAmount,
      currency: cryptoSymbol,
      usdAmount: amount,
      exchangeRate: conversion.rate,
      expiresAt,
      status: 'pending',
      createdAt: new Date().toISOString(),
      qrCode: this.generatePaymentQR(merchantAddress, conversion.cryptoAmount, cryptoSymbol)
    };
  }

  /**
   * Generate QR code data for payment
   */
  generatePaymentQR(address, amount, currency) {
    // Generate EIP-681 compatible payment URI
    if (currency === 'ETH' || currency === 'MATIC' || currency === 'BNB') {
      return `ethereum:${address}?value=${ethers.parseEther(amount.toString())}`;
    }
    return `${currency.toLowerCase()}:${address}?amount=${amount}`;
  }

  /**
   * NFT Receipt Generation
   */
  async generateNFTReceipt(order, customerAddress) {
    const receiptData = {
      orderId: order._id.toString(),
      orderNumber: order.orderNumber || `NXM-${Date.now()}`,
      customer: customerAddress,
      items: order.items.map(item => ({
        name: item.product.name,
        quantity: item.quantity,
        price: item.price
      })),
      total: order.totalAmount,
      purchaseDate: order.createdAt,
      merchantAddress: process.env.MERCHANT_WALLET_ADDRESS
    };

    // Generate unique token ID
    const tokenId = crypto.createHash('sha256')
      .update(JSON.stringify(receiptData))
      .digest('hex')
      .slice(0, 16);

    // Create metadata for NFT
    const metadata = {
      name: `NexusMart Receipt #${receiptData.orderNumber}`,
      description: `Official purchase receipt for order ${receiptData.orderNumber}`,
      image: this.generateReceiptImage(receiptData),
      external_url: `${process.env.FRONTEND_URL}/orders/${order._id}`,
      attributes: [
        { trait_type: 'Order ID', value: receiptData.orderNumber },
        { trait_type: 'Total Amount', value: `$${receiptData.total.toFixed(2)}` },
        { trait_type: 'Items Count', value: receiptData.items.length.toString() },
        { trait_type: 'Purchase Date', value: receiptData.purchaseDate },
        { trait_type: 'Verified', value: 'true' }
      ],
      properties: {
        order: receiptData,
        signature: this.signReceiptData(receiptData)
      }
    };

    return {
      tokenId,
      metadata,
      contractAddress: process.env.NFT_CONTRACT_ADDRESS,
      network: process.env.NFT_NETWORK || 'polygon',
      mintable: true,
      estimatedGas: '0.001 MATIC'
    };
  }

  /**
   * Sign receipt data for verification
   */
  signReceiptData(receiptData) {
    const privateKey = process.env.RECEIPT_SIGNING_KEY;
    if (!privateKey) {
      return crypto.createHash('sha256')
        .update(JSON.stringify(receiptData))
        .digest('hex');
    }

    const wallet = new ethers.Wallet(privateKey);
    return wallet.signMessageSync(JSON.stringify(receiptData));
  }

  /**
   * Generate receipt image URL (placeholder - use canvas/SVG generation in production)
   */
  generateReceiptImage(receiptData) {
    // In production, generate actual image using canvas or external service
    return `${process.env.API_URL}/api/receipts/image/${receiptData.orderId}`;
  }

  /**
   * Verify NFT receipt authenticity
   */
  async verifyNFTReceipt(tokenId, contractAddress, network = 'polygon') {
    try {
      this.initProvider(network);
      const contract = new ethers.Contract(contractAddress, this.nftContractABI, this.provider);

      const tokenURI = await contract.tokenURI(tokenId);
      const owner = await contract.ownerOf(tokenId);

      // Fetch and verify metadata
      // In production, fetch from IPFS or metadata server

      return {
        verified: true,
        tokenId,
        owner,
        tokenURI,
        network
      };
    } catch (error) {
      return {
        verified: false,
        error: error.message
      };
    }
  }

  /**
   * Supply Chain Tracking
   */
  async createSupplyChainRecord(product) {
    const productId = ethers.keccak256(
      ethers.toUtf8Bytes(product._id.toString())
    );

    const record = {
      productId: productId.slice(0, 18), // Shortened for readability
      fullProductId: productId,
      productName: product.name,
      origin: product.origin || 'Unknown',
      manufacturer: product.manufacturer || 'NexusMart Vendor',
      manufacturingDate: product.manufacturingDate || new Date().toISOString(),
      batchNumber: product.batchNumber || `BATCH-${Date.now()}`,
      history: [
        {
          location: product.origin || 'Manufacturing Facility',
          timestamp: new Date().toISOString(),
          status: 'manufactured',
          verifiedBy: 'System'
        }
      ],
      certifications: product.certifications || [],
      authenticity: {
        verified: true,
        signature: this.signProductData(product),
        verificationUrl: `${process.env.FRONTEND_URL}/verify/${productId.slice(0, 18)}`
      }
    };

    return record;
  }

  /**
   * Update supply chain location
   */
  async updateSupplyChainLocation(productId, location, status, verifiedBy) {
    const update = {
      productId,
      location,
      status,
      timestamp: new Date().toISOString(),
      verifiedBy,
      transactionHash: null // Will be set after blockchain confirmation
    };

    return update;
  }

  /**
   * Get supply chain history
   */
  async getSupplyChainHistory(productId) {
    // In production, fetch from blockchain
    // For demo, return mock data
    return {
      productId,
      verified: true,
      history: [
        {
          location: 'Manufacturing Facility, Shenzhen',
          status: 'manufactured',
          timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          verifiedBy: 'Factory QC'
        },
        {
          location: 'Quality Control Center',
          status: 'inspected',
          timestamp: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
          verifiedBy: 'QC Inspector'
        },
        {
          location: 'International Shipping Port',
          status: 'shipped',
          timestamp: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
          verifiedBy: 'Logistics Partner'
        },
        {
          location: 'Customs Clearance',
          status: 'cleared',
          timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          verifiedBy: 'Customs Authority'
        },
        {
          location: 'Regional Distribution Center',
          status: 'received',
          timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          verifiedBy: 'Warehouse Manager'
        },
        {
          location: 'Local Delivery Hub',
          status: 'ready_for_delivery',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          verifiedBy: 'Delivery Partner'
        }
      ],
      authenticity: {
        verified: true,
        score: 100,
        certificateUrl: `${process.env.FRONTEND_URL}/certificate/${productId}`
      }
    };
  }

  /**
   * Verify product authenticity
   */
  async verifyProductAuthenticity(productId, signature) {
    try {
      // In production, verify against blockchain
      const isValid = signature && signature.length > 0;

      return {
        productId,
        authentic: isValid,
        confidence: isValid ? 99.8 : 0,
        verifiedAt: new Date().toISOString(),
        details: isValid ? {
          manufacturer: 'Verified Manufacturer',
          origin: 'Verified Origin',
          certifications: ['ISO 9001', 'CE Certified']
        } : null
      };
    } catch (error) {
      return {
        productId,
        authentic: false,
        error: error.message
      };
    }
  }

  /**
   * Sign product data
   */
  signProductData(product) {
    const data = {
      id: product._id?.toString(),
      name: product.name,
      sku: product.sku,
      timestamp: Date.now()
    };

    return crypto.createHash('sha256')
      .update(JSON.stringify(data))
      .digest('hex');
  }

  /**
   * Get wallet balance
   */
  async getWalletBalance(address, network = 'ethereum') {
    try {
      this.initProvider(network);
      const balance = await this.provider.getBalance(address);
      const config = this.networkConfigs[network];

      return {
        address,
        network,
        balance: ethers.formatEther(balance),
        currency: config.currency
      };
    } catch (error) {
      console.error('Failed to get wallet balance:', error);
      return null;
    }
  }

  /**
   * Estimate gas for transaction
   */
  async estimateGas(to, value, network = 'ethereum') {
    try {
      this.initProvider(network);
      const gasPrice = await this.provider.getFeeData();

      return {
        gasPrice: ethers.formatUnits(gasPrice.gasPrice, 'gwei'),
        maxFeePerGas: gasPrice.maxFeePerGas ? ethers.formatUnits(gasPrice.maxFeePerGas, 'gwei') : null,
        maxPriorityFeePerGas: gasPrice.maxPriorityFeePerGas ? ethers.formatUnits(gasPrice.maxPriorityFeePerGas, 'gwei') : null,
        estimatedCost: ethers.formatEther(gasPrice.gasPrice * BigInt(21000))
      };
    } catch (error) {
      console.error('Failed to estimate gas:', error);
      return null;
    }
  }
}

export default new Web3Service();
