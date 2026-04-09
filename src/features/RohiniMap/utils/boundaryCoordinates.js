export function getBoundaryCoordinates(boundaryData) {
  if (!boundaryData) return [];

  if (Array.isArray(boundaryData)) {
    return boundaryData;
  }

  if (boundaryData.type === "FeatureCollection" && Array.isArray(boundaryData.features)) {
    const points = [];

    boundaryData.features.forEach((feature) => {
      const geometry = feature?.geometry;
      if (!geometry) return;

      if (geometry.type === "LineString" && Array.isArray(geometry.coordinates)) {
        geometry.coordinates.forEach(([longitude, latitude]) => {
          points.push({ latitude, longitude });
        });
      }

      if (geometry.type === "MultiLineString" && Array.isArray(geometry.coordinates)) {
        geometry.coordinates.forEach((line) => {
          line.forEach(([longitude, latitude]) => {
            points.push({ latitude, longitude });
          });
        });
      }
    });

    return points;
  }

  return [];
}
