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
            src={`${process.env.PUBLIC_URL}/logo-imessage.png`}
            alt="iMessage"
            className={styles.shareIcon}
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
          
        </div>
      )}
    </button>
  );
};

export default ShareButton;
