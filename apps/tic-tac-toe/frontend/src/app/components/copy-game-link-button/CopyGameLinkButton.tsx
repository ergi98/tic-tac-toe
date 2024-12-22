'use client';

import React, { useState } from 'react';

import { type CopyErrorType } from '../../utils/types';

// Components
import { BaseButton } from '../';

interface ICopyGameLinkButton {
  lobbyId: string | null;
  onError?: (state: boolean, type?: CopyErrorType) => void;
}

const CopyGameLinkButton: React.FC<ICopyGameLinkButton> = (props) => {
  const [isSharing, setIsSharing] = useState(false);

  const shareText = `Join my lobby and let's play together! Enter this lobby identifier to join: ${props.lobbyId}.`;

  const onError = (isError: boolean, type?: CopyErrorType, error?: unknown) => {
    if (error) {
      console.group('Game Link Error');
      console.log(error);
      console.groupEnd();
    }
    typeof props.onError === 'function' && props.onError(isError, type);
  };

  const handleCopyPress = async () => {
    onError(false);
    if (!props.lobbyId) {
      onError(true, 'generic');
      return;
    }
    navigator.clipboard
      .writeText(props.lobbyId)
      .catch((err) => onError(true, 'copy', err));
    if (!navigator.share) {
      return;
    }
    setIsSharing(true);
    navigator
      .share({
        url: window.location.origin,
        title: 'Play Tic-Tac-Toe',
        text: shareText,
      })
      .catch((error) => {
        switch (error.message) {
          case 'Share canceled':
            break;
          default:
            onError(true, 'share', error);
        }
      })
      .finally(() => setIsSharing(false));
  };

  return (
    <BaseButton
      isDisabled={isSharing}
      onPress={handleCopyPress}
      pressClasses="bg-stone-500"
      focusClasses="border-stone-500"
      buttonClasses="bg-stone-700 text-xs data-hovered:bg-stone-600 w-full uppercase tracking-wider p-2.5 rounded-lg transition-colors border-transparent border-2"
    >
      <div className="relative z-10 flex items-center justify-center gap-2">
        Copy Identifier
      </div>
    </BaseButton>
  );
};

export default CopyGameLinkButton;
