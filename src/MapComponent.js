import React, { useState, useEffect, useRef } from 'react';
import { GoogleMap, LoadScript, Marker, OverlayView } from '@react-google-maps/api';
import { SearchBar } from './components/SearchBar';
import ActivityButtons from './components/ActivityButtons';
import BottomModal from './components/BottomModal';
import { getFirebaseDatabase } from './firebase';
import { ref, set, onValue } from "firebase/database";
import DurationSelector from './components/DurationSelector';

const mapContainerStyle = {
  width: '100%',
  height: '100vh',
};

const defaultCenter = {
  lat: 37.8719,
  lng: -122.2585,
};

const globalStyle = `
  * {
    font-family: 'Plus Jakarta Sans', sans-serif;
  }
`;

const generateMapLink = (latitude, longitude) => {
  return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
};

const MapComponent = () => {
  const [center, setCenter] = useState(defaultCenter);
  const [zoom, setZoom] = useState(18);
  const [markerPosition, setMarkerPosition] = useState(null);
  const [showLabel, setShowLabel] = useState(true);
  const [activityType, setActivityType] = useState('run');
  const [showPinLabel, setShowPinLabel] = useState(true);

  const mapRef = useRef(null);

  useEffect(() => {
    const database = getFirebaseDatabase();
    if (database) {
      const pinRef = ref(database, 'pin');
      onValue(pinRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setMarkerPosition(data);
          setShowPinLabel(false);
        }
      });
    }
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCenter(pos);
          updatePinPosition(pos);
        },
        () => {
          console.log("Error: The Geolocation service failed.");
        }
      );
    } else {
      console.log("Error: Your browser doesn't support geolocation.");
    }
  }, []);

  useEffect(() => {
    if (markerPosition) {
      setTimeout(() => setShowPinLabel(true), 500);
    }
  }, [markerPosition]);

  const handleMapClick = (event) => {
    const newPosition = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng()
    };
    updatePinPosition(newPosition);
  };

  const handleMarkerDragEnd = (e) => {
    const newPosition = { lat: e.latLng.lat(), lng: e.latLng.lng() };
    updatePinPosition(newPosition);
  };

  const updatePinPosition = (position) => {
    setMarkerPosition(position);
    setShowPinLabel(false);
    const database = getFirebaseDatabase();
    if (database) {
      const pinRef = ref(database, 'pin');
      set(pinRef, position).catch(error => {
        console.error("Error updating pin position:", error);
      });
    } else {
      console.error("Firebase database is not initialized");
    }
  };

  const PinLabel = ({ showText }) => (
    <div style={{
      color: 'white',
      fontSize: '16px',
      fontWeight: 'bold',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
      position: 'relative',
      bottom: '50px',
      left: '50%',
      transform: 'translateX(-50%)',
      whiteSpace: 'nowrap',
      opacity: 1,
      transition: 'opacity 0.5s ease-in-out',
    }}>
      meet here  {showText }
    </div>
  );

  const handleLocationReset = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCenter(pos);
          updatePinPosition(pos);
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

  console.log("Rendering map, marker position:", markerPosition);

  const handleDurationSelect = (duration) => {
    console.log('Selected duration:', duration);
    // You can add more logic here if needed
  };

  return (
    <div style={{ position: 'relative', height: '100vh', width: '100%' }}>
      <style>{globalStyle}</style>
      <LoadScript 
        googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
        libraries={["places"]}
      >
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={zoom}
          onClick={handleMapClick}
          options={{
            mapTypeId: 'satellite',
            disableDefaultUI: true,
            tilt: 0,
            zoomControl: false,
            mapTypeControl: false,
            scaleControl: false,
            streetViewControl: false,
            rotateControl: false,
            fullscreenControl: false
          }}
          onLoad={(map) => {
            mapRef.current = map;
          }}
        >
          {markerPosition && (
            <>
              <Marker 
                position={markerPosition} 
                draggable={true} 
                onDragEnd={handleMarkerDragEnd} 
              />
              <OverlayView
                position={markerPosition}
                mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
              >
                <PinLabel showText={showPinLabel} />
              </OverlayView>
            </>
          )}
        </GoogleMap>
        
        {/* Search bar */}
        <div style={{ 
          position: 'absolute', 
          top: '20px', 
          left: '50%', 
          transform: 'translateX(-50%)', 
          width: '90%', 
          maxWidth: '400px', 
          zIndex: 10 
        }}>
          <SearchBar setCenter={setCenter} setZoom={setZoom} />
        </div>
        
        {/* Activity type buttons and Duration Selector */}
        <div style={{
          position: 'absolute',
          top: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          maxWidth: '400px',
        }}>
          <ActivityButtons activityType={activityType} setActivityType={setActivityType} />
          <div style={{ marginLeft: '10px' }}>
            <DurationSelector onDurationSelect={handleDurationSelect} />
          </div>
        </div>

        {/* Bottom Modal */}
        <BottomModal 
          activityType={activityType} 
          markerPosition={markerPosition}
          onAnimationComplete={() => setShowPinLabel(true)}
        />

        {/* Zoom controls */}
        <div style={{ position: 'absolute', bottom: '20px', right: '20px', zIndex: 10 }}>
          <button onClick={() => setZoom(zoom + 1)}>+</button>
          <button onClick={() => setZoom(zoom - 1)}>-</button>
        </div>

        {/* Add the custom location reset button */}
        <button 
          onClick={handleLocationReset}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            zIndex: 1000,
            background: 'rgba(255, 255, 255, 0.8)', // Increased transparency
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            transition: 'background-color 0.3s ease' // Smooth transition for hover effect
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.9)'} // Slightly less transparent on hover
          onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.8)'} // Back to original transparency
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
            <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" fill="#1a73e8"/>
          </svg>
        </button>
      </LoadScript>
    </div>
  );
};

export default MapComponent;