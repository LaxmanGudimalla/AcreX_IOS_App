import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import ImageZoom from 'react-native-image-pan-zoom';
import Svg, { Path, G, Text as SvgText } from 'react-native-svg';
import { API_BASE_URL } from '@env';
import {
  getBlocksBySector,
  getPlotsByPocket,
  getPocketsByBlock,
  getSectors,
  getPlotDealersByPlotId
} from '../../../services/api';
import plotPin from '../../../assets/pins/plot.png';
import builderPin from '../../../assets/pins/builder_floor.png';
import kothiPin from '../../../assets/pins/kothi.png';


const UNSELECTED_VALUE = '';
const IMAGE_BASE_URL = String(API_BASE_URL || '')
  .replace(/\/api\/?$/, '')
  .replace(/\/+$/, '');

function getEntityId(entity) {
  return entity?.id ?? entity?.sector_id ?? entity?.block_id ?? entity?.pocket_id ?? entity?.plot_id;
}

function toAbsoluteImageUrl(imagePath) {
  if (!imagePath) {
    return '';
  }
  if (/^https?:\/\//i.test(imagePath)) {
    return imagePath;
  }
  const normalizedPath = String(imagePath).replace(/^\/+/, '');
  return `${IMAGE_BASE_URL}/${normalizedPath}`;
}

function DropdownField({ label, placeholder, value, options, onSelect, disabled }) {
  const [visible, setVisible] = useState(false);

  const selectedOption = options.find((item) => String(item.value) === String(value));
  const displayText = selectedOption ? selectedOption.label : placeholder;

  const handlePick = (nextValue) => {
    onSelect(nextValue);
    setVisible(false);
  };

  return (
    <View style={styles.filterField}>
      <Text style={styles.filterLabel}>{label}</Text>
      <TouchableOpacity
        style={[styles.dropdownButton, disabled && styles.dropdownButtonDisabled]}
        disabled={disabled}
        onPress={() => setVisible(true)}
      >
        <Text style={[styles.dropdownButtonText, !selectedOption && styles.dropdownPlaceholder]}>
          {displayText}
        </Text>
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setVisible(false)}>
          <Pressable style={styles.modalCard}>
            <ScrollView>
              {options.map((item) => (
                <TouchableOpacity
                  key={String(item.value)}
                  style={styles.modalItem}
                  onPress={() => handlePick(item.value)}
                >
                  <Text style={styles.modalItemText}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function getPlotRef(plot) {
  return (
    plot?.plot_number ||
    plot?.plot_no ||
    plot?.plot_id ||
    plot?.plotId ||
    plot?.name ||
    plot?.id
  );
}

function getPlotLabel(plot) {
  const plotRef = getPlotRef(plot);
  return plotRef ? `Plot ${plotRef}` : `Plot ${plot?.id || ''}`;
}

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function normalizePoint(point) {
  if (!point) return null;

  if (Array.isArray(point) && point.length >= 2) {
    const x = toNumber(point[0]);
    const y = toNumber(point[1]);
    return x === null || y === null ? null : [x, y];
  }

  if (typeof point === 'object') {
    const x = toNumber(point.x ?? point.X ?? point.lng ?? point.lon ?? point.longitude);
    const y = toNumber(point.y ?? point.Y ?? point.lat ?? point.latitude);
    return x === null || y === null ? null : [x, y];
  }

  return null;
}

function parseWktPolygonRings(wkt) {
  if (typeof wkt !== 'string') return [];
  const normalized = wkt.trim();
  const polygonMatch = normalized.match(/^POLYGON\s*\(\((.*)\)\)$/i);
  if (!polygonMatch) return [];

  return polygonMatch[1]
    .split('),(')
    .map((ringPart) =>
      ringPart
        .split(',')
        .map((pair) => {
          const [x, y] = pair.trim().split(/\s+/);
          return normalizePoint([x, y]);
        })
        .filter(Boolean),
    )
    .filter((ring) => ring.length >= 3);
}

function parseGeometryToRings(geometry) {
  if (!geometry) return [];

  if (Array.isArray(geometry) && geometry[0]?.x !== undefined) {
  const ring = geometry.map(p => [Number(p.x), Number(p.y)]);
  return ring.length >= 3 ? [ring] : [];
}

  let parsed = geometry;
  if (typeof parsed === 'string') {
    const trimmed = parsed.trim();
    try {
      parsed = JSON.parse(trimmed);
    } catch (e) {
      return parseWktPolygonRings(trimmed);
    }
  }

  if (Array.isArray(parsed)) {
    const ring = parsed.map(normalizePoint).filter(Boolean);
    return ring.length >= 3 ? [ring] : [];
  }

  if (parsed?.coordinates && Array.isArray(parsed.coordinates)) {
    if (parsed.type === 'Polygon') {
      return parsed.coordinates
        .map((ring) => (Array.isArray(ring) ? ring.map(normalizePoint).filter(Boolean) : []))
        .filter((ring) => ring.length >= 3);
    }

    if (parsed.type === 'MultiPolygon') {
      return parsed.coordinates
        .flatMap((polygon) =>
          Array.isArray(polygon)
            ? polygon.map((ring) => (Array.isArray(ring) ? ring.map(normalizePoint).filter(Boolean) : []))
            : [],
        )
        .filter((ring) => ring.length >= 3);
    }

    const ring = parsed.coordinates.map(normalizePoint).filter(Boolean);
    return ring.length >= 3 ? [ring] : [];
  }

  const fallbackCoordinates = parsed?.points || parsed?.path || parsed?.polygon;
  if (Array.isArray(fallbackCoordinates)) {
    const ring = fallbackCoordinates.map(normalizePoint).filter(Boolean);
    return ring.length >= 3 ? [ring] : [];
  }

  return [];
}

function ringToPathD(ring) {
  if (!Array.isArray(ring) || ring.length < 3) return '';
  const [first, ...rest] = ring;
  const move = `M ${first[0]} ${first[1]}`;
  const lines = rest.map((pt) => `L ${pt[0]} ${pt[1]}`).join(' ');
  return `${move} ${lines} Z`;
}

function getPolygonCenter(ring) {
  if (!ring || ring.length === 0) return null;

  let x = 0;
  let y = 0;

  ring.forEach((p) => {
    x += p[0];
    y += p[1];
  });

  return [x / ring.length, y / ring.length];
}

export default function PropertyMapScreen({ navigation, onStatsChange, selectedType,isGuest }) {
  const [mapViewport, setMapViewport] = useState({ width: 0, height: 0 });
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  const [sectors, setSectors] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [pockets, setPockets] = useState([]);
  const [plots, setPlots] = useState([]);

  const [selectedSectorId, setSelectedSectorId] = useState(UNSELECTED_VALUE);
  const [selectedBlockId, setSelectedBlockId] = useState(UNSELECTED_VALUE);
  const [selectedPocketId, setSelectedPocketId] = useState(UNSELECTED_VALUE);
  const [selectedPlotRef, setSelectedPlotRef] = useState(UNSELECTED_VALUE);

  const [currentImageUri, setCurrentImageUri] = useState('');
  const [imageWidth, setImageWidth] = useState(1000);
  const [imageHeight, setImageHeight] = useState(1000);
  const [loadingImage, setLoadingImage] = useState(false);
  const [loadingMapData, setLoadingMapData] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);

  const sectorOptions = useMemo(
    () =>
      sectors.map((sector) => ({
        value: String(getEntityId(sector)),
        label: sector.sector_name || `Sector ${sector.id}`,
      })),
    [sectors],
  );

  const blockOptions = useMemo(
    () =>
      blocks.map((block) => ({
        value: String(getEntityId(block)),
        label: block.block_name || `Block ${block.id}`,
      })),
    [blocks],
  );

  const pocketOptions = useMemo(
    () =>
      pockets.map((pocket) => ({
        value: String(getEntityId(pocket)),
        label: pocket.pocket_name || `Pocket ${pocket.id}`,
      })),
    [pockets],
  );

  const plotOptions = useMemo(
    () =>
      plots
        .map((plot) => {
          const ref = getPlotRef(plot);
          if (!ref) {
            return null;
          }
          return {
            value: String(ref),
            label: getPlotLabel(plot),
          };
        })
        .filter(Boolean),
    [plots],
  );
  
const plotGeometryPaths = useMemo(() => {

  const filteredPlots = selectedType
    ? plots.filter((p) => p.property_type === selectedType)
    : plots;

  return filteredPlots
    .map((plot) => {
      const plotRef = getPlotRef(plot);
      const rings = parseGeometryToRings(plot?.geometry);

      if (!plotRef || rings.length === 0) {
        return null;
      }

    const center = getPolygonCenter(rings[0]);

return {
  id: String(plot?.id ?? plotRef),
  plotRef: String(plotRef),
  propertyType: plot.property_type,
  center,
  paths: rings.map(ringToPathD).filter(Boolean),
};
    })
    .filter(Boolean);

}, [plots, selectedType]);

  const updateCurrentMapImage = (imagePath, widthValue, heightValue) => {
    const nextImageUri = toAbsoluteImageUrl(imagePath);
    setCurrentImageUri(nextImageUri);
    setImageWidth(Number(widthValue) || 1000);
    setImageHeight(Number(heightValue) || 1000);
  };

  const loadSectors = async () => {
    try {
      setLoadingMapData(true);
      const response = await getSectors();
      const sectorList = Array.isArray(response?.data) ? response.data : [];
      console.log('[PropertyMap] sectors loaded:', sectorList.length, sectorList);
      setSectors(sectorList);
      if (sectorList.length > 0) {
        const firstSector = sectorList[0];
        const firstSectorId = getEntityId(firstSector);
        console.log('[PropertyMap] auto select sector:', firstSectorId);
        setSelectedSectorId(String(firstSectorId));
        updateCurrentMapImage(firstSector.sector_image, firstSector.image_width, firstSector.image_height);
        await loadBlocks(firstSectorId);
      }
    } catch (error) {
      console.log('[PropertyMap] sectors load error:', error?.response?.status, error?.response?.data || error?.message);
      Alert.alert('Error', error?.response?.data?.message || 'Unable to load sectors');
    } finally {
      setLoadingMapData(false);
    }
  };

  const loadBlocks = async (sectorId) => {
    try {
      console.log('[PropertyMap] loading blocks for sector:', sectorId);
      const response = await getBlocksBySector(sectorId);
      const blockList = Array.isArray(response?.data) ? response.data : [];
      console.log('[PropertyMap] blocks loaded:', blockList.length, blockList);
      setBlocks(blockList);
      setSelectedBlockId(UNSELECTED_VALUE);
      setPockets([]);
      setPlots([]);
      setSelectedPocketId(UNSELECTED_VALUE);
      setSelectedPlotRef(UNSELECTED_VALUE);
      if (typeof onStatsChange === 'function') {
        console.log('[PropertyMap] reset totalPlots -> 0 (after sector change)');
        onStatsChange({ totalPlots: 0 });
      }
    } catch (error) {
      console.log('[PropertyMap] blocks load error:', error?.response?.status, error?.response?.data || error?.message);
      Alert.alert('Error', error?.response?.data?.message || 'Unable to load blocks');
    }
  };

  const loadPockets = async (blockId) => {
    try {
      console.log('[PropertyMap] loading pockets for block:', blockId);
      const response = await getPocketsByBlock(blockId);
      const pocketList = Array.isArray(response?.data) ? response.data : [];
      console.log('[PropertyMap] pockets loaded:', pocketList.length, pocketList);
      setPockets(pocketList);
      setPlots([]);
      setSelectedPocketId(UNSELECTED_VALUE);
      setSelectedPlotRef(UNSELECTED_VALUE);
      if (typeof onStatsChange === 'function') {
        console.log('[PropertyMap] reset totalPlots -> 0 (after block change)');
        onStatsChange({ totalPlots: 0 });
      }
    } catch (error) {
      console.log('[PropertyMap] pockets load error:', error?.response?.status, error?.response?.data || error?.message);
      Alert.alert('Error', error?.response?.data?.message || 'Unable to load pockets');
    }
  };

  const loadPlots = async (pocketOrPocketId) => {
    try {
      const resolvedPocketId =
        typeof pocketOrPocketId === 'object' ? getEntityId(pocketOrPocketId) : pocketOrPocketId;
      console.log('[PropertyMap] loading plots for pocket:', resolvedPocketId);
      if (!resolvedPocketId) {
        console.log('[PropertyMap] skip loadPlots: pocket id missing', pocketOrPocketId);
        setPlots([]);
        if (typeof onStatsChange === 'function') {
          onStatsChange({ totalPlots: 0 });
        }
        return;
      }
      const response = await getPlotsByPocket(resolvedPocketId);
      const plotList = Array.isArray(response?.data)
  ? response.data.map((plot) => {
      let geometry = plot.geometry;

      if (typeof geometry === "string") {
        try {
          geometry = JSON.parse(geometry);
        } catch (e) {
          geometry = [];
        }
      }

      return {
        ...plot,
        geometry,
      };
    })
  : [];
      console.log('[PropertyMap] plots loaded:', plotList.length, plotList);
      setPlots(plotList);

// Calculate stats
const builderFloors = plotList.filter(
  (p) => p.property_type === "builder_floor"
).length;

const kothis = plotList.filter(
  (p) => p.property_type === "kothi"
).length;

const plotsOnly = plotList.filter(
  (p) => p.property_type === "plot"
).length;

const totalPlots = plotsOnly; // Only plots

if (typeof onStatsChange === 'function') {
  onStatsChange({
    totalPlots,
    builderFloors,
    kothis,
    plotsOnly,
  });
}
    } catch (error) {
      console.log('[PropertyMap] plots load error:', error?.response?.status, error?.response?.data || error?.message);
      Alert.alert('Error', error?.response?.data?.message || 'Unable to load plots');
    }
  };

  useEffect(() => {
    loadSectors();
  }, []);

  const handleSelectSector = async (sectorId) => {
    console.log('[PropertyMap] sector selected:', sectorId);
    setSelectedSectorId(String(sectorId));
    const selectedSector = sectors.find((sector) => String(getEntityId(sector)) === String(sectorId));
    if (selectedSector) {
      updateCurrentMapImage(
        selectedSector.sector_image,
        selectedSector.image_width,
        selectedSector.image_height,
      );
    }
    await loadBlocks(sectorId);
  };

  const handleSelectBlock = async (blockId) => {
    console.log('[PropertyMap] block selected:', blockId);
    setSelectedBlockId(String(blockId));
    await loadPockets(blockId);
  };

  const handleSelectPocket = async (pocketId) => {
    console.log('[PropertyMap] pocket selected:', pocketId);
    setSelectedPocketId(String(pocketId));
    const selectedPocket = pockets.find((pocket) => String(getEntityId(pocket)) === String(pocketId));
    console.log('[PropertyMap] pocket resolved:', selectedPocket);
    if (selectedPocket) {
      updateCurrentMapImage(
        selectedPocket.map_image,
        selectedPocket.image_width,
        selectedPocket.image_height,
      );
      await loadPlots(selectedPocket);
    } else {
      console.log('[PropertyMap] pocket not found in state, fallback load with selected id');
      await loadPlots(pocketId);
    }
  };

  const handleSelectPlot = async (plotRef) => {
    setSelectedPlotRef(String(plotRef));
    const selectedPlot = plots.find((plot) => String(getPlotRef(plot)) === String(plotRef));
    const selectedSector = sectors.find(
      (sector) => String(getEntityId(sector)) === String(selectedSectorId),
    );
    const selectedPocket = pockets.find(
      (pocket) => String(getEntityId(pocket)) === String(selectedPocketId),
    );

    const fallbackDetails = {
      ...selectedPlot,
      plot_ref: plotRef,
      property_type: selectedPlot?.property_type,
      title: selectedPlot?.title || `Plot ${plotRef}`,
      plotId:
        selectedPlot?.plot_id ||
        selectedPlot?.plot_number ||
        selectedPlot?.plot_no ||
        selectedPlot?.id ||
        String(plotRef),
      description: selectedPlot?.description || 'Plot details loaded from map selection.',
      sector_name: selectedSector?.sector_name || selectedPlot?.sector_name || selectedPlot?.sector,
      pocket_name: selectedPocket?.pocket_name || selectedPlot?.pocket_name || selectedPlot?.pocket,
      map_image: selectedPocket?.map_image || selectedSector?.sector_image || '',
    };

    try {
      const response = await getPlotDealersByPlotId(selectedPlot?.id);
      const dealerListings = Array.isArray(response?.data) ? response.data : [];
      navigation.navigate('PlotDealers', {
        mapName: 'Dynamic API Map',
        plotDetails: fallbackDetails,
        dealerListings,
      });
    } catch (error) {
      navigation.navigate('PlotDealers', {
        mapName: 'Dynamic API Map',
        plotDetails: fallbackDetails,
        dealerListings: [],
      });
      Alert.alert(
        'Info',
        error?.response?.data?.message || 'Showing temporary details as full details are unavailable.',
      );
    }
  };

  const renderMapContent = () => {
    if (loadingMapData) {
      return (
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color="#1D74E9" />
        </View>
      );
    }

    if (!currentImageUri) {
      return (
        <View style={styles.loaderWrap}>
          <Text style={styles.emptyText}>Select sector/block/pocket to view layout map.</Text>
        </View>
      );
    }

    const finalImageWidth = mapViewport.width || screenWidth;
    const finalImageHeight = (imageHeight / imageWidth) * finalImageWidth;

    return (
      <View style={styles.imageWrap}>
        <ImageZoom
  cropWidth={mapViewport.width || screenWidth}
  cropHeight={mapViewport.height || screenHeight}
  imageWidth={finalImageWidth}
  imageHeight={finalImageHeight}
  minScale={1}
  maxScale={10}
  pinchToZoom
  panToMove
  enableDoubleClickZoom
  enableCenterFocus={false}
  onMove={(position) => {
    if (position?.scale) {
      setZoomScale(position.scale);
    }
  }}
>
          <View style={{ width: finalImageWidth, height: finalImageHeight }}>
            <Image
              source={{ uri: currentImageUri }}
              style={{ width: finalImageWidth, height: finalImageHeight }}
              resizeMode="contain"
              onLoadStart={() => setLoadingImage(true)}
              onLoadEnd={() => setLoadingImage(false)}
              onError={() => setLoadingImage(false)}
            />
           {!isGuest && plotGeometryPaths.length > 0 ? (
               <>
              <Svg
                width={finalImageWidth}
                height={finalImageHeight}
                viewBox={`0 0 ${imageWidth} ${imageHeight}`}
                preserveAspectRatio="none"
                style={StyleSheet.absoluteFill}
              >
                {plotGeometryPaths.flatMap((plotShape) =>
                  plotShape.paths.map((pathD, pathIndex) => {
                    const isSelected = selectedPlotRef && String(selectedPlotRef) === plotShape.plotRef;
                    return (
                      <Path
                        key={`${plotShape.id}-${pathIndex}`}
                        d={pathD}
fill={
  selectedType
    ? "rgba(255,0,0,0.45)"
    : isSelected
    ? "rgba(255,77,77,0.35)"
    : "rgba(42,120,255,0.16)"
}

stroke={
  selectedType
    ? "red"
    : isSelected
    ? "rgba(255,0,0,0.95)"
    : "rgba(26,88,204,0.8)"
}
                        strokeWidth={isSelected ? 4 : 2}
                        onPress={() => handleSelectPlot(plotShape.plotRef)}
                      />
                    );
                  }),
                )}

              </Svg>

{/* MARKERS */}
{!isGuest && plotGeometryPaths.map((plotShape) => {

  if (!plotShape.center) return null;

  const [cx, cy] = plotShape.center;

  let pinImage = plotPin;
  let color = "#9333EA";

  if (plotShape.propertyType === "builder_floor") {
    pinImage = builderPin;
    color = "#2563EB";
  }

  if (plotShape.propertyType === "kothi") {
    pinImage = kothiPin;
    color = "#F97316";
  }

  let markerSize = 20;
  let showPin = true;

  if (zoomScale > 2 && zoomScale <= 4) {
    markerSize = 11;
    showPin = true;
  }

  if (zoomScale > 4) {
    markerSize = 3.5;
    showPin = false;
  }

  return (
    <TouchableOpacity
      key={`marker-${plotShape.id}`}
      onPress={() => {
  if (!isGuest) {
    handleSelectPlot(plotShape.plotRef);
  }
}}
     style={{
  position: "absolute",
  left: (cx / imageWidth) * finalImageWidth - markerSize / 2,
  top: showPin
    ? (cy / imageHeight) * finalImageHeight - markerSize
    : (cy / imageHeight) * finalImageHeight - markerSize / 2,
}}
    >

      {showPin ? (
        <Image
          source={pinImage}
          style={{
            width: markerSize,
            height: markerSize,
            resizeMode: "contain"
          }}
        />
      ) : (
        <View
          style={{
            width: markerSize,
            height: markerSize,
            borderRadius: markerSize / 2,
            backgroundColor: color,
            borderWidth: 0.65,
            borderColor: "#fff"
          }}
        />
      )}

    </TouchableOpacity>
  );

})}
</>
            ) : null}
          </View>
        </ImageZoom>
        {loadingImage ? (
          <View style={styles.imageLoaderOverlay}>
            <ActivityIndicator size="large" color="#1D74E9" />
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.filterCard}>
        <View style={styles.filterRow}>
          <DropdownField
            label="Sector"
            placeholder="Select sector"
            value={selectedSectorId}
            options={sectorOptions}
            onSelect={handleSelectSector}
            disabled={sectorOptions.length === 0}
          />
          <DropdownField
            label="Block"
            placeholder="Select block"
            value={selectedBlockId}
            options={blockOptions}
            onSelect={handleSelectBlock}
            disabled={!selectedSectorId || blockOptions.length === 0}
          />
          <DropdownField
            label="Pocket"
            placeholder="Select pocket"
            value={selectedPocketId}
            options={pocketOptions}
            onSelect={handleSelectPocket}
            disabled={!selectedBlockId || pocketOptions.length === 0}
          />
        </View>
        {/* <View style={styles.plotRow}>
          <DropdownField
            label="Plot"
            placeholder="Select plot"
            value={selectedPlotRef}
            options={plotOptions}
            onSelect={handleSelectPlot}
            disabled={!selectedPocketId || plotOptions.length === 0}
          />
        </View> */}
      </View>

      <View style={styles.mapSurface}>
        <View
          style={styles.mapArea}
          onLayout={(event) => {
            const { width, height } = event.nativeEvent.layout;
            if (width !== mapViewport.width || height !== mapViewport.height) {
              setMapViewport({ width, height });
            }
          }}
        >
          {renderMapContent()}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F8FC',
  },
  filterCard: {
    borderRadius: 18,
    padding: 10,
    marginTop: 8,
    marginHorizontal: 12,
    backgroundColor: '#F2F8FC',
    borderWidth: 1,
    borderColor: '#D2E2EE',
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  plotRow: {
    marginTop: 6,
    marginHorizontal: 3,
  },
  filterField: {
    flex: 1,
    marginHorizontal: 3,
  },
  filterLabel: {
    fontSize: 11,
    color: '#333333',
    marginBottom: 4,
    fontWeight: '600',
  },
  dropdownButton: {
    borderWidth: 1,
    borderColor: '#C7D8E7',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#F8FCFF',
  },
  dropdownButtonDisabled: {
    backgroundColor: '#E8F1F8',
  },
  dropdownButtonText: {
    fontSize: 13,
    color: '#111111',
  },
  dropdownPlaceholder: {
    color: '#777777',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.22)',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    maxHeight: 280,
    overflow: 'hidden',
  },
  modalItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  modalItemText: {
    fontSize: 15,
    color: '#111111',
  },
  mapSurface: {
    flex: 1,
    marginTop: 10,
    marginHorizontal: 12,
    marginBottom: 12,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#D2E2EE',
    backgroundColor: '#F2F8FC',
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  mapArea: {
    flex: 1,
  },
  imageWrap: {
    flex: 1,
  },
  loaderWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  imageLoaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  emptyText: {
    color: '#4B6073',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
