import { Crown, Lock, Sparkles } from 'lucide-react';
import { rewardLabel } from '../../utils/formatters';
import { REWARD_ASSETS } from '../../utils/rewardAssets';
import styles from './DailyStreak.module.css';

export default function UltimateReward({ reward }) {
  if (!reward) return null;

  return (
    <section className={styles.ultimate}>
      <img className={styles.ultimateArt} src={REWARD_ASSETS.ULTIMATE} alt="Ultimate reward" />
      <div className={styles.ultimateCopy}>
        <div className={styles.eyebrow}><Crown size={14} /> ULTIMATE REWARD</div>
        <h2>{reward.title}</h2>
        <p>{reward.subtitle || 'Complete all seven days to unlock the ultimate reward.'}</p>
        <div className={styles.ultimateValue}>{rewardLabel(reward)}</div>
        <span className={styles.unlock}><Lock size={13} /> Unlock on Day {reward.day}</span>
      </div>
      <div className={styles.ultimateMeta}>
        <Sparkles size={20} />
        <strong>7 DAY</strong>
        <span>STREAK GOAL</span>
      </div>
    </section>
  );
}
