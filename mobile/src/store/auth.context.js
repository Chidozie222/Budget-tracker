import React, { createContext, useContext } from "react";

import { setAuthHandlers } from "../api/shareDate.api";
import { useAppStore } from "./app.store";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const state = useAppStore();

  setAuthHandlers({
    refreshAccessToken: state.refreshAccessToken,
    signOut: state.signOut,
  });

  const value = {
    ...state,
    signUp: state.signUp,
    signIn: state.signIn,
    signOut: state.signOut,
    refreshAccessToken: state.refreshAccessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context) {
    return context;
  }

  return useAppStore();
};
