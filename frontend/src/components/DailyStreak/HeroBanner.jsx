import { motion } from 'framer-motion';
import { Flame, Sparkles, Trophy } from 'lucide-react';
import { rewardLabel } from '../../utils/formatters';
import { REWARD_ASSETS } from '../../utils/rewardAssets';
import styles from './DailyStreak.module.css';

export default function HeroBanner({ status }) {
  const final = status?.rewards?.[status.rewards.length - 1];

  return (
    <motion.section
      className={styles.heroBanner}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <img className={styles.heroTopLeft} src={REWARD_ASSETS.TOP_LEFT} alt="" aria-hidden="true" />
      <img className={styles.heroTopRight} src={REWARD_ASSETS.TOP_RIGHT} alt="" aria-hidden="true" />
      <div className={styles.heroGlow} />

      <div className={styles.heroCopy}>
        <div className={styles.eyebrow}><Sparkles size={14} /> KEEP THE STREAK GOING</div>
        <h1>Seven days.<br /><span>Seven rewards.</span></h1>
        <p>
          Check in every day, unlock your next reward, and build your streak one day at a time.
          Rewards are calculated and validated by the VELoop backend.
        </p>

        <div className={styles.heroMini}>
          <div>
            <img src={REWARD_ASSETS.FLAME} alt="" aria-hidden="true" />
            <b>{status?.currentStreak || 0}</b>
            <small> current streak</small>
          </div>
          <div className={styles.divider} />
          <div>
            <Trophy size={17} />
            <b>{status?.totalRewards || 0}</b>
            <small> rewards in cycle</small>
          </div>
        </div>
      </div>

      <div className={styles.heroArt}>
        <img className={styles.desktopHeroArt} src={REWARD_ASSETS.HERO} alt="Daily streak rewards" />
        <img className={styles.mobileHeroArt} src={REWARD_ASSETS.MOBILE_HERO} alt="Daily streak rewards" />
        <div className={styles.heroRewardBadge}>
          <Flame size={14} />
          <span>DAY 7</span>
          <small>{final ? rewardLabel(final) : 'Ultimate Reward'}</small>
        </div>
      </div>
    </motion.section>
  );
}
