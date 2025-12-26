import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const ClickableMarker = ({ position, setPosition }) => {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
    },
  });

  return position ? <Marker position={position} /> : null;
};

const MapComponent = ({ mapPos, setMapPos }) => {
  return (
    <div className="h-80 w-full border rounded-sm overflow-hidden">
      <MapContainer
        center={mapPos || [-6.2, 106.8]} // initial center
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        <ClickableMarker position={mapPos} setPosition={setMapPos} />
      </MapContainer>
    </div>
  );
};

export default MapComponent;
