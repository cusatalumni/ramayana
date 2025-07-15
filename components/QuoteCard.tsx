
import React from 'react';

interface QuoteCardProps {
  sanskrit_sloka: string;
  malayalam_transliteration: string;
  malayalam_meaning: string;
  english_meaning: string;
  imageUrl: string;
}

const QuoteCard: React.FC<QuoteCardProps> = ({ sanskrit_sloka, malayalam_transliteration, malayalam_meaning, english_meaning, imageUrl }) => {
  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden p-6 border border-amber-200">
      <img
        src={imageUrl}
        alt="AI generated image related to the sloka"
        className="w-full h-auto object-cover rounded-lg aspect-square"
      />
      <blockquote className="mt-6 space-y-5">
        
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
