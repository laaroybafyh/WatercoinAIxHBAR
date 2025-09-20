'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import Link from 'next/link';
import { WS_URL } from '../lib/config';
import styles from '../styles/home.module.css';
import { generateRandomSensorPacket } from '../lib/sensor';
import type { SensorPacket } from '../lib/sensor';
import { evaluateWaterSafety } from '../lib/ml';
import { brands } from '../lib/standards';
import dynamic from 'next/dynamic';
const Navbar = dynamic(() => import('../components/Navbar'), { ssr: false });
import SensorCards from '../components/SensorCards';
import { HederaAgent, HEDERA_CONFIG } from '../lib/hederaAgent';
import StatusBanner from '../components/StatusBanner';
import UVToggle from '../components/UVToggle';
import HamburgerPanel from '../components/HamburgerPanel';
// Single, module-level TypingText component with loop support
const TypingText: React.FC<{ text: string; speed?: number; loopDelay?: number; loop?: boolean }> = ({ text, speed = 80, loopDelay = 5000, loop = true }) => {
  const [index, setIndex] = useState(0);
  const intervalRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const clearTimers = () => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const startTyping = () => {
    clearTimers();
    // Ensure index starts at 0
    setIndex(0);
    intervalRef.current = window.setInterval(() => {
      setIndex((i) => {
        const next = i + 1;
        if (next >= text.length) {
          // show full text then stop interval
          if (intervalRef.current !== null) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          // schedule restart after loopDelay if looping
          if (loop) {
            timeoutRef.current = window.setTimeout(() => {
              // reset and restart typing
              setIndex(0);
              startTyping();
            }, loopDelay);
          }
          return text.length;
        }
        return next;
      });
    }, speed);
  };

  useEffect(() => {
    startTyping();
    return () => {
      clearTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, speed, loopDelay, loop]);

  return (
    <p className={styles.subtitle} aria-live="polite">
      <span className={styles.typingText}>{text.slice(0, index)}</span>
      <span className={styles.typingCursor} aria-hidden="true" />
    </p>
  );
};

export default function HomePage() {
  // Inisialisasi dengan nilai default agar server dan client match
  const defaultPacket: SensorPacket = {
    timestamp: '',
    deviceId: '',
    location: '',
    parameters: {
      tds: { value: 0, unit: 'ppm' },
      tss: { value: 0, unit: 'mg/L' },
      turbidity: { value: 0, unit: 'NTU' },
      color: { value: 0, unit: 'TCU' },
      temperature: { value: 0, unit: '°C' },
      conductivity: { value: 0, unit: 'µS/cm' },
      ph: { value: 0, unit: '' },
      dissolved_oxygen: { value: 0, unit: 'mg/L' },
      cod: { value: 0, unit: 'mg/L' },
      bod: { value: 0, unit: 'mg/L' },
  nitrite: { value: 0, unit: 'mg/L' },
  nitrate: { value: 0, unit: 'mg/L' },
  ammonia: { value: 0, unit: 'mg/L' },
  cyanide: { value: 0, unit: 'mg/L' },
  zinc: { value: 0, unit: 'mg/L' },
      sulfate: { value: 0, unit: 'mg/L' },
      chloride: { value: 0, unit: 'mg/L' },
      fluoride: { value: 0, unit: 'mg/L' },
      aluminum: { value: 0, unit: 'mg/L' },
      iron: { value: 0, unit: 'mg/L' },
      manganese: { value: 0, unit: 'mg/L' },
      copper: { value: 0, unit: 'mg/L' },
      hardness: { value: 0, unit: 'mg/L' },
      odour: { value: 0, unit: '' },
      taste: { value: 0, unit: '' },
      ecoli: { value: 0, unit: 'CFU/100mL' },
      total_coliform: { value: 0, unit: 'CFU/100mL' }
    },
    metadata: {
      batteryLevel: 0,
      signalStrength: 0,
      lastMaintenance: '',
      calibrationDue: ''
    }
  };
  const [packet, setPacket] = useState(defaultPacket);
  const [showPanel, setShowPanel] = useState(false);
  const [uvOn, setUvOn] = useState(true);
  const [averages, setAverages] = useState<{count:number;avgTds:number;avgPh:number;avgTurbidity:number}>({count:0,avgTds:0,avgPh:0,avgTurbidity:0});

  const identifyBrand = (phVal: number | null, tdsVal: number | null) => {
    // brands imported from standards
    if (phVal === null || tdsVal === null) return null;
    for (const b of brands) {
      const phRange = b.phRange;
      const tdsRange = b.tdsRange;
      if (phRange && tdsRange && 
          phRange.length >= 2 && tdsRange.length >= 2 &&
          phVal >= phRange[0]! && phVal <= phRange[1]! && 
          tdsVal >= tdsRange[0]! && tdsVal <= tdsRange[1]!) {
        return `${b.name} (pH ${phRange[0]}-${phRange[1]}, TDS ${tdsRange[0]}-${tdsRange[1]} ppm)`;
      }
    }
    return 'Unknown';
  };

  useEffect(() => {
    let ws: WebSocket | null = null;
    // Setelah mount, baru generate data acak
    let mounted = true;
    if (mounted) {
      // run once after mount
      setPacket(() => generateRandomSensorPacket(uvOn));
    }
    try {
      ws = new WebSocket(WS_URL);
      ws.onmessage = (ev) => {
        try {
          const data = JSON.parse(ev.data);
          if (data?.type === 'snapshot' && data?.payload) {
            setPacket((p) => {
              const newPacket = { ...p, parameters: { ...p.parameters, ph: { value: data.payload.ph, unit: '' }, tds: { value: data.payload.tds, unit: 'ppm' } }, timestamp: new Date().toISOString() };
              return newPacket;
            });
          }
        } catch {}
      };
      ws.onerror = () => { /* fallback below */ };
    } catch {}
    const id = setInterval(() => setPacket((prev) => {
  const p = generateRandomSensorPacket(uvOn);
  return p;
    }), 1000);
    return () => { clearInterval(id); try { ws?.close(); } catch {} };
  }, [uvOn]);

  // Periodically fetch backend averages from HEDERA
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        // For now, use default sensor data averaging
        // HEDERA integration will be added later for historical data
        if (active) {
          setAverages({
            count: 1,
            avgTds: 120,
            avgPh: 7.2,
            avgTurbidity: 2.5
          });
        }
      } catch { /* ignore if backend not running */ }
    }
    load();
    const id = setInterval(load, 5000);
    return () => { active = false; clearInterval(id); };
  }, []);

  const safety = useMemo(() => {
    return evaluateWaterSafety(packet.parameters, uvOn);
  }, [packet, uvOn]);

  // map brand names to public image files
  const fileMap: Record<string,string> = { 'Cleo':'cleo.png','Amidis':'amidis.png','Watercoin':'watercoin.png','Le Minerale':'le minerale.png','Aqua':'aqua.png','Pristine 8+':'pristine.png','VIT':'VIT.png','Nestle Pure Life':'pure life.png' };

  const matchedBrand = useMemo(() => {
    if (!safety.safe) return null;
    const ph = Number(packet.parameters.ph.value);
    const tds = Number(packet.parameters.tds.value);
    if (Number.isNaN(ph) || Number.isNaN(tds)) return null;
    return brands.find((b) => {
      const phRange = b.phRange;
      const tdsRange = b.tdsRange;
      return phRange && tdsRange && 
             phRange.length >= 2 && tdsRange.length >= 2 &&
             ph >= phRange[0]! && ph <= phRange[1]! && 
             tds >= tdsRange[0]! && tds <= tdsRange[1]!;
    }) ?? null;
  }, [packet.parameters.ph.value, packet.parameters.tds.value, safety.safe]);

  return (
    <div className={styles.pageWrapper}>
      <Navbar />
      <main className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>WATERCOIN AI QUALITY MONITOR</h1>
          <TypingText text={"Real-time AI monitoring system for drinking water quality — SNI 6989-11:2019 & Permenkes RI No. 492/2010"} speed={80} />
        </header>

        <div className={styles.mainContent}>
            <div className={styles.leftSection}>
            <div className={styles.cardsGrid}>
              <SensorCards
                ph={packet.parameters.ph}
                tds={packet.parameters.tds}
              />
            </div>
            
            <div className={styles.uvStatusCard}>
              <div className={styles.identWrapper}>
                <div className={styles.identTitle}>Water Identification</div>
                {safety.safe ? (
                  identifyBrand(Number(packet.parameters.ph.value), Number(packet.parameters.tds.value)) === 'Unknown' ? (
                    <>
                      <div className={`${styles.identBrand} ${styles.identBrandSafe}`}>
                        <div className={styles.identText}>WATERCOIN</div>
                      </div>
                      <div style={{marginTop:12, display:'flex', justifyContent:'center'}}>
                        <img src={`/${fileMap['Watercoin']}`} alt="Watercoin" className={styles.brandLogoImage} />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className={`${styles.identBrand} ${styles.identBrandSafe}`}>
                        <div className={styles.identText}>{(identifyBrand(Number(packet.parameters.ph.value), Number(packet.parameters.tds.value)) ?? '').replace(/\s*\(.*\)/, '')}</div>
                      </div>
                      <div style={{marginTop:12}}>
                        {matchedBrand ? (
                          <div style={{display:'flex', justifyContent:'center'}}>
                            <img src={`/${fileMap[matchedBrand.name] ?? ''}`} alt={matchedBrand.name} className={styles.brandLogoImage} />
                          </div>
                        ) : (
                          <div className={styles.brandLogoDim}>Unidentified</div>
                        )}
                      </div>
                    </>
                  )
                ) : (
                  <div className={`${styles.identBrand} ${styles.identBrandDanger}`}>
                    <div className={styles.identText}>RAW WATER</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <section className={styles.statusSection}>
            <div className={styles.statusHeader}>
              <h2 className={styles.statusTitle}>Parameter Detail</h2>
              <button className={styles.menuButton} onClick={() => setShowPanel(true)} aria-label="Show parameters">
                <span className={styles.hamburger} />
              </button>
            </div>
            
            <div className={styles.uvControlSection}>
              <h3 className={styles.uvControlTitle}>UV Sterilizer Control</h3>
              <div className={styles.uvControl}>
                <UVToggle on={uvOn} onToggle={setUvOn} />
                <p className={styles.uvState}>STERILIZER: {uvOn ? 'ACTIVE' : 'INACTIVE'}</p>
              </div>
            </div>
            
              <div className={styles.statusWaterSection}>
              <h3 className={styles.statusWaterTitle}>Drinking Water Quality Status</h3>
              <StatusBanner safe={safety.safe} reason={safety.reason} />
              <div style={{marginTop:16,fontSize:12,opacity:0.8}}>
                <strong>Average (snapshot {averages.count}):</strong> pH {averages.avgPh.toFixed(2)} | TDS {averages.avgTds.toFixed(1)} ppm | Turbidity {averages.avgTurbidity.toFixed(1)}
              </div>
              
            </div>
          </section>
        </div>
      </main>

      <HamburgerPanel
        open={showPanel}
        onCloseAction={() => setShowPanel(false)}
        packet={packet}
      />
    </div>
  );
}


