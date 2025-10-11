import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

// Icône par défaut Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function Carte() {
  const [searchParams] = useSearchParams();

  // Si tu veux afficher une alerte spécifique envoyée depuis ListeAlerte :
  const latParam = searchParams.get("lat");
  const lngParam = searchParams.get("lng");
  const nomLieu = searchParams.get("nomLieu");

  const [position, setPosition] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (latParam && lngParam) {
      // 👉 Si on a reçu une alerte spécifique (depuis la liste)
      setPosition([parseFloat(latParam), parseFloat(lngParam)]);
    } else {
      // 👉 Sinon, on géolocalise automatiquement l'utilisateur
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;
            console.log("Ta position réelle :", latitude, longitude);
            setPosition([latitude, longitude]);
          },
          (err) => {
            console.error("Erreur géoloc :", err);
            // Si l'utilisateur refuse ou erreur => fallback sur Tuléar
            setPosition([-23.35, 43.67]); // 🌍 Coordonnées de Tuléar
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      } else {
        console.error("La géolocalisation n'est pas supportée par ce navigateur");
        setPosition([-23.35, 43.67]);
      }
    }
  }, [latParam, lngParam]);

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      {position ? (
        <MapContainer center={position} zoom={14} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          <Marker position={position}>
            <Popup>
              {nomLieu ? `📍 ${nomLieu}` : "📍 Vous êtes ici"}
            </Popup>
          </Marker>
        </MapContainer>
      ) : (
        <p style={{ textAlign: "center", marginTop: "20px" }}>Chargement de la carte...</p>
      )}
    </div>
  );
}
