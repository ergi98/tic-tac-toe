'use client';

import React from 'react';

import { m, AnimatePresence } from 'framer-motion';

// SVG
import { ReactComponent as DisconnectedSvg } from '../../../assets/disconnect.svg';

const InternetConnectionStatus: React.FC<{ isOnline: boolean }> = (props) => {
  return (
    <AnimatePresence>
      {props.isOnline ? null : (
        <m.div
          initial={{ scale: 0.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.2, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute left-6 top-5 animate-pulse rounded-lg bg-red-700 p-2 text-stone-300 landscape:left-48"
        >
          <div className="w-5">
            <DisconnectedSvg title="disconnected-image" />
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
};

export default InternetConnectionStatus;
