import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Flame,
  Wallet,
  Gift,
  History,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  LayoutDashboard,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import styles from "./DashboardLayout.module.css";
import { REWARD_ASSETS } from "../../utils/rewardAssets";
import { getStreak } from "../../services/streakApi";

const navigation = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Daily Streak",
    path: "/daily-streak",
    icon: Flame,
  },
  {
    label: "Wallet",
    path: "/wallet",
    icon: Wallet,
  },
  {
    label: "Rewards",
    path: "/rewards",
    icon: Gift,
  },
  {
    label: "History",
    path: "/history",
    icon: History,
  },
];

const accountNavigation = [
  {
    label: "Profile",
    path: "/profile",
    icon: User,
  },
  {
    label: "Settings",
    path: "/settings",
    icon: Settings,
  },
];

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();

  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [streakSummary, setStreakSummary] = useState(null);

  useEffect(() => {
    let active = true;
    getStreak()
      .then(({ data }) => {
        if (active) setStreakSummary(data?.data || null);
      })
      .catch(() => {
        if (active) setStreakSummary(null);
      });
    return () => { active = false; };
  }, [user?.id]);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const closeMobile = () => {
    setMobileOpen(false);
  };

  const getInitials = () => {
    if (!user?.name) {
      return "U";
    }

    return user.name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className={styles.layout}>
      <aside
        className={`${styles.sidebar} ${
          mobileOpen ? styles.sidebarOpen : ""
        }`}
      >
        <div className={styles.sidebarHeader}>
          <button
            className={styles.logo}
            onClick={() => {
              navigate("/dashboard");
              closeMobile();
            }}
          >
            <span className={styles.logoIcon}>
              <img src={REWARD_ASSETS.FLAME} alt="VELoop" />
            </span>

            <span>
              <strong>VELoop</strong>
              <small>Rewards</small>
            </span>
          </button>

          <button
            className={styles.mobileClose}
            onClick={closeMobile}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className={styles.navigation}>
          <div className={styles.navSection}>
            <span className={styles.navTitle}>MAIN</span>

            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={closeMobile}
                  className={({ isActive }) =>
                    `${styles.navItem} ${
                      isActive ? styles.navItemActive : ""
                    }`
                  }
                >
                  <Icon size={19} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>

          <div className={styles.navSection}>
            <span className={styles.navTitle}>ACCOUNT</span>

            {accountNavigation.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={closeMobile}
                  className={({ isActive }) =>
                    `${styles.navItem} ${
                      isActive ? styles.navItemActive : ""
                    }`
                  }
                >
                  <Icon size={19} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </nav>

        <div className={styles.sidebarBottom}>
          <div className={styles.userMini}>
            {user?.profileImage ? (
              <img
                src={user.profileImage}
                alt={user.name || "User"}
              />
            ) : (
              <div className={styles.avatarSmall}>
                {getInitials()}
              </div>
            )}

            <div className={styles.userMiniInfo}>
              <strong>{user?.name || "User"}</strong>
              <span>{user?.email || ""}</span>
            </div>
          </div>

          <button
            className={styles.logoutButton}
            onClick={handleLogout}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {mobileOpen && (
        <button
          className={styles.overlay}
          onClick={closeMobile}
          aria-label="Close navigation"
        />
      )}

      <div className={styles.main}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <button
              className={styles.menuButton}
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={21} />
            </button>

            <div className={styles.headerBrand}>
              <span>VELoop</span>
              <small>Rewards dashboard</small>
            </div>
          </div>

          <div className={styles.headerRight}>
            <div className={styles.streakBadge}>
              <img src={REWARD_ASSETS.FLAME} alt="" aria-hidden="true" />
              <strong>{streakSummary?.currentStreak || 0}</strong>
              <span>day streak</span>
            </div>
            <div className={styles.balanceBadge}>
              <img src={REWARD_ASSETS.VES} alt="" aria-hidden="true" />
              <strong>{Number(streakSummary?.totalVES || 0).toLocaleString("en-IN")}</strong>
              <span>VEs</span>
            </div>

            <button
              className={styles.profileButton}
              onClick={() => setProfileOpen((value) => !value)}
            >
              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.name || "User"}
                />
              ) : (
                <span>{getInitials()}</span>
              )}

              <span className={styles.profileName}>
                {user?.name?.split(" ")[0] || "User"}
              </span>

              <ChevronDown
                size={16}
                className={
                  profileOpen ? styles.chevronOpen : ""
                }
              />
            </button>

            {profileOpen && (
              <div className={styles.profileMenu}>
                <div className={styles.profileMenuHeader}>
                  {user?.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.name || "User"}
                    />
                  ) : (
                    <div className={styles.avatarMedium}>
                      {getInitials()}
                    </div>
                  )}

                  <div>
                    <strong>{user?.name || "User"}</strong>
                    <span>{user?.email || ""}</span>
                  </div>
                </div>

                <div className={styles.profileMenuDivider} />

                <button
                  onClick={() => {
                    navigate("/profile");
                    setProfileOpen(false);
                  }}
                >
                  <User size={17} />
                  My Profile
                </button>

                <button
                  onClick={() => {
                    navigate("/settings");
                    setProfileOpen(false);
                  }}
                >
                  <Settings size={17} />
                  Settings
                </button>

                <div className={styles.profileMenuDivider} />

                <button
                  className={styles.profileLogout}
                  onClick={handleLogout}
                >
                  <LogOut size={17} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        <main className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
}