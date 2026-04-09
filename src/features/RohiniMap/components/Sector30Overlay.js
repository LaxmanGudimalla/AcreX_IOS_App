import React from "react";
import { Overlay } from "react-native-maps";

const CORNERS = {
  nw: { latitude: 28.753291, longitude: 77.073254 },
  ne: { latitude: 28.762208, longitude: 77.07879 },
  sw: { latitude: 28.748099, longitude: 77.088446 },
  se: { latitude: 28.755903, longitude: 77.093413 },
};

const SECTOR_30_IMAGE = require("../assets/sector30-outline.png");

const latitudes = Object.values(CORNERS).map((point) => point.latitude);
const longitudes = Object.values(CORNERS).map((point) => point.longitude);

const rawNorth = Math.max(...latitudes);
const rawSouth = Math.min(...latitudes);
const rawEast = Math.max(...longitudes);
const rawWest = Math.min(...longitudes);

const centerLat = (rawNorth + rawSouth) / 2;
const centerLng = (rawEast + rawWest) / 2;

// Tune these values:
// SIZE_SCALE < 1 shrinks, > 1 grows.
// LAT_SHIFT: negative moves down/south, positive moves up/north.
// LNG_SHIFT: positive moves east/right, negative west/left.
const SIZE_SCALE = 0.95;
const HEIGHT_SCALE = 1.1;
const LAT_SHIFT = -0.0003;
const LNG_SHIFT = 0.0002;

const halfLatSpan = ((rawNorth - rawSouth) * SIZE_SCALE * HEIGHT_SCALE) / 2;
const halfLngSpan = ((rawEast - rawWest) * SIZE_SCALE) / 2;

const north = centerLat + LAT_SHIFT + halfLatSpan;
const south = centerLat + LAT_SHIFT - halfLatSpan;
const east = centerLng + LNG_SHIFT + halfLngSpan;
const west = centerLng + LNG_SHIFT - halfLngSpan;

const SECTOR_30_BOUNDS = [
  [south, west],
  [north, east],
];

export default function Sector30Overlay() {
  if (!SECTOR_30_IMAGE) {
    return null;
  }

  return (
    <Overlay
      image={SECTOR_30_IMAGE}
      bounds={SECTOR_30_BOUNDS}
      opacity={0.78}
      zIndex={4}
      tappable={false}
    />
  );
}
