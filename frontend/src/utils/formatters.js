export const money = (amount, currency) => currency === 'INR' ? `₹${Number(amount || 0).toLocaleString('en-IN')}` : `${Number(amount || 0).toLocaleString('en-IN')} ${currency || ''}`.trim();
export const rewardLabel = (reward) => reward?.rewardType === 'VES' ? `${reward.amount} VEs` : reward?.rewardType === 'AMAZON_GIFT_CARD' ? `₹${reward.amount} Amazon Gift Card` : `${reward?.amount ?? ''} ${reward?.currency ?? ''}`.trim();
export const prettyStatus = (status) => ({ AVAILABLE: 'Available', CLAIMED: 'Claimed', LOCKED: 'Locked' }[status] || status || 'Locked');
