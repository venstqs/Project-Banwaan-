"use client";

import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import {
  Layers,
  Eye,
  EyeOff,
  Compass,
  Mountain,
  Waves,
  ZoomIn,
  ZoomOut,
  Table,
  Crosshair,
  Sliders,
  Search,
  Globe,
  Globe2,
  Maximize2,
  Minimize2,
  Box,
  Hexagon,
  Building2,
  Store,
  Landmark,
  Hospital,
  Sparkles,
  ShieldAlert,
  Flame,
  Droplets,
  Activity,
  Check,
  Tag,
  ChevronDown,
  ChevronUp
} from "lucide-react";

import geospatialData from "../data/naga_geospatial.json";

export interface SyncedFieldReport {
  id: string;
  barangay_id: number;
  barangay_name: string;
  report_type: string;
  description: string;
  latitude: number;
  longitude: number;
  offline_created_at: string;
  reporter_role?: string;
}

export type SpatialRenderMode = "hybrid_spatial" | "prism_choropleth" | "flat_geojson";

// Official 27 Barangays Colors extracted directly from City of Naga Administrative Map (Image 2)
export const NAGA_ADMIN_COLORS: Record<number, { name: string; hex: string; category: string }> = {
  1:  { name: "Abella",            hex: "#72b0a8", category: "poblacion" }, // soft teal
  2:  { name: "Bagumbayan Norte",  hex: "#4a4e82", category: "poblacion" }, // dark slate purple
  3:  { name: "Bagumbayan Sur",    hex: "#c97793", category: "poblacion" }, // dusty rose
  4:  { name: "Balatas",           hex: "#c4cf7e", category: "growth" },    // light olive / yellow-green
  5:  { name: "Calauag",           hex: "#24a549", category: "riverine" },  // emerald green
  6:  { name: "Cararayan",         hex: "#843b8c", category: "upland" },    // rich purple
  7:  { name: "Carolina",          hex: "#8682b9", category: "upland" },    // periwinkle lavender
  8:  { name: "Concepcion Grande", hex: "#43b593", category: "growth" },    // sea green
  9:  { name: "Concepcion Pequeña",hex: "#a19c43", category: "growth" },    // olive green
  10: { name: "Dayangdang",        hex: "#9e8e76", category: "poblacion" }, // khaki / warm tan
  11: { name: "Del Rosario",       hex: "#b3779e", category: "growth" },    // mauve orchid
  12: { name: "Dinaga",            hex: "#5299b8", category: "cbd" },       // sky blue
  13: { name: "Igualdad Interior", hex: "#43b087", category: "cbd" },       // mint teal
  14: { name: "Lerma",             hex: "#7b8c5e", category: "poblacion" }, // sage green
  15: { name: "Liboton",           hex: "#857f88", category: "poblacion" }, // slate gray
  16: { name: "Mabolo",            hex: "#4f78aa", category: "riverine" },  // steel blue
  17: { name: "Pacol",             hex: "#99497e", category: "upland" },    // magenta purple
  18: { name: "Panicuason",        hex: "#a99438", category: "upland" },    // mustard gold (Isarog)
  19: { name: "Peñafrancia",       hex: "#b8865d", category: "poblacion" }, // terracotta tan
  20: { name: "Sabang",            hex: "#a88bc4", category: "riverine" },  // lilac lavender
  21: { name: "San Felipe",        hex: "#7860aa", category: "riverine" },  // indigo purple
  22: { name: "San Francisco",     hex: "#a8453a", category: "cbd" },       // crimson brick red
  23: { name: "San Isidro",        hex: "#80b741", category: "upland" },    // bright apple lime green
  24: { name: "Santa Cruz",        hex: "#3ea6b0", category: "cbd" },       // bright teal
  25: { name: "Tabuco",            hex: "#546c94", category: "cbd" },       // slate denim blue
  26: { name: "Tinago",            hex: "#356598", category: "poblacion" }, // deep ocean blue
  27: { name: "Triangulo",         hex: "#c9af88", category: "cbd" }        // sand tan / beige
};

export const NAGA_BARANGAY_NAMES: Record<number, string> = {
  1: "Abella",
  2: "Bagumbayan Norte",
  3: "Bagumbayan Sur",
  4: "Balatas",
  5: "Calauag",
  6: "Cararayan",
  7: "Carolina",
  8: "Concepcion Grande",
  9: "Concepcion Pequeña",
  10: "Dayangdang",
  11: "Del Rosario",
  12: "Dinaga",
  13: "Igualdad Interior",
  14: "Lerma",
  15: "Liboton",
  16: "Mabolo",
  17: "Pacol",
  18: "Panicuason",
  19: "Peñafrancia",
  20: "Sabang",
  21: "San Felipe",
  22: "San Francisco",
  23: "San Isidro",
  24: "Santa Cruz",
  25: "Tabuco",
  26: "Tinago",
  27: "Triangulo"
};

export const CATEGORIES = [
  { id: "all", name: "All 27 Barangays", short: "All 27 Brgys", count: 27, color: "#05389f", icon: Globe, description: "All 27 Naga City Administrative Barangays" },
  { id: "upland", name: "Upland Watershed & Agro-Forestry", short: "Upland Watershed", count: 5, color: "#b59410", icon: Mountain, description: "Mt. Isarog slope, watershed recharge, hot springs eco-tourism & agro-forestry" },
  { id: "cbd", name: "Central Business District (CBD Core)", short: "CBD Commercial", count: 6, color: "#05389f", icon: Store, description: "CBD I, CBD II, SM City, Bicol Central Bus Terminal & Plaza Rizal/Quezon core" },
  { id: "poblacion", name: "Poblacion Urban & Heritage Core", short: "Poblacion Heritage", count: 8, color: "#7c3aed", icon: Landmark, description: "Dense historic poblacion, Peñafrancia pilgrimage shrine & civic institutions" },
  { id: "growth", name: "Suburban Growth & Institutional Corridor", short: "Growth Corridor", count: 4, color: "#0284c7", icon: Hospital, description: "Maharlika Highway southern spine, Bicol Medical Center & emerging commercial belt" },
  { id: "riverine", name: "Riverine & High Flood-Hazard Delta", short: "Riverine Flood Delta", count: 4, color: "#ea580c", icon: Waves, description: "Bicol River basin, critical river surge hazard & low-lying drainage catchment" }
];

export const BARANGAY_CATEGORY_LOOKUP: Record<number, { id: string; name: string; short: string; color: string; icon: string }> = {
  18: { id: "upland", name: "Upland Watershed & Agro-Forestry", short: "Upland Watershed", color: "#b59410", icon: "⛰️" },
  7:  { id: "upland", name: "Upland Watershed & Agro-Forestry", short: "Upland Watershed", color: "#b59410", icon: "⛰️" },
  17: { id: "upland", name: "Upland Watershed & Agro-Forestry", short: "Upland Watershed", color: "#b59410", icon: "⛰️" },
  6:  { id: "upland", name: "Upland Watershed & Agro-Forestry", short: "Upland Watershed", color: "#b59410", icon: "⛰️" },
  23: { id: "upland", name: "Upland Watershed & Agro-Forestry", short: "Upland Watershed", color: "#b59410", icon: "⛰️" },

  27: { id: "cbd", name: "Central Business District (CBD Core)", short: "CBD Commercial", color: "#05389f", icon: "🏢" },
  25: { id: "cbd", name: "Central Business District (CBD Core)", short: "CBD Commercial", color: "#05389f", icon: "🏢" },
  22: { id: "cbd", name: "Central Business District (CBD Core)", short: "CBD Commercial", color: "#05389f", icon: "🏢" },
  12: { id: "cbd", name: "Central Business District (CBD Core)", short: "CBD Commercial", color: "#05389f", icon: "🏢" },
  24: { id: "cbd", name: "Central Business District (CBD Core)", short: "CBD Commercial", color: "#05389f", icon: "🏢" },
  13: { id: "cbd", name: "Central Business District (CBD Core)", short: "CBD Commercial", color: "#05389f", icon: "🏢" },

  9:  { id: "growth", name: "Suburban Growth Corridor", short: "Growth Corridor", color: "#0284c7", icon: "🏥" },
  8:  { id: "growth", name: "Suburban Growth Corridor", short: "Growth Corridor", color: "#0284c7", icon: "🏥" },
  11: { id: "growth", name: "Suburban Growth Corridor", short: "Growth Corridor", color: "#0284c7", icon: "🏥" },
  4:  { id: "growth", name: "Suburban Growth Corridor", short: "Growth Corridor", color: "#0284c7", icon: "🏥" },

  1:  { id: "poblacion", name: "Poblacion Urban Core", short: "Poblacion Heritage", color: "#7c3aed", icon: "🏛️" },
  26: { id: "poblacion", name: "Poblacion Urban Core", short: "Poblacion Heritage", color: "#7c3aed", icon: "🏛️" },
  14: { id: "poblacion", name: "Poblacion Urban Core", short: "Poblacion Heritage", color: "#7c3aed", icon: "🏛️" },
  15: { id: "poblacion", name: "Poblacion Urban Core", short: "Poblacion Heritage", color: "#7c3aed", icon: "🏛️" },
  10: { id: "poblacion", name: "Poblacion Urban Core", short: "Poblacion Heritage", color: "#7c3aed", icon: "🏛️" },
  19: { id: "poblacion", name: "Poblacion Urban Core", short: "Poblacion Heritage", color: "#7c3aed", icon: "🏛️" },
  2:  { id: "poblacion", name: "Poblacion Urban Core", short: "Poblacion Heritage", color: "#7c3aed", icon: "🏛️" },
  3:  { id: "poblacion", name: "Poblacion Urban Core", short: "Poblacion Heritage", color: "#7c3aed", icon: "🏛️" },

  16: { id: "riverine", name: "Riverine & Flood Delta", short: "Riverine Flood Delta", color: "#ea580c", icon: "🌊" },
  20: { id: "riverine", name: "Riverine & Flood Delta", short: "Riverine Flood Delta", color: "#ea580c", icon: "🌊" },
  5:  { id: "riverine", name: "Riverine & Flood Delta", short: "Riverine Flood Delta", color: "#ea580c", icon: "🌊" },
  21: { id: "riverine", name: "Riverine & Flood Delta", short: "Riverine Flood Delta", color: "#ea580c", icon: "🌊" }
};

// Subtle spatial offsets for dense downtown cluster to prevent label collision
const DOWNTOWN_LABEL_OFFSETS: Record<number, [number, number]> = {
  1:  [0, 0.0007],     // Abella (north)
  22: [0.0006, 0.0001], // San Francisco (east)
  13: [-0.0006, -0.0004], // Igualdad (southwest)
  12: [0.0006, -0.0005],  // Dinaga (southeast)
  26: [0.0007, 0.0004],   // Tinago (northeast)
  14: [-0.0006, 0.0004],  // Lerma (northwest)
  24: [-0.0005, 0.0006],  // Santa Cruz (northwest)
  20: [-0.0008, -0.0005], // Sabang (southwest)
  10: [0.0007, -0.0001],  // Dayangdang (east)
  3:  [0, -0.0006],    // Bagumbayan Sur (south)
  2:  [0, 0.0007],     // Bagumbayan Norte (north)
};

interface CesiumViewerProps {
  selectedBarangayId: number;
  onSelectBarangay: (id: number) => void;
  activeRole: string;
  calamitySimActive?: boolean;
  fieldReports?: SyncedFieldReport[];
  spatialMode?: SpatialRenderMode;
  onSpatialModeChange?: (mode: SpatialRenderMode) => void;
  selectedCategoryFilter?: string;
  onSelectCategory?: (category: string) => void;
}

export type ChoroplethMode =
  | "admin_colors"
  | "category_zones"
  | "vulnerability"
  | "wash_vector"
  | "sanitation"
  | "roof_frailty"
  | "food_insecurity"
  | "unbanked";

declare global {
  interface Window {
    Cesium: any;
    CESIUM_BASE_URL: string;
  }
}

export default function CesiumViewer({
  selectedBarangayId,
  onSelectBarangay,
  activeRole,
  calamitySimActive = false,
  fieldReports = [],
  selectedCategoryFilter = "all",
  onSelectCategory
}: CesiumViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<any>(null);
  const prevSelectedIdRef = useRef<number>(selectedBarangayId);
  const prevCategoryFilterRef = useRef<string>(selectedCategoryFilter);

  const [isCesiumLoaded, setIsCesiumLoaded] = useState<boolean>(false);
  const [choroplethMode, setChoroplethMode] = useState<ChoroplethMode>("vulnerability");
  const [polygonOpacity] = useState<number>(0.72);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Administrative Map Legend & Floating Panels Minimize State
  const [showAdminLegend, setShowAdminLegend] = useState<boolean>(false);
  const [isTelemetryMinimized, setIsTelemetryMinimized] = useState<boolean>(false);
  const [isLayersMinimized, setIsLayersMinimized] = useState<boolean>(true);
  const [isCameraControlsMinimized, setIsCameraControlsMinimized] = useState<boolean>(false);

  // 2D GeoJSON Layer Toggles (Defaulting to clean 2D Administrative Map on Esri World Imagery)
  const [showBarangayZones, setShowBarangayZones] = useState<boolean>(true);
  const [showBarangayLabels, setShowBarangayLabels] = useState<boolean>(true);
  const [showHexHotspots, setShowHexHotspots] = useState<boolean>(false);
  const [show3DBuildings, setShow3DBuildings] = useState<boolean>(false);
  const [showFloodHazard, setShowFloodHazard] = useState<boolean>(false);
  const [showRiverAndRoads, setShowRiverAndRoads] = useState<boolean>(false);
  const [showFacilities, setShowFacilities] = useState<boolean>(false);

  const [hoveredInfo, setHoveredInfo] = useState<{
    barangayId: number;
    title: string;
    subtitle: string;
  } | null>(null);

  const [cursorCoords, setCursorCoords] = useState<{ lng: number; lat: number; alt: number }>({
    lng: 123.1948,
    lat: 13.6218,
    alt: 11500
  });

  const barangays = geospatialData.barangays_geojson.features;
  const buildings = (geospatialData as any).buildings_geojson?.features || [];
  const hexClusters = (geospatialData as any).spatial_hex_clusters_geojson?.features || [];
  const facilities = geospatialData.facilities;
  const riverPath = (geospatialData as any).naga_river_path || [];
  const roadNetwork = (geospatialData as any).road_network || [];
  const floodPolygon = geospatialData.flood_hazard_zone.geometry.coordinates[0];

  const selectedFeature = useMemo(() => {
    return barangays.find((f: any) => f.properties.id === selectedBarangayId) || barangays[0];
  }, [barangays, selectedBarangayId]);

  const hoveredFeature = useMemo(() => {
    const targetId = hoveredInfo?.barangayId || selectedBarangayId;
    return barangays.find((f: any) => f.properties.id === targetId) || selectedFeature;
  }, [barangays, hoveredInfo, selectedBarangayId, selectedFeature]);

  // Load CesiumJS WebGL Engine from official distribution
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.Cesium) {
      setIsCesiumLoaded(true);
      return;
    }

    const CESIUM_VERSION = "1.122";
    const BASE_URL = `https://cesium.com/downloads/cesiumjs/releases/${CESIUM_VERSION}/Build/Cesium/`;
    window.CESIUM_BASE_URL = BASE_URL;

    if (!document.getElementById("cesium-widgets-css")) {
      const link = document.createElement("link");
      link.id = "cesium-widgets-css";
      link.rel = "stylesheet";
      link.href = `${BASE_URL}Widgets/widgets.css`;
      document.head.appendChild(link);
    }

    const existingScript = document.getElementById("cesium-webgl-script") as HTMLScriptElement | null;
    if (existingScript) {
      existingScript.addEventListener("load", () => setIsCesiumLoaded(true));
      return;
    }

    const script = document.createElement("script");
    script.id = "cesium-webgl-script";
    script.src = `${BASE_URL}Cesium.js`;
    script.async = true;
    script.onload = () => setIsCesiumLoaded(true);
    document.body.appendChild(script);
  }, []);

  // Initialize Cesium.Viewer in strict 2D Mode with ONLY Esri World Imagery Satellite
  useEffect(() => {
    if (!isCesiumLoaded || !containerRef.current || viewerRef.current) return;
    const Cesium = window.Cesium;
    if (!Cesium) return;

    const esriWorldImageryProvider = new Cesium.UrlTemplateImageryProvider({
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      maximumLevel: 19
    });

    const viewer = new Cesium.Viewer(containerRef.current, {
      sceneMode: Cesium.SceneMode.SCENE3D,
      baseLayer: new Cesium.ImageryLayer(esriWorldImageryProvider),
      baseLayerPicker: false,
      geocoder: false,
      homeButton: false,
      sceneModePicker: false,
      navigationHelpButton: false,
      animation: false,
      timeline: false,
      fullscreenButton: false,
      infoBox: false,
      selectionIndicator: false,
      shouldAnimate: false,
      requestRenderMode: true,
      maximumRenderTimeChange: Infinity
    });

    if (viewer.cesiumWidget?.creditContainer) {
      (viewer.cesiumWidget.creditContainer as HTMLElement).style.display = "none";
    }
    viewer.resolutionScale = 1.0;
    if (viewer.scene?.postProcessStages?.fxaa) {
      viewer.scene.postProcessStages.fxaa.enabled = false;
    }
    viewer.scene.globe.depthTestAgainstTerrain = false;
    viewer.scene.globe.maximumScreenSpaceError = 2;

    // Enable camera controls for 3D navigation, tilt, and perspective panning
    viewer.scene.screenSpaceCameraController.enableRotate = true;
    viewer.scene.screenSpaceCameraController.enableTilt = true;
    viewer.scene.screenSpaceCameraController.enableLook = true;

    // Initial Map View covering all 27 Naga City Barangays
    viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(123.218, 13.628, 13500)
    });

    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

    handler.setInputAction((movement: any) => {
      const pickedObject = viewer.scene.pick(movement.position);
      if (Cesium.defined(pickedObject) && pickedObject.id && pickedObject.id.barangayId) {
        onSelectBarangay(pickedObject.id.barangayId);
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    handler.setInputAction((movement: any) => {
      const cartesian = viewer.camera.pickEllipsoid(movement.endPosition, viewer.scene.globe.ellipsoid);
      if (cartesian) {
        const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
        const lng = +Cesium.Math.toDegrees(cartographic.longitude).toFixed(4);
        const lat = +Cesium.Math.toDegrees(cartographic.latitude).toFixed(4);
        setCursorCoords({ lng, lat, alt: Math.round(viewer.camera.positionCartographic.height) });
      }

      const pickedObject = viewer.scene.pick(movement.endPosition);
      if (Cesium.defined(pickedObject) && pickedObject.id && pickedObject.id.barangayId) {
        setHoveredInfo({
          barangayId: pickedObject.id.barangayId,
          title: pickedObject.id.name || `Barangay #${pickedObject.id.barangayId}`,
          subtitle: pickedObject.id.featureSubtitle || "Administrative Barangay"
        });
        if (containerRef.current) containerRef.current.style.cursor = "pointer";
      } else {
        setHoveredInfo(null);
        if (containerRef.current) containerRef.current.style.cursor = "grab";
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    viewerRef.current = viewer;

    return () => {
      handler.destroy();
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, [isCesiumLoaded, onSelectBarangay]);

  // Unified 2D Camera Fly-To when Category Filter or selectedBarangayId changes
  useEffect(() => {
    const categoryChanged = prevCategoryFilterRef.current !== selectedCategoryFilter;
    const barangayChanged = prevSelectedIdRef.current !== selectedBarangayId;

    if (!categoryChanged && !barangayChanged) return;

    prevCategoryFilterRef.current = selectedCategoryFilter;
    prevSelectedIdRef.current = selectedBarangayId;

    const viewer = viewerRef.current;
    const Cesium = window.Cesium;
    if (!viewer || !Cesium) return;

    // If category filter was explicitly changed, pan/zoom in 2D to the category sector
    if (categoryChanged) {
      if (selectedCategoryFilter === "all") {
        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(123.218, 13.628, 13500),
          duration: 1.0
        });
      } else if (selectedCategoryFilter === "upland") {
        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(123.248, 13.642, 10500),
          duration: 1.0
        });
      } else if (selectedCategoryFilter === "cbd") {
        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(123.188, 13.620, 4200),
          duration: 1.0
        });
      } else if (selectedCategoryFilter === "poblacion") {
        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(123.190, 13.628, 5200),
          duration: 1.0
        });
      } else if (selectedCategoryFilter === "growth") {
        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(123.212, 13.622, 6800),
          duration: 1.0
        });
      } else if (selectedCategoryFilter === "riverine") {
        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(123.190, 13.620, 6200),
          duration: 1.0
        });
      }
      return;
    }

    // Otherwise pan/zoom directly over the selected barangay's true 2D interior centroid
    if (barangayChanged && selectedFeature) {
      const center = selectedFeature.properties.center;
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(center[0], center[1], 4500),
        duration: 0.9
      });
    }
  }, [selectedBarangayId, selectedCategoryFilter, selectedFeature]);

  // Render Pure 2D Spatial Entities on Esri World Imagery Satellite
  useEffect(() => {
    const viewer = viewerRef.current;
    const Cesium = window.Cesium;
    if (!viewer || !Cesium) return;

    viewer.entities.removeAll();

    // 1. 2D LAYER: Flood Hazard Inundation Basin (Flat 2D Polygon)
    if (showFloodHazard || calamitySimActive) {
      const flatCoords: number[] = [];
      floodPolygon.forEach((pt: number[]) => {
        flatCoords.push(pt[0], pt[1]);
      });

      const waterColor = calamitySimActive
        ? Cesium.Color.fromCssColorString("#ef4444").withAlpha(0.45)
        : Cesium.Color.fromCssColorString("#06b6d4").withAlpha(0.32);

      viewer.entities.add({
        name: "Naga-Bicol River Flood Inundation Zone",
        polygon: {
          hierarchy: Cesium.Cartesian3.fromDegreesArray(flatCoords),
          material: waterColor
        },
        polyline: {
          positions: Cesium.Cartesian3.fromDegreesArray(flatCoords),
          width: 2,
          material: calamitySimActive
            ? Cesium.Color.fromCssColorString("#fca5a5")
            : Cesium.Color.fromCssColorString("#22d3ee")
        }
      });
    }

    // 2. 2D LAYER: Naga River Hydrological Corridor & Arterial Roads
    if (showRiverAndRoads) {
      if (riverPath.length > 0) {
        const riverDegs: number[] = [];
        riverPath.forEach((c: number[]) => riverDegs.push(c[0], c[1]));
        viewer.entities.add({
          name: "Naga River Waterway",
          polyline: {
            positions: Cesium.Cartesian3.fromDegreesArray(riverDegs),
            width: calamitySimActive ? 8 : 4,
            material: calamitySimActive
              ? Cesium.Color.fromCssColorString("#f43f5e")
              : Cesium.Color.fromCssColorString("#38bdf8")
          }
        });
      }

      roadNetwork.forEach((road: any) => {
        const roadDegs: number[] = [];
        road.coordinates.forEach((c: number[]) => roadDegs.push(c[0], c[1]));
        viewer.entities.add({
          name: road.name,
          polyline: {
            positions: Cesium.Cartesian3.fromDegreesArray(roadDegs),
            width: road.type === "National Primary" ? 3.0 : 1.8,
            material: Cesium.Color.fromCssColorString(
              road.type === "National Primary" ? "#fccf17" : "#e2e8f0"
            ).withAlpha(0.75)
          }
        });
      });
    }

    // 3. 2D LAYER: 27 Naga City Barangays (Flat 2D Contiguous Polygons + Crisp Borders + Centroid Labels)
    if (showBarangayZones) {
      barangays.forEach((feat: any) => {
        const p = feat.properties;
        const adminData = NAGA_ADMIN_COLORS[p.id] || {
          name: p.real_name || p.name,
          hex: p.admin_color || "#05389f",
          category: p.category || "poblacion"
        };
        const realName = adminData.name;
        const adminColorHex = adminData.hex;

        const catMeta = BARANGAY_CATEGORY_LOOKUP[p.id] || {
          id: adminData.category,
          name: p.category_name || "Administrative Barangay",
          short: p.category_short || "Barangay",
          color: p.category_color || adminColorHex,
          icon: "🏛️"
        };

        const isSelected = p.id === selectedBarangayId;
        const isHovered = hoveredInfo?.barangayId === p.id;
        const matchesCategory =
          selectedCategoryFilter === "all" || catMeta.id === selectedCategoryFilter;

        const ring = feat.geometry.coordinates[0];
        const flatCoords: number[] = [];
        ring.forEach((c: number[]) => flatCoords.push(c[0], c[1]));

        // Determine 2D polygon fill color from active ChoroplethMode
        const mviVal = p.vulnerability_index || 50;
        const mviColorHex =
          mviVal >= 70
            ? "#ef4444" // Red: High risk level
            : mviVal >= 50
            ? "#facc15" // Yellow: Medium risk level
            : "#10b981"; // Green: Low risk level

        const activeFillHex =
          choroplethMode === "category_zones"
            ? catMeta.color
            : choroplethMode === "vulnerability"
            ? mviColorHex
            : adminColorHex;

        // Dim non-matching barangays when category filter is active
        const zoneAlpha = matchesCategory
          ? isSelected
            ? 0.78
            : polygonOpacity
          : 0.14;

        const outlineColor = isSelected
          ? "#fccf17"
          : isHovered
          ? "#ffffff"
          : matchesCategory
          ? "#ffffff"
          : "#64748b";

        const labelLng = p.center ? p.center[0] : 123.185;
        const labelLat = p.center ? p.center[1] : 13.621;

        const entityConfig: any = {
          name: realName,
          barangayId: p.id,
          featureSubtitle: `${catMeta.name} • ${p.households.toLocaleString()} Households`,
          position: Cesium.Cartesian3.fromDegrees(labelLng, labelLat),
          polygon: {
            hierarchy: Cesium.Cartesian3.fromDegreesArray(flatCoords),
            material: Cesium.Color.fromCssColorString(activeFillHex).withAlpha(zoneAlpha)
          },
          polyline: {
            positions: Cesium.Cartesian3.fromDegreesArray(flatCoords),
            width: isSelected ? 3.5 : matchesCategory ? 1.8 : 1.0,
            material: Cesium.Color.fromCssColorString(outlineColor).withAlpha(matchesCategory ? 0.95 : 0.35)
          }
        };

        // Clean, subtle cartographic label (pure FILL, no noisy outlines or heavy blocks)
        if (showBarangayLabels && matchesCategory) {
          const shortName =
            realName === "Bagumbayan Norte" ? "Bagumbayan N."
            : realName === "Bagumbayan Sur" ? "Bagumbayan S."
            : realName === "Concepcion Pequeña" ? "Concepcion Peq."
            : realName === "Concepcion Grande" ? "Concepcion Grd."
            : realName === "Igualdad Interior" ? "Igualdad"
            : realName === "Santa Cruz" ? "Sta. Cruz"
            : realName;

          entityConfig.label = {
            text: isSelected ? `★ ${realName.toUpperCase()}` : shortName,
            font: isSelected
              ? "bold 12px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
              : "600 11px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            style: Cesium.LabelStyle.FILL,
            fillColor: isSelected
              ? Cesium.Color.fromCssColorString("#fde047")
              : Cesium.Color.WHITE,
            showBackground: true,
            backgroundColor: isSelected
              ? Cesium.Color.fromCssColorString("rgba(5, 56, 159, 0.88)")
              : Cesium.Color.fromCssColorString("rgba(15, 23, 42, 0.58)"),
            backgroundPadding: new Cesium.Cartesian2(6, 3),
            verticalOrigin: Cesium.VerticalOrigin.CENTER,
            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
            scaleByDistance: new Cesium.NearFarScalar(3000, 1.0, 25000, 0.72),
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 42000)
          };
        }

        viewer.entities.add(entityConfig);
      });
    }

    // 4. 2D LAYER: 81 Purok Hex Cells (Flat 2D Hex Grid)
    if (showHexHotspots) {
      hexClusters.forEach((hexFeat: any) => {
        const hp = hexFeat.properties;
        const isSelected = hp.barangay_id === selectedBarangayId;
        const ring = hexFeat.geometry.coordinates[0];
        const flatCoords: number[] = [];
        ring.forEach((c: number[]) => flatCoords.push(c[0], c[1]));

        const hexMvi = hp.local_mvi ?? hp.vulnerability_index ?? 50;
        const hexColor = isSelected
          ? "#fccf17"
          : hexMvi >= 70
          ? "#f43f5e"
          : hexMvi >= 50
          ? "#f59e0b"
          : "#0284c7";

        viewer.entities.add({
          name: hp.zone_name,
          barangayId: hp.barangay_id,
          featureSubtitle: `Purok Hex • Local MVI ${hexMvi} • WASH Risk ${hp.wash_vector_risk}%`,
          polygon: {
            hierarchy: Cesium.Cartesian3.fromDegreesArray(flatCoords),
            material: Cesium.Color.fromCssColorString(hexColor).withAlpha(0.68)
          },
          polyline: {
            positions: Cesium.Cartesian3.fromDegreesArray(flatCoords),
            width: 1.2,
            material: Cesium.Color.WHITE.withAlpha(0.8)
          }
        });
      });
    }

    // 5. 2D LAYER: 162 Building Footprints (Flat 2D Footprints)
    if (show3DBuildings) {
      buildings.forEach((bFeat: any) => {
        const bp = bFeat.properties;
        const ring = bFeat.geometry.coordinates[0];
        const flatCoords: number[] = [];
        ring.forEach((c: number[]) => flatCoords.push(c[0], c[1]));

        viewer.entities.add({
          name: `${bp.building_type} (${bp.barangay_name})`,
          barangayId: bp.barangay_id,
          featureSubtitle: `Footprint • Risk: ${bp.structural_risk}`,
          polygon: {
            hierarchy: Cesium.Cartesian3.fromDegreesArray(flatCoords),
            material: Cesium.Color.fromCssColorString(
              bp.structural_risk === "Elevated" ? "#f43f5e" : "#94a3b8"
            ).withAlpha(0.75)
          }
        });
      });
    }

    // 6. 2D LAYER: Critical Facilities, Evacuation Shelters & Synced Mobile Field Reports
    if (showFacilities) {
      facilities.forEach((fac: any) => {
        const markerColor = fac.category.includes("Command")
          ? "#05389f"
          : fac.category.includes("Shelter")
          ? "#fccf17"
          : "#10b981";

        viewer.entities.add({
          name: fac.name,
          position: Cesium.Cartesian3.fromDegrees(fac.lng, fac.lat),
          point: {
            pixelSize: 9,
            color: Cesium.Color.fromCssColorString(markerColor),
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 2,
            disableDepthTestDistance: Number.POSITIVE_INFINITY
          },
          label: {
            text: fac.name.split(" (")[0],
            font: "bold 10px 'Plus Jakarta Sans', Arial, sans-serif",
            fillColor: Cesium.Color.fromCssColorString("#fccf17"),
            outlineColor: Cesium.Color.fromCssColorString("#0a1128"),
            outlineWidth: 3,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: new Cesium.Cartesian2(0, -10),
            disableDepthTestDistance: Number.POSITIVE_INFINITY
          }
        });
      });

      fieldReports.forEach((rpt) => {
        viewer.entities.add({
          name: `${rpt.report_type} (${rpt.barangay_name})`,
          barangayId: rpt.barangay_id,
          featureSubtitle: `${rpt.reporter_role || "Field Unit"} • ${rpt.offline_created_at}`,
          position: Cesium.Cartesian3.fromDegrees(rpt.longitude, rpt.latitude),
          point: {
            pixelSize: 10,
            color: Cesium.Color.fromCssColorString("#ec4899"),
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 2,
            disableDepthTestDistance: Number.POSITIVE_INFINITY
          }
        });
      });
    }

    viewer.scene.requestRender();
  }, [
    isCesiumLoaded,
    barangays,
    buildings,
    hexClusters,
    facilities,
    riverPath,
    roadNetwork,
    floodPolygon,
    selectedBarangayId,
    selectedCategoryFilter,
    choroplethMode,
    polygonOpacity,
    showBarangayZones,
    showBarangayLabels,
    showHexHotspots,
    show3DBuildings,
    showFloodHazard,
    showRiverAndRoads,
    showFacilities,
    calamitySimActive,
    fieldReports
  ]);

  const flyToPreset = (preset: "overview" | "river" | "isarog" | "selected") => {
    const viewer = viewerRef.current;
    const Cesium = window.Cesium;
    if (!viewer || !Cesium) return;

    if (preset === "overview") {
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(123.218, 13.628, 13500),
        duration: 1.0
      });
    } else if (preset === "river") {
      onSelectBarangay(16);
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(123.180, 13.619, 4500),
        duration: 1.0
      });
    } else if (preset === "isarog") {
      onSelectBarangay(18);
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(123.285, 13.658, 7500),
        duration: 1.0
      });
    } else if (preset === "selected") {
      const center = selectedFeature.properties.center;
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(center[0], center[1], 4500),
        duration: 0.9
      });
    }
  };

  const handleZoom = (direction: "in" | "out") => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    const height = viewer.camera.positionCartographic.height;
    if (direction === "in") viewer.camera.zoomIn(height * 0.3);
    else viewer.camera.zoomOut(height * 0.4);
  };

  // List of all 27 Barangays for the legend (sorted alphabetically like Image 2)
  const sortedLegendBarangays = useMemo(() => {
    return Object.entries(NAGA_ADMIN_COLORS)
      .map(([idStr, val]) => ({
        id: Number(idStr),
        name: val.name,
        hex: val.hex,
        category: val.category
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const filteredLegendBarangays = useMemo(() => {
    if (selectedCategoryFilter === "all") return sortedLegendBarangays;
    return sortedLegendBarangays.filter((b) => b.category === selectedCategoryFilter);
  }, [sortedLegendBarangays, selectedCategoryFilter]);

  return (
    <div
      className={`relative w-full h-full rounded-2xl overflow-hidden border border-[#e5e7eb] bg-slate-900 shadow-sm flex flex-col transition-all ${
        isExpanded ? "fixed inset-3 z-50 h-auto" : ""
      }`}
    >
      {/* ─────────────────────────────────────────────────────────────
          1. TOP 2D SATELLITE GIS COMMAND BAR (ESRI WORLD IMAGERY ONLY)
         ───────────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200/90 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2.5 z-30 select-none">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#05389f] text-white flex items-center justify-center font-bold text-xs shadow-xs">
            <Globe className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-extrabold tracking-tight text-slate-900 font-sans">
                City of Naga GIS Digital Twin
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-50 text-[#05389f] border border-blue-200 font-mono">
                27 Barangays
              </span>
              {calamitySimActive && (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200 rounded-full animate-pulse">
                  Flood Surge Active
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-500 font-medium">
              Esri World Imagery • 3D Contiguous CLUP Zoning & Statutory Risk Levels
            </p>
          </div>
        </div>

        {/* Color Scheme, Legend & Controls */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">

          {/* Color Scheme Switcher: Risk Levels vs Categories vs 27 Colors */}
          <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-0.5">
            {(
              [
                { id: "vulnerability", label: "Risk Index" },
                { id: "category_zones", label: "5 Sectors" },
                { id: "admin_colors", label: "27 Colors" }
              ] as const
            ).map((cm) => (
              <button
                key={cm.id}
                onClick={() => setChoroplethMode(cm.id)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  choroplethMode === cm.id
                    ? "bg-white text-slate-900 shadow-2xs font-black"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                title={`Color 27 Barangays by ${cm.label}`}
              >
                {cm.label}
              </button>
            ))}
          </div>

          {/* Toggle Legend Button */}
          <button
            onClick={() => setShowAdminLegend(!showAdminLegend)}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-xl text-[10px] font-bold cursor-pointer transition-all border ${
              showAdminLegend
                ? "bg-[#05389f] text-white border-[#05389f]"
                : "bg-white text-slate-700 hover:bg-slate-50 border-slate-200 shadow-2xs"
            }`}
          >
            <Tag className="w-3 h-3 text-[#05389f]" />
            <span>Legend</span>
            {showAdminLegend ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
          </button>

          {/* Toggle Layers Bar Button */}
          <button
            onClick={() => setIsLayersMinimized(!isLayersMinimized)}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-xl text-[10px] font-bold cursor-pointer transition-all border ${
              !isLayersMinimized
                ? "bg-[#05389f] text-white border-[#05389f]"
                : "bg-white text-slate-700 hover:bg-slate-50 border-slate-200 shadow-2xs"
            }`}
            title={isLayersMinimized ? "Show Layers Dock" : "Minimize Layers Dock"}
          >
            <Layers className="w-3 h-3 text-[#05389f]" />
            <span>Layers</span>
            {!isLayersMinimized ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
          </button>

          {/* Reset Map View to City Overview */}
          <button
            onClick={() => flyToPreset("overview")}
            className="flex items-center space-x-1.5 px-3 py-1 rounded-xl text-[10px] font-bold bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-2xs cursor-pointer transition-all hover:border-[#05389f]/40 active:scale-95"
            title="Reset 3D Map to Naga City Overview"
          >
            <Compass className="w-3.5 h-3.5 text-[#05389f]" />
            <span>Reset View</span>
          </button>

          {/* Expand / Fullscreen Map */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-xl bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-2xs cursor-pointer transition-all hover:border-[#05389f]/40 active:scale-95"
            title={isExpanded ? "Exit Fullscreen" : "Fullscreen 3D Satellite Map"}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. MAIN 3D SATELLITE MAP VIEWPORT
         ───────────────────────────────────────────────────────────── */}
      <div
        className={`relative w-full ${
          isExpanded ? "flex-1" : "flex-1 min-h-[580px]"
        } bg-[#0a1128] overflow-hidden transition-all duration-300`}
      >
        {!isCesiumLoaded && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#0a1128] text-white space-y-3">
            <div className="w-8 h-8 border-3 border-[#fccf17] border-t-transparent rounded-full animate-spin" />
            <div className="text-center">
              <span className="text-xs font-bold tracking-wide text-white block">
                Loading Esri World Imagery 2D Satellite Map...
              </span>
              <span className="text-[10px] text-white/60">
                Rendering 27 Barangays with Official City Administrative Colors in 2D
              </span>
            </div>
          </div>
        )}

        {/* CesiumJS Container */}
        <div ref={containerRef} className="w-full h-full" />

        {/* Top-Left Active Hover Tooltip (Apple Glass Pill) */}
        {hoveredFeature && hoveredInfo && (
          <div className="absolute top-3 left-3 z-20 bg-white/95 backdrop-blur-md rounded-xl border border-slate-200/90 shadow-md px-3 py-1.5 flex items-center space-x-2 text-xs text-slate-800 pointer-events-none animate-in fade-in duration-150 select-none">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block shrink-0 shadow-2xs"
              style={{ backgroundColor: NAGA_ADMIN_COLORS[hoveredFeature.properties.id]?.hex || "#05389f" }}
            />
            <span className="font-extrabold text-slate-900">
              {NAGA_ADMIN_COLORS[hoveredFeature.properties.id]?.name || hoveredFeature.properties.name}
            </span>
            <span className="text-slate-400">•</span>
            <span className="font-mono text-[11px] font-bold text-slate-600">
              MVI {hoveredFeature.properties.vulnerability_index}
            </span>
            {(() => {
              const mvi = hoveredFeature.properties.vulnerability_index || 50;
              if (mvi >= 70)
                return (
                  <span className="flex items-center space-x-1 px-1.5 py-0.5 rounded-md bg-rose-100 text-rose-700 font-bold text-[10px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-600 inline-block" />
                    <span>High Risk</span>
                  </span>
                );
              if (mvi >= 50)
                return (
                  <span className="flex items-center space-x-1 px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold text-[10px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
                    <span>Medium Risk</span>
                  </span>
                );
              return (
                <span className="flex items-center space-x-1 px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                  <span>Low Risk</span>
                </span>
              );
            })()}
          </div>
        )}

        {/* Floating Statutory Risk Level Pill Legend (Clean Apple Glass) */}
        {choroplethMode === "vulnerability" && (
          <div className="absolute bottom-3 left-3 z-20 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-full px-3.5 py-1.5 flex items-center space-x-3 text-xs text-slate-700 shadow-md select-none">
            <span className="font-bold text-slate-900 text-[11px]">
              Risk Levels:
            </span>
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-[#ef4444] shadow-2xs inline-block animate-pulse" />
              <span className="font-bold text-rose-600 text-[11px]">High (≥70)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-[#facc15] shadow-2xs inline-block" />
              <span className="font-bold text-amber-600 text-[11px]">Medium (50–69)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-[#10b981] shadow-2xs inline-block" />
              <span className="font-bold text-emerald-600 text-[11px]">Low (&lt;50)</span>
            </div>
          </div>
        )}

        {/* Right Floating 2D Camera & Preset Controls (Clean Apple Glass) */}
        <div className="absolute top-3 right-3 z-20 flex flex-col items-center space-y-1 bg-white/95 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200/90 shadow-md text-slate-700 select-none">
          <button
            onClick={() => setIsCameraControlsMinimized(!isCameraControlsMinimized)}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-slate-900 cursor-pointer transition-colors w-full flex items-center justify-center"
            title={isCameraControlsMinimized ? "Expand Map Controls" : "Minimize Map Controls"}
          >
            {isCameraControlsMinimized ? (
              <Compass className="w-4 h-4 text-[#05389f]" />
            ) : (
              <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>

          {!isCameraControlsMinimized && (
            <>
              <button
                onClick={() => flyToPreset("overview")}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-slate-900 cursor-pointer transition-colors"
                title="Reset 2D City Overview"
              >
                <Compass className="w-4 h-4 text-[#05389f]" />
              </button>
              <button
                onClick={() => handleZoom("in")}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-slate-900 cursor-pointer transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleZoom("out")}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-slate-900 cursor-pointer transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <div className="h-px w-full bg-slate-200 my-0.5" />
              <button
                onClick={() => flyToPreset("selected")}
                className="px-2 py-1 rounded-xl bg-[#05389f] hover:bg-blue-800 text-[10px] font-bold text-white shadow-2xs cursor-pointer"
                title="Center on Selected Barangay"
              >
                Focus
              </button>
              <button
                onClick={() => flyToPreset("river")}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-slate-900 cursor-pointer"
                title="Pan to Riverine Delta (Mabolo / Bicol River)"
              >
                <Waves className="w-4 h-4 text-orange-600" />
              </button>
              <button
                onClick={() => flyToPreset("isarog")}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-slate-900 cursor-pointer"
                title="Pan to Upland Watershed (Panicuason / Mt. Isarog)"
              >
                <Mountain className="w-4 h-4 text-amber-600" />
              </button>
            </>
          )}
        </div>

        {/* OFFICIAL 27 BARANGAYS MAP LEGEND (Clean Apple Glass Modal) */}
        {showAdminLegend && (
          <div className="absolute bottom-14 inset-x-3 sm:inset-x-6 z-20 bg-white/98 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-2xl text-slate-800 max-h-56 overflow-y-auto animate-in slide-in-from-bottom duration-200">
            {/* Legend Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#05389f] animate-pulse" />
                <h4 className="text-xs font-extrabold tracking-tight text-slate-900 font-sans">
                  List of Barangays (City of Naga Administrative Map)
                </h4>
                <span className="px-2 py-0.2 rounded-full text-[9px] font-mono font-bold bg-slate-100 text-slate-600 border border-slate-200">
                  {filteredLegendBarangays.length} / 27 Barangays
                </span>
              </div>

              {/* Category Filter Chips inside Legend */}
              <div className="flex flex-wrap items-center gap-1">
                {CATEGORIES.map((cat) => {
                  const isActive = selectedCategoryFilter === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        if (onSelectCategory) onSelectCategory(cat.id);
                      }}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                        isActive
                          ? "bg-[#05389f] text-white shadow-xs"
                          : "bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200"
                      }`}
                    >
                      <span>{cat.short}</span>
                    </button>
                  );
                })}

                <button
                  onClick={() => setShowAdminLegend(false)}
                  className="flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-bold cursor-pointer ml-1"
                  title="Minimize Legend"
                >
                  <ChevronDown className="w-3 h-3" />
                  <span>Close</span>
                </button>
              </div>
            </div>

            {/* List of 27 Barangays Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-x-3 gap-y-1.5 pt-2.5 text-[11px]">
              {filteredLegendBarangays.map((item) => {
                const isSelected = selectedBarangayId === item.id;
                const catInfo = BARANGAY_CATEGORY_LOOKUP[item.id];
                const swatchColor =
                  choroplethMode === "category_zones" && catInfo
                    ? catInfo.color
                    : item.hex;
                return (
                  <div
                    key={item.id}
                    onClick={() => onSelectBarangay(item.id)}
                    className={`flex items-center justify-between space-x-1.5 px-2 py-1 rounded-lg cursor-pointer transition-all ${
                      isSelected
                        ? "bg-[#05389f] text-white font-bold shadow-xs scale-102"
                        : "hover:bg-slate-100 text-slate-700"
                    }`}
                    title={`Click to focus on ${item.name} (${catInfo?.short || item.category})`}
                  >
                    <div className="flex items-center space-x-2 min-w-0">
                      <span
                        className="w-3 h-3 rounded-xs shrink-0 border border-slate-300 shadow-2xs"
                        style={{ backgroundColor: swatchColor }}
                      />
                      <span className="truncate leading-none">{item.name}</span>
                    </div>
                    {catInfo && (
                      <span className="text-[9px] shrink-0 opacity-80">{catInfo.icon}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Collapsed Floating Dock inside 2D Map (Legend & Layers Pills) */}
        <div className="absolute bottom-3 right-3 z-20 flex items-center space-x-2 pointer-events-none">
          <div className="pointer-events-auto flex items-center space-x-2 px-3 py-1 rounded-xl bg-white/90 backdrop-blur-md border border-slate-200/90 text-[10px] text-slate-600 font-mono shadow-sm">
            <Crosshair className="w-3 h-3 text-[#05389f]" />
            <span>
              {cursorCoords.lat}°N, {cursorCoords.lng}°E
            </span>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. BOTTOM 2D GEOJSON LAYER DOCK (MINIMIZABLE APPLE STYLE)
         ───────────────────────────────────────────────────────────── */}
      {!isLayersMinimized && (
        <div className="px-4 py-2 bg-white border-t border-slate-200/90 flex flex-wrap items-center justify-between gap-2 text-xs z-30 select-none">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setIsLayersMinimized(true)}
              className="text-[10px] uppercase font-bold text-slate-500 hover:text-slate-800 tracking-wider flex items-center space-x-1 mr-1 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-lg cursor-pointer transition-colors"
              title="Minimize Layers Bar"
            >
              <Layers className="w-3.5 h-3.5 text-[#05389f]" />
              <span>Layers</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {[
              { label: "27 Brgy Polygons", state: showBarangayZones, toggle: () => setShowBarangayZones(!showBarangayZones) },
              { label: "Labels", state: showBarangayLabels, toggle: () => setShowBarangayLabels(!showBarangayLabels) },
              { label: "River & Roads", state: showRiverAndRoads, toggle: () => setShowRiverAndRoads(!showRiverAndRoads) },
              { label: "2D Hex Grid", state: showHexHotspots, toggle: () => setShowHexHotspots(!showHexHotspots) },
              { label: "2D Footprints", state: show3DBuildings, toggle: () => setShow3DBuildings(!show3DBuildings) },
              { label: "Flood Basin", state: showFloodHazard, toggle: () => setShowFloodHazard(!showFloodHazard) },
              { label: "Facilities", state: showFacilities, toggle: () => setShowFacilities(!showFacilities) },
            ].map((layer) => (
              <button
                key={layer.label}
                onClick={layer.toggle}
                className={`flex items-center space-x-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer border ${
                  layer.state
                    ? "bg-[#05389f] text-white border-[#05389f] shadow-xs"
                    : "bg-slate-50 text-slate-500 border-slate-200 hover:text-slate-800"
                }`}
              >
                <span>{layer.label}</span>
                {layer.state ? <Eye className="w-3 h-3 text-white" /> : <EyeOff className="w-3 h-3" />}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-3 text-[10px] text-slate-500 font-mono">
            <span className="text-slate-800 font-bold font-sans">
              {NAGA_ADMIN_COLORS[selectedFeature.properties.id]?.name || selectedFeature.properties.name}
            </span>
            <button
              onClick={() => setIsLayersMinimized(true)}
              className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 font-sans font-bold cursor-pointer"
              title="Minimize Layers Bar"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
