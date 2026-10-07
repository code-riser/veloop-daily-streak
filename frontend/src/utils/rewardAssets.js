const asset = (name) => `/assets/${name}`;

export const REWARD_ASSETS = {
  VES: asset('VEs_Coin.png'),
  DAY_4: asset('Day-4.png'),
  DAY_5: asset('Day-5.png'),
  DAY_7: asset('Day-7.png'),
  ULTIMATE: asset('Exclusive-reward.png'),
  FLAME: asset('Flame.png'),
  HERO: asset('Bigger_Streak.png'),
  MOBILE_HERO: asset('Mobile_Hero.png'),
  STAY_ACTIVE: asset('Stay_Active.png'),
  TOP_LEFT: asset('Top_Left.png'),
  TOP_RIGHT: asset('Top_right.png'),
  TRUST: asset('Trust.png'),
};

export const rewardAsset = (reward) => {
  const configured = reward?.metadata?.asset;
  if (configured) return asset(configured);

  if (reward?.assetType === 'CROWN') return REWARD_ASSETS.DAY_7;
  if (reward?.day === 4) return REWARD_ASSETS.DAY_4;
  if (reward?.day === 5) return REWARD_ASSETS.DAY_5;
  if (reward?.day === 7) return REWARD_ASSETS.DAY_7;
  return REWARD_ASSETS.VES;
};
