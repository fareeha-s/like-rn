import React from 'react';
import styles from './ActivityButtons.module.css';
import { getFirebaseDatabase } from '../firebase'; // Changed this line
import { ref, set } from "firebase/database";

const ActivityButtons = ({ activityType, setActivityType }) => {
  const handleActivityChange = (newActivityType) => {
    setActivityType(newActivityType);
    const database = getFirebaseDatabase();
    if (database) {
      const activityRef = ref(database, 'activity');
      set(activityRef, newActivityType).catch(error => {
        console.error("Error updating activity type:", error);
      });
    } else {
      console.error("Firebase database is not initialized");
    }
  };

  return (
    <div className={`${styles.buttonContainer} ${styles[activityType]}`}>
      <div className={styles.slider}></div>
      <button 
        className={`${styles.activityButton} ${activityType === 'run' ? styles.active : ''}`}
        onClick={() => handleActivityChange('run')}
      >
        <span className={styles.buttonText}>run</span>
      </button>
      <button 
        className={`${styles.activityButton} ${activityType === 'walk' ? styles.active : ''}`}
        onClick={() => handleActivityChange('walk')}
      >
        <span className={styles.buttonText}>walk</span>
      </button>
    </div>
  );
};

export default ActivityButtons;
