import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function ListeAlerte() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/api/alertes/")
      .then((res) => setAlerts(res.data))
      .catch((err) => console.error(err));
  }, []);

  // Supprimer alerte
  const handleDelete = async (id: number) => {
    if (!confirm("Voulez-vous vraiment supprimer cette alerte ?")) return;
    try {
      await axios.delete(`http://127.0.0.1:8000/api/alertes/${id}/`);
      setAlerts(alerts.filter((alert) => alert.id !== id));
      alert("Alerte supprimée !");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la suppression");
    }
  };

  // Modifier alerte (redirection vers formulaire)
  const handleEdit = (id: number) => {
    navigate(`/user/ajout?id=${id}`); // tu peux réutiliser ton formulaire AjoutAlerte pour modifier
  };

  return (
    <div className="alerts-list">
      {alerts.map((alert) => (
        <div key={alert.id} className="alert-card">
          <div className="alert-header">
            <div className="alert-icon">⚠️</div>
            <div className="alert-main-info">
              <h3>{alert.type_alerte}</h3>
              <p
                style={{ cursor: "pointer", color: "blue", textDecoration: "underline" }}
                onClick={() => navigate(`/user/carte?lat=${alert.lat}&lng=${alert.lng}&nomLieu=${encodeURIComponent(alert.adresse)}`)}
              >
                Lieu: {alert.adresse}
              </p>
              <p>{alert.description}</p>
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
