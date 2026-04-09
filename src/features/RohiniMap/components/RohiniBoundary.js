import React from "react";
import { Polygon } from "react-native-maps";
import boundary from "../data/rohiniBoundary.json";
import { getBoundaryCoordinates } from "../utils/boundaryCoordinates";

export default function RohiniBoundary() {
  const coordinates = getBoundaryCoordinates(boundary);

  return (
    <Polygon
      coordinates={coordinates}
      strokeColor="#FFFFFF"
      strokeWidth={2}
      fillColor="rgba(0, 0, 0, 0)"
    />
  );
}
