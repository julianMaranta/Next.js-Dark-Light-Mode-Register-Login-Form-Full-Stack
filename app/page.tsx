"use client";
import { useState, useEffect } from "react";
import "./../app/app.css";

export default function AuthPage() {
  const [authState, setAuthState] = useState<"signIn" | "signUp" | "signedIn">("signIn");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    givenName: "",
    familyName: ""
  });
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

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setAuthState("signedIn");
      setIsLoading(false);
    }, 1500);
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setAuthState("signedIn");
      setIsLoading(false);
    }, 1500);
  };

  const handleSignOut = () => {
    setAuthState("signIn");
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
                  />
                  <label>Nombre</label>
                </div>
                <div className="input-group">
                  <input
                    name="familyName"
                    placeholder=" "
                    value={formData.familyName}
                    onChange={handleInputChange}
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
              {formData.username?.charAt(0).toUpperCase()}
            </div>
            <h2>¡Bienvenido, {formData.username}!</h2>
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