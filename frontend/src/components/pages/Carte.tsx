import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function Carte() {
  const [searchParams] = useSearchParams();
  const adresse = searchParams.get("adresse") || "Toliara, Madagascar";

  const [position, setPosition] = useState<[number, number]>([-18.8792, 47.5079]);

  useEffect(() => {
    // Géocodage via OpenStreetMap
    fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(adresse)}`
    )
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          setPosition([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        }
      })
      .catch(err => console.error(err));
  }, [adresse]);

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <MapContainer center={position} zoom={14} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution="&copy; Esri, Maxar, Earthstar Geographics"
        />
        <Marker position={position}>
          <Popup>{adresse} 📍</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
