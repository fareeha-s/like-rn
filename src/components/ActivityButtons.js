import React from 'react';
import styles from './ActivityButtons.module.css';
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBUdZ6OQrGpicPb8RVe-qxVMXwiB1ueO9c",
  authDomain: "like-rightnow.firebaseapp.com",
  projectId: "like-rightnow",
  storageBucket: "like-rightnow.appspot.com",
  messagingSenderId: "859028584233",
  appId: "1:859028584233:web:b360f75593964b7c222938",
  measurementId: "G-E0WEP4Q164"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
import { ref, set } from "firebase/database";

const ActivityButtons = ({ activityType, setActivityType }) => {
  const handleActivityChange = (type) => {
    setActivityType(type);

    // Update Firebase
    const userId = 'user1'; // In a real app, this would be the logged-in user's ID
    set(ref(database, 'users/' + userId), {  // Changed this line
      name: 'User 1', // This would be the actual user's name
      currentActivity: type
    }).catch(error => {
      console.error("Error updating activity: ", error);
    });
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
