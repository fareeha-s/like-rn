import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { useParams } from 'react-router-dom';
import { ref, onValue } from 'firebase/database';
import database from './firebase_creds.js';

const SharedMapComponent = () => {
  const { shareId } = useParams();
  const [markerPosition, setMarkerPosition] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const shareRef = ref(database, `shares/${shareId}`);
    const unsubscribe = onValue(shareRef, (snapshot) => {
      setIsLoading(false);
      const data = snapshot.val();
      if (data && data.position) {
        setMarkerPosition(data.position);
      } else {
        setError('No valid share data found');
      }
    }, (error) => {
      setIsLoading(false);
      setError('Error fetching share data');
      console.error(error);
    });

    // Cleanup function
    return () => unsubscribe();
  }, [shareId]);

  if (isLoading) return <div>loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
          center={markerPosition || { lat: 37.7749, lng: -122.4194 }}
          zoom={10}
        >
          {markerPosition && <Marker position={markerPosition} />}
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

export default SharedMapComponent;
