"use client";

import { useCallback, useState } from "react";

export interface GeolocationCoords {
    latitude: number;
    longitude: number;
    accuracyMeters: number;
}

export type GeolocationErrorKind = "unsupported" | "permission-denied" | "timeout" | "unavailable";

export interface GeolocationFailure {
    kind: GeolocationErrorKind;
    message: string;
}

const classifyError = (error: GeolocationPositionError): GeolocationFailure => {
    if (error.code === error.PERMISSION_DENIED) {
        return { kind: "permission-denied", message: "Location permission was denied." };
    }
    if (error.code === error.TIMEOUT) {
        return { kind: "timeout", message: "Getting your location timed out." };
    }
    return { kind: "unavailable", message: "Your location is currently unavailable." };
};

// ✅ Encapsulates browser geolocation permission, timeout, and coordinate retrieval.
// Never fabricates coordinates - a caller that gets a rejection must not substitute 0/0 or any other value.
export function useGeolocation() {
    const [locating, setLocating] = useState(false);

    const requestLocation = useCallback((): Promise<GeolocationCoords> => {
        setLocating(true);
        return new Promise((resolve, reject) => {
            if (typeof navigator === "undefined" || !navigator.geolocation) {
                setLocating(false);
                reject({ kind: "unsupported", message: "Geolocation is not supported on this device." } as GeolocationFailure);
                return;
            }
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocating(false);
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracyMeters: position.coords.accuracy,
                    });
                },
                (error) => {
                    setLocating(false);
                    reject(classifyError(error));
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        });
    }, []);

    return { requestLocation, locating };
}
