import { useEffect, useState } from "react";
import { getHistory } from "../../services/streakApi";
import { getApiMessage } from "../../services/api";
import styles from "./HistoryPage.module.css";

export default function HistoryPage(){
 const [data,setData]=useState(null),[error,setError]=useState("");
 useEffect(()=>{getHistory().then(r=>setData(r.data?.data)).catch(e=>setError(getApiMessage(e,"Unable to load history.")))},[]);
 const rows=data?.history||[];
 return <div className={styles.page}><span>HISTORY</span><h1>Streak Claim History</h1><p>Every successful claim is traceable to a backend claim and wallet transaction.</p>{error&&<div className={styles.error}>{error}</div>}<div className={styles.panel}>{rows.length===0?<div className={styles.empty}>No claims yet. Claim your Day 1 reward to create history.</div>:rows.map((r,i)=><div className={styles.row} key={r.claimId||i}><div><strong>Day {r.day}</strong><small>{new Date(r.claimedAt).toLocaleString()}</small></div><div><strong>{r.reward?.amount} {r.reward?.currency}</strong><small>{r.status}</small></div></div>)}</div></div>
}
