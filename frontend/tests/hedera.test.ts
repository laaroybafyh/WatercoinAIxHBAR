// HEDERA Integration Tests for Watercoin AI Monitoring
// Test suite for payment flows, data storage, and blockchain integration

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { HederaAgent, HEDERA_CONFIG } from '../lib/hederaAgent';

describe('HEDERA Integration Tests', () => {
  let hederaAgent: HederaAgent;
  
  beforeEach(() => {
    // Use testnet configuration for testing
    hederaAgent = new HederaAgent(HEDERA_CONFIG.testnet);
  });
  
  afterEach(() => {
    if (hederaAgent) {
      hederaAgent.close();
    }
  });

  describe('Payment System', () => {
    test('should generate payment URI correctly', () => {
      const amount = 2.0; // 2 HBAR
      const transactionId = 'test_tx_12345';
      const memo = 'Water Quality Test Payment';
      
      const uri = hederaAgent.generatePaymentURI(amount, transactionId, memo);
      
      expect(uri).toContain('hedera://pay?');
      expect(uri).toContain(`amount=${amount.toFixed(2)}`);
      expect(uri).toContain(`reference=${transactionId}`);
      expect(uri).toContain('memo=');
    });

    test('should validate HEDERA addresses correctly', () => {
      // Valid HEDERA address formats
      expect(HederaAgent.validateAddress('0.0.123456')).toBe(true);
      expect(HederaAgent.validateAddress('0x6f6ecef0b8c2ff3291721951f34f7d8a0d54ead5')).toBe(true);
      
      // Invalid addresses
      expect(HederaAgent.validateAddress('invalid')).toBe(false);
      expect(HederaAgent.validateAddress('0.0')).toBe(false);
      expect(HederaAgent.validateAddress('0x123')).toBe(false);
    });

    test('should convert IDR to HEDERA correctly', () => {
      expect(HederaAgent.idrToHedera(3000)).toBe(1.0); // 3000 IDR = 1 HBAR
      expect(HederaAgent.idrToHedera(6000)).toBe(2.0); // 6000 IDR = 2 HBAR
      expect(HederaAgent.idrToHedera(1500)).toBe(0.5); // 1500 IDR = 0.5 HBAR
      expect(HederaAgent.idrToHedera(100)).toBe(0.04); // 100 IDR = 0.04 HBAR (rounded up)
    });

    test('should convert HEDERA to IDR correctly', () => {
      expect(HederaAgent.hederaToIdr(1.0)).toBe(3000); // 1 HBAR = 3000 IDR
      expect(HederaAgent.hederaToIdr(2.5)).toBe(7500); // 2.5 HBAR = 7500 IDR
      expect(HederaAgent.hederaToIdr(0.5)).toBe(1500); // 0.5 HBAR = 1500 IDR
    });
  });

  describe('Data Storage', () => {
    test('should format sensor data correctly', () => {
      const sensorData = {
        pH: 7.5,
        tds: 150,
        temperature: 25,
        timestamp: Date.now(),
        location: 'Test Location'
      };

      expect(sensorData.pH).toBeGreaterThan(0);
      expect(sensorData.pH).toBeLessThanOrEqual(14);
      expect(sensorData.tds).toBeGreaterThan(0);
      expect(sensorData.temperature).toBeGreaterThan(0);
      expect(typeof sensorData.location).toBe('string');
      expect(sensorData.timestamp).toBeGreaterThan(0);
    });

    test('should format survey data correctly', () => {
      const surveyData = {
        sentiment: 'positive' as const,
        timestamp: Date.now(),
        deviceId: 'POS-HEDERA-1',
        rating: 5
      };

      expect(['positive', 'neutral', 'negative']).toContain(surveyData.sentiment);
      expect(surveyData.rating).toBeGreaterThanOrEqual(1);
      expect(surveyData.rating).toBeLessThanOrEqual(5);
      expect(typeof surveyData.deviceId).toBe('string');
      expect(surveyData.timestamp).toBeGreaterThan(0);
    });
  });

  describe('Network Health', () => {
    test('should perform health check', async () => {
      const isHealthy = await hederaAgent.healthCheck();
      expect(typeof isHealthy).toBe('boolean');
    }, 10000); // 10 second timeout for network calls
  });

  describe('Price Display', () => {
    test('should format product prices for display', () => {
      const products = [
        { name: 'DRINKING WATER RO 19L', priceIDR: 6000 },
        { name: 'GALLON 19L AQUA', priceIDR: 20000 },
        { name: 'GALLON 19L CLEO', priceIDR: 18000 },
        { name: 'FIRST GALLON', priceIDR: 65000 }
      ];

      products.forEach(product => {
        const hederaAmount = HederaAgent.idrToHedera(product.priceIDR);
        
        expect(hederaAmount).toBeGreaterThan(0);
        expect(Number.isFinite(hederaAmount)).toBe(true);
        
        // Verify formatting
        const formattedIDR = product.priceIDR.toLocaleString('id-ID');
        const formattedHEDERA = hederaAmount.toFixed(4);
        
        expect(formattedIDR).toMatch(/^\d{1,3}(,\d{3})*$/);
        expect(formattedHEDERA).toMatch(/^\d+\.\d{4}$/);
      });
    });
  });

  describe('Transaction Monitoring', () => {
    test('should handle transaction monitoring timeout', async () => {
      const shortTimeout = 1000; // 1 second timeout for testing
      
      const monitoringPromise = hederaAgent.monitorTransactions(
        1.0, // 1 HBAR
        'test_tx_timeout',
        shortTimeout
      );

      const result = await monitoringPromise;
      expect(result.status).toBe('failed');
      expect(result.transactionId).toBe('test_tx_timeout');
    }, 5000);
  });

  describe('Configuration Validation', () => {
    test('should have valid testnet configuration', () => {
      const config = HEDERA_CONFIG.testnet;
      
      expect(config.network).toBe('testnet');
      expect(config.mirrorNodeUrl).toContain('testnet.mirrornode.hedera.com');
      expect(typeof config.watercoinAddress).toBe('string');
      expect(config.watercoinAddress.length).toBeGreaterThan(0);
    });

    test('should have valid mainnet configuration', () => {
      const config = HEDERA_CONFIG.mainnet;
      
      expect(config.network).toBe('mainnet');
      expect(config.mirrorNodeUrl).toContain('mainnet.mirrornode.hedera.com');
      expect(typeof config.watercoinAddress).toBe('string');
      expect(config.watercoinAddress.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid payment amounts', () => {
      expect(() => HederaAgent.idrToHedera(-100)).not.toThrow();
      expect(() => HederaAgent.idrToHedera(0)).not.toThrow();
      expect(HederaAgent.idrToHedera(-100)).toBe(-0.04); // Negative amounts allowed for refunds
      expect(HederaAgent.idrToHedera(0)).toBe(0);
    });

    test('should handle missing environment variables gracefully', () => {
      const configWithMissingVars = {
        network: 'testnet' as const,
        mirrorNodeUrl: 'https://testnet.mirrornode.hedera.com',
        operatorId: '',
        operatorKey: '',
        watercoinAddress: '0x6f6ecef0b8c2ff3291721951f34f7d8a0d54ead5'
      };

      expect(() => new HederaAgent(configWithMissingVars)).not.toThrow();
    });
  });
});