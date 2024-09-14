import React, { useRef, useState } from 'react';
import { StandaloneSearchBox } from '@react-google-maps/api';
import styles from './SearchBar.module.css';

export const SearchBar = ({ setCenter, setZoom }) => {
  const searchBoxRef = useRef();
  const [placeholder, setPlaceholder] = useState('search location');

  const onPlacesChanged = () => {
    const places = searchBoxRef.current.getPlaces();
    if (places && places.length > 0) {
      const place = places[0];
      if (place.geometry) {
        setCenter({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        });
        setZoom(18);
      }
    }
  };

  const handleFocus = () => {
    setPlaceholder('');
  };

  const handleBlur = () => {
    if (!searchBoxRef.current.getPlaces()) {
      setPlaceholder('search location...');
    }
  };

  return (
    <div className={styles.searchBarContainer}>
      <svg className={styles.searchIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
      </svg>
      <StandaloneSearchBox
        onLoad={ref => searchBoxRef.current = ref}
        onPlacesChanged={onPlacesChanged}
      >
        <input
          type="text"
          placeholder={placeholder}
          className={styles.searchInput}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </StandaloneSearchBox>
    </div>
  );
};
