import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  getMe,
  login as loginRequest,
  register as registerRequest,
  googleLogin as googleLoginRequest,
  demoLogin as demoLoginRequest,
  updateMe as updateMeRequest,
} from "../services/authApi";

import { getApiMessage } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("veloop_user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("veloop_token");

    if (!token) {
      setBooting(false);
      return;
    }

    getMe()
      .then(({ data }) => {
        const nextUser = data?.data?.user || null;

        if (nextUser) {
          setUser(nextUser);
          localStorage.setItem(
            "veloop_user",
            JSON.stringify(nextUser)
          );
        } else {
          throw new Error("User session is invalid.");
        }
      })
      .catch(() => {
        localStorage.removeItem("veloop_token");
        localStorage.removeItem("veloop_user");
        setUser(null);
      })
      .finally(() => {
        setBooting(false);
      });
  }, []);

  useEffect(() => {
    const handleForcedLogout = () => setUser(null);
    window.addEventListener("veloop:logout", handleForcedLogout);
    return () => window.removeEventListener("veloop:logout", handleForcedLogout);
  }, []);

  const saveSession = (data) => {
    const token = data?.data?.token;
    const nextUser = data?.data?.user;

    if (!token || !nextUser) {
      throw new Error("Invalid login response from server.");
    }

    localStorage.setItem("veloop_token", token);
    localStorage.setItem(
      "veloop_user",
      JSON.stringify(nextUser)
    );

    setUser(nextUser);

    return nextUser;
  };

  const login = async (payload) => {
    try {
      const response = await loginRequest(payload);
      return saveSession(response.data);
    } catch (error) {
      throw new Error(
        getApiMessage(
          error,
          "Invalid email or password."
        )
      );
    }
  };

  const register = async (payload) => {
    try {
      const response = await registerRequest(payload);
      return saveSession(response.data);
    } catch (error) {
      throw new Error(
        getApiMessage(
          error,
          "Unable to create your account."
        )
      );
    }
  };

  const googleLogin = async (credential) => {
    try {
      const response =
        await googleLoginRequest(credential);

      return saveSession(response.data);
    } catch (error) {
      throw new Error(
        getApiMessage(
          error,
          "Unable to sign in with Google."
        )
      );
    }
  };


  const demoLogin = async () => {
    try {
      const response = await demoLoginRequest();
      return saveSession(response.data);
    } catch (error) {
      throw new Error(
        getApiMessage(error, "Unable to start demo mode.")
      );
    }
  };

  const updateMe = async (payload) => {
    try {
      const response = await updateMeRequest(payload);
      const nextUser = response.data?.data?.user;
      if (!nextUser) throw new Error("Invalid profile response from server.");
      setUser(nextUser);
      localStorage.setItem("veloop_user", JSON.stringify(nextUser));
      return nextUser;
    } catch (error) {
      throw new Error(
        getApiMessage(error, "Unable to update your profile.")
      );
    }
  };

  const logout = () => {
    localStorage.removeItem("veloop_token");
    localStorage.removeItem("veloop_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        booting,
        login,
        register,
        googleLogin,
        demoLogin,
        updateMe,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
};