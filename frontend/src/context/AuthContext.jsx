import { createContext, useContext, useState } from "react";
import {
  loginUser,
  logoutUser,
  registerUser,
} from "../services/auth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("accessToken")
  );

  const login = async (email, password) => {
    const data = await loginUser(email, password);

    localStorage.setItem("accessToken", data.accessToken);

    setUser(data.data);
    setIsLoggedIn(true);

    return data;
  };

  const register = async (email, password) => {
    const data = await registerUser(email, password);

    return data;
  };

  const logout = async () => {
    try {
      await logoutUser();
    } finally {
      localStorage.removeItem("accessToken");

      setUser(null);
      setIsLoggedIn(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};