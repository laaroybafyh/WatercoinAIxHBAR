import styles from '../styles/home.module.css';

export default function UVToggle({ on, onToggle }: { on: boolean; onToggle: (v: boolean) => void }) {
  return (
    <div className={styles.toggleWrap}>
      <span>UV Sterilizer Control</span>
      <div className={styles.toggleRow}>
        <span className={!on ? styles.toggleLabelActive : styles.toggleLabel}>OFF</span>
        <button className={styles.toggle} aria-pressed={on} onClick={() => onToggle(!on)}>
          <span className={on ? styles.knobOn : styles.knobOff} />
        </button>
        <span className={on ? styles.toggleLabelActive : styles.toggleLabel}>ON</span>
      </div>
    </div>
  );
}


