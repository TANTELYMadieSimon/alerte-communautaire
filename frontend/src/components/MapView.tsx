import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import axios from "axios";
import "leaflet/dist/leaflet.css";

// Interface non modifiée
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
    <MapContainer center={[-18.9, 47.5] as [number, number]} zoom={8} className="h-[80vh] w-full shadow-lg rounded-lg">
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      
      {alertes.map(a => (a.latitude && a.longitude) ? (
        <Marker 
          key={a.id} 
          position={[a.latitude, a.longitude] as [number, number]}
        >
          <Popup>
            <div className="p-1 max-w-xs">
              <strong className="block text-lg font-semibold text-red-700">{a.titre}</strong>
              <p className="text-sm text-gray-600 italic mt-1">Type: <span className="font-medium text-red-500">{a.type_alerte}</span></p>
              <p className="text-sm mt-2">{a.description}</p>
            </div>
          </Popup>
        </Marker>
      ) : null)}
    </MapContainer>
  );
}