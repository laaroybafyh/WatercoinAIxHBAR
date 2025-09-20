// HEDERA Agent for Watercoin AI Monitoring System
// Handles HEDERA network transactions, monitoring, and data storage

import { 
  Client, 
  AccountId, 
  PrivateKey,
  TransferTransaction,
  Hbar,
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
  TopicId,
  TransactionReceipt,
  TransactionResponse,
  AccountBalanceQuery,
  TransactionReceiptQuery,
  Status
} from '@hashgraph/sdk';

export interface HederaConfig {
  network: 'mainnet' | 'testnet' | 'previewnet';
  mirrorNodeUrl: string;
  operatorId: string;
  operatorKey: string;
  watercoinAddress: string;
}

export interface PaymentRequest {
  amount: number; // in HBAR
  transactionId: string;
  description?: string;
  memo?: string;
}

export interface TransactionStatus {
  transactionId: string;
  status: 'pending' | 'success' | 'failed';
  amount?: number;
  timestamp?: Date;
  receipt?: TransactionReceipt;
}

export interface SensorData {
  pH: number;
  tds: number;
  temperature: number;
  timestamp: number;
  location: string;
}

export class HederaAgent {
  private client: Client;
  private config: HederaConfig;
  private topicId?: TopicId;

  constructor(config: HederaConfig) {
    this.config = config;
    
    // Initialize Hedera client
    if (config.network === 'mainnet') {
      this.client = Client.forMainnet();
    } else if (config.network === 'testnet') {
      this.client = Client.forTestnet();
    } else {
      this.client = Client.forPreviewnet();
    }

    // Set operator (for transactions)
    if (config.operatorId && config.operatorKey) {
      try {
        const parsedKey = this.parseOperatorKey(config.operatorKey);
        this.client.setOperator(
          AccountId.fromString(config.operatorId),
          parsedKey
        );
      } catch (err: any) {
        console.error('Invalid operator key provided in configuration:', err?.message || err);
        throw new Error('Invalid HEDERA operator key. Provide a valid private key string (Ed25519) or PrivateKey instance.');
      }
    }

    // Set mirror node - use just the hostname without protocol
    try {
      const mirrorUrl = new URL(config.mirrorNodeUrl);
      this.client.setMirrorNetwork(mirrorUrl.hostname);
    } catch (error) {
      // Fallback to default mirror nodes if URL parsing fails
      if (config.network === 'testnet') {
        this.client.setMirrorNetwork(['hcs.testnet.mirrornode.hedera.com:5600']);
      } else if (config.network === 'mainnet') {
        this.client.setMirrorNetwork(['hcs.mainnet.mirrornode.hedera.com:5600']);
      }
    }
  }

  // Generate payment URI for QR code
  generatePaymentURI(amount: number, transactionId: string, memo?: string): string {
    const hbarAmount = amount.toFixed(2);
    let uri = `hedera://pay?to=${this.config.watercoinAddress}&amount=${hbarAmount}`;
    
    if (memo) {
      uri += `&memo=${encodeURIComponent(memo)}`;
    }
    
    if (transactionId) {
      uri += `&reference=${transactionId}`;
    }
    
    return uri;
  }

  // Monitor transactions to watercoin address
  async monitorTransactions(expectedAmount: number, transactionId: string, timeoutMs = 300000): Promise<TransactionStatus> {
    const startTime = Date.now();
    
    return new Promise((resolve, reject) => {
      const checkTransaction = async () => {
        try {
          // Query mirror node for recent transactions
          const response = await fetch(
            `${this.config.mirrorNodeUrl}/api/v1/accounts/${this.config.watercoinAddress}/transactions?limit=10&order=desc`
          );
          
          if (!response.ok) {
            console.warn(`Mirror node error: ${response.status}, cannot verify payment`);
            // Don't simulate success, let it timeout naturally
            return;
          }
          
          const data = await response.json();
          
          // Check for matching transaction
          for (const tx of data.transactions) {
            if (tx.result === 'SUCCESS' && tx.transfers) {
              for (const transfer of tx.transfers) {
                if (transfer.account === this.config.watercoinAddress) {
                  const receivedAmount = Math.abs(transfer.amount) / 100000000; // Convert from tinybars to HBAR
                  
                  // Check if amount matches (with small tolerance for fees)
                  if (Math.abs(receivedAmount - expectedAmount) < 0.01) {
                    // Check memo for transaction ID if provided
                    if (transactionId && tx.memo_base64) {
                      const memoText = Buffer.from(tx.memo_base64, 'base64').toString();
                      if (!memoText.includes(transactionId)) {
                        continue;
                      }
                    }
                    
                    resolve({
                      transactionId: tx.transaction_id,
                      status: 'success',
                      amount: receivedAmount,
                      timestamp: new Date(tx.consensus_timestamp * 1000)
                    });
                    return;
                  }
                }
              }
            }
          }
          
          // Check timeout
          if (Date.now() - startTime > timeoutMs) {
            resolve({
              transactionId,
              status: 'failed'
            });
            return;
          }
          
          // Continue monitoring
          setTimeout(checkTransaction, 5000); // Check every 5 seconds
          
        } catch (error) {
          console.error('Error monitoring transaction:', error);
          setTimeout(checkTransaction, 10000); // Retry after 10 seconds on error
        }
      };
      
      checkTransaction();
    });
  }

  // Store sensor data on HEDERA (using HCS - Hedera Consensus Service)
  async storeSensorData(sensorData: SensorData): Promise<string> {
    try {
      if (!this.topicId) {
        await this.createDataTopic();
      }

      const message = JSON.stringify({
        type: 'sensor_data',
        data: sensorData,
        timestamp: Date.now()
      });

      const transaction = new TopicMessageSubmitTransaction()
        .setTopicId(this.topicId!)
        .setMessage(message);

      const response = await transaction.execute(this.client);
      const receipt = await response.getReceipt(this.client);

      if (receipt.status === Status.Success) {
        return response.transactionId.toString();
      } else {
        throw new Error(`Failed to store sensor data: ${receipt.status}`);
      }
    } catch (error) {
      console.error('Error storing sensor data:', error);
      throw error;
    }
  }

  // Store survey data on HEDERA
  async storeSurveyData(surveyData: any): Promise<string> {
    try {
      if (!this.topicId) {
        await this.createDataTopic();
      }

      const message = JSON.stringify({
        type: 'survey_data',
        data: surveyData,
        timestamp: Date.now()
      });

      const transaction = new TopicMessageSubmitTransaction()
        .setTopicId(this.topicId!)
        .setMessage(message);

      const response = await transaction.execute(this.client);
      const receipt = await response.getReceipt(this.client);

      if (receipt.status === Status.Success) {
        return response.transactionId.toString();
      } else {
        throw new Error(`Failed to store survey data: ${receipt.status}`);
      }
    } catch (error) {
      console.error('Error storing survey data:', error);
      throw error;
    }
  }

  // Store analytics data on HEDERA
  async storeAnalyticsData(analyticsData: any): Promise<string> {
    try {
      if (!this.topicId) {
        await this.createDataTopic();
      }

      const message = JSON.stringify({
        type: 'analytics_data',
        data: analyticsData,
        timestamp: Date.now()
      });

      const transaction = new TopicMessageSubmitTransaction()
        .setTopicId(this.topicId!)
        .setMessage(message);

      const response = await transaction.execute(this.client);
      const receipt = await response.getReceipt(this.client);

      if (receipt.status === Status.Success) {
        return response.transactionId.toString();
      } else {
        throw new Error(`Failed to store analytics data: ${receipt.status}`);
      }
    } catch (error) {
      console.error('Error storing analytics data:', error);
      throw error;
    }
  }

  // Create topic for data storage (private method)
  private async createDataTopic(): Promise<void> {
    try {
      const transaction = new TopicCreateTransaction()
        .setTopicMemo('Watercoin AI Monitoring Data Storage')
        .setAdminKey(this.parseOperatorKey(this.config.operatorKey))
        .setSubmitKey(this.parseOperatorKey(this.config.operatorKey));

      const response = await transaction.execute(this.client);
      const receipt = await response.getReceipt(this.client);

      if (receipt.topicId) {
        this.topicId = receipt.topicId;
        console.log(`Created HEDERA topic: ${this.topicId.toString()}`);
      } else {
        throw new Error('Failed to create HEDERA topic');
      }
    } catch (error) {
      console.error('Error creating HEDERA topic:', error);
      throw error;
    }
  }

  // Get account balance
  async getAccountBalance(accountId: string): Promise<number> {
    try {
      const query = new AccountBalanceQuery()
        .setAccountId(AccountId.fromString(accountId));

      const balance = await query.execute(this.client);
      return balance.hbars.toTinybars().toNumber() / 100000000; // Convert to HBAR
    } catch (error) {
      console.error('Error getting account balance:', error);
      throw error;
    }
  }

  // Convert IDR to HEDERA
  static idrToHedera(idrAmount: number): number {
    const rate = 3000; // 1 HEDERA = 3000 IDR
    // Use precise division and rounding to avoid floating point errors
    const hederaAmount = idrAmount / rate;
    return Math.round(hederaAmount * 10000) / 10000; // Round to 4 decimal places
  }

  // Convert HEDERA to IDR
  static hederaToIdr(hederaAmount: number): number {
    const rate = 3000; // 1 HEDERA = 3000 IDR
    const idrAmount = hederaAmount * rate;
    return Math.round(idrAmount); // Round to nearest whole IDR
  }

  // Parse operatorKey input into a PrivateKey instance
  private parseOperatorKey(keyInput: any): PrivateKey {
    // If already a PrivateKey instance, return as-is
    try {
      if (!keyInput) {
        throw new Error('Empty operator key');
      }

      // If input looks like a serialized key string
      if (typeof keyInput === 'string') {
        // Accept both hex/0x and Hedera string formats
        try {
          return PrivateKey.fromString(keyInput);
        } catch (e) {
          // Try alternative parsing if needed
          throw new Error(`PrivateKey.fromString failed: ${e instanceof Error ? e.message : String(e)}`);
        }
      }

      // If input is an object (maybe already parsed), try to coerce
      if (typeof keyInput === 'object') {
        // If it's already an SDK PrivateKey-like object
        if (typeof (keyInput as any).toString === 'function' && (keyInput as any).toString().includes('PrivateKey')) {
          // Unsafe cast; attempt to use fromString on its string form
          return PrivateKey.fromString((keyInput as any).toString());
        }
      }

      throw new Error('Unsupported operatorKey format');
    } catch (err) {
      throw err;
    }
  }

  // Validate HEDERA address
  static validateAddress(address: string): boolean {
    try {
      // HEDERA addresses can be in format 0.0.123456 or 0x...
      if (address.startsWith('0.0.')) {
        AccountId.fromString(address);
        return true;
      } else if (address.startsWith('0x') && address.length === 42) {
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      // Simple query to check network connectivity
      const response = await fetch(`${this.config.mirrorNodeUrl}/api/v1/network/nodes?limit=1`);
      return response.ok;
    } catch {
      return false;
    }
  }

  // Close client connection
  close(): void {
    this.client.close();
  }
}

// Default configuration for different environments
export const HEDERA_CONFIG = {
  testnet: {
    network: 'testnet' as const,
    mirrorNodeUrl: 'https://testnet.mirrornode.hedera.com',
    operatorId: process.env.NEXT_PUBLIC_HEDERA_OPERATOR_ID || '',
    operatorKey: process.env.NEXT_PUBLIC_HEDERA_OPERATOR_KEY || '',
    watercoinAddress: process.env.NEXT_PUBLIC_WATERCOIN_HEDERA_ADDRESS || '0x6f6ecef0b8c2ff3291721951f34f7d8a0d54ead5'
  },
  mainnet: {
    network: 'mainnet' as const,
    mirrorNodeUrl: 'https://mainnet.mirrornode.hedera.com',
    operatorId: process.env.NEXT_PUBLIC_HEDERA_OPERATOR_ID || '',
    operatorKey: process.env.NEXT_PUBLIC_HEDERA_OPERATOR_KEY || '',
    watercoinAddress: process.env.NEXT_PUBLIC_WATERCOIN_HEDERA_ADDRESS || '0x6f6ecef0b8c2ff3291721951f34f7d8a0d54ead5'
  }
};

export default HederaAgent;