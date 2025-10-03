"use client"

import type React from "react"

import { useState } from "react"
import type { UserRole } from "../App"
import "./Login.css"

interface LoginProps {
  onLogin: (role: UserRole) => void
}

export default function Login({ onLogin }: LoginProps) {
  const [selectedRole, setSelectedRole] = useState<"admin" | "user">("user")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Simple authentication logic
    if (selectedRole === "admin" && username === "admin" && password === "admin123") {
      onLogin("admin")
    } else if (selectedRole === "user" && username && password) {
      onLogin("user")
    } else {
      alert("Identifiants incorrects")
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <img src="/alerte.png" alt="Alerte" className="icon" />
        <h1>ToliAlerte</h1>
        <form onSubmit={handleSubmit}>
          <div className="role-selector">
            <button
              type="button"
              className={selectedRole === "admin" ? "active" : ""}
              onClick={() => setSelectedRole("admin")}
            >
              Admin
            </button>
            <button
              type="button"
              className={selectedRole === "user" ? "active" : ""}
              onClick={() => setSelectedRole("user")}
            >
              Utilisateur
            </button>
          </div>

          <input
            type="text"
            placeholder="Nom d'utilisateur"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="login-btn">
            Se connecter
          </button>
        </form>

        <div className="login-info">
          <p>
            <strong>Admin:</strong> admin / admin123
          </p>
          <p>
            <strong>Utilisateur:</strong> n'importe quel identifiant
          </p>
        </div>
      </div>
    </div>
  )
}
