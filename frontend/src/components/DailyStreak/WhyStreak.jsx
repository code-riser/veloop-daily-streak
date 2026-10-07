import { Clock3, ShieldCheck, Zap } from 'lucide-react';
import { REWARD_ASSETS } from '../../utils/rewardAssets';
import styles from './DailyStreak.module.css';

export default function WhyStreak() {
  return (
    <section className={styles.why}>
      <div className={styles.whyVisual}>
        <img src={REWARD_ASSETS.STAY_ACTIVE} alt="Stay active and keep your streak" />
      </div>
      <div>
        <span className={styles.eyebrow}>WHY DAILY STREAK?</span>
        <h2>Small check-ins, meaningful rewards.</h2>
        <p>Stay consistent, unlock the next day and keep your reward journey moving.</p>
        <div className={styles.whyGrid}>
          <Item icon={<Clock3 />} title="Daily rhythm" text="Your next unlock uses the server-supplied claim time." />
          <Item icon={<ShieldCheck />} title="Secure claims" text="Rewards are validated before wallet credit is created." />
          <Item icon={<Zap />} title="Instant feedback" text="Your wallet and streak refresh from the backend after every claim." />
        </div>
      </div>
    </section>
  );
}

function Item({ icon, title, text }) {
  return <div className={styles.whyItem}><div>{icon}</div><strong>{title}</strong><span>{text}</span></div>;
}
