'use client';

import { useMemo, useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import styles from '../../styles/pos.module.css';
import { usePOSStore } from '../../lib/store';
import { HederaAgent, HEDERA_CONFIG } from '../../lib/hederaAgent';
import { saveSnapshotToHedera, addSurveyToHedera } from '../../lib/hederaHelpers';
import HederaPayment from '../../components/HederaPayment';

type Stage = 'items' | 'payment' | 'hedera-payment' | 'result' | 'dispense' | 'survey';

export default function POSPage() {
  const [stage, setStage] = useState<Stage>('items');
  const [selected, setSelected] = useState<string | null>(null);
  const [paid, setPaid] = useState<boolean | null>(null);
  const [dispensed, setDispensed] = useState(0);
  const [hederaTransactionId, setHederaTransactionId] = useState<string | null>(null);
  const [isDispensing, setIsDispensing] = useState(false);
  const dispensingInterval = useRef<NodeJS.Timeout | null>(null);

  const store = usePOSStore();
  const products = store.products;
  const { partnerName } = store;
  const product = products.find(p => p.id === selected) ?? null;

  const liters = Math.min(19, dispensed);
  const pct = Math.floor((liters / 19) * 100);

  // Function to start dispensing
  const startDispensing = () => {
    if (isDispensing || liters >= 19) return;
    
    setIsDispensing(true);
    dispensingInterval.current = setInterval(() => {
      setDispensed(prev => {
        const next = Math.min(19, prev + 1);
        if (next >= 19) {
          setIsDispensing(false);
          if (dispensingInterval.current) {
            clearInterval(dispensingInterval.current);
            dispensingInterval.current = null;
          }
        }
        return next;
      });
    }, 200);
  };

  // Function to stop dispensing
  const stopDispensing = () => {
    setIsDispensing(false);
    if (dispensingInterval.current) {
      clearInterval(dispensingInterval.current);
      dispensingInterval.current = null;
    }
  };

  // Function to reset dispensing
  const resetDispensing = () => {
    stopDispensing();
    setDispensed(0);
  };

  // Cleanup interval when component unmounts or stage changes
  useEffect(() => {
    return () => {
      if (dispensingInterval.current) {
        clearInterval(dispensingInterval.current);
        dispensingInterval.current = null;
      }
    };
  }, []);

  // Stop dispensing when stage changes away from dispense
  useEffect(() => {
    if (stage !== 'dispense') {
      stopDispensing();
    }
  }, [stage]);

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>Monitoring</Link>
        <h1 className={styles.title}>
          Watercoin POS — {(partnerName ?? 'Partner') || 'Partner'}
        </h1>
        <Link className={styles.settings} href="/pos/settings">Settings</Link>
      </header>

      {stage === 'items' && (
        <section className={styles.items}>
          {products.map(p => {
            const hederaAmount = HederaAgent.idrToHedera(p.price);
            return (
              <button key={p.id} className={styles.item} onClick={() => { setSelected(p.id); setStage('payment'); }}>
                <div className={styles.itemName}>{p.name}</div>
                <div className={styles.itemPrice}>
                  <div>Rp {p.price.toLocaleString('id-ID')}</div>
                  <div style={{fontSize: '0.7rem', color: '#000000', fontWeight: '500', marginTop: '2px'}}>
                    ~ {hederaAmount.toFixed(1)} HBAR
                  </div>
                </div>
                <div className={styles.brandLogo}>
                  {p.image ? (
                    <img src={p.image} alt={p.name} className={styles.logoImg} />
                  ) : (
                    // Fallback to default images based on ID
                    <>
                      {p.id === 'air-ro' && (
                        <img src="/watercoin.png" alt="Watercoin" className={styles.logoImg} />
                      )}
                      {p.id === 'aqua' && (
                        <img src="/aqua.png" alt="Aqua" className={styles.logoImg} />
                      )}
                      {p.id === 'cleo' && (
                        <img src="/cleo.png" alt="Cleo" className={styles.logoImg} />
                      )}
                      {p.id === 'galon-first' && (
                        <img src="/watercoin.png" alt="Watercoin" className={styles.logoImg} />
                      )}
                      {!['air-ro', 'aqua', 'cleo', 'galon-first'].includes(p.id) && (
                        <img src="/watercoin.png" alt="Default" className={styles.logoImg} />
                      )}
                    </>
                  )}
                </div>
              </button>
            );
          })}
        </section>
      )}

      {stage === 'payment' && product && (
        <section>
          <h2 style={{color: '#FFFFFF', marginTop: '24px', marginBottom: '8px', textAlign: 'center'}}>Payment Method</h2>
          <p style={{color: '#FFFFFF', marginBottom: '24px', textAlign: 'center'}}>
            Item: {product.name} — Rp {product.price.toLocaleString('id-ID')}
            <br />
            <span style={{fontSize: '0.9rem', color: '#000000', fontWeight: '600'}}>
              ~ {HederaAgent.idrToHedera(product.price).toFixed(1)} HBAR
            </span>
          </p>
          <div className={styles.items}>
            {/* HEDERA Payment - Updated with standard white box style */}
            <button 
              className={styles.item} 
              onClick={() => setStage('hedera-payment')}
            >
              <div className={styles.itemName}>Pay with HEDERA</div>
              <div style={{color: '#FFFFFF', fontSize: '0.9rem', marginTop: '4px', fontWeight: '600'}}>
                Blockchain Payment
              </div>
              <div className={styles.brandLogo}>
                <img src="/hedera.png" alt="HEDERA" className={styles.logoImg} />
              </div>
            </button>

            {/* Waterians Card */}
            <button 
              className={styles.item} 
              onClick={() => {
                const ok = Math.random() > 0.15;
                setPaid(ok);
                setStage('result');
              }}
            >
              <div className={styles.itemName}>Waterians Card</div>
              <div className={styles.brandLogo}>
                <img src="/waterians card.png" alt="Waterians Card" className={styles.logoImg} />
              </div>
            </button>

            {/* QR Watercoin APP */}
            <button 
              className={styles.item} 
              onClick={() => {
                const ok = Math.random() > 0.15;
                setPaid(ok);
                setStage('result');
              }}
            >
              <div className={styles.itemName}>QR Watercoin APP</div>
              <div className={styles.brandLogo}>
                <img src="/qr watercoin app.png" alt="QR Watercoin APP" className={styles.logoImg} />
              </div>
            </button>

            {/* Cash */}
            <button 
              className={styles.item} 
              onClick={() => {
                const ok = Math.random() > 0.15;
                setPaid(ok);
                setStage('result');
              }}
            >
              <div className={styles.itemName}>Cash</div>
              <div className={styles.brandLogo}>
                <img src="/cash.png" alt="Cash" className={styles.logoImg} />
              </div>
            </button>
          </div>
        </section>
      )}

      {stage === 'hedera-payment' && product && (
        <section className={styles.hederaPaymentSection}>
          <HederaPayment
            amount={product.price}
            description={`Water Quality Analysis - ${product.name}`}
            onPaymentSuccess={(transactionId) => {
              setHederaTransactionId(transactionId);
              setPaid(true);
              setStage('result');
            }}
            onPaymentError={(error) => {
              console.error('HEDERA payment error:', error);
              setPaid(false);
              setStage('result');
            }}
            autoClose={false}
          />
        </section>
      )}

      {stage === 'result' && (
        <section style={{display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '80vh', position: 'relative', justifyContent: 'center'}}>
          {paid ? (
            <>
              <div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', minHeight: '40vh', paddingTop: '8vh'}}>
                <h2 style={{color: '#FFFFFF', fontSize: '3rem', fontWeight: 800, marginBottom: '32px', textAlign: 'center'}}>Payment Successful</h2>
                {hederaTransactionId && (
                  <div style={{background: '#f0f9ff', padding: '16px', borderRadius: '12px', marginBottom: '16px'}}>
                    <p style={{color: '#0D6CA3', fontSize: '1rem', margin: '4px 0'}}>
                      <strong>HEDERA Transaction:</strong>
                    </p>
                    <p style={{color: '#666', fontSize: '0.9rem', margin: '4px 0'}}>
                      Amount: {product ? HederaAgent.idrToHedera(product.price).toFixed(1) : 'N/A'} HBAR
                    </p>
                    <p style={{color: '#666', fontSize: '0.9rem', margin: '4px 0'}}>
                      IDR: Rp {product ? product.price.toLocaleString('id-ID') : 'N/A'}
                    </p>
                    <p style={{color: '#666', fontSize: '0.8rem', margin: '4px 0', fontFamily: 'monospace'}}>
                      ID: {hederaTransactionId.slice(0, 16)}...
                    </p>
                  </div>
                )}
              </div>
              <div style={{width: '100%', display: 'flex', justifyContent: 'center'}}>
                <button 
                  style={{
                    background: '#fff', 
                    color: '#222', 
                    fontSize: '1.2rem', 
                    fontWeight: 700, 
                    padding: '16px 32px', 
                    borderRadius: '20px', 
                    border: 'none', 
                    position: 'absolute', 
                    bottom: '5vh', 
                    left: '50%', 
                    transform: 'translateX(-50%)', 
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    cursor: 'pointer',
                    zIndex: 999,
                    pointerEvents: 'auto'
                  }} 
                  onClick={async () => {
                    if (selected === 'galon-first') {
                      // Save sensor data to HEDERA
                      try {
                        await saveSnapshotToHedera({
                          timestamp: BigInt(Date.now()),
                          deviceId: 'POS-HEDERA-1',
                          location: partnerName ?? 'Unknown',
                          tds: { value: 25, unit: 'ppm' },
                          ph: { value: 7.6, unit: '' },
                          turbidity: { value: 0.5, unit: 'NTU' }
                        });
                      } catch (e) { 
                        console.error('Failed to save sensor data to HEDERA', e); 
                      }
                      setStage('survey');
                    } else {
                      setStage('dispense');
                    }
                  }}
                >
                  {selected === 'galon-first' ? 'Continue to Survey' : 'Continue to Filling Control'}
                </button>
              </div>
            </>
          ) : (
            <>
              <div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', minHeight: '40vh', paddingTop: '8vh'}}>
                <h2 style={{color: '#FFFFFF', fontSize: '3rem', fontWeight: 800, marginBottom: '32px', textAlign: 'center'}}>Payment Failed</h2>
              </div>
              <div style={{width: '100%', display: 'flex', justifyContent: 'center'}}>
                <button 
                  style={{
                    background: '#fff', 
                    color: '#222', 
                    fontSize: '1.2rem', 
                    fontWeight: 700, 
                    padding: '16px 32px', 
                    borderRadius: '20px', 
                    border: 'none', 
                    position: 'absolute', 
                    bottom: '5vh', 
                    left: '50%', 
                    transform: 'translateX(-50%)', 
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    cursor: 'pointer',
                    zIndex: 999,
                    pointerEvents: 'auto'
                  }} 
                  onClick={() => setStage('payment')}
                >
                  Back to Payment
                </button>
              </div>
            </>
          )}
        </section>
      )}

      {stage === 'dispense' && (
        <section className={styles.dispense} style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '50vh', marginTop: '14vh'}}> 
          <h2 style={{color: '#222'}}>Filling Control</h2>
          <div className={styles.progressBar}><div className={styles.progress} style={{ width: `${pct}%` }} /></div>
          <p style={{color: '#222'}}>{liters} / 19 L</p>
          
          {liters < 19 && (
            <div className={styles.controls}>
              <button 
                style={{
                  background: isDispensing ? 'var(--card-bg)' : 'var(--accent)', 
                  color: isDispensing ? 'var(--primary)' : 'var(--text-on-gradient)', 
                  border: isDispensing ? '2px solid var(--primary)' : 'none', 
                  padding: '12px 24px', 
                  borderRadius: '12px', 
                  fontWeight: 700, 
                  cursor: isDispensing ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  opacity: isDispensing ? 0.6 : 1
                }}
                onClick={startDispensing}
                disabled={isDispensing || liters >= 19}
              >
                {isDispensing ? 'RUNNING...' : 'START'}
              </button>
              <button 
                style={{
                  background: isDispensing ? 'var(--danger)' : 'var(--card-bg)', 
                  color: isDispensing ? 'var(--text-on-gradient)' : 'var(--primary)', 
                  border: isDispensing ? 'none' : '2px solid var(--primary)', 
                  padding: '12px 24px', 
                  borderRadius: '12px', 
                  fontWeight: 700, 
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
                onClick={stopDispensing}
              >
                STOP
              </button>
              <button 
                style={{
                  background: 'var(--card-bg)', 
                  color: 'var(--text-color)', 
                  border: '2px solid var(--text-color)', 
                  padding: '12px 24px', 
                  borderRadius: '12px', 
                  fontWeight: 700, 
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
                onClick={resetDispensing}
              >
                RESET
              </button>
            </div>
          )}
          
          {liters >= 19 && (
            <div className={styles.controls}>
              <button 
                style={{
                  background: 'var(--accent)', 
                  color: 'var(--text-on-gradient)', 
                  border: 'none', 
                  padding: '16px 32px', 
                  borderRadius: '12px', 
                  fontWeight: 700, 
                  cursor: 'pointer',
                  fontSize: '18px'
                }}
                onClick={async () => {
                  try {
                    await saveSnapshotToHedera({
                      timestamp: BigInt(Date.now()),
                      deviceId: 'POS-HEDERA-1',
                      location: (partnerName ?? 'Unknown'),
                      tds: { value: 25, unit: 'ppm' },
                      ph: { value: 7.6, unit: '' },
                      turbidity: { value: 0.5, unit: 'NTU' }
                    });
                  } catch (e) { console.error('Failed save snapshot to HEDERA', e); }
                  setStage('survey');
                }}
              >
                COMPLETE
              </button>
            </div>
          )}
        </section>
      )}

      {stage === 'survey' && (
        <section style={{marginTop: '48px', textAlign: 'center'}}>
          <h2 style={{color: '#FFFFFF', fontWeight: 800, fontSize: '2.2rem', marginBottom: '32px'}}>Your Satisfaction</h2>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px', justifyContent: 'center', maxWidth: '700px', margin: '0 auto'}}>
            <button 
              style={{
                height: '140px', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center', 
                alignItems: 'center',
                background: 'var(--card-bg)',
                borderRadius: '20px',
                border: 'none',
                cursor: 'pointer'
              }}
              onClick={async () => {
                usePOSStore.getState().addSurvey({ sentiment: 'positive' });
                try { await addSurveyToHedera('positive'); } catch(e){ console.warn('survey save failed', e); }
                setTimeout(() => window.location.assign('/'), 400);
              }}
            >
              <span style={{fontSize: '2rem', marginBottom: '8px'}}>😊</span>
              <span style={{fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)'}}>HAPPY</span>
            </button>
            
            <button 
              style={{
                height: '140px', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center', 
                alignItems: 'center',
                background: 'var(--card-bg)',
                borderRadius: '20px',
                border: 'none',
                cursor: 'pointer'
              }}
              onClick={async () => {
                usePOSStore.getState().addSurvey({ sentiment: 'neutral' });
                try { await addSurveyToHedera('neutral'); } catch(e){ console.warn('survey save failed', e); }
                setTimeout(() => window.location.assign('/'), 400);
              }}
            >
              <span style={{fontSize: '2rem', marginBottom: '8px'}}>😐</span>
              <span style={{fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)'}}>NEUTRAL</span>
            </button>
            
            <button 
              style={{
                height: '140px', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center', 
                alignItems: 'center',
                background: 'var(--card-bg)',
                borderRadius: '20px',
                border: 'none',
                cursor: 'pointer'
              }}
              onClick={async () => {
                usePOSStore.getState().addSurvey({ sentiment: 'negative' });
                try { await addSurveyToHedera('negative'); } catch(e){ console.warn('survey save failed', e); }
                setTimeout(() => window.location.assign('/'), 400);
              }}
            >
              <span style={{fontSize: '2rem', marginBottom: '8px'}}>😞</span>
              <span style={{fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)'}}>DISAPPOINTED</span>
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
