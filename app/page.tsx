"use client";

import { useState, useEffect } from "react";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { signUp, signIn, signOut, getCurrentUser } from "aws-amplify/auth";
import "./../app/app.css";

Amplify.configure(outputs);
const client = generateClient<Schema>();

export default function AuthPage() {
  const [authState, setAuthState] = useState<"signIn" | "signUp" | "signedIn">("signIn");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    givenName: "",
    familyName: ""
  });
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(prefersDark ? "dark" : "light");
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === "light" ? "dark" : "light");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const { isSignUpComplete, userId } = await signUp({
        username: formData.username,
        password: formData.password,
        options: {
          userAttributes: {
            email: formData.email,
            given_name: formData.givenName,
            family_name: formData.familyName
          },
          autoSignIn: true
        }
      });

      await client.models.User.create({
        email: formData.email,
        username: formData.username,
        firstName: formData.givenName,
        lastName: formData.familyName,
        
        roles: ['user']
      });

      setAuthState("signedIn");
      fetchCurrentUser();
    } catch (err: any) {
      setError(err.message || "Error durante el registro");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await signIn({
        username: formData.username,
        password: formData.password
      });
      
      setAuthState("signedIn");
      fetchCurrentUser();
      
      const currentUser = await getCurrentUser();
      await client.models.User.update({
        id: currentUser.userId,
        lastLogin: new Date().toISOString()
      });
    } catch (err: any) {
      setError(err.message || "Credenciales incorrectas");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut();
      setAuthState("signIn");
      setUser(null);
    } catch (err: any) {
      setError(err.message || "Error al cerrar sesión");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (err) {
      console.error("Error obteniendo usuario:", err);
    }
  };

  return (
    <div className={`app-container ${theme}`}>
      <div className="theme-toggle-container">
        <button 
          className="theme-toggle" 
          onClick={toggleTheme}
          aria-label={`Cambiar a modo ${theme === 'light' ? 'oscuro' : 'claro'}`}
          title={`Cambiar a modo ${theme === 'light' ? 'oscuro' : 'claro'}`}
        >
          <div className={`toggle-track ${theme}`}>
            <div className="toggle-thumb">
              {theme === 'light' ? "🌙" : "☀️"}
            </div>
          </div>
          <span className="toggle-label">
            {theme === 'light' ? 'Modo oscuro' : 'Modo claro'}
          </span>
        </button>
      </div>

      <main className="auth-container">
        <div className="logo-container">
          <div className="logo-animation"></div>
          <h1 className="app-title">Auth<span>Flow</span></h1>
        </div>

        {error && (
          <div className="error-message animate-shake">
            <span>⚠️</span> {error}
          </div>
        )}

        {authState === "signUp" && (
          <div className="form-container">
            <form onSubmit={handleSignUp} className="auth-form">
              <h2>Crear Cuenta</h2>
              <div className="input-group">
                <input
                  name="username"
                  placeholder=" "
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                />
                <label>Nombre de usuario</label>
              </div>
              <div className="input-group">
                <input
                  name="password"
                  type="password"
                  placeholder=" "
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
                <label>Contraseña</label>
              </div>
              <div className="input-group">
                <input
                  name="email"
                  type="email"
                  placeholder=" "
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
                <label>Email</label>
              </div>
              <div className="name-fields">
                <div className="input-group">
                  <input
                    name="givenName"
                    placeholder=" "
                    value={formData.givenName}
                    onChange={handleInputChange}
                    required
                  />
                  <label>Nombre</label>
                </div>
                <div className="input-group">
                  <input
                    name="familyName"
                    placeholder=" "
                    value={formData.familyName}
                    onChange={handleInputChange}
                    required
                  />
                  <label>Apellido</label>
                </div>
              </div>
              <button 
                type="submit"
                disabled={isLoading}
                className={isLoading ? "loading" : ""}
              >
                {isLoading ? <div className="spinner"></div> : "Registrarse"}
              </button>
              <p className="auth-switch">
                ¿Ya tienes cuenta?{" "}
                <button 
                  type="button" 
                  onClick={() => setAuthState("signIn")}
                  className="link-button"
                >
                  Inicia sesión
                </button>
              </p>
            </form>
          </div>
        )}

        {authState === "signIn" && (
          <div className="form-container">
            <form onSubmit={handleSignIn} className="auth-form">
              <h2>Iniciar Sesión</h2>
              <div className="input-group">
                <input
                  name="username"
                  placeholder=" "
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                />
                <label>Nombre de usuario</label>
              </div>
              <div className="input-group">
                <input
                  name="password"
                  type="password"
                  placeholder=" "
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
                <label>Contraseña</label>
              </div>
              <button 
                type="submit"
                disabled={isLoading}
                className={isLoading ? "loading" : ""}
              >
                {isLoading ? <div className="spinner"></div> : "Ingresar"}
              </button>
              <p className="auth-switch">
                ¿No tienes cuenta?{" "}
                <button 
                  type="button" 
                  onClick={() => setAuthState("signUp")}
                  className="link-button"
                >
                  Regístrate
                </button>
              </p>
            </form>
          </div>
        )}

        {authState === "signedIn" && (
          <div className="profile-view animate-fade-in">
            <div className="avatar">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <h2>¡Bienvenido, {user?.username}!</h2>
            <div className="user-details">
              <p><span>Email:</span> {user?.signInDetails?.loginId}</p>
              <p><span>ID:</span> {user?.userId}</p>
            </div>
            <button 
              onClick={handleSignOut} 
              disabled={isLoading}
              className={isLoading ? "loading" : ""}
            >
              {isLoading ? <div className="spinner"></div> : "Cerrar sesión"}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}