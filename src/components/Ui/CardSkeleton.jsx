import React from 'react';
import Skeleton from './Skeleton';

const CardSkeleton = () => {
  return (
    <div className="rounded-[2.5rem] shadow-xl border border-gray-100 p-8 bg-white/60 backdrop-blur-sm animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <Skeleton width="3.5rem" height="3.5rem" borderRadius="1rem" />
        <Skeleton width="4rem" height="3.5rem" />
      </div>
      <div>
        <Skeleton width="8rem" height="1.5rem" className="mb-2" />
        <Skeleton width="4rem" height="0.5rem" borderRadius="1rem" />
      </div>
    </div>
  );
};

export default CardSkeleton;
