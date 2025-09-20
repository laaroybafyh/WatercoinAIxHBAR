'use client';

import { useEffect, useState } from 'react';
import styles from '../styles/panel.module.css';
import type { SensorPacket } from '../lib/sensor';
import { thresholdStrings } from '../lib/standards';

export default function HamburgerPanel({ open, onCloseAction, packet }: { open: boolean; onCloseAction: () => void; packet: SensorPacket }) {
  const [localPacket, setLocalPacket] = useState(packet);

  useEffect(() => {
    if (!open) return;
    setLocalPacket(packet);
    const id = setInterval(() => {
      // refresh with new incoming packet reference each second while open
      setLocalPacket(prev => ({ ...packet }));
    }, 1000);
    return () => clearInterval(id);
  }, [open, packet]);

  // Canonical 23 parameters (ordered) pulled from README. Each entry: label, paramKey
  const paramList: Array<{ num: number; label: string; key: keyof typeof localPacket.parameters; unit?: string }> = [
    // Physical (1-6)
    { num: 1, label: 'Color (TCU)', key: 'color' },
    { num: 2, label: 'Odour', key: 'odour' },
    { num: 3, label: 'Taste', key: 'taste' },
    { num: 4, label: 'Turbidity (NTU)', key: 'turbidity' },
    { num: 5, label: 'Temperature (°C)', key: 'temperature' },
    { num: 6, label: 'TDS (mg/L)', key: 'tds' },
    // Chemical (7-21)
    { num: 7, label: 'pH', key: 'ph' },
    { num: 8, label: 'Organic Substances (mg/L)', key: 'cod' },
    { num: 9, label: 'Hardness (mg/L)', key: 'hardness' },
    { num: 10, label: 'Sulfate (mg/L)', key: 'sulfate' },
    { num: 11, label: 'Nitrite (mg/L)', key: 'nitrite' },
    { num: 12, label: 'Chloride (mg/L)', key: 'chloride' },
    { num: 13, label: 'Nitrate (mg/L)', key: 'nitrate' },
    { num: 14, label: 'Cyanide (mg/L)', key: 'cyanide' },
    { num: 15, label: 'Fluoride (mg/L)', key: 'fluoride' },
    { num: 16, label: 'Ammonia (mg/L)', key: 'ammonia' },
    { num: 17, label: 'Aluminum (mg/L)', key: 'aluminum' },
    { num: 18, label: 'Copper (mg/L)', key: 'copper' },
    { num: 19, label: 'Iron (mg/L)', key: 'iron' },
    { num: 20, label: 'Manganese (mg/L)', key: 'manganese' },
    { num: 21, label: 'Zinc (mg/L)', key: 'zinc' },
    // Microbiology (22-23)
    { num: 22, label: 'Total Coliform (/100mL)', key: 'total_coliform' },
    { num: 23, label: 'E. coli (/100mL)', key: 'ecoli' }
  ];

  // Group index ranges for display
  const groups = [
    { title: 'Physical', items: paramList.slice(0, 6) },
    { title: 'Chemical', items: paramList.slice(6, 21) },
    { title: 'Microbiology', items: paramList.slice(21, 23) }
  ];

  // Threshold strings keyed by parameter key to match the reference exactly
  const getThreshold = (key: string) => (thresholdStrings as any)[key] ?? '';

  return (
    <div className={open ? styles.panelOpen : styles.panelClosed} aria-hidden={!open}>
      <div className={styles.panelHeader}>
        <h3 className={styles.panelTitle}>Drinking Water Parameters (23 SNI Parameters)</h3>
        <button className={styles.closeBtn} onClick={onCloseAction} aria-label="Close">×</button>
      </div>
      <div className={styles.scrollArea}>
        {groups.map((g) => (
          <div key={g.title} className={styles.group}>
            <div className={styles.groupTitle}>{g.title}</div>
            {g.items.map((it) => {
              const p = localPacket.parameters[it.key] as any;
              const label = `${it.num}. ${it.label}`;
              return (
                <div key={label} className={styles.row}>
                  <div className={styles.label}>
                    <div className={styles.name}>{label}</div>
                          <div className={styles.limit}>{getThreshold(it.key as string)}</div>
                  </div>
                  <div className={styles.value}>{!p || isNaN(p.value) ? '-' : p.value.toFixed(p.value < 10 ? 2 : 1)} {p?.unit}</div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}


