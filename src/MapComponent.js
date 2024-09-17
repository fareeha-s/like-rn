import React, { useState, useEffect, useRef } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { SearchBar } from './components/SearchBar';
import ActivityButtons from './components/ActivityButtons';
import BottomModal from './components/BottomModal';
import { getFirebaseDatabase } from './firebase';
import { ref, set, onValue } from "firebase/database";
import DurationSelector from './components/DurationSelector';

const mapContainerStyle = { width: '100%', height: '100vh' };
const defaultCenter = { lat: 37.872874, lng: -122.259425 }; // Updated UC Berkeley coordinates

const globalStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;700&display=swap');
  * {
    font-family: 'Plus Jakarta Sans', sans-serif;
  }
`;

const activityEmojis = {
  run: '🏃',
  walk: '🚶'
};

const createMarkerIcon = (emoji, showSparkles) => ({
  url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40" width="60" height="40">
      <defs>
        <filter id="subtleGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1" result="glow"/>
          <feMerge>
            <feMergeNode in="glow"/>
            <feMergeNode in="glow"/>
            <feMergeNode in="glow"/>
          </feMerge>
        </filter>
        <filter id="shadow">
          <feDropShadow dx="0" dy="0" stdDeviation="1" flood-color="#000000" flood-opacity="0.3"/>
        </filter>
        <style>
          @keyframes sparkle {
            0% { opacity: 0; transform: translateY(0); }
            10% { opacity: 1; transform: translateY(-2px); }
            50% { opacity: 1; transform: translateY(1px); }
            90% { opacity: 1; transform: translateY(-1px); }
            100% { opacity: 0; transform: translateY(0); }
          }
          .sparkle { 
            animation: sparkle 1s ease-out forwards;
          }
          .sparkle:nth-child(2) {
            animation-delay: 0.2s;
          }
        </style>
      </defs>
      <text x="30" y="28" font-family="Plus Jakarta Sans, sans-serif" font-size="24px" fill="white" text-anchor="middle" dominant-baseline="middle" filter="url(#subtleGlow)">
        ${emoji}
      </text>
      <text x="30" y="28" font-family="Plus Jakarta Sans, sans-serif" font-size="24px" fill="white" text-anchor="middle" dominant-baseline="middle" filter="url(#shadow)">
        ${emoji}
      </text>
      ${showSparkles ? `
        <text x="10" y="20" font-family="Plus Jakarta Sans, sans-serif" font-size="12px" fill="white" text-anchor="middle" dominant-baseline="middle" class="sparkle">✨</text>
        <text x="50" y="36" font-family="Plus Jakarta Sans, sans-serif" font-size="12px" fill="white" text-anchor="middle" dominant-baseline="middle" class="sparkle">✨</text>
      ` : ''}
    </svg>
  `)}`,
  scaledSize: { width: 60, height: 40 },
  anchor: { x: 30, y: 20 },
});

const MapComponent = () => {
  const [center, setCenter] = useState(defaultCenter);
  const [zoom, setZoom] = useState(18); // Starting with a much higher zoom level
  const [markerPosition, setMarkerPosition] = useState(defaultCenter);
  const [activityType, setActivityType] = useState('run');
  const [hasPinned, setHasPinned] = useState(false);
  const [mapType, setMapType] = useState('satellite');
  const [showSparkles, setShowSparkles] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(30); // Default to 30 minutes
  const mapRef = useRef(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCenter(pos);
          setMarkerPosition(pos);
        },
        () => console.log("Error: The Geolocation service failed.")
      );
    }
  }, []);

  const handleMapClick = (event) => {
    const newPosition = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng()
    };
    setMarkerPosition(newPosition);
    setHasPinned(true);
    setShowSparkles(true);
    setTimeout(() => setShowSparkles(false), 1000); // Reset after 1 second
  };

  const handleMarkerDragEnd = (e) => {
    const newPosition = { lat: e.latLng.lat(), lng: e.latLng.lng() };
    setMarkerPosition(newPosition);
    setShowSparkles(true);
    setTimeout(() => setShowSparkles(false), 1000); // Reset after 1 second
  };

  const toggleMapType = () => {
    setMapType(prevType => prevType === 'roadmap' ? 'satellite' : 'roadmap');
  };

  const handleLocationReset = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCenter(pos);
          setMarkerPosition(pos);
          if (mapRef.current) {
            mapRef.current.panTo(pos);
            mapRef.current.setZoom(18);
          }
        },
        () => {
          console.log("Error: The Geolocation service failed.");
        }
      );
    } else {
      console.log("Error: Your browser doesn't support geolocation.");
    }
  };

  const handleAnimationComplete = () => {
    console.log('Animation completed');
  };

  const handleDurationSelect = (duration) => {
    setSelectedDuration(duration);
  };

  return (
    <div style={{ position: 'relative', height: '100vh', width: '100%' }}>
      <style>{globalStyle}</style>
      <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY} libraries={["places"]}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={zoom}
          onClick={handleMapClick}
          options={{
            mapTypeId: mapType,
            disableDefaultUI: true,
            zoomControl: false,
            tilt: 0,
          }}
          onLoad={(map) => { mapRef.current = map; }}
        >
          {!hasPinned && markerPosition && (
            <Marker position={markerPosition} />
          )}
          {hasPinned && markerPosition && (
            <Marker
              position={markerPosition}
              draggable={true}
              onDragEnd={handleMarkerDragEnd}
              icon={createMarkerIcon(activityEmojis[activityType], showSparkles)}
            />
          )}
        </GoogleMap>
        
        <div style={{ position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)', width: '90%', maxWidth: '400px', zIndex: 10 }}>
          <SearchBar setCenter={setCenter} setZoom={setZoom} />
        </div>
        
        <div style={{ position: 'absolute', top: '80px', left: '50%', transform: 'translateX(-50%)', zIndex: 10, display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', maxWidth: '400px' }}>
          <ActivityButtons activityType={activityType} setActivityType={setActivityType} />
          <div style={{ marginLeft: '10px' }}>
            <DurationSelector onDurationSelect={handleDurationSelect} />
          </div>
        </div>

        <BottomModal 
          activityType={activityType} 
          markerPosition={markerPosition} 
          onAnimationComplete={handleAnimationComplete}
          duration={selectedDuration}
        />

        {/* Map controls */}
        <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 1000, display: 'flex', flexDirection: 'row' }}>
          <button 
            onClick={toggleMapType}
            style={{
              background: 'rgba(255, 255, 255, 0.8)',
              border: 'none',
              borderRadius: '4px',
              padding: '8px',
              marginRight: '10px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'normal', // Changed from 'bold' to 'normal'
              color: '#1a73e8',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {mapType === 'roadmap' ? '🛰️' : '🗺️'}
            <span style={{ marginLeft: '4px' }}>view</span>
          </button>
          <button 
            onClick={handleLocationReset}
            style={{
              background: 'rgba(255, 255, 255, 0.8)',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
              <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0013 3.06V1h-2v2.06A8.994 8.994 0 003.06 11H1v2h2.06A8.994 8.994 0 0011 20.94V23h2v-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" fill="#1a73e8"/>
            </svg>
          </button>
        </div>
      </LoadScript>
      
      {!hasPinned && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: 'white',
          fontSize: '18px',
          fontWeight: 'bold',
          textAlign: 'center',
          zIndex: 1000,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          textShadow: `
            -1px -1px 0 rgba(0,0,0,0.3),  
             1px -1px 0 rgba(0,0,0,0.3),
            -1px  1px 0 rgba(0,0,0,0.3),
             1px  1px 0 rgba(0,0,0,0.3),
            0px 2px 4px rgba(0,0,0,0.3)
          `,
        }}>
          pin your start point
        </div>
      )}
    </div>
  );
};

export default MapComponent;