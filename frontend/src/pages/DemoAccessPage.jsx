import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AppLoader from "../components/common/AppLoader";
import styles from "./AuthPage.module.css";

export default function DemoAccessPage() {
  const navigate = useNavigate();
  const { user, demoLogin } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      navigate("/daily-streak", { replace: true });
      return;
    }

    let active = true;
    demoLogin()
      .then(() => {
        if (active) navigate("/daily-streak", { replace: true });
      })
      .catch((err) => {
        if (active) setError(err?.message || "Unable to open demo access.");
      });

    return () => { active = false; };
  }, [user, navigate]);

  if (error) {
    return (
      <main className={styles.page}>
        <div className={styles.card}>
          <div className={styles.brand}><div className={styles.brandIcon}><ShieldCheck size={19} /></div><span>VELoop Rewards</span></div>
          <div className={styles.hero}>
            <span>DEMO ACCESS</span>
            <h1>Unable to open demo</h1>
            <p>{error}</p>
          </div>
          <button className={styles.primary} onClick={() => window.location.reload()}>Try again</button>
        </div>
      </main>
    );
  }

  return <AppLoader />;
}
