import { motion } from 'framer-motion';
import styles from './AppLoader.module.css';
export default function AppLoader() { return <div className={styles.wrap}><motion.div className={styles.orb} animate={{scale:[1,.85,1],rotate:[0,180,360]}} transition={{duration:1.8,repeat:Infinity,ease:'easeInOut'}}><span>V</span></motion.div><div className={styles.logo}>VELoop</div><p>Loading your rewards...</p></div>; }
