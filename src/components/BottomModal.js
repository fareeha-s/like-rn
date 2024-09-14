import React, { useState, useEffect, useRef } from 'react';
import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  FacebookIcon,
  TwitterIcon,
  WhatsappIcon
} from 'react-share';
import { FaSms } from 'react-icons/fa';
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

  // Add this function within your component, before handleShare
  const generateShareMessage = (platform) => {
    if (!markerPosition) {
      return null;
    }

    const timeText = selectedTime === 'now' ? 'right now' : `in 10 mins (${laterTime})`;
    
    switch (platform) {
      case 'twitter':
        return `hey, join me on my ${activityType} ${timeText}?`;
      case 'facebook':
        return `hey, join me on my ${activityType} ${timeText}?`;
      case 'whatsapp':
        return `hey, join me on my ${activityType} ${timeText}?`;
      default:
        return `join me for a ${activityType} ${timeText}?`;
    }
  };

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
      shareMessage = `hey, join my ${activityType} right now! meet up here: 📍${mapLink}`;
    } else {
      shareMessage = `hey, join my ${activityType} in 10 mins (${laterTime})? meet up here: 📍${mapLink}`;
    }

    setShareData({ mapLink, shareMessage });

    if (selectedPrivacy === 'open') {
      // For open invite, share directly to Twitter
      const encodedMessage = encodeURIComponent(shareMessage);
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedMessage}`;
      window.open(twitterUrl, '_blank');
    } else {
      // For friends only, show the share modal
      setShowShareModal(true);
    }

    // Save to Firebase
    saveToFirebase(mapLink, selectedTime === 'now' ? 'right now' : `in 10 mins (${laterTime})`);
  };

  const handleInstagramShare = () => {
    if (!markerPosition) {
      alert('Please pin a location on the map first');
      return;
    }

    const mapLink = `https://www.google.com/maps/search/?api=1&query=${markerPosition.lat},${markerPosition.lng}`;
    let shareMessage;

    if (selectedTime === 'now') {
      shareMessage = `hey, join my ${activityType} right now! meet up here: 📍${mapLink}`;
    } else {
      shareMessage = `hey, join my ${activityType} in 10 mins (${laterTime})? meet up here: 📍${mapLink}`;
    }

    // For mobile devices, try to open the Instagram app
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      const instagramUrl = `instagram://direct-share`;
      window.location.href = instagramUrl;
      
      // If the app doesn't open within 2 seconds, go to the website
      setTimeout(() => {
        window.open('https://www.instagram.com/direct/inbox/', '_blank');
      }, 2000);
    } else {
      // For desktop browsers, open Instagram in a new window
      window.open('https://www.instagram.com/direct/inbox/', '_blank');
    }

    // Copy the share message to clipboard
    navigator.clipboard.writeText(shareMessage).then(() => {
      alert('Share message copied to clipboard. Paste it into Instagram DM.');
    }).catch(err => {
      console.error('Failed to copy message: ', err);
    });
  };

  const ShareModal = ({ mapLink, shareMessage }) => (
    <div className={styles.modalOverlay}>
      <div className={styles.shareModal}>
        <button 
          onClick={() => setShowShareModal(false)}
          className={styles.closeButton}
        >
          ×
        </button>
        <div className={styles.shareMessagePreview}>
          <p>{shareMessage}</p>
        </div>
        <div className={styles.shareButtons}>
          <div 
            onClick={() => window.open(`sms:?body=${encodeURIComponent(shareMessage)}`, '_blank')}
            className={`${styles.shareButton} ${styles.smsButton}`}
          >
            <span role="img" aria-label="SMS" style={{ fontSize: '30px' }}>🤙</span>
          </div>
          <WhatsappShareButton url={mapLink} title={shareMessage}>
            <div className={`${styles.shareButton} ${styles.whatsappButton}`}>
              <WhatsappIcon size={50} round={false} />
            </div>
          </WhatsappShareButton>
          <FacebookShareButton url={mapLink} quote={shareMessage}>
            <div className={`${styles.shareButton} ${styles.facebookButton}`}>
              <FacebookIcon size={50} round={false} />
            </div>
          </FacebookShareButton>
          <div 
            onClick={() => {
              const text = encodeURIComponent(shareMessage);
              const url = encodeURIComponent(mapLink);
              window.open(`https://t.me/share/url?text=${text}&url=${url}`, '_blank');
            }}
            className={`${styles.shareButton} ${styles.telegramButton}`}
          >
            <svg viewBox="0 0 24 24" width="40" height="40">
              <path fill="#ffffff" d="M1.95617 10.8604L21.3839 2.86932C22.5841 2.40693 23.5934 3.41621 23.1311 4.61638L15.1399 24.0441C14.6776 25.2443 13.1696 25.2855 12.6548 24.1166L9.22629 17.2593C8.97474 16.7558 9.03326 16.1559 9.37087 15.7116L14.9332 8.06691C15.1421 7.78764 14.7789 7.42445 14.4996 7.63332L6.85493 13.1957C6.41062 13.5333 5.81075 13.5918 5.30724 13.3403L1.88393 11.3452C0.714982 10.8304 0.756164 9.32242 1.95617 10.8604Z"/>
            </svg>
          </div>
          <div 
            onClick={handleInstagramShare}
            className={`${styles.shareButton} ${styles.instagramButton}`}
          >
            <svg viewBox="0 0 24 24" width="40" height="40">
              <path fill="#ffffff" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );

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
      {showShareModal && <ShareModal mapLink={shareData.mapLink} shareMessage={shareData.shareMessage} />}
    </>
  );
};

export default BottomModal;
