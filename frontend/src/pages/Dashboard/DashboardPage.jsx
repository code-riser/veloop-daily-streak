import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Flame, Gift, Wallet, ArrowRight, History, Trophy } from "lucide-react";
import { getStreak } from "../../services/streakApi";
import { getWallet } from "../../services/streakApi";
import { getApiMessage } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import styles from "./DashboardPage.module.css";

export default function DashboardPage() {
  const { user } = useAuth();
  const [streak, setStreak] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getStreak(), getWallet()])
      .then(([s, w]) => {
        setStreak(s.data?.data);
        setWallet(w.data?.data?.wallet);
      })
      .catch((e) => setError(getApiMessage(e, "Unable to load dashboard.")));
  }, []);

  const cards = [
    ["Current Streak", `${streak?.currentStreak ?? 0} Days`, Flame],
    ["Rewards in Cycle", `${streak?.totalRewards ?? 0}`, Gift],
    ["VES Balance", `${wallet?.vesBalance ?? streak?.totalVES ?? 0} VES`, Wallet],
    ["Cycle Day", `Day ${streak?.currentDay ?? 1}`, Trophy],
  ];

  return (
    <div className={styles.page}>
      <section className={styles.header}>
        <div>
          <span className={styles.eyebrow}>VELOOP DASHBOARD</span>
          <h1>Welcome back, {user?.name?.split(" ")[0] || "Rewarder"}</h1>
          <p>Your account, wallet and Daily Streak are connected to the backend.</p>
        </div>
        <Link to="/daily-streak" className={styles.primaryButton}>Open Daily Streak <ArrowRight size={17}/></Link>
      </section>

      {error && <div className={styles.error}>{error}</div>}

      <section className={styles.statsGrid}>
        {cards.map(([label,value,Icon]) => (
          <div className={styles.statCard} key={label}>
            <div className={styles.iconBox}><Icon size={21}/></div>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </section>

      <section className={styles.actionGrid}>
        <Link to="/wallet" className={styles.actionCard}><Wallet/><div><h3>Wallet</h3><p>View backend wallet balances and ledger.</p></div><ArrowRight/></Link>
        <Link to="/rewards" className={styles.actionCard}><Gift/><div><h3>Rewards</h3><p>See the seven configured streak rewards.</p></div><ArrowRight/></Link>
        <Link to="/history" className={styles.actionCard}><History/><div><h3>History</h3><p>Review completed streak claims.</p></div><ArrowRight/></Link>
      </section>
    </div>
  );
}
