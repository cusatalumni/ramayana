import React from 'react';
import { DisplayablePost } from '../types';

const ImageLoader: React.FC = () => (
  <div className="w-full h-full bg-amber-100 animate-pulse flex items-center justify-center">
    <svg className="w-12 h-12 text-amber-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3.75 6A2.25 2.25 0 016 3.75h12A2.25 2.25 0 0120.25 6v12A2.25 2.25 0 0118 20.25H6A2.25 2.25 0 013.75 18V6zM3 16.5v-3.848a1.5 1.5 0 01.4-.986l2.12-2.828a1.5 1.5 0 012.332-.074l4.133 4.34a1.5 1.5 0 002.122-.106l.707-.707a1.5 1.5 0 012.122 0l2.121 2.121a1.5 1.5 0 01.44 1.061V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18zM15.75 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"></path>
    </svg>
  </div>
);


const QuoteCard: React.FC<DisplayablePost> = ({ sanskrit_sloka, malayalam_transliteration, malayalam_meaning, english_meaning, imageUrl, imageRequested }) => {
  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden p-6 border border-amber-200">
      {imageRequested && (
        <div className="w-full object-cover rounded-lg aspect-square overflow-hidden mb-6">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="AI generated image related to the sloka"
              className="w-full h-full object-cover animate-fade-in"
            />
          ) : (
            <ImageLoader />
          )}
        </div>
      )}

      <blockquote className="space-y-5">
        <div className="text-center">
          <h3 className="font-cinzel text-amber-800 text-lg font-bold tracking-wide mb-2">Sloka (Sanskrit)</h3>
          <p className="text-xl md:text-2xl text-stone-800 leading-relaxed whitespace-pre-wrap" lang="sa">
            {sanskrit_sloka}
          </p>
        </div>

        <hr className="border-t border-amber-200 w-1/2 mx-auto" />

        <div className="text-center">
          <h3 className="font-cinzel text-amber-800 text-lg font-bold tracking-wide mb-2">Transliteration (Malayalam)</h3>
          <p className="text-lg text-stone-700 leading-relaxed whitespace-pre-wrap" lang="ml">
            {malayalam_transliteration}
          </p>
        </div>

        <hr className="border-t border-amber-200 w-1/2 mx-auto" />

        <div className="text-center">
          <h3 className="font-cinzel text-amber-800 text-lg font-bold tracking-wide mb-2">Malayalam Meaning</h3>
          <p className="text-lg text-stone-700 leading-relaxed" lang="ml">
            {malayalam_meaning}
          </p>
        </div>
        
        <hr className="border-t border-amber-200 w-1/2 mx-auto" />

        <div className="text-center">
          <h3 className="font-cinzel text-amber-800 text-lg font-bold tracking-wide mb-2">English Meaning</h3>
          <p className="text-lg text-stone-700 italic leading-relaxed">
            “{english_meaning}”
          </p>
        </div>

        <footer className="pt-4 font-cinzel text-lg text-amber-700 font-semibold text-center">
          — The Ramayana
        </footer>
      </blockquote>
    </div>
  );
};

export default QuoteCard;