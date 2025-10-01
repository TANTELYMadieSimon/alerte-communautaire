"use client"

import { useState } from "react"
import "./Historique.css"

export default function Historique() {
  const [activeTab, setActiveTab] = useState<"historique" | "annonce">("historique")

  const chartData = [
    { name: "Incendie", value: 8, color: "#22c55e" },
    { name: "Route bloquée", value: 12, color: "#06b6d4" },
    { name: "Inondation", value: 16, color: "#3b82f6" },
    { name: "Ordures ménagères", value: 20, color: "#ef4444" },
  ]

  return (
    <div className="historique-container">
      <div className="tab-header">
        <button className={activeTab === "historique" ? "active" : ""} onClick={() => setActiveTab("historique")}>
          Historique
        </button>
        <button className={activeTab === "annonce" ? "active" : ""} onClick={() => setActiveTab("annonce")}>
          Annonce
        </button>
      </div>

      {activeTab === "historique" && (
        <div className="historique-content">
          <h2>Historique par mois :</h2>

          <div className="chart-legend">
            {chartData.map((item, index) => (
              <div key={index} className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: item.color }}></span>
                <span>Élément {index + 1}</span>
              </div>
            ))}
          </div>

          <div className="chart-container">
            <div className="chart">
              <div className="y-axis">
                <span>20</span>
                <span>15</span>
                <span>10</span>
                <span>5</span>
                <span>0</span>
              </div>
              <div className="bars">
                {chartData.map((item, index) => (
                  <div key={index} className="bar-container">
                    <div
                      className="bar"
                      style={{
                        height: `${(item.value / 20) * 100}%`,
                        backgroundColor: item.color,
                      }}
                    ></div>
                    <div className="bar-label">
                      <span>{item.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button className="pdf-btn">PDF</button>
        </div>
      )}

      {activeTab === "annonce" && (
        <div className="annonce-content">
          <h2>Annonces récentes</h2>
          <div className="annonce-list">
            <div className="annonce-item">
              <h3>Maintenance réseau électrique</h3>
              <p>Coupure prévue demain de 9h à 12h</p>
              <span className="date">28/09/2025</span>
            </div>
            <div className="annonce-item">
              <h3>Fermeture route principale</h3>
              <p>Travaux de réfection jusqu'au 30/09</p>
              <span className="date">27/09/2025</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
