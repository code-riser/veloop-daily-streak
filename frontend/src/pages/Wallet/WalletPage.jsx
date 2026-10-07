import { useEffect, useState } from "react";
import { getTransactions, getWallet } from "../../services/streakApi";
import { getApiMessage } from "../../services/api";
import styles from "./WalletPage.module.css";

export default function WalletPage() {
  const [wallet,setWallet]=useState(null);
  const [transactions,setTransactions]=useState([]);
  const [error,setError]=useState("");

  const load=async()=>{
    try{
      const [w,t]=await Promise.all([getWallet(),getTransactions()]);
      setWallet(w.data?.data?.wallet);
      setTransactions(t.data?.data?.transactions||[]);
    }catch(e){setError(getApiMessage(e,"Unable to load wallet."));}
  };
  useEffect(()=>{load()},[]);

  return <div className={styles.page}>
    <div className={styles.header}><div><span>WALLET</span><h1>Your Rewards Wallet</h1><p>Balances below come directly from the backend wallet.</p></div><button onClick={load}>Refresh</button></div>
    {error&&<div className={styles.error}>{error}</div>}
    <div className={styles.balanceGrid}>
      <div className={styles.balance}><small>VES Balance</small><strong>{wallet?.vesBalance??"—"} VES</strong></div>
      <div className={styles.balance}><small>Amazon Gift Card Balance</small><strong>₹{wallet?.amazonGiftCardBalance??"—"}</strong></div>
    </div>
    <section className={styles.panel}><h2>Transaction Ledger</h2>
      {transactions.length===0?<p>No successful reward transactions yet.</p>:<div className={styles.tableWrap}><table><thead><tr><th>Date</th><th>Source</th><th>Day</th><th>Reward</th><th>Balance After</th></tr></thead><tbody>{transactions.map(t=><tr key={t.transactionId}><td>{new Date(t.createdAt).toLocaleString()}</td><td>{t.source}</td><td>{t.streakDay??"—"}</td><td>+{t.amount} {t.currency}</td><td>{t.balanceAfter} {t.currency}</td></tr>)}</tbody></table></div>}
    </section>
  </div>;
}
