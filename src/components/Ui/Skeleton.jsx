import React from 'react';

const Skeleton = ({ className, width, height, borderRadius = '4px' }) => {
  return (
    <div
      className={`animate-skeleton ${className}`}
      style={{
        width: width || '100%',
        height: height || '1rem',
        borderRadius: borderRadius,
      }}
    />
  );
};

export default Skeleton;
