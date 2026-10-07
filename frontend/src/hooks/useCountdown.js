import { useEffect, useMemo, useState } from 'react';

export default function useCountdown(target, serverTime) {
  const offset = useMemo(() => {
    if (!serverTime) return 0;
    return new Date(serverTime).getTime() - Date.now();
  }, [serverTime]);
  const [remaining, setRemaining] = useState(() => target ? Math.max(0, new Date(target).getTime() - Date.now() - offset) : 0);

  useEffect(() => {
    if (!target) { setRemaining(0); return undefined; }
    const tick = () => setRemaining(Math.max(0, new Date(target).getTime() - Date.now() - offset));
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id);
  }, [target, offset]);
  return remaining;
}

export const formatCountdown = (ms) => {
  const total = Math.floor(Math.max(0, ms) / 1000);
  const d = Math.floor(total / 86400);
  const h = Math.floor((total % 86400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return d > 0 ? `${String(d).padStart(2,'0')}d ${String(h).padStart(2,'0')}h ${String(m).padStart(2,'0')}m` : `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
};
