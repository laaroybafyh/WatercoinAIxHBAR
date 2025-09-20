import styles from '../styles/home.module.css';

type Param = { value: number; unit: string; status?: string };

export default function SensorCards({ ph, tds }: { ph: Param; tds: Param }) {
  return (
    <>
      <div className={styles.card}>
        <div className={styles.cardHeader}><span className={styles.badge}>pH</span> pH Level</div>
        <div className={styles.cardValue}>{ph.value.toFixed(1)}</div>
        <div className={styles.cardUnit}>pH</div>
      </div>
      <div className={styles.card}>
        <div className={styles.cardHeader}><span className={styles.badge}>TDS</span> TDS Level</div>
        <div className={styles.cardValue}>{tds.value.toFixed(0)}</div>
        <div className={styles.cardUnit}>ppm</div>
      </div>
    </>
  );
}


