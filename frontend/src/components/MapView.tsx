import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import axios from "axios";
import "leaflet/dist/leaflet.css";

type Alerte = {
  id: number;
  titre: string;
  description: string;
  latitude: number | null;
  longitude: number | null;
  type_alerte: string;
};

export default function MapView() {
  const [alertes, setAlertes] = useState<Alerte[]>([]);
  useEffect(() => {
    axios.get("http://127.0.0.1:8000/api/alertes/").then(r => setAlertes(r.data));
  }, []);

  return (
    <MapContainer center={[ -18.9, 47.5 ]} zoom={8} style={{ height: "80vh", width: "100%" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {alertes.map(a => (a.latitude && a.longitude) ? (
        <Marker key={a.id} position={[Number(a.latitude), Number(a.longitude)]}>
          <Popup>
            <strong>{a.titre}</strong><br />
            {a.type_alerte}<br />
            {a.description}
          </Popup>
        </Marker>
      ) : null)}
    </MapContainer>
  );
}
