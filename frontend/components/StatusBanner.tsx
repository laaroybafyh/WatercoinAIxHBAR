import styles from '../styles/home.module.css';

export default function StatusBanner({ safe, reason }: { safe: boolean; reason: string }) {
  // If reason includes UV or microbiology keywords, show a short prioritized label
  const lower = reason.toLowerCase();
  const hasMicro = lower.includes('e. coli') || lower.includes('koliform') || lower.includes('mikrobiologi');
  const hasUV = lower.includes('uv sterilizer') || lower.includes('uv');

  const mainLabel = safe ? 'DRINKING WATER SAFE' : (hasMicro || hasUV ? 'DRINKING WATER UNSAFE - MICROBIOLOGY' : 'POOR DRINKING WATER (Check filter)');

  return (
    <div className={safe ? styles.bannerSafe : styles.bannerDanger}>
      <div style={{fontWeight:800}}>{mainLabel}</div>
      <span className={styles.bannerReason}>{reason}</span>
    </div>
  );
}


