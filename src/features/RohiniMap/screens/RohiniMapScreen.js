import React, { useMemo, useRef, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import RohiniBoundary from "../components/RohiniBoundary";
import OutsideMask from "../components/OutsideMask";
import Sector30Overlay from "../components/Sector30Overlay";
import Sector2728Overlay from "../components/Sector2728Overlay";
import Sector29Overlay from "../components/Sector29Overlay";
import boundary from "../data/rohiniBoundary.json";
import { getBoundaryCoordinates } from "../utils/boundaryCoordinates";

const LAYER_OPTIONS = ["Terrain", "Satellite", "Traffic"];

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export default function RohiniMapScreen() {
  const mapRef = useRef(null);
  const isAnimatingRef = useRef(false);
  const [activeLayer, setActiveLayer] = useState("Terrain");
  const boundaryCoordinates = useMemo(() => getBoundaryCoordinates(boundary), []);

  const bounds = useMemo(() => {
    const latitudes = boundaryCoordinates.map((point) => point.latitude);
    const longitudes = boundaryCoordinates.map((point) => point.longitude);

    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);

    return {
      minLat,
      maxLat,
      minLng,
      maxLng,
      centerLat: (minLat + maxLat) / 2,
      centerLng: (minLng + maxLng) / 2,
      maxLatDelta: maxLat - minLat,
      maxLngDelta: maxLng - minLng,
    };
  }, [boundaryCoordinates]);

  const initialRegion = useMemo(
    () => ({
      latitude: bounds.centerLat,
      longitude: bounds.centerLng,
      latitudeDelta: bounds.maxLatDelta,
      longitudeDelta: bounds.maxLngDelta,
    }),
    [bounds]
  );

  const handleMapReady = () => {
    if (mapRef.current?.setMapBoundaries) {
      mapRef.current.setMapBoundaries(
        { latitude: bounds.maxLat, longitude: bounds.maxLng },
        { latitude: bounds.minLat, longitude: bounds.minLng }
      );
    }
  };

  const handleRegionChangeComplete = (nextRegion) => {
    if (isAnimatingRef.current) {
      isAnimatingRef.current = false;
      return;
    }

    const latitudeDelta = Math.min(nextRegion.latitudeDelta, bounds.maxLatDelta);
    const longitudeDelta = Math.min(nextRegion.longitudeDelta, bounds.maxLngDelta);

    const minCenterLat = bounds.minLat + latitudeDelta / 2;
    const maxCenterLat = bounds.maxLat - latitudeDelta / 2;
    const minCenterLng = bounds.minLng + longitudeDelta / 2;
    const maxCenterLng = bounds.maxLng - longitudeDelta / 2;

    const latitude =
      minCenterLat > maxCenterLat
        ? bounds.centerLat
        : clamp(nextRegion.latitude, minCenterLat, maxCenterLat);

    const longitude =
      minCenterLng > maxCenterLng
        ? bounds.centerLng
        : clamp(nextRegion.longitude, minCenterLng, maxCenterLng);

    const clampedRegion = {
      latitude,
      longitude,
      latitudeDelta,
      longitudeDelta,
    };

    const movedOutside =
      Math.abs(clampedRegion.latitude - nextRegion.latitude) > 0.00001 ||
      Math.abs(clampedRegion.longitude - nextRegion.longitude) > 0.00001 ||
      Math.abs(clampedRegion.latitudeDelta - nextRegion.latitudeDelta) > 0.00001 ||
      Math.abs(clampedRegion.longitudeDelta - nextRegion.longitudeDelta) > 0.00001;

    if (movedOutside && mapRef.current?.animateToRegion) {
      isAnimatingRef.current = true;
      mapRef.current.animateToRegion(clampedRegion, 280);
    }
  };

  const handleLayerPress = (layer) => {
    setActiveLayer(layer);
  };

  const resolvedMapType =
    activeLayer === "Terrain"
      ? "terrain"
      : activeLayer === "Satellite"
      ? "hybrid"
      : "standard";
  const resolvedShowsTraffic = activeLayer === "Traffic";

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        mapType={resolvedMapType}
        showsTraffic={resolvedShowsTraffic}
        initialRegion={initialRegion}
        onMapReady={handleMapReady}
        onRegionChangeComplete={handleRegionChangeComplete}
        minZoomLevel={13}
        maxZoomLevel={18}
        rotateEnabled={false}
        pitchEnabled={false}
      >
        <OutsideMask />
        <Sector30Overlay />
        <Sector2728Overlay />
        <Sector29Overlay />
        <RohiniBoundary />
      </MapView>

      <View style={styles.layerBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {LAYER_OPTIONS.map((layer) => {
            const isSelected = layer === activeLayer;

            return (
              <Pressable
                key={layer}
                onPress={() => handleLayerPress(layer)}
                style={[
                  styles.layerChip,
                  isSelected && styles.layerChipSelected,
                ]}
              >
                <Text
                  style={[
                    styles.layerText,
                    isSelected && styles.layerTextSelected,
                  ]}
                >
                  {layer}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  layerBar: {
    position: "absolute",
    top: 14,
    left: 10,
    right: 10,
    paddingVertical: 4,
  },
  layerChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#DADADA",
  },
  layerChipSelected: {
    backgroundColor: "#1A73E8",
    borderColor: "#1A73E8",
  },
  layerText: {
    color: "#2C2C2C",
    fontSize: 13,
  },
  layerTextSelected: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
