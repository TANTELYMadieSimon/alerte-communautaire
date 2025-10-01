"use client"

import { useState } from "react"
import "./Carte.css"

interface Alert {
  id: number
  type: "inondation" | "incendie" | "electricite"
  lat: number
  lng: number
  description: string
  date: string
  status: "active" | "resolved"
}

export default function Carte() {
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: 1,
      type: "inondation",
      lat: 48.8566,
      lng: 2.3522,
      description: "Inondation route principale",
      date: "2025-09-29",
      status: "active",
    },
    {
      id: 2,
      type: "incendie",
      lat: 48.8606,
      lng: 2.3376,
      description: "Incendie forêt",
      date: "2025-09-28",
      status: "resolved",
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

  const getAlertColor = (type: string) => {
    switch (type) {
      case "inondation":
        return "#3b82f6"
      case "incendie":
        return "#ef4444"
      case "electricite":
        return "#f59e0b"
      default:
        return "#6b7280"
    }
  }

  return (
    <div className="carte-container">
      <div className="map-header">
        <h2>Carte des Alertes</h2>
        <div className="map-controls">
          <button className="refresh-btn">🔄</button>
          <button className="location-btn">📍</button>
        </div>
      </div>

      <div className="map-view">
        <div className="map-placeholder">
          <p>Carte Interactive</p>
          <div className="alert-markers">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`alert-marker ${alert.status}`}
                style={{
                  backgroundColor: getAlertColor(alert.type),
                  left: `${Math.random() * 80 + 10}%`,
                  top: `${Math.random() * 60 + 20}%`,
                }}
                title={alert.description}
              >
                {getAlertIcon(alert.type)}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="map-legend">
        <h3>Légende</h3>
        <div className="legend-items">
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: "#3b82f6" }}></span>
            <span>Inondation</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: "#ef4444" }}></span>
            <span>Incendie</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: "#f59e0b" }}></span>
            <span>Électricité</span>
          </div>
        </div>
      </div>
    </div>
  )
}
