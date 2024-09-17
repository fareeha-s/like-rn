import React, { useState, useRef, useEffect } from 'react';
import styles from './DurationSelector.module.css';

const DurationSelector = ({ onDurationSelect }) => {
  const [duration, setDuration] = useState(30);  // Changed default to 30
  const sliderRef = useRef(null);

  useEffect(() => {
    onDurationSelect(duration);
  }, [duration, onDurationSelect]);

  const handleInteraction = (event) => {
    if (sliderRef.current) {
      const rect = sliderRef.current.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const width = rect.width;
      const percentage = Math.max(0, Math.min(1, x / width));
      let newDuration;
      if (percentage <= 0.5) {
        newDuration = 15 + Math.round(percentage * 30 / 5) * 5;
      } else {
        newDuration = 30 + Math.round((percentage - 0.5) * 30 / 5) * 5;
      }
      setDuration(newDuration);
    }
  };

  const handleMouseDown = (event) => {
    handleInteraction(event);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (event) => {
    handleInteraction(event);
  };

  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const handleClick = (event) => {
    handleInteraction(event);
  };

  const thumbPosition = `${((duration - 15) / 30) * 100}%`;  // Keep this calculation as is

  return (
    <div className={styles.durationSelectorContainer}>
      <div 
        className={styles.sliderContainer} 
        ref={sliderRef}
        onMouseDown={handleMouseDown}
        onClick={handleClick}
      >
        <div className={styles.sliderTrack}></div>
        <div 
          className={styles.sliderThumb}
          style={{ left: thumbPosition }}
        >
          <span className={styles.thumbText}>{duration}</span>
        </div>
      </div>
      <span className={styles.minsLabel}>mins</span>
    </div>
  );
};

export default DurationSelector;
