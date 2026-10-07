import { ShieldCheck } from 'lucide-react';
import { REWARD_ASSETS } from '../../utils/rewardAssets';
import styles from './DailyStreak.module.css';

export default function TrustFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerTrust}>
        <img src={REWARD_ASSETS.TRUST} alt="Secure rewards" />
        <div>
          <div className={styles.footerBrand}>VELoop<span>Rewards</span></div>
          <p>Backend-validated daily rewards built around consistency.</p>
        </div>
      </div>
      <div className={styles.secure}><ShieldCheck size={16} /> Server-side claim validation</div>
      <small>© {new Date().getFullYear()} VELoop Rewards · Internship demonstration project</small>
    </footer>
  );
}
