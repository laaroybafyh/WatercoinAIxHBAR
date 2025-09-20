// QR Code Generator and Handler for HEDERA Payments
// Specialized for Watercoin POS system

import QRCode from 'qrcode';
import { HederaAgent } from './hederaAgent';

export interface QRCodeOptions {
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  type?: 'image/png' | 'image/jpeg';
  quality?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
  width?: number;
  height?: number;
}

export interface HederaQRCodeData {
  qrCodeDataURL: string;
  paymentURI: string;
  amount: number;
  transactionId: string;
  memo?: string | undefined;
}

export const DEFAULT_QR_OPTIONS: QRCodeOptions = {
  width: 300,
  height: 300,
  margin: 2,
  color: {
    dark: '#0D6CA3', // Watercoin primary color
    light: '#FFFFFF'
  },
  errorCorrectionLevel: 'M'
};

export async function generateHederaQRCode(
  amount: number,
  transactionId: string,
  memo?: string,
  options: QRCodeOptions = {}
): Promise<HederaQRCodeData> {
  try {
    // Mock HEDERA config for QR generation
    const mockConfig = {
      network: 'testnet' as const,
      mirrorNodeUrl: 'https://testnet.mirrornode.hedera.com',
      operatorId: '0.0.123456',
      operatorKey: 'mock-key',
      watercoinAddress: '0x6f6ecef0b8c2ff3291721951f34f7d8a0d54ead5'
    };
    
    const hederaAgent = new HederaAgent(mockConfig);
    const paymentURI = hederaAgent.generatePaymentURI(amount, transactionId, memo);
    
    const qrOptions = {
      errorCorrectionLevel: options.errorCorrectionLevel || 'M',
      type: options.type || 'image/png',
      quality: options.quality || 0.92,
      margin: options.margin || 1,
      width: options.width || 300,
      color: {
        dark: options.color?.dark || '#000000',
        light: options.color?.light || '#FFFFFF',
      },
    };

    const qrCodeDataURL = await QRCode.toDataURL(paymentURI, qrOptions);
    
    hederaAgent.close();

    return {
      qrCodeDataURL,
      paymentURI,
      amount,
      transactionId,
      memo
    };
  } catch (error) {
    console.error('Error generating HEDERA QR code:', error);
    throw new Error('Failed to generate HEDERA QR code');
  }
}

// Generate QR Code as Data URL for display
export async function generateQRCode(
  amount: number,
  transactionId: string,
  memo?: string,
  options: Partial<QRCodeOptions> = {}
): Promise<string> {
  const qrData = await generateHederaQRCode(amount, transactionId, memo, options);
  return qrData.qrCodeDataURL;
}

// Generate QR Code as Canvas Element
export async function generateQRCodeCanvas(
  amount: number,
  transactionId: string,
  canvas: HTMLCanvasElement,
  memo?: string,
  options: Partial<QRCodeOptions> = {}
): Promise<void> {
  const opts = { ...DEFAULT_QR_OPTIONS, ...options };
  
  try {
    const mockConfig = {
      network: 'testnet' as const,
      mirrorNodeUrl: 'https://testnet.mirrornode.hedera.com',
      operatorId: '0.0.123456',
      operatorKey: 'mock-key',
      watercoinAddress: '0x6f6ecef0b8c2ff3291721951f34f7d8a0d54ead5'
    };
    
    const hederaAgent = new HederaAgent(mockConfig);
    const paymentURI = hederaAgent.generatePaymentURI(amount, transactionId, memo);
    
    await QRCode.toCanvas(canvas, paymentURI, {
      width: opts.width,
      margin: opts.margin,
      color: opts.color,
      errorCorrectionLevel: opts.errorCorrectionLevel
    });
    
    hederaAgent.close();
  } catch (error) {
    console.error('Error generating QR code canvas:', error);
    throw new Error('Failed to generate QR code canvas');
  }
}

// Generate QR Code as SVG string
export async function generateQRCodeSVG(
  amount: number,
  transactionId: string,
  memo?: string,
  options: Partial<QRCodeOptions> = {}
): Promise<string> {
  const opts = { ...DEFAULT_QR_OPTIONS, ...options };
  
  try {
    const mockConfig = {
      network: 'testnet' as const,
      mirrorNodeUrl: 'https://testnet.mirrornode.hedera.com',
      operatorId: '0.0.123456',
      operatorKey: 'mock-key',
      watercoinAddress: '0x6f6ecef0b8c2ff3291721951f34f7d8a0d54ead5'
    };
    
    const hederaAgent = new HederaAgent(mockConfig);
    const paymentURI = hederaAgent.generatePaymentURI(amount, transactionId, memo);
    
    const svgString = await QRCode.toString(paymentURI, {
      type: 'svg',
      width: opts.width,
      margin: opts.margin,
      color: opts.color,
      errorCorrectionLevel: opts.errorCorrectionLevel
    });
    
    hederaAgent.close();
    return svgString;
  } catch (error) {
    console.error('Error generating QR code SVG:', error);
    throw new Error('Failed to generate QR code SVG');
  }
}

// Format amount for display
export function formatAmount(hbarAmount: number, idrAmount: number): {
  hedera: string;
  idr: string;
} {
  return {
    hedera: hbarAmount.toFixed(2) + ' HBAR',
    idr: 'Rp ' + idrAmount.toLocaleString('id-ID')
  };
}

// Create QR Code component data
export interface QRDisplayData {
  qrCodeDataURL: string;
  paymentURI: string;
  transactionId: string;
  productName?: string | undefined;
  amounts: {
    hedera: string;
    idr: string;
  };
  expiryTime: Date;
  timeRemaining: number; // in seconds
}

export async function createQRDisplayData(
  amount: number,
  transactionId: string,
  productName?: string,
  memo?: string,
  expiryMinutes: number = 10
): Promise<QRDisplayData> {
  const qrData = await generateHederaQRCode(amount, transactionId, memo);
  const idrAmount = HederaAgent.hederaToIdr(amount);
  const amounts = formatAmount(amount, idrAmount);
  const expiryTime = new Date(Date.now() + expiryMinutes * 60 * 1000);
  const timeRemaining = Math.max(0, Math.floor((expiryTime.getTime() - Date.now()) / 1000));
  
  return {
    qrCodeDataURL: qrData.qrCodeDataURL,
    paymentURI: qrData.paymentURI,
    transactionId,
    productName,
    amounts,
    expiryTime,
    timeRemaining
  };
}

// Deep link handlers for different HEDERA wallets
export const WALLET_DEEP_LINKS = {
  // HashPack Wallet
  hashpack: (hederaURI: string) => `https://wallet.hashpack.app/pay?uri=${encodeURIComponent(hederaURI)}`,
  
  // Blade Wallet
  blade: (hederaURI: string) => `https://bladewallet.io/payment?uri=${encodeURIComponent(hederaURI)}`,
  
  // Yamgo Wallet
  yamgo: (hederaURI: string) => `https://yamgo.com/wallet?payment=${encodeURIComponent(hederaURI)}`,
  
  // Generic HEDERA protocol
  hedera: (hederaURI: string) => hederaURI
};

// Generate deep links for popular HEDERA wallets
export function generateWalletLinks(amount: number, transactionId: string, memo?: string): Record<string, string> {
  const mockConfig = {
    network: 'testnet' as const,
    mirrorNodeUrl: 'https://testnet.mirrornode.hedera.com',
    operatorId: '0.0.123456',
    operatorKey: 'mock-key',
    watercoinAddress: '0x6f6ecef0b8c2ff3291721951f34f7d8a0d54ead5'
  };
  
  const hederaAgent = new HederaAgent(mockConfig);
  const paymentURI = hederaAgent.generatePaymentURI(amount, transactionId, memo);
  hederaAgent.close();
  
  return Object.fromEntries(
    Object.entries(WALLET_DEEP_LINKS).map(([wallet, generator]) => [
      wallet,
      generator(paymentURI)
    ])
  );
}

// QR Code error handling
export class QRCodeError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'QRCodeError';
  }
}

// Common error codes
export const QR_ERROR_CODES = {
  EXPIRED: 'QR_EXPIRED',
  INVALID_DATA: 'QR_INVALID_DATA',
  GENERATION_FAILED: 'QR_GENERATION_FAILED',
  INVALID_AMOUNT: 'QR_INVALID_AMOUNT'
} as const;
