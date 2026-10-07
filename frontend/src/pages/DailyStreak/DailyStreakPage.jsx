import { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshCw, RotateCcw } from 'lucide-react';
import { getApiMessage } from '../../services/api';
import { completeCpa, getStreak, startCpa, claimStreak } from '../../services/streakApi';
import { useAuth } from '../../context/AuthContext';
import useCountdown, { formatCountdown } from '../../hooks/useCountdown';
import AppLoader from '../../components/common/AppLoader';
import Toast from '../../components/common/Toast';
import StreakSkeleton from '../../components/DailyStreak/StreakSkeleton';
import HeroBanner from '../../components/DailyStreak/HeroBanner';
import StreakStats from '../../components/DailyStreak/StreakStats';
import UltimateReward from '../../components/DailyStreak/UltimateReward';
import RewardGrid from '../../components/DailyStreak/RewardGrid';
import CpaDemo from '../../components/DailyStreak/CpaDemo';
import WhyStreak from '../../components/DailyStreak/WhyStreak';
import TrustFooter from '../../components/DailyStreak/TrustFooter';
import styles from '../../components/DailyStreak/DailyStreak.module.css';

export default function DailyStreakPage(){
 const {user}=useAuth(); const [status,setStatus]=useState(null); const [loading,setLoading]=useState(true); const [refreshing,setRefreshing]=useState(false); const [error,setError]=useState(''); const [toast,setToast]=useState({type:'',message:''}); const [claiming,setClaiming]=useState(false); const [selected,setSelected]=useState(null); const [cpaOpen,setCpaOpen]=useState(false); const [cpaStep,setCpaStep]=useState('idle'); const [cpaId,setCpaId]=useState(null); const [cpaLoading,setCpaLoading]=useState(false);
 const load=useCallback(async(silent=false)=>{if(silent)setRefreshing(true);else setLoading(true);setError('');try{const {data}=await getStreak();setStatus(data?.data || null)}catch(e){setError(getApiMessage(e,'Unable to load your Daily Streak.'))}finally{setLoading(false);setRefreshing(false)}},[]);
 useEffect(()=>{load()},[load]);
 const countdown=useCountdown(status?.nextClaimAt,status?.serverTime);
 useEffect(()=>{if(countdown===0 && status?.nextClaimAt){const timer=setTimeout(()=>load(true),700);return()=>clearTimeout(timer)}},[countdown,status?.nextClaimAt,load]);
 const ultimate=useMemo(()=>status?.rewards?.reduce((a,b)=>(!a||b.day>a.day?b:a),null),[status]);
 const openClaim=(reward)=>{setSelected(reward);setCpaStep('idle');setCpaId(null);setCpaOpen(true)};
 const beginCpa=async()=>{setCpaLoading(true);try{const {data}=await startCpa();const id=data?.data?.eventId;setCpaId(id);setCpaStep('running');setTimeout(async()=>{try{if(id)await completeCpa(id);setCpaStep('complete')}catch(e){setToast({type:'error',message:getApiMessage(e,'Unable to complete the demo step.')})}},1800)}catch(e){setToast({type:'error',message:getApiMessage(e,'Unable to start the demo step.')})}finally{setCpaLoading(false)}};
 const finishClaim=async()=>{setCpaLoading(true);setClaiming(true);try{await claimStreak(cpaId);setCpaOpen(false);setToast({type:'success',message:`Day ${selected.day} reward claimed successfully.`});await load(true)}catch(e){const msg=getApiMessage(e,'Unable to process your reward.');setCpaOpen(false);setToast({type:'error',message:msg});await load(true)}finally{setCpaLoading(false);setClaiming(false)}};
 if(loading)return <AppLoader/>;
 return <div className={styles.page}><main className={styles.container}>{error?<div className={styles.errorPanel}><div><h2>We couldn't load your streak</h2><p>{error}</p></div><button onClick={()=>load()}><RefreshCw size={16}/> Try again</button></div>:<><div className={styles.topbar}><div><span className={styles.welcome}>WELCOME BACK, {user?.name?.split(' ')[0]?.toUpperCase() || 'REWARDER'}</span><h2>Your Daily Streak</h2></div><button className={styles.refreshBtn} onClick={()=>load(true)} disabled={refreshing}><RefreshCw size={16} className={refreshing?styles.spin:''}/> Refresh</button></div><HeroBanner status={status}/><StreakStats status={status}/><div className={styles.countdownBar}>{status?.nextClaimAt&&countdown>0?<><span>Next reward unlocks in</span><strong>{formatCountdown(countdown)}</strong><small>Server-supplied unlock time</small></>:<><span>Today's reward</span><strong>is ready to claim</strong><small>Complete the demo check to continue</small></>}</div><UltimateReward reward={ultimate}/><RewardGrid rewards={status?.rewards||[]} onClaim={openClaim} claiming={claiming}/><WhyStreak/><TrustFooter/></>}</main><CpaDemo open={cpaOpen} step={cpaStep} onStart={beginCpa} onComplete={finishClaim} onClose={()=>!claiming&&setCpaOpen(false)} loading={cpaLoading}/><Toast type={toast.type} message={toast.message} onClose={()=>setToast({})}/></div>
}
