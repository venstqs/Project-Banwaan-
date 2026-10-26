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
  Globe2,
  Maximize2,
  Minimize2,
  Box,
  Hexagon,
  Building2
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

interface CesiumViewerProps {
  selectedBarangayId: number;
  onSelectBarangay: (id: number) => void;
  activeRole: string;
  calamitySimActive?: boolean;
  fieldReports?: SyncedFieldReport[];
  spatialMode?: SpatialRenderMode;
  onSpatialModeChange?: (mode: SpatialRenderMode) => void;
}

type ChoroplethMode =
  | "vulnerability"
  | "wash_vector"
  | "sanitation"
  | "roof_frailty"
  | "food_insecurity"
  | "unbanked";

type BasemapStyle = "satellite" | "dark" | "osm" | "topo";

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
  spatialMode: externalSpatialMode,
  onSpatialModeChange,
}: CesiumViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<any>(null);
  const prevSelectedIdRef = useRef<number>(selectedBarangayId);

  const [isCesiumLoaded, setIsCesiumLoaded] = useState<boolean>(false);
  const [basemap, setBasemap] = useState<BasemapStyle>("satellite");
  const [sceneMode, setSceneMode] = useState<"3D" | "2D" | "COLUMBUS">("3D");
  const [internalSpatialMode, setInternalSpatialMode] = useState<SpatialRenderMode>("hybrid_spatial");
  const spatialMode = externalSpatialMode || internalSpatialMode;

  const setSpatialMode = (mode: SpatialRenderMode) => {
    setInternalSpatialMode(mode);
    if (onSpatialModeChange) onSpatialModeChange(mode);
  };

  const [choroplethMode, setChoroplethMode] = useState<ChoroplethMode>("vulnerability");
  const [extrusionScale, setExtrusionScale] = useState<number>(1.0);
  const [polygonOpacity, setPolygonOpacity] = useState<number>(0.55);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // GeoJSON & 3D Spatial Layer Toggles
  const [showBarangayZones, setShowBarangayZones] = useState<boolean>(true);
  const [showHexHotspots, setShowHexHotspots] = useState<boolean>(true);
  const [show3DBuildings, setShow3DBuildings] = useState<boolean>(true);
  const [showFloodHazard, setShowFloodHazard] = useState<boolean>(true);
  const [showRiverAndRoads, setShowRiverAndRoads] = useState<boolean>(true);
  const [showFacilities, setShowFacilities] = useState<boolean>(true);
  const [showActiveProjects, setShowActiveProjects] = useState<boolean>(true);
  const [showAttributeTable, setShowAttributeTable] = useState<boolean>(false);
  const [searchFilter, setSearchFilter] = useState<string>("");

  const [hoveredInfo, setHoveredInfo] = useState<{
    barangayId: number;
    title: string;
    subtitle: string;
  } | null>(null);

  const [cursorCoords, setCursorCoords] = useState<{ lng: number; lat: number; alt: number }>({
    lng: 123.1948,
    lat: 13.6218,
    alt: 3800,
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

  // Sync symbology layer to active department role
  useEffect(() => {
    if (activeRole === "ceo") setChoroplethMode("sanitation");
    else if (activeRole === "drrmo") setChoroplethMode("roof_frailty");
    else if (activeRole === "cho") setChoroplethMode("wash_vector");
    else if (activeRole === "swo") setChoroplethMode("unbanked");
    else setChoroplethMode("vulnerability");
  }, [activeRole]);

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

  // Resolve metric value & CSS color string for each barangay / spatial cluster
  const getMetricAndColor = useCallback(
    (props: any, isSelected: boolean, isHovered: boolean) => {
      let val = props.vulnerability_index ?? props.local_mvi ?? 50;
      let norm = (val - 20) / 72;
      let unitLabel = "MVI";

      if (choroplethMode === "wash_vector") {
        val = props.wash_risk_score ?? props.wash_vector_risk ?? 22;
        norm = val / 42;
        unitLabel = "WASH/Vector";
      } else if (choroplethMode === "sanitation") {
        val = props.unimproved_toilet_pct ?? (props.sanitation_deficit_hh ? Math.min(45, props.sanitation_deficit_hh / 3) : 15);
        norm = val / 42;
        unitLabel = "Sanitation %";
      } else if (choroplethMode === "roof_frailty") {
        val = props.weak_roof_pct ?? (props.weak_roof_hh ? Math.min(18, props.weak_roof_hh / 4) : 5);
        norm = val / 15;
        unitLabel = "Weak Roof %";
      } else if (choroplethMode === "food_insecurity") {
        val = props.food_insecurity_pct ?? (props.food_insecurity_hh ? Math.min(80, props.food_insecurity_hh / 5) : 25);
        norm = val / 75;
        unitLabel = "Food Risk %";
      } else if (choroplethMode === "unbanked") {
        val = props.unbanked_pct ?? 35;
        norm = val / 65;
        unitLabel = "Unbanked %";
      }

      norm = Math.max(0.1, Math.min(1.0, norm));

      if (isSelected) {
        return {
          val,
          norm,
          unitLabel,
          hex: "#0ea5e9",
          outlineHex: "#ffffff",
          alpha: Math.min(0.88, polygonOpacity + 0.2),
        };
      }
      if (isHovered) {
        return {
          val,
          norm,
          unitLabel,
          hex: "#14b8a6",
          outlineHex: "#f8fafc",
          alpha: Math.min(0.82, polygonOpacity + 0.15),
        };
      }

      if (norm > 0.72) {
        return { val, norm, unitLabel, hex: "#e11d48", outlineHex: "#fda4af", alpha: polygonOpacity };
      }
      if (norm > 0.48) {
        return { val, norm, unitLabel, hex: "#d97706", outlineHex: "#fde68a", alpha: polygonOpacity };
      }
      if (norm > 0.28) {
        return { val, norm, unitLabel, hex: "#0284c7", outlineHex: "#7dd3fc", alpha: polygonOpacity };
      }
      return { val, norm, unitLabel, hex: "#059669", outlineHex: "#6ee7b7", alpha: polygonOpacity };
    },
    [choroplethMode, polygonOpacity]
  );

  // Initialize Cesium.Viewer instance once CesiumJS is loaded
  useEffect(() => {
    if (!isCesiumLoaded || !containerRef.current || viewerRef.current) return;
    const Cesium = window.Cesium;
    if (!Cesium) return;

    const satelliteProvider = new Cesium.UrlTemplateImageryProvider({
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      maximumLevel: 19,
    });

    const viewer = new Cesium.Viewer(containerRef.current, {
      baseLayer: new Cesium.ImageryLayer(satelliteProvider),
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
      shouldAnimate: true,
    });

    const labelsProvider = new Cesium.UrlTemplateImageryProvider({
      url: "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
      maximumLevel: 19,
    });
    viewer.imageryLayers.addImageryProvider(labelsProvider);

    if (viewer.cesiumWidget?.creditContainer) {
      (viewer.cesiumWidget.creditContainer as HTMLElement).style.display = "none";
    }
    viewer.resolutionScale = window.devicePixelRatio || 1;
    if (viewer.scene?.postProcessStages?.fxaa) {
      viewer.scene.postProcessStages.fxaa.enabled = true;
    }
    viewer.scene.globe.depthTestAgainstTerrain = false;

    // Initial 3D Spatial Camera View over Naga City Urban Core
    viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(123.1925, 13.591, 3600),
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-44),
        roll: 0.0,
      },
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
          subtitle: pickedObject.id.featureSubtitle || "GeoJSON 3D Spatial Feature",
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

  // Smooth Camera Fly-To when selectedBarangayId changes externally
  useEffect(() => {
    if (prevSelectedIdRef.current === selectedBarangayId) return;
    prevSelectedIdRef.current = selectedBarangayId;

    const viewer = viewerRef.current;
    const Cesium = window.Cesium;
    if (!viewer || !Cesium || !selectedFeature) return;

    const center = selectedFeature.properties.center;
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(center[0], center[1] - 0.018, 2100),
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-46),
        roll: 0,
      },
      duration: 1.1,
    });
  }, [selectedBarangayId, selectedFeature]);

  // Switch Basemap Layer
  useEffect(() => {
    const viewer = viewerRef.current;
    const Cesium = window.Cesium;
    if (!viewer || !Cesium) return;

    viewer.imageryLayers.removeAll();

    if (basemap === "satellite") {
      viewer.imageryLayers.addImageryProvider(
        new Cesium.UrlTemplateImageryProvider({
          url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          maximumLevel: 19,
        })
      );
      viewer.imageryLayers.addImageryProvider(
        new Cesium.UrlTemplateImageryProvider({
          url: "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
          maximumLevel: 19,
        })
      );
    } else if (basemap === "dark") {
      viewer.imageryLayers.addImageryProvider(
        new Cesium.UrlTemplateImageryProvider({
          url: "https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
          maximumLevel: 19,
        })
      );
    } else if (basemap === "osm") {
      viewer.imageryLayers.addImageryProvider(
        new Cesium.UrlTemplateImageryProvider({
          url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
          maximumLevel: 19,
        })
      );
    } else if (basemap === "topo") {
      viewer.imageryLayers.addImageryProvider(
        new Cesium.UrlTemplateImageryProvider({
          url: "https://tile.opentopomap.org/{z}/{x}/{y}.png",
          maximumLevel: 17,
        })
      );
    }
  }, [basemap, isCesiumLoaded]);

  // Render GeoJSON 3D Spatial Layers (Barangay Zones, 3D Hex Hotspot Pillars, 3D Urban Buildings, Flood Basin, Facilities)
  useEffect(() => {
    const viewer = viewerRef.current;
    const Cesium = window.Cesium;
    if (!viewer || !Cesium) return;

    viewer.entities.removeAll();

    // 1. GEOJSON LAYER: Flood Hazard Inundation Basin (3D Water Volume)
    if (showFloodHazard || calamitySimActive) {
      const flatCoords: number[] = [];
      floodPolygon.forEach((pt: number[]) => {
        flatCoords.push(pt[0], pt[1]);
      });

      const waterHeight = calamitySimActive ? 78 : 12;
      const waterColor = calamitySimActive
        ? Cesium.Color.fromCssColorString("#ef4444").withAlpha(0.42)
        : Cesium.Color.fromCssColorString("#06b6d4").withAlpha(0.22);

      viewer.entities.add({
        name: "Naga-Bicol River Flood Inundation Zone",
        polygon: {
          hierarchy: Cesium.Cartesian3.fromDegreesArray(flatCoords),
          height: 1,
          extrudedHeight: waterHeight,
          material: waterColor,
          outline: true,
          outlineColor: calamitySimActive
            ? Cesium.Color.fromCssColorString("#fca5a5")
            : Cesium.Color.fromCssColorString("#22d3ee").withAlpha(0.65),
        },
      });
    }

    // 2. GEOJSON LAYER: Naga River Hydrological Corridor & Arterial Roads
    if (showRiverAndRoads) {
      if (riverPath.length > 0) {
        const riverDegs: number[] = [];
        riverPath.forEach((c: number[]) => riverDegs.push(c[0], c[1], 8));
        viewer.entities.add({
          name: "Naga River Waterway",
          polyline: {
            positions: Cesium.Cartesian3.fromDegreesArrayHeights(riverDegs),
            width: calamitySimActive ? 10 : 6,
            material: new Cesium.PolylineGlowMaterialProperty({
              glowPower: 0.25,
              color: calamitySimActive
                ? Cesium.Color.fromCssColorString("#f43f5e")
                : Cesium.Color.fromCssColorString("#38bdf8"),
            }),
          },
        });
      }

      roadNetwork.forEach((road: any) => {
        const roadDegs: number[] = [];
        road.coordinates.forEach((c: number[]) => roadDegs.push(c[0], c[1], 6));
        viewer.entities.add({
          name: road.name,
          polyline: {
            positions: Cesium.Cartesian3.fromDegreesArrayHeights(roadDegs),
            width: road.type === "National Primary" ? 3.5 : 2.0,
            material: Cesium.Color.fromCssColorString(
              road.type === "National Primary" ? "#f59e0b" : "#94a3b8"
            ).withAlpha(0.65),
          },
        });
      });
    }

    // 3. GEOJSON LAYER: 27 Naga City Barangay Boundaries & Choropleth Polygons
    if (showBarangayZones) {
      barangays.forEach((feat: any) => {
        const p = feat.properties;
        const isSelected = p.id === selectedBarangayId;
        const isHovered = hoveredInfo?.barangayId === p.id;
        const sym = getMetricAndColor(p, isSelected, isHovered);

        const ring = feat.geometry.coordinates[0];
        const flatCoords: number[] = [];
        ring.forEach((c: number[]) => flatCoords.push(c[0], c[1]));

        // In hybrid_spatial mode, keep barangay polygons low (12m) so 3D hex columns & 3D buildings stand out clearly over satellite imagery!
        // In prism_choropleth mode, extrude the entire barangay polygon up to 350m.
        const extrudeMeters =
          spatialMode === "prism_choropleth"
            ? Math.max(35, Math.round(sym.norm * 340 * extrusionScale)) + (isSelected ? 45 : 0)
            : spatialMode === "hybrid_spatial"
            ? isSelected
              ? 18
              : 8
            : 3;

        const zoneAlpha =
          spatialMode === "hybrid_spatial"
            ? isSelected
              ? 0.38
              : Math.min(0.26, sym.alpha * 0.48)
            : sym.alpha;

        viewer.entities.add({
          name: p.name,
          barangayId: p.id,
          featureSubtitle: `${p.district} • ${p.households.toLocaleString()} HHs`,
          position: Cesium.Cartesian3.fromDegrees(
            p.center[0],
            p.center[1],
            spatialMode === "prism_choropleth" ? extrudeMeters + 28 : 95
          ),
          polygon: {
            hierarchy: Cesium.Cartesian3.fromDegreesArray(flatCoords),
            height: 2,
            extrudedHeight: extrudeMeters,
            material: Cesium.Color.fromCssColorString(sym.hex).withAlpha(zoneAlpha),
            outline: true,
            outlineColor: Cesium.Color.fromCssColorString(isSelected ? "#38bdf8" : sym.outlineHex),
            outlineWidth: isSelected ? 3 : 1.5,
          },
          label: {
            text:
              isSelected || isHovered
                ? `${p.short_name || p.name}\n${sym.unitLabel}: ${sym.val}`
                : `${p.short_name || `B${p.id}`}`,
            font: isSelected || isHovered ? "700 12px Inter, sans-serif" : "600 10.5px Inter, sans-serif",
            fillColor: Cesium.Color.WHITE,
            outlineColor: Cesium.Color.fromCssColorString("#0f172a"),
            outlineWidth: 3,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            showBackground: true,
            backgroundColor: isSelected
              ? Cesium.Color.fromCssColorString("#0284c7").withAlpha(0.92)
              : Cesium.Color.fromCssColorString("#0f172a").withAlpha(0.82),
            backgroundPadding: new Cesium.Cartesian2(6, 4),
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 24000),
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          },
        });
      });
    }

    // 4. GEOJSON LAYER: 81 3D Spatial Hex Hotspot Columns (Dengue / WASH / CBMS Purok Surveillance Pillars)
    if (showHexHotspots && spatialMode === "hybrid_spatial") {
      hexClusters.forEach((hexFeat: any) => {
        const hp = hexFeat.properties;
        const isSelected = hp.barangay_id === selectedBarangayId;
        const isHovered = hoveredInfo?.barangayId === hp.barangay_id;
        const sym = getMetricAndColor(hp, isSelected, isHovered);

        const ring = hexFeat.geometry.coordinates[0];
        const flatCoords: number[] = [];
        ring.forEach((c: number[]) => flatCoords.push(c[0], c[1]));

        const pillarHeight = Math.max(28, Math.round(sym.norm * 240 * extrusionScale)) + (isSelected ? 30 : 0);

        viewer.entities.add({
          name: hp.zone_name,
          barangayId: hp.barangay_id,
          featureSubtitle: `3D Spatial Hex • Sanitation: ${hp.sanitation_deficit_hh} HH • Food Risk: ${hp.food_insecurity_hh} HH`,
          polygon: {
            hierarchy: Cesium.Cartesian3.fromDegreesArray(flatCoords),
            height: 10,
            extrudedHeight: pillarHeight,
            material: Cesium.Color.fromCssColorString(sym.hex).withAlpha(
              isSelected ? 0.86 : Math.min(0.78, polygonOpacity + 0.15)
            ),
            outline: true,
            outlineColor: Cesium.Color.fromCssColorString(isSelected ? "#ffffff" : sym.outlineHex),
            outlineWidth: isSelected ? 2 : 1,
          },
        });
      });
    }

    // 5. GEOJSON LAYER: 153 3D Urban Buildings (Structural & Roof Frailty Footprints)
    if (show3DBuildings && spatialMode !== "flat_geojson") {
      buildings.forEach((bFeat: any) => {
        const bp = bFeat.properties;
        const isSelected = bp.barangay_id === selectedBarangayId;
        const ring = bFeat.geometry.coordinates[0];
        const flatCoords: number[] = [];
        ring.forEach((c: number[]) => flatCoords.push(c[0], c[1]));

        const bColor =
          bp.building_type.includes("Barangay Hall")
            ? "#38bdf8"
            : bp.building_type.includes("Health")
            ? "#10b981"
            : bp.structural_risk === "Elevated"
            ? "#fb7185"
            : isSelected
            ? "#e2e8f0"
            : "#94a3b8";

        viewer.entities.add({
          name: `${bp.building_type} (${bp.barangay_name})`,
          barangayId: bp.barangay_id,
          featureSubtitle: `Height: ${bp.height_m}m • Structural Risk: ${bp.structural_risk}`,
          polygon: {
            hierarchy: Cesium.Cartesian3.fromDegreesArray(flatCoords),
            height: 2,
            extrudedHeight: Math.round(bp.height_m * 1.8 * extrusionScale),
            material: Cesium.Color.fromCssColorString(bColor).withAlpha(isSelected ? 0.88 : 0.72),
            outline: true,
            outlineColor: Cesium.Color.fromCssColorString("#0f172a").withAlpha(0.6),
          },
        });
      });
    }

    // 6. LAYER: Critical Facilities & Evacuation Shelters
    if (showFacilities) {
      facilities.forEach((fac: any) => {
        const markerColor = fac.category.includes("Command")
          ? "#38bdf8"
          : fac.category.includes("Shelter")
          ? "#f59e0b"
          : "#10b981";

        viewer.entities.add({
          name: fac.name,
          position: Cesium.Cartesian3.fromDegrees(fac.lng, fac.lat, 85),
          point: {
            pixelSize: 10,
            color: Cesium.Color.fromCssColorString(markerColor),
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 2,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          },
          polyline: {
            positions: Cesium.Cartesian3.fromDegreesArrayHeights([fac.lng, fac.lat, 2, fac.lng, fac.lat, 85]),
            width: 1.5,
            material: Cesium.Color.fromCssColorString(markerColor).withAlpha(0.75),
          },
          label: {
            text: fac.name,
            font: "600 10px Inter, sans-serif",
            fillColor: Cesium.Color.fromCssColorString("#f8fafc"),
            showBackground: true,
            backgroundColor: Cesium.Color.fromCssColorString("#0f172a").withAlpha(0.88),
            backgroundPadding: new Cesium.Cartesian2(5, 3),
            pixelOffset: new Cesium.Cartesian2(0, -16),
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 12000),
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          },
        });
      });
    }

    // 7. LAYER: Synced Mobile Field Reports
    if (showActiveProjects) {
      fieldReports.forEach((rpt, idx) => {
        const matchedBrgy = barangays.find((b: any) => b.properties.id === rpt.barangay_id);
        const lng = matchedBrgy ? matchedBrgy.properties.center[0] + 0.0011 * (idx + 1) : rpt.longitude;
        const lat = matchedBrgy ? matchedBrgy.properties.center[1] + 0.0007 * (idx + 1) : rpt.latitude;

        viewer.entities.add({
          name: rpt.report_type,
          barangayId: rpt.barangay_id,
          featureSubtitle: rpt.description,
          position: Cesium.Cartesian3.fromDegrees(lng, lat, 125),
          point: {
            pixelSize: 11,
            color: Cesium.Color.fromCssColorString("#10b981"),
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 2,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          },
          polyline: {
            positions: Cesium.Cartesian3.fromDegreesArrayHeights([lng, lat, 2, lng, lat, 125]),
            width: 2,
            material: Cesium.Color.fromCssColorString("#10b981"),
          },
          label: {
            text: `Field Pin: ${rpt.report_type}`,
            font: "700 10px Inter, sans-serif",
            fillColor: Cesium.Color.fromCssColorString("#a7f3d0"),
            showBackground: true,
            backgroundColor: Cesium.Color.fromCssColorString("#064e3b").withAlpha(0.92),
            backgroundPadding: new Cesium.Cartesian2(6, 4),
            pixelOffset: new Cesium.Cartesian2(0, -16),
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          },
        });
      });
    }
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
    hoveredInfo,
    spatialMode,
    choroplethMode,
    extrusionScale,
    polygonOpacity,
    showBarangayZones,
    showHexHotspots,
    show3DBuildings,
    showFloodHazard,
    showRiverAndRoads,
    showFacilities,
    showActiveProjects,
    calamitySimActive,
    fieldReports,
    getMetricAndColor,
  ]);

  const flyToPreset = (preset: "overview" | "river" | "isarog" | "selected") => {
    const viewer = viewerRef.current;
    const Cesium = window.Cesium;
    if (!viewer || !Cesium) return;

    if (preset === "overview") {
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(123.1925, 13.591, 3600),
        orientation: {
          heading: Cesium.Math.toRadians(0),
          pitch: Cesium.Math.toRadians(-44),
          roll: 0,
        },
        duration: 1.2,
      });
    } else if (preset === "river") {
      onSelectBarangay(3);
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(123.1865, 13.606, 2100),
        orientation: {
          heading: Cesium.Math.toRadians(-10),
          pitch: Cesium.Math.toRadians(-42),
          roll: 0,
        },
        duration: 1.2,
      });
    } else if (preset === "isarog") {
      onSelectBarangay(18);
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(123.245, 13.642, 3400),
        orientation: {
          heading: Cesium.Math.toRadians(12),
          pitch: Cesium.Math.toRadians(-40),
          roll: 0,
        },
        duration: 1.2,
      });
    } else if (preset === "selected") {
      const center = selectedFeature.properties.center;
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(center[0], center[1] - 0.018, 2000),
        orientation: {
          heading: Cesium.Math.toRadians(0),
          pitch: Cesium.Math.toRadians(-46),
          roll: 0,
        },
        duration: 1.1,
      });
    }
  };

  const handleSceneModeChange = (mode: "3D" | "2D" | "COLUMBUS") => {
    setSceneMode(mode);
    const viewer = viewerRef.current;
    if (!viewer) return;
    if (mode === "3D") viewer.scene.morphTo3D(1.0);
    else if (mode === "2D") viewer.scene.morphTo2D(1.0);
    else if (mode === "COLUMBUS") viewer.scene.morphToColumbusView(1.0);
  };

  const handleZoom = (direction: "in" | "out") => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    const height = viewer.camera.positionCartographic.height;
    if (direction === "in") viewer.camera.zoomIn(height * 0.3);
    else viewer.camera.zoomOut(height * 0.4);
  };

  const filteredBarangays = useMemo(() => {
    return barangays.filter(
      (b: any) =>
        b.properties.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        (b.properties.district || "").toLowerCase().includes(searchFilter.toLowerCase())
    );
  }, [barangays, searchFilter]);

  return (
    <div
      className={`relative w-full rounded-xl overflow-hidden border border-slate-800 bg-[#0b0f17] shadow-xl flex flex-col transition-all ${
        isExpanded ? "fixed inset-3 z-50 h-auto" : ""
      }`}
    >
      {/* Top GIS Control Header */}
      <div className="bg-[#0f172a] border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 z-30">
        <div className="flex items-center space-x-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-teal-400 shadow-sm shadow-teal-400/50" />
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold tracking-wide text-white">
              CesiumJS + GeoJSON 3D Spatial Intelligence
            </span>
            <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono font-medium bg-slate-800 text-slate-300 border border-slate-700 rounded">
              EPSG:4326 • 27 Barangays • 81 Hex Zones • 153 3D Structures
            </span>
            {calamitySimActive && (
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded animate-pulse">
                Flood Surge Level 3 Active
              </span>
            )}
          </div>
        </div>

        {/* Spatial Mode, Basemap, Symbology & Scene Controls */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {/* 3D Spatial Render Mode Switcher */}
          <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg p-0.5">
            <button
              onClick={() => setSpatialMode("hybrid_spatial")}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-[10px] font-semibold transition-colors cursor-pointer ${
                spatialMode === "hybrid_spatial"
                  ? "bg-teal-500/20 text-teal-300 border border-teal-500/40"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="3D Spatial Hex Clusters + 3D Buildings + GeoJSON Zones"
            >
              <Hexagon className="w-3 h-3" />
              <span>3D Spatial Hex + Buildings</span>
            </button>
            <button
              onClick={() => setSpatialMode("prism_choropleth")}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-[10px] font-semibold transition-colors cursor-pointer ${
                spatialMode === "prism_choropleth"
                  ? "bg-sky-500/20 text-sky-300 border border-sky-500/40"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="QGIS 3D Extruded Barangay Polygons"
            >
              <Box className="w-3 h-3" />
              <span>3D Barangay Prisms</span>
            </button>
            <button
              onClick={() => setSpatialMode("flat_geojson")}
              className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-colors cursor-pointer ${
                spatialMode === "flat_geojson"
                  ? "bg-sky-500/20 text-sky-300 border border-sky-500/40"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              GeoJSON 2D
            </button>
          </div>

          {/* Choropleth / Spatial Metric Selector */}
          <div className="flex items-center space-x-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1">
            <Sliders className="w-3.5 h-3.5 text-teal-400" />
            <select
              value={choroplethMode}
              onChange={(e) => setChoroplethMode(e.target.value as ChoroplethMode)}
              className="bg-transparent text-[11px] font-medium text-slate-200 outline-none cursor-pointer"
            >
              <option value="vulnerability" className="bg-slate-900">Metric: PCA Vulnerability (MVI)</option>
              <option value="wash_vector" className="bg-slate-900">Metric: WASH & Water/Vector Risk</option>
              <option value="sanitation" className="bg-slate-900">Metric: Sanitation Deficit (%)</option>
              <option value="roof_frailty" className="bg-slate-900">Metric: Shelter Roof Frailty (%)</option>
              <option value="food_insecurity" className="bg-slate-900">Metric: Food Insecurity (%)</option>
              <option value="unbanked" className="bg-slate-900">Metric: Unbanked Households (%)</option>
            </select>
          </div>

          {/* Basemap Selector */}
          <div className="flex items-center space-x-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1">
            <Globe2 className="w-3.5 h-3.5 text-sky-400" />
            <select
              value={basemap}
              onChange={(e) => setBasemap(e.target.value as BasemapStyle)}
              className="bg-transparent text-[11px] font-medium text-slate-200 outline-none cursor-pointer"
            >
              <option value="satellite" className="bg-slate-900">Esri World Imagery (Satellite)</option>
              <option value="dark" className="bg-slate-900">CartoDB Dark Matter</option>
              <option value="osm" className="bg-slate-900">OpenStreetMap Vector</option>
              <option value="topo" className="bg-slate-900">OpenTopoMap Contours</option>
            </select>
          </div>

          {/* Cesium Camera Projection (3D / 2.5D / 2D) */}
          <div className="hidden md:flex items-center bg-slate-900 border border-slate-700 rounded-lg p-0.5">
            {(["3D", "COLUMBUS", "2D"] as const).map((m) => (
              <button
                key={m}
                onClick={() => handleSceneModeChange(m)}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                  sceneMode === m
                    ? "bg-sky-500/20 text-sky-300 border border-sky-500/40"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {m === "COLUMBUS" ? "2.5D" : m}
              </button>
            ))}
          </div>

          {/* Attribute Table Toggle */}
          <button
            onClick={() => setShowAttributeTable(!showAttributeTable)}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[11px] font-medium cursor-pointer transition-colors border ${
              showAttributeTable
                ? "bg-sky-500/20 text-sky-300 border-sky-500/40"
                : "bg-slate-900 text-slate-300 hover:text-white border-slate-700"
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>GeoJSON Table</span>
          </button>

          {/* Expand / Fullscreen Map */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg bg-slate-900 text-slate-300 hover:text-white border border-slate-700 cursor-pointer"
            title={isExpanded ? "Minimize Map" : "Maximize Map"}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main CesiumJS WebGL Viewport */}
      <div className={`relative w-full ${isExpanded ? "flex-1" : "h-[540px]"} bg-[#090d16] overflow-hidden`}>
        {!isCesiumLoaded && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#090d16] text-slate-300 space-y-2">
            <div className="w-7 h-7 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-medium tracking-wide text-slate-400">
              Loading CesiumJS 3D Spatial Engine & Naga City GeoJSON Layers...
            </span>
          </div>
        )}

        {/* CesiumJS Container */}
        <div ref={containerRef} className="w-full h-full" />

        {/* Top-Left Active Barangay / Hover Spatial Telemetry HUD */}
        {hoveredFeature && (
          <div className="absolute top-3 left-3 z-20 bg-slate-900/92 backdrop-blur-md p-3.5 rounded-xl border border-slate-700/80 shadow-2xl w-72">
            <div className="flex items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-teal-400 font-semibold block">
                  {hoveredInfo ? "Cursor Spatial Inspect" : "Selected Barangay"}
                </span>
                <h4 className="text-xs font-bold text-white leading-tight mt-0.5">
                  {hoveredFeature.properties.name}
                </h4>
              </div>
              <span className="px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[10px] font-mono font-bold shrink-0">
                MVI {hoveredFeature.properties.vulnerability_index}
              </span>
            </div>

            <div className="text-[10px] text-slate-400 mt-1">
              {hoveredInfo?.subtitle || `${hoveredFeature.properties.district} • Elev ${hoveredFeature.properties.elevation_m}m`}
            </div>

            <div className="mt-2.5 pt-2.5 border-t border-slate-800 grid grid-cols-2 gap-2 text-[10px]">
              <div className="bg-slate-950/60 px-2 py-1 rounded border border-slate-800/80">
                <span className="text-slate-400 block">Households / Pop</span>
                <strong className="text-slate-100 font-mono">
                  {hoveredFeature.properties.households?.toLocaleString()} / {hoveredFeature.properties.population?.toLocaleString()}
                </strong>
              </div>
              <div className="bg-slate-950/60 px-2 py-1 rounded border border-slate-800/80">
                <span className="text-slate-400 block">WASH / Water Risk</span>
                <strong className="text-teal-300 font-mono">
                  {hoveredFeature.properties.wash_risk_score} ({hoveredFeature.properties.refilling_dependency}% Refill)
                </strong>
              </div>
              <div className="bg-slate-950/60 px-2 py-1 rounded border border-slate-800/80">
                <span className="text-slate-400 block">Sanitation Deficit</span>
                <strong className="text-amber-300 font-mono">
                  {hoveredFeature.properties.unimproved_toilet_pct}% ({hoveredFeature.properties.households_needing_sanitation} HH)
                </strong>
              </div>
              <div className="bg-slate-950/60 px-2 py-1 rounded border border-slate-800/80">
                <span className="text-slate-400 block">Shelter Weak Roof</span>
                <strong className="text-rose-300 font-mono">
                  {hoveredFeature.properties.weak_roof_pct}% • Food {hoveredFeature.properties.food_insecurity_pct}%
                </strong>
              </div>
            </div>
          </div>
        )}

        {/* Right Floating Camera & Preset Controls */}
        <div className="absolute top-3 right-3 z-20 flex flex-col space-y-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-700/80 shadow-xl">
          <button
            onClick={() => flyToPreset("overview")}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-200 cursor-pointer transition-colors"
            title="Reset Naga City 3D Overview"
          >
            <Compass className="w-4 h-4 text-teal-400" />
          </button>
          <button
            onClick={() => handleZoom("in")}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-200 cursor-pointer transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleZoom("out")}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-200 cursor-pointer transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <div className="h-px bg-slate-800 my-0.5" />
          <button
            onClick={() => flyToPreset("selected")}
            className="px-2 py-1.5 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/40 text-[10px] font-bold text-teal-300 cursor-pointer"
            title="Fly to Selected Barangay"
          >
            Fly
          </button>
          <button
            onClick={() => flyToPreset("river")}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-300 cursor-pointer"
            title="Fly to Naga River Confluence"
          >
            <Waves className="w-4 h-4 text-sky-400" />
          </button>
          <button
            onClick={() => flyToPreset("isarog")}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-300 cursor-pointer"
            title="Fly to Mt. Isarog Slopes"
          >
            <Mountain className="w-4 h-4 text-emerald-400" />
          </button>
        </div>

        {/* Bottom-Left Floating 3D Spatial Extrusion & Legend Control */}
        <div className="absolute bottom-3 left-3 z-20 bg-slate-900/92 backdrop-blur-md p-3 rounded-xl border border-slate-700/80 shadow-xl space-y-2 w-64">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-200">
            <span>3D Spatial Height Scale</span>
            <span className="font-mono text-teal-400">{extrusionScale.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min={0.3}
            max={2.2}
            step={0.1}
            value={extrusionScale}
            onChange={(e) => setExtrusionScale(Number(e.target.value))}
            className="w-full accent-teal-400 h-1 cursor-pointer"
          />

          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-200">
            <span>GeoJSON Layer Opacity</span>
            <span className="font-mono text-slate-400">{Math.round(polygonOpacity * 100)}%</span>
          </div>
          <input
            type="range"
            min={0.2}
            max={0.9}
            step={0.05}
            value={polygonOpacity}
            onChange={(e) => setPolygonOpacity(Number(e.target.value))}
            className="w-full accent-teal-400 h-1 cursor-pointer"
          />

          <div className="pt-1.5 border-t border-slate-800 grid grid-cols-2 gap-1.5 text-[10px] text-slate-300">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-rose-600 inline-block" />
              <span>Critical Risk</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-amber-600 inline-block" />
              <span>Elevated Risk</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-sky-600 inline-block" />
              <span>Moderate</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600 inline-block" />
              <span>Resilient</span>
            </div>
          </div>
        </div>

        {/* Slide-Over GeoJSON Attribute Table */}
        {showAttributeTable && (
          <div className="absolute inset-y-0 right-0 w-full sm:w-[410px] bg-slate-900/98 backdrop-blur-xl border-l border-slate-800 z-30 flex flex-col shadow-2xl">
            <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center space-x-2">
                <Table className="w-4 h-4 text-teal-400" />
                <span className="text-xs font-bold text-slate-100">
                  GeoJSON Feature Table (27 Naga Barangays)
                </span>
              </div>
              <button
                onClick={() => setShowAttributeTable(false)}
                className="text-xs text-slate-400 hover:text-white px-2 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="p-2 bg-slate-950/60 border-b border-slate-800 flex items-center space-x-2">
              <Search className="w-3.5 h-3.5 text-slate-400 ml-1" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search Abella, Mabolo, Concepcion, Triangulo..."
                className="w-full bg-transparent text-xs text-slate-100 outline-none"
              />
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 text-[11px]">
              {filteredBarangays.map((f: any) => {
                const p = f.properties;
                const isSel = p.id === selectedBarangayId;
                return (
                  <div
                    key={p.id}
                    onClick={() => onSelectBarangay(p.id)}
                    className={`p-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                      isSel ? "bg-teal-500/15 border-l-2 border-teal-400" : "hover:bg-slate-800/50"
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-slate-100 flex items-center space-x-1.5">
                        <span>{p.name}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {p.households.toLocaleString()} HH • {p.population.toLocaleString()} Pop • WASH {p.wash_risk_score}
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded font-mono font-semibold text-[10px] ${
                        p.vulnerability_index > 70
                          ? "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                          : p.vulnerability_index > 55
                          ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                          : "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                      }`}
                    >
                      {p.vulnerability_index}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Bottom GeoJSON Layer Dock & Coordinate Telemetry Bar */}
      <div className="px-4 py-2.5 bg-[#0f172a] border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs z-30">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center space-x-1 mr-1">
            <Layers className="w-3.5 h-3.5 text-teal-400" />
            <span>GeoJSON Layers:</span>
          </span>

          {[
            { label: "Barangay Zones", state: showBarangayZones, toggle: () => setShowBarangayZones(!showBarangayZones) },
            { label: "3D Hex Hotspots (81)", state: showHexHotspots, toggle: () => setShowHexHotspots(!showHexHotspots) },
            { label: "3D Buildings (153)", state: show3DBuildings, toggle: () => setShow3DBuildings(!show3DBuildings) },
            { label: "Flood Basin", state: showFloodHazard, toggle: () => setShowFloodHazard(!showFloodHazard) },
            { label: "River & Roads", state: showRiverAndRoads, toggle: () => setShowRiverAndRoads(!showRiverAndRoads) },
            { label: "EOC & Shelters", state: showFacilities, toggle: () => setShowFacilities(!showFacilities) },
            { label: `Field Pins (${fieldReports.length})`, state: showActiveProjects, toggle: () => setShowActiveProjects(!showActiveProjects) },
          ].map((layer) => (
            <button
              key={layer.label}
              onClick={layer.toggle}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-[10px] font-medium transition-colors cursor-pointer border ${
                layer.state
                  ? "bg-teal-500/15 text-teal-300 border-teal-500/30"
                  : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-300"
              }`}
            >
              <span>{layer.label}</span>
              {layer.state ? <Eye className="w-3 h-3 text-teal-400" /> : <EyeOff className="w-3 h-3" />}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-3 text-[10px] text-slate-400 font-mono">
          <span className="flex items-center space-x-1">
            <Crosshair className="w-3 h-3 text-teal-400" />
            <span>
              {cursorCoords.lat}°N, {cursorCoords.lng}°E • Alt {cursorCoords.alt}m
            </span>
          </span>
          <span className="text-slate-200 font-semibold">
            {selectedFeature.properties.name}
          </span>
        </div>
      </div>
    </div>
  );
}
