import styles from '../styles/home.module.css';
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <Link href="/" className={styles.logoWrap} aria-label="Watercoin Home">
        {/* Prefer project-level public copy, fallback to repository referensi folder */}
        <img src="/watercoinlogo.png" onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/referensi/watercoinlogo.png'; }} alt="Watercoin" className={styles.logoImg} />
      </Link>
      <div className={styles.spacer} />
      <Link href="/pos" className={styles.posButtonSmall}>POS System</Link>
    </nav>
  );
}


