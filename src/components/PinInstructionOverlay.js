import React, { useState, useEffect } from 'react';
import styles from './PinInstructionOverlay.module.css';

const PinInstructionOverlay = ({ hasPinned }) => {
  const [opacity, setOpacity] = useState(0);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    if (shouldRender && !hasPinned) {
      setTimeout(() => setOpacity(1), 100);
      setTimeout(() => setOpacity(0), 4000);
      setTimeout(() => setShouldRender(false), 5000);
    }
  }, [shouldRender, hasPinned]);

  if (!shouldRender || hasPinned) return null;

  return (
    <div 
      className={styles.overlayContainer}
      style={{ opacity }}
    >
      <p className={styles.overlayText}>Pin your start point</p>
    </div>
  );
};

export default PinInstructionOverlay;
