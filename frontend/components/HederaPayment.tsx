// HEDERA Payment Component for Samsung Tab8 Landscape Layout
// Optimized for water quality monitoring payment system

'use client';

import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { HederaAgent, HEDERA_CONFIG } from '../lib/hederaAgent';
import type { PaymentRequest, TransactionStatus } from '../lib/hederaAgent';
import styles from '../styles/pos.module.css';

interface HederaPaymentProps {
  amount: number; // in IDR
  onPaymentSuccess: (transactionId: string) => void;
  onPaymentError: (error: string) => void;
  description?: string;
  autoClose?: boolean;
  timeoutMs?: number;
}

interface PaymentStep {
  step: number;
  title: string;
  description: string;
  completed: boolean;
}

export default function HederaPayment({
  amount,
  onPaymentSuccess,
  onPaymentError,
  description = 'Water Quality Analysis Payment',
  autoClose = true,
  timeoutMs = 300000 // 5 minutes default
}: HederaPaymentProps) {
  // State management
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'generating' | 'waiting' | 'success' | 'failed'>('idle');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [transactionId, setTransactionId] = useState<string>('');
  const [hederaAmount, setHederaAmount] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [steps, setSteps] = useState<PaymentStep[]>([]);

  // Refs
  const hederaAgent = useRef<HederaAgent | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const monitoringRef = useRef<boolean>(false);

  // Initialize HEDERA agent and payment steps
  useEffect(() => {
    const config = process.env.NODE_ENV === 'production' 
      ? HEDERA_CONFIG.mainnet 
      : HEDERA_CONFIG.testnet;
    
    hederaAgent.current = new HederaAgent(config);
    
    // Calculate HEDERA amount
    const hederaAmt = HederaAgent.idrToHedera(amount);
    setHederaAmount(hederaAmt);
    
    // Initialize payment steps
    const paymentSteps: PaymentStep[] = [
      {
        step: 1,
        title: 'Generate Payment QR',
        description: 'Creating secure payment request',
        completed: false
      },
      {
        step: 2,
        title: 'Scan QR Code',
        description: 'Use HEDERA wallet to scan and pay',
        completed: false
      },
      {
        step: 3,
        title: 'Monitor Transaction',
        description: 'Waiting for blockchain confirmation',
        completed: false
      },
      {
        step: 4,
        title: 'Payment Complete',
        description: 'Transaction verified successfully',
        completed: false
      }
    ];
    
    setSteps(paymentSteps);
    
    // Auto-start payment process
    initiatePayment();
    
    return () => {
      if (hederaAgent.current) {
        hederaAgent.current.close();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [amount]);

  // Generate QR code and start payment process
  const initiatePayment = async () => {
    if (!hederaAgent.current) {
      onPaymentError('HEDERA agent not initialized');
      return;
    }

    setIsProcessing(true);
    setPaymentStatus('generating');
    setErrorMessage('');

    try {
      // Generate unique transaction ID
      const txId = `watercoin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setTransactionId(txId);

      // Update step 1
      updateStepStatus(1, true);

      // Generate payment URI with memo
      const memo = `${description} - ${txId}`;
      const paymentUri = hederaAgent.current.generatePaymentURI(hederaAmount, txId, memo);

      // Generate QR code
      const qrUrl = await QRCode.toDataURL(paymentUri, {
        width: 300,
        margin: 2,
        color: {
          dark: '#1a365d',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'M'
      });

      setQrCodeUrl(qrUrl);
      setPaymentStatus('waiting');

      // Update step 2
      updateStepStatus(2, true);

      // Start countdown timer
      setTimeRemaining(timeoutMs / 1000);
      const countdownInterval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Set timeout
      timeoutRef.current = setTimeout(() => {
        if (paymentStatus !== 'success') {
          setPaymentStatus('failed');
          setErrorMessage('Payment timeout - Please try again');
          onPaymentError('Payment timeout');
        }
        clearInterval(countdownInterval);
      }, timeoutMs);

      // Start monitoring for payment
      if (!monitoringRef.current) {
        monitoringRef.current = true;
        updateStepStatus(3, true);
        await monitorPayment(txId);
      }

    } catch (error) {
      console.error('Error initiating payment:', error);
      setPaymentStatus('failed');
      setErrorMessage('Failed to generate payment QR code');
      onPaymentError(`Payment initiation failed: ${error}`);
    }
  };

  // Monitor payment status
  const monitorPayment = async (txId: string) => {
    if (!hederaAgent.current) return;

    try {
      const result = await hederaAgent.current.monitorTransactions(hederaAmount, txId, timeoutMs);
      
      if (result.status === 'success') {
        setPaymentStatus('success');
        updateStepStatus(4, true);
        
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        onPaymentSuccess(result.transactionId);
        
        // Auto close after success
        if (autoClose) {
          setTimeout(() => {
            // Close payment modal or redirect
          }, 2000);
        }
      } else {
        setPaymentStatus('failed');
        setErrorMessage('Payment verification failed');
        onPaymentError('Payment not received or verification failed');
      }
    } catch (error) {
      console.error('Error monitoring payment:', error);
      setPaymentStatus('failed');
      setErrorMessage('Error monitoring payment');
      onPaymentError(`Payment monitoring failed: ${error}`);
    } finally {
      monitoringRef.current = false;
    }
  };

  // Update step status
  const updateStepStatus = (stepNumber: number, completed: boolean) => {
    setSteps(prevSteps => 
      prevSteps.map(step => 
        step.step === stepNumber ? { ...step, completed } : step
      )
    );
  };

  // Format time remaining
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={styles.hederaPayment__container}>
      {/* Left Panel - QR Code and Status */}
      <div className={styles.hederaPayment__qr}>
        {/* Payment Header */}
        <div className={styles.hederaPayment__header}>
          <h2 className={styles.hederaPayment__title}>HEDERA Payment</h2>
          <div className={styles.hederaPayment__amounts}>
            <div className={styles.hederaPayment__idr}>
              Rp {amount.toLocaleString('id-ID')}
            </div>
            <div className={styles.hederaPayment__hedera}>
              ~ {hederaAmount.toFixed(2)} HBAR
            </div>
          </div>
        </div>

        {/* QR Code Display */}
        {paymentStatus === 'waiting' && qrCodeUrl && (
          <div className={styles.hederaPayment__qrContainer}>
            <img src={qrCodeUrl} alt="HEDERA Payment QR Code" className={styles.hederaPayment__qrImage} />
            <div className={styles.hederaPayment__qrInstructions}>
              <p>Scan with HEDERA wallet</p>
              <div className={styles.hederaPayment__walletIcons}>
                <span>💳 HashPack</span>
                <span>📱 Blade</span>
                <span>🔐 Wallawallet</span>
              </div>
            </div>
          </div>
        )}

        {/* Status Messages */}
        {paymentStatus === 'success' && (
          <div className={styles.hederaPayment__success}>
            <div className={styles.hederaPayment__successIcon}>✅</div>
            <div className={styles.hederaPayment__successText}>Payment Successful!</div>
            <div className={styles.hederaPayment__txId}>
              ID: {transactionId.slice(0, 16)}...
            </div>
          </div>
        )}

        {paymentStatus === 'failed' && (
          <div className={styles.hederaPayment__error}>
            <div className={styles.hederaPayment__errorIcon}>❌</div>
            <div className={styles.hederaPayment__errorText}>{errorMessage}</div>
          </div>
        )}
      </div>

      {/* Right Panel - Details and Actions */}
      <div className={styles.hederaPayment__details}>
        {/* Timer */}
        {timeRemaining > 0 && paymentStatus === 'waiting' && (
          <div className={styles.hederaPayment__timer}>
            <div className={styles.hederaPayment__timerIcon}>⏱️</div>
            <div className={styles.hederaPayment__timerText}>{formatTime(timeRemaining)}</div>
          </div>
        )}

        {/* Payment Steps */}
        <div className={styles.hederaPayment__steps}>
          {steps.map((step, index) => (
            <div 
              key={step.step}
              className={`${styles.hederaPayment__step} ${step.completed ? styles.completed : ''} ${
                paymentStatus === 'generating' && step.step === 1 ? styles.active :
                paymentStatus === 'waiting' && step.step === 2 ? styles.active :
                paymentStatus === 'waiting' && step.step === 3 ? styles.active :
                paymentStatus === 'success' && step.step === 4 ? styles.active : ''
              }`}
            >
              <div className={styles.hederaPayment__stepNumber}>
                {step.completed ? '✓' : step.step}
              </div>
              <div className={styles.hederaPayment__stepContent}>
                <div className={styles.hederaPayment__stepTitle}>{step.title}</div>
                <div className={styles.hederaPayment__stepDescription}>{step.description}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className={styles.hederaPayment__actions}>
          {paymentStatus === 'waiting' && (
            <div className={styles.hederaPayment__waitingActions}>
              <div className={styles.hederaPayment__waitingText}>
                Waiting for payment confirmation...
              </div>
              <button 
                onClick={() => {
                  setPaymentStatus('idle');
                  setQrCodeUrl('');
                  if (timeoutRef.current) clearTimeout(timeoutRef.current);
                }}
                className={styles.hederaPayment__secondaryButton}
              >
                Cancel Payment
              </button>
            </div>
          )}

          {paymentStatus === 'failed' && (
            <button 
              onClick={() => {
                setPaymentStatus('idle');
                setErrorMessage('');
                setQrCodeUrl('');
                initiatePayment();
              }}
              className={styles.hederaPayment__primaryButton}
            >
              Try Again
            </button>
          )}
        </div>

        {/* Network Status */}
        <div className={styles.hederaPayment__network}>
          <div className={styles.hederaPayment__networkBadge}>
            <div className={styles.hederaPayment__networkDot}></div>
            <span>HEDERA {process.env.NODE_ENV === 'production' ? 'Mainnet' : 'Testnet'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}