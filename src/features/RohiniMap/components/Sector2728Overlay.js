import React from "react";
import { Overlay } from "react-native-maps";

const CORNERS = {
  nw: { latitude: 28.748139, longitude: 77.088392 },
  ne: { latitude: 28.767992, longitude: 77.101303 },
  sw: { latitude: 28.74307, longitude: 77.105831 },
  se: { latitude: 28.755554, longitude: 77.11617 },
};

// Add the PNG in src/assets and uncomment this line.
const SECTOR_27_28_IMAGE = require("../assets/sector27-28-outline.png");
// const SECTOR_27_28_IMAGE = null;
const ENABLE_SECTOR_27_28 = true;

const latitudes = Object.values(CORNERS).map((point) => point.latitude);
const longitudes = Object.values(CORNERS).map((point) => point.longitude);

const rawNorth = Math.max(...latitudes);
const rawSouth = Math.min(...latitudes);
const rawEast = Math.max(...longitudes);
const rawWest = Math.min(...longitudes);

const centerLat = (rawNorth + rawSouth) / 2;
const centerLng = (rawEast + rawWest) / 2;

// Tune these values after first visual check.
const SIZE_SCALE = 1.02;
const HEIGHT_SCALE = 1;
const LAT_SHIFT = -0.0002;
const LNG_SHIFT = 0.0008;

const halfLatSpan = ((rawNorth - rawSouth) * SIZE_SCALE * HEIGHT_SCALE) / 2;
const halfLngSpan = ((rawEast - rawWest) * SIZE_SCALE) / 2;

const north = centerLat + LAT_SHIFT + halfLatSpan;
const south = centerLat + LAT_SHIFT - halfLatSpan;
const east = centerLng + LNG_SHIFT + halfLngSpan;
const west = centerLng + LNG_SHIFT - halfLngSpan;

const SECTOR_27_28_BOUNDS = [
  [south, west],
  [north, east],
];

export default function Sector2728Overlay() {
  if (!ENABLE_SECTOR_27_28 || !SECTOR_27_28_IMAGE) {
    return null;
  }

  return (
    <Overlay
      image={SECTOR_27_28_IMAGE}
      bounds={SECTOR_27_28_BOUNDS}
      opacity={0.78}
      zIndex={3}
      tappable={false}
    />
  );
}
