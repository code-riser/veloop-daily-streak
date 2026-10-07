import { useEffect, useState } from "react";
import { getStreak } from "../../services/streakApi";
import { getApiMessage } from "../../services/api";
import { rewardLabel } from "../../utils/formatters";
import styles from "./RewardsPage.module.css";

export default function RewardsPage(){
 const [data,setData]=useState(null),[error,setError]=useState("");
 useEffect(()=>{getStreak().then(r=>setData(r.data?.data)).catch(e=>setError(getApiMessage(e,"Unable to load rewards.")))},[]);
 return <div className={styles.page}><span>REWARD CATALOG</span><h1>Daily Streak Rewards</h1><p className={styles.sub}>These values are loaded from MongoDB, not hardcoded in React.</p>{error&&<div className={styles.error}>{error}</div>}<div className={styles.grid}>{(data?.rewards||[]).map(r=><article className={r.status==="AVAILABLE"?styles.available:""} key={r.day}><div>DAY {r.day}<b>{r.status}</b></div><h2>{r.title}</h2><strong>{rewardLabel(r)}</strong><p>{r.subtitle}</p></article>)}</div></div>
}
