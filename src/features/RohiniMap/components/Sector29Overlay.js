import React from "react";
import { Overlay } from "react-native-maps";

const CORNERS = {
  nw: { latitude: 28.762282, longitude: 77.07873 },
  ne: { latitude: 28.775335, longitude: 77.086068 },
  sw: { latitude: 28.755472, longitude: 77.093578 },
  se: { latitude: 28.767022, longitude: 77.101603 },
};

// Add the PNG in src/assets and uncomment this line.
const SECTOR_29_IMAGE = require("../assets/sector29-outline.png");
// const SECTOR_29_IMAGE = null;
const ENABLE_SECTOR_29 = true;

const latitudes = Object.values(CORNERS).map((point) => point.latitude);
const longitudes = Object.values(CORNERS).map((point) => point.longitude);

const rawNorth = Math.max(...latitudes);
const rawSouth = Math.min(...latitudes);
const rawEast = Math.max(...longitudes);
const rawWest = Math.min(...longitudes);

const centerLat = (rawNorth + rawSouth) / 2;
const centerLng = (rawEast + rawWest) / 2;

// Tune these values after first visual check.
const SIZE_SCALE = 1;
const HEIGHT_SCALE = 0.95;
const LAT_SHIFT = 0;
const LNG_SHIFT = 0.00035;

const halfLatSpan = ((rawNorth - rawSouth) * SIZE_SCALE * HEIGHT_SCALE) / 2;
const halfLngSpan = ((rawEast - rawWest) * SIZE_SCALE) / 2;

const north = centerLat + LAT_SHIFT + halfLatSpan;
const south = centerLat + LAT_SHIFT - halfLatSpan;
const east = centerLng + LNG_SHIFT + halfLngSpan;
const west = centerLng + LNG_SHIFT - halfLngSpan;

const SECTOR_29_BOUNDS = [
  [south, west],
  [north, east],
];

export default function Sector29Overlay() {
  if (!ENABLE_SECTOR_29 || !SECTOR_29_IMAGE) {
    return null;
  }

  return (
    <Overlay
      image={SECTOR_29_IMAGE}
      bounds={SECTOR_29_BOUNDS}
      opacity={0.78}
      zIndex={3}
      tappable={false}
    />
  );
}
