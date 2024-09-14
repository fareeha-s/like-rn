import React, { useState, useEffect, useRef } from 'react';
import styles from './BottomModal.module.css';
import ShareButton from './ShareButton';
import { getDatabase, ref, push, serverTimestamp } from "firebase/database";

const BottomModal = ({ activityType, markerPosition, onAnimationComplete }) => {
  const [selectedTime, setSelectedTime] = useState('now');
  const [selectedPrivacy, setSelectedPrivacy] = useState('friends');
  const [laterTime, setLaterTime] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const modalRef = useRef(null);
  const startY = useRef(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareData, setShareData] = useState({ mapLink: '', shareMessage: '' });

  useEffect(() => {
    const updateLaterTime = () => {
      const now = new Date();
      now.setMinutes(now.getMinutes() + 10);
      const hours = now.getHours() % 12 || 12; // Convert to 12-hour format
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const ampm = now.getHours() >= 12 ? 'PM' : 'AM';
      setLaterTime(`${hours}:${minutes} ${ampm}`);
    };

    const setUpdateInterval = () => {
      updateLaterTime(); // Update immediately

      // Calculate time until next minute
      const now = new Date();
      const delay = 60000 - (now.getSeconds() * 1000 + now.getMilliseconds());

      // Set a timeout to update at the next minute
      const timer = setTimeout(() => {
        updateLaterTime();
        // Set interval to update every minute after that
        setInterval(updateLaterTime, 60000);
      }, delay);

      return () => {
        clearTimeout(timer);
      };
    };

    const cleanup = setUpdateInterval();

    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
      // Call onAnimationComplete after the animation duration (1s in this case)
      setTimeout(onAnimationComplete, 1000);
    }, 100); // Short delay before showing the modal

    return () => clearTimeout(timer);
  }, [onAnimationComplete]);

  const handleTimeSelection = (time) => {
    setSelectedTime(time);
  };

  const handlePrivacySelection = (privacy) => {
    setSelectedPrivacy(privacy);
  };

  const handleStart = (clientY) => {
    startY.current = clientY;
    setIsDragging(true);
  };

  const handleMove = (clientY) => {
    if (!isDragging) return;
    const diff = clientY - startY.current;
    if (diff > 0) {  // Only allow dragging downwards
      setDragOffset(diff);
    }
  };

  const handleEnd = () => {
    setIsDragging(false);
    if (dragOffset > 50) {  // If dragged down more than 50px, dismiss the modal
      setIsVisible(false);
    } else {
      setDragOffset(0);  // Reset position if not dismissed
    }
  };

  const handleTouchStart = (e) => handleStart(e.touches[0].clientY);
  const handleTouchMove = (e) => handleMove(e.touches[0].clientY);
  const handleTouchEnd = () => handleEnd();

  const handleMouseDown = (e) => handleStart(e.clientY);
  const handleMouseMove = (e) => handleMove(e.clientY);
  const handleMouseUp = () => handleEnd();

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleShare = () => {
    if (!markerPosition) {
      alert('Please pin a location on the map first');
      return;
    }

    const mapLink = `https://www.google.com/maps/search/?api=1&query=${markerPosition.lat},${markerPosition.lng}`;
    let shareMessage;

    if (selectedTime === 'now') {
      shareMessage = `hey, about to head for a ${activityType}! come with: 📍${mapLink}`;
    } else {
      shareMessage = `hey, ${activityType} with me in 10 mins (${laterTime})? meet up here: 📍${mapLink}`;
    }

    // If "friends only" is selected, directly open the text messaging app
    if (selectedPrivacy === 'friends') {
      window.open(`sms:?body=${encodeURIComponent(shareMessage)}`, '_blank');
    } else {
      // For "open invite", show the share modal as before
      setShareData({ mapLink, shareMessage });
      setShowShareModal(true);
    }

    // Save to Firebase (if you still want to do this for both cases)
    saveToFirebase(mapLink, selectedTime === 'now' ? 'right now' : `in 10 mins (${laterTime})`);
  };

  const ShareModal = ({ shareMessage, onClose }) => {
    const handleOverlayClick = (e) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    };

    return (
      <div className={styles.modalOverlay} onClick={handleOverlayClick}>
        <div className={styles.shareModal}>
          <button 
            onClick={onClose}
            className={styles.closeButton}
          >
            ×
          </button>
          <div className={styles.shareMessagePreview}>
            <p>{shareMessage}</p>
          </div>
          <div className={styles.shareButtonContainer}>
            <button 
              onClick={() => window.open(`sms:?body=${encodeURIComponent(shareMessage)}`, '_blank')}
              className={styles.shareButton}
            >
              <img 
                src="/logo-imessage.png" 
                alt="iMessage"
                className={styles.shareIcon}
              />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const saveToFirebase = (mapLink, timeText) => {
    const db = getDatabase();
    const sharesRef = ref(db, 'shares');
    push(sharesRef, {
      activityType,
      location: { lat: markerPosition.lat, lng: markerPosition.lng },
      timestamp: serverTimestamp(),
      mapLink,
      shareTime: timeText,
      privacyOption: selectedPrivacy
    }).catch(error => {
      console.error('Error saving share to Firebase:', error);
    });
  };

  return (
    <>
      <div 
        ref={modalRef}
        className={`${styles.modalContainer} ${isVisible ? styles.visible : ''}`}
        style={{
          transform: `translateY(${dragOffset}px)`,
          transition: isDragging ? 'none' : 'transform 0.3s ease-out'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
      >
        <div className={styles.transparentBox}>
          <div className={styles.dragIndicator}></div>
          <p className={styles.modalText}>i'm starting my {activityType}...</p>
          <div className={styles.modalButtonContainer}>
            <button 
              className={`${styles.modalButton} ${selectedTime === 'now' ? styles.selected : ''}`}
              onClick={() => handleTimeSelection('now')}
            >
              like... <strong>right now</strong>
            </button>
            <button 
              className={`${styles.modalButton} ${selectedTime === 'later' ? styles.selected : ''}`}
              onClick={() => handleTimeSelection('later')}
            >
              in like 10 mins (<strong>{laterTime}</strong>)
            </button>
          </div>
          <div className={styles.privacyAndShareContainer}>
            <div className={styles.privacyButtonContainer}>
              <button 
                className={`${styles.privacyButton} ${selectedPrivacy === 'friends' ? styles.active : ''}`}
                onClick={() => handlePrivacySelection('friends')}
              >
                friends only
              </button>
              <button 
                className={`${styles.privacyButton} ${selectedPrivacy === 'open' ? styles.active : ''}`}
                onClick={() => handlePrivacySelection('open')}
              >
                open invite
              </button>
              <div className={styles.slider}></div>
            </div>
            <ShareButton 
              onClick={handleShare}
              privacyOption={selectedPrivacy}
            />
          </div>
        </div>
      </div>
      {showShareModal && selectedPrivacy === 'open' && (
        <ShareModal 
          shareMessage={shareData.shareMessage} 
          onClose={() => setShowShareModal(false)}
        />
      )}
    </>
  );
};

export default BottomModal;
