"use client"

import { useState } from "react"
import "./AffichageAnnonce.css"

interface Annonce {
  id: number
  type: string
  title: string
  description: string
  date: string
  status: "active" | "expired"
  author: "admin" | "user"
}

export default function AffichageAnnonce() {
  const [annonces] = useState<Annonce[]>([
    {
      id: 1,
      type: "maintenance",
      title: "Maintenance réseau électrique",
      description: "Coupure prévue demain de 9h à 12h dans le secteur nord",
      date: "2025-09-29",
      status: "active",
      author: "admin",
    },
    {
      id: 2,
      type: "fermeture",
      title: "Fermeture route principale",
      description: "Travaux de réfection de la chaussée jusqu'au 30/09",
      date: "2025-09-28",
      status: "active",
      author: "admin",
    },
    {
      id: 3,
      type: "evenement",
      title: "Marché hebdomadaire",
      description: "Marché tous les samedis de 8h à 13h place centrale",
      date: "2025-09-27",
      status: "active",
      author: "user",
    },
  ])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "maintenance":
        return "🔧"
      case "fermeture":
        return "🚧"
      case "evenement":
        return "🎪"
      case "urgence":
        return "🚨"
      default:
        return "📢"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "maintenance":
        return "#f59e0b"
      case "fermeture":
        return "#ef4444"
      case "evenement":
        return "#22c55e"
      case "urgence":
        return "#dc2626"
      default:
        return "#6b7280"
    }
  }

  return (
    <div className="affichage-annonce-container">
      <div className="annonce-header">
        <h2>Annonces Actives</h2>
        <div className="filter-controls">
          <select className="filter-select">
            <option value="all">Toutes</option>
            <option value="maintenance">Maintenance</option>
            <option value="fermeture">Fermeture</option>
            <option value="evenement">Événement</option>
            <option value="urgence">Urgence</option>
          </select>
        </div>
      </div>

      <div className="annonces-list">
        {annonces.map((annonce) => (
          <div key={annonce.id} className="annonce-card">
            <div className="annonce-header-card">
              <div className="annonce-icon" style={{ backgroundColor: getTypeColor(annonce.type) }}>
                {getTypeIcon(annonce.type)}
              </div>
              <div className="annonce-meta">
                <h3>{annonce.title}</h3>
                <div className="annonce-info">
                  <span className="date">{annonce.date}</span>
                  <span className={`status ${annonce.status}`}>{annonce.status === "active" ? "Actif" : "Expiré"}</span>
                  <span className={`author ${annonce.author}`}>
                    {annonce.author === "admin" ? "Admin" : "Utilisateur"}
                  </span>
                </div>
              </div>
            </div>
            <div className="annonce-content">
              <p>{annonce.description}</p>
            </div>
          </div>
        ))}
      </div>

      {annonces.length === 0 && (
        <div className="no-annonces">
          <p>Aucune annonce disponible</p>
        </div>
      )}
    </div>
  )
}
