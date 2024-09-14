import React, { useState } from 'react';
import styles from './ShareButton.module.css';

const ShareButton = ({ onClick, privacyOption, activityType }) => {
  const [isHovering, setIsHovering] = useState(false);

  const getActivityEmoji = (type) => {
    if (!type) return '';
    switch (type.toLowerCase()) {
      case 'run':
        return '🏃';
      case 'walk':
        return '🚶';
      default:
        return '';
    }
  };

  const handleShare = () => {
    const emoji = getActivityEmoji(activityType);
    const shareMessage = `${emoji} i'm starting my ${activityType || 'activity'}...`;
    
    if (onClick) {
      onClick(shareMessage);
    }
  };

  return (
    <button 
      className={`${styles.shareButton} ${privacyOption === 'friends' ? styles.friendsOnly : styles.openInvite}`} 
      onClick={handleShare}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {privacyOption === 'friends' ? (
        <div className={styles.iMessageContainer}>
          {isHovering && (
            <>
              <span className={`${styles.sparkle} ${styles.topLeft}`}>✨</span>
              <span className={`${styles.sparkle} ${styles.bottomRight}`}>✨</span>
            </>
          )}
          <img 
            src="/logo-imessage.png" 
            alt="iMessage" 
            className={styles.iMessageIcon}
          />
        </div>
      ) : (
        <div className={styles.openInviteContainer}>
          {isHovering && (
            <>
              <span className={`${styles.sparkle} ${styles.topLeft}`}>✨</span>
              <span className={`${styles.sparkle} ${styles.bottomRight}`}>✨</span>
            </>
          )}
          <span className={styles.buttonText}>
            share
          </span>
          <svg className={styles.shareArrow} width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      )}
    </button>
  );
};

export default ShareButton;
