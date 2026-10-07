import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Sparkles,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import GoogleLoginButton from "../components/auth/GoogleLoginButton";
import styles from "./AuthPage.module.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, demoLogin } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const continueDemo = async () => {
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      await demoLogin();
      navigate("/daily-streak", { replace: true });
    } catch (err) {
      setError(err?.message || "Unable to start demo mode.");
    } finally {
      setLoading(false);
    }
  };

  const submit = async (event) => {
    event.preventDefault();

    if (loading) return;

    setError("");
    setLoading(true);

    try {
      await login(form);

      navigate("/daily-streak", {
        replace: true,
      });
    } catch (err) {
      setError(
        err?.message ||
          "Unable to sign in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Keep your streak alive and unlock better rewards every day."
    >
      <form onSubmit={submit}>
        <label htmlFor="email">Email</label>

        <div className={styles.input}>
          <Mail size={18} />

          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={(event) =>
              setForm({
                ...form,
                email: event.target.value,
              })
            }
            placeholder="you@example.com"
          />
        </div>

        <label htmlFor="password">Password</label>

        <div className={styles.input}>
          <LockKeyhole size={18} />

          <input
            id="password"
            type={show ? "text" : "password"}
            required
            autoComplete="current-password"
            value={form.password}
            onChange={(event) =>
              setForm({
                ...form,
                password: event.target.value,
              })
            }
            placeholder="••••••••"
          />

          <button
            type="button"
            onClick={() => setShow((value) => !value)}
            className={styles.iconButton}
          >
            {show ? (
              <EyeOff size={18} />
            ) : (
              <Eye size={18} />
            )}
          </button>
        </div>

        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        <button
          type="submit"
          className={styles.primary}
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign in"}

          {!loading && <ArrowRight size={18} />}
        </button>
      </form>

      <div className={styles.divider}>
        <span>OR</span>
      </div>

      <GoogleLoginButton />

      <button
        type="button"
        className={styles.demoButton}
        onClick={continueDemo}
        disabled={loading}
      >
        {loading ? "Opening demo..." : "Continue without Login"}
      </button>
      <p className={styles.demoHint}>Demo access creates a backend demo session; streak and wallet rules still run server-side.</p>

      <p className={styles.bottom}>
        New to VELoop?{" "}
        <Link to="/register">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}

export function AuthShell({
  title,
  subtitle,
  children,
}) {
  return (
    <main className={styles.page}>
      <div className={styles.glow} />

      <div className={styles.card}>
        <div className={styles.brand}>
          <div className={styles.brandIcon}>
            <Sparkles size={19} />
          </div>

          <span>VELoop Rewards</span>
        </div>

        <div className={styles.hero}>
          <span>DAILY STREAK</span>

          <h1>{title}</h1>

          <p>{subtitle}</p>
        </div>

        {children}
      </div>
    </main>
  );
}