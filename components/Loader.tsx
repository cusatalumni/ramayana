
import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center my-12">
      <div className="w-16 h-16 border-4 border-t-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-stone-600 text-lg font-cinzel">
        Generating wisdom and art...
      </p>
    </div>
  );
};

export default Loader;
