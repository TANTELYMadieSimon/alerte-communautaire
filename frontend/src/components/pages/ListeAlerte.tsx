import { useEffect, useState } from "react"
import axios from "axios"

interface Alert {
  id: number
  titre: string
  description: string
  type_alerte: "inondation" | "incendie" | "electricite" | "autre"
  date_creation: string
  statut: string
  utilisateur_nom: string
  adresse: string
}

export default function ListeAlerte() {
  const [alerts, setAlerts] = useState<Alert[]>([])

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/api/alertes/")
      .then((res) => {
        setAlerts(res.data)
      })
      .catch((err) => console.error(err))
  }, [])

  return (
    <div className="liste-alerte-container">
      <div className="liste-header">
        <h2>Liste d'alerte</h2>
      </div>

      <div className="alerts-list">
        {alerts.map((alert) => (
          <div key={alert.id} className="alert-card">
            <div className="alert-header">
              <div className="alert-icon">⚠️</div>
              <div className="alert-main-info">
                <h3>{alert.titre}</h3>
                <p className="location">Lieu: {alert.adresse}</p>
                <p className="description">{alert.description}</p>
              </div>
            </div>

            <div className="alert-footer">
              <span className="date">{new Date(alert.date_creation).toLocaleDateString()}</span>
              <span className="status">{alert.statut}</span>
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
