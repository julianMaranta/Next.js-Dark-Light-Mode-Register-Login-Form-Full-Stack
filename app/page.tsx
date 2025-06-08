"use client";
import { useState, useEffect } from "react";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import { type Schema } from "@/amplify/data/resource";
import outputs from "@/amplify_outputs.json";
import "./../app/app.css";

// Configuración sin módulo de autenticación
const config = {
  ...outputs,
  Auth: {
    Cognito: null
  }
};

Amplify.configure(config);
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
      // Verificar si usuario existe
      const { data: existingUsers } = await client.models.User.list({
        filter: { username: { eq: formData.username } }
      });
      
      if (existingUsers.length > 0) {
        throw new Error("El nombre de usuario ya está registrado");
      }

      // Crear nuevo usuario
      const { data: newUser, errors } = await client.models.User.create({
        username: formData.username,
        email: formData.email,
        firstName: formData.givenName,
        lastName: formData.familyName,
        password: formData.password
      });

      if (errors) throw new Error(errors[0].message);

      setAuthState("signedIn");
      setUser(newUser);

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
      // Buscar usuario
      const { data: users, errors } = await client.models.User.list({
        filter: { 
          username: { eq: formData.username },
          password: { eq: formData.password }
        }
      });

      if (errors) throw new Error(errors[0].message);
      if (users.length === 0) throw new Error("Usuario o contraseña incorrectos");

      // Actualizar último login
      await client.models.User.update({
        id: users[0].id,
        lastLogin: new Date().toISOString()
      });

      setAuthState("signedIn");
      setUser(users[0]);

    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = () => {
    setAuthState("signIn");
    setUser(null);
    setFormData({
      username: "",
      password: "",
      email: "",
      givenName: "",
      familyName: ""
    });
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
                  minLength={3}
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
                  minLength={6}
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