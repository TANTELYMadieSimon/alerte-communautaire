"use client"

import { useState, useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import Login from "./components/Login"
import AdminDashboard from "./components/AdminDashboard"
import UserDashboard from "./components/UserDashboard"
import "./App.css"

export type UserRole = "admin" | "user" | null

export default function App() {
  const [userRole, setUserRole] = useState<UserRole>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check if user is already logged in
    const savedRole = localStorage.getItem("userRole")
    const savedAuth = localStorage.getItem("isAuthenticated")

    if (savedRole && savedAuth === "true") {
      setUserRole(savedRole as UserRole)
      setIsAuthenticated(true)
    }
  }, [])

  const handleLogin = (role: UserRole) => {
    setUserRole(role)
    setIsAuthenticated(true)
    localStorage.setItem("userRole", role!)
    localStorage.setItem("isAuthenticated", "true")
  }

  const handleLogout = () => {
    setUserRole(null)
    setIsAuthenticated(false)
    localStorage.removeItem("userRole")
    localStorage.removeItem("isAuthenticated")
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <Router>
      <div className="app">
        <Routes>
          <Route
            path="/admin/*"
            element={
              userRole === "admin" ? <AdminDashboard onLogout={handleLogout} /> : <Navigate to="/user" replace />
            }
          />
          <Route path="/user/*" element={<UserDashboard onLogout={handleLogout} />} />
          <Route path="/" element={<Navigate to={userRole === "admin" ? "/admin" : "/user"} replace />} />
        </Routes>
      </div>
    </Router>
  )
}
