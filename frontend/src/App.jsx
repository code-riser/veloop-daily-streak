import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";

import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import DailyStreakPage from "./pages/DailyStreak/DailyStreakPage.jsx";
import DashboardPage from "./pages/Dashboard/DashboardPage.jsx";
import WalletPage from "./pages/Wallet/WalletPage.jsx";
import RewardsPage from "./pages/Rewards/RewardsPage.jsx";
import HistoryPage from "./pages/History/HistoryPage.jsx";
import ProfilePage from "./pages/Profile/ProfilePage.jsx";
import SettingsPage from "./pages/Settings/SettingsPage.jsx";
import DemoAccessPage from "./pages/DemoAccessPage.jsx";
import DashboardLayout from "./components/layout/DashboardLayout.jsx";
import AppLoader from "./components/common/AppLoader.jsx";

function Protected({ children }) {
  const { user, booting } = useAuth();
  if (booting) return <AppLoader />;
  return user ? children : <Navigate to="/login" replace />;
}

function AppShell({ children }) {
  return (
    <Protected>
      <DashboardLayout>{children}</DashboardLayout>
    </Protected>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/demo" element={<DemoAccessPage />} />
        <Route path="/dashboard" element={<AppShell><DashboardPage /></AppShell>} />
        <Route path="/daily-streak" element={<AppShell><DailyStreakPage /></AppShell>} />
        <Route path="/wallet" element={<AppShell><WalletPage /></AppShell>} />
        <Route path="/rewards" element={<AppShell><RewardsPage /></AppShell>} />
        <Route path="/history" element={<AppShell><HistoryPage /></AppShell>} />
        <Route path="/transactions" element={<AppShell><HistoryPage /></AppShell>} />
        <Route path="/profile" element={<AppShell><ProfilePage /></AppShell>} />
        <Route path="/settings" element={<AppShell><SettingsPage /></AppShell>} />
        <Route path="/" element={<Navigate to="/daily-streak" replace />} />
        <Route path="*" element={<Navigate to="/daily-streak" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
