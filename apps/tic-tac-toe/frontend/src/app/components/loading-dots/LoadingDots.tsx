import React from 'react';

const LoadingDots: React.FC = () => {
  return (
    <div role="img" className="flex items-center">
      <span className="block animate-bounce">.</span>
      <span className="animate-delay-75 block animate-bounce">.</span>
      <span className="animate-delay-100 block animate-bounce">.</span>
    </div>
  );
};

export default LoadingDots;
