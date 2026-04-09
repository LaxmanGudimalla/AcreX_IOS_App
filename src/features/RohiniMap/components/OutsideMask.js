import React, { useMemo } from "react";
import { Polygon } from "react-native-maps";
import boundary from "../data/rohiniBoundary.json";
import { getBoundaryCoordinates } from "../utils/boundaryCoordinates";

const MASK_PADDING = 20;

export default function OutsideMask() {
  const boundaryCoordinates = useMemo(() => getBoundaryCoordinates(boundary), []);

  const outerMask = useMemo(() => {
    const latitudes = boundaryCoordinates.map((point) => point.latitude);
    const longitudes = boundaryCoordinates.map((point) => point.longitude);

    const minLat = Math.max(Math.min(...latitudes) - MASK_PADDING, -85);
    const maxLat = Math.min(Math.max(...latitudes) + MASK_PADDING, 85);
    const minLng = Math.max(Math.min(...longitudes) - MASK_PADDING, -180);
    const maxLng = Math.min(Math.max(...longitudes) + MASK_PADDING, 180);

    return [
      { latitude: maxLat, longitude: minLng },
      { latitude: maxLat, longitude: maxLng },
      { latitude: minLat, longitude: maxLng },
      { latitude: minLat, longitude: minLng },
    ];
  }, []);

  return (
    <Polygon
      coordinates={outerMask}
      holes={[boundaryCoordinates]}
      fillColor="rgb(0, 0, 0)"
      strokeWidth={5}
      tappable={false}
    />
  );
}
