import { Check, Clock3, Lock, Play } from 'lucide-react';
import { rewardLabel, prettyStatus } from '../../utils/formatters';
import { rewardAsset } from '../../utils/rewardAssets';
import styles from './DailyStreak.module.css';

export default function RewardCard({ reward, onClaim, disabled }) {
  const status = reward.status;
  const available = status === 'AVAILABLE';
  const claimed = status === 'CLAIMED';

  return (
    <article className={`${styles.rewardCard} ${available ? styles.available : ''} ${claimed ? styles.claimed : ''}`}>
      <div className={styles.dayTop}>
        <span>DAY {reward.day}</span>
        {available ? (
          <b className={styles.today}>TODAY</b>
        ) : claimed ? (
          <b className={styles.claimedBadge}><Check size={12} /> CLAIMED</b>
        ) : (
          <span className={styles.lockBadge}><Lock size={13} /> LOCKED</span>
        )}
      </div>

      <div className={styles.rewardVisual}>
        <img src={rewardAsset(reward)} alt={reward.title || `Day ${reward.day} reward`} />
      </div>

      <div className={styles.rewardInfo}>
        <span className={styles.rewardDayLabel}>DAY {reward.day} REWARD</span>
        <h3>{reward.title}</h3>
        <strong>{rewardLabel(reward)}</strong>
        <small>{reward.subtitle || `Reward for completing Day ${reward.day}`}</small>
      </div>

      <div className={styles.cardAction}>
        {available ? (
          <button onClick={() => onClaim(reward)} disabled={disabled}>
            <Play size={15} fill="currentColor" /> Claim Reward
          </button>
        ) : claimed ? (
          <span className={styles.done}><Check size={15} /> Completed</span>
        ) : (
          <span className={styles.locked}><Clock3 size={14} /> {prettyStatus(status)}</span>
        )}
      </div>
    </article>
  );
}
