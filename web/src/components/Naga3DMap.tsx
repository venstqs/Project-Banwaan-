"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Layers,
  Eye,
  EyeOff,
  Compass,
  AlertTriangle,
  Building,
  Building2,
  MapPin,
  Plus,
  Minus,
  RefreshCw,
  Sliders,
  ChevronDown,
  ChevronUp,
  Minimize2,
  Navigation,
  Activity,
  Waves,
  Globe,
  Maximize2,
  Info,
  Check,
  ShieldAlert,
  Flame,
  Droplets,
  HeartPulse,
  Mountain,
  Store,
  Landmark,
  Hospital
} from "lucide-react";
import "maplibre-gl/dist/maplibre-gl.css";

import geospatialData from "../data/naga_geospatial.json";

interface Naga3DMapProps {
  selectedBarangayId: number;
  onSelectBarangay: (id: number) => void;
  activeRole: string;
  onToggleCesium?: () => void;
  isCesiumMode?: boolean;
}

export const CATEGORIES = [
  { id: "all", name: "All 27 Barangays", short: "All", count: 27, color: "#05389f", icon: Globe },
  { id: "upland", name: "Upland Watershed & Agro-Forestry", short: "Upland Watershed", count: 5, color: "#b59410", icon: Mountain },
  { id: "cbd", name: "Central Business District (CBD Core)", short: "CBD Commercial", count: 6, color: "#05389f", icon: Store },
  { id: "poblacion", name: "Poblacion Urban & Heritage Core", short: "Poblacion Heritage", count: 8, color: "#7c3aed", icon: Landmark },
  { id: "growth", name: "Suburban Growth Corridor", short: "Growth Corridor", count: 4, color: "#0284c7", icon: Hospital },
  { id: "riverine", name: "Riverine & Flood-Hazard Delta", short: "Riverine Flood Delta", count: 4, color: "#ea580c", icon: Waves }
];

export default function Naga3DMap({
  selectedBarangayId,
  onSelectBarangay,
  activeRole,
  onToggleCesium,
  isCesiumMode = false
}: Naga3DMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);
  const [mapError, setMapError] = useState<string | null>(null);

  // Floating "Map Layers" dropdown & minimize states
  const [isLayersOpen, setIsLayersOpen] = useState<boolean>(false);
  const [isCategoriesMinimized, setIsCategoriesMinimized] = useState<boolean>(false);
  const [isInspectedMinimized, setIsInspectedMinimized] = useState<boolean>(false);
  const [isMapMinimized, setIsMapMinimized] = useState<boolean>(false);

  // Category Filtering
  const [activeCategory, setActiveCategory] = useState<string>("all");

  // Layer Visibility Toggles
  const [show3DBuildings, setShow3DBuildings] = useState<boolean>(true);
  const [showPriorityOverlay, setShowPriorityOverlay] = useState<boolean>(true);
  const [showFloodHazard, setShowFloodHazard] = useState<boolean>(false);
  const [showBarangayLabels, setShowBarangayLabels] = useState<boolean>(true);
  const [showBarangayBoundaries, setShowBarangayBoundaries] = useState<boolean>(true);
  const [activeBasemap, setActiveBasemap] = useState<"liberty" | "positron" | "bright">("liberty");

  // Camera & View Presets
  const [currentPitch, setCurrentPitch] = useState<number>(58);
  const [currentBearing, setCurrentBearing] = useState<number>(-25);
  const [activePreset, setActivePreset] = useState<string>("downtown");

  // Inspected Feature
  const [inspectedBarangay, setInspectedBarangay] = useState<any>(null);

  // Downtown Naga Coordinates
  const DOWNTOWN_CENTER: [number, number] = [123.1928, 13.6232];

  // Demo B Priority Polygon
  const demoBPolygonGeoJSON: any = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {
          name: "Demo B - Moderate priority",
          code: "ZONE-PANGANIBAN-02",
          priority: "Moderate Priority",
          color: "#fccf17",
          description: "Panganiban Drive - Peninsula - Bonifacio Commercial Corridor. High unmetered stormwater runoff and drinking water refilling station dependency (62.4%).",
          budget: "₱1,250,000",
          statute: "RA 7160 Sec. 17 / RA 10121",
          sdgs: ["SDG 6", "SDG 11"]
        },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [123.1898, 13.6238],
              [123.1922, 13.6248],
              [123.1952, 13.6236],
              [123.1956, 13.6214],
              [123.1942, 13.6210],
              [123.1915, 13.6216],
              [123.1898, 13.6238]
            ]
          ]
        }
      }
    ]
  };

  // Initialize MapLibre GL
  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    let isMounted = true;
    let map: any = null;

    const initMap = async () => {
      try {
        const mlModule = await import("maplibre-gl");
        const maplibregl: any = (mlModule as any).default || mlModule;
        maplibregl.workerUrl = "/maplibre-gl-worker.mjs";

        if (!isMounted || !mapContainerRef.current) return;

        const styleUrl =
          activeBasemap === "positron"
            ? "https://tiles.openfreemap.org/styles/positron"
            : activeBasemap === "bright"
            ? "https://tiles.openfreemap.org/styles/bright"
            : "https://tiles.openfreemap.org/styles/liberty";

        map = new maplibregl.Map({
          container: mapContainerRef.current,
          style: styleUrl,
          center: DOWNTOWN_CENTER,
          zoom: 15.65,
          pitch: 58,
          bearing: -25,
          antialias: true,
          attributionControl: false
        });

        map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");

        map.on("load", () => {
          if (!isMounted) return;
          setMapLoaded(true);

          // 1. 3D Building Extrusions
          if (map.getLayer("building-3d")) {
            map.setLayoutProperty("building-3d", "visibility", show3DBuildings ? "visible" : "none");
            map.setPaintProperty("building-3d", "fill-extrusion-color", "#e5e2dc");
            map.setPaintProperty("building-3d", "fill-extrusion-opacity", 0.88);
          }

          // 2. Add 27 Naga Barangays Boundaries & Categorized Fills
          if (!map.getSource("naga-barangays-source")) {
            map.addSource("naga-barangays-source", {
              type: "geojson",
              data: geospatialData.barangays_geojson
            });

            // Categorized Fill Colors matching official Administrative Map
            map.addLayer({
              id: "barangay-fill",
              type: "fill",
              source: "naga-barangays-source",
              layout: {
                visibility: showBarangayBoundaries ? "visible" : "none"
              },
              paint: {
                "fill-color": [
                  "match",
                  ["get", "category"],
                  "upland", "#b59410",
                  "cbd", "#05389f",
                  "growth", "#0284c7",
                  "poblacion", "#7c3aed",
                  "riverine", "#ea580c",
                  "#05389f"
                ],
                "fill-opacity": 0.22
              }
            });

            // Boundary Outline
            map.addLayer({
              id: "barangay-borders",
              type: "line",
              source: "naga-barangays-source",
              layout: {
                visibility: showBarangayBoundaries ? "visible" : "none"
              },
              paint: {
                "line-color": [
                  "match",
                  ["get", "category"],
                  "upland", "#b59410",
                  "cbd", "#05389f",
                  "growth", "#0284c7",
                  "poblacion", "#7c3aed",
                  "riverine", "#ea580c",
                  "#05389f"
                ],
                "line-width": 2,
                "line-opacity": 0.9
              }
            });

            // Hover and Click on Barangays
            map.on("click", "barangay-fill", (e: any) => {
              if (e.features && e.features[0]) {
                const props = e.features[0].properties;
                onSelectBarangay(props.id);
                setInspectedBarangay(props);
              }
            });

            map.on("mouseenter", "barangay-fill", () => {
              map.getCanvas().style.cursor = "pointer";
            });

            map.on("mouseleave", "barangay-fill", () => {
              map.getCanvas().style.cursor = "";
            });
          }

          // 3. Priority Polygon Overlay (Demo B - Moderate priority)
          if (!map.getSource("demo-b-source")) {
            map.addSource("demo-b-source", {
              type: "geojson",
              data: demoBPolygonGeoJSON
            });

            map.addLayer({
              id: "demo-b-fill",
              type: "fill",
              source: "demo-b-source",
              paint: {
                "fill-color": "#fccf17",
                "fill-opacity": 0.35
              }
            });

            map.addLayer({
              id: "demo-b-line",
              type: "line",
              source: "demo-b-source",
              paint: {
                "line-color": "#05389f",
                "line-width": 2.5,
                "line-opacity": 0.95
              }
            });
          }

          // 4. Naga River Flood Hazard Zone
          if (!map.getSource("flood-hazard-source")) {
            map.addSource("flood-hazard-source", {
              type: "geojson",
              data: geospatialData.flood_hazard_zone
            });

            map.addLayer({
              id: "flood-hazard-layer",
              type: "fill",
              source: "flood-hazard-source",
              layout: {
                visibility: showFloodHazard ? "visible" : "none"
              },
              paint: {
                "fill-color": "#06b6d4",
                "fill-opacity": 0.35
              }
            });
          }

          // 5. Add Custom Priority Badge Marker (Matches user screenshot: circle with '!' and label)
          const priorityMarkerEl = document.createElement("div");
          priorityMarkerEl.className = "flex flex-col items-center pointer-events-auto cursor-pointer";
          priorityMarkerEl.innerHTML = `
            <div style="background-color: #fccf17; width: 34px; height: 34px; border-radius: 9999px; border: 2.5px solid #05389f; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(252, 207, 23, 0.5); font-weight: 900; color: #0a1128; font-size: 16px;">
              !
            </div>
            <div style="margin-top: 4px; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(4px); border: 1.5px solid #05389f; padding: 3px 8px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.12); font-size: 11px; font-weight: 800; color: #05389f; white-space: nowrap;">
              Demo B - Moderate priority
            </div>
          `;
          priorityMarkerEl.onclick = () => {
            const b = geospatialData.barangays_geojson.features.find((f: any) => f.properties.id === 27);
            if (b) setInspectedBarangay(b.properties);
          };

          new maplibregl.Marker({ element: priorityMarkerEl, anchor: "center" })
            .setLngLat([123.1932, 13.6228])
            .addTo(map);

          // 6. Add Plaza Medica Marker
          const plazaMedicaEl = document.createElement("div");
          plazaMedicaEl.className = "flex flex-col items-center pointer-events-auto cursor-pointer";
          plazaMedicaEl.innerHTML = `
            <div style="background: white; border: 1.5px solid #fecdd3; padding: 2px 6px; border-radius: 6px; box-shadow: 0 2px 6px rgba(0,0,0,0.08); display: flex; align-items: center; gap: 4px;">
              <span style="color: #e11d48; font-size: 14px; font-weight: bold;">+</span>
              <span style="font-size: 10px; font-weight: 700; color: #9f1239;">Plaza Medica</span>
            </div>
          `;
          new maplibregl.Marker({ element: plazaMedicaEl, anchor: "center" })
            .setLngLat([123.1941, 13.6211])
            .addTo(map);

          // 7. Add Interactive Labels for All 27 Categorized Barangays
          const features = geospatialData.barangays_geojson.features;
          markersRef.current.forEach((m) => m.remove());
          markersRef.current = [];

          features.forEach((f: any) => {
            const props = f.properties;
            const center = props.center;
            if (!center || center.length !== 2) return;

            const labelEl = document.createElement("div");
            labelEl.className = `barangay-map-label category-${props.category} pointer-events-auto cursor-pointer transition-all duration-200`;
            labelEl.style.transform = "translate(-50%, -50%)";
            labelEl.innerHTML = `
              <div style="background: rgba(255, 255, 255, 0.94); backdrop-filter: blur(4px); border: 1.5px solid ${props.category_color}; border-radius: 10px; padding: 3px 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.12); display: flex; flex-direction: column; align-items: center; gap: 1px;">
                <span style="font-size: 11px; font-weight: 800; color: #0a1128; white-space: nowrap;">${props.real_name || props.name}</span>
                <span style="font-size: 9px; font-weight: 700; color: ${props.category_color}; text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap;">${props.category_short || props.category}</span>
              </div>
            `;

            labelEl.onclick = () => {
              onSelectBarangay(props.id);
              setInspectedBarangay(props);
              map.flyTo({ center, zoom: 15.5, pitch: 58, essential: true, duration: 1500 });
            };

            const marker = new maplibregl.Marker({ element: labelEl, anchor: "center" })
              .setLngLat(center)
              .addTo(map);

            markersRef.current.push({ marker, category: props.category, id: props.id, element: labelEl });
          });

          mapInstanceRef.current = map;
        });

        map.on("error", (e: any) => {
          console.warn("MapLibre load warning:", e);
        });
      } catch (err: any) {
        console.error("MapLibre initialization error:", err);
        if (isMounted) {
          setMapError(err.message || "Could not load WebGL map engine");
        }
      }
    };

    initMap();

    return () => {
      isMounted = false;
      markersRef.current.forEach((m) => m.marker.remove());
      markersRef.current = [];
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [activeBasemap, onSelectBarangay]);

  // Update dynamic layers and category filters
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded) return;

    // 3D Buildings
    if (map.getLayer("building-3d")) {
      map.setLayoutProperty("building-3d", "visibility", show3DBuildings ? "visible" : "none");
    }

    // Priority Zone
    if (map.getLayer("demo-b-fill")) {
      map.setLayoutProperty("demo-b-fill", "visibility", showPriorityOverlay ? "visible" : "none");
      map.setLayoutProperty("demo-b-line", "visibility", showPriorityOverlay ? "visible" : "none");
    }

    // Flood Hazard
    if (map.getLayer("flood-hazard-layer")) {
      map.setLayoutProperty("flood-hazard-layer", "visibility", showFloodHazard ? "visible" : "none");
    }

    // Filter Markers based on Category and show/hide
    markersRef.current.forEach(({ element, category }) => {
      if (!showBarangayLabels) {
        element.style.display = "none";
      } else if (activeCategory === "all" || category === activeCategory) {
        element.style.display = "flex";
        element.style.opacity = "1";
      } else {
        element.style.display = "none";
      }
    });

    // Filter Polygon Fill based on Category
    if (map.getLayer("barangay-fill")) {
      if (activeCategory === "all") {
        map.setFilter("barangay-fill", null);
      } else {
        map.setFilter("barangay-fill", ["==", ["get", "category"], activeCategory]);
      }
    }
  }, [show3DBuildings, showPriorityOverlay, showFloodHazard, showBarangayLabels, showBarangayBoundaries, activeCategory, mapLoaded]);

  // Camera Flying controls
  const flyToSector = (category: string) => {
    const map = mapInstanceRef.current;
    if (!map) return;
    setActiveCategory(category);

    if (category === "all") {
      map.flyTo({ center: [123.215, 13.638], zoom: 12.8, pitch: 42, bearing: -15, essential: true, duration: 1800 });
    } else if (category === "upland") {
      // East Mount Isarog slope (Panicuason, Carolina, Pacol, Cararayan, San Isidro)
      map.flyTo({ center: [123.245, 13.655], zoom: 13.8, pitch: 55, bearing: -20, essential: true, duration: 1800 });
    } else if (category === "cbd") {
      // Downtown CBD (Triangulo, Tabuco, San Francisco, Dinaga, Santa Cruz)
      map.flyTo({ center: [123.187, 13.621], zoom: 15.6, pitch: 58, bearing: -25, essential: true, duration: 1800 });
    } else if (category === "growth") {
      // Highway Growth Corridor (Concepcion Pequeña/Grande, Del Rosario, Balatas)
      map.flyTo({ center: [123.210, 13.619], zoom: 14.5, pitch: 52, bearing: -10, essential: true, duration: 1800 });
    } else if (category === "poblacion") {
      // Heritage Poblacion (Peñafrancia, Liboton, Abella, Tinago)
      map.flyTo({ center: [123.190, 13.626], zoom: 15.4, pitch: 56, bearing: 15, essential: true, duration: 1800 });
    } else if (category === "riverine") {
      // River delta (Mabolo, Sabang, Calauag, San Felipe)
      map.flyTo({ center: [123.182, 13.618], zoom: 15.2, pitch: 58, bearing: -30, essential: true, duration: 1800 });
      setShowFloodHazard(true);
    }
  };

  const handleZoom = (delta: number) => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.zoomTo(map.getZoom() + delta, { duration: 300 });
  };

  const togglePitch = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const newPitch = map.getPitch() > 20 ? 0 : 58;
    map.easeTo({ pitch: newPitch, duration: 600 });
    setCurrentPitch(newPitch);
  };

  return (
    <div
      className={`relative w-full ${
        isMapMinimized ? "h-14" : "h-[620px]"
      } rounded-2xl overflow-hidden bg-[#f2f2f2] border border-[#e5e7eb] shadow-sm transition-all duration-300`}
    >
      {/* 1. Main Map Container */}
      <div ref={mapContainerRef} className={`w-full h-full ${isMapMinimized ? "invisible" : "visible"}`} />

      {/* 2. Top-Left Floating "Map Layers" Button & Dropdown */}
      {!isMapMinimized && (
        <div className="absolute top-4 left-4 z-20">
          <button
            onClick={() => setIsLayersOpen(!isLayersOpen)}
            className="flex items-center space-x-2 px-3.5 py-2 bg-white/95 hover:bg-white text-[#0a1128] rounded-xl shadow-md border border-[#e5e7eb] transition-all font-bold text-xs backdrop-blur-sm cursor-pointer"
          >
            <Layers className="w-4 h-4 text-[#05389f]" />
            <span className="font-extrabold text-[#0a1128] tracking-tight">Map Layers</span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-[#6b7280] transition-transform ${isLayersOpen ? "rotate-180" : ""}`}
            />
          </button>

          {/* Dropdown Menu */}
          {isLayersOpen && (
            <div className="mt-2 w-76 bg-white/98 backdrop-blur-md rounded-2xl shadow-xl border border-[#e5e7eb] p-4 text-xs text-[#0a1128] animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#f2f2f2] font-bold text-[#0a1128]">
                <span className="flex items-center space-x-1.5">
                  <Sliders className="w-3.5 h-3.5 text-[#05389f]" />
                  <span>Geospatial Overlays</span>
                </span>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] text-[#05389f] font-mono font-extrabold">27 Barangays</span>
                  <button
                    onClick={() => setIsLayersOpen(false)}
                    className="p-1 rounded-lg bg-[#f2f2f2] hover:bg-slate-200 text-[#6b7280] hover:text-[#0a1128] cursor-pointer"
                    title="Minimize Map Layers"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                {/* Barangay Labels & Category Badges */}
                <label className="flex items-center justify-between p-2 rounded-xl hover:bg-[#f2f2f2] cursor-pointer">
                  <div className="flex items-center space-x-2.5">
                    <MapPin className="w-4 h-4 text-[#05389f]" />
                    <div>
                      <div className="font-bold text-[#0a1128]">Barangay Labels & Badges</div>
                      <div className="text-[10px] text-[#6b7280]">Real names + official categories</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={showBarangayLabels}
                    onChange={(e) => setShowBarangayLabels(e.target.checked)}
                    className="rounded border-[#bebcbc] text-[#05389f] focus:ring-[#05389f] w-4 h-4 cursor-pointer"
                  />
                </label>

                {/* 3D Buildings */}
                <label className="flex items-center justify-between p-2 rounded-xl hover:bg-[#f2f2f2] cursor-pointer">
                  <div className="flex items-center space-x-2.5">
                    <Building2 className="w-4 h-4 text-[#05389f]" />
                    <div>
                      <div className="font-bold text-[#0a1128]">3D Buildings (OSM)</div>
                      <div className="text-[10px] text-[#6b7280]">Extruded architectural footprints</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={show3DBuildings}
                    onChange={(e) => setShow3DBuildings(e.target.checked)}
                    className="rounded border-[#bebcbc] text-[#05389f] focus:ring-[#05389f] w-4 h-4 cursor-pointer"
                  />
                </label>

                {/* Priority Zones (Demo B) */}
                <label className="flex items-center justify-between p-2 rounded-xl hover:bg-[#f2f2f2] cursor-pointer">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-4 h-4 rounded-full bg-[#fccf17] border border-[#05389f] flex items-center justify-center text-[10px] text-[#0a1128] font-black">
                      !
                    </div>
                    <div>
                      <div className="font-bold text-[#0a1128]">Priority Action Zones</div>
                      <div className="text-[10px] text-[#05389f] font-bold">Demo B - Moderate priority</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={showPriorityOverlay}
                    onChange={(e) => setShowPriorityOverlay(e.target.checked)}
                    className="rounded border-[#bebcbc] text-[#05389f] focus:ring-[#05389f] w-4 h-4 cursor-pointer"
                  />
                </label>

                {/* Flood Hazard */}
                <label className="flex items-center justify-between p-2 rounded-xl hover:bg-[#f2f2f2] cursor-pointer">
                  <div className="flex items-center space-x-2.5">
                    <Waves className="w-4 h-4 text-[#ea580c]" />
                    <div>
                      <div className="font-bold text-[#0a1128]">Naga River Flood Hazard</div>
                      <div className="text-[10px] text-[#6b7280]">DRRMO Inundation Basin (RA 10121)</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={showFloodHazard}
                    onChange={(e) => setShowFloodHazard(e.target.checked)}
                    className="rounded border-[#bebcbc] text-[#ea580c] focus:ring-[#ea580c] w-4 h-4 cursor-pointer"
                  />
                </label>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. Top-Right Mode Switcher: OSM 3D Downtown vs CesiumJS 3D Globe + Minimize Map */}
      <div className="absolute top-3 right-4 z-20 flex items-center space-x-2">
        <div className="bg-white/95 backdrop-blur-sm border border-[#e5e7eb] rounded-xl p-1 shadow-md flex items-center space-x-1">
          <button
            onClick={() => {
              if (isCesiumMode && onToggleCesium) onToggleCesium();
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center space-x-1.5 transition-colors cursor-pointer ${
              !isCesiumMode
                ? "bg-[#05389f] text-white shadow-xs"
                : "text-[#4b5563] hover:text-[#0a1128] hover:bg-[#f2f2f2]"
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-[#fccf17]" />
            <span>OSM 3D Downtown</span>
          </button>
          <button
            onClick={() => {
              if (!isCesiumMode && onToggleCesium) onToggleCesium();
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center space-x-1.5 transition-colors cursor-pointer ${
              isCesiumMode
                ? "bg-[#05389f] text-white shadow-xs"
                : "text-[#4b5563] hover:text-[#0a1128] hover:bg-[#f2f2f2]"
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>CesiumJS 3D Globe</span>
          </button>
          <button
            onClick={() => setIsMapMinimized(!isMapMinimized)}
            className="px-2.5 py-1.5 text-xs font-bold rounded-lg flex items-center space-x-1 text-[#0a1128] hover:bg-[#f2f2f2] transition-colors cursor-pointer"
            title={isMapMinimized ? "Expand 3D Map" : "Minimize 3D Map"}
          >
            {isMapMinimized ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            <span>{isMapMinimized ? "Expand" : "Minimize"}</span>
          </button>
        </div>
      </div>

      {/* 4. Bottom-Left Category Sector Filter Pill Bar (Minimizable) */}
      {!isMapMinimized && (
        <div className="absolute bottom-4 left-4 z-20 flex flex-wrap items-center gap-1.5 bg-white/95 backdrop-blur-md p-1.5 rounded-2xl border border-[#e5e7eb] shadow-lg max-w-[90%] sm:max-w-none">
          <button
            onClick={() => setIsCategoriesMinimized(!isCategoriesMinimized)}
            className="flex items-center space-x-1 text-[10px] font-extrabold text-[#05389f] uppercase tracking-wider px-2 py-1 rounded-xl hover:bg-[#f2f2f2] cursor-pointer"
            title={isCategoriesMinimized ? "Expand Categories" : "Minimize Categories"}
          >
            <span>Categories</span>
            {isCategoriesMinimized ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          {!isCategoriesMinimized &&
            CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => flyToSector(cat.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#05389f] text-white shadow-xs"
                      : "text-[#4b5563] hover:text-[#0a1128] hover:bg-[#f2f2f2]"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" style={{ color: isActive ? "#fccf17" : cat.color }} />
                  <span>{cat.short}</span>
                  <span
                    className="text-[10px] px-1 rounded-full font-mono"
                    style={{ backgroundColor: isActive ? "rgba(255,255,255,0.2)" : "#f2f2f2" }}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
        </div>
      )}

      {/* 5. Bottom-Right Navigation Controls (+ / - / 3D Tilt / Reset) */}
      {!isMapMinimized && (
        <div className="absolute bottom-4 right-4 z-20 flex flex-col items-center space-y-1.5">
          <div className="bg-white/95 backdrop-blur-sm border border-[#e5e7eb] rounded-xl shadow-md flex flex-col overflow-hidden">
            <button
              onClick={() => handleZoom(0.8)}
              title="Zoom In"
              className="p-2 text-[#0a1128] hover:bg-[#f2f2f2] border-b border-[#e5e7eb] transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleZoom(-0.8)}
              title="Zoom Out"
              className="p-2 text-[#0a1128] hover:bg-[#f2f2f2] transition-colors cursor-pointer"
            >
              <Minus className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={togglePitch}
            title="Toggle 2D / 3D Tilt Angle"
            className="p-2 bg-white/95 backdrop-blur-sm border border-[#e5e7eb] rounded-xl shadow-md text-[#0a1128] hover:bg-[#f2f2f2] font-black text-xs transition-colors cursor-pointer"
          >
            {currentPitch > 20 ? "3D" : "2D"}
          </button>

          <button
            onClick={() => flyToSector("all")}
            title="Reset Camera Orientation"
            className="p-2 bg-white/95 backdrop-blur-sm border border-[#e5e7eb] rounded-xl shadow-md text-[#0a1128] hover:bg-[#f2f2f2] transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 6. Active Inspected Barangay Drawer / Overlay Card (Minimizable) */}
      {!isMapMinimized && inspectedBarangay && (
        <div
          className={`absolute top-16 right-4 z-20 bg-white/98 backdrop-blur-md rounded-2xl shadow-2xl border-2 border-[#05389f]/20 text-xs text-[#0a1128] animate-in fade-in duration-200 transition-all ${
            isInspectedMinimized ? "w-64 p-3" : "w-84 p-4"
          }`}
        >
          <div className={`flex items-center justify-between ${isInspectedMinimized ? "" : "pb-2 mb-2 border-b border-[#f2f2f2]"}`}>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: inspectedBarangay.category_color || "#05389f" }} />
              <div>
                <h4 className="font-extrabold text-[#0a1128] text-sm leading-tight">
                  {inspectedBarangay.real_name || inspectedBarangay.name}
                </h4>
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: inspectedBarangay.category_color || "#05389f" }}>
                  {inspectedBarangay.category_short || inspectedBarangay.category}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setIsInspectedMinimized(!isInspectedMinimized)}
                className="w-6 h-6 rounded-full bg-[#f2f2f2] hover:bg-slate-200 flex items-center justify-center text-[#6b7280] font-bold text-xs cursor-pointer"
                title={isInspectedMinimized ? "Expand Details" : "Minimize Details"}
              >
                {isInspectedMinimized ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setInspectedBarangay(null)}
                className="w-6 h-6 rounded-full bg-[#f2f2f2] hover:bg-slate-200 flex items-center justify-center text-[#6b7280] font-bold text-xs cursor-pointer"
                title="Close"
              >
                ✕
              </button>
            </div>
          </div>

          {!isInspectedMinimized && (
            <>
              <p className="text-[#4b5563] text-[11px] leading-relaxed mb-3">
                {inspectedBarangay.district} • {inspectedBarangay.category_name}
              </p>

              <div className="grid grid-cols-2 gap-2 text-[10px] mb-3">
                <div className="bg-[#f2f2f2] p-2 rounded-xl border border-[#e5e7eb]">
                  <span className="text-[#6b7280] uppercase font-bold">Households</span>
                  <div className="font-black text-[#0a1128] text-xs mt-0.5 font-mono">
                    {inspectedBarangay.households?.toLocaleString()} HHs
                  </div>
                </div>
                <div className="bg-[#edf3fc] p-2 rounded-xl border border-[#05389f]/20">
                  <span className="text-[#05389f] uppercase font-bold">MVI Score</span>
                  <div className="font-black text-[#05389f] text-xs mt-0.5 font-mono">
                    {inspectedBarangay.vulnerability_index} / 100
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 text-[11px] bg-[#f7f8fa] p-2.5 rounded-xl border border-[#e5e7eb] mb-3">
                <div className="flex justify-between">
                  <span className="text-[#6b7280]">Weak Roof Structure:</span>
                  <span className="font-bold text-rose-700 font-mono">{inspectedBarangay.weak_roof_pct}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6b7280]">Refilling Dependency:</span>
                  <span className="font-bold text-[#05389f] font-mono">{inspectedBarangay.refilling_dependency}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6b7280]">Food Insecurity Count:</span>
                  <span className="font-bold text-amber-800 font-mono">{inspectedBarangay.food_insecurity_count || 120} HHs</span>
                </div>
              </div>

              <button
                onClick={() => {
                  onSelectBarangay(inspectedBarangay.id);
                }}
                className="pill-btn-blue w-full py-2 text-xs font-bold text-center cursor-pointer shadow-xs"
              >
                Focus Barangay Telemetry →
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
