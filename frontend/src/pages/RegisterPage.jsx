import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  LockKeyhole,
  Mail,
  Sparkles,
  UserRound,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { AuthShell } from "./LoginPage";
import styles from "./AuthPage.module.css";
export default function RegisterPage() {
  const nav = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form);
      nav("/daily-streak");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <AuthShell
      title="Start your streak"
      subtitle="Create your VELoop account and begin collecting daily rewards."
    >
      <form onSubmit={submit}>
        <label>Name</label>
        <div className={styles.input}>
          <UserRound size={18} />
          <input
            required
            minLength="2"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Your name"
          />
        </div>
        <label>Email</label>
        <div className={styles.input}>
          <Mail size={18} />
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@example.com"
          />
        </div>
        <label>Password</label>
        <div className={styles.input}>
          <LockKeyhole size={18} />
          <input
            type="password"
            required
            minLength="8"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="At least 8 characters"
          />
        </div>
        {error && <div className={styles.error}>{error}</div>}
        <button className={styles.primary} disabled={loading}>
          {loading ? "Creating account..." : "Create account"}{" "}
          <ArrowRight size={18} />
        </button>
        <p className={styles.bottom}>
          Already registered? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </AuthShell>
  );
}
