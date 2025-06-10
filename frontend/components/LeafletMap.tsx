import { MapContainer, ImageOverlay, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import MapController from "./MapController";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "/marker.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

type DevicePosition = {
  code: string;
  name: string;
  lat: number;
  lng: number;
};

export default function LeafletMap({ 
  position, 
  name 
}: { 
  position: { lat: number, lng: number }, 
  name: string 
}) {
  console.log("Position recebida pelo Map:", position);
  
  // Defina os limites da sua planta baixa
  // Ajuste esses valores conforme as dimensões da sua imagem
  const imageBounds: [[number, number], [number, number]] = [
    [32, 32], // canto inferior esquerdo
    [-30, -30]    // canto superior direito
  ];
  
  return (
    <MapContainer 
      center={position} 
      zoom={2} // Zoom menor para planta baixa
      scrollWheelZoom={true} 
      className="h-full w-full"
      crs={L.CRS.Simple} // Sistema de coordenadas simples para plantas baixas
      minZoom={1}
      maxZoom={5}
    >
      <ImageOverlay
        url="/map.png"
        bounds={imageBounds}
      />
      
      <Marker position={position}>
        <Popup>Localização atual <strong>{name}</strong></Popup>
      </Marker>
      
      <MapController position={position}/>
    </MapContainer>
  );
}