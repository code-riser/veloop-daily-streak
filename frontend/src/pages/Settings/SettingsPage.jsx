import { useAuth } from "../../context/AuthContext";
import styles from "./SettingsPage.module.css";

export default function SettingsPage(){
 const {user,logout}=useAuth();
 return <div className={styles.page}><div className={styles.card}><span>SETTINGS</span><h1>Account Settings</h1><p>Session and demo controls for this internship build.</p><div className={styles.item}><div><strong>Authentication</strong><small>{user?.authProvider==="DEMO"?"Demo session":"Authenticated user session"}</small></div></div><div className={styles.item}><div><strong>Backend authority</strong><small>Streak, reward, timer and wallet are validated server-side.</small></div></div><button onClick={logout}>Log out</button></div></div>
}
