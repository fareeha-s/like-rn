import React, { useState, useRef, useEffect } from 'react';
import styles from './DurationSelector.module.css';

const DurationSelector = ({ onDurationSelect }) => {
  const [duration, setDuration] = useState(15);
  const sliderRef = useRef(null);

  useEffect(() => {
    onDurationSelect(duration);
  }, [duration, onDurationSelect]);

  const handleMouseDown = (event) => {
    event.preventDefault();
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (event) => {
    if (sliderRef.current) {
      const rect = sliderRef.current.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const width = rect.width;
      const percentage = Math.max(0, Math.min(1, x / width));
      let newDuration;
      if (percentage <= 0.5) {
        newDuration = 15 + Math.round(percentage * 30 / 5) * 5;
      } else {
        newDuration = 30 + Math.round((percentage - 0.5) * 30 / 5) * 5; // Changed to increment by 5 up to 45
      }
      setDuration(newDuration);
    }
  };

  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const thumbPosition = `${((duration - 15) / 30) * 100}%`; // Adjusted calculation for 15-45 range

  return (
    <div className={styles.durationSelectorContainer}>
      <div 
        className={styles.sliderContainer} 
        ref={sliderRef}
        onMouseDown={handleMouseDown}
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
