"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import Cookies from "js-cookie";
import axios from "axios";

type AuthContextType = {
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean; // Adiciona estado de loading
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Estado para controlar o loading inicial

  // useEffect para recuperar o token do cookie quando a aplicação carrega
  useEffect(() => {
    const storedToken = Cookies.get("token");
    if (storedToken) {
      setToken(storedToken);
    }
    setIsLoading(false); // Finaliza o loading após verificar o cookie
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await axios.post("http://localhost:8080/api/auth/login", {
        email,
        password,
      });
      
      const receivedToken = res.data.token;
      
      if (!receivedToken) {
        throw new Error("Token não retornado");
      }
      
      setToken(receivedToken);
      Cookies.set("token", receivedToken, { 
        expires: 7, // Expira em 7 dias
        secure: process.env.NODE_ENV === 'production', // Apenas HTTPS em produção
        sameSite: 'strict' // Proteção CSRF
      });
    } catch (err) {
      throw new Error("Credenciais inválidas");
    }
  };

  const logout = () => {
    setToken(null);
    Cookies.remove("token");
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};