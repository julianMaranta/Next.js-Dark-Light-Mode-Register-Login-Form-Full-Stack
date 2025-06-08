"use client";

import { useState, useEffect } from "react";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import { type Schema } from "@/amplify/data/resource";
import { signUp, signIn, signOut, getCurrentUser } from "aws-amplify/auth";
import outputs from "@/amplify_outputs.json";
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
    checkCurrentUser();
  }, []);

  const checkCurrentUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      const { data: dbUser } = await client.models.User.list({
        filter: { username: { eq: currentUser.username } }
      });
      if (dbUser.length > 0) {
        setUser({ ...currentUser, ...dbUser[0] });
        setAuthState("signedIn");
      }
    } catch (err) {
      console.log("No hay usuario autenticado");
    }
  };

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
      // 1. Registrar usuario en Cognito
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

      // 2. Guardar usuario en la base de datos
      const { data: newUser, errors } = await client.models.User.create({
        username: formData.username,
        email: formData.email,
        firstName: formData.givenName,
        lastName: formData.familyName
      });

      if (errors) throw new Error(errors[0].message);

      // 3. Actualizar estado
      setAuthState("signedIn");
      setUser({ username: formData.username, ...newUser });

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
      // 1. Autenticar con Cognito
      await signIn({
        username: formData.username,
        password: formData.password
      });

      // 2. Obtener usuario de la base de datos
      const currentUser = await getCurrentUser();
      const { data: dbUsers, errors } = await client.models.User.list({
        filter: { username: { eq: currentUser.username } }
      });

      if (errors) throw new Error(errors[0].message);
      if (!dbUsers.length) throw new Error("Usuario no encontrado en la base de datos");

      // 3. Actualizar último login
      await client.models.User.update({
        id: dbUsers[0].id,
        lastLogin: new Date().toISOString()
      });

      // 4. Actualizar estado
      setAuthState("signedIn");
      setUser({ ...currentUser, ...dbUsers[0] });

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
                  minLength={8}
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
              <p><span>Nombre:</span> {user?.firstName} {user?.lastName}</p>
              <p><span>Email:</span> {user?.email}</p>
              <p><span>Estado:</span> {user?.status}</p>
              {user?.lastLogin && (
                <p><span>Último acceso:</span> {new Date(user.lastLogin).toLocaleString()}</p>
              )}
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