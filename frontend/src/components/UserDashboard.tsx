"use client"
import { Routes, Route, useNavigate, useLocation } from "react-router-dom"
import { useState } from "react"
import Carte from "./pages/Carte"
import Historique from "./pages/Historique"
import AjoutAlerte from "./pages/AjoutAlerte"
import AffichageAnnonce from "./pages/AffichageAnnonce"
import ListeAlerte from "./pages/ListeAlerte"
import "./Dashboard.css"

interface UserDashboardProps {
  onLogout: () => void
}

interface Tab {
  id: string
  label: string
  icon: string
}

export default function UserDashboard({ onLogout }: UserDashboardProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState<boolean>(false)

  const tabs: Tab[] = [
    { id: "carte", label: "Carte", icon: <img src="/carte.png" alt="Carte" className="tab-icon" />},
    { id: "historique", label: "Historique", icon: <img src="/histo.png" alt="Histogramme" className="tab-icon" />  },
    { id: "ajout", label: "Alerte", icon: <img src="/alerte.png" alt="Alerte" className="tab-icon" /> },
    { id: "affichage", label: "Affichage", icon: <img src="/listeAnnonce.png" alt="Affichage" className="tab-icon" /> },
    { id: "liste", label: "Liste", icon: <img src="/liste.png" alt="Liste" className="tab-icon" /> },
  ]

  const currentTab: string = location.pathname.split("/")[2] || "carte"

  const handleTabClick = (tabId: string) => {
    navigate(`/user/${tabId}`)
    setMenuOpen(false)
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <button className="burger-btn" onClick={() => setMenuOpen(prev => !prev)}>
          <img src="/menu-burger.png" alt="Menu" className="burger-icon" />
        </button>

        <nav className="bottom-nav">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`nav-item ${currentTab === tab.id ? "active" : ""}`}
              onClick={() => handleTabClick(tab.id)}
            >
              <span className="nav-icon">{tab.icon}</span>
              <span className="nav-label">{tab.label}</span>
            </button>
          ))}
          <button onClick={onLogout} className="logout-btn">Déconnexion</button>
        </nav>
      </header>

      {menuOpen && (
        <div className="mobile-menu">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`nav-item ${currentTab === tab.id ? "active" : ""}`}
              onClick={() => handleTabClick(tab.id)}
            >
              {tab.label}
            </button>
          ))}
          <button onClick={onLogout} className="logout-btn">Déconnexion</button>
        </div>
      )}

      <main className="dashboard-content">
        <Routes>
          <Route path="/" element={<Carte />} />
          <Route path="/carte" element={<Carte />} />
          <Route path="/historique" element={<Historique />} />
          <Route path="/ajout" element={<AjoutAlerte />} />
          <Route path="/affichage" element={<AffichageAnnonce />} />
          <Route path="/liste" element={<ListeAlerte />} />
        </Routes>
      </main>
    </div>
  )
}
