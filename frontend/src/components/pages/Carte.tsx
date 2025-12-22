import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";

// --- Interface des props ---
export interface CarteProps {
  alertParams: {
    lat: number;
    lng: number;
    nomLieu: string;
  } | null;
  clearAlertParams: () => void;
}

// --- Correction des icônes Leaflet ---
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// --- Composant interne : invalidateSize + centrage ---
const MapFix = ({ position, nomLieu }: { position: [number, number]; nomLieu: string | undefined }) => {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
      map.setView(position, 14);
    }, 150);

    return () => clearTimeout(timer);
  }, [map, position]);

  return (
    <>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
      />
      <Marker position={position}>
        <Popup>
          <div className="p-2 font-semibold text-indigo-700 text-sm">
            {nomLieu ? `Alerte: ${nomLieu}` : "Votre position actuelle"}
          </div>
        </Popup>
      </Marker>
    </>
  );
};

// --- Composant principal ---
export default function Carte({ alertParams }: CarteProps) {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(true);

  // --- Gestion de la position ---
  useEffect(() => {
    if (alertParams) {
      setPosition([alertParams.lat, alertParams.lng]);
      setLoading(false);
      return;
    }

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition([pos.coords.latitude, pos.coords.longitude]);
          setLoading(false);
        },
        () => {
          setPosition([-23.35, 43.67]); // Tuléar
          setLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setPosition([-23.35, 43.67]);
      setLoading(false);
    }
  }, [alertParams]); // clearAlertParams non utilisé ici

  const nomLieu = alertParams?.nomLieu;

  return (
    <div className="w-full h-[85vh] relative overflow-hidden rounded-lg shadow-xl">
      {loading || !position ? (
        <div className="flex items-center justify-center h-full bg-gray-50">
          <p className="text-xl font-medium text-gray-600 animate-pulse">
            Chargement de la carte...
          </p>
        </div>
      ) : (
        <MapContainer
          key={position.join(",")}
          center={position}
          zoom={14}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%" }}
          className="z-0"
        >
          <MapFix position={position} nomLieu={nomLieu} /> {/* CORRIGÉ ICI */}
        </MapContainer>
      )}
    </div>
  );
}