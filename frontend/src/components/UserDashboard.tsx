"use client"
import { Routes, Route, useNavigate, useLocation } from "react-router-dom"
import Carte from "./pages/Carte"
import Historique from "./pages/Historique"
import AffichageAnnonce from "./pages/AffichageAnnonce"
import AjoutAlerte from "./pages/AjoutAlerte"
import ListeAlerte from "./pages/ListeAlerte"
import "./Dashboard.css"

interface UserDashboardProps {
  onLogout: () => void
}

export default function UserDashboard({ onLogout }: UserDashboardProps) {
  const navigate = useNavigate()
  const location = useLocation()

  const tabs = [
    { id: "carte", label: "Carte", icon: "🗺️" },
    { id: "historique", label: "Historique", icon: "📊" },
    { id: "affichage", label: "Affichage", icon: "👁️" },
    { id: "ajout", label: "AjoutAlerte", icon: "➕" },
    { id: "liste", label: "Liste", icon: "📋" },
  ]

  const currentTab = location.pathname.split("/")[2] || "carte"

  const handleTabClick = (tabId: string) => {
    navigate(`/user/${tabId}`)
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
         <nav className="bottom-nav">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`nav-item ${currentTab === tab.id ? "active" : ""}`}
            onClick={() => handleTabClick(tab.id)}
          >
            <span className="nav-icon">{tab.icon}</span>
            <span className="nav-label">{tab.label}</span>
          </button>
        ))}
        <button onClick={onLogout} className="logout-btn">
          Déconnexion
        </button>
      </nav>
      </header>

      <main className="dashboard-content">
        <Routes>
          <Route path="/" element={<Carte />} />
          <Route path="/carte" element={<Carte />} />
          <Route path="/historique" element={<Historique />} />
          <Route path="/affichage" element={<AffichageAnnonce />} />
          <Route path="/ajout" element={<AjoutAlerte />} />
          <Route path="/liste" element={<ListeAlerte />} />
        </Routes>
      </main>
    </div>
  )
}
