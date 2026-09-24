import React, { createContext, useContext, useReducer } from "react";
import { signinRequest, signupRequest } from "../api/useAuth.api";
import { authReducer, initialAuthState } from "./user.state";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);

  const signUp = async (name, email, password) => {
    dispatch({ type: "SET_LOADING", payload: true });

    try {
      const data = await signupRequest(name, email, password);
      dispatch({ type: "SIGN_IN", payload: data });
      return data;
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: error.message });
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const signIn = async (email, password) => {
    dispatch({ type: "SET_LOADING", payload: true });

    try {
      const data = await signinRequest(email, password);
      dispatch({ type: "SIGN_IN", payload: data });
      return data;
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: error.message });
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const signOut = () => {
    dispatch({ type: "SIGN_OUT" });
  };

  const value = {
    ...state,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
