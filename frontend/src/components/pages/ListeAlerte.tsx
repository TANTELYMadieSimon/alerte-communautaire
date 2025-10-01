"use client"

import { useState } from "react"
import "./ListeAlerte.css"

interface Alert {
  id: number
  type: "inondation" | "incendie" | "electricite"
  title: string
  location: string
  description: string
  date: string
  status: "Résolu" | "En cours" | "Nouveau"
  priority: "Haute" | "Moyenne" | "Basse"
}

export default function ListeAlerte() {
  const [alerts] = useState<Alert[]>([
    {
      id: 1,
      type: "inondation",
      title: "Inondation",
      location: "Tamatave",
      description: "La route est impraticable à cause des fortes pluies",
      date: "25/04/2025",
      status: "Résolu",
      priority: "Haute",
    },
    {
      id: 2,
      type: "incendie",
      title: "Incendie",
      location: "Maroabe",
      description: "Feu de forêt en cours",
      date: "20/04/2025",
      status: "En cours",
      priority: "Haute",
    },
    {
      id: 3,
      type: "electricite",
      title: "Électricité",
      location: "Bariaka",
      description: "Panne de courant généralisée",
      date: "11/04/2025",
      status: "Résolu",
      priority: "Moyenne",
    },
  ])

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "inondation":
        return "🌊"
      case "incendie":
        return "🔥"
      case "electricite":
        return "⚡"
      default:
        return "⚠️"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Résolu":
        return "#22c55e"
      case "En cours":
        return "#f59e0b"
      case "Nouveau":
        return "#ef4444"
      default:
        return "#6b7280"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Haute":
        return "#ef4444"
      case "Moyenne":
        return "#f59e0b"
      case "Basse":
        return "#22c55e"
      default:
        return "#6b7280"
    }
  }

  return (
    <div className="liste-alerte-container">
      <div className="liste-header">
        <h2>Liste d'alerte</h2>
        <div className="filter-controls">
          <select className="filter-select">
            <option value="all">Toutes</option>
            <option value="nouveau">Nouveau</option>
            <option value="en-cours">En cours</option>
            <option value="resolu">Résolu</option>
          </select>
        </div>
      </div>

      <div className="alerts-list">
        {alerts.map((alert) => (
          <div key={alert.id} className="alert-card">
            <div className="alert-header">
              <div className="alert-icon">{getAlertIcon(alert.type)}</div>
              <div className="alert-main-info">
                <h3>{alert.title}</h3>
                <p className="location">Lieu: {alert.location}</p>
                <p className="description">{alert.description}</p>
              </div>
            </div>

            <div className="alert-footer">
              <div className="alert-meta">
                <span className="date">{alert.date}</span>
                <span
                  className="status"
                  style={{
                    backgroundColor: getStatusColor(alert.status),
                    color: "white",
                    padding: "2px 8px",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                >
                  {alert.status}
                </span>
                <span
                  className="priority"
                  style={{
                    color: getPriorityColor(alert.priority),
                    fontWeight: "bold",
                    fontSize: "12px",
                  }}
                >
                  {alert.priority}
                </span>
              </div>
              <button className="view-details-btn">Voir plus</button>
            </div>
          </div>
        ))}
      </div>

      {alerts.length === 0 && (
        <div className="no-alerts">
          <p>Aucune alerte disponible</p>
        </div>
      )}
    </div>
  )
}
