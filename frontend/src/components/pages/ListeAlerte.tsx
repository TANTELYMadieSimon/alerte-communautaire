import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// ✅ Définir le type de données pour une alerte
interface Alert {
  id: number;
  type_alerte: string;
  description: string;
  adresse: string;
  latitude?: number;
  longitude?: number;
  date_creation: string;
  photo?: string;
}
// ✅ Icône selon le type d’alerte
const getIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case "inondation":
      return "🌊";
    case "incendie":
      return "🔥";
    case "électricité":
    case "electricite":
      return "⚡";
    default:
      return "⚠️";
  }
};

export default function ListeAlerte() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/alertes/")
      .then((res) => setAlerts(res.data))
      .catch((err) => console.error(err));
  }, []);

  // ✅ Supprimer une alerte
  const handleDelete = async (id: number) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cette alerte ?")) return;
    try {
      await axios.delete(`http://127.0.0.1:8000/api/alertes/${id}/`);
      setAlerts((prev) => prev.filter((a) => a.id !== id));
      window.alert("Alerte supprimée !");
    } catch (err) {
      console.error(err);
      window.alert("Erreur lors de la suppression");
    }
  };

  // ✅ Rediriger pour modifier une alerte
  const handleEdit = (id: number) => {
    navigate(`/user/ajout?id=${id}`);
  };

  return (
    <div className="alerts-list">
      {alerts.map((alert) => (
        <div key={alert.id} className="alert-card">
          <div className="alert-header">
            <div className="alert-icon">{getIcon(alert.type_alerte)} {alert.type_alerte}</div>
            <div className="alert-main-info">
              <h3>{alert.type_alerte}</h3>
              <p
                style={{ cursor: "pointer", color: "blue", textDecoration: "underline" }}
                onClick={() =>
                  navigate(
                    `/user/carte?lat=${alert.latitude}&lng=${alert.longitude}&nomLieu=${encodeURIComponent(
                      alert.adresse
                    )}`
                  )
                }
              >
                Lieu : {alert.adresse}
              </p>
              <p>{alert.description}</p>
              {alert.photo && (
                <img
                src={alert.photo}
                alt="Alerte"
                className="w-full h-40 object-cover rounded-lg mt-2"
              />

              )}
            </div>
          </div>

          <div className="alert-footer">
            <span>{new Date(alert.date_creation).toLocaleDateString()}</span>
            <div className="alert-actions">
              <button onClick={() => handleEdit(alert.id)}>Modifier</button>
              <button onClick={() => handleDelete(alert.id)}>Supprimer</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
