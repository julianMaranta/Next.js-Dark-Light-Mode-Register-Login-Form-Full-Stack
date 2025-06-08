"use client";

import { useState } from "react";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { signUp, signIn, signOut, getCurrentUser } from "aws-amplify/auth";
import "@aws-amplify/ui-react/styles.css";
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

  // Manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Registro de nuevo usuario
  const handleSignUp = async () => {
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

      // Crear registro en DynamoDB
      await client.models.User.create({
        email: formData.email,
        username: formData.username,
        firstName: formData.givenName,
        lastName: formData.familyName,
        status: 'active',
        roles: ['user']
      });

      setAuthState("signedIn");
      fetchCurrentUser();
    } catch (err: any) {
      setError(err.message || "Error durante el registro");
    }
  };

  // Inicio de sesión
  const handleSignIn = async () => {
    setError(null);
    try {
      await signIn({
        username: formData.username,
        password: formData.password
      });
      
      setAuthState("signedIn");
      fetchCurrentUser();
      
      // Actualizar último login
      const currentUser = await getCurrentUser();
      await client.models.User.update({
        id: currentUser.userId,
        lastLogin: new Date().toISOString()
      });
    } catch (err: any) {
      setError(err.message || "Error durante el inicio de sesión");
    }
  };

  // Cerrar sesión
  const handleSignOut = async () => {
    try {
      await signOut();
      setAuthState("signIn");
      setUser(null);
    } catch (err: any) {
      setError(err.message || "Error al cerrar sesión");
    }
  };

  // Obtener usuario actual
  const fetchCurrentUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (err) {
      console.error("Error obteniendo usuario:", err);
    }
  };

  // Renderizar formulario de registro
  const renderSignUpForm = () => (
    <div className="auth-form">
      <h2>Registro</h2>
      <input
        name="username"
        placeholder="Nombre de usuario"
        value={formData.username}
        onChange={handleInputChange}
      />
      <input
        name="password"
        type="password"
        placeholder="Contraseña"
        value={formData.password}
        onChange={handleInputChange}
      />
      <input
        name="email"
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleInputChange}
      />
      <input
        name="givenName"
        placeholder="Nombre"
        value={formData.givenName}
        onChange={handleInputChange}
      />
      <input
        name="familyName"
        placeholder="Apellido"
        value={formData.familyName}
        onChange={handleInputChange}
      />
      <button onClick={handleSignUp}>Registrarse</button>
      <p>
        ¿Ya tienes cuenta?{" "}
        <button className="link-button" onClick={() => setAuthState("signIn")}>
          Inicia sesión
        </button>
      </p>
    </div>
  );

  // Renderizar formulario de inicio de sesión
  const renderSignInForm = () => (
    <div className="auth-form">
      <h2>Inicio de sesión</h2>
      <input
        name="username"
        placeholder="Nombre de usuario"
        value={formData.username}
        onChange={handleInputChange}
      />
      <input
        name="password"
        type="password"
        placeholder="Contraseña"
        value={formData.password}
        onChange={handleInputChange}
      />
      <button onClick={handleSignIn}>Iniciar sesión</button>
      <p>
        ¿No tienes cuenta?{" "}
        <button className="link-button" onClick={() => setAuthState("signUp")}>
          Regístrate
        </button>
      </p>
    </div>
  );

  // Renderizar vista después de autenticación
  const renderSignedInView = () => (
    <div className="profile-view">
      <h2>Bienvenido, {user?.username}!</h2>
      <div className="user-info">
        <p>Email: {user?.signInDetails?.loginId}</p>
        <p>ID de usuario: {user?.userId}</p>
      </div>
      <button onClick={handleSignOut}>Cerrar sesión</button>
    </div>
  );

  return (
    <main className="auth-container">
      {error && <div className="error-message">{error}</div>}
      
      {authState === "signUp" && renderSignUpForm()}
      {authState === "signIn" && renderSignInForm()}
      {authState === "signedIn" && renderSignedInView()}
    </main>
  );
}