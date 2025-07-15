
import React from 'react';

interface LoaderProps {
  isButtonLoader?: boolean;
}

const Loader: React.FC<LoaderProps> = ({ isButtonLoader = false }) => {
  if (isButtonLoader) {
    return (
      <div className="w-5 h-5 border-2 border-t-2 border-white border-t-transparent rounded-full animate-spin"></div>
    );
  }
  
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
