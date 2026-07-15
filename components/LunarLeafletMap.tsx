"use client";
import SearchBox from "@/components/moon-map/SearchBox";
import type { AtlasSearchResult } from "@/lib/search-index";
import VisibleParcelLayer from "@/components/moon-map/VisibleParcelLayer";
import StateLayer from "@/components/moon-map/StateLayer";
import CityLayer from "@/components/moon-map/CityLayer";
import TownLayer from "@/components/moon-map/TownLayer";
import ParcelLayer from "@/components/moon-map/ParcelLayer";
import LunarTileLayer from "@/components/moon-map/LunarTileLayer";
import PropertyInfoPanel from "@/components/moon-map/PropertyInfoPanel";
import type { ParcelCell } from "@/lib/parcel-grid";
import { getParcelGridForZoom } from "@/lib/parcel-grid";
import { getVisibleLunarAttractions } from "@/lib/lunar-attractions";
import {
  getCitiesByState,
  getTownsByState,
  getLocationCoordinates,
} from "@/lib/lunar-location-service";
import { stateCenters } from "@/lib/property-coordinates";
import ReservationCountdown from "@/components/moon-map/ReservationCountdown";
import { useEffect, useMemo, useState } from "react";
import "leaflet/dist/leaflet.css";
import {
  MapContainer,
  ImageOverlay,
  Polygon,
  Popup,
  Marker,
  ZoomControl,
  ScaleControl,
  useMap,
} from "react-leaflet";
import { CRS, Transformation, divIcon } from "leaflet";
import { lunarMapRegions } from "@/lib/lunar-map-regions";

type SelectedProperty = {
  id: string;
  type: string;
  state: string;
  status: string;
  mapX?: number | null;
  mapY?: number | null;
};

type ActiveReservation = {
  reservationId: string;
  parcelKey: string;
  expiresAt: string;
};

const lunarCoordinateScale = 256 / 1000;

const LunarCRS = {
  ...CRS.Simple,
  transformation: new Transformation(
    lunarCoordinateScale,
    0,
    -lunarCoordinateScale,
    256
  ),
};

function TrackZoomLevel({
  onZoomChange,
}: {
  onZoomChange: (zoom: number) => void;
}) {
  const map = useMap();

  useEffect(() => {
    onZoomChange(map.getZoom());

    const handleZoom = () => {
      onZoomChange(map.getZoom());
    };

    map.on("zoomend", handleZoom);

    return () => {
      map.off("zoomend", handleZoom);
    };
  }, [map, onZoomChange]);

  return null;
}

function FlyToSearchResult({
  searchResult,
}: {
  searchResult: AtlasSearchResult | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (!searchResult) {
      return;
    }

    map.flyTo([searchResult.y, searchResult.x], searchResult.zoom, {
      duration: 1.4,
    });
  }, [map, searchResult]);

  return null;
}

function FlyToSelectedProperty({
  selectedProperty,
}: {
  selectedProperty?: SelectedProperty | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (selectedProperty?.mapX && selectedProperty?.mapY) {
      map.flyTo([selectedProperty.mapY, selectedProperty.mapX], 2, {
        duration: 1.2,
      });
    }
  }, [map, selectedProperty]);

  return null;
}

function FlyToSelectedState({
  selectedState,
}: {
  selectedState: string | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (!selectedState) return;

    const center = stateCenters[selectedState] ?? stateCenters.Default;

    map.flyTo([center.y, center.x], 1, {
      duration: 1.2,
    });
  }, [map, selectedState]);

  return null;
}

function MapHomeButton({ onReset }: { onReset: () => void }) {
  const map = useMap();

  return (
    <button
      type="button"
      onClick={() => {
        map.flyTo([500, 500], 0, {
          duration: 1.2,
        });

        onReset();
      }}
      className="absolute left-4 top-4 z-[1000] rounded-xl bg-yellow-400 px-4 py-2 font-black text-black shadow-lg"
    >
      🌕 Full Moon
    </button>
  );
}

export default function LunarLeafletMap({
  selectedProperty,
  nearbyProperties = [],
  ownedProperties = [],
}: {
  selectedProperty?: SelectedProperty | null;
  nearbyProperties?: SelectedProperty[];
  ownedProperties?: SelectedProperty[];
}) {
  const bounds = [
    [0, 0],
    [1000, 1000],
  ] as [[number, number], [number, number]];

  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(0);
  const [selectedSearchResult, setSelectedSearchResult] =
     useState<AtlasSearchResult | null>(null);
  const [showStates, setShowStates] = useState(true);
  const [showCities, setShowCities] = useState(true);
  const [showTowns, setShowTowns] = useState(false);
  const [showProperties, setShowProperties] = useState(true);
  const [showAttractions, setShowAttractions] = useState(true);
  const [reservingParcel, setReservingParcel] = useState(false);
  const [selectedParcelKey, setSelectedParcelKey] = useState<string | null>(null);
  const [selectedParcel, setSelectedParcel] = useState<ParcelCell | null>(null);
  const [activeReservation, setActiveReservation] =
     useState<ActiveReservation | null>(null);
  const [parcelStatuses, setParcelStatuses] = useState<Record<string, string>>(
    {}
  );

  const visibleCities = selectedState
    ? getCitiesByState(selectedState).map((city) => ({
        name: city,
        ...getLocationCoordinates(selectedState, city, "city"),
      }))
    : [];

  const visibleTowns = selectedState
    ? getTownsByState(selectedState).map((town) => ({
        name: town,
        ...getLocationCoordinates(selectedState, town, "town"),
      }))
    : [];

  const visibleAttractions = getVisibleLunarAttractions(zoomLevel);

  const visibleParcels = useMemo(() => {
  return selectedState ? getParcelGridForZoom(selectedState, zoomLevel) : [];
}, [selectedState, zoomLevel]);

  useEffect(() => {
    if (visibleParcels.length === 0) {
      setParcelStatuses({});
      return;
    }

    async function loadParcelStatuses() {
      const response = await fetch("/api/parcel-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          parcelKeys: visibleParcels.map((parcel) => parcel.parcelKey),
        }),
      });

      const data = await response.json();
      setParcelStatuses(data.statuses || {});
    }

    loadParcelStatuses();
  }, [visibleParcels]);

  const selectedPropertyIcon = divIcon({
    className: "",
    html: `<div style="
      background:#facc15;
      color:#000;
      font-weight:900;
      padding:6px 10px;
      border-radius:999px;
      border:2px solid #000;
      box-shadow:0 0 18px rgba(250,204,21,0.9);
      white-space:nowrap;
    ">📍 ${selectedProperty?.id || "Property"}</div>`,
  });

  async function reserveParcel(parcel: {
    parcelKey: string;
    stateName: string;
    centerX: number;
    centerY: number;
  }) {
    if (reservingParcel) return;

    try {
      setReservingParcel(true);
      setSelectedParcelKey(parcel.parcelKey);

      const response = await fetch("/api/reserve-property", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          stateName: parcel.stateName,
          propertyType: "Rural Acre",
          parcelKey: parcel.parcelKey,
          acreage: 1,
          mapX: parcel.centerX,
          mapY: parcel.centerY,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Unable to reserve parcel.");
        return;
      }

      setActiveReservation({
        reservationId: data.reservationId,
        parcelKey: data.parcelKey,
        expiresAt: data.expiresAt,
      });
    } finally {
      setReservingParcel(false);
    }
  }
      const useTileAtlas = true;

  return (
    <div className="mx-auto mt-10 w-full max-w-7xl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-yellow-400/30 bg-black/70 px-5 py-4">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.25em] text-yellow-400">
            Lunar Atlas Viewer
          </p>
          <p className="mt-1 text-sm text-gray-400">
            Zoom, drag, and select highlighted lunar states.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 text-xs font-bold uppercase text-gray-300">
          <span className="rounded-full border border-white/20 px-3 py-1">
            Drag to Pan
          </span>
          <span className="rounded-full border border-white/20 px-3 py-1">
            Scroll to Zoom
          </span>
          <span className="rounded-full border border-yellow-400/50 px-3 py-1 text-yellow-400">
            Click State
          </span>
          <span className="rounded-full border border-green-500 px-3 py-1 text-green-400">
            Available
          </span>
          <span className="rounded-full border border-blue-500 px-3 py-1 text-blue-400">
            Reserved
          </span>
          <span className="rounded-full border border-red-500 px-3 py-1 text-red-400">
            Sold
          </span>

          <label className="flex items-center gap-1 rounded-full border border-white/20 px-3 py-1">
            <input
              type="checkbox"
              checked={showStates}
              onChange={() => setShowStates(!showStates)}
            />
            States
          </label>

          <label className="flex items-center gap-1 rounded-full border border-white/20 px-3 py-1">
            <input
              type="checkbox"
              checked={showCities}
              onChange={() => setShowCities(!showCities)}
            />
            Cities
          </label>

          <label className="flex items-center gap-1 rounded-full border border-white/20 px-3 py-1">
            <input
              type="checkbox"
              checked={showTowns}
              onChange={() => setShowTowns(!showTowns)}
            />
            Towns
          </label>

          <label className="flex items-center gap-1 rounded-full border border-white/20 px-3 py-1">
            <input
              type="checkbox"
              checked={showProperties}
              onChange={() => setShowProperties(!showProperties)}
            />
            Properties
          </label>

          <label className="flex items-center gap-1 rounded-full border border-white/20 px-3 py-1">
            <input
              type="checkbox"
              checked={showAttractions}
              onChange={() => setShowAttractions(!showAttractions)}
            />
            Attractions
          </label>
        </div>
      </div>
            <div className="mb-4">
              <SearchBox
                onSelectResult={(result) => {
                setSelectedSearchResult(result);

                  if (result.type === "Attraction") {
                  setShowAttractions(true);
                 }
                }}
              />
            </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="h-[850px] overflow-hidden rounded-3xl border border-yellow-400/40 bg-black shadow-2xl">
          <MapContainer
            key="orbital-one-lunar-map"
            crs={LunarCRS}
            center={[500, 500]}
            zoom={0}
            minZoom={-2}
            maxZoom={7}
            zoomControl={false}
            preferCanvas={true}
            zoomSnap={1}
            zoomDelta={1}
            zoomAnimation={true}
            fadeAnimation={true}
            markerZoomAnimation={true}
            inertia={true}
            inertiaDeceleration={3000}
            inertiaMaxSpeed={1200}
            wheelPxPerZoomLevel={60}
            wheelDebounceTime={40}
            maxBounds={bounds}
            maxBoundsViscosity={0.7}
            style={{
              height: "100%",
              width: "100%",
              background: "#000",
            }}
          >
            <ZoomControl position="topright" />
            <ScaleControl position="bottomleft" />
            <FlyToSelectedProperty selectedProperty={selectedProperty} />
            <FlyToSelectedState selectedState={selectedState} />
            <FlyToSearchResult searchResult={selectedSearchResult} />
            <TrackZoomLevel onZoomChange={setZoomLevel} />
            <MapHomeButton
              onReset={() => {
                setSelectedState(null);
                setShowTowns(false);
              }}
            />

            {useTileAtlas ? (
               <LunarTileLayer />
                ) : (
               <ImageOverlay url="/atlas/moon-atlas-v2.jpg" bounds={bounds} />
            )}

            <StateLayer
              showStates={showStates}
              selectedState={selectedState}
              onSelectState={setSelectedState}
            />

            <CityLayer
              showCities={showCities}
              zoomLevel={zoomLevel}
              cities={visibleCities}
            />

            <TownLayer
              showTowns={showTowns}
              zoomLevel={zoomLevel}
              towns={visibleTowns}
            />

            {selectedState && (
              <VisibleParcelLayer
                 parcels={visibleParcels}
                 parcelStatuses={parcelStatuses}
                 selectedParcelKey={selectedParcelKey}
                 onSelect={(parcel) => {
                 setSelectedParcel(parcel);
                 setSelectedParcelKey(parcel.parcelKey);
                }}
              />
            )}

            {showAttractions &&
               visibleAttractions.map((attraction) => (
                <Marker
                  key={`attraction-${attraction.id}`}
                  position={[attraction.y, attraction.x]}
                  icon={divIcon({
                    className: "",
                    html: `<div style="
                      background:#38bdf8;
                      color:#000;
                      font-weight:900;
                      padding:6px 10px;
                      border-radius:999px;
                      border:2px solid #000;
                      box-shadow:0 0 14px rgba(56,189,248,0.8);
                      white-space:nowrap;
                      font-size:11px;
                    ">🛰 ${attraction.name}</div>`,
                  })}
                >
                  <Popup>
                    <div style={{ minWidth: "240px" }}>
                      <strong>{attraction.name}</strong>
                      <br />
                      {attraction.type}
                      <br />
                      State: {attraction.state}
                      <br />
                      <br />
                      {attraction.description}
                      <br />
                      <br />
                      <a href={`/attractions/${attraction.id}`}>
                        View Attraction
                      </a>
                    </div>
                  </Popup>
                </Marker>
              ))}

            {showProperties &&
              ownedProperties.map((property) =>
                property.mapX && property.mapY ? (
                  <Marker
                    key={`owned-${property.id}`}
                    position={[property.mapY, property.mapX]}
                    icon={divIcon({
                      className: "",
                      html: `<div style="
                        background:#facc15;
                        color:#000;
                        font-weight:900;
                        padding:7px 11px;
                        border-radius:999px;
                        border:2px solid #fff;
                        box-shadow:0 0 22px rgba(250,204,21,1);
                        white-space:nowrap;
                        font-size:12px;
                      ">⭐ ${property.id}</div>`,
                    })}
                  >
                    <Popup>
                      <div style={{ minWidth: "190px" }}>
                        <strong>{property.id}</strong>
                        <br />
                        Owned by You
                        <br />
                        {property.type}
                        <br />
                        {property.state}
                        <br />
                        <br />
                        <a href={`/explore/${property.id}`}>View Property</a>
                      </div>
                    </Popup>
                  </Marker>
                ) : null
              )}

            {showProperties &&
              zoomLevel >= 0 &&
              nearbyProperties.map((property) =>
                property.mapX && property.mapY ? (
                  <Marker
                    key={`nearby-${property.id}`}
                    position={[property.mapY, property.mapX]}
                    icon={divIcon({
                      className: "",
                      html: `<div style="
                        background:${
                          property.status === "Sold" ? "#dc2626" : "#22c55e"
                        };
                        color:${
                          property.status === "Sold" ? "#fff" : "#000"
                        };
                        font-weight:900;
                        padding:5px 9px;
                        border-radius:999px;
                        border:2px solid #000;
                        box-shadow:0 0 12px rgba(255,255,255,0.45);
                        white-space:nowrap;
                        font-size:11px;
                      ">${property.id}</div>`,
                    })}
                  >
                    <Popup>
                      <div style={{ minWidth: "180px" }}>
                        <strong>{property.id}</strong>
                        <br />
                        {property.type}
                        <br />
                        {property.state}
                        <br />
                        Status: {property.status}
                        <br />
                        <br />
                        <a href={`/explore/${property.id}`}>View Property</a>
                      </div>
                    </Popup>
                  </Marker>
                ) : null
              )}

            {showProperties &&
              selectedProperty?.mapX &&
              selectedProperty?.mapY && (
                <Marker
                  position={[selectedProperty.mapY, selectedProperty.mapX]}
                  icon={selectedPropertyIcon}
                >
                  <Popup>
                    <div style={{ minWidth: "180px" }}>
                      <strong>{selectedProperty.id}</strong>
                      <br />
                      {selectedProperty.type}
                      <br />
                      {selectedProperty.state}
                      <br />
                      Status: {selectedProperty.status}
                      <br />
                      <br />
                      <a href={`/explore/${selectedProperty.id}`}>
                        View Property Details
                      </a>
                    </div>
                  </Popup>
                </Marker>
              )}
          </MapContainer>
        </div>

        <PropertyInfoPanel
  selectedParcel={selectedParcel}
  selectedState={selectedState}
  activeReservation={activeReservation}
  reservingParcel={reservingParcel}
  zoomLevel={zoomLevel}
  selectedParcelStatus={
  selectedParcel
    ? parcelStatuses[selectedParcel.parcelKey] || "Available"
    : "Available"
}
  onReserve={reserveParcel}
  onExpired={async () => {
    if (!activeReservation) return;

    await fetch("/api/release-reservation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        reservationId: activeReservation.reservationId,
      }),
    });

    setParcelStatuses((currentStatuses) => {
      const nextStatuses = { ...currentStatuses };
      delete nextStatuses[activeReservation.parcelKey];
      return nextStatuses;
    });

    setActiveReservation(null);
    setSelectedParcelKey(null);
    setSelectedParcel(null);
  }}
  onCancelReservation={async () => {
  if (!activeReservation) return;

  const response = await fetch("/api/release-reservation", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      reservationId: activeReservation.reservationId,
    }),
  });

  if (!response.ok) {
    const data = await response.json();
    alert(data.error || "Unable to cancel the reservation.");
    return;
  }

  setParcelStatuses((currentStatuses) => {
    const nextStatuses = { ...currentStatuses };
    delete nextStatuses[activeReservation.parcelKey];
    return nextStatuses;
  });

  setActiveReservation(null);
  setSelectedParcelKey(null);
  setSelectedParcel(null);
}}
/>
      </div>
    </div>
  );
}