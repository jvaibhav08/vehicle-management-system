import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const AuthContext = createContext();

const getStorage = (rememberMe) =>
  rememberMe ? localStorage : sessionStorage;

const getStoredSession = () => {
  for (const storage of [localStorage, sessionStorage]) {
    const token = storage.getItem("token");
    const user = storage.getItem("user");

    if (token && user) {
      return { token, user };
    }
  }

  return null;
};

const clearSession = () => {
  for (const storage of [localStorage, sessionStorage]) {
    storage.removeItem("token");
    storage.removeItem("user");
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getStoredSession();

    if (!session) {
      setLoading(false);
      return;
    }

    try {
      const payload = JSON.parse(
        atob(session.token.split(".")[1])
      );
      const isExpired =
        payload.exp &&
        payload.exp * 1000 <= Date.now();

      if (isExpired) {
        clearSession();
      } else {
        setUser(JSON.parse(session.user));
        setToken(session.token);
      }
    } catch (error) {
      console.error("Invalid authentication data:", error);
      clearSession();
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    if (!token) {
      return undefined;
    }

    try {
      const { exp } = JSON.parse(atob(token.split(".")[1]));
      const delay = exp * 1000 - Date.now();

      if (delay <= 0) {
        clearSession();
        setUser(null);
        setToken(null);
        return undefined;
      }

      const timeoutId = window.setTimeout(() => {
        clearSession();
        setUser(null);
        setToken(null);
      }, delay);

      return () => window.clearTimeout(timeoutId);
    } catch (error) {
      clearSession();
      setUser(null);
      setToken(null);
      return undefined;
    }
  }, [token]);

  const login = (
    userData,
    jwtToken,
    { rememberMe = false, trustedDeviceToken } = {}
  ) => {
    const storage = getStorage(rememberMe);

    clearSession();
    storage.setItem("token", jwtToken);
    storage.setItem("user", JSON.stringify(userData));

    if (trustedDeviceToken) {
      storage.setItem("trustedDeviceToken", trustedDeviceToken);
    }

    setUser(userData);
    setToken(jwtToken);
  };

  const getTrustedDeviceToken = (rememberMe) =>
    getStorage(rememberMe).getItem("trustedDeviceToken");

  const logout = () => {
    clearSession();
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        getTrustedDeviceToken,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
