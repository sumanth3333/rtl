"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";

// Leaflet's default marker icon references relative asset paths that break once bundled by
// webpack - point them at the same CDN leaflet itself ships from instead of bundling images.
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function ClickToPlace({ onPick }: { onPick: (lat: number, lng: number) => void }) {
    useMapEvents({
        click(e) {
            onPick(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

export default function StoreLocationPicker({
    latitude,
    longitude,
    onChange,
}: {
    latitude: number;
    longitude: number;
    onChange: (lat: number, lng: number) => void;
}) {
    return (
        <MapContainer
            center={[latitude, longitude]}
            zoom={16}
            scrollWheelZoom
            style={{ height: "320px", width: "100%" }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker
                position={[latitude, longitude]}
                draggable
                eventHandlers={{
                    dragend: (e) => {
                        const pos = e.target.getLatLng();
                        onChange(pos.lat, pos.lng);
                    },
                }}
            />
            <ClickToPlace onPick={onChange} />
        </MapContainer>
    );
}
