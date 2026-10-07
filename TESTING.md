# Testing Checklist

1. Register → Daily Streak loads.
2. Login → refresh → streak remains correct.
3. Google login → same protected flow.
4. Demo access → backend creates a demo user and JWT.
5. Day 1 claim after CPA demo → +5 VES.
6. Repeat Day 1 claim → rejected, no second wallet credit.
7. Claim with fake day/amount/currency → cannot change reward.
8. Claim without CPA event → rejected.
9. Claim with another user's CPA event → rejected.
10. Change browser clock → cannot unlock early.
11. Timer reaches zero → frontend re-fetches backend status.
12. Two simultaneous claim requests → only one successful claim.
13. Missed deadline → old cycle marked MISSED and next cycle starts at Day 1.
14. Day 7 → cycle completes and Day 7 is shown CLAIMED.
15. Wallet ledger balance matches successful claim transactions.
16. Logout/login/refresh preserves backend state.
17. Direct access to protected API without JWT → 401.
18. User A cannot access User B wallet, history, CPA or streak state.
19. Test mobile widths: 320, 360, 375, 390, 414, 480.
20. Test tablet/desktop: 768, 820, 834, 1024, 1280, 1366, 1440, 1920.
