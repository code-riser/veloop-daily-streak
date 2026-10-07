import { CalendarCheck2, Gift, Gem } from 'lucide-react';
import { rewardLabel } from '../../utils/formatters';
import { REWARD_ASSETS } from '../../utils/rewardAssets';
import styles from './DailyStreak.module.css';

export default function StreakStats({ status }) {
  const next = status?.rewards?.find((r) => r.status === 'AVAILABLE')
    || status?.rewards?.find((r) => r.status === 'LOCKED');

  return (
    <section className={styles.statsGrid}>
      <Stat icon={<Gift />} label="Total Rewards" value={status?.totalRewards ?? '—'} hint="Configured in backend" />
      <Stat icon={<CalendarCheck2 />} label="Checked In" value={status?.checkedIn ?? 0} hint={`${status?.totalRewards ? Math.round((status.checkedIn / status.totalRewards) * 100) : 0}% progress`} />
      <Stat icon={<Gem />} label="Next Reward" value={next ? rewardLabel(next) : 'Cycle complete'} hint={next ? `Day ${next.day}` : 'Complete'} />
    </section>
  );
}

function Stat({ icon, label, value, hint }) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statIcon}>{icon}</div>
      <div className={styles.statContent}>
        <small>{label}</small>
        <strong>{value}</strong>
        <span>{hint}</span>
      </div>
      <img className={styles.statCoin} src={REWARD_ASSETS.VES} alt="" aria-hidden="true" />
    </div>
  );
}
