import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import styles from "./ProfilePage.module.css";

export default function ProfilePage(){
 const {user,updateMe}=useAuth();
 const [name,setName]=useState(user?.name||"");
 const [profileImage,setProfileImage]=useState(user?.profileImage||"");
 const [message,setMessage]=useState("");
 const [saving,setSaving]=useState(false);
 const submit=async e=>{e.preventDefault();setSaving(true);setMessage("");try{await updateMe({name,profileImage:profileImage||null});setMessage("Profile updated successfully.");}catch(e){setMessage(e.message)}finally{setSaving(false)}};
 return <div className={styles.page}><div className={styles.card}><span>ACCOUNT</span><h1>My Profile</h1><p>Your identity is loaded from the authenticated backend session.</p><div className={styles.identity}><div className={styles.avatar}>{user?.name?.charAt(0)?.toUpperCase()||"U"}</div><div><strong>{user?.email}</strong><small>Login method: {user?.authProvider}</small></div></div><form onSubmit={submit}><label>Name<input value={name} onChange={e=>setName(e.target.value)} minLength={2} maxLength={80} required/></label><label>Profile image URL<input value={profileImage} onChange={e=>setProfileImage(e.target.value)} placeholder="https://..."/></label>{message&&<div className={styles.message}>{message}</div>}<button disabled={saving}>{saving?"Saving...":"Save changes"}</button></form></div></div>
}
