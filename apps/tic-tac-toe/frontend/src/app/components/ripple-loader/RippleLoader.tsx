import React from 'react';
import { twMerge } from 'tailwind-merge';

const RippleLoader = () => {
  return (
    <div
      role="img"
      className="text-stone-30 relative inline-block h-full w-full"
    >
      <Ring ringClass="animate-ripple animate-delay-100" />
      <Ring ringClass="animate-ripple" />
    </div>
  );
};

const Ring: React.FC<{ ringClass?: string }> = (props) => {
  return (
    <div
      className={twMerge(
        'absolute rounded-full border-2 border-current opacity-100',
        props.ringClass,
      )}
    />
  );
};

export default RippleLoader;
